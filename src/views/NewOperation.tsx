import React, { useState, useRef } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, User, FileText, Paperclip, ChevronDown, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppStore, Attachment } from '../store';

export function NewOperation({ onClose }: { onClose: () => void }) {
  const store = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [type, setType] = useState<'Compra' | 'Venta'>('Compra');
  const [order, setOrder] = useState<'Maker' | 'Taker'>('Maker');

  const [sourceCurrency, setSourceCurrency] = useState(store.baseFiat);
  const [sourceAccountId, setSourceAccountId] = useState('');
  
  const [destCurrency, setDestCurrency] = useState(store.baseCrypto);
  const [destAccountId, setDestAccountId] = useState('');

  const [counterpartName, setCounterpartName] = useState('');
  const [counterpartContact, setCounterpartContact] = useState('');
  
  const [myPlatformId, setMyPlatformId] = useState('');
  const [clientPlatformId, setClientPlatformId] = useState('');

  const [amountSent, setAmountSent] = useState('');
  const [price, setPrice] = useState('');
  const [amountReceived, setAmountReceived] = useState('');
  const [commission, setCommission] = useState('');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files as Iterable<File> | ArrayLike<File>).forEach((file: File) => {
      // 1MB max per file limit (approx 1,000,000 bytes)
      if (file.size > 1000000) {
         alert(`El archivo ${file.name} supera el límite de 1MB.`);
         return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setAttachments((prev) => [...prev, {
           name: file.name,
           type: file.type,
           dataUrl
        }]);
      };
      reader.readAsDataURL(file);
    });
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const sourceCurrencies = store.currencies.filter(c => type === 'Compra' ? c.type === 'Fiat' : c.type === 'Crypto');
  const destCurrencies = store.currencies.filter(c => type === 'Compra' ? c.type === 'Crypto' : c.type === 'Fiat');
  
  const handleSave = () => {
    store.addOperation({
       id: Date.now().toString(),
       type,
       order,
       sourceCurrency,
       sourceAccountId,
       destCurrency,
       destAccountId,
       counterpartName,
       counterpartContact,
       myPlatformId,
       clientPlatformId,
       amountSent: parseFloat(amountSent) || 0,
       price: parseFloat(price) || 0,
       amountReceived: parseFloat(amountReceived) || 0,
       commission: parseFloat(commission) || 0,
       notes,
       date: new Date().toISOString(),
       attachments
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex sm:items-center justify-center pointer-events-none sm:p-4">
        <div className="bg-slate-950 pointer-events-auto sm:border border-t border-slate-800 w-full max-w-md max-h-[90vh] sm:max-h-[85vh] sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900 shrink-0">
            <h2 className="text-lg font-bold text-white">Nueva Operación</h2>
            <button onClick={onClose} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 touch-pan-y">
            
            <div className="space-y-4">
              <div className="space-y-1 relative">
                <label className="text-xs text-slate-400">Tipo de Operación</label>
                <select value={type} onChange={e => setType(e.target.value as 'Compra'|'Venta')} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white appearance-none outline-none focus:border-blue-500">
                  <option value="Compra">Compra</option>
                  <option value="Venta">Venta</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-[34px] pointer-events-none" />
                 <p className="text-[10px] text-slate-500 mt-1">Etiqueta de la operación. La dirección real depende de las monedas de origen y destino que elijas debajo.</p>
              </div>
              
              <div className="space-y-1 relative">
                <label className="text-xs text-slate-400">Orden (Maker/Taker)</label>
                <select value={order} onChange={e => setOrder(e.target.value as 'Maker'|'Taker')} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white appearance-none outline-none focus:border-blue-500">
                  <option value="Maker">Maker</option>
                  <option value="Taker">Taker</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-[34px] pointer-events-none" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
               <div className="flex items-center gap-2 text-slate-300 mb-2">
                 <ArrowUpCircle className="w-5 h-5 text-red-500" />
                 <span className="font-semibold text-sm">Entregaste (origen)</span>
                 <span className="ml-auto text-[10px] font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase">{type === 'Compra' ? 'FIAT' : 'CRYPTO'}</span>
               </div>
               <div className="space-y-3">
                 <div className="space-y-1 relative">
                   <label className="text-xs text-slate-400">Moneda</label>
                   <select value={sourceCurrency} onChange={e => setSourceCurrency(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-white appearance-none outline-none focus:border-blue-500">
                     {sourceCurrencies.map(c => <option key={c.symbol} value={c.symbol}>{c.symbol}</option>)}
                   </select>
                   <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-[34px] pointer-events-none" />
                 </div>
                 <div className="space-y-1 relative">
                   <label className="text-xs text-slate-400">Cuenta {sourceCurrency}</label>
                   <select value={sourceAccountId} onChange={e => setSourceAccountId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-white appearance-none outline-none focus:border-blue-500">
                     <option value="">-- Seleccionar --</option>
                     {store.accounts.filter(a => a.currency === sourceCurrency).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                     <option value="new">+ Nueva cuenta...</option>
                   </select>
                   <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-[34px] pointer-events-none" />
                 </div>
               </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
               <div className="flex items-center gap-2 text-slate-300 mb-2">
                 <ArrowDownCircle className="w-5 h-5 text-emerald-500" />
                 <span className="font-semibold text-sm">Recibiste (destino)</span>
                 <span className="ml-auto text-[10px] font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase">{type === 'Compra' ? 'CRYPTO' : 'FIAT'}</span>
               </div>
               <div className="space-y-3">
                 <div className="space-y-1 relative">
                   <label className="text-xs text-slate-400">Moneda</label>
                   <select value={destCurrency} onChange={e => setDestCurrency(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-white appearance-none outline-none focus:border-blue-500">
                     {destCurrencies.map(c => <option key={c.symbol} value={c.symbol}>{c.symbol}</option>)}
                   </select>
                   <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-[34px] pointer-events-none" />
                 </div>
                 <div className="space-y-1 relative">
                   <label className="text-xs text-slate-400">Cuenta {destCurrency}</label>
                   <select value={destAccountId} onChange={e => setDestAccountId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-white appearance-none outline-none focus:border-blue-500">
                     <option value="">-- Seleccionar --</option>
                     {store.accounts.filter(a => a.currency === destCurrency).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                     <option value="new">+ Nueva cuenta...</option>
                   </select>
                   <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-[34px] pointer-events-none" />
                 </div>
               </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-blue-400"><User className="w-4 h-4" /> Información de Contraparte</h3>
              <div className="space-y-3">
                <div className="space-y-1 text-xs">
                  <label className="text-slate-400">Nombre del Vendedor/Comprador <span className="text-red-500">*</span></label>
                  <input value={counterpartName} onChange={e => setCounterpartName(e.target.value)} type="text" placeholder="Ej: Juan Pérez" className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500" />
                  <p className="text-[10px] text-slate-500 mt-1">Nombre completo de la persona con quien realizas la transacción. Importante para respaldo legal.</p>
                </div>
                <div className="space-y-1 text-xs">
                  <label className="text-slate-400">Contacto (Opcional)</label>
                  <input value={counterpartContact} onChange={e => setCounterpartContact(e.target.value)} type="text" placeholder="Teléfono, email o usuario" className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500" />
                  <p className="text-[10px] text-slate-500 mt-1">Información de contacto para futuras referencias.</p>
                </div>
                
                <div className="space-y-1 relative">
                  <label className="text-xs text-slate-400">Mi plataforma / método de pago</label>
                  <select value={myPlatformId} onChange={e => setMyPlatformId(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white appearance-none outline-none focus:border-blue-500">
                    <option value="">-- Sin asignar --</option>
                    {store.platforms.filter(p => p.owner === 'Mias').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-[34px] pointer-events-none" />
                </div>
                 <div className="space-y-1 relative">
                  <label className="text-xs text-slate-400">Plataforma / método del cliente</label>
                  <select value={clientPlatformId} onChange={e => setClientPlatformId(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white appearance-none outline-none focus:border-blue-500">
                    <option value="">-- Sin asignar --</option>
                    {store.platforms.filter(p => p.owner === 'Cliente').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-[34px] pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-amber-400"><FileText className="w-4 h-4" /> Detalles Financieros</h3>
              <div className="space-y-4">
                 <div className="space-y-1 text-xs">
                    <label className="text-slate-400">Monto entregado ({sourceCurrency}) <span className="text-red-500">*</span></label>
                    <input type="number" value={amountSent} onChange={e => setAmountSent(e.target.value)} placeholder={`Ej: 1500 ${sourceCurrency}`} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500 text-lg font-medium" />
                 </div>
                 <div className="space-y-1 text-xs">
                    <label className="text-slate-400">Precio ({sourceCurrency} por 1 {destCurrency})</label>
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder={`Ej: 15.17`} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500 text-lg font-medium" />
                    <p className="text-[10px] text-slate-500 mt-1">Opcional: si lo completas junto con uno de los montos, el otro se calcula automáticamente.</p>
                 </div>
                 <div className="space-y-1 text-xs">
                    <label className="text-slate-400">Monto recibido ({destCurrency}) <span className="text-red-500">*</span></label>
                    <input type="number" value={amountReceived} onChange={e => setAmountReceived(e.target.value)} placeholder={`Ej: 98.87 ${destCurrency}`} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500 text-lg font-medium" />
                 </div>
                 <div className="space-y-1 text-xs">
                    <label className="text-slate-400">Comisión ({destCurrency})</label>
                    <input type="number" value={commission} onChange={e => setCommission(e.target.value)} placeholder={`Ej: 0.15 ${destCurrency}`} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500 text-lg font-medium" />
                    <p className="text-[10px] text-slate-500 mt-1">Se descuenta del monto recibido al calcular el saldo de la cuenta destino.</p>
                 </div>
              </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-sm font-semibold flex items-center gap-2"><Paperclip className="w-4 h-4 text-slate-400" /> Archivos Adjuntos</h3>
               
               {attachments.length > 0 ? (
                 <div className="space-y-2">
                   {attachments.map((att, i) => (
                     <div key={i} className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-2 px-3">
                       <span className="text-sm text-slate-300 truncate mr-2">{att.name}</span>
                       <button onClick={() => removeAttachment(i)} className="text-slate-500 hover:text-red-500">
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-xs text-slate-400 text-center py-2">No hay archivos. Agrega comprobantes, capturas o videos.</p>
               )}

               <label className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors cursor-pointer">
                 <span className="text-lg leading-none mb-0.5">+</span> Agregar archivo
                 <input 
                   type="file" 
                   ref={fileInputRef}
                   onChange={handleFileUpload}
                   className="hidden"
                   multiple
                 />
               </label>
               <p className="text-[10px] text-slate-500">Hasta 1 MB por archivo. Se guardan localmente para esta operación.</p>
            </div>

             <div className="space-y-2">
               <h3 className="text-sm font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-amber-500" /> Información Adicional</h3>
               <textarea 
                 value={notes} 
                 onChange={e => setNotes(e.target.value)}
                 placeholder="Notas de la Operación"
                 className="w-full h-24 bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500 resize-none text-sm" 
               />
             </div>

          </div>

          <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4 border-t border-slate-800 bg-slate-950 flex gap-3 shrink-0">
            <button onClick={handleSave} disabled={!counterpartName || !amountSent || !amountReceived} className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-colors">Guardar</button>
            <button onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-colors">Cancelar</button>
          </div>

        </div>
      </div>
    </>
  );
}
