"use client";

import React, { useState, useEffect } from "react";

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ");
}

export function AvalancheDemo() {
  const [plaintextA, setPlaintextA] = useState("The quick brown fox jumps over the lazy dog");
  const [plaintextB, setPlaintextB] = useState("The quick brown fox jumps over the lazy fog");

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
      {/* Preset Quick Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Presets:</span>
        <button
          onClick={() => applyPreset("The quick brown fox jumps over the lazy dog", "The quick brown fox jumps over the lazy fog")}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
        >
          1-Bit Flip (&apos;d&apos; → &apos;f&apos;)
        </button>
        <button
          onClick={() => applyPreset("SecureDrop 2GB Transfer Protocol", "SecureDrop 2GB Transfer Protocol.")}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
        >
          Add Period (&apos;.&apos;)
        </button>
        <button
          onClick={() => applyPreset("PASSWORD12345678", "password12345678")}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
        >
          Case Change
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Plaintext A
          </label>
          <input
            type="text"
            value={plaintextA}
            onChange={(e) => setPlaintextA(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono focus:outline-none focus:border-[#2563EB] shadow-xs"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Plaintext B (Modified)
          </label>
          <input
            type="text"
            value={plaintextB}
            onChange={(e) => setPlaintextB(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono focus:outline-none focus:border-[#2563EB] shadow-xs"
          />
        </div>
      </div>

      {/* Avalanche Metric Scorecard */}
      {bitStats && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-xs">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono">Input Bit Difference</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-200 font-mono mt-0.5">
                {bitStats.inputBitDiff} bit{bitStats.inputBitDiff === 1 ? "" : "s"}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-xs">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono">Output Bits Flipped</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-200 font-mono mt-0.5">
                {bitStats.flippedBits} / {bitStats.totalBits}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-xs">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono">Diffusion Rate</div>
              <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                {bitStats.percentage}%
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 shadow-xs">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono">Optimal Diffusion</div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                ~50%
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#2563EB] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, bitStats.percentage)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Visual Hex Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-mono text-slate-700 dark:text-slate-300 font-medium mb-1.5 flex justify-between">
            <span>Ciphertext A (Hex)</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">{ciphertextA?.length} bytes</span>
          </div>
          <div className="font-mono text-[11px] text-slate-800 dark:text-slate-300 bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/60 break-all max-h-24 overflow-y-auto">
            {ciphertextA ? bytesToHex(ciphertextA) : "..."}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-mono text-slate-700 dark:text-slate-300 font-medium mb-1.5 flex justify-between">
            <span>Ciphertext B (Hex)</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">{ciphertextB?.length} bytes</span>
          </div>
          <div className="font-mono text-[11px] text-slate-800 dark:text-slate-300 bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/60 break-all max-h-24 overflow-y-auto">
            {ciphertextB ? bytesToHex(ciphertextB) : "..."}
          </div>
        </div>
      </div>
    </div>
  );
}
