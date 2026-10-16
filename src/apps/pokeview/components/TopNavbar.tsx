/**
 * @file TopNavbar.tsx
 * @package pokeview
 * @description Header following the Top Bar Contract with professional game editor navigation.
 */

import React, { useRef } from 'react';
import { StudioView } from '../types.ts';
import { DecompiledProject, GameEngine } from '@/src/packages/pokedcomp/types.ts';
import { Play, Upload, FolderOpen, Save, Layers, FileCode, Undo2, Redo2, ShieldCheck, Camera, FolderTree, ArrowLeftRight, Disc } from 'lucide-react';

interface TopNavbarProps {
  activeView: StudioView;
  onSelectView: (view: StudioView) => void;
  project: DecompiledProject;
  onSwitchGame: (game: GameEngine) => void;
  onImportRom: (file: File) => void;
  onOpenCompiler: () => void;
  onOpenAssetManager: () => void;
  onOpenHexInspector: () => void;
  onSaveProject: () => void;
  onExportProject: () => void;
  onOpenProjectFiles?: () => void;
  onSwitchProject?: () => void;
  hasBaseRom?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onCreateSnapshot?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeView,
  onSelectView,
  project,
  onSwitchGame,
  onImportRom,
  onOpenCompiler,
  onOpenAssetManager,
  onOpenHexInspector,
  onSaveProject,
  onExportProject,
  onOpenProjectFiles,
  onSwitchProject,
  hasBaseRom = true,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onCreateSnapshot
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navLinks: { id: StudioView; label: string }[] = [
    { id: 'map_editor', label: 'Map Canvas' },
    { id: 'event_editor', label: 'Events & NPCs' },
    { id: 'wild_encounters', label: 'Wild Encounters' },
    { id: 'pokemon_dex', label: 'Pokémon Dex' },
    { id: 'trainers', label: 'Trainers' },
    { id: 'evolutions', label: 'Evolutions' },
    { id: 'shops', label: 'Shops' },
    { id: 'battle_scripts', label: 'Scripts' },
    { id: 'integrity_dashboard', label: 'Integrity' },
  ];

  const mapCount = Object.keys(project.maps).length;
  const speciesCount = Object.keys(project.species).length;
  const scriptCount = Object.keys(project.scripts).length;

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      {/* 3-Zone Top Bar Contract */}
      <div className="flex items-center justify-between gap-8 px-6 py-3.5 max-w-[1600px] mx-auto">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-display font-extrabold text-white text-base shadow-sm">
            ◓
          </div>
          <span className="text-lg font-bold tracking-tight text-white font-display whitespace-nowrap">
            PokéForge Professional
          </span>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden xl:flex items-center gap-6 text-sm font-medium overflow-x-auto">
          {navLinks.map(link => {
            const isActive = activeView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onSelectView(link.id)}
                className={`transition-colors whitespace-nowrap cursor-pointer pb-0.5 border-b-2 ${
                  isActive
                    ? 'text-white border-indigo-500 font-semibold'
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* History Undo / Redo */}
          <div className="flex items-center bg-slate-800/80 rounded-lg border border-slate-700 p-0.5 mr-1">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-700/80 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-700/80 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {onCreateSnapshot && (
            <button
              onClick={onCreateSnapshot}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Create Safety Snapshot Checkpoint"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span>Snapshot</span>
            </button>
          )}

          <button
            onClick={onOpenAssetManager}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Asset Manager"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Assets</span>
          </button>

          <button
            onClick={onOpenHexInspector}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Hex Offset Inspector"
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hex</span>
          </button>

          {onOpenProjectFiles && (
            <button
              onClick={onOpenProjectFiles}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Inspect Project Directory Files (manifest.json, data/*, assets/*, base_rom.gba)"
            >
              <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
              <span>Files</span>
            </button>
          )}

          <button
            onClick={onSaveProject}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Save Project to Disk (projects/ directory)"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span>Save</span>
          </button>

          <button
            onClick={onExportProject}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Export Project Archive (.pokeforge.json)"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Export</span>
          </button>

          {onSwitchProject && (
            <button
              onClick={onSwitchProject}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Switch or Open Another Project"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
              <span>Switch</span>
            </button>
          )}

          <button
            onClick={onOpenCompiler}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap ml-1"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Build & Merge ROM</span>
          </button>
        </div>
      </div>

      {/* Metadata Strip */}
      <div className="px-6 py-1.5 bg-slate-950/60 border-t border-slate-850 text-xs text-slate-400 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="font-medium text-slate-300">Directory:</span>
          <span className="text-indigo-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            projects/{project.projectName}/
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="font-medium text-slate-300">Engine:</span>
          <span className="text-indigo-300 font-mono">
            {project.game === 'emerald' ? 'pokeemerald (BPEE)' : 'pokefirered (BPRE)'}
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Maps: <strong className="text-slate-300 font-mono">{mapCount}</strong></span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Species: <strong className="text-slate-300 font-mono">{speciesCount}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
            <Disc className="w-3 h-3 text-emerald-400" />
            <span>{hasBaseRom ? 'base_rom.gba linked (16MB)' : 'Starter base ROM container'}</span>
          </span>
        </div>
      </div>
    </header>
  );
};
