/**
 * @file RomDecompileGate.tsx
 * @package pokeview
 * @description Mandatory GBA ROM upload landing gate with project directory manager,
 * ROM-to-PokéProject converter, and 1-click sample project loaders.
 */

import React, { useState, useEffect, useRef } from 'react';
import { DecompiledProject, GameEngine } from '@/src/packages/pokedcomp/types.ts';
import { PokeDecompiler } from '@/src/packages/pokedcomp/decompiler.ts';
import { ProjectManager, ProjectSummary, ProjectManifest } from '@/src/services/projectManager.ts';
import { Upload, Sparkles, Terminal, Shield, FolderOpen, ArrowRight, Database, Disc, CheckCircle2, RefreshCw } from 'lucide-react';

interface RomDecompileGateProps {
  onProjectDecompiled: (project: DecompiledProject, manifest?: ProjectManifest, hasBaseRom?: boolean) => void;
}

export const RomDecompileGate: React.FC<RomDecompileGateProps> = ({ onProjectDecompiled }) => {
  const [isDecompiling, setIsDecompiling] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [existingProjects, setExistingProjects] = useState<ProjectSummary[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(true);
  const romInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);

  const loadProjectsList = async () => {
    setIsLoadingProjects(true);
    try {
      const list = await ProjectManager.fetchProjectsList();
      setExistingProjects(list);
    } catch {
      setExistingProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    loadProjectsList();
  }, []);

  const handleRomFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDecompiling(true);
    setLogs([`Reading ROM binary file "${file.name}" (${Math.round(file.size / 1024)} KB)...`]);

    try {
      const buffer = await file.arrayBuffer();
      
      // Step 1: Decompile ROM in-memory
      setLogs(l => [...l, 'Parsing GBA ROM pointer tables, map banks, and species tables...']);
      const { project, logs: decompLogs } = PokeDecompiler.decompileRom(buffer);
      setLogs(l => [...l, ...decompLogs]);

      // Step 2: Convert to PokéProject Directory Specification
      const sanitizedProjectName = file.name
        .replace(/\.gba$/i, '')
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '_') || 'custom_pokeproject';

      project.projectName = sanitizedProjectName;

      setLogs(l => [
        ...l,
        `Converting ROM into PokéProject specification directory...`,
        `Creating project directory: "projects/${sanitizedProjectName}/"`,
        `Writing manifest.json (format: pokeproject-v1, engine: ${project.game.toUpperCase()})...`,
        `Generating modular data files in "projects/${sanitizedProjectName}/data/":`,
        `  • data/maps.json (${Object.keys(project.maps).length} map layouts & blocks)`,
        `  • data/events.json (NPCs, warps, triggers, signposts)`,
        `  • data/species.json (${Object.keys(project.species).length} Pokémon base stats & learnsets)`,
        `  • data/wild_encounters.json (${Object.keys(project.wildEncounters).length} encounter tables)`,
        `  • data/trainers.json (${Object.keys(project.trainers).length} trainer party definitions)`,
        `  • data/items.json (${Object.keys(project.items).length} items & Poké Mart prices)`,
        `Writing asset manifests in "projects/${sanitizedProjectName}/assets/"...`,
        `Saving original binary base ROM as "projects/${sanitizedProjectName}/base_rom.gba" (${Math.round(buffer.byteLength / 1024)} KB)...`
      ]);

      const res = await ProjectManager.createProjectFromRom(
        sanitizedProjectName,
        project.game,
        project,
        buffer
      );

      setLogs(l => [
        ...l,
        `✓ PokéProject directory successfully written to "${res.path}".`,
        `✓ Base ROM sealed for compiler merging. Launching editor workspace...`
      ]);

      setTimeout(() => {
        setIsDecompiling(false);
        onProjectDecompiled(project, undefined, true);
      }, 900);
    } catch (err: any) {
      setLogs(l => [...l, `✗ Decompilation / Project Creation Error: ${err.message}`]);
      setIsDecompiling(false);
    }
  };

  const handleOpenExistingProject = async (projectName: string) => {
    setIsDecompiling(true);
    setLogs([`Loading PokéProject from directory "projects/${projectName}/"...`]);

    try {
      const { project, manifest, hasBaseRom } = await ProjectManager.loadProject(projectName);
      setLogs(l => [
        ...l,
        `✓ Read manifest.json (${manifest.game.toUpperCase()}, version: ${manifest.version || '1.0.0'})`,
        `✓ Reconstituted ${Object.keys(project.maps).length} maps and ${Object.keys(project.species).length} species`,
        hasBaseRom ? `✓ Verified base ROM binary: "projects/${projectName}/base_rom.gba"` : '! Notice: No base ROM binary found; starter container will be used upon compilation',
        '✓ Editor workspace ready.'
      ]);

      setTimeout(() => {
        setIsDecompiling(false);
        onProjectDecompiled(project, manifest, hasBaseRom);
      }, 700);
    } catch (err: any) {
      setLogs(l => [...l, `✗ Failed to load project: ${err.message}`]);
      setIsDecompiling(false);
    }
  };

  const handleProjectFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDecompiling(true);
    setLogs([`Loading PokéProject archive "${file.name}"...`]);

    try {
      const text = await file.text();
      const project: DecompiledProject = JSON.parse(text);
      
      const safeName = project.projectName || file.name.replace(/\..+$/, '').replace(/[^a-z0-9_-]/g, '_');
      project.projectName = safeName;

      setLogs(l => [
        ...l,
        `Saving imported archive to "projects/${safeName}/"...`
      ]);

      await ProjectManager.createProjectFromRom(safeName, project.game, project);

      setLogs(l => [
        ...l,
        `✓ Created project directory "projects/${safeName}/" with manifest, data, and asset files.`,
        `✓ Loaded ${Object.keys(project.maps).length} maps and ${Object.keys(project.species).length} Pokémon species`,
        '✓ Workspace ready.'
      ]);

      setTimeout(() => {
        setIsDecompiling(false);
        onProjectDecompiled(project, undefined, false);
      }, 700);
    } catch (err: any) {
      setLogs(l => [...l, `✗ Project Load Error: ${err.message}`]);
      setIsDecompiling(false);
    }
  };

  const handleLoadSample = async (game: GameEngine) => {
    setIsDecompiling(true);
    const projectName = game === 'emerald' ? 'pokeemerald_starter' : 'pokefirered_starter';

    setLogs([
      `Initializing ${game === 'emerald' ? 'Pokémon Emerald (pokeemerald)' : 'Pokémon FireRed (pokefirered)'} project directory...`,
      `Checking "projects/${projectName}/"...`
    ]);

    try {
      // Check if project exists on server
      const existing = existingProjects.find(p => p.name === projectName);
      if (existing) {
        await handleOpenExistingProject(projectName);
        return;
      }

      // Otherwise create it on server
      const project = PokeDecompiler.getStarterProject(game);
      setLogs(l => [
        ...l,
        `Creating new project directory: "projects/${projectName}/"`,
        `Writing manifest.json, modular data files, and base ROM binary...`
      ]);

      await ProjectManager.createProjectFromRom(projectName, game, project);

      setLogs(l => [
        ...l,
        `✓ Initialized "projects/${projectName}/" with manifest, data, assets, and base_rom.gba.`,
        `✓ Loaded ${Object.keys(project.maps).length} map layouts.`,
        `✓ Loaded ${Object.keys(project.species).length} Pokémon species and wild encounters.`,
        '✓ Workspace ready.'
      ]);

      setTimeout(() => {
        setIsDecompiling(false);
        onProjectDecompiled(project, undefined, true);
      }, 700);
    } catch (err: any) {
      setLogs(l => [...l, `✗ Sample loader error: ${err.message}`]);
      setIsDecompiling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 overflow-y-auto">
      <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center relative overflow-hidden my-auto">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Logo / Badge */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl font-display font-extrabold text-white shadow-lg mb-4">
          ◓
        </div>

        <h1 className="text-2xl font-bold font-display text-white tracking-tight mb-2">
          PokéForge Studio Decompilation Gate
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mb-6 leading-relaxed">
          Upload a GBA Pokémon ROM (`.gba`) to convert it into a full project directory with <code className="text-indigo-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono text-xs">manifest.json</code>, <code className="text-indigo-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono text-xs">data/</code>, and <code className="text-indigo-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono text-xs">assets/</code> files, or open an existing project from disk.
        </p>

        {isDecompiling ? (
          <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-left font-mono text-xs text-emerald-400 space-y-1.5 shadow-inner min-h-[220px] max-h-72 overflow-y-auto">
            <div className="flex items-center gap-2 text-indigo-400 font-bold mb-2">
              <Terminal className="w-4 h-4 animate-spin" />
              <span>Decompilation & Project Pipeline Active...</span>
            </div>
            {logs.map((log, i) => (
              <div key={i} className={log.startsWith('✓') ? 'text-emerald-300' : log.startsWith('✗') ? 'text-rose-400 font-bold' : log.startsWith('!') ? 'text-amber-400' : 'text-slate-300'}>
                {log}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full space-y-6">
            {/* Hidden file inputs */}
            <input
              ref={romInputRef}
              type="file"
              accept=".gba"
              className="hidden"
              onChange={handleRomFileChange}
            />
            <input
              ref={projectInputRef}
              type="file"
              accept=".json,.pokeforge"
              className="hidden"
              onChange={handleProjectFileChange}
            />

            {/* Main Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Upload ROM */}
              <button
                onClick={() => romInputRef.current?.click()}
                className="p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-left transition-all cursor-pointer shadow-md group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <Upload className="w-5 h-5 text-indigo-200 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-mono bg-indigo-700 px-2 py-0.5 rounded text-white font-semibold">GBA ROM → PokéProject</span>
                </div>
                <div>
                  <div className="text-sm font-bold">Decompile GBA ROM</div>
                  <div className="text-xs text-indigo-200 mt-0.5">Extract assets into projects/ directory with manifest & data files</div>
                </div>
              </button>

              {/* Import Archive */}
              <button
                onClick={() => projectInputRef.current?.click()}
                className="p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white rounded-xl text-left transition-all cursor-pointer shadow-md group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <FolderOpen className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-mono bg-slate-700 px-2 py-0.5 rounded text-slate-300">Import Archive</span>
                </div>
                <div>
                  <div className="text-sm font-bold">Import Project File</div>
                  <div className="text-xs text-slate-400 mt-0.5">Import existing .pokeforge / JSON file into projects/</div>
                </div>
              </button>
            </div>

            {/* Existing Projects from projects/ Directory */}
            <div className="text-left bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Projects Directory (<code className="text-indigo-400 lowercase">projects/</code>)
                  </span>
                </div>
                <button
                  onClick={loadProjectsList}
                  disabled={isLoadingProjects}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  title="Refresh Projects"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingProjects ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {isLoadingProjects ? (
                <div className="py-6 text-center text-xs text-slate-500">Scanning projects directory...</div>
              ) : existingProjects.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500">
                  No projects in <code className="text-indigo-400 font-mono">projects/</code> directory yet. Upload a ROM or start with a sample below.
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {existingProjects.map((proj) => (
                    <div
                      key={proj.name}
                      onClick={() => handleOpenExistingProject(proj.name)}
                      className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 rounded-lg flex items-center justify-between cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${proj.game === 'emerald' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                          {proj.game === 'emerald' ? 'EM' : 'FR'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-indigo-300 flex items-center gap-2">
                            <span>{proj.displayName || proj.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                              projects/{proj.name}/
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{proj.mapsCount} maps</span>
                            <span>•</span>
                            <span>{proj.speciesCount} species</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Disc className="w-3 h-3 text-emerald-400" />
                              {proj.hasBaseRom ? 'Base ROM saved' : 'No base ROM'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-indigo-400 group-hover:translate-x-1 transition-transform font-medium">
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-xs text-slate-500 uppercase tracking-widest font-mono">or create new project from starter ROM</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Sample Project Starter Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleLoadSample('emerald')}
                className="p-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-600 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Hoenn Region Engine</span>
                </div>
                <div className="text-sm font-semibold text-white group-hover:text-emerald-300">
                  Pokémon Emerald (pokeemerald)
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Creates <code className="text-slate-300 font-mono">projects/pokeemerald_starter/</code> with 16MB base ROM, 15 maps, 386 Pokémon species, and scripts.
                </div>
              </button>

              <button
                onClick={() => handleLoadSample('firered')}
                className="p-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-rose-600 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Kanto Region Engine</span>
                </div>
                <div className="text-sm font-semibold text-white group-hover:text-rose-300">
                  Pokémon FireRed (pokefirered)
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Creates <code className="text-slate-300 font-mono">projects/pokefirered_starter/</code> with 16MB base ROM, Pallet Town, Route 1, and classic encounters.
                </div>
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-xs text-slate-500 font-mono flex items-center gap-2">
          <span>PokéForge Decomp & Compiler Engine</span>
          <span aria-hidden="true">·</span>
          <span>Directory Specification v1.0</span>
          <span aria-hidden="true">·</span>
          <span>Render Production Ready</span>
        </div>
      </div>
    </div>
  );
};
