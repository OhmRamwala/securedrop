/**
 * SecureDrop Key Management Module
 * Implements client-side key wrapping using PBKDF2 & AES-256-GCM.
 * The server only receives wrapped key ciphertext, random salt, and code hash.
 * Plaintext AES file keys NEVER leave the browser unencrypted.
 */

import { bufferToBase64, base64ToBuffer, computeSha256 } from "./aes";

// Unambiguous characters for human readability
const CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Generates a random 6-character transfer code (e.g. 8F42K9).
 */
export function generateTransferCode(length = 6): string {
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[randomValues[i] % CODE_CHARS.length];
  }
  return code;
}

/**
 * Derives a transfer lookup hash from the code: SHA-256(code).
 * The server only stores and indexes this hash, not the code itself.
 */
export async function hashTransferCode(code: string): Promise<string> {
  const normalized = code.trim().toUpperCase();
  const encoder = new TextEncoder();
  return await computeSha256(encoder.encode(normalized).buffer as ArrayBuffer);
}

/**
 * Derives an AES-GCM-256 key wrapping key from the transfer code and salt
 * using PBKDF2 with 100,000 iterations of SHA-256.
 */
async function deriveWrappingKey(code: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const normalized = code.trim().toUpperCase();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(normalized),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export interface WrappedKeyBundle {
  wrappedKey: string; // Base64 encoded wrapped raw key
  salt: string;       // Base64 encoded 16-byte PBKDF2 salt
  iv: string;         // Base64 encoded 12-byte AES-GCM IV for key wrapping
}

/**
 * Wraps the raw 256-bit AES file key using a key derived from the transfer code.
 */
export async function wrapFileKey(
  fileKey: CryptoKey,
  code: string
): Promise<WrappedKeyBundle> {
  // 1. Export raw 32-byte file key
  const rawFileKey = await crypto.subtle.exportKey("raw", fileKey);

  // 2. Generate cryptographically secure salt & IV
  const salt = new Uint8Array(16);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(salt);
  crypto.getRandomValues(iv);

  // 3. Derive wrapping key
  const wrappingKey = await deriveWrappingKey(code, salt);

  // 4. Encrypt raw file key
  const wrappedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource, tagLength: 128 },
    wrappingKey,
    rawFileKey
  );

  return {
    wrappedKey: bufferToBase64(wrappedBuffer),
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
  };
}

/**
 * Unwraps the AES file key using the provided transfer code.
 * Throws an error if the transfer code or wrapped key is invalid.
 */
export async function unwrapFileKey(
  bundle: WrappedKeyBundle,
  code: string
): Promise<CryptoKey> {
  const salt = base64ToBuffer(bundle.salt);
  const iv = base64ToBuffer(bundle.iv);
  const wrappedKeyBytes = base64ToBuffer(bundle.wrappedKey);

  // 1. Derive wrapping key with same salt & code
  const wrappingKey = await deriveWrappingKey(code, salt);

  // 2. Decrypt raw file key
  const rawFileKey = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource, tagLength: 128 },
    wrappingKey,
    wrappedKeyBytes as BufferSource
  );

  // 3. Import raw bytes back into AES-GCM CryptoKey
  return await crypto.subtle.importKey(
    "raw",
    rawFileKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}
