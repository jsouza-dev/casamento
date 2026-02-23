'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function SettingsPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);

  const settingsRef = useMemoFirebase(() => doc(db, 'event_settings', 'main_settings'), [db]);
  const { data: settings, isLoading } = useDoc(settingsRef);

  const [formData, setFormData] = useState({
    groomName: 'Felipe Augusto',
    brideName: 'Rayssa Caldeira',
    eventDate: '2026-03-21',
    eventTime: '16:30h',
    locationName: 'Espaço Fazenda Paradiso',
    locationAddress: 'Contagem – Minas Gerais',
    mapUrl: 'https://www.google.com/maps/place/Espa%C3%A7o+Fazenda+Paradiso',
    godparentsLink: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        groomName: settings.groomName || 'Felipe Augusto',
        brideName: settings.brideName || 'Rayssa Caldeira',
        eventDate: settings.eventDate || '2026-03-21',
        eventTime: settings.eventTime || '16:30h',
        locationName: settings.locationName || 'Espaço Fazenda Paradiso',
        locationAddress: settings.locationAddress || 'Contagem – Minas Gerais',
        mapUrl: settings.mapUrl || 'https://www.google.com/maps/place/Espa%C3%A7o+Fazenda+Paradiso',
        godparentsLink: settings.godparentsLink || '',
      });
    }
  }, [settings]);

  const handleSave = () => {
    setLoading(true);
    const dataToSave = {
      ...formData,
      id: 'main_settings',
      updatedAt: new Date().toISOString(),
    };

    setDocumentNonBlocking(settingsRef, dataToSave, { merge: true });
    
    toast({
      title: "Configurações salvas",
      description: "As alterações foram aplicadas com sucesso.",
    });
    setLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

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
                <Input 
                  value={formData.groomName} 
                  onChange={(e) => setFormData({...formData, groomName: e.target.value})}
                  className="border-primary/10" 
                />
              </div>
              <div className="space-y-2">
                <Label>Nome da Noiva</Label>
                <Input 
                  value={formData.brideName} 
                  onChange={(e) => setFormData({...formData, brideName: e.target.value})}
                  className="border-primary/10" 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data do Evento</Label>
                <Input 
                  type="date" 
                  value={formData.eventDate} 
                  onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                  className="border-primary/10" 
                />
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Input 
                  value={formData.eventTime} 
                  onChange={(e) => setFormData({...formData, eventTime: e.target.value})}
                  className="border-primary/10" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nome do Local</Label>
              <Input 
                value={formData.locationName} 
                onChange={(e) => setFormData({...formData, locationName: e.target.value})}
                className="border-primary/10" 
              />
            </div>
            <div className="space-y-2">
              <Label>Endereço Completo</Label>
              <Textarea 
                value={formData.locationAddress} 
                onChange={(e) => setFormData({...formData, locationAddress: e.target.value})}
                className="border-primary/10" 
              />
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
              <Input 
                value={formData.mapUrl} 
                onChange={(e) => setFormData({...formData, mapUrl: e.target.value})}
                className="border-primary/10" 
              />
            </div>
            <div className="space-y-2">
              <Label>Link Espaço Padrinhos (Opcional)</Label>
              <Input 
                placeholder="Ex: link do whatsapp ou site externo"
                value={formData.godparentsLink} 
                onChange={(e) => setFormData({...formData, godparentsLink: e.target.value})}
                className="border-primary/10" 
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button 
            onClick={handleSave} 
            className="bg-gold hover:bg-gold/90 text-white px-8"
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}