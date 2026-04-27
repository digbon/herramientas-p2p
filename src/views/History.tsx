import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Search, Plus, SlidersHorizontal, ArrowUpRight, ArrowDownRight, ArrowRightLeft, User, X, ChevronDown, Trash2, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { NewOperation } from './NewOperation';
import { getAccountBalance } from '../lib/balance';
import { PlatformPicker } from '../components/PlatformPicker';
import { OwnerNamePicker } from '../components/OwnerNamePicker';
import { PlatformAccordion } from '../components/PlatformAccordion';
import { ClientDetail } from '../components/ClientDetail';

export function History() {
  const store = useAppStore();
  const [timeFilter, setTimeFilter] = useState('Global');
  const [listTab, setListTab] = useState('Operaciones');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showClientAccountModal, setShowClientAccountModal] = useState(false);
  const [editingClientAccountId, setEditingClientAccountId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const clientAccounts = store.accounts.filter(a => a.ownerType === 'Cliente');
  
  // Create a list of unique clients based on the store.clients and current accounts (for backward compatibility)
  const uniqueClients = React.useMemo(() => {
    const clients = [...store.clients];
    const accountClients = store.accounts
      .filter(a => a.ownerType === 'Cliente')
      .map(a => a.ownerName);
    
    accountClients.forEach(name => {
      if (!clients.find(c => c.name === name)) {
        clients.push({
          id: `legacy-${name}`,
          name: name,
          createdAt: new Date().toISOString()
        });
      }
    });
    return clients;
  }, [store.clients, store.accounts]);

  const filteredClients = uniqueClients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-16">
      {/* Client Detail Modal */}
      {selectedClientId && (
        <ClientDetail 
          clientId={selectedClientId} 
          onClose={() => setSelectedClientId(null)} 
        />
      )}

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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <button className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white p-2.5 rounded-lg">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div>
        <div className="flex gap-4 border-b border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-hide px-4">
           {['Operaciones', 'Depósitos', 'Retiros', 'Transferencias', 'Clientes', 'Plataformas'].map((tab) => {
            const count = tab === 'Operaciones' ? store.operations.length 
              : tab === 'Depósitos' ? store.movements.filter(m => m.type === 'Deposit').length
              : tab === 'Retiros' ? store.movements.filter(m => m.type === 'Withdrawal').length
              : tab === 'Transferencias' ? store.transfers.length
              : tab === 'Clientes' ? store.clients.length
              : store.platforms.filter(p => p.owner === 'Cliente').length;
             
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
          {listTab === 'Operaciones' && store.operations.length === 0 && "No hay operaciones en el período seleccionado."}
          {listTab === 'Depósitos' && store.movements.filter(m => m.type === 'Deposit').length === 0 && "No hay depósitos en el período seleccionado."}
          {listTab === 'Retiros' && store.movements.filter(m => m.type === 'Withdrawal').length === 0 && "No hay retiros en el período seleccionado."}
          {listTab === 'Transferencias' && store.transfers.length === 0 && "No hay transferencias en el período seleccionado."}
          {listTab === 'Plataformas' && store.platforms.filter(p => p.owner === 'Cliente').length === 0 && "No hay plataformas de clientes registradas."}
          {listTab === 'Clientes' && store.clients.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-slate-700" />
              </div>
              <h3 className="text-white font-bold mb-2">No hay clientes aún</h3>
              <p className="text-xs text-slate-500 mb-6 max-w-[200px]">Los clientes se registran automáticamente cuando realizas una operación con ellos.</p>
            </div>
          )}
          
          <div className="space-y-3">
             {listTab === 'Plataformas' && (
               <div className="text-left space-y-4">
                 <div className="px-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Wallet className="w-3.5 h-3.5 text-blue-500" />
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Plataformas de Clientes</span>
                    </div>
                 </div>
                 <div className="space-y-3">
                   {store.platforms.filter(p => p.owner === 'Cliente').map(platform => (
                     <PlatformAccordion key={platform.id} platform={platform} />
                   ))}
                 </div>
               </div>
             )}

             {listTab === 'Clientes' && filteredClients.length > 0 && (
               <div className="space-y-3">
                 <div className="flex justify-between items-center px-1">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{filteredClients.length} Clientes Registrados</span>
                 </div>
                 <div className="grid gap-2">
                   {filteredClients.map(client => {
                     const accountsCount = store.accounts.filter(a => a.ownerName === client.name && a.ownerType === 'Cliente').length;
                     return (
                       <div 
                        key={client.id} 
                        onClick={() => setSelectedClientId(client.id)}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left flex items-center gap-3 hover:border-slate-700 transition-colors cursor-pointer group"
                       >
                         <div className="p-2 rounded-full shrink-0 bg-teal-500/20 text-teal-500 group-hover:bg-teal-500/30 transition-colors">
                           <User className="w-4 h-4" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-center">
                             <div className="font-bold text-white truncate group-hover:text-teal-400 transition-colors">{client.name}</div>
                             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{accountsCount} Cuentas</div>
                           </div>
                           {client.contact && <div className="text-[10px] text-slate-500 mt-0.5">{client.contact}</div>}
                         </div>
                         <ChevronDown className="w-4 h-4 text-slate-700 -rotate-90" />
                       </div>
                     );
                   })}
                 </div>
               </div>
             )}

             {listTab === 'Transferencias' && store.transfers.map(t => {
                const sourceAcc = store.accounts.find(a => a.id === t.sourceAccountId);
                const destAcc = store.accounts.find(a => a.id === t.destAccountId);
                const currency = sourceAcc?.currency || '';
                
                const totalComs = (t.commissions || []).reduce((acc, c) => {
                  if (c.type === 'percentage') return acc + (t.amount * c.value) / 100;
                  return acc + c.value;
                }, 0);

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
                            <span className="truncate max-w-[80px] font-bold text-slate-300">{sourceAcc?.name}</span>
                            <ArrowRightLeft className="w-3 h-3 text-slate-600" />
                            <span className="truncate max-w-[80px] font-bold text-slate-300">{destAcc?.name}</span>
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

                      {t.notes && <div className="mt-2 text-xs text-slate-500 italic">"{t.notes}"</div>}
                    </div>
                  </div>
                );
             })}

             {listTab === 'Operaciones' && store.operations.map(op => {
                const sourceMyPlatformIdRaw = op.sourceMyPlatformId || op.sourcePlatformId;
                const sourceMyAccountIdRaw = op.sourceMyAccountId || op.sourceAccountId;
                const sourceClientAccountIdRaw = op.sourceClientAccountId || op.clientSourceAccountId;

                const destMyPlatformIdRaw = op.destMyPlatformId || op.destPlatformId;
                const destMyAccountIdRaw = op.destMyAccountId || op.destAccountId;
                const destClientAccountIdRaw = op.destClientAccountId || op.clientDestAccountId;

                const sMyPlatform = store.platforms.find(p => p.id === sourceMyPlatformIdRaw);
                const sMyAccount = store.accounts.find(a => a.id === sourceMyAccountIdRaw);
                const sClientPlatform = store.platforms.find(p => p.id === op.sourceClientPlatformId);
                const sClientAccount = store.accounts.find(a => a.id === sourceClientAccountIdRaw);

                const dMyPlatform = store.platforms.find(p => p.id === destMyPlatformIdRaw);
                const dMyAccount = store.accounts.find(a => a.id === destMyAccountIdRaw);
                const dClientPlatform = store.platforms.find(p => p.id === op.destClientPlatformId);
                const dClientAccount = store.accounts.find(a => a.id === destClientAccountIdRaw);

                return (
                  <div key={op.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left flex items-start gap-3">
                    <div className={cn("mt-1 p-2 rounded-full shrink-0", op.type === 'Compra' ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500")}>
                      {op.type === 'Compra' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-semibold text-white truncate">{op.counterpartName}</div>
                        <div className="flex items-center gap-2">
                          <div className="text-[10px] text-slate-500 whitespace-nowrap">
                            {format(new Date(op.date), 'dd/MM/yy HH:mm')}
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('¿Eliminar operación?')) {
                                store.importData({ operations: store.operations.filter(o => o.id !== op.id) });
                              }
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
                            <div className="text-white font-bold text-sm mb-1">{op.amountSent} <span className="text-slate-500 text-[10px]">{op.sourceCurrency}</span></div>
                            
                            {(sMyAccount || sMyPlatform) && (
                              <div className="flex flex-col gap-0.5 opacity-80">
                                <span className="text-slate-500 text-[9px] uppercase font-bold">Mías:</span>
                                <span className="text-slate-300 truncate">{sMyPlatform?.name} {sMyAccount && `- ${sMyAccount.name}`}</span>
                              </div>
                            )}

                            {(sClientAccount || sClientPlatform) && (
                              <div className="flex flex-col gap-0.5 opacity-80">
                                <span className="text-slate-500 text-[9px] uppercase font-bold">Cliente:</span>
                                <span className="text-slate-300 truncate">{sClientPlatform?.name} {sClientAccount && `- ${sClientAccount.name}`}</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-1 text-right">
                            <div className="font-black text-[9px] uppercase tracking-tighter text-emerald-500/70 border-b border-emerald-950 mb-1">Recibiste ({op.destCurrency})</div>
                            <div className="text-white font-bold text-sm mb-1">{op.amountReceived} <span className="text-slate-500 text-[10px]">{op.destCurrency}</span></div>
                            
                            {(dMyAccount || dMyPlatform) && (
                              <div className="flex flex-col gap-0.5 opacity-80 items-end text-right">
                                <span className="text-slate-500 text-[9px] uppercase font-bold">Mías:</span>
                                <span className="text-slate-300 truncate">{dMyPlatform?.name} {dMyAccount && `- ${dMyAccount.name}`}</span>
                              </div>
                            )}

                            {(dClientAccount || dClientPlatform) && (
                              <div className="flex flex-col gap-0.5 opacity-80 items-end text-right">
                                <span className="text-slate-500 text-[9px] uppercase font-bold">Cliente:</span>
                                <span className="text-slate-300 truncate">{dClientPlatform?.name} {dClientAccount && `- ${dClientAccount.name}`}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {(listTab === 'Depósitos' || listTab === 'Retiros') && store.movements.filter(m => m.type === (listTab === 'Depósitos' ? 'Deposit' : 'Withdrawal')).map(m => (
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
      
      {showClientAccountModal && (
        <ClientAccountModal 
          accountId={editingClientAccountId}
          onClose={() => {
            setShowClientAccountModal(false);
            setEditingClientAccountId(null);
          }}
        />
      )}
    </div>
  );
}

function ClientAccountModal({ accountId, onClose }: { accountId: string | null, onClose: () => void }) {
  const store = useAppStore();
  const account = accountId ? store.accounts.find(a => a.id === accountId) : null;
  
  const [name, setName] = useState(account?.name || '');
  const [tag, setTag] = useState(account?.tag || '');
  const [ownerName, setOwnerName] = useState(account?.ownerName || '');
  const [currency, setCurrency] = useState(account?.currency || store.baseFiat);
  const [platformId, setPlatformId] = useState(account?.platformId || '');
  const [platformValue, setPlatformValue] = useState(account?.platformValue || '');
  const [initialBalance, setInitialBalance] = useState(account?.initialBalance?.toString() || '0');

  const handleSave = () => {
    const data = {
      id: accountId || Date.now().toString(),
      name,
      tag: tag || `#${store.accounts.filter(a => a.currency === currency).length + 1}`,
      ownerName,
      ownerType: 'Cliente' as const,
      currency,
      platformId,
      platformValue,
      initialBalance: parseFloat(initialBalance) || 0,
    };

    if (accountId) {
      store.updateAccount(accountId, data);
    } else {
      store.addAccount(data);
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100]" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-[100] flex sm:items-center justify-center pointer-events-none p-4">
        <div className="bg-slate-950 pointer-events-auto border border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
             <h3 className="text-white font-black text-xs uppercase tracking-widest">{accountId ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
             <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
          </div>
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
             <div className="space-y-1 text-[10px]">
                <label className="text-slate-500 font-bold uppercase">Nombre Completo del Cliente</label>
                <OwnerNamePicker 
                  value={ownerName} 
                  ownerType="Cliente"
                  onSelect={setOwnerName}
                />
             </div>

             <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1 text-[10px]">
                  <label className="text-slate-500 font-bold uppercase">Moneda</label>
                  <select 
                    value={currency} 
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-white outline-none focus:border-blue-500 font-bold appearance-none"
                  >
                    {store.currencies.map(c => <option key={c.symbol} value={c.symbol}>{c.symbol}</option>)}
                  </select>
               </div>
               <div className="space-y-1 text-[10px]">
                  <label className="text-slate-500 font-bold uppercase">Nombre Cuenta</label>
                  <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Ej: BCP" className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-white outline-none focus:border-blue-500 font-bold" />
               </div>
             </div>

             <div className="space-y-1 text-[10px]">
                <label className="text-slate-500 font-bold uppercase">Plataforma / Banco</label>
                <PlatformPicker 
                  value={platformId}
                  ownerFilter="Cliente"
                  onSelect={(id, val) => {
                    setPlatformId(id);
                    if (val) setPlatformValue(val);
                  }}
                  onAddNew={() => {}} // No implementation here for simplicity
                />
             </div>

             <div className="space-y-1 text-[10px]">
                <label className="text-slate-500 font-bold uppercase">ID / Número de Cuenta</label>
                <input value={platformValue} onChange={e => setPlatformValue(e.target.value)} type="text" placeholder="ID, número de cuenta, etc." className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-white outline-none focus:border-blue-500 font-mono" />
             </div>

             <button 
              disabled={!ownerName || !platformId} 
              onClick={handleSave} 
              className="w-full bg-blue-600 disabled:opacity-50 text-white rounded-xl py-3.5 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-900/20 active:scale-95 transition-all mt-4"
             >
               {accountId ? 'Guardar Cambios' : 'Registrar Cliente'}
             </button>
          </div>
        </div>
      </div>
    </>
  );
}
