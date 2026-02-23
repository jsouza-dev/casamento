
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Gift, Settings, MessageSquare, ArrowLeft, BookHeart, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">FR</span>
          </div>
          <span className="font-headline text-gold text-base">Painel Casal</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 p-6 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 md:flex",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="hidden md:flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
            <span className="text-white text-xs font-bold">FR</span>
          </div>
          <span className="font-headline text-gold text-lg">Admin Casamento</span>
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
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

        <div className="pt-6 border-t border-neutral-100 mt-auto">
          <Button variant="ghost" size="sm" asChild className="w-full justify-start text-neutral-500 hover:text-gold">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Ver Convite
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-neutral-50 min-h-[calc(100vh-65px)] md:min-h-screen">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
