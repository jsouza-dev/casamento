
'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Save, X, ImageIcon, Upload } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

const giftSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Preço deve ser positivo"),
  imageUrl: z.string().min(1, "O upload da imagem é obrigatório"),
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
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Arquivo inválido",
          description: "Por favor, selecione uma imagem JPG ou PNG.",
        });
        return;
      }

      // Validar tamanho (limite de 1MB para armazenamento direto no Firestore em base64)
      if (file.size > 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Imagem muito grande",
          description: "A imagem deve ter no máximo 1MB.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        form.setValue('imageUrl', base64String);
        setPreviewUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

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
    
    toast({
      title: gift ? "Presente atualizado" : "Presente cadastrado",
      description: `${values.name} foi salvo com sucesso.`,
    });
    
    onClose();
  };

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

            <div className="space-y-2">
              <FormLabel>Imagem do Presente</FormLabel>
              <div className="flex flex-col gap-4">
                {previewUrl ? (
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-primary/10 bg-muted">
                    <Image 
                      src={previewUrl} 
                      alt="Preview" 
                      fill 
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full"
                      onClick={() => {
                        setPreviewUrl(null);
                        form.setValue('imageUrl', '');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center aspect-video w-full rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-gold/40 mb-2" />
                    <span className="text-sm text-muted-foreground">Clique para enviar JPG ou PNG</span>
                    <span className="text-xs text-muted-foreground/60">(Máx: 1MB)</span>
                  </div>
                )}
                <Input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/jpeg,image/png" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                {form.formState.errors.imageUrl && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.imageUrl.message}
                  </p>
                )}
              </div>
            </div>

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
