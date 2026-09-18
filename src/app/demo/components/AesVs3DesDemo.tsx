"use client";

import React, { useState, useEffect } from "react";
import { tripleDesEncryptCbc } from "../des";
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function AesVs3DesDemo() {
  const [plaintext, setPlaintext] = useState("Confidential SecureDrop Payload - 2GB Enterprise Transfer");
  const [aesResult, setAesResult] = useState<{
    keyHex: string;
    ivHex: string;
    ciphertextHex: string;
    tagHex: string;
    timeMs: number;
  } | null>(null);
  const [desResult, setDesResult] = useState<{
    keyHex: string;
    ivHex: string;
    ciphertextHex: string;
    blockCount: number;
    timeMs: number;
  } | null>(null);

  const runComparison = async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // 1. Run AES-256-GCM (Web Crypto API)
    const t0 = performance.now();
    const aesKey = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt"]
    );
    const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encryptedBuf = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv, tagLength: 128 },
      aesKey,
      data
    );
    const t1 = performance.now();
    const encryptedBytes = new Uint8Array(encryptedBuf);
    const ciphertext = encryptedBytes.slice(0, encryptedBytes.length - 16);
    const authTag = encryptedBytes.slice(encryptedBytes.length - 16);

    setAesResult({
      keyHex: bufferToHex(rawAesKey),
      ivHex: bufferToHex(iv),
      ciphertextHex: bufferToHex(ciphertext),
      tagHex: bufferToHex(authTag),
      timeMs: Math.max(0.05, Math.round((t1 - t0) * 100) / 100),
    });

    // 2. Run 3DES (Triple DES EDE3 in CBC mode)
    const t2 = performance.now();
    const desKey = window.crypto.getRandomValues(new Uint8Array(24));
    const desIv = window.crypto.getRandomValues(new Uint8Array(8));
    const desCiphertext = tripleDesEncryptCbc(data, desKey, desIv);
    const t3 = performance.now();

    setDesResult({
      keyHex: bufferToHex(desKey),
      ivHex: bufferToHex(desIv),
      ciphertextHex: bufferToHex(desCiphertext),
      blockCount: desCiphertext.length / 8,
      timeMs: Math.max(0.1, Math.round((t3 - t2) * 100) / 100),
    });
  };

  useEffect(() => {
    runComparison();
  }, [plaintext]);

  return (
    <div className="space-y-6">
      {/* Input control */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-300">
          Plaintext Input
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-blue-500"
            placeholder="Type sample message..."
          />
          <button
            onClick={runComparison}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs whitespace-nowrap transition-colors"
          >
            Re-Encrypt Both
          </button>
        </div>
      </div>

      {/* Side-by-side Comparative Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AES-256-GCM Card */}
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="font-semibold text-slate-100 text-sm">AES-256-GCM</h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Modern Standard
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between items-center text-slate-400">
              <span>Key Size:</span>
              <span className="text-slate-200 font-semibold">256 bits</span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span>Block Size:</span>
              <span className="text-slate-200 font-semibold">128 bits</span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span>Integrity Tag:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>128-bit GHASH</span>
              </span>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 uppercase mb-1">Ciphertext (Hex)</div>
              <div className="text-[11px] text-slate-300 break-all bg-slate-900/80 p-2 rounded border border-slate-800/80 max-h-16 overflow-y-auto">
                {aesResult ? aesResult.ciphertextHex : "..."}
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
              <span>Hardware Acceleration: Native</span>
              <span className="text-slate-300">{aesResult?.timeMs} ms</span>
            </div>
          </div>
        </div>

        {/* 3DES Card */}
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h4 className="font-semibold text-slate-100 text-sm">Triple-DES (3DES)</h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Deprecated
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between items-center text-slate-400">
              <span>Key Size:</span>
              <span className="text-slate-200 font-semibold">112 bits (effective)</span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span>Block Size:</span>
              <span className="text-amber-400 font-semibold">64 bits</span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span>Integrity Tag:</span>
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                <span>None (Unauthenticated)</span>
              </span>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 uppercase mb-1">Ciphertext (Hex)</div>
              <div className="text-[11px] text-slate-300 break-all bg-slate-900/80 p-2 rounded border border-slate-800/80 max-h-16 overflow-y-auto">
                {desResult ? desResult.ciphertextHex : "..."}
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
              <span>Hardware Acceleration: None</span>
              <span className="text-slate-300">{desResult?.timeMs} ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Specifications Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-xs text-left text-slate-300 font-mono">
          <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
            <tr>
              <th className="px-3.5 py-2.5 font-medium">Metric</th>
              <th className="px-3.5 py-2.5 font-medium text-slate-200">AES-256-GCM</th>
              <th className="px-3.5 py-2.5 font-medium text-slate-400">Triple-DES (3DES)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            <tr>
              <td className="px-3.5 py-2 text-slate-400">Security Strength</td>
              <td className="px-3.5 py-2 text-emerald-400">256 bits</td>
              <td className="px-3.5 py-2 text-slate-400">112 bits</td>
            </tr>
            <tr>
              <td className="px-3.5 py-2 text-slate-400">Block Size</td>
              <td className="px-3.5 py-2 text-slate-200">128 bits</td>
              <td className="px-3.5 py-2 text-slate-400">64 bits</td>
            </tr>
            <tr>
              <td className="px-3.5 py-2 text-slate-400">Authentication (AEAD)</td>
              <td className="px-3.5 py-2 text-emerald-400">Yes (GHASH Tag)</td>
              <td className="px-3.5 py-2 text-rose-400">No</td>
            </tr>
            <tr>
              <td className="px-3.5 py-2 text-slate-400">Industry Status</td>
              <td className="px-3.5 py-2 text-emerald-400">Active Standard</td>
              <td className="px-3.5 py-2 text-amber-400">Deprecated</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
