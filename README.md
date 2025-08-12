# HTML File Manager

A cross-platform desktop application built with Electron, React, and TypeScript for managing HTML files in a selected workspace directory.

## Features

- **Workspace Management**: Select a directory as your workspace and manage HTML files within it
- **File Operations**: Create, edit, rename, and delete HTML files
- **Security**: All file operations are confined to the selected workspace directory
- **Modern UI**: Built with Chakra UI for a clean, responsive interface
- **File Preview**: Open HTML files in your default browser
- **Search & Sort**: Find and organize files easily

## Tech Stack

- **Electron**: Cross-platform desktop app framework
- **React**: Frontend UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Chakra UI**: Modern React component library
- **Zod**: Runtime type validation

## Project Structure

```
project-root/
├── packages/
│   ├── main/          # Electron main process
│   ├── preload/       # Secure bridge between main and renderer
│   └── renderer/      # React frontend
├── resources/         # App resources
├── scripts/           # Build scripts
└── dist/             # Built application
```

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

This will start:
- Electron main process compiler (watch mode)
- Preload script compiler (watch mode) 
- Vite dev server for the renderer on port 3000

### Available Scripts

- `npm run dev` - Start development environment
- `npm run build` - Build all packages for production
- `npm run start` - Run the built application
- `npm run pack` - Package the app (without publishing)
- `npm run dist` - Build and distribute the app
- `npm run lint` - Lint all TypeScript files
- `npm run typecheck` - Type check all packages
- `npm run test` - Run unit tests
- `npm run test:ui` - Run tests with Vitest UI

### Building

To build the application for distribution:

```bash
npm run build
npm run dist
```

The packaged application will be available in the `release/` directory.

## Security

The application follows Electron security best practices:

- Context isolation enabled
- Sandbox mode enabled  
- Node integration disabled
- Minimal IPC surface with input validation
- Path traversal protection
- Workspace confinement

## File Operations

All file operations are restricted to the selected workspace directory:

1. **Create**: New HTML files with validation
2. **Edit**: Rename files and update content
3. **Delete**: Move files to trash (when available)
4. **Open**: Launch files in default browser
5. **List**: Display files with search and sort

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Run linting and type checking before committing
4. Use conventional commit messages

## License

MIT