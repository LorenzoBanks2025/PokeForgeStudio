/**
 * @file types.ts
 * @package pokeview
 * @description Types for the PokéForge Studio web editor application.
 */

export type StudioView = 
  | 'map_editor'
  | 'event_editor'
  | 'wild_encounters'
  | 'pokemon_dex'
  | 'trainers'
  | 'evolutions'
  | 'shops'
  | 'dialog_trainers'
  | 'battle_scripts'
  | 'integrity_dashboard';

export type MapTool = 'brush' | 'fill' | 'erase' | 'select' | 'collision_paint';

export interface EditorState {
  activeView: StudioView;
  activeMapId: string;
  selectedMetatile: number;
  selectedTool: MapTool;
  selectedCollision: string;
  zoomLevel: number;
  showGrid: boolean;
  showCollisions: boolean;
  showEvents: boolean;
  selectedEventId: string | null;
  selectedSpeciesId: string | null;
}
