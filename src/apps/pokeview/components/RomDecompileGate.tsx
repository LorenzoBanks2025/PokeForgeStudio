/**
 * @file RomDecompileGate.tsx
 * @package pokeview
 * @description Mandatory GBA ROM upload landing gate with 1-click sample project loaders.
 */

import React, { useState, useRef } from 'react';
import { DecompiledProject, GameEngine } from '@/src/packages/pokedcomp/types.ts';
import { PokeDecompiler } from '@/src/packages/pokedcomp/decompiler.ts';
import { Upload, Sparkles, Terminal, Shield, FolderOpen, Download } from 'lucide-react';

interface RomDecompileGateProps {
  onProjectDecompiled: (project: DecompiledProject) => void;
}

export const RomDecompileGate: React.FC<RomDecompileGateProps> = ({ onProjectDecompiled }) => {
  const [isDecompiling, setIsDecompiling] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDecompiling(true);
    setLogs([`Reading file "${file.name}" (${Math.round(file.size / 1024)} KB)...`]);

    try {
      const buffer = await file.arrayBuffer();
      // Simulate step-by-step terminal logging
      setTimeout(() => {
        setLogs(l => [...l, 'Parsing GBA ROM header and checking Nintendo BIOS logo...']);
      }, 400);

      setTimeout(() => {
        const { project, logs: decompLogs } = PokeDecompiler.decompileRom(buffer);
        setLogs(l => [...l, ...decompLogs]);
        setTimeout(() => {
          setIsDecompiling(false);
          onProjectDecompiled(project);
        }, 800);
      }, 1000);
    } catch (err: any) {
      setLogs(l => [...l, `✗ Decompilation Error: ${err.message}`]);
      setIsDecompiling(false);
    }
  };

  const handleLoadSample = (game: GameEngine) => {
    setIsDecompiling(true);
    setLogs([
      `Initializing sample ${game === 'emerald' ? 'Pokémon Emerald (pokeemerald)' : 'Pokémon FireRed (pokefirered)'} decompilation...`,
      'Extracting map metatiles, collision masks, and event scripts...'
    ]);

    setTimeout(() => {
      const project = PokeDecompiler.getStarterProject(game);
      setLogs(l => [
        ...l,
        `✓ Extracted ${Object.keys(project.maps).length} map layouts.`,
        `✓ Loaded ${Object.keys(project.species).length} Pokémon species and wild encounters.`,
        '✓ Workspace ready.'
      ]);
      setTimeout(() => {
        setIsDecompiling(false);
        onProjectDecompiled(project);
      }, 700);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 overflow-y-auto">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Logo / Badge */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl font-display font-extrabold text-white shadow-lg mb-4">
          ◓
        </div>

        <h1 className="text-2xl font-bold font-display text-white tracking-tight mb-2">
          PokéForge Studio Decompilation Gate
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mb-8 leading-relaxed">
          To begin crafting your ROM hack, upload a GBA Pokémon ROM (`.gba`) for deep decompilation and asset extraction, or instantly launch with one of the pre-decompiled sample projects.
        </p>

        {isDecompiling ? (
          <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-left font-mono text-xs text-emerald-400 space-y-1.5 shadow-inner min-h-[180px] max-h-60 overflow-y-auto">
            <div className="flex items-center gap-2 text-indigo-400 font-bold mb-2">
              <Terminal className="w-4 h-4 animate-spin" />
              <span>Decompilation Pipeline Active...</span>
            </div>
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        ) : (
          <div className="w-full space-y-4">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".gba"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Upload ROM Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg group"
            >
              <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-sm font-bold">Upload GBA ROM (.gba)</div>
                <div className="text-xs text-indigo-200 font-normal">Decompile binary ROM and extract assets</div>
              </div>
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-xs text-slate-500 uppercase tracking-widest font-mono">or quick load sample</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Sample Project Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleLoadSample('emerald')}
                className="p-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-600 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Hoenn Region</span>
                </div>
                <div className="text-sm font-semibold text-white group-hover:text-emerald-300">
                  Pokémon Emerald (pokeemerald)
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Littleroot Town, Route 101, Birch Lab & 386 Gen III species.
                </div>
              </button>

              <button
                onClick={() => handleLoadSample('firered')}
                className="p-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-rose-600 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Kanto Region</span>
                </div>
                <div className="text-sm font-semibold text-white group-hover:text-rose-300">
                  Pokémon FireRed (pokefirered)
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Pallet Town, Route 1, Oak's Lab & Classic Kanto encounters.
                </div>
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-xs text-slate-500 font-mono flex items-center gap-2">
          <span>Powered by PokéForge Decomp Engine</span>
          <span aria-hidden="true">·</span>
          <span>Render Production Ready</span>
        </div>
      </div>
    </div>
  );
};
