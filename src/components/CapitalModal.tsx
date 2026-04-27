import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import { useAppStore } from '../store';
import { PaymentMethodPicker } from '../components/PaymentMethodPicker';
import { cn } from '../lib/utils';

interface CapitalModalProps {
  type: 'Deposit' | 'Withdrawal';
  onClose: () => void;
}

export function CapitalModal({ type, onClose }: CapitalModalProps) {
  const store = useAppStore();
  
  const [currency, setCurrency] = useState(store.baseFiat);
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!paymentMethodId || !amount) return;

    store.addMovement({
      id: Date.now().toString(),
      type,
      currency,
      paymentMethodId,
      amount: parseFloat(amount),
      notes,
      date: new Date().toISOString()
    });
    
    onClose();
  };

  const isDeposit = type === 'Deposit';

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex sm:items-center justify-center pointer-events-none sm:p-4">
        <div className="bg-slate-900 pointer-events-auto sm:border border-slate-800 w-full max-w-md max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
           <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
             <div className="flex items-center gap-2">
               <div className={cn("p-1.5 rounded-full", isDeposit ? "bg-emerald-500/20 text-emerald-500" : "bg-amber-500/20 text-amber-500")}>
                 {isDeposit ? <ArrowDownRight className="w-4 h-4"/> : <ArrowUpRight className="w-4 h-4"/>}
               </div>
               <h2 className="text-lg font-bold text-white">{isDeposit ? 'Registrar Capital' : 'Registrar Retiro'}</h2>
             </div>
             <button onClick={onClose} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-full">
               <X className="w-5 h-5"/>
             </button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-4 touch-pan-y">
             <div className="space-y-1 relative">
                <label className="text-xs text-slate-400">Moneda</label>
                <select
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.target.value);
                    setPaymentMethodId('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-white appearance-none outline-none focus:border-blue-500 font-bold"
                >
                  {store.currencies.map((c) => (
                    <option key={c.symbol} value={c.symbol}>{c.symbol}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-[34px] pointer-events-none" />
             </div>

             <div className="space-y-1 relative">
                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">
                  Medio de Pago a afectar
                </label>
                <PaymentMethodPicker
                  currency={currency}
                  ownerFilter="Mias"
                  value={paymentMethodId}
                  onSelect={setPaymentMethodId}
                  placeholder={`Seleccionar tu medio (${currency})`}
                />
             </div>

             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Monto*</label>
               <input 
                  type="number" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  placeholder="0.00" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white outline-none focus:border-blue-500 font-bold" 
                />
             </div>
             
             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Notas (Opcional)</label>
               <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  placeholder="Detalles de la transacción..." 
                  className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white outline-none focus:border-blue-500 resize-none text-sm" 
                />
             </div>
           </div>
           
           <div className="p-4 border-t border-slate-800 flex gap-3 shrink-0 bg-slate-900">
             <button disabled={!paymentMethodId || !amount} onClick={handleSave} className="flex-1 bg-blue-600 disabled:opacity-50 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors">
               Registrar {isDeposit ? 'Capital' : 'Retiro'}
             </button>
           </div>
        </div>
      </div>
    </>
  );
}
