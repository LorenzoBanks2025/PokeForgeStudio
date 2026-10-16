/**
 * @file PokemonDexView.tsx
 * @package pokeview
 * @description Pokémon species registry, base stats radar visualizer, typing, and learnset editor.
 */

import React, { useState } from 'react';
import { PokemonSpecies, PokemonType, LearnsetMove, Move } from '@/src/packages/pokedcomp/types.ts';
import { Plus, Search, Trash2, Shield, Swords, Zap, Activity } from 'lucide-react';

interface PokemonDexViewProps {
  speciesRecord: Record<string, PokemonSpecies>;
  availableMoves: Record<string, Move>;
  onUpdateSpecies: (species: PokemonSpecies) => void;
  onCreateSpecies: (species: PokemonSpecies) => void;
}

const ALL_TYPES: PokemonType[] = [
  'NORMAL', 'FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'ICE',
  'FIGHTING', 'POISON', 'GROUND', 'FLYING', 'PSYCHIC', 'BUG',
  'ROCK', 'GHOST', 'DRAGON', 'STEEL', 'DARK'
];

const TYPE_COLORS: Record<PokemonType, string> = {
  NORMAL: '#a8a878',
  FIRE: '#f08030',
  WATER: '#6890f0',
  GRASS: '#78c850',
  ELECTRIC: '#f8d030',
  ICE: '#98d8d8',
  FIGHTING: '#c03028',
  POISON: '#a040a0',
  GROUND: '#e0c068',
  FLYING: '#a890f0',
  PSYCHIC: '#f85888',
  BUG: '#a8b820',
  ROCK: '#b8a038',
  GHOST: '#705898',
  DRAGON: '#7038f8',
  STEEL: '#b8b8d0',
  DARK: '#705848'
};

export const PokemonDexView: React.FC<PokemonDexViewProps> = ({
  speciesRecord,
  availableMoves,
  onUpdateSpecies,
  onCreateSpecies
}) => {
  const speciesList = Object.values(speciesRecord);
  const [selectedId, setSelectedId] = useState<string>(speciesList[0]?.id ?? '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newMoveName, setNewMoveName] = useState<string>(Object.keys(availableMoves)[0] ?? 'MOVE_TACKLE');
  const [newMoveLevel, setNewMoveLevel] = useState<number>(1);

  const selected = speciesRecord[selectedId] ?? speciesList[0];

  const filteredSpecies = speciesList.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.types[0].toLowerCase().includes(searchQuery.toLowerCase())
  );

  const bst = selected ? Object.values(selected.baseStats).reduce((a, b) => a + b, 0) : 0;

  const handleStatChange = (stat: keyof typeof selected.baseStats, val: number) => {
    if (!selected) return;
    onUpdateSpecies({
      ...selected,
      baseStats: {
        ...selected.baseStats,
        [stat]: Math.max(1, Math.min(255, val))
      }
    });
  };

  const handleAddMove = () => {
    if (!selected) return;
    const newLearnset = [...selected.learnset, { level: newMoveLevel, move: newMoveName }];
    newLearnset.sort((a, b) => a.level - b.level);
    onUpdateSpecies({
      ...selected,
      learnset: newLearnset
    });
  };

  const handleRemoveMove = (index: number) => {
    if (!selected) return;
    const updated = selected.learnset.filter((_, i) => i !== index);
    onUpdateSpecies({
      ...selected,
      learnset: updated
    });
  };

  const handleCreateNewSpecies = () => {
    const nextDex = speciesList.length + 1;
    const newId = `SPECIES_CUSTOM_${nextDex}`;
    const newSp: PokemonSpecies = {
      id: newId,
      dexNumber: 400 + nextDex,
      name: `Fakemon ${nextDex}`,
      types: ['DRAGON', null],
      baseStats: { hp: 60, attack: 75, defense: 60, speed: 70, spAttack: 65, spDefense: 60 },
      abilities: ['Pressure', null],
      catchRate: 45,
      baseExpYield: 140,
      genderRatio: 127,
      eggGroups: ['Dragon', null],
      learnset: [
        { level: 1, move: 'MOVE_SCRATCH' },
        { level: 8, move: 'MOVE_EMBER' },
        { level: 15, move: 'MOVE_DRAGON_CLAW' }
      ],
      evolutions: [],
      spriteColor: '#6366f1',
      iconType: 'dragon'
    };
    onCreateSpecies(newSp);
    setSelectedId(newId);
  };

  // SVG Radar Chart Math for 6 Stats (HP, Atk, Def, Spe, SpD, SpA)
  const renderRadarChart = () => {
    if (!selected) return null;
    const center = 100;
    const radius = 70;
    const stats = [
      { key: 'HP', val: selected.baseStats.hp },
      { key: 'Atk', val: selected.baseStats.attack },
      { key: 'Def', val: selected.baseStats.defense },
      { key: 'SpD', val: selected.baseStats.spDefense },
      { key: 'SpA', val: selected.baseStats.spAttack },
      { key: 'Spe', val: selected.baseStats.speed },
    ];

    const points = stats.map((s, i) => {
      const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
      const ratio = Math.min(1, s.val / 160); // 160 as high watermark
      const x = center + radius * ratio * Math.cos(angle);
      const y = center + radius * ratio * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-52 h-52 mx-auto" viewBox="0 0 200 200">
        {/* Background webs */}
        {[0.25, 0.5, 0.75, 1.0].map(r => (
          <polygon
            key={r}
            points={stats.map((_, i) => {
              const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
              const x = center + radius * r * Math.cos(angle);
              const y = center + radius * r * Math.sin(angle);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#334155"
            strokeWidth="1"
          />
        ))}

        {/* Radar polygon */}
        <polygon
          points={points}
          fill="rgba(99, 102, 241, 0.35)"
          stroke="#818cf8"
          strokeWidth="2"
        />

        {/* Stat labels */}
        {stats.map((s, i) => {
          const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
          const x = center + (radius + 18) * Math.cos(angle);
          const y = center + (radius + 18) * Math.sin(angle);
          return (
            <text
              key={s.key}
              x={x}
              y={y + 4}
              fontSize="9"
              fontFamily="monospace"
              fill="#94a3b8"
              textAnchor="middle"
            >
              {s.key} {s.val}
            </text>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="flex-1 flex bg-slate-950 overflow-hidden">
      {/* Left Roster List */}
      <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden">
        {/* Search & Add Bar */}
        <div className="p-3 border-b border-slate-800 flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search Pokémon or type..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={handleCreateNewSpecies}
            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer"
            title="Create New Pokémon Species"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Species List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredSpecies.map(sp => {
            const isSelected = sp.id === selectedId;
            return (
              <button
                key={sp.id}
                onClick={() => setSelectedId(sp.id)}
                className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs text-slate-950 shadow-inner"
                    style={{ backgroundColor: sp.spriteColor }}
                  >
                    #{sp.dexNumber}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">{sp.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      {sp.types[0]} {sp.types[1] ? `/ ${sp.types[1]}` : ''}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-semibold text-slate-300">
                    {Object.values(sp.baseStats).reduce((a, b) => a + b, 0)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">BST</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Species Inspector */}
      {selected && (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Top Identity Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-950 font-display font-extrabold text-base shadow-md"
                  style={{ backgroundColor: selected.spriteColor }}
                >
                  #{selected.dexNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white font-display">
                      {selected.name}
                    </h2>
                    <span className="text-xs font-mono text-indigo-400">
                      {selected.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-bold text-white uppercase shadow-sm"
                      style={{ backgroundColor: TYPE_COLORS[selected.types[0]] }}
                    >
                      {selected.types[0]}
                    </span>
                    {selected.types[1] && (
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-bold text-white uppercase shadow-sm"
                        style={{ backgroundColor: TYPE_COLORS[selected.types[1]] }}
                      >
                        {selected.types[1]}
                      </span>
                    )}
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400">
                      Abilities: <strong className="text-slate-200">{selected.abilities.filter(Boolean).join(', ')}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Color swatch picker */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Sprite Color:</span>
                <input
                  type="color"
                  value={selected.spriteColor}
                  onChange={e => onUpdateSpecies({ ...selected, spriteColor: e.target.value })}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                />
              </div>
            </div>

            {/* General parameters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Species Name</label>
                <input
                  type="text"
                  value={selected.name}
                  onChange={e => onUpdateSpecies({ ...selected, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Primary Type</label>
                <select
                  value={selected.types[0]}
                  onChange={e => onUpdateSpecies({ ...selected, types: [e.target.value as PokemonType, selected.types[1]] })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-white"
                >
                  {ALL_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Secondary Type</label>
                <select
                  value={selected.types[1] ?? 'NONE'}
                  onChange={e => onUpdateSpecies({
                    ...selected,
                    types: [selected.types[0], e.target.value === 'NONE' ? null : e.target.value as PokemonType]
                  })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-white"
                >
                  <option value="NONE">(None)</option>
                  {ALL_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Catch Rate (3 - 255)</label>
                <input
                  type="number"
                  min={3}
                  max={255}
                  value={selected.catchRate}
                  onChange={e => onUpdateSpecies({ ...selected, catchRate: parseInt(e.target.value) || 45 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Base Stats & Radar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stat Sliders */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Base Stats & BST
                </h3>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  Total: {bst} BST
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                {(['hp', 'attack', 'defense', 'speed', 'spAttack', 'spDefense'] as const).map(stat => {
                  const val = selected.baseStats[stat];
                  const labels: Record<string, string> = {
                    hp: 'HP', attack: 'Attack', defense: 'Defense', speed: 'Speed', spAttack: 'Sp. Atk', spDefense: 'Sp. Def'
                  };
                  return (
                    <div key={stat} className="flex items-center gap-3">
                      <span className="w-16 text-slate-400 font-medium">{labels[stat]}</span>
                      <input
                        type="range"
                        min={1}
                        max={255}
                        value={val}
                        onChange={e => handleStatChange(stat, parseInt(e.target.value))}
                        className="flex-1 accent-indigo-500 cursor-pointer"
                      />
                      <input
                        type="number"
                        min={1}
                        max={255}
                        value={val}
                        onChange={e => handleStatChange(stat, parseInt(e.target.value))}
                        className="w-16 bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs text-white font-mono text-center"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Radar Visualizer */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Stat Polygon Distribution
              </h3>
              {renderRadarChart()}
            </div>
          </div>

          {/* Learnset Moves Editor */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Level-Up Learnset ({selected.learnset.length} Moves)
              </h3>

              {/* Add move form */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={newMoveLevel}
                  onChange={e => setNewMoveLevel(parseInt(e.target.value) || 1)}
                  className="w-14 bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs text-white font-mono text-center"
                  placeholder="Lv"
                  title="Level"
                />
                <select
                  value={newMoveName}
                  onChange={e => setNewMoveName(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1 text-xs text-white"
                >
                  {Object.values(availableMoves).map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.type}, {m.power} Pow)</option>
                  ))}
                </select>
                <button
                  onClick={handleAddMove}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold cursor-pointer"
                >
                  Add Move
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {selected.learnset.map((item, idx) => {
                const moveData = availableMoves[item.move];
                return (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-8 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-semibold text-center text-[11px]">
                        Lv.{item.level}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-200">
                          {moveData ? moveData.name : item.move.replace('MOVE_', '')}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {moveData ? `${moveData.type} · ${moveData.power} Pow · ${moveData.pp} PP` : item.move}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveMove(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                      title="Remove Move"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
