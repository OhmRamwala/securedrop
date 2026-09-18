"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, GitCompare, ArrowRight, ShieldCheck, Binary } from "lucide-react";

function bytesToBinaryString(bytes: Uint8Array): string {
  let str = "";
  for (let i = 0; i < bytes.length; i++) {
    str += bytes[i].toString(2).padStart(8, "0");
  }
  return str;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ");
}

export function AvalancheDemo() {
  const [plaintextA, setPlaintextA] = useState("The quick brown fox jumps over the lazy dog");
  const [plaintextB, setPlaintextB] = useState("The quick brown fox jumps over the lazy fog"); // 1 bit flip: 'd' (01100100) vs 'f' (01100110)

  const [ciphertextA, setCiphertextA] = useState<Uint8Array | null>(null);
  const [ciphertextB, setCiphertextB] = useState<Uint8Array | null>(null);
  const [bitStats, setBitStats] = useState<{
    totalBits: number;
    flippedBits: number;
    percentage: number;
    inputBitDiff: number;
  } | null>(null);

  const runAvalancheTest = async () => {
    const encoder = new TextEncoder();
    const bytesA = encoder.encode(plaintextA);
    const bytesB = encoder.encode(plaintextB);

    // Calculate input bit difference
    const maxLen = Math.max(bytesA.length, bytesB.length);
    let inputBitsFlipped = 0;
    for (let i = 0; i < maxLen; i++) {
      const bA = bytesA[i] || 0;
      const bB = bytesB[i] || 0;
      let xor = bA ^ bB;
      while (xor > 0) {
        inputBitsFlipped += xor & 1;
        xor >>= 1;
      }
    }

    // Use a fixed key and IV for deterministic side-by-side comparison
    const rawKey = new Uint8Array(32);
    rawKey.set([
      0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef,
      0xfe, 0xdc, 0xba, 0x98, 0x76, 0x54, 0x32, 0x10,
      0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77,
      0x88, 0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff,
    ]);
    const iv = new Uint8Array(12).fill(0x5a);

    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      rawKey,
      { name: "AES-GCM" },
      false,
      ["encrypt"]
    );

    const encA = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv, tagLength: 128 },
      cryptoKey,
      bytesA
    );
    const encB = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv, tagLength: 128 },
      cryptoKey,
      bytesB
    );

    const outA = new Uint8Array(encA);
    const outB = new Uint8Array(encB);

    setCiphertextA(outA);
    setCiphertextB(outB);

    // Compute bit differences in ciphertext
    const compareLen = Math.min(outA.length, outB.length);
    let outputBitsFlipped = 0;
    const totalBits = compareLen * 8;

    for (let i = 0; i < compareLen; i++) {
      let xor = outA[i] ^ outB[i];
      while (xor > 0) {
        outputBitsFlipped += xor & 1;
        xor >>= 1;
      }
    }

    const pct = Math.round((outputBitsFlipped / totalBits) * 10000) / 100;
    setBitStats({
      totalBits,
      flippedBits: outputBitsFlipped,
      percentage: pct,
      inputBitDiff: inputBitsFlipped,
    });
  };

  useEffect(() => {
    runAvalancheTest();
  }, [plaintextA, plaintextB]);

  const applyPreset = (textA: string, textB: string) => {
    setPlaintextA(textA);
    setPlaintextB(textB);
  };

  return (
    <div className="space-y-6">
      {/* What is Happening */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> What is Happening (Strict Avalanche Criterion)
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          The <strong>Avalanche Effect</strong> is a vital property of cryptographic algorithms where a tiny alteration in the plaintext 
          (even a <strong>single bit flip</strong>) causes a massive, pseudo-random cascading change throughout the resulting ciphertext. 
          In a cryptographically sound block cipher like AES, each output bit should flip with <strong>~50% probability</strong>.
        </p>
      </div>

      {/* Preset Quick Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-mono">Quick Presets:</span>
        <button
          onClick={() => applyPreset("The quick brown fox jumps over the lazy dog", "The quick brown fox jumps over the lazy fog")}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono border border-slate-700"
        >
          1-Bit ASCII Flip ('dog' ➔ 'fog')
        </button>
        <button
          onClick={() => applyPreset("SecureDrop 2GB Transfer Protocol", "SecureDrop 2GB Transfer Protocol.")}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono border border-slate-700"
        >
          Add Single Period ('.')
        </button>
        <button
          onClick={() => applyPreset("PASSWORD12345678", "password12345678")}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono border border-slate-700"
        >
          Uppercase ➔ Lowercase
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-mono text-cyan-400 font-semibold">
            Plaintext A:
          </label>
          <input
            type="text"
            value={plaintextA}
            onChange={(e) => setPlaintextA(e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-mono text-emerald-400 font-semibold">
            Plaintext B (Slightly modified):
          </label>
          <input
            type="text"
            value={plaintextB}
            onChange={(e) => setPlaintextB(e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Avalanche Metric Scorecard */}
      {bitStats && (
        <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-3">
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Input Bit Difference</div>
              <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
                {bitStats.inputBitDiff} bit{bitStats.inputBitDiff === 1 ? "" : "s"}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Ciphertext Bits Flipped</div>
              <div className="text-base font-bold text-cyan-400 font-mono mt-0.5">
                {bitStats.flippedBits} / {bitStats.totalBits}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Diffusion Percentage</div>
              <div className={`text-base font-bold font-mono mt-0.5 ${
                Math.abs(bitStats.percentage - 50) < 10 ? "text-emerald-400" : "text-cyan-400"
              }`}>
                {bitStats.percentage}%
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Theoretical SAC Ideal</div>
              <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                ~50.0%
              </div>
            </div>
          </div>

          {/* Progress bar visual */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>0% (No diffusion)</span>
              <span className="text-emerald-400 font-bold">50% Optimal Diffusion (AES-256)</span>
              <span>100% (Inversion)</span>
            </div>
            <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden relative border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${Math.min(100, bitStats.percentage)}%` }}
              />
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-emerald-300 shadow-sm" />
            </div>
          </div>
        </div>
      )}

      {/* Visual Hex Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-xs font-mono text-cyan-400 font-semibold mb-1 flex items-center justify-between">
            <span>Ciphertext A (Hex)</span>
            <span className="text-[10px] text-slate-400">{ciphertextA?.length} bytes</span>
          </div>
          <div className="font-mono text-[11px] text-slate-300 bg-slate-900/70 p-2.5 rounded border border-slate-800/80 break-all max-h-24 overflow-y-auto leading-relaxed">
            {ciphertextA ? bytesToHex(ciphertextA) : "..."}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-xs font-mono text-emerald-400 font-semibold mb-1 flex items-center justify-between">
            <span>Ciphertext B (Hex)</span>
            <span className="text-[10px] text-slate-400">{ciphertextB?.length} bytes</span>
          </div>
          <div className="font-mono text-[11px] text-slate-300 bg-slate-900/70 p-2.5 rounded border border-slate-800/80 break-all max-h-24 overflow-y-auto leading-relaxed">
            {ciphertextB ? bytesToHex(ciphertextB) : "..."}
          </div>
        </div>
      </div>

      {/* Why It Matters */}
      <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
          Why It Matters (Viva Talking Points)
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          The Avalanche Effect embodies Claude Shannon&apos;s cryptographic principle of <strong>Diffusion</strong>. 
          If an adversary observes two encrypted transfers or files with similar plaintexts, the ciphertexts are statistically uncorrelated. 
          Without the Avalanche Effect, an attacker could employ <em>differential cryptanalysis</em> to deduce plaintext fragments by observing patterns of changed bits. 
          In SecureDrop, AES-256-GCM ensures that even a 1-byte metadata update completely scrambles the output blocks across the entire 2 GB stream.
        </p>
      </div>
    </div>
  );
}
