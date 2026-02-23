
'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Heart, Gift, Users, ExternalLink, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RSVPForm } from '@/components/RSVPForm';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface InvitationContentProps {
  onBack: () => void;
}

export function InvitationContent({ onBack }: InvitationContentProps) {
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-24 md:space-y-32 bg-[#F8F6F2]">
      
      {/* Back Button */}
      <div className="flex justify-start">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="text-gold hover:text-gold/80 hover:bg-gold/5"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao início
        </Button>
      </div>

      {/* Event Details Section */}
      <section 
        ref={(el) => { sectionRefs.current[0] = el; }}
        className="fade-in-section text-center space-y-8"
      >
        <div className="space-y-4">
          <h2 className="text-4xl font-headline text-gold">O Grande Dia</h2>
          <div className="thin-divider mx-auto w-24 opacity-40"></div>
          <p className="text-lg font-light text-muted-foreground italic">
            "Será uma alegria celebrar esse momento tão especial ao seu lado."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          <div className="flex flex-col items-center space-y-3">
            <div className="p-4 rounded-full bg-primary/5 border border-primary/10">
              <Calendar className="h-6 w-6 text-gold" />
            </div>
            <h3 className="font-headline text-xl">Data</h3>
            <p className="font-light">21 de Março de 2026</p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="p-4 rounded-full bg-primary/5 border border-primary/10">
              <Clock className="h-6 w-6 text-gold" />
            </div>
            <h3 className="font-headline text-xl">Horário</h3>
            <p className="font-light">16:30h</p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="p-4 rounded-full bg-primary/5 border border-primary/10">
              <MapPin className="h-6 w-6 text-gold" />
            </div>
            <h3 className="font-headline text-xl">Local</h3>
            <p className="font-light">Espaço Fazenda Paradiso<br />Contagem – Minas Gerais</p>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section 
        ref={(el) => { sectionRefs.current[1] = el; }}
        className="fade-in-section space-y-8 text-center"
      >
        <h2 className="text-3xl font-headline text-gold">Localização</h2>
        <div className="rounded-2xl overflow-hidden border border-primary/10 shadow-sm aspect-video w-full max-w-2xl mx-auto">
          <iframe
            src="https://www.google.com/maps?q=Espaço+Fazenda+Paradiso+Contagem+MG&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        <Button 
          variant="outline" 
          asChild 
          className="border-primary/20 text-gold hover:bg-primary/5 hover:text-gold"
        >
          <a href="https://www.google.com/maps/place/Espa%C3%A7o+Fazenda+Paradiso" target="_blank" rel="noopener noreferrer">
            <MapPin className="mr-2 h-4 w-4" /> Ver rota no Google Maps
          </a>
        </Button>
      </section>

      {/* RSVP Section */}
      <section 
        ref={(el) => { sectionRefs.current[2] = el; }}
        className="fade-in-section space-y-8 max-w-xl mx-auto"
      >
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-headline text-gold">Confirme sua presença</h2>
          <p className="font-light text-muted-foreground text-xl">
            Por favor, realize sua confirmação até o dia <span className="font-bold text-gold border-b border-gold/30 pb-1">14 de Março de 2026</span>.
          </p>
        </div>
        <RSVPForm />
      </section>

      {/* Gifts Section */}
      <section 
        ref={(el) => { sectionRefs.current[3] = el; }}
        className="fade-in-section space-y-12"
      >
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-headline text-gold">Lista de Presentes</h2>
          <p className="font-light text-muted-foreground max-w-lg mx-auto">
            Sua presença é o nosso maior presente, mas se desejar nos presentear, aqui estão algumas sugestões para o nosso novo lar.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { id: 'gift-coffee', name: 'Cafeteira Nespresso', desc: 'Para nossas manhãs de café juntos.', price: 'R$ 450,00' },
            { id: 'gift-tv', name: 'Smart TV 55"', desc: 'Para nossas maratonas de cinema.', price: 'R$ 2.800,00' },
            { id: 'gift-fridge', name: 'Geladeira Inox', desc: 'Um clássico indispensável.', price: 'R$ 3.500,00' },
            { id: 'gift-honeymoon', name: 'Jantar Romântico', desc: 'Um momento especial em nossa lua de mel.', price: 'R$ 300,00' }
          ].map((gift) => {
            const img = PlaceHolderImages.find(p => p.id === gift.id);
            return (
              <Card key={gift.id} className="border-primary/10 shadow-none overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square relative overflow-hidden bg-muted">
                  <Image 
                    src={img?.imageUrl || 'https://picsum.photos/400/400'} 
                    alt={gift.name}
                    fill
                    className="object-cover"
                    data-ai-hint={img?.imageHint || 'gift'}
                  />
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-headline text-lg">{gift.name}</h3>
                    <p className="text-sm font-light text-muted-foreground leading-relaxed">{gift.desc}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-medium text-gold">{gift.price}</span>
                    <Button variant="ghost" size="sm" className="text-gold hover:text-gold hover:bg-primary/5">
                      Presentear <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Groomsmen Section */}
      <section 
        ref={(el) => { sectionRefs.current[4] = el; }}
        className="fade-in-section py-16 px-8 rounded-3xl bg-primary/5 border border-primary/10 text-center space-y-6"
      >
        <Users className="h-10 w-10 text-gold mx-auto" />
        <div className="space-y-4">
          <h2 className="text-3xl font-headline text-gold">Espaço dos Padrinhos</h2>
          <p className="font-light text-muted-foreground max-w-lg mx-auto italic">
            "Você foi escolhido(a) para caminhar conosco como padrinho ou madrinha?"
          </p>
          <p className="text-sm font-light text-muted-foreground">Preparamos um espaço exclusivo com informações especiais para vocês.</p>
        </div>
        <Button 
          variant="outline" 
          className="border-primary/20 text-gold hover:bg-gold hover:text-white"
        >
          Acessar Espaço dos Padrinhos
        </Button>
      </section>

      {/* Footer */}
      <footer className="text-center pt-12 pb-24 space-y-6 opacity-60">
        <div className="space-y-2">
          <p className="font-headline text-xl text-gold italic">Felipe & Rayssa</p>
          <p className="text-xs tracking-widest uppercase font-light">21.03.2026</p>
        </div>
        <div className="pt-8">
          <Button variant="ghost" size="sm" asChild className="text-[10px] text-muted-foreground hover:text-gold uppercase tracking-tighter gap-1">
            <Link href="/login">
              <Lock className="h-3 w-3" /> Painel do Casal
            </Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}
