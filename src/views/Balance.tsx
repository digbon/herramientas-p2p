import React, { useState } from 'react';
import { useAppStore, Account, PaymentMethod } from '../store';
import { PlusCircle, MinusCircle, X, Pencil, Plus, ChevronDown, Wallet, Link2, Search, Trash2, ArrowRightLeft } from 'lucide-react';
import { PlatformPicker } from '../components/PlatformPicker';
import { OwnerNamePicker } from '../components/OwnerNamePicker';
import { AccountPicker } from '../components/AccountPicker';
import { PlatformAccordion } from '../components/PlatformAccordion';
import { cn } from '../lib/utils';
import { getAccountBalance } from '../lib/balance';

export function Balance() {
  const store = useAppStore();
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferCurrency, setTransferCurrency] = useState('');
  
  const [newCurrency, setNewCurrency] = useState('');
  const [newCurrencyType, setNewCurrencyType] = useState<'Fiat'|'Crypto'>('Fiat');

  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);
  const [isNewAccount, setIsNewAccount] = useState(false);

  const getSaldoActual = (accountId: string) => getAccountBalance(accountId, store);

  const getCryptoBalance = (symbol: string) => store.accounts.filter(a => a.currency === symbol && a.ownerType !== 'Cliente').reduce((acc, a) => acc + getSaldoActual(a.id), 0);
  const getFiatBalance = (symbol: string) => store.accounts.filter(a => a.currency === symbol && a.ownerType !== 'Cliente').reduce((acc, a) => acc + getSaldoActual(a.id), 0);

  const cryptoCurrencies = store.currencies.filter(c => c.type === 'Crypto');
  const fiatCurrencies = store.currencies.filter(c => c.type === 'Fiat');

  return (
    <div className="space-y-6 pb-20">
      
      {/* Resumen Superior */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2 uppercase">
            <span>Cripto</span>
            <span>{cryptoCurrencies.length} monedas</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x scrollbar-hide">
            {cryptoCurrencies.map(c => (
              <div key={c.symbol} className="bg-teal-500/20 border border-teal-500/30 rounded-xl p-4 min-w-[150px] snap-center shrink-0 shadow-lg shadow-teal-500/5">
                <div className="flex justify-between items-center text-teal-300 text-sm font-medium mb-2">
                  <span>Balance</span>
                  <span className="font-bold">{c.symbol}</span>
                </div>
                <div className="text-3xl font-bold text-white tracking-tight">
                  {getCryptoBalance(c.symbol).toFixed(5).replace(/\.?0+$/, '') || '0.00'}
                </div>
                <div className="text-xs text-teal-300/70 mt-1">
                  en {store.accounts.filter(a => a.currency === c.symbol && a.ownerType !== 'Cliente').length} cuenta(s)
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2 uppercase">
            <span>Fiat</span>
            <span>{fiatCurrencies.length} moneda(s)</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x scrollbar-hide">
             {fiatCurrencies.map(c => (
              <div key={c.symbol} className="bg-purple-600 border border-purple-500 rounded-xl p-4 min-w-[150px] snap-center shrink-0 shadow-lg shadow-purple-600/20">
                 <div className="flex justify-between items-center text-purple-200 text-sm font-medium mb-2">
                  <span>Balance</span>
                  <span className="font-bold">{c.symbol}</span>
                </div>
                <div className="text-3xl font-bold text-white tracking-tight">
                  {getFiatBalance(c.symbol).toFixed(2)}
                </div>
                <div className="text-xs text-purple-200/70 mt-1">
                  en {store.accounts.filter(a => a.currency === c.symbol && a.ownerType !== 'Cliente').length} cuenta(s)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Balance</h1>
        <p className="text-sm text-slate-400 mb-4">Gestiona tus cuentas y saldos por moneda.</p>
        
        <div className="grid grid-cols-3 gap-3 mb-6">
           <button onClick={() => setIsDepositOpen(true)} className="bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors py-4 rounded-xl font-semibold flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-500/5">
             <PlusCircle className="w-5 h-5" />
             <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400/80">Capital</span>
           </button>
           <button onClick={() => setIsWithdrawOpen(true)} className="bg-amber-500/20 text-amber-500 border border-amber-500/30 hover:bg-amber-500/30 transition-colors py-4 rounded-xl font-semibold flex flex-col items-center justify-center gap-1 shadow-lg shadow-amber-500/5">
             <MinusCircle className="w-5 h-5" />
             <span className="text-[10px] uppercase font-black tracking-widest text-amber-400/80">Retiro</span>
           </button>
           <button 
             onClick={() => {
               setTransferCurrency(store.baseCrypto);
               setIsTransferOpen(true);
             }} 
             className="bg-blue-600/20 text-blue-500 border border-blue-500/30 hover:bg-blue-600/30 transition-colors py-4 rounded-xl font-semibold flex flex-col items-center justify-center gap-1 shadow-lg shadow-blue-500/5"
           >
             <ArrowRightLeft className="w-5 h-5" />
             <span className="text-[10px] uppercase font-black tracking-widest text-blue-400/80">Transferir</span>
           </button>
        </div>

        <div className="space-y-6">
          {store.currencies.map(currency => {
             const accounts = store.accounts.filter(a => a.currency === currency.symbol && a.ownerType === 'Mias');
             
             return (
               <div key={currency.symbol} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
                 <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-white text-sm shadow-inner group">
                        {currency.symbol.slice(0, 3)}
                     </div>
                     <div>
                       <div className="flex items-center gap-2">
                         <span className="font-black text-xl text-white tracking-tighter">{currency.symbol}</span>
                         <span className="text-[10px] font-black bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-widest">{currency.type}</span>
                       </div>
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{accounts.length} cuentas registradas</div>
                     </div>
                   </div>
                   
                   <button 
                     onClick={() => {
                        const tempId = Date.now().toString();
                        setAccountToEdit({ 
                          id: tempId, 
                          currency: currency.symbol, 
                          tag: `#${accounts.length + 1}`,
                          name: '', 
                          ownerName: '',
                          ownerType: 'Mias',
                          initialBalance: 0 
                        } as Account);
                        setIsNewAccount(true);
                      }}
                     className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                   >
                     <Plus className="w-4 h-4" /> Nueva Cuenta
                   </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {accounts.map((acc, i) => {
                     const isLast = accounts.length === 1;
                     const platform = acc.platformId ? store.platforms.find(p => p.id === acc.platformId) : null;
                     
                     return (
                       <div key={acc.id} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden relative group">
                         {/* Header: Owner & Tag */}
                         <div className="p-4 border-b border-slate-800 bg-slate-900/30 flex justify-between items-start">
                           <div className="space-y-1">
                             <div className="flex items-center gap-2">
                               <span className={cn(
                                 "text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                                 acc.ownerType === 'Mias' ? "bg-purple-500/10 text-purple-400" : "bg-teal-500/10 text-teal-400"
                               )}>
                                 {acc.ownerType === 'Mias' ? 'Mía' : 'Cliente'}
                               </span>
                               <span className="text-white font-bold text-sm tracking-tight">{acc.ownerName}</span>
                             </div>
                             <div className="flex items-center gap-2">
                               <span className="text-blue-500 font-black text-lg">{acc.tag}</span>
                               <span className="text-slate-400 font-bold text-lg">{acc.name}</span>
                             </div>
                           </div>
                            <div className="flex gap-1">
                             <button 
                                onClick={() => {
                                  setAccountToEdit(acc);
                                  setIsNewAccount(false);
                                }}
                                className="p-2 text-slate-500 hover:text-white transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button 
                               onClick={() => {
                                 if (!isLast) store.removeAccount(acc.id);
                               }}
                               disabled={isLast}
                               className="p-2 text-slate-800 hover:text-red-500 transition-colors disabled:opacity-0"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                         </div>

                         {/* Platform Info */}
                         <div className="p-4 bg-slate-900/10">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center">
                                <Link2 className="w-5 h-5 text-blue-500 -rotate-45" />
                              </div>
                              <div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Plataforma / Canal</div>
                                <div className="text-white font-bold text-sm">
                                  {platform ? platform.name : <span className="text-slate-600 italic">No vinculada</span>}
                                  {acc.platformValue && (
                                    <span className="ml-2 text-slate-400 font-mono text-xs">: {acc.platformValue}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                         </div>

                         {/* Balances Section */}
                         <div className="grid grid-cols-2 border-t border-slate-800 divide-x divide-slate-800">
                            <div className="p-4 bg-slate-900/5 transition-colors group-hover:bg-slate-900/20">
                              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 opacity-70">Saldo Inicial</div>
                              <div className="text-slate-400 font-bold text-base tracking-tighter">
                                {acc.initialBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: acc.currency === 'BTC' ? 5 : 2 })}
                              </div>
                            </div>
                            <div className="p-4 bg-blue-600/5 transition-colors group-hover:bg-blue-600/10 border-l-4 border-l-blue-500/50">
                              <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1.5">Saldo Actual</div>
                              <div className="text-white font-black text-xl tracking-tight leading-none pt-0.5">
                                {getSaldoActual(acc.id).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: acc.currency === 'BTC' ? 5 : 2 })}
                                <span className="text-[10px] ml-1.5 opacity-50">{acc.currency}</span>
                              </div>
                            </div>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
             );
          })}
        </div>

        <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
           <h3 className="font-bold text-white">Información</h3>
           <p className="text-sm text-slate-400">
             El saldo actual de cada cuenta se calcula automáticamente sumando el capital inicial y el resultado neto de todas las operaciones y movimientos registrados.
           </p>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 space-y-6">
          <SectionCard title="Mis Plataformas y Métodos de Pago" icon={<Wallet className="w-4 h-4 text-emerald-400" />}>
            <p className="text-xs text-slate-400 mb-4 px-1 leading-relaxed">
              Consulta tus plataformas y métodos de pago configurados. Esta vista es de solo lectura.
            </p>
            <div className="space-y-3">
              {store.platforms.filter(p => p.owner === 'Mias').map(platform => (
                <PlatformAccordion key={platform.id} platform={platform} />
              ))}
              {store.platforms.filter(p => p.owner === 'Mias').length === 0 && (
                <div className="text-center py-8 bg-slate-950/30 border border-dashed border-slate-800 rounded-xl">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">No hay plataformas registradas</span>
                </div>
              )}
            </div>
          </SectionCard>

          <h2 className="text-xl font-bold text-white tracking-tight">Configuración del Entorno</h2>

          <SectionCard title="Saldos Globales (Preferencia)">
            <div className="space-y-4">
              <div className="space-y-1 relative">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Moneda Local Base</label>
                <select
                  value={store.baseFiat}
                  onChange={(e) => store.setBaseFiat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white appearance-none focus:outline-none focus:border-blue-500 font-bold"
                >
                  {store.currencies.filter(c => c.type === 'Fiat').map(c => (
                    <option key={c.symbol} value={c.symbol}>{c.symbol}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-[34px] pointer-events-none" />
              </div>
              <div className="space-y-1 relative">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Criptomoneda Base</label>
                <select
                  value={store.baseCrypto}
                  onChange={(e) => store.setBaseCrypto(e.target.value)}
                   className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white appearance-none focus:outline-none focus:border-blue-500 font-bold"
                >
                  {store.currencies.filter(c => c.type === 'Crypto').map(c => (
                    <option key={c.symbol} value={c.symbol}>{c.symbol}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-[34px] pointer-events-none" />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Mis Divisas">
            <p className="text-xs text-slate-400 mb-4 px-1 leading-relaxed">
              Las divisas registradas habilitan cuentas y pares de operación.
            </p>
            <div className="space-y-2 mb-4">
              {store.currencies.map(c => (
                <div key={c.symbol} className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 group">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-white text-[10px]">
                    {c.symbol.slice(0, 3)}
                  </div>
                  <span className="font-black text-white flex-1">{c.symbol}</span>
                  {(c.symbol === store.baseCrypto || c.symbol === store.baseFiat) && <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 tracking-widest uppercase">Base</span>}
                  
                  <span className="text-[10px] font-bold text-slate-600 uppercase pr-2">{c.type}</span>
                  
                  {!(c.symbol === store.baseCrypto || c.symbol === store.baseFiat) && (
                    <button onClick={() => store.removeCurrency(c.symbol)} className="p-1 hover:bg-red-500/20 text-slate-700 hover:text-red-500 rounded"><X className="w-4 h-4" /></button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ej: ARS" 
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 uppercase font-black"
                  value={newCurrency}
                  onChange={e => setNewCurrency(e.target.value.toUpperCase())}
                />
                <div className="relative">
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-8 py-2.5 text-sm text-white outline-none focus:border-blue-500 appearance-none font-bold"
                    value={newCurrencyType}
                    onChange={e => setNewCurrencyType(e.target.value as 'Fiat' | 'Crypto')}
                  >
                    <option value="Fiat">Fiat</option>
                    <option value="Crypto">Cripto</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <button 
                  onClick={() => {
                    if(newCurrency && !store.currencies.find(c => c.symbol === newCurrency)) {
                      store.addCurrency({ symbol: newCurrency, type: newCurrencyType });
                      setNewCurrency('');
                    }
                  }}
                  className="w-11 h-11 bg-blue-600 hover:bg-blue-700 flex items-center justify-center rounded-xl text-white shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
            </div>
          </SectionCard>
        </div>

      </div>

      {isDepositOpen && <CapitalModal type="Deposit" onClose={() => setIsDepositOpen(false)} />}
      {isWithdrawOpen && <CapitalModal type="Withdrawal" onClose={() => setIsWithdrawOpen(false)} />}
      {isTransferOpen && <TransferModal currency={transferCurrency} onClose={() => setIsTransferOpen(false)} />}
      {accountToEdit && <EditAccountModal account={accountToEdit} isNew={isNewAccount} onClose={() => setAccountToEdit(null)} />}
    </div>
  );
}

function EditAccountModal({ account, onClose, isNew = false }: { account: Account, onClose: () => void, isNew?: boolean }) {
  const store = useAppStore();
  const [name, setName] = useState(account.name);
  const [tag, setTag] = useState(account.tag || '');
  const [ownerName, setOwnerName] = useState(account.ownerName || '');
  const [ownerType] = useState<'Mias' | 'Cliente'>('Mias');
  const [platformId, setPlatformId] = useState(account.platformId || '');
  const [platformValue, setPlatformValue] = useState(account.platformValue || '');
  const [initialBalance, setInitialBalance] = useState(account.initialBalance.toString());
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(account.paymentMethods || []);
  const [showAddPlatformModal, setShowAddPlatformModal] = useState(false);
  const [showPlatformAccountModal, setShowPlatformAccountModal] = useState<{ platformId: string; accountIndex?: number; isLegacy?: boolean } | null>(null);
  const [editingPlatformId, setEditingPlatformId] = useState<string | undefined>(undefined);

  const handleSave = () => {
    if (isNew) {
      store.addAccount({
        ...account,
        name,
        tag,
        ownerName,
        ownerType,
        platformId,
        platformValue,
        initialBalance: parseFloat(initialBalance) || 0,
        paymentMethods
      });
    } else {
      store.updateAccount(account.id, { 
        name,
        paymentMethods 
      });
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex sm:items-center justify-center pointer-events-none sm:p-4">
        <div className="bg-slate-900 pointer-events-auto sm:border border-t border-slate-800 w-full max-w-md max-h-[90vh] sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
            <h2 className="text-lg font-bold text-white tracking-tight">Configurar Cuenta</h2>
            <button onClick={onClose} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6 touch-pan-y">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Etiqueta (#1, #2...)</label>
                <input 
                  type="text" 
                  value={tag} 
                  onChange={e => setTag(e.target.value)} 
                  disabled={!isNew}
                  placeholder="#1"
                  className={cn(
                    "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white outline-none focus:border-blue-500 font-bold transition-all",
                    !isNew && "opacity-50 grayscale cursor-not-allowed"
                  )} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre de Cuenta</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Ej: Ahorros BCP"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white outline-none focus:border-blue-500 font-bold" 
                />
              </div>
            </div>

            {isNew ? (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Saldo Inicial ({account.currency})</label>
                <input 
                  type="number" 
                  value={initialBalance} 
                  onChange={e => setInitialBalance(e.target.value)} 
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white outline-none focus:border-blue-500 font-bold" 
                />
                <p className="text-[9px] text-slate-500 mt-1 ml-1 uppercase font-bold">* El saldo inicial NO podrá ser editado después.</p>
              </div>
            ) : (
              <div className="space-y-1 opacity-50 grayscale">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Saldo Inicial (Bloqueado)</label>
                <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white font-bold">
                  {account.initialBalance.toLocaleString()} {account.currency}
                </div>
              </div>
            )}

            <div className={cn("space-y-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 transition-all")}>
              <div className="flex items-center gap-4">
                 <div className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-purple-600 text-white shadow-lg shadow-purple-900/20 text-center">
                   Cuenta Propia (Mía)
                 </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Completo del Dueño</label>
                <OwnerNamePicker 
                  value={ownerName} 
                  ownerType="Mias"
                  onSelect={setOwnerName}
                  disabled={!isNew}
                />
              </div>
            </div>

            <div className={cn("space-y-4 transition-all", !isNew && "opacity-50 grayscale")}>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-3 bg-blue-500 rounded-full" /> Método de Pago / Plataforma Principal
              </h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Seleccionar Plataforma</label>
                  <PlatformPicker 
                    value={platformId}
                    ownerFilter={ownerType}
                    disabled={!isNew}
                    onSelect={(pId, accVal) => {
                      setPlatformId(pId);
                      if (accVal) setPlatformValue(accVal);
                    }}
                    onAddNew={() => {
                      setEditingPlatformId(undefined);
                      setShowAddPlatformModal(true);
                    }}
                    onAddAccountToPlatform={(id) => {
                      setShowPlatformAccountModal({ platformId: id });
                    }}
                    onEditAccount={(pId, idx, isLegacy) => {
                      setShowPlatformAccountModal({ platformId: pId, accountIndex: idx, isLegacy });
                    }}
                    onDeleteAccount={(pId, idx, isLegacy) => {
                      const platform = store.platforms.find(p => p.id === pId);
                      if (!platform) return;
                      
                      if (isLegacy) {
                        store.updatePlatform(pId, { details: undefined });
                      } else if (platform.accounts) {
                        const newAccounts = platform.accounts.filter((_, i) => i !== idx);
                        store.updatePlatform(pId, { accounts: newAccounts });
                      }
                    }}
                    onDeletePlatform={(id) => {
                      store.removePlatform(id);
                      if (platformId === id) setPlatformId('');
                    }}
                  />
                </div>
                {platformId && (
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">ID / Alias / Número en Plataforma</label>
                    <input 
                      type="text" 
                      value={platformValue} 
                      onChange={e => setPlatformValue(e.target.value)} 
                      disabled={!isNew}
                      placeholder="Ej: 78979555, user_binance..."
                      className={cn(
                        "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white outline-none focus:border-blue-500 font-mono",
                        !isNew && "cursor-not-allowed"
                      )} 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4 border-t border-slate-800 flex gap-3 shrink-0 bg-slate-900">
            <button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold tracking-tight transition-all">Guardar Cambios</button>
            <button onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold tracking-tight transition-all">Cancelar</button>
          </div>
        </div>
      </div>

      {showAddPlatformModal && (
        <MiniAddPlatformModal 
          store={store}
          platformId={editingPlatformId}
          onAdd={() => setShowAddPlatformModal(false)}
          onClose={() => setShowAddPlatformModal(false)}
          ownerFilter={ownerType}
        />
      )}

      {showPlatformAccountModal && (
        <PlatformAccountModal 
          store={store}
          platformId={showPlatformAccountModal.platformId}
          accountIndex={showPlatformAccountModal.accountIndex}
          isLegacy={showPlatformAccountModal.isLegacy}
          onClose={() => setShowPlatformAccountModal(null)}
        />
      )}
    </>
  );
}

function PlatformAccountModal({ 
  store, 
  platformId, 
  accountIndex, 
  isLegacy, 
  onClose 
}: { 
  store: any, 
  platformId: string, 
  accountIndex?: number, 
  isLegacy?: boolean,
  onClose: () => void 
}) {
  const platform = store.platforms.find((p: any) => p.id === platformId);
  const isEditing = accountIndex !== undefined || isLegacy;
  
  let initialValue = '';
  let initialLabel = '';
  
  if (isLegacy) {
    initialValue = platform.details || '';
    initialLabel = 'Principal';
  } else if (accountIndex !== undefined && platform.accounts) {
    initialValue = platform.accounts[accountIndex].value;
    initialLabel = platform.accounts[accountIndex].label || '';
  }

  const [value, setValue] = useState(initialValue);
  const [label, setLabel] = useState(initialLabel);

  const handleSave = () => {
    if (!value) return;
    
    if (isLegacy) {
      store.updatePlatform(platformId, { details: value });
    } else {
      const newAccounts = [...(platform.accounts || [])];
      if (accountIndex !== undefined) {
        newAccounts[accountIndex] = { ...newAccounts[accountIndex], value, label };
      } else {
        newAccounts.push({ id: Date.now().toString(), value, label });
      }
      store.updatePlatform(platformId, { accounts: newAccounts });
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[110]" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-[110] flex sm:items-center justify-center pointer-events-none p-4">
        <div className="bg-slate-950 pointer-events-auto border border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
             <h3 className="text-white font-black text-xs uppercase tracking-widest">
               {isEditing ? 'Editar Cuenta' : 'Nueva Cuenta'}
             </h3>
             <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
          </div>
          <div className="p-5 space-y-4">
             <div className="space-y-1 text-xs">
                <label className="text-slate-500 font-bold uppercase tracking-tighter">Alias / Etiqueta (Ej: Principal, Ahorros)</label>
                <input 
                  value={label} 
                  onChange={e => setLabel(e.target.value)} 
                  type="text" 
                  placeholder="Ej: Ahorros..." 
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500" 
                />
             </div>
             <div className="space-y-1 text-xs">
                <label className="text-slate-500 font-bold uppercase tracking-tighter">Número / ID / Alias en plataforma</label>
                <input 
                  value={value} 
                  onChange={e => setValue(e.target.value)} 
                  type="text" 
                  placeholder="Ej: 78979555..." 
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500 font-mono" 
                />
             </div>
             <button 
              disabled={!value} 
              onClick={handleSave}
              className="w-full bg-blue-600 disabled:opacity-50 text-white rounded-xl py-3.5 font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-600/20 active:scale-95 transition-all mt-2"
             >
               {isEditing ? 'Actualizar Cuenta' : 'Guardar Cuenta'}
             </button>
          </div>
        </div>
      </div>
    </>
  );
}

function MiniAddPlatformModal({ onAdd, onClose, store, ownerFilter, platformId }: { onAdd: (id: string) => void, onClose: () => void, store: any, ownerFilter?: string, platformId?: string }) {
  const platformToEdit = platformId ? store.platforms.find((p: any) => p.id === platformId) : null;
  const [type, setType] = useState<'Fiat' | 'Crypto'>(platformToEdit?.type || 'Fiat');
  const [name, setName] = useState(platformToEdit?.name || '');

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100]" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-[100] flex sm:items-center justify-center pointer-events-none p-4">
        <div className="bg-slate-950 pointer-events-auto border border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
             <h3 className="text-white font-black text-xs uppercase tracking-widest">{platformId ? 'Editar Plataforma' : 'Nueva Plataforma'}</h3>
             <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
          </div>
          <div className="p-5 space-y-4">
             <div className="space-y-1 text-xs">
               <label className="text-slate-500 font-bold uppercase tracking-tighter">Tipo de Método</label>
               <select value={type} onChange={e => setType(e.target.value as 'Fiat' | 'Crypto')} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-emerald-500 appearance-none">
                 <option value="Fiat">Fiat / Banco</option>
                 <option value="Crypto">Crypto / Exchange</option>
               </select>
             </div>
             <div className="space-y-1 text-xs">
                <label className="text-slate-500 font-bold uppercase tracking-tighter">Nombre Comercial</label>
                <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Ej: Binance, BCP..." className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-emerald-500" />
             </div>
             <button 
              disabled={!name} 
              onClick={() => {
                if (platformId) {
                  store.updatePlatform(platformId, { type, name });
                  onAdd(platformId);
                } else {
                  const id = Date.now().toString();
                  store.addPlatform({ id, type, name, owner: ownerFilter || 'Mias', accounts: [] });
                  onAdd(id);
                }
              }} 
              className="w-full bg-emerald-600 disabled:opacity-50 text-white rounded-xl py-3.5 font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition-all mt-2"
             >
               {platformId ? 'Actualizar Plataforma' : 'Registrar Plataforma'}
             </button>
          </div>
        </div>
      </div>
    </>
  );
}

function CapitalModal({ type, onClose }: { type: 'Deposit' | 'Withdrawal', onClose: () => void }) {
  const store = useAppStore();
  const title = type === 'Deposit' ? 'Agregar Capital' : 'Retirar Capital';
  const colorClass = type === 'Deposit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700';

  const [currency, setCurrency] = useState(store.baseCrypto);
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const accounts = store.accounts.filter(a => a.currency === currency && a.ownerType !== 'Cliente');

  React.useEffect(() => {
    if (accounts.length > 0 && (!accountId || !accounts.find(a => a.id === accountId))) {
      setAccountId(accounts[0].id);
    } else if (accounts.length === 0) {
      setAccountId('');
    }
  }, [currency, accounts, accountId]);

  const handleSave = () => {
    if (!accountId || !amount) return;
    store.addMovement({
      id: Date.now().toString(),
      type,
      currency,
      accountId,
      amount: parseFloat(amount) || 0,
      notes,
      date: new Date().toISOString()
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex sm:items-center justify-center pointer-events-none sm:p-4">
         <div className="bg-slate-900 pointer-events-auto sm:border border-t border-slate-800 w-full max-w-md max-h-[90vh] sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
              <h2 className="text-lg font-bold text-white">{title}</h2>
              <button onClick={onClose} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 touch-pan-y">
               <div className="space-y-1 relative">
                 <label className="text-xs text-slate-400">Moneda</label>
                 <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-white appearance-none outline-none focus:border-blue-500">
                    {store.currencies.map(c => <option key={c.symbol} value={c.symbol}>{c.symbol}</option>)}
                 </select>
                 <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-[34px] pointer-events-none" />
               </div>
               
               <div className="space-y-1">
                 <label className="text-xs text-slate-400">Cuenta</label>
                 <AccountPicker 
                   value={accountId}
                   currency={currency}
                   excludeOwner="Cliente"
                   onSelect={setAccountId}
                 />
               </div>

               {accountId && (
                 <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-3 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-blue-400">
                     <Wallet className="w-4 h-4" />
                     <span className="text-xs font-semibold">Saldo Actual</span>
                   </div>
                   <div className="text-white font-bold">
                     {getAccountBalance(accountId, store).toFixed(currency === 'BTC' ? 5 : 2)} {currency}
                   </div>
                 </div>
               )}

               <div className="space-y-1">
                 <label className="text-xs text-slate-400">{type === 'Deposit' ? 'Monto a agregar' : 'Monto a retirar'} ({currency})</label>
                 <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`Ej: 100 ${currency}`} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500 font-medium" />
               </div>

               <div className="space-y-1">
                 <label className="text-xs text-slate-400">Notas (opcional)</label>
                 <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Origen del depósito, motivo del retiro, etc." className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500 resize-none text-sm" />
               </div>
            </div>

            <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4 border-t border-slate-800 flex gap-3 shrink-0 bg-slate-900">
               <button onClick={handleSave} disabled={!accountId || !amount} className={cn("flex-1 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50", colorClass)}>{title}</button>
               <button onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-colors">Cancelar</button>
            </div>
         </div>
      </div>
    </>
  );
}

interface PlatformCardProps {
  platform: any;
  onRemovePlatform: (id: string) => void;
  onRemoveAccount: (id: string, idx: number) => void;
}

const PlatformCard: React.FC<PlatformCardProps> = ({ 
  platform: p, 
  onRemovePlatform, 
  onRemoveAccount 
}) => {
  const store = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const linkedSystemAccounts = store.accounts.filter(a => 
    a.platformId === p.id || 
    a.paymentMethods?.some(pm => pm.type === p.id)
  );

  const accountCount = (p.accounts?.length || 0) + (p.details ? 1 : 0) + linkedSystemAccounts.length;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm group">
      <div 
        className={cn(
          "bg-slate-900/40 px-4 py-3 flex items-center justify-between transition-colors cursor-pointer hover:bg-slate-800/40",
          isExpanded && "border-b border-slate-800/50"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", p.type === 'Fiat' ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]")} />
          <span className="font-bold text-sm text-slate-100">{p.name}</span>
          <span className={cn(
            "text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
            p.type === 'Fiat' ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-teal-500/10 text-teal-400 border border-teal-500/20"
          )}>
            {p.type}
          </span>
          <span className="text-[10px] text-slate-500 font-bold ml-1">{accountCount} ctas.</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRemovePlatform(p.id);
            }} 
            className="text-slate-600 hover:text-red-500 p-2 transition-all hover:bg-red-500/5 rounded-full"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <ChevronDown className={cn("w-4 h-4 text-slate-500 transition-transform duration-300", isExpanded && "rotate-180")} />
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-3 space-y-2.5 bg-slate-900/10 animate-in slide-in-from-top-2 duration-200">
          {/* System Linked Accounts */}
          {linkedSystemAccounts.map(acc => (
            <div key={acc.id} className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3.5 flex items-center justify-between group/row hover:bg-blue-500/10 hover:border-blue-500/40 transition-all shadow-sm">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] bg-blue-500 text-white font-black uppercase px-1.5 py-0.5 rounded tracking-widest">Enlazada</span>
                  <span className="text-xs text-white font-bold">{acc.name}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">{acc.currency}</span>
                </div>
                <div className="flex gap-2">
                   {acc.paymentMethods?.filter(pm => pm.type === p.id).map(pm => (
                     <span key={pm.id} className="text-[13px] text-blue-400 font-mono tracking-tight font-medium">{pm.value}</span>
                   ))}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-bold text-white tracking-tight">
                  {getAccountBalance(acc.id, store).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: acc.currency === 'BTC' ? 5 : 2 })}
                </span>
                <span className="text-[8px] text-slate-500 font-black uppercase">Saldo</span>
              </div>
            </div>
          ))}

          {p.details && (
            <div className="bg-slate-900/50 border border-dashed border-slate-700/50 rounded-xl p-3 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-tight">Principal (Legacy)</span>
                <span className="text-[13px] text-white font-mono tracking-wider">{p.details}</span>
              </div>
            </div>
          )}
          
          {p.accounts?.map((acc: any, idx: number) => (
            <div key={acc.id} className="bg-slate-900 border border-slate-800/50 rounded-xl p-3.5 flex items-center justify-between group/row hover:bg-slate-800/50 hover:border-slate-700 transition-all shadow-sm">
              <div className="flex flex-col gap-1">
                {acc.label && <span className="text-[8px] text-blue-500 font-black uppercase tracking-widest">{acc.label}</span>}
                <span className="text-[13px] text-slate-200 font-mono tracking-tight font-medium">{acc.value}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveAccount(p.id, idx);
                }} 
                className="text-slate-600 hover:text-red-400 opacity-0 group-hover/row:opacity-100 transition-all p-1.5 hover:bg-red-400/5 rounded-lg"
              >
                <MinusCircle className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {(!p.accounts || p.accounts.length === 0) && !p.details && linkedSystemAccounts.length === 0 && (
            <div className="text-center py-6 text-[10px] text-slate-600 font-bold uppercase tracking-widest italic opacity-40">
              Sin cuentas registradas
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface PlatformGroupProps {
  title: string;
  platforms: any[];
  onRemovePlatform: (id: string) => void;
  onRemoveAccount: (id: string, idx: number) => void;
}

const PlatformGroup: React.FC<PlatformGroupProps> = ({ 
  title, 
  platforms, 
  onRemovePlatform, 
  onRemoveAccount 
}) => {
  return (
    <div>
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 ml-1 flex items-center gap-3">
        <div className="h-px bg-slate-800 flex-1" />
        {title} <span className="text-slate-600 font-normal">({platforms.length})</span>
        <div className="h-px bg-slate-800 flex-1" />
      </div>
      <div className="space-y-4">
        {platforms.map(p => (
          <PlatformCard 
            key={p.id} 
            platform={p} 
            onRemovePlatform={onRemovePlatform} 
            onRemoveAccount={onRemoveAccount} 
          />
        ))}
        {platforms.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-slate-800/50 rounded-2xl bg-slate-950/50">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">No hay plataformas registradas</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TransferModal({ currency: initialCurrency, onClose }: { currency: string, onClose: () => void }) {
  const store = useAppStore();
  const [currency, setCurrency] = useState(initialCurrency || store.baseCrypto);
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [destAccountId, setDestAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [commissions, setCommissions] = useState<any[]>([]);

  React.useEffect(() => {
    setSourceAccountId('');
    setDestAccountId('');
  }, [currency]);

  const addCommission = () => {
    setCommissions([...commissions, { name: '', value: 0, type: 'fixed' }]);
  };

  const updateCommission = (index: number, updates: any) => {
    const newComs = [...commissions];
    newComs[index] = { ...newComs[index], ...updates };
    setCommissions(newComs);
  };

  const removeCommission = (index: number) => {
    setCommissions(commissions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!sourceAccountId || !destAccountId || !amount || sourceAccountId === destAccountId) return;
    
    store.addTransfer({
      id: Date.now().toString(),
      sourceAccountId,
      destAccountId,
      amount: parseFloat(amount) || 0,
      commissions: commissions.map(c => ({
        name: c.name,
        value: parseFloat(c.value) || 0,
        type: c.type as 'fixed' | 'percentage'
      })),
      date: new Date().toISOString(),
      notes
    });
    onClose();
  };

  const totalCommissions = commissions.reduce((acc, c) => {
    const val = parseFloat(c.value) || 0;
    if (c.type === 'percentage') {
      return acc + (parseFloat(amount) || 0) * (val / 100);
    }
    return acc + val;
  }, 0);

  const totalCost = (parseFloat(amount) || 0) + totalCommissions;

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex sm:items-center justify-center pointer-events-none sm:p-4">
         <div className="bg-slate-900 pointer-events-auto sm:border border-t border-slate-800 w-full max-w-md max-h-[90vh] sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-blue-500" /> Transferir {currency}
              </h2>
              <button onClick={onClose} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6 touch-pan-y pt-6">
               <div className="space-y-1 relative">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Moneda</label>
                 <select 
                   value={currency} 
                   onChange={e => setCurrency(e.target.value)} 
                   className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white appearance-none outline-none focus:border-blue-500 font-bold"
                 >
                   {store.currencies.map(c => <option key={c.symbol} value={c.symbol}>{c.symbol}</option>)}
                 </select>
                 <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-[38px] pointer-events-none" />
               </div>

               <div className="space-y-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cuenta de Origen</label>
                   <AccountPicker 
                     value={sourceAccountId}
                     currency={currency}
                     excludeId={destAccountId}
                     excludeOwner="Cliente"
                     onSelect={setSourceAccountId}
                   />
                 </div>
                 
                 <div className="flex justify-center -my-2 relative z-10">
                   <div className="bg-slate-900 p-2 rounded-full border border-slate-800 shadow-xl">
                     <ChevronDown className="w-4 h-4 text-blue-500" />
                   </div>
                 </div>

                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cuenta de Destino</label>
                   <AccountPicker 
                     value={destAccountId}
                     currency={currency}
                     excludeId={sourceAccountId}
                     excludeOwner="Cliente"
                     onSelect={setDestAccountId}
                   />
                 </div>
               </div>

               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Monto a Transferir</label>
                 <div className="relative">
                   <input 
                     type="number" 
                     value={amount} 
                     onChange={e => setAmount(e.target.value)} 
                     placeholder="0.00" 
                     className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white outline-none focus:border-blue-500 font-black text-2xl tracking-tighter" 
                   />
                   <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">{currency}</span>
                 </div>
               </div>

               <div className="space-y-3">
                 <div className="flex items-center justify-between">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Comisiones / Fees</label>
                   <button 
                    onClick={addCommission}
                    className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors"
                   >
                     + Agregar Comisión
                   </button>
                 </div>
                 
                 <div className="space-y-2">
                   {commissions.map((c, idx) => (
                     <div key={idx} className="flex gap-2 items-start bg-slate-950/30 p-2 rounded-xl border border-slate-800/50 group">
                       <div className="flex-1 space-y-1">
                         <input 
                           type="text" 
                           placeholder="Nombre (ej: Red, Gas...)" 
                           value={c.name}
                           onChange={e => updateCommission(idx, { name: e.target.value })}
                           className="w-full bg-transparent border-none text-xs text-white placeholder:text-slate-700 outline-none font-bold"
                         />
                         <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              placeholder="0.00" 
                              value={c.value || ''}
                              onChange={e => updateCommission(idx, { value: e.target.value })}
                              className="bg-transparent border-none text-sm text-blue-400 font-black outline-none w-20"
                            />
                            <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                               <button 
                                 onClick={() => updateCommission(idx, { type: 'percentage' })}
                                 className={cn(
                                   "px-2 py-1 rounded text-[10px] font-black transition-all",
                                   c.type === 'percentage' ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"
                                 )}
                               >%</button>
                               <button 
                                 onClick={() => updateCommission(idx, { type: 'fixed' })}
                                 className={cn(
                                   "px-3 py-1 rounded text-[10px] font-black transition-all",
                                   c.type === 'fixed' ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"
                                 )}
                               >#</button>
                            </div>
                         </div>
                       </div>
                       <button onClick={() => removeCommission(idx)} className="p-2 text-slate-700 hover:text-red-500 transition-colors">
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                   ))}
                 </div>
               </div>

               {amount && (
                 <div className="bg-blue-600/5 rounded-2xl border border-blue-500/10 p-4 space-y-3">
                   <div className="flex justify-between text-xs">
                     <span className="text-slate-500 font-bold uppercase tracking-widest">Resumen</span>
                   </div>
                   <div className="space-y-1 pt-2 border-t border-blue-500/10">
                     <div className="flex justify-between items-center text-sm font-bold">
                       <span className="text-slate-400">Total Comisiones</span>
                       <span className="text-amber-500">{totalCommissions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</span>
                     </div>
                     <div className="flex justify-between items-center text-lg font-black pt-1">
                       <span className="text-white">Costo Total</span>
                       <span className="text-blue-500">{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</span>
                     </div>
                     <p className="text-[10px] text-slate-500 text-right font-bold uppercase">* Se descontará de la cuenta de origen</p>
                   </div>
                 </div>
               )}

               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Notas (opcional)</label>
                 <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  placeholder="Detalle de la transferencia..." 
                  className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 resize-none text-sm font-medium" 
                 />
               </div>
            </div>

            <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4 border-t border-slate-800 flex gap-3 shrink-0 bg-slate-900">
               <button 
                onClick={handleSave} 
                disabled={!sourceAccountId || !destAccountId || !amount} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all active:scale-95"
               >
                 Confirmar Transferencia
               </button>
               <button onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all">Cancelar</button>
            </div>
         </div>
      </div>
    </>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden p-5 shadow-xl shadow-black/20">
      <h2 className="text-[12px] font-black uppercase tracking-[0.15em] mb-6 flex items-center gap-3 text-slate-400">
        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 shadow-inner">
          {icon || <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
        </div>
        {title}
      </h2>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

