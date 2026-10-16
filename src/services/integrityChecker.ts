/**
 * @file integrityChecker.ts
 * @package services
 * @description IntegrityChecker service traversing the DecompiledProject object to validate
 * references between maps, species, trainers, moves, and items.
 */

import { DecompiledProject } from '@/src/packages/pokedcomp/types.ts';

export interface IntegrityIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  category: 'Maps & Warps' | 'Events & Scripts' | 'Wild Encounters' | 'Species & Learnsets' | 'Trainers' | 'Items';
  message: string;
  targetId?: string;
}

export class IntegrityChecker {
  static checkProject(project: DecompiledProject): IntegrityIssue[] {
    const issues: IntegrityIssue[] = [];
    let counter = 1;

    // 1. Validate Map Warps & Connections
    for (const [mapId, mapData] of Object.entries(project.maps)) {
      for (const warp of mapData.events.warps) {
        if (!project.maps[warp.targetMapId]) {
          issues.push({
            id: `ISSUE_${counter++}`,
            severity: 'error',
            category: 'Maps & Warps',
            message: `Map "${mapData.layout.name}" (${mapId}) has a warp portal at (${warp.x}, ${warp.y}) pointing to non-existent map ID "${warp.targetMapId}".`,
            targetId: mapId
          });
        }
      }

      // Validate NPC Script references
      for (const npc of mapData.events.npcs) {
        if (!project.scripts[npc.scriptId]) {
          issues.push({
            id: `ISSUE_${counter++}`,
            severity: 'warning',
            category: 'Events & Scripts',
            message: `NPC "${npc.id}" on map "${mapData.layout.name}" references dangling script ID "${npc.scriptId}".`,
            targetId: mapId
          });
        }
      }

      // Validate Signpost Script references
      for (const sign of mapData.events.signs) {
        if (sign.scriptId && !project.scripts[sign.scriptId]) {
          issues.push({
            id: `ISSUE_${counter++}`,
            severity: 'warning',
            category: 'Events & Scripts',
            message: `Signpost on map "${mapData.layout.name}" references dangling script ID "${sign.scriptId}".`,
            targetId: mapId
          });
        }
      }
    }

    // 2. Validate Wild Encounters
    for (const [mapId, table] of Object.entries(project.wildEncounters)) {
      if (!project.maps[mapId]) {
        issues.push({
          id: `ISSUE_${counter++}`,
          severity: 'error',
          category: 'Wild Encounters',
          message: `Wild encounter table exists for orphaned map ID "${mapId}".`,
          targetId: mapId
        });
      }

      const allSlots = [...table.land, ...table.water, ...table.rockSmash];
      for (const slot of allSlots) {
        if (!project.species[slot.species]) {
          issues.push({
            id: `ISSUE_${counter++}`,
            severity: 'error',
            category: 'Wild Encounters',
            message: `Wild encounter slot on map "${mapId}" references missing species "${slot.species}".`,
            targetId: mapId
          });
        }
      }
    }

    // 3. Validate Species & Learnset Move Definitions
    for (const [spId, sp] of Object.entries(project.species)) {
      for (const lm of sp.learnset) {
        if (!project.moves[lm.move]) {
          issues.push({
            id: `ISSUE_${counter++}`,
            severity: 'warning',
            category: 'Species & Learnsets',
            message: `Species "${sp.name}" learnset references missing move definition "${lm.move}".`,
            targetId: spId
          });
        }
      }
    }

    // 4. Validate Trainers & Parties
    for (const [tId, trainer] of Object.entries(project.trainers)) {
      for (const p of trainer.party) {
        if (!project.species[p.species]) {
          issues.push({
            id: `ISSUE_${counter++}`,
            severity: 'error',
            category: 'Trainers',
            message: `Trainer "${trainer.name}" (${tId}) party includes missing species "${p.species}".`,
            targetId: tId
          });
        }
        if (p.heldItem && !project.items[p.heldItem]) {
          issues.push({
            id: `ISSUE_${counter++}`,
            severity: 'warning',
            category: 'Trainers',
            message: `Trainer "${trainer.name}" (${tId}) party Pokémon holds missing item "${p.heldItem}".`,
            targetId: tId
          });
        }
      }
    }

    if (issues.length === 0) {
      issues.push({
        id: `ISSUE_OK`,
        severity: 'info',
        category: 'Maps & Warps',
        message: '✓ All project references, map connections, script pointers, and assets are fully valid.'
      });
    }

    return issues;
  }

  /**
   * Automatically repairs detectable inconsistencies:
   * 1. Creates stub scripts for dangling script references.
   * 2. Clamps wild encounter level ranges and restores valid default species.
   * 3. Repairs broken warps to current map coords (0,0).
   * 4. Substitutes missing species/items in trainer parties.
   */
  static repairProject(project: DecompiledProject): {
    repairedProject: DecompiledProject;
    fixCount: number;
    fixLogs: string[];
  } {
    // Deep clone to avoid mutating input directly
    const clone: DecompiledProject = JSON.parse(JSON.stringify(project));
    let fixCount = 0;
    const fixLogs: string[] = [];

    const firstMapId = Object.keys(clone.maps)[0] ?? '';
    const firstSpeciesId = Object.keys(clone.species)[0] ?? 'SPECIES_POOCHYENA';
    const firstMoveId = Object.keys(clone.moves)[0] ?? 'MOVE_TACKLE';

    // 1. Repair Maps & Warps
    for (const [mapId, mapData] of Object.entries(clone.maps)) {
      for (const warp of mapData.events.warps) {
        if (!clone.maps[warp.targetMapId]) {
          warp.targetMapId = firstMapId || mapId;
          warp.targetWarpId = 0;
          fixCount++;
          fixLogs.push(`Rerouted broken warp at (${warp.x}, ${warp.y}) in ${mapData.layout.name} to fallback map "${warp.targetMapId}".`);
        }
      }

      // Repair dangling NPC scripts
      for (const npc of mapData.events.npcs) {
        if (!clone.scripts[npc.scriptId]) {
          const stubScriptId = npc.scriptId || `Script_Stub_${npc.id}`;
          npc.scriptId = stubScriptId;
          clone.scripts[stubScriptId] = {
            id: stubScriptId,
            name: `Auto-Generated Stub for NPC ${npc.id}`,
            code: `lock\nfaceplayer\nmsgbox "Hello! The road ahead is peaceful today."\nrelease\nend`,
            parsedCommands: [
              { command: 'lock', args: [] },
              { command: 'faceplayer', args: [] },
              { command: 'msgbox', args: ['"Hello! The road ahead is peaceful today."'] },
              { command: 'release', args: [] },
              { command: 'end', args: [] }
            ]
          };
          fixCount++;
          fixLogs.push(`Generated stub script "${stubScriptId}" for NPC "${npc.id}" on map "${mapData.layout.name}".`);
        }
      }

      // Repair dangling Signpost scripts
      for (const sign of mapData.events.signs) {
        if (sign.scriptId && !clone.scripts[sign.scriptId]) {
          const stubScriptId = sign.scriptId;
          clone.scripts[stubScriptId] = {
            id: stubScriptId,
            name: `Auto-Generated Stub for Signpost`,
            code: `msgbox "${mapData.layout.name} - Ahead"\nend`,
            parsedCommands: [
              { command: 'msgbox', args: [`"${mapData.layout.name} - Ahead"`] },
              { command: 'end', args: [] }
            ]
          };
          fixCount++;
          fixLogs.push(`Generated stub script "${stubScriptId}" for signpost on map "${mapData.layout.name}".`);
        }
      }
    }

    // 2. Repair Wild Encounters
    for (const [mapId, table] of Object.entries(clone.wildEncounters)) {
      const allSlots = [...table.land, ...table.water, ...table.rockSmash];
      for (const slot of allSlots) {
        if (!clone.species[slot.species]) {
          slot.species = firstSpeciesId;
          fixCount++;
          fixLogs.push(`Replaced missing wild encounter species on map "${mapId}" with default "${firstSpeciesId}".`);
        }
        if (slot.minLevel < 1 || slot.minLevel > 100) {
          slot.minLevel = Math.max(1, Math.min(100, slot.minLevel));
          fixCount++;
          fixLogs.push(`Clamped wild minLevel to ${slot.minLevel} on map "${mapId}".`);
        }
        if (slot.maxLevel < 1 || slot.maxLevel > 100 || slot.maxLevel < slot.minLevel) {
          slot.maxLevel = Math.max(slot.minLevel, Math.min(100, slot.maxLevel));
          fixCount++;
          fixLogs.push(`Clamped wild maxLevel to ${slot.maxLevel} on map "${mapId}".`);
        }
      }
    }

    // 3. Repair Species Learnsets
    for (const [spId, sp] of Object.entries(clone.species)) {
      for (const lm of sp.learnset) {
        if (!clone.moves[lm.move]) {
          lm.move = firstMoveId;
          fixCount++;
          fixLogs.push(`Replaced missing learnset move in "${sp.name}" (${spId}) with default "${firstMoveId}".`);
        }
      }
    }

    // 4. Repair Trainer Parties
    for (const [tId, trainer] of Object.entries(clone.trainers)) {
      for (const p of trainer.party) {
        if (!clone.species[p.species]) {
          p.species = firstSpeciesId;
          fixCount++;
          fixLogs.push(`Replaced missing Pokémon in trainer "${trainer.name}" party with "${firstSpeciesId}".`);
        }
        if (p.heldItem && !clone.items[p.heldItem]) {
          delete p.heldItem;
          fixCount++;
          fixLogs.push(`Removed dangling held item reference from trainer "${trainer.name}" Pokémon.`);
        }
      }
    }

    return {
      repairedProject: clone,
      fixCount,
      fixLogs
    };
  }
}

