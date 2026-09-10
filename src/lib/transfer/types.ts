/**
 * Transfer metadata and communication types.
 */

export interface TransferPart {
  PartNumber: number;
  ETag: string;
}

export interface TransferMetadata {
  transferId: string;
  codeHash: string;
  s3Key: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  chunkSize: number;
  totalChunks: number;
  baseIv: string; // Base64 encoded 8-byte base IV
  wrappedKey: string; // Base64 encoded wrapped key
  keySalt: string; // Base64 encoded PBKDF2 salt
  keyIv: string; // Base64 encoded key wrapping IV
  fileSha256: string; // Plaintext SHA-256 for integrity verification
  createdAt: number; // Timestamp
  expiresAt: number; // Expiration timestamp (e.g. 24 hours)
  status: "INITIATED" | "READY" | "EXPIRED" | "ABORTED";
}

export interface InitiateTransferRequest {
  codeHash: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  chunkSize: number;
  totalChunks: number;
  baseIv: string;
  wrappedKey: string;
  keySalt: string;
  keyIv: string;
  fileSha256: string;
}

export interface InitiateTransferResponse {
  transferId: string;
  uploadId: string;
  s3Key: string;
}

export interface PresignedPartRequest {
  transferId: string;
  partNumber: number;
  uploadId: string;
  s3Key: string;
}

export interface PresignedPartResponse {
  url: string;
  partNumber: number;
}

export interface CompleteTransferRequest {
  transferId: string;
  uploadId: string;
  s3Key: string;
  parts: TransferPart[];
}

export interface CompleteTransferResponse {
  success: boolean;
  status: string;
}

export interface TransferLookupResponse {
  metadata: Omit<TransferMetadata, "codeHash">;
  downloadUrl: string;
}
