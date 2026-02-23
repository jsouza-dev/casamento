
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Gift, Settings as SettingsIcon, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="space-y-8 p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-headline text-gold">Painel Administrativo</h1>
          <p className="text-muted-foreground font-light">Olá, Felipe e Rayssa! Aqui estão os detalhes do seu grande dia.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/rsvps">
          <Card className="hover:border-primary/40 transition-colors cursor-pointer border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Confirmações</CardTitle>
              <Users className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">124</div>
              <p className="text-xs text-muted-foreground">+12 desde ontem</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/gifts">
          <Card className="hover:border-primary/40 transition-colors cursor-pointer border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Presentes Recebidos</CardTitle>
              <Gift className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">R$ 12.450,00 total</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/messages">
          <Card className="hover:border-primary/40 transition-colors cursor-pointer border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Assistente de IA</CardTitle>
              <MessageSquare className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gerar</div>
              <p className="text-xs text-muted-foreground">Criar mensagens personalizadas</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/settings">
          <Card className="hover:border-primary/40 transition-colors cursor-pointer border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Configurações</CardTitle>
              <SettingsIcon className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Editar</div>
              <p className="text-xs text-muted-foreground">Local, data e links</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="text-xl font-headline text-gold">Últimos RSVPs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Mariana Silva", status: "Confirmado", guests: 2 },
              { name: "João Pedro", status: "Confirmado", guests: 1 },
              { name: "Beatriz Oliveira", status: "Não poderá ir", guests: 0 },
            ].map((rsvp, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b last:border-0 border-primary/5">
                <div>
                  <p className="font-medium">{rsvp.name}</p>
                  <p className="text-xs text-muted-foreground">{rsvp.guests} acompanhante(s)</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${rsvp.status === 'Confirmado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {rsvp.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="text-xl font-headline text-gold">Presentes Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { from: "Ricardo Santos", item: "Cafeteira Nespresso", date: "Há 2 horas" },
              { from: "Ana Luiza", item: "Smart TV 55\"", date: "Há 5 horas" },
              { from: "Família Barbosa", item: "Cota Lua de Mel", date: "Ontem" },
            ].map((gift, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b last:border-0 border-primary/5">
                <div>
                  <p className="font-medium">{gift.item}</p>
                  <p className="text-xs text-muted-foreground">De: {gift.from}</p>
                </div>
                <span className="text-xs text-muted-foreground italic">
                  {gift.date}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
