import { z } from 'zod';

export interface FileItem {
  name: string;
  path: string;
  size: number;
  mtime: number;
}

// Zod schemas for validation
export const ListFilesSchema = z.object({
  workspace: z.string(),
});

export const ReadFileSchema = z.object({
  path: z.string(),
});

export const CreateFileSchema = z.object({
  workspace: z.string(),
  name: z.string(),
  content: z.string(),
});

export const UpdateFileSchema = z.object({
  oldPath: z.string(),
  newName: z.string().optional(),
  content: z.string(),
});

export const DeleteFileSchema = z.object({
  path: z.string(),
  toTrash: z.boolean().optional().default(true),
});

export const OpenExternalSchema = z.object({
  path: z.string(),
});