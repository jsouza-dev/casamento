
'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, ExternalLink, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { GiftDialog } from './gift-dialog';
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

export default function GiftsAdminPage() {
  const db = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<any>(null);
  const [deletingGiftId, setDeletingGiftId] = useState<string | null>(null);

  const giftsQuery = useMemoFirebase(() => {
    return query(collection(db, 'gifts'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: gifts, isLoading } = useCollection(giftsQuery);

  const handleEdit = (gift: any) => {
    setEditingGift(gift);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingGift(null);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingGiftId) {
      const docRef = doc(db, 'gifts', deletingGiftId);
      deleteDocumentNonBlocking(docRef);
      setDeletingGiftId(null);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline text-gold">Gerenciar Presentes</h1>
          <p className="text-muted-foreground font-light">Adicione, edite ou remova itens da sua lista de presentes.</p>
        </div>
        <Button onClick={handleAddNew} className="bg-gold hover:bg-gold/90 text-white">
          <Plus className="mr-2 h-4 w-4" /> Novo Presente
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin mb-4 text-gold" />
          <p>Carregando presentes...</p>
        </div>
      ) : !gifts || gifts.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-primary/10 rounded-xl bg-primary/5">
          <ImageIcon className="h-12 w-12 text-gold/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gold">Nenhum presente cadastrado</h3>
          <p className="text-muted-foreground mb-6">Comece adicionando o primeiro item à sua lista.</p>
          <Button onClick={handleAddNew} variant="outline" className="border-gold text-gold hover:bg-gold/5">
            Adicionar Presente
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gifts.map((gift) => (
            <Card key={gift.id} className="border-primary/10 overflow-hidden group hover:shadow-md transition-shadow">
              <div className="aspect-video relative overflow-hidden bg-muted">
                <Image 
                  src={gift.imageUrl || 'https://picsum.photos/seed/placeholder/400/300'} 
                  alt={gift.name} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                   <a 
                    href={gift.externalLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gold hover:bg-white transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg font-headline text-gold truncate">{gift.name}</CardTitle>
                  <span className="font-bold text-sm whitespace-nowrap">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(gift.price)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground italic mb-4 line-clamp-2 h-8">
                  {gift.description || "Sem descrição."}
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(gift)}
                    className="flex-1 border-primary/20 text-gold hover:bg-primary/5"
                  >
                    <Pencil className="mr-2 h-3 w-3" /> Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setDeletingGiftId(gift.id)}
                    className="text-destructive hover:bg-destructive/5 hover:text-destructive border-destructive/20"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <GiftDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        gift={editingGift} 
      />

      <AlertDialog open={!!deletingGiftId} onOpenChange={() => setDeletingGiftId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O presente será removido permanentemente da lista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
