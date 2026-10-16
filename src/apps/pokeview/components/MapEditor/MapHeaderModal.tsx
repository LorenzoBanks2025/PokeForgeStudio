/**
 * @file MapHeaderModal.tsx
 * @package pokeview
 * @description Modal for configuring map header properties: BGM music, weather, and map type.
 */

import React, { useState } from 'react';
import { MapLayout } from '@/src/packages/pokedcomp/types.ts';
import { X, Music, CloudRain, MapPin, Compass, Swords, Check } from 'lucide-react';

export const MUSIC_TRACKS = [
  { id: 'MUS_LITTLEROOT', name: 'Littleroot Town (Peaceful Starter)' },
  { id: 'MUS_PALLET', name: 'Pallet Town (Classic Nostalgia)' },
  { id: 'MUS_ROUTE101', name: 'Route 101 (Upbeat Adventure)' },
  { id: 'MUS_ROUTE104', name: 'Route 104 (Ocean Coastline)' },
  { id: 'MUS_ROUTE110', name: 'Route 110 (Cycling Road)' },
  { id: 'MUS_OLDALE', name: 'Oldale Town (Calm Village)' },
  { id: 'MUS_DEWFORD', name: 'Dewford Town (Island Rhythm)' },
  { id: 'MUS_VERMILION', name: 'Vermilion City (Port Harbor)' },
  { id: 'MUS_CELADON', name: 'Celadon City (Bustling Metropolis)' },
  { id: 'MUS_GYM', name: 'Pokémon Gym (Challenger Anthem)' },
  { id: 'MUS_SURF', name: 'Surfing Theme (Wave Rider)' },
  { id: 'MUS_CAVE', name: 'Cave Theme (Echoing Depths)' },
  { id: 'MUS_VICTORY_ROAD', name: 'Victory Road (Climactic Ascent)' }
];

export const WEATHER_OPTIONS = [
  { id: 'WEATHER_SUNNY', name: 'Clear Sky / Sunny (Default)', icon: '☀️' },
  { id: 'WEATHER_RAIN', name: 'Gentle Rainstorm', icon: '🌧️' },
  { id: 'WEATHER_HEAVY_RAIN', name: 'Downpour & Thunder', icon: '⛈️' },
  { id: 'WEATHER_SANDSTORM', name: 'Desert Sandstorm', icon: '🌪️' },
  { id: 'WEATHER_SNOW', name: 'Gentle Snowfall', icon: '❄️' },
  { id: 'WEATHER_FOG', name: 'Dense Rolling Fog', icon: '🌫️' },
  { id: 'WEATHER_SHADE', name: 'Cloudy / Forest Shade', icon: '☁️' },
  { id: 'WEATHER_UNDERWATER', name: 'Underwater Bubbles & Current', icon: '🫧' }
];

export const MAP_TYPES = [
  { id: 'MAP_TYPE_TOWN', name: 'Town / City (Outdoor Civilized)' },
  { id: 'MAP_TYPE_ROUTE', name: 'Wilderness Route (Tall Grass Encounter Zone)' },
  { id: 'MAP_TYPE_INDOOR', name: 'Indoor Building / House / Pokémon Center' },
  { id: 'MAP_TYPE_CAVE', name: 'Cave / Dungeon / Ruin' },
  { id: 'MAP_TYPE_UNDERWATER', name: 'Underwater Ocean Trench' }
];

export const BATTLE_SCENES = [
  { id: 'BATTLE_SCENE_NORMAL', name: 'Standard Field (Plains / Dirt)' },
  { id: 'BATTLE_SCENE_GRASS', name: 'Tall Grass Wilderness' },
  { id: 'BATTLE_SCENE_WATER', name: 'Open Ocean / Water Surface' },
  { id: 'BATTLE_SCENE_CAVE', name: 'Rocky Cave Platform' },
  { id: 'BATTLE_SCENE_GYM', name: 'Official Gym Battlefield' }
];

interface MapHeaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  layout: MapLayout;
  onSave: (updated: Partial<MapLayout>) => void;
}

export const MapHeaderModal: React.FC<MapHeaderModalProps> = ({
  isOpen,
  onClose,
  layout,
  onSave
}) => {
  const [name, setName] = useState(layout.name);
  const [music, setMusic] = useState(layout.music || 'MUS_LITTLEROOT');
  const [weather, setWeather] = useState(layout.weather || 'WEATHER_SUNNY');
  const [mapType, setMapType] = useState(layout.mapType || 'MAP_TYPE_TOWN');
  const [battleScene, setBattleScene] = useState(layout.battleScene || 'BATTLE_SCENE_NORMAL');

  if (!isOpen) return null;

  const handleApply = () => {
    onSave({
      name,
      music,
      weather,
      mapType,
      battleScene
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 text-slate-100">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-14 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-display">
                Map Header & Atmosphere Inspector
              </h2>
              <div className="text-[11px] text-slate-400 font-mono">
                {layout.id} ({layout.width}x{layout.height} blocks)
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Map Display Name */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>Map Display Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
              placeholder="e.g. Littleroot Town"
            />
          </div>

          {/* BGM Music Track */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-emerald-400" />
              <span>Background Music Track (BGM)</span>
            </label>
            <select
              value={music}
              onChange={e => setMusic(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            >
              {MUSIC_TRACKS.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.id})
                </option>
              ))}
            </select>
          </div>

          {/* Weather Effect */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              <span>Weather & Atmospheric Effect</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {WEATHER_OPTIONS.map(w => {
                const isSelected = weather === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => setWeather(w.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-base">{w.icon}</span>
                    <span className="truncate">{w.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map Type */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Map Classification Type</span>
            </label>
            <select
              value={mapType}
              onChange={e => setMapType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            >
              {MAP_TYPES.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Battle Scene */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-rose-400" />
              <span>Default Battle Arena Backdrop</span>
            </label>
            <select
              value={battleScene}
              onChange={e => setBattleScene(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            >
              {BATTLE_SCENES.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="h-16 px-6 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Map Header</span>
          </button>
        </div>
      </div>
    </div>
  );
};
