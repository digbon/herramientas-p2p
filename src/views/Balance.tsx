import React, { useState } from 'react';
import { useAppStore } from '../store';
import { PlusCircle, MinusCircle, X, Pencil, Plus, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

export function Balance() {
  const store = useAppStore();
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const getSaldoActual = (accountId: string) => {
    const account = store.accounts.find(a => a.id === accountId);
    if (!account) return 0;
    
    let balance = account.initialBalance;
    store.movements.forEach(m => {
      if (m.accountId === accountId) {
         if (m.type === 'Deposit') balance += m.amount;
         if (m.type === 'Withdrawal') balance -= m.amount;
      }
    });

    store.operations.forEach(op => {
       if (op.sourceAccountId === accountId) balance -= op.amountSent;
       if (op.destAccountId === accountId) balance += op.amountReceived;
    });

    return balance;
  };

  const getCryptoBalance = (symbol: string) => store.accounts.filter(a => a.currency === symbol).reduce((acc, a) => acc + getSaldoActual(a.id), 0);
  const getFiatBalance = (symbol: string) => store.accounts.filter(a => a.currency === symbol).reduce((acc, a) => acc + getSaldoActual(a.id), 0);

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
                  en {store.accounts.filter(a => a.currency === c.symbol).length} cuenta(s)
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
                  en {store.accounts.filter(a => a.currency === c.symbol).length} cuenta(s)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Balance</h1>
        <p className="text-sm text-slate-400 mb-4">Gestiona tus cuentas y saldos por moneda.</p>
        
        <div className="flex gap-3 mb-6">
           <button onClick={() => setIsDepositOpen(true)} className="flex-1 bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
             <PlusCircle className="w-5 h-5" /> Agregar Capital
           </button>
           <button onClick={() => setIsWithdrawOpen(true)} className="flex-1 bg-amber-500/20 text-amber-500 border border-amber-500/30 hover:bg-amber-500/30 transition-colors py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
             <MinusCircle className="w-5 h-5" /> Retirar Capital
           </button>
        </div>

        <div className="space-y-6">
          {store.currencies.map(currency => {
             const accounts = store.accounts.filter(a => a.currency === currency.symbol);
             
             return (
               <div key={currency.symbol} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs">
                        {currency.symbol.slice(0, 3)}
                     </div>
                     <div>
                       <div className="flex items-center gap-2">
                         <span className="font-bold text-lg text-white">{currency.symbol}</span>
                         <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase">{currency.type}</span>
                       </div>
                       <div className="text-xs text-slate-500">{accounts.length} cuentas</div>
                     </div>
                   </div>
                   
                   <button 
                     onClick={() => store.addAccount({ id: Date.now().toString(), currency: currency.symbol, name: `Cuenta ${accounts.length + 1}`, initialBalance: 0 })}
                     className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                   >
                     <Plus className="w-4 h-4" /> Cuenta
                   </button>
                 </div>

                 <div className="space-y-3">
                   {accounts.map((acc, i) => {
                     const isLast = accounts.length === 1;
                     return (
                       <div key={acc.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 relative">
                         <div className="flex items-center justify-between mb-3">
                           <div className="flex items-center gap-2">
                             <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded">#{i + 1}</span>
                             <span className="font-bold text-sm text-white">{acc.name}</span>
                             <button className="text-slate-500 hover:text-white"><Pencil className="w-3 h-3" /></button>
                           </div>
                           <button 
                             onClick={() => {
                               if (isLast) {
                                 alert(`No se puede eliminar la única cuenta de ${currency.symbol}. Cada moneda activa debe tener al menos una cuenta.`);
                               } else {
                                 store.removeAccount(acc.id);
                               }
                             }}
                             className="text-slate-500 hover:text-red-500"
                           >
                             <X className="w-4 h-4" />
                           </button>
                         </div>
                         
                         <div className="flex gap-2">
                           <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5">
                             <div className="text-[10px] text-slate-500 font-bold mb-1">SALDO ACTUAL</div>
                             <div className="font-bold text-base text-white">{getSaldoActual(acc.id).toFixed(2)}</div>
                           </div>
                           <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5">
                             <div className="text-[10px] text-slate-500 font-bold mb-1">SALDO INICIAL</div>
                             <EditInitialBalance account={acc} />
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
             El saldo actual de cada cuenta = saldo inicial + depósitos - retiros + efecto de las operaciones registradas. Para añadir o retirar capital usa los botones de arriba; el historial seguirá mostrando esos movimientos.
           </p>
        </div>

      </div>

      {isDepositOpen && <CapitalModal type="Deposit" onClose={() => setIsDepositOpen(false)} />}
      {isWithdrawOpen && <CapitalModal type="Withdrawal" onClose={() => setIsWithdrawOpen(false)} />}
    </div>
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

  const accounts = store.accounts.filter(a => a.currency === currency);

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
               
               <div className="space-y-1 relative">
                 <label className="text-xs text-slate-400">Cuenta</label>
                 <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-white appearance-none outline-none focus:border-blue-500 disabled:opacity-50">
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    {accounts.length === 0 && <option value="">Sin cuentas</option>}
                 </select>
                 <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-[34px] pointer-events-none" />
               </div>

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

function EditInitialBalance({ account }: { account: any }) {
  const store = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(account.initialBalance.toString());

  if (isEditing) {
    return (
      <input 
        autoFocus
        type="number"
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={() => {
          store.updateAccountInitialBalance(account.id, parseFloat(val) || 0);
          setIsEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
             store.updateAccountInitialBalance(account.id, parseFloat(val) || 0);
             setIsEditing(false);
          }
        }}
        className="w-full bg-slate-800 border-none rounded py-0.5 px-1 text-white font-bold text-base outline-none"
      />
    );
  }
  return (
    <div className="flex justify-between items-center group cursor-pointer" onClick={() => setIsEditing(true)}>
       <span className="font-bold text-base text-white">{account.initialBalance.toFixed(2)}</span>
       <Pencil className="w-3.5 h-3.5 text-slate-500" />
    </div>
  );
}
