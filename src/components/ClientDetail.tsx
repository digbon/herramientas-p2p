import React, { useState } from 'react';
import { useAppStore, Client } from '../store';
import { X, User, Phone, Calendar, ArrowUpRight, ArrowDownRight, Wallet, History as HistoryIcon, Pencil, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { PlatformAccordion } from './PlatformAccordion';

interface ClientDetailProps {
  clientId: string;
  onClose: () => void;
}

export function ClientDetail({ clientId, onClose }: ClientDetailProps) {
  const store = useAppStore();
  const client = store.clients.find(c => c.id === clientId);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(client.name);
  const [editContact, setEditContact] = useState(client.contact || '');

  const handleSave = () => {
    store.updateClient(clientId, { name: editName, contact: editContact });
    setIsEditing(false);
  };

  if (!client) return null;

  const clientAccounts = store.accounts.filter(a => a.ownerType === 'Cliente' && a.ownerName === client.name);
  const clientPlatforms = store.platforms.filter(p => 
    p.owner === 'Cliente' && 
    store.accounts.some(a => a.platformId === p.id && a.ownerName === client.name)
  );
  
  // Get operations where this client is the counterpart
  const clientOperations = store.operations.filter(o => o.counterpartName === client.name);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col sm:max-w-lg sm:mx-auto sm:my-8 sm:rounded-3xl sm:shadow-2xl overflow-hidden border border-slate-800">
      <div className="p-4 border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-900/20">
            <User className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            {isEditing ? (
              <input 
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-sm font-bold text-white outline-none focus:border-blue-500"
              />
            ) : (
              <h2 className="text-lg font-bold text-white tracking-tight leading-none mb-1">{client.name}</h2>
            )}
            <div className="flex items-center gap-2">
               <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none">Perfil de Cliente</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
             <button 
                onClick={handleSave}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                title="Guardar"
             >
                <Check className="w-4 h-4" />
             </button>
          ) : (
             <button 
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-slate-900 rounded-full text-slate-400 hover:text-white transition-colors"
                title="Editar"
             >
                <Pencil className="w-4 h-4" />
             </button>
          )}
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-900 rounded-full text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-10">
        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Phone className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">Contacto</span>
            </div>
            {isEditing ? (
              <input 
                value={editContact}
                onChange={e => setEditContact(e.target.value)}
                placeholder="Teléfono, etc."
                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
              />
            ) : (
              <span className="text-sm text-white font-medium">{client.contact || 'No registrado'}</span>
            )}
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">Registro</span>
            </div>
            <span className="text-sm text-white font-medium">{format(new Date(client.createdAt), 'dd MMMM, yyyy')}</span>
          </div>
        </div>

        {/* Platforms */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Métodos de Pago</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-bold">{clientPlatforms.length} Plataformas</span>
          </div>
          <div className="space-y-3">
            {clientPlatforms.map(platform => (
              <PlatformAccordion key={platform.id} platform={platform} />
            ))}
            {clientPlatforms.length === 0 && (
              <div className="text-center py-6 bg-slate-950/30 border border-dashed border-slate-800 rounded-xl">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Sin plataformas registradas</span>
              </div>
            )}
          </div>
        </section>

        {/* History */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <HistoryIcon className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-widest">Historial Reciente</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-bold">{clientOperations.length} Ops.</span>
          </div>
          <div className="space-y-2">
            {clientOperations.slice(0, 10).map((op) => (
              <div key={op.id} className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center border",
                    op.type === 'Compra' 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                      : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                  )}>
                    {op.type === 'Compra' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {op.type === 'Compra' ? 'Venta exitosa' : 'Venta exitosa'} 
                      <span className="text-slate-500 font-normal ml-1">({op.type})</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{format(new Date(op.date), 'dd/MM/yy HH:mm')}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-white">{op.amountReceived} {op.destCurrency}</div>
                  <div className="text-[10px] text-slate-500">{op.amountSent} {op.sourceCurrency}</div>
                </div>
              </div>
            ))}
            {clientOperations.length === 0 && (
              <div className="text-center py-6 bg-slate-950/30 border border-dashed border-slate-800 rounded-xl">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Sin historial registrado</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
