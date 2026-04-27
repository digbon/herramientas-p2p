import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { cn } from '../lib/utils';

export function OwnerNameInputPicker({
  value,
  onChange,
  ownerType,
  disabled
}: {
  value: string;
  onChange: (name: string) => void;
  ownerType: 'Mias' | 'Cliente';
  disabled?: boolean;
}) {
  const store = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derive unique names from paymentMethods
  const existingNames = Array.from(new Set([
    ...store.paymentMethods.filter(pm => pm.ownerType === ownerType).map(p => p.ownerName)
  ])).filter(Boolean);

  const filteredNames = existingNames.filter(n => n.toLowerCase().includes(searchTerm.toLowerCase()));

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

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
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            onChange(e.target.value);
          }}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          placeholder="Nombre completo"
          className={cn(
            "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white outline-none focus:border-blue-500 font-bold",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
          {filteredNames.length > 0 ? (
            <>
              {filteredNames.map(name => (
                <div
                  key={name}
                  className="px-4 py-2 hover:bg-slate-800 cursor-pointer text-sm font-medium text-slate-200"
                  onClick={() => {
                    setSearchTerm(name);
                    onChange(name);
                    setIsOpen(false);
                  }}
                >
                  {name}
                </div>
              ))}
              {searchTerm && !existingNames.find(n => n.toLowerCase() === searchTerm.toLowerCase()) && (
                 <div
                   className="px-4 py-2 hover:bg-blue-600/20 cursor-pointer text-sm font-medium text-blue-400 border-t border-slate-800"
                   onClick={() => {
                     onChange(searchTerm);
                     setIsOpen(false);
                   }}
                 >
                   + Usar "{searchTerm}"
                 </div>
              )}
            </>
          ) : (
            <div 
              className={cn("px-4 py-3 text-xs", searchTerm ? "hover:bg-blue-600/20 cursor-pointer font-bold text-blue-400" : "text-slate-400")}
              onClick={() => {
                if (searchTerm) {
                  onChange(searchTerm);
                  setIsOpen(false);
                }
              }}
            >
              {searchTerm ? `+ Usar nuevo nombre: "${searchTerm}"` : 'Escribe para buscar...'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
