import React, { useState } from 'react';
import { ArrowLeft, Home, History, Wallet, BarChart3, Calculator, Settings, PlusCircle, Search, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function Documentation({ onBack }: { onBack: () => void }) {
  const [activeSubTab, setActiveSubTab] = useState('dashboard');

  const docTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'historial', label: 'Historial', icon: History },
    { id: 'balance', label: 'Balance', icon: Wallet },
    { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
    { id: 'simulador', label: 'Simulador', icon: Calculator },
    { id: 'ajustes', label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white tracking-tight">Sobre el funcionamiento</h1>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {docTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors",
                isActive ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400 hover:bg-slate-800"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 min-h-[400px]">
        {activeSubTab === 'dashboard' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Dashboard</h2>
            <div className="text-sm text-slate-400 leading-relaxed">
              Próximamente: Explicación de las funciones del Dashboard...
            </div>
          </div>
        )}
        {activeSubTab === 'historial' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <History className="w-5 h-5 text-blue-500" />
              Guía del Historial
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              El historial es el registro central de todas las acciones en la aplicación. A continuación se detalla exactamente cómo funciona la interfaz:
            </p>

            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-6 overflow-hidden relative">
              {/* Fake History Screen Area to annotate */}
              
              <div className="relative">
                <div className="absolute -left-3 -top-3 w-6 h-6 bg-emerald-500 text-white text-xs font-bold flex items-center justify-center rounded-full z-10 shadow-[0_0_10px_rgba(16,185,129,0.5)]">1</div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text"
                      disabled
                      placeholder="Buscar nombre, plataforma, notas..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-3 top-1 w-6 h-6 bg-blue-500 text-white text-xs font-bold flex items-center justify-center rounded-full z-10 shadow-[0_0_10px_rgba(59,130,246,0.5)]">2</div>
                <div className="flex gap-4 border-b border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-hide px-4">
                  <div className="flex flex-col items-center gap-1 px-2 py-3 text-sm font-bold transition-all border-b-2 min-w-[80px] border-blue-500 text-blue-500">
                    <span className="text-[10px] uppercase tracking-wider">Operaciones</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full border bg-blue-600 text-white border-blue-500">
                      12
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 px-2 py-3 text-sm font-bold transition-all border-b-2 min-w-[80px] border-transparent text-slate-500">
                    <span className="text-[10px] uppercase tracking-wider">Depósitos</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full border bg-slate-900 border-slate-800 text-slate-500">
                      5
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-3 top-1 w-6 h-6 bg-purple-500 text-white text-xs font-bold flex items-center justify-center rounded-full z-10 shadow-[0_0_10px_rgba(168,85,247,0.5)]">3</div>
                
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left flex items-start gap-3 relative">
                  <div className="absolute right-4 top-4 w-6 h-6 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full z-10 shadow-[0_0_10px_rgba(239,68,68,0.5)]">4</div>
                  
                  <div className="mt-1 p-2 rounded-full shrink-0 bg-blue-500/20 text-blue-500">
                    <History className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold text-white truncate">Transferencia</div>
                      <div className="flex items-center gap-2">
                        <div className="text-[10px] text-slate-500 whitespace-nowrap">27/04/26 02:40</div>
                        <button className="p-1.5 text-slate-600 rounded-lg">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="truncate max-w-[80px] font-bold text-slate-300">Mi Cuenta</span>
                        <span className="text-slate-600">→</span>
                        <span className="truncate max-w-[80px] font-bold text-slate-300">Cuenta Destino</span>
                      </div>
                      <span className="font-black text-white">100.00 <span className="text-slate-500 font-normal text-[10px]">USDT</span></span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="grid gap-4 pt-2">
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 bg-emerald-500 text-white text-xs font-bold flex items-center justify-center rounded-full shrink-0 mt-0.5">1</div>
                <div>
                  <h3 className="text-sm font-bold text-white">Barra de Búsqueda</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Filtra la lista mostrada actualmente en pantalla. Puedes buscar por nombre de plataforma, cliente o cualquier texto en las notas de la operación/movimiento.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 bg-blue-500 text-white text-xs font-bold flex items-center justify-center rounded-full shrink-0 mt-0.5">2</div>
                <div>
                  <h3 className="text-sm font-bold text-white">Pestañas de Categoría</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Cambian la vista principal. Cada pestaña muestra debajo de su nombre entre píldoras de color el número total de transacciones o registros guardados en esa categoría. Las opciones disponibles son Operaciones, Depósitos, Retiros, Transferencias, Clientes y Plataformas.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 bg-purple-500 text-white text-xs font-bold flex items-center justify-center rounded-full shrink-0 mt-0.5">3</div>
                <div>
                  <h3 className="text-sm font-bold text-white">Tarjeta de Registro</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Muestra los datos más relevantes para cada tipo de transacción: Origen y destino de los fondos, fecha y hora exacta, costo total, comisiones involucradas y monto transferido, con su propia iconografía de colores dependiendo del tipo (verde para compras o depósitos, rojo para retiros o ventas, azul para transferencias).
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full shrink-0 mt-0.5">4</div>
                <div>
                  <h3 className="text-sm font-bold text-white">Botón de Eliminar</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Es la opción principal de edición de historial. Permite borrar una operación o movimiento que fue introducido incorrectamente. Al borrar, el sistema no revierte los fondos, tendrás que ajustarlos manualmente en el balance. 
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeSubTab === 'balance' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Balance y Cuentas</h2>
            <div className="text-sm text-slate-400 leading-relaxed">
              Próximamente: Explicación de la gestión de plataformas, cuentas propias, cuentas de clientes, monedas y saldos...
            </div>
          </div>
        )}
        {activeSubTab === 'estadisticas' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Estadísticas</h2>
            <div className="text-sm text-slate-400 leading-relaxed">
              Próximamente: Explicación sobre métricas de rentabilidad, volumen, clientes y gráficos...
            </div>
          </div>
        )}
        {activeSubTab === 'simulador' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Simulador</h2>
            <div className="text-sm text-slate-400 leading-relaxed">
              Próximamente: Explicación sobre el cálculo dinámico de beneficios, precios efectivos y breakeven...
            </div>
          </div>
        )}
        {activeSubTab === 'ajustes' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Ajustes Generales</h2>
            <div className="text-sm text-slate-400 leading-relaxed">
              Próximamente: Explicación de respaldos automatizados, sincronización manual, idioma y mantenimiento de la base de datos...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
