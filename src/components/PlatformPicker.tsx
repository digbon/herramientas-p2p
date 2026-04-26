import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import { Search, ChevronDown, User, Users, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';

interface PlatformPickerProps {
  value: string;
  onSelect: (platformId: string, accountValue: string, platformName: string) => void;
  ownerFilter?: 'Mias' | 'Cliente';
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PlatformPicker({ 
  value, 
  onSelect, 
  ownerFilter, 
  placeholder = "Buscar plataforma o cuenta...",
  className,
  disabled
}: PlatformPickerProps) {
  const store = useAppStore();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get selected display text
  const selectedOption = store.platforms
    .flatMap(p => [
      ...(p.accounts || []).map(acc => ({ p, accValue: acc.value, accLabel: acc.label })),
      ...(p.details ? [{ p, accValue: p.details, accLabel: 'Principal' }] : [])
    ])
    .find(opt => opt.accValue === value);

  const options = store.platforms
    .filter(p => !ownerFilter || p.owner === ownerFilter)
    .flatMap(p => {
      const results: any[] = [];
      
      if (p.details) {
        results.push({
          platform: p,
          accountValue: p.details,
          display: p.name,
          subtext: p.details,
          label: 'Principal',
          id: `${p.id}-legacy`,
          type: p.type
        });
      }

      if (p.accounts && p.accounts.length > 0) {
        p.accounts.forEach((acc, idx) => {
          results.push({
            platform: p,
            accountValue: acc.value,
            display: p.name,
            subtext: acc.value,
            label: acc.label,
            id: `${p.id}-acc-${idx}`,
            type: p.type
          });
        });
      }

      if (results.length === 0) {
        results.push({
          platform: p,
          accountValue: '',
          display: p.name,
          subtext: 'Sin cuenta registrada',
          id: p.id,
          type: p.type
        });
      }

      return results;
    })
    .filter(opt => 
      opt.display.toLowerCase().includes(search.toLowerCase()) || 
      opt.subtext.toLowerCase().includes(search.toLowerCase()) ||
      (opt.label && opt.label.toLowerCase().includes(search.toLowerCase()))
    );

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
        className={cn(
          "relative group",
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 group-hover:text-blue-500 transition-colors" />
        <input 
          disabled={disabled}
          type="text"
          placeholder={placeholder}
          value={isOpen ? search : (selectedOption ? `${selectedOption.p.name} - ${selectedOption.accValue}` : '')}
          onChange={e => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (!disabled) {
              setIsOpen(true);
              setSearch('');
            }
          }}
          readOnly={!isOpen}
          className={cn(
            "w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-600",
            disabled ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer"
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
           <ChevronDown className={cn("w-4 h-4 text-slate-500 transition-transform duration-300", isOpen && "rotate-180")} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-h-72 overflow-y-auto backdrop-blur-xl animate-in fade-in zoom-in duration-200">
          <div className="p-2 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Resultados</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => {
                onSelect(opt.platform.id, opt.accountValue, opt.platform.name);
                setIsOpen(false);
                setSearch('');
              }}
              className="w-full text-left px-4 py-3.5 hover:bg-slate-800/80 transition-all border-b border-slate-800/50 last:border-0 group flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-slate-100 group-hover:text-white transition-colors truncate">{opt.display}</span>
                  {opt.label && (
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">{opt.label}</span>
                  )}
                </div>
                <div className="text-xs text-slate-500 font-mono group-hover:text-blue-400 transition-colors truncate tracking-tighter">
                  {opt.subtext}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={cn(
                  "text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border",
                  opt.type === 'Fiat' 
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                    : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                )}>
                  {opt.type}
                </span>
                {opt.platform.owner === 'Mias' && (
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.5)]" />
                    <span className="text-[8px] font-bold text-slate-500 uppercase">Verificada</span>
                  </div>
                )}
              </div>
            </button>
          ))}
          
          {options.length === 0 && search && (
            <div className="p-8 text-center">
              <Search className="w-10 h-10 text-slate-800 mx-auto mb-3 opacity-20" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Sin resultados</p>
              <p className="text-[10px] text-slate-600 mt-2">Prueba buscando otro nombre o número</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
