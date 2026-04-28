import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { FolderUp, Download, Upload, RotateCcw, Plus, X, Pencil, ChevronDown, Search, MinusCircle, BookOpen, ArrowRight, Archive, Cloud, LogIn, LogOut, RefreshCw, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { driveService, GoogleDriveFile } from '../lib/googleDrive';

export function Gestor({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const store = useAppStore();
  const [isDriveAuth, setIsDriveAuth] = useState(driveService.isAuthenticated());
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [driveFolders, setDriveFolders] = useState<GoogleDriveFile[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [isShowingFolderPicker, setIsShowingFolderPicker] = useState(false);

  useEffect(() => {
    const handleAuth = () => {
      setIsDriveAuth(true);
      loadDriveData();
    };

    const handleExpired = () => {
      setIsDriveAuth(false);
      setDriveFiles([]);
      setDriveFolders([]);
    };
    
    if (driveService.isAuthenticated()) {
      handleAuth();
    }
    
    window.addEventListener('googledrive_auth_success', handleAuth);
    window.addEventListener('googledrive_auth_expired', handleExpired);
    return () => {
      window.removeEventListener('googledrive_auth_success', handleAuth);
      window.removeEventListener('googledrive_auth_expired', handleExpired);
    };
  }, []);

  const loadDriveData = async () => {
    if (!driveService.isAuthenticated()) return;
    setIsLoadingDrive(true);
    try {
      const [files, folders] = await Promise.all([
        driveService.listBackups(store.driveFolderId).catch(err => {
          console.error("Backups fail:", err);
          return [] as GoogleDriveFile[];
        }),
        driveService.listFolders().catch(err => {
          console.error("Folders fail:", err);
          return [] as GoogleDriveFile[];
        })
      ]);
      setDriveFiles(files);
      setDriveFolders(folders);
    } catch (error: any) {
      console.error('Error general loading drive data:', error);
      // If it's a session error, the driveService will handle the event
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt('Nombre de la nueva carpeta:', 'P2P Tools Backups');
    if (!name) return;
    
    setIsLoadingDrive(true);
    try {
      const folderId = await driveService.createFolder(name);
      store.setDriveSettings(folderId, name, store.isAutoSyncEnabled);
      await loadDriveData();
      setIsShowingFolderPicker(false);
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Error al crear la carpeta.');
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleCloudBackup = async () => {
    if (!driveService.isAuthenticated()) {
      driveService.login();
      return;
    }

    setIsLoadingDrive(true);
    try {
      const state = useAppStore.getState();
      const zip = new JSZip();
      
      const stateToSave = JSON.stringify(state, (key, value) => 
        typeof value === 'function' ? undefined : value
      , 2);
      
      zip.file('app_data.json', stateToSave);
      const attachmentsFolder = zip.folder('archivos_adjuntos');
      
      const processAttachments = (prefix: string, items: any[]) => {
        items.forEach(item => {
          if (item.attachments && item.attachments.length > 0) {
            item.attachments.forEach((att: any, idx: number) => {
              if (att.dataUrl && att.dataUrl.includes('base64,')) {
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
      const filename = `p2p-backup-${new Date().toISOString().slice(0, 10)}.zip`;
      
      await driveService.uploadBackup(blob, filename, store.driveFolderId);
      alert('¡Copia de seguridad subida a Google Drive con éxito!');
      loadDriveData();
    } catch (error) {
      console.error('Error in cloud backup:', error);
      alert('Error al subir la copia a la nube.');
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleCloudRestore = async (fileId: string) => {
    if (!confirm('Importar esta copia desde la nube reemplazará toda tu información actual. ¿Continuar?')) return;

    setIsLoadingDrive(true);
    try {
      const blob = await driveService.downloadBackup(fileId);
      const zip = await JSZip.loadAsync(blob);
      const jsonFile = zip.file('app_data.json');
      
      if (!jsonFile) throw new Error('No se encontró el archivo de datos.');
      
      const jsonString = await jsonFile.async('string');
      const importedData = JSON.parse(jsonString);

      if (importedData) {
        store.importData(importedData);
        alert('¡Copia de seguridad restaurada con éxito!');
      }
    } catch (error) {
      console.error('Error in cloud restore:', error);
      alert('Error al restaurar desde la nube.');
    } finally {
      setIsLoadingDrive(false);
    }
  };

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
        {/* local as before */}
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

      <SectionCard title="Respaldos en la Nube" icon={<Cloud className="w-4 h-4 text-blue-400" />}>
        {!isDriveAuth ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-lg shadow-blue-500/5">
              <Cloud className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-sm text-slate-400 max-w-[200px] mx-auto">Conecta tu cuenta de Google para respaldar tus datos en Drive.</p>
            <button 
              onClick={() => driveService.login()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 mx-auto transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <LogIn className="w-4 h-4" /> Conectar con Google
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Estado</div>
                  <div className="text-xs font-bold text-white">Conectado a Drive</div>
                </div>
              </div>
              <button 
                onClick={() => {
                  driveService.logout();
                  setIsDriveAuth(false);
                  store.setDriveSettings(null, null, false);
                }}
                className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Carpeta de Sincronización</label>
                <button 
                  onClick={() => setIsShowingFolderPicker(!isShowingFolderPicker)}
                  className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors"
                >
                  {store.driveFolderId ? 'Cambiar' : 'Seleccionar'}
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800">
                  <FolderUp className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">
                    {store.driveFolderName || 'Sin carpeta seleccionada'}
                  </div>
                  <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    {store.driveFolderId ? 'Ruta activa' : 'Se creará en la raíz por defecto'}
                  </div>
                </div>
              </div>

              {isShowingFolderPicker && (
                <div className="mt-3 space-y-2 border-t border-slate-800 pt-3">
                  <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded-lg mb-2">
                    <p className="text-[9px] text-blue-400 font-medium leading-tight">
                      Nota de seguridad: Por privacidad, solo se muestran las carpetas creadas por esta aplicación.
                    </p>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Tus carpetas en Drive</span>
                    <button 
                      onClick={handleCreateFolder}
                      className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Nueva
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {driveFolders.length === 0 ? (
                      <p className="text-[10px] text-slate-600 italic text-center py-2">No se encontraron carpetas</p>
                    ) : (
                      driveFolders.map(folder => (
                        <button
                          key={folder.id}
                          onClick={() => {
                            store.setDriveSettings(folder.id, folder.name, store.isAutoSyncEnabled);
                            setIsShowingFolderPicker(false);
                            loadDriveData();
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all truncate",
                            store.driveFolderId === folder.id ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                          )}
                        >
                          {folder.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
                      store.isAutoSyncEnabled ? "bg-blue-600/10 border-blue-500/50" : "bg-slate-900 border-slate-800"
                    )}>
                      <RefreshCw className={cn("w-5 h-5 transition-all text-slate-500", store.isAutoSyncEnabled && "text-blue-500 animate-spin-slow")} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Sincronización Automática</div>
                      <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Subir al detectar cambios</div>
                    </div>
                  </div>
                  <div className={cn(
                    "w-10 h-5 rounded-full transition-all relative flex items-center px-1",
                    store.isAutoSyncEnabled ? "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]" : "bg-slate-800"
                  )}>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={store.isAutoSyncEnabled}
                      onChange={(e) => store.setDriveSettings(store.driveFolderId, store.driveFolderName, e.target.checked)}
                    />
                    <div className={cn(
                      "w-3 h-3 bg-white rounded-full transition-all shadow-md",
                      store.isAutoSyncEnabled ? "translate-x-5" : "translate-x-0"
                    )} />
                  </div>
                </label>
              </div>
            </div>

            <button 
              onClick={handleCloudBackup}
              disabled={isLoadingDrive}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              {isLoadingDrive ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
              {isLoadingDrive ? 'Procesando...' : 'Sincronizar ahora'}
            </button>

            <div className="pt-2 border-t border-slate-800/50">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Respaldos en la Nube</h3>
                <button onClick={loadDriveData} className="text-blue-400 hover:text-blue-300 transition-colors">
                  <RefreshCw className={cn("w-3.5 h-3.5", isLoadingDrive && "animate-spin")} />
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {driveFiles.length === 0 ? (
                  <div className="bg-slate-950 border border-slate-800/50 rounded-xl p-6 text-center">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">No se encontraron respaldos</p>
                  </div>
                ) : (
                  driveFiles.map(file => (
                    <div key={file.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between group hover:border-slate-700 transition-colors">
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-bold text-slate-200 truncate pr-2">{file.name}</span>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{new Date(file.modifiedTime).toLocaleString()}</span>
                      </div>
                      <button 
                        onClick={() => handleCloudRestore(file.id)}
                        disabled={isLoadingDrive}
                        className="bg-slate-800 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shrink-0"
                      >
                        Restaurar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
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

