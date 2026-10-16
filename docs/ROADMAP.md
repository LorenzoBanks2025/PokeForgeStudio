# Project Roadmap (ROADMAP.md)

## Completed Milestones
- [x] **Phase 1: Project Architecture & Discovery**
  - Clarified dual support for Pokémon Emerald and Pokémon FireRed.
  - Established monorepo architecture: `pokedcomp`, `pokecompiler`, and `pokeview`.

- [x] **Phase 2: Core Decompilation & Compilation Libraries**
  - Binary GBA ROM reader with complement checksum validation.
  - Bytecode script disassembler for XSE / pokeemerald event scripts.
  - Binary GBA ROM rebuilder with Nintendo logo checksum verification.
  - Pret C decomp source tree exporter (`pretExporter.ts`).
  - Standalone desktop-ready HTML5 bundle builder (`standaloneBuilder.ts`).
  - Standard IPS binary delta patch creator and applicator (`ipsPatcher.ts`).

- [x] **Phase 3: Visual ROM Editing Studio**
  - Map Canvas with metatile painting, flood fill, and collision masks.
  - Multi-layer canvas visibility toggles (Metatiles, Collisions, Events, Grid).
  - Map Header & Atmosphere inspector (BGM soundtracks, weather, classification).
  - Event Editor with NPC dialog trees, signposts, and warp portals.
  - Wild Encounters Editor with encounter slot rates and level ranges.
  - Pokémon Dex & Evolution tree editor with interactive hexagonal stats radar.
  - Trainer Roster & Party Editor with AI flags and held items.
  - Shop Inventories & Item price/effect editor.
  - Hex Offset Viewer & Memory Inspector.

- [x] **Phase 4: Robustness, Safety & Integrity**
  - Transactional Undo / Redo history with global keyboard shortcuts (`Ctrl+Z`, `Ctrl+Y`).
  - 1-Click Auto-Repair for dangling scripts, invalid level ranges, and broken warps.
  - Periodic autosave with crash recovery banner on launch.
  - Manual safety snapshot checkpoints.
  - In-browser WebAssembly GBA Emulator with sound and battle mode.
