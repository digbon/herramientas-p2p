import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { driveService } from '../lib/googleDrive';
import JSZip from 'jszip';

export function SyncManager() {
  const store = useAppStore();
  const [isAuthenticated, setIsAuthenticated] = React.useState(driveService.isAuthenticated());
  const lastSyncRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    driveService.init();

    const handleAuth = () => setIsAuthenticated(true);
    const handleExpired = () => setIsAuthenticated(false);

    window.addEventListener('googledrive_auth_success', handleAuth);
    window.addEventListener('googledrive_auth_expired', handleExpired);
    window.addEventListener('googledrive_auth_missing_scopes', handleExpired);

    return () => {
      window.removeEventListener('googledrive_auth_success', handleAuth);
      window.removeEventListener('googledrive_auth_expired', handleExpired);
      window.removeEventListener('googledrive_auth_missing_scopes', handleExpired);
    };
  }, []);

  useEffect(() => {
    if (!store.isAutoSyncEnabled || !store.driveFolderId || !isAuthenticated) {
      return;
    }

    // Debounce sync to avoid spamming the API
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      const state = useAppStore.getState();
      
      // Basic change detection (you could make this more sophisticated)
      const currentStateString = JSON.stringify({
        currencies: state.currencies,
        paymentMethods: state.paymentMethods,
        operations: state.operations,
        movements: state.movements,
        transfers: state.transfers,
      });

      if (currentStateString === lastSyncRef.current) return;

      try {
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
        const filename = `p2p-backup-auto-${new Date().toISOString().slice(0, 10)}.zip`;
        
        await driveService.uploadBackup(blob, filename, store.driveFolderId);
        lastSyncRef.current = currentStateString;
        console.log('Auto-sync completed');
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    }, 60000); // 60 seconds debounce to prevent Google Drive rate limit (403)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [
    store.operations, 
    store.movements, 
    store.transfers, 
    store.currencies, 
    store.paymentMethods,
    store.isAutoSyncEnabled,
    store.driveFolderId,
    isAuthenticated
  ]);

  return null;
}
