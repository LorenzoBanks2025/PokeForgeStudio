/**
 * @file MapCanvas.tsx
 * @package pokeview
 * @description Interactive canvas for painting GBA metatiles, collision masks, and inspecting events.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MapLayout, MapEvents, MovementPermission, MapBlock } from '@/src/packages/pokedcomp/types.ts';
import { MapTool } from '../../types.ts';
import { METATILES, MetatileDef } from './TilePalette.tsx';
import { ZoomIn, ZoomOut, Grid, Eye, EyeOff, Layers, MapPin } from 'lucide-react';

interface MapCanvasProps {
  mapLayout: MapLayout;
  mapEvents: MapEvents;
  selectedMetatile: number;
  selectedTool: MapTool;
  selectedCollision: MovementPermission;
  onUpdateBlocks: (newBlocks: MapBlock[]) => void;
  onSelectEvent: (eventId: string) => void;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  mapLayout,
  mapEvents,
  selectedMetatile,
  selectedTool,
  selectedCollision,
  onUpdateBlocks,
  onSelectEvent
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState<number>(2); // 1x, 2x, 3x, 4x
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showCollisions, setShowCollisions] = useState<boolean>(true);
  const [showEvents, setShowEvents] = useState<boolean>(true);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

  const tileSize = 16 * zoom;

  // Render canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { width, height, blocks } = mapLayout;
    const tileMap = new Map<number, MetatileDef>(METATILES.map(m => [m.id, m]));

    // 1. Draw Metatiles
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const block = blocks[y * width + x];
        const px = x * tileSize;
        const py = y * tileSize;

        const meta = tileMap.get(block?.metatileId ?? 1);
        ctx.fillStyle = meta ? meta.color : '#4ade80';
        ctx.fillRect(px, py, tileSize, tileSize);

        if (meta?.border) {
          ctx.strokeStyle = meta.border;
          ctx.lineWidth = Math.max(1, zoom);
          ctx.strokeRect(px + 1, py + 1, tileSize - 2, tileSize - 2);
        }

        // 2. Draw Movement Permissions Mask if enabled
        if (showCollisions && block) {
          if (block.permission === 'impassable') {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.35)'; // Red
            ctx.fillRect(px, py, tileSize, tileSize);
            // Draw X mark
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(px + 3, py + 3);
            ctx.lineTo(px + tileSize - 3, py + tileSize - 3);
            ctx.moveTo(px + tileSize - 3, py + 3);
            ctx.lineTo(px + 3, py + tileSize - 3);
            ctx.stroke();
          } else if (block.permission === 'tall_grass') {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.4)'; // Emerald
            ctx.fillRect(px, py, tileSize, tileSize);
          } else if (block.permission === 'water') {
            ctx.fillStyle = 'rgba(6, 182, 212, 0.35)'; // Cyan
            ctx.fillRect(px, py, tileSize, tileSize);
          } else if (block.permission === 'jump_down') {
            ctx.fillStyle = 'rgba(245, 158, 11, 0.4)'; // Amber
            ctx.fillRect(px, py, tileSize, tileSize);
          } else if (block.permission === 'warp') {
            ctx.fillStyle = 'rgba(168, 85, 247, 0.45)'; // Purple
            ctx.fillRect(px, py, tileSize, tileSize);
          }
        }

        // 3. Draw Grid Lines
        if (showGrid) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, tileSize, tileSize);
        }
      }
    }

    // 4. Draw Events
    if (showEvents) {
      // Draw Warps
      mapEvents.warps.forEach(w => {
        const px = w.x * tileSize;
        const py = w.y * tileSize;
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
      });

      // Draw Triggers
      mapEvents.triggers.forEach(t => {
        const px = t.x * tileSize;
        const py = t.y * tileSize;
        ctx.fillStyle = 'rgba(234, 179, 8, 0.7)';
        ctx.fillRect(px + 3, py + 3, tileSize - 6, tileSize - 6);
      });

      // Draw Signs
      mapEvents.signs.forEach(s => {
        const px = s.x * tileSize;
        const py = s.y * tileSize;
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(px + 4, py + 4, tileSize - 8, tileSize - 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + tileSize / 2 - 1, py + tileSize / 2 - 1, 2, 2);
      });

      // Draw NPCs
      mapEvents.npcs.forEach(n => {
        const px = n.x * tileSize;
        const py = n.y * tileSize;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(px + tileSize / 2, py + tileSize / 2, tileSize / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.max(9, zoom * 4)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(n.localId), px + tileSize / 2, py + tileSize / 2);
      });
    }

    // 5. Draw Hover Selector Box
    if (hoverCoord && hoverCoord.x < width && hoverCoord.y < height) {
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(hoverCoord.x * tileSize, hoverCoord.y * tileSize, tileSize, tileSize);
    }
  }, [mapLayout, mapEvents, tileSize, showGrid, showCollisions, showEvents, hoverCoord, zoom]);

  useEffect(() => {
    render();
  }, [render]);

  const getTileCoord = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / tileSize);
    const y = Math.floor((e.clientY - rect.top) / tileSize);
    if (x >= 0 && x < mapLayout.width && y >= 0 && y < mapLayout.height) {
      return { x, y };
    }
    return null;
  };

  const handleTileAction = (coord: { x: number; y: number }) => {
    const { width, height, blocks } = mapLayout;
    const newBlocks = [...blocks];
    const index = coord.y * width + coord.x;

    if (selectedTool === 'brush') {
      const meta = METATILES.find(m => m.id === selectedMetatile);
      newBlocks[index] = {
        metatileId: selectedMetatile,
        permission: meta ? meta.defaultPerm : 'passable',
        elevation: 0
      };
      onUpdateBlocks(newBlocks);
    } else if (selectedTool === 'collision_paint') {
      newBlocks[index] = {
        ...newBlocks[index],
        permission: selectedCollision
      };
      onUpdateBlocks(newBlocks);
    } else if (selectedTool === 'fill') {
      // Flood fill metatiles
      const targetMeta = blocks[index].metatileId;
      if (targetMeta === selectedMetatile) return;

      const queue: [number, number][] = [[coord.x, coord.y]];
      const visited = new Set<number>();
      const meta = METATILES.find(m => m.id === selectedMetatile);
      const perm = meta ? meta.defaultPerm : 'passable';

      while (queue.length > 0) {
        const [cx, cy] = queue.pop()!;
        const cIdx = cy * width + cx;
        if (visited.has(cIdx)) continue;
        visited.add(cIdx);

        if (newBlocks[cIdx].metatileId === targetMeta) {
          newBlocks[cIdx] = { metatileId: selectedMetatile, permission: perm, elevation: 0 };

          if (cx > 0) queue.push([cx - 1, cy]);
          if (cx < width - 1) queue.push([cx + 1, cy]);
          if (cy > 0) queue.push([cx, cy - 1]);
          if (cy < height - 1) queue.push([cx, cy + 1]);
        }
      }
      onUpdateBlocks(newBlocks);
    } else if (selectedTool === 'select') {
      // Check if an event was clicked
      const npc = mapEvents.npcs.find(n => n.x === coord.x && n.y === coord.y);
      if (npc) {
        onSelectEvent(npc.id);
        return;
      }
      const warp = mapEvents.warps.find(w => w.x === coord.x && w.y === coord.y);
      if (warp) {
        onSelectEvent(warp.id);
        return;
      }
      const sign = mapEvents.signs.find(s => s.x === coord.x && s.y === coord.y);
      if (sign) {
        onSelectEvent(sign.id);
        return;
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsMouseDown(true);
    const coord = getTileCoord(e);
    if (coord) {
      handleTileAction(coord);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coord = getTileCoord(e);
    setHoverCoord(coord);
    if (isMouseDown && coord && (selectedTool === 'brush' || selectedTool === 'collision_paint')) {
      handleTileAction(coord);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
      {/* Canvas Viewport Toolbar */}
      <div className="h-11 px-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-200">
            {mapLayout.name}
          </span>
          <span className="text-slate-500 font-mono text-[11px]">
            {mapLayout.width}×{mapLayout.height} Tiles ({mapLayout.width * 16}×{mapLayout.height * 16}px)
          </span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span>Tileset: <code className="text-slate-400 font-mono">{mapLayout.tilesetId}</code></span>
        </div>

        {/* View Controls & Toggles */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800/80 rounded-md border border-slate-700 p-0.5">
            <button
              onClick={() => setZoom(z => Math.max(1, z - 1))}
              disabled={zoom <= 1}
              className="p-1 hover:bg-slate-700 rounded text-slate-300 disabled:opacity-30 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-xs">{zoom}x</span>
            <button
              onClick={() => setZoom(z => Math.min(4, z + 1))}
              disabled={zoom >= 4}
              className="p-1 hover:bg-slate-700 rounded text-slate-300 disabled:opacity-30 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-md border text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
              showGrid
                ? 'bg-indigo-950/60 border-indigo-600 text-indigo-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Metatile Grid"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>

          {/* Collisions Toggle */}
          <button
            onClick={() => setShowCollisions(!showCollisions)}
            className={`p-1.5 rounded-md border text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
              showCollisions
                ? 'bg-amber-950/60 border-amber-600 text-amber-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Collision Masks"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Collisions</span>
          </button>

          {/* Events Toggle */}
          <button
            onClick={() => setShowEvents(!showEvents)}
            className={`p-1.5 rounded-md border text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
              showEvents
                ? 'bg-rose-950/60 border-rose-600 text-rose-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Event Markers"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Events ({mapEvents.npcs.length + mapEvents.warps.length + mapEvents.signs.length})</span>
          </button>
        </div>
      </div>

      {/* Canvas Viewport Scroll Area */}
      <div
        className="flex-1 overflow-auto p-8 flex items-center justify-center bg-radial from-slate-900 to-slate-950"
        onMouseUp={handleMouseUp}
      >
        <div className="relative border-4 border-slate-800 shadow-2xl rounded-sm overflow-hidden bg-slate-900">
          <canvas
            ref={canvasRef}
            width={mapLayout.width * tileSize}
            height={mapLayout.height * tileSize}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverCoord(null)}
            className="block cursor-crosshair pixelated"
          />
        </div>
      </div>

      {/* Coordinate & Inspector Footer */}
      <div className="h-7 px-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div>
          {hoverCoord ? (
            <span>
              X: <strong className="text-slate-200">{hoverCoord.x}</strong> Y: <strong className="text-slate-200">{hoverCoord.y}</strong>
              <span aria-hidden="true" className="mx-2 text-slate-600">·</span>
              Block: <strong className="text-slate-200">#{mapLayout.blocks[hoverCoord.y * mapLayout.width + hoverCoord.x]?.metatileId}</strong>
              <span aria-hidden="true" className="mx-2 text-slate-600">·</span>
              Permission: <span className="text-amber-400">{mapLayout.blocks[hoverCoord.y * mapLayout.width + hoverCoord.x]?.permission}</span>
            </span>
          ) : (
            <span>Hover over the canvas to inspect metatile attributes</span>
          )}
        </div>
        <div>
          Tool: <span className="text-indigo-400 uppercase">{selectedTool.replace('_', ' ')}</span>
        </div>
      </div>
    </div>
  );
};
