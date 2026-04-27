
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

  constructor(private clientId: string) {}

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
              // Notify listeners if needed
              window.dispatchEvent(new CustomEvent('googledrive_auth_success'));
            },
          });
          resolve();
        }
      }, 100);
    });
  }

  login() {
    if (this.tokenClient) {
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    }
  }

  logout() {
    this.accessToken = null;
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  async listBackups(): Promise<GoogleDriveFile[]> {
    if (!this.accessToken) throw new Error('Not authenticated');

    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?q=name contains "p2p-backup" and mimeType = "application/zip"&fields=files(id, name, modifiedTime)&orderBy=modifiedTime desc',
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to list backups');
    }

    const data = await response.json();
    return data.files;
  }

  async uploadBackup(blob: Blob, filename: string) {
    if (!this.accessToken) throw new Error('Not authenticated');

    const metadata = {
      name: filename,
      mimeType: 'application/zip',
    };

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

    if (!response.ok) {
      throw new Error('Failed to download backup');
    }

    return await response.blob();
  }
}

export const driveService = new GoogleDriveService(import.meta.env.VITE_GOOGLE_CLIENT_ID || '');
