/**
 * @file types.ts
 * @package pokedcomp
 * @description Core types and data contracts for GBA Pokémon ROM decompilation.
 */

export type GameEngine = 'emerald' | 'firered';

export interface RomHeader {
  gameTitle: string; // e.g. "POKEMON EMER", "POKEMON FIRE"
  gameCode: string;  // e.g. "BPEE", "BPRE"
  makerCode: string; // e.g. "01" (Nintendo)
  version: number;
  complementChecksum: number;
  calculatedChecksum: number;
  isValid: boolean;
}

export type MovementPermission = 
  | 'passable'
  | 'impassable'
  | 'water'
  | 'fast_surf'
  | 'jump_down'
  | 'jump_up'
  | 'jump_left'
  | 'jump_right'
  | 'warp'
  | 'tall_grass';

export interface MapBlock {
  metatileId: number;
  permission: MovementPermission;
  elevation: number;
}

export interface MapLayout {
  id: string;
  name: string;
  width: number;
  height: number;
  tilesetId: string;
  music: string;
  weather?: string;
  mapType?: string;
  battleScene?: string;
  blocks: MapBlock[];
  borderBlocks?: number[];
}

export type NpcMovementType = 
  | 'face_down' 
  | 'face_up' 
  | 'face_left' 
  | 'face_right' 
  | 'wander_around' 
  | 'walk_left_right' 
  | 'walk_up_down' 
  | 'look_around';

export interface NpcEvent {
  id: string;
  localId: number;
  x: number;
  y: number;
  spriteId: string;
  movementType: NpcMovementType;
  movementRangeX: number;
  movementRangeY: number;
  trainerType: 'none' | 'normal' | 'boss';
  sightRadius: number;
  scriptId: string;
  flagId?: string;
}

export interface WarpEvent {
  id: string;
  x: number;
  y: number;
  elevation: number;
  targetMapId: string;
  targetWarpId: number;
}

export interface TriggerEvent {
  id: string;
  x: number;
  y: number;
  elevation: number;
  variable: string;
  varValue: number;
  scriptId: string;
}

export interface SignpostEvent {
  id: string;
  x: number;
  y: number;
  elevation: number;
  type: 'script' | 'item' | 'hidden';
  scriptId: string;
}

export interface MapEvents {
  npcs: NpcEvent[];
  warps: WarpEvent[];
  triggers: TriggerEvent[];
  signs: SignpostEvent[];
}

export interface WildEncounterSlot {
  slotIndex: number;
  ratePercent: number; // e.g. 20 for 20%
  species: string;
  minLevel: number;
  maxLevel: number;
}

export interface WildEncounterTable {
  mapId: string;
  encounterRate: number; // 0 - 255
  land: WildEncounterSlot[];     // Standard 12 slots in Gen III
  water: WildEncounterSlot[];    // Standard 5 slots
  rockSmash: WildEncounterSlot[]; // Standard 5 slots
  fishing: {
    oldRod: WildEncounterSlot[];   // 2 slots
    goodRod: WildEncounterSlot[];  // 3 slots
    superRod: WildEncounterSlot[]; // 5 slots
  };
}

export type PokemonType = 
  | 'NORMAL' | 'FIRE' | 'WATER' | 'GRASS' | 'ELECTRIC' | 'ICE'
  | 'FIGHTING' | 'POISON' | 'GROUND' | 'FLYING' | 'PSYCHIC' | 'BUG'
  | 'ROCK' | 'GHOST' | 'DRAGON' | 'STEEL' | 'DARK';

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  spAttack: number;
  spDefense: number;
}

export interface LearnsetMove {
  level: number;
  move: string;
}

export interface Evolution {
  method: 'level' | 'item' | 'trade' | 'friendship';
  targetSpecies: string;
  parameter?: string | number;
}

export interface PokemonSpecies {
  id: string;
  dexNumber: number;
  name: string;
  types: [PokemonType, PokemonType | null];
  baseStats: BaseStats;
  abilities: [string, string | null];
  catchRate: number;
  baseExpYield: number;
  genderRatio: number; // 0 = 100% male, 254 = 100% female, 255 = genderless
  eggGroups: [string, string | null];
  learnset: LearnsetMove[];
  evolutions: Evolution[];
  spriteColor: string; // fallback color swatch for pixel preview
  iconType: string;
}

export interface Item {
  id: string;
  name: string;
  pocket: 'items' | 'key_items' | 'poke_balls' | 'tms_hms' | 'berries';
  price: number;
  description: string;
  battleUsage: boolean;
  fieldUsage: boolean;
}

export interface Move {
  id: string;
  name: string;
  type: PokemonType;
  category: 'physical' | 'special' | 'status';
  power: number;
  accuracy: number;
  pp: number;
  priority: number;
  description: string;
  animationFrames: string[];
}

export interface TrainerPartyMember {
  species: string;
  level: number;
  heldItem?: string;
  moves?: string[];
  ivs?: number;
}

export interface Trainer {
  id: string;
  trainerClass: string;
  name: string;
  spriteId: string;
  introText: string;
  defeatText: string;
  party: TrainerPartyMember[];
}

export interface EventScript {
  id: string;
  name: string;
  code: string;
  parsedCommands: {
    command: string;
    args: string[];
  }[];
}

export interface DecompiledProject {
  game: GameEngine;
  projectName: string;
  version: string;
  maps: Record<string, { layout: MapLayout; events: MapEvents }>;
  wildEncounters: Record<string, WildEncounterTable>;
  species: Record<string, PokemonSpecies>;
  items: Record<string, Item>;
  moves: Record<string, Move>;
  trainers: Record<string, Trainer>;
  scripts: Record<string, EventScript>;
  tilesets: Record<string, Uint8Array>;
}

export interface MapConnection {
  direction: 'up' | 'down' | 'left' | 'right';
  offset: number;
  mapId: string;
}

export interface MapHeaderInfo {
  music: string;
  weather: 'WEATHER_NONE' | 'WEATHER_SUNNY' | 'WEATHER_RAIN' | 'WEATHER_SNOW' | 'WEATHER_FOG';
  mapType: 'MAP_TYPE_TOWN' | 'MAP_TYPE_ROUTE' | 'MAP_TYPE_INDOOR' | 'MAP_TYPE_UNDERGROUND';
  allowBicycle: boolean;
  allowEscapeRope: boolean;
  allowRunning: boolean;
  connections?: MapConnection[];
}

export interface ShopInventory {
  shopId: string;
  name: string;
  items: string[]; // Item IDs
}
