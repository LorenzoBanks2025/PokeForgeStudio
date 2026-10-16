/**
 * @file BattleScriptsView.tsx
 * @package pokeview
 * @description Move parameters, battle script bytecode disassembly, and character dialog inspector.
 */

import React, { useState } from 'react';
import { Move, Trainer, PokemonType } from '@/src/packages/pokedcomp/types.ts';
import { Swords, MessageSquare, Play, Sparkles, Film, Plus } from 'lucide-react';

interface BattleScriptsViewProps {
  moves: Record<string, Move>;
  trainers: Record<string, Trainer>;
  onUpdateMove: (move: Move) => void;
  onUpdateTrainer: (trainer: Trainer) => void;
}

const ALL_TYPES: PokemonType[] = [
  'NORMAL', 'FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'ICE',
  'FIGHTING', 'POISON', 'GROUND', 'FLYING', 'PSYCHIC', 'BUG',
  'ROCK', 'GHOST', 'DRAGON', 'STEEL', 'DARK'
];

export const BattleScriptsView: React.FC<BattleScriptsViewProps> = ({
  moves,
  trainers,
  onUpdateMove,
  onUpdateTrainer
}) => {
  const [activeTab, setActiveTab] = useState<'moves' | 'trainers' | 'battle_scripts'>('moves');
  const moveList = Object.values(moves);
  const trainerList = Object.values(trainers);

  const [selectedMoveId, setSelectedMoveId] = useState<string>(moveList[0]?.id ?? '');
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>(trainerList[0]?.id ?? '');
  const [animatingFrame, setAnimatingFrame] = useState<number>(0);
  const [isPlayingAnim, setIsPlayingAnim] = useState<boolean>(false);

  const selectedMove = moves[selectedMoveId] ?? moveList[0];
  const selectedTrainer = trainers[selectedTrainerId] ?? trainerList[0];

  // Play animation simulation
  const handlePlayAnimation = () => {
    if (!selectedMove || isPlayingAnim) return;
    setIsPlayingAnim(true);
    setAnimatingFrame(0);
    let f = 0;
    const interval = setInterval(() => {
      f++;
      if (f >= selectedMove.animationFrames.length) {
        clearInterval(interval);
        setIsPlayingAnim(false);
        setAnimatingFrame(0);
      } else {
        setAnimatingFrame(f);
      }
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      {/* Tab Switcher */}
      <div className="h-12 px-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('moves')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'moves'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Move Attacks & Animations ({moveList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('trainers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'trainers'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Trainer Dialogs & Speech ({trainerList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('battle_scripts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'battle_scripts'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Battle Script Bytecode (B_SCR)</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Moves Sub-View */}
        {activeTab === 'moves' && (
          <>
            {/* Move List */}
            <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto">
              <div className="p-3 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Battle Moves Registry
              </div>
              <div className="p-2 space-y-1">
                {moveList.map(m => {
                  const isSelected = m.id === selectedMoveId;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMoveId(m.id)}
                      className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-white">{m.name}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{m.type} · {m.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-slate-200">{m.power}</div>
                        <div className="text-[10px] text-slate-500 font-mono">PWR</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Move Inspector & Animation Timeline */}
            {selectedMove && (
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                    <div>
                      <h3 className="text-base font-bold text-white font-display">
                        {selectedMove.name} ({selectedMove.id})
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{selectedMove.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Elemental Type</label>
                      <select
                        value={selectedMove.type}
                        onChange={e => onUpdateMove({ ...selectedMove, type: e.target.value as PokemonType })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-white"
                      >
                        {ALL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Damage Split</label>
                      <select
                        value={selectedMove.category}
                        onChange={e => onUpdateMove({ ...selectedMove, category: e.target.value as 'physical' | 'special' | 'status' })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-white capitalize"
                      >
                        <option value="physical">Physical</option>
                        <option value="special">Special</option>
                        <option value="status">Status</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Base Power</label>
                      <input
                        type="number"
                        min={0}
                        max={250}
                        value={selectedMove.power}
                        onChange={e => onUpdateMove({ ...selectedMove, power: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Accuracy (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={selectedMove.accuracy}
                        onChange={e => onUpdateMove({ ...selectedMove, accuracy: parseInt(e.target.value) || 100 })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Base PP</label>
                      <input
                        type="number"
                        min={5}
                        max={40}
                        value={selectedMove.pp}
                        onChange={e => onUpdateMove({ ...selectedMove, pp: parseInt(e.target.value) || 20 })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Priority</label>
                      <input
                        type="number"
                        min={-7}
                        max={7}
                        value={selectedMove.priority}
                        onChange={e => onUpdateMove({ ...selectedMove, priority: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Move Animation Stage Timeline */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Battle Animation Sequence Stages
                      </h3>
                    </div>
                    <button
                      onClick={handlePlayAnimation}
                      disabled={isPlayingAnim}
                      className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-md text-xs font-semibold cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isPlayingAnim ? 'Playing...' : 'Preview Animation'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 overflow-x-auto pb-2">
                    {selectedMove.animationFrames.map((frame, idx) => {
                      const isCurrent = isPlayingAnim && animatingFrame === idx;
                      return (
                        <div
                          key={idx}
                          className={`flex-1 min-w-[120px] p-3 rounded-lg border text-center transition-all ${
                            isCurrent
                              ? 'bg-indigo-600 border-indigo-400 text-white ring-2 ring-indigo-400 shadow-md scale-105'
                              : 'bg-slate-950 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="text-[10px] font-mono text-slate-500 mb-1">
                            Step #{idx + 1}
                          </div>
                          <div className="text-xs font-mono font-semibold truncate">
                            {frame}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Trainer Dialogs Sub-View */}
        {activeTab === 'trainers' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Trainer Roster */}
            <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto">
              <div className="p-3 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Trainer Speech Roster
              </div>
              <div className="p-2 space-y-1">
                {trainerList.map(t => {
                  const isSelected = t.id === selectedTrainerId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTrainerId(t.id)}
                      className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-semibold text-white">{t.name} ({t.trainerClass})</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate italic">"{t.introText}"</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trainer Dialog Inspector & Authentic GBA Textbox Preview */}
            {selectedTrainer && (
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-white font-display pb-3 mb-4 border-b border-slate-800">
                    Trainer Speech Editor: {selectedTrainer.name}
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Intro Battle Challenge Speech</label>
                      <textarea
                        value={selectedTrainer.introText}
                        onChange={e => onUpdateTrainer({ ...selectedTrainer, introText: e.target.value })}
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-700 rounded-md p-2.5 text-xs text-white resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">Defeat / Loss Speech</label>
                      <textarea
                        value={selectedTrainer.defeatText}
                        onChange={e => onUpdateTrainer({ ...selectedTrainer, defeatText: e.target.value })}
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-700 rounded-md p-2.5 text-xs text-white resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Authentic GBA Text Frame Preview */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    In-Game GBA Dialog Box Preview
                  </h3>

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center">
                    <div className="w-[420px] bg-slate-900 border-2 border-indigo-400 rounded-lg p-3 shadow-xl relative">
                      <div className="text-[11px] font-bold text-indigo-300 mb-1 font-mono">
                        {selectedTrainer.trainerClass} {selectedTrainer.name}:
                      </div>
                      <div className="text-xs text-slate-100 font-mono leading-relaxed min-h-[36px]">
                        "{selectedTrainer.introText}"
                      </div>
                      <div className="absolute right-3 bottom-2 text-indigo-400 font-mono text-[10px] animate-bounce">
                        ▼
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Battle Script Bytecode Sub-View */}
        {activeTab === 'battle_scripts' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-white font-display pb-3 mb-4 border-b border-slate-800">
                Gen III Battle Script Architecture & Execution Engine (BattleScript_HitMove)
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Standard pokeemerald/pokefirered battle scripts coordinate turn resolution, accuracy rolls,
                stat stage calculation, critical hit chance, and particle animation triggers.
              </p>

              <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
{`BattleScript_HitMove::
\tattackcanceler
\taccuracycheck BattleScript_Miss, 0
\tattackanimation
\twaitanimation
\tcritcalc
\tdamagecalc
\ttypecalc
\tadjustnormaldamage
\thitanimation BS_TARGET
\twaitanimation
\tprintfromtable gBattleStringsTable
\twaitmessage B_WAIT_TIME_LONG
\tcheckfainted BS_TARGET
\tend`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
