/**
 * @file starterKanto.ts
 * @package pokedcomp
 * @description Pre-decompiled complete project state for Pokémon FireRed (pokefirered).
 */

import type { DecompiledProject, MapBlock, MovementPermission } from './types.ts';

function createBlockGrid(width: number, height: number, fillMeta = 1, fillPerm: MovementPermission = 'passable'): MapBlock[] {
  const blocks: MapBlock[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        blocks.push({ metatileId: 10, permission: 'impassable', elevation: 3 });
      } else {
        blocks.push({ metatileId: fillMeta, permission: fillPerm, elevation: 0 });
      }
    }
  }
  return blocks;
}

// Generate Pallet Town layout (20x20)
const palletBlocks = createBlockGrid(20, 20, 1, 'passable');
const setTile = (grid: MapBlock[], width: number, x: number, y: number, meta: number, perm: MovementPermission) => {
  if (x >= 0 && x < width && y >= 0 && y < 20) {
    grid[y * width + x] = { metatileId: meta, permission: perm, elevation: 0 };
  }
};

// Red's House (top-left)
for (let y = 3; y <= 6; y++) {
  for (let x = 3; x <= 7; x++) {
    setTile(palletBlocks, 20, x, y, 25 + ((y - 3) * 5 + (x - 3)), 'impassable');
  }
}
setTile(palletBlocks, 20, 5, 7, 48, 'warp'); // Red Door

// Blue's House (top-right)
for (let y = 3; y <= 6; y++) {
  for (let x = 12; x <= 16; x++) {
    setTile(palletBlocks, 20, x, y, 25 + ((y - 3) * 5 + (x - 12)), 'impassable');
  }
}
setTile(palletBlocks, 20, 14, 7, 48, 'warp'); // Blue Door

// Oak's Lab (bottom-right)
for (let y = 11; y <= 15; y++) {
  for (let x = 11; x <= 17; x++) {
    setTile(palletBlocks, 20, x, y, 70 + ((y - 11) * 7 + (x - 11)), 'impassable');
  }
}
setTile(palletBlocks, 20, 14, 16, 98, 'warp'); // Lab Door

// South water ocean to Cinnabar (water/surf permission)
for (let y = 17; y <= 19; y++) {
  for (let x = 4; x <= 9; x++) {
    setTile(palletBlocks, 20, x, y, 5, 'water');
  }
}

// Route 1 layout (20x24)
const route1Blocks = createBlockGrid(20, 24, 1, 'passable');
for (let y = 3; y <= 9; y++) {
  for (let x = 4; x <= 8; x++) {
    setTile(route1Blocks, 20, x, y, 18, 'tall_grass');
  }
}
for (let y = 13; y <= 19; y++) {
  for (let x = 11; x <= 16; x++) {
    setTile(route1Blocks, 20, x, y, 18, 'tall_grass');
  }
}
// Route 1 ledges
for (let x = 5; x <= 10; x++) {
  setTile(route1Blocks, 20, x, 11, 35, 'jump_down');
}

export const STARTER_KANTO_PROJECT: DecompiledProject = {
  game: 'firered',
  projectName: 'pokefirered-hack',
  version: '1.0.0',
  maps: {
    'MAP_PALLET_TOWN': {
      layout: {
        id: 'MAP_PALLET_TOWN',
        name: 'Pallet Town',
        width: 20,
        height: 20,
        tilesetId: 'gTileset_PalletTown',
        music: 'MUS_PALLET',
        blocks: palletBlocks
      },
      events: {
        npcs: [
          {
            id: 'NPC_PROF_OAK',
            localId: 1,
            x: 9,
            y: 2,
            spriteId: 'EVENT_OBJ_GFX_PROF_OAK',
            movementType: 'face_down',
            movementRangeX: 0,
            movementRangeY: 0,
            trainerType: 'none',
            sightRadius: 0,
            scriptId: 'PalletTown_EventScript_ProfOak'
          },
          {
            id: 'NPC_PALLET_GIRL',
            localId: 2,
            x: 4,
            y: 10,
            spriteId: 'EVENT_OBJ_GFX_GIRL_1',
            movementType: 'wander_around',
            movementRangeX: 1,
            movementRangeY: 1,
            trainerType: 'none',
            sightRadius: 0,
            scriptId: 'PalletTown_EventScript_Girl'
          },
          {
            id: 'NPC_TECH_GUY',
            localId: 3,
            x: 10,
            y: 11,
            spriteId: 'EVENT_OBJ_GFX_FAT_MAN',
            movementType: 'look_around',
            movementRangeX: 0,
            movementRangeY: 0,
            trainerType: 'none',
            sightRadius: 0,
            scriptId: 'PalletTown_EventScript_TechGuy'
          }
        ],
        warps: [
          {
            id: 'WARP_REDS_HOUSE',
            x: 5,
            y: 7,
            elevation: 0,
            targetMapId: 'MAP_REDS_HOUSE_1F',
            targetWarpId: 0
          },
          {
            id: 'WARP_BLUES_HOUSE',
            x: 14,
            y: 7,
            elevation: 0,
            targetMapId: 'MAP_BLUES_HOUSE_1F',
            targetWarpId: 0
          },
          {
            id: 'WARP_OAKS_LAB',
            x: 14,
            y: 16,
            elevation: 0,
            targetMapId: 'MAP_OAKS_LAB',
            targetWarpId: 0
          }
        ],
        triggers: [
          {
            id: 'TRIGGER_ROUTE1_STOP',
            x: 9,
            y: 1,
            elevation: 0,
            variable: 'VAR_MAP_SCENE_PALLET_TOWN_OAK',
            varValue: 0,
            scriptId: 'PalletTown_EventScript_OakStopGrass'
          }
        ],
        signs: [
          {
            id: 'SIGN_PALLET_TOWN',
            x: 8,
            y: 9,
            elevation: 0,
            type: 'script',
            scriptId: 'PalletTown_EventScript_TownSign'
          },
          {
            id: 'SIGN_OAKS_LAB',
            x: 12,
            y: 16,
            elevation: 0,
            type: 'script',
            scriptId: 'PalletTown_EventScript_LabSign'
          }
        ]
      }
    },
    'MAP_ROUTE1': {
      layout: {
        id: 'MAP_ROUTE1',
        name: 'Route 1',
        width: 20,
        height: 24,
        tilesetId: 'gTileset_Route1',
        music: 'MUS_ROUTE1',
        blocks: route1Blocks
      },
      events: {
        npcs: [
          {
            id: 'NPC_ROUTE1_POTION_CLERK',
            localId: 1,
            x: 6,
            y: 15,
            spriteId: 'EVENT_OBJ_GFX_CLERK',
            movementType: 'face_right',
            movementRangeX: 0,
            movementRangeY: 0,
            trainerType: 'none',
            sightRadius: 0,
            scriptId: 'Route1_EventScript_PotionClerk'
          }
        ],
        warps: [
          {
            id: 'WARP_PALLET',
            x: 9,
            y: 23,
            elevation: 0,
            targetMapId: 'MAP_PALLET_TOWN',
            targetWarpId: 0
          },
          {
            id: 'WARP_VIRIDIAN',
            x: 9,
            y: 0,
            elevation: 0,
            targetMapId: 'MAP_VIRIDIAN_CITY',
            targetWarpId: 0
          }
        ],
        triggers: [],
        signs: [
          {
            id: 'SIGN_ROUTE1',
            x: 8,
            y: 18,
            elevation: 0,
            type: 'script',
            scriptId: 'Route1_EventScript_RouteSign'
          }
        ]
      }
    }
  },
  wildEncounters: {
    'MAP_ROUTE1': {
      mapId: 'MAP_ROUTE1',
      encounterRate: 25,
      land: [
        { slotIndex: 0, ratePercent: 50, species: 'SPECIES_PIDGEY', minLevel: 2, maxLevel: 5 },
        { slotIndex: 1, ratePercent: 50, species: 'SPECIES_RATTATA', minLevel: 2, maxLevel: 4 },
        { slotIndex: 2, ratePercent: 0, species: 'SPECIES_PIDGEY', minLevel: 3, maxLevel: 5 },
        { slotIndex: 3, ratePercent: 0, species: 'SPECIES_RATTATA', minLevel: 3, maxLevel: 4 },
        { slotIndex: 4, ratePercent: 0, species: 'SPECIES_PIDGEY', minLevel: 4, maxLevel: 5 },
        { slotIndex: 5, ratePercent: 0, species: 'SPECIES_RATTATA', minLevel: 4, maxLevel: 5 },
        { slotIndex: 6, ratePercent: 0, species: 'SPECIES_PIDGEY', minLevel: 5, maxLevel: 5 },
        { slotIndex: 7, ratePercent: 0, species: 'SPECIES_RATTATA', minLevel: 5, maxLevel: 5 },
        { slotIndex: 8, ratePercent: 0, species: 'SPECIES_PIDGEY', minLevel: 5, maxLevel: 6 },
        { slotIndex: 9, ratePercent: 0, species: 'SPECIES_RATTATA', minLevel: 5, maxLevel: 6 },
        { slotIndex: 10, ratePercent: 0, species: 'SPECIES_PIDGEY', minLevel: 6, maxLevel: 7 },
        { slotIndex: 11, ratePercent: 0, species: 'SPECIES_RATTATA', minLevel: 6, maxLevel: 7 },
      ],
      water: [
        { slotIndex: 0, ratePercent: 100, species: 'SPECIES_TENTACOOL', minLevel: 5, maxLevel: 40 },
        { slotIndex: 1, ratePercent: 0, species: 'SPECIES_TENTACOOL', minLevel: 5, maxLevel: 40 },
        { slotIndex: 2, ratePercent: 0, species: 'SPECIES_TENTACOOL', minLevel: 5, maxLevel: 40 },
        { slotIndex: 3, ratePercent: 0, species: 'SPECIES_TENTACOOL', minLevel: 5, maxLevel: 40 },
        { slotIndex: 4, ratePercent: 0, species: 'SPECIES_TENTACOOL', minLevel: 5, maxLevel: 40 }
      ],
      rockSmash: [],
      fishing: {
        oldRod: [
          { slotIndex: 0, ratePercent: 100, species: 'SPECIES_MAGIKARP', minLevel: 5, maxLevel: 5 },
          { slotIndex: 1, ratePercent: 0, species: 'SPECIES_MAGIKARP', minLevel: 5, maxLevel: 5 }
        ],
        goodRod: [
          { slotIndex: 0, ratePercent: 60, species: 'SPECIES_POLIWAG', minLevel: 5, maxLevel: 15 },
          { slotIndex: 1, ratePercent: 20, species: 'SPECIES_GOLDEEN', minLevel: 5, maxLevel: 15 },
          { slotIndex: 2, ratePercent: 20, species: 'SPECIES_MAGIKARP', minLevel: 5, maxLevel: 15 }
        ],
        superRod: [
          { slotIndex: 0, ratePercent: 40, species: 'SPECIES_POLIWHIRL', minLevel: 15, maxLevel: 25 },
          { slotIndex: 1, ratePercent: 40, species: 'SPECIES_SEAKING', minLevel: 20, maxLevel: 30 },
          { slotIndex: 2, ratePercent: 15, species: 'SPECIES_GYARADOS', minLevel: 15, maxLevel: 25 },
          { slotIndex: 3, ratePercent: 4, species: 'SPECIES_PSYDUCK', minLevel: 15, maxLevel: 35 },
          { slotIndex: 4, ratePercent: 1, species: 'SPECIES_SLOWPOKE', minLevel: 15, maxLevel: 35 }
        ]
      }
    }
  },
  species: {
    'SPECIES_BULBASAUR': {
      id: 'SPECIES_BULBASAUR',
      dexNumber: 1,
      name: 'Bulbasaur',
      types: ['GRASS', 'POISON'],
      baseStats: { hp: 45, attack: 49, defense: 49, speed: 45, spAttack: 65, spDefense: 65 },
      abilities: ['Overgrow', 'Chlorophyll'],
      catchRate: 45,
      baseExpYield: 64,
      genderRatio: 31,
      eggGroups: ['Monster', 'Grass'],
      learnset: [
        { level: 1, move: 'MOVE_TACKLE' },
        { level: 4, move: 'MOVE_GROWL' },
        { level: 7, move: 'MOVE_LEECH_SEED' },
        { level: 10, move: 'MOVE_VINE_WHIP' },
        { level: 15, move: 'MOVE_POISON_POWDER' },
        { level: 20, move: 'MOVE_RAZOR_LEAF' },
        { level: 25, move: 'MOVE_SWEET_SCENT' },
        { level: 32, move: 'MOVE_SOLAR_BEAM' }
      ],
      evolutions: [{ method: 'level', targetSpecies: 'SPECIES_IVYSAUR', parameter: 16 }],
      spriteColor: '#10b981',
      iconType: 'grass'
    },
    'SPECIES_CHARMANDER': {
      id: 'SPECIES_CHARMANDER',
      dexNumber: 4,
      name: 'Charmander',
      types: ['FIRE', null],
      baseStats: { hp: 39, attack: 52, defense: 43, speed: 65, spAttack: 60, spDefense: 50 },
      abilities: ['Blaze', 'Solar Power'],
      catchRate: 45,
      baseExpYield: 62,
      genderRatio: 31,
      eggGroups: ['Monster', 'Dragon'],
      learnset: [
        { level: 1, move: 'MOVE_SCRATCH' },
        { level: 1, move: 'MOVE_GROWL' },
        { level: 7, move: 'MOVE_EMBER' },
        { level: 13, move: 'MOVE_SMOKESCREEN' },
        { level: 19, move: 'MOVE_SCARY_FACE' },
        { level: 25, move: 'MOVE_FLAMETHROWER' },
        { level: 31, move: 'MOVE_SLASH' }
      ],
      evolutions: [{ method: 'level', targetSpecies: 'SPECIES_CHARMELEON', parameter: 16 }],
      spriteColor: '#ea580c',
      iconType: 'fire'
    },
    'SPECIES_SQUIRTLE': {
      id: 'SPECIES_SQUIRTLE',
      dexNumber: 7,
      name: 'Squirtle',
      types: ['WATER', null],
      baseStats: { hp: 44, attack: 48, defense: 65, speed: 43, spAttack: 50, spDefense: 64 },
      abilities: ['Torrent', 'Rain Dish'],
      catchRate: 45,
      baseExpYield: 63,
      genderRatio: 31,
      eggGroups: ['Monster', 'Water 1'],
      learnset: [
        { level: 1, move: 'MOVE_TACKLE' },
        { level: 4, move: 'MOVE_TAIL_WHIP' },
        { level: 7, move: 'MOVE_WATER_GUN' },
        { level: 10, move: 'MOVE_WITHDRAW' },
        { level: 13, move: 'MOVE_BUBBLE' },
        { level: 18, move: 'MOVE_BITE' },
        { level: 23, move: 'MOVE_RAPID_SPIN' },
        { level: 28, move: 'MOVE_PROTECT' },
        { level: 33, move: 'MOVE_RAIN_DANCE' }
      ],
      evolutions: [{ method: 'level', targetSpecies: 'SPECIES_WARTORTLE', parameter: 16 }],
      spriteColor: '#0284c7',
      iconType: 'water'
    },
    'SPECIES_PIDGEY': {
      id: 'SPECIES_PIDGEY',
      dexNumber: 16,
      name: 'Pidgey',
      types: ['NORMAL', 'FLYING'],
      baseStats: { hp: 40, attack: 45, defense: 40, speed: 56, spAttack: 35, spDefense: 35 },
      abilities: ['Keen Eye', 'Tangled Feet'],
      catchRate: 255,
      baseExpYield: 50,
      genderRatio: 127,
      eggGroups: ['Flying', null],
      learnset: [
        { level: 1, move: 'MOVE_TACKLE' },
        { level: 5, move: 'MOVE_SAND_ATTACK' },
        { level: 9, move: 'MOVE_GUST' },
        { level: 13, move: 'MOVE_QUICK_ATTACK' },
        { level: 19, move: 'MOVE_WHIRLWIND' }
      ],
      evolutions: [{ method: 'level', targetSpecies: 'SPECIES_PIDGEOTTO', parameter: 18 }],
      spriteColor: '#d97706',
      iconType: 'flying'
    },
    'SPECIES_RATTATA': {
      id: 'SPECIES_RATTATA',
      dexNumber: 19,
      name: 'Rattata',
      types: ['NORMAL', null],
      baseStats: { hp: 30, attack: 56, defense: 35, speed: 72, spAttack: 25, spDefense: 35 },
      abilities: ['Run Away', 'Guts'],
      catchRate: 255,
      baseExpYield: 51,
      genderRatio: 127,
      eggGroups: ['Field', null],
      learnset: [
        { level: 1, move: 'MOVE_TACKLE' },
        { level: 1, move: 'MOVE_TAIL_WHIP' },
        { level: 4, move: 'MOVE_QUICK_ATTACK' },
        { level: 7, move: 'MOVE_FOCUS_ENERGY' },
        { level: 10, move: 'MOVE_BITE' }
      ],
      evolutions: [{ method: 'level', targetSpecies: 'SPECIES_RATICATE', parameter: 20 }],
      spriteColor: '#a855f7',
      iconType: 'normal'
    },
    'SPECIES_PIKACHU': {
      id: 'SPECIES_PIKACHU',
      dexNumber: 25,
      name: 'Pikachu',
      types: ['ELECTRIC', null],
      baseStats: { hp: 35, attack: 55, defense: 40, speed: 90, spAttack: 50, spDefense: 50 },
      abilities: ['Static', 'Lightning Rod'],
      catchRate: 190,
      baseExpYield: 112,
      genderRatio: 127,
      eggGroups: ['Field', 'Fairy'],
      learnset: [
        { level: 1, move: 'MOVE_THUNDER_SHOCK' },
        { level: 1, move: 'MOVE_GROWL' },
        { level: 6, move: 'MOVE_TAIL_WHIP' },
        { level: 8, move: 'MOVE_THUNDER_WAVE' },
        { level: 11, move: 'MOVE_QUICK_ATTACK' },
        { level: 15, move: 'MOVE_DOUBLE_TEAM' },
        { level: 20, move: 'MOVE_SLAM' },
        { level: 26, move: 'MOVE_THUNDERBOLT' }
      ],
      evolutions: [{ method: 'item', targetSpecies: 'SPECIES_RAICHU', parameter: 'ITEM_THUNDER_STONE' }],
      spriteColor: '#eab308',
      iconType: 'electric'
    }
  },
  items: {
    'ITEM_POKE_BALL': {
      id: 'ITEM_POKE_BALL',
      name: 'Poké Ball',
      pocket: 'poke_balls',
      price: 200,
      description: 'A capsule device for catching wild Pokémon.',
      battleUsage: true,
      fieldUsage: false
    },
    'ITEM_POTION': {
      id: 'ITEM_POTION',
      name: 'Potion',
      pocket: 'items',
      price: 300,
      description: 'Restores 20 HP to a single Pokémon.',
      battleUsage: true,
      fieldUsage: true
    },
    'ITEM_ANTIDOTE': {
      id: 'ITEM_ANTIDOTE',
      name: 'Antidote',
      pocket: 'items',
      price: 100,
      description: 'An antidote for curing a poisoned Pokémon.',
      battleUsage: true,
      fieldUsage: true
    },
    'ITEM_OAKS_PARCEL': {
      id: 'ITEM_OAKS_PARCEL',
      name: "Oak's Parcel",
      pocket: 'key_items',
      price: 0,
      description: 'A parcel delivered from the Viridian Mart to Prof. Oak.',
      battleUsage: false,
      fieldUsage: false
    },
    'ITEM_TOWN_MAP': {
      id: 'ITEM_TOWN_MAP',
      name: 'Town Map',
      pocket: 'key_items',
      price: 0,
      description: 'A detailed map of the Kanto region that can be viewed anytime.',
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
      description: 'A full-body charge attack.',
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
      description: 'Scratches the foe with sharp claws.',
      animationFrames: ['claw_slash', 'scratch_marks', 'target_flash']
    },
    'MOVE_VINE_WHIP': {
      id: 'MOVE_VINE_WHIP',
      name: 'Vine Whip',
      type: 'GRASS',
      category: 'physical',
      power: 45,
      accuracy: 100,
      pp: 25,
      priority: 0,
      description: 'Strikes the target with slender, whip-like vines.',
      animationFrames: ['vine_extend', 'whip_strike', 'leaf_particles']
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
      description: 'An attack that may inflict a burn on the target.',
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
      description: 'Squirts water to attack the target.',
      animationFrames: ['water_stream', 'splash_burst', 'water_droplets']
    },
    'MOVE_THUNDER_SHOCK': {
      id: 'MOVE_THUNDER_SHOCK',
      name: 'Thunder Shock',
      type: 'ELECTRIC',
      category: 'special',
      power: 40,
      accuracy: 100,
      pp: 30,
      priority: 0,
      description: 'An electric shock that may cause paralysis.',
      animationFrames: ['electric_spark', 'lightning_bolt', 'shock_glow']
    }
  },
  trainers: {
    'TRAINER_BLUE_ROUTE22': {
      id: 'TRAINER_BLUE_ROUTE22',
      trainerClass: 'RIVAL_EARLY',
      name: 'Blue',
      spriteId: 'TRAINER_PIC_RIVAL_BLUE',
      introText: 'Hey! Out of my way! I have a date with the Pokémon League!',
      defeatText: 'What? Unbelievable! I picked the wrong Pokémon!',
      party: [
        {
          species: 'SPECIES_CHARMANDER',
          level: 5,
          heldItem: 'ITEM_POTION',
          moves: ['MOVE_SCRATCH', 'MOVE_GROWL']
        }
      ]
    }
  },
  scripts: {
    'PalletTown_EventScript_ProfOak': {
      id: 'PalletTown_EventScript_ProfOak',
      name: 'PalletTown_EventScript_ProfOak',
      code: `PalletTown_EventScript_ProfOak::
\tlock
\tfaceplayer
\tmsgbox PalletTown_Text_OakGreeting, MSGBOX_DEFAULT
\tmsgbox PalletTown_Text_WildGrassDanger, MSGBOX_DEFAULT
\trelease
\tend`,
      parsedCommands: [
        { command: 'lock', args: [] },
        { command: 'faceplayer', args: [] },
        { command: 'msgbox', args: ['PalletTown_Text_OakGreeting', 'MSGBOX_DEFAULT'] },
        { command: 'msgbox', args: ['PalletTown_Text_WildGrassDanger', 'MSGBOX_DEFAULT'] },
        { command: 'release', args: [] },
        { command: 'end', args: [] }
      ]
    },
    'PalletTown_EventScript_TownSign': {
      id: 'PalletTown_EventScript_TownSign',
      name: 'PalletTown_EventScript_TownSign',
      code: `PalletTown_EventScript_TownSign::
\tmsgbox PalletTown_Text_TownSign, MSGBOX_SIGN
\tend`,
      parsedCommands: [
        { command: 'msgbox', args: ['PalletTown_Text_TownSign', 'MSGBOX_SIGN'] },
        { command: 'end', args: [] }
      ]
    }
  }
};
