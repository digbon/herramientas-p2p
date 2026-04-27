import React, { useState } from 'react';
import { X, ArrowRightLeft, ChevronDown, Plus } from 'lucide-react';
import { useAppStore } from '../store';
import { PaymentMethodPicker } from '../components/PaymentMethodPicker';

interface TransferModalProps {
  currency: string;
  onClose: () => void;
}

export function TransferModal({ currency: initialCurrency, onClose }: TransferModalProps) {
  const store = useAppStore();
  
  const [currency, setCurrency] = useState(initialCurrency);
  const [sourcePaymentMethodId, setSourcePaymentMethodId] = useState('');
  const [destPaymentMethodId, setDestPaymentMethodId] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [commissions, setCommissions] = useState<{ name: string; value: string; type: "fixed" | "percentage" }[]>([]);

  const handleSave = () => {
    if (!sourcePaymentMethodId || !destPaymentMethodId || !amount) return;
    if (sourcePaymentMethodId === destPaymentMethodId) {
      alert("El medio de origen y destino no pueden ser el mismo.");
      return;
    }

    store.addTransfer({
      id: Date.now().toString(),
      sourcePaymentMethodId,
      destPaymentMethodId,
      amount: parseFloat(amount),
      commissions: commissions
        .map((c) => ({
          name: c.name,
          value: parseFloat(c.value) || 0,
          type: c.type,
        }))
        .filter((c) => c.value > 0),
      date: new Date().toISOString(),
      notes,
    });
    
    onClose();
  };

  const addCommission = () => setCommissions([...commissions, { name: "", value: "", type: "fixed" }]);
  const updateCommission = (index: number, updates: any) => {
    const newComm = [...commissions];
    newComm[index] = { ...newComm[index], ...updates };
    setCommissions(newComm);
  };
  const removeCommission = (index: number) => setCommissions(commissions.filter((_, i) => i !== index));

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex sm:items-center justify-center pointer-events-none sm:p-4">
        <div className="bg-slate-900 pointer-events-auto sm:border border-slate-800 w-full max-w-md max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
           <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
             <div className="flex items-center gap-2">
               <div className="p-1.5 rounded-full bg-blue-500/20 text-blue-500">
                 <ArrowRightLeft className="w-4 h-4"/>
               </div>
               <h2 className="text-lg font-bold text-white">Transferir Fondos</h2>
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
                    setSourcePaymentMethodId('');
                    setDestPaymentMethodId('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-white appearance-none outline-none focus:border-blue-500 font-bold"
                >
                  {store.currencies.map((c) => (
                    <option key={c.symbol} value={c.symbol}>{c.symbol}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-[34px] pointer-events-none" />
             </div>

             <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-3">
               <div className="space-y-1 relative">
                  <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Origen</label>
                  <PaymentMethodPicker
                    currency={currency}
                    ownerFilter="Mias"
                    value={sourcePaymentMethodId}
                    onSelect={setSourcePaymentMethodId}
                    placeholder={`De (tu medio en ${currency})`}
                  />
               </div>
               
               <div className="flex justify-center -my-2 relative z-10">
                 <div className="bg-slate-900 border border-slate-800 rounded-full p-1.5 shadow-lg">
                   <ArrowRightLeft className="w-3 h-3 text-slate-500 rotate-90" />
                 </div>
               </div>

               <div className="space-y-1 relative">
                  <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Destino</label>
                  <PaymentMethodPicker
                    currency={currency}
                    ownerFilter="Mias"
                    value={destPaymentMethodId}
                    onSelect={setDestPaymentMethodId}
                    placeholder={`Hacia (tu medio en ${currency})`}
                  />
               </div>
             </div>

             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Monto a Transferir*</label>
               <input 
                  type="number" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  placeholder="0.00" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white outline-none focus:border-blue-500 font-bold" 
                />
             </div>

             <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-400 text-xs">Comisiones (Descontadas del origen)</label>
                  <button onClick={addCommission} className="text-blue-500 hover:text-blue-400 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {commissions.map((comm, idx) => (
                  <div key={idx} className="space-y-1 bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={comm.name}
                        onChange={(e) => updateCommission(idx, { name: e.target.value })}
                        placeholder="Nombre (ej: Red ETH)"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-xs text-white outline-none"
                      />
                      <button onClick={() => removeCommission(idx)} className="p-2 text-slate-500 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-[2]">
                        <input
                          type="number"
                          value={comm.value}
                          onChange={(e) => updateCommission(idx, { value: e.target.value })}
                          placeholder="Monto"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-xs text-white outline-none"
                        />
                      </div>
                      <div className="relative flex-1">
                        <select
                          value={comm.type}
                          onChange={(e) => updateCommission(idx, { type: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-xs text-white appearance-none outline-none"
                        >
                          <option value="fixed">Fijo</option>
                          <option value="percentage">%</option>
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                ))}
             </div>
             
             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Notas (Opcional)</label>
               <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  placeholder="Detalles..." 
                  className="w-full h-16 bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white outline-none focus:border-blue-500 resize-none text-sm" 
                />
             </div>
           </div>
           
           <div className="p-4 border-t border-slate-800 flex gap-3 shrink-0 bg-slate-900">
             <button disabled={!sourcePaymentMethodId || !destPaymentMethodId || !amount} onClick={handleSave} className="flex-1 bg-blue-600 disabled:opacity-50 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors">
               Registrar Transferencia
             </button>
           </div>
        </div>
      </div>
    </>
  );
}
