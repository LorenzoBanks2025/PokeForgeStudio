/**
 * @file romGraphics.ts
 * @package pokeview
 * @description Utilities for rendering GBA raw 4bpp binary data to browser Canvas.
 */

export const renderGbaTileToCanvas = (
  ctx: CanvasRenderingContext2D,
  tileData: Uint8Array,
  x: number,
  y: number,
  palette: string[] // Array of hex colors for the 16-color palette
) => {
  // A GBA 8x8 tile at 4bpp is 32 bytes
  if (tileData.length < 32) return;

  for (let ty = 0; ty < 8; ty++) {
    for (let tx = 0; tx < 8; tx++) {
      // 4bpp: each byte contains 2 pixels
      const byteIdx = (ty * 4) + Math.floor(tx / 2);
      const byte = tileData[byteIdx];
      const colorIdx = (tx % 2 === 0) ? (byte & 0x0F) : ((byte >> 4) & 0x0F);

      if (colorIdx > 0) { // Index 0 is transparent
        ctx.fillStyle = palette[colorIdx];
        ctx.fillRect(x + tx, y + ty, 1, 1);
      }
    }
  }
};
