import * as path from 'path';
import * as fs from 'fs/promises';

export function validateFilename(name: string): boolean {
  const filenameRegex = /^[A-Za-z0-9._-]+$/;
  return filenameRegex.test(name);
}

export function ensureHtmlExtension(name: string): string {
  if (!name.endsWith('.html')) {
    return `${name}.html`;
  }
  return name;
}

export function guardWorkspacePath(workspace: string, targetPath: string): void {
  const resolvedWorkspace = path.resolve(workspace);
  const resolvedTarget = path.resolve(targetPath);
  
  if (!resolvedTarget.startsWith(resolvedWorkspace)) {
    throw new Error(`Path traversal detected: ${targetPath} is outside workspace ${workspace}`);
  }
}

export async function ensureWorkspaceExists(workspace: string): Promise<void> {
  try {
    const stats = await fs.stat(workspace);
    if (!stats.isDirectory()) {
      throw new Error(`Workspace path is not a directory: ${workspace}`);
    }
    // Test write access
    await fs.access(workspace, fs.constants.R_OK | fs.constants.W_OK);
  } catch (error) {
    throw new Error(`Cannot access workspace: ${workspace}. ${error}`);
  }
}

export async function createDirectoryIfNotExists(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Ignore if directory already exists
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}