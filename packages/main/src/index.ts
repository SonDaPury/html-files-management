import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import * as path from 'path';
import { 
  ListFilesSchema,
  ReadFileSchema,
  CreateFileSchema,
  UpdateFileSchema,
  DeleteFileSchema,
  OpenExternalSchema
} from './types.js';
import { 
  listHtmlFiles,
  readFile,
  createFile,
  updateFile,
  deleteFile,
  openExternal
} from './fileOperations.js';
import {
  saveWorkspace,
  getCurrentWorkspace,
  loadSettings
} from './settings.js';
import { ensureWorkspaceExists } from './utils.js';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, '../preload/index.js'),
    },
  });

  const url = isDev 
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../renderer/index.html')}`;

  mainWindow.loadURL(url);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-file');
          },
        },
        {
          label: 'Choose Workspace',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            await handleChooseWorkspace();
          },
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

async function handleChooseWorkspace(): Promise<string | null> {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Choose Workspace Directory',
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const selectedPath = result.filePaths[0];

  try {
    await ensureWorkspaceExists(selectedPath);
    await saveWorkspace(selectedPath);
    return selectedPath;
  } catch (error) {
    await dialog.showErrorBox('Error', `Cannot use selected directory: ${error}`);
    return null;
  }
}

// IPC Handlers
async function setupIpcHandlers(): Promise<void> {
  ipcMain.handle('app:chooseWorkspace', async () => {
    return await handleChooseWorkspace();
  });

  ipcMain.handle('app:getWorkspace', async () => {
    return await getCurrentWorkspace();
  });

  ipcMain.handle('files:list', async (_, payload) => {
    try {
      const { workspace } = ListFilesSchema.parse(payload);
      await ensureWorkspaceExists(workspace);
      return await listHtmlFiles(workspace);
    } catch (error) {
      throw new Error(`Failed to list files: ${error}`);
    }
  });

  ipcMain.handle('files:read', async (_, payload) => {
    try {
      const { path: filePath } = ReadFileSchema.parse(payload);
      return await readFile(filePath);
    } catch (error) {
      throw new Error(`Failed to read file: ${error}`);
    }
  });

  ipcMain.handle('files:create', async (_, payload) => {
    try {
      const { workspace, name, content } = CreateFileSchema.parse(payload);
      await ensureWorkspaceExists(workspace);
      await createFile(workspace, name, content);
    } catch (error) {
      throw new Error(`Failed to create file: ${error}`);
    }
  });

  ipcMain.handle('files:update', async (_, payload) => {
    try {
      const { oldPath, newName, content } = UpdateFileSchema.parse(payload);
      await updateFile(oldPath, newName, content);
    } catch (error) {
      throw new Error(`Failed to update file: ${error}`);
    }
  });

  ipcMain.handle('files:delete', async (_, payload) => {
    try {
      const { path: filePath, toTrash } = DeleteFileSchema.parse(payload);
      await deleteFile(filePath, toTrash);
    } catch (error) {
      throw new Error(`Failed to delete file: ${error}`);
    }
  });

  ipcMain.handle('files:openExternal', async (_, payload) => {
    try {
      const { path: filePath } = OpenExternalSchema.parse(payload);
      await openExternal(filePath);
    } catch (error) {
      throw new Error(`Failed to open file: ${error}`);
    }
  });
}

app.whenReady().then(async () => {
  await setupIpcHandlers();
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle certificate errors in development
if (isDev) {
  app.commandLine.appendSwitch('ignore-certificate-errors');
}