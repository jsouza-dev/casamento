
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "As alterações foram aplicadas com sucesso.",
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-headline text-gold">Configurações Gerais</h1>
        <p className="text-muted-foreground font-light">Ajuste os detalhes principais do convite.</p>
      </div>

      <div className="space-y-6">
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg">Informações do Evento</CardTitle>
            <CardDescription>Estes dados aparecem em destaque no convite.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Noivo</Label>
                <Input defaultValue="Felipe Augusto" className="border-primary/10" />
              </div>
              <div className="space-y-2">
                <Label>Nome da Noiva</Label>
                <Input defaultValue="Rayssa Caldeira" className="border-primary/10" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data do Evento</Label>
                <Input type="date" defaultValue="2026-03-21" className="border-primary/10" />
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Input defaultValue="16:30h" className="border-primary/10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nome do Local</Label>
              <Input defaultValue="Espaço Fazenda Paradiso" className="border-primary/10" />
            </div>
            <div className="space-y-2">
              <Label>Endereço Completo</Label>
              <Textarea defaultValue="Betim – Minas Gerais" className="border-primary/10" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg">Integrações e Links</CardTitle>
            <CardDescription>Configure links externos e mapas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Link do Google Maps</Label>
              <Input defaultValue="https://www.google.com/maps/place/Espa%C3%A7o+Fazenda+Paradiso" className="border-primary/10" />
            </div>
            <div className="space-y-2">
              <Label>Link Espaço Padrinhos</Label>
              <Input defaultValue="https://wa.me/..." className="border-primary/10" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" className="border-primary/20 text-gold">Cancelar</Button>
          <Button onClick={handleSave} className="bg-gold hover:bg-gold/90 text-white px-8">
            <Save className="mr-2 h-4 w-4" /> Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}
