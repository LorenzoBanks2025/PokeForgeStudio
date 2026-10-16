/**
 * @file CompilerModal.tsx
 * @package pokeview
 * @description Build modal with pre-flight ROM integrity validation, live compiler output,
 * in-browser WebAssembly playable emulator, and direct export options.
 */

import React, { useState, useEffect, useRef } from 'react';
import { DecompiledProject } from '@/src/packages/pokedcomp/types.ts';
import { PokeCompiler } from '@/src/packages/pokecompiler/compiler.ts';
import { WasmGbaEmulator } from '@/src/packages/pokecompiler/wasmEmulator.ts';
import { RomValidator, ValidationIssue } from '@/src/packages/pokecompiler/validator.ts';
import { CompileResult } from '@/src/packages/pokecompiler/types.ts';
import { IntegrityChecker } from '@/src/services/integrityChecker.ts';
import { ProjectManager } from '@/src/services/projectManager.ts';
import { X, Play, Download, Package, FileCode, Volume2, VolumeX, FastForward, RotateCcw, ShieldCheck, AlertTriangle, CheckCircle, Terminal, Wrench, Disc } from 'lucide-react';

interface CompilerModalProps {
  project: DecompiledProject;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject?: (project: DecompiledProject) => void;
}

export const CompilerModal: React.FC<CompilerModalProps> = ({
  project,
  isOpen,
  onClose,
  onUpdateProject
}) => {
  const [activeTab, setActiveTab] = useState<'play' | 'validation' | 'logs' | 'export'>('play');
  const [compileResult, setCompileResult] = useState<CompileResult | null>(null);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(true);
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const emulatorRef = useRef<WasmGbaEmulator | null>(null);

  useEffect(() => {
    if (isOpen) {
      runValidationAndCompile();
    } else {
      if (emulatorRef.current) {
        emulatorRef.current.stop();
      }
    }
  }, [isOpen]);

  const runValidationAndCompile = async () => {
    const issues = RomValidator.validate(project);
    setValidationIssues(issues);

    setIsCompiling(true);
    setStatusMessage('Fetching base ROM binary from project directory...');
    const baseRom = await ProjectManager.fetchBaseRom(project.projectName);

    setStatusMessage('Merging PokéProject data into GBA ROM binary...');
    const result = await PokeCompiler.compile(project, {
      target: 'gba_rom',
      baseRom: baseRom ?? undefined,
      verifyChecksums: true,
      optimizeBytecode: true
    });

    // Notify server to save compiled_rom.gba in projects/<projectName>/
    fetch(`/api/project/${encodeURIComponent(project.projectName)}/recompile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project })
    }).catch(() => {});

    setCompileResult(result);
    setIsCompiling(false);
    setStatusMessage(baseRom ? '✓ Recompiled by merging project into base_rom.gba' : '✓ Recompiled using starter ROM container');
    setTimeout(() => setStatusMessage(''), 3500);

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

  const handleDownloadIpsPatch = async () => {
    setStatusMessage('Generating standard IPS delta patch...');
    const result = await PokeCompiler.compile(project, { target: 'ips_patch' });
    if (result.ipsData) {
      const blob = new Blob([result.ipsData as unknown as BlobPart], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.projectName}_patch.ips`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage('Standard IPS delta patch downloaded!');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleAutoRepair = () => {
    const { repairedProject, fixCount, fixLogs } = IntegrityChecker.repairProject(project);
    if (onUpdateProject) {
      onUpdateProject(repairedProject);
    }
    const newIssues = RomValidator.validate(repairedProject);
    setValidationIssues(newIssues);
    setStatusMessage(`✓ Auto-repaired ${fixCount} issue${fixCount === 1 ? '' : 's'} across project!`);
    setTimeout(() => setStatusMessage(''), 3500);
  };

  if (!isOpen) return null;

  const errorCount = validationIssues.filter(i => i.severity === 'error').length;
  const warningCount = validationIssues.filter(i => i.severity === 'warning').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 text-slate-100">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-14 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              ◓
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-display">
                PokéForge Recompiler & Integrity Validator
              </h2>
              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                <span>Target: {project.projectName}.gba</span>
                <span>·</span>
                <span className="text-emerald-400">Merging into: projects/{project.projectName}/base_rom.gba</span>
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
                onClick={() => setActiveTab('validation')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'validation' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pre-Flight ({validationIssues.length})</span>
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
              <div className="relative p-3 bg-slate-900 border-4 border-slate-800 rounded-2xl shadow-2xl flex flex-col items-center">
                <canvas
                  ref={canvasRef}
                  width={240}
                  height={160}
                  className="w-[480px] h-[320px] bg-slate-950 rounded-lg pixelated block border border-slate-800"
                />

                <div className="w-full mt-3 flex items-center justify-between text-xs text-slate-400 px-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsAudioOn(!isAudioOn);
                        if (emulatorRef.current) emulatorRef.current.audioEnabled = !isAudioOn;
                      }}
                      className="p-1.5 hover:bg-slate-800 rounded-md text-slate-300 transition-colors cursor-pointer"
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
                    >
                      <FastForward className="w-3.5 h-3.5" />
                      <span>Turbo</span>
                    </button>
                    <button
                      onClick={() => emulatorRef.current?.reset()}
                      className="p-1.5 hover:bg-slate-800 rounded-md text-slate-300 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {statusMessage && (
                <div className="mt-3 text-xs font-medium text-emerald-400 font-mono">
                  {statusMessage}
                </div>
              )}
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="w-full max-w-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white font-display">
                    ROM Pre-Flight Integrity Report
                  </h3>
                  <p className="text-xs text-slate-400">
                    Scans project maps, scripts, wild encounters, and trainer parties for errors.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(errorCount > 0 || warningCount > 0) && (
                    <button
                      onClick={handleAutoRepair}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      title="Automatically repair dangling script IDs, broken warps, out-of-range wild levels, and missing references"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Auto-Repair All Issues</span>
                    </button>
                  )}
                  {errorCount === 0 && warningCount === 0 ? (
                    <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 rounded font-mono text-xs flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Passed
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-amber-950 text-amber-300 rounded font-mono text-xs flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {errorCount} Errors, {warningCount} Warnings
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {validationIssues.map((iss, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-3 ${
                      iss.severity === 'error'
                        ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                        : iss.severity === 'warning'
                        ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                        : 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                    }`}
                  >
                    {iss.severity === 'error' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    ) : iss.severity === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold font-mono text-[11px] uppercase tracking-wider mb-0.5 opacity-80">
                        [{iss.category}]
                      </div>
                      <div>{iss.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="w-full max-w-2xl space-y-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Playable GBA ROM Binary (.gba)</h4>
                  <p className="text-[11px] text-slate-400">Standard 16MB GBA binary with checksum validation.</p>
                </div>
                <button
                  onClick={handleDownloadRom}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Download .gba
                </button>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Desktop Standalone HTML5 Bundle (.zip)</h4>
                  <p className="text-[11px] text-slate-400">Offline playable package with WebAssembly player.</p>
                </div>
                <button
                  onClick={handleDownloadStandaloneHtml}
                  className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Download HTML5 Zip
                </button>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Pret C Decompilation Tree (.zip)</h4>
                  <p className="text-[11px] text-slate-400">Makefile and C source tree compatible with devkitARM.</p>
                </div>
                <button
                  onClick={handleDownloadPretZip}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Download C Tree
                </button>
              </div>

              <div className="p-4 bg-slate-900 border border-amber-900/40 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-amber-300">Standard IPS ROM Patch (.ips)</h4>
                  <p className="text-[11px] text-slate-400">Legal delta patch file for community distribution without copyright assets.</p>
                </div>
                <button
                  onClick={handleDownloadIpsPatch}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Download .ips Patch
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
                  <div key={idx} className={log.startsWith('✓') ? 'text-emerald-400' : 'text-slate-400'}>
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
