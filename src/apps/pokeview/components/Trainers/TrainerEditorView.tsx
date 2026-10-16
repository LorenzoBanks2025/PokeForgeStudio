/**
 * @file TrainerEditorView.tsx
 * @package pokeview
 * @description Advanced trainer roster and party editor with AI tactical flags, held items, and movepools.
 */

import React, { useState } from 'react';
import { Trainer, TrainerPartyMember, PokemonSpecies, Item, Move } from '@/src/packages/pokedcomp/types.ts';
import { Swords, User, Plus, Trash2, Shield, Zap } from 'lucide-react';

interface TrainerEditorViewProps {
  trainers: Record<string, Trainer>;
  species: Record<string, PokemonSpecies>;
  items: Record<string, Item>;
  moves: Record<string, Move>;
  onUpdateTrainer: (trainer: Trainer) => void;
  onCreateTrainer: (trainer: Trainer) => void;
}

const AI_FLAGS = [
  { id: 'AI_FLAG_CHECK_BADGES', label: 'Check Badges (Scales difficulty)' },
  { id: 'AI_FLAG_CHECK_VIABILITY', label: 'Check Viability (Selects effective moves)' },
  { id: 'AI_FLAG_SETUP_FIRST_TURN', label: 'Setup First Turn (Uses Swords Dance / Calm Mind)' },
  { id: 'AI_FLAG_RISKY', label: 'Risky AI (Prefers high power attacks)' },
  { id: 'AI_FLAG_PREFER_STATUS', label: 'Prefer Status (Will-O-Wisp, Thunder Wave)' },
  { id: 'AI_FLAG_STALL', label: 'Stall AI (Protect / Toxic recovery)' }
];

export const TrainerEditorView: React.FC<TrainerEditorViewProps> = ({
  trainers,
  species,
  items,
  moves,
  onUpdateTrainer,
  onCreateTrainer
}) => {
  const trainerList = Object.values(trainers);
  const [selectedId, setSelectedId] = useState<string>(trainerList[0]?.id ?? '');
  const selected = trainers[selectedId] ?? trainerList[0];

  const speciesList = Object.values(species);
  const itemList = Object.values(items);
  const moveList = Object.values(moves);

  const handleAddPartyMember = () => {
    if (!selected) return;
    const newParty = [
      ...selected.party,
      {
        species: speciesList[0]?.id ?? 'SPECIES_TREECKO',
        level: 15,
        heldItem: itemList[0]?.id,
        moves: ['MOVE_TACKLE', 'MOVE_QUICK_ATTACK']
      }
    ];
    onUpdateTrainer({ ...selected, party: newParty });
  };

  const handleUpdatePartyMember = (index: number, updated: TrainerPartyMember) => {
    if (!selected) return;
    const newParty = [...selected.party];
    newParty[index] = updated;
    onUpdateTrainer({ ...selected, party: newParty });
  };

  const handleRemovePartyMember = (index: number) => {
    if (!selected) return;
    const newParty = selected.party.filter((_, i) => i !== index);
    onUpdateTrainer({ ...selected, party: newParty });
  };

  const handleCreateNew = () => {
    const newId = `TRAINER_CUSTOM_${Date.now().toString().slice(-4)}`;
    const newTrainer: Trainer = {
      id: newId,
      trainerClass: 'PKMN_TRAINER',
      name: 'Ace Trainer',
      spriteId: 'TRAINER_PIC_COOLTRAINER_M',
      introText: 'Let me show you the fruits of our rigorous training!',
      defeatText: 'Incredible battle! You truly understand your Pokémon.',
      party: [
        {
          species: 'SPECIES_RAYQUAZA',
          level: 50,
          heldItem: 'ITEM_POTION',
          moves: ['MOVE_DRAGON_CLAW', 'MOVE_TACKLE']
        }
      ]
    };
    onCreateTrainer(newTrainer);
    setSelectedId(newId);
  };

  return (
    <div className="flex-1 flex bg-slate-950 overflow-hidden text-slate-100">
      {/* Left Roster */}
      <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Trainer Roster ({trainerList.length})
          </span>
          <button
            onClick={handleCreateNew}
            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer"
            title="Create New Trainer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {trainerList.map(t => {
            const isSelected = t.id === selectedId;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-white">{t.name} ({t.trainerClass})</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{t.party.length} Pokémon Party</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Trainer & Party Inspector */}
      {selected && (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h2 className="text-base font-bold text-white font-display pb-3 mb-4 border-b border-slate-800">
              Trainer Configuration: {selected.name} ({selected.id})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Trainer Class</label>
                <input
                  type="text"
                  value={selected.trainerClass}
                  onChange={e => onUpdateTrainer({ ...selected, trainerClass: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Trainer Name</label>
                <input
                  type="text"
                  value={selected.name}
                  onChange={e => onUpdateTrainer({ ...selected, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Sprite ID</label>
                <input
                  type="text"
                  value={selected.spriteId}
                  onChange={e => onUpdateTrainer({ ...selected, spriteId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Party Roster */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Trainer Party Pokémon ({selected.party.length} / 6)
              </h3>
              <button
                onClick={handleAddPartyMember}
                disabled={selected.party.length >= 6}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-md text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Pokémon</span>
              </button>
            </div>

            <div className="space-y-3">
              {selected.party.map((p, idx) => {
                const spData = species[p.species];
                return (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center font-bold text-xs text-slate-950"
                        style={{ backgroundColor: spData?.spriteColor ?? '#6366f1' }}
                      >
                        #{idx + 1}
                      </div>
                      <div>
                        <select
                          value={p.species}
                          onChange={e => handleUpdatePartyMember(idx, { ...p, species: e.target.value })}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs font-medium"
                        >
                          {speciesList.map(s => (
                            <option key={s.id} value={s.id}>{s.name} (#{s.dexNumber})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Level</span>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={p.level}
                          onChange={e => handleUpdatePartyMember(idx, { ...p, level: parseInt(e.target.value) || 5 })}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 block">Held Item</span>
                        <select
                          value={p.heldItem ?? ''}
                          onChange={e => handleUpdatePartyMember(idx, { ...p, heldItem: e.target.value || undefined })}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                        >
                          <option value="">(None)</option>
                          {itemList.map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => handleRemovePartyMember(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer mt-4"
                        title="Remove Pokémon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
