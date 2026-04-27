import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Clock, 
  ChevronRight,
  Plus,
  ArrowRightLeft
} from 'lucide-react';
import { useAppStore, PaymentMethod } from '../store';
import { getAccountBalance } from '../lib/balance';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export function Dashboard({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const store = useAppStore();
  
  const totalFiat = store.paymentMethods
    .filter((pm: PaymentMethod) => pm.currency === store.baseFiat && pm.ownerType !== 'Cliente')
    .reduce((acc, pm: PaymentMethod) => acc + getAccountBalance(pm.id, store), 0);
    
  const totalCrypto = store.paymentMethods
    .filter((pm: PaymentMethod) => pm.currency === store.baseCrypto && pm.ownerType !== 'Cliente')
    .reduce((acc, pm: PaymentMethod) => acc + getAccountBalance(pm.id, store), 0);

  const recentOperations = [...store.operations]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Derive unique active platforms from payment methods
  const activePlatformNames = Array.from(new Set(store.paymentMethods.map((pm: PaymentMethod) => pm.platformChannel)));
  const activePlatformsMetrics = activePlatformNames.map(name => {
    const linkedPMs = store.paymentMethods.filter((pm: PaymentMethod) => pm.platformChannel === name);
    return {
      name,
      // naive mapping to color fiat/crypto
      type: linkedPMs.some(pm => store.currencies.find(c => c.symbol === pm.currency)?.type === 'Fiat') ? 'Fiat' : 'Crypto',
      linkedAccounts: linkedPMs
    };
  })
  .filter(p => p.linkedAccounts.length > 0)
  .sort((a, b) => b.linkedAccounts.length - a.linkedAccounts.length)
  .slice(0, 4);

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 pb-20 sm:pb-4 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-500 text-sm font-medium">Resumen de tu operativa P2P</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sistema En Línea</span>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard 
          icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
          label="Balance Fiat Total"
          value={totalFiat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          symbol={store.baseFiat}
          trend="+2.4%"
          color="purple"
        />
        <StatCard 
          icon={<TrendingDown className="w-5 h-5 text-teal-400" />}
          label="Balance Crypto Total"
          value={totalCrypto.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
          symbol={store.baseCrypto}
          trend="-0.8%"
          color="teal"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Activity className="w-3 h-3" /> Operaciones Recientes
            </h3>
            <button className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-wider">Ver Todo</button>
          </div>
          
          <div className="space-y-3">
            {recentOperations.length > 0 ? (
              recentOperations.map(op => (
                <div key={op.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center justify-between group hover:bg-slate-900/60 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                      op.type === 'Compra' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {op.type === 'Compra' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{op.clientName || 'Operación P2P'}</span>
                        <span className={cn(
                          "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter",
                          op.type === 'Compra' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                        )}>{op.type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                        <Clock className="w-3 h-3" />
                         {format(new Date(op.date), 'dd MMM, HH:mm')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white tracking-tight">
                      {op.amountReceived.toLocaleString()} {op.destCurrency}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      @ {op.price.toLocaleString()} {op.sourceCurrency}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-2xl py-12 flex flex-col items-center justify-center text-center space-y-2 opacity-50">
                <ArrowRightLeft className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Sin Operaciones</p>
                <p className="text-xs text-slate-600 max-w-[200px]">Registra tu primera operación para ver estadísticas aquí.</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Platforms Widget */}
        <div className="space-y-4">
          <div className="px-1">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Wallet className="w-3 h-3" /> Canales Activos
            </h3>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="space-y-4">
              {activePlatformsMetrics.map(p => (
                <div key={p.name} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      p.type === 'Fiat' ? "bg-purple-500" : "bg-teal-500"
                    )} />
                    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                      {p.linkedAccounts.length} medios
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-slate-400 transition-colors" />
                  </div>
                </div>
              ))}
              {activePlatformsMetrics.length === 0 && (
                <p className="text-[10px] text-slate-600 italic text-center py-4">No hay canales con cuentas vinculadas.</p>
              )}
            </div>
            
            <div className="pt-6 border-t border-slate-800">
              <button 
                onClick={() => onNavigate?.('balance')}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                <Plus className="w-3 h-3" /> Configurar Métodos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  symbol: string;
  trend: string;
  color: 'purple' | 'teal';
}

function StatCard({ icon, label, value, symbol, trend, color }: StatCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
      <div className={cn(
        "absolute -right-8 -top-8 w-32 h-32 rounded-full blur-[60px] opacity-20 transition-opacity group-hover:opacity-30",
        color === 'purple' ? "bg-purple-600" : "bg-teal-600"
      )} />
      
      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
            {icon}
          </div>
          <div className={cn(
            "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter",
            trend.startsWith('+') ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          )}>
            {trend}
          </div>
        </div>
        
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tighter">{value}</span>
            <span className="text-sm font-bold text-slate-500 uppercase">{symbol}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
