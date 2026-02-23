
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, Upload, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useDoc, useCollection, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import Image from 'next/image';

export default function AdminManualPadrinhos() {
  const { toast } = useToast();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);

  // Settings
  const settingsRef = useMemoFirebase(() => doc(db, 'manual_settings', 'main_settings'), [db]);
  const { data: settings } = useDoc(settingsRef);

  // Images
  const imagesQuery = useMemoFirebase(() => query(collection(db, 'manual_images'), orderBy('order_index', 'asc')), [db]);
  const { data: images } = useCollection(imagesQuery);

  const [formData, setFormData] = useState({
    mainText: '',
    mimoText: '',
    passwordEnabled: false,
    passwordHash: '',
    madrinhasColors: ['#C21E56', '#8B0044', '#E0115F']
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        mainText: settings.mainText || '',
        mimoText: settings.mimoText || '',
        passwordEnabled: settings.passwordEnabled || false,
        passwordHash: settings.passwordHash || '',
        madrinhasColors: settings.madrinhasColors || ['#C21E56', '#8B0044', '#E0115F']
      });
    }
  }, [settings]);

  const handleSaveSettings = () => {
    setLoading(true);
    setDocumentNonBlocking(settingsRef, {
      ...formData,
      id: 'main_settings',
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    toast({
      title: "Manual atualizado",
      description: "As configurações foram salvas com sucesso.",
    });
    setLoading(false);
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>, type: 'madrinhas' | 'padrinhos') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const newImg = {
        type,
        imageUrl: base64,
        order_index: (images?.length || 0) + 1,
        createdAt: new Date().toISOString()
      };
      addDocumentNonBlocking(collection(db, 'manual_images'), newImg);
      toast({ title: "Imagem enviada" });
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteImage = (id: string) => {
    deleteDocumentNonBlocking(doc(db, 'manual_images', id));
    toast({ title: "Imagem removida" });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-headline text-gold">Manual dos Padrinhos</h1>
        <p className="text-muted-foreground font-light">Personalize o espaço exclusivo para seus padrinhos e madrinhas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Configs */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Textos do Manual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mensagem Principal</Label>
                <Textarea 
                  className="min-h-[150px]"
                  value={formData.mainText}
                  onChange={(e) => setFormData({...formData, mainText: e.target.value})}
                  placeholder="A mensagem carinhosa de entrada..."
                />
              </div>
              <div className="space-y-2">
                <Label>Texto do Mimo</Label>
                <Textarea 
                  value={formData.mimoText}
                  onChange={(e) => setFormData({...formData, mimoText: e.target.value})}
                  placeholder="Descrição das lembranças..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Galeria de Inspirações</CardTitle>
              <CardDescription>Madrinhas (Fúcsia)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                {images?.filter(img => img.type === 'madrinhas').map(img => (
                  <div key={img.id} className="aspect-[3/4] relative rounded-lg overflow-hidden group">
                    <Image src={img.imageUrl} fill className="object-cover" alt="Inspiração" />
                    <button 
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="aspect-[3/4] border-2 border-dashed border-primary/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors">
                  <Upload className="h-6 w-6 text-gold/40" />
                  <span className="text-[10px] mt-2">Adicionar</span>
                  <input type="file" className="hidden" onChange={(e) => handleUploadImage(e, 'madrinhas')} />
                </label>
              </div>
            </CardContent>
          </Card>

           <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Paleta de Cores</CardTitle>
              <CardDescription>Tons para as Madrinhas</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              {formData.madrinhasColors.map((color, i) => (
                <div key={i} className="space-y-2">
                  <div className="w-12 h-12 rounded-full border border-primary/10" style={{ backgroundColor: color }}></div>
                  <Input 
                    value={color} 
                    className="w-24 text-xs h-8" 
                    onChange={(e) => {
                      const newColors = [...formData.madrinhasColors];
                      newColors[i] = e.target.value;
                      setFormData({...formData, madrinhasColors: newColors});
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Security & Save */}
        <div className="space-y-8">
          <Card className="border-primary/10 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Segurança</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label>Proteger com senha?</Label>
                <Switch 
                  checked={formData.passwordEnabled} 
                  onCheckedChange={(val) => setFormData({...formData, passwordEnabled: val})}
                />
              </div>
              {formData.passwordEnabled && (
                <div className="space-y-2">
                  <Label>Senha de Acesso</Label>
                  <Input 
                    placeholder="Ex: padrinhos2026" 
                    value={formData.passwordHash}
                    onChange={(e) => setFormData({...formData, passwordHash: e.target.value})}
                  />
                  <p className="text-[10px] text-muted-foreground">Esta senha será pedida ao clicar em "Espaço dos Padrinhos".</p>
                </div>
              )}
              <Button onClick={handleSaveSettings} className="w-full bg-gold hover:bg-gold/90" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar Manual
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg">Visualização</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-gold text-gold" asChild>
                <a href="/padrinhos" target="_blank">Ver como convidado</a>
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
