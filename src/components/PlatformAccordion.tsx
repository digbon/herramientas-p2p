import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { Platform } from '../store';

interface PlatformAccordionProps {
  platform: Platform;
  className?: string;
  key?: string | number;
}

export function PlatformAccordion({ platform, className }: PlatformAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const accountsCount = (platform.accounts?.length || 0) + (platform.details ? 1 : 0);

  return (
    <div className={cn("bg-slate-950 border border-slate-800 rounded-xl overflow-hidden transition-all", className)}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-900/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-2 h-2 rounded-full",
            platform.type === 'Fiat' ? "bg-purple-500" : "bg-emerald-500"
          )} />
          <span className="font-bold text-sm text-white">{platform.name}</span>
          <span className="text-[10px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
            {platform.type}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{accountsCount} cuentas</span>
          <ChevronDown className={cn("w-4 h-4 text-slate-500 transition-transform", isExpanded && "rotate-180")} />
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 space-y-2 border-t border-slate-900/50 bg-slate-900/10">
          {platform.details && (
            <div className="bg-slate-900/30 p-2.5 rounded-lg border border-slate-800/30">
              <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Principal</div>
              <div className="text-white font-mono text-sm tracking-tight">{platform.details}</div>
            </div>
          )}
          {platform.accounts?.map((acc) => (
            <div key={acc.id} className="bg-slate-900/30 p-2.5 rounded-lg border border-slate-800/30">
              <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">{acc.label || 'Cuenta'}</div>
              <div className="text-white font-mono text-sm tracking-tight">{acc.value}</div>
            </div>
          ))}
          {accountsCount === 0 && (
            <div className="text-center py-2 text-[10px] text-slate-700 font-bold uppercase tracking-widest italic">
              Sin cuentas detalladas
            </div>
          )}
        </div>
      )}
    </div>
  );
}
