import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { Search, ChevronDown, Check, User, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface OwnerNamePickerProps {
  value: string;
  ownerType: 'Mias' | 'Cliente';
  onSelect: (name: string, isNew?: boolean) => void;
  disabled?: boolean;
}

export function OwnerNamePicker({ value, ownerType, onSelect, disabled }: OwnerNamePickerProps) {
  const store = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Get unique owner names
  const existingNames = ownerType === 'Cliente' 
    ? store.clients.map(c => c.name)
    : Array.from(new Set(
        store.accounts
          .filter(a => a.ownerType === ownerType)
          .map(a => a.ownerName)
          .filter(Boolean)
      ));

  const filteredNames = existingNames.filter(name => 
    name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <div className="relative">
        <input
          disabled={disabled}
          type="text"
          value={value}
          onChange={(e) => {
            onSelect(e.target.value);
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => !disabled && setIsOpen(true)}
          placeholder={ownerType === 'Mias' ? "Tu nombre..." : "Nombre del cliente..."}
          className={cn(
            "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white outline-none focus:border-blue-500 font-bold transition-all pr-10",
            disabled && "opacity-50 grayscale cursor-not-allowed"
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {!disabled && (
             <button 
               onClick={() => setIsOpen(!isOpen)} 
               className="p-1 hover:bg-slate-800 rounded transition-colors"
               type="button"
             >
               <ChevronDown className={cn("w-4 h-4 text-slate-500 transition-transform", isOpen && "rotate-180")} />
             </button>
          )}
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-[100] w-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-48">
          <div className="flex-1 overflow-y-auto">
            {filteredNames.length > 0 && (
              <div className="p-2 border-b border-slate-800/50">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">Sugerencias</span>
              </div>
            )}
            {filteredNames.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onSelect(name);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 hover:bg-slate-800 rounded-xl transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-bold text-slate-200">{name}</span>
                </div>
                {value === name && <Check className="w-4 h-4 text-blue-500" />}
              </button>
            ))}
            
            {(search && (ownerType === 'Cliente' || !existingNames.includes(search))) && (
              <button
                type="button"
                onClick={() => {
                  onSelect(search, true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-blue-600/10 border-t border-slate-800 transition-colors text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-500">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                   <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                     {existingNames.includes(search) ? 'Crear nuevo perfil' : 'Registrar como nuevo'}
                   </div>
                   <div className="text-xs font-bold text-slate-300">{search}</div>
                </div>
              </button>
            )}

            {!search && filteredNames.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Escribe para buscar o crear</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
