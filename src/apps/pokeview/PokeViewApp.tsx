/**
 * @file PokeViewApp.tsx
 * @package pokeview
 * @description Main GUI application with mandatory ROM decompilation gate, project workspace archive management, and asset manager.
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
import { RomDecompileGate } from './components/RomDecompileGate.tsx';
import { AssetManagerModal } from './components/AssetManager/AssetManagerModal.tsx';

export const PokeViewApp: React.FC = () => {
  // If null, enforces mandatory decompilation ROM gate
  const [project, setProject] = useState<DecompiledProject | null>(null);
  
  // Navigation & Tool State
  const [activeView, setActiveView] = useState<StudioView>('map_editor');
  const [activeMapId, setActiveMapId] = useState<string>('');
  const [selectedMetatile, setSelectedMetatile] = useState<number>(1);
  const [selectedTool, setSelectedTool] = useState<MapTool>('brush');
  const [selectedCollision, setSelectedCollision] = useState<MovementPermission>('passable');
  
  // Modals
  const [isCompilerOpen, setIsCompilerOpen] = useState<boolean>(false);
  const [isAssetManagerOpen, setIsAssetManagerOpen] = useState<boolean>(false);
  const [statusToast, setStatusToast] = useState<string>('');

  const handleProjectDecompiled = (decompiled: DecompiledProject) => {
    setProject(decompiled);
    setActiveMapId(Object.keys(decompiled.maps)[0] ?? '');
  };

  const handleSaveProject = async () => {
    if (!project) return;
    try {
      const res = await fetch('/api/project/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: project.projectName, projectData: project })
      });
      const data = await res.json();
      if (data.success) {
        setStatusToast('Project saved successfully to server projects directory!');
        setTimeout(() => setStatusToast(''), 3000);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      // Fallback local download if server offline
      handleExportProject();
    }
  };

  const handleExportProject = () => {
    if (!project) return;
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.projectName}.pokeforge.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusToast('Exported .pokeforge project archive file.');
    setTimeout(() => setStatusToast(''), 3000);
  };

  if (!project) {
    return <RomDecompileGate onProjectDecompiled={handleProjectDecompiled} />;
  }

  // Active Map Data
  const currentMap = project.maps[activeMapId] ?? Object.values(project.maps)[0];

  // Update map layout blocks
  const handleUpdateBlocks = (newBlocks: MapBlock[]) => {
    setProject(prev => {
      if (!prev) return prev;
      return {
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
      };
    });
  };

  // Update map events
  const handleUpdateEvents = (newEvents: MapEvents) => {
    setProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        maps: {
          ...prev.maps,
          [activeMapId]: {
            ...prev.maps[activeMapId],
            events: newEvents
          }
        }
      };
    });
  };

  // Update script
  const handleUpdateScript = (updatedScript: EventScript) => {
    setProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        scripts: {
          ...prev.scripts,
          [updatedScript.id]: updatedScript
        }
      };
    });
  };

  // Add new map
  const handleAddNewMap = (newMap: { layout: MapLayout; events: MapEvents }) => {
    setProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        maps: {
          ...prev.maps,
          [newMap.layout.id]: newMap
        }
      };
    });
    setActiveMapId(newMap.layout.id);
  };

  // Update wild encounters
  const handleUpdateWildTable = (table: WildEncounterTable) => {
    setProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        wildEncounters: {
          ...prev.wildEncounters,
          [table.mapId]: table
        }
      };
    });
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
    setProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        species: {
          ...prev.species,
          [updated.id]: updated
        }
      };
    });
  };

  const handleCreateSpecies = (newSpecies: PokemonSpecies) => {
    setProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        species: {
          ...prev.species,
          [newSpecies.id]: newSpecies
        }
      };
    });
  };

  // Moves & Trainers
  const handleUpdateMove = (updated: Move) => {
    setProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        moves: {
          ...prev.moves,
          [updated.id]: updated
        }
      };
    });
  };

  const handleUpdateTrainer = (updated: Trainer) => {
    setProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        trainers: {
          ...prev.trainers,
          [updated.id]: updated
        }
      };
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <TopNavbar
        activeView={activeView}
        onSelectView={setActiveView}
        project={project}
        onSwitchGame={game => {
          const starter = PokeDecompiler.getStarterProject(game);
          setProject(starter);
          setActiveMapId(Object.keys(starter.maps)[0] ?? '');
        }}
        onImportRom={file => {
          const reader = new FileReader();
          reader.onload = () => {
            const buffer = reader.result as ArrayBuffer;
            const { project: decompiled } = PokeDecompiler.decompileRom(buffer);
            setProject(decompiled);
            setActiveMapId(Object.keys(decompiled.maps)[0] ?? '');
          };
          reader.readAsArrayBuffer(file);
        }}
        onOpenCompiler={() => setIsCompilerOpen(true)}
        onOpenAssetManager={() => setIsAssetManagerOpen(true)}
        onSaveProject={handleSaveProject}
        onExportProject={handleExportProject}
      />

      {statusToast && (
        <div className="fixed top-16 right-6 z-50 bg-emerald-950 border border-emerald-600 rounded-xl px-4 py-3 shadow-2xl text-xs text-emerald-300 font-medium animate-fade-in">
          {statusToast}
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

      {/* Asset Manager Modal */}
      <AssetManagerModal
        project={project}
        isOpen={isAssetManagerOpen}
        onClose={() => setIsAssetManagerOpen(false)}
        onUpdateProject={setProject}
      />
    </div>
  );
};
