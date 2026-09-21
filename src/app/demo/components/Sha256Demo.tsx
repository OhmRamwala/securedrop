"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertOctagon, RotateCcw, ShieldCheck, Zap } from "lucide-react";

async function computeSha256Hex(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuf = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function computeBitDiff(hexA: string, hexB: string): { diffBits: number; percentage: number } {
  if (!hexA || !hexB || hexA.length !== 64 || hexB.length !== 64) {
    return { diffBits: 0, percentage: 0 };
  }
  let diff = 0;
  for (let i = 0; i < 64; i += 2) {
    const byteA = parseInt(hexA.substring(i, i + 2), 16) || 0;
    const byteB = parseInt(hexB.substring(i, i + 2), 16) || 0;
    let xor = byteA ^ byteB;
    while (xor > 0) {
      diff += xor & 1;
      xor >>= 1;
    }
  }
  return { diffBits: diff, percentage: Math.round((diff / 256) * 1000) / 10 };
}

const PRESETS = [
  {
    name: "2 GB ISO Transfer",
    text: "Transfer Manifest: 2GB-Ubuntu-24.04-Server.iso | Recipient: Authorized | Size: 2147483648 bytes | Parts: 256",
  },
  {
    name: "Financial Wire Authorization",
    text: "WIRE_AUTH: Origin=Acct#98214 Target=Acct#10023 Amount=$25,000.00 Status=APPROVED Timestamp=2026-09-19",
  },
  {
    name: "PBKDF2 Key Envelope",
    text: "Envelope: AES-GCM-256 Key wrapped with PBKDF2 salt=9f2c7a10 iter=100000 keyId=sec-drop-4982",
  },
];

export function Sha256Demo() {
  const [originalData, setOriginalData] = useState(PRESETS[0].text);
  const [receivedData, setReceivedData] = useState(PRESETS[0].text);

  const [originalHash, setOriginalHash] = useState("");
  const [receivedHash, setReceivedHash] = useState("");

  useEffect(() => {
    computeSha256Hex(originalData).then(setOriginalHash);
  }, [originalData]);

  useEffect(() => {
    computeSha256Hex(receivedData).then(setReceivedHash);
  }, [receivedData]);

  const isMatching = originalHash && receivedHash && originalHash === receivedHash;
  const bitDiff = computeBitDiff(originalHash, receivedHash);

  const tamperOneByte = () => {
    if (receivedData.includes("Authorized")) {
      setReceivedData(receivedData.replace("Authorized", "Authorlzed"));
    } else if (receivedData.includes("APPROVED")) {
      setReceivedData(receivedData.replace("APPROVED", "APPROVEE"));
    } else if (receivedData.endsWith("256")) {
      setReceivedData(receivedData.slice(0, -1) + "7");
    } else {
      setReceivedData(receivedData + ".");
    }
  };

  const revertToOriginal = () => {
    setReceivedData(originalData);
  };

  const loadPreset = (presetText: string) => {
    setOriginalData(presetText);
    setReceivedData(presetText);
  };

  return (
    <div className="space-y-6">
      {/* Header & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
            Cryptographic Hash Function &amp; Integrity Verification
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Demonstrating collision-resistance, pre-image resistance, and strict avalanche integrity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-500 mr-1">Presets:</span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => loadPreset(p.text)}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 transition-colors shadow-xs"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={revertToOriginal}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all flex items-center gap-1.5 shadow-xs ${
              isMatching
                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Restore Untampered State</span>
          </button>

          <button
            onClick={tamperOneByte}
            className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-mono border border-rose-200 dark:border-rose-500/30 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Simulate 1-Byte Tamper</span>
          </button>
        </div>

        {!isMatching && (
          <div className="flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-lg bg-amber-50 dark:bg-slate-900 border border-amber-200 dark:border-slate-800">
            <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span className="text-slate-600 dark:text-slate-400">Avalanche Drift:</span>
            <span className="text-amber-700 dark:text-amber-300 font-semibold">{bitDiff.diffBits} / 256 bits ({bitDiff.percentage}%)</span>
          </div>
        )}
      </div>

      {/* Interactive Data Editing Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original Data */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Sender Original Payload
            </label>
            <span className="text-[10px] font-mono text-slate-500">{originalData.length} bytes</span>
          </div>
          <textarea
            value={originalData}
            onChange={(e) => setOriginalData(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs font-mono focus:outline-none focus:border-[#2563EB] transition-colors shadow-xs"
          />
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 tracking-wider">Original SHA-256 Digest (256 bits)</div>
            <div className="font-mono text-xs text-slate-900 dark:text-slate-200 break-all mt-1 select-all">
              {originalHash || "..."}
            </div>
          </div>
        </div>

        {/* Received Data */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Recipient Received Payload
            </label>
            <span className="text-[10px] font-mono text-slate-500">{receivedData.length} bytes</span>
          </div>
          <textarea
            value={receivedData}
            onChange={(e) => setReceivedData(e.target.value)}
            rows={3}
            className={`w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-950 border text-xs font-mono focus:outline-none transition-colors shadow-xs ${
              isMatching
                ? "border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 focus:border-[#2563EB]"
                : "border-rose-300 dark:border-rose-500/50 text-rose-800 dark:text-rose-200 focus:border-rose-500"
            }`}
          />
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 tracking-wider">Computed SHA-256 Digest (Recipient)</div>
            <div className={`font-mono text-xs break-all mt-1 select-all ${
              isMatching ? "text-slate-900 dark:text-slate-200" : "text-rose-600 dark:text-rose-400 font-semibold"
            }`}>
              {receivedHash || "..."}
            </div>
          </div>
        </div>
      </div>

      {/* Integrity Verdict Banner */}
      <div className={`p-4 rounded-xl border flex items-center gap-3 transition-colors ${
        isMatching
          ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
          : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-300"
      }`}>
        {isMatching ? (
          <>
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold text-xs font-mono text-emerald-800 dark:text-emerald-300">
                ✓ Cryptographic Integrity Verified: Hashes Match Perfectly
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                The computed digest strictly matches the original transmission manifest. Zero bit corruption or unauthorized modification detected.
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <div className="font-semibold text-xs font-mono text-rose-800 dark:text-rose-300">
                ❌ Tamper / Corruption Detected: Digest Mismatch
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Due to SHA-256&apos;s strict avalanche effect, modifying even a single bit alters approximately 50% ({bitDiff.diffBits} of 256 bits) of the output digest. The client rejects this transfer.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

