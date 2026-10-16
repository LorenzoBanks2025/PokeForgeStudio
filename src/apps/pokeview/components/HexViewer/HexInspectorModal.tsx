/**
 * @file HexInspectorModal.tsx
 * @package pokeview
 * @description Raw GBA ROM binary hex dump viewer and memory pointer offset inspector.
 */

import React, { useState } from 'react';
import { X, Search, FileCode } from 'lucide-react';

interface HexInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HexInspectorModal: React.FC<HexInspectorModalProps> = ({ isOpen, onClose }) => {
  const [offsetStr, setOffsetStr] = useState<string>('08000000');

  if (!isOpen) return null;

  // Generate simulated GBA ROM hex dump starting at offset
  const baseOffset = parseInt(offsetStr, 16) || 0x08000000;
  const rows = 16;
  const bytesPerRow = 16;

  const hexRows: { offset: string; hex: string; ascii: string }[] = [];
  for (let r = 0; r < rows; r++) {
    const currentOffset = baseOffset + r * bytesPerRow;
    const hexBytes: string[] = [];
    const asciiChars: string[] = [];

    for (let b = 0; b < bytesPerRow; b++) {
      const val = (currentOffset + b) % 255;
      hexBytes.push(val.toString(16).padStart(2, '0').toUpperCase());
      asciiChars.push(val >= 32 && val <= 126 ? String.fromCharCode(val) : '.');
    }

    hexRows.push({
      offset: currentOffset.toString(16).padStart(8, '0').toUpperCase(),
      hex: hexBytes.join(' '),
      ascii: asciiChars.join('')
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 text-slate-100">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-14 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              0x
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-display">
                GBA ROM Hex Offset & Memory Inspector
              </h2>
              <div className="text-[11px] text-slate-400 font-mono">
                Direct ARM7TDMI ROM Binary & Pointer Table Inspector
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

        {/* Offset Search Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400">Jump to Offset (Hex):</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-slate-500">0x</span>
            <input
              type="text"
              value={offsetStr}
              onChange={e => setOffsetStr(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-emerald-400 font-mono w-32"
            />
          </div>
          <button
            onClick={() => setOffsetStr('08000000')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium cursor-pointer"
          >
            Reset to 0x08000000
          </button>
        </div>

        {/* Hex Dump Table */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 font-mono text-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-4">
            <div className="grid grid-cols-[100px_1fr_200px] gap-4 text-slate-500 border-b border-slate-800 pb-2 mb-2 font-bold text-[11px]">
              <div>Offset</div>
              <div>Hexadecimal Bytes</div>
              <div>ASCII Decoded</div>
            </div>

            <div className="space-y-1">
              {hexRows.map((row, i) => (
                <div key={i} className="grid grid-cols-[100px_1fr_200px] gap-4 py-1 hover:bg-slate-850/50 rounded px-1">
                  <div className="text-indigo-400">0x{row.offset}</div>
                  <div className="text-emerald-400 tracking-wider">{row.hex}</div>
                  <div className="text-slate-300">{row.ascii}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
