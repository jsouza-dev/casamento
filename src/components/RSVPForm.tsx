
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  attending: z.enum(["yes", "no"], { required_error: "Por favor, selecione uma opção." }),
  guests: z.string().optional(),
  phone: z.string().min(10, { message: "Por favor, insira um telefone válido." }),
  message: z.string().optional(),
});

export function RSVPForm() {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultVariants: {
      attending: "yes",
      guests: "0",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Simulating database submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('RSVP Submitted:', values);
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
                <FormLabel className="font-light">Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome" {...field} className="border-primary/10 focus-visible:ring-primary/20" />
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
                <FormLabel className="font-light">Confirmará presença?</FormLabel>
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
                      <FormLabel className="font-light">Infelizmente não poderei comparecer</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="guests"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-light">Número de acompanhantes</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} className="border-primary/10 focus-visible:ring-primary/20" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-light">Telefone</FormLabel>
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
                <FormLabel className="font-light">Mensagem opcional</FormLabel>
                <FormControl>
                  <Textarea placeholder="Deixe um recado para os noivos" {...field} className="border-primary/10 focus-visible:ring-primary/20 min-h-[100px]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full bg-gold hover:bg-gold/90 text-white font-light py-6 rounded-full">
            {form.formState.isSubmitting ? "Enviando..." : "Confirmar Presença"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
