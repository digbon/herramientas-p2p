import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAppStore, PaymentMethod } from '../store';
import { PlatformChannelPicker } from './PlatformChannelPicker';
import { OwnerNameInputPicker } from './OwnerNameInputPicker';
import { formatPMName } from '../lib/utils';

interface PaymentMethodModalProps {
  pm: PaymentMethod;
  onClose: () => void;
  isNew: boolean;
  onSuccess?: (id: string) => void;
}

export function PaymentMethodModal({ pm, onClose, isNew, onSuccess }: PaymentMethodModalProps) {
  const store = useAppStore();
  const [platformChannel, setPlatformChannel] = useState(pm.platformChannel);
  const [ownerName, setOwnerName] = useState(pm.ownerName);
  const [platformUserId, setPlatformUserId] = useState(pm.platformUserId);
  const [initialBalance, setInitialBalance] = useState(pm.initialBalance.toString());
  
  const [newInfo, setNewInfo] = useState('');

  const handleSave = () => {
    let savedId = pm.id;
    if (isNew) {
      if (!platformChannel || !ownerName) return; 
      
      const newPM: PaymentMethod = {
        ...pm,
        platformChannel,
        ownerName,
        platformUserId,
        initialBalance: parseFloat(initialBalance) || 0,
        additionalInfo: newInfo ? [{ id: Date.now().toString(), date: new Date().toISOString(), content: newInfo }] : []
      };
      savedId = store.addPaymentMethod(newPM);
    } else {
      if (newInfo.trim()) {
        store.addPaymentMethodInfo(pm.id, {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          content: newInfo
        });
      }
    }
    if (onSuccess) onSuccess(savedId);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[70]" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-[70] flex sm:items-center justify-center pointer-events-none sm:p-4">
        <div className="bg-slate-900 pointer-events-auto sm:border border-slate-800 w-full max-w-md max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
           <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
             <h2 className="text-lg font-bold text-white">{isNew ? 'Nuevo Medio de Pago' : 'Agregar Info'}</h2>
             <button onClick={onClose} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-full">
               <X className="w-5 h-5"/>
             </button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-4 touch-pan-y">
             {isNew ? (
               <>
                 <div className="space-y-1 relative">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Plataforma / Canal*</label>
                   <PlatformChannelPicker value={platformChannel} onChange={setPlatformChannel} />
                 </div>
                 <div className="space-y-1 relative">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Completo del Propietario*</label>
                   <OwnerNameInputPicker value={ownerName} onChange={setOwnerName} ownerType={pm.ownerType} />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ID de Usuario Plataforma</label>
                   <input type="text" value={platformUserId} onChange={e => setPlatformUserId(e.target.value)} placeholder="Opcional" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white outline-none focus:border-blue-500 font-mono text-sm" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Saldo Inicial ({pm.currency})*</label>
                   <input type="number" value={initialBalance} onChange={e => setInitialBalance(e.target.value)} placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white outline-none focus:border-blue-500 font-bold" />
                   <div className="text-[9px] text-amber-500 font-bold mt-1 uppercase">* Éste saldo no podrá modificarse luego.</div>
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Información Adicional (Opcional)</label>
                   <textarea value={newInfo} onChange={e => setNewInfo(e.target.value)} placeholder="Anotaciones extra..." className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white outline-none focus:border-blue-500 resize-none text-sm" />
                 </div>
               </>
             ) : (
               <>
                 <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4 space-y-1">
                   <div className="text-blue-400 font-bold text-sm">{formatPMName(pm, store.paymentMethods)}</div>
                   <div className="text-white text-sm">Propietario: <span className="text-slate-400">{pm.ownerName}</span></div>
                   <div className="text-sm text-white">Moneda: <span className="text-slate-400">{pm.currency}</span></div>
                   <div className="text-[10px] text-slate-500 mt-2 p-2 bg-slate-900 rounded border border-slate-800 border-dashed uppercase font-bold tracking-widest leading-relaxed">
                     Los datos base no se pueden modificar por seguridad. Añade un nuevo INFO RECORD abajo.
                   </div>
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nueva Información Adicional</label>
                   <textarea value={newInfo} onChange={e => setNewInfo(e.target.value)} placeholder="Escribe aquí el nuevo registro de información..." className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white outline-none focus:border-blue-500 resize-none text-sm" />
                 </div>
               </>
             )}
           </div>
           
           <div className="p-4 border-t border-slate-800 flex gap-3 shrink-0 bg-slate-900">
             <button disabled={isNew && (!platformChannel || !ownerName)} onClick={handleSave} className="flex-1 bg-blue-600 disabled:opacity-50 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors">
               {isNew ? 'Crear Medio de Pago' : 'Agregar Info'}
             </button>
           </div>
        </div>
      </div>
    </>
  );
}
