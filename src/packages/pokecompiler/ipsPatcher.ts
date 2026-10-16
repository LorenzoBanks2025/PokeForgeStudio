/**
 * @file ipsPatcher.ts
 * @package pokecompiler
 * @description Standard IPS (International Production System) binary delta patcher and creator.
 * Enables legal ROM hack distribution without distributing copyrighted Nintendo ROM binaries.
 */

export class IpsPatcher {
  /**
   * Creates a standard IPS binary patch by comparing base ROM bytes with modified ROM bytes.
   */
  static createPatch(original: Uint8Array, modified: Uint8Array): Uint8Array {
    const patchParts: Uint8Array[] = [];

    // Header: 'PATCH'
    patchParts.push(new Uint8Array([0x50, 0x41, 0x54, 0x43, 0x48]));

    const minLen = Math.min(original.length, modified.length);
    let i = 0;

    while (i < modified.length) {
      // Find start of difference
      if (i < minLen && original[i] === modified[i]) {
        i++;
        continue;
      }

      // Found difference at offset i
      const offset = i;
      const diffBytes: number[] = [];

      // Collect contiguous difference bytes (up to max IPS chunk size 0xFFFF)
      while (i < modified.length && diffBytes.length < 0xFFFF) {
        if (i < minLen && original[i] === modified[i]) {
          // Lookahead: check if next 4 bytes are identical, if so, end this record
          let identicalAhead = 0;
          for (let k = 0; k < 6 && (i + k) < minLen; k++) {
            if (original[i + k] === modified[i + k]) identicalAhead++;
          }
          if (identicalAhead >= 4) {
            break;
          }
        }
        diffBytes.push(modified[i]);
        i++;
      }

      if (diffBytes.length === 0) continue;

      // Handle rare offset collision with 'EOF' (0x454F46)
      let recordOffset = offset;
      if (recordOffset === 0x454F46) {
        // Shift back by 1 byte if possible or write dummy byte
        recordOffset--;
        diffBytes.unshift(modified[recordOffset]);
      }

      const record = new Uint8Array(5 + diffBytes.length);
      // 3-byte offset (big-endian)
      record[0] = (recordOffset >> 16) & 0xFF;
      record[1] = (recordOffset >> 8) & 0xFF;
      record[2] = recordOffset & 0xFF;

      // 2-byte length (big-endian)
      const len = diffBytes.length;
      record[3] = (len >> 8) & 0xFF;
      record[4] = len & 0xFF;

      // Payload
      record.set(diffBytes, 5);
      patchParts.push(record);
    }

    // Trailer: 'EOF'
    patchParts.push(new Uint8Array([0x45, 0x4F, 0x46]));

    // Concatenate all parts
    const totalLength = patchParts.reduce((acc, part) => acc + part.length, 0);
    const result = new Uint8Array(totalLength);
    let currentOffset = 0;
    for (const part of patchParts) {
      result.set(part, currentOffset);
      currentOffset += part.length;
    }

    return result;
  }

  /**
   * Applies an IPS patch to an existing ROM buffer.
   */
  static applyPatch(rom: Uint8Array, patch: Uint8Array): Uint8Array {
    if (patch.length < 8) throw new Error('Invalid IPS patch: File too small');

    // Verify header
    const header = String.fromCharCode(...patch.slice(0, 5));
    if (header !== 'PATCH') throw new Error('Invalid IPS patch: Missing PATCH header');

    let patchedRom = new Uint8Array(rom);
    let offset = 5;

    while (offset < patch.length) {
      // Check for EOF marker
      if (
        patch[offset] === 0x45 &&
        patch[offset + 1] === 0x4F &&
        patch[offset + 2] === 0x46
      ) {
        break;
      }

      const recordOffset = (patch[offset] << 16) | (patch[offset + 1] << 8) | patch[offset + 2];
      const recordSize = (patch[offset + 3] << 8) | patch[offset + 4];
      offset += 5;

      if (recordSize === 0) {
        // RLE Record
        const rleLength = (patch[offset] << 8) | patch[offset + 1];
        const rleValue = patch[offset + 2];
        offset += 3;

        if (recordOffset + rleLength > patchedRom.length) {
          const expanded = new Uint8Array(recordOffset + rleLength);
          expanded.set(patchedRom);
          patchedRom = expanded;
        }

        patchedRom.fill(rleValue, recordOffset, recordOffset + rleLength);
      } else {
        // Normal Record
        const payload = patch.slice(offset, offset + recordSize);
        offset += recordSize;

        if (recordOffset + recordSize > patchedRom.length) {
          const expanded = new Uint8Array(recordOffset + recordSize);
          expanded.set(patchedRom);
          patchedRom = expanded;
        }

        patchedRom.set(payload, recordOffset);
      }
    }

    return patchedRom;
  }
}
