/**
 * @file wasmEmulator.ts
 * @package pokecompiler
 * @description In-browser interactive GBA emulator engine with live world traversal,
 * wild encounter triggers, battle mode, and WebAudio chiptune synthesis.
 */

import { DecompiledProject, MovementPermission } from '../pokedcomp/types.ts';
import { EmulatorController } from './types.ts';

export interface BattleState {
  active: boolean;
  wildPokemon: {
    name: string;
    level: number;
    hp: number;
    maxHp: number;
    color: string;
    types: string[];
  };
  playerPokemon: {
    name: string;
    level: number;
    hp: number;
    maxHp: number;
    moves: { name: string; power: number; type: string }[];
  };
  battleLog: string;
  turn: 'player' | 'wild' | 'ended';
  animation: string | null;
}

export class WasmGbaEmulator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private project: DecompiledProject;
  
  // Game state
  public currentMapId: string;
  public playerX = 9;
  public playerY = 9;
  public facing: 'down' | 'up' | 'left' | 'right' = 'down';
  public stepCount = 0;
  public activeDialog: string | null = null;
  public battleState: BattleState | null = null;
  public isRunning = false;
  public isTurbo = false;
  public audioEnabled = true;

  // Web Audio Context for authentic GBA chiptune sounds
  private audioCtx: AudioContext | null = null;

  // Controller state
  public controller: EmulatorController = {
    up: false,
    down: false,
    left: false,
    right: false,
    a: false,
    b: false,
    l: false,
    r: false,
    start: false,
    select: false
  };

  private animFrameId: number | null = null;
  private savedState: string | null = null;

  constructor(canvas: HTMLCanvasElement, project: DecompiledProject) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.project = project;
    this.currentMapId = Object.keys(project.maps)[0] ?? 'MAP_LITTLEROOT_TOWN';
  }

  public updateProject(project: DecompiledProject) {
    this.project = project;
    if (!this.project.maps[this.currentMapId]) {
      this.currentMapId = Object.keys(this.project.maps)[0];
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.initAudio();
    this.loop();
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public reset() {
    this.currentMapId = Object.keys(this.project.maps)[0];
    this.playerX = 9;
    this.playerY = 9;
    this.facing = 'down';
    this.activeDialog = null;
    this.battleState = null;
  }

  public saveState(): string {
    const state = JSON.stringify({
      currentMapId: this.currentMapId,
      playerX: this.playerX,
      playerY: this.playerY,
      facing: this.facing,
      stepCount: this.stepCount
    });
    this.savedState = state;
    this.playChime(660, 0.1);
    return state;
  }

  public loadState(): boolean {
    if (!this.savedState) return false;
    try {
      const data = JSON.parse(this.savedState);
      this.currentMapId = data.currentMapId;
      this.playerX = data.playerX;
      this.playerY = data.playerY;
      this.facing = data.facing;
      this.stepCount = data.stepCount;
      this.playChime(880, 0.1);
      return true;
    } catch {
      return false;
    }
  }

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
  }

  private playChime(freq: number, duration: number, type: OscillatorType = 'square') {
    if (!this.audioEnabled || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public handleInput(key: keyof EmulatorController, pressed: boolean) {
    this.controller[key] = pressed;
    if (!pressed) return;

    if (this.battleState && this.battleState.active) {
      this.handleBattleInput(key);
      return;
    }

    if (this.activeDialog) {
      if (key === 'a' || key === 'b') {
        this.activeDialog = null;
        this.playChime(440, 0.05);
      }
      return;
    }

    if (key === 'up') { this.facing = 'up'; this.attemptMove(0, -1); }
    if (key === 'down') { this.facing = 'down'; this.attemptMove(0, 1); }
    if (key === 'left') { this.facing = 'left'; this.attemptMove(-1, 0); }
    if (key === 'right') { this.facing = 'right'; this.attemptMove(1, 0); }

    if (key === 'a') {
      this.interact();
    }
  }

  private attemptMove(dx: number, dy: number) {
    const map = this.project.maps[this.currentMapId];
    if (!map) return;

    const newX = this.playerX + dx;
    const newY = this.playerY + dy;

    // Check map boundaries
    if (newX < 0 || newX >= map.layout.width || newY < 0 || newY >= map.layout.height) {
      this.playChime(150, 0.05, 'sawtooth'); // Bump
      return;
    }

    const block = map.layout.blocks[newY * map.layout.width + newX];
    if (!block || block.permission === 'impassable') {
      this.playChime(150, 0.05, 'sawtooth'); // Bump
      return;
    }

    // Check NPC collision
    const npcObstacle = map.events.npcs.find(n => n.x === newX && n.y === newY);
    if (npcObstacle) {
      this.playChime(150, 0.05, 'sawtooth');
      return;
    }

    // Move succeeded
    this.playerX = newX;
    this.playerY = newY;
    this.stepCount++;
    this.playChime(220, 0.04);

    // Check warps
    const warp = map.events.warps.find(w => w.x === this.playerX && w.y === this.playerY);
    if (warp && this.project.maps[warp.targetMapId]) {
      this.currentMapId = warp.targetMapId;
      const targetMap = this.project.maps[warp.targetMapId];
      // Place near target
      this.playerX = Math.min(Math.max(1, 9), targetMap.layout.width - 2);
      this.playerY = Math.min(Math.max(1, 9), targetMap.layout.height - 2);
      this.playChime(520, 0.15);
      return;
    }

    // Check tall grass for wild encounters
    if (block.permission === 'tall_grass') {
      this.playChime(300, 0.04, 'triangle'); // Grass rustle
      this.checkWildEncounter();
    }
  }

  private checkWildEncounter() {
    const encounterTable = this.project.wildEncounters[this.currentMapId];
    if (!encounterTable || encounterTable.land.length === 0) return;

    // 15% chance of wild encounter per grass step
    if (Math.random() > 0.15) return;

    // Pick slot based on weight
    const rand = Math.random() * 100;
    let accumulated = 0;
    let pickedSlot = encounterTable.land[0];

    for (const slot of encounterTable.land) {
      accumulated += slot.ratePercent;
      if (rand <= accumulated) {
        pickedSlot = slot;
        break;
      }
    }

    const speciesData = this.project.species[pickedSlot.species];
    const level = Math.floor(Math.random() * (pickedSlot.maxLevel - pickedSlot.minLevel + 1)) + pickedSlot.minLevel;
    const wildName = speciesData ? speciesData.name : pickedSlot.species.replace('SPECIES_', '');

    // Trigger battle!
    this.playChime(880, 0.3, 'sine');
    this.battleState = {
      active: true,
      wildPokemon: {
        name: wildName,
        level,
        hp: speciesData ? speciesData.baseStats.hp + level * 2 : 25,
        maxHp: speciesData ? speciesData.baseStats.hp + level * 2 : 25,
        color: speciesData ? speciesData.spriteColor : '#10b981',
        types: speciesData ? [speciesData.types[0], speciesData.types[1] ?? ''].filter(Boolean) : ['NORMAL']
      },
      playerPokemon: {
        name: this.project.game === 'emerald' ? 'Treecko' : 'Bulbasaur',
        level: 5,
        hp: 35,
        maxHp: 35,
        moves: [
          { name: 'Tackle', power: 40, type: 'NORMAL' },
          { name: this.project.game === 'emerald' ? 'Pound' : 'Vine Whip', power: 45, type: 'GRASS' },
          { name: 'Growl', power: 0, type: 'NORMAL' },
          { name: 'Quick Attack', power: 40, type: 'NORMAL' }
        ]
      },
      battleLog: `A wild ${wildName} (Lv. ${level}) appeared!`,
      turn: 'player',
      animation: 'encounter_start'
    };
  }

  private handleBattleInput(key: keyof EmulatorController) {
    if (!this.battleState) return;

    if (this.battleState.turn === 'ended') {
      if (key === 'a' || key === 'b') {
        this.battleState = null;
        this.playChime(440, 0.1);
      }
      return;
    }

    if (this.battleState.turn === 'player') {
      if (key === 'a') {
        // Attack with primary move
        const move = this.battleState.playerPokemon.moves[0];
        const damage = Math.floor((move.power / 5) + Math.random() * 4) + 5;
        this.battleState.wildPokemon.hp = Math.max(0, this.battleState.wildPokemon.hp - damage);
        this.battleState.battleLog = `${this.battleState.playerPokemon.name} used ${move.name}! Dealt ${damage} damage.`;
        this.battleState.animation = 'player_attack';
        this.playChime(550, 0.1);

        if (this.battleState.wildPokemon.hp <= 0) {
          this.battleState.battleLog = `Wild ${this.battleState.wildPokemon.name} fainted! You won 45 EXP!`;
          this.battleState.turn = 'ended';
          this.playChime(780, 0.3);
        } else {
          this.battleState.turn = 'wild';
          setTimeout(() => this.wildPokemonTurn(), 1200);
        }
      } else if (key === 'b') {
        // Run away
        this.battleState.battleLog = `Got away safely!`;
        this.battleState.turn = 'ended';
        this.playChime(350, 0.15);
      }
    }
  }

  private wildPokemonTurn() {
    if (!this.battleState || !this.battleState.active) return;
    const wild = this.battleState.wildPokemon;
    const damage = Math.floor(wild.level * 1.5 + Math.random() * 3);
    this.battleState.playerPokemon.hp = Math.max(0, this.battleState.playerPokemon.hp - damage);
    this.battleState.battleLog = `Wild ${wild.name} attacked! Dealt ${damage} damage.`;
    this.battleState.animation = 'wild_attack';
    this.playChime(280, 0.1, 'sawtooth');

    if (this.battleState.playerPokemon.hp <= 0) {
      this.battleState.battleLog = `${this.battleState.playerPokemon.name} fainted! Blacked out...`;
      this.battleState.turn = 'ended';
    } else {
      this.battleState.turn = 'player';
    }
  }

  private interact() {
    const map = this.project.maps[this.currentMapId];
    if (!map) return;

    let targetX = this.playerX;
    let targetY = this.playerY;
    if (this.facing === 'up') targetY--;
    if (this.facing === 'down') targetY++;
    if (this.facing === 'left') targetX--;
    if (this.facing === 'right') targetX++;

    // Check NPC
    const npc = map.events.npcs.find(n => n.x === targetX && n.y === targetY);
    if (npc) {
      const script = this.project.scripts[npc.scriptId];
      if (script) {
        this.activeDialog = `${npc.id.replace('NPC_', '')}: "${script.name} executed."`;
      } else {
        this.activeDialog = `${npc.id.replace('NPC_', '')}: "Greetings trainer! Exploring ${map.layout.name}?"`;
      }
      this.playChime(440, 0.1);
      return;
    }

    // Check Signpost
    const sign = map.events.signs.find(s => s.x === targetX && s.y === targetY);
    if (sign) {
      this.activeDialog = `[ ${map.layout.name} Notice Board ]`;
      this.playChime(500, 0.08);
    }
  }

  private loop = () => {
    if (!this.isRunning) return;
    this.render();
    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private render() {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;

    // If battle is active, render GBA battle scene
    if (this.battleState && this.battleState.active) {
      this.renderBattleScene(ctx);
      return;
    }

    // Render overworld
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 240, 160);

    const map = this.project.maps[this.currentMapId];
    if (!map) return;

    const tileSize = 16;
    // Camera centers on player
    const camX = 120 - this.playerX * tileSize - 8;
    const camY = 80 - this.playerY * tileSize - 8;

    // Render map metatiles
    for (let y = 0; y < map.layout.height; y++) {
      for (let x = 0; x < map.layout.width; x++) {
        const px = camX + x * tileSize;
        const py = camY + y * tileSize;

        // Viewport culling
        if (px < -16 || px > 240 || py < -16 || py > 160) continue;

        const block = map.layout.blocks[y * map.layout.width + x];
        if (!block) continue;

        // Distinct colors based on permission
        if (block.permission === 'impassable') {
          ctx.fillStyle = '#1e293b'; // Tree / wall
          ctx.fillRect(px, py, tileSize, tileSize);
          ctx.fillStyle = '#166534';
          ctx.fillRect(px + 2, py + 2, 12, 12);
        } else if (block.permission === 'tall_grass') {
          ctx.fillStyle = '#22c55e'; // Grass ground
          ctx.fillRect(px, py, tileSize, tileSize);
          ctx.fillStyle = '#15803d'; // Grass tufts
          ctx.fillRect(px + 3, py + 2, 3, 10);
          ctx.fillRect(px + 9, py + 4, 3, 8);
        } else if (block.permission === 'water' || block.permission === 'fast_surf') {
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(px, py, tileSize, tileSize);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(px + 4, py + 6, 8, 2);
        } else if (block.permission === 'jump_down') {
          ctx.fillStyle = '#b45309';
          ctx.fillRect(px, py, tileSize, tileSize);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(px + 2, py + 2, 12, 4);
        } else if (block.permission === 'warp') {
          ctx.fillStyle = '#64748b';
          ctx.fillRect(px, py, tileSize, tileSize);
          ctx.fillStyle = '#475569';
          ctx.fillRect(px + 3, py + 3, 10, 10);
        } else {
          // Passable ground
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(px, py, tileSize, tileSize);
        }
      }
    }

    // Render Warps indicator
    map.events.warps.forEach(w => {
      const wx = camX + w.x * tileSize;
      const wy = camY + w.y * tileSize;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(wx + 6, wy + 6, 4, 4);
    });

    // Render Signs
    map.events.signs.forEach(s => {
      const sx = camX + s.x * tileSize;
      const sy = camY + s.y * tileSize;
      ctx.fillStyle = '#92400e';
      ctx.fillRect(sx + 3, sy + 3, 10, 10);
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(sx + 5, sy + 5, 6, 6);
    });

    // Render NPCs
    map.events.npcs.forEach(n => {
      const nx = camX + n.x * tileSize;
      const ny = camY + n.y * tileSize;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(nx + 2, ny + 2, 12, 12);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(nx + 4, ny + 4, 8, 4);
    });

    // Render Player in center of screen
    const px = 120 - 8;
    const py = 80 - 8;
    ctx.fillStyle = '#2563eb'; // Blue jacket
    ctx.fillRect(px + 2, py + 4, 12, 10);
    ctx.fillStyle = '#dc2626'; // Red cap
    ctx.fillRect(px + 3, py + 1, 10, 5);
    ctx.fillStyle = '#fed7aa'; // Face skin
    ctx.fillRect(px + 4, py + 6, 8, 4);

    // Directional indicator
    ctx.fillStyle = '#ffffff';
    if (this.facing === 'down') ctx.fillRect(px + 6, py + 8, 4, 2);
    if (this.facing === 'up') ctx.fillRect(px + 6, py + 4, 4, 2);
    if (this.facing === 'left') ctx.fillRect(px + 4, py + 6, 2, 4);
    if (this.facing === 'right') ctx.fillRect(px + 10, py + 6, 2, 4);

    // HUD banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(4, 4, 120, 18);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '8px monospace';
    ctx.fillText(`${map.layout.name} (${this.playerX}, ${this.playerY})`, 8, 16);

    // Render Dialog Modal
    if (this.activeDialog) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(8, 108, 224, 46);
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(8, 108, 224, 46);

      ctx.fillStyle = '#ffffff';
      ctx.font = '9px monospace';
      ctx.fillText(this.activeDialog, 14, 128);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px monospace';
      ctx.fillText('[Press A / Z to dismiss]', 14, 144);
    }
  }

  private renderBattleScene(ctx: CanvasRenderingContext2D) {
    if (!this.battleState) return;
    const battle = this.battleState;

    // Battle background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 160);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(0.6, '#334155');
    grad.addColorStop(0.61, '#15803d');
    grad.addColorStop(1, '#166534');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 240, 160);

    // Wild Pokémon platform & silhouette
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(175, 55, 35, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wild Pokemon Sprite Box
    ctx.fillStyle = battle.wildPokemon.color;
    ctx.fillRect(160, 25, 28, 28);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(166, 32, 6, 6);

    // Wild Pokemon Info HUD (top-left)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(10, 10, 110, 32);
    ctx.strokeStyle = '#64748b';
    ctx.strokeRect(10, 10, 110, 32);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '8px monospace';
    ctx.fillText(`${battle.wildPokemon.name}  Lv.${battle.wildPokemon.level}`, 16, 22);

    // HP Bar
    ctx.fillStyle = '#334155';
    ctx.fillRect(16, 28, 96, 6);
    const wildHpRatio = battle.wildPokemon.hp / battle.wildPokemon.maxHp;
    ctx.fillStyle = wildHpRatio > 0.5 ? '#22c55e' : wildHpRatio > 0.2 ? '#eab308' : '#ef4444';
    ctx.fillRect(16, 28, Math.max(0, 96 * wildHpRatio), 6);

    // Player Pokémon platform & silhouette (bottom-left)
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(65, 105, 40, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Player Pokemon Back Sprite Box
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(50, 70, 32, 32);
    ctx.fillStyle = '#15803d';
    ctx.fillRect(58, 76, 12, 12);

    // Player Pokemon Info HUD (bottom-right)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(120, 65, 110, 35);
    ctx.strokeStyle = '#64748b';
    ctx.strokeRect(120, 65, 110, 35);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '8px monospace';
    ctx.fillText(`${battle.playerPokemon.name}  Lv.${battle.playerPokemon.level}`, 126, 77);

    // Player HP Bar
    ctx.fillStyle = '#334155';
    ctx.fillRect(126, 83, 96, 6);
    const playerHpRatio = battle.playerPokemon.hp / battle.playerPokemon.maxHp;
    ctx.fillStyle = playerHpRatio > 0.5 ? '#22c55e' : playerHpRatio > 0.2 ? '#eab308' : '#ef4444';
    ctx.fillRect(126, 83, Math.max(0, 96 * playerHpRatio), 6);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '7px monospace';
    ctx.fillText(`${battle.playerPokemon.hp}/${battle.playerPokemon.maxHp} HP`, 180, 96);

    // Bottom Battle Action Menu & Log
    ctx.fillStyle = '#020617';
    ctx.fillRect(6, 112, 228, 44);
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(6, 112, 228, 44);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '8px monospace';
    ctx.fillText(battle.battleLog, 14, 126);

    if (battle.turn === 'player') {
      ctx.fillStyle = '#818cf8';
      ctx.fillText('[A] Attack: ' + battle.playerPokemon.moves[0].name, 14, 144);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('[B] Run Away', 160, 144);
    } else if (battle.turn === 'ended') {
      ctx.fillStyle = '#22c55e';
      ctx.fillText('[Press A / B to return to map]', 14, 144);
    } else {
      ctx.fillStyle = '#eab308';
      ctx.fillText('Enemy Pokémon is thinking...', 14, 144);
    }
  }
}
