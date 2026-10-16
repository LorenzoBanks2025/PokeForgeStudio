/**
 * @file compiler.ts
 * @package pokecompiler
 * @description Main compiler coordinator for building GBA ROMs, Standalone Bundles, and Pret C Trees.
 */

import type { DecompiledProject } from '../pokedcomp/types.ts';
import { PokeDecompiler } from '../pokedcomp/decompiler.ts';
import type { CompilerOptions, CompileResult } from './types.ts';
import { RomBuilder } from './romBuilder.ts';
import { PretExporter } from './pretExporter.ts';
import { StandaloneBuilder } from './standaloneBuilder.ts';
import { IpsPatcher } from './ipsPatcher.ts';

export class PokeCompiler {
  static async compile(project: DecompiledProject, options: CompilerOptions): Promise<CompileResult> {
    const logs: string[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];
    const startTime = performance.now();

    logs.push(`PokéForge Compiler v1.2.0 initialized.`);
    logs.push(`Project: ${project.projectName} (${project.game.toUpperCase()})`);
    logs.push(`Target Output: [${options.target}]`);

    let romData: Uint8Array | undefined;
    let ipsData: Uint8Array | undefined;
    let zipBlob: Blob | undefined;

    try {
      if (options.target === 'gba_rom') {
        romData = RomBuilder.buildGbaRom(project, logs, options.baseRom);
      } else if (options.target === 'ips_patch') {
        logs.push(`Building target modified GBA ROM image...`);
        romData = RomBuilder.buildGbaRom(project, logs, options.baseRom);
        logs.push(`Generating clean base ROM image for delta diffing...`);
        const baseProject = PokeDecompiler.getStarterProject(project.game);
        const baseRom = options.baseRom || RomBuilder.buildGbaRom(baseProject, []);
        logs.push(`Calculating IPS patch records (comparing ${baseRom.length} bytes)...`);
        ipsData = IpsPatcher.createPatch(baseRom, romData);
        logs.push(`✓ Generated ${ipsData.length} bytes IPS patch file.`);
      } else if (options.target === 'html5_bundle') {
        zipBlob = await StandaloneBuilder.exportHtml5Bundle(project, logs);
      } else if (options.target === 'pret_zip') {
        zipBlob = await PretExporter.exportSourceZip(project, logs);
      }

      const elapsedMs = Math.round(performance.now() - startTime);
      logs.push(`✓ Compilation finished in ${elapsedMs}ms.`);

      let totalEncounters = 0;
      Object.values(project.wildEncounters).forEach(t => {
        totalEncounters += t.land.length + t.water.length + t.rockSmash.length;
      });

      return {
        success: true,
        target: options.target,
        romData,
        ipsData,
        zipBlob,
        logs,
        warnings,
        errors,
        stats: {
          totalMaps: Object.keys(project.maps).length,
          totalSpecies: Object.keys(project.species).length,
          totalEncounters,
          romSizeBytes: romData ? romData.byteLength : (zipBlob ? zipBlob.size : 16777216),
          compiledAt: new Date().toISOString()
        }
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Compilation failed: ${msg}`);
      logs.push(`✗ Error encountered: ${msg}`);
      return {
        success: false,
        target: options.target,
        logs,
        warnings,
        errors,
        stats: {
          totalMaps: Object.keys(project.maps).length,
          totalSpecies: Object.keys(project.species).length,
          totalEncounters: 0,
          romSizeBytes: 0,
          compiledAt: new Date().toISOString()
        }
      };
    }
  }
}
