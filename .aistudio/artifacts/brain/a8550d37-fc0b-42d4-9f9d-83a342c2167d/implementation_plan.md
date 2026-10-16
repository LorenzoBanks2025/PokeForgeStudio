# PokéForge Studio: GBA Pokémon Decompilation, GUI Editor & Web Recompiler

A unified monorepo containing `pokedcomp` (GBA ROM disassembler and asset extractor), `pokeview` (modern browser-based visual studio for editing maps, events, wild encounters, Pokémon, items, dialogs, and battle scripts), and `pokecompiler` (recompiler producing playable GBA ROMs, in-browser WebAssembly playable builds, desktop standalone bundles, and pret-compatible C trees).

## User Review & Critical Decisions

> [!IMPORTANT]
> The following core product and architectural choices were confirmed during interactive clarification and form the foundation of the development blueprint:

- **Dual Base Game Engine Support (Emerald & FireRed)**: Full decompilation and editing schemas for both Pokémon Emerald (`pokeemerald` engine: Hoenn region, 386 Gen III species, battle frontier structures) and Pokémon FireRed (`pokefirered` engine: Kanto region, classic layouts and script formats).
- **Compilation Output Strategy**: In-browser playable emulator powered by WebAssembly, direct playable `.gba` ROM binary download with recalculation of ROM headers/checksums, plus downloadable desktop-ready HTML5 standalone packages and standard `pret` C-decomp tree exports.
- **Immediate Interactive Workspace**: Pre-loaded with full interactive demo project featuring Littleroot Town (Emerald) and Pallet Town (FireRed), complete with working tileset canvases, NPC event triggers, wild grass tables, Pokémon stat/sprite registries, and battle script inspectors.

---

## 1. Overview & Core Concept

- **What It Does**: PokéForge Studio provides a complete game development and ROM hacking pipeline in the browser. It ingests GBA ROMs (`.gba`), decompiles them into structured data and C-compatible assets (`pokedcomp`), provides an intuitive, high-density desktop GUI to modify game mechanics and world design (`pokeview`), and recompiles projects into playable ROMs, standalone web builds, and desktop packages (`pokecompiler`).
- **Target Audience**: ROM hackers, retro game developers, Pokémon modding communities, and hobbyist game designers seeking a visual alternative to CLI C-makefiles without losing engine compatibility.
- **Key Value**: Eliminates the steep barrier of setting up arm-none-eabi toolchains and Linux cross-compilers by offering visual WYSIWYG editing of maps, events, encounters, Pokémon, dialogs, and animations with instant in-browser test playing.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Explore & Navigate**: Users switch seamlessly between Emerald (Hoenn) and FireRed (Kanto) workspaces, navigating maps (Littleroot, Petalburg, Slateport / Pallet, Viridian, Pewter) via an interactive hierarchy tree.
2. **Visual Map & Event Editing**:
   - Canvas viewport with zoom, pan, grid overlay, and layer toggles (Ground, Foliage, Collision permissions).
   - Tile Palette picker with 16x16 GBA metatiles and movement permission overlays (Passable, Impassable, Water, Surf, Ledge Jump, Warp).
   - Event Inspector: Click-to-place NPCs, warp portals, script triggers, and signposts. Live editing of coordinates, movement types, trainer sight radius, and linked script pointers.
3. **Wild Encounter Balancing**:
   - Visual route encounter table editor for Land (Grass), Water (Surf), Fishing (Old, Good, Super Rod), and Rock Smash.
   - Adjust probability weights, min/max levels, and species selection with live distribution graphs.
4. **Pokémon & Battle Script Studio**:
   - Species editor: Base stats radar chart, primary/secondary typing, abilities, catch rate, base EXP, effort values, and learnset moves.
   - Character & Dialog editor: NPC portrait, script event commands, conditional branches (`checkflag`, `giveitem`, `trainerbattle3`).
   - Move & Animation viewer: Move power, accuracy, PP, type, effect flags, and visual animation stage timeline preview.
5. **Recompile & Play**:
   - Click "Build & Test" to invoke `pokecompiler`.
   - Instant in-browser playable GBA WebAssembly emulator modal with full gamepad/keyboard mapping, save state support, and audio.
   - Direct downloads: Patched `.gba` ROM file, Desktop Standalone HTML5 bundle (.zip), or pret-compatible source package.

### Visual Identity & Theme
- **Aesthetic Direction**: High-density engineering studio. Dark slate base (`#0F172A`) paired with neutral charcoal surfaces (`#1E293B`), hairline dividers (`#334155`), and Game Boy Advance indigo accent highlights (`#6366F1` / `#4F46E5`).
- **Typography**: 
  - Display & Headings: `Plus Jakarta Sans` for crisp, structured headers and studio toolbars.
  - Body & Labels: `DM Sans` for dense, legible parameter panels and metadata.
  - Data & Addresses: `JetBrains Mono` with `tabular-nums` for ROM offsets, hex opcodes, tile coordinates, and base stat numbers.
- **Component Styling & Layout**:
  - Full-width 1440px desktop workspace with 3-pane IDE layout: Left asset explorer (260px), Center interactive canvas/work area, Right contextual property inspector (320px).
  - Unboxed metadata with clean typographic separators (`·` / `/`).
  - Strict zero-pill and zero-decorative-dot discipline across all tables and headers.

---

## 3. Key Product Decisions & Trade-Offs

- **Browser-Native In-Memory Monorepo Architecture**:
  - *Chosen Approach*: Implement `pokedcomp`, `pokeview`, and `pokecompiler` as modular TypeScript packages within the workspace, executing decompilation, asset extraction, table serialization, and ROM rebuilding directly in memory with WebAssembly emulation.
  - *Why*: Enables instant zero-dependency execution in any browser sandbox without requiring external C toolchains or remote server compilers, while retaining 100% compatibility with pret C headers and JSON data formats.
- **Dual Engine Representation**:
  - *Chosen Approach*: Unified schema with game-specific drivers (`emerald` vs `firered`) handling distinct pointer tables, music IDs, script opcodes, and map header formats.
  - *Why*: Prevents fragmented codebases while faithfully respecting engine differences between Hoenn and Kanto.
- **ROM Patching & Checksum Recalculator**:
  - *Chosen Approach*: Byte-level GBA header CRC32 and complementary checksum repair algorithm built into `pokecompiler` so generated ROMs boot cleanly in standard emulators and flashcarts.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PokéForge Studio Monorepo                       │
├────────────────────────┬───────────────────────────────────────────────┤
│  packages/pokedcomp    │ GBA Binary Disassembler & ROM Extractor       │
│                        │ • ROM Header & Pointer Table Parser           │
│                        │ • Map & Metatile Decompiler                   │
│                        │ • Event & Script Disassembler                 │
│                        │ • Wild Encounter & Species Table Parser       │
├────────────────────────┼───────────────────────────────────────────────┤
│  apps/pokeview         │ Interactive Web GUI Studio (React + Canvas)   │
│                        │ • Map Canvas (Metatiles, Collision Masks)     │
│                        │ • Event & NPC Node Editor                     │
│                        │ • Wild Encounter Distribution Editor          │
│                        │ • Pokémon Species & Learnset Studio           │
│                        │ • Trainer, Dialog & Battle Script Inspector   │
├────────────────────────┼───────────────────────────────────────────────┤
│  packages/pokecompiler │ ROM Rebuilder & Export Engine                 │
│                        │ • Asset Serializer & Bytecode Re-encoder      │
│                        │ • GBA Binary Header & Checksum Patching       │
│                        │ • WebAssembly GBA Emulator Runner (vba-wasm)  │
│                        │ • Standalone Desktop HTML5 & Pret Source Zip  │
└────────────────────────┴───────────────────────────────────────────────┘
```

### Data Model & State Stores
- **ProjectState**: `activeGame` ('emerald' | 'firered'), `projectName`, `version`, `maps`, `species`, `items`, `moves`, `encounters`, `trainers`, `scripts`.
- **MapLayout**: `id`, `name`, `width`, `height`, `tilesetId`, `blocks` (metatile IDs + collision permission flags), `borderBlocks`.
- **MapEvents**: `npcs` (id, x, y, spriteId, movementType, sightRadius, scriptId), `warps` (x, y, targetMap, targetWarpId), `triggers` (x, y, variable, varValue, scriptId), `signs` (x, y, scriptId).
- **WildEncounterTable**: `mapId`, `land` (12 encounter slots with weights: 20%, 20%, 10%, 10%, 10%, 10%, 5%, 5%, 4%, 4%, 1%, 1%), `water` (5 slots), `fishing` (Old 2, Good 3, Super 5), `rockSmash` (5 slots).
- **PokemonSpecies**: `id`, `name`, `types`, `stats` (HP, Atk, Def, SpA, SpD, Spe), `abilities`, `growthRate`, `catchRate`, `learnset` (level, moveId), `spriteFront`, `spriteBack`.

### Step-by-Step Implementation Strategy
1. **Core Libraries Implementation**:
   - `packages/pokedcomp`: GBA structures, binary reader/writer, data decoders for map headers, events, wild encounters, Pokémon stats, moves, items, and script disassembler.
   - `packages/pokecompiler`: Binary table packer, pointer table patcher, ROM header checksum generator, export packaging, and emulator runtime integration.
2. **Interactive Workspace Data & Engine Profiles**:
   - Pre-loaded, fully detailed Pokémon Emerald (Littleroot Town, Route 101, Oldale Town) and FireRed (Pallet Town, Route 1, Viridian City) game configurations with genuine metatiles, event scripts, encounter rates, and Pokémon species data.
3. **PokeView Studio Web Interface**:
   - Main Header & Top Bar with dual-game switcher, project stats, import ROM button, and "Build & Play" action.
   - Workspace Sidebar with 6 core modes: **Map Editor**, **Events & NPCs**, **Wild Encounters**, **Pokémon & Moves**, **Trainers & Dialog**, and **Compiler & Emulator**.
   - Canvas-based metatile map painter with brush, fill, eraser, collision overlay toggle, and pan/zoom controls.
   - Event placement tool with drag-and-drop coordinate updates and interactive script code editor.
   - Encounter distribution graph and level range modifiers.
   - Species editor with live stat radar, type badges, ability picker, and learnset table.
   - Built-in WebAssembly GBA emulator running the recompiled game with virtual controls and audio.
