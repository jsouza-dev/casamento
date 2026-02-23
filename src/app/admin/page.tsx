'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Gift, Settings as SettingsIcon, MessageSquare, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminDashboard() {
  const db = useFirestore();

  const rsvpsQuery = useMemoFirebase(() => query(collection(db, 'rsvps'), orderBy('createdAt', 'desc')), [db]);
  const giftsQuery = useMemoFirebase(() => query(collection(db, 'gifts'), orderBy('createdAt', 'desc')), [db]);

  const { data: rsvps, isLoading: loadingRsvps } = useCollection(rsvpsQuery);
  const { data: gifts, isLoading: loadingGifts } = useCollection(giftsQuery);

  const confirmedCount = rsvps?.filter(r => r.isAttending).length || 0;
  const totalGuests = rsvps?.filter(r => r.isAttending).reduce((acc, r) => acc + 1 + (r.numberOfGuests || 0), 0) || 0;
  const giftsTotal = gifts?.reduce((acc, g) => acc + (g.price || 0), 0) || 0;

  const recentRsvps = rsvps?.slice(0, 5) || [];
  const recentGifts = gifts?.slice(0, 5) || [];

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
              <CardTitle className="text-sm font-medium">Convidados Totais</CardTitle>
              <Users className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGuests}</div>
              <p className="text-xs text-muted-foreground">{confirmedCount} confirmações</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/gifts">
          <Card className="hover:border-primary/40 transition-colors cursor-pointer border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Lista de Presentes</CardTitle>
              <Gift className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gifts?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(giftsTotal)}</p>
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
              <p className="text-xs text-muted-foreground">Criar mensagens carinhosas</p>
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
            <CardTitle className="text-xl font-headline text-gold">Últimas Confirmações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingRsvps ? (
               <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gold" /></div>
            ) : recentRsvps.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma confirmação ainda.</p>
            ) : (
              recentRsvps.map((rsvp) => (
                <div key={rsvp.id} className="flex justify-between items-center py-2 border-b last:border-0 border-primary/5">
                  <div>
                    <p className="font-medium">{rsvp.fullName}</p>
                    <p className="text-xs text-muted-foreground">{rsvp.numberOfGuests} acompanhante(s)</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${rsvp.isAttending ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {rsvp.isAttending ? 'Confirmado' : 'Não poderá ir'}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="text-xl font-headline text-gold">Presentes Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingGifts ? (
               <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gold" /></div>
            ) : recentGifts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum presente cadastrado.</p>
            ) : (
              recentGifts.map((gift) => (
                <div key={gift.id} className="flex justify-between items-center py-2 border-b last:border-0 border-primary/5">
                  <div>
                    <p className="font-medium">{gift.name}</p>
                    <p className="text-xs text-muted-foreground">Valor: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(gift.price)}</p>
                  </div>
                  <span className="text-xs text-muted-foreground italic">
                    {formatDistanceToNow(new Date(gift.createdAt), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
