
'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

const mockGifts = [
  { id: 1, name: "Cafeteira Nespresso", price: "R$ 450,00", desc: "Mornings coffee...", image: "https://picsum.photos/seed/gift1/200/200" },
  { id: 2, name: "Smart TV 55\"", price: "R$ 2.800,00", desc: "Cinema nights.", image: "https://picsum.photos/seed/gift2/200/200" },
  { id: 3, name: "Geladeira Inox", price: "R$ 3.500,00", desc: "Essential for our kitchen.", image: "https://picsum.photos/seed/gift4/200/200" },
];

export default function GiftsAdminPage() {
  const [gifts, setGifts] = useState(mockGifts);

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline text-gold">Gerenciar Presentes</h1>
          <p className="text-muted-foreground font-light">Adicione, edite ou remova itens da sua lista.</p>
        </div>
        <Button className="bg-gold hover:bg-gold/90 text-white">
          <Plus className="mr-2 h-4 w-4" /> Novo Presente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gifts.map((gift) => (
          <Card key={gift.id} className="border-primary/10 overflow-hidden group">
            <div className="aspect-video relative overflow-hidden bg-muted">
              <Image 
                src={gift.image} 
                alt={gift.name} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-headline text-gold">{gift.name}</CardTitle>
                <span className="font-bold text-sm">{gift.price}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground italic mb-4">{gift.desc}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 border-primary/20 text-gold hover:bg-primary/5">
                  <Pencil className="mr-2 h-3 w-3" /> Editar
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/5 hover:text-destructive border-destructive/20">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
