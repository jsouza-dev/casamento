
'use client';

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Search, MoreHorizontal, Loader2, Users as UsersIcon, FileText, Trash2, Eye, Upload, FileUp, CheckCircle, XCircle, Clock, Pencil, Save, Plus, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function RSVPsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRsvp, setSelectedRsvp] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importTarget, setImportTarget] = useState<'rsvps' | 'invitees'>('rsvps');

  // Edit Invitee State
  const [editingInvitee, setEditingInvitee] = useState<any>(null);
  const [isInviteeDialogOpen, setIsInviteeDialogOpen] = useState(false);

  // Edit RSVP State
  const [editingRsvp, setEditingRsvp] = useState<any>(null);
  const [isRsvpEditDialogOpen, setIsRsvpEditDialogOpen] = useState(false);

  // Queries
  const rsvpsQuery = useMemoFirebase(() => query(collection(db, 'rsvps'), orderBy('createdAt', 'desc')), [db]);
  const inviteesQuery = useMemoFirebase(() => query(collection(db, 'invitees'), orderBy('fullName', 'asc')), [db]);

  const { data: rsvps, isLoading: isLoadingRsvps } = useCollection(rsvpsQuery);
  const { data: invitees, isLoading: isLoadingInvitees } = useCollection(inviteesQuery);

  const filteredRsvps = rsvps?.filter(rsvp => 
    rsvp.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvitees = invitees?.filter(invitee => 
    invitee.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string, path: 'rsvps' | 'invitees') => {
    if (confirm("Tem certeza que deseja excluir este registro?")) {
      deleteDocumentNonBlocking(doc(db, path, id));
      toast({ title: "Registro removido" });
    }
  };

  const handleEditInvitee = (invitee: any) => {
    setEditingInvitee({ ...invitee });
    setIsInviteeDialogOpen(true);
  };

  const handleEditRsvp = (rsvp: any) => {
    setEditingRsvp({ 
      ...rsvp,
      guestNames: rsvp.guestNames || [] 
    });
    setIsRsvpEditDialogOpen(true);
  };

  const saveInviteeChanges = () => {
    if (!editingInvitee) return;
    
    const docRef = doc(db, 'invitees', editingInvitee.id);
    updateDocumentNonBlocking(docRef, {
      fullName: editingInvitee.fullName,
      phoneNumber: editingInvitee.phoneNumber || "",
      category: editingInvitee.category || "Geral",
      guestLimit: Number(editingInvitee.guestLimit) || 1,
      updatedAt: new Date().toISOString()
    });

    toast({
      title: "Convidado atualizado",
      description: `${editingInvitee.fullName} agora tem limite de ${editingInvitee.guestLimit} pessoas.`,
    });
    setIsInviteeDialogOpen(false);
  };

  const saveRsvpChanges = () => {
    if (!editingRsvp) return;

    const docRef = doc(db, 'rsvps', editingRsvp.id);
    updateDocumentNonBlocking(docRef, {
      fullName: editingRsvp.fullName,
      isAttending: editingRsvp.isAttending,
      numberOfGuests: Number(editingRsvp.numberOfGuests) || 0,
      guestNames: editingRsvp.guestNames || [],
      phoneNumber: editingRsvp.phoneNumber || "",
      message: editingRsvp.message || "",
      updatedAt: new Date().toISOString()
    });

    toast({
      title: "Confirmação atualizada",
      description: `Dados de ${editingRsvp.fullName} foram salvos.`,
    });
    setIsRsvpEditDialogOpen(false);
  };

  const processDataRows = async (rows: any[]) => {
    const colRef = collection(db, importTarget);
    let count = 0;

    for (const row of rows) {
      const data: any = {
        guestLimit: 1,
        category: 'Geral'
      };
      
      Object.keys(row).forEach(key => {
        const lowerKey = key.toLowerCase().trim();
        const value = String(row[key]).trim();

        if (
          lowerKey === 'nome' || 
          lowerKey === 'name' || 
          lowerKey === 'fullname' || 
          lowerKey === 'nome completo' || 
          lowerKey === 'convidado' ||
          lowerKey === 'nome do convidado' ||
          lowerKey.includes('nome')
        ) {
          data.fullName = value;
        } else if (
          lowerKey === 'telefone' || 
          lowerKey === 'phone' || 
          lowerKey === 'whatsapp' || 
          lowerKey === 'celular' || 
          lowerKey === 'contato' ||
          lowerKey === 'tel' ||
          lowerKey.includes('tel')
        ) {
          data.phoneNumber = value;
        } else if (
          lowerKey === 'categoria' || 
          lowerKey === 'category' || 
          lowerKey === 'grupo' ||
          lowerKey === 'tipo' ||
          lowerKey.includes('cat')
        ) {
          data.category = value;
        } else if (
          lowerKey === 'total de pessoas' || 
          lowerKey === 'total' || 
          lowerKey === 'limite' ||
          lowerKey === 'pessoas' ||
          lowerKey === 'qtd' ||
          lowerKey.includes('total') ||
          lowerKey.includes('limite')
        ) {
          const parsed = parseInt(value);
          if (!isNaN(parsed)) {
            data.guestLimit = parsed;
          }
        }
      });

      if (!data.fullName && Object.values(row).length > 0) {
        const firstVal = Object.values(row).find(v => typeof v === 'string' && v.length > 2);
        if (firstVal) {
          data.fullName = String(firstVal).trim();
        }
      }

      if (data.fullName && data.fullName !== 'undefined' && data.fullName.length > 1) {
        data.createdAt = new Date().toISOString();
        if (importTarget === 'rsvps') {
          data.isAttending = true;
          data.numberOfGuests = Math.max(0, data.guestLimit - 1);
        }
        addDocumentNonBlocking(colRef, data);
        count++;
      }
    }
    return count;
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    const extension = file.name.split('.').pop()?.toLowerCase();

    reader.onload = async (event) => {
      try {
        let rows: any[] = [];

        if (extension === 'xlsx' || extension === 'xls') {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          rows = XLSX.utils.sheet_to_json(worksheet);
        } else if (extension === 'csv') {
          const text = event.target?.result as string;
          const lines = text.split(/\r?\n/).filter(l => l.trim());
          if (lines.length < 2) throw new Error("Arquivo vazio.");

          const firstLine = lines[0];
          let delimiter = ',';
          if (firstLine.includes(';')) delimiter = ';';
          else if (firstLine.includes('\t')) delimiter = '\t';

          let headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''));
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(delimiter).map(v => v.trim().replace(/"/g, ''));
            const row: any = {};
            headers.forEach((header, index) => {
              if (header && values[index] !== undefined) row[header] = values[index];
            });
            if (Object.keys(row).length > 0) rows.push(row);
          }
        }

        const count = await processDataRows(rows);

        if (count > 0) {
          toast({
            title: "Importação concluída",
            description: `${count} registros foram importados.`,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Nenhum dado importado",
            description: "Verifique os nomes das colunas no arquivo.",
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro na importação",
          description: "Não foi possível ler o arquivo.",
        });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    if (extension === 'xlsx' || extension === 'xls') {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  const exportPdf = (data: any[], title: string) => {
    if (!data) return;
    const doc = new jsPDF();
    const isRsvpList = title.includes("Confirmações");
    const tableColumn = isRsvpList 
      ? ["Nome", "Presença", "Acomp.", "Telefone", "Data"]
      : ["Nome", "Status", "Lím. Total", "Categoria"];

    const tableRows = data.map(item => {
      if (isRsvpList) {
        return [
          item.fullName,
          item.isAttending ? "Sim" : "Não",
          item.numberOfGuests,
          item.phoneNumber || "---",
          format(new Date(item.createdAt), 'dd/MM/yyyy')
        ];
      }
      
      const rsvpMatch = rsvps?.find(r => r.fullName?.toLowerCase().trim() === item.fullName?.toLowerCase().trim());
      const status = rsvpMatch 
        ? (rsvpMatch.isAttending ? "Confirmado" : "Recusado")
        : "Pendente";

      return [
        item.fullName,
        status,
        item.guestLimit || "1",
        item.category || "Geral"
      ];
    });

    doc.setFontSize(18);
    doc.setTextColor(200, 169, 106);
    doc.text(title, 14, 15);
    doc.save(`${title.toLowerCase().replace(/\s/g, '_')}.pdf`);
  };

  const getRsvpStatus = (fullName: string) => {
    if (!rsvps || !fullName) return null;
    return rsvps.find(r => r.fullName?.toLowerCase().trim() === fullName.toLowerCase().trim());
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline text-gold">Gestão de Convidados</h1>
          <p className="text-sm md:text-base text-muted-foreground font-light">Gerencie sua lista de convidados e acompanhe confirmações.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input 
            type="file" 
            accept=".csv, .xlsx, .xls" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImportFile}
          />
          <Button 
            onClick={() => { setImportTarget('invitees'); fileInputRef.current?.click(); }} 
            variant="outline" 
            size="sm" 
            className="border-primary/20 text-gold flex-1 md:flex-none"
            disabled={isImporting}
          >
            {isImporting && importTarget === 'invitees' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
            Importar Lista Geral
          </Button>
          <Button 
            onClick={() => { setImportTarget('rsvps'); fileInputRef.current?.click(); }} 
            variant="outline" 
            size="sm" 
            className="border-primary/20 text-gold flex-1 md:flex-none"
            disabled={isImporting}
          >
            {isImporting && importTarget === 'rsvps' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Importar Confirmações
          </Button>
        </div>
      </div>

      <Tabs defaultValue="rsvps" className="space-y-6">
        <TabsList className="bg-primary/5 border border-primary/10">
          <TabsTrigger value="rsvps" className="gap-2">
            <CheckCircleIcon className="h-4 w-4" /> Confirmações ({rsvps?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="invitees" className="gap-2">
            <UsersIcon className="h-4 w-4" /> Lista Geral ({invitees?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rsvps" className="space-y-4">
          <div className="bg-white rounded-xl border border-primary/10 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-primary/5 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-10 border-primary/10" 
                  placeholder="Buscar confirmação..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={() => exportPdf(filteredRsvps || [], "Lista de Confirmações")} variant="ghost" size="sm" className="text-gold">
                <FileText className="mr-2 h-4 w-4" /> Exportar PDF
              </Button>
            </div>
            
            {isLoadingRsvps ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gold mb-2" />
                <p className="text-sm text-muted-foreground">Carregando...</p>
              </div>
            ) : !filteredRsvps || filteredRsvps.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">Sem confirmações ainda.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-primary/5">
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Presença</TableHead>
                      <TableHead>Acompanhantes</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRsvps.map((rsvp) => (
                      <TableRow key={rsvp.id}>
                        <TableCell className="font-medium">{rsvp.fullName}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-[10px] ${rsvp.isAttending ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {rsvp.isAttending ? 'Confirmado' : 'Não poderá ir'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold">{rsvp.numberOfGuests || 0}</span>
                            {rsvp.guestNames && rsvp.guestNames.length > 0 && (
                              <span className="text-[10px] text-muted-foreground italic truncate max-w-[200px]">
                                {rsvp.guestNames.join(', ')}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{rsvp.phoneNumber}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedRsvp(rsvp)}><Eye className="mr-2 h-4 w-4" /> Ver</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditRsvp(rsvp)}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(rsvp.id, 'rsvps')} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="invitees" className="space-y-4">
          <div className="bg-white rounded-xl border border-primary/10 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-primary/5 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-10 border-primary/10" 
                  placeholder="Buscar na lista geral..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={() => exportPdf(filteredInvitees || [], "Lista Geral de Convidados")} variant="ghost" size="sm" className="text-gold">
                <FileText className="mr-2 h-4 w-4" /> Exportar PDF
              </Button>
            </div>
            
            {isLoadingInvitees ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gold mb-2" />
                <p className="text-sm text-muted-foreground">Carregando...</p>
              </div>
            ) : !filteredInvitees || filteredInvitees.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">A lista geral está vazia.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-primary/5">
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Status RSVP</TableHead>
                      <TableHead>Lím. Total</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvitees.map((item) => {
                      const rsvp = getRsvpStatus(item.fullName);
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.fullName}</TableCell>
                          <TableCell>
                            {rsvp ? (
                              <span className={rsvp.isAttending ? "text-green-600 flex items-center gap-1 text-xs" : "text-red-600 flex items-center gap-1 text-xs"}>
                                {rsvp.isAttending ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                {rsvp.isAttending ? 'Confirmado' : 'Recusado'}
                              </span>
                            ) : (
                              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                                <Clock className="h-3 w-3" /> Pendente
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{item.guestLimit || '1'}</TableCell>
                          <TableCell><span className="text-xs text-muted-foreground bg-neutral-100 px-2 py-1 rounded">{item.category || 'Geral'}</span></TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditInvitee(item)}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(item.id, 'invitees')} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* RSVP Detail Dialog */}
      <Dialog open={!!selectedRsvp} onOpenChange={() => setSelectedRsvp(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-gold">Detalhes da Confirmação</DialogTitle></DialogHeader>
          {selectedRsvp && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-muted-foreground">Convidado:</span><span className="font-medium">{selectedRsvp.fullName}</span>
                <span className="text-muted-foreground">Presença:</span><span className={selectedRsvp.isAttending ? 'text-green-600' : 'text-red-600'}>{selectedRsvp.isAttending ? 'Confirmada' : 'Recusada'}</span>
                <span className="text-muted-foreground">Acompanhantes:</span><span>{selectedRsvp.numberOfGuests}</span>
                <span className="text-muted-foreground">Telefone:</span><span>{selectedRsvp.phoneNumber}</span>
              </div>
              
              {selectedRsvp.guestNames && selectedRsvp.guestNames.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Nomes dos acompanhantes:</p>
                  <ul className="list-disc list-inside text-sm font-light">
                    {selectedRsvp.guestNames.map((name: string, i: number) => (
                      <li key={i}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-3 bg-neutral-50 rounded border italic text-sm text-muted-foreground">
                {selectedRsvp.message || "Sem recado."}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* RSVP Edit Dialog */}
      <Dialog open={isRsvpEditDialogOpen} onOpenChange={setIsRsvpEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-gold">Editar Confirmação</DialogTitle></DialogHeader>
          {editingRsvp && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Convidado Principal</Label>
                <Input 
                  value={editingRsvp.fullName || ''} 
                  onChange={(e) => setEditingRsvp({...editingRsvp, fullName: e.target.value})}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10">
                <Label>Vai Comparecer?</Label>
                <Switch 
                  checked={editingRsvp.isAttending}
                  onCheckedChange={(val) => setEditingRsvp({...editingRsvp, isAttending: val})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input 
                    value={editingRsvp.phoneNumber || ''} 
                    onChange={(e) => setEditingRsvp({...editingRsvp, phoneNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nº Acompanhantes</Label>
                  <Input 
                    type="number"
                    min="0"
                    value={editingRsvp.numberOfGuests ?? 0} 
                    onChange={(e) => {
                      const count = parseInt(e.target.value) || 0;
                      const currentNames = [...(editingRsvp.guestNames || [])];
                      // Adjust array size
                      const newNames = count > currentNames.length 
                        ? [...currentNames, ...Array(count - currentNames.length).fill('')]
                        : currentNames.slice(0, count);

                      setEditingRsvp({...editingRsvp, numberOfGuests: count, guestNames: newNames});
                    }}
                  />
                </div>
              </div>

              {editingRsvp.guestNames && editingRsvp.guestNames.length > 0 && (
                <div className="space-y-3 pt-2">
                  <Label className="text-gold font-semibold flex items-center gap-2">
                    <UsersIcon className="h-4 w-4" /> Nomes dos Acompanhantes
                  </Label>
                  <div className="space-y-2">
                    {editingRsvp.guestNames.map((name: string, index: number) => (
                      <div key={index} className="flex gap-2">
                         <Input 
                          placeholder={`Acompanhante ${index + 1}`}
                          value={name}
                          onChange={(e) => {
                            const updatedNames = [...editingRsvp.guestNames];
                            updatedNames[index] = e.target.value;
                            setEditingRsvp({...editingRsvp, guestNames: updatedNames});
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Mensagem/Recado</Label>
                <Textarea 
                  value={editingRsvp.message || ''} 
                  onChange={(e) => setEditingRsvp({...editingRsvp, message: e.target.value})}
                  className="min-h-[100px]"
                />
              </div>

              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setIsRsvpEditDialogOpen(false)}>Cancelar</Button>
                <Button onClick={saveRsvpChanges} className="bg-gold hover:bg-gold/90 text-white">
                  <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Invitee Dialog */}
      <Dialog open={isInviteeDialogOpen} onOpenChange={setIsInviteeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-gold">Editar Convidado</DialogTitle></DialogHeader>
          {editingInvitee && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input 
                  value={editingInvitee.fullName || ''} 
                  onChange={(e) => setEditingInvitee({...editingInvitee, fullName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input 
                    value={editingInvitee.phoneNumber || ''} 
                    onChange={(e) => setEditingInvitee({...editingInvitee, phoneNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total de Pessoas (Limite)</Label>
                  <Input 
                    type="number"
                    min="1"
                    value={editingInvitee.guestLimit ?? 1} 
                    onChange={(e) => setEditingInvitee({...editingInvitee, guestLimit: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input 
                  value={editingInvitee.category || ''} 
                  onChange={(e) => setEditingInvitee({...editingInvitee, category: e.target.value})}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setIsInviteeDialogOpen(false)}>Cancelar</Button>
                <Button onClick={saveInviteeChanges} className="bg-gold hover:bg-gold/90 text-white">
                  <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CheckCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
