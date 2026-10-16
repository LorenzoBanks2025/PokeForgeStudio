/**
 * @file projectManager.ts
 * @package services
 * @description Manages PokéProject directory specification, file serialization, and REST sync.
 * Converts decompiled projects to/from directory structures with manifest.json, data/, and asset files.
 */

import { DecompiledProject, GameEngine, MapLayout, MapEvents, PokemonSpecies, WildEncounterTable, Trainer, Item, Move, EventScript, ShopInventory } from '@/src/packages/pokedcomp/types.ts';

export interface ProjectManifest {
  format: 'pokeproject-v1';
  projectName: string;
  displayName: string;
  game: GameEngine;
  version: string;
  createdAt: string;
  updatedAt: string;
  entryMap: string;
  baseRom: {
    fileName: string;
    gameTitle: string;
    gameCode: string;
    size: number;
    checksum: string;
  };
  dataFiles: {
    maps: string;
    events: string;
    species: string;
    wildEncounters: string;
    trainers: string;
    items: string;
    moves: string;
    scripts: string;
    shops: string;
  };
  assetFiles: {
    tilesets: string;
    palettes: string;
  };
}

export interface ProjectSummary {
  name: string;
  displayName?: string;
  game: GameEngine;
  version?: string;
  mapsCount: number;
  speciesCount: number;
  trainersCount: number;
  hasBaseRom: boolean;
  baseRomSize?: number;
  updatedAt: string;
  path: string;
  isFolder: boolean;
}

export interface ProjectFileInfo {
  name: string;
  relativePath: string;
  size: number;
  mtime: string;
  isDirectory: boolean;
}

export class ProjectManager {
  /**
   * Deconstructs a DecompiledProject in-memory model into standard PokéProject directory files.
   */
  static serializeToDirectory(
    project: DecompiledProject,
    baseRomInfo?: { size: number; checksum: string }
  ): {
    manifest: ProjectManifest;
    data: {
      'maps.json': Record<string, { layout: MapLayout; events: MapEvents }>;
      'events.json': Record<string, MapEvents>;
      'species.json': Record<string, PokemonSpecies>;
      'wild_encounters.json': Record<string, WildEncounterTable>;
      'trainers.json': Record<string, Trainer>;
      'items.json': Record<string, Item>;
      'moves.json': Record<string, Move>;
      'scripts.json': Record<string, EventScript>;
      'shops.json': Record<string, ShopInventory>;
    };
    assets: {
      'tilesets.json': { tilesetId: string; metatilesCount: number }[];
      'palettes.json': { name: string; colors: string[] }[];
    };
  } {
    const firstMapId = Object.keys(project.maps)[0] ?? 'MAP_MAIN';
    const gameTitle = project.game === 'emerald' ? 'POKEMON EMER' : 'POKEMON FIRE';
    const gameCode = project.game === 'emerald' ? 'BPEE' : 'BPRE';

    // Separate layout and events
    const mapsData: Record<string, { layout: MapLayout; events: MapEvents }> = {};
    const eventsData: Record<string, MapEvents> = {};

    for (const [mapId, mapObj] of Object.entries(project.maps)) {
      mapsData[mapId] = mapObj;
      eventsData[mapId] = mapObj.events;
    }

    const manifest: ProjectManifest = {
      format: 'pokeproject-v1',
      projectName: project.projectName,
      displayName: project.projectName
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase()),
      game: project.game,
      version: project.version || '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      entryMap: firstMapId,
      baseRom: {
        fileName: 'base_rom.gba',
        gameTitle,
        gameCode,
        size: baseRomInfo?.size || 16777216,
        checksum: baseRomInfo?.checksum || '0xBD'
      },
      dataFiles: {
        maps: 'data/maps.json',
        events: 'data/events.json',
        species: 'data/species.json',
        wildEncounters: 'data/wild_encounters.json',
        trainers: 'data/trainers.json',
        items: 'data/items.json',
        moves: 'data/moves.json',
        scripts: 'data/scripts.json',
        shops: 'data/shops.json'
      },
      assetFiles: {
        tilesets: 'assets/tilesets.json',
        palettes: 'assets/palettes.json'
      }
    };

    // Extract default mock shops if none present
    const shopsData: Record<string, ShopInventory> = {
      SHOP_OLDALE_MART: {
        shopId: 'SHOP_OLDALE_MART',
        name: 'Oldale Town Poké Mart',
        items: ['ITEM_POTION', 'ITEM_ANTIDOTE', 'ITEM_PARALYZE_HEAL', 'ITEM_AWAKENING']
      },
      SHOP_PETALBURG_MART: {
        shopId: 'SHOP_PETALBURG_MART',
        name: 'Petalburg City Poké Mart',
        items: ['ITEM_POKE_BALL', 'ITEM_POTION', 'ITEM_ANTIDOTE', 'ITEM_PARALYZE_HEAL', 'ITEM_ESCAPE_ROPE']
      }
    };

    return {
      manifest,
      data: {
        'maps.json': mapsData,
        'events.json': eventsData,
        'species.json': project.species,
        'wild_encounters.json': project.wildEncounters,
        'trainers.json': project.trainers,
        'items.json': project.items,
        'moves.json': project.moves,
        'scripts.json': project.scripts,
        'shops.json': shopsData
      },
      assets: {
        'tilesets.json': [
          { tilesetId: 'tileset_general', metatilesCount: 256 },
          { tilesetId: 'tileset_littleroot', metatilesCount: 128 },
          { tilesetId: 'tileset_petalburg', metatilesCount: 192 }
        ],
        'palettes.json': [
          { name: 'palette_outdoor_day', colors: ['#000000', '#206020', '#40A040', '#80E080', '#D08030', '#F8E8A0', '#4080D0', '#FFFFFF'] },
          { name: 'palette_building_roofs', colors: ['#000000', '#B02020', '#E04040', '#F88080', '#606060', '#A0A0A0', '#E0E0E0', '#FFFFFF'] }
        ]
      }
    };
  }

  /**
   * Reconstitutes a DecompiledProject from directory files.
   */
  static deserializeFromDirectory(
    manifest: ProjectManifest,
    data: {
      maps?: Record<string, { layout: MapLayout; events: MapEvents }>;
      events?: Record<string, MapEvents>;
      species?: Record<string, PokemonSpecies>;
      wildEncounters?: Record<string, WildEncounterTable>;
      trainers?: Record<string, Trainer>;
      items?: Record<string, Item>;
      moves?: Record<string, Move>;
      scripts?: Record<string, EventScript>;
    }
  ): DecompiledProject {
    const maps: Record<string, { layout: MapLayout; events: MapEvents }> = data.maps || {};

    // Reattach separated events if needed
    if (data.events) {
      for (const [mapId, events] of Object.entries(data.events)) {
        if (maps[mapId]) {
          maps[mapId].events = events;
        }
      }
    }

    return {
      game: manifest.game || 'emerald',
      projectName: manifest.projectName,
      version: manifest.version || '1.0.0',
      maps,
      wildEncounters: data.wildEncounters || {},
      species: data.species || {},
      items: data.items || {},
      moves: data.moves || {},
      trainers: data.trainers || {},
      scripts: data.scripts || {}
    };
  }

  /**
   * Fetches all projects available on the server.
   */
  static async fetchProjectsList(): Promise<ProjectSummary[]> {
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.projects || [];
    } catch {
      return [];
    }
  }

  /**
   * Loads a full project from the server directory.
   */
  static async loadProject(projectName: string): Promise<{
    project: DecompiledProject;
    manifest: ProjectManifest;
    hasBaseRom: boolean;
  }> {
    const res = await fetch(`/api/project/${encodeURIComponent(projectName)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to load project "${projectName}"`);
    }
    const data = await res.json();
    return {
      project: data.project,
      manifest: data.manifest,
      hasBaseRom: !!data.hasBaseRom
    };
  }

  /**
   * Saves the current project state to its directory on the server.
   */
  static async saveProject(project: DecompiledProject): Promise<{ success: boolean; path: string }> {
    const serialized = ProjectManager.serializeToDirectory(project);
    const res = await fetch(`/api/project/${encodeURIComponent(project.projectName)}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project,
        manifest: serialized.manifest,
        data: serialized.data,
        assets: serialized.assets
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save project');
    }
    return await res.json();
  }

  /**
   * Creates a new project directory under projects/<projectName>/ from an uploaded ROM or starter.
   */
  static async createProjectFromRom(
    projectName: string,
    game: GameEngine,
    project: DecompiledProject,
    romBuffer?: ArrayBuffer
  ): Promise<{ success: boolean; projectName: string; path: string }> {
    let baseRomBase64: string | undefined;
    let baseRomInfo: { size: number; checksum: string } | undefined;

    if (romBuffer) {
      const u8 = new Uint8Array(romBuffer);
      baseRomInfo = {
        size: u8.byteLength,
        checksum: `0x${u8[0xBD]?.toString(16).toUpperCase() || '00'}`
      };
      
      // Convert buffer to base64 for reliable transmission
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < u8.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, Array.from(u8.subarray(i, i + chunkSize)));
      }
      baseRomBase64 = btoa(binary);
    }

    const serialized = ProjectManager.serializeToDirectory(project, baseRomInfo);

    const res = await fetch('/api/project/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectName,
        game,
        project,
        manifest: serialized.manifest,
        data: serialized.data,
        assets: serialized.assets,
        baseRomBase64
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create project directory');
    }

    return await res.json();
  }

  /**
   * Fetches the base ROM binary for the project from the server.
   */
  static async fetchBaseRom(projectName: string): Promise<Uint8Array | null> {
    try {
      const res = await fetch(`/api/project/${encodeURIComponent(projectName)}/base-rom`);
      if (!res.ok) return null;
      const buffer = await res.arrayBuffer();
      return new Uint8Array(buffer);
    } catch {
      return null;
    }
  }

  /**
   * Fetches the list of files in projects/<projectName>/.
   */
  static async fetchFilesList(projectName: string): Promise<ProjectFileInfo[]> {
    try {
      const res = await fetch(`/api/project/${encodeURIComponent(projectName)}/files`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.files || [];
    } catch {
      return [];
    }
  }
}
