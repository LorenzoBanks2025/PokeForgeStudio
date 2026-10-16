/**
 * @file SidebarNav.tsx
 * @package pokeview
 * @description Workspace sidebar with maps hierarchy tree, new map creator, and mode switches.
 */

import React, { useState } from 'react';
import { StudioView } from '../types.ts';
import { DecompiledProject, MapLayout, MapEvents, MapBlock } from '@/src/packages/pokedcomp/types.ts';
import { Map, Plus, MapPin, Sparkles, ChevronRight, Compass } from 'lucide-react';

interface SidebarNavProps {
  project: DecompiledProject;
  activeMapId: string;
  onSelectMap: (mapId: string) => void;
  activeView: StudioView;
  onSelectView: (view: StudioView) => void;
  onAddNewMap: (newMap: { layout: MapLayout; events: MapEvents }) => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  project,
  activeMapId,
  onSelectMap,
  activeView,
  onSelectView,
  onAddNewMap
}) => {
  const [isAddingMap, setIsAddingMap] = useState<boolean>(false);
  const [newMapName, setNewMapName] = useState<string>('');
  const [newMapWidth, setNewMapWidth] = useState<number>(20);
  const [newMapHeight, setNewMapHeight] = useState<number>(20);

  const mapsList = Object.entries(project.maps);

  const handleCreateMapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMapName.trim()) return;

    const id = `MAP_${newMapName.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
    const blocks: MapBlock[] = [];
    for (let y = 0; y < newMapHeight; y++) {
      for (let x = 0; x < newMapWidth; x++) {
        if (x === 0 || y === 0 || x === newMapWidth - 1 || y === newMapHeight - 1) {
          blocks.push({ metatileId: 10, permission: 'impassable', elevation: 3 });
        } else {
          blocks.push({ metatileId: 1, permission: 'passable', elevation: 0 });
        }
      }
    }

    const layout: MapLayout = {
      id,
      name: newMapName.trim(),
      width: newMapWidth,
      height: newMapHeight,
      tilesetId: project.game === 'emerald' ? 'gTileset_General' : 'gTileset_PalletTown',
      music: 'MUS_ROUTE1',
      blocks
    };

    const events: MapEvents = {
      npcs: [],
      warps: [],
      triggers: [],
      signs: []
    };

    onAddNewMap({ layout, events });
    setIsAddingMap(false);
    setNewMapName('');
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden shrink-0">
      {/* Map Explorer Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Map className="w-3.5 h-3.5 text-indigo-400" />
          <span>World Maps</span>
        </div>
        <button
          onClick={() => setIsAddingMap(!isAddingMap)}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
          title="Create New Map"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* New Map Inline Dialog */}
      {isAddingMap && (
        <form onSubmit={handleCreateMapSubmit} className="p-3 bg-slate-950 border-b border-slate-800 space-y-2 text-xs">
          <div>
            <label className="text-[11px] text-slate-400 block mb-0.5">Map Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Petalburg Woods"
              value={newMapName}
              onChange={e => setNewMapName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 block">Width</label>
              <input
                type="number"
                min={10}
                max={60}
                value={newMapWidth}
                onChange={e => setNewMapWidth(parseInt(e.target.value) || 20)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 block">Height</label>
              <input
                type="number"
                min={10}
                max={60}
                value={newMapHeight}
                onChange={e => setNewMapHeight(parseInt(e.target.value) || 20)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingMap(false)}
              className="px-2 py-1 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium cursor-pointer"
            >
              Create
            </button>
          </div>
        </form>
      )}

      {/* Map Hierarchy List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {mapsList.map(([id, mapData]) => {
          const isSelected = id === activeMapId;
          const totalEvents = mapData.events.npcs.length + mapData.events.warps.length + mapData.events.signs.length;
          return (
            <button
              key={id}
              onClick={() => onSelectMap(id)}
              className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/50'
                  : 'bg-slate-950/60 border-slate-850 hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {mapData.layout.name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {mapData.layout.width}×{mapData.layout.height} · {totalEvents} Events
                </div>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-600'}`} />
            </button>
          );
        })}
      </div>

      {/* Bottom Mode Switcher Shortcuts */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-1 text-xs">
        <button
          onClick={() => onSelectView('wild_encounters')}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ${
            activeView === 'wild_encounters'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Wild Encounters</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {Object.keys(project.wildEncounters).length} Tables
          </span>
        </button>

        <button
          onClick={() => onSelectView('pokemon_dex')}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ${
            activeView === 'pokemon_dex'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>Pokédex Registry</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {Object.keys(project.species).length}
          </span>
        </button>
      </div>
    </aside>
  );
};
