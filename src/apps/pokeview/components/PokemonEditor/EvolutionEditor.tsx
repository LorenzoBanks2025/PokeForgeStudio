/**
 * @file EvolutionEditor.tsx
 * @package pokeview
 * @description Evolution tree and branching conditions editor (Level, Item, Trade, Happiness).
 */

import React, { useState } from 'react';
import { PokemonSpecies, Evolution, Item } from '@/src/packages/pokedcomp/types.ts';
import { GitBranch, Plus, Trash2, ArrowRight } from 'lucide-react';

interface EvolutionEditorProps {
  speciesRecord: Record<string, PokemonSpecies>;
  items: Record<string, Item>;
  onUpdateSpecies: (species: PokemonSpecies) => void;
}

export const EvolutionEditor: React.FC<EvolutionEditorProps> = ({
  speciesRecord,
  items,
  onUpdateSpecies
}) => {
  const speciesList = Object.values(speciesRecord);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>(speciesList[0]?.id ?? '');
  const selected = speciesRecord[selectedSpeciesId] ?? speciesList[0];
  const itemList = Object.values(items);

  const handleAddEvolution = () => {
    if (!selected) return;
    const newEvolutions: Evolution[] = [
      ...selected.evolutions,
      {
        method: 'level',
        targetSpecies: speciesList[1]?.id ?? speciesList[0].id,
        parameter: 16
      }
    ];
    onUpdateSpecies({ ...selected, evolutions: newEvolutions });
  };

  const handleUpdateEvolution = (index: number, updated: Evolution) => {
    if (!selected) return;
    const newEvolutions = [...selected.evolutions];
    newEvolutions[index] = updated;
    onUpdateSpecies({ ...selected, evolutions: newEvolutions });
  };

  const handleRemoveEvolution = (index: number) => {
    if (!selected) return;
    const newEvolutions = selected.evolutions.filter((_, i) => i !== index);
    onUpdateSpecies({ ...selected, evolutions: newEvolutions });
  };

  return (
    <div className="flex-1 flex bg-slate-950 overflow-hidden text-slate-100">
      {/* Left List */}
      <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden">
        <div className="p-3 border-b border-slate-800 text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Species Evolutions
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {speciesList.map(sp => {
            const isSelected = sp.id === selectedSpeciesId;
            return (
              <button
                key={sp.id}
                onClick={() => setSelectedSpeciesId(sp.id)}
                className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded flex items-center justify-center font-bold text-[10px]" style={{ backgroundColor: sp.spriteColor }}>
                    #{sp.dexNumber}
                  </span>
                  <span className="text-xs font-semibold text-white">{sp.name}</span>
                </div>
                {sp.evolutions.length > 0 && (
                  <span className="text-[10px] font-mono bg-indigo-900/60 text-indigo-300 px-1.5 py-0.5 rounded">
                    {sp.evolutions.length} Evolutions
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Evolution Tree Inspector */}
      {selected && (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white font-display">
                  Evolution Tree for {selected.name}
                </h3>
              </div>
              <button
                onClick={handleAddEvolution}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Evolution Path</span>
              </button>
            </div>

            <div className="space-y-3">
              {selected.evolutions.length === 0 ? (
                <div className="text-xs text-slate-500 py-8 text-center italic">
                  No evolution paths defined for {selected.name}. Pokémon is in its final form.
                </div>
              ) : (
                selected.evolutions.map((evo, idx) => {
                  const targetSp = speciesRecord[evo.targetSpecies];
                  return (
                    <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-4">
                        <div className="text-center font-semibold text-slate-300">
                          {selected.name}
                        </div>
                        <ArrowRight className="w-4 h-4 text-indigo-400 shrink-0" />
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded flex items-center justify-center font-bold text-[10px]" style={{ backgroundColor: targetSp?.spriteColor ?? '#6366f1' }}>
                            #{targetSp?.dexNumber ?? '??'}
                          </span>
                          <select
                            value={evo.targetSpecies}
                            onChange={e => handleUpdateEvolution(idx, { ...evo, targetSpecies: e.target.value })}
                            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs font-semibold"
                          >
                            {speciesList.map(s => (
                              <option key={s.id} value={s.id}>{s.name} (#{s.dexNumber})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Method</span>
                          <select
                            value={evo.method}
                            onChange={e => handleUpdateEvolution(idx, { ...evo, method: e.target.value as any })}
                            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs capitalize"
                          >
                            <option value="level">Level-Up</option>
                            <option value="item">Evolution Stone / Item</option>
                            <option value="trade">Trade</option>
                            <option value="friendship">High Friendship</option>
                          </select>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 block">Parameter (Level / Item)</span>
                          {evo.method === 'item' ? (
                            <select
                              value={String(evo.parameter)}
                              onChange={e => handleUpdateEvolution(idx, { ...evo, parameter: e.target.value })}
                              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                            >
                              {itemList.map(item => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={Number(evo.parameter) || 16}
                              onChange={e => handleUpdateEvolution(idx, { ...evo, parameter: parseInt(e.target.value) || 16 })}
                              className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
                            />
                          )}
                        </div>

                        <button
                          onClick={() => handleRemoveEvolution(idx)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer mt-4"
                          title="Remove Evolution"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
