/**
 * @file WildEncounterView.tsx
 * @package pokeview
 * @description Route wild Pokémon encounter distribution editor with rate weights and level ranges.
 */

import React, { useState } from 'react';
import { WildEncounterTable, WildEncounterSlot, PokemonSpecies } from '@/src/packages/pokedcomp/types.ts';
import { Compass, Sparkles, Sliders, Waves, Fish, Mountain } from 'lucide-react';

interface WildEncounterViewProps {
  mapId: string;
  mapName: string;
  encounterTable?: WildEncounterTable;
  availableSpecies: Record<string, PokemonSpecies>;
  onUpdateTable: (table: WildEncounterTable) => void;
  onCreateTable: (mapId: string) => void;
}

export const WildEncounterView: React.FC<WildEncounterViewProps> = ({
  mapId,
  mapName,
  encounterTable,
  availableSpecies,
  onUpdateTable,
  onCreateTable
}) => {
  const [activeCategory, setActiveCategory] = useState<'land' | 'water' | 'fishing' | 'rockSmash'>('land');
  const [activeRod, setActiveRod] = useState<'oldRod' | 'goodRod' | 'superRod'>('goodRod');

  if (!encounterTable) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-800 flex items-center justify-center mb-4 text-indigo-400">
          <Compass className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-white font-display mb-1">
          No Wild Encounters Configured for {mapName}
        </h3>
        <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
          This map currently has no wild grass or water encounter tables defined in the ROM header.
          You can initialize standard Gen III encounter slots with one click.
        </p>
        <button
          onClick={() => onCreateTable(mapId)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          Initialize Encounter Table
        </button>
      </div>
    );
  }

  // Get current active slots array
  let currentSlots: WildEncounterSlot[] = [];
  if (activeCategory === 'land') currentSlots = encounterTable.land;
  else if (activeCategory === 'water') currentSlots = encounterTable.water;
  else if (activeCategory === 'rockSmash') currentSlots = encounterTable.rockSmash;
  else if (activeCategory === 'fishing') currentSlots = encounterTable.fishing[activeRod];

  const handleUpdateSlot = (index: number, updated: Partial<WildEncounterSlot>) => {
    const newTable = JSON.parse(JSON.stringify(encounterTable)) as WildEncounterTable;
    if (activeCategory === 'land') {
      newTable.land[index] = { ...newTable.land[index], ...updated };
    } else if (activeCategory === 'water') {
      newTable.water[index] = { ...newTable.water[index], ...updated };
    } else if (activeCategory === 'rockSmash') {
      newTable.rockSmash[index] = { ...newTable.rockSmash[index], ...updated };
    } else if (activeCategory === 'fishing') {
      newTable.fishing[activeRod][index] = { ...newTable.fishing[activeRod][index], ...updated };
    }
    onUpdateTable(newTable);
  };

  const handleUpdateRate = (rate: number) => {
    onUpdateTable({
      ...encounterTable,
      encounterRate: rate
    });
  };

  const speciesList = Object.values(availableSpecies);

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      {/* Category Navigation Bar */}
      <div className="h-12 px-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveCategory('land')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeCategory === 'land'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tall Grass / Land ({encounterTable.land.length} Slots)</span>
          </button>
          <button
            onClick={() => setActiveCategory('water')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeCategory === 'water'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Surfing Water ({encounterTable.water.length} Slots)</span>
          </button>
          <button
            onClick={() => setActiveCategory('fishing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeCategory === 'fishing'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Fish className="w-3.5 h-3.5" />
            <span>Fishing Rods</span>
          </button>
          <button
            onClick={() => setActiveCategory('rockSmash')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeCategory === 'rockSmash'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Mountain className="w-3.5 h-3.5" />
            <span>Rock Smash ({encounterTable.rockSmash.length} Slots)</span>
          </button>
        </div>

        {/* Global Encounter Rate Density */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Encounter Density:</span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={1}
              max={60}
              value={encounterTable.encounterRate}
              onChange={e => handleUpdateRate(parseInt(e.target.value) || 20)}
              className="w-28 accent-indigo-500 cursor-pointer"
            />
            <span className="text-xs font-mono font-semibold text-indigo-400 w-8">
              {encounterTable.encounterRate}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-bar for fishing rods if fishing tab is selected */}
      {activeCategory === 'fishing' && (
        <div className="h-10 px-6 border-b border-slate-850 bg-slate-900/40 flex items-center gap-2">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mr-2">Rod Type:</span>
          {(['oldRod', 'goodRod', 'superRod'] as const).map(rod => (
            <button
              key={rod}
              onClick={() => setActiveRod(rod)}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                activeRod === rod
                  ? 'bg-indigo-950 border border-indigo-500 text-indigo-200'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {rod === 'oldRod' ? 'Old Rod (2 Slots)' : rod === 'goodRod' ? 'Good Rod (3 Slots)' : 'Super Rod (5 Slots)'}
            </button>
          ))}
        </div>
      )}

      {/* Visual Probability Distribution Bar */}
      <div className="px-6 py-3 bg-slate-900/30 border-b border-slate-850">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
          <span>Encounter Probability Distribution Breakdown</span>
          <span className="font-mono text-[11px]">100% Total Probability</span>
        </div>
        <div className="h-4 w-full rounded-md overflow-hidden flex bg-slate-800">
          {currentSlots.map((slot, i) => {
            const sp = availableSpecies[slot.species];
            const color = sp ? sp.spriteColor : '#64748b';
            return (
              <div
                key={i}
                style={{ width: `${slot.ratePercent}%`, backgroundColor: color }}
                className="h-full border-r border-slate-950/40 transition-all relative group cursor-pointer"
                title={`Slot ${i}: ${sp?.name ?? slot.species} (${slot.ratePercent}%)`}
              />
            );
          })}
        </div>
      </div>

      {/* Slots Table */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-16">Slot</th>
                <th className="py-3 px-4 w-28">Probability</th>
                <th className="py-3 px-4">Wild Species</th>
                <th className="py-3 px-4 w-32">Min Level</th>
                <th className="py-3 px-4 w-32">Max Level</th>
                <th className="py-3 px-4 w-36">Base Stats (BST)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {currentSlots.map((slot, idx) => {
                const sp = availableSpecies[slot.species];
                const bst = sp ? Object.values(sp.baseStats).reduce((a, b) => a + b, 0) : 0;
                return (
                  <tr key={idx} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">
                      #{slot.slotIndex}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono font-semibold text-slate-200 bg-slate-800 text-[11px]">
                        {slot.ratePercent}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: sp?.spriteColor ?? '#64748b' }}
                        />
                        <select
                          value={slot.species}
                          onChange={e => handleUpdateSlot(idx, { species: e.target.value })}
                          className="bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1 text-xs text-white max-w-xs"
                        >
                          {speciesList.map(s => (
                            <option key={s.id} value={s.id}>
                              #{s.dexNumber} {s.name} ({s.types[0]}{s.types[1] ? '/' + s.types[1] : ''})
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={slot.minLevel}
                        onChange={e => handleUpdateSlot(idx, { minLevel: parseInt(e.target.value) || 1 })}
                        className="w-20 bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs text-white font-mono"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={slot.maxLevel}
                        onChange={e => handleUpdateSlot(idx, { maxLevel: parseInt(e.target.value) || 1 })}
                        className="w-20 bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs text-white font-mono"
                      />
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {bst > 0 ? `${bst} BST` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
