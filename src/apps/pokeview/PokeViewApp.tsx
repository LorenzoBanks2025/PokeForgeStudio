/**
 * @file PokeViewApp.tsx
 * @package pokeview
 * @description Main GUI application integrating pokedcomp decompilation and pokecompiler build system.
 */

import React, { useState } from 'react';
import { StudioView, MapTool } from './types.ts';
import { DecompiledProject, GameEngine, MapLayout, MapEvents, MapBlock, MovementPermission, EventScript, PokemonSpecies, WildEncounterTable, Move, Trainer } from '@/src/packages/pokedcomp/types.ts';
import { PokeDecompiler } from '@/src/packages/pokedcomp/decompiler.ts';
import { TopNavbar } from './components/TopNavbar.tsx';
import { SidebarNav } from './components/SidebarNav.tsx';
import { TilePalette } from './components/MapEditor/TilePalette.tsx';
import { MapCanvas } from './components/MapEditor/MapCanvas.tsx';
import { EventEditorView } from './components/EventEditor/EventEditorView.tsx';
import { WildEncounterView } from './components/WildEncounterEditor/WildEncounterView.tsx';
import { PokemonDexView } from './components/PokemonEditor/PokemonDexView.tsx';
import { BattleScriptsView } from './components/BattleScriptEditor/BattleScriptsView.tsx';
import { CompilerModal } from './components/CompilerModal/CompilerModal.tsx';

export const PokeViewApp: React.FC = () => {
  // Core project state (initialized to pre-decompiled Emerald Littleroot Town)
  const [project, setProject] = useState<DecompiledProject>(() => PokeDecompiler.getStarterProject('emerald'));
  
  // Navigation & Tool State
  const [activeView, setActiveView] = useState<StudioView>('map_editor');
  const [activeMapId, setActiveMapId] = useState<string>(() => Object.keys(project.maps)[0]);
  const [selectedMetatile, setSelectedMetatile] = useState<number>(1);
  const [selectedTool, setSelectedTool] = useState<MapTool>('brush');
  const [selectedCollision, setSelectedCollision] = useState<MovementPermission>('passable');
  
  // Compiler Modal State
  const [isCompilerOpen, setIsCompilerOpen] = useState<boolean>(false);
  const [decompLogs, setDecompLogs] = useState<string[]>([]);
  const [showDecompNotification, setShowDecompNotification] = useState<boolean>(false);

  // Active Map Data
  const currentMap = project.maps[activeMapId] ?? Object.values(project.maps)[0];

  // Switch Game Engine (Emerald vs FireRed)
  const handleSwitchGame = (game: GameEngine) => {
    const starter = PokeDecompiler.getStarterProject(game);
    setProject(starter);
    setActiveMapId(Object.keys(starter.maps)[0]);
  };

  // Import custom .gba ROM
  const handleImportRom = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const { project: decompiled, logs } = PokeDecompiler.decompileRom(buffer);
      setProject(decompiled);
      setActiveMapId(Object.keys(decompiled.maps)[0]);
      setDecompLogs(logs);
      setShowDecompNotification(true);
      setTimeout(() => setShowDecompNotification(false), 5000);
    } catch (err) {
      alert(`Failed to parse GBA ROM: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Update map layout blocks
  const handleUpdateBlocks = (newBlocks: MapBlock[]) => {
    setProject(prev => ({
      ...prev,
      maps: {
        ...prev.maps,
        [activeMapId]: {
          ...prev.maps[activeMapId],
          layout: {
            ...prev.maps[activeMapId].layout,
            blocks: newBlocks
          }
        }
      }
    }));
  };

  // Update map events
  const handleUpdateEvents = (newEvents: MapEvents) => {
    setProject(prev => ({
      ...prev,
      maps: {
        ...prev.maps,
        [activeMapId]: {
          ...prev.maps[activeMapId],
          events: newEvents
        }
      }
    }));
  };

  // Update script
  const handleUpdateScript = (updatedScript: EventScript) => {
    setProject(prev => ({
      ...prev,
      scripts: {
        ...prev.scripts,
        [updatedScript.id]: updatedScript
      }
    }));
  };

  // Add new map
  const handleAddNewMap = (newMap: { layout: MapLayout; events: MapEvents }) => {
    setProject(prev => ({
      ...prev,
      maps: {
        ...prev.maps,
        [newMap.layout.id]: newMap
      }
    }));
    setActiveMapId(newMap.layout.id);
  };

  // Update wild encounters
  const handleUpdateWildTable = (table: WildEncounterTable) => {
    setProject(prev => ({
      ...prev,
      wildEncounters: {
        ...prev.wildEncounters,
        [table.mapId]: table
      }
    }));
  };

  const handleCreateWildTable = (mapId: string) => {
    const newTable: WildEncounterTable = {
      mapId,
      encounterRate: 20,
      land: [
        { slotIndex: 0, ratePercent: 20, species: 'SPECIES_POOCHYENA', minLevel: 2, maxLevel: 4 },
        { slotIndex: 1, ratePercent: 20, species: 'SPECIES_ZIGZAGOON', minLevel: 2, maxLevel: 4 },
        { slotIndex: 2, ratePercent: 10, species: 'SPECIES_WURMPLE', minLevel: 2, maxLevel: 3 },
        { slotIndex: 3, ratePercent: 10, species: 'SPECIES_POOCHYENA', minLevel: 3, maxLevel: 4 },
        { slotIndex: 4, ratePercent: 10, species: 'SPECIES_ZIGZAGOON', minLevel: 3, maxLevel: 4 },
        { slotIndex: 5, ratePercent: 10, species: 'SPECIES_WURMPLE', minLevel: 3, maxLevel: 4 },
        { slotIndex: 6, ratePercent: 5, species: 'SPECIES_TORCHIC', minLevel: 5, maxLevel: 5 },
        { slotIndex: 7, ratePercent: 5, species: 'SPECIES_TREECKO', minLevel: 5, maxLevel: 5 },
        { slotIndex: 8, ratePercent: 4, species: 'SPECIES_MUDKIP', minLevel: 5, maxLevel: 5 },
        { slotIndex: 9, ratePercent: 4, species: 'SPECIES_RAYQUAZA', minLevel: 70, maxLevel: 70 },
        { slotIndex: 10, ratePercent: 1, species: 'SPECIES_BULBASAUR', minLevel: 5, maxLevel: 5 },
        { slotIndex: 11, ratePercent: 1, species: 'SPECIES_CHARMANDER', minLevel: 5, maxLevel: 5 }
      ],
      water: [],
      rockSmash: [],
      fishing: { oldRod: [], goodRod: [], superRod: [] }
    };
    handleUpdateWildTable(newTable);
  };

  // Pokémon species updates
  const handleUpdateSpecies = (updated: PokemonSpecies) => {
    setProject(prev => ({
      ...prev,
      species: {
        ...prev.species,
        [updated.id]: updated
      }
    }));
  };

  const handleCreateSpecies = (newSpecies: PokemonSpecies) => {
    setProject(prev => ({
      ...prev,
      species: {
        ...prev.species,
        [newSpecies.id]: newSpecies
      }
    }));
  };

  // Moves & Trainers
  const handleUpdateMove = (updated: Move) => {
    setProject(prev => ({
      ...prev,
      moves: {
        ...prev.moves,
        [updated.id]: updated
      }
    }));
  };

  const handleUpdateTrainer = (updated: Trainer) => {
    setProject(prev => ({
      ...prev,
      trainers: {
        ...prev.trainers,
        [updated.id]: updated
      }
    }));
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <TopNavbar
        activeView={activeView}
        onSelectView={setActiveView}
        project={project}
        onSwitchGame={handleSwitchGame}
        onImportRom={handleImportRom}
        onOpenCompiler={() => setIsCompilerOpen(true)}
      />

      {/* ROM Decompilation Notification Toast */}
      {showDecompNotification && (
        <div className="fixed top-16 right-6 z-50 bg-emerald-950 border border-emerald-600 rounded-xl p-4 shadow-2xl max-w-md animate-fade-in">
          <div className="flex items-center justify-between font-bold text-xs text-emerald-300 font-display mb-1">
            <span>✓ ROM Decompiled Successfully</span>
            <button
              onClick={() => setShowDecompNotification(false)}
              className="text-emerald-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] text-emerald-200/80 mb-2">
            Disassembled maps, wild encounter tables, Pokémon stats, and event scripts into PokéForge project model.
          </p>
          <div className="text-[10px] font-mono text-emerald-400/90 max-h-24 overflow-y-auto space-y-0.5 bg-slate-950/60 p-2 rounded">
            {decompLogs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>
      )}

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* World Maps Hierarchy Sidebar (shown in map & event editors) */}
        {(activeView === 'map_editor' || activeView === 'event_editor' || activeView === 'wild_encounters') && (
          <SidebarNav
            project={project}
            activeMapId={activeMapId}
            onSelectMap={setActiveMapId}
            activeView={activeView}
            onSelectView={setActiveView}
            onAddNewMap={handleAddNewMap}
          />
        )}

        {/* View Switcher Container */}
        {activeView === 'map_editor' && currentMap && (
          <div className="flex-1 flex overflow-hidden">
            <TilePalette
              selectedMetatile={selectedMetatile}
              onSelectMetatile={setSelectedMetatile}
              selectedTool={selectedTool}
              onSelectTool={setSelectedTool}
              selectedCollision={selectedCollision}
              onSelectCollision={setSelectedCollision}
            />
            <MapCanvas
              mapLayout={currentMap.layout}
              mapEvents={currentMap.events}
              selectedMetatile={selectedMetatile}
              selectedTool={selectedTool}
              selectedCollision={selectedCollision}
              onUpdateBlocks={handleUpdateBlocks}
              onSelectEvent={() => setActiveView('event_editor')}
            />
          </div>
        )}

        {activeView === 'event_editor' && currentMap && (
          <EventEditorView
            mapId={currentMap.layout.id}
            mapName={currentMap.layout.name}
            mapEvents={currentMap.events}
            scripts={project.scripts}
            onUpdateEvents={handleUpdateEvents}
            onUpdateScript={handleUpdateScript}
          />
        )}

        {activeView === 'wild_encounters' && currentMap && (
          <WildEncounterView
            mapId={currentMap.layout.id}
            mapName={currentMap.layout.name}
            encounterTable={project.wildEncounters[currentMap.layout.id]}
            availableSpecies={project.species}
            onUpdateTable={handleUpdateWildTable}
            onCreateTable={handleCreateWildTable}
          />
        )}

        {activeView === 'pokemon_dex' && (
          <PokemonDexView
            speciesRecord={project.species}
            availableMoves={project.moves}
            onUpdateSpecies={handleUpdateSpecies}
            onCreateSpecies={handleCreateSpecies}
          />
        )}

        {activeView === 'battle_scripts' && (
          <BattleScriptsView
            moves={project.moves}
            trainers={project.trainers}
            onUpdateMove={handleUpdateMove}
            onUpdateTrainer={handleUpdateTrainer}
          />
        )}
      </div>

      {/* Compiler & Playable Emulator Modal */}
      <CompilerModal
        project={project}
        isOpen={isCompilerOpen}
        onClose={() => setIsCompilerOpen(false)}
      />
    </div>
  );
};
