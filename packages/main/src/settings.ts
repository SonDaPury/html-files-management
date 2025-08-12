import * as path from 'path';
import * as fs from 'fs/promises';
import { app } from 'electron';

interface Settings {
  workspace?: string;
  recentWorkspaces?: string[];
}

const SETTINGS_FILE = 'settings.json';

export async function getSettingsPath(): Promise<string> {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, SETTINGS_FILE);
}

export async function loadSettings(): Promise<Settings> {
  try {
    const settingsPath = await getSettingsPath();
    const data = await fs.readFile(settingsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Return default settings if file doesn't exist or is invalid
    return {};
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  const settingsPath = await getSettingsPath();
  const settingsDir = path.dirname(settingsPath);
  
  // Ensure directory exists
  await fs.mkdir(settingsDir, { recursive: true });
  
  await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
}

export async function saveWorkspace(workspace: string): Promise<void> {
  const settings = await loadSettings();
  settings.workspace = workspace;
  
  // Add to recent workspaces
  if (!settings.recentWorkspaces) {
    settings.recentWorkspaces = [];
  }
  
  // Remove if already exists
  settings.recentWorkspaces = settings.recentWorkspaces.filter(w => w !== workspace);
  
  // Add to front and limit to 10 recent workspaces
  settings.recentWorkspaces.unshift(workspace);
  settings.recentWorkspaces = settings.recentWorkspaces.slice(0, 10);
  
  await saveSettings(settings);
}

export async function getCurrentWorkspace(): Promise<string | null> {
  const settings = await loadSettings();
  return settings.workspace || null;
}