import { contextBridge, ipcRenderer } from 'electron';

export interface FileItem {
  name: string;
  path: string;
  size: number;
  mtime: number;
}

export interface ElectronAPI {
  chooseWorkspace: () => Promise<string | null>;
  getWorkspace: () => Promise<string | null>;
  listFiles: (workspace: string) => Promise<FileItem[]>;
  readFile: (path: string) => Promise<{ content: string }>;
  createFile: (workspace: string, name: string, content: string) => Promise<void>;
  updateFile: (oldPath: string, newName: string | undefined, content: string) => Promise<void>;
  deleteFile: (path: string, toTrash?: boolean) => Promise<void>;
  openExternal: (path: string) => Promise<void>;
}

const electronAPI: ElectronAPI = {
  chooseWorkspace: () => ipcRenderer.invoke('app:chooseWorkspace'),
  getWorkspace: () => ipcRenderer.invoke('app:getWorkspace'),
  listFiles: (workspace: string) => 
    ipcRenderer.invoke('files:list', { workspace }),
  readFile: (path: string) => 
    ipcRenderer.invoke('files:read', { path }),
  createFile: (workspace: string, name: string, content: string) =>
    ipcRenderer.invoke('files:create', { workspace, name, content }),
  updateFile: (oldPath: string, newName: string | undefined, content: string) =>
    ipcRenderer.invoke('files:update', { oldPath, newName, content }),
  deleteFile: (path: string, toTrash = true) =>
    ipcRenderer.invoke('files:delete', { path, toTrash }),
  openExternal: (path: string) =>
    ipcRenderer.invoke('files:openExternal', { path }),
};

contextBridge.exposeInMainWorld('electron', electronAPI);

// Type declaration for the global window object
declare global {
  interface Window {
    electron: ElectronAPI;
  }
}