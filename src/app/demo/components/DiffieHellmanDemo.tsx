"use client";

import React, { useState } from "react";
import {
  Lock,
  Unlock,
  RotateCcw,
  Eye,
  EyeOff,
  Send,
  Radio,
  Skull,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

function modExp(base: number, exp: number, mod: number): number {
  let res = 1;
  base = base % mod;
  while (exp > 0) {
    if (exp % 2 === 1) res = (res * base) % mod;
    base = (base * base) % mod;
    exp = Math.floor(exp / 2);
  }
  return res;
}

export function DiffieHellmanDemo() {
  const [mode, setMode] = useState<"normal" | "mitm">("normal");

  const [normalStep, setNormalStep] = useState<number>(0);
  const [mitmStep, setMitmStep] = useState<number>(0);
  const [showPrivate, setShowPrivate] = useState<boolean>(false);

  const [aliceMessage] = useState<string>("HELLO BOB - SECRET PASSCODE 7792");
  const [malloryTamperText, setMalloryTamperText] = useState<string>("HELLO MALLORY - TRANSFER $50,000");

  const p = 23;
  const g = 5;

  const a = 6;
  const b = 15;
  const m = 7;

  const A = modExp(g, a, p); // 8
  const B = modExp(g, b, p); // 19
  const M = modExp(g, m, p); // 17

  const S_Normal = modExp(B, a, p);     // 2
  const S_Alice_Mitm = modExp(M, a, p); // 13
  const S_Bob_Mitm = modExp(M, b, p);   // 9

  const resetAll = () => {
    setNormalStep(0);
    setMitmStep(0);
  };

  const switchMode = (newMode: "normal" | "mitm") => {
    setMode(newMode);
    setNormalStep(0);
    setMitmStep(0);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Header & Mode Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-slate-950 border border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Diffie-Hellman Key Exchange &amp; MITM Simulation
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare legitimate key exchange against an unauthenticated man-in-the-middle attack.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
          <button
            onClick={() => switchMode("normal")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              mode === "normal"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Normal Exchange</span>
          </button>
          <button
            onClick={() => switchMode("mitm")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              mode === "mitm"
                ? "bg-rose-950/40 text-rose-300 border border-rose-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Skull className="w-3.5 h-3.5" />
            <span>MITM Attack</span>
          </button>
        </div>
      </div>

      {/* Public Parameters Bar */}
      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-300 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <span>Prime: <strong className="text-slate-100">p = {p}</strong></span>
          <span>Generator: <strong className="text-slate-100">g = {g}</strong></span>
        </div>
        <button
          onClick={() => setShowPrivate(!showPrivate)}
          className="text-[11px] text-slate-400 hover:text-slate-200 transition flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800"
        >
          {showPrivate ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{showPrivate ? "Hide Private Keys" : "Reveal Private Keys"}</span>
        </button>
      </div>

      {/* ================= NORMAL MODE SIMULATION ================= */}
      {mode === "normal" && (
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              {normalStep === 0 && (
                <button
                  onClick={() => setNormalStep(1)}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>Start Key Exchange</span>
                </button>
              )}
              {normalStep === 1 && (
                <button
                  onClick={() => setNormalStep(2)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <Lock className="w-3 h-3" />
                  <span>Reveal Shared Secret</span>
                </button>
              )}
            </div>

            <button
              onClick={resetAll}
              className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-mono flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Alice Card */}
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-semibold text-slate-200">Alice (Sender)</span>
              </div>

              <div>
                <div className="text-[11px] text-slate-400">Private Value:</div>
                <div className="text-slate-300 font-semibold">
                  {showPrivate ? `a = ${a}` : "[hidden]"}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400">Public Value:</div>
                <div className="text-slate-200">
                  {normalStep >= 1 ? `A = ${A}` : "?"}
                </div>
              </div>

              {normalStep >= 2 && (
                <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
                  <div className="text-[10px] uppercase text-emerald-400">Shared Secret:</div>
                  <div className="text-xs font-bold mt-0.5">{S_Normal}</div>
                </div>
              )}
            </div>

            {/* Network Channel */}
            <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 text-center font-mono space-y-2">
              <div className="text-[10px] uppercase text-slate-500 font-semibold flex items-center justify-center gap-1.5">
                <Radio className="w-3 h-3 text-slate-400" />
                <span>Public Network</span>
              </div>

              {normalStep === 0 && (
                <div className="py-2 text-xs text-slate-500 italic">
                  Click &quot;Start Key Exchange&quot;
                </div>
              )}

              {normalStep >= 1 && (
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="p-1.5 rounded bg-slate-950 border border-slate-800 flex justify-between">
                    <span>Alice → Bob:</span>
                    <strong className="text-slate-100">A = {A}</strong>
                  </div>
                  <div className="p-1.5 rounded bg-slate-950 border border-slate-800 flex justify-between">
                    <span>Bob → Alice:</span>
                    <strong className="text-slate-100">B = {B}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Bob Card */}
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-semibold text-slate-200">Bob (Receiver)</span>
              </div>

              <div>
                <div className="text-[11px] text-slate-400">Private Value:</div>
                <div className="text-slate-300 font-semibold">
                  {showPrivate ? `b = ${b}` : "[hidden]"}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400">Public Value:</div>
                <div className="text-slate-200">
                  {normalStep >= 1 ? `B = ${B}` : "?"}
                </div>
              </div>

              {normalStep >= 2 && (
                <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/30 text-emerald-300">
                  <div className="text-[10px] uppercase text-emerald-400">Shared Secret:</div>
                  <div className="text-xs font-bold mt-0.5">{S_Normal}</div>
                </div>
              )}
            </div>
          </div>

          {/* Outcome Banner */}
          {normalStep >= 2 && (
            <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-2.5 text-xs font-mono text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold">✓ MATCHED: Shared Secret = {S_Normal}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Both parties independently derived the same shared secret without sending the secret itself.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= MITM ATTACK SIMULATION ================= */}
      {mode === "mitm" && (
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              {mitmStep === 0 && (
                <button
                  onClick={() => setMitmStep(1)}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <Skull className="w-3 h-3" />
                  <span>Enable MITM Attack</span>
                </button>
              )}
              {mitmStep === 1 && (
                <button
                  onClick={() => setMitmStep(2)}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <Unlock className="w-3 h-3" />
                  <span>Establish Split Secrets</span>
                </button>
              )}
              {mitmStep === 2 && (
                <button
                  onClick={() => setMitmStep(3)}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>Send Secret Message</span>
                </button>
              )}
            </div>

            <button
              onClick={resetAll}
              className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-mono flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Three-Node Interception Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Alice */}
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2 font-mono text-xs">
              <span className="font-semibold text-slate-200">Alice (Sender)</span>
              <p className="text-slate-400 text-[11px]">
                Sends public key A = {A} intended for Bob.
              </p>
              {mitmStep >= 2 && (
                <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-500">Shared Secret (with Mallory):</div>
                  <div className="text-xs font-semibold text-amber-300">Secret A = {S_Alice_Mitm}</div>
                </div>
              )}
            </div>

            {/* Mallory */}
            <div className={`p-4 rounded-lg border space-y-2 font-mono text-xs transition-colors ${
              mitmStep >= 1
                ? "bg-rose-950/20 border-rose-500/40"
                : "bg-slate-900/30 border-slate-800 text-slate-500"
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                  <Skull className="w-3.5 h-3.5" /> Mallory (Attacker)
                </span>
              </div>

              {mitmStep >= 1 && (
                <p className="text-[11px] text-rose-200/80">
                  Intercepts keys A and B. Injects Mallory key M = {M} to both sides.
                </p>
              )}

              {mitmStep >= 2 && (
                <div className="space-y-1 pt-1 text-[11px]">
                  <div className="p-1.5 rounded bg-slate-950 text-slate-300">
                    Alice ↔ Mallory: <strong className="text-rose-300">{S_Alice_Mitm}</strong>
                  </div>
                  <div className="p-1.5 rounded bg-slate-950 text-slate-300">
                    Mallory ↔ Bob: <strong className="text-rose-300">{S_Bob_Mitm}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Bob */}
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2 font-mono text-xs">
              <span className="font-semibold text-slate-200">Bob (Receiver)</span>
              <p className="text-slate-400 text-[11px]">
                Sends public key B = {B} intended for Alice.
              </p>
              {mitmStep >= 2 && (
                <div className="p-2 rounded bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-500">Shared Secret (with Mallory):</div>
                  <div className="text-xs font-semibold text-amber-300">Secret B = {S_Bob_Mitm}</div>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Message Tampering */}
          {mitmStep >= 3 && (
            <div className="p-4 rounded-lg bg-slate-950 border border-rose-500/40 space-y-3 font-mono text-xs">
              <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Message Interception &amp; Modification</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* 1. Alice Sends */}
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase">1. Alice Sends:</div>
                  <div className="text-slate-200 font-medium">
                    &quot;{aliceMessage}&quot;
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Encrypted with Secret A ({S_Alice_Mitm})
                  </div>
                </div>

                {/* 2. Mallory Modifies */}
                <div className="p-2.5 rounded bg-rose-950/30 border border-rose-500/40 space-y-1">
                  <div className="text-[10px] text-rose-300 uppercase">2. Mallory Modifies:</div>
                  <input
                    type="text"
                    value={malloryTamperText}
                    onChange={(e) => setMalloryTamperText(e.target.value)}
                    className="w-full bg-slate-950 p-1.5 rounded border border-rose-500/50 text-rose-200 text-xs focus:outline-none"
                  />
                  <div className="text-[10px] text-slate-400">
                    Decrypted, altered, re-encrypted with Secret B ({S_Bob_Mitm})
                  </div>
                </div>

                {/* 3. Bob Receives */}
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase">3. Bob Receives:</div>
                  <div className="text-rose-400 font-medium">
                    &quot;{malloryTamperText}&quot;
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Decrypted with Secret B ({S_Bob_Mitm})
                  </div>
                </div>
              </div>

              {/* Verdict */}
              <div className="p-3 rounded bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs">
                ❌ Alice and Bob do not actually share the same authenticated connection.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
