/**
 * @file ShopEditorView.tsx
 * @package pokeview
 * @description Poké Mart shop inventories and item price / effect editor.
 */

import React, { useState } from 'react';
import { Item } from '@/src/packages/pokedcomp/types.ts';
import { ShoppingBag, Plus, Trash2, Tag } from 'lucide-react';

interface ShopEditorViewProps {
  items: Record<string, Item>;
  onUpdateItem: (item: Item) => void;
  onCreateItem: (item: Item) => void;
}

export const ShopEditorView: React.FC<ShopEditorViewProps> = ({
  items,
  onUpdateItem,
  onCreateItem
}) => {
  const itemList = Object.values(items);
  const [selectedId, setSelectedId] = useState<string>(itemList[0]?.id ?? '');
  const selected = items[selectedId] ?? itemList[0];

  const handleCreateNewItem = () => {
    const newId = `ITEM_CUSTOM_${Date.now().toString().slice(-4)}`;
    const newItem: Item = {
      id: newId,
      name: 'Custom Max Elixir',
      pocket: 'items',
      price: 5000,
      description: 'Fully restores the PP of all moves learned by a single Pokémon.',
      battleUsage: true,
      fieldUsage: true
    };
    onCreateItem(newItem);
    setSelectedId(newId);
  };

  return (
    <div className="flex-1 flex bg-slate-950 overflow-hidden text-slate-100">
      {/* Left Item List */}
      <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Items & Shop Database ({itemList.length})
          </span>
          <button
            onClick={handleCreateNewItem}
            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer"
            title="Create New Item"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {itemList.map(item => {
            const isSelected = item.id === selectedId;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-white">{item.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{item.pocket.replace('_', ' ')}</div>
                </div>
                <div className="text-xs font-mono font-bold text-indigo-400">
                  ¥{item.price}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Item Inspector */}
      {selected && (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800">
              <ShoppingBag className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white font-display">
                Item Properties: {selected.name} ({selected.id})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Item Name</label>
                <input
                  type="text"
                  value={selected.name}
                  onChange={e => onUpdateItem({ ...selected, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Inventory Pocket</label>
                <select
                  value={selected.pocket}
                  onChange={e => onUpdateItem({ ...selected, pocket: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-white capitalize"
                >
                  <option value="items">Items</option>
                  <option value="key_items">Key Items</option>
                  <option value="poke_balls">Poké Balls</option>
                  <option value="tms_hms">TMs & HMs</option>
                  <option value="berries">Berries</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Shop Price (Poké Dollars)</label>
                <input
                  type="number"
                  min={0}
                  max={999999}
                  value={selected.price}
                  onChange={e => onUpdateItem({ ...selected, price: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-white font-mono"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-slate-400 block mb-1">In-Game Description</label>
                <textarea
                  value={selected.description}
                  onChange={e => onUpdateItem({ ...selected, description: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-white resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
