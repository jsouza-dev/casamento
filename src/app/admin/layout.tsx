
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Gift, Settings, MessageSquare, ArrowLeft, BookHeart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/rsvps', icon: Users, label: 'RSVPs' },
  { href: '/admin/gifts', icon: Gift, label: 'Presentes' },
  { href: '/admin/manual-padrinhos', icon: BookHeart, label: 'Manual Padrinhos' },
  { href: '/admin/messages', icon: MessageSquare, label: 'Mensagens IA' },
  { href: '/admin/settings', icon: Settings, label: 'Configurações' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-neutral-200 p-6 space-y-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
            <span className="text-white text-xs font-bold">FR</span>
          </div>
          <span className="font-headline text-gold text-lg">Admin Casamento</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                pathname === item.href 
                  ? "bg-primary/10 text-gold font-medium" 
                  : "text-neutral-500 hover:bg-neutral-100"
              )}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        <div className="pt-8 border-t border-neutral-100">
          <Button variant="ghost" size="sm" asChild className="w-full justify-start text-neutral-500">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Ver Convite
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-neutral-50">
        {children}
      </main>
    </div>
  );
}
