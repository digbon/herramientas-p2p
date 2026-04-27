import React, { useState } from 'react';
import { useAppStore, PaymentMethod } from '../store';
import { Search, Plus, SlidersHorizontal, ArrowUpRight, ArrowDownRight, ArrowRightLeft, User, ChevronDown, Trash2, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { NewOperation } from './NewOperation';

export function History() {
  const store = useAppStore();
  const [timeFilter, setTimeFilter] = useState('Global');
  const [listTab, setListTab] = useState('Operaciones');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white tracking-tight">Historial</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
          <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-full p-1 w-full sm:w-auto">
            {['Día', 'Semana', 'Mes', 'Global'].map((tab) => (
              <button
                key={tab}
                onClick={() => setTimeFilter(tab)}
                className={cn(
                  "flex-1 px-4 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-full transition-all",
                  timeFilter === tab ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
              />
            </div>
            <button className="bg-slate-900 border border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800 p-2.5 rounded-xl transition-all">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="flex gap-4 border-b border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-hide px-4">
           {['Operaciones', 'Depósitos', 'Retiros', 'Transferencias'].map((tab) => {
            const count = tab === 'Operaciones' ? store.operations.length 
              : tab === 'Depósitos' ? store.movements.filter(m => m.type === 'Deposit').length
              : tab === 'Retiros' ? store.movements.filter(m => m.type === 'Withdrawal').length
              : tab === 'Transferencias' ? store.transfers.length : 0;
             
            return (
              <button
                key={tab}
                onClick={() => setListTab(tab)}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-3 text-sm font-bold transition-all border-b-2 min-w-[80px]",
                  listTab === tab ? "border-blue-500 text-blue-500" : "border-transparent text-slate-500 hover:text-slate-300"
                )}
              >
                <span className="text-[10px] uppercase tracking-wider">{tab}</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full border",
                  listTab === tab ? "bg-blue-600 text-white border-blue-500" : "bg-slate-900 border-slate-800 text-slate-500"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        
        <div className="pt-8 text-center text-slate-500 text-sm">
          {listTab === 'Operaciones' && store.operations.length === 0 && "No hay operaciones."}
          {listTab === 'Depósitos' && store.movements.filter(m => m.type === 'Deposit').length === 0 && "No hay depósitos."}
          {listTab === 'Retiros' && store.movements.filter(m => m.type === 'Withdrawal').length === 0 && "No hay retiros."}
          {listTab === 'Transferencias' && store.transfers.length === 0 && "No hay transferencias."}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
             {listTab === 'Transferencias' && store.transfers.map(t => {
                const sourcePM = store.paymentMethods.find(pm => pm.id === (t.sourcePaymentMethodId || (t as any).sourceAccountId));
                const destPM = store.paymentMethods.find(pm => pm.id === (t.destPaymentMethodId || (t as any).destAccountId));
                const currency = (t as any).currency || sourcePM?.currency || '';
                
                const totalComs = (t.commissions || []).reduce((acc, c) => acc + (c.type === 'percentage' ? (t.amount * c.value) / 100 : c.value), 0);

                return (
                  <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left flex items-start gap-3">
                    <div className="mt-1 p-2 rounded-full shrink-0 bg-blue-500/20 text-blue-500">
                      <ArrowRightLeft className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-semibold text-white truncate">Transferencia</div>
                        <div className="flex items-center gap-2">
                          <div className="text-[10px] text-slate-500 whitespace-nowrap">
                            {format(new Date(t.date), 'dd/MM/yy HH:mm')}
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('¿Eliminar transferencia?')) {
                                store.importData({ transfers: store.transfers.filter(tr => tr.id !== t.id) });
                              }
                            }}
                            className="p-1.5 hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                         <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="truncate max-w-[80px] font-bold text-slate-300">{sourcePM?.platformChannel || 'N/A'}</span>
                            <ArrowRightLeft className="w-3 h-3 text-slate-600" />
                            <span className="truncate max-w-[80px] font-bold text-slate-300">{destPM?.platformChannel || 'N/A'}</span>
                         </div>
                         <span className="font-black text-white">{t.amount} <span className="text-slate-500 font-normal text-[10px]">{currency}</span></span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-950 p-2 rounded-lg">
                        <div>
                          <div className="text-slate-500 uppercase font-black tracking-widest mb-0.5">Comisiones</div>
                          <div className="text-amber-500 font-bold">{totalComs > 0 ? `-${totalComs.toFixed(2)}` : '0.00'} {currency}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-500 uppercase font-black tracking-widest mb-0.5">Costo Total</div>
                          <div className="text-white font-bold">{(t.amount + totalComs).toFixed(2)} {currency}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
             })}

             {listTab === 'Operaciones' && store.operations.map(op => {
                const sMyPM = store.paymentMethods.find(pm => pm.id === (op.sourceMyPaymentMethodId || (op as any).sourceMyAccountId));
                const sClientPM = store.paymentMethods.find(pm => pm.id === (op.sourceClientPaymentMethodId || (op as any).sourceClientAccountId));
                const dMyPM = store.paymentMethods.find(pm => pm.id === (op.destMyPaymentMethodId || (op as any).destMyAccountId));
                const dClientPM = store.paymentMethods.find(pm => pm.id === (op.destClientPaymentMethodId || (op as any).destClientAccountId));

                return (
                  <div key={op.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left flex items-start gap-3">
                    <div className={cn("mt-1 p-2 rounded-full shrink-0", op.type === 'Compra' ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500")}>
                      {op.type === 'Compra' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-semibold text-white truncate">{op.clientName || op.clientIdPlatform || 'P2P'}</div>
                        <div className="flex items-center gap-2">
                          <div className="text-[10px] text-slate-500 whitespace-nowrap">
                            {format(new Date(op.date), 'dd/MM/yy HH:mm')}
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('¿Eliminar operación?')) store.importData({ operations: store.operations.filter(o => o.id !== op.id) });
                            }}
                            className="p-1.5 hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-baseline mb-2">
                         <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", op.type === 'Compra' ? "bg-emerald-500/20 text-emerald-400" : "bg-purple-500/20 text-purple-400")}>
                           {op.type}
                         </span>
                         <span className="font-bold text-white">{op.price} <span className="text-slate-500 font-normal text-xs">{op.sourceCurrency}/{op.destCurrency}</span></span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800/50">
                          <div className="space-y-1">
                            <div className="font-black text-[9px] uppercase tracking-tighter text-red-500/70 border-b border-red-950 mb-1">Entregaste ({op.sourceCurrency})</div>
                            <div className="text-white font-bold text-sm mb-1">{op.amountInvested}</div>
                            {sMyPM && <div className="text-[9px] truncate">Mía: {sMyPM.platformChannel}</div>}
                            {sClientPM && <div className="text-[9px] truncate">Cliente: {sClientPM.platformChannel}</div>}
                          </div>
                          <div className="space-y-1 text-right">
                            <div className="font-black text-[9px] uppercase tracking-tighter text-emerald-500/70 border-b border-emerald-950 mb-1">Recibiste ({op.destCurrency})</div>
                            <div className="text-white font-bold text-sm mb-1">{op.amountReceived}</div>
                            {dMyPM && <div className="text-[9px] truncate">Mía: {dMyPM.platformChannel}</div>}
                            {dClientPM && <div className="text-[9px] truncate">Cliente: {dClientPM.platformChannel}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {(listTab === 'Depósitos' || listTab === 'Retiros') && store.movements.filter(m => m.type === (listTab === 'Depósitos' ? 'Deposit' : 'Withdrawal')).map(m => {
                 const pm = store.paymentMethods.find(p => p.id === (m.paymentMethodId || (m as any).accountId));
                 return (
                   <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left flex items-start gap-3">
                     <div className={cn("mt-1 p-2 rounded-full shrink-0", m.type === 'Deposit' ? "bg-emerald-500/20 text-emerald-500" : "bg-amber-500/20 text-amber-500")}>
                       {m.type === 'Deposit' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-start mb-1">
                         <div className="font-semibold text-white truncate">{m.type === 'Deposit' ? 'Depósito' : 'Retiro'}</div>
                         <div className="flex items-center gap-2">
                           <div className="text-[10px] text-slate-500 whitespace-nowrap">
                             {format(new Date(m.date), 'dd/MM/yy HH:mm')}
                           </div>
                           <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`¿Eliminar ${m.type === 'Deposit' ? 'depósito' : 'retiro'}?`)) {
                                  store.importData({ movements: store.movements.filter(mov => mov.id !== m.id) });
                                }
                              }}
                              className="p-1.5 hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                         </div>
                       </div>
                       <div className="flex justify-between items-baseline mb-2">
                          <span className="text-xs text-slate-400">
                            {pm?.platformChannel || 'Medio Eliminado'}
                          </span>
                          <span className="font-bold text-white">{m.amount} <span className="text-slate-500 font-normal text-xs">{m.currency || pm?.currency}</span></span>
                       </div>
                       {m.notes && <div className="text-xs text-slate-400 bg-slate-950 p-2 rounded-lg">{m.notes}</div>}
                     </div>
                   </div>
                 );
              })}
          </div>
        </div>
      </div>

      <button className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 shadow-lg shadow-blue-600/30 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-transform active:scale-95 z-40" onClick={() => setIsModalOpen(true)}>
        <Plus className="w-6 h-6" />
      </button>

      {isModalOpen && <NewOperation onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
