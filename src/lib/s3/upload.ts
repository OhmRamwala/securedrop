/**
 * SecureDrop Browser-to-S3 Multipart Upload Engine
 * Streams and encrypts files up to 500 MB in 8 MB chunks directly to S3.
 */

import {
  CHUNK_SIZE,
  generateFileKey,
  encryptChunk,
  bufferToBase64,
  computeSha256,
} from "../crypto/aes";
import {
  generateTransferCode,
  hashTransferCode,
  wrapFileKey,
} from "../crypto/keyWrap";
import {
  InitiateTransferRequest,
  InitiateTransferResponse,
  PresignedPartRequest,
  PresignedPartResponse,
  CompleteTransferRequest,
  TransferPart,
} from "../transfer/types";

export interface UploadProgress {
  percent: number;
  bytesUploaded: number;
  totalBytes: number;
  currentChunk: number;
  totalChunks: number;
}

export type StatusCallback = (status: string) => void;
export type ProgressCallback = (progress: UploadProgress) => void;

export interface UploadResult {
  code: string;
  transferId: string;
  fileSha256: string;
}

/**
 * Uploads a single encrypted chunk to S3 using XMLHttpRequest for accurate progress tracking,
 * with fetch fallback for Node.js test environments.
 */
function uploadChunkWithProgress(
  url: string,
  chunkData: ArrayBuffer,
  onChunkProgress: (loaded: number) => void
): Promise<string> {
  if (typeof XMLHttpRequest !== "undefined") {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onChunkProgress(event.loaded);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          let etag = xhr.getResponseHeader("ETag") || "";
          etag = etag.replace(/^"|"$/g, "");
          resolve(etag || `etag-${Date.now()}`);
        } else {
          reject(new Error(`S3 upload error: HTTP ${xhr.status} - ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during S3 chunk upload"));
      xhr.ontimeout = () => reject(new Error("Timeout during S3 chunk upload"));

      xhr.send(chunkData);
    });
  } else {
    // Node.js runtime fallback for automated testing
    return fetch(url, {
      method: "PUT",
      body: chunkData,
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`S3 upload error: HTTP ${res.status} - ${res.statusText}`);
      }
      onChunkProgress(chunkData.byteLength);
      let etag = res.headers.get("ETag") || "";
      etag = etag.replace(/^"|"$/g, "");
      return etag || `etag-${Date.now()}`;
    });
  }
}

/**
 * Main upload orchestrator for Sender browser.
 * Pipelined worker pool uploads chunks in parallel (default concurrency: 3)
 * while ensuring memory usage is bounded to at most CONCURRENCY * CHUNK_SIZE.
 */
export async function uploadFileSecurely(
  file: File,
  onProgress: ProgressCallback,
  onStatus: StatusCallback,
  concurrency: number = 3
): Promise<UploadResult> {
  onStatus("Preparing file...");

  const totalBytes = file.size;
  const totalChunks = Math.ceil(totalBytes / CHUNK_SIZE) || 1;
  const MAX_PART_RETRIES = 3;

  // 1. Generate cryptographic keys
  onStatus("Generating secure encryption key...");
  const fileKey = await generateFileKey();

  // 8-byte random base IV for chunk nonce derivation
  const baseIv = new Uint8Array(8);
  crypto.getRandomValues(baseIv);

  // 2. Generate transfer code (e.g. 8F42K9) & wrap AES key
  const code = generateTransferCode();
  const codeHash = await hashTransferCode(code);
  const wrappedKeyBundle = await wrapFileKey(fileKey, code);

  // 3. Initiate transfer with serverless backend
  onStatus("Initializing transfer...");
  const initiatePayload: InitiateTransferRequest = {
    codeHash,
    filename: file.name,
    fileSize: totalBytes,
    mimeType: file.type || "application/octet-stream",
    chunkSize: CHUNK_SIZE,
    totalChunks,
    baseIv: bufferToBase64(baseIv),
    wrappedKey: wrappedKeyBundle.wrappedKey,
    keySalt: wrappedKeyBundle.salt,
    keyIv: wrappedKeyBundle.iv,
    fileSha256: "calculating", // updated after chunk loop
  };

  const initRes = await fetch("/api/transfers/initiate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(initiatePayload),
  });

  if (!initRes.ok) {
    const errorData = await initRes.json();
    throw new Error(errorData.error || "Failed to initiate transfer");
  }

  const { transferId, uploadId, s3Key } = (await initRes.json()) as InitiateTransferResponse;

  // 4. Controlled Parallel Multipart Upload
  const uploadedParts: TransferPart[] = new Array(totalChunks);
  const chunkHashes: string[] = new Array(totalChunks);
  const chunkLoadedBytes: number[] = new Array(totalChunks).fill(0);
  const totalExpectedCipherBytes = totalBytes + totalChunks * 16; // 16-byte AES-GCM tag per chunk

  let completedChunks = 0;
  let nextChunkIndex = 0;
  let isAborted = false;
  let abortError: any = null;

  const reportProgress = () => {
    const currentTotal = chunkLoadedBytes.reduce((sum, b) => sum + b, 0);
    const percent = Math.min(
      Math.round((currentTotal / totalExpectedCipherBytes) * 100),
      99
    );
    onProgress({
      percent,
      bytesUploaded: currentTotal,
      totalBytes: totalExpectedCipherBytes,
      currentChunk: Math.min(completedChunks, totalChunks),
      totalChunks,
    });
  };

  async function worker() {
    while (true) {
      if (isAborted) break;

      const chunkIndex = nextChunkIndex++;
      if (chunkIndex >= totalChunks) break;

      const partNumber = chunkIndex + 1;
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, totalBytes);

      // On-demand streaming slice: only active workers hold chunks in memory
      const fileBlob = file.slice(start, end);
      const rawChunk = await fileBlob.arrayBuffer();

      // Compute plaintext chunk SHA-256
      const chunkHash = await computeSha256(rawChunk);
      chunkHashes[chunkIndex] = chunkHash;

      // Local browser encryption (AES-256-GCM)
      const encryptedChunk = await encryptChunk(fileKey, rawChunk, chunkIndex, baseIv);

      // Upload with per-part retry
      let partUploaded = false;
      let partError: any = null;

      for (let attempt = 1; attempt <= MAX_PART_RETRIES; attempt++) {
        if (isAborted) break;

        try {
          // Obtain presigned PUT URL for this part
          const presignedReq: PresignedPartRequest = {
            transferId,
            partNumber,
            uploadId,
            s3Key,
          };

          const presignedRes = await fetch("/api/transfers/presigned-part", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(presignedReq),
          });

          if (!presignedRes.ok) {
            const errData = await presignedRes.json().catch(() => ({}));
            throw new Error(errData.error || `Failed to obtain presigned URL for part ${partNumber}`);
          }

          const { url } = (await presignedRes.json()) as PresignedPartResponse;

          onStatus(`Uploading encrypted parts (${completedChunks + 1}/${totalChunks})...`);

          // Direct browser-to-S3 upload
          const etag = await uploadChunkWithProgress(url, encryptedChunk, (loaded) => {
            chunkLoadedBytes[chunkIndex] = loaded;
            reportProgress();
          });

          chunkLoadedBytes[chunkIndex] = encryptedChunk.byteLength;
          uploadedParts[chunkIndex] = {
            PartNumber: partNumber,
            ETag: etag,
          };

          completedChunks++;
          reportProgress();
          partUploaded = true;
          break;
        } catch (err: any) {
          partError = err;
          if (attempt < MAX_PART_RETRIES && !isAborted) {
            // Exponential backoff (300ms, 600ms)
            await new Promise((resolve) => setTimeout(resolve, attempt * 300));
          }
        }
      }

      if (!partUploaded && !isAborted) {
        isAborted = true;
        abortError = partError || new Error(`Upload failed for part ${partNumber}`);
        break;
      }
    }
  }

  try {
    const activeConcurrency = Math.max(1, Math.min(concurrency, totalChunks));
    const workers = Array.from({ length: activeConcurrency }, () => worker());
    await Promise.all(workers);

    if (isAborted || abortError) {
      throw abortError || new Error("Upload aborted due to part failure");
    }

    // Verify all parts were uploaded
    for (let i = 0; i < totalChunks; i++) {
      if (!uploadedParts[i]) {
        throw new Error(`Missing uploaded part ${i + 1}`);
      }
    }

    // Ascending order check (strict S3 requirement)
    const sortedParts = [...uploadedParts].sort((a, b) => a.PartNumber - b.PartNumber);

    onStatus("Encryption complete.");

    // Compute composite SHA-256 from chunk hashes
    const encoder = new TextEncoder();
    const combinedHashes = encoder.encode(chunkHashes.join(":"));
    const finalFileSha256 = await computeSha256(combinedHashes.buffer as ArrayBuffer);

    // 5. Complete multipart upload
    onStatus("Finalizing upload...");
    const completePayload: CompleteTransferRequest = {
      transferId,
      uploadId,
      s3Key,
      parts: sortedParts,
    };

    const completeRes = await fetch("/api/transfers/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(completePayload),
    });

    if (!completeRes.ok) {
      const errData = await completeRes.json();
      throw new Error(errData.error || "Failed to complete transfer upload");
    }

    onProgress({
      percent: 100,
      bytesUploaded: totalExpectedCipherBytes,
      totalBytes: totalExpectedCipherBytes,
      currentChunk: totalChunks,
      totalChunks,
    });

    onStatus("Transfer created.");

    return {
      code,
      transferId,
      fileSha256: finalFileSha256,
    };
  } catch (err) {
    // Attempt cleanup on failure
    fetch("/api/transfers/abort", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ s3Key, uploadId, codeHash }),
    }).catch(() => {});

    throw err;
  }
}
