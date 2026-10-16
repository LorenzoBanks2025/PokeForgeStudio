/**
 * @file validator.ts
 * @package pokecompiler
 * @description ROM integrity and validation pre-flight checker.
 */

import { DecompiledProject } from '../pokedcomp/types.ts';

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
}
