
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { generateGuestMessage } from '@/ai/flows/generate-guest-message';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Copy, Loader2 } from 'lucide-react';

export default function MessagesAIPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    guestName: '',
    messageType: 'thank-you' as const,
    rsvpStatus: true,
    additionalContext: '',
  });

  const handleGenerate = async () => {
    if (!formData.guestName) {
      toast({
        variant: "destructive",
        title: "Atenção",
        description: "Por favor, informe o nome do convidado.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await generateGuestMessage({
        guestName: formData.guestName,
        messageType: formData.messageType,
        rsvpStatus: formData.rsvpStatus,
        additionalContext: formData.additionalContext,
      });
      setResult(response.message);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro na IA",
        description: "Não foi possível gerar a mensagem agora.",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast({
      title: "Copiado!",
      description: "Mensagem copiada para a área de transferência.",
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-headline text-gold">Assistente de Mensagens</h1>
        <p className="text-muted-foreground font-light">Utilize nossa IA para criar mensagens delicadas e personalizadas para seus convidados.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg">Configurações</CardTitle>
            <CardDescription>Defina os detalhes do convidado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="guestName">Nome do Convidado</Label>
              <Input 
                id="guestName" 
                placeholder="Ex: Maria Eduarda" 
                value={formData.guestName}
                onChange={(e) => setFormData({...formData, guestName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Mensagem</Label>
              <Select 
                value={formData.messageType} 
                onValueChange={(val: any) => setFormData({...formData, messageType: val})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thank-you">Agradecimento</SelectItem>
                  <SelectItem value="reminder">Lembrete</SelectItem>
                  <SelectItem value="general-communication">Comunicação Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rsvp">Status de RSVP</Label>
              <Select 
                value={formData.rsvpStatus ? 'yes' : 'no'} 
                onValueChange={(val) => setFormData({...formData, rsvpStatus: val === 'yes'})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Confirmado</SelectItem>
                  <SelectItem value="no">Pendente/Recusado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="context">Contexto Adicional (Opcional)</Label>
              <Textarea 
                id="context" 
                placeholder="Ex: Ela nos deu um jogo de jantar lindo..."
                value={formData.additionalContext}
                onChange={(e) => setFormData({...formData, additionalContext: e.target.value})}
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              className="w-full bg-gold hover:bg-gold/90"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Gerar Mensagem
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/10 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Mensagem Gerada</CardTitle>
              <CardDescription>O resultado aparecerá aqui</CardDescription>
            </div>
            {result && (
              <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {result ? (
              <div className="flex-1 p-6 bg-primary/5 rounded-xl border border-primary/10 italic text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {result}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 border-2 border-dashed border-primary/10 rounded-xl text-muted-foreground italic text-sm">
                Aguardando geração...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
