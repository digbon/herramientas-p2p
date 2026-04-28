
declare global {
  interface Window {
    google: any;
  }
}

const SCOPES = 'https://www.googleapis.com/auth/drive';

export interface GoogleDriveFile {
  id: string;
  name: string;
  modifiedTime: string;
}

export class GoogleDriveService {
  private accessToken: string | null = null;
  private tokenClient: any = null;
  private isInitializing = false;

  constructor(private clientId: string) {
    this.accessToken = localStorage.getItem('gd_token_v2');
  }

  async init() {
    if (this.isInitializing) return;
    this.isInitializing = true;

    return new Promise<void>((resolve) => {
      let attempts = 0;
      const checkGSI = setInterval(() => {
        attempts++;
        if (window.google?.accounts?.oauth2) {
          clearInterval(checkGSI);
          
      try {
        if (!this.tokenClient) {
          this.tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: this.clientId,
            scope: SCOPES,
            callback: (response: any) => {
              if (response.error) {
                console.error('Google Auth Error:', response.error);
                if (response.error === 'access_denied') {
                  this.logout();
                }
                return;
              }
              
              // Validate that the requested scope was actually granted by the user
              if (!window.google.accounts.oauth2.hasGrantedAllScopes(response, SCOPES)) {
                console.error('User did not grant all required scopes.');
                this.logout();
                window.dispatchEvent(new CustomEvent('googledrive_auth_missing_scopes'));
                return;
              }

              this.accessToken = response.access_token;
              localStorage.setItem('gd_token_v2', response.access_token);
              window.dispatchEvent(new CustomEvent('googledrive_auth_success'));
            },
          });
        }
        
        if (this.accessToken) {
          // Validar el token actual solo si existe
          this.verifyToken().then(isValid => {
            if (isValid) {
              window.dispatchEvent(new CustomEvent('googledrive_auth_success'));
            } else {
              this.handleUnauthorized();
            }
          });
        }
      } catch (err) {
            console.error('Error initializing GSI:', err);
          }
          
          this.isInitializing = false;
          resolve();
        } else if (attempts > 50) { // 5 seconds
          clearInterval(checkGSI);
          this.isInitializing = false;
          resolve();
        }
      }, 100);
    });
  }

  async verifyToken(): Promise<boolean> {
    if (!this.accessToken) return false;
    try {
      // Usar el endpoint de about es más ligero y confirma autenticación
      const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  login() {
    const googleClientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;
    if (!this.clientId && !googleClientId) {
      console.error('Google Client ID no configurado.');
      return;
    }
    
    // Update clientId if it was empty before
    if (!this.clientId) this.clientId = googleClientId;

    if (!window.google?.accounts?.oauth2) {
      console.error('Google Identity Services no está cargado aún');
      alert('La conexión con Google Drive aún se está cargando. Por favor, intenta de nuevo en un segundo.');
      return;
    }

    if (!this.tokenClient) {
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: SCOPES,
        callback: (response: any) => {
          if (response.error) {
            console.error('Google Auth Error:', response.error);
            if (response.error === 'access_denied') {
              this.logout();
            }
            return;
          }
          
          if (!window.google.accounts.oauth2.hasGrantedAllScopes(response, SCOPES)) {
            console.error('User did not grant all required scopes.');
            this.logout();
            window.dispatchEvent(new CustomEvent('googledrive_auth_missing_scopes'));
            return;
          }

          this.accessToken = response.access_token;
          localStorage.setItem('gd_token_v2', response.access_token);
          window.dispatchEvent(new CustomEvent('googledrive_auth_success'));
        },
      });
    }

    try {
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (e) {
      console.error('Popup blocked:', e);
      alert('Por favor, permite el uso de ventanas emergentes (popups) en tu navegador para conectar con Google Drive.');
    }
  }

  logout() {
    if (this.accessToken && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(this.accessToken);
    }
    this.accessToken = null;
    localStorage.removeItem('gd_token_v2');
    window.dispatchEvent(new CustomEvent('googledrive_auth_expired'));
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  private handleUnauthorized() {
    this.accessToken = null;
    localStorage.removeItem('gd_token_v2');
    window.dispatchEvent(new CustomEvent('googledrive_auth_expired'));
  }

  private async handleApiError(response: Response, defaultMessage: string): Promise<never> {
    if (response.status === 401) {
      this.handleUnauthorized();
      throw new Error('Sesión expirada. Por favor, vuelve a reconectar.');
    }
    
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch {
      // Ignored
    }
    
    console.error(`Drive API Error (${response.status}):`, errorData);
    
    if (response.status === 403) {
      const msg = errorData.error?.message?.toLowerCase() || '';
      if (msg.includes('rate') || msg.includes('quota')) {
        throw new Error('Límite de Google Drive alcanzado (403). Intenta más tarde.');
      } else if (msg.includes('disabled')) {
        throw new Error('La API de Google Drive no está habilitada en tu proyecto de Google Cloud. Habilítala desde tu consola de desarrollador.');
      } else {
        throw new Error(`Error de permisos (403): ${errorData.error?.message || 'Reconecta y marca TODAS las casillas de Drive en la ventana emergente.'}`);
      }
    }
    
    throw new Error(`${defaultMessage}: ${errorData.error?.message || response.status}`);
  }

  async listFolders(): Promise<GoogleDriveFile[]> {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    // Obtenemos solo carpetas que no están en la papelera
    const q = "mimeType = 'application/vnd.google-apps.folder' and trashed = false";
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id, name, modifiedTime)&pageSize=1000`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    
    if (!response.ok) {
      await this.handleApiError(response, 'Error al listar carpetas');
    }
    const data = await response.json();
    return data.files || [];
  }

  async createFolder(name: string): Promise<string> {
    if (!this.accessToken) throw new Error('Not authenticated');
    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    if (!response.ok) {
      await this.handleApiError(response, 'Error al crear carpeta');
    }
    const data = await response.json();
    return data.id;
  }

  async listBackups(folderId?: string | null): Promise<GoogleDriveFile[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    let q = 'name contains "p2p-backup" and mimeType = "application/zip" and trashed = false';
    if (folderId) {
      q += ` and '${folderId}' in parents`;
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id, name, modifiedTime)&pageSize=1000&orderBy=modifiedTime desc`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      await this.handleApiError(response, 'Error al listar respaldos');
    }

    const data = await response.json();
    return data.files || [];
  }

  async uploadBackup(blob: Blob, filename: string, folderId?: string | null) {
    if (!this.accessToken) throw new Error('Not authenticated');

    let existingFileId: string | null = null;
    
    // Buscar si ya existe un archivo con el mismo nombre
    try {
      let q = `name = '${filename}' and trashed = false`;
      if (folderId) {
        q += ` and '${folderId}' in parents`;
      }
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` }
        }
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.files && searchData.files.length > 0) {
          existingFileId = searchData.files[0].id;
        }
      }
    } catch (e) {
      console.warn('Could not search for existing backup file.', e);
    }

    const metadata: any = {};
    if (!existingFileId) {
      metadata.name = filename;
      metadata.mimeType = 'application/zip';
      if (folderId) {
        metadata.parents = [folderId];
      }
    }

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    const url = existingFileId 
      ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
      
    const method = existingFileId ? 'PATCH' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: form,
    });

    if (!response.ok) {
      await this.handleApiError(response, 'Error al subir respaldo');
    }

    return await response.json();
  }

  async downloadBackup(fileId: string): Promise<Blob> {
    if (!this.accessToken) throw new Error('Not authenticated');

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      await this.handleApiError(response, 'Error al descargar respaldo');
    }

    return await response.blob();
  }
}

export const driveService = new GoogleDriveService((import.meta as any).env.VITE_GOOGLE_CLIENT_ID || '');
