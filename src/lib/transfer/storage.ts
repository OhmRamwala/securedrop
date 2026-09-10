import { s3Client, s3Bucket, isS3Configured } from "../s3/client";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { TransferMetadata } from "./types";

// Global in-memory cache for development/testing across Next.js route contexts
const memoryTransfers: Map<string, TransferMetadata> =
  (globalThis as any).__memoryTransfers ??
  ((globalThis as any).__memoryTransfers = new Map<string, TransferMetadata>());

export async function saveTransferMetadata(metadata: TransferMetadata): Promise<void> {
  // Always update in-memory cache
  memoryTransfers.set(metadata.codeHash, metadata);

  if (isS3Configured()) {
    try {
      const metaKey = `transfers/${metadata.codeHash}/meta.json`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: s3Bucket,
          Key: metaKey,
          Body: JSON.stringify(metadata),
          ContentType: "application/json",
          ServerSideEncryption: "AES256",
        })
      );
    } catch (err) {
      console.error("Failed to persist transfer metadata to S3:", err);
      // Fallback to memory store continues to work
    }
  }
}

export async function getTransferMetadata(codeHash: string): Promise<TransferMetadata | null> {
  // 1. Check S3 if configured
  if (isS3Configured()) {
    try {
      const metaKey = `transfers/${codeHash}/meta.json`;
      const response = await s3Client.send(
        new GetObjectCommand({
          Bucket: s3Bucket,
          Key: metaKey,
        })
      );

      if (response.Body) {
        const bodyString = await response.Body.transformToString();
        const data = JSON.parse(bodyString) as TransferMetadata;
        memoryTransfers.set(codeHash, data);
        return data;
      }
    } catch (err: any) {
      if (err.name !== "NoSuchKey") {
        console.error("Error retrieving metadata from S3:", err);
      }
    }
  }

  // 2. Check in-memory store
  const cached = memoryTransfers.get(codeHash);
  if (cached) {
    return cached;
  }

  return null;
}

export async function updateTransferStatus(
  codeHash: string,
  status: TransferMetadata["status"]
): Promise<void> {
  const meta = await getTransferMetadata(codeHash);
  if (meta) {
    meta.status = status;
    await saveTransferMetadata(meta);
  }
}
