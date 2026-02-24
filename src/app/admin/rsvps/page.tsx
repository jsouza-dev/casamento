
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
import { 
  Search, 
  MoreHorizontal, 
  Loader2, 
  Users as UsersIcon, 
  FileText, 
  Trash2, 
  Eye, 
  Upload, 
  FileUp, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Pencil, 
  Plus, 
  X,
  User,
  Baby
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase, 
  deleteDocumentNonBlocking, 
  addDocumentNonBlocking, 
  updateDocumentNonBlocking 
} from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useState, useRef, useMemo } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function RSVPsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRsvp, setSelectedRsvp] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importTarget, setImportTarget] = useState<'rsvps' | 'invitees'>('rsvps');

  // Delete State
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, path: 'rsvps' | 'invitees' } | null>(null);

  // Edit/New Invitee State
  const [editingInvitee, setEditingInvitee] = useState<any>(null);
  const [isInviteeDialogOpen, setIsInviteeDialogOpen] = useState(false);

  // Edit/New RSVP State
  const [editingRsvp, setEditingRsvp] = useState<any>(null);
  const [isRsvpEditDialogOpen, setIsRsvpEditDialogOpen] = useState(false);

  // Queries
  const rsvpsQuery = useMemoFirebase(() => query(collection(db, 'rsvps'), orderBy('createdAt', 'desc')), [db]);
  const inviteesQuery = useMemoFirebase(() => query(collection(db, 'invitees'), orderBy('fullName', 'asc')), [db]);

  const { data: rsvps, isLoading: isLoadingRsvps } = useCollection(rsvpsQuery);
  const { data: invitees, isLoading: isLoadingInvitees } = useCollection(inviteesQuery);

  const rsvpMap = useMemo(() => {
    const map = new Map();
    rsvps?.forEach(r => {
      if (r.fullName) {
        map.set(r.fullName.toLowerCase().trim(), r);
      }
    });
    return map;
  }, [rsvps]);

  const filteredRsvps = useMemo(() => 
    rsvps?.filter(rsvp => 
      rsvp.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [rsvps, searchTerm]);

  const filteredInvitees = useMemo(() => 
    invitees?.filter(invitee => 
      invitee.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [invitees, searchTerm]);

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteDocumentNonBlocking(doc(db, deleteConfirm.path, deleteConfirm.id));
      toast({ title: "Registro removido" });
      setDeleteConfirm(null);
    }
  };

  const openViewRsvp = (rsvp: any) => {
    setTimeout(() => {
      setSelectedRsvp(rsvp);
    }, 100);
  };

  const openNewInvitee = () => {
    setEditingInvitee({
      fullName: '',
      phoneNumber: '',
      category: 'Geral',
      guestLimit: 1
    });
    setIsInviteeDialogOpen(true);
  };

  const openEditInvitee = (invitee: any) => {
    setTimeout(() => {
      setEditingInvitee({ ...invitee });
      setIsInviteeDialogOpen(true);
    }, 100);
  };

  const openNewRsvp = () => {
    setEditingRsvp({
      fullName: '',
      isAttending: true,
      numberOfGuests: 0,
      guestNames: [],
      phoneNumber: '',
      message: ''
    });
    setIsRsvpEditDialogOpen(true);
  };

  const openEditRsvp = (rsvp: any) => {
    setTimeout(() => {
      const normalizedGuests = (rsvp.guestNames || []).map((g: any) => 
        typeof g === 'string' ? { name: g, type: 'adult' } : g
      );
      setEditingRsvp({ 
        ...rsvp,
        guestNames: normalizedGuests 
      });
      setIsRsvpEditDialogOpen(true);
    }, 100);
  };

  const openDeleteConfirm = (id: string, path: 'rsvps' | 'invitees') => {
    setTimeout(() => {
      setDeleteConfirm({ id, path });
    }, 100);
  };

  const saveInviteeChanges = () => {
    if (!editingInvitee || !editingInvitee.fullName) {
      toast({ variant: "destructive", title: "Nome é obrigatório" });
      return;
    }

    const data = {
      fullName: editingInvitee.fullName,
      phoneNumber: editingInvitee.phoneNumber || "",
      category: editingInvitee.category || "Geral",
      guestLimit: Number(editingInvitee.guestLimit) || 1,
      updatedAt: new Date().toISOString()
    };

    if (editingInvitee.id) {
      const docRef = doc(db, 'invitees', editingInvitee.id);
      updateDocumentNonBlocking(docRef, data);
      toast({ title: "Convidado atualizado" });
    } else {
      addDocumentNonBlocking(collection(db, 'invitees'), {
        ...data,
        createdAt: new Date().toISOString()
      });
      toast({ title: "Convidado adicionado" });
    }
    setIsInviteeDialogOpen(false);
  };

  const saveRsvpChanges = () => {
    if (!editingRsvp || !editingRsvp.fullName) {
      toast({ variant: "destructive", title: "Nome é obrigatório" });
      return;
    }

    const data = {
      fullName: editingRsvp.fullName,
      isAttending: editingRsvp.isAttending,
      numberOfGuests: Number(editingRsvp.numberOfGuests) || 0,
      guestNames: editingRsvp.guestNames || [],
      phoneNumber: editingRsvp.phoneNumber || "",
      message: editingRsvp.message || "",
      updatedAt: new Date().toISOString()
    };

    if (editingRsvp.id) {
      const docRef = doc(db, 'rsvps', editingRsvp.id);
      updateDocumentNonBlocking(docRef, data);
      toast({ title: "Confirmação atualizada" });
    } else {
      addDocumentNonBlocking(collection(db, 'rsvps'), {
        ...data,
        createdAt: new Date().toISOString()
      });
      toast({ title: "Confirmação adicionada" });
    }
    setIsRsvpEditDialogOpen(false);
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
          rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        } else {
          const text = event.target?.result as string;
          const lines = text.split(/\r?\n/).filter(l => l.trim());
          const delimiter = text.includes(';') ? ';' : ',';
          const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''));
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(delimiter).map(v => v.trim().replace(/"/g, ''));
            const row: any = {};
            headers.forEach((header, idx) => { if (header) row[header] = values[idx]; });
            rows.push(row);
          }
        }
        
        const colRef = collection(db, importTarget);
        let count = 0;
        for (const row of rows) {
          const data: any = { guestLimit: 1, category: 'Geral' };
          Object.keys(row).forEach(key => {
            const lowerKey = key.toLowerCase().trim();
            const value = String(row[key]).trim();
            if (lowerKey.includes('nome') || lowerKey === 'convidado') data.fullName = value;
            else if (lowerKey.includes('tel') || lowerKey === 'whatsapp') data.phoneNumber = value;
            else if (lowerKey.includes('cat') || lowerKey === 'grupo') data.category = value;
            else if (lowerKey.includes('total') || lowerKey.includes('limite')) {
              const parsed = parseInt(value);
              if (!isNaN(parsed)) data.guestLimit = parsed;
            }
          });
          if (data.fullName) {
            data.createdAt = new Date().toISOString();
            if (importTarget === 'rsvps') {
              data.isAttending = true;
              data.numberOfGuests = Math.max(0, data.guestLimit - 1);
              data.guestNames = [];
            }
            addDocumentNonBlocking(colRef, data);
            count++;
          }
        }
        toast({ title: "Importação concluída", description: `${count} registros processados.` });
      } catch (error) {
        toast({ variant: "destructive", title: "Erro na importação" });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    if (extension === 'xlsx' || extension === 'xls') reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
  };

  const exportPdf = (data: any[], title: string) => {
    const doc = new jsPDF();
    const isRsvpList = title.includes("Confirmações");
    const tableColumn = isRsvpList 
      ? ["Nome", "Presença", "Acomp.", "Telefone", "Data"]
      : ["Nome", "Status", "Lím. Total", "Categoria"];

    const tableRows = data.map(item => {
      if (isRsvpList) {
        return [item.fullName, item.isAttending ? "Sim" : "Não", item.numberOfGuests, item.phoneNumber || "---", format(new Date(item.createdAt), 'dd/MM/yyyy')];
      }
      const rsvp = rsvpMap.get(item.fullName?.toLowerCase().trim());
      const status = rsvp ? (rsvp.isAttending ? "Confirmado" : "Recusado") : "Pendente";
      return [item.fullName, status, item.guestLimit || "1", item.category || "Geral"];
    });

    doc.setFontSize(18);
    doc.setTextColor(200, 169, 106);
    doc.text(title, 14, 15);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save(`${title.toLowerCase().replace(/\s/g, '_')}.pdf`);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline text-gold">Gestão de Convidados</h1>
          <p className="text-sm md:text-base text-muted-foreground font-light">Controle total sobre a lista de convidados e confirmações.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input type="file" accept=".csv, .xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleImportFile} />
          <Button onClick={() => { setImportTarget('invitees'); fileInputRef.current?.click(); }} variant="outline" size="sm" className="border-primary/20 text-gold flex-1 md:flex-none" disabled={isImporting}>
            <FileUp className="mr-2 h-4 w-4" /> Importar Lista Geral
          </Button>
          <Button onClick={() => { setImportTarget('rsvps'); fileInputRef.current?.click(); }} variant="outline" size="sm" className="border-primary/20 text-gold flex-1 md:flex-none" disabled={isImporting}>
            <Upload className="mr-2 h-4 w-4" /> Importar Confirmações
          </Button>
        </div>
      </div>

      <Tabs defaultValue="rsvps" className="space-y-6">
        <TabsList className="bg-primary/5 border border-primary/10">
          <TabsTrigger value="rsvps" className="gap-2"><CheckCircle className="h-4 w-4" /> Confirmações ({rsvps?.length || 0})</TabsTrigger>
          <TabsTrigger value="invitees" className="gap-2"><UsersIcon className="h-4 w-4" /> Lista Geral ({invitees?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="rsvps" className="space-y-4">
          <div className="bg-white rounded-xl border border-primary/10 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-primary/5 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-10 border-primary/10" placeholder="Buscar confirmação..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={openNewRsvp} variant="outline" size="sm" className="border-gold text-gold">
                  <Plus className="mr-2 h-4 w-4" /> Nova Confirmação
                </Button>
                <Button onClick={() => exportPdf(filteredRsvps || [], "Lista de Confirmações")} variant="ghost" size="sm" className="text-gold">
                  <FileText className="mr-2 h-4 w-4" /> Exportar PDF
                </Button>
              </div>
            </div>
            
            {isLoadingRsvps ? (
              <div className="p-12 flex flex-col items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
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
                    {filteredRsvps?.map((rsvp) => (
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
                            {rsvp.guestNames?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {rsvp.guestNames.map((g: any, i: number) => {
                                  const name = typeof g === 'string' ? g : g.name;
                                  const type = typeof g === 'string' ? 'adult' : g.type;
                                  return (
                                    <span key={i} className="text-[9px] text-muted-foreground bg-neutral-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                      {type === 'child' ? <Baby className="h-2 w-2" /> : <User className="h-2 w-2" />}
                                      {name}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{rsvp.phoneNumber}</TableCell>
                        <TableCell>
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); openViewRsvp(rsvp); }}><Eye className="mr-2 h-4 w-4" /> Ver</DropdownMenuItem>
                              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); openEditRsvp(rsvp); }}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); openDeleteConfirm(rsvp.id, 'rsvps'); }} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
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
                <Input className="pl-10 border-primary/10" placeholder="Buscar na lista geral..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={openNewInvitee} variant="outline" size="sm" className="border-gold text-gold">
                  <Plus className="mr-2 h-4 w-4" /> Novo Convidado
                </Button>
                <Button onClick={() => exportPdf(filteredInvitees || [], "Lista Geral de Convidados")} variant="ghost" size="sm" className="text-gold">
                  <FileText className="mr-2 h-4 w-4" /> Exportar PDF
                </Button>
              </div>
            </div>
            
            {isLoadingInvitees ? (
              <div className="p-12 flex flex-col items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
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
                    {filteredInvitees?.map((item) => {
                      const rsvp = rsvpMap.get(item.fullName?.toLowerCase().trim());
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
                              <span className="text-muted-foreground flex items-center gap-1 text-xs"><Clock className="h-3 w-3" /> Pendente</span>
                            )}
                          </TableCell>
                          <TableCell>{item.guestLimit || '1'}</TableCell>
                          <TableCell><span className="text-xs text-muted-foreground bg-neutral-100 px-2 py-1 rounded">{item.category || 'Geral'}</span></TableCell>
                          <TableCell>
                            <DropdownMenu modal={false}>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); openEditInvitee(item); }}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); openDeleteConfirm(item.id, 'invitees'); }} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
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
      <Dialog open={!!selectedRsvp} onOpenChange={(open) => !open && setSelectedRsvp(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-gold">Detalhes da Confirmação</DialogTitle></DialogHeader>
          {selectedRsvp && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-y-2">
                <span className="text-muted-foreground">Convidado:</span><span className="font-medium">{selectedRsvp.fullName}</span>
                <span className="text-muted-foreground">Presença:</span><span className={selectedRsvp.isAttending ? 'text-green-600' : 'text-red-600'}>{selectedRsvp.isAttending ? 'Confirmada' : 'Recusada'}</span>
                <span className="text-muted-foreground">Acompanhantes:</span><span>{selectedRsvp.numberOfGuests}</span>
                <span className="text-muted-foreground">Telefone:</span><span>{selectedRsvp.phoneNumber}</span>
              </div>
              {selectedRsvp.guestNames?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Acompanhantes:</p>
                  <div className="space-y-1">
                    {selectedRsvp.guestNames.map((g: any, i: number) => {
                      const name = typeof g === 'string' ? g : g.name;
                      const type = typeof g === 'string' ? 'adult' : g.type;
                      return (
                        <div key={i} className="flex items-center gap-2 p-2 bg-neutral-50 rounded border">
                          {type === 'child' ? <Baby className="h-4 w-4 text-gold" /> : <User className="h-4 w-4 text-gold" />}
                          <span className="flex-1">{name}</span>
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{type === 'child' ? 'Criança' : 'Adulto'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="p-3 bg-neutral-50 rounded border italic">{selectedRsvp.message || "Sem recado."}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* RSVP Edit/New Dialog */}
      <Dialog open={isRsvpEditDialogOpen} onOpenChange={(open) => !open && setIsRsvpEditDialogOpen(false)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-gold">{editingRsvp?.id ? 'Editar Confirmação' : 'Nova Confirmação'}</DialogTitle></DialogHeader>
          {editingRsvp && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Convidado Principal</Label>
                <Input value={editingRsvp.fullName || ''} onChange={(e) => setEditingRsvp({...editingRsvp, fullName: e.target.value})} />
              </div>
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10">
                <Label>Vai Comparecer?</Label>
                <Switch checked={editingRsvp.isAttending} onCheckedChange={(val) => setEditingRsvp({...editingRsvp, isAttending: val})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={editingRsvp.phoneNumber || ''} onChange={(e) => setEditingRsvp({...editingRsvp, phoneNumber: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Nº Acompanhantes</Label>
                  <Input type="number" min="0" value={editingRsvp.numberOfGuests ?? 0} onChange={(e) => {
                    const count = parseInt(e.target.value) || 0;
                    const names = [...(editingRsvp.guestNames || [])];
                    const newNames = count > names.length 
                      ? [...names, ...Array(count - names.length).fill({ name: "", type: "adult" })] 
                      : names.slice(0, count);
                    setEditingRsvp({...editingRsvp, numberOfGuests: count, guestNames: newNames});
                  }} />
                </div>
              </div>
              {editingRsvp.guestNames?.map((g: any, index: number) => (
                <div key={index} className="p-3 rounded-lg border bg-neutral-50 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-widest">Acompanhante {index + 1}</Label>
                    <Input value={g.name || ''} onChange={(e) => {
                      const updated = [...editingRsvp.guestNames];
                      updated[index] = { ...updated[index], name: e.target.value };
                      setEditingRsvp({...editingRsvp, guestNames: updated});
                    }} placeholder="Nome completo" />
                  </div>
                  <RadioGroup 
                    value={g.type || 'adult'} 
                    onValueChange={(val) => {
                      const updated = [...editingRsvp.guestNames];
                      updated[index] = { ...updated[index], type: val };
                      setEditingRsvp({...editingRsvp, guestNames: updated});
                    }}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2"><RadioGroupItem value="adult" id={`adult-${index}`} /><Label htmlFor={`adult-${index}`} className="text-xs">Adulto</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="child" id={`child-${index}`} /><Label htmlFor={`child-${index}`} className="text-xs">Criança</Label></div>
                  </RadioGroup>
                </div>
              ))}
              <div className="space-y-2">
                <Label>Mensagem/Recado</Label>
                <Textarea value={editingRsvp.message || ''} onChange={(e) => setEditingRsvp({...editingRsvp, message: e.target.value})} />
              </div>
              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setIsRsvpEditDialogOpen(false)}>Cancelar</Button>
                <Button onClick={saveRsvpChanges} className="bg-gold text-white">Salvar Alterações</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit/New Invitee Dialog */}
      <Dialog open={isInviteeDialogOpen} onOpenChange={(open) => !open && setIsInviteeDialogOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-gold">{editingInvitee?.id ? 'Editar Convidado' : 'Novo Convidado'}</DialogTitle></DialogHeader>
          {editingInvitee && (
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Nome Completo</Label><Input value={editingInvitee.fullName || ''} onChange={(e) => setEditingInvitee({...editingInvitee, fullName: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Telefone</Label><Input value={editingInvitee.phoneNumber || ''} onChange={(e) => setEditingInvitee({...editingInvitee, phoneNumber: e.target.value})} /></div>
                <div className="space-y-2"><Label>Total de Pessoas (Limite)</Label><Input type="number" min="1" value={editingInvitee.guestLimit ?? 1} onChange={(e) => setEditingInvitee({...editingInvitee, guestLimit: e.target.value})} /></div>
              </div>
              <div className="space-y-2"><Label>Categoria</Label><Input value={editingInvitee.category || ''} onChange={(e) => setEditingInvitee({...editingInvitee, category: e.target.value})} /></div>
              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setIsInviteeDialogOpen(false)}>Cancelar</Button>
                <Button onClick={saveInviteeChanges} className="bg-gold text-white">Salvar Alterações</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Registro?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. O registro será removido permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white">Confirmar Exclusão</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
