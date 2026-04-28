import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  BarChart2, 
  Calendar,
  RefreshCw,
  Plus,
  Search,
  ChevronDown
} from 'lucide-react';
import { useAppStore } from '../store';
import { cn } from '../lib/utils';
import { format, subDays, parseISO, startOfDay } from 'date-fns';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

import { useSearchParams, useNavigate } from 'react-router-dom';

const timeRanges = ['Día', 'Semana', 'Mes', 'Año', 'Global'] as const;
type TimeRange = typeof timeRanges[number];

export function Dashboard({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const store = useAppStore();
  const [viewMode, setViewMode] = useState<'acumulada' | 'diaria'>('acumulada');
  const [timeRange, setTimeRange] = useState<TimeRange>('Mes');
  const [isTimeRangeOpen, setIsTimeRangeOpen] = useState(false);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedCurrency = searchParams.get('currency') || store.baseCrypto;

  // Currency searching state
  const [isCurrencySearchOpen, setIsCurrencySearchOpen] = useState(false);
  const [currencySearchTerm, setCurrencySearchTerm] = useState('');

  const openNewOperation = () => {
    navigate('/historial?modal=new_operation');
  };

  const handleCurrencySelect = (symbol: string) => {
    setSearchParams(prev => {
      prev.set('currency', symbol);
      return prev;
    });
    setIsCurrencySearchOpen(false);
    setCurrencySearchTerm('');
  };

  const availableCurrencies = store.currencies
    .filter(c => c.symbol.toLowerCase().includes(currencySearchTerm.toLowerCase()));

  // Compute realistic or mock data based on operations and the selected currency
  const { totalProfitBase, totalProfitSecondary, profitabilityPercentage, chartData, totalVolume, totalCommissions, recentOps, secondaryCurrencySymbol } = useMemo(() => {
    // Filter operations that involve the selected currency
    const allOpsForCurrency = store.operations.filter(op => op.sourceCurrency === selectedCurrency || op.destCurrency === selectedCurrency);
    
    // Find the most frequent counterpart currency for display purposes
    const counterpartCounts: Record<string, number> = {};
    allOpsForCurrency.forEach(op => {
      const other = op.sourceCurrency === selectedCurrency ? op.destCurrency : op.sourceCurrency;
      counterpartCounts[other] = (counterpartCounts[other] || 0) + 1;
    });
    const secondaryCurrencySymbol = Object.keys(counterpartCounts).sort((a,b) => counterpartCounts[b] - counterpartCounts[a])[0] || store.baseFiat;

    const daysLimit = timeRange === 'Día' ? 1 
                    : timeRange === 'Semana' ? 7 
                    : timeRange === 'Mes' ? 30 
                    : timeRange === 'Año' ? 365 
                    : Infinity;

    const now = new Date();
    const ops = allOpsForCurrency.filter(op => {
       if (daysLimit === Infinity) return true;
       return (now.getTime() - new Date(op.date).getTime()) <= daysLimit * 24 * 60 * 60 * 1000;
    });

    if (ops.length === 0) {
      return {
        totalProfitBase: 0,
        totalProfitSecondary: 0,
        profitabilityPercentage: 0,
        chartData: Array.from({length: Math.min(daysLimit === Infinity ? 6 : daysLimit, 6)}).map((_, i) => ({
          date: format(subDays(new Date(), 5 - i), 'd/M'),
          fullDate: format(subDays(new Date(), 5 - i), 'dd/M'),
          valueAcumulada: 0,
          valueDiaria: 0,
          baseVol: 0,
          secVol: 0,
          percentageAcumulada: "0",
          percentageDiaria: "0"
        })),
        totalVolume: 0,
        totalCommissions: 0,
        recentOps: [],
        secondaryCurrencySymbol
      };
    }

    // Sort ops oldest to newest
    const sortedOps = [...ops].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Group operations by Day
    const dailyData: Record<string, { baseAmount: number, secAmount: number, profitBase: number, profitSec: number, comms: number }> = {};
    let totalVol = 0;
    let totalComms = 0;

    sortedOps.forEach(op => {
       const isSellingBase = op.sourceCurrency === selectedCurrency;
       const baseAmount = isSellingBase ? op.amountInvested : op.amountReceived;
       const secAmount = isSellingBase ? op.amountReceived : op.amountInvested;
       
       const opComms = op.commissions.reduce((acc, c) => acc + (c.type === 'fixed' ? c.value : baseAmount * (c.value/100)), 0);
       totalComms += opComms;
       totalVol += baseAmount;
       
       const profitAddedBase = isSellingBase ? (baseAmount * 0.02) : (baseAmount * 0.005); 
       const profitAddedSec = isSellingBase ? (secAmount * 0.02) : (secAmount * 0.005);

       const dateKey = format(parseISO(op.date), 'yyyy-MM-dd');
       if(!dailyData[dateKey]) {
          dailyData[dateKey] = { baseAmount: 0, secAmount: 0, profitBase: 0, profitSec: 0, comms: 0 };
       }
       dailyData[dateKey].baseAmount += baseAmount;
       dailyData[dateKey].secAmount += secAmount;
       dailyData[dateKey].profitBase += profitAddedBase;
       dailyData[dateKey].profitSec += profitAddedSec;
       dailyData[dateKey].comms += opComms;
    });

    const sortedDays = Object.keys(dailyData).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
    
    let baseProgression = 0;
    let secProgression = 0;
    let progressionVol = 0;

    const cData = sortedDays.map(dayStr => {
        const d = dailyData[dayStr];
        baseProgression += d.profitBase;
        secProgression += d.profitSec;
        progressionVol += d.baseAmount;
        
        return {
           date: format(parseISO(dayStr), 'd/M'),
           fullDate: format(parseISO(dayStr), 'dd/MM/yyyy'),
           valueAcumulada: baseProgression,
           valueDiaria: d.profitBase,
           baseVol: d.baseAmount,
           secVol: d.secAmount,
           percentageAcumulada: ((baseProgression / (progressionVol || 1)) * 100).toFixed(2),
           percentageDiaria: ((d.profitBase / (d.baseAmount || 1)) * 100).toFixed(2),
        };
    });

    return {
      totalProfitBase: baseProgression,
      totalProfitSecondary: secProgression,
      profitabilityPercentage: cData.length ? parseFloat(cData[cData.length-1].percentageAcumulada) : 0,
      chartData: cData,
      totalVolume: totalVol,
      totalCommissions: totalComms,
      recentOps: [...sortedOps].reverse().slice(0, 5),
      secondaryCurrencySymbol
    };

  }, [store.operations, selectedCurrency, store.baseFiat, timeRange]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isDiaria = viewMode === 'diaria';
      const val = isDiaria ? data.valueDiaria : data.valueAcumulada;
      const perc = isDiaria ? data.percentageDiaria : data.percentageAcumulada;

      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl min-w-[200px]">
          <div className="text-slate-300 font-bold mb-2 text-[11px]">{data.fullDate}</div>
          <div className="text-emerald-400 font-bold text-xs mb-2 flex items-center gap-1">
            {val >= 0 ? '↗' : '↘'} Rentabilidad: {val.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {selectedCurrency} ({perc}%)
          </div>
          <div className="text-slate-400 text-[10px] space-y-1 font-mono">
            <p>Volumen {selectedCurrency}: {data.baseVol.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            <p>Volumen {secondaryCurrencySymbol}: {data.secVol.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const isPositive = profitabilityPercentage >= 0;

  return (
    <div className="bg-[#0f1520] min-h-screen text-white pb-32 font-sans selection:bg-emerald-500/30 overflow-x-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col bg-[#151c2c] border-b border-[#1e293b] p-4 sticky top-0 z-10 w-full max-w-lg mx-auto shadow-md">
        
        {/* Currency Selector */}
        <div className="mb-4 relative z-50">
          <label className="text-[10px] text-slate-400 uppercase font-black mb-1.5 block">Moneda del Dashboard</label>
          <div className="relative">
            <div 
              onClick={() => setIsCurrencySearchOpen(!isCurrencySearchOpen)}
              className="w-full bg-[#0b101a] border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                 <div className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center font-black text-xs">
                   {selectedCurrency.charAt(0)}
                 </div>
                 <span className="font-black text-lg tracking-tight">{selectedCurrency}</span>
              </div>
              <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform", isCurrencySearchOpen && "rotate-180")} />
            </div>

            {isCurrencySearchOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsCurrencySearchOpen(false)} />
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a2235] border border-white/10 shadow-2xl rounded-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 border-b border-white/5">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Buscar moneda..." 
                        value={currencySearchTerm}
                        onChange={(e) => setCurrencySearchTerm(e.target.value)}
                        className="w-full bg-[#0b101a] text-sm text-white px-9 py-2 rounded-lg outline-none focus:border-blue-500 border border-transparent"
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto p-1">
                    {availableCurrencies.map(c => (
                      <button 
                        key={c.symbol}
                        onClick={() => handleCurrencySelect(c.symbol)}
                        className={cn(
                          "w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors",
                          c.symbol === selectedCurrency ? "bg-blue-600/20 text-blue-400" : "hover:bg-white/5 text-slate-300"
                        )}
                      >
                        <span className="font-bold">{c.symbol}</span>
                        <span className="text-[10px] uppercase font-black opacity-50">{c.type}</span>
                      </button>
                    ))}
                    {availableCurrencies.length === 0 && (
                      <div className="p-3 text-center text-slate-500 text-sm">No se encontraron monedas</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="leading-tight flex flex-col justify-center">
            <div className="text-[11px] text-slate-300 font-black tracking-wider uppercase mb-0.5">Análisis de<br/>Rentabilidad:</div>
            <div className="text-blue-400 text-[13px] font-black leading-tight">
               {viewMode === 'acumulada' ? `Acumulada del\nPeriodo (${selectedCurrency})` : `Detallada\nDiaria (${selectedCurrency})`}
            </div>
          </div>
          <button 
            onClick={() => setViewMode(v => v === 'acumulada' ? 'diaria' : 'acumulada')}
            className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-700 transition-colors text-slate-300 text-[10px] px-3 py-2 rounded-xl font-bold border border-white/5 active:scale-95"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="w-[4.8rem] text-left leading-tight tracking-wide">Cambiar<br/>Vista a {viewMode === 'acumulada' ? 'Diaria' : 'Acumulada'}</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Main Rentabilidad Section */}
        <div>
          {/* Section Title */}
          <div className="flex items-center justify-between mb-4 px-1">
             <div className="flex items-center gap-2 text-white font-black text-lg tracking-tight">
               <TrendingUp className="w-5 h-5" />
               <span>{viewMode === 'acumulada' ? 'Vista Acumulada' : 'Vista Diaria Detallada'}</span>
             </div>
             
             {/* Time Range Selector */}
             <div className="relative z-40">
               <button 
                 onClick={() => setIsTimeRangeOpen(!isTimeRangeOpen)}
                 className="flex items-center gap-1.5 bg-[#1a2235] hover:bg-slate-800 transition-colors border border-white/5 text-slate-300 text-[10px] px-2.5 py-1.5 rounded-lg font-bold"
               >
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="leading-none text-left min-w-[3rem]">{timeRange}</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
               </button>
               {isTimeRangeOpen && (
                 <>
                   <div className="fixed inset-0" onClick={() => setIsTimeRangeOpen(false)} />
                   <div className="absolute right-0 top-full mt-2 w-32 bg-[#1a2235] border border-white/10 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
                     {timeRanges.map(range => (
                       <button
                         key={range}
                         onClick={() => {
                           setTimeRange(range);
                           setIsTimeRangeOpen(false);
                         }}
                         className={cn(
                           "w-full text-left px-4 py-2 text-xs font-bold transition-colors",
                           timeRange === range ? "bg-blue-600/20 text-blue-400" : "hover:bg-white/5 text-slate-300"
                         )}
                       >
                         {range}
                       </button>
                     ))}
                   </div>
                 </>
               )}
             </div>
          </div>

          <div className="bg-[#151c2c] rounded-[2rem] shadow-2xl border border-white/5 space-y-4 overflow-hidden pt-4 px-4 pb-6 relative">
            {/* Rentabilidad Total Box */}
            <div className="bg-[#0b101a] rounded-[1.5rem] p-5 text-center border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              <div className="text-slate-400 text-xs font-bold mb-2 uppercase tracking-widest">
                Rentabilidad Total del Periodo
              </div>
              <div className={cn(
                "text-[28px] font-black mb-1 tracking-tight flex items-center justify-center gap-1",
                isPositive ? "text-emerald-400" : "text-white"
              )}>
                {totalProfitBase.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className="text-lg">{selectedCurrency}</span>
              </div>
            </div>

            {/* Percentage / Days Gain Loss */}
            <div className="bg-[#0b101a] rounded-[1.5rem] p-5 text-center border border-white/5">
              <div className="text-slate-400 text-xs font-bold mb-2 uppercase tracking-wide">Porcentaje de Ganancia</div>
              <div className={cn(
                "text-3xl font-black",
                isPositive ? "text-emerald-400" : "text-white"
              )}>
                {isPositive ? '↗' : '↘'} {profitabilityPercentage.toFixed(2)}%
              </div>
            </div>

            {/* Chart Area */}
            <div className="bg-[#0b101a] rounded-[1.5rem] p-4 border border-white/5 relative">
              <div className="absolute top-4 right-4 z-10 w-4 h-4 rounded-full border-2 border-slate-700 bg-slate-800" />
              <div className="h-44 w-full mt-4 ml-[-8px]">
                <ResponsiveContainer width="100%" height="100%">
                  {viewMode === 'acumulada' ? (
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} 
                        tickFormatter={(val) => val.toFixed(1)}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#64748b', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Area 
                        type="stepAfter" 
                        dataKey="valueAcumulada" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                      />
                      <ReferenceLine y={0} stroke="#334155" />
                    </AreaChart>
                  ) : (
                    <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} 
                        tickFormatter={(val) => val.toFixed(1)}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff10' }} />
                      <ReferenceLine y={0} stroke="#334155" />
                      <Bar 
                        dataKey="valueDiaria" 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center mt-6">
                 <div className="flex items-center gap-2 bg-[#151c2c] px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
                   <div className={cn("w-2.5 h-2.5 rounded-sm", isPositive ? "bg-emerald-500" : "bg-red-500")} />
                   <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Rentabilidad General: {isPositive ? 'Positiva' : 'Negativa'}</span>
                 </div>
              </div>
            </div>

          </div>
        </div>

        {/* Volumen & Comisiones */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#151c2c] rounded-[1.5rem] p-5 border border-white/5 text-center flex flex-col items-center justify-center min-h-[110px] shadow-lg">
             <div className="text-slate-400 text-[11px] font-bold mb-3">Volumen Total ({selectedCurrency})</div>
             <div className="text-2xl font-black text-white">{totalVolume.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          </div>
          <div className="bg-[#151c2c] rounded-[1.5rem] p-5 border border-white/5 text-center flex flex-col items-center justify-center min-h-[110px] shadow-lg">
             <div className="text-slate-400 text-[11px] font-bold mb-3">Comisiones ({selectedCurrency})</div>
             <div className="text-2xl font-black text-white">{totalCommissions.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          </div>
        </div>

        {/* Ganancia / Perdida */}
        <div className="bg-[#151c2c] rounded-[1.5rem] p-6 border border-white/5 text-center relative overflow-hidden flex flex-col items-center shadow-lg">
           <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[#1e293b] border-2 border-slate-700" />
           <div className="text-slate-400 text-[13px] font-bold mb-3 tracking-wide flex items-center justify-center">Ganancia/Pérdida (Periodo)</div>
           <div className={cn("text-4xl font-black mb-4 tracking-tight", isPositive ? "text-emerald-400" : "text-white")}>
             {totalProfitBase.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className="text-xl">{selectedCurrency}</span>
           </div>
           <div className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 border border-emerald-500/20 shadow-sm">
             {profitabilityPercentage.toFixed(2)}% <TrendingUp className="w-3.5 h-3.5" />
           </div>
        </div>

        {/* Operaciones Recientes */}
        <div className="bg-[#151c2c] rounded-[1.5rem] p-6 border border-white/5 space-y-4 min-h-[150px] shadow-lg relative">
          <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[#1e293b] border-2 border-slate-700" />
          <h3 className="text-white font-black text-lg tracking-tight mb-2">Operaciones Recientes (Máx. 5)</h3>
          
          {recentOps.length > 0 ? (
            <div className="space-y-4">
              {recentOps.map(op => (
                <div key={op.id} className="flex justify-between items-center text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div>
                    <div className="text-white font-bold">{op.clientName}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{format(parseISO(op.date), 'dd/MM/yyyy')}</div>
                  </div>
                  <div className="text-right">
                    <div className={cn("font-black tracking-tight", op.type === 'Compra' ? "text-emerald-400" : "text-red-400")}>
                      {op.type} {op.amountInvested.toLocaleString()} {op.sourceCurrency}
                    </div>
                    <div className="text-slate-500 text-xs mt-0.5 font-mono">@ {op.price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center pt-4 pb-2">
               <p className="text-slate-500 text-sm font-medium">No hay operaciones recientes en {selectedCurrency} para el período seleccionado.</p>
            </div>
          )}
        </div>

      </div>

      <button 
        onClick={openNewOperation}
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 shadow-lg shadow-blue-600/30 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-transform active:scale-95 z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

    </div>
  );
}

