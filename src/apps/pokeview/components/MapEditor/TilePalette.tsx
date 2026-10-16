/**
 * @file TilePalette.tsx
 * @package pokeview
 * @description Metatile and collision permission palette selector.
 */

import React from 'react';
import { MovementPermission } from '@/src/packages/pokedcomp/types.ts';
import { MapTool } from '../../types.ts';
import { Paintbrush, PaintBucket, Eraser, ShieldAlert, MousePointer } from 'lucide-react';

export interface MetatileDef {
  id: number;
  name: string;
  color: string;
  border?: string;
  defaultPerm: MovementPermission;
}

export const METATILES: MetatileDef[] = [
  { id: 1, name: 'Lush Grass', color: '#4ade80', defaultPerm: 'passable' },
  { id: 2, name: 'Dirt Path', color: '#d97706', defaultPerm: 'passable' },
  { id: 5, name: 'Water / Ocean', color: '#0284c7', defaultPerm: 'water' },
  { id: 10, name: 'Forest Tree', color: '#166534', border: '#14532d', defaultPerm: 'impassable' },
  { id: 12, name: 'Tree Wall Border', color: '#1e3a1e', defaultPerm: 'impassable' },
  { id: 15, name: 'Flower Bed', color: '#f43f5e', defaultPerm: 'passable' },
  { id: 18, name: 'Tall Grass', color: '#15803d', defaultPerm: 'tall_grass' },
  { id: 20, name: 'House Roof (Red)', color: '#dc2626', defaultPerm: 'impassable' },
  { id: 25, name: 'House Roof (Blue)', color: '#2563eb', defaultPerm: 'impassable' },
  { id: 30, name: 'Ledge (Jump Down)', color: '#b45309', defaultPerm: 'jump_down' },
  { id: 45, name: 'House Door (Warp)', color: '#78350f', defaultPerm: 'warp' },
  { id: 60, name: 'Lab Roof Tile', color: '#475569', defaultPerm: 'impassable' },
  { id: 95, name: 'Lab Glass Door', color: '#38bdf8', defaultPerm: 'warp' }
];

export const COLLISION_TYPES: { id: MovementPermission; label: string; color: string; badge: string }[] = [
  { id: 'passable', label: 'Passable (0x00)', color: '#22c55e', badge: '✓' },
  { id: 'impassable', label: 'Impassable (0x01)', color: '#ef4444', badge: '✕' },
  { id: 'tall_grass', label: 'Tall Grass (0x0C)', color: '#10b981', badge: 'W' },
  { id: 'water', label: 'Water/Surf (0x04)', color: '#06b6d4', badge: '~' },
  { id: 'jump_down', label: 'Ledge Down (0x38)', color: '#f59e0b', badge: '↓' },
  { id: 'warp', label: 'Warp Door (0x69)', color: '#a855f7', badge: '◒' },
];

interface TilePaletteProps {
  selectedMetatile: number;
  onSelectMetatile: (id: number) => void;
  selectedTool: MapTool;
  onSelectTool: (tool: MapTool) => void;
  selectedCollision: MovementPermission;
  onSelectCollision: (perm: MovementPermission) => void;
}

export const TilePalette: React.FC<TilePaletteProps> = ({
  selectedMetatile,
  onSelectMetatile,
  selectedTool,
  onSelectTool,
  selectedCollision,
  onSelectCollision
}) => {
  return (
    <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-y-auto">
      {/* Editor Tools */}
      <div className="p-4 border-b border-slate-800">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2.5">
          Drawing Tools
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={() => onSelectTool('brush')}
            className={`p-2 flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedTool === 'brush'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Brush Tool (Paint metatile)"
          >
            <Paintbrush className="w-4 h-4 mb-1" />
            <span>Brush</span>
          </button>
          <button
            onClick={() => onSelectTool('fill')}
            className={`p-2 flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedTool === 'fill'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Bucket Fill (Fill contiguous metatiles)"
          >
            <PaintBucket className="w-4 h-4 mb-1" />
            <span>Fill</span>
          </button>
          <button
            onClick={() => onSelectTool('collision_paint')}
            className={`p-2 flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedTool === 'collision_paint'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Collision Mask Tool"
          >
            <ShieldAlert className="w-4 h-4 mb-1" />
            <span>Mask</span>
          </button>
          <button
            onClick={() => onSelectTool('select')}
            className={`p-2 flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedTool === 'select'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Select & Inspect Metatile/Event"
          >
            <MousePointer className="w-4 h-4 mb-1" />
            <span>Select</span>
          </button>
        </div>
      </div>

      {/* Movement Collision Permissions Palette */}
      {selectedTool === 'collision_paint' ? (
        <div className="p-4 border-b border-slate-800">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-2.5">
            Collision Permission
          </span>
          <div className="space-y-1.5">
            {COLLISION_TYPES.map(perm => {
              const isSelected = selectedCollision === perm.id;
              return (
                <button
                  key={perm.id}
                  onClick={() => onSelectCollision(perm.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border border-amber-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[10px] font-bold text-slate-950"
                      style={{ backgroundColor: perm.color }}
                    >
                      {perm.badge}
                    </span>
                    <span>{perm.label}</span>
                  </div>
                  {isSelected && <span className="text-amber-400 font-mono text-[11px]">ACTIVE</span>}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Metatiles Catalog */}
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            16x16 Metatiles
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            {METATILES.length} Blocks
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {METATILES.map(meta => {
            const isSelected = selectedMetatile === meta.id;
            return (
              <button
                key={meta.id}
                onClick={() => {
                  onSelectMetatile(meta.id);
                  if (selectedTool === 'collision_paint') {
                    onSelectTool('brush');
                  }
                }}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/40 shadow-sm ring-1 ring-indigo-500'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div
                  className="w-full h-10 rounded-md border border-slate-700/50 flex items-center justify-center shadow-inner relative overflow-hidden"
                  style={{ backgroundColor: meta.color }}
                >
                  {meta.border && (
                    <div
                      className="absolute inset-1 rounded-sm border"
                      style={{ borderColor: meta.border }}
                    />
                  )}
                  <span className="text-[10px] font-mono font-bold text-slate-900 bg-white/70 px-1 rounded">
                    #{meta.id}
                  </span>
                </div>
                <div className="truncate">
                  <div className="text-xs font-medium text-slate-200 truncate">{meta.name}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{meta.defaultPerm}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
