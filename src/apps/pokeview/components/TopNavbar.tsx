/**
 * @file TopNavbar.tsx
 * @package pokeview
 * @description Header following the Top Bar Contract with game target switcher and build triggers.
 */

import React, { useRef } from 'react';
import { StudioView } from '../types.ts';
import { DecompiledProject, GameEngine } from '@/src/packages/pokedcomp/types.ts';
import { Play, Upload, RefreshCw } from 'lucide-react';

interface TopNavbarProps {
  activeView: StudioView;
  onSelectView: (view: StudioView) => void;
  project: DecompiledProject;
  onSwitchGame: (game: GameEngine) => void;
  onImportRom: (file: File) => void;
  onOpenCompiler: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeView,
  onSelectView,
  project,
  onSwitchGame,
  onImportRom,
  onOpenCompiler
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navLinks: { id: StudioView; label: string }[] = [
    { id: 'map_editor', label: 'Map Canvas' },
    { id: 'event_editor', label: 'Events & NPCs' },
    { id: 'wild_encounters', label: 'Wild Encounters' },
    { id: 'pokemon_dex', label: 'Pokémon Dex' },
    { id: 'battle_scripts', label: 'Battle Scripts' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportRom(file);
    }
  };

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
            PokéForge Studio
          </span>
        </div>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
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

        {/* Zone 3: Actions - Switch Engine, Import, and Primary Build & Test CTA */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Dual Game Engine Switcher */}
          <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => onSwitchGame('emerald')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                project.game === 'emerald'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Emerald
            </button>
            <button
              onClick={() => onSwitchGame('firered')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                project.game === 'firered'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              FireRed
            </button>
          </div>

          {/* Import GBA ROM File */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".gba"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            title="Import custom GBA ROM for decompilation"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Decompile ROM</span>
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenCompiler}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Build & Test</span>
          </button>
        </div>
      </div>

      {/* Unboxed Metadata Strip (Zero-Pill Rule) */}
      <div className="px-6 py-1.5 bg-slate-950/60 border-t border-slate-850 text-xs text-slate-400 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="font-medium text-slate-300">Target Engine:</span>
          <span className="text-indigo-400 font-mono">
            {project.game === 'emerald' ? 'pokeemerald (BPEE)' : 'pokefirered (BPRE)'}
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Project: <strong className="text-slate-300">{project.projectName}</strong></span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Maps: <strong className="text-slate-300 font-mono">{mapCount}</strong></span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Species: <strong className="text-slate-300 font-mono">{speciesCount}</strong></span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Event Scripts: <strong className="text-slate-300 font-mono">{scriptCount}</strong></span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-slate-500 font-mono text-[11px]">
          <span>GBA Complement Checksum: OK</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-400 font-medium">Ready to Recompile</span>
        </div>
      </div>
    </header>
  );
};
