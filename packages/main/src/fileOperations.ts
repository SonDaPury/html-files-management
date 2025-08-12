import * as path from 'path';
import * as fs from 'fs/promises';
import { shell } from 'electron';
import { FileItem } from './types.js';
import { guardWorkspacePath, validateFilename, ensureHtmlExtension } from './utils.js';

export async function listHtmlFiles(workspace: string): Promise<FileItem[]> {
  guardWorkspacePath(workspace, workspace);
  
  try {
    const files = await fs.readdir(workspace);
    const htmlFiles: FileItem[] = [];
    
    for (const file of files) {
      if (file.endsWith('.html')) {
        const filePath = path.join(workspace, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile()) {
          htmlFiles.push({
            name: file,
            path: filePath,
            size: stats.size,
            mtime: stats.mtime.getTime(),
          });
        }
      }
    }
    
    return htmlFiles.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    throw new Error(`Failed to list files: ${error}`);
  }
}

export async function readFile(filePath: string): Promise<{ content: string }> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { content };
  } catch (error) {
    throw new Error(`Failed to read file: ${error}`);
  }
}

export async function createFile(workspace: string, name: string, content: string): Promise<void> {
  guardWorkspacePath(workspace, workspace);
  
  if (!validateFilename(name)) {
    throw new Error('Invalid filename. Use only letters, numbers, dots, underscores, and hyphens.');
  }
  
  const filename = ensureHtmlExtension(name);
  const filePath = path.join(workspace, filename);
  
  guardWorkspacePath(workspace, filePath);
  
  try {
    // Check if file already exists
    await fs.access(filePath);
    throw new Error(`File already exists: ${filename}`);
  } catch (error) {
    // File doesn't exist, which is what we want
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
  
  try {
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to create file: ${error}`);
  }
}

export async function updateFile(
  oldPath: string,
  newName: string | undefined,
  content: string
): Promise<void> {
  let finalPath = oldPath;
  
  // Handle rename if newName is provided
  if (newName) {
    if (!validateFilename(newName)) {
      throw new Error('Invalid filename. Use only letters, numbers, dots, underscores, and hyphens.');
    }
    
    const filename = ensureHtmlExtension(newName);
    const directory = path.dirname(oldPath);
    const newPath = path.join(directory, filename);
    
    guardWorkspacePath(directory, newPath);
    
    // Check if new name conflicts with existing file (unless it's the same file)
    if (newPath !== oldPath) {
      try {
        await fs.access(newPath);
        throw new Error(`File already exists: ${filename}`);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error;
        }
      }
      
      try {
        await fs.rename(oldPath, newPath);
        finalPath = newPath;
      } catch (error) {
        throw new Error(`Failed to rename file: ${error}`);
      }
    }
  }
  
  try {
    await fs.writeFile(finalPath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to update file content: ${error}`);
  }
}

export async function deleteFile(filePath: string, toTrash = true): Promise<void> {
  try {
    if (toTrash) {
      await shell.trashItem(filePath);
    } else {
      await fs.unlink(filePath);
    }
  } catch (error) {
    throw new Error(`Failed to delete file: ${error}`);
  }
}

export async function openExternal(filePath: string): Promise<void> {
  try {
    await shell.openPath(filePath);
  } catch (error) {
    throw new Error(`Failed to open file: ${error}`);
  }
}