import React, { useState } from 'react';
import { useAppStore } from '../store';
import { FolderUp, Download, Upload, RotateCcw, Plus, X, Pencil, ChevronDown, Search, MinusCircle, BookOpen, ArrowRight, Archive } from 'lucide-react';
import { cn } from '../lib/utils';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export function Gestor({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const store = useAppStore();

  const handleExportZip = async () => {
    try {
      const state = useAppStore.getState();
      const zip = new JSZip();
      
      // Parse state and remove functions
      const stateToSave = JSON.stringify(state, (key, value) => 
        typeof value === 'function' ? undefined : value
      , 2);
      
      zip.file('app_data.json', stateToSave);

      // We can also extract attachments into a separate folder for easy viewing by the user
      // if they extract the zip on their computer.
      const attachmentsFolder = zip.folder('archivos_adjuntos');
      
      const processAttachments = (prefix: string, items: any[]) => {
        items.forEach(item => {
          if (item.attachments && item.attachments.length > 0) {
            item.attachments.forEach((att: any, idx: number) => {
              if (att.dataUrl && att.dataUrl.includes('base64,')) {
                // e.g. data:image/png;base64,iVBORw0KGgo...
                const base64Data = att.dataUrl.split('base64,')[1];
                const extension = att.type ? att.type.split('/')[1] || 'bin' : 'bin';
                const filename = `${prefix}_${item.id}_${idx + 1}.${extension}`;
                attachmentsFolder?.file(filename, base64Data, { base64: true });
              }
            });
          }
        });
      };

      processAttachments('op', state.operations || []);
      processAttachments('mov', state.movements || []);
      processAttachments('tr', state.transfers || []);

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `p2p-backup-${new Date().toISOString().slice(0, 10)}.zip`);
    } catch (error) {
      console.error('Error exportando ZIP:', error);
      alert('Hubo un error al crear la copia de seguridad.');
    }
  };

  const handleImportZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (confirm('Importar una copia de seguridad reemplazará toda tu información actual. ¿Estás seguro?')) {
        const zip = await JSZip.loadAsync(file);
        
        // Find the JSON file
        const jsonFile = zip.file('app_data.json');
        if (!jsonFile) {
          throw new Error('No se encontró el archivo de datos (app_data.json) en el ZIP.');
        }

        const jsonString = await jsonFile.async('string');
        const importedData = JSON.parse(jsonString);

        if (importedData) {
          store.importData(importedData);
          alert('¡Copia de seguridad restaurada con éxito!');
        }
      }
    } catch (error) {
      console.error('Error importando ZIP:', error);
      alert('Error al leer el archivo ZIP de copia de seguridad.');
    } finally {
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight">Ajustes Generales</h1>
      </div>

      <SectionCard title="Manual de Ayuda" icon={<BookOpen className="w-4 h-4" />}>
        <button 
          onClick={() => onNavigate && onNavigate('documentacion')} 
          className="w-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-between px-5 py-4 rounded-xl font-bold transition-all border border-slate-700 shadow-inner group"
        >
          <div className="flex items-center gap-3">
             <BookOpen className="w-5 h-5 text-blue-400" />
             <span>Sobre el funcionamiento</span>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
        </button>
      </SectionCard>

      <SectionCard title="Copias de Seguridad (ZIP)" icon={<Archive className="w-4 h-4" />}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button 
            onClick={handleExportZip}
            className="bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-600/20 flex flex-col items-center justify-center p-4 rounded-2xl gap-2 transition-all group active:scale-95"
          >
            <Download className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Exportar Backup</span>
          </button>
          
          <label className="bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 flex flex-col items-center justify-center p-4 rounded-2xl gap-2 transition-all group active:scale-95 cursor-pointer">
            <Upload className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-tighter text-center">Importar Backup</span>
            <input 
              type="file" 
              accept=".zip" 
              className="hidden" 
              onChange={handleImportZip}
            />
          </label>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed text-center px-2">
          El archivo .zip incluye toda la base de datos de tu historial y los comprobantes adjuntos de las operaciones. Utilízalo para respaldos o para continuar trabajando en otro dispositivo.
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

