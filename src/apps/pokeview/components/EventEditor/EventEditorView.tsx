/**
 * @file EventEditorView.tsx
 * @package pokeview
 * @description Visual inspector and script bytecode editor for map events (NPCs, Warps, Triggers, Signs).
 */

import React, { useState } from 'react';
import { MapEvents, NpcEvent, WarpEvent, SignpostEvent, EventScript, NpcMovementType } from '@/src/packages/pokedcomp/types.ts';
import { Plus, Trash2, Code2, User, DoorOpen, HelpCircle, FileText, Check } from 'lucide-react';

interface EventEditorViewProps {
  mapId: string;
  mapName: string;
  mapEvents: MapEvents;
  scripts: Record<string, EventScript>;
  onUpdateEvents: (updated: MapEvents) => void;
  onUpdateScript: (script: EventScript) => void;
}

const SPRITE_PRESETS = [
  { id: 'EVENT_OBJ_GFX_MOM', name: 'Mom' },
  { id: 'EVENT_OBJ_GFX_RIVAL_MAY_NORMAL', name: 'Rival May' },
  { id: 'EVENT_OBJ_GFX_RIVAL_BRENDAN_NORMAL', name: 'Rival Brendan' },
  { id: 'EVENT_OBJ_GFX_PROF_BIRCH', name: 'Prof. Birch' },
  { id: 'EVENT_OBJ_GFX_PROF_OAK', name: 'Prof. Oak' },
  { id: 'EVENT_OBJ_GFX_RIVAL_BLUE', name: 'Rival Blue' },
  { id: 'EVENT_OBJ_GFX_BOY_1', name: 'Boy' },
  { id: 'EVENT_OBJ_GFX_GIRL_1', name: 'Girl' },
  { id: 'EVENT_OBJ_GFX_FAT_MAN', name: 'Fat Man' },
  { id: 'EVENT_OBJ_GFX_SCIENTIST_1', name: 'Scientist' },
  { id: 'EVENT_OBJ_GFX_CLERK', name: 'Mart Clerk' }
];

const MOVEMENT_TYPES: { id: NpcMovementType; label: string }[] = [
  { id: 'face_down', label: 'Face Down (Stationary)' },
  { id: 'face_up', label: 'Face Up (Stationary)' },
  { id: 'face_left', label: 'Face Left (Stationary)' },
  { id: 'face_right', label: 'Face Right (Stationary)' },
  { id: 'wander_around', label: 'Wander Around' },
  { id: 'walk_left_right', label: 'Patrol Left-Right' },
  { id: 'walk_up_down', label: 'Patrol Up-Down' },
  { id: 'look_around', label: 'Look Around (Random Direction)' }
];

export const EventEditorView: React.FC<EventEditorViewProps> = ({
  mapId,
  mapName,
  mapEvents,
  scripts,
  onUpdateEvents,
  onUpdateScript
}) => {
  const [activeTab, setActiveTab] = useState<'npcs' | 'warps' | 'signs'>('npcs');
  const [selectedNpcId, setSelectedNpcId] = useState<string>(mapEvents.npcs[0]?.id ?? '');
  const [selectedWarpId, setSelectedWarpId] = useState<string>(mapEvents.warps[0]?.id ?? '');
  const [selectedSignId, setSelectedSignId] = useState<string>(mapEvents.signs[0]?.id ?? '');
  const [scriptEditSuccess, setScriptEditSuccess] = useState<boolean>(false);

  // Active selected NPC
  const selectedNpc = mapEvents.npcs.find(n => n.id === selectedNpcId) ?? mapEvents.npcs[0];
  const selectedWarp = mapEvents.warps.find(w => w.id === selectedWarpId) ?? mapEvents.warps[0];
  const selectedSign = mapEvents.signs.find(s => s.id === selectedSignId) ?? mapEvents.signs[0];

  // Active script code
  const currentScriptId = selectedNpc?.scriptId ?? selectedSign?.scriptId ?? '';
  const currentScript = scripts[currentScriptId];
  const [editedScriptCode, setEditedScriptCode] = useState<string>(currentScript?.code ?? '');

  // Synchronize script code when selection changes
  React.useEffect(() => {
    if (currentScript) {
      setEditedScriptCode(currentScript.code);
    }
  }, [currentScriptId, currentScript]);

  // Handlers for NPCs
  const handleAddNpc = () => {
    const newId = `NPC_CUSTOM_${Date.now().toString().slice(-4)}`;
    const newNpc: NpcEvent = {
      id: newId,
      localId: mapEvents.npcs.length + 1,
      x: 8,
      y: 8,
      spriteId: 'EVENT_OBJ_GFX_BOY_1',
      movementType: 'wander_around',
      movementRangeX: 1,
      movementRangeY: 1,
      trainerType: 'none',
      sightRadius: 0,
      scriptId: `${mapId}_EventScript_${newId}`
    };

    // Add placeholder script
    const newScript: EventScript = {
      id: newNpc.scriptId,
      name: newNpc.scriptId,
      code: `${newNpc.scriptId}::\n\tlock\n\tfaceplayer\n\tmsgbox "Hello traveler! I am a newly created NPC in ${mapName}!", MSGBOX_DEFAULT\n\trelease\n\tend`,
      parsedCommands: []
    };
    onUpdateScript(newScript);

    onUpdateEvents({
      ...mapEvents,
      npcs: [...mapEvents.npcs, newNpc]
    });
    setSelectedNpcId(newId);
  };

  const handleUpdateNpc = (updated: NpcEvent) => {
    onUpdateEvents({
      ...mapEvents,
      npcs: mapEvents.npcs.map(n => n.id === updated.id ? updated : n)
    });
  };

  const handleDeleteNpc = (id: string) => {
    const filtered = mapEvents.npcs.filter(n => n.id !== id);
    onUpdateEvents({
      ...mapEvents,
      npcs: filtered
    });
    if (filtered.length > 0) setSelectedNpcId(filtered[0].id);
  };

  // Handlers for Warps
  const handleAddWarp = () => {
    const newId = `WARP_CUSTOM_${Date.now().toString().slice(-4)}`;
    const newWarp: WarpEvent = {
      id: newId,
      x: 9,
      y: 9,
      elevation: 0,
      targetMapId: mapId,
      targetWarpId: 0
    };
    onUpdateEvents({
      ...mapEvents,
      warps: [...mapEvents.warps, newWarp]
    });
    setSelectedWarpId(newId);
  };

  const handleUpdateWarp = (updated: WarpEvent) => {
    onUpdateEvents({
      ...mapEvents,
      warps: mapEvents.warps.map(w => w.id === updated.id ? updated : w)
    });
  };

  const handleDeleteWarp = (id: string) => {
    const filtered = mapEvents.warps.filter(w => w.id !== id);
    onUpdateEvents({
      ...mapEvents,
      warps: filtered
    });
    if (filtered.length > 0) setSelectedWarpId(filtered[0].id);
  };

  // Save Script Code
  const handleSaveScript = () => {
    if (!currentScript) return;
    onUpdateScript({
      ...currentScript,
      code: editedScriptCode
    });
    setScriptEditSuccess(true);
    setTimeout(() => setScriptEditSuccess(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      {/* Event Category Tabs */}
      <div className="h-12 px-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('npcs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'npcs'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>NPCs & Trainers ({mapEvents.npcs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('warps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'warps'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <DoorOpen className="w-3.5 h-3.5" />
            <span>Warp Portals ({mapEvents.warps.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('signs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'signs'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Signposts & Boards ({mapEvents.signs.length})</span>
          </button>
        </div>

        <button
          onClick={activeTab === 'npcs' ? handleAddNpc : activeTab === 'warps' ? handleAddWarp : undefined}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-400" />
          <span>Add {activeTab === 'npcs' ? 'New NPC' : activeTab === 'warps' ? 'New Warp' : 'Sign'}</span>
        </button>
      </div>

      {/* Main 2-Pane Editor View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left List of Events */}
        <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {mapName} Event Registry
          </div>

          <div className="p-2 space-y-1">
            {activeTab === 'npcs' && mapEvents.npcs.map(npc => {
              const isSelected = selectedNpc?.id === npc.id;
              return (
                <button
                  key={npc.id}
                  onClick={() => setSelectedNpcId(npc.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-200">
                      #{npc.localId} {npc.id.replace('NPC_', '')}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      ({npc.x}, {npc.y})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 truncate">
                    Sprite: {npc.spriteId.replace('EVENT_OBJ_GFX_', '')}
                  </div>
                  <div className="text-[10px] text-indigo-400 mt-0.5 truncate font-mono">
                    Script: {npc.scriptId}
                  </div>
                </button>
              );
            })}

            {activeTab === 'warps' && mapEvents.warps.map(warp => {
              const isSelected = selectedWarp?.id === warp.id;
              return (
                <button
                  key={warp.id}
                  onClick={() => setSelectedWarpId(warp.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-200 truncate">
                      {warp.id}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      ({warp.x}, {warp.y})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 truncate">
                    Destination: {warp.targetMapId} (Warp #{warp.targetWarpId})
                  </div>
                </button>
              );
            })}

            {activeTab === 'signs' && mapEvents.signs.map(sign => {
              const isSelected = selectedSign?.id === sign.id;
              return (
                <button
                  key={sign.id}
                  onClick={() => setSelectedSignId(sign.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-200 truncate">
                      {sign.id}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      ({sign.x}, {sign.y})
                    </span>
                  </div>
                  <div className="text-[11px] text-indigo-400 mt-1 truncate font-mono">
                    Script: {sign.scriptId}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Detail Inspector & Script Editor */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 flex flex-col gap-6">
          {activeTab === 'npcs' && selectedNpc && (
            <>
              {/* NPC Inspector Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white font-display">
                      NPC Inspector: #{selectedNpc.localId} ({selectedNpc.id})
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configure map coordinates, sprite appearance, movement logic, and sight radius.
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteNpc(selectedNpc.id)}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                    title="Delete this NPC"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Position Coordinates */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Tile Coordinates (X, Y)
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <span className="text-[10px] text-slate-500 block">X</span>
                        <input
                          type="number"
                          value={selectedNpc.x}
                          onChange={e => handleUpdateNpc({ ...selectedNpc, x: parseInt(e.target.value) || 0 })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] text-slate-500 block">Y</span>
                        <input
                          type="number"
                          value={selectedNpc.y}
                          onChange={e => handleUpdateNpc({ ...selectedNpc, y: parseInt(e.target.value) || 0 })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sprite ID */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Overworld Sprite
                    </label>
                    <select
                      value={selectedNpc.spriteId}
                      onChange={e => handleUpdateNpc({ ...selectedNpc, spriteId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white"
                    >
                      {SPRITE_PRESETS.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                      ))}
                    </select>
                  </div>

                  {/* Movement Type */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Movement Behavior
                    </label>
                    <select
                      value={selectedNpc.movementType}
                      onChange={e => handleUpdateNpc({ ...selectedNpc, movementType: e.target.value as NpcMovementType })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white"
                    >
                      {MOVEMENT_TYPES.map(m => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Trainer Type & Sight */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Trainer Type
                    </label>
                    <select
                      value={selectedNpc.trainerType}
                      onChange={e => handleUpdateNpc({ ...selectedNpc, trainerType: e.target.value as 'none' | 'normal' | 'boss' })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="none">Standard NPC (Friendly / Story)</option>
                      <option value="normal">Active Trainer (Engages on sight)</option>
                      <option value="boss">Boss / Gym Leader / Rival</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Trainer Sight Radius (Tiles)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={8}
                      value={selectedNpc.sightRadius}
                      onChange={e => handleUpdateNpc({ ...selectedNpc, sightRadius: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Linked Script Pointer
                    </label>
                    <input
                      type="text"
                      value={selectedNpc.scriptId}
                      onChange={e => handleUpdateNpc({ ...selectedNpc, scriptId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-indigo-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Event Script Bytecode Editor */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex-1 flex flex-col min-h-[300px]">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-200 font-display">
                      Event Script Assembly: <code className="text-indigo-400 font-mono">{selectedNpc.scriptId}</code>
                    </span>
                  </div>
                  <button
                    onClick={handleSaveScript}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    {scriptEditSuccess ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Check className="w-3.5 h-3.5" />}
                    <span>{scriptEditSuccess ? 'Script Saved!' : 'Save Script Bytecode'}</span>
                  </button>
                </div>

                <div className="flex-1 flex flex-col">
                  <textarea
                    value={editedScriptCode}
                    onChange={e => setEditedScriptCode(e.target.value)}
                    className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-emerald-400 font-mono leading-relaxed resize-none focus:outline-none focus:border-indigo-500"
                    placeholder="Enter pokeemerald event script..."
                    rows={12}
                  />
                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 font-mono">
                    <span>XSE / pret macro compatible syntax (`lock`, `msgbox`, `trainerbattle3`, `giveitem`)</span>
                    <span>Lines: {editedScriptCode.split('\n').length}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'warps' && selectedWarp && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm max-w-xl">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white font-display">
                  Warp Portal: {selectedWarp.id}
                </h3>
                <button
                  onClick={() => handleDeleteWarp(selectedWarp.id)}
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">X Coordinate</label>
                    <input
                      type="number"
                      value={selectedWarp.x}
                      onChange={e => handleUpdateWarp({ ...selectedWarp, x: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Y Coordinate</label>
                    <input
                      type="number"
                      value={selectedWarp.y}
                      onChange={e => handleUpdateWarp({ ...selectedWarp, y: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Target Map Identifier</label>
                  <input
                    type="text"
                    value={selectedWarp.targetMapId}
                    onChange={e => handleUpdateWarp({ ...selectedWarp, targetMapId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-indigo-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Target Warp Index</label>
                  <input
                    type="number"
                    value={selectedWarp.targetWarpId}
                    onChange={e => handleUpdateWarp({ ...selectedWarp, targetWarpId: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
