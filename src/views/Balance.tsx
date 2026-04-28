import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppStore, PaymentMethod, InfoRecord } from '../store';
import { PlusCircle, MinusCircle, X, Pencil, Plus, ChevronDown, Wallet, Search, Trash2, ArrowRightLeft, Upload, Link2 } from 'lucide-react';
import { cn, formatPMName } from '../lib/utils';
import { getAccountBalance } from '../lib/balance';
import { CapitalModal } from '../components/CapitalModal';
import { TransferModal } from '../components/TransferModal';
import { PaymentMethodModal } from '../components/PaymentMethodModal';

export function Balance() {
  const store = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const isDepositOpen = searchParams.get('modal') === 'deposit';
  const isWithdrawOpen = searchParams.get('modal') === 'withdraw';
  const isTransferOpen = searchParams.get('modal') === 'transfer';
  const isPMEditOpen = searchParams.get('modal') === 'edit_pm';
  const isPMNewOpen = searchParams.get('modal') === 'new_pm';
  
  const transferCurrency = searchParams.get('currency') || '';
  const pmIdToEdit = searchParams.get('pm_id') || '';

  const [newCurrency, setNewCurrency] = useState('');
  const [newCurrencyType, setNewCurrencyType] = useState<'Fiat'|'Crypto'>('Fiat');

  // We fall back to a derived object if creating anew
  const paymentMethodToEdit = isPMEditOpen && pmIdToEdit
    ? store.paymentMethods.find(p => p.id === pmIdToEdit)
    : isPMNewOpen
    ? {
        id: Date.now().toString(),
        orderNumber: 0,
        platformChannel: '',
        ownerName: '',
        platformUserId: '',
        currency: transferCurrency, // using transferCurrency for passing pm currency on creation
        initialBalance: 0,
        ownerType: 'Mias',
        additionalInfo: []
      } as PaymentMethod
    : null;

  const closeModal = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      setSearchParams(prev => { 
        prev.delete('modal'); 
        prev.delete('currency'); 
        prev.delete('pm_id'); 
        return prev; 
      }, { replace: true });
    }
  };

  const getSaldoActual = (pmId: string) => getAccountBalance(pmId, store);

  const getCryptoBalance = (symbol: string) => store.paymentMethods.filter((p: PaymentMethod) => p.currency === symbol && p.ownerType !== 'Cliente').reduce((acc, p: PaymentMethod) => acc + getSaldoActual(p.id), 0);
  const getFiatBalance = (symbol: string) => store.paymentMethods.filter((p: PaymentMethod) => p.currency === symbol && p.ownerType !== 'Cliente').reduce((acc, p: PaymentMethod) => acc + getSaldoActual(p.id), 0);

  const cryptoCurrencies = store.currencies.filter(c => c.type === 'Crypto');
  const fiatCurrencies = store.currencies.filter(c => c.type === 'Fiat');

  return (
    <div className="space-y-6 pb-20">
      
      {/* Resumen Superior */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2 uppercase px-1">
            <span>Cripto</span>
            <span>{cryptoCurrencies.length} monedas</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cryptoCurrencies.map(c => (
              <div key={c.symbol} className="bg-teal-500/20 border border-teal-500/30 rounded-xl p-4 shadow-lg shadow-teal-500/5">
                <div className="flex justify-between items-center text-teal-300 text-sm font-medium mb-2">
                  <span>Balance</span>
                  <span className="font-bold">{c.symbol}</span>
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {getCryptoBalance(c.symbol).toFixed(5).replace(/\.?0+$/, '') || '0.00'}
                </div>
                <div className="text-[10px] text-teal-300/70 mt-1">
                  en {store.paymentMethods.filter((p: PaymentMethod) => p.currency === c.symbol && p.ownerType !== 'Cliente').length} medios
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2 uppercase px-1">
            <span>Fiat</span>
            <span>{fiatCurrencies.length} moneda(s)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
             {fiatCurrencies.map(c => (
              <div key={c.symbol} className="bg-purple-600 border border-purple-500 rounded-xl p-4 shadow-lg shadow-purple-600/20">
                 <div className="flex justify-between items-center text-purple-200 text-sm font-medium mb-2">
                  <span>Balance</span>
                  <span className="font-bold">{c.symbol}</span>
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {getFiatBalance(c.symbol).toFixed(2)}
                </div>
                <div className="text-[10px] text-purple-200/70 mt-1">
                  en {store.paymentMethods.filter((p: PaymentMethod) => p.currency === c.symbol && p.ownerType !== 'Cliente').length} medios
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Medios de pago</h1>
        <p className="text-sm text-slate-400 mb-4">Gestiona tus medios de pago por moneda y canal.</p>
        
        <div className="grid grid-cols-3 gap-3 mb-6">
           <button onClick={() => setSearchParams({ modal: 'deposit' })} className="bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors py-4 rounded-xl font-semibold flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-500/5">
             <PlusCircle className="w-5 h-5" />
             <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400/80">Depositar</span>
           </button>
           <button onClick={() => setSearchParams({ modal: 'withdraw' })} className="bg-amber-500/20 text-amber-500 border border-amber-500/30 hover:bg-amber-500/30 transition-colors py-4 rounded-xl font-semibold flex flex-col items-center justify-center gap-1 shadow-lg shadow-amber-500/5">
             <MinusCircle className="w-5 h-5" />
             <span className="text-[10px] uppercase font-black tracking-widest text-amber-400/80">Retirar</span>
           </button>
           <button 
             onClick={() => setSearchParams({ modal: 'transfer', currency: store.baseCrypto })}
             className="bg-blue-600/20 text-blue-500 border border-blue-500/30 hover:bg-blue-600/30 transition-colors py-4 rounded-xl font-semibold flex flex-col items-center justify-center gap-1 shadow-lg shadow-blue-500/5"
           >
             <ArrowRightLeft className="w-5 h-5" />
             <span className="text-[10px] uppercase font-black tracking-widest text-blue-400/80">Transferir</span>
           </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {store.currencies.map(currency => {
             const pms = store.paymentMethods.filter((p: PaymentMethod) => p.currency === currency.symbol && p.ownerType === 'Mias');
             
             return (
               <div key={currency.symbol} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 flex flex-col">
                 <div className="flex items-center justify-between gap-4">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-white text-sm shadow-inner group shrink-0">
                        {currency.symbol.slice(0, 3)}
                     </div>
                     <div className="min-w-0">
                       <div className="flex items-center gap-2">
                         <span className="font-black text-xl text-white tracking-tighter truncate">{currency.symbol}</span>
                         <span className="text-[10px] font-black bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-widest shrink-0">{currency.type}</span>
                       </div>
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{pms.length} medios registrados</div>
                     </div>
                   </div>
                   <button 
                     onClick={() => setSearchParams({ modal: 'new_pm', currency: currency.symbol })}
                     className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95 whitespace-nowrap"
                   >
                     <Plus className="w-4 h-4" /> Nuevo Medio
                   </button>
                 </div>

                 {pms.length > 0 ? (
                 <div className="space-y-4 flex-1">
                   {Object.entries(
                     pms.reduce((acc: Record<string, PaymentMethod[]>, pm: PaymentMethod) => {
                       if (!acc[pm.platformChannel]) acc[pm.platformChannel] = [];
                       acc[pm.platformChannel].push(pm);
                       return acc;
                     }, {})
                   ).map(([platformName, platformPms]) => (
                     <div key={platformName} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-3 space-y-3">
                        <div className="flex items-center gap-2 mb-2 p-1 border-b border-slate-800/50 pb-2">
                           <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                           <h3 className="text-white font-bold tracking-tight">{platformName}</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {platformPms.map(pm => (
                             <PaymentMethodCard 
                               key={pm.id} 
                               pm={pm} 
                               onAddInfo={() => setSearchParams({ modal: 'edit_pm', pm_id: pm.id })}
                             />
                          ))}
                        </div>
                     </div>
                   ))}
                 </div>
                 ) : (
                   <div className="flex-1 min-h-[100px] flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl">
                      <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Sin medios para {currency.symbol}</p>
                   </div>
                 )}
               </div>
             );
          })}
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SectionCard title="Configuración de Entorno">
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

          <SectionCard title="Configuración de Divisas">
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
                  className="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 uppercase font-black"
                  value={newCurrency}
                  onChange={e => setNewCurrency(e.target.value.toUpperCase())}
                />
                <div className="relative shrink-0">
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
                  className="w-11 h-11 shrink-0 bg-blue-600 hover:bg-blue-700 flex items-center justify-center rounded-xl text-white shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
            </div>
          </SectionCard>
        </div>
      </div>

      {isDepositOpen && <CapitalModal type="Deposit" onClose={closeModal} />}
      {isWithdrawOpen && <CapitalModal type="Withdrawal" onClose={closeModal} />}
      {isTransferOpen && <TransferModal currency={transferCurrency} onClose={closeModal} />}
      {paymentMethodToEdit && (isPMEditOpen || isPMNewOpen) && <PaymentMethodModal pm={paymentMethodToEdit} isNew={isPMNewOpen} onClose={closeModal} />}
    </div>
  );
}

function SectionCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
      </div>
      {children}
    </div>
  );
}

const PaymentMethodCard: React.FC<{ pm: PaymentMethod, onAddInfo: () => void }> = ({ pm, onAddInfo }) => {
  const store = useAppStore();
  const currentBalance = getAccountBalance(pm.id, store);
  return (
    <div className="border border-slate-800 rounded-lg p-3 bg-slate-900 space-y-3 relative group">
       <div className="flex justify-between items-start">
         <span className="text-blue-400 font-black text-[13px] max-w-[75%] truncate" title={formatPMName(pm, store.paymentMethods)}>{formatPMName(pm, store.paymentMethods)}</span>
         <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded", pm.ownerType === 'Mias' ? "bg-purple-500/10 text-purple-400" : "bg-emerald-500/10 text-emerald-400")}>
           {pm.ownerType === 'Mias' ? 'Mía' : pm.ownerType}
         </span>
       </div>
       <div className="space-y-1">
         <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Propietario</div>
         <div className="text-white font-medium text-sm">{pm.ownerName || 'Sin especificar'}</div>
       </div>
       <div className="space-y-1">
         <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">ID Plataforma</div>
         <div className="text-slate-300 font-mono text-sm">{pm.platformUserId || '---'}</div>
       </div>
       <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/50">
         <div>
           <div className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Saldo Inicial</div>
           <div className="text-slate-400 font-medium text-xs">{pm.initialBalance.toLocaleString()} {pm.currency}</div>
         </div>
         <div className="text-right">
           <div className="text-[9px] text-blue-500 uppercase tracking-widest font-black">Saldo Actual</div>
           <div className="text-white font-bold text-sm tracking-tight">{currentBalance.toLocaleString()}</div>
         </div>
       </div>
       
       <div className="pt-2">
         {pm.additionalInfo && pm.additionalInfo.length > 0 && (
           <div className="space-y-1 mb-2">
             <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Información Adicional</div>
             {pm.additionalInfo.map(info => (
               <div key={info.id} className="text-xs text-slate-400 bg-slate-950 p-1.5 rounded border border-slate-800/50">
                 {info.content}
               </div>
             ))}
           </div>
         )}
         <button onClick={onAddInfo} className="w-full text-center text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
           <Plus className="w-3 h-3" /> Agregar Info
         </button>
       </div>
    </div>
  );
}
