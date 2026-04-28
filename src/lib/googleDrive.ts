
declare global {
  interface Window {
    google: any;
  }
}

const SCOPES = 'https://www.googleapis.com/auth/drive.file';

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
    this.accessToken = localStorage.getItem('gd_access_token');
  }

  async init() {
    if (this.isInitializing) return;
    this.isInitializing = true;

    return new Promise<void>((resolve) => {
      const checkGSI = setInterval(() => {
        if (window.google?.accounts?.oauth2) {
          clearInterval(checkGSI);
          
          try {
            this.tokenClient = window.google.accounts.oauth2.initTokenClient({
              client_id: this.clientId,
              scope: SCOPES,
              callback: (response: any) => {
                if (response.error) {
                  console.error('Google Auth Error:', response.error);
                  return;
                }
                this.accessToken = response.access_token;
                localStorage.setItem('gd_access_token', response.access_token);
                window.dispatchEvent(new CustomEvent('googledrive_auth_success'));
              },
            });
            
            if (this.accessToken) {
              // Validar el token actual
              this.verifyToken().then(isValid => {
                if (isValid) {
                  window.dispatchEvent(new CustomEvent('googledrive_auth_success'));
                } else {
                  this.logout();
                }
              });
            }
          } catch (err) {
            console.error('Error initializing GSI:', err);
          }
          
          this.isInitializing = false;
          resolve();
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.isInitializing) {
          clearInterval(checkGSI);
          this.isInitializing = false;
          resolve();
        }
      }, 10000);
    });
  }

  private async verifyToken(): Promise<boolean> {
    if (!this.accessToken) return false;
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${this.accessToken}`);
      return response.ok;
    } catch {
      return false;
    }
  }

  login() {
    if (!this.clientId) {
      alert('Error: Google Client ID no configurado. Verifica tus variables de entorno.');
      return;
    }
    if (this.tokenClient) {
      this.tokenClient.requestAccessToken({ prompt: this.accessToken ? '' : 'select_account' });
    } else {
      this.init().then(() => {
        if (this.tokenClient) this.tokenClient.requestAccessToken({ prompt: 'select_account' });
      });
    }
  }

  logout() {
    this.accessToken = null;
    localStorage.removeItem('gd_access_token');
    window.dispatchEvent(new CustomEvent('googledrive_auth_expired'));
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  private handleUnauthorized() {
    this.logout();
  }

  async listFolders(): Promise<GoogleDriveFile[]> {
    if (!this.accessToken) throw new Error('Not authenticated');
    // Al usar drive.file, solo veremos carpetas creadas por esta app
    const q = "mimeType = 'application/vnd.google-apps.folder' and trashed = false";
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id, name, modifiedTime)&pageSize=1000&orderBy=name&supportsAllDrives=true&includeItemsFromAllDrives=true`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    
    if (response.status === 401 || response.status === 403) {
      this.handleUnauthorized();
      throw new Error('Permisos insuficientes o sesión expirada. Por favor, vuelve a conectar con Google.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Drive API Error (Folders):', response.status, errorData);
      throw new Error(`Error al listar carpetas (${response.status})`);
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

    if (response.status === 401 || response.status === 403) {
      this.handleUnauthorized();
      throw new Error('Permisos insuficientes o sesión expirada. Por favor, vuelve a conectar.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Drive API Error (Create Folder):', response.status, errorData);
      throw new Error(`Error al crear carpeta (${response.status})`);
    }
    const data = await response.json();
    return data.id;
  }

  async listBackups(folderId?: string | null): Promise<GoogleDriveFile[]> {
    if (!this.accessToken) throw new Error('Not authenticated');

    let q = 'name contains "p2p-backup" and mimeType = "application/zip" and trashed = false';
    if (folderId) {
      q += ` and '${folderId}' in parents`;
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id, name, modifiedTime)&pageSize=1000&orderBy=modifiedTime desc&supportsAllDrives=true&includeItemsFromAllDrives=true`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (response.status === 401 || response.status === 403) {
      this.handleUnauthorized();
      throw new Error('Permisos insuficientes o sesión expirada. Por favor, vuelve a conectar.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Drive API Error (Backups):', response.status, errorData);
      throw new Error(`Error al listar respaldos (${response.status})`);
    }

    const data = await response.json();
    return data.files || [];
  }

  async uploadBackup(blob: Blob, filename: string, folderId?: string | null) {
    if (!this.accessToken) throw new Error('Not authenticated');

    const metadata: any = {
      name: filename,
      mimeType: 'application/zip',
    };

    if (folderId) {
      metadata.parents = [folderId];
    }

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: form,
      }
    );

    if (response.status === 401 || response.status === 403) {
      this.handleUnauthorized();
      throw new Error('Permisos insuficientes o sesión expirada. Por favor, vuelve a conectar.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Drive API Error (Upload):', response.status, errorData);
      throw new Error(`Error al subir respaldo (${response.status})`);
    }

    return await response.json();
  }

  async downloadBackup(fileId: string): Promise<Blob> {
    if (!this.accessToken) throw new Error('Not authenticated');

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (response.status === 401 || response.status === 403) {
      this.handleUnauthorized();
      throw new Error('Permisos insuficientes o sesión expirada. Por favor, vuelve a conectar.');
    }

    if (!response.ok) {
      console.error('Drive API Error (Download):', response.status);
      throw new Error(`Error al descargar respaldo (${response.status})`);
    }

    return await response.blob();
  }
}

export const driveService = new GoogleDriveService((import.meta as any).env.VITE_GOOGLE_CLIENT_ID || '');
