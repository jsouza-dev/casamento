'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Upload, Trash2, Loader2, Image as ImageIcon, Palette, Type, Shield, GalleryHorizontal } from 'lucide-react';
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
    madrinhasSubtitle: 'Fúcsia',
    padrinhosSubtitle: 'Cinza + branco + fúcsia',
    passwordEnabled: false,
    passwordHash: '',
    madrinhasColors: {
      primary: '#C21E56',
      secondary: '#8B0044',
      tertiary: '#E0115F'
    },
    padrinhosColors: {
      primary: '#4A4A4A',
      neutral: '#FFFFFF',
      accent: '#C21E56'
    },
    coverImageUrl: ''
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        mainText: settings.mainText || '',
        mimoText: settings.mimoText || '',
        madrinhasSubtitle: settings.madrinhasSubtitle || 'Fúcsia',
        padrinhosSubtitle: settings.padrinhosSubtitle || 'Cinza + branco + fúcsia',
        passwordEnabled: settings.passwordEnabled || false,
        passwordHash: settings.passwordHash || '',
        madrinhasColors: settings.madrinhasColors || { primary: '#C21E56', secondary: '#8B0044', tertiary: '#E0115F' },
        padrinhosColors: settings.padrinhosColors || { primary: '#4A4A4A', neutral: '#FFFFFF', accent: '#C21E56' },
        coverImageUrl: settings.coverImageUrl || ''
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
      description: "Todas as configurações foram salvas com sucesso.",
    });
    setLoading(false);
  };

  const handleUploadGallery = (e: React.ChangeEvent<HTMLInputElement>, type: 'madrinhas' | 'padrinhos') => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const newImg = {
          type,
          imageUrl: base64,
          order_index: (images?.filter(img => img.type === type).length || 0) + 1,
          createdAt: new Date().toISOString()
        };
        addDocumentNonBlocking(collection(db, 'manual_images'), newImg);
      };
      reader.readAsDataURL(file);
    });
    toast({ title: "Imagens enviadas com sucesso" });
  };

  const handleUploadCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData(prev => ({ ...prev, coverImageUrl: base64 }));
      toast({ title: "Capa atualizada" });
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteImage = (id: string) => {
    deleteDocumentNonBlocking(doc(db, 'manual_images', id));
    toast({ title: "Imagem removida" });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline text-gold">Gerenciar Manual</h1>
          <p className="text-muted-foreground font-light">Configure cada detalhe do espaço dos seus padrinhos.</p>
        </div>
        <Button onClick={handleSaveSettings} className="bg-gold hover:bg-gold/90" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar Tudo
        </Button>
      </div>

      <Tabs defaultValue="textos" className="space-y-6">
        <TabsList className="bg-primary/5 border border-primary/10">
          <TabsTrigger value="textos" className="gap-2"><Type className="h-4 w-4" /> Textos</TabsTrigger>
          <TabsTrigger value="galerias" className="gap-2"><GalleryHorizontal className="h-4 w-4" /> Galerias</TabsTrigger>
          <TabsTrigger value="paletas" className="gap-2"><Palette className="h-4 w-4" /> Paletas</TabsTrigger>
          <TabsTrigger value="geral" className="gap-2"><Shield className="h-4 w-4" /> Geral & Segurança</TabsTrigger>
        </TabsList>

        {/* Textos */}
        <TabsContent value="textos" className="space-y-6">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Conteúdo Escrito</CardTitle>
              <CardDescription>Ajuste as mensagens e subtítulos das seções.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Mensagem Principal de Abertura</Label>
                <Textarea 
                  className="min-h-[120px]"
                  value={formData.mainText}
                  onChange={(e) => setFormData({...formData, mainText: e.target.value})}
                  placeholder="Texto carinhoso de introdução..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Subtítulo Madrinhas</Label>
                  <Input 
                    value={formData.madrinhasSubtitle}
                    onChange={(e) => setFormData({...formData, madrinhasSubtitle: e.target.value})}
                    placeholder="Ex: Fúcsia"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtítulo Padrinhos</Label>
                  <Input 
                    value={formData.padrinhosSubtitle}
                    onChange={(e) => setFormData({...formData, padrinhosSubtitle: e.target.value})}
                    placeholder="Ex: Cinza + branco + fúcsia"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Texto da Seção de Mimos</Label>
                <Textarea 
                  value={formData.mimoText}
                  onChange={(e) => setFormData({...formData, mimoText: e.target.value})}
                  placeholder="Descreva as lembranças especiais..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Galerias */}
        <TabsContent value="galerias" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Galeria Madrinhas */}
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle>Galeria Madrinhas</CardTitle>
                <CardDescription>Inspirações de vestidos e tons.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {images?.filter(img => img.type === 'madrinhas').map(img => (
                    <div key={img.id} className="aspect-[3/4] relative rounded-lg overflow-hidden group border border-primary/5">
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
                    <span className="text-[10px] mt-2">Upload</span>
                    <input type="file" multiple className="hidden" onChange={(e) => handleUploadGallery(e, 'madrinhas')} />
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Galeria Padrinhos */}
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle>Galeria Padrinhos</CardTitle>
                <CardDescription>Inspirações de trajes e acessórios.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {images?.filter(img => img.type === 'padrinhos').map(img => (
                    <div key={img.id} className="aspect-[3/4] relative rounded-lg overflow-hidden group border border-primary/5">
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
                    <span className="text-[10px] mt-2">Upload</span>
                    <input type="file" multiple className="hidden" onChange={(e) => handleUploadGallery(e, 'padrinhos')} />
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Paletas */}
        <TabsContent value="paletas" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle>Paleta Madrinhas</CardTitle>
                <CardDescription>Defina os tons dos vestidos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(formData.madrinhasColors).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-primary/10 shadow-sm shrink-0" style={{ backgroundColor: value }}></div>
                    <div className="flex-1 space-y-1">
                      <Label className="capitalize">{key === 'primary' ? 'Vibrante' : key === 'secondary' ? 'Fechado' : 'Suave'}</Label>
                      <Input 
                        type="color" 
                        value={value} 
                        className="h-10 p-1"
                        onChange={(e) => setFormData({
                          ...formData, 
                          madrinhasColors: {...formData.madrinhasColors, [key]: e.target.value}
                        })}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle>Paleta Padrinhos</CardTitle>
                <CardDescription>Defina os tons do traje.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-primary/10 shadow-sm shrink-0" style={{ backgroundColor: formData.padrinhosColors.primary }}></div>
                  <div className="flex-1 space-y-1">
                    <Label>Cor do Terno (Cinza)</Label>
                    <Input 
                      type="color" 
                      value={formData.padrinhosColors.primary} 
                      className="h-10 p-1"
                      onChange={(e) => setFormData({
                        ...formData, 
                        padrinhosColors: {...formData.padrinhosColors, primary: e.target.value}
                      })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-primary/10 shadow-sm shrink-0" style={{ backgroundColor: formData.padrinhosColors.neutral }}></div>
                  <div className="flex-1 space-y-1">
                    <Label>Cor da Camisa (Branco)</Label>
                    <Input 
                      type="color" 
                      value={formData.padrinhosColors.neutral} 
                      className="h-10 p-1"
                      onChange={(e) => setFormData({
                        ...formData, 
                        padrinhosColors: {...formData.padrinhosColors, neutral: e.target.value}
                      })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-primary/10 shadow-sm shrink-0" style={{ backgroundColor: formData.padrinhosColors.accent }}></div>
                  <div className="flex-1 space-y-1">
                    <Label>Destaque (Gravata Fúcsia)</Label>
                    <Input 
                      type="color" 
                      value={formData.padrinhosColors.accent} 
                      className="h-10 p-1"
                      onChange={(e) => setFormData({
                        ...formData, 
                        padrinhosColors: {...formData.padrinhosColors, accent: e.target.value}
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Geral & Segurança */}
        <TabsContent value="geral" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle>Imagem de Capa</CardTitle>
                <CardDescription>Imagem principal do manual.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.coverImageUrl ? (
                  <div className="aspect-[3/4] relative rounded-xl overflow-hidden border border-primary/10">
                    <Image src={formData.coverImageUrl} fill className="object-cover" alt="Capa" />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 rounded-full h-8 w-8"
                      onClick={() => setFormData({...formData, coverImageUrl: ''})}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="aspect-[3/4] border-2 border-dashed border-primary/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors">
                    <ImageIcon className="h-12 w-12 text-gold/30 mb-2" />
                    <span className="text-sm text-muted-foreground">Upload Imagem de Capa</span>
                    <input type="file" className="hidden" onChange={handleUploadCover} />
                  </label>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/10 bg-primary/5">
              <CardHeader>
                <CardTitle>Privacidade</CardTitle>
                <CardDescription>Proteja o acesso ao manual.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label>Ativar Senha de Acesso</Label>
                  <Switch 
                    checked={formData.passwordEnabled} 
                    onCheckedChange={(val) => setFormData({...formData, passwordEnabled: val})}
                  />
                </div>
                {formData.passwordEnabled && (
                  <div className="space-y-2">
                    <Label>Senha do Manual</Label>
                    <Input 
                      placeholder="Ex: padrinhos2026" 
                      value={formData.passwordHash}
                      onChange={(e) => setFormData({...formData, passwordHash: e.target.value})}
                    />
                  </div>
                )}
                <div className="pt-4 border-t border-primary/10">
                  <Button variant="outline" className="w-full border-gold text-gold" asChild>
                    <a href="/padrinhos" target="_blank">Pré-visualizar Manual</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
