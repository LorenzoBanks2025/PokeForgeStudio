# Project State (STATE.md)

## Current Status
- **Phase**: PokéProject Directory Specification & Base ROM Merging Complete
- **Version**: 1.3.1
- **Build Status**: Verified & Compiling Successfully (`compile_applet`)
- **Type Checking**: Clean (`tsc --noEmit` passed with 0 errors)

## Verified Implemented Features
1. **PokéProject Directory Architecture (`projects/<projectName>/`)**:
   - `manifest.json`: Standardized format `pokeproject-v1` containing engine, gameCode, baseRom metadata, entryMap, and paths.
   - `data/` Directory: Modular JSON files (`maps.json`, `events.json`, `species.json`, `wild_encounters.json`, `trainers.json`, `items.json`, `moves.json`, `scripts.json`, `shops.json`).
   - `assets/` Directory: Graphics manifests (`tilesets.json`, `palettes.json`).
   - `base_rom.gba`: 16MB Nintendo Game Boy Advance binary ROM stored with the project.
   - `compiled_rom.gba`: Recompiled playable binary generated when merging PokéProject data.

2. **ROM-to-PokéProject Conversion & Landing Gate**:
   - Decompile GBA ROM converts uploaded `.gba` files into complete `projects/<projectName>/` folder structure.
   - Real-time directory browser on the landing screen displaying all projects in `projects/` with game badges, map/species counts, and base ROM status.
   - 1-Click starter ROM project initializers (`pokeemerald_starter` & `pokefirered_starter`).
   - Project directory inspector modal for exploring raw JSON files and downloading base ROMs.

3. **Base ROM Recompilation & Merging Pipeline (`RomBuilder.buildGbaRom`)**:
   - Merges modified map blocks and metatiles into ROM map banks.
   - Merges Pokémon species stats, types, catch rates into Gen III base stats table (`0x003203CC` / `0x00254784`).
   - Merges wild encounter tables and trainer rosters into ROM pointer tables.
   - Merges item prices and mart shop inventories into ROM item tables.
   - Injects full PokéProject JSON payload at `0x00E00000`.
   - Recomputes and seals Nintendo GBA complement checksum at `0xBD`.
   - Playable immediately in WebAssembly GBA emulator, exportable as `.gba`, `.ips`, or standalone HTML5 bundle.

4. **Transactional Undo/Redo & State Safety**:
   - 30-state history stack with global keyboard shortcuts (`Ctrl+Z`, `Ctrl+Y`).
   - 1-Click Auto-Repair for dangling scripts, broken warps, and level ranges.
   - Crash recovery and snapshot checkpoints.
