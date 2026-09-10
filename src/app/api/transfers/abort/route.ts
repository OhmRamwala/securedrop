import { NextRequest, NextResponse } from "next/server";
import { AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import { s3Client, s3Bucket, isS3Configured } from "@/lib/s3/client";
import { updateTransferStatus } from "@/lib/transfer/storage";

export async function POST(req: NextRequest) {
  try {
    const { s3Key, uploadId, codeHash } = await req.json();

    if (isS3Configured() && s3Key && uploadId) {
      await s3Client.send(
        new AbortMultipartUploadCommand({
          Bucket: s3Bucket,
          Key: s3Key,
          UploadId: uploadId,
        })
      );
    }

    if (codeHash) {
      await updateTransferStatus(codeHash, "ABORTED");
    }

    return NextResponse.json({ success: true, status: "ABORTED" });
  } catch (err: any) {
    console.error("Error aborting multipart upload:", err);
    return NextResponse.json(
      { error: err.message || "Failed to abort transfer" },
      { status: 500 }
    );
  }
}
