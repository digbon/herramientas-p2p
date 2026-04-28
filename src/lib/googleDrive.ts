
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

  constructor(private clientId: string) {
    this.accessToken = localStorage.getItem('gd_access_token');
  }

  init() {
    return new Promise<void>((resolve) => {
      const checkGSI = setInterval(() => {
        if (window.google?.accounts?.oauth2) {
          clearInterval(checkGSI);
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
            window.dispatchEvent(new CustomEvent('googledrive_auth_success'));
          }
          resolve();
        }
      }, 100);
    });
  }

  login() {
    if (this.tokenClient) {
      this.tokenClient.requestAccessToken({ prompt: this.accessToken ? '' : 'consent' });
    }
  }

  logout() {
    this.accessToken = null;
    localStorage.removeItem('gd_access_token');
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  private handleUnauthorized() {
    this.logout();
    window.dispatchEvent(new CustomEvent('googledrive_auth_expired'));
  }

  async listFolders(): Promise<GoogleDriveFile[]> {
    if (!this.accessToken) throw new Error('Not authenticated');
    const q = "mimeType = 'application/vnd.google-apps.folder' and trashed = false";
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id, name, modifiedTime)&pageSize=1000&orderBy=name`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    
    if (response.status === 401) {
      this.handleUnauthorized();
      throw new Error('Session expired');
    }

    if (!response.ok) throw new Error('Failed to list folders');
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

    if (response.status === 401) {
      this.handleUnauthorized();
      throw new Error('Session expired');
    }

    if (!response.ok) throw new Error('Failed to create folder');
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
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id, name, modifiedTime)&pageSize=1000&orderBy=modifiedTime desc`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (response.status === 401) {
      this.handleUnauthorized();
      throw new Error('Session expired');
    }

    if (!response.ok) {
      throw new Error('Failed to list backups');
    }

    const data = await response.json();
    return data.files;
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
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: form,
      }
    );

    if (response.status === 401) {
      this.handleUnauthorized();
      throw new Error('Session expired');
    }

    if (!response.ok) {
      throw new Error('Failed to upload backup');
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

    if (response.status === 401) {
      this.handleUnauthorized();
      throw new Error('Session expired');
    }

    if (!response.ok) {
      throw new Error('Failed to download backup');
    }

    return await response.blob();
  }
}

export const driveService = new GoogleDriveService((import.meta as any).env.VITE_GOOGLE_CLIENT_ID || '');
