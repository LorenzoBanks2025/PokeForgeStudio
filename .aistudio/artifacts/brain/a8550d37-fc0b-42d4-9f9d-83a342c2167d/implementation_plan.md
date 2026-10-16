# Professional-Grade ROM Hacking Suite Expansion Plan

This implementation plan covers expanding PokéForge Studio into a professional-grade GBA Pokémon ROM editing suite with advanced tools matching elite desktop ROM hackers (Advance Map, PGE, HMA).

## User Review & Critical Decisions

> [!IMPORTANT]
> The following professional modules will be built and integrated into the sidebar navigation and editor views:
> 1. **Trainer Roster & Party Editor**: Customize trainer classes, AI tactics, intro/defeat quotes, and full party Pokémon (species, levels, held items, custom movepools).
> 2. **Evolution Tree & Branching Editor**: Visual node-based or table editor for branching Pokémon evolutions (Level-up, Evolution Stones, Trading, Happiness).
> 3. **Map Connections & Header Inspector**: Configure map headers (Music tracks, weather types, indoor/outdoor flags) and route connections (north, south, east, west map links).
> 4. **Poké Mart Shop Inventories & Item Editor**: Edit item buy/sell prices, pocket categories, field/battle usability, and town Poké Mart shop item shelves.
> 5. **Hex Offset Viewer & ROM Memory Inspector**: Raw binary ROM inspector with offset search, hex dump view, and pointer table resolver.

---

## 1. Architectural & Component Additions

- **Trainer Party Editor (`src/apps/pokeview/components/Trainers/TrainerEditorView.tsx`)**: Full trainer roster management with AI bitmask flags and party member customizers.
- **Evolution Tree Editor (`src/apps/pokeview/components/PokemonEditor/EvolutionEditor.tsx`)**: Visual evolution condition manager for species.
- **Map Headers & Connections (`src/apps/pokeview/components/MapEditor/MapHeaderInspector.tsx`)**: Route stitching and environmental header controls.
- **Shop & Item Editor (`src/apps/pokeview/components/Items/ShopEditorView.tsx`)**: Poké Mart inventory manager and item price/description editor.
- **Hex Offset Inspector (`src/apps/pokeview/components/HexViewer/HexInspectorModal.tsx`)**: Low-level GBA ROM byte viewer and pointer resolver.

---

## 2. Step-by-Step Implementation

1. **Extend Types (`pokedcomp/types.ts`)**: Add types for trainer AI flags, shop inventories, map headers, and evolution conditions.
2. **Build Professional Components**: Create the 5 new specialized editor views.
3. **Integrate into Studio Navigation**: Add views to `StudioView` enum and sidebar/navbar selectors.
4. **Build Verification**: Run `compile_applet` and `lint_applet` to ensure type safety and error-free builds.
