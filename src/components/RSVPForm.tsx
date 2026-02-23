
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CheckCircle2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  attending: z.enum(["yes", "no"], { required_error: "Por favor, selecione uma opção." }),
  guestsCount: z.coerce.number().min(0).max(10, { message: "Limite de 10 acompanhantes." }).default(0),
  guestNames: z.array(z.object({
    name: z.string().min(2, { message: "Informe o nome do acompanhante." })
  })).optional(),
  phone: z.string().min(10, { message: "Por favor, insira um telefone válido." }),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function RSVPForm() {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const db = useFirestore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      attending: "yes",
      guestsCount: 0,
      guestNames: [],
      phone: "",
      message: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "guestNames",
  });

  const guestsCount = form.watch("guestsCount");
  const attending = form.watch("attending");

  // Synchronize guestNames array with guestsCount
  useEffect(() => {
    const currentCount = fields.length;
    const targetCount = attending === 'yes' ? guestsCount : 0;

    if (targetCount > currentCount) {
      for (let i = currentCount; i < targetCount; i++) {
        append({ name: "" });
      }
    } else if (targetCount < currentCount) {
      for (let i = currentCount; i > targetCount; i--) {
        remove(i - 1);
      }
    }
  }, [guestsCount, attending, fields.length, append, remove]);

  async function onSubmit(values: FormValues) {
    try {
      const rsvpId = doc(collection(db, 'rsvps')).id;
      const docRef = doc(db, 'rsvps', rsvpId);

      const rsvpData = {
        id: rsvpId,
        fullName: values.name,
        isAttending: values.attending === 'yes',
        numberOfGuests: values.attending === 'yes' ? values.guestsCount : 0,
        guestNames: values.attending === 'yes' ? (values.guestNames?.map(g => g.name) || []) : [],
        phoneNumber: values.phone,
        message: values.message || "",
        createdAt: new Date().toISOString(),
      };

      setDocumentNonBlocking(docRef, rsvpData, { merge: true });
      
      setSubmitted(true);
      toast({
        title: "Confirmação enviada!",
        description: "Agradecemos imensamente por nos avisar.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar",
        description: "Ocorreu um problema, por favor tente novamente.",
      });
    }
  }

  if (submitted) {
    return (
      <div className="text-center p-12 bg-white rounded-2xl border border-primary/10 space-y-4 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-primary/60" />
        </div>
        <h3 className="text-2xl font-headline text-gold">Obrigado!</h3>
        <p className="font-light text-muted-foreground">Sua resposta foi enviada com sucesso. Mal podemos esperar para te ver!</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl border border-primary/10 shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-light">Seu Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Como quer ser chamado?" {...field} className="border-primary/10 focus-visible:ring-primary/20" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="attending"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="font-light">Você poderá comparecer?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="yes" />
                      </FormControl>
                      <FormLabel className="font-light">Sim, estarei presente</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="no" />
                      </FormControl>
                      <FormLabel className="font-light">Infelizmente não poderei ir</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {attending === 'yes' && (
            <>
              <FormField
                control={form.control}
                name="guestsCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-light">Quantos acompanhantes levará?</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="10" 
                        {...field} 
                        className="border-primary/10 focus-visible:ring-primary/20" 
                      />
                    </FormControl>
                    <FormDescription className="text-xs">Não conte com você mesmo.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {fields.length > 0 && (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-sm font-medium text-gold flex items-center gap-2">
                    <UserPlus className="h-4 w-4" /> Nomes dos Acompanhantes
                  </p>
                  {fields.map((field, index) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={`guestNames.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder={`Nome do acompanhante ${index + 1}`} 
                              {...field} 
                              className="border-primary/10 focus-visible:ring-primary/20" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-light">Seu Telefone / WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="(00) 00000-0000" {...field} className="border-primary/10 focus-visible:ring-primary/20" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-light">Recado para os noivos (Opcional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Deixe uma mensagem carinhosa..." {...field} className="border-primary/10 focus-visible:ring-primary/20 min-h-[100px]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full bg-gold hover:bg-gold/90 text-white font-light py-6 rounded-full transition-all">
            {form.formState.isSubmitting ? "Enviando..." : "Confirmar Presença"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
