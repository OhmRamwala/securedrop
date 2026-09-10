import assert from "node:assert";

async function testE2E() {
  console.log("🚀 Testing SecureDrop End-to-End HTTP & Transfer Flow...\n");

  const baseUrl = "http://localhost:3000";

  // 1. Test Homepage
  console.log("1. Testing GET / (Homepage)");
  const homeRes = await fetch(`${baseUrl}/`);
  assert.strictEqual(homeRes.status, 200, "Homepage must return 200 OK");
  const html = await homeRes.text();
  assert.ok(html.includes("Secure"), "Homepage must contain Secure");
  assert.ok(html.includes("Send a File"), "Homepage must contain 'Send a File'");
  assert.ok(html.includes("Receive a File"), "Homepage must contain 'Receive a File'");
  console.log("  ✓ Homepage loaded successfully with UI components");

  // 2. Test Initiate Transfer
  console.log("\n2. Testing POST /api/transfers/initiate");
  const testCodeHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  const initPayload = {
    codeHash: testCodeHash,
    filename: "test-document.pdf",
    fileSize: 1024 * 1024 * 10, // 10 MB
    mimeType: "application/pdf",
    chunkSize: 8 * 1024 * 1024,
    totalChunks: 2,
    baseIv: Buffer.from("12345678").toString("base64"),
    wrappedKey: Buffer.from("mockwrappedkey32byteslength1234567").toString("base64"),
    keySalt: Buffer.from("mockkeysalt16byte").toString("base64"),
    keyIv: Buffer.from("mockkeyiv12byt").toString("base64"),
    fileSha256: "aabbccddeeff00112233445566778899",
  };

  const initRes = await fetch(`${baseUrl}/api/transfers/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(initPayload),
  });
  assert.strictEqual(initRes.status, 200, "Initiate API must return 200 OK");
  const initData = await initRes.json();
  assert.ok(initData.transferId, "Response must include transferId");
  assert.ok(initData.uploadId, "Response must include uploadId");
  assert.ok(initData.s3Key, "Response must include s3Key");
  console.log(`  ✓ Transfer initiated: transferId=${initData.transferId}`);

  // 3. Test Presigned Part URL Generation
  console.log("\n3. Testing POST /api/transfers/presigned-part");
  const partReq = {
    transferId: initData.transferId,
    uploadId: initData.uploadId,
    s3Key: initData.s3Key,
    partNumber: 1,
  };
  const partRes = await fetch(`${baseUrl}/api/transfers/presigned-part`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partReq),
  });
  assert.strictEqual(partRes.status, 200);
  const partData = await partRes.json();
  assert.ok(partData.url, "Must return presigned part URL");
  console.log(`  ✓ Presigned URL received for part 1`);

  // 4. Test Chunk Direct Upload
  console.log("\n4. Testing Direct Chunk Upload (PUT)");
  const mockChunk1 = Buffer.alloc(1024, 0x41); // 1KB test chunk
  const uploadUrl = partData.url.startsWith("http")
    ? partData.url
    : `${baseUrl}${partData.url}`;
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    body: mockChunk1,
  });
  assert.strictEqual(uploadRes.status, 200);
  const etag = uploadRes.headers.get("ETag") || "mock-etag-1";
  console.log(`  ✓ Chunk uploaded directly to presigned URL with ETag: ${etag}`);

  // Upload part 2
  const part2Req = { ...partReq, partNumber: 2 };
  const part2Res = await fetch(`${baseUrl}/api/transfers/presigned-part`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(part2Req),
  });
  const part2Data = await part2Res.json();
  const mockChunk2 = Buffer.alloc(512, 0x42);
  const upload2Url = part2Data.url.startsWith("http")
    ? part2Data.url
    : `${baseUrl}${part2Data.url}`;
  const upload2Res = await fetch(upload2Url, {
    method: "PUT",
    body: mockChunk2,
  });
  assert.strictEqual(upload2Res.status, 200);
  const etag2 = upload2Res.headers.get("ETag") || "mock-etag-2";
  console.log(`  ✓ Chunk 2 uploaded directly with ETag: ${etag2}`);

  // 5. Test Complete Multipart Upload
  console.log("\n5. Testing POST /api/transfers/complete");
  const completeReq = {
    transferId: initData.transferId,
    uploadId: initData.uploadId,
    s3Key: initData.s3Key,
    parts: [
      { PartNumber: 1, ETag: etag },
      { PartNumber: 2, ETag: etag2 },
    ],
  };
  const compRes = await fetch(`${baseUrl}/api/transfers/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(completeReq),
  });
  assert.strictEqual(compRes.status, 200);
  const compData = await compRes.json();
  assert.strictEqual(compData.status, "READY");
  console.log("  ✓ Multipart upload marked READY");

  // 6. Test Receiver Lookup
  console.log("\n6. Testing GET /api/transfers/[codeHash]");
  const lookupRes = await fetch(`${baseUrl}/api/transfers/${testCodeHash}`);
  assert.strictEqual(lookupRes.status, 200);
  const lookupData = await lookupRes.json();
  assert.strictEqual(lookupData.metadata.filename, "test-document.pdf");
  assert.strictEqual(lookupData.metadata.status, "READY");
  assert.ok(lookupData.downloadUrl, "Must provide download URL");
  console.log(`  ✓ Transfer metadata and download URL retrieved: ${lookupData.metadata.filename} (${lookupData.metadata.fileSize} bytes)`);

  // 7. Test Receiver Download
  console.log("\n7. Testing Receiver Ciphertext Download");
  const downloadUrl = lookupData.downloadUrl.startsWith("http")
    ? lookupData.downloadUrl
    : `${baseUrl}${lookupData.downloadUrl}`;
  const downRes = await fetch(downloadUrl);
  assert.strictEqual(downRes.status, 200);
  const downloadedBytes = await downRes.arrayBuffer();
  assert.strictEqual(
    downloadedBytes.byteLength,
    mockChunk1.length + mockChunk2.length,
    "Downloaded bytes must match uploaded total"
  );
  console.log(`  ✓ Downloaded ciphertext bytes verified: ${downloadedBytes.byteLength} bytes`);

  // 8. Test Non-existent Transfer
  console.log("\n8. Testing Non-existent Transfer Code (404)");
  const notFoundRes = await fetch(`${baseUrl}/api/transfers/0000000000000000000000000000000000000000000000000000000000000000`);
  assert.strictEqual(notFoundRes.status, 404);
  console.log("  ✓ Non-existent transfer correctly returns 404");

  // 9. Test 500 MB limit enforcement
  console.log("\n9. Testing >500 MB file rejection");
  const oversizedRes = await fetch(`${baseUrl}/api/transfers/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...initPayload,
      codeHash: "oversized-test",
      fileSize: 501 * 1024 * 1024,
    }),
  });
  assert.strictEqual(oversizedRes.status, 400);
  console.log("  ✓ >500 MB file correctly rejected with 400 Bad Request");

  console.log("\n🎉 ALL END-TO-END FLOW TESTS COMPLETED SUCCESSFULLY! 100% WORKING.");
}

testE2E().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
