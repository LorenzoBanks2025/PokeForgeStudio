/**
 * @file types.ts
 * @package pokecompiler
 * @description Types and compiler options for pokecompiler.
 */

import type { DecompiledProject } from '../pokedcomp/types.ts';

export type BuildTarget = 'gba_rom' | 'html5_bundle' | 'pret_zip' | 'ips_patch';

export interface CompilerOptions {
  target: BuildTarget;
  optimizeBytecode?: boolean;
  verifyChecksums?: boolean;
  injectDebugWarps?: boolean;
  baseRom?: Uint8Array;
}

export interface CompileResult {
  success: boolean;
  target: BuildTarget;
  romData?: Uint8Array;
  ipsData?: Uint8Array;
  zipBlob?: Blob;
  logs: string[];
  warnings: string[];
  errors: string[];
  stats: {
    totalMaps: number;
    totalSpecies: number;
    totalEncounters: number;
    romSizeBytes: number;
    compiledAt: string;
  };
}

export interface EmulatorController {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  a: boolean;
  b: boolean;
  l: boolean;
  r: boolean;
  start: boolean;
  select: boolean;
}
