import { useAppStore } from '../store';

let fileHandle: any = null;

let isSyncing = false;

// Subscribe once to save state when it changes
useAppStore.subscribe((state) => {
  if (fileHandle && !isSyncing) {
    syncDataToFile(state);
  }
});

export const connectSyncFolder = async () => {
    if (window.self !== window.top) {
        alert("Esta función requiere usar la aplicación en una pestaña nueva por razones de seguridad. Haz clic en el botón de abrir en nueva pestaña en la esquina superior de tu pantalla y vuelve a intentarlo.");
        return false;
    }

    if (!('showDirectoryPicker' in window)) {
        alert("Tu navegador actual no soporta esta función. Por favor intenta desde Chrome/Edge en tu PC o usa la exportación manual JSON más abajo.");
        return false;
    }
    
    try {
        const dirHandle = await (window as any).showDirectoryPicker({
            mode: 'readwrite'
        });
        fileHandle = await dirHandle.getFileHandle('p2p-sync-data.json', { create: true });
        
        // Read file contents if exists
        const file = await fileHandle.getFile();
        const text = await file.text();
        if (text) {
            try {
                const data = JSON.parse(text);
                const shouldImport = confirm('Se ha encontrado un archivo de datos (p2p-sync-data.json) en la carpeta. ¿Deseas cargar esta información? Esto reemplazará tus datos actuales en esta app.');
                if (shouldImport) {
                    isSyncing = true;
                    useAppStore.getState().importData(data);
                    isSyncing = false;
                }
            } catch (e) {
                console.error("Error reading sync file", e);
            }
        }
        
        alert("Carpeta sincronizada. A partir de ahora todos los cambios se guardarán automáticamente en 'p2p-sync-data.json' en tu carpeta seleccionada.");
        return true;
    } catch (err: any) {
        console.error(err);
        if (err.name !== 'AbortError') {
            alert("Error al conectar la carpeta: " + err.message);
        }
        return false;
    }
};

const syncDataToFile = async (state: any) => {
    if (!fileHandle) return;
    try {
        isSyncing = true;
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(state, null, 2));
        await writable.close();
    } catch (err) {
        console.error("Error syncing to file", err);
    } finally {
        isSyncing = false;
    }
};
