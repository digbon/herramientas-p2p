import React, { useState, useRef, useEffect } from 'react';
import { PaymentMethod, useAppStore } from '../store';
import { cn, formatPMName } from '../lib/utils';
import { getAccountBalance } from '../lib/balance';
import { ChevronDown, Plus, Search } from 'lucide-react';

interface PaymentMethodPickerProps {
  value: string;
  onSelect: (id: string) => void;
  currency: string;
  ownerFilter?: 'Mias' | 'Cliente';
  onlyOwnerName?: string;
  disabled?: boolean;
  placeholder?: string;
  onAddNew?: () => void;
}

export function PaymentMethodPicker({
  value,
  onSelect,
  currency,
  ownerFilter,
  onlyOwnerName,
  disabled,
  placeholder,
  onAddNew
}: PaymentMethodPickerProps) {
  const store = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredPMs = store.paymentMethods.filter((pm: PaymentMethod) => {
    if (pm.currency !== currency) return false;
    if (ownerFilter && pm.ownerType !== ownerFilter) return false;
    if (onlyOwnerName && pm.ownerName !== onlyOwnerName) return false;
    
    // search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        pm.platformChannel.toLowerCase().includes(term) ||
        pm.ownerName.toLowerCase().includes(term) ||
        (pm.orderNumber && pm.orderNumber.toString().includes(term)) ||
        (pm.platformUserId && pm.platformUserId.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const groupedPMs = filteredPMs.reduce((acc, pm) => {
     if (!acc[pm.platformChannel]) acc[pm.platformChannel] = [];
     acc[pm.platformChannel].push(pm);
     return acc;
  }, {} as Record<string, PaymentMethod[]>);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedPM = store.paymentMethods.find((pm: PaymentMethod) => pm.id === value);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-left flex items-center justify-between outline-none focus:border-blue-500 text-sm font-medium transition-colors",
          disabled && "opacity-50 cursor-not-allowed",
          !selectedPM && "text-slate-400"
        )}
      >
        <span className="truncate flex justify-between items-center w-full pr-2">
          <span>{selectedPM ? `${formatPMName(selectedPM, store.paymentMethods)} (${selectedPM.ownerName})` : (placeholder || "Selecciona un medio de pago...")}</span>
          {selectedPM && selectedPM.ownerType === 'Mias' && (
            <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded font-mono ml-2 border border-blue-500/20">
              {getAccountBalance(selectedPM.id, store).toLocaleString('en-US')} {selectedPM.currency}
            </span>
          )}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-64 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-slate-700 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Buscar por plataforma, titular o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-3">
            {Object.keys(groupedPMs).length > 0 ? (
              Object.entries(groupedPMs).map(([channel, pms]) => (
                <div key={channel}>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-1">
                    {channel}
                  </div>
                  <div className="space-y-1">
                    {pms.map(pm => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => {
                          onSelect(pm.id);
                          setIsOpen(false);
                          setSearchTerm('');
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group",
                          pm.id === value ? "bg-blue-600/20 text-blue-400" : "hover:bg-slate-800 text-slate-200"
                        )}
                      >
                         <div className="w-full">
                           <div className="font-bold flex justify-between items-center gap-4 w-full">
                             <span>
                               {formatPMName(pm, store.paymentMethods)} <span className="font-normal text-slate-400">({pm.ownerName})</span>
                             </span>
                             {pm.ownerType === 'Mias' && (
                               <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded font-mono">
                                 {getAccountBalance(pm.id, store).toLocaleString('en-US')} {pm.currency}
                               </span>
                             )}
                           </div>
                           {pm.platformUserId && (
                             <div className="text-[10px] text-slate-500 font-mono mt-0.5 group-hover:text-slate-400">
                               {pm.platformUserId}
                             </div>
                           )}
                         </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
                <div className="px-3 py-4 text-center text-xs text-slate-500">
                  No se encontraron medios de pago.
                </div>
            )}
          </div>
          
          {onAddNew && (
            <div className="p-2 border-t border-slate-700 shrink-0 bg-slate-900/50">
               <button
                 type="button"
                 onClick={() => {
                   onSelect('');
                   onAddNew();
                   setIsOpen(false);
                 }}
                 className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-widest flex items-center justify-center gap-2"
               >
                 <Plus className="w-3 h-3" /> Agregar Nuevo Medio
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
