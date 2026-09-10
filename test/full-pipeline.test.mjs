import assert from "node:assert";

// Polyfill browser globals in Node for client code testing
const crypto = globalThis.crypto;

const CHUNK_SIZE = 8 * 1024 * 1024;
const CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function generateTransferCode(length = 6) {
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[randomValues[i] % CODE_CHARS.length];
  }
  return code;
}

function deriveChunkIv(baseIv, chunkIndex) {
  const iv = new Uint8Array(12);
  iv.set(baseIv, 0);
  const view = new DataView(iv.buffer, iv.byteOffset, iv.byteLength);
  view.setUint32(8, chunkIndex, false);
  return iv;
}

async function computeSha256(data) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashTransferCode(code) {
  const normalized = code.trim().toUpperCase();
  const encoder = new TextEncoder();
  return await computeSha256(encoder.encode(normalized).buffer);
}

function bufferToBase64(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveWrappingKey(code, salt) {
  const encoder = new TextEncoder();
  const normalized = code.trim().toUpperCase();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(normalized),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function wrapFileKey(fileKey, code) {
  const rawFileKey = await crypto.subtle.exportKey("raw", fileKey);
  const salt = new Uint8Array(16);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(salt);
  crypto.getRandomValues(iv);

  const wrappingKey = await deriveWrappingKey(code, salt);
  const wrappedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    wrappingKey,
    rawFileKey
  );

  return {
    wrappedKey: bufferToBase64(wrappedBuffer),
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
  };
}

async function unwrapFileKey(bundle, code) {
  const salt = base64ToBuffer(bundle.salt);
  const iv = base64ToBuffer(bundle.iv);
  const wrappedKeyBytes = base64ToBuffer(bundle.wrappedKey);

  const wrappingKey = await deriveWrappingKey(code, salt);
  const rawFileKey = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    wrappingKey,
    wrappedKeyBytes
  );

  return await crypto.subtle.importKey(
    "raw",
    rawFileKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function testFullTransferPipeline() {
  console.log("🔐 Testing Full SecureDrop End-to-End Encryption Transfer Pipeline...\n");

  const baseUrl = "http://localhost:3000";

  // Simulate a 16.5 MB file (spanning 3 chunks)
  const fileSize = 16.5 * 1024 * 1024;
  const originalData = Buffer.alloc(fileSize);
  for (let i = 0; i < 1000; i++) {
    originalData.write(`SecureDrop block sample chunk payload index ${i}\n`, (i * 100) % (fileSize - 100));
  }

  console.log(`Step 1 (Sender): File created: 16.5 MB (${fileSize} bytes)`);

  // Sender generates AES key & transfer code
  const fileKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const baseIv = new Uint8Array(8);
  crypto.getRandomValues(baseIv);

  const code = generateTransferCode();
  const codeHash = await hashTransferCode(code);
  const wrappedBundle = await wrapFileKey(fileKey, code);

  console.log(`Step 2 (Sender): Generated transfer code: ${code}`);
  console.log(`Step 3 (Sender): AES key wrapped via PBKDF2 (100,000 rounds)`);

  const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
  assert.strictEqual(totalChunks, 3, "16.5 MB must split into 3 chunks");

  // Step 4: Initiate
  const initRes = await fetch(`${baseUrl}/api/transfers/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      codeHash,
      filename: "secure-archive.zip",
      fileSize,
      mimeType: "application/zip",
      chunkSize: CHUNK_SIZE,
      totalChunks,
      baseIv: bufferToBase64(baseIv),
      wrappedKey: wrappedBundle.wrappedKey,
      keySalt: wrappedBundle.salt,
      keyIv: wrappedBundle.iv,
      fileSha256: "test",
    }),
  });
  const { transferId, uploadId, s3Key } = await initRes.json();
  console.log(`Step 4 (Sender): Transfer initialized on server (transferId: ${transferId})`);

  // Step 5: Encrypt & Upload each chunk
  const parts = [];
  const chunkHashes = [];

  for (let c = 0; c < totalChunks; c++) {
    const start = c * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, fileSize);
    const chunkPlaintext = originalData.subarray(start, end);
    const chunkBuffer = chunkPlaintext.buffer.slice(
      chunkPlaintext.byteOffset,
      chunkPlaintext.byteOffset + chunkPlaintext.byteLength
    );

    const chunkHash = await computeSha256(chunkBuffer);
    chunkHashes.push(chunkHash);

    // AES-256-GCM Encrypt
    const iv = deriveChunkIv(baseIv, c);
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv, tagLength: 128 },
      fileKey,
      chunkBuffer
    );

    // Presigned Part URL
    const partRes = await fetch(`${baseUrl}/api/transfers/presigned-part`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transferId,
        partNumber: c + 1,
        uploadId,
        s3Key,
      }),
    });
    const { url } = await partRes.json();

    // Upload directly to S3 URL
    const uploadUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
    const upRes = await fetch(uploadUrl, {
      method: "PUT",
      body: encrypted,
    });
    const etag = upRes.headers.get("ETag") || `"mock-etag-${c + 1}"`;

    parts.push({ PartNumber: c + 1, ETag: etag });
    console.log(`  ✓ Chunk ${c + 1}/${totalChunks} encrypted & uploaded (${encrypted.byteLength} ciphertext bytes)`);
  }

  // Complete
  await fetch(`${baseUrl}/api/transfers/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transferId,
      uploadId,
      s3Key,
      parts,
    }),
  });
  console.log(`Step 5 (Sender): S3 multipart upload completed. Status: READY`);

  // ----------------------------------------------------
  // RECEIVER BROWSER FLOW
  // ----------------------------------------------------
  console.log("\nStep 6 (Receiver): Receiver enters transfer code:", code);

  const receiverCodeHash = await hashTransferCode(code);
  const lookupRes = await fetch(`${baseUrl}/api/transfers/${receiverCodeHash}`);
  assert.strictEqual(lookupRes.status, 200, "Lookup must succeed");
  const { metadata, downloadUrl } = await lookupRes.json();
  console.log(`  ✓ Metadata fetched: ${metadata.filename}, size: ${metadata.fileSize}`);

  // Receiver unwraps key
  const receiverFileKey = await unwrapFileKey(
    {
      wrappedKey: metadata.wrappedKey,
      salt: metadata.keySalt,
      iv: metadata.keyIv,
    },
    code
  );
  console.log(`Step 7 (Receiver): AES file key successfully unwrapped locally`);

  // Receiver downloads ciphertext
  const dUrl = downloadUrl.startsWith("http") ? downloadUrl : `${baseUrl}${downloadUrl}`;
  const dRes = await fetch(dUrl);
  const ciphertextBuffer = await dRes.arrayBuffer();
  console.log(`Step 8 (Receiver): Ciphertext downloaded: ${ciphertextBuffer.byteLength} bytes`);

  // Receiver decrypts chunks
  const receiverBaseIv = base64ToBuffer(metadata.baseIv);
  const decryptedChunks = [];
  let offset = 0;

  for (let c = 0; c < metadata.totalChunks; c++) {
    const isLast = c === metadata.totalChunks - 1;
    const plainChunkSize = isLast ? metadata.fileSize - c * metadata.chunkSize : metadata.chunkSize;
    const cipherChunkSize = plainChunkSize + 16;

    const slice = ciphertextBuffer.slice(offset, offset + cipherChunkSize);
    const iv = deriveChunkIv(receiverBaseIv, c);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv, tagLength: 128 },
      receiverFileKey,
      slice
    );

    decryptedChunks.push(Buffer.from(decrypted));
    offset += cipherChunkSize;
    console.log(`  ✓ Chunk ${c + 1}/${metadata.totalChunks} decrypted and authenticated`);
  }

  const recoveredData = Buffer.concat(decryptedChunks);
  assert.strictEqual(
    recoveredData.length,
    originalData.length,
    "Recovered file length must match original file exactly"
  );
  assert.ok(
    originalData.equals(recoveredData),
    "Decrypted data must match original file byte-for-byte"
  );

  console.log(`Step 9 (Receiver): Recovered file matches original 16.5 MB file byte-for-byte!`);
  console.log("\n🎉 FULL MULTI-CHUNK END-TO-END PIPELINE 100% VERIFIED.");
}

testFullTransferPipeline().catch((err) => {
  console.error("Full pipeline test failed:", err);
  process.exit(1);
});
