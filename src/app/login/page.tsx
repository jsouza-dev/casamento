
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, initiateEmailSignIn } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      router.push('/admin');
    }
  }, [user, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Using the non-blocking sign in pattern as recommended
    initiateEmailSignIn(auth, email, password);
    
    // We'll give it a moment to show loading state
    // The redirect happens in the useEffect above when user state changes
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] flex flex-col items-center justify-center p-6">
      <Link href="/" className="absolute top-8 left-8 text-gold flex items-center gap-2 hover:opacity-80 transition-opacity">
        <ArrowLeft className="h-4 w-4" /> Voltar ao site
      </Link>

      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center">
              <Heart className="text-white h-6 w-6 fill-white/20" />
            </div>
          </div>
          <h1 className="text-3xl font-headline text-gold">Acesso ao Painel</h1>
          <p className="text-muted-foreground font-light">Bem-vindos, Felipe e Rayssa!</p>
        </div>

        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Entrar</CardTitle>
            <CardDescription>Use suas credenciais administrativas</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-primary/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-primary/10"
                />
              </div>
              <Button type="submit" className="w-full bg-gold hover:bg-gold/90 text-white" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar no Painel'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
