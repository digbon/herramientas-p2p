import React, { useState } from 'react';
import { useAppStore } from '../store';
import { FolderUp, Download, Upload, RotateCcw, Plus, X, Pencil, ChevronDown, Search, MinusCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { connectSyncFolder } from '../lib/sync';

export function Gestor() {
  const store = useAppStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight">Ajustes Generales</h1>
      </div>

      <SectionCard title="Carpeta Sincronizada" icon={<FolderUp className="w-4 h-4" />}>
        <button onClick={() => connectSyncFolder()} className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-[0.98] mb-4">
          <FolderUp className="w-5 h-5" />
          Conectar Carpeta
        </button>
        <p className="text-[11px] text-slate-500 text-center leading-relaxed">
          Toda la información de la app (configuración, historial de operaciones y movimientos) se guarda automáticamente en tu navegador. Para sincronizarla desde la nube, utiliza las opciones de copia de seguridad.
        </p>
      </SectionCard>

      <SectionCard title="Idioma">
        <div className="relative">
          <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-blue-500 transition-colors">
            <option>Español</option>
            <option>English</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </SectionCard>

      <div id="gestor-de-datos">
      <SectionCard title="Gestor de Datos" icon={<RotateCcw className="w-4 h-4" />}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button 
            onClick={() => {
              const state = useAppStore.getState();
              const dataStr = JSON.stringify(state, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `p2p-backup-${new Date().toISOString().slice(0,10)}.json`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-600/20 flex flex-col items-center justify-center p-4 rounded-2xl gap-2 transition-all group active:scale-95"
          >
            <Download className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Respaldar (JSON)</span>
          </button>
          
          <button 
             onClick={() => {
               const state = store;
               // Basic CSV export for operations
               let csv = 'ID,Fecha,Tipo,Orden,Moneda_Origen,Cuenta_Origen,Moneda_Destino,Cuenta_Destino,Contraparte,Monto_Enviado,Monto_Recibido,Precio,Comision\n';
               state.operations.forEach(op => {
                 const calculateTotal = (val: number, comms: any[]) => {
                   return (comms || []).reduce((acc, curr) => {
                     const v = typeof curr === 'object' ? curr.value : curr;
                     const type = typeof curr === 'object' ? curr.type : 'fixed';
                     if (type === 'percentage') {
                       return acc + (val * (v / 100));
                     }
                     return acc + v;
                   }, 0);
                 };

                 const cs = calculateTotal(op.amountSent, op.commissionsSent);
                 const netSent = op.amountSent - cs;
                 const prelimReceived = netSent * op.price;
                 const cr = calculateTotal(prelimReceived, op.commissionsReceived);
                 
                 csv += `${op.id},${op.date},${op.type},${op.order},${op.sourceCurrency},${store.accounts.find(a => a.id === op.sourceAccountId)?.name || ''},${op.destCurrency},${store.accounts.find(a => a.id === op.destAccountId)?.name || ''},${op.counterpartName},${op.amountSent},${op.amountReceived},${op.price},${cs + cr}\n`;
               });
               const dataBlob = new Blob([csv], { type: 'text/csv' });
               const url = URL.createObjectURL(dataBlob);
               const link = document.createElement('a');
               link.href = url;
               link.download = `p2p-operations-${new Date().toISOString().slice(0,10)}.csv`;
               document.body.appendChild(link);
               link.click();
               document.body.removeChild(link);
             }}
             className="bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 flex flex-col items-center justify-center p-4 rounded-2xl gap-2 transition-all group active:scale-95"
          >
            <FolderUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Exportar (CSV)</span>
          </button>
        </div>
        
        <label className="w-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all cursor-pointer border border-slate-700 shadow-inner group">
          <Upload className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          <span className="text-sm">Importar Base de Datos</span>
          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (event) => {
                try {
                  const importedData = JSON.parse(event.target?.result as string);
                  if (confirm('Importar estos datos reemplazará tu información actual. ¿Estás seguro?')) {
                     store.importData(importedData);
                     alert('¡Datos importados con éxito!');
                  }
                } catch (err) {
                  alert('Error al leer el archivo JSON.');
                }
              };
              reader.readAsText(file);
              e.target.value = '';
            }}
          />
        </label>
      </SectionCard>
      </div>

      <SectionCard title="Mantenimiento" icon={<RotateCcw className="w-4 h-4 text-red-500" />}>
        <button 
           onClick={() => {
              if (confirm('¿Estás seguro? Esto eliminará todas tus cuentas, operaciones y configuraciones.')) {
                 store.resetAll();
                 alert('Aplicación reseteada al estado de fábrica.');
              }
           }}
           className="w-full bg-red-500/5 hover:bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all mb-3 active:scale-[0.98]"
        >
          <RotateCcw className="w-5 h-5" />
          Borrar Todo y Resetear
        </button>
        <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold opacity-60">
          Esta acción es irreversible
        </p>
      </SectionCard>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden p-5 shadow-xl shadow-black/20">
      <h2 className="text-[12px] font-black uppercase tracking-[0.15em] mb-6 flex items-center gap-3 text-slate-400">
        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 shadow-inner">
          {icon || <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
        </div>
        {title}
      </h2>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
