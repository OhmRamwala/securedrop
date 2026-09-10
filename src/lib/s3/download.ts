/**
 * SecureDrop Browser-side Download & Decryption Engine
 * Downloads ciphertext directly from S3, decrypts locally via AES-256-GCM,
 * verifies integrity, and provides the recovered original file.
 */

import {
  decryptChunk,
  base64ToBuffer,
  computeSha256,
} from "../crypto/aes";
import {
  hashTransferCode,
  unwrapFileKey,
  WrappedKeyBundle,
} from "../crypto/keyWrap";
import { TransferLookupResponse, TransferMetadata } from "../transfer/types";

export interface DownloadProgress {
  percent: number;
  bytesDownloaded: number;
  totalBytes: number;
  currentChunk: number;
  totalChunks: number;
}

export type StatusCallback = (status: string) => void;
export type ProgressCallback = (progress: DownloadProgress) => void;

export interface DownloadResult {
  filename: string;
  fileSize: number;
  blobUrl: string;
  mimeType: string;
}

/**
 * Downloads a byte range of the ciphertext from S3.
 */
async function fetchChunkRange(
  url: string,
  start: number,
  end: number
): Promise<ArrayBuffer> {
  const response = await fetch(url, {
    headers: {
      Range: `bytes=${start}-${end}`,
    },
  });

  if (!response.ok && response.status !== 206) {
    // If Range is not supported or entire object returned
    if (response.status === 200 && start === 0) {
      return await response.arrayBuffer();
    }
    throw new Error(`Failed to download chunk: HTTP ${response.status}`);
  }

  return await response.arrayBuffer();
}

/**
 * Main receiver download orchestrator.
 */
export async function downloadAndDecryptFile(
  code: string,
  onProgress: ProgressCallback,
  onStatus: StatusCallback
): Promise<DownloadResult> {
  onStatus("Finding transfer...");

  const normalizedCode = code.trim().toUpperCase();
  const codeHash = await hashTransferCode(normalizedCode);

  // 1. Fetch metadata and presigned download URL
  const lookupRes = await fetch(`/api/transfers/${codeHash}`);
  if (!lookupRes.ok) {
    const errorData = await lookupRes.json();
    throw new Error(errorData.error || "Transfer not found or expired");
  }

  const { metadata, downloadUrl } = (await lookupRes.json()) as TransferLookupResponse;

  // 2. Unwrap AES file key in receiver browser
  onStatus("Decrypting file key...");
  const keyBundle: WrappedKeyBundle = {
    wrappedKey: metadata.wrappedKey,
    salt: metadata.keySalt,
    iv: metadata.keyIv,
  };

  let fileKey: CryptoKey;
  try {
    fileKey = await unwrapFileKey(keyBundle, normalizedCode);
  } catch (err) {
    throw new Error("Failed to unwrap encryption key: invalid code or corrupted key metadata");
  }

  const baseIv = base64ToBuffer(metadata.baseIv);
  const totalChunks = metadata.totalChunks;
  const originalPlaintextSize = metadata.fileSize;
  const chunkSize = metadata.chunkSize; // 8 MB

  // Total encrypted size = plaintext size + (16 bytes tag * totalChunks)
  const totalEncryptedBytes = originalPlaintextSize + totalChunks * 16;

  onStatus("Downloading encrypted data...");

  const decryptedChunks: ArrayBuffer[] = [];
  const chunkHashes: string[] = [];
  let downloadedCiphertextBytes = 0;

  // Calculate byte ranges for each encrypted chunk
  // For chunk i:
  // Plaintext size is chunkSize, except last chunk which is (fileSize - (totalChunks - 1) * chunkSize)
  // Encrypted chunk size is plaintextSize + 16 bytes tag
  let currentCiphertextOffset = 0;

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const isLastChunk = chunkIndex === totalChunks - 1;
    const plaintextSizeForChunk = isLastChunk
      ? originalPlaintextSize - chunkIndex * chunkSize
      : chunkSize;
    const ciphertextSizeForChunk = plaintextSizeForChunk + 16;

    const rangeStart = currentCiphertextOffset;
    const rangeEnd = currentCiphertextOffset + ciphertextSizeForChunk - 1;

    onStatus(`Downloading encrypted data (chunk ${chunkIndex + 1}/${totalChunks})...`);

    let encryptedChunkData: ArrayBuffer;
    try {
      encryptedChunkData = await fetchChunkRange(downloadUrl, rangeStart, rangeEnd);
    } catch (err: any) {
      throw new Error(`Download failed at chunk ${chunkIndex + 1}: ${err.message}`);
    }

    downloadedCiphertextBytes += encryptedChunkData.byteLength;
    onProgress({
      percent: Math.round((downloadedCiphertextBytes / totalEncryptedBytes) * 100),
      bytesDownloaded: downloadedCiphertextBytes,
      totalBytes: totalEncryptedBytes,
      currentChunk: chunkIndex + 1,
      totalChunks,
    });

    onStatus(`Decrypting locally (chunk ${chunkIndex + 1}/${totalChunks})...`);

    // Decrypt chunk with Web Crypto AES-256-GCM
    let decryptedChunk: ArrayBuffer;
    try {
      decryptedChunk = await decryptChunk(
        fileKey,
        encryptedChunkData,
        chunkIndex,
        baseIv
      );
    } catch (err) {
      throw new Error(
        `Integrity check failed on chunk ${chunkIndex + 1}! Ciphertext has been modified or corrupted.`
      );
    }

    decryptedChunks.push(decryptedChunk);

    // Track chunk hash for overall integrity check
    const chunkHash = await computeSha256(decryptedChunk);
    chunkHashes.push(chunkHash);

    currentCiphertextOffset += ciphertextSizeForChunk;
  }

  onStatus("Verifying integrity...");

  // Verify composite SHA-256 hash
  const encoder = new TextEncoder();
  const combinedHashes = encoder.encode(chunkHashes.join(":"));
  const calculatedSha256 = await computeSha256(combinedHashes.buffer as ArrayBuffer);

  if (
    metadata.fileSha256 &&
    metadata.fileSha256 !== "calculating" &&
    metadata.fileSha256 !== calculatedSha256
  ) {
    throw new Error("File integrity validation failed: computed SHA-256 mismatch");
  }

  onStatus("Integrity verified ✓");

  // Reassemble decrypted chunks into a Blob
  const blob = new Blob(decryptedChunks, { type: metadata.mimeType });
  const blobUrl = URL.createObjectURL(blob);

  onStatus("File recovered successfully ✓");

  return {
    filename: metadata.filename,
    fileSize: metadata.fileSize,
    blobUrl,
    mimeType: metadata.mimeType,
  };
}
