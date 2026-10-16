/**
 * @file validator.ts
 * @package pokecompiler
 * @description ROM integrity and validation pre-flight checker.
 */

import type { DecompiledProject } from '../pokedcomp/types.ts';

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  category: 'Map & Warps' | 'Events & Scripts' | 'Wild Encounters' | 'Species & Learnsets' | 'Trainers';
  message: string;
  targetId?: string;
}

export class RomValidator {
  static validate(project: DecompiledProject): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // 1. Validate Map Warps & Events
    for (const [mapId, mapData] of Object.entries(project.maps)) {
      // Check warps
      for (const warp of mapData.events.warps) {
        if (!project.maps[warp.targetMapId]) {
          issues.push({
            severity: 'error',
            category: 'Map & Warps',
            message: `Map "${mapData.layout.name}" (${mapId}) has warp at (${warp.x}, ${warp.y}) pointing to non-existent map "${warp.targetMapId}".`,
            targetId: mapId
          });
        }
      }

      // Check NPC script references
      for (const npc of mapData.events.npcs) {
        if (!project.scripts[npc.scriptId]) {
          issues.push({
            severity: 'warning',
            category: 'Events & Scripts',
            message: `NPC "${npc.id}" on map "${mapData.layout.name}" references missing script ID "${npc.scriptId}".`,
            targetId: mapId
          });
        }
      }

      // Check Signpost script references
      for (const sign of mapData.events.signs) {
        if (sign.scriptId && !project.scripts[sign.scriptId]) {
          issues.push({
            severity: 'warning',
            category: 'Events & Scripts',
            message: `Signpost on map "${mapData.layout.name}" references missing script ID "${sign.scriptId}".`,
            targetId: mapId
          });
        }
      }
    }

    // 2. Validate Wild Encounters
    for (const [mapId, table] of Object.entries(project.wildEncounters)) {
      if (!project.maps[mapId]) {
        issues.push({
          severity: 'error',
          category: 'Wild Encounters',
          message: `Wild encounter table defined for non-existent map ID "${mapId}".`,
          targetId: mapId
        });
      }

      const allSlots = [...table.land, ...table.water, ...table.rockSmash];
      for (const slot of allSlots) {
        if (!project.species[slot.species]) {
          issues.push({
            severity: 'error',
            category: 'Wild Encounters',
            message: `Wild encounter on map "${mapId}" references unknown species "${slot.species}".`,
            targetId: mapId
          });
        }
        if (slot.minLevel < 1 || slot.maxLevel > 100 || slot.minLevel > slot.maxLevel) {
          issues.push({
            severity: 'warning',
            category: 'Wild Encounters',
            message: `Invalid level range (${slot.minLevel}-${slot.maxLevel}) in wild encounter slot on map "${mapId}".`,
            targetId: mapId
          });
        }
      }
    }

    // 3. Validate Species Learnsets & Stats
    for (const [spId, sp] of Object.entries(project.species)) {
      for (const lm of sp.learnset) {
        if (!project.moves[lm.move]) {
          issues.push({
            severity: 'warning',
            category: 'Species & Learnsets',
            message: `Pokémon species "${sp.name}" learnset references unknown move "${lm.move}".`,
            targetId: spId
          });
        }
      }
    }

    // 4. Validate Trainers
    for (const [tId, trainer] of Object.entries(project.trainers)) {
      for (const p of trainer.party) {
        if (!project.species[p.species]) {
          issues.push({
            severity: 'error',
            category: 'Trainers',
            message: `Trainer "${trainer.name}" (${tId}) party includes unknown species "${p.species}".`,
            targetId: tId
          });
        }
        if (p.heldItem && !project.items[p.heldItem]) {
          issues.push({
            severity: 'warning',
            category: 'Trainers',
            message: `Trainer "${trainer.name}" (${tId}) party Pokémon holds unknown item "${p.heldItem}".`,
            targetId: tId
          });
        }
      }
    }

    if (issues.length === 0) {
      issues.push({
        severity: 'info',
        category: 'Map & Warps',
        message: '✓ ROM Integrity Check Passed: Zero broken references or missing assets detected.'
      });
    }

    return issues;
  }

  static validateBaseRom(rom: Uint8Array): { isValid: boolean; logs: string[] } {
    const logs: string[] = [];
    if (rom.length < 0x01000000) {
      logs.push(`! Error: ROM size is too small (${rom.length} bytes). Minimum 16MB required.`);
      return { isValid: false, logs };
    }

    // Verify Nintendo Logo at 0x04
    const nintendoLogo = [
      0x24, 0xFF, 0xAE, 0x51, 0x69, 0x9A, 0xA2, 0x21, 0x3D, 0x84, 0x82, 0x0A, 0x84, 0xE4, 0x09, 0xAD,
      0x11, 0x24, 0x8B, 0x98, 0xC0, 0x81, 0x7F, 0x21, 0xA3, 0x52, 0xBE, 0x19, 0x93, 0x09, 0xCE, 0x20,
      0x10, 0x46, 0x4A, 0x4A, 0xF8, 0x27, 0x31, 0xEC, 0x58, 0xC7, 0xE8, 0x33, 0x82, 0xE3, 0xCE, 0xBF,
      0x85, 0xF4, 0xDF, 0x94, 0xCE, 0x4B, 0x09, 0x2B, 0x94, 0x58, 0xAC, 0x6E, 0x9E, 0xDF, 0x7E, 0xD4,
      0x17, 0xDA, 0x3A, 0xAE, 0x16, 0xC5, 0xCE, 0x2B, 0x47, 0x44, 0x66, 0xD4, 0x75, 0x8D, 0x2D, 0x3E,
      0x7E, 0x1D, 0x68, 0x4D, 0xB6, 0xD7, 0xB7, 0xB4, 0x20, 0xCE, 0x90, 0xA7, 0x50, 0x87, 0xC8, 0x9A,
      0x35, 0x9C, 0xF0, 0x07, 0x56, 0x52, 0x29, 0x17, 0xA5, 0x5C, 0x6E, 0xCE, 0x43, 0x59, 0x04, 0x42,
      0x9F, 0xD0, 0x3B, 0x1E, 0x52, 0x84, 0x57, 0x6A, 0xAE, 0x39, 0xC9, 0x33, 0xB9, 0x53, 0x32, 0x6A,
      0x8D, 0xBE, 0x44, 0x66, 0x82, 0xA8, 0x57, 0x2A, 0x3E, 0x25, 0xEE, 0x33, 0x3A, 0x23, 0xEE, 0xA1,
      0xF4, 0x47, 0x8A, 0x7D, 0xF3, 0xF8, 0xCE, 0x2D, 0x76, 0xF8, 0x4B, 0xF8
    ];
    
    let logoValid = true;
    for (let i = 0; i < nintendoLogo.length; i++) {
      if (rom[0x04 + i] !== nintendoLogo[i]) {
        logoValid = false;
        break;
      }
    }
    
    if (!logoValid) {
      logs.push(`! Error: Nintendo BIOS logo mismatch. Invalid or corrupted GBA ROM.`);
      return { isValid: false, logs };
    }

    logs.push(`✓ ROM validation passed: Nintendo header and size confirmed.`);
    return { isValid: true, logs };
  }
}
