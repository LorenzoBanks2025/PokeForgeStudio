/**
 * @file PokeViewApp.tsx
 * @package pokeview
 * @description Main GUI application integrating professional ROM hacking tools, trainers, evolutions, shops, and hex inspector.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StudioView, MapTool } from './types.ts';
import { DecompiledProject, GameEngine, MapLayout, MapEvents, MapBlock, MovementPermission, EventScript, PokemonSpecies, WildEncounterTable, Move, Trainer, Item } from '@/src/packages/pokedcomp/types.ts';
import { PokeDecompiler } from '@/src/packages/pokedcomp/decompiler.ts';
import { TopNavbar } from './components/TopNavbar.tsx';
import { SidebarNav } from './components/SidebarNav.tsx';
import { TilePalette } from './components/MapEditor/TilePalette.tsx';
import { MapCanvas } from './components/MapEditor/MapCanvas.tsx';
import { MapHeaderModal } from './components/MapEditor/MapHeaderModal.tsx';
import { EventEditorView } from './components/EventEditor/EventEditorView.tsx';
import { WildEncounterView } from './components/WildEncounterEditor/WildEncounterView.tsx';
import { PokemonDexView } from './components/PokemonEditor/PokemonDexView.tsx';
import { TrainerEditorView } from './components/Trainers/TrainerEditorView.tsx';
import { EvolutionEditor } from './components/PokemonEditor/EvolutionEditor.tsx';
import { ShopEditorView } from './components/Items/ShopEditorView.tsx';
import { HexInspectorModal } from './components/HexViewer/HexInspectorModal.tsx';
import { BattleScriptsView } from './components/BattleScriptEditor/BattleScriptsView.tsx';
import { CompilerModal } from './components/CompilerModal/CompilerModal.tsx';
import { RomDecompileGate } from './components/RomDecompileGate.tsx';
import { AssetManagerModal } from './components/AssetManager/AssetManagerModal.tsx';
import { IntegrityDashboardWidget } from './components/Dashboard/IntegrityDashboardWidget.tsx';
import { ProjectFilesModal } from './components/ProjectFilesModal/ProjectFilesModal.tsx';
import { ProjectManager, ProjectManifest } from '@/src/services/projectManager.ts';

export const PokeViewApp: React.FC = () => {
  const [project, setProject] = useState<DecompiledProject | null>(null);
  const [projectManifest, setProjectManifest] = useState<ProjectManifest | null>(null);
  const [hasBaseRom, setHasBaseRom] = useState<boolean>(true);
  
  // History Stacks for Undo / Redo
  const [historyStack, setHistoryStack] = useState<DecompiledProject[]>([]);
  const [redoStack, setRedoStack] = useState<DecompiledProject[]>([]);
  
  // Navigation & Tool State
  const [activeView, setActiveView] = useState<StudioView>('map_editor');
  const [activeMapId, setActiveMapId] = useState<string>('');
  const [selectedMetatile, setSelectedMetatile] = useState<number>(1);
  const [selectedTool, setSelectedTool] = useState<MapTool>('brush');
  const [selectedCollision, setSelectedCollision] = useState<MovementPermission>('passable');
  
  // Modals & Recovery State
  const [isCompilerOpen, setIsCompilerOpen] = useState<boolean>(false);
  const [isProjectFilesOpen, setIsProjectFilesOpen] = useState<boolean>(false);
  const [isAssetManagerOpen, setIsAssetManagerOpen] = useState<boolean>(false);
  const [isHexOpen, setIsHexOpen] = useState<boolean>(false);
  const [isMapHeaderOpen, setIsMapHeaderOpen] = useState<boolean>(false);
  const [statusToast, setStatusToast] = useState<string>('');
  const [hasRecovery, setHasRecovery] = useState<boolean>(false);

  // Check for auto-saved crash recovery on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pokeforge_autosave_snapshot');
      if (saved) {
        setHasRecovery(true);
      }
    } catch {
      // LocalStorage access restricted
    }
  }, []);

  // Periodic autosave to LocalStorage
  useEffect(() => {
    if (!project) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('pokeforge_autosave_snapshot', JSON.stringify(project));
      } catch {
        // Exceeded quota or disabled
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [project]);

  // Transactional state updater that pushes to undo history
  const updateProjectWithHistory = useCallback((updater: DecompiledProject | ((prev: DecompiledProject) => DecompiledProject)) => {
    setProject(prev => {
      if (!prev) return prev;
      const next = typeof updater === 'function' ? updater(prev) : updater;
      // Push old state to history stack (limit to 30 snapshots)
      setHistoryStack(h => [...h.slice(-29), JSON.parse(JSON.stringify(prev))]);
      // Clear redo stack on new action
      setRedoStack([]);
      return next;
    });
  }, []);

  const handleUndo = useCallback(() => {
    if (historyStack.length === 0 || !project) return;
    const previous = historyStack[historyStack.length - 1];
    setHistoryStack(h => h.slice(0, -1));
    setRedoStack(r => [...r, JSON.parse(JSON.stringify(project))]);
    setProject(previous);
    setStatusToast('Undo action applied');
    setTimeout(() => setStatusToast(''), 2000);
  }, [historyStack, project]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0 || !project) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(r => r.slice(0, -1));
    setHistoryStack(h => [...h, JSON.parse(JSON.stringify(project))]);
    setProject(next);
    setStatusToast('Redo action applied');
    setTimeout(() => setStatusToast(''), 2000);
  }, [redoStack, project]);

  // Global Undo / Redo keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleCreateSnapshot = () => {
    if (!project) return;
    try {
      const timestamp = new Date().toLocaleTimeString();
      const snapshotKey = `pokeforge_manual_snapshot_${Date.now()}`;
      localStorage.setItem(snapshotKey, JSON.stringify(project));
      setStatusToast(`Safety checkpoint snapshot saved (${timestamp})!`);
      setTimeout(() => setStatusToast(''), 3000);
    } catch {
      setStatusToast('Failed to save snapshot to local storage.');
      setTimeout(() => setStatusToast(''), 3000);
    }
  };

  const handleRestoreRecovery = () => {
    try {
      const saved = localStorage.getItem('pokeforge_autosave_snapshot');
      if (saved) {
        const parsed = JSON.parse(saved) as DecompiledProject;
        setProject(parsed);
        setActiveMapId(Object.keys(parsed.maps)[0] ?? '');
        setHasRecovery(false);
        setStatusToast('Session recovered from autosave checkpoint!');
        setTimeout(() => setStatusToast(''), 3500);
      }
    } catch {
      setStatusToast('Unable to parse recovery checkpoint.');
      setTimeout(() => setStatusToast(''), 3000);
    }
  };

  const handleProjectDecompiled = (decompiled: DecompiledProject, manifest?: ProjectManifest, hasRom = true) => {
    setProject(decompiled);
    setProjectManifest(manifest || null);
    setHasBaseRom(hasRom);
    setHistoryStack([]);
    setRedoStack([]);
    setActiveMapId(Object.keys(decompiled.maps)[0] ?? '');
    setStatusToast(`Loaded project "${decompiled.projectName}" from projects/ directory!`);
    setTimeout(() => setStatusToast(''), 3000);
  };

  const handleSaveProject = async () => {
    if (!project) return;
    try {
      const res = await ProjectManager.saveProject(project);
      setStatusToast(`✓ Saved project to "${res.path}" (manifest.json, data/*.json, assets/*.json)`);
      setTimeout(() => setStatusToast(''), 3500);
    } catch (err: any) {
      setStatusToast(`Save notice: ${err.message}. Exporting local fallback...`);
      setTimeout(() => setStatusToast(''), 3000);
      handleExportProject();
    }
  };

  const handleSwitchProject = () => {
    setProject(null);
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

  const currentMap = project.maps[activeMapId] ?? Object.values(project.maps)[0];

  const handleUpdateBlocks = (newBlocks: MapBlock[]) => {
    updateProjectWithHistory(prev => ({
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

  const handleUpdateEvents = (newEvents: MapEvents) => {
    updateProjectWithHistory(prev => ({
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

  const handleUpdateScript = (updatedScript: EventScript) => {
    updateProjectWithHistory(prev => ({
      ...prev,
      scripts: {
        ...prev.scripts,
        [updatedScript.id]: updatedScript
      }
    }));
  };

  const handleAddNewMap = (newMap: { layout: MapLayout; events: MapEvents }) => {
    updateProjectWithHistory(prev => ({
      ...prev,
      maps: {
        ...prev.maps,
        [newMap.layout.id]: newMap
      }
    }));
    setActiveMapId(newMap.layout.id);
  };

  const handleUpdateWildTable = (table: WildEncounterTable) => {
    updateProjectWithHistory(prev => ({
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
        { slotIndex: 2, ratePercent: 10, species: 'SPECIES_WURMPLE', minLevel: 3, maxLevel: 6 }
      ],
      water: [],
      rockSmash: [],
      fishing: { oldRod: [], goodRod: [], superRod: [] }
    };
    handleUpdateWildTable(newTable);
  };

  const handleUpdateSpecies = (updated: PokemonSpecies) => {
    updateProjectWithHistory(prev => ({
      ...prev,
      species: {
        ...prev.species,
        [updated.id]: updated
      }
    }));
  };

  const handleCreateSpecies = (newSpecies: PokemonSpecies) => {
    updateProjectWithHistory(prev => ({
      ...prev,
      species: {
        ...prev.species,
        [newSpecies.id]: newSpecies
      }
    }));
  };

  const handleUpdateMove = (updated: Move) => {
    updateProjectWithHistory(prev => ({
      ...prev,
      moves: {
        ...prev.moves,
        [updated.id]: updated
      }
    }));
  };

  const handleUpdateTrainer = (updated: Trainer) => {
    updateProjectWithHistory(prev => ({
      ...prev,
      trainers: {
        ...prev.trainers,
        [updated.id]: updated
      }
    }));
  };

  const handleCreateTrainer = (newTrainer: Trainer) => {
    updateProjectWithHistory(prev => ({
      ...prev,
      trainers: {
        ...prev.trainers,
        [newTrainer.id]: newTrainer
      }
    }));
  };

  const handleUpdateItem = (updated: Item) => {
    updateProjectWithHistory(prev => ({
      ...prev,
      items: {
        ...prev.items,
        [updated.id]: updated
      }
    }));
  };

  const handleCreateItem = (newItem: Item) => {
    updateProjectWithHistory(prev => ({
      ...prev,
      items: {
        ...prev.items,
        [newItem.id]: newItem
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
        onOpenHexInspector={() => setIsHexOpen(true)}
        onOpenProjectFiles={() => setIsProjectFilesOpen(true)}
        onSwitchProject={handleSwitchProject}
        hasBaseRom={hasBaseRom}
        onSaveProject={handleSaveProject}
        onExportProject={handleExportProject}
        canUndo={historyStack.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onCreateSnapshot={handleCreateSnapshot}
      />

      {hasRecovery && (
        <div className="bg-amber-950/80 border-b border-amber-600/60 px-6 py-2 text-xs text-amber-200 flex items-center justify-between">
          <span>A previous auto-saved session was found. Would you like to restore it?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestoreRecovery}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded cursor-pointer transition-colors"
            >
              Restore Autosave
            </button>
            <button
              onClick={() => {
                setHasRecovery(false);
                try { localStorage.removeItem('pokeforge_autosave_snapshot'); } catch {}
              }}
              className="px-2 py-1 text-slate-400 hover:text-white rounded cursor-pointer transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {statusToast && (
        <div className="fixed top-16 right-6 z-50 bg-emerald-950 border border-emerald-600 rounded-xl px-4 py-3 shadow-2xl text-xs text-emerald-300 font-medium animate-fade-in">
          {statusToast}
        </div>
      )}

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
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

        {/* View Switcher */}
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
              onOpenHeaderModal={() => setIsMapHeaderOpen(true)}
              tilesets={project.tilesets}
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

        {activeView === 'trainers' && (
          <TrainerEditorView
            trainers={project.trainers}
            species={project.species}
            items={project.items}
            moves={project.moves}
            onUpdateTrainer={handleUpdateTrainer}
            onCreateTrainer={handleCreateTrainer}
          />
        )}

        {activeView === 'evolutions' && (
          <EvolutionEditor
            speciesRecord={project.species}
            items={project.items}
            onUpdateSpecies={handleUpdateSpecies}
          />
        )}

        {activeView === 'shops' && (
          <ShopEditorView
            items={project.items}
            onUpdateItem={handleUpdateItem}
            onCreateItem={handleCreateItem}
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

        {activeView === 'integrity_dashboard' && (
          <IntegrityDashboardWidget
            project={project}
            onUpdateProject={updateProjectWithHistory}
          />
        )}
      </div>

      {/* Modals */}
      <CompilerModal
        project={project}
        isOpen={isCompilerOpen}
        onClose={() => setIsCompilerOpen(false)}
        onUpdateProject={updateProjectWithHistory}
      />

      <AssetManagerModal
        project={project}
        isOpen={isAssetManagerOpen}
        onClose={() => setIsAssetManagerOpen(false)}
        onUpdateProject={setProject}
      />

      <HexInspectorModal
        isOpen={isHexOpen}
        onClose={() => setIsHexOpen(false)}
      />

      <ProjectFilesModal
        isOpen={isProjectFilesOpen}
        onClose={() => setIsProjectFilesOpen(false)}
        projectName={project.projectName}
      />

      {isMapHeaderOpen && currentMap && (
        <MapHeaderModal
          isOpen={isMapHeaderOpen}
          layout={currentMap.layout}
          onClose={() => setIsMapHeaderOpen(false)}
          onSave={updated => {
            updateProjectWithHistory(prev => ({
              ...prev,
              maps: {
                ...prev.maps,
                [activeMapId]: {
                  ...prev.maps[activeMapId],
                  layout: {
                    ...prev.maps[activeMapId].layout,
                    ...updated
                  }
                }
              }
            }));
            setStatusToast(`Atmosphere & Header applied for ${currentMap.layout.name}`);
            setTimeout(() => setStatusToast(''), 3000);
          }}
        />
      )}
    </div>
  );
};
