"use client";

import React, { useState } from "react";
import {
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Eye,
  EyeOff,
  Send,
  Radio,
  User,
  Skull,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

// Modular exponentiation helper: (base^exp) % mod
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

  // Normal mode progress: 0 = Idle, 1 = Exchanging Public Keys, 2 = Secret Derived
  const [normalStep, setNormalStep] = useState<number>(0);

  // MITM mode progress: 0 = Idle, 1 = Attack Armed, 2 = Keys Intercepted & Split Secrets Derived, 3 = Message Tampered
  const [mitmStep, setMitmStep] = useState<number>(0);

  // Show/hide private exponents
  const [showPrivate, setShowPrivate] = useState<boolean>(false);

  // Message tampering state for MITM
  const [aliceMessage, setAliceMessage] = useState<string>("HELLO BOB - SECRET PASSCODE 7792");
  const [malloryTamperText, setMalloryTamperText] = useState<string>("HELLO MALLORY - TRANSFER $50,000");

  // Mathematical Parameters
  const p = 23; // Public prime modulus
  const g = 5;  // Generator

  // Private Keys
  const a = 6;  // Alice's private key
  const b = 15; // Bob's private key
  const m = 7;  // Mallory's private key

  // Public Keys (g^x mod p)
  const A = modExp(g, a, p); // 5^6 mod 23 = 8
  const B = modExp(g, b, p); // 5^15 mod 23 = 19
  const M = modExp(g, m, p); // 5^7 mod 23 = 17

  // Shared Secrets
  const S_Normal = modExp(B, a, p);     // 19^6 mod 23 = 2 (Alice and Bob)
  const S_Alice_Mitm = modExp(M, a, p); // 17^6 mod 23 = 13 (Alice with Mallory)
  const S_Bob_Mitm = modExp(M, b, p);   // 17^15 mod 23 = 9 (Bob with Mallory)

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
      {/* Simulation Title & Mode Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
        <div>
          <div className="text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider">
            Cybersecurity Simulation Lab
          </div>
          <h3 className="text-base font-bold text-slate-100">
            Interactive Diffie-Hellman & MITM Arena
          </h3>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            onClick={() => switchMode("normal")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 ${
              mode === "normal"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Normal Exchange</span>
          </button>
          <button
            onClick={() => switchMode("mitm")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 ${
              mode === "mitm"
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Skull className="w-3.5 h-3.5" />
            <span>MITM Attack</span>
          </button>
        </div>
      </div>

      {/* Public Domain Parameters Bar */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <span>Public Prime: <strong className="text-cyan-400">p = {p}</strong></span>
          <span>Generator: <strong className="text-cyan-400">g = {g}</strong></span>
        </div>
        <button
          onClick={() => setShowPrivate(!showPrivate)}
          className="text-[11px] text-slate-400 hover:text-cyan-300 transition flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800"
        >
          {showPrivate ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{showPrivate ? "Hide Private Keys" : "Reveal Private Keys"}</span>
        </button>
      </div>

      {/* ================= NORMAL MODE SIMULATION ================= */}
      {mode === "normal" && (
        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-emerald-500/30 shadow-2xl space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Simulation Controls:</span>
              {normalStep === 0 && (
                <button
                  onClick={() => setNormalStep(1)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow-md shadow-emerald-950/50 transition active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Start Key Exchange</span>
                </button>
              )}
              {normalStep === 1 && (
                <button
                  onClick={() => setNormalStep(2)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow-md shadow-emerald-950/50 transition active:scale-95 animate-pulse"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Reveal Shared Secret</span>
                </button>
              )}
            </div>

            <button
              onClick={resetAll}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Interactive Visual Network Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Alice Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                    A
                  </div>
                  <span className="font-bold text-cyan-300">Alice (Sender)</span>
                </div>
                <span className="text-[10px] text-cyan-400/80 bg-cyan-950/50 px-2 py-0.5 rounded">
                  Client
                </span>
              </div>

              <div>
                <div className="text-[11px] text-slate-400">Private Exponent:</div>
                <div className="text-cyan-400 font-bold">
                  {showPrivate ? `a = ${a}` : "[hidden private key]"}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400">Public Value Generated:</div>
                <div className="text-slate-200">
                  {normalStep >= 1 ? (
                    <span className="text-cyan-300 font-bold">
                      A = 5^{a} mod 23 = <strong className="text-white text-sm bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">{A}</strong>
                    </span>
                  ) : (
                    <span className="text-slate-500 italic">Not transmitted yet</span>
                  )}
                </div>
              </div>

              {normalStep >= 2 && (
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
                  <div className="text-[10px] uppercase font-bold text-emerald-400">Derived Secret:</div>
                  <div className="text-sm font-bold mt-0.5">
                    S = B^a mod 23 = 19^6 mod 23 = <span className="text-white bg-emerald-900/60 px-2 py-0.5 rounded">{S_Normal}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Network Channel in the Middle */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center font-mono space-y-3">
              <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider flex items-center justify-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Insecure Public Wire</span>
              </div>

              {normalStep === 0 && (
                <div className="py-4 text-xs text-slate-500 italic">
                  Channel idle. Click &quot;Start Key Exchange&quot; above.
                </div>
              )}

              {normalStep >= 1 && (
                <div className="space-y-2 text-xs">
                  {/* Alice to Bob */}
                  <div className="p-2 rounded bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 flex items-center justify-between">
                    <span>Alice → Bob:</span>
                    <strong className="text-white bg-cyan-900/60 px-2 py-0.5 rounded">A = {A}</strong>
                  </div>
                  {/* Bob to Alice */}
                  <div className="p-2 rounded bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
                    <span>Bob → Alice:</span>
                    <strong className="text-white bg-emerald-900/60 px-2 py-0.5 rounded">B = {B}</strong>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1">
                    Public wire exposes A={A}, B={B}. Discrete logarithm protects secrets!
                  </div>
                </div>
              )}
            </div>

            {/* Bob Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    B
                  </div>
                  <span className="font-bold text-emerald-300">Bob (Receiver)</span>
                </div>
                <span className="text-[10px] text-emerald-400/80 bg-emerald-950/50 px-2 py-0.5 rounded">
                  Client
                </span>
              </div>

              <div>
                <div className="text-[11px] text-slate-400">Private Exponent:</div>
                <div className="text-emerald-400 font-bold">
                  {showPrivate ? `b = ${b}` : "[hidden private key]"}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400">Public Value Generated:</div>
                <div className="text-slate-200">
                  {normalStep >= 1 ? (
                    <span className="text-emerald-300 font-bold">
                      B = 5^{b} mod 23 = <strong className="text-white text-sm bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30">{B}</strong>
                    </span>
                  ) : (
                    <span className="text-slate-500 italic">Not transmitted yet</span>
                  )}
                </div>
              </div>

              {normalStep >= 2 && (
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
                  <div className="text-[10px] uppercase font-bold text-emerald-400">Derived Secret:</div>
                  <div className="text-sm font-bold mt-0.5">
                    S = A^b mod 23 = 8^15 mod 23 = <span className="text-white bg-emerald-900/60 px-2 py-0.5 rounded">{S_Normal}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Normal Mode Outcome Banner */}
          {normalStep >= 2 && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2.5 text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-sm">
                    ✓ SECRETS MATCHED (S = {S_Normal})
                  </div>
                  <div className="text-slate-300 text-[11px] mt-0.5">
                    Both parties independently derived the same shared secret ({S_Normal}) without ever sending the secret itself over the network!
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= MITM ATTACK SIMULATION ================= */}
      {mode === "mitm" && (
        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-rose-500/40 shadow-2xl space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Attack Controls:</span>
              {mitmStep === 0 && (
                <button
                  onClick={() => setMitmStep(1)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono flex items-center gap-1.5 shadow-md shadow-rose-950/50 transition active:scale-95"
                >
                  <Skull className="w-3.5 h-3.5" />
                  <span>🚨 ENABLE MITM ATTACK</span>
                </button>
              )}
              {mitmStep === 1 && (
                <button
                  onClick={() => setMitmStep(2)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow-md shadow-amber-950/50 transition active:scale-95 animate-pulse"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Intercept Keys & Establish Split Secrets</span>
                </button>
              )}
              {mitmStep === 2 && (
                <button
                  onClick={() => setMitmStep(3)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono flex items-center gap-1.5 shadow-md shadow-rose-950/50 transition active:scale-95 animate-pulse"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Secret Message (Alice → Mallory → Bob)</span>
                </button>
              )}
            </div>

            <button
              onClick={resetAll}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Attack</span>
            </button>
          </div>

          {/* Three-Node Interception Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* Alice (Victim Sender) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-cyan-400">Alice (Sender)</span>
                <span className="text-[10px] text-slate-400">Victim</span>
              </div>
              <p className="text-slate-400">
                Alice sends public key <strong className="text-cyan-300">A = {A}</strong> intended for Bob.
              </p>
              {mitmStep >= 2 && (
                <div className="p-2.5 rounded bg-amber-950/30 border border-amber-500/30 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-amber-300">
                    Alice thinks she connects to Bob:
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Received Fake Key: <strong className="text-rose-400">M = {M}</strong>
                  </div>
                  <div className="text-xs font-bold text-amber-300">
                    Shared Secret A = {S_Alice_Mitm}
                  </div>
                </div>
              )}
            </div>

            {/* Mallory (Active MITM Attacker) */}
            <div className={`p-4 rounded-xl border space-y-2.5 font-mono text-xs transition-all ${
              mitmStep >= 1
                ? "bg-rose-950/30 border-rose-500/60 shadow-xl shadow-rose-950/40"
                : "bg-slate-950/60 border-slate-800 text-slate-500"
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-rose-400 flex items-center gap-1.5">
                  <Skull className="w-4 h-4" /> Mallory (Attacker)
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30 font-bold">
                  {mitmStep >= 1 ? "ACTIVE INTRUDER" : "STANDBY"}
                </span>
              </div>

              {mitmStep === 0 && (
                <div className="py-4 text-center text-slate-500 italic">
                  Click &quot;ENABLE MITM ATTACK&quot; above to hijack the public wire.
                </div>
              )}

              {mitmStep >= 1 && (
                <div className="space-y-2">
                  <div className="text-[11px] text-rose-200">
                    1. Intercepts and DROPS Alice&apos;s A={A} and Bob&apos;s B={B}.
                  </div>
                  <div className="text-[11px] text-rose-200">
                    2. Injects attacker key <strong className="text-white bg-rose-900 px-1.5 py-0.5 rounded">M = {M}</strong> to both victims.
                  </div>
                </div>
              )}

              {mitmStep >= 2 && (
                <div className="space-y-1.5 pt-1">
                  <div className="p-2 rounded bg-rose-900/30 border border-rose-500/40 text-[11px] text-rose-300">
                    Secret with Alice: <strong className="text-white text-xs">{S_Alice_Mitm}</strong> (matches Alice)
                  </div>
                  <div className="p-2 rounded bg-rose-900/30 border border-rose-500/40 text-[11px] text-rose-300">
                    Secret with Bob: <strong className="text-white text-xs">{S_Bob_Mitm}</strong> (matches Bob)
                  </div>
                </div>
              )}
            </div>

            {/* Bob (Victim Receiver) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-emerald-400">Bob (Receiver)</span>
                <span className="text-[10px] text-slate-400">Victim</span>
              </div>
              <p className="text-slate-400">
                Bob sends public key <strong className="text-emerald-300">B = {B}</strong> intended for Alice.
              </p>
              {mitmStep >= 2 && (
                <div className="p-2.5 rounded bg-amber-950/30 border border-amber-500/30 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-amber-300">
                    Bob thinks he connects to Alice:
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Received Fake Key: <strong className="text-rose-400">M = {M}</strong>
                  </div>
                  <div className="text-xs font-bold text-amber-300">
                    Shared Secret B = {S_Bob_Mitm}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Interactive Message Interception & Modification */}
          {mitmStep >= 3 && (
            <div className="p-5 rounded-xl bg-slate-950 border border-rose-500/50 space-y-4">
              <div className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Live Interception & Tamper Walkthrough</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                {/* 1. Alice Sends */}
                <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/30 space-y-1.5">
                  <div className="text-[10px] text-cyan-400 uppercase font-bold">1. Alice Sends Message:</div>
                  <div className="text-slate-200 font-bold bg-slate-950 p-2 rounded border border-slate-800">
                    &quot;{aliceMessage}&quot;
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Encrypted with Secret A (<span className="text-cyan-300 font-bold">{S_Alice_Mitm}</span>)
                  </div>
                </div>

                {/* 2. Mallory Decrypts & Modifies */}
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 space-y-1.5">
                  <div className="text-[10px] text-rose-300 uppercase font-bold flex items-center justify-between">
                    <span>2. Mallory Decrypts & Modifies:</span>
                    <Unlock className="w-3 h-3 text-rose-400" />
                  </div>
                  <input
                    type="text"
                    value={malloryTamperText}
                    onChange={(e) => setMalloryTamperText(e.target.value)}
                    className="w-full bg-slate-950 p-2 rounded border border-rose-500/50 text-rose-300 font-bold text-xs focus:outline-none"
                    placeholder="Enter malicious replacement..."
                  />
                  <div className="text-[10px] text-rose-200/80">
                    Decrypted with Key {S_Alice_Mitm}, altered, re-encrypted with Key {S_Bob_Mitm}!
                  </div>
                </div>

                {/* 3. Bob Decrypts Tampered Content */}
                <div className="p-3 rounded-lg bg-slate-900 border border-emerald-500/30 space-y-1.5">
                  <div className="text-[10px] text-emerald-400 uppercase font-bold">3. Bob Receives & Decrypts:</div>
                  <div className="text-rose-400 font-bold bg-slate-950 p-2 rounded border border-rose-500/40">
                    &quot;{malloryTamperText}&quot;
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Decrypted with Secret B (<span className="text-emerald-300 font-bold">{S_Bob_Mitm}</span>) with zero error!
                  </div>
                </div>
              </div>

              {/* Verdict Banner */}
              <div className="p-3.5 rounded-lg bg-rose-950/50 border border-rose-500/60 flex items-start gap-2.5 text-xs font-mono text-rose-300">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm">
                    ❌ MITM EXPLOIT CONFIRMED: ZERO AUTHENTICATION
                  </div>
                  <p className="text-[11px] text-rose-200/90 mt-0.5 leading-relaxed">
                    Alice and Bob do not share the same authenticated connection! Because unauthenticated Diffie-Hellman cannot verify <em>who</em> sent the public keys, Mallory read and completely falsified the message in transit.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Why It Matters & SecureDrop Defense Architecture */}
      <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
          Why It Matters & SecureDrop&apos;s Solution (CIPAT Viva Defense)
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          Diffie-Hellman guarantees secrecy against passive eavesdroppers, but is defenseless against an active Man-in-the-Middle without <strong>authentication</strong>. 
          <br className="my-1" />
          <strong>How SecureDrop Completely Prevents This:</strong> SecureDrop rejects unauthenticated in-band key exchanges. Instead, the 256-bit file key is generated locally in the sender&apos;s browser and <strong>wrapped using PBKDF2 (100,000 iterations) with an out-of-band 6-character transfer code</strong>. Even if an active attacker captures network traffic or presigned S3 URLs, they cannot decrypt the file key without knowing the secret transfer code shared out-of-band.
        </p>
      </div>
    </div>
  );
}
