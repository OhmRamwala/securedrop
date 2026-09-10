import { NextRequest, NextResponse } from "next/server";
import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { s3Client, s3Bucket, isS3Configured } from "@/lib/s3/client";
import { getTransferMetadata, saveTransferMetadata } from "@/lib/transfer/storage";
import { CompleteTransferRequest, CompleteTransferResponse } from "@/lib/transfer/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CompleteTransferRequest;

    if (!body.s3Key || !body.uploadId || !body.parts || !Array.isArray(body.parts)) {
      return NextResponse.json(
        { error: "Missing parameters to complete multipart upload" },
        { status: 400 }
      );
    }

    // Sort parts by PartNumber ascending (S3 requirement)
    const sortedParts = [...body.parts].sort((a, b) => a.PartNumber - b.PartNumber);

    if (isS3Configured()) {
      const command = new CompleteMultipartUploadCommand({
        Bucket: s3Bucket,
        Key: body.s3Key,
        UploadId: body.uploadId,
        MultipartUpload: {
          Parts: sortedParts.map((p) => ({
            PartNumber: p.PartNumber,
            ETag: p.ETag,
          })),
        },
      });

      await s3Client.send(command);
    }

    // Extract codeHash from s3Key (transfers/<codeHash>/ciphertext.bin)
    const codeHashMatch = body.s3Key.match(/transfers\/([a-f0-9]+)\//);
    if (codeHashMatch && codeHashMatch[1]) {
      const meta = await getTransferMetadata(codeHashMatch[1]);
      if (meta) {
        meta.status = "READY";
        await saveTransferMetadata(meta);
      }
    }

    const response: CompleteTransferResponse = {
      success: true,
      status: "READY",
    };

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("Error completing multipart upload:", err);
    return NextResponse.json(
      { error: err.message || "Failed to complete multipart upload" },
      { status: 500 }
    );
  }
}
