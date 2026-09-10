import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, s3Bucket, isS3Configured } from "@/lib/s3/client";
import { getTransferMetadata } from "@/lib/transfer/storage";
import { TransferLookupResponse } from "@/lib/transfer/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ codeHash: string }> }
) {
  try {
    const { codeHash } = await params;

    if (!codeHash) {
      return NextResponse.json({ error: "Missing transfer code" }, { status: 400 });
    }

    const metadata = await getTransferMetadata(codeHash);

    if (!metadata) {
      return NextResponse.json(
        { error: "Transfer not found or has expired" },
        { status: 404 }
      );
    }

    if (Date.now() > metadata.expiresAt) {
      return NextResponse.json(
        { error: "This transfer has expired" },
        { status: 410 }
      );
    }

    if (metadata.status !== "READY") {
      return NextResponse.json(
        { error: "Transfer upload has not completed yet" },
        { status: 425 }
      );
    }

    let downloadUrl = `/api/transfers/mock-download?key=${encodeURIComponent(metadata.s3Key)}`;

    if (isS3Configured()) {
      const command = new GetObjectCommand({
        Bucket: s3Bucket,
        Key: metadata.s3Key,
        ResponseContentDisposition: `attachment; filename="ciphertext.bin"`,
      });

      // Presigned download URL valid for 1 hour
      downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    }

    // Return metadata without internal codeHash
    const { codeHash: _, ...publicMetadata } = metadata;

    const response: TransferLookupResponse = {
      metadata: publicMetadata,
      downloadUrl,
    };

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("Error retrieving transfer:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve transfer" },
      { status: 500 }
    );
  }
}
