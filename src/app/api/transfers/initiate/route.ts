import { NextRequest, NextResponse } from "next/server";
import { CreateMultipartUploadCommand } from "@aws-sdk/client-s3";
import { s3Client, s3Bucket, isS3Configured } from "@/lib/s3/client";
import { saveTransferMetadata } from "@/lib/transfer/storage";
import { InitiateTransferRequest, InitiateTransferResponse, TransferMetadata } from "@/lib/transfer/types";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as InitiateTransferRequest;

    if (!body.codeHash || !body.filename || !body.fileSize || !body.wrappedKey) {
      return NextResponse.json(
        { error: "Missing required transfer parameters" },
        { status: 400 }
      );
    }

    // Maximum 500 MB file size validation
    const MAX_FILE_SIZE = 500 * 1024 * 1024;
    if (body.fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 500 MB limit" },
        { status: 400 }
      );
    }

    const transferId = randomUUID();
    const s3Key = `transfers/${body.codeHash}/ciphertext.bin`;
    let uploadId = `local-upload-${transferId}`;

    if (isS3Configured()) {
      const command = new CreateMultipartUploadCommand({
        Bucket: s3Bucket,
        Key: s3Key,
        ContentType: "application/octet-stream",
        ServerSideEncryption: "AES256", // Encrypted at rest on AWS S3
        Metadata: {
          "x-securedrop-transfer-id": transferId,
          "x-securedrop-filename": encodeURIComponent(body.filename),
        },
      });

      const s3Response = await s3Client.send(command);
      if (!s3Response.UploadId) {
        throw new Error("Failed to initiate S3 multipart upload");
      }
      uploadId = s3Response.UploadId;
    }

    const now = Date.now();
    const metadata: TransferMetadata = {
      transferId,
      codeHash: body.codeHash,
      s3Key,
      filename: body.filename,
      fileSize: body.fileSize,
      mimeType: body.mimeType || "application/octet-stream",
      chunkSize: body.chunkSize,
      totalChunks: body.totalChunks,
      baseIv: body.baseIv,
      wrappedKey: body.wrappedKey,
      keySalt: body.keySalt,
      keyIv: body.keyIv,
      fileSha256: body.fileSha256,
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours expiration
      status: "INITIATED",
    };

    await saveTransferMetadata(metadata);

    const response: InitiateTransferResponse = {
      transferId,
      uploadId,
      s3Key,
    };

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("Error initiating transfer:", err);
    return NextResponse.json(
      { error: err.message || "Failed to initiate transfer" },
      { status: 500 }
    );
  }
}
