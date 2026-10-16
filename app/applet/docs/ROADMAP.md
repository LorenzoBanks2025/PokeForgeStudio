# Project Roadmap (ROADMAP.md)

## Phase 1: Discovery & Architecture [Completed]
- [x] Clarify dual support for Pokémon Emerald and FireRed.
- [x] Design monorepo structure with `pokedcomp`, `pokecompiler`, and `pokeview`.

## Phase 2: Core Decompilation & Compilation Libraries [Completed]
- [x] Implement `pokedcomp` GBA ROM parser and disassembler.
- [x] Implement `pokecompiler` GBA ROM rebuilder, Pret C tree exporter, and HTML5 bundle generator.

## Phase 3: Web Studio & Advanced Editors [Completed]
- [x] Build `pokeview` landing screen with ROM upload and Sample ROM loader.
- [x] Implement Map Editor, Tile Palette, Collision tools, and Map Canvas.
- [x] Implement Event Editor, Wild Encounter Editor, Pokémon Dex & Radar Stats, Trainer Roster, Shop Inventories, and Hex Inspector.

## Phase 4: ROM Integrity & Validation Pre-Flight [Completed]
- [x] Create `IntegrityChecker` service and compiler pre-flight validation modal to catch broken references, dangling script IDs, and missing species/items before recompiling.
