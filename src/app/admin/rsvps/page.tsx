
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
import { Download, Search, MoreHorizontal, Loader2, Users as UsersIcon, FileText, Trash2, Eye, Upload, FileUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useState, useRef } from 'react';
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
} from "@/components/ui/dialog";

export default function RSVPsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRsvp, setSelectedRsvp] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importTarget, setImportTarget] = useState<'rsvps' | 'invitees'>('rsvps');

  // Queries
  const rsvpsQuery = useMemoFirebase(() => query(collection(db, 'rsvps'), orderBy('createdAt', 'desc')), [db]);
  const inviteesQuery = useMemoFirebase(() => query(collection(db, 'invitees'), orderBy('fullName', 'asc')), [db]);

  const { data: rsvps, isLoading: isLoadingRsvps } = useCollection(rsvpsQuery);
  const { data: invitees, isLoading: isLoadingInvitees } = useCollection(inviteesQuery);

  const filteredRsvps = rsvps?.filter(rsvp => 
    rsvp.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvitees = invitees?.filter(invitee => 
    invitee.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string, path: 'rsvps' | 'invitees') => {
    if (confirm("Tem certeza que deseja excluir este registro?")) {
      deleteDocumentNonBlocking(doc(db, path, id));
    }
  };

  const processDataRows = async (rows: any[]) => {
    const colRef = collection(db, importTarget);
    let count = 0;

    for (const row of rows) {
      const data: any = {
        guestLimit: 1, // Default is individual
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

      // Se não encontrou nome pelo cabeçalho, tenta pegar a primeira coluna que parece um nome
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
          // Tenta detectar delimitador (vírgula, ponto e vírgula ou tab)
          const firstLine = text.split('\n')[0];
          let delimiter = ',';
          if (firstLine.includes(';')) delimiter = ';';
          else if (firstLine.includes('\t')) delimiter = '\t';

          const lines = text.split(/\r?\n/).filter(l => l.trim());
          if (lines.length < 2) throw new Error("Arquivo vazio ou sem dados.");

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
            description: `${count} registros foram importados para ${importTarget === 'rsvps' ? 'Confirmações' : 'Lista Geral'}.`,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Nenhum dado importado",
            description: "Não encontramos nomes válidos no arquivo. Verifique os cabeçalhos das colunas.",
          });
        }
      } catch (error) {
        console.error("Import error:", error);
        toast({
          variant: "destructive",
          title: "Erro na importação",
          description: "Não foi possível ler o arquivo. Certifique-se de que ele contém uma lista de nomes.",
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
      
      const rsvpMatch = rsvps?.find(r => r.fullName.toLowerCase().trim() === item.fullName.toLowerCase().trim());
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
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 22);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      headStyles: { fillColor: [200, 169, 106] },
      theme: 'grid',
    });

    doc.save(`${title.toLowerCase().replace(/\s/g, '_')}.pdf`);
  };

  // Helper to find RSVP status for an invitee
  const getRsvpStatus = (fullName: string) => {
    if (!rsvps) return null;
    return rsvps.find(r => r.fullName.toLowerCase().trim() === fullName.toLowerCase().trim());
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline text-gold">Gestão de Convidados</h1>
          <p className="text-sm md:text-base text-muted-foreground font-light">Vincule sua lista mestre às confirmações recebidas.</p>
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
                      <TableHead>Acomp.</TableHead>
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
                        <TableCell>{rsvp.numberOfGuests}</TableCell>
                        <TableCell>{rsvp.phoneNumber}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedRsvp(rsvp)}><Eye className="mr-2 h-4 w-4" /> Ver</DropdownMenuItem>
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
              <div className="p-3 bg-neutral-50 rounded border italic text-sm text-muted-foreground">
                {selectedRsvp.message || "Sem recado."}
              </div>
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
