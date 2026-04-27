import React, { useState, useRef } from "react";
import {
  X,
  ArrowUpCircle,
  ArrowDownCircle,
  ChevronDown,
  Trash2,
  Plus,
  Paperclip,
  Wallet
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAppStore, Attachment, Commission } from "../store";
import { OwnerNamePicker } from "../components/OwnerNamePicker";
import { PaymentMethodPicker } from "../components/PaymentMethodPicker";
import { PaymentMethodModal } from "../components/PaymentMethodModal";
import { CurrencyPicker } from "../components/CurrencyPicker";

export function NewOperation({ onClose }: { onClose: () => void }) {
  const store = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pmModalState, setPmModalState] = useState<{
    isOpen: boolean;
    currency: string;
    ownerType: 'Mias' | 'Cliente';
    ownerName: string;
    targetState: 'sourceMy' | 'sourceClient' | 'destMy' | 'destClient' | null;
  }>({
    isOpen: false,
    currency: '',
    ownerType: 'Mias',
    ownerName: 'Mias',
    targetState: null
  });

  const [type, setType] = useState<"Compra" | "Venta">("Compra");
  const [order, setOrder] = useState<"Maker" | "Taker">("Maker");
  const [clientName, setClientName] = useState("");
  const [clientIdPlatform, setClientIdPlatform] = useState("");
  const [p2pPlatform, setP2pPlatform] = useState("");

  const [sourceCurrency, setSourceCurrency] = useState(store.baseFiat);
  const [sourceMyPaymentMethodId, setSourceMyPaymentMethodId] = useState("");
  const [sourceClientPaymentMethodId, setSourceClientPaymentMethodId] = useState("");

  const [destCurrency, setDestCurrency] = useState(store.baseCrypto);
  const [destMyPaymentMethodId, setDestMyPaymentMethodId] = useState("");
  const [destClientPaymentMethodId, setDestClientPaymentMethodId] = useState("");

  const [amountInvested, setAmountInvested] = useState("");
  const [price, setPrice] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [isPriceMultiplier, setIsPriceMultiplier] = useState(false);
  
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Update default price mode when type changes
  React.useEffect(() => {
    setIsPriceMultiplier(type === 'Venta');
  }, [type]);

  // Auto-calculation logic
  React.useEffect(() => {
    const s = parseFloat(amountInvested) || 0;
    const p = parseFloat(price) || 0;

    const calculateTotal = (val: number, comms: typeof commissions) => {
      return comms.reduce((acc, curr) => {
        const v = curr.value || 0;
        if (curr.type === "percentage") {
          return acc + val * (v / 100);
        }
        return acc + v;
      }, 0);
    };

    if (s > 0 && p > 0) {
      const netSent = s;
      const preliminaryReceived = isPriceMultiplier ? (netSent * p) : (netSent / p);
      const cr = calculateTotal(preliminaryReceived, commissions);
      const received = preliminaryReceived - cr;
      setAmountReceived(received > 0 ? received.toFixed(6).replace(/\.?0+$/, "") : "0");
    } else {
      setAmountReceived("");
    }
  }, [amountInvested, price, commissions, isPriceMultiplier]);

  const addCommission = () => setCommissions([...commissions, { name: "", value: 0, type: "fixed" }]);
  const removeCommission = (index: number) => setCommissions(commissions.filter((_, i) => i !== index));
  const updateCommission = (index: number, updates: Partial<Commission>) => {
    const newComm = [...commissions];
    newComm[index] = { ...newComm[index], ...updates };
    setCommissions(newComm);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files as Iterable<File> | ArrayLike<File>).forEach(
      (file: File) => {
        if (file.size > 1000000) {
          alert(`El archivo ${file.name} supera el límite de 1MB.`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          setAttachments((prev) => [
            ...prev,
            { name: file.name, type: file.type, dataUrl },
          ]);
        };
        reader.readAsDataURL(file);
      },
    );
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    let finalClientName = clientName.trim();
    
    if (!finalClientName) {
      alert("Debes ingresar un nombre de cliente");
      return;
    }

    store.addOperation({
      id: Date.now().toString(),
      type,
      order,
      sourceCurrency,
      sourceMyPaymentMethodId,
      sourceClientPaymentMethodId,
      destCurrency,
      destMyPaymentMethodId,
      destClientPaymentMethodId,
      clientName: finalClientName,
      clientIdPlatform,
      p2pPlatform,
      amountInvested: parseFloat(amountInvested) || 0,
      price: parseFloat(price) || 0,
      amountReceived: parseFloat(amountReceived) || 0,
      commissions: commissions.filter(c => c.value > 0),
      notes,
      date: new Date().toISOString(),
      attachments,
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex sm:items-center justify-center pointer-events-none sm:p-4">
        <div className="bg-slate-950 pointer-events-auto sm:border border-t border-slate-800 w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900 shrink-0">
            <h2 className="text-lg font-bold text-white">Nueva Operación P2P</h2>
            <button onClick={onClose} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6 touch-pan-y">
            
            {/* TIPO DE OPERACION Y ORDEN */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 relative">
                <label className="text-xs text-slate-400 uppercase tracking-widest font-black">Tipo de Operación</label>
                <div className="flex gap-2">
                  <button onClick={() => setType('Compra')} className={cn("flex-1 py-2 rounded-lg text-sm font-bold border", type === 'Compra' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" : "bg-slate-900 border-slate-800 text-slate-500")}>Compra</button>
                  <button onClick={() => setType('Venta')} className={cn("flex-1 py-2 rounded-lg text-sm font-bold border", type === 'Venta' ? "bg-red-500/20 text-red-400 border-red-500/50" : "bg-slate-900 border-slate-800 text-slate-500")}>Venta</button>
                </div>
              </div>
              <div className="space-y-1 relative">
                <label className="text-xs text-slate-400 uppercase tracking-widest font-black">Orden</label>
                <div className="flex gap-2">
                  <button onClick={() => setOrder('Maker')} className={cn("flex-1 py-2 rounded-lg text-sm font-bold border", order === 'Maker' ? "bg-blue-500/20 text-blue-400 border-blue-500/50" : "bg-slate-900 border-slate-800 text-slate-500")}>Maker</button>
                  <button onClick={() => setOrder('Taker')} className={cn("flex-1 py-2 rounded-lg text-sm font-bold border", order === 'Taker' ? "bg-blue-500/20 text-blue-400 border-blue-500/50" : "bg-slate-900 border-slate-800 text-slate-500")}>Taker</button>
                </div>
              </div>
            </div>

            {/* MONEDAS Y MONTO */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Wallet className="w-4 h-4 text-slate-400"/> Monedas y Monto
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 relative">
                  <label className="text-xs text-slate-400">Moneda Origen</label>
                  <CurrencyPicker value={sourceCurrency} onChange={setSourceCurrency} />
                </div>
                <div className="space-y-1 relative">
                  <label className="text-xs text-slate-400">Moneda Destino</label>
                  <CurrencyPicker value={destCurrency} onChange={setDestCurrency} />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs text-slate-400">Cantidad a invertir ({sourceCurrency})</label>
                  <input type="number" value={amountInvested} onChange={(e) => setAmountInvested(e.target.value)} placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500 font-medium" />
                </div>
              </div>
            </div>

            {/* DETALLES */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">{type === 'Compra' ? 'Detalles de Compra' : 'Detalles de Venta'}</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-400">Precio ({isPriceMultiplier ? `${destCurrency}/${sourceCurrency}` : `${sourceCurrency}/${destCurrency}`})</label>
                    <button onClick={() => setIsPriceMultiplier(!isPriceMultiplier)} className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-blue-500/20 transition-colors" title="Cambiar formato de precio">
                      Invertir: {isPriceMultiplier ? "Multiplicar (x)" : "Dividir (÷)"}
                    </button>
                  </div>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Precio de intercambio" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500 font-medium" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Comisiones de {type.toLowerCase()}</label>
                  {commissions.map((comm, index) => (
                    <div key={index} className="flex gap-2 items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <input type="text" placeholder="Nombre" value={comm.name} onChange={(e) => updateCommission(index, { name: e.target.value })} className="flex-1 bg-transparent text-sm text-white outline-none" />
                      <div className="w-px h-6 bg-slate-800 mx-1"></div>
                      <input type="number" placeholder="Valor" value={comm.value || ''} onChange={(e) => updateCommission(index, { value: parseFloat(e.target.value) })} className="w-20 bg-transparent text-sm text-white outline-none text-right" />
                      <button onClick={() => updateCommission(index, { type: comm.type === 'fixed' ? 'percentage' : 'fixed' })} className={cn("px-4 py-1 text-xs font-bold rounded", comm.type === 'percentage' ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400", "min-w-[40px] text-center")} title="Activar por porcentaje">
                        {comm.type === 'percentage' ? '%' : 'FIJO'}
                      </button>
                      <button onClick={() => removeCommission(index)} className="p-1 text-slate-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button onClick={addCommission} className="text-xs text-blue-400 font-bold flex items-center gap-1 hover:text-blue-300"><Plus className="w-3 h-3"/> Añadir Comisión</button>
                </div>
              </div>
            </div>

            {/* PLATAFORMA & CLIENTE INFO */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1 relative">
                <label className="text-xs text-slate-400">Plataforma P2P</label>
                <OwnerNamePicker value={p2pPlatform} ownerType="Mias" placeholder="Ej: Binance, Airtm..." onSelect={(name) => setP2pPlatform(name)} />
              </div>
              
              <div className="space-y-1 relative">
                <label className="text-xs text-slate-400">Nombre completo del cliente <span className="text-red-500">*</span></label>
                <OwnerNamePicker value={clientName} ownerType="Cliente" onSelect={(name) => setClientName(name)} />
              </div>

              <div className="sm:col-span-2 space-y-1 relative">
                <label className="text-xs text-slate-400">ID o identificador de usuario</label>
                <input type="text" value={clientIdPlatform} onChange={(e) => setClientIdPlatform(e.target.value)} placeholder="Ej: user1234" className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500" />
              </div>
            </div>

            {/* MEDIOS DE PAGO */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Medios Propios</h3>
                 <div className="space-y-1 relative">
                   <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Medio Origen ({sourceCurrency})</label>
                   <PaymentMethodPicker currency={sourceCurrency} ownerFilter="Mias" value={sourceMyPaymentMethodId} onSelect={setSourceMyPaymentMethodId} onAddNew={() => setPmModalState({ isOpen: true, currency: sourceCurrency, ownerType: 'Mias', ownerName: 'Mias', targetState: 'sourceMy' })} />
                 </div>
                 <div className="space-y-1 relative">
                   <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Medio Destino ({destCurrency})</label>
                   <PaymentMethodPicker currency={destCurrency} ownerFilter="Mias" value={destMyPaymentMethodId} onSelect={setDestMyPaymentMethodId} onAddNew={() => setPmModalState({ isOpen: true, currency: destCurrency, ownerType: 'Mias', ownerName: 'Mias', targetState: 'destMy' })} />
                 </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Medios del Cliente</h3>
                 <div className="space-y-1 relative">
                   <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Medio Origen Cliente ({destCurrency})</label>
                   <PaymentMethodPicker currency={destCurrency} ownerFilter="Cliente" onlyOwnerName={clientName} disabled={!clientName} value={sourceClientPaymentMethodId} onSelect={setSourceClientPaymentMethodId} placeholder={clientName ? `Medio de ${clientName}` : 'Selecciona un cliente arriba'} onAddNew={() => setPmModalState({ isOpen: true, currency: destCurrency, ownerType: 'Cliente', ownerName: clientName, targetState: 'sourceClient' })} />
                 </div>
                 <div className="space-y-1 relative">
                   <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Medio Destino Cliente ({sourceCurrency})</label>
                   <PaymentMethodPicker currency={sourceCurrency} ownerFilter="Cliente" onlyOwnerName={clientName} disabled={!clientName} value={destClientPaymentMethodId} onSelect={setDestClientPaymentMethodId} placeholder={clientName ? `Medio de ${clientName}` : 'Selecciona un cliente arriba'} onAddNew={() => setPmModalState({ isOpen: true, currency: sourceCurrency, ownerType: 'Cliente', ownerName: clientName, targetState: 'destClient' })} />
                 </div>
              </div>
            </div>

            {/* NOTAS Y ARCHIVOS */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Notas extras (opcional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Agrega notas o el comprobante en texto..." className="w-full h-20 bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500 resize-none text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block border-b border-slate-800 pb-2">Comprobantes y Archivos</label>
                {attachments.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {attachments.map((file, i) => (
                      <div key={i} className="relative group bg-slate-900 border border-slate-800 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                        {file.type.startsWith('image/') ? (
                           <img src={file.dataUrl} alt={file.name} className="object-cover w-full h-full" />
                        ) : (
                           <div className="text-[10px] font-bold text-slate-500 flex flex-col items-center">
                             <Paperclip className="w-5 h-5 mb-1 text-slate-400" />
                             <span className="truncate max-w-[80%] mx-auto">{file.name}</span>
                           </div>
                        )}
                        <button onClick={() => removeAttachment(i)} className="absolute top-1 right-1 bg-black/60 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <input type="file" id="attachment-upload" multiple className="hidden" onChange={handleFileUpload} ref={fileInputRef} />
                  <label htmlFor="attachment-upload" className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 border-dashed rounded-lg py-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-slate-400 hover:text-slate-300">
                    <Paperclip className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Añadir Archivo o Imagen</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4 border-t border-slate-800 flex justify-between items-center shrink-0 bg-slate-900">
            <div className="text-xs text-slate-400">
              Recibirás: <span className="text-white font-bold text-base">{amountReceived || '0'} {destCurrency}</span>
            </div>
            <button
              onClick={handleSave}
              disabled={!clientName || !amountInvested}
              className="px-6 bg-blue-600 disabled:opacity-50 text-white py-3 rounded-xl font-bold tracking-widest text-xs uppercase transition-all hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-600/30"
            >
              Registrar
            </button>
          </div>
        </div>
      </div>

      {pmModalState.isOpen && (
        <PaymentMethodModal
          isNew={true}
          pm={{
             id: '',
             ownerType: pmModalState.ownerType,
             ownerName: pmModalState.ownerType === 'Cliente' ? (pmModalState.ownerName || 'Nuevo Cliente') : 'Yo',
             platformChannel: '',
             currency: pmModalState.currency,
             initialBalance: 0,
             orderNumber: 0,
             platformUserId: '',
             additionalInfo: []
          }}
          onClose={() => setPmModalState(prev => ({ ...prev, isOpen: false }))}
          onSuccess={(newId) => {
             if (pmModalState.targetState === 'sourceMy') setSourceMyPaymentMethodId(newId);
             if (pmModalState.targetState === 'sourceClient') setSourceClientPaymentMethodId(newId);
             if (pmModalState.targetState === 'destMy') setDestMyPaymentMethodId(newId);
             if (pmModalState.targetState === 'destClient') setDestClientPaymentMethodId(newId);
          }}
        />
      )}
    </>
  );
}
