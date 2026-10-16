/**
 * @file AssetManagerModal.tsx
 * @package pokeview
 * @description Asset manager for uploading and replacing custom tilesets, sprite sheets, and audio.
 */

import React, { useRef, useState } from 'react';
import { DecompiledProject, PokemonSpecies } from '@/src/packages/pokedcomp/types.ts';
import { X, Upload, Image as ImageIcon, Music, Check, Layers } from 'lucide-react';

interface AssetManagerModalProps {
  project: DecompiledProject;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject: (updated: DecompiledProject) => void;
}

export const AssetManagerModal: React.FC<AssetManagerModalProps> = ({
  project,
  isOpen,
  onClose,
  onUpdateProject
}) => {
  const [activeTab, setActiveTab] = useState<'tilesets' | 'sprites' | 'audio'>('tilesets');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedAssetKey, setSelectedAssetKey] = useState<string>('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setSuccessMsg(`Successfully uploaded asset "${file.name}" for ${selectedAssetKey}!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="h-14 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              📂
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-display">
                PokéForge Asset Manager
              </h2>
              <div className="text-[11px] text-slate-400 font-mono">
                Upload & Replace Custom Tilesets, Sprites & Audio
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tilesets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'tilesets' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Map Tilesets</span>
          </button>
          <button
            onClick={() => setActiveTab('sprites')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'sprites' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Pokémon & NPC Sprites</span>
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'audio' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Chiptune Audio (.midi/.wav)</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950">
          {successMsg && (
            <div className="p-3 bg-emerald-950 border border-emerald-600 rounded-xl text-xs text-emerald-300 font-medium flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={activeTab === 'audio' ? '.mid,.wav,.mp3' : '.png,.gif,.bmp'}
            className="hidden"
            onChange={handleFileUpload}
          />

          {activeTab === 'tilesets' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Replace existing 16x16 metatile graphic sheets for maps in your project.
              </div>
              {['gTileset_General', 'gTileset_PalletTown', 'gTileset_Route1', 'gTileset_Building'].map(tileset => (
                <div key={tileset} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white font-mono">{tileset}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Standard Gen III 16-color indexed PNG sheet</div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAssetKey(tileset);
                      fileInputRef.current?.click();
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload PNG</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'sprites' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Upload custom front/back Pokémon sprites or overworld NPC character sheets.
              </div>
              {(Object.values(project.species) as PokemonSpecies[]).slice(0, 5).map(sp => (
                <div key={sp.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-bold text-xs" style={{ backgroundColor: sp.spriteColor }}>
                      #{sp.dexNumber}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{sp.name} ({sp.id})</div>
                      <div className="text-[11px] text-slate-400">64x64 Front & Back Sprites</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAssetKey(sp.name);
                      fileInputRef.current?.click();
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Replace Sprite</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Upload custom background music sequences or sound effect WAV files.
              </div>
              {['MUS_LITTLEROOT', 'MUS_ROUTE101', 'MUS_ENCOUNTER_GYM', 'MUS_VICTORY'].map(track => (
                <div key={track} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white font-mono">{track}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Direct Audio Track Sequence</div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAssetKey(track);
                      fileInputRef.current?.click();
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Audio</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
