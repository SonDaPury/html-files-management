# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an HTML file manager project desktop app.

- Goal: Build a cross‑platform desktop app with Electron + React + TypeScript (bundled with Vite) to manage .html files inside a user‑selected folder: list, create, edit (rename + content), delete, and open in the system default browser.

---

## 1) Scope & Expected Outcomes

- Electron desktop app (macOS/Windows/Linux).
- User selects a **workspace directory**. The app stores it (recent workspaces) and **restricts all FS operations** to that directory.
- Core features:
  1. **Pick workspace** and verify read/write access. Existing contents are allowed; prevent name collisions on create/rename.
  2. **List** `.html` files with basic **search** and **sort** (by name/mtime).
  3. **Create** file with a form: `name` (required, safe characters; auto-append `.html` if missing) and `content` (required). Write UTF-8.
  4. **Edit** file: rename (validate) and update `content` (required). Do safe rename/write.
  5. **Delete** file: confirm before delete; prefer **move to trash** when available.
  6. **Open** file in the OS default browser by clicking its name in the list.
- Clean UI with **Chakra UI**, consistent empty/loading/error states, and toast notifications.

**Deliverables:**

- Well-structured TypeScript code.
- Basic tests (unit for FS & IPC; optional light e2e).
- `README.md` with run/build instructions.

---

## 2) Tech & Architecture

- **Electron**: `main` (lifecycle, menu, dialogs), `preload` (secure bridge), `renderer` (React UI).
- **React + Vite + TypeScript** in renderer.
- **Chakra UI** for UI components; optional icons via `@chakra-ui/icons`.
- **IPC** via `contextBridge` + `ipcRenderer.invoke` with typed payloads.
- **Security**: `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`. Enforce **workspace confinement**.

**Suggested folder layout:**

```plaintext
project-root/
  packages/
    main/          # Electron main process (TS)
    preload/       # contextBridge APIs
    renderer/      # React + Vite + Chakra UI (TS)
  resources/
  scripts/
  .vscode/
```

---

## 3) Functional Specs

### 3.1 Workspace selection

- Button "Choose workspace" → `dialog.showOpenDialog({ properties: ['openDirectory'] })` in `main`.
- Persist selected path in `app.getPath('userData')/settings.json`.
- Show current workspace, allow switching. If not accessible → prompt to reselect.

### 3.2 List HTML files

- API `listHtmlFiles(workspace): Promise<FileItem[]>` returns `{ name, path, size, mtime }` for `*.html` only.
- Client-side search by name; sort by `name|mtime`.
- Refresh after create/edit/delete/rename.

### 3.3 Create

- Form validation:
  - `name`: required; regex `^[A-Za-z0-9._-]+$`; append `.html` when missing; reject duplicates.
  - `content`: required.
- Write UTF-8; on success: toast + refresh.

### 3.4 Edit (rename + content)

- Load file content; show editor (textarea/CodeMirror optional).
- If `newName` provided: validate & ensure uniqueness; perform `rename` then write content.
- On success: toast + stay in editor or return to list (configurable).

### 3.5 Delete

- Confirm dialog. Prefer `shell.trashItem` when available; fallback to `fs.rm`.

### 3.6 Open in default browser

- Use `shell.openPath(filePath)` or `shell.openExternal('file://' + filePath)`.

---

## 4) IPC Contract (Bridge API)

> All calls are exposed under `window.electron.*` from the renderer. Channel names are stable and must not change.

**Channels & Payloads:**

- `app:chooseWorkspace() -> Promise<string | null>`
- `app:getWorkspace() -> Promise<string | null>`
- `files:list({ workspace }): Promise<FileItem[]>`
- `files:read({ path }): Promise<{ content: string }>`
- `files:create({ workspace, name, content }): Promise<void>`
- `files:update({ oldPath, newName?, content }): Promise<void>`
- `files:delete({ path, toTrash?: boolean }): Promise<void>`
- `files:openExternal({ path }): Promise<void>`

**Types:**

```typescript
interface FileItem {
  name: string;
  path: string;
  size: number;
  mtime: number;
}
```

**Validation & Guards:**

- Validate all payloads (e.g., **Zod**).
- Prevent **path traversal**: resolve candidate paths and ensure they **start with the workspace** (`path.resolve`, `startsWith`).
- Return typed errors and map to user-friendly toasts.

---

## 5) UI/UX (Chakra UI)

- **Layout:**
  - Header: workspace info + "Choose folder" button.
  - Main: file list with search input, sort select, actions (New/Edit/Delete/Open).
- **Chakra components:** `Box`, `Flex`, `HStack`, `VStack`, `Heading`, `Input`, `Select`, `Table`, `Thead`, `Tbody`, `Tr`, `Td`, `Button`, `IconButton`, `Modal`, `FormControl`, `FormLabel`, `FormErrorMessage`, `Textarea`, `useToast`.
- **States:** Empty/Loading/Error views.
- **Keyboard shortcuts:** `Cmd/Ctrl+N` (New), `Cmd/Ctrl+S` (Save), `Delete` (Remove).
- **Accessibility:** proper labels, focus traps in modals.

---

## 6) Security Rules

- `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`.
- Expose only minimal APIs via `contextBridge`.
- Strict input validation (filenames, content size limits).
- All FS operations **must remain inside** the workspace directory.
- No `eval`, no remote code loading.

---

## 7) Quality & DoD

- TypeScript strict (`noImplicitAny`, `exactOptionalPropertyTypes`).
- ESLint + Prettier; consistent import order.
- Unit tests for validators, path guards, and FS helpers (mock `fs/promises`).
- Manual QA checklist:
  - Create/Edit/Delete/Open flows.
  - Duplicate/invalid name handling.
  - Auto append `.html` behavior.
  - Prevent accidental navigation away from unsaved editor.
  - Loss of directory access handled gracefully.

---

## 8) Test Scenarios

1. Create valid file → appears in list.
2. Create duplicate name → error toast.
3. Edit content + rename → file renamed and content updated.
4. Delete → file removed and sent to trash (when supported).
5. Open → launches default browser.
6. Search/sort work on large lists (≥500 files).

---

## 9) Code Structure & Example API

**preload/index.ts:**

```typescript
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  chooseWorkspace: () => ipcRenderer.invoke("app:chooseWorkspace"),
  getWorkspace: () => ipcRenderer.invoke("app:getWorkspace"),
  listFiles: (workspace: string) =>
    ipcRenderer.invoke("files:list", { workspace }),
  readFile: (path: string) => ipcRenderer.invoke("files:read", { path }),
  createFile: (workspace: string, name: string, content: string) =>
    ipcRenderer.invoke("files:create", { workspace, name, content }),
  updateFile: (oldPath: string, newName: string | undefined, content: string) =>
    ipcRenderer.invoke("files:update", { oldPath, newName, content }),
  deleteFile: (path: string, toTrash = true) =>
    ipcRenderer.invoke("files:delete", { path, toTrash }),
  openExternal: (path: string) =>
    ipcRenderer.invoke("files:openExternal", { path }),
});
```

---

## 10) NPM Scripts & Build

- `dev`: concurrently run Electron main & preload watchers and Vite dev server for renderer.
- `build`: package with **electron-builder**.
- `lint`, `typecheck`, `test`.

---

## 11) Prompt Templates for Claude Code

**a) Project scaffolding:**

```text
You are a senior Electron + React + TypeScript engineer. Scaffold a multi-package project (main, preload, renderer) using Vite for the renderer and electron-builder for packaging.

Requirements:
- Use Chakra UI in the renderer with a basic theme provider.
- Implement secure Electron defaults: contextIsolation, sandbox, no nodeIntegration.
- Implement the IPC contract exactly as specified below.
- Provide a minimal but functional React UI (list/create/edit/delete/open) with validation using Chakra UI components and toasts.
- Add npm scripts: dev, build, lint, typecheck, test.

Spec:
<paste sections 1–10 from this document>

Output:
- Full file tree.
- File contents.
- Commands to run.
```

**b) IPC & security:**

```text
Implement preload and main IPC exactly per this contract:
<paste section 4 IPC Contract>

Add Zod validation for payloads. Guard against path traversal by ensuring resolved paths start with the workspace path. Return typed errors suitable for mapping to Chakra toasts.
```

**c) Renderer UI (Chakra UI):**

```text
Build three views:
- WorkspacePicker: shows current workspace and a button to choose.
- FileList: table of .html files with search and sort.
- EditorModal: create/edit with Chakra FormControl validations for name and content.

Wire keyboard shortcuts (Cmd/Ctrl+N, Cmd/Ctrl+S) and toast feedback.
```

**d) Tests:**

```text
Create unit tests for:
- filename validator
- path guard
- CRUD FS helpers (mock fs/promises)

Optional: smoke e2e for create→edit→delete with Playwright.
```

---

## 12) Coding Conventions

- TS strict mode, clear function boundaries, comments for non-obvious logic.
- Conventional Commits.

---

## 13) Optional Roadmap

- In-app HTML preview (safe `webview` or external only).
- Recent workspaces and multi-workspace switcher.
- File tags/notes.
- FS watcher for auto-refresh.
- Undo/redo in editor.

---

## 14) Notes to the AI agent (Claude Code)

- Do not change the IPC channel names or folder structure unless explicitly asked.
- Normalize all paths with `path.resolve` and verify they remain inside the workspace.
- Before writes: create missing dirs, prefer atomic writes when practical.
- Log with context (action, filePath, errorCode).
- Keep code small, modular, and readable.
  .
