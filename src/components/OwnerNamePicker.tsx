import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { Search } from 'lucide-react';
import { cn } from '../lib/utils';

export function OwnerNamePicker({
  value,
  onSelect,
  pickerType,
  disabled,
  placeholder
}: {
  value: string;
  onSelect: (name: string, isNew?: boolean) => void;
  pickerType: 'p2p' | 'client';
  disabled?: boolean;
  placeholder?: string;
}) {
  const store = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derive unique names based on pickerType
  const existingNames = Array.from(new Set([
    ...(pickerType === 'client' ? store.paymentMethods.filter(p => p.ownerType === 'Cliente').map(p => p.ownerName) : []),
    ...(pickerType === 'client' ? store.operations.map(op => op.clientName) : store.operations.map(op => op.p2pPlatform))
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
            onSelect(e.target.value, !existingNames.includes(e.target.value));
          }}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          placeholder={placeholder || (pickerType === 'client' ? "Nombre completo del cliente" : "Nombre")}
          className={cn(
            "w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-3 py-3 text-white outline-none focus:border-blue-500 font-bold",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
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
                    onSelect(name, false);
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
                     onSelect(searchTerm, true);
                     setIsOpen(false);
                   }}
                 >
                   + Agregar "{searchTerm}"
                 </div>
              )}
            </>
          ) : (
            <div 
              className={cn("px-4 py-3 text-xs", searchTerm ? "hover:bg-blue-600/20 cursor-pointer font-bold text-blue-400" : "text-slate-400")}
              onClick={() => {
                if (searchTerm) {
                  onSelect(searchTerm, true);
                  setIsOpen(false);
                }
              }}
            >
              {searchTerm ? `+ Agregar nuev${pickerType === 'client' ? 'o cliente' : 'a plataforma'}: "${searchTerm}"` : 'Escribe para buscar...'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
