
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
import { Download, Search, MoreHorizontal, Loader2, Users as UsersIcon, FileText, Trash2, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function RSVPsPage() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRsvp, setSelectedRsvp] = useState<any>(null);

  const rsvpsQuery = useMemoFirebase(() => {
    return query(collection(db, 'rsvps'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: rsvps, isLoading } = useCollection(rsvpsQuery);

  const filteredRsvps = rsvps?.filter(rsvp => 
    rsvp.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta confirmação?")) {
      deleteDocumentNonBlocking(doc(db, 'rsvps', id));
    }
  };

  const exportCsv = () => {
    if (!rsvps) return;
    const headers = ["Nome", "Comparecerá", "Acompanhantes", "Nomes Acomp.", "Telefone", "Mensagem", "Data"];
    const rows = rsvps.map(r => [
      r.fullName,
      r.isAttending ? "Sim" : "Não",
      r.numberOfGuests,
      r.guestNames?.join(", ") || "",
      r.phoneNumber,
      r.message,
      format(new Date(r.createdAt), 'dd/MM/yyyy HH:mm')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(";")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "convidados_casamento.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPdf = () => {
    if (!rsvps) return;
    
    const doc = new jsPDF();
    const tableColumn = ["Nome", "Presença", "Acomp.", "Telefone", "Data"];
    const tableRows: any[] = [];

    rsvps.forEach(rsvp => {
      const rsvpData = [
        rsvp.fullName,
        rsvp.isAttending ? "Sim" : "Não",
        rsvp.numberOfGuests,
        rsvp.phoneNumber,
        format(new Date(rsvp.createdAt), 'dd/MM/yyyy')
      ];
      tableRows.push(rsvpData);
    });

    doc.setFontSize(18);
    doc.setTextColor(200, 169, 106); // Cor Gold do tema
    doc.text("Lista de Confirmações - Felipe & Rayssa", 14, 15);
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

    doc.save("convidados_casamento.pdf");
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline text-gold">Confirmações de Presença</h1>
          <p className="text-sm md:text-base text-muted-foreground font-light">Gerencie todas as respostas enviadas pelos convidados.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportCsv} variant="outline" size="sm" className="border-primary/20 text-gold flex-1 md:flex-none" disabled={!rsvps || rsvps.length === 0}>
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button onClick={exportPdf} variant="outline" size="sm" className="border-primary/20 text-gold flex-1 md:flex-none" disabled={!rsvps || rsvps.length === 0}>
            <FileText className="mr-2 h-4 w-4" /> PDF
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-primary/10 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-primary/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-10 border-primary/10" 
              placeholder="Buscar convidado..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-12 md:p-20 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-gold mb-2" />
            <p>Carregando lista...</p>
          </div>
        ) : !filteredRsvps || filteredRsvps.length === 0 ? (
          <div className="p-12 md:p-20 text-center text-muted-foreground">
            <UsersIcon className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p>Nenhuma confirmação encontrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Confirmou?</TableHead>
                  <TableHead className="hidden sm:table-cell">Acomp.</TableHead>
                  <TableHead className="hidden md:table-cell">Telefone</TableHead>
                  <TableHead className="hidden lg:table-cell">Data</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRsvps.map((rsvp) => (
                  <TableRow key={rsvp.id}>
                    <TableCell className="font-medium">{rsvp.fullName}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-[10px] md:text-xs ${rsvp.isAttending ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {rsvp.isAttending ? 'Sim' : 'Não'}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{rsvp.numberOfGuests}</TableCell>
                    <TableCell className="hidden md:table-cell">{rsvp.phoneNumber}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {format(new Date(rsvp.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedRsvp(rsvp)}>
                            <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(rsvp.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
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

      {/* RSVP Details Dialog for Mobile/Quick View */}
      <Dialog open={!!selectedRsvp} onOpenChange={() => setSelectedRsvp(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-gold">Detalhes da Confirmação</DialogTitle>
          </DialogHeader>
          {selectedRsvp && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-muted-foreground">Convidado:</p>
                <p className="font-medium">{selectedRsvp.fullName}</p>
                <p className="text-muted-foreground">Status:</p>
                <p className={selectedRsvp.isAttending ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {selectedRsvp.isAttending ? 'Confirmado' : 'Não poderá ir'}
                </p>
                <p className="text-muted-foreground">Acompanhantes:</p>
                <p>{selectedRsvp.numberOfGuests} ({selectedRsvp.guestNames?.join(", ") || "Nenhum"})</p>
                <p className="text-muted-foreground">Telefone:</p>
                <p>{selectedRsvp.phoneNumber}</p>
                <p className="text-muted-foreground">Data:</p>
                <p>{format(new Date(selectedRsvp.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
              </div>
              <div className="pt-4 border-t border-primary/10">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Mensagem:</p>
                <p className="text-sm italic text-muted-foreground bg-primary/5 p-4 rounded-lg">
                  {selectedRsvp.message || "Sem recado enviado."}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
