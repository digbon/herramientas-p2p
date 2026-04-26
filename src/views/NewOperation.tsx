import React, { useState, useRef } from "react";
import {
  X,
  ArrowUpCircle,
  ArrowDownCircle,
  User,
  FileText,
  Paperclip,
  ChevronDown,
  Trash2,
  Pencil,
  Plus,
  Wallet,
  Search,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAppStore, Attachment } from "../store";
import { PlatformPicker } from "../components/PlatformPicker";
import { OwnerNamePicker } from "../components/OwnerNamePicker";
import { AccountPicker } from "../components/AccountPicker";
import { getAccountBalance } from "../lib/balance";

export function NewOperation({ onClose }: { onClose: () => void }) {
  const store = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<"Compra" | "Venta">("Compra");
  const [order, setOrder] = useState<"Maker" | "Taker">("Maker");

  const [sourceCurrency, setSourceCurrency] = useState(store.baseFiat);
  const [sourceMyPlatformId, setSourceMyPlatformId] = useState("");
  const [sourceMyAccountId, setSourceMyAccountId] = useState("");
  const [sourceClientPlatformId, setSourceClientPlatformId] = useState("");
  const [sourceClientAccountId, setSourceClientAccountId] = useState("");

  const [destCurrency, setDestCurrency] = useState(store.baseCrypto);
  const [destMyPlatformId, setDestMyPlatformId] = useState("");
  const [destMyAccountId, setDestMyAccountId] = useState("");
  const [destClientPlatformId, setDestClientPlatformId] = useState("");
  const [destClientAccountId, setDestClientAccountId] = useState("");

  const [counterpartName, setCounterpartName] = useState("");
  const [counterpartContact, setCounterpartContact] = useState("");

  const [amountSent, setAmountSent] = useState("");
  const [price, setPrice] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [commissionsSent, setCommissionsSent] = useState<
    { name: string; value: string; type: "fixed" | "percentage" }[]
  >([]);
  const [commissionsReceived, setCommissionsReceived] = useState<
    { name: string; value: string; type: "fixed" | "percentage" }[]
  >([]);
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [showAddAccountModal, setShowAddAccountModal] = useState<{
    currency: string;
    platformId: string;
    target: "sourceMy" | "sourceClient" | "destMy" | "destClient";
    owner: "Mias" | "Cliente";
    editAccountId?: string;
  } | null>(null);
  const [showPlatformAccountModal, setShowPlatformAccountModal] = useState<{
    platformId: string;
    accountIndex?: number;
    isLegacy?: boolean;
  } | null>(null);
  const [showAddPlatformModal, setShowAddPlatformModal] = useState<{
    target: "sourceMy" | "sourceClient" | "destMy" | "destClient";
    owner: "Mias" | "Cliente";
  } | null>(null);

  // Auto-calculation logic
  React.useEffect(() => {
    const s = parseFloat(amountSent) || 0;
    const p = parseFloat(price) || 0;

    const calculateTotal = (val: number, comms: typeof commissionsSent) => {
      return comms.reduce((acc, curr) => {
        const v = parseFloat(curr.value) || 0;
        if (curr.type === "percentage") {
          return acc + val * (v / 100);
        }
        return acc + v;
      }, 0);
    };

    if (s > 0 && p > 0) {
      const cs = calculateTotal(s, commissionsSent);
      const netSent = s - cs;
      const preliminaryReceived = netSent * p;
      const cr = calculateTotal(preliminaryReceived, commissionsReceived);
      const received = preliminaryReceived - cr;
      setAmountReceived(
        received > 0 ? received.toFixed(6).replace(/\.?0+$/, "") : "0",
      );
    }
  }, [amountSent, price, commissionsSent, commissionsReceived]);

  const addCommissionSent = () =>
    setCommissionsSent([
      ...commissionsSent,
      { name: "", value: "", type: "fixed" },
    ]);
  const removeCommissionSent = (index: number) =>
    setCommissionsSent(commissionsSent.filter((_, i) => i !== index));
  const updateCommissionSent = (
    index: number,
    updates: Partial<{
      name: string;
      value: string;
      type: "fixed" | "percentage";
    }>,
  ) => {
    const newComm = [...commissionsSent];
    newComm[index] = { ...newComm[index], ...updates };
    setCommissionsSent(newComm);
  };

  const addCommissionReceived = () =>
    setCommissionsReceived([
      ...commissionsReceived,
      { name: "", value: "", type: "fixed" },
    ]);
  const removeCommissionReceived = (index: number) =>
    setCommissionsReceived(commissionsReceived.filter((_, i) => i !== index));
  const updateCommissionReceived = (
    index: number,
    updates: Partial<{
      name: string;
      value: string;
      type: "fixed" | "percentage";
    }>,
  ) => {
    const newComm = [...commissionsReceived];
    newComm[index] = { ...newComm[index], ...updates };
    setCommissionsReceived(newComm);
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
            {
              name: file.name,
              type: file.type,
              dataUrl,
            },
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

  const sourceCurrencies = store.currencies;
  const destCurrencies = store.currencies;

  const handleSave = () => {
    let finalName = counterpartName;
    let finalContact = counterpartContact;

    if (sourceClientAccountId || destClientAccountId) {
      const clientAcc = store.accounts.find(
        (a) => a.id === sourceClientAccountId || a.id === destClientAccountId,
      );
      if (clientAcc && clientAcc.ownerName) {
        finalName = clientAcc.ownerName;
      }
    }

    store.addOperation({
      id: Date.now().toString(),
      type,
      order,
      sourceCurrency,
      sourceMyPlatformId,
      sourceMyAccountId,
      sourceClientPlatformId,
      sourceClientAccountId,
      destCurrency,
      destMyPlatformId,
      destMyAccountId,
      destClientPlatformId,
      destClientAccountId,
      counterpartName: finalName,
      counterpartContact: finalContact,
      amountSent: parseFloat(amountSent) || 0,
      price: parseFloat(price) || 0,
      amountReceived: parseFloat(amountReceived) || 0,
      commissionsSent: commissionsSent
        .map((c) => ({
          name: c.name,
          value: parseFloat(c.value) || 0,
          type: c.type,
        }))
        .filter((c) => c.value > 0),
      commissionsReceived: commissionsReceived
        .map((c) => ({
          name: c.name,
          value: parseFloat(c.value) || 0,
          type: c.type,
        }))
        .filter((c) => c.value > 0),
      notes,
      date: new Date().toISOString(),
      attachments,
    });
    onClose();
  };

  // Removed unused selectedSourceAcc and selectedDestAcc

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex sm:items-center justify-center pointer-events-none sm:p-4">
        <div className="bg-slate-950 pointer-events-auto sm:border border-t border-slate-800 w-full max-w-md max-h-[90vh] sm:max-h-[85vh] sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900 shrink-0">
            <h2 className="text-lg font-bold text-white">Nueva Operación</h2>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 touch-pan-y">
            <div className="space-y-4">
              <div className="space-y-1 relative">
                <label className="text-xs text-slate-400">
                  Tipo de Operación
                </label>
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value as "Compra" | "Venta");
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white appearance-none outline-none focus:border-blue-500"
                >
                  <option value="Compra">Compra</option>
                  <option value="Venta">Venta</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-[34px] pointer-events-none" />
                <p className="text-[10px] text-slate-500 mt-1">
                  Etiqueta de la operación. La dirección real depende de las
                  monedas de origen y destino que elijas debajo.
                </p>
              </div>

              <div className="space-y-1 relative">
                <label className="text-xs text-slate-400">
                  Orden (Maker/Taker)
                </label>
                <select
                  value={order}
                  onChange={(e) =>
                    setOrder(e.target.value as "Maker" | "Taker")
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white appearance-none outline-none focus:border-blue-500"
                >
                  <option value="Maker">Maker</option>
                  <option value="Taker">Taker</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-[34px] pointer-events-none" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2 text-slate-300 mb-2">
                <ArrowUpCircle className="w-5 h-5 text-red-500" />
                <span className="font-semibold text-sm">
                  Entregaste (origen)
                </span>
              </div>
              <div className="space-y-4">
                <div className="space-y-1 relative">
                  <label className="text-xs text-slate-400">Moneda</label>
                  <select
                    value={sourceCurrency}
                    onChange={(e) => setSourceCurrency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-white appearance-none outline-none focus:border-blue-500"
                  >
                    {sourceCurrencies.map((c) => (
                      <option key={c.symbol} value={c.symbol}>
                        {c.symbol}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-[34px] pointer-events-none" />
                </div>

                <div className="space-y-4 p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800/50 pb-1">Mías</div>
                  <div className="space-y-3">
                    <div className="space-y-1 relative">
                      <label className="text-[10px] text-slate-400">
                        Método de pago (App/Banco/Exchange)
                      </label>
                      <PlatformPicker
                        value={sourceMyPlatformId}
                        onlyPlatforms={true}
                        ownerFilter="Mias"
                        onSelect={(pId) => {
                          setSourceMyPlatformId(pId);
                          setSourceMyAccountId("");
                        }}
                        onAddNew={() =>
                          setShowAddPlatformModal({
                            target: "sourceMy",
                            owner: "Mias",
                          })
                        }
                        onAddAccountToPlatform={(id) =>
                          setShowPlatformAccountModal({ platformId: id })
                        }
                        onEditAccount={(pId, idx, isLegacy) =>
                          setShowPlatformAccountModal({
                            platformId: pId,
                            accountIndex: idx,
                            isLegacy,
                          })
                        }
                        onDeleteAccount={(pId, idx, isLegacy) => {
                          const platform = store.platforms.find(
                            (p) => p.id === pId,
                          );
                          if (!platform) return;
                          if (isLegacy)
                            store.updatePlatform(pId, { details: undefined });
                          else if (platform.accounts) {
                            const newAccounts = platform.accounts.filter(
                              (_, i) => i !== idx,
                            );
                            store.updatePlatform(pId, { accounts: newAccounts });
                          }
                        }}
                        onDeletePlatform={(id) => store.removePlatform(id)}
                      />
                    </div>

                    <div className="space-y-1 relative">
                      <label className="text-[10px] text-slate-400">
                        Seleccionar Cuenta Específica ({sourceCurrency})
                      </label>
                      <AccountPicker
                        currency={sourceCurrency}
                        platformId={sourceMyPlatformId}
                        onlyOwner="Mias"
                        value={sourceMyAccountId}
                        onSelect={(val) => setSourceMyAccountId(val)}
                        onAddNew={() => {
                          setShowAddAccountModal({
                            currency: sourceCurrency,
                            platformId: sourceMyPlatformId,
                            target: "sourceMy",
                            owner: "Mias",
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800/50 pb-1">Del cliente</div>
                  <div className="space-y-3">
                    <div className="space-y-1 relative">
                      <label className="text-[10px] text-slate-400">
                        Método de pago (App/Banco/Exchange)
                      </label>
                      <PlatformPicker
                        value={sourceClientPlatformId}
                        onlyPlatforms={true}
                        ownerFilter="Cliente"
                        onSelect={(pId) => {
                          setSourceClientPlatformId(pId);
                          setSourceClientAccountId("");
                        }}
                        onAddNew={() =>
                          setShowAddPlatformModal({
                            target: "sourceClient",
                            owner: "Cliente",
                          })
                        }
                        onAddAccountToPlatform={(id) =>
                          setShowPlatformAccountModal({ platformId: id })
                        }
                        onEditAccount={(pId, idx, isLegacy) =>
                          setShowPlatformAccountModal({
                            platformId: pId,
                            accountIndex: idx,
                            isLegacy,
                          })
                        }
                        onDeleteAccount={(pId, idx, isLegacy) => {
                          const platform = store.platforms.find(
                            (p) => p.id === pId,
                          );
                          if (!platform) return;
                          if (isLegacy)
                            store.updatePlatform(pId, { details: undefined });
                          else if (platform.accounts) {
                            const newAccounts = platform.accounts.filter(
                              (_, i) => i !== idx,
                            );
                            store.updatePlatform(pId, { accounts: newAccounts });
                          }
                        }}
                        onDeletePlatform={(id) => store.removePlatform(id)}
                      />
                    </div>

                    <div className="space-y-1 relative">
                      <label className="text-[10px] text-slate-400">
                        Seleccionar Cuenta Específica ({sourceCurrency})
                      </label>
                      <AccountPicker
                        currency={sourceCurrency}
                        platformId={sourceClientPlatformId}
                        onlyOwner="Cliente"
                        value={sourceClientAccountId}
                        onSelect={(val) => setSourceClientAccountId(val)}
                        onAddNew={() => {
                          setShowAddAccountModal({
                            currency: sourceCurrency,
                            platformId: sourceClientPlatformId,
                            target: "sourceClient",
                            owner: "Cliente",
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2 text-slate-300 mb-2">
                <ArrowDownCircle className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold text-sm">
                  Recibiste (destino)
                </span>
              </div>
              <div className="space-y-4">
                <div className="space-y-1 relative">
                  <label className="text-xs text-slate-400">Moneda</label>
                  <select
                    value={destCurrency}
                    onChange={(e) => setDestCurrency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-3 text-white appearance-none outline-none focus:border-blue-500"
                  >
                    {destCurrencies.map((c) => (
                      <option key={c.symbol} value={c.symbol}>
                        {c.symbol}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-[34px] pointer-events-none" />
                </div>

                <div className="space-y-4 p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800/50 pb-1">Mías</div>
                  <div className="space-y-3">
                    <div className="space-y-1 relative">
                      <label className="text-[10px] text-slate-400">
                        Método de pago (App/Banco/Exchange)
                      </label>
                      <PlatformPicker
                        value={destMyPlatformId}
                        onlyPlatforms={true}
                        ownerFilter="Mias"
                        onSelect={(pId) => {
                          setDestMyPlatformId(pId);
                          setDestMyAccountId("");
                        }}
                        onAddNew={() =>
                          setShowAddPlatformModal({
                            target: "destMy",
                            owner: "Mias",
                          })
                        }
                        onAddAccountToPlatform={(id) =>
                          setShowPlatformAccountModal({ platformId: id })
                        }
                        onEditAccount={(pId, idx, isLegacy) =>
                          setShowPlatformAccountModal({
                            platformId: pId,
                            accountIndex: idx,
                            isLegacy,
                          })
                        }
                        onDeleteAccount={(pId, idx, isLegacy) => {
                          const platform = store.platforms.find(
                            (p) => p.id === pId,
                          );
                          if (!platform) return;
                          if (isLegacy)
                            store.updatePlatform(pId, { details: undefined });
                          else if (platform.accounts) {
                            const newAccounts = platform.accounts.filter(
                              (_, i) => i !== idx,
                            );
                            store.updatePlatform(pId, { accounts: newAccounts });
                          }
                        }}
                        onDeletePlatform={(id) => store.removePlatform(id)}
                      />
                    </div>

                    <div className="space-y-1 relative">
                      <label className="text-[10px] text-slate-400">
                        Seleccionar Cuenta Específica ({destCurrency})
                      </label>
                      <AccountPicker
                        currency={destCurrency}
                        platformId={destMyPlatformId}
                        onlyOwner="Mias"
                        value={destMyAccountId}
                        onSelect={(val) => setDestMyAccountId(val)}
                        onAddNew={() => {
                          setShowAddAccountModal({
                            currency: destCurrency,
                            platformId: destMyPlatformId,
                            target: "destMy",
                            owner: "Mias",
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800/50 pb-1">Del cliente</div>
                  <div className="space-y-3">
                    <div className="space-y-1 relative">
                      <label className="text-[10px] text-slate-400">
                        Método de pago (App/Banco/Exchange)
                      </label>
                      <PlatformPicker
                        value={destClientPlatformId}
                        onlyPlatforms={true}
                        ownerFilter="Cliente"
                        onSelect={(pId) => {
                          setDestClientPlatformId(pId);
                          setDestClientAccountId("");
                        }}
                        onAddNew={() =>
                          setShowAddPlatformModal({
                            target: "destClient",
                            owner: "Cliente",
                          })
                        }
                        onAddAccountToPlatform={(id) =>
                          setShowPlatformAccountModal({ platformId: id })
                        }
                        onEditAccount={(pId, idx, isLegacy) =>
                          setShowPlatformAccountModal({
                            platformId: pId,
                            accountIndex: idx,
                            isLegacy,
                          })
                        }
                        onDeleteAccount={(pId, idx, isLegacy) => {
                          const platform = store.platforms.find(
                            (p) => p.id === pId,
                          );
                          if (!platform) return;
                          if (isLegacy)
                            store.updatePlatform(pId, { details: undefined });
                          else if (platform.accounts) {
                            const newAccounts = platform.accounts.filter(
                              (_, i) => i !== idx,
                            );
                            store.updatePlatform(pId, { accounts: newAccounts });
                          }
                        }}
                        onDeletePlatform={(id) => store.removePlatform(id)}
                      />
                    </div>

                    <div className="space-y-1 relative">
                      <label className="text-[10px] text-slate-400">
                        Seleccionar Cuenta Específica ({destCurrency})
                      </label>
                      <AccountPicker
                        currency={destCurrency}
                        platformId={destClientPlatformId}
                        onlyOwner="Cliente"
                        value={destClientAccountId}
                        onSelect={(val) => setDestClientAccountId(val)}
                        onAddNew={() => {
                          setShowAddAccountModal({
                            currency: destCurrency,
                            platformId: destClientPlatformId,
                            target: "destClient",
                            owner: "Cliente",
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-amber-400">
                <FileText className="w-4 h-4" /> Detalles Financieros
              </h3>
              <div className="space-y-4">
                <div className="space-y-1 text-xs">
                  <label className="text-slate-400">
                    Monto entregado ({sourceCurrency}){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={amountSent}
                    onChange={(e) => setAmountSent(e.target.value)}
                    placeholder={`Ej: 1500 ${sourceCurrency}`}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500 text-lg font-medium"
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <label className="text-slate-400">
                    Precio ({sourceCurrency} por 1 {destCurrency})
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={`Ej: 15.17`}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500 text-lg font-medium"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Opcional: si lo completas junto con uno de los montos, el
                    otro se calcula automáticamente.
                  </p>
                </div>
                <div className="space-y-1 text-xs">
                  <label className="text-slate-400">
                    Monto recibido ({destCurrency}){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder={`Ej: 98.87 ${destCurrency}`}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500 text-lg font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-400 text-xs">
                      Comisiones del Monto Entregado ({sourceCurrency})
                    </label>
                    <button
                      onClick={addCommissionSent}
                      className="text-blue-500 hover:text-blue-400 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {commissionsSent.map((comm, idx) => (
                    <div
                      key={idx}
                      className="space-y-1 bg-slate-950 p-2 rounded-lg border border-slate-800"
                    >
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={comm.name}
                          onChange={(e) =>
                            updateCommissionSent(idx, { name: e.target.value })
                          }
                          placeholder="Nombre (Opcional)"
                          className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-[11px] outline-none"
                        />
                        <div className="flex bg-slate-900 rounded p-0.5 border border-slate-800">
                          <button
                            onClick={() =>
                              updateCommissionSent(idx, { type: "fixed" })
                            }
                            className={cn(
                              "px-1.5 py-0.5 text-[9px] rounded font-bold transition-all",
                              comm.type === "fixed"
                                ? "bg-blue-600 text-white"
                                : "text-slate-500",
                            )}
                          >
                            FIX
                          </button>
                          <button
                            onClick={() =>
                              updateCommissionSent(idx, { type: "percentage" })
                            }
                            className={cn(
                              "px-1.5 py-0.5 text-[9px] rounded font-bold transition-all",
                              comm.type === "percentage"
                                ? "bg-blue-600 text-white"
                                : "text-slate-500",
                            )}
                          >
                            %
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          value={comm.value}
                          onChange={(e) =>
                            updateCommissionSent(idx, { value: e.target.value })
                          }
                          placeholder={
                            comm.type === "percentage" ? "0.00 %" : "0.00"
                          }
                          className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500 text-sm font-medium"
                        />
                        <button
                          onClick={() => removeCommissionSent(idx)}
                          className="text-slate-500 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-400 text-xs">
                      Comisiones del Monto Recibido ({destCurrency})
                    </label>
                    <button
                      onClick={addCommissionReceived}
                      className="text-blue-500 hover:text-blue-400 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {commissionsReceived.map((comm, idx) => (
                    <div
                      key={idx}
                      className="space-y-1 bg-slate-950 p-2 rounded-lg border border-slate-800"
                    >
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={comm.name}
                          onChange={(e) =>
                            updateCommissionReceived(idx, {
                              name: e.target.value,
                            })
                          }
                          placeholder="Nombre (Opcional)"
                          className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-[11px] outline-none"
                        />
                        <div className="flex bg-slate-900 rounded p-0.5 border border-slate-800">
                          <button
                            onClick={() =>
                              updateCommissionReceived(idx, { type: "fixed" })
                            }
                            className={cn(
                              "px-1.5 py-0.5 text-[9px] rounded font-bold transition-all",
                              comm.type === "fixed"
                                ? "bg-blue-600 text-white"
                                : "text-slate-500",
                            )}
                          >
                            FIX
                          </button>
                          <button
                            onClick={() =>
                              updateCommissionReceived(idx, {
                                type: "percentage",
                              })
                            }
                            className={cn(
                              "px-1.5 py-0.5 text-[9px] rounded font-bold transition-all",
                              comm.type === "percentage"
                                ? "bg-blue-600 text-white"
                                : "text-slate-500",
                            )}
                          >
                            %
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          value={comm.value}
                          onChange={(e) =>
                            updateCommissionReceived(idx, {
                              value: e.target.value,
                            })
                          }
                          placeholder={
                            comm.type === "percentage" ? "0.00 %" : "0.00"
                          }
                          className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white outline-none focus:border-blue-500 text-sm font-medium"
                        />
                        <button
                          onClick={() => removeCommissionReceived(idx)}
                          className="text-slate-500 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-slate-400" /> Archivos
                Adjuntos
              </h3>

              {attachments.length > 0 ? (
                <div className="space-y-2">
                  {attachments.map((att, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-2 px-3"
                    >
                      <span className="text-sm text-slate-300 truncate mr-2">
                        {att.name}
                      </span>
                      <button
                        onClick={() => removeAttachment(i)}
                        className="text-slate-500 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-2">
                  No hay archivos. Agrega comprobantes, capturas o videos.
                </p>
              )}

              <label className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors cursor-pointer">
                <span className="text-lg leading-none mb-0.5">+</span> Agregar
                archivo
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                />
              </label>
              <p className="text-[10px] text-slate-500">
                Hasta 1 MB por archivo. Se guardan localmente para esta
                operación.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" /> Información
                Adicional
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas de la Operación"
                className="w-full h-24 bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500 resize-none text-sm"
              />
            </div>
          </div>

          <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4 border-t border-slate-800 bg-slate-950 flex gap-3 shrink-0">
            <button
              onClick={handleSave}
              disabled={!amountSent || !amountReceived}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-colors"
            >
              Guardar
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {showAddAccountModal && (
        <MiniAddAccountModal
          currency={showAddAccountModal.currency}
          platformId={showAddAccountModal.platformId}
          owner={showAddAccountModal.owner}
          accountIdToEdit={showAddAccountModal.editAccountId}
          store={store}
          onAdd={(id) => {
            if (showAddAccountModal.target === "sourceMy") setSourceMyAccountId(id);
            if (showAddAccountModal.target === "sourceClient") setSourceClientAccountId(id);
            if (showAddAccountModal.target === "destMy") setDestMyAccountId(id);
            if (showAddAccountModal.target === "destClient") setDestClientAccountId(id);
            setShowAddAccountModal(null);
          }}
          onClose={() => setShowAddAccountModal(null)}
        />
      )}

      {showPlatformAccountModal && (
        <PlatformAccountModal
          store={store}
          platformId={showPlatformAccountModal.platformId}
          accountIndex={showPlatformAccountModal.accountIndex}
          isLegacy={showPlatformAccountModal.isLegacy}
          onClose={() => setShowPlatformAccountModal(null)}
        />
      )}

      {showAddPlatformModal && (
        <MiniAddPlatformModal
          store={store}
          ownerFilter={showAddPlatformModal.owner}
          onAdd={(id) => {
            if (showAddPlatformModal.target === "sourceMy")
              setSourceMyPlatformId(id);
            if (showAddPlatformModal.target === "sourceClient")
              setSourceClientPlatformId(id);
            if (showAddPlatformModal.target === "destMy")
              setDestMyPlatformId(id);
            if (showAddPlatformModal.target === "destClient")
              setDestClientPlatformId(id);
            setShowAddPlatformModal(null);
          }}
          onClose={() => setShowAddPlatformModal(null)}
        />
      )}
    </>
  );
}

function MiniAddAccountModal({
  currency,
  platformId,
  owner,
  accountIdToEdit,
  onAdd,
  onClose,
  store,
}: {
  currency: string;
  platformId: string;
  owner: "Mias" | "Cliente";
  accountIdToEdit?: string;
  onAdd: (id: string) => void;
  onClose: () => void;
  store: any;
}) {
  const accountToEdit = accountIdToEdit
    ? store.accounts.find((a: any) => a.id === accountIdToEdit)
    : null;
  const [name, setName] = useState(accountToEdit?.name || "");
  const [tag, setTag] = useState(accountToEdit?.tag || "");
  const [ownerName, setOwnerName] = useState(
    accountToEdit?.ownerName || (owner === "Mias" ? "Yo" : ""),
  );
  const [initialBalance, setInitialBalance] = useState(
    accountToEdit?.initialBalance?.toString() || "",
  );
  const [platformValue, setPlatformValue] = useState(
    accountToEdit?.platformValue || "",
  );
  const [paymentMethods, setPaymentMethods] = useState<any[]>(
    accountToEdit?.paymentMethods || [],
  );

  const addPaymentMethod = () => {
    setPaymentMethods([
      ...paymentMethods,
      { id: Date.now().toString(), type: "", value: "", label: "" },
    ]);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-[60] flex sm:items-center justify-center pointer-events-none p-4">
        <div className="bg-slate-950 pointer-events-auto border border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h3 className="text-white font-black text-xs uppercase tracking-widest">
              {accountIdToEdit ? "Editar" : "Nueva"} Cuenta ({currency})
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 text-[10px]">
                <label className="text-slate-500 font-bold uppercase">
                  Tag (#1, #2...)
                </label>
                <input
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  type="text"
                  placeholder="#1"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-white outline-none focus:border-blue-500 font-bold"
                />
              </div>
              <div className="space-y-1 text-[10px]">
                <label className="text-slate-500 font-bold uppercase">
                  Nombre Cuenta
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Ej: BCP"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-white outline-none focus:border-blue-500 font-bold"
                />
              </div>
            </div>

            <div className="space-y-1 text-[10px]">
              <label className="text-slate-500 font-bold uppercase">
                Nombre Completo del Dueño
              </label>
              <OwnerNamePicker
                value={ownerName}
                ownerType={owner}
                onSelect={setOwnerName}
                disabled={!!accountIdToEdit}
              />
            </div>

            <div className="space-y-1 text-[10px]">
              <label className="text-slate-500 font-bold uppercase">
                ID/Nº Cuenta en{" "}
                {store.platforms.find((p: any) => p.id === platformId)?.name}
              </label>
              <input
                value={platformValue}
                onChange={(e) => setPlatformValue(e.target.value)}
                type="text"
                placeholder="Número, ID, Alias..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-white outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="space-y-1 text-[10px]">
              <label className="text-slate-500 font-bold uppercase">
                Saldo Inicial ({currency})
              </label>
              <input
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                type="number"
                placeholder="0.00"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-white outline-none focus:border-blue-500 font-bold"
              />
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Otros métodos enlazados
                </label>
                <button
                  onClick={addPaymentMethod}
                  className="text-[10px] font-black text-blue-500 hover:text-blue-400"
                >
                  + AÑADIR
                </button>
              </div>
              <div className="space-y-3">
                {paymentMethods.map((pm) => (
                  <div
                    key={pm.id}
                    className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 space-y-2 relative group shadow-sm transition-all hover:border-slate-700"
                  >
                    <button
                      onClick={() =>
                        setPaymentMethods(
                          paymentMethods.filter((p) => p.id !== pm.id),
                        )
                      }
                      className="absolute -right-2 -top-2 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">
                        Plataforma
                      </label>
                      <PlatformPicker
                        value={pm.value}
                        ownerFilter={owner}
                        onSelect={(pId, accVal, pName) => {
                          setPaymentMethods(
                            paymentMethods.map((p) =>
                              p.id === pm.id
                                ? {
                                    ...p,
                                    type: pId,
                                    label: pName,
                                    value: accVal || p.value,
                                  }
                                : p,
                            ),
                          );
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              disabled={!name || !ownerName}
              onClick={() => {
                const id = accountIdToEdit || Date.now().toString();
                const accountData = {
                  id,
                  currency: accountToEdit?.currency || currency,
                  platformId: platformId || accountToEdit?.platformId,
                  platformValue,
                  ownerType: accountToEdit?.ownerType || owner,
                  ownerName,
                  tag:
                    tag ||
                    (accountIdToEdit
                      ? accountToEdit.tag
                      : `#${store.accounts.filter((a: any) => a.currency === currency).length + 1}`),
                  name,
                  initialBalance: parseFloat(initialBalance) || 0,
                  paymentMethods,
                };
                if (accountIdToEdit) {
                  store.updateAccount(id, accountData);
                } else {
                  store.addAccount(accountData);
                }
                onAdd(id);
              }}
              className="w-full bg-blue-600 disabled:opacity-50 text-white rounded-xl py-3 font-black uppercase text-[10px] tracking-widest mt-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
            >
              {accountIdToEdit ? "Guardar Cambios" : "Registrar Cuenta"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function MiniAddPlatformModal({
  onAdd,
  onClose,
  store,
  ownerFilter,
}: {
  onAdd: (id: string) => void;
  onClose: () => void;
  store: any;
  ownerFilter?: "Mias" | "Cliente";
}) {
  const [type, setType] = useState<"Fiat" | "Crypto">("Fiat");
  const [name, setName] = useState("");

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-[60] flex sm:items-center justify-center pointer-events-none p-4">
        <div className="bg-slate-950 pointer-events-auto border border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h3 className="text-white font-black text-xs uppercase tracking-widest">
              Nuevo Método de Pago
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-1 text-xs">
              <label className="text-slate-500 font-bold uppercase tracking-tighter">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "Fiat" | "Crypto")}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white appearance-none outline-none focus:border-blue-500"
              >
                <option value="Fiat">Fiat / Banco</option>
                <option value="Crypto">Crypto / Exchange</option>
              </select>
            </div>
            <div className="space-y-1 text-xs">
              <label className="text-slate-500 font-bold uppercase tracking-tighter">
                Nombre de la plataforma
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Ej: Binance, BCP..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>
            <button
              disabled={!name}
              onClick={() => {
                const id = Date.now().toString();
                store.addPlatform({
                  id,
                  type,
                  name,
                  owner: ownerFilter,
                  accounts: [],
                });
                onAdd(id);
              }}
              className="w-full bg-blue-600 disabled:opacity-50 text-white rounded-xl py-3.5 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-900/20 active:scale-95 transition-all mt-2"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function PlatformAccountModal({
  store,
  platformId,
  accountIndex,
  isLegacy,
  onClose,
}: {
  store: any;
  platformId: string;
  accountIndex?: number;
  isLegacy?: boolean;
  onClose: () => void;
}) {
  const platform = store.platforms.find((p: any) => p.id === platformId);
  const isEditing = accountIndex !== undefined || isLegacy;

  let initialValue = "";
  let initialLabel = "";

  if (isLegacy) {
    initialValue = platform?.details || "";
    initialLabel = "Principal";
  } else if (accountIndex !== undefined && platform?.accounts) {
    initialValue = platform.accounts[accountIndex].value;
    initialLabel = platform.accounts[accountIndex].label || "";
  }

  const [value, setValue] = useState(initialValue);
  const [label, setLabel] = useState(initialLabel);

  const handleSave = () => {
    if (!value) return;

    if (isLegacy) {
      store.updatePlatform(platformId, { details: value });
    } else {
      const newAccounts = [...(platform.accounts || [])];
      if (accountIndex !== undefined) {
        newAccounts[accountIndex] = {
          ...newAccounts[accountIndex],
          value,
          label,
        };
      } else {
        newAccounts.push({ id: Date.now().toString(), value, label });
      }
      store.updatePlatform(platformId, { accounts: newAccounts });
    }
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[110]"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-[110] flex sm:items-center justify-center pointer-events-none p-4">
        <div className="bg-slate-950 pointer-events-auto border border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h3 className="text-white font-black text-xs uppercase tracking-widest">
              {isEditing ? "Editar Cuenta" : "Nueva Cuenta"}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-1 text-xs">
              <label className="text-slate-500 font-bold uppercase tracking-tighter">
                Alias / Etiqueta (Ej: Principal, Ahorros)
              </label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                type="text"
                placeholder="Ej: Ahorros..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1 text-xs">
              <label className="text-slate-500 font-bold uppercase tracking-tighter">
                Número / ID / Alias en plataforma
              </label>
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                type="text"
                placeholder="Ej: 78979555..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-3 text-white outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <button
              disabled={!value}
              onClick={handleSave}
              className="w-full bg-blue-600 disabled:opacity-50 text-white rounded-xl py-3.5 font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-600/20 active:scale-95 transition-all mt-2"
            >
              {isEditing ? "Actualizar Cuenta" : "Guardar Cuenta"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
