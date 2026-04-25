import React, { useState } from 'react';
import { Settings2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { cn } from '../lib/utils';

export function Simulator() {
  const [activeTab, setActiveTab] = useState('Básico');
  const [amountUSDT, setAmountUSDT] = useState('100');
  const [buyPrice, setBuyPrice] = useState('9.42');
  const [buyFee, setBuyFee] = useState('0.1');
  const [sellPrice, setSellPrice] = useState('9.50');
  const [sellFee, setSellFee] = useState('0.1');

  const amount = parseFloat(amountUSDT) || 0;
  const bPrice = parseFloat(buyPrice) || 0;
  const bFee = parseFloat(buyFee) || 0;
  const sPrice = parseFloat(sellPrice) || 0;
  const sFee = parseFloat(sellFee) || 0;

  // Calculations
  const buyCommission = amount * bPrice * (bFee / 100);
  const totalInvested = amount * bPrice + buyCommission;
  const effectiveBuyPrice = totalInvested / amount;

  const sellCommission = amount * sPrice * (sFee / 100);
  const totalReceived = amount * sPrice - sellCommission;
  const effectiveSellPrice = totalReceived / amount;

  const profitBOB = totalReceived - totalInvested;
  const profitPercentage = totalInvested > 0 ? (profitBOB / totalInvested) * 100 : 0;
  const isProfitable = profitBOB >= 0;

  const breakEvenSellPrice = totalInvested / (amount * (1 - sFee / 100));
  const markupOnBuy = bPrice > 0 ? ((sPrice - bPrice) / bPrice) * 100 : 0;

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
          <Section title={<span className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-blue-500" /> Monto de la Operación</span>}>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Cantidad en USDT</label>
              <input
                type="number"
                value={amountUSDT}
                onChange={(e) => setAmountUSDT(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </Section>

          <Section title={<span className="flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-500" /> Detalles de Compra</span>}>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Precio (BOB/USDT)</label>
                <input
                  type="number"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="last-price" className="rounded border-slate-700 bg-slate-950 text-blue-500 focus:ring-blue-500" disabled />
                <label htmlFor="last-price" className="text-xs text-slate-400">Usar precio de última compra (N/A)</label>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Comisión de Compra (%)</label>
                <input
                  type="number"
                  value={buyFee}
                  onChange={(e) => setBuyFee(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </Section>

          <Section title={<span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" /> Detalles de Venta</span>}>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Precio (BOB/USDT)</label>
                <input
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Comisión de Venta (%)</label>
                <input
                  type="number"
                  value={sellFee}
                  onChange={(e) => setSellFee(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
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
                {profitBOB > 0 ? '+' : ''}{profitBOB.toFixed(2)} BOB
              </span>
              <span className={cn("text-sm font-medium", isProfitable ? "text-emerald-500/70" : "text-red-500/70")}>
                ({profitPercentage > 0 ? '+' : ''}{profitPercentage.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Accordion title="Detalles de Compra" icon={<div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400"><span className="text-slate-300">Precio de Compra:</span> {bPrice.toFixed(4)} BOB</div>
                <div className="flex justify-between text-slate-400"><span className="text-slate-300">Comisión ({bFee}%):</span> {buyCommission.toFixed(2)} BOB</div>
                <div className="flex justify-between text-slate-400"><span className="text-slate-300">Total Invertido:</span> {totalInvested.toFixed(2)} BOB</div>
                <div className="flex justify-between text-slate-400"><span className="text-slate-300">Precio Efectivo Compra:</span> {effectiveBuyPrice.toFixed(4)} BOB</div>
              </div>
            </Accordion>
            <Accordion title="Detalles de Venta" icon={<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}>
               <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400"><span className="text-slate-300">Precio de Venta:</span> {sPrice.toFixed(4)} BOB</div>
                <div className="flex justify-between text-slate-400"><span className="text-slate-300">Comisión ({sFee}%):</span> {sellCommission.toFixed(2)} BOB</div>
                <div className="flex justify-between text-slate-400"><span className="text-slate-300">Total Recibido:</span> {totalReceived.toFixed(2)} BOB</div>
                <div className="flex justify-between text-slate-400"><span className="text-slate-300">Precio Efectivo Venta:</span> {effectiveSellPrice.toFixed(4)} BOB</div>
              </div>
            </Accordion>
            <Accordion title="Información Adicional" icon={<Settings2 className="w-4 h-4 text-slate-400 shrink-0" />}>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400"><span className="text-slate-300">P. Equilibrio Venta:</span> {isFinite(breakEvenSellPrice) ? breakEvenSellPrice.toFixed(4) : 'N/A'} BOB</div>
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
