
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Save, X, ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import Image from 'next/image';

const giftSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Preço deve ser positivo"),
  imageUrl: z.string().url("URL da imagem inválida"),
  externalLink: z.string().url("URL do link inválido"),
});

type GiftFormValues = z.infer<typeof giftSchema>;

interface GiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  gift?: any;
}

export function GiftDialog({ isOpen, onClose, gift }: GiftDialogProps) {
  const db = useFirestore();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<GiftFormValues>({
    resolver: zodResolver(giftSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      externalLink: '',
    },
  });

  useEffect(() => {
    if (gift) {
      form.reset({
        name: gift.name,
        description: gift.description || '',
        price: gift.price,
        imageUrl: gift.imageUrl,
        externalLink: gift.externalLink,
      });
      setPreviewUrl(gift.imageUrl);
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        externalLink: '',
      });
      setPreviewUrl(null);
    }
  }, [gift, form, isOpen]);

  const onSubmit = (values: GiftFormValues) => {
    const giftId = gift?.id || doc(collection(db, 'gifts')).id;
    const docRef = doc(db, 'gifts', giftId);

    const giftData = {
      ...values,
      id: giftId,
      createdAt: gift?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDocumentNonBlocking(docRef, giftData, { merge: true });
    onClose();
  };

  const imageUrl = form.watch('imageUrl');

  useEffect(() => {
    if (imageUrl && imageUrl.startsWith('http')) {
      setPreviewUrl(imageUrl);
    }
  }, [imageUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline text-gold">
            {gift ? 'Editar Presente' : 'Novo Presente'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Presente</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Cafeteira Nespresso" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="externalLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link para Compra</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Breve descrição do item..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {previewUrl && (
              <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-primary/10 bg-muted">
                <Image 
                  src={previewUrl} 
                  alt="Preview" 
                  fill 
                  className="object-cover"
                  onError={() => setPreviewUrl(null)}
                />
              </div>
            )}

            {!previewUrl && imageUrl && (
              <div className="flex items-center justify-center aspect-video w-full rounded-lg border-2 border-dashed border-primary/10 bg-primary/5 text-muted-foreground text-xs italic">
                URL de imagem inválida ou carregando...
              </div>
            )}

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-gold hover:bg-gold/90 text-white">
                <Save className="mr-2 h-4 w-4" /> Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
