
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
import { Download, Search, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const mockRsvps = [
  { id: 1, name: "Maria Eduarda Silva", attending: "Sim", guests: 2, phone: "(31) 98888-7777", message: "Mal podemos esperar!", date: "15/10/2025" },
  { id: 2, name: "João Paulo Almeida", attending: "Sim", guests: 1, phone: "(31) 97777-6666", message: "Estaremos lá com certeza.", date: "16/10/2025" },
  { id: 3, name: "Beatriz Oliveira", attending: "Não", guests: 0, phone: "(31) 96666-5555", message: "Infelizmente estarei viajando. Parabéns ao casal!", date: "17/10/2025" },
  { id: 4, name: "Ricardo Mendes", attending: "Sim", guests: 0, phone: "(31) 95555-4444", message: "", date: "18/10/2025" },
  { id: 5, name: "Ana Paula Cruz", attending: "Sim", guests: 3, phone: "(31) 94444-3333", message: "Família reunida para celebrar!", date: "20/10/2025" },
];

export default function RSVPsPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline text-gold">Lista de Convidados</h1>
          <p className="text-muted-foreground font-light">Gerencie todas as confirmações de presença.</p>
        </div>
        <Button variant="outline" className="border-primary/20 text-gold">
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-primary/10 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-primary/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-10 border-primary/10" placeholder="Buscar convidado..." />
          </div>
        </div>
        
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
            {mockRsvps.map((rsvp) => (
              <TableRow key={rsvp.id}>
                <TableCell className="font-medium">{rsvp.name}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${rsvp.attending === 'Sim' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {rsvp.attending}
                  </span>
                </TableCell>
                <TableCell>{rsvp.guests}</TableCell>
                <TableCell>{rsvp.phone}</TableCell>
                <TableCell className="hidden md:table-cell max-w-xs truncate italic text-muted-foreground">
                  {rsvp.message || "—"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{rsvp.date}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
