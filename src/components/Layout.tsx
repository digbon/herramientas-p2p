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
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-screen sticky top-0 shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <Logo className="drop-shadow-sm w-8 h-8" />
          <h1 className="font-bold tracking-tight text-white text-lg">Herramientas P2P</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left",
                  isActive 
                    ? "bg-blue-600/10 text-blue-500 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.2)]" 
                    : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                <span className="font-semibold text-sm">{tab.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/50 sticky top-0 z-30 backdrop-blur-md">
          <Logo className="drop-shadow-sm" />
          <h1 className="font-bold tracking-tight text-white">Herramientas P2P</h1>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_10px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between px-2 h-16 max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full min-w-0 transition-colors",
                  isActive ? "text-blue-500" : "text-slate-500"
                )}
              >
                <Icon className={cn("w-5 h-5 mb-1 shrink-0", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                <span className="text-[10px] font-bold truncate px-1">{tab.label}</span>
                {isActive && <div className="mt-0.5 w-1 h-1 rounded-full bg-blue-500" />}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
