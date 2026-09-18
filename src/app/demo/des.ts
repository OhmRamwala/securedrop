/**
 * Educational Triple-DES (3DES / DES-EDE3) implementation
 * Used strictly for educational comparison against AES-256-GCM in /demo
 * Does NOT interact with SecureDrop production crypto.
 */

// Initial Permutation (IP)
const IP: number[] = [
  58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4,
  62, 54, 46, 38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8,
  57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3,
  61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7,
];

// Final Permutation (IP^-1)
const FP: number[] = [
  40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31,
  38, 6, 46, 14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29,
  36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27,
  34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25,
];

// Expansion Permutation (E)
const E_BOX: number[] = [
  32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13,
  12, 13, 14, 15, 16, 17, 16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24, 25,
  24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1,
];

// P-box Permutation
const P_BOX: number[] = [
  16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10,
  2, 8, 24, 14, 32, 27, 3, 9, 19, 13, 30, 6, 22, 11, 4, 25,
];

// S-boxes (1 through 8)
const S_BOXES: number[][][] = [
  [
    [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
    [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
    [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
    [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13],
  ],
  [
    [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
    [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
    [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
    [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9],
  ],
  [
    [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
    [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
    [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
    [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12],
  ],
  [
    [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
    [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
    [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
    [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14],
  ],
  [
    [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
    [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
    [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
    [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3],
  ],
  [
    [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
    [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
    [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
    [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13],
  ],
  [
    [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
    [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
    [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
    [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12],
  ],
  [
    [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
    [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
    [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
    [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11],
  ],
];

// Permuted Choice 1 (PC-1)
const PC1: number[] = [
  57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18,
  10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36,
  63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22,
  14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4,
];

// Permuted Choice 2 (PC-2)
const PC2: number[] = [
  14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10,
  23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2,
  41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48,
  44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32,
];

// Left shifts per round
const SHIFTS: number[] = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

function permute(source: number[], table: number[]): number[] {
  return table.map((pos) => source[pos - 1]);
}

function bytesToBits(bytes: Uint8Array): number[] {
  const bits: number[] = [];
  for (let i = 0; i < bytes.length; i++) {
    for (let b = 7; b >= 0; b--) {
      bits.push((bytes[i] >> b) & 1);
    }
  }
  return bits;
}

function bitsToBytes(bits: number[]): Uint8Array {
  const bytes = new Uint8Array(Math.ceil(bits.length / 8));
  for (let i = 0; i < bits.length; i++) {
    const byteIdx = Math.floor(i / 8);
    const bitPos = 7 - (i % 8);
    bytes[byteIdx] |= bits[i] << bitPos;
  }
  return bytes;
}

function generateSubkeys(keyBytes: Uint8Array): number[][] {
  const keyBits = bytesToBits(keyBytes.slice(0, 8));
  const pc1Key = permute(keyBits, PC1);
  let c = pc1Key.slice(0, 28);
  let d = pc1Key.slice(28, 56);

  const subkeys: number[][] = [];
  for (let round = 0; round < 16; round++) {
    const shift = SHIFTS[round];
    c = [...c.slice(shift), ...c.slice(0, shift)];
    d = [...d.slice(shift), ...d.slice(0, shift)];
    subkeys.push(permute([...c, ...d], PC2));
  }
  return subkeys;
}

function feistel(r: number[], subkey: number[]): number[] {
  const expanded = permute(r, E_BOX);
  const xored = expanded.map((bit, idx) => bit ^ subkey[idx]);
  const sOutputBits: number[] = [];

  for (let boxIdx = 0; boxIdx < 8; boxIdx++) {
    const chunk = xored.slice(boxIdx * 6, (boxIdx + 1) * 6);
    const row = (chunk[0] << 1) | chunk[5];
    const col = (chunk[1] << 3) | (chunk[2] << 2) | (chunk[3] << 1) | chunk[4];
    const val = S_BOXES[boxIdx][row][col];
    for (let b = 3; b >= 0; b--) {
      sOutputBits.push((val >> b) & 1);
    }
  }

  return permute(sOutputBits, P_BOX);
}

function desBlock(blockBytes: Uint8Array, subkeys: number[][]): Uint8Array {
  const bits = bytesToBits(blockBytes.slice(0, 8));
  const permuted = permute(bits, IP);
  let l = permuted.slice(0, 32);
  let r = permuted.slice(32, 64);

  for (let round = 0; round < 16; round++) {
    const fRes = feistel(r, subkeys[round]);
    const nextR = l.map((bit, idx) => bit ^ fRes[idx]);
    l = r;
    r = nextR;
  }

  const preFinal = [...r, ...l];
  return bitsToBytes(permute(preFinal, FP));
}

/**
 * Encrypt a single 64-bit block using Triple DES (DES-EDE3)
 * C = E_k3(D_k2(E_k1(P)))
 */
export function tripleDesEncryptBlock(
  blockBytes: Uint8Array,
  key1: Uint8Array,
  key2: Uint8Array,
  key3: Uint8Array
): Uint8Array {
  const subkeys1 = generateSubkeys(key1);
  const subkeys2 = generateSubkeys(key2).reverse(); // Decryption uses reverse subkeys
  const subkeys3 = generateSubkeys(key3);

  const step1 = desBlock(blockBytes, subkeys1);
  const step2 = desBlock(step1, subkeys2);
  const step3 = desBlock(step2, subkeys3);
  return step3;
}

/**
 * Encrypt arbitrary byte payload using 3DES in CBC mode with PKCS#7 padding
 */
export function tripleDesEncryptCbc(
  plaintext: Uint8Array,
  key24Bytes: Uint8Array,
  iv8Bytes: Uint8Array
): Uint8Array {
  const k1 = key24Bytes.slice(0, 8);
  const k2 = key24Bytes.slice(8, 16);
  const k3 = key24Bytes.slice(16, 24);

  // PKCS#7 padding for 8-byte blocks
  const padLen = 8 - (plaintext.length % 8);
  const padded = new Uint8Array(plaintext.length + padLen);
  padded.set(plaintext, 0);
  padded.fill(padLen, plaintext.length);

  const totalBlocks = padded.length / 8;
  const ciphertext = new Uint8Array(padded.length);
  let prev: Uint8Array = new Uint8Array(8);
  prev.set(iv8Bytes.subarray(0, 8));

  for (let i = 0; i < totalBlocks; i++) {
    const block = padded.subarray(i * 8, (i + 1) * 8);
    const xored = new Uint8Array(8);
    for (let b = 0; b < 8; b++) {
      xored[b] = block[b] ^ prev[b];
    }
    const encryptedBlock = tripleDesEncryptBlock(xored, k1, k2, k3);
    ciphertext.set(encryptedBlock, i * 8);
    prev = new Uint8Array(encryptedBlock);
  }

  return ciphertext;
}
