import React, { useState } from 'react';
import { Settings2, TrendingUp, TrendingDown, DollarSign, Plus, X, Percent } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppStore } from '../store';

type Commission = {
  id: string;
  name: string;
  value: string;
  isPercentage: boolean;
};

export function Simulator() {
  const store = useAppStore();
  const currencies = store.currencies;
  
  const [activeTab, setActiveTab] = useState('Básico');
  const [sourceCurrency, setSourceCurrency] = useState('USDT');
  const [destCurrency, setDestCurrency] = useState('BOB');
  const [amountSource, setAmountSource] = useState('100');
  
  const [buyPrice, setBuyPrice] = useState('9.42');
  const [buyCommissions, setBuyCommissions] = useState<Commission[]>([
    { id: '1', name: 'Comisión de Compra', value: '0.1', isPercentage: true }
  ]);
  
  const [sellPrice, setSellPrice] = useState('9.50');
  const [sellCommissions, setSellCommissions] = useState<Commission[]>([
    { id: '1', name: 'Comisión de Venta', value: '0.1', isPercentage: true }
  ]);

  const amount = parseFloat(amountSource) || 0;
  const bPrice = parseFloat(buyPrice) || 0;
  const sPrice = parseFloat(sellPrice) || 0;

  const totalBuyCommissionDest = buyCommissions.reduce((acc, c) => {
    const val = parseFloat(c.value) || 0;
    if (c.isPercentage) {
      return acc + (amount * bPrice * (val / 100));
    }
    return acc + val;
  }, 0);

  const totalInvested = amount * bPrice + totalBuyCommissionDest;
  const effectiveBuyPrice = amount > 0 ? totalInvested / amount : 0;

  const totalSellCommissionDest = sellCommissions.reduce((acc, c) => {
    const val = parseFloat(c.value) || 0;
    if (c.isPercentage) {
      return acc + (amount * sPrice * (val / 100));
    }
    return acc + val;
  }, 0);

  const totalReceived = amount * sPrice - totalSellCommissionDest;
  const effectiveSellPrice = amount > 0 ? totalReceived / amount : 0;

  const profitDest = totalReceived - totalInvested;
  const profitPercentage = totalInvested > 0 ? (profitDest / totalInvested) * 100 : 0;
  const isProfitable = profitDest >= 0;

  let sellPercSum = 0;
  let sellFixedSum = 0;
  sellCommissions.forEach(c => {
    const val = parseFloat(c.value) || 0;
    if (c.isPercentage) sellPercSum += val;
    else sellFixedSum += val;
  });
  
  const exactBreakEvenSellPrice = amount > 0 && sellPercSum < 100
    ? (totalInvested + sellFixedSum) / (amount * (1 - sellPercSum / 100))
    : 0;

  const markupOnBuy = bPrice > 0 ? ((sPrice - bPrice) / bPrice) * 100 : 0;

  const handleAddCommission = (type: 'buy' | 'sell') => {
    const newComm = { id: Date.now().toString(), name: 'Nueva Comisión', value: '0', isPercentage: false };
    if (type === 'buy') setBuyCommissions([...buyCommissions, newComm]);
    else setSellCommissions([...sellCommissions, newComm]);
  };

  const handleUpdateCommission = (type: 'buy' | 'sell', id: string, updates: Partial<Commission>) => {
    if (type === 'buy') {
      setBuyCommissions(buyCommissions.map(c => c.id === id ? { ...c, ...updates } : c));
    } else {
      setSellCommissions(sellCommissions.map(c => c.id === id ? { ...c, ...updates } : c));
    }
  };

  const handleRemoveCommission = (type: 'buy' | 'sell', id: string) => {
    if (type === 'buy') {
      setBuyCommissions(buyCommissions.filter(c => c.id !== id));
    } else {
      setSellCommissions(sellCommissions.filter(c => c.id !== id));
    }
  };

  const renderCommission = (type: 'buy' | 'sell', c: Commission) => (
    <div key={c.id} className="relative bg-slate-950/50 border border-slate-800 rounded-lg p-3 space-y-3">
      <div className="flex gap-2 items-center justify-between">
        <input 
          type="text" 
          value={c.name}
          onChange={e => handleUpdateCommission(type, c.id, { name: e.target.value })}
          placeholder="Nombre de la comisión"
          className="flex-1 bg-transparent border-b border-slate-700/50 pb-1 text-sm text-slate-300 focus:outline-none focus:border-blue-500 font-medium"
        />
        <button 
          onClick={() => handleRemoveCommission(type, c.id)}
          className="text-slate-500 hover:text-red-500 transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <input
            type="number"
            value={c.value}
            onChange={e => handleUpdateCommission(type, c.id, { value: e.target.value })}
            className={cn(
              "w-full bg-slate-900 border border-slate-800 rounded-lg py-2 text-white focus:outline-none transition-colors",
              type === 'buy' ? "focus:border-red-500" : "focus:border-emerald-500",
              c.isPercentage ? "pl-3 pr-8" : "px-3"
            )}
            placeholder="0.00"
          />
          {c.isPercentage && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none select-none">
              %
            </div>
          )}
        </div>
        <button
          onClick={() => handleUpdateCommission(type, c.id, { isPercentage: !c.isPercentage })}
          className={cn(
            "p-2 rounded-lg transition-colors border",
            c.isPercentage 
              ? "bg-blue-600/20 border-blue-500 text-blue-400" 
              : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
          )}
          title={c.isPercentage ? "Porcentaje activado" : "Porcentaje desactivado"}
        >
          <Percent className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold">Simulador de Operaciones</h1>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex">
        {['Básico', 'Avanzado', 'Escenarios'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors",
              activeTab === tab ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-300"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab !== 'Básico' ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
          Próximamente: vista de {activeTab}
        </div>
      ) : (
        <div className="space-y-4">
          <Section title={<span className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-blue-500" /> Monedas y Monto</span>}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Moneda Origen</label>
                <select
                  value={sourceCurrency}
                  onChange={(e) => setSourceCurrency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {currencies.map(c => (
                    <option key={c.symbol} value={c.symbol}>{c.symbol}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Moneda Destino</label>
                <select
                  value={destCurrency}
                  onChange={(e) => setDestCurrency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {currencies.map(c => (
                    <option key={c.symbol} value={c.symbol}>{c.symbol}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Cantidad a invertir ({sourceCurrency})</label>
              <input
                type="number"
                value={amountSource}
                onChange={(e) => setAmountSource(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>
          </Section>

          <Section title={<span className="flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-500" /> Detalles de Compra</span>}>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Precio ({destCurrency}/{sourceCurrency})</label>
                <input
                  type="number"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-400 font-medium">Comisiones de Compra</label>
                  <button 
                    onClick={() => handleAddCommission('buy')}
                    className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 uppercase tracking-widest font-bold"
                  >
                    <Plus className="w-3 h-3" />
                    Agregar
                  </button>
                </div>
                {buyCommissions.length === 0 && (
                  <div className="text-center py-2 text-slate-500 text-xs italic">Sin comisiones</div>
                )}
                {buyCommissions.map(c => renderCommission('buy', c))}
              </div>
            </div>
          </Section>

          <Section title={<span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" /> Detalles de Venta</span>}>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Precio ({destCurrency}/{sourceCurrency})</label>
                <input
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-400 font-medium">Comisiones de Venta</label>
                  <button 
                    onClick={() => handleAddCommission('sell')}
                    className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 uppercase tracking-widest font-bold"
                  >
                    <Plus className="w-3 h-3" />
                    Agregar
                  </button>
                </div>
                {sellCommissions.length === 0 && (
                  <div className="text-center py-2 text-slate-500 text-xs italic">Sin comisiones</div>
                )}
                {sellCommissions.map(c => renderCommission('sell', c))}
              </div>
            </div>
          </Section>

          <div className={cn(
            "rounded-xl p-4 border",
            isProfitable ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("w-2 h-2 rounded-full", isProfitable ? "bg-emerald-500" : "bg-red-500")} />
              <span className={cn("text-sm font-medium", isProfitable ? "text-emerald-500" : "text-red-500")}>
                {isProfitable ? 'Operación Rentable (Estimada)' : 'Operación con Pérdida (Estimada)'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={cn("text-3xl font-bold", isProfitable ? "text-emerald-500" : "text-red-500")}>
                {profitDest > 0 ? '+' : ''}{profitDest.toFixed(2)} {destCurrency}
              </span>
              <span className={cn("text-sm font-medium", isProfitable ? "text-emerald-500/70" : "text-red-500/70")}>
                ({profitPercentage > 0 ? '+' : ''}{profitPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Accordion title="Detalles de Compra" icon={<div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400"><span className="text-slate-300">Precio de Compra:</span> {bPrice.toFixed(4)} {destCurrency}</div>
                <div className="flex justify-between text-slate-400"><span className="text-slate-300">Total Comisiones:</span> {totalBuyCommissionDest.toFixed(2)} {destCurrency}</div>
                <div className="flex justify-between text-slate-400"><span className="text-slate-300">Total Invertido:</span> {totalInvested.toFixed(2)} {destCurrency}</div>
                <div className="flex justify-between text-white font-medium mt-1 pt-1 border-t border-slate-800"><span className="text-slate-300">Precio Efectivo Compra:</span> {effectiveBuyPrice.toFixed(4)} {destCurrency}</div>
              </div>
            </Accordion>
            <Accordion title="Detalles de Venta" icon={<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}>
               <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400"><span className="text-slate-300">Precio de Venta:</span> {sPrice.toFixed(4)} {destCurrency}</div>
                <div className="flex justify-between text-slate-400"><span className="text-slate-300">Total Comisiones:</span> {totalSellCommissionDest.toFixed(2)} {destCurrency}</div>
                <div className="flex justify-between text-slate-400"><span className="text-slate-300">Total Recibido:</span> {totalReceived.toFixed(2)} {destCurrency}</div>
                <div className="flex justify-between text-white font-medium mt-1 pt-1 border-t border-slate-800"><span className="text-slate-300">Precio Efectivo Venta:</span> {effectiveSellPrice.toFixed(4)} {destCurrency}</div>
              </div>
            </Accordion>
            <Accordion title="Información Adicional" icon={<Settings2 className="w-4 h-4 text-slate-400 shrink-0" />}>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400"><span className="text-slate-300">P. Equilibrio Venta:</span> {isFinite(exactBreakEvenSellPrice) && exactBreakEvenSellPrice > 0 ? exactBreakEvenSellPrice.toFixed(4) : 'N/A'} {destCurrency}</div>
                <div className="flex justify-between text-slate-400"><span className="text-slate-300">Margen sobre P. Compra:</span> {markupOnBuy.toFixed(2)}%</div>
                <div className="h-px bg-slate-800 my-2" />
                <div className="flex justify-between text-slate-400"><span className="text-slate-300">Precio Prom. Compra Histórico:</span> N/A</div>
                <div className="flex justify-between text-slate-400"><span className="text-slate-300">Precio Prom. Venta Histórico:</span> N/A</div>
              </div>
            </Accordion>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h2 className="text-sm font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Accordion({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 p-4 text-left focus:outline-none"
      >
        {icon}
        <span className="text-sm font-semibold text-slate-300 flex-1">{title}</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}

