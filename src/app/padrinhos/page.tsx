'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Monogram } from '@/components/Monogram';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { Input } from '@/components/ui/input';

export default function ManualPadrinhosPage() {
  const db = useFirestore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  // Fetch settings
  const settingsRef = useMemoFirebase(() => doc(db, 'manual_settings', 'main_settings'), [db]);
  const { data: settings, isLoading: loadingSettings } = useDoc(settingsRef);

  // Fetch images
  const imagesQuery = useMemoFirebase(() => query(collection(db, 'manual_images'), orderBy('order_index', 'asc')), [db]);
  const { data: allImages } = useCollection(imagesQuery);

  const madrinhasImages = allImages?.filter(img => img.type === 'madrinhas') || [];
  const padrinhosImages = allImages?.filter(img => img.type === 'padrinhos') || [];

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('padrinhos_auth');
    if (savedAuth === 'true' || !settings?.passwordEnabled) {
      setIsAuthenticated(true);
    }
  }, [settings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === settings?.passwordHash) {
      setIsAuthenticated(true);
      sessionStorage.setItem('padrinhos_auth', 'true');
      setError(false);
    } else {
      setError(true);
    }
  };

  if (loadingSettings) {
    return (
      <div className="min-h-screen bg-[#F8F6F2] flex items-center justify-center">
        <div className="animate-pulse font-headline text-gold text-xl italic">Carregando manual...</div>
      </div>
    );
  }

  if (settings?.passwordEnabled && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F6F2] flex flex-col items-center justify-center p-6 text-center">
        <Monogram className="mb-8" />
        <div className="max-w-sm w-full space-y-6 animate-in fade-in zoom-in duration-700">
          <div className="space-y-2">
            <h1 className="text-2xl font-headline text-gold">Área dos Padrinhos</h1>
            <p className="text-sm text-muted-foreground font-light italic">Insira a senha fornecida pelos noivos para acessar seu manual.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              type="password" 
              placeholder="Senha de acesso" 
              className="text-center bg-white border-primary/10 focus:ring-primary/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-xs text-destructive">Senha incorreta. Tente novamente.</p>}
            <Button type="submit" className="w-full bg-gold hover:bg-gold/90 text-white rounded-full">
              Acessar Manual
            </Button>
          </form>
          <Link href="/" className="text-xs text-muted-foreground hover:text-gold flex items-center justify-center gap-1 transition-colors">
            <ArrowLeft className="h-3 w-3" /> Voltar ao convite
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F2] selection:bg-primary/20">
      {/* Header Floating */}
      <div className="fixed top-6 left-6 z-50">
        <Button variant="ghost" size="sm" asChild className="text-gold hover:bg-gold/5 bg-white/50 backdrop-blur-sm rounded-full border border-primary/10">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
        </Button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-24 space-y-32">
        
        {/* Section 1: Capa */}
        <section className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-12 animate-in fade-in duration-1000">
          <div className="space-y-4">
            <p className="text-xs tracking-[0.5em] uppercase text-muted-foreground/60 font-light">Especialmente para vocês</p>
            <h1 className="text-5xl md:text-7xl font-headline text-gold leading-tight">
              Manual dos<br />padrinhos
            </h1>
          </div>
          <Monogram showDate />
        </section>

        {/* Section 2: Mensagem */}
        <section className="text-center space-y-8 max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="space-y-6 text-muted-foreground font-light leading-relaxed">
            {settings?.mainText ? (
              <p className="text-lg italic whitespace-pre-wrap">{settings.mainText}</p>
            ) : (
              <>
                <p className="text-lg italic">
                  Existem pessoas que o tempo não apaga e que a vida só faz confirmar. Escolhemos vocês porque o companheirismo e o carinho que compartilhamos são tesouros que queremos levar para sempre.
                </p>
                <p className="text-lg italic">
                  Mais do que testemunhas, queremos vocês ao nosso lado em todos os capítulos da nossa história. Obrigado por serem as pessoas com quem sabemos que podemos contar por toda a vida!
                </p>
              </>
            )}
          </div>
          <div className="pt-4">
             <p className="text-gold font-headline text-xl italic leading-relaxed">
               "Grandes coisas fez o Senhor por nós, por isso estamos alegres."
               <br />
               <span className="text-xs not-italic text-primary/60 tracking-widest">(Salmo 126:3)</span>
             </p>
          </div>
          <Monogram />
        </section>

        {/* Section 3: Madrinhas */}
        <section className="space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-headline text-gold italic">Inspiração para as madrinhas</h2>
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground/60">{settings?.madrinhasSubtitle || 'Fúcsia'}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {madrinhasImages.length > 0 ? (
              madrinhasImages.map((img) => (
                <div key={img.id} className="aspect-[3/4] relative rounded-2xl overflow-hidden border border-primary/5 shadow-sm group">
                  <Image src={img.imageUrl} fill className="object-cover group-hover:scale-105 transition-transform duration-700" alt="Inspiração Madrinha" />
                </div>
              ))
            ) : (
              [1,2,3].map(i => (
                <div key={i} className="aspect-[3/4] relative rounded-2xl overflow-hidden bg-muted border border-primary/5">
                   <Image src={`https://picsum.photos/seed/madrinha${i}/400/600`} fill className="object-cover" alt="Placeholder Madrinha" />
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col items-center space-y-6">
            <p className="text-sm font-light text-muted-foreground italic">Nossa Paleta de Cores</p>
            <div className="flex gap-4">
              {[
                { hex: settings?.madrinhasColors?.primary || '#C21E56', label: 'Vibrante' },
                { hex: settings?.madrinhasColors?.secondary || '#8B0044', label: 'Fechado' },
                { hex: settings?.madrinhasColors?.third || settings?.madrinhasColors?.tertiary || '#E0115F', label: 'Suave' }
              ].map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: color.hex }}></div>
                  <span className="text-[10px] uppercase tracking-tighter text-muted-foreground/60">{color.label}</span>
                </div>
              ))}
            </div>
          </div>
          <Monogram />
        </section>

        {/* Section 4: Padrinhos */}
        <section className="space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-headline text-gold italic">Inspiração para os padrinhos</h2>
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground/60">{settings?.padrinhosSubtitle || 'Cinza + branco + fúcsia'}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {padrinhosImages.length > 0 ? (
              padrinhosImages.map((img) => (
                <div key={img.id} className="aspect-[3/4] relative rounded-2xl overflow-hidden border border-primary/5 shadow-sm group">
                  <Image src={img.imageUrl} fill className="object-cover group-hover:scale-105 transition-transform duration-700" alt="Inspiração Padrinho" />
                </div>
              ))
            ) : (
              <div className="col-span-full max-w-md mx-auto aspect-square relative rounded-3xl overflow-hidden border border-primary/5 shadow-sm">
                <Image 
                  src="https://images.unsplash.com/photo-1594932224828-b4b059b6f68e?q=80&w=800&auto=format&fit=crop" 
                  fill 
                  className="object-cover" 
                  alt="Inspiração Padrinhos" 
                />
              </div>
            )}
          </div>

          <div className="flex flex-col items-center space-y-6">
            <p className="text-sm font-light text-muted-foreground italic">Referência do Traje</p>
            <div className="flex gap-6">
              {[
                { hex: settings?.padrinhosColors?.primary || '#4A4A4A', label: 'Terno' },
                { hex: settings?.padrinhosColors?.neutral || '#FFFFFF', label: 'Camisa' },
                { hex: settings?.padrinhosColors?.accent || '#C21E56', label: 'Gravata' }
              ].map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: color.hex }}></div>
                  <span className="text-[10px] uppercase tracking-tighter text-muted-foreground/60">{color.label}</span>
                </div>
              ))}
            </div>
          </div>
          <Monogram />
        </section>

        {/* Section 5: Mimo */}
        <section className="bg-primary/5 rounded-[3rem] p-12 text-center space-y-8 border border-primary/10">
          <h2 className="text-3xl font-headline text-gold">Preparamos um mimo...</h2>
          <div className="space-y-6 font-light text-muted-foreground leading-relaxed">
            {settings?.mimoText ? (
              <p className="italic whitespace-pre-wrap">{settings.mimoText}</p>
            ) : (
              <>
                <p className="italic">Como forma de agradecer por aceitarem caminhar conosco, escolhemos um pequeno detalhe:</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-gold font-medium uppercase tracking-widest text-xs mb-1">Para as Madrinhas</p>
                    <p className="italic">Um porta-joias para guardar memórias preciosas.</p>
                  </div>
                  <div className="w-8 h-[1px] bg-gold/20 mx-auto"></div>
                  <div>
                    <p className="text-gold font-medium uppercase tracking-widest text-xs mb-1">Para os Padrinhos</p>
                    <p className="italic">A gravata para ser usada em nosso dia.</p>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="pt-8">
            <p className="font-headline text-2xl text-gold italic">Com amor, Felipe & Rayssa</p>
          </div>
          <Monogram />
        </section>

        {/* Footer */}
        <footer className="text-center pt-12 pb-12">
          <p className="text-[10px] tracking-[0.5em] uppercase text-muted-foreground/40 font-light">Felipe Augusto & Rayssa Caldeira • 2026</p>
        </footer>
      </div>
    </div>
  );
}
