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
import { Download, Search, MoreHorizontal, Loader2, Users as UsersIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RSVPsPage() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline text-gold">Confirmações de Presença</h1>
          <p className="text-muted-foreground font-light">Gerencie todas as respostas enviadas pelos convidados.</p>
        </div>
        <Button onClick={exportCsv} variant="outline" className="border-primary/20 text-gold" disabled={!rsvps || rsvps.length === 0}>
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
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
          <div className="p-20 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-gold mb-2" />
            <p>Carregando lista...</p>
          </div>
        ) : !filteredRsvps || filteredRsvps.length === 0 ? (
          <div className="p-20 text-center text-muted-foreground">
            <UsersIcon className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p>Nenhuma confirmação encontrada.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-primary/5">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Confirmou?</TableHead>
                <TableHead>Acomp.</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="hidden md:table-cell">Mensagem</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRsvps.map((rsvp) => (
                <TableRow key={rsvp.id}>
                  <TableCell className="font-medium">{rsvp.fullName}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${rsvp.isAttending ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {rsvp.isAttending ? 'Sim' : 'Não'}
                    </span>
                  </TableCell>
                  <TableCell>{rsvp.numberOfGuests}</TableCell>
                  <TableCell>{rsvp.phoneNumber}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-xs truncate italic text-muted-foreground">
                    {rsvp.message || "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
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
                        <DropdownMenuItem onClick={() => alert(`Acompanhantes: ${rsvp.guestNames?.join(", ") || "Nenhum"}`)}>
                          Ver Acompanhantes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(rsvp.id)} className="text-destructive">
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
