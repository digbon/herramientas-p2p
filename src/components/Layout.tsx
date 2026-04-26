import React from 'react';
import { Home, Calculator, Settings, Wallet, History, BarChart3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Logo } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'historial', icon: History, label: 'Historial' },
    { id: 'balance', icon: Wallet, label: 'Balance' },
    { id: 'estadisticas', icon: BarChart3, label: 'Estadísticas' },
    { id: 'simulador', icon: Calculator, label: 'Simulador' },
    { id: 'ajustes', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20">
      <div className="max-w-md mx-auto min-h-screen relative bg-slate-950 sm:border-x sm:border-slate-800 flex flex-col shadow-2xl">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
          <Logo className="drop-shadow-sm" />
          <h1 className="font-bold tracking-tight text-white">Herramientas P2P</h1>
        </header>

        <main className="flex-1 w-full p-4 overflow-y-auto">
          {children}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_10px_rgba(0,0,0,0.5)] overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="max-w-md mx-auto flex items-center justify-between px-1 h-16 sm:border-x sm:border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[64px] flex-1 h-full shrink-0 transition-colors",
                  isActive ? "text-blue-500" : "text-slate-500 hover:text-slate-400"
                )}
              >
                <Icon className="w-5 h-5 mb-1" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] font-medium truncate max-w-[60px] text-center">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
