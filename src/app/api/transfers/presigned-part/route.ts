import { NextRequest, NextResponse } from "next/server";
import { UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, s3Bucket, isS3Configured } from "@/lib/s3/client";
import { PresignedPartRequest, PresignedPartResponse } from "@/lib/transfer/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PresignedPartRequest;

    if (!body.s3Key || !body.uploadId || !body.partNumber) {
      return NextResponse.json(
        { error: "Missing parameters for presigned part" },
        { status: 400 }
      );
    }

    if (isS3Configured()) {
      const command = new UploadPartCommand({
        Bucket: s3Bucket,
        Key: body.s3Key,
        UploadId: body.uploadId,
        PartNumber: body.partNumber,
      });

      // Presigned URL valid for 1 hour
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      const response: PresignedPartResponse = {
        url,
        partNumber: body.partNumber,
      };
      return NextResponse.json(response);
    } else {
      // Local fallback mock upload endpoint for offline dev/testing
      const fallbackUrl = `/api/transfers/mock-part?key=${encodeURIComponent(body.s3Key)}&part=${body.partNumber}&uploadId=${encodeURIComponent(body.uploadId)}`;
      return NextResponse.json({
        url: fallbackUrl,
        partNumber: body.partNumber,
      });
    }
  } catch (err: any) {
    console.error("Error generating presigned part URL:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate presigned URL" },
      { status: 500 }
    );
  }
}
