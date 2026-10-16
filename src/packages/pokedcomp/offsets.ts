/**
 * @file offsets.ts
 * @package pokedcomp
 * @description Engine-specific ROM table pointer definitions for dynamic extraction.
 */

export const OFFSETS = {
  emerald: {
    speciesBaseStats: 0x3203CC,
    mapHeaderTable: 0x350000, // Placeholder - needs verification
    wildEncounters: 0x539C20,
    trainerParties: 0x310040,
    itemTable: 0x583FC0,
    moveTable: 0x254784, // Placeholder
    tilesetTable: 0x300000, // Placeholder
  },
  firered: {
    speciesBaseStats: 0x254784,
    mapHeaderTable: 0x280000, // Placeholder - needs verification
    wildEncounters: 0x3C9B80,
    trainerParties: 0x239A00,
    itemTable: 0x3DAE80,
    moveTable: 0x1E0000, // Placeholder
    tilesetTable: 0x200000, // Placeholder
  }
};
