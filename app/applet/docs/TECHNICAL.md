# Technical Architecture (TECHNICAL.md)

## Architecture Overview
PokéForge Studio is a unified React + Vite + TypeScript monorepo application structured into three packages:
1. **`pokedcomp`**: GBA ROM binary parser, pointer dereferencing engine, and event script disassembler.
2. **`pokecompiler`**: Re-serializes modified project state back into playable GBA ROM binaries, Pret-compatible C source trees, and offline HTML5 standalone bundles.
3. **`pokeview`**: React-based professional ROM hacking studio with visual map editor, event editor, encounter tables, Pokedex, trainer rosters, shop inventories, and hex viewer.

## Persistence
- **Browser IndexedDB & LocalStorage**: Automatic autosave of active project state.
- **Export/Import**: Full project zip archiving using JSZip.
