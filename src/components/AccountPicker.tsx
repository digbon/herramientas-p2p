import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import { Search, ChevronDown, Pencil } from 'lucide-react';
import { cn } from '../lib/utils';
import { getAccountBalance } from '../lib/balance';

interface AccountPickerProps {
  value: string; // accountId
  onSelect: (accountId: string) => void;
  currency?: string; // Filter by currency if provided
  platformId?: string; // Filter by platform if provided
  excludeOwner?: string; // e.g., 'Cliente'
  onlyOwner?: string; // e.g., 'Cliente'
  placeholder?: string;
  className?: string;
  onAddNew?: () => void;
  onEdit?: (id: string) => void;
}

export function AccountPicker({ 
  value, 
  onSelect, 
  currency,
  platformId,
  excludeOwner,
  onlyOwner,
  placeholder = "Buscar cuenta...",
  className,
  onAddNew,
  onEdit
}: AccountPickerProps) {
  const store = useAppStore();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedAccount = store.accounts.find(a => a.id === value);

  const options = store.accounts
    .filter(a => !currency || a.currency === currency)
    .filter(a => {
      if (!platformId) return true;
      if (a.platformId === platformId) return true;
      return a.paymentMethods?.some(pm => pm.type === platformId);
    })
    .filter(a => !excludeOwner || a.ownerType !== excludeOwner)
    .filter(a => !onlyOwner || a.ownerType === onlyOwner)
    .filter(a => {
      const platformNames = a.paymentMethods?.map(pm => pm.label || pm.type).join(' ') || '';
      const platformValues = a.paymentMethods?.map(pm => pm.value).join(' ') || '';
      const ownerName = a.ownerName || '';
      const searchLower = search.toLowerCase();
      return a.name.toLowerCase().includes(searchLower) || 
             a.currency.toLowerCase().includes(searchLower) ||
             platformNames.toLowerCase().includes(searchLower) ||
             platformValues.toLowerCase().includes(searchLower) ||
             ownerName.toLowerCase().includes(searchLower);
    });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <div 
        className="relative cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 group-hover:text-blue-500 transition-colors" />
        <input 
          type="text"
          placeholder={placeholder}
          value={isOpen ? search : (selectedAccount ? `${selectedAccount.name} (${selectedAccount.currency})` : '')}
          onChange={e => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearch('');
          }}
          readOnly={!isOpen}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-600 cursor-pointer"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
           <ChevronDown className={cn("w-4 h-4 text-slate-500 transition-transform duration-300", isOpen && "rotate-180")} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-h-72 overflow-y-auto backdrop-blur-xl animate-in fade-in zoom-in duration-200">
          <div className="p-2 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Mis Cuentas</span>
          </div>
          {options.map(acc => {
            const balance = getAccountBalance(acc.id, store);
            return (
              <div
                key={acc.id}
                onClick={() => {
                  onSelect(acc.id);
                  setIsOpen(false);
                  setSearch('');
                }}
                className="w-full text-left px-4 py-3.5 hover:bg-slate-800/80 transition-all border-b border-slate-800/50 last:border-0 group flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-100 group-hover:text-white transition-colors truncate">{acc.name}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-black uppercase text-[8px]">{acc.currency}</span>
                    {acc.ownerName && (
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase",
                        acc.ownerType === 'Mias' ? "bg-purple-500/10 text-purple-400" : "bg-teal-500/10 text-teal-400"
                      )}>
                        {acc.ownerName}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {acc.paymentMethods?.map(pm => (
                      <span key={pm.id} className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/50 font-mono">
                        {pm.label || pm.type}: {pm.value}
                      </span>
                    ))}
                    {(!acc.paymentMethods || acc.paymentMethods.length === 0) && (
                      <span className="text-[9px] text-slate-600 italic">Sin métodos enlazados</span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end shrink-0 gap-1.5">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-white tracking-tight">
                      {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: acc.currency === 'BTC' ? 5 : 2 })}
                    </span>
                    <span className="text-[9px] text-slate-500 font-black uppercase">Saldo</span>
                  </div>
                  {onEdit && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(acc.id);
                      }}
                      className="p-1 hover:bg-theme-500/20 text-slate-500 hover:text-blue-400 rounded transition-all"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          
          {options.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-10 h-10 text-slate-800 mx-auto mb-3 opacity-20" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Sin resultados</p>
            </div>
          )}

          {onAddNew && (
            <button
              onClick={() => {
                setIsOpen(false);
                onAddNew();
              }}
              className="w-full p-3 border-t border-slate-800 text-xs font-bold text-blue-500 hover:bg-blue-500/5 transition-all text-center uppercase tracking-widest"
            >
              + Nueva Cuenta
            </button>
          )}
        </div>
      )}
    </div>
  );
}
