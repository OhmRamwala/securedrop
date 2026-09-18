"use client";

import React, { useState, useEffect } from "react";
import { Hash, CheckCircle2, AlertOctagon, RefreshCw, ShieldAlert, FileCheck, ArrowRight } from "lucide-react";

async function computeSha256Hex(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuf = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function Sha256Demo() {
  const [originalData, setOriginalData] = useState("Transfer Manifest: 2GB-ISO-Image.iso | Recipient: Authorized | Size: 2147483648 bytes");
  const [receivedData, setReceivedData] = useState("Transfer Manifest: 2GB-ISO-Image.iso | Recipient: Authorized | Size: 2147483648 bytes");

  const [originalHash, setOriginalHash] = useState("");
  const [receivedHash, setReceivedHash] = useState("");

  useEffect(() => {
    computeSha256Hex(originalData).then(setOriginalHash);
  }, [originalData]);

  useEffect(() => {
    computeSha256Hex(receivedData).then(setReceivedHash);
  }, [receivedData]);

  const isMatching = originalHash && receivedHash && originalHash === receivedHash;

  const tamperOneByte = () => {
    // Modify 1 byte in the received data
    if (receivedData.includes("Authorized")) {
      setReceivedData(receivedData.replace("Authorized", "Authorlzed")); // 'i' -> 'l'
    } else if (receivedData.endsWith("bytes")) {
      setReceivedData(receivedData.replace("bytes", "bytez"));
    } else {
      setReceivedData(receivedData + "!");
    }
  };

  const addSpace = () => {
    setReceivedData(receivedData + " ");
  };

  const revertToOriginal = () => {
    setReceivedData(originalData);
  };

  return (
    <div className="space-y-6">
      {/* Vital Distinction Callout */}
      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
            Critical Cryptographic Distinction: Hash Function vs Encryption
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>SHA-256 is NOT encryption.</strong> Encryption is a two-way function requiring a key to decrypt back to plaintext. 
            SHA-256 is a <strong>one-way deterministic cryptographic digest (hash function)</strong> designed exclusively for 
            <strong> integrity verification and tamper detection</strong>. Hashes cannot be reversed or decrypted.
          </p>
        </div>
      </div>

      {/* What is Happening */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-2">
          <Hash className="w-4 h-4" /> What is Happening
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          When a sender uploads a file, SHA-256 computes a fixed 256-bit (64 hex characters) digital fingerprint of the data. 
          When the recipient receives the file, the hash is recomputed. If even a <strong>single bit</strong> is modified in transit by an attacker or network error, 
          the resulting hash diverges completely, immediately alerting the recipient of tampering.
        </p>
      </div>

      {/* Quick Action Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-mono">Test Scenarios:</span>
        <button
          onClick={revertToOriginal}
          className={`px-3 py-1.5 rounded text-xs font-mono border transition flex items-center gap-1.5 ${
            isMatching
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Revert to Match (Untampered)
        </button>
        <button
          onClick={tamperOneByte}
          className="px-3 py-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-mono border border-rose-500/30 transition flex items-center gap-1.5"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          Simulate 1-Byte Network Tamper
        </button>
        <button
          onClick={addSpace}
          className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition"
        >
          Add 1 Whitespace Byte
        </button>
      </div>

      {/* Interactive Data Editing Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original Data */}
        <div className="space-y-2">
          <label className="block text-xs font-mono text-cyan-400 font-semibold flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5" />
            Original Sent Payload (Sender Side):
          </label>
          <textarea
            value={originalData}
            onChange={(e) => setOriginalData(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
          />
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-400">Original SHA-256 Digest:</div>
            <div className="font-mono text-xs text-cyan-300 break-all mt-0.5">
              {originalHash || "..."}
            </div>
          </div>
        </div>

        {/* Received Data */}
        <div className="space-y-2">
          <label className={`block text-xs font-mono font-semibold flex items-center gap-1.5 ${
            isMatching ? "text-emerald-400" : "text-rose-400"
          }`}>
            {isMatching ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertOctagon className="w-3.5 h-3.5" />}
            Received Payload (Receiver Buffer):
          </label>
          <textarea
            value={receivedData}
            onChange={(e) => setReceivedData(e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 rounded-lg bg-slate-950 border text-xs font-mono focus:outline-none ${
              isMatching
                ? "border-emerald-500/50 text-slate-200 focus:border-emerald-400"
                : "border-rose-500/70 text-rose-200 focus:border-rose-400 bg-rose-950/10"
            }`}
          />
          <div className={`p-2.5 rounded bg-slate-950 border ${
            isMatching ? "border-emerald-500/30" : "border-rose-500/40"
          }`}>
            <div className="text-[10px] uppercase font-mono text-slate-400">Computed Received SHA-256:</div>
            <div className={`font-mono text-xs break-all mt-0.5 ${
              isMatching ? "text-emerald-400" : "text-rose-400 font-semibold"
            }`}>
              {receivedHash || "..."}
            </div>
          </div>
        </div>
      </div>

      {/* Integrity Verdict Banner */}
      <div className={`p-4 rounded-xl border flex items-center gap-3 transition-all duration-300 ${
        isMatching
          ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
          : "bg-rose-950/40 border-rose-500/60 text-rose-300 shadow-lg shadow-rose-950/50"
      }`}>
        {isMatching ? (
          <>
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-sm font-mono text-emerald-300">
                ✓ INTEGRITY VERIFIED (NO TAMPERING)
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                The computed digest matches the sender&apos;s digest bit-for-bit. The payload has not been modified, intercepted, or corrupted in transit.
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0 animate-bounce" />
            <div>
              <div className="font-bold text-sm font-mono text-rose-300">
                ❌ TAMPER DETECTED: CRYPTOGRAPHIC HASH MISMATCH!
              </div>
              <p className="text-xs text-rose-200/90 mt-0.5">
                The payload has been altered in transit! Even though the change may be invisible to the naked eye (such as 1 byte or 1 space), the SHA-256 digest completely diverges. The transfer must be rejected!
              </p>
            </div>
          </>
        )}
      </div>

      {/* Why It Matters */}
      <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
          Why It Matters in SecureDrop Architecture
        </h4>
        <div className="text-xs text-slate-300 leading-relaxed space-y-1.5">
          <p>
            <strong>1. Zero-Knowledge Transfer Code Indexing:</strong> When a sender creates a 6-character transfer code (e.g. <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">JSTRFP</code>), 
            SecureDrop hashes it with SHA-256: <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">codeHash = SHA-256(code)</code>. 
            Only this one-way hash is stored on the server as an S3 lookup key. The backend <strong>never knows the plaintext code</strong> or the encryption key.
          </p>
          <p>
            <strong>2. Chunk Integrity in 2 GB Transfers:</strong> Large files are split into 8 MB chunks. SHA-256 checksums verify each multipart chunk against network packet loss or corrupted bit errors during direct S3 presigned upload.
          </p>
        </div>
      </div>
    </div>
  );
}
