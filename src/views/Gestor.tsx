import React, { useState } from 'react';
import { useAppStore } from '../store';
import { FolderUp, Download, Upload, RotateCcw, Plus, X, Pencil, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { connectSyncFolder } from '../lib/sync';

export function Gestor() {
  const store = useAppStore();

  const [newPlatformOwner, setNewPlatformOwner] = useState<'Mias' | 'Cliente'>('Mias');
  const [newPlatformType, setNewPlatformType] = useState<'Fiat' | 'Crypto'>('Fiat');
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newPlatformDetails, setNewPlatformDetails] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold">Ajustes Generales</h1>
      </div>

      <SectionCard title="Carpeta Sincronizada" icon={<FolderUp className="w-4 h-4" />}>
        <button onClick={() => connectSyncFolder()} className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors mb-4">
          <FolderUp className="w-5 h-5" />
          Conectar Carpeta
        </button>
        <p className="text-xs text-slate-400 text-center">
          Toda la información de la app (configuración, historial de operaciones y movimientos) se guarda automáticamente en tu navegador. Para sincronizarla desde la nube, utiliza las opciones de copia de seguridad.
        </p>
      </SectionCard>

      <SectionCard title="Idioma">
        <div className="relative">
          <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-white appearance-none focus:outline-none focus:border-blue-500">
            <option>Español</option>
            <option>English</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </SectionCard>



      <SectionCard title="Plataformas y Métodos de Pago">
         <div className="space-y-4 mb-6 pb-6 border-b border-slate-800">
           <div className="space-y-1 relative">
             <label className="text-xs text-slate-400">Propietario</label>
             <select 
               value={newPlatformOwner}
               onChange={e => setNewPlatformOwner(e.target.value as 'Mias' | 'Cliente')}
               className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 appearance-none"
             >
               <option value="Mias">Mías (comerciante P2P)</option>
               <option value="Cliente">Cliente</option>
             </select>
             <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-8 pointer-events-none" />
           </div>
           <div className="space-y-1 relative">
             <label className="text-xs text-slate-400">Tipo</label>
             <select 
               value={newPlatformType}
               onChange={e => setNewPlatformType(e.target.value as 'Fiat' | 'Crypto')}
               className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 appearance-none"
             >
               <option value="Fiat">Fiat (banco / billetera)</option>
               <option value="Crypto">Crypto</option>
             </select>
             <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-8 pointer-events-none" />
           </div>
           <div className="space-y-1">
             <label className="text-xs text-slate-400">Nombre</label>
             <input 
                type="text"
                placeholder="Ej: Banco Unión, Binance, Tigo Money"
                value={newPlatformName}
                onChange={e => setNewPlatformName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
             />
           </div>
           <div className="space-y-1">
             <label className="text-xs text-slate-400">Detalles (opcional)</label>
             <input 
                type="text"
                placeholder="Nº de cuenta, alias, dirección, etc."
                value={newPlatformDetails}
                onChange={e => setNewPlatformDetails(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
             />
           </div>
           <button 
             onClick={() => {
               if(newPlatformName) {
                 store.addPlatform({
                   id: Date.now().toString(),
                   owner: newPlatformOwner,
                   type: newPlatformType,
                   name: newPlatformName,
                   details: newPlatformDetails
                 });
                 setNewPlatformName('');
                 setNewPlatformDetails('');
               }
             }}
             className="w-full bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30 border border-emerald-500/30 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
           >
              <Plus className="w-4 h-4" /> Agregar Plataforma
           </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm font-semibold flex items-center gap-2 mb-2 text-slate-300">
              <FolderUp className="w-4 h-4 opacity-50" /> Mis plataformas <span className="text-slate-500">({store.platforms.filter(p => p.owner === 'Mias').length})</span>
            </div>
            <div className="space-y-2">
              {store.platforms.filter(p => p.owner === 'Mias').map(p => (
                <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center gap-3">
                   <div className="flex-1">
                     <div className="flex items-center gap-2">
                       <span className="font-semibold text-sm">{p.name}</span>
                       <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", p.type === 'Fiat' ? "bg-purple-500/20 text-purple-400" : "bg-teal-500/20 text-teal-400")}>{p.type.toUpperCase()}</span>
                     </div>
                     {p.details && <div className="text-xs text-slate-500 mt-0.5">{p.details}</div>}
                   </div>
                   <button onClick={() => store.removePlatform(p.id)} className="text-slate-500 hover:text-red-500"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold flex items-center gap-2 mb-2 text-slate-300">
              <FolderUp className="w-4 h-4 opacity-50" /> Plataformas de cliente <span className="text-slate-500">({store.platforms.filter(p => p.owner === 'Cliente').length})</span>
            </div>
            <div className="space-y-2">
               {store.platforms.filter(p => p.owner === 'Cliente').map(p => (
                <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center gap-3">
                   <div className="flex-1">
                     <div className="flex items-center gap-2">
                       <span className="font-semibold text-sm">{p.name}</span>
                       <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", p.type === 'Fiat' ? "bg-purple-500/20 text-purple-400" : "bg-teal-500/20 text-teal-400")}>{p.type.toUpperCase()}</span>
                     </div>
                     {p.details && <div className="text-xs text-slate-500 mt-0.5">{p.details}</div>}
                   </div>
                   <button onClick={() => store.removePlatform(p.id)} className="text-slate-500 hover:text-red-500"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <div id="gestor-de-datos">
      <SectionCard title="Gestor de Datos">
        <div className="grid grid-cols-2 gap-3 mb-3">
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
            className="bg-emerald-600/20 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-600/30 flex flex-col items-center justify-center p-3 rounded-xl gap-2 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span className="text-xs font-semibold">Respaldar Datos (JSON)</span>
          </button>
          
          <button 
             onClick={() => {
               const state = useAppStore.getState();
               // Basic CSV export for operations
               let csv = 'ID,Fecha,Tipo,Orden,Moneda_Origen,Cuenta_Origen,Moneda_Destino,Cuenta_Destino,Contraparte,Monto_Enviado,Monto_Recibido,Precio,Comision\n';
               state.operations.forEach(op => {
                 csv += `${op.id},${op.date},${op.type},${op.order},${op.sourceCurrency},${store.accounts.find(a => a.id === op.sourceAccountId)?.name || ''},${op.destCurrency},${store.accounts.find(a => a.id === op.destAccountId)?.name || ''},${op.counterpartName},${op.amountSent},${op.amountReceived},${op.price},${op.commission}\n`;
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
             className="bg-emerald-600/20 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-600/30 flex flex-col items-center justify-center p-3 rounded-xl gap-2 transition-colors"
          >
            <FolderUp className="w-5 h-5" />
            <span className="text-xs font-semibold">Exportar (CSV)</span>
          </button>
        </div>
        
        <label className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors cursor-pointer">
          <Upload className="w-5 h-5 outline-none" />
          Importar Datos (JSON)
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
              // Reset input
              e.target.value = '';
            }}
          />
        </label>
      </SectionCard>
      </div>

      <SectionCard title="Mantenimiento">
        <button 
           onClick={() => {
              if (confirm('¿Estás seguro? Esto eliminará todas tus cuentas, operaciones y configuraciones.')) {
                 store.resetAll();
                 alert('Aplicación reseteada al estado de fábrica.');
              }
           }}
           className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors mb-2"
        >
          <RotateCcw className="w-5 h-5" />
          Resetear Aplicación
        </button>
        <p className="text-xs text-slate-500 text-center">
          Esto eliminará todos los datos de forma permanente. Esta acción no se puede revertir.
        </p>
      </SectionCard>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-4">
      <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 text-slate-200">
        <div className="w-4 h-4 flex items-center justify-center shrink-0">
          {icon || <div className="w-1.5 h-1.5 bg-slate-500 rounded-full" />}
        </div>
        {title}
      </h2>
      {children}
    </div>
  );
}
