/**
 * SecureDrop Cryptographic Module: AES-256-GCM & SHA-256
 * Native Web Crypto API implementation for browser-side encryption & decryption.
 */

export const CHUNK_SIZE = 8 * 1024 * 1024; // 8 MB chunk size for S3 multipart
export const AES_TAG_LENGTH = 128; // 128-bit authentication tag (16 bytes)

/**
 * Generates a cryptographically secure random 256-bit AES-GCM key.
 */
export async function generateFileKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true, // extractable for client-side wrapping
    ["encrypt", "decrypt"]
  );
}

/**
 * Derives a unique 12-byte (96-bit) IV for each chunk.
 * Combines an 8-byte random base IV with a 4-byte big-endian chunk counter.
 * This guarantees non-repeating IVs across all chunks of a file.
 */
export function deriveChunkIv(baseIv: Uint8Array, chunkIndex: number): Uint8Array {
  if (baseIv.length !== 8) {
    throw new Error("Base IV must be exactly 8 bytes");
  }
  const iv = new Uint8Array(12);
  iv.set(baseIv, 0);
  const view = new DataView(iv.buffer, iv.byteOffset, iv.byteLength);
  view.setUint32(8, chunkIndex, false); // Big-endian 4-byte counter
  return iv;
}

/**
 * Encrypts a chunk of data using AES-256-GCM with authenticated tag.
 * Returns an ArrayBuffer containing ciphertext with the 16-byte auth tag.
 */
export async function encryptChunk(
  key: CryptoKey,
  chunk: ArrayBuffer,
  chunkIndex: number,
  baseIv: Uint8Array
): Promise<ArrayBuffer> {
  const iv = deriveChunkIv(baseIv, chunkIndex);
  return await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource,
      tagLength: AES_TAG_LENGTH,
    },
    key,
    chunk
  );
}

/**
 * Decrypts a chunk of ciphertext using AES-256-GCM.
 * Web Crypto automatically verifies the 16-byte authentication tag.
 * Throws an OperationError if ciphertext or tag was tampered with.
 */
export async function decryptChunk(
  key: CryptoKey,
  encryptedChunk: ArrayBuffer,
  chunkIndex: number,
  baseIv: Uint8Array
): Promise<ArrayBuffer> {
  const iv = deriveChunkIv(baseIv, chunkIndex);
  return await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource,
      tagLength: AES_TAG_LENGTH,
    },
    key,
    encryptedChunk
  );
}

/**
 * Computes SHA-256 hex digest of an ArrayBuffer.
 */
export async function computeSha256(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Helper to convert Uint8Array / ArrayBuffer to Base64 string.
 */
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Helper to convert Base64 string to Uint8Array.
 */
export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
