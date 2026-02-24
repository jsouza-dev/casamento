
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CheckCircle2, UserPlus, AlertCircle, Search, Loader2, Baby, User } from 'lucide-react';
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
import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc, collection, query } from 'firebase/firestore';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  attending: z.enum(["yes", "no"], { required_error: "Por favor, selecione uma opção." }),
  guestsCount: z.coerce.number().min(0).default(0),
  guestNames: z.array(z.object({
    name: z.string().min(2, { message: "Informe o nome do acompanhante." }),
    type: z.enum(["adult", "child"]).default("adult")
  })).optional(),
  phone: z.string().min(10, { message: "Por favor, insira um telefone válido." }),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function RSVPForm() {
  const [submitted, setSubmitted] = useState(false);
  const [inviteeMatch, setInviteeMatch] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const db = useFirestore();

  const inviteesQuery = useMemoFirebase(() => query(collection(db, 'invitees')), [db]);
  const { data: allInvitees } = useCollection(inviteesQuery);

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
  const nameInput = form.watch("name");

  useEffect(() => {
    const currentCount = fields.length;
    const targetCount = attending === 'yes' ? guestsCount : 0;

    if (targetCount > currentCount) {
      for (let i = currentCount; i < targetCount; i++) {
        append({ name: "", type: "adult" });
      }
    } else if (targetCount < currentCount) {
      for (let i = currentCount; i > targetCount; i--) {
        remove(i - 1);
      }
    }
  }, [guestsCount, attending, fields.length, append, remove]);

  const handleVerifyName = () => {
    if (!nameInput || nameInput.length < 2 || !allInvitees) return;
    
    setIsVerifying(true);
    const normalizedSearch = nameInput.toLowerCase().trim();
    
    const match = allInvitees.find(inv => {
      const normalizedInDB = inv.fullName.toLowerCase().trim();
      return normalizedInDB === normalizedSearch || normalizedInDB.includes(normalizedSearch);
    });

    if (match) {
      setInviteeMatch(match);
      const maxAccomp = Math.max(0, (Number(match.guestLimit) || 1) - 1);
      if (form.getValues('guestsCount') > maxAccomp) {
        form.setValue('guestsCount', 0);
      }
    } else {
      setInviteeMatch(null);
    }
    setIsVerifying(false);
  };

  const maxAccompaniments = inviteeMatch ? Math.max(0, (Number(inviteeMatch.guestLimit) || 1) - 1) : 0;

  async function onSubmit(values: FormValues) {
    if (!inviteeMatch && allInvitees && allInvitees.length > 0) {
      toast({
        variant: "destructive",
        title: "Nome não localizado",
        description: "Por favor, digite seu nome exatamente como no convite.",
      });
      return;
    }

    try {
      const rsvpId = doc(collection(db, 'rsvps')).id;
      const docRef = doc(db, 'rsvps', rsvpId);

      const rsvpData = {
        id: rsvpId,
        fullName: values.name,
        isAttending: values.attending === 'yes',
        numberOfGuests: values.attending === 'yes' ? values.guestsCount : 0,
        guestNames: values.attending === 'yes' ? (values.guestNames || []) : [],
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
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-primary/10 shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-light">Seu Nome Completo</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="Exatamente como no convite" 
                      {...field} 
                      onBlur={handleVerifyName}
                      className="border-primary/10 focus-visible:ring-primary/20 pr-10" 
                    />
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      onClick={handleVerifyName}
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-gold h-8 w-8"
                      disabled={isVerifying}
                    >
                      {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                {inviteeMatch ? (
                  <p className="text-[10px] text-green-600 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3 w-3" /> Convidado localizado. Convite para {inviteeMatch.guestLimit} pessoa(s).
                  </p>
                ) : nameInput.length > 2 && !isVerifying && (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> Verifique se o nome está correto.
                  </p>
                )}
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
                      <FormControl><RadioGroupItem value="yes" /></FormControl>
                      <FormLabel className="font-light">Sim, estarei presente</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="no" /></FormControl>
                      <FormLabel className="font-light">Infelizmente não poderei ir</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {attending === 'yes' && inviteeMatch && maxAccompaniments > 0 && (
            <>
              <FormField
                control={form.control}
                name="guestsCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-light">Levará acompanhante?</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max={maxAccompaniments} 
                        {...field} 
                        className="border-primary/10 focus-visible:ring-primary/20" 
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Seu limite permite até {maxAccompaniments} acompanhante(s).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {fields.length > 0 && (
                <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-sm font-medium text-gold flex items-center gap-2">
                    <UserPlus className="h-4 w-4" /> Informações dos Acompanhantes
                  </p>
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 rounded-xl border border-primary/10 bg-primary/5 space-y-4">
                      <FormField
                        control={form.control}
                        name={`guestNames.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Nome do acompanhante {index + 1}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Nome completo" 
                                {...field} 
                                className="bg-white border-primary/10 focus-visible:ring-primary/20" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`guestNames.${index}.type`}
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex gap-4"
                              >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl><RadioGroupItem value="adult" /></FormControl>
                                  <FormLabel className="font-light text-xs flex items-center gap-1">
                                    <User className="h-3 w-3" /> Adulto
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl><RadioGroupItem value="child" /></FormControl>
                                  <FormLabel className="font-light text-xs flex items-center gap-1">
                                    <Baby className="h-3 w-3" /> Criança
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {attending === 'yes' && inviteeMatch && maxAccompaniments === 0 && (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
               <p className="text-xs text-muted-foreground italic">Este convite é individual.</p>
            </div>
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

          <Button 
            type="submit" 
            disabled={form.formState.isSubmitting || isVerifying} 
            className="w-full bg-gold hover:bg-gold/90 text-white font-light py-6 rounded-full transition-all"
          >
            {form.formState.isSubmitting ? "Enviando..." : "Confirmar Presença"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
