import { NextRequest, NextResponse } from "next/server";
import { getAllMockParts } from "@/lib/s3/mockStore";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const ciphertext = getAllMockParts(key);

  if (!ciphertext || ciphertext.length === 0) {
    return NextResponse.json({ error: "Ciphertext not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(ciphertext), {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": ciphertext.length.toString(),
      "Accept-Ranges": "bytes",
    },
  });
}
