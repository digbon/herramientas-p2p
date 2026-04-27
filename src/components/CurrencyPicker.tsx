import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { Search, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

export function CurrencyPicker({
  value,
  onChange,
  disabled
}: {
  value: string;
  onChange: (symbol: string) => void;
  disabled?: boolean;
}) {
  const store = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  const existingSymbols = store.currencies.map(c => c.symbol);
  
  const filteredSymbols = existingSymbols.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset search term to valid value if not selecting a new one
        setSearchTerm(value);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative cursor-text" onClick={() => !disabled && setIsOpen(true)}>
        <input
          type="text"
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          placeholder="Ej: USD, BTC"
          className={cn(
            "w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-8 py-3 text-white outline-none focus:border-blue-500 font-bold uppercase",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
          {filteredSymbols.length > 0 ? (
            <>
              {filteredSymbols.map(symbol => (
                <div
                  key={symbol}
                  className="px-4 py-2 hover:bg-slate-800 cursor-pointer text-sm font-bold text-slate-200"
                  onClick={() => {
                    setSearchTerm(symbol);
                    onChange(symbol);
                    setIsOpen(false);
                  }}
                >
                  {symbol}
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    {store.currencies.find(c => c.symbol === symbol)?.type}
                  </span>
                </div>
              ))}
              {searchTerm && !existingSymbols.find(s => s.toLowerCase() === searchTerm.toLowerCase()) && (
                 <div
                   className="px-4 py-2 hover:bg-blue-600/20 cursor-pointer text-sm font-medium text-blue-400 border-t border-slate-800"
                   onClick={() => {
                     const newSymbol = searchTerm.toUpperCase().trim();
                     store.addCurrency({ symbol: newSymbol, type: 'Fiat' });
                     onChange(newSymbol);
                     setIsOpen(false);
                   }}
                 >
                   + Agregar nueva moneda "{searchTerm.toUpperCase()}"
                 </div>
              )}
            </>
          ) : (
            <div 
              className={cn("px-4 py-3 text-xs", searchTerm ? "hover:bg-blue-600/20 cursor-pointer font-bold text-blue-400" : "text-slate-400")}
              onClick={() => {
                if (searchTerm) {
                  const newSymbol = searchTerm.toUpperCase().trim();
                  store.addCurrency({ symbol: newSymbol, type: 'Fiat' });
                  onChange(newSymbol);
                  setIsOpen(false);
                }
              }}
            >
              {searchTerm ? `+ Agregar nueva moneda: "${searchTerm.toUpperCase()}"` : 'Escribe para buscar...'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
