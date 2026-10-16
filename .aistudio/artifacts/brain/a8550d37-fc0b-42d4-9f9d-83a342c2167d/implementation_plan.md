# PokéForge Studio: ROM Decompilation Gate, Project File Workspace & Render Deployment

This implementation plan covers updating PokéForge Studio to enforce a mandatory GBA ROM decompilation gate on startup, implement a robust `.pokeforge` project file & folder specification with server/IndexedDB persistence, enable asset upload/replacement, and ensure full Render deployment compatibility (`server.ts` + Express + Vite).

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural enhancements were confirmed during clarification:
> - **Mandatory Decompilation Gate**: Clean startup landing screen requiring a `.gba` ROM upload or 1-click Sample ROM loader before accessing the visual editor.
> - **Project File & Folder Specification**: `.pokeforge` archive format storing JSON manifests, extracted tilesets, sprites, map layouts, and event scripts. Server-backed project zip export and browser IndexedDB workspace persistence.
> - **Asset Management**: Ability to upload and replace custom PNG tilesets, map graphics, and sprite assets.
> - **Render Compatibility**: Full Express server entry point (`server.ts`) supporting production static file serving and API endpoints.

---

## 1. Overview & Core Architecture

1. **Startup Landing Gate (`RomDecompileGate.tsx`)**:
   - Initial screen when no active project is loaded.
   - Drag-and-drop `.gba` ROM uploader or "Load Sample Pokémon Emerald / FireRed Project" button.
   - Decompilation progress terminal showing ROM header parsing, checksum verification, and asset extraction logs.
2. **Project Workspace & File Specification (`.pokeforge`)**:
   - Manifest (`project.json`), maps directory (`maps/`), assets directory (`assets/tilesets/`, `assets/sprites/`), encounters (`encounters.json`), and species (`species.json`).
   - Server-backed API endpoints for project saving, loading, zip export, and asset uploads (`/api/project/save`, `/api/project/export`, `/api/assets/upload`).
3. **Render Deployment Setup**:
   - Express backend (`server.ts`) serving static frontend assets and API routes on `PORT` environment variable, with `"start": "node server.ts"` in `package.json`.

---

## 2. Technical Plan & File Changes

- **Backend (`server.ts`)**: Add Express endpoints for project export, zip handling, and asset storage.
- **Project Store (`src/services/projectStore.ts`)**: IndexedDB + Server sync for `.pokeforge` project archives.
- **Decompilation Landing (`src/apps/pokeview/components/RomDecompileGate.tsx`)**: Mandatory ROM upload & sample loader screen.
- **Asset Manager (`src/apps/pokeview/components/AssetManager/AssetManagerModal.tsx`)**: Interface to upload/replace PNG tilesets, sprites, and audio samples.
- **App Root (`src/apps/pokeview/PokeViewApp.tsx`)**: Integrate landing gate, project management, and asset manager.
