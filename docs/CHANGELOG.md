# Changelog

All notable changes to PokéForge Studio will be documented in this file.

## [1.3.0] - 2026-10-16
### Added
- **PokéProject Directory Specification (`projects/<projectName>/`)**:
  - GBA ROM decompilation now converts binary ROMs into a standard project directory containing `manifest.json`, modular `data/` files (`maps.json`, `events.json`, `species.json`, `wild_encounters.json`, `trainers.json`, `items.json`, `moves.json`, `scripts.json`, `shops.json`), `assets/` files, and `base_rom.gba`.
  - Server endpoints for project lifecycle: `/api/projects`, `/api/project/create`, `/api/project/:name`, `/api/project/:name/save`, `/api/project/:name/base-rom`, `/api/project/:name/recompile`, `/api/project/:name/files`, and `/api/project/:name/file-content`.
  - Automatic seeding of default starter projects `projects/pokeemerald_starter` and `projects/pokefirered_starter` on initial boot.
- **Project Files Inspector Modal (`ProjectFilesModal`)**:
  - Real-time directory browser displaying the actual files in `projects/<projectName>/` with file sizes, modified dates, raw JSON code viewer, copy-to-clipboard, and binary base ROM download.
- **Base ROM Recompilation & True Binary Merging**:
  - Enhanced `RomBuilder.buildGbaRom` to merge PokéProject edits directly into `base_rom.gba`: map metatiles, collision permissions, Pokémon species base stats & types, wild encounters, trainer parties, items, and shops.
  - Nintendo complement checksum calculation and sealing over bytes `0xA0-0xBC` into byte `0xBD`.
- **TopNavbar Project Switcher & Base ROM Status**:
  - Integrated Project Switcher action, active project directory badge, and live base ROM verification indicator.

## [1.2.0] - 2026-10-16
### Added
- **Undo / Redo Transactional History**: Full 30-step immutable history buffer across all editors with `Ctrl+Z` and `Ctrl+Y` shortcuts and TopNavbar buttons.
- **1-Click Auto-Repair**: Added `IntegrityChecker.repairProject` to automatically resolve dangling script IDs, clamp out-of-range wild levels, replace missing species, and fix broken warps.
- **Map Header & Atmosphere Inspector (`MapHeaderModal`)**: Per-map configuration of BGM tracks, weather effects (sunny, rain, snow, sandstorm, fog, underwater), map classifications, and battle scenes.
- **Multi-Layer Map Canvas Controls**: Toggleable visibility for Metatiles, Collision masks, Events/NPCs, and Grid lines.
- **Standard IPS ROM Delta Patch Exporter (`ipsPatcher.ts`)**: Integrated `.ips` patch generator for legal ROM hack distribution without distributing copyrighted Nintendo ROMs.
- **Session Auto-Save & Crash Recovery**: Continuous background saving to LocalStorage with 1-click recovery restoration banner on launch.
- **Manual Safety Snapshots**: Checkpoint generation button with timestamped logging.
