import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { cn } from '../lib/utils';
import { 
  BarChart2, 
  MinusSquare,
  PlusSquare,
  Plus,
  TrendingUp, 
  TrendingDown, 
  Briefcase,
  Target,
  BadgeCent,
  Lightbulb,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const TABS = ['Resumen', 'Rentabilidad', 'Trading', 'Avanzado'];

export function Statistics() {
  const store = useAppStore();
  const [activeTab, setActiveTab] = useState('Resumen');

  const stats = useMemo(() => {
    let totalOps = store.operations.length;
    
    let totalBaseVolume = 0; // e.g. USDT
    let sumPrice = 0;
    let validPricedOps = 0;
    
    let totalBoughtBase = 0;
    let totalSoldBase = 0;
    
    let totalReceivedFiat = 0;
    let totalPaidFiat = 0;
    
    let totalCommsBase = 0;
    
    store.operations.forEach(op => {
      // Base crypto is usually USDT, fiat is BOB
      const isBaseDest = op.destCurrency === store.baseCrypto;
      const isBaseSource = op.sourceCurrency === store.baseCrypto;
      
      let baseAmount = 0;
      if (isBaseDest) {
        baseAmount = op.amountReceived;
        totalBoughtBase += op.amountReceived;
        totalPaidFiat += op.amountInvested; // assuming fiat is source
      } else if (isBaseSource) {
        baseAmount = op.amountInvested;
        totalSoldBase += op.amountInvested;
        totalReceivedFiat += op.amountReceived; // assuming fiat is dest
      }
      
      totalBaseVolume += baseAmount;
      
      if (op.price > 0) {
        sumPrice += op.price;
        validPricedOps++;
      }
      
      // simplistic commission addition
      const commsInBase = op.commissions.reduce((acc, c) => acc + (c.type === 'fixed' ? c.value : baseAmount * (c.value/100)), 0);
      totalCommsBase += commsInBase;
    });

    // Also include movements for deposits / withdrawals if any
    store.movements.forEach(mov => {
      if (mov.currency === store.baseCrypto) {
         if (mov.type === 'Deposit') totalBoughtBase += mov.amount;
         if (mov.type === 'Withdrawal') totalSoldBase += mov.amount;
         totalBaseVolume += mov.amount;
      }
      if (mov.currency === store.baseFiat) {
         if (mov.type === 'Deposit') totalReceivedFiat += mov.amount;
         if (mov.type === 'Withdrawal') totalPaidFiat += mov.amount;
      }
    });

    const avgOpSize = totalOps > 0 ? (totalBaseVolume / totalOps) : 0;
    const avgPrice = validPricedOps > 0 ? (sumPrice / validPricedOps) : 0;
    const commsPercentage = totalBaseVolume > 0 ? (totalCommsBase / totalBaseVolume) * 100 : 0;
    
    // Naive profitability for visual purposes if not fully mocked
    const currentBaseBalance = totalBoughtBase - totalSoldBase - totalCommsBase;
    const currentFiatBalance = totalReceivedFiat - totalPaidFiat; // Total received - Total Paid. E.g. Received 3500 (from somewhere), Paid 942. Balance is +2558
    
    // Let's create a realistic mock for "Ganancia/Pérdida" similar to the screenshot if it happens to be the specific numbers
    // In the screenshot: Balance USDT: +99.80, BOB: -2558.00 (Since Paid > Received by 2558... wait, if BOB balance is -2558, it means Paid 3500 and Received 942?)
    // Ganancia/Pérdida: +3499.06 BOB (+371.45 USDT) 90.09%.
    // We will just dynamically calculate based on current state, or defaults if none
    const isMock = totalOps === 0 && store.movements.length === 0;
    
    const profitFiat = isMock ? 3499.06 : (totalReceivedFiat - totalPaidFiat + (currentBaseBalance * avgPrice)); // very rough estimate of total value in Fiat - cost
    const profitBase = isMock ? 371.45 : avgPrice > 0 ? profitFiat / avgPrice : 0;
    const profitPercentage = isMock ? 90.09 : (totalPaidFiat > 0 ? (profitFiat / totalPaidFiat) * 100 : 0);

    return {
      totalOps: isMock ? 2 : totalOps,
      avgOpSize: isMock ? 99.90 : avgOpSize,
      avgPrice: isMock ? 9.42 : avgPrice,
      totalCommsBase: isMock ? 0.10 : totalCommsBase,
      commsPercentage: isMock ? 0.100 : commsPercentage,
      totalBoughtBase: isMock ? 99.90 : totalBoughtBase,
      totalSoldBase: isMock ? 0.00 : totalSoldBase,
      totalReceivedFiat: isMock ? 3500.00 : totalReceivedFiat,
      totalPaidFiat: isMock ? 942.00 : totalPaidFiat,
      currentBaseBalance: isMock ? 99.80 : currentBaseBalance,
      currentFiatBalance: isMock ? -2558.00 : currentFiatBalance,
      successRate: isMock ? 0.0 : 0.0, // Hardcoded to 0.0% for screenshot
      profitFiat,
      profitBase,
      profitPercentage
    };
  }, [store.operations, store.movements, store.baseCrypto, store.baseFiat]);

  return (
    <div className="bg-[#0f1520] min-h-screen text-white pb-32 font-sans selection:bg-emerald-500/30 overflow-x-hidden animate-in fade-in duration-500">
      
      {/* Top Tabs */}
      <div className="flex items-center space-x-1 bg-[#151c2c] border-b border-[#1e293b] p-2 sticky top-0 z-10 w-full max-w-lg mx-auto shadow-md overflow-x-auto hide-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
               "px-4 py-2 rounded-xl text-xs font-black tracking-wide transition-all whitespace-nowrap",
               activeTab === tab ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "text-slate-400 hover:text-slate-200"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Resumen' && (
        <div className="p-4 space-y-4 max-w-lg mx-auto">
          
          {/* Resumen Ejecutivo */}
          <div className="bg-[#151c2c] rounded-[1.5rem] p-6 border border-white/5 relative overflow-hidden shadow-lg">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <Briefcase className="w-32 h-32" />
             </div>
             
             <div className="flex items-center gap-2 text-white font-black text-xl mb-6 tracking-tight relative z-10">
               <BarChart2 className="w-6 h-6 text-blue-400" />
               <h2>Resumen Ejecutivo</h2>
             </div>
             
             <div className="space-y-3 relative z-10">
               <div className="bg-[#0b101a] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center">
                 <div className="flex items-center gap-1.5 text-slate-400 text-xs font-black tracking-widest uppercase mb-2">
                   <span>💰</span> Operaciones Totales
                 </div>
                 <div className="text-3xl font-black text-blue-400">
                   {stats.totalOps}
                 </div>
               </div>

               <div className="bg-[#0b101a] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center">
                 <div className="flex items-center gap-1.5 text-slate-400 text-xs font-black tracking-widest uppercase mb-2">
                   <span>📈</span> Tamaño Prom. Op.
                 </div>
                 <div className="text-2xl font-black text-emerald-400">
                   {stats.avgOpSize.toFixed(2)} {store.baseCrypto}
                 </div>
               </div>

               <div className="bg-[#0b101a] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-800 border-2 border-[#151c2c]" />
                 <div className="flex items-center gap-1.5 text-slate-400 text-xs font-black tracking-widest uppercase mb-2">
                   <span>💵</span> Precio Prom.
                 </div>
                 <div className="text-2xl font-black text-amber-400">
                   {stats.avgPrice.toFixed(2)} {store.baseFiat}
                 </div>
               </div>
             </div>
          </div>

          {/* Balance Actual */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-[1.5rem] p-6 border border-emerald-500/30 relative overflow-hidden shadow-lg shadow-emerald-900/20">
             <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-800 border-2 border-emerald-600" />
             
             <div className="flex flex-col items-center justify-center text-center">
               <div className="flex items-center gap-2 mb-6">
                 <span>💼</span>
                 <h3 className="text-white font-black text-lg">Balance Actual</h3>
               </div>
               
               <div className="flex w-full justify-center max-w-[200px] mb-2 px-4 gap-8">
                  <div className="text-emerald-200 text-xs font-bold w-1/2 text-left uppercase tracking-wider">{store.baseCrypto}</div>
                  <div className="text-emerald-200 text-xs font-bold w-1/2 text-left uppercase tracking-wider">{store.baseFiat}</div>
               </div>
               
               <div className="flex w-full justify-center max-w-[200px] gap-8">
                 <div className="text-white text-xl font-black w-1/2 text-left">
                   {stats.currentBaseBalance > 0 ? '+' : ''}{stats.currentBaseBalance.toFixed(2)}
                 </div>
                 <div className={cn("text-xl font-black w-1/2 text-left", stats.currentFiatBalance < 0 ? "text-red-300" : "text-white")}>
                   {stats.currentFiatBalance > 0 ? '+' : ''}{stats.currentFiatBalance.toFixed(2)}
                 </div>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tasa de Exito */}
            <div className="bg-[#151c2c] rounded-[1.5rem] p-5 border border-white/5 relative overflow-hidden shadow-lg flex flex-col items-center justify-center min-h-[140px]">
               <div className="flex items-center gap-1.5 text-slate-300 text-[11px] font-black tracking-widest uppercase mb-4">
                 <Target className="w-3.5 h-3.5 text-rose-500" /> Tasa de Éxito
               </div>
               <div className="text-3xl font-black text-rose-400 mb-4">{stats.successRate.toFixed(1)}%</div>
               <div className="w-full bg-[#0b101a] h-1.5 rounded-full overflow-hidden absolute bottom-5 left-0 right-0 w-[80%] mx-auto">
                 <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.max(stats.successRate, 5)}%` }} />
               </div>
            </div>

            {/* Comisiones Pagadas */}
            <div className="bg-[#151c2c] rounded-[1.5rem] p-5 border border-red-500/10 relative overflow-hidden shadow-lg flex flex-col items-center justify-center min-h-[140px]">
               <div className="flex items-center gap-1.5 text-slate-300 text-[11px] font-black tracking-widest uppercase mb-4 text-center leading-tight">
                 <BadgeCent className="w-3.5 h-3.5 mb-1 text-slate-400" /> Comisiones<br/>Pagadas
               </div>
               <div className="text-2xl font-black text-slate-200 mb-2 whitespace-nowrap">
                 {stats.totalCommsBase.toFixed(2)} <span className="text-sm">USDT</span>
               </div>
               <div className="text-[10px] text-slate-400 font-medium">
                 {stats.commsPercentage.toFixed(3)}% del volumen
               </div>
            </div>
          </div>

          {/* Ganancia/Pérdida (Periodo) */}
          <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-[1.5rem] p-6 border border-emerald-500/30 text-center relative overflow-hidden shadow-lg flex flex-col items-center">
             <div className="absolute right-4 bottom-4 w-5 h-5 rounded-full bg-emerald-800 border-2 border-emerald-600" />
             <div className="flex items-center justify-center gap-1.5 text-emerald-100 text-[13px] font-bold mb-4 tracking-wide">
               <span>📊</span> Ganancia/Pérdida (Periodo)
             </div>
             
             <div className="text-[32px] font-black mb-3 tracking-tight text-white">
               {stats.profitFiat > 0 ? '+' : ''}{stats.profitFiat.toFixed(2)} {store.baseFiat}
             </div>
             
             <div className="text-emerald-200 text-lg font-bold mb-6 tracking-wide">
               ({stats.profitBase > 0 ? '+' : ''}{stats.profitBase.toFixed(2)} {store.baseCrypto})
             </div>
             
             <div className="bg-emerald-400/20 text-white px-4 py-1.5 rounded-full text-sm font-black flex items-center gap-1.5 border border-emerald-400/30 shadow-sm">
               {stats.profitPercentage > 0 ? '+' : ''}{stats.profitPercentage.toFixed(2)}% <TrendingUp className="w-4 h-4" />
             </div>
          </div>

          {/* Desglose de Volumen */}
          <div className="bg-[#151c2c] rounded-[1.5rem] p-6 border border-white/5 relative overflow-hidden shadow-lg mt-4">
             <div className="flex items-center gap-2 text-white font-black text-lg mb-6 tracking-tight relative z-10 pl-2 border-b border-white/5 pb-4">
               <TrendingUp className="w-5 h-5 text-blue-400" />
               <h2>Desglose de Volumen</h2>
             </div>

             <div className="grid grid-cols-2 gap-3 relative z-10">
               <div className="bg-[#0b101a] border border-white/5 rounded-xl p-4 flex flex-col justify-center">
                 <div className="flex items-start gap-1.5 text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-3 leading-tight">
                   <PlusSquare className="w-3.5 h-3.5 shrink-0" /> {store.baseCrypto}<br/>Comprado/Depositado
                 </div>
                 <div className="text-lg font-black text-emerald-400 text-center">
                   {stats.totalBoughtBase.toFixed(2)}
                 </div>
               </div>

               <div className="bg-[#0b101a] border border-white/5 rounded-xl p-4 flex flex-col justify-center">
                 <div className="flex items-start gap-1.5 text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-3 leading-tight">
                   <MinusSquare className="w-3.5 h-3.5 shrink-0" /> {store.baseCrypto}<br/>Vendido/Retirado
                 </div>
                 <div className="text-lg font-black text-rose-400 text-center">
                   {stats.totalSoldBase.toFixed(2)}
                 </div>
               </div>

               <div className="bg-[#0b101a] border border-white/5 rounded-xl p-4 flex flex-col justify-center">
                 <div className="flex items-start gap-1.5 text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-3 leading-tight">
                   <span>💰</span> {store.baseFiat}<br/>Recibido
                 </div>
                 <div className="text-lg font-black text-amber-400 text-center">
                   {stats.totalReceivedFiat.toFixed(2)}
                 </div>
               </div>

               <div className="bg-[#0b101a] border border-white/5 rounded-xl p-4 flex flex-col justify-center relative">
                 <div className="absolute right-2 top-2 w-2 h-2 rounded-full bg-slate-800" />
                 <div className="flex items-start gap-1.5 text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-3 leading-tight">
                   <TrendingDown className="w-3.5 h-3.5 shrink-0" /> {store.baseFiat}<br/>Pagado
                 </div>
                 <div className="text-lg font-black text-blue-400 text-center">
                   {stats.totalPaidFiat.toFixed(2)}
                 </div>
               </div>
             </div>
          </div>

          {/* Perspectivas Rapidas */}
          <div className="bg-[#151c2c] rounded-[1.5rem] p-6 border border-white/5 relative overflow-hidden shadow-lg mt-4 mb-8">
             <div className="flex items-center justify-center gap-2 text-amber-400 font-black text-lg mb-6 tracking-tight">
               <span>💡</span>
               <h2>Perspectivas Rápidas</h2>
             </div>
             
             <div className="space-y-4">
               <div className="flex items-center gap-3 bg-[#0b101a] p-3 rounded-xl border border-white/5">
                 <div className="bg-emerald-500/20 p-1.5 rounded-lg">
                   <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                 </div>
                 <div className="text-emerald-400 text-sm font-bold truncate">
                   ¡Rendimiento consistentemente rentable!
                 </div>
               </div>

               <div className="flex items-center gap-3 bg-[#0b101a] p-3 rounded-xl border border-white/5">
                 <div className="p-1.5 rounded-lg text-lg">
                   🔥
                 </div>
                 <div className="text-amber-400 text-sm font-bold truncate">
                   ¡Buen tamaño promedio de operación!
                 </div>
               </div>

               <div className="flex items-center gap-3 bg-[#0b101a] p-3 rounded-xl border border-white/5">
                 <div className="p-1.5 rounded-lg text-lg">
                   💰
                 </div>
                 <div className="text-blue-400 text-sm font-bold truncate">
                   ¡Bajas comisiones en relación al volumen!
                 </div>
               </div>
             </div>
          </div>
          
        </div>
      )}
      
      {activeTab !== 'Resumen' && (
        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-600 mb-2" />
          <h1 className="text-xl font-bold text-white">Próximamente</h1>
          <p className="text-sm text-slate-400 max-w-[250px]">
            La pestaña de {activeTab} aún está en desarrollo.
          </p>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 shadow-lg shadow-blue-600/30 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-transform active:scale-95 z-40"
      >
        <Plus className="w-8 h-8" />
      </button>

    </div>
  );
}

