"use client";

import React, { useState, useEffect } from "react";
import { tripleDesEncryptCbc } from "../des";
import { ShieldCheck, AlertTriangle, Cpu, Key, Lock, CheckCircle2, XCircle } from "lucide-react";

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

    // AES-GCM ciphertext output contains ciphertext + 16-byte auth tag at the end
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
    const desKey = window.crypto.getRandomValues(new Uint8Array(24)); // 3 x 8 = 24 bytes
    const desIv = window.crypto.getRandomValues(new Uint8Array(8));   // 64-bit IV
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
      {/* Overview & What is Happening */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-2">
          <Key className="w-4 h-4" /> What is Happening
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          This demonstration compares modern <strong>AES-256-GCM</strong> (used in SecureDrop) against legacy <strong>Triple-DES (3DES)</strong>. 
          Both algorithms encrypt the same plaintext in your browser, demonstrating differences in key length, block size, authenticated data (AEAD), and performance.
        </p>
      </div>

      {/* Input control */}
      <div className="space-y-2">
        <label className="block text-xs font-mono text-slate-400">
          Enter Plaintext Input to Encrypt:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm font-mono focus:outline-none focus:border-cyan-500"
            placeholder="Type sample message..."
          />
          <button
            onClick={runComparison}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs whitespace-nowrap transition"
          >
            Re-Encrypt Both
          </button>
        </div>
      </div>

      {/* Side-by-side Comparative Live Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* AES-256-GCM Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-cyan-950/30 to-slate-900/60 border border-cyan-500/40 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-500/20 border-b border-l border-cyan-500/30 rounded-bl-lg text-[10px] font-mono text-cyan-300">
            SECUREDROP STANDARD
          </div>

          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-base">AES-256-GCM</h4>
              <p className="text-xs text-cyan-400 font-mono">Galois/Counter Mode (AEAD)</p>
            </div>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
              <div className="text-slate-400 text-[10px] uppercase">Key Size & Strength</div>
              <div className="text-cyan-300 font-bold">256 bits (2^256 keyspace) — Quantum Resistant</div>
            </div>

            <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
              <div className="text-slate-400 text-[10px] uppercase">Block Size & Mode</div>
              <div className="text-slate-200">128-bit blocks • Stream-like Counter Mode</div>
            </div>

            <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
              <div className="text-slate-400 text-[10px] uppercase">Cryptographic Integrity (Auth Tag)</div>
              <div className="text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>128-bit GHASH Tag (Built-in AEAD)</span>
              </div>
              <div className="text-[10px] text-slate-400 break-all mt-1 bg-slate-900 p-1 rounded">
                Tag: {aesResult ? aesResult.tagHex : "calculating..."}
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
              <div className="text-slate-400 text-[10px] uppercase">Live Ciphertext Sample</div>
              <div className="text-[10px] text-slate-300 break-all font-mono mt-0.5 max-h-16 overflow-y-auto">
                {aesResult ? aesResult.ciphertextHex : "..."}
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] pt-1 text-slate-400">
              <span>Hardware Acceleration: <strong className="text-slate-200">AES-NI (Native)</strong></span>
              <span className="text-cyan-400 font-bold">{aesResult?.timeMs} ms</span>
            </div>
          </div>
        </div>

        {/* 3DES Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-950/20 to-slate-900/60 border border-amber-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500/20 border-b border-l border-amber-500/30 rounded-bl-lg text-[10px] font-mono text-amber-300">
            NIST DEPRECATED
          </div>

          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-base">Triple-DES (3DES)</h4>
              <p className="text-xs text-amber-400 font-mono">DES-EDE3 in CBC Mode</p>
            </div>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
              <div className="text-slate-400 text-[10px] uppercase">Key Size & Strength</div>
              <div className="text-amber-300 font-bold">168 bits nominal (112 bits effective due to Meet-in-the-Middle)</div>
            </div>

            <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
              <div className="text-slate-400 text-[10px] uppercase">Block Size & Sweet32 Risk</div>
              <div className="text-rose-400 font-semibold">64-bit blocks — Vulnerable to Sweet32 collision on &gt;32 GB</div>
            </div>

            <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
              <div className="text-slate-400 text-[10px] uppercase">Cryptographic Integrity</div>
              <div className="text-rose-400 flex items-center gap-1 mt-0.5">
                <XCircle className="w-3.5 h-3.5" />
                <span>NONE (Unauthenticated — vulnerable to bit-flipping)</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Requires separate HMAC-SHA to verify integrity</div>
            </div>

            <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80">
              <div className="text-slate-400 text-[10px] uppercase">Live Ciphertext Sample ({desResult?.blockCount} blocks)</div>
              <div className="text-[10px] text-slate-300 break-all font-mono mt-0.5 max-h-16 overflow-y-auto">
                {desResult ? desResult.ciphertextHex : "..."}
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] pt-1 text-slate-400">
              <span>Hardware Acceleration: <strong className="text-slate-200">None (Software bit-shifts)</strong></span>
              <span className="text-amber-400 font-bold">{desResult?.timeMs} ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Specifications Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-xs text-left text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Metric</th>
              <th className="px-4 py-3 text-cyan-400">AES-256-GCM (SecureDrop)</th>
              <th className="px-4 py-3 text-amber-400">Triple-DES (3DES)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            <tr className="hover:bg-slate-900/40">
              <td className="px-4 py-2.5 font-sans font-medium text-slate-200">Security Strength</td>
              <td className="px-4 py-2.5 text-emerald-400">256-bit security</td>
              <td className="px-4 py-2.5 text-rose-400">112-bit effective (Meet-in-the-Middle)</td>
            </tr>
            <tr className="hover:bg-slate-900/40">
              <td className="px-4 py-2.5 font-sans font-medium text-slate-200">Block Size</td>
              <td className="px-4 py-2.5 text-slate-200">128 bits</td>
              <td className="px-4 py-2.5 text-amber-300">64 bits (Sweet32 attack vulnerability)</td>
            </tr>
            <tr className="hover:bg-slate-900/40">
              <td className="px-4 py-2.5 font-sans font-medium text-slate-200">Authenticated Encryption (AEAD)</td>
              <td className="px-4 py-2.5 text-emerald-400">Yes (GHASH 128-bit authentication tag)</td>
              <td className="px-4 py-2.5 text-rose-400">No (Requires separate MAC construction)</td>
            </tr>
            <tr className="hover:bg-slate-900/40">
              <td className="px-4 py-2.5 font-sans font-medium text-slate-200">Throughput & Performance</td>
              <td className="px-4 py-2.5 text-cyan-300">~1.2 GB/sec (CPU AES-NI hardware instructions)</td>
              <td className="px-4 py-2.5 text-slate-400">~40-80 MB/sec (Heavy 48-stage Feistel loops)</td>
            </tr>
            <tr className="hover:bg-slate-900/40">
              <td className="px-4 py-2.5 font-sans font-medium text-slate-200">NIST Regulatory Status</td>
              <td className="px-4 py-2.5 text-emerald-400">Active FIPS 197 Standard</td>
              <td className="px-4 py-2.5 text-rose-400">NIST SP 800-131A Disallowed after Dec 31, 2023</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Why It Matters */}
      <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
          Why It Matters in SecureDrop
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          SecureDrop is engineered to handle <strong>up to 2 GB file transfers</strong> directly in the browser. 
          Using 3DES would be catastrophic: the 64-bit block size suffers birthday bound collision risks (Sweet32), encryption throughput is 15x slower, and the lack of built-in authentication allows network adversaries to flip ciphertext bits undetected. 
          AES-256-GCM delivers hardware-accelerated gigabit throughput with unconditional cryptographic tamper detection.
        </p>
      </div>
    </div>
  );
}
