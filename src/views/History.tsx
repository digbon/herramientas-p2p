import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Search, Plus, SlidersHorizontal, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { NewOperation } from './NewOperation';

export function History() {
  const store = useAppStore();
  const [timeFilter, setTimeFilter] = useState('Global');
  const [listTab, setListTab] = useState('Operaciones');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold">Historial</h1>
      </div>

      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-full p-1">
        {['Día', 'Semana', 'Mes', 'Global'].map((tab) => (
          <button
            key={tab}
            onClick={() => setTimeFilter(tab)}
            className={cn(
              "flex-1 py-1.5 text-xs font-semibold rounded-full transition-colors",
              timeFilter === tab ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-300"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text"
            placeholder="Buscar nombre, plataforma, notas..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <button className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white p-2.5 rounded-lg">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div>
        <div className="flex border-b border-slate-800">
           {['Operaciones', 'Depósitos', 'Retiros'].map((tab) => {
            const count = tab === 'Operaciones' ? store.operations.length 
              : tab === 'Depósitos' ? store.movements.filter(m => m.type === 'Deposit').length
              : store.movements.filter(m => m.type === 'Withdrawal').length;
             
            return (
              <button
                key={tab}
                onClick={() => setListTab(tab)}
                className={cn(
                  "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
                  listTab === tab ? "border-blue-500 text-blue-500" : "border-transparent text-slate-400 hover:text-slate-300"
                )}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>
        <div className="pt-8 text-center text-slate-500 text-sm">
          {listTab === 'Operaciones' && store.operations.length === 0 && "No hay operaciones en el período seleccionado."}
          {listTab === 'Depósitos' && store.movements.filter(m => m.type === 'Deposit').length === 0 && "No hay depósitos en el período seleccionado."}
          {listTab === 'Retiros' && store.movements.filter(m => m.type === 'Withdrawal').length === 0 && "No hay retiros en el período seleccionado."}
          
          <div className="space-y-3">
             {listTab === 'Operaciones' && store.operations.map(op => (
                <div key={op.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left flex items-start gap-3">
                  <div className={cn("mt-1 p-2 rounded-full shrink-0", op.type === 'Compra' ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500")}>
                    {op.type === 'Compra' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold text-white truncate">{op.counterpartName}</div>
                      <div className="text-xs text-slate-500 whitespace-nowrap ml-2">
                        {format(new Date(op.date), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                    <div className="flex justify-between items-baseline mb-2">
                       <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", op.type === 'Compra' ? "bg-emerald-500/20 text-emerald-400" : "bg-purple-500/20 text-purple-400")}>
                         {op.type}
                       </span>
                       <span className="font-bold text-white">{op.price} <span className="text-slate-500 font-normal text-xs">{op.sourceCurrency}/{op.destCurrency}</span></span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-950 p-2 rounded-lg">
                      <div>
                        <div className="mb-0.5">Entregaste</div>
                        <div className="text-white font-medium">{op.amountSent} {op.sourceCurrency}</div>
                      </div>
                      <div className="text-right">
                        <div className="mb-0.5">Recibiste</div>
                        <div className="text-white font-medium">{op.amountReceived} {op.destCurrency}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {(listTab === 'Depósitos' || listTab === 'Retiros') && store.movements.filter(m => m.type === (listTab === 'Depósitos' ? 'Deposit' : 'Withdrawal')).map(m => (
                 <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left flex items-start gap-3">
                   <div className={cn("mt-1 p-2 rounded-full shrink-0", m.type === 'Deposit' ? "bg-emerald-500/20 text-emerald-500" : "bg-amber-500/20 text-amber-500")}>
                     {m.type === 'Deposit' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-start mb-1">
                       <div className="font-semibold text-white truncate">{m.type === 'Deposit' ? 'Depósito' : 'Retiro'}</div>
                       <div className="text-xs text-slate-500 whitespace-nowrap ml-2">
                         {format(new Date(m.date), 'dd/MM/yyyy HH:mm')}
                       </div>
                     </div>
                     <div className="flex justify-between items-baseline mb-2">
                        <span className="text-xs text-slate-400">
                          {store.accounts.find(a => a.id === m.accountId)?.name || 'Cuenta'}
                        </span>
                        <span className="font-bold text-white">{m.amount} <span className="text-slate-500 font-normal text-xs">{m.currency}</span></span>
                     </div>
                     {m.notes && <div className="text-xs text-slate-400 bg-slate-950 p-2 rounded-lg">{m.notes}</div>}
                   </div>
                 </div>
              ))}
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
