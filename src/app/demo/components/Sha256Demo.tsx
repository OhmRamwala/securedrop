"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertOctagon } from "lucide-react";

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
    if (receivedData.includes("Authorized")) {
      setReceivedData(receivedData.replace("Authorized", "Authorlzed"));
    } else if (receivedData.endsWith("bytes")) {
      setReceivedData(receivedData.replace("bytes", "bytez"));
    } else {
      setReceivedData(receivedData + "!");
    }
  };

  const revertToOriginal = () => {
    setReceivedData(originalData);
  };

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={revertToOriginal}
          className={`px-3 py-1.5 rounded text-xs font-mono border transition-colors flex items-center gap-1.5 ${
            isMatching
              ? "bg-emerald-950/30 text-emerald-400 border-emerald-500/30"
              : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Match (Untampered)</span>
        </button>
        <button
          onClick={tamperOneByte}
          className="px-3 py-1.5 rounded bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 text-xs font-mono border border-rose-500/30 transition-colors flex items-center gap-1.5"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          <span>Simulate 1-Byte Tamper</span>
        </button>
      </div>

      {/* Interactive Data Editing Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original Data */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Original Payload (Sender)
          </label>
          <textarea
            value={originalData}
            onChange={(e) => setOriginalData(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500"
          />
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-500">SHA-256 Digest</div>
            <div className="font-mono text-xs text-slate-200 break-all mt-0.5">
              {originalHash || "..."}
            </div>
          </div>
        </div>

        {/* Received Data */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Received Payload (Recipient)
          </label>
          <textarea
            value={receivedData}
            onChange={(e) => setReceivedData(e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 rounded-lg bg-slate-950 border text-xs font-mono focus:outline-none ${
              isMatching
                ? "border-slate-700 text-slate-200 focus:border-blue-500"
                : "border-rose-500/50 text-rose-200 focus:border-rose-400"
            }`}
          />
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-500">Computed SHA-256 Digest</div>
            <div className={`font-mono text-xs break-all mt-0.5 ${
              isMatching ? "text-slate-200" : "text-rose-400 font-medium"
            }`}>
              {receivedHash || "..."}
            </div>
          </div>
        </div>
      </div>

      {/* Integrity Verdict Banner */}
      <div className={`p-4 rounded-lg border flex items-center gap-3 transition-colors ${
        isMatching
          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
          : "bg-rose-950/20 border-rose-500/40 text-rose-300"
      }`}>
        {isMatching ? (
          <>
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-medium text-xs font-mono text-emerald-300">
                ✓ Integrity Verified: Hashes match
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                The payload has not been modified or corrupted in transit.
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <div className="font-medium text-xs font-mono text-rose-300">
                ❌ Tamper Detected: Hash mismatch
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                The payload was modified in transit. The transfer must be rejected.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
