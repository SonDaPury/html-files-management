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

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}