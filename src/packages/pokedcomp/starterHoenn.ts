/**
 * @file starterHoenn.ts
 * @package pokedcomp
 * @description Pre-decompiled complete project state for Pokémon Emerald (pokeemerald).
 */

import { DecompiledProject, MapBlock, MovementPermission } from './types.ts';

function createBlockGrid(width: number, height: number, fillMeta = 1, fillPerm: MovementPermission = 'passable'): MapBlock[] {
  const blocks: MapBlock[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Borders are impassable trees (metatile 12)
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        blocks.push({ metatileId: 12, permission: 'impassable', elevation: 3 });
      } else {
        blocks.push({ metatileId: fillMeta, permission: fillPerm, elevation: 0 });
      }
    }
  }
  return blocks;
}

// Generate Littleroot Town layout (20x20)
const littlerootBlocks = createBlockGrid(20, 20, 1, 'passable');
const setTile = (grid: MapBlock[], width: number, x: number, y: number, meta: number, perm: MovementPermission) => {
  if (x >= 0 && x < width && y >= 0 && y < 20) {
    grid[y * width + x] = { metatileId: meta, permission: perm, elevation: 0 };
  }
};

// Player House (top-left)
for (let y = 3; y <= 6; y++) {
  for (let x = 3; x <= 7; x++) {
    setTile(littlerootBlocks, 20, x, y, 20 + ((y - 3) * 5 + (x - 3)), 'impassable');
  }
}
// Player Door
setTile(littlerootBlocks, 20, 5, 7, 45, 'warp');

// Rival House (top-right)
for (let y = 3; y <= 6; y++) {
  for (let x = 12; x <= 16; x++) {
    setTile(littlerootBlocks, 20, x, y, 20 + ((y - 3) * 5 + (x - 12)), 'impassable');
  }
}
// Rival Door
setTile(littlerootBlocks, 20, 14, 7, 45, 'warp');

// Birch Lab (bottom-right)
for (let y = 11; y <= 15; y++) {
  for (let x = 10; x <= 16; x++) {
    setTile(littlerootBlocks, 20, x, y, 60 + ((y - 11) * 7 + (x - 10)), 'impassable');
  }
}
// Lab Door
setTile(littlerootBlocks, 20, 13, 16, 95, 'warp');

// Flower garden & paths
setTile(littlerootBlocks, 20, 6, 12, 15, 'passable');
setTile(littlerootBlocks, 20, 7, 12, 15, 'passable');
setTile(littlerootBlocks, 20, 8, 12, 15, 'passable');
// Route 101 north exit gap in tree wall
setTile(littlerootBlocks, 20, 9, 0, 2, 'passable');
setTile(littlerootBlocks, 20, 10, 0, 2, 'passable');

// Route 101 layout (20x24)
const route101Blocks = createBlockGrid(20, 24, 2, 'passable');
// Patch tall grass areas (metatile 18, permission tall_grass)
for (let y = 4; y <= 8; y++) {
  for (let x = 3; x <= 8; x++) {
    setTile(route101Blocks, 20, x, y, 18, 'tall_grass');
  }
}
for (let y = 12; y <= 18; y++) {
  for (let x = 11; x <= 16; x++) {
    setTile(route101Blocks, 20, x, y, 18, 'tall_grass');
  }
}
// Ledge jump
for (let x = 4; x <= 8; x++) {
  setTile(route101Blocks, 20, x, 10, 30, 'jump_down');
}
// South exit connecting to Littleroot Town
setTile(route101Blocks, 20, 9, 23, 2, 'warp');
setTile(route101Blocks, 20, 10, 23, 2, 'warp');
// North exit connecting to Oldale Town
setTile(route101Blocks, 20, 9, 0, 2, 'warp');
setTile(route101Blocks, 20, 10, 0, 2, 'warp');

export const STARTER_HOENN_PROJECT: DecompiledProject = {
  game: 'emerald',
  projectName: 'pokeemerald-hack',
  version: '1.0.0',
  maps: {
    'MAP_LITTLEROOT_TOWN': {
      layout: {
        id: 'MAP_LITTLEROOT_TOWN',
        name: 'Littleroot Town',
        width: 20,
        height: 20,
        tilesetId: 'gTileset_General',
        music: 'MUS_LITTLEROOT',
        blocks: littlerootBlocks
      },
      events: {
        npcs: [
          {
            id: 'NPC_MOM',
            localId: 1,
            x: 5,
            y: 8,
            spriteId: 'EVENT_OBJ_GFX_MOM',
            movementType: 'face_down',
            movementRangeX: 0,
            movementRangeY: 0,
            trainerType: 'none',
            sightRadius: 0,
            scriptId: 'LittlerootTown_EventScript_Mom'
          },
          {
            id: 'NPC_RIVAL_MAY',
            localId: 2,
            x: 14,
            y: 8,
            spriteId: 'EVENT_OBJ_GFX_RIVAL_MAY_NORMAL',
            movementType: 'wander_around',
            movementRangeX: 2,
            movementRangeY: 1,
            trainerType: 'none',
            sightRadius: 0,
            scriptId: 'LittlerootTown_EventScript_Rival'
          },
          {
            id: 'NPC_FAT_GUY',
            localId: 3,
            x: 7,
            y: 11,
            spriteId: 'EVENT_OBJ_GFX_FAT_MAN',
            movementType: 'wander_around',
            movementRangeX: 1,
            movementRangeY: 1,
            trainerType: 'none',
            sightRadius: 0,
            scriptId: 'LittlerootTown_EventScript_FatMan'
          },
          {
            id: 'NPC_BIRCH_ASSISTANT',
            localId: 4,
            x: 13,
            y: 17,
            spriteId: 'EVENT_OBJ_GFX_SCIENTIST_1',
            movementType: 'look_around',
            movementRangeX: 0,
            movementRangeY: 0,
            trainerType: 'none',
            sightRadius: 0,
            scriptId: 'LittlerootTown_EventScript_Assistant'
          }
        ],
        warps: [
          {
            id: 'WARP_PLAYER_HOUSE',
            x: 5,
            y: 7,
            elevation: 0,
            targetMapId: 'MAP_PLAYERS_HOUSE_1F',
            targetWarpId: 0
          },
          {
            id: 'WARP_RIVAL_HOUSE',
            x: 14,
            y: 7,
            elevation: 0,
            targetMapId: 'MAP_RIVALS_HOUSE_1F',
            targetWarpId: 0
          },
          {
            id: 'WARP_PROF_LAB',
            x: 13,
            y: 16,
            elevation: 0,
            targetMapId: 'MAP_BIRCH_LAB',
            targetWarpId: 0
          },
          {
            id: 'WARP_ROUTE_101',
            x: 9,
            y: 0,
            elevation: 0,
            targetMapId: 'MAP_ROUTE101',
            targetWarpId: 0
          }
        ],
        triggers: [
          {
            id: 'TRIGGER_ROUTE101_EXIT',
            x: 9,
            y: 1,
            elevation: 0,
            variable: 'VAR_LITTLEROOT_TOWN_STATE',
            varValue: 0,
            scriptId: 'LittlerootTown_EventScript_PreventLeavingWithoutPokemon'
          }
        ],
        signs: [
          {
            id: 'SIGN_TOWN_BOARD',
            x: 8,
            y: 9,
            elevation: 0,
            type: 'script',
            scriptId: 'LittlerootTown_EventScript_TownSign'
          },
          {
            id: 'SIGN_LAB',
            x: 11,
            y: 16,
            elevation: 0,
            type: 'script',
            scriptId: 'LittlerootTown_EventScript_BirchLabSign'
          }
        ]
      }
    },
    'MAP_ROUTE101': {
      layout: {
        id: 'MAP_ROUTE101',
        name: 'Route 101',
        width: 20,
        height: 24,
        tilesetId: 'gTileset_General',
        music: 'MUS_ROUTE101',
        blocks: route101Blocks
      },
      events: {
        npcs: [
          {
            id: 'NPC_ROUTE101_BOY',
            localId: 1,
            x: 6,
            y: 14,
            spriteId: 'EVENT_OBJ_GFX_BOY_1',
            movementType: 'look_around',
            movementRangeX: 0,
            movementRangeY: 0,
            trainerType: 'none',
            sightRadius: 0,
            scriptId: 'Route101_EventScript_Boy'
          }
        ],
        warps: [
          {
            id: 'WARP_TO_LITTLEROOT',
            x: 9,
            y: 23,
            elevation: 0,
            targetMapId: 'MAP_LITTLEROOT_TOWN',
            targetWarpId: 3
          },
          {
            id: 'WARP_TO_OLDALE',
            x: 9,
            y: 0,
            elevation: 0,
            targetMapId: 'MAP_OLDALE_TOWN',
            targetWarpId: 0
          }
        ],
        triggers: [],
        signs: [
          {
            id: 'SIGN_ROUTE101',
            x: 7,
            y: 19,
            elevation: 0,
            type: 'script',
            scriptId: 'Route101_EventScript_RouteSign'
          }
        ]
      }
    }
  },
  wildEncounters: {
    'MAP_ROUTE101': {
      mapId: 'MAP_ROUTE101',
      encounterRate: 21,
      land: [
        { slotIndex: 0, ratePercent: 20, species: 'SPECIES_POOCHYENA', minLevel: 2, maxLevel: 3 },
        { slotIndex: 1, ratePercent: 20, species: 'SPECIES_ZIGZAGOON', minLevel: 2, maxLevel: 3 },
        { slotIndex: 2, ratePercent: 10, species: 'SPECIES_WURMPLE', minLevel: 2, maxLevel: 3 },
        { slotIndex: 3, ratePercent: 10, species: 'SPECIES_POOCHYENA', minLevel: 3, maxLevel: 4 },
        { slotIndex: 4, ratePercent: 10, species: 'SPECIES_ZIGZAGOON', minLevel: 3, maxLevel: 4 },
        { slotIndex: 5, ratePercent: 10, species: 'SPECIES_WURMPLE', minLevel: 3, maxLevel: 4 },
        { slotIndex: 6, ratePercent: 5, species: 'SPECIES_RALTS', minLevel: 3, maxLevel: 4 },
        { slotIndex: 7, ratePercent: 5, species: 'SPECIES_SEEDOT', minLevel: 3, maxLevel: 4 },
        { slotIndex: 8, ratePercent: 4, species: 'SPECIES_TAILLOW', minLevel: 3, maxLevel: 4 },
        { slotIndex: 9, ratePercent: 4, species: 'SPECIES_LOTAD', minLevel: 3, maxLevel: 4 },
        { slotIndex: 10, ratePercent: 1, species: 'SPECIES_TORCHIC', minLevel: 5, maxLevel: 5 },
        { slotIndex: 11, ratePercent: 1, species: 'SPECIES_TREECKO', minLevel: 5, maxLevel: 5 },
      ],
      water: [
        { slotIndex: 0, ratePercent: 60, species: 'SPECIES_WINGULL', minLevel: 10, maxLevel: 25 },
        { slotIndex: 1, ratePercent: 30, species: 'SPECIES_PELIPPER', minLevel: 25, maxLevel: 30 },
        { slotIndex: 2, ratePercent: 5, species: 'SPECIES_TENTACOOL', minLevel: 5, maxLevel: 20 },
        { slotIndex: 3, ratePercent: 4, species: 'SPECIES_MARILL', minLevel: 15, maxLevel: 25 },
        { slotIndex: 4, ratePercent: 1, species: 'SPECIES_MAGIKARP', minLevel: 5, maxLevel: 10 }
      ],
      rockSmash: [
        { slotIndex: 0, ratePercent: 60, species: 'SPECIES_GEODUDE', minLevel: 5, maxLevel: 15 },
        { slotIndex: 1, ratePercent: 30, species: 'SPECIES_NOSEPASS', minLevel: 10, maxLevel: 20 },
        { slotIndex: 2, ratePercent: 5, species: 'SPECIES_GRAVELER', minLevel: 20, maxLevel: 25 },
        { slotIndex: 3, ratePercent: 4, species: 'SPECIES_MAGCARGO', minLevel: 25, maxLevel: 30 },
        { slotIndex: 4, ratePercent: 1, species: 'SPECIES_SHUCKLE', minLevel: 20, maxLevel: 25 }
      ],
      fishing: {
        oldRod: [
          { slotIndex: 0, ratePercent: 70, species: 'SPECIES_MAGIKARP', minLevel: 5, maxLevel: 10 },
          { slotIndex: 1, ratePercent: 30, species: 'SPECIES_TENTACOOL', minLevel: 5, maxLevel: 10 }
        ],
        goodRod: [
          { slotIndex: 0, ratePercent: 60, species: 'SPECIES_MAGIKARP', minLevel: 10, maxLevel: 20 },
          { slotIndex: 1, ratePercent: 20, species: 'SPECIES_TENTACOOL', minLevel: 10, maxLevel: 20 },
          { slotIndex: 2, ratePercent: 20, species: 'SPECIES_WAILMER', minLevel: 15, maxLevel: 25 }
        ],
        superRod: [
          { slotIndex: 0, ratePercent: 40, species: 'SPECIES_WAILMER', minLevel: 25, maxLevel: 35 },
          { slotIndex: 1, ratePercent: 40, species: 'SPECIES_SHARPEDO', minLevel: 30, maxLevel: 35 },
          { slotIndex: 2, ratePercent: 15, species: 'SPECIES_GYARADOS', minLevel: 30, maxLevel: 40 },
          { slotIndex: 3, ratePercent: 4, species: 'SPECIES_RELICANTH', minLevel: 30, maxLevel: 35 },
          { slotIndex: 4, ratePercent: 1, species: 'SPECIES_FEEBAS', minLevel: 20, maxLevel: 25 }
        ]
      }
    }
  },
  species: {
    'SPECIES_TREECKO': {
      id: 'SPECIES_TREECKO',
      dexNumber: 252,
      name: 'Treecko',
      types: ['GRASS', null],
      baseStats: { hp: 40, attack: 45, defense: 35, speed: 70, spAttack: 65, spDefense: 55 },
      abilities: ['Overgrow', 'Unburden'],
      catchRate: 45,
      baseExpYield: 62,
      genderRatio: 31,
      eggGroups: ['Monster', 'Dragon'],
      learnset: [
        { level: 1, move: 'MOVE_POUND' },
        { level: 1, move: 'MOVE_LEER' },
        { level: 6, move: 'MOVE_ABSORB' },
        { level: 11, move: 'MOVE_QUICK_ATTACK' },
        { level: 16, move: 'MOVE_PURSUIT' },
        { level: 21, move: 'MOVE_GIGA_DRAIN' },
        { level: 26, move: 'MOVE_AGILITY' },
        { level: 31, move: 'MOVE_SLAM' }
      ],
      evolutions: [{ method: 'level', targetSpecies: 'SPECIES_GROVYLE', parameter: 16 }],
      spriteColor: '#22c55e',
      iconType: 'grass'
    },
    'SPECIES_TORCHIC': {
      id: 'SPECIES_TORCHIC',
      dexNumber: 255,
      name: 'Torchic',
      types: ['FIRE', null],
      baseStats: { hp: 45, attack: 60, defense: 40, speed: 45, spAttack: 70, spDefense: 50 },
      abilities: ['Blaze', 'Speed Boost'],
      catchRate: 45,
      baseExpYield: 62,
      genderRatio: 31,
      eggGroups: ['Field', null],
      learnset: [
        { level: 1, move: 'MOVE_SCRATCH' },
        { level: 1, move: 'MOVE_GROWL' },
        { level: 7, move: 'MOVE_EMBER' },
        { level: 10, move: 'MOVE_SAND_ATTACK' },
        { level: 16, move: 'MOVE_PECK' },
        { level: 19, move: 'MOVE_FIRE_SPIN' },
        { level: 25, move: 'MOVE_QUICK_ATTACK' },
        { level: 28, move: 'MOVE_FLAMETHROWER' }
      ],
      evolutions: [{ method: 'level', targetSpecies: 'SPECIES_COMBUSKEN', parameter: 16 }],
      spriteColor: '#f97316',
      iconType: 'fire'
    },
    'SPECIES_MUDKIP': {
      id: 'SPECIES_MUDKIP',
      dexNumber: 258,
      name: 'Mudkip',
      types: ['WATER', null],
      baseStats: { hp: 50, attack: 70, defense: 50, speed: 40, spAttack: 50, spDefense: 50 },
      abilities: ['Torrent', 'Damp'],
      catchRate: 45,
      baseExpYield: 62,
      genderRatio: 31,
      eggGroups: ['Monster', 'Water 1'],
      learnset: [
        { level: 1, move: 'MOVE_TACKLE' },
        { level: 1, move: 'MOVE_GROWL' },
        { level: 6, move: 'MOVE_MUD_SLAP' },
        { level: 10, move: 'MOVE_WATER_GUN' },
        { level: 15, move: 'MOVE_BIDE' },
        { level: 19, move: 'MOVE_FORESIGHT' },
        { level: 24, move: 'MOVE_MUD_SPORT' },
        { level: 28, move: 'MOVE_TAKE_DOWN' }
      ],
      evolutions: [{ method: 'level', targetSpecies: 'SPECIES_MARSHTOMP', parameter: 16 }],
      spriteColor: '#38bdf8',
      iconType: 'water'
    },
    'SPECIES_POOCHYENA': {
      id: 'SPECIES_POOCHYENA',
      dexNumber: 261,
      name: 'Poochyena',
      types: ['DARK', null],
      baseStats: { hp: 35, attack: 55, defense: 35, speed: 35, spAttack: 30, spDefense: 30 },
      abilities: ['Run Away', 'Quick Feet'],
      catchRate: 255,
      baseExpYield: 56,
      genderRatio: 127,
      eggGroups: ['Field', null],
      learnset: [
        { level: 1, move: 'MOVE_TACKLE' },
        { level: 5, move: 'MOVE_HOWL' },
        { level: 9, move: 'MOVE_SAND_ATTACK' },
        { level: 13, move: 'MOVE_BITE' },
        { level: 17, move: 'MOVE_ODOR_SLEUTH' }
      ],
      evolutions: [{ method: 'level', targetSpecies: 'SPECIES_MIGHTYENA', parameter: 18 }],
      spriteColor: '#64748b',
      iconType: 'dark'
    },
    'SPECIES_ZIGZAGOON': {
      id: 'SPECIES_ZIGZAGOON',
      dexNumber: 263,
      name: 'Zigzagoon',
      types: ['NORMAL', null],
      baseStats: { hp: 38, attack: 30, defense: 41, speed: 60, spAttack: 30, spDefense: 41 },
      abilities: ['Pickup', 'Gluttony'],
      catchRate: 255,
      baseExpYield: 60,
      genderRatio: 127,
      eggGroups: ['Field', null],
      learnset: [
        { level: 1, move: 'MOVE_TACKLE' },
        { level: 1, move: 'MOVE_GROWL' },
        { level: 5, move: 'MOVE_TAIL_WHIP' },
        { level: 9, move: 'MOVE_HEADBUTT' },
        { level: 13, move: 'MOVE_BABY_DOLL_EYES' }
      ],
      evolutions: [{ method: 'level', targetSpecies: 'SPECIES_LINOONE', parameter: 20 }],
      spriteColor: '#a1a1aa',
      iconType: 'normal'
    },
    'SPECIES_RAYQUAZA': {
      id: 'SPECIES_RAYQUAZA',
      dexNumber: 384,
      name: 'Rayquaza',
      types: ['DRAGON', 'FLYING'],
      baseStats: { hp: 105, attack: 150, defense: 90, speed: 95, spAttack: 150, spDefense: 90 },
      abilities: ['Air Lock', null],
      catchRate: 3,
      baseExpYield: 306,
      genderRatio: 255,
      eggGroups: ['Undiscovered', null],
      learnset: [
        { level: 1, move: 'MOVE_TWISTER' },
        { level: 5, move: 'MOVE_SCARY_FACE' },
        { level: 15, move: 'MOVE_DRAGON_BREATH' },
        { level: 20, move: 'MOVE_ANCIENT_POWER' },
        { level: 35, move: 'MOVE_CRUNCH' },
        { level: 50, move: 'MOVE_DRAGON_CLAW' },
        { level: 65, move: 'MOVE_FLY' },
        { level: 75, move: 'MOVE_OUTRAGE' },
        { level: 90, move: 'MOVE_HYPER_BEAM' }
      ],
      evolutions: [],
      spriteColor: '#10b981',
      iconType: 'dragon'
    }
  },
  items: {
    'ITEM_POTION': {
      id: 'ITEM_POTION',
      name: 'Potion',
      pocket: 'items',
      price: 300,
      description: 'Restores the HP of a Pokémon by 20 points.',
      battleUsage: true,
      fieldUsage: true
    },
    'ITEM_SUPER_POTION': {
      id: 'ITEM_SUPER_POTION',
      name: 'Super Potion',
      pocket: 'items',
      price: 700,
      description: 'Restores the HP of a Pokémon by 50 points.',
      battleUsage: true,
      fieldUsage: true
    },
    'ITEM_POKE_BALL': {
      id: 'ITEM_POKE_BALL',
      name: 'Poké Ball',
      pocket: 'poke_balls',
      price: 200,
      description: 'A tool used for catching wild Pokémon.',
      battleUsage: true,
      fieldUsage: false
    },
    'ITEM_GREAT_BALL': {
      id: 'ITEM_GREAT_BALL',
      name: 'Great Ball',
      pocket: 'poke_balls',
      price: 600,
      description: 'A good Ball with a higher catch rate than a standard Poké Ball.',
      battleUsage: true,
      fieldUsage: false
    },
    'ITEM_RARE_CANDY': {
      id: 'ITEM_RARE_CANDY',
      name: 'Rare Candy',
      pocket: 'items',
      price: 4800,
      description: 'A candy that raises the level of a Pokémon by one.',
      battleUsage: false,
      fieldUsage: true
    },
    'ITEM_RUNNING_SHOES': {
      id: 'ITEM_RUNNING_SHOES',
      name: 'Running Shoes',
      pocket: 'key_items',
      price: 0,
      description: 'Shoes that enable you to run much faster by holding the B Button.',
      battleUsage: false,
      fieldUsage: true
    }
  },
  moves: {
    'MOVE_TACKLE': {
      id: 'MOVE_TACKLE',
      name: 'Tackle',
      type: 'NORMAL',
      category: 'physical',
      power: 40,
      accuracy: 100,
      pp: 35,
      priority: 0,
      description: 'A physical attack in which the user charges and slams into the target.',
      animationFrames: ['step_forward', 'tackle_impact', 'shake_target', 'step_back']
    },
    'MOVE_SCRATCH': {
      id: 'MOVE_SCRATCH',
      name: 'Scratch',
      type: 'NORMAL',
      category: 'physical',
      power: 40,
      accuracy: 100,
      pp: 35,
      priority: 0,
      description: 'Hard, pointed, sharp claws rake the target to inflict damage.',
      animationFrames: ['claw_slash', 'scratch_marks', 'target_flash']
    },
    'MOVE_EMBER': {
      id: 'MOVE_EMBER',
      name: 'Ember',
      type: 'FIRE',
      category: 'special',
      power: 40,
      accuracy: 100,
      pp: 25,
      priority: 0,
      description: 'The target is attacked with small flames. May inflict a burn.',
      animationFrames: ['fire_spark', 'spark_travel', 'burst_flame', 'burn_indicator']
    },
    'MOVE_WATER_GUN': {
      id: 'MOVE_WATER_GUN',
      name: 'Water Gun',
      type: 'WATER',
      category: 'special',
      power: 40,
      accuracy: 100,
      pp: 25,
      priority: 0,
      description: 'The target is blasted with a forceful shot of water.',
      animationFrames: ['water_stream', 'splash_burst', 'water_droplets']
    },
    'MOVE_DRAGON_CLAW': {
      id: 'MOVE_DRAGON_CLAW',
      name: 'Dragon Claw',
      type: 'DRAGON',
      category: 'physical',
      power: 80,
      accuracy: 100,
      pp: 15,
      priority: 0,
      description: 'The user slashes the target with huge, sharp claws.',
      animationFrames: ['dragon_glow', 'dual_slash', 'energy_shatter', 'shake_screen']
    }
  },
  trainers: {
    'TRAINER_MAY_ROUTE103': {
      id: 'TRAINER_MAY_ROUTE103',
      trainerClass: 'PKMN_TRAINER',
      name: 'May',
      spriteId: 'TRAINER_PIC_MAY',
      introText: "Let's see what kind of Pokémon you caught on Route 101!",
      defeatText: 'Wow, you really have a natural talent for battling!',
      party: [
        {
          species: 'SPECIES_TORCHIC',
          level: 5,
          heldItem: 'ITEM_POTION',
          moves: ['MOVE_SCRATCH', 'MOVE_GROWL']
        }
      ]
    },
    'TRAINER_CALVIN': {
      id: 'TRAINER_CALVIN',
      trainerClass: 'YOUNGSTER',
      name: 'Calvin',
      spriteId: 'TRAINER_PIC_YOUNGSTER',
      introText: 'If I win, you have to trade me your Pokémon!',
      defeatText: 'Aww, I lost again! Back to practicing...',
      party: [
        {
          species: 'SPECIES_POOCHYENA',
          level: 4,
          moves: ['MOVE_TACKLE', 'MOVE_HOWL']
        }
      ]
    }
  },
  scripts: {
    'LittlerootTown_EventScript_Mom': {
      id: 'LittlerootTown_EventScript_Mom',
      name: 'LittlerootTown_EventScript_Mom',
      code: `LittlerootTown_EventScript_Mom::
\tlock
\tfaceplayer
\tmsgbox LittlerootTown_Text_MomGreeting, MSGBOX_DEFAULT
\tplayfanfare MUS_HEAL
\twaitfanfare
\tspecial HealPlayerParty
\tmsgbox LittlerootTown_Text_TakeCare, MSGBOX_DEFAULT
\trelease
\tend`,
      parsedCommands: [
        { command: 'lock', args: [] },
        { command: 'faceplayer', args: [] },
        { command: 'msgbox', args: ['LittlerootTown_Text_MomGreeting', 'MSGBOX_DEFAULT'] },
        { command: 'playfanfare', args: ['MUS_HEAL'] },
        { command: 'waitfanfare', args: [] },
        { command: 'special', args: ['HealPlayerParty'] },
        { command: 'msgbox', args: ['LittlerootTown_Text_TakeCare', 'MSGBOX_DEFAULT'] },
        { command: 'release', args: [] },
        { command: 'end', args: [] }
      ]
    },
    'LittlerootTown_EventScript_TownSign': {
      id: 'LittlerootTown_EventScript_TownSign',
      name: 'LittlerootTown_EventScript_TownSign',
      code: `LittlerootTown_EventScript_TownSign::
\tmsgbox LittlerootTown_Text_TownSign, MSGBOX_SIGN
\tend`,
      parsedCommands: [
        { command: 'msgbox', args: ['LittlerootTown_Text_TownSign', 'MSGBOX_SIGN'] },
        { command: 'end', args: [] }
      ]
    },
    'LittlerootTown_EventScript_BirchLabSign': {
      id: 'LittlerootTown_EventScript_BirchLabSign',
      name: 'LittlerootTown_EventScript_BirchLabSign',
      code: `LittlerootTown_EventScript_BirchLabSign::
\tmsgbox LittlerootTown_Text_BirchLabSign, MSGBOX_SIGN
\tend`,
      parsedCommands: [
        { command: 'msgbox', args: ['LittlerootTown_Text_BirchLabSign', 'MSGBOX_SIGN'] },
        { command: 'end', args: [] }
      ]
    }
  }
};
