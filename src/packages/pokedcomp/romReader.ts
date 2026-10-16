/**
 * @file romReader.ts
 * @package pokedcomp
 * @description Binary GBA ROM reader and pointer dereferencing utilities.
 */

import type { RomHeader, GameEngine } from './types.ts';

// Gen III standard charmap mapping for English ROMs
const CHARMAP: Record<number, string> = {
  0x00: ' ',
  0x01: 'À', 0x02: 'Á', 0x03: 'Â', 0x04: 'Ç', 0x05: 'È', 0x06: 'É', 0x07: 'Ê', 0x08: 'Ë',
  0x09: 'Ì', 0x0B: 'Î', 0x0C: 'Ï', 0x0D: 'Ò', 0x0E: 'Ó', 0x0F: 'Ô', 0x10: 'Œ', 0x11: 'Ù',
  0x12: 'Ú', 0x13: 'Û', 0x14: 'Ñ', 0x15: 'ß', 0x16: 'à', 0x17: 'á', 0x19: 'ç', 0x1A: 'è',
  0x1B: 'é', 0x1C: 'ê', 0x1D: 'ë', 0x1E: 'ì', 0x20: 'î', 0x21: 'ï', 0x22: 'ò', 0x23: 'ó',
  0x24: 'ô', 0x25: 'œ', 0x26: 'ù', 0x27: 'ú', 0x28: 'û', 0x29: 'ñ', 0x2A: 'º', 0x2B: 'ª',
  0x5A: 'Pk', 0x5B: 'Mn', 0x5C: 'Po', 0x5D: 'Ké', 0x5E: 'Bl', 0x5F: 'Oc', 0x60: 'K',
  0x79: '↑', 0x7A: '↓', 0x7B: '←', 0x7C: '→',
  0xA1: '0', 0xA2: '1', 0xA3: '2', 0xA4: '3', 0xA5: '4', 0xA6: '5', 0xA7: '6', 0xA8: '7',
  0xA9: '8', 0xAA: '9', 0xAB: '!', 0xAC: '?', 0xAD: '.', 0xAE: '-', 0xAF: '·', 0xB0: '…',
  0xB1: '“', 0xB2: '”', 0xB3: '‘', 0xB4: '’', 0xB5: '♂', 0xB6: '♀', 0xB7: '$', 0xB8: ',',
  0xB9: '×', 0xBA: '/', 
  0xBB: 'A', 0xBC: 'B', 0xBD: 'C', 0xBE: 'D', 0xBF: 'E', 0xC0: 'F', 0xC1: 'G', 0xC2: 'H',
  0xC3: 'I', 0xC4: 'J', 0xC5: 'K', 0xC6: 'L', 0xC7: 'M', 0xC8: 'N', 0xC9: 'O', 0xCA: 'P',
  0xCB: 'Q', 0xCC: 'R', 0xCD: 'S', 0xCE: 'T', 0xCF: 'U', 0xD0: 'V', 0xD1: 'W', 0xD2: 'X',
  0xD3: 'Y', 0xD4: 'Z',
  0xD5: 'a', 0xD6: 'b', 0xD7: 'c', 0xD8: 'd', 0xD9: 'e', 0xDA: 'f', 0xDB: 'g', 0xDC: 'h',
  0xDD: 'i', 0xDE: 'j', 0xDF: 'k', 0xE0: 'l', 0xE1: 'm', 0xE2: 'n', 0xE3: 'o', 0xE4: 'p',
  0xE5: 'q', 0xE6: 'r', 0xE7: 's', 0xE8: 't', 0xE9: 'u', 0xEA: 'v', 0xEB: 'w', 0xEC: 'x',
  0xED: 'y', 0xEE: 'z',
  0xFE: '\n',
  0xFF: '' // Terminator
};

export class GbaRomReader {
  private view: DataView;
  private buffer: Uint8Array;

  constructor(arrayBuffer: ArrayBuffer) {
    this.buffer = new Uint8Array(arrayBuffer);
    this.view = new DataView(arrayBuffer);
  }

  get length(): number {
    return this.buffer.length;
  }

  readU8(offset: number): number {
    if (offset < 0 || offset >= this.buffer.length) return 0;
    return this.view.getUint8(offset);
  }

  readU16(offset: number): number {
    if (offset < 0 || offset + 1 >= this.buffer.length) return 0;
    return this.view.getUint16(offset, true);
  }

  readU32(offset: number): number {
    if (offset < 0 || offset + 3 >= this.buffer.length) return 0;
    return this.view.getUint32(offset, true);
  }

  readPointer(offset: number): number {
    const raw = this.readU32(offset);
    // GBA ROM space is mapped from 0x08000000 to 0x09FFFFFF
    if ((raw & 0xFE000000) === 0x08000000) {
      return raw & 0x01FFFFFF;
    }
    return 0;
  }

  readTableEntries(offset: number, entrySize: number, count: number): Uint8Array[] {
    const entries: Uint8Array[] = [];
    for (let i = 0; i < count; i++) {
      entries.push(this.buffer.slice(offset + (i * entrySize), offset + (i * entrySize) + entrySize));
    }
    return entries;
  }

  readString(offset: number, maxLength = 32): string {
    let result = '';
    for (let i = 0; i < maxLength; i++) {
      const byte = this.readU8(offset + i);
      if (byte === 0xFF) break;
      result += CHARMAP[byte] ?? '?';
    }
    return result;
  }

  readAscii(offset: number, length: number): string {
    let str = '';
    for (let i = 0; i < length; i++) {
      const code = this.readU8(offset + i);
      if (code === 0) break;
      str += String.fromCharCode(code);
    }
    return str;
  }

  parseHeader(): RomHeader {
    const gameTitle = this.readAscii(0xA0, 12).trim();
    const gameCode = this.readAscii(0xAC, 4);
    const makerCode = this.readAscii(0xB0, 2);
    const version = this.readU8(0xBC);
    const complementChecksum = this.readU8(0xBD);

    // Calculate complement checksum across bytes 0xA0 to 0xBC
    let checksum = 0;
    for (let i = 0xA0; i <= 0xBC; i++) {
      checksum = (checksum - this.readU8(i)) & 0xFF;
    }
    const calculatedChecksum = (checksum - 0x19) & 0xFF;

    return {
      gameTitle,
      gameCode,
      makerCode,
      version,
      complementChecksum,
      calculatedChecksum,
      isValid: complementChecksum === calculatedChecksum
    };
  }

  detectGame(): GameEngine {
    const header = this.parseHeader();
    if (header.gameCode.startsWith('BPE') || header.gameTitle.includes('EMER')) {
      return 'emerald';
    }
    if (header.gameCode.startsWith('BPR') || header.gameTitle.includes('FIRE')) {
      return 'firered';
    }
    return 'emerald'; // default fallback
  }

  getRawBytes(offset: number, length: number): Uint8Array {
    return this.buffer.slice(offset, offset + length);
  }

  lz77Decompress(offset: number): Uint8Array {
    const src = this.buffer.slice(offset);
    const type = src[0];
    if (type !== 0x10) throw new Error('Unsupported compression type');
    
    const size = src[1] | (src[2] << 8) | (src[3] << 16);
    const dest = new Uint8Array(size);
    let srcPtr = 4;
    let destPtr = 0;
    
    while (destPtr < size) {
      const flags = src[srcPtr++];
      for (let i = 0; i < 8; i++) {
        if (flags & (0x80 >> i)) {
          const val = (src[srcPtr] << 8) | src[srcPtr + 1];
          srcPtr += 2;
          const length = (val >> 12) + 3;
          const disp = (val & 0x0FFF) + 1;
          for (let j = 0; j < length; j++) {
            dest[destPtr] = dest[destPtr - disp];
            destPtr++;
          }
        } else {
          dest[destPtr++] = src[srcPtr++];
        }
        if (destPtr >= size) break;
      }
    }
    return dest;
  }
}
