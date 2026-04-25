import React, { useState } from 'react';
import { useAppStore } from '../store';
import { FolderUp, Download, Upload, RotateCcw, Plus, X, Pencil, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { connectSyncFolder } from '../lib/sync';

export function Gestor() {
  const store = useAppStore();

  const [newCurrency, setNewCurrency] = useState('');
  const [newCurrencyType, setNewCurrencyType] = useState<'Fiat' | 'Crypto'>('Fiat');

  const [newAccountCurrency, setNewAccountCurrency] = useState('USDT');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  
  const [newPlatformOwner, setNewPlatformOwner] = useState<'Mias' | 'Cliente'>('Mias');
  const [newPlatformType, setNewPlatformType] = useState<'Fiat' | 'Crypto'>('Fiat');
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newPlatformDetails, setNewPlatformDetails] = useState('');

  const [isInitialBalanceModalOpen, setIsInitialBalanceModalOpen] = useState(false);

  // Calculate generic balances based on initial balances
  const getCryptoBalance = (symbol: string) => store.accounts.filter(a => a.currency === symbol).reduce((acc, a) => acc + a.initialBalance, 0);
  const getFiatBalance = (symbol: string) => store.accounts.filter(a => a.currency === symbol).reduce((acc, a) => acc + a.initialBalance, 0);

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

      <SectionCard title="Saldo Inicial">
        <div className="space-y-2 text-sm text-slate-300 mb-4">
           {store.currencies.map(c => (
              <div key={c.symbol}>Balance {c.symbol} Inicial: <span className="font-semibold text-white">{c.type === 'Fiat' ? getFiatBalance(c.symbol).toFixed(2) : getCryptoBalance(c.symbol).toFixed(2)}</span></div>
           ))}
        </div>
        <button onClick={() => setIsInitialBalanceModalOpen(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors">
          Modificar Saldo Inicial
        </button>
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

      <SectionCard title="Configuración de Visualización de Divisas">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Etiqueta para tu Moneda Fiat (Local)</label>
            <input
              type="text"
              value={store.baseFiat}
              onChange={(e) => store.setBaseFiat(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Etiqueta para tu Criptomoneda Principal</label>
            <input
              type="text"
              value={store.baseCrypto}
              onChange={(e) => store.setBaseCrypto(e.target.value)}
               className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
            <FolderUp className="w-4 h-4" /> Guardar Etiquetas de Divisas
          </button>
          <p className="text-xs text-slate-500 leading-relaxed text-center">
            Estas etiquetas se usarán para mostrar tus saldos y operaciones. Los cálculos internos no se ven afectados.
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Mis Monedas">
         <p className="text-xs text-slate-400 mb-4">
          Cada moneda lleva una etiqueta (fiat o cripto) y aparece como opción al crear operaciones. Puedes combinar cualquier par: BOB - USDT, USD - ARS.
         </p>
         <div className="space-y-2 mb-4">
           {store.currencies.map(c => (
             <div key={c.symbol} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
               <span className="font-semibold text-white min-w-[50px]">{c.symbol}</span>
               {c.isPrincipal && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">PRINCIPAL</span>}
               <div className="flex-1" />
               <div className="relative">
                 <select 
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-sm text-slate-300 outline-none appearance-none pr-7"
                    value={c.type}
                    disabled
                  >
                   <option>Fiat</option>
                   <option>Crypto</option>
                 </select>
                 <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
               </div>
               {!c.isPrincipal && (
                 <button onClick={() => store.removeCurrency(c.symbol)} className="p-1 hover:bg-red-500/20 text-slate-500 hover:text-red-500 rounded"><X className="w-4 h-4" /></button>
               )}
             </div>
           ))}
         </div>
         <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ej: ARS, ETH, USDC" 
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500 uppercase"
              value={newCurrency}
              onChange={e => setNewCurrency(e.target.value.toUpperCase())}
            />
            <div className="relative">
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-8 py-2 text-sm text-white outline-none focus:border-blue-500 appearance-none"
                value={newCurrencyType}
                onChange={e => setNewCurrencyType(e.target.value as 'Fiat' | 'Crypto')}
              >
                <option value="Fiat">Fiat</option>
                <option value="Crypto">Crypto</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button 
              onClick={() => {
                if(newCurrency && !store.currencies.find(c => c.symbol === newCurrency)) {
                  store.addCurrency({ symbol: newCurrency, type: newCurrencyType });
                  setNewCurrency('');
                }
              }}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 flex items-center justify-center rounded-lg text-white"
            >
              <Plus className="w-5 h-5" />
            </button>
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
      
      {isInitialBalanceModalOpen && <InitialBalanceModal onClose={() => setIsInitialBalanceModalOpen(false)} />}
    </div>
  );
}

function InitialBalanceModal({ onClose }: { onClose: () => void }) {
  const store = useAppStore();

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex sm:items-center justify-center pointer-events-none sm:p-4">
         <div className="bg-slate-950 pointer-events-auto sm:border border-t border-slate-800 w-full max-w-md max-h-[90vh] sm:max-h-[85vh] sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900 shrink-0">
              <h2 className="text-lg font-bold text-white">Modificar Saldo Inicial</h2>
              <button onClick={onClose} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 touch-pan-y">
               <p className="text-sm text-slate-400">
                 Configura el saldo inicial de cada cuenta. Puedes agregar más cuentas o monedas con el botón "+".
               </p>
               
               {store.accounts.map((acc, index) => (
                  <div key={acc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                     <div className="flex items-center gap-3">
                       <div className="flex-1 space-y-1 relative">
                         <label className="text-xs text-slate-400">Moneda</label>
                         <select 
                           value={acc.currency} 
                           onChange={(e) => store.updateAccount(acc.id, { currency: e.target.value })}
                           className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-white appearance-none outline-none focus:border-blue-500"
                         >
                           {store.currencies.map(c => <option key={c.symbol} value={c.symbol}>{c.symbol}</option>)}
                         </select>
                         <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-[34px] pointer-events-none" />
                       </div>
                       <button onClick={() => {
                          store.removeAccount(acc.id);
                       }} className="mt-5 w-12 h-12 flex items-center justify-center bg-slate-950 border border-slate-800 rounded-lg text-slate-500 hover:text-red-500 shrink-0">
                         <X className="w-5 h-5" />
                       </button>
                     </div>

                     <div className="space-y-1 text-xs">
                       <label className="text-slate-400">Nombre de la Cuenta</label>
                       <input 
                         type="text" 
                         value={acc.name} 
                         onChange={(e) => store.updateAccount(acc.id, { name: e.target.value })}
                         placeholder="Ej: Cuenta 1, Binance, BCP..."
                         className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500 text-base" 
                       />
                     </div>
                     
                     <div className="space-y-1 text-xs">
                       <label className="text-slate-400">Saldo inicial ({acc.currency})</label>
                       <input 
                         type="number" 
                         value={acc.initialBalance} 
                         onChange={(e) => store.updateAccountInitialBalance(acc.id, parseFloat(e.target.value) || 0)}
                         className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500 text-base font-bold" 
                       />
                       {acc.currency === store.baseCrypto && (
                         <p className="text-[10px] text-slate-500 mt-1">Esta es tu moneda principal. Aparecerá destacada en el encabezado.</p>
                       )}
                     </div>
                  </div>
               ))}

               <button onClick={() => {
                  const defaultCurrency = store.currencies[0]?.symbol || 'USDT';
                  const counts = store.accounts.filter(a => a.currency === defaultCurrency).length;
                  store.addAccount({ id: Date.now().toString(), currency: defaultCurrency, name: `Cuenta ${counts + 1}`, initialBalance: 0 });
               }} className="w-full py-4 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 hover:text-white hover:border-slate-700 hover:bg-slate-900 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" /> Agregar Cuenta
               </button>
               
            </div>

            <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4 border-t border-slate-800 bg-slate-900 shrink-0">
               <button onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-colors">
                 Listo
               </button>
            </div>

         </div>
      </div>
    </>
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
