import { NextRequest, NextResponse } from "next/server";
import { saveMockPart } from "@/lib/s3/mockStore";

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  const part = url.searchParams.get("part");

  if (!key || !part) {
    return NextResponse.json({ error: "Missing key or part" }, { status: 400 });
  }

  const arrayBuffer = await req.arrayBuffer();
  saveMockPart(key, parseInt(part, 10), Buffer.from(arrayBuffer));

  // S3 returns ETag in header
  const mockETag = `"mock-etag-${part}-${Date.now()}"`;
  return new NextResponse(null, {
    status: 200,
    headers: {
      ETag: mockETag,
      "Access-Control-Expose-Headers": "ETag",
    },
  });
}
