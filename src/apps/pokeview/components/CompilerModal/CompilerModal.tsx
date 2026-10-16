/**
 * @file CompilerModal.tsx
 * @package pokeview
 * @description Build modal with live compiler output, in-browser WebAssembly playable emulator,
 * and direct export options for .gba ROM, desktop HTML5 bundle, and pret C decomp trees.
 */

import React, { useState, useEffect, useRef } from 'react';
import { DecompiledProject } from '@/src/packages/pokedcomp/types.ts';
import { PokeCompiler } from '@/src/packages/pokecompiler/compiler.ts';
import { WasmGbaEmulator } from '@/src/packages/pokecompiler/wasmEmulator.ts';
import { CompileResult } from '@/src/packages/pokecompiler/types.ts';
import { X, Play, Download, Package, FileCode, Volume2, VolumeX, FastForward, RotateCcw, Save, DownloadCloud, Terminal } from 'lucide-react';

interface CompilerModalProps {
  project: DecompiledProject;
  isOpen: boolean;
  onClose: () => void;
}

export const CompilerModal: React.FC<CompilerModalProps> = ({
  project,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'play' | 'logs' | 'export'>('play');
  const [compileResult, setCompileResult] = useState<CompileResult | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(true);
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const emulatorRef = useRef<WasmGbaEmulator | null>(null);

  // Run compilation when modal opens
  useEffect(() => {
    if (isOpen) {
      runCompile();
    } else {
      if (emulatorRef.current) {
        emulatorRef.current.stop();
      }
    }
  }, [isOpen]);

  const runCompile = async () => {
    setIsCompiling(true);
    const result = await PokeCompiler.compile(project, {
      target: 'gba_rom',
      verifyChecksums: true,
      optimizeBytecode: true
    });
    setCompileResult(result);
    setIsCompiling(false);

    // Initialize emulator if canvas ready
    setTimeout(() => {
      if (canvasRef.current && result.success) {
        if (!emulatorRef.current) {
          emulatorRef.current = new WasmGbaEmulator(canvasRef.current, project);
        } else {
          emulatorRef.current.updateProject(project);
        }
        emulatorRef.current.start();
      }
    }, 100);
  };

  // Keyboard events listener for emulator
  useEffect(() => {
    if (!isOpen || activeTab !== 'play') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const emu = emulatorRef.current;
      if (!emu) return;

      if (['ArrowUp', 'KeyW'].includes(e.code)) { emu.handleInput('up', true); e.preventDefault(); }
      if (['ArrowDown', 'KeyS'].includes(e.code)) { emu.handleInput('down', true); e.preventDefault(); }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) { emu.handleInput('left', true); e.preventDefault(); }
      if (['ArrowRight', 'KeyD'].includes(e.code)) { emu.handleInput('right', true); e.preventDefault(); }
      if (['KeyZ', 'Space'].includes(e.code)) { emu.handleInput('a', true); e.preventDefault(); }
      if (['KeyX'].includes(e.code)) { emu.handleInput('b', true); e.preventDefault(); }
      if (['Enter'].includes(e.code)) { emu.handleInput('start', true); e.preventDefault(); }
      if (['ShiftRight', 'ShiftLeft'].includes(e.code)) { emu.handleInput('select', true); e.preventDefault(); }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const emu = emulatorRef.current;
      if (!emu) return;

      if (['ArrowUp', 'KeyW'].includes(e.code)) emu.handleInput('up', false);
      if (['ArrowDown', 'KeyS'].includes(e.code)) emu.handleInput('down', false);
      if (['ArrowLeft', 'KeyA'].includes(e.code)) emu.handleInput('left', false);
      if (['ArrowRight', 'KeyD'].includes(e.code)) emu.handleInput('right', false);
      if (['KeyZ', 'Space'].includes(e.code)) emu.handleInput('a', false);
      if (['KeyX'].includes(e.code)) emu.handleInput('b', false);
      if (['Enter'].includes(e.code)) emu.handleInput('start', false);
      if (['ShiftRight', 'ShiftLeft'].includes(e.code)) emu.handleInput('select', false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen, activeTab]);

  // Export handlers
  const handleDownloadRom = () => {
    if (!compileResult?.romData) return;
    const blob = new Blob([compileResult.romData as unknown as BlobPart], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.projectName}.gba`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('GBA ROM download initiated.');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleDownloadStandaloneHtml = async () => {
    setStatusMessage('Generating Standalone Desktop HTML5 bundle...');
    const result = await PokeCompiler.compile(project, { target: 'html5_bundle' });
    if (result.zipBlob) {
      const url = URL.createObjectURL(result.zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.projectName}_standalone_desktop.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage('Desktop HTML5 standalone bundle downloaded!');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleDownloadPretZip = async () => {
    setStatusMessage('Generating pret C decompilation source tree...');
    const result = await PokeCompiler.compile(project, { target: 'pret_zip' });
    if (result.zipBlob) {
      const url = URL.createObjectURL(result.zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.projectName}_pret_decomp_source.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage('Pret C decompilation source tree downloaded!');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-14 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              ◓
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-display">
                PokéForge Recompiler & Runtime Runner
              </h2>
              <div className="text-[11px] text-slate-400 font-mono">
                Target: {project.projectName}.gba · Engine: {project.game.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveTab('play')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'play' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Live GBA Player
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'export' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Export Builds
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'logs' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Compiler Logs
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-slate-950">
          {activeTab === 'play' && (
            <div className="w-full flex flex-col items-center">
              {/* Screen Frame */}
              <div className="relative p-3 bg-slate-900 border-4 border-slate-800 rounded-2xl shadow-2xl flex flex-col items-center">
                <canvas
                  ref={canvasRef}
                  width={240}
                  height={160}
                  className="w-[480px] h-[320px] bg-slate-950 rounded-lg pixelated block border border-slate-800"
                />

                {/* Emulator Controls Bar */}
                <div className="w-full mt-3 flex items-center justify-between text-xs text-slate-400 px-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsAudioOn(!isAudioOn);
                        if (emulatorRef.current) emulatorRef.current.audioEnabled = !isAudioOn;
                      }}
                      className="p-1.5 hover:bg-slate-800 rounded-md text-slate-300 transition-colors cursor-pointer"
                      title={isAudioOn ? 'Mute Audio' : 'Unmute Audio'}
                    >
                      {isAudioOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                    </button>
                    <button
                      onClick={() => {
                        setIsTurbo(!isTurbo);
                        if (emulatorRef.current) emulatorRef.current.isTurbo = !isTurbo;
                      }}
                      className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        isTurbo ? 'bg-amber-950 border border-amber-500 text-amber-300' : 'hover:bg-slate-800 text-slate-400'
                      }`}
                      title="Toggle 2x Turbo Speed"
                    >
                      <FastForward className="w-3.5 h-3.5" />
                      <span>Turbo</span>
                    </button>
                    <button
                      onClick={() => emulatorRef.current?.reset()}
                      className="p-1.5 hover:bg-slate-800 rounded-md text-slate-300 transition-colors cursor-pointer"
                      title="Reset Emulator"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        emulatorRef.current?.saveState();
                        setStatusMessage('State Saved to Memory.');
                        setTimeout(() => setStatusMessage(''), 2000);
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium cursor-pointer"
                    >
                      Save State
                    </button>
                    <button
                      onClick={() => {
                        const success = emulatorRef.current?.loadState();
                        setStatusMessage(success ? 'State Loaded.' : 'No state found.');
                        setTimeout(() => setStatusMessage(''), 2000);
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium cursor-pointer"
                    >
                      Load State
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Notice */}
              {statusMessage && (
                <div className="mt-3 text-xs font-medium text-emerald-400 animate-fade-in font-mono">
                  {statusMessage}
                </div>
              )}

              {/* Controls Keymap Legend */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800">
                <div>D-Pad: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px]">W A S D</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px]">Arrows</kbd></div>
                <div>A: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px]">Z</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px]">Space</kbd></div>
                <div>B / Run: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px]">X</kbd></div>
                <div>Start: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px]">Enter</kbd></div>
                <div>Select: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px]">Shift</kbd></div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="w-full max-w-2xl space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-base font-bold text-white font-display">
                  Export & Deployment Targets
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Download ready-to-play ROMs, desktop bundles, or standard C decompilation repositories.
                </p>
              </div>

              {/* GBA ROM Download */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Playable GBA ROM Binary (.gba)</h4>
                    <p className="text-[11px] text-slate-400">
                      Standard 16MB Game Boy Advance binary with repaired CRC complement checksum for flashcarts & mGBA.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadRom}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm whitespace-nowrap"
                >
                  Download .gba
                </button>
              </div>

              {/* Standalone Desktop HTML5 Bundle */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Desktop Standalone HTML5 Bundle (.zip)</h4>
                    <p className="text-[11px] text-slate-400">
                      Offline playable package with embedded WebAssembly player. Double click index.html to play on Windows/Mac/Linux.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadStandaloneHtml}
                  className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm whitespace-nowrap"
                >
                  Download HTML5 Zip
                </button>
              </div>

              {/* Pret C Decomp Source Tree */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Standard Pret C Decompilation Tree (.zip)</h4>
                    <p className="text-[11px] text-slate-400">
                      Makefile, C headers, map.json layouts, and event_scripts.inc compatible with gcc-arm-none-eabi.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadPretZip}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm whitespace-nowrap"
                >
                  Download C Tree
                </button>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="w-full flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-hidden">
              <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-800 text-xs font-semibold text-slate-400">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>Compiler Output & Diagnostics</span>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-xs text-slate-300 space-y-1 bg-slate-950 p-3 rounded-lg">
                {compileResult?.logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={
                      log.startsWith('✓')
                        ? 'text-emerald-400'
                        : log.startsWith('!')
                        ? 'text-amber-400'
                        : log.startsWith('✗')
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
