import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "../store";
import {
  Search,
  ChevronDown,
  User,
  Users,
  Wallet,
  Plus,
  Link2,
  Trash2,
  Pencil,
} from "lucide-react";
import { cn } from "../lib/utils";

interface PlatformPickerProps {
  value: string;
  onSelect: (
    platformId: string,
    accountValue: string,
    platformName: string,
  ) => void;
  ownerFilter?: "Mias" | "Cliente";
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onAddNew?: () => void;
  onAddAccountToPlatform?: (platformId: string) => void;
  onEditAccount?: (
    platformId: string,
    accountIndex: number,
    isLegacy: boolean,
  ) => void;
  onDeleteAccount?: (
    platformId: string,
    accountIndex: number,
    isLegacy: boolean,
  ) => void;
  onDeletePlatform?: (id: string) => void;
  onlyPlatforms?: boolean;
}

export function PlatformPicker({
  value,
  onSelect,
  ownerFilter,
  placeholder = "Buscar plataforma o cuenta...",
  className,
  disabled,
  onAddNew,
  onAddAccountToPlatform,
  onEditAccount,
  onDeleteAccount,
  onDeletePlatform,
  onlyPlatforms = false,
}: PlatformPickerProps) {
  const store = useAppStore();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [expandedPlatforms, setExpandedPlatforms] = useState<
    Record<string, boolean>
  >({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if a platform account is already linked to a system account
  const isLinked = (platformId: string, accountValue: string) => {
    return store.accounts.some(
      (a) => a.platformId === platformId && a.platformValue === accountValue,
    );
  };

  // Get selected display text
  const selectedOption = onlyPlatforms
    ? store.platforms.find((p) => p.id === value)
    : store.platforms
        .flatMap((p) => [
          ...(p.accounts || []).map((acc) => ({
            p,
            accValue: acc.value,
            accLabel: acc.label,
          })),
          ...(p.details
            ? [{ p, accValue: p.details, accLabel: "Principal" }]
            : []),
        ])
        .find((opt) => opt.accValue === value);

  // Group platforms and their accounts
  const groupedPlatforms = store.platforms
    .filter((p) => !ownerFilter || p.owner === ownerFilter)
    .map((p) => {
      const platformAccounts: any[] = [];

      if (!onlyPlatforms) {
        if (p.details) {
          platformAccounts.push({
            platform: p,
            accountValue: p.details,
            display: p.name,
            subtext: p.details,
            label: "Principal",
            id: `${p.id}-legacy`,
            type: p.type,
            linked: isLinked(p.id, p.details),
          });
        }

        if (p.accounts && p.accounts.length > 0) {
          p.accounts.forEach((acc, idx) => {
            platformAccounts.push({
              platform: p,
              accountValue: acc.value,
              display: p.name,
              subtext: acc.value,
              label: acc.label,
              id: `${p.id}-acc-${idx}`,
              originalIndex: idx,
              type: p.type,
              linked: isLinked(p.id, acc.value),
            });
          });
        }
      }

      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        platformAccounts.some(
          (acc) =>
            acc.accountValue.toLowerCase().includes(search.toLowerCase()) ||
            (acc.label &&
              acc.label.toLowerCase().includes(search.toLowerCase())),
        );

      return {
        ...p,
        platformAccounts,
        matchesSearch,
      };
    })
    .filter((p) => p.matchesSearch);

  // Automatically expand platforms that have matching accounts when searching
  useEffect(() => {
    if (search) {
      const newExpanded: Record<string, boolean> = {};
      groupedPlatforms.forEach((gp) => {
        if (
          gp.platformAccounts.some(
            (acc) =>
              acc.accountValue.toLowerCase().includes(search.toLowerCase()) ||
              (acc.label &&
                acc.label.toLowerCase().includes(search.toLowerCase())),
          )
        ) {
          newExpanded[gp.id] = true;
        }
      });
      setExpandedPlatforms((prev) => ({ ...prev, ...newExpanded }));
    }
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePlatform = (id: string) => {
    setExpandedPlatforms((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <div
        className={cn(
          "relative group",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {!isOpen && selectedOption ? (
          <div
            className={cn(
              "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between group-hover:border-blue-500/50 transition-all shadow-lg shadow-black/20",
              disabled && "opacity-50 grayscale cursor-not-allowed",
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center border font-black text-[10px]",
                  (onlyPlatforms
                    ? (selectedOption as any).type
                    : (selectedOption as any).p.type) === "Fiat"
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                    : "bg-teal-500/10 text-teal-400 border-teal-500/20",
                )}
              >
                {(onlyPlatforms
                  ? (selectedOption as any).name
                  : (selectedOption as any).p.name
                )
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="flex flex-col items-start font-bold">
                <span className="text-white text-sm tracking-tight">
                  {onlyPlatforms
                    ? (selectedOption as any)!.name
                    : (selectedOption as any)!.p.name}
                </span>
                {!onlyPlatforms && (
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                    {(selectedOption as any).accValue}
                  </span>
                )}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-blue-500 transition-colors" />
          </div>
        ) : (
          <>
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 group-hover:text-blue-500 transition-colors" />
            <input
              disabled={disabled}
              type="text"
              placeholder={placeholder}
              value={isOpen ? search : ""}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => {
                if (!disabled) {
                  setIsOpen(true);
                  setSearch("");
                }
              }}
              readOnly={!isOpen}
              className={cn(
                "w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-600",
                disabled
                  ? "opacity-50 grayscale cursor-not-allowed"
                  : "cursor-pointer",
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-slate-500 transition-transform duration-300",
                  isOpen && "rotate-180",
                )}
              />
            </div>
          </>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-h-72 overflow-y-auto backdrop-blur-xl animate-in fade-in zoom-in duration-200">
          <div className="p-2 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 sticky top-0 z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">
              {onlyPlatforms ? "Seleccionar Plataforma" : "Plataformas y Cuentas"}
            </span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>

          <div className="p-1">
            {onAddNew && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddNew();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 mb-1 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500 hover:bg-blue-600/20 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-start translate-y-0.5">
                  <span className="font-bold text-xs uppercase tracking-widest">
                    Nueva Plataforma
                  </span>
                  <span className="text-[9px] font-bold opacity-60 uppercase">
                    Registrar método de pago
                  </span>
                </div>
              </button>
            )}
            {groupedPlatforms.map((gp) => {
              const isExpanded = expandedPlatforms[gp.id] || search;

              return (
                <div key={gp.id} className="mb-1 last:mb-0">
                  <div className="flex items-center group">
                    <button
                      onClick={() => {
                        if (onlyPlatforms) {
                          onSelect(gp.id, "", gp.name);
                          setIsOpen(false);
                          setSearch("");
                        } else {
                          togglePlatform(gp.id);
                        }
                      }}
                      className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-l-xl hover:bg-slate-800/80 transition-colors group/row relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity translate-x-[-100%] group-hover/row:translate-x-[100%] duration-1000" />
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center border font-black text-[10px]",
                            gp.type === "Fiat"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : "bg-teal-500/10 text-teal-400 border-teal-500/20",
                          )}
                        >
                          {gp.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col items-start translate-y-0.5">
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-100 group-hover/row:text-white transition-colors">
                            {gp.name}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">
                              {gp.type}
                            </span>
                            {!onlyPlatforms && (
                              <>
                                <div className="w-1 h-1 rounded-full bg-slate-700" />
                                <span className="text-[8px] text-slate-500 font-bold uppercase">
                                  {gp.platformAccounts.length} OPCIONES
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {!onlyPlatforms && (
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-slate-600 transition-transform duration-300",
                            isExpanded && "rotate-180",
                          )}
                        />
                      )}
                    </button>

                    <div className="flex bg-slate-900 border-l border-slate-800 rounded-r-xl overflow-hidden">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePlatform?.(gp.id);
                        }}
                        className="p-3 text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Eliminar plataforma"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {!onlyPlatforms && isExpanded && (
                    <div className="mt-1 space-y-1 mb-2">
                      {gp.platformAccounts.length === 0 ? (
                        <div className="px-3 py-2 text-[10px] text-slate-600 italic font-bold">
                          Sin cuentas registradas
                        </div>
                      ) : (
                        gp.platformAccounts
                          .filter(
                            (acc) =>
                              !search ||
                              acc.accountValue
                                .toLowerCase()
                                .includes(search.toLowerCase()) ||
                              (acc.label &&
                                acc.label
                                  .toLowerCase()
                                  .includes(search.toLowerCase())) ||
                              gp.name
                                .toLowerCase()
                                .includes(search.toLowerCase()),
                          )
                          .map((acc, idx) => (
                            <div key={acc.id} className="relative pl-6 pr-2">
                              <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-800" />
                              <div className="absolute left-6 top-1/2 w-2 h-px bg-slate-800" />

                              <div className="flex group/acc-row">
                                <button
                                  onClick={() => {
                                    onSelect(
                                      acc.platform.id,
                                      acc.accountValue,
                                      acc.platform.name,
                                    );
                                    setIsOpen(false);
                                    setSearch("");
                                  }}
                                  className={cn(
                                    "flex-1 text-left px-3 py-2.5 rounded-l-xl border border-slate-800/50 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all flex items-center justify-between gap-3 bg-slate-950/30",
                                    acc.linked &&
                                      "border-blue-500/20 bg-blue-500/5",
                                  )}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span
                                        className={cn(
                                          "font-mono text-[13px] tracking-tight group-hover/acc-row:text-white transition-colors truncate",
                                          acc.linked
                                            ? "text-blue-200 font-bold"
                                            : "text-slate-300",
                                        )}
                                      >
                                        {acc.accountValue}
                                      </span>
                                      {acc.label && (
                                        <span className="text-[8px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">
                                          {acc.label}
                                        </span>
                                      )}
                                    </div>
                                    {acc.linked ? (
                                      <div className="flex items-center gap-1">
                                        <Link2 className="w-2.5 h-2.5 text-blue-500" />
                                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest opacity-80">
                                          Ya vinculada
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tight">
                                        Disponible para vincular
                                      </span>
                                    )}
                                  </div>
                                </button>

                                <div className="flex bg-slate-950/40 border-y border-r border-slate-800 rounded-r-xl overflow-hidden">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const isLegacy =
                                        acc.id.includes("legacy");
                                      const actualIndex = isLegacy
                                        ? -1
                                        : acc.originalIndex;
                                      onEditAccount?.(
                                        acc.platform.id,
                                        actualIndex,
                                        isLegacy,
                                      );
                                    }}
                                    className="px-2 text-slate-600 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                                    title="Editar cuenta"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const isLegacy =
                                        acc.id.includes("legacy");
                                      const actualIndex = isLegacy
                                        ? -1
                                        : acc.originalIndex;
                                      onDeleteAccount?.(
                                        acc.platform.id,
                                        actualIndex,
                                        isLegacy,
                                      );
                                    }}
                                    className="px-2 text-slate-600 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                                    title="Eliminar cuenta"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {groupedPlatforms.length === 0 && search && (
            <div className="p-8 text-center">
              <Search className="w-10 h-10 text-slate-800 mx-auto mb-3 opacity-20" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                Sin resultados
              </p>
              <p className="text-[10px] text-slate-600 mt-2">
                Prueba buscando otro nombre o número
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
