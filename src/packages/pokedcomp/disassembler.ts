/**
 * @file disassembler.ts
 * @package pokedcomp
 * @description Event script bytecode disassembler for pokeemerald and pokefirered.
 */

import type { EventScript } from './types.ts';
import { GbaRomReader } from './romReader.ts';

interface OpcodeDef {
  name: string;
  args: ('u8' | 'u16' | 'u32' | 'ptr' | 'flag' | 'var')[];
}

const OPCODES: Record<number, OpcodeDef> = {
  0x00: { name: 'nop', args: [] },
  0x02: { name: 'end', args: [] },
  0x03: { name: 'return', args: [] },
  0x04: { name: 'call', args: ['ptr'] },
  0x05: { name: 'goto', args: ['ptr'] },
  0x06: { name: 'goto_if', args: ['u8', 'ptr'] },
  0x07: { name: 'call_if', args: ['u8', 'ptr'] },
  0x0F: { name: 'msgbox', args: ['ptr', 'u8'] },
  0x1A: { name: 'giveitem', args: ['u16', 'u16'] },
  0x21: { name: 'compare', args: ['var', 'u16'] },
  0x25: { name: 'special', args: ['u16'] },
  0x27: { name: 'waitstate', args: [] },
  0x29: { name: 'setflag', args: ['flag'] },
  0x2A: { name: 'clearflag', args: ['flag'] },
  0x2B: { name: 'checkflag', args: ['flag'] },
  0x4F: { name: 'applymovement', args: ['u16', 'ptr'] },
  0x51: { name: 'waitmovement', args: ['u16'] },
  0x57: { name: 'playfanfare', args: ['u16'] },
  0x58: { name: 'waitfanfare', args: [] },
  0x59: { name: 'playse', args: ['u16'] },
  0x5A: { name: 'faceplayer', args: [] },
  0x5C: { name: 'trainerbattle3', args: ['u16', 'u16', 'ptr'] },
  0x67: { name: 'lock', args: [] },
  0x68: { name: 'lockall', args: [] },
  0x69: { name: 'release', args: [] },
  0x6A: { name: 'releaseall', args: [] },
  0x6C: { name: 'waitbuttonpress', args: [] },
  0x86: { name: 'fadescreen', args: ['u8'] },
  0x87: { name: 'fadescreenspeed', args: ['u8', 'u8'] },
  0x97: { name: 'setvar', args: ['var', 'u16'] },
  0x98: { name: 'addvar', args: ['var', 'u16'] },
};

export class ScriptDisassembler {
  static disassemble(reader: GbaRomReader, offset: number, scriptId: string, name: string): EventScript {
    const lines: string[] = [];
    const parsedCommands: { command: string; args: string[] }[] = [];
    let cur = offset;
    let terminated = false;
    let safetyCounter = 0;

    lines.push(`${name}::`);

    while (!terminated && safetyCounter < 100 && cur < reader.length) {
      safetyCounter++;
      const op = reader.readU8(cur);
      cur += 1;

      const def = OPCODES[op];
      if (!def) {
        const hex = op.toString(16).padStart(2, '0');
        lines.push(`\t.byte 0x${hex}`);
        parsedCommands.push({ command: '.byte', args: [`0x${hex}`] });
        continue;
      }

      const args: string[] = [];
      for (const argType of def.args) {
        if (argType === 'u8') {
          const val = reader.readU8(cur);
          cur += 1;
          args.push(`0x${val.toString(16)}`);
        } else if (argType === 'u16' || argType === 'flag' || argType === 'var') {
          const val = reader.readU16(cur);
          cur += 2;
          args.push(`0x${val.toString(16).padStart(4, '0')}`);
        } else if (argType === 'u32' || argType === 'ptr') {
          const val = reader.readPointer(cur);
          cur += 4;
          args.push(`0x08${val.toString(16).padStart(6, '0')}`);
        }
      }

      parsedCommands.push({ command: def.name, args });
      lines.push(`\t${def.name}${args.length > 0 ? ' ' + args.join(', ') : ''}`);

      if (def.name === 'end' || def.name === 'return' || def.name === 'goto') {
        terminated = true;
      }
    }

    return {
      id: scriptId,
      name,
      code: lines.join('\n'),
      parsedCommands
    };
  }

  static parseTextScript(code: string, id: string, name: string): EventScript {
    const lines = code.split('\n');
    const parsedCommands: { command: string; args: string[] }[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.endsWith('::') || line.startsWith('#') || line.startsWith('//')) {
        continue;
      }
      const spaceIdx = line.indexOf(' ');
      if (spaceIdx === -1) {
        parsedCommands.push({ command: line, args: [] });
      } else {
        const cmd = line.substring(0, spaceIdx).trim();
        const argPart = line.substring(spaceIdx + 1).trim();
        const args = argPart.split(',').map(s => s.trim());
        parsedCommands.push({ command: cmd, args });
      }
    }

    return {
      id,
      name,
      code,
      parsedCommands
    };
  }
  static assemble(script: EventScript): Uint8Array {
      const buffer = new Uint8Array(1024); // simplistic
      let pos = 0;
      const opMap = new Map(Object.entries(OPCODES).map(([k, v]) => [v.name, parseInt(k)]));
      
      for (const cmd of script.parsedCommands) {
          const op = opMap.get(cmd.command);
          if (op !== undefined) {
              buffer[pos++] = op;
              // Simplistic argument handling
              for (const arg of cmd.args) {
                  const val = parseInt(arg.replace('0x', ''), 16);
                  buffer[pos++] = val & 0xFF;
                  if (arg.length > 4) buffer[pos++] = (val >> 8) & 0xFF;
              }
          } else if (cmd.command === '.byte') {
              buffer[pos++] = parseInt(cmd.args[0].replace('0x', ''), 16);
          }
      }
      return buffer.slice(0, pos);
  }
}
