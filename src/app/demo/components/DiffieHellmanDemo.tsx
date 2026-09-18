"use client";

import React, { useState } from "react";
import { Users, UserX, ShieldAlert, ArrowRight, ArrowLeft, ArrowLeftRight, CheckCircle2, Lock, Unlock } from "lucide-react";

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
  const [step, setStep] = useState<number>(1);

  // DH Public Parameters
  const p = 23; // Public prime modulus
  const g = 5;  // Generator (primitive root mod 23)

  // Private Keys
  const a = 6;  // Alice's private key
  const b = 15; // Bob's private key
  const m = 7;  // Mallory's (Attacker's) private key

  // Public Keys computed: g^x mod p
  const A = modExp(g, a, p); // 5^6 mod 23 = 8
  const B = modExp(g, b, p); // 5^15 mod 23 = 19
  const M = modExp(g, m, p); // 5^7 mod 23 = 17

  // Shared Secrets
  // Legitimate:
  const S_Alice_Legit = modExp(B, a, p); // 19^6 mod 23 = 2
  const S_Bob_Legit = modExp(A, b, p);   // 8^15 mod 23 = 2

  // Under MITM:
  const S_Alice_Mitm = modExp(M, a, p);   // 17^6 mod 23 = 13
  const S_Mallory_A = modExp(A, m, p);    // 8^7 mod 23 = 13
  const S_Bob_Mitm = modExp(M, b, p);     // 17^15 mod 23 = 9
  const S_Mallory_B = modExp(B, m, p);    // 19^7 mod 23 = 9

  return (
    <div className="space-y-6">
      {/* What is Happening */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4" /> What is Happening (Educational Simulation)
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          The <strong>Diffie-Hellman (DH) Key Exchange</strong> allows two parties to establish a shared cryptographic secret over an insecure channel. 
          However, <strong>unauthenticated Diffie-Hellman is vulnerable to a Man-in-the-Middle (MITM) attack</strong>: an active adversary can intercept public keys and establish two distinct shared secrets, eavesdropping or modifying ciphertext without detection.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => { setMode("normal"); setStep(1); }}
            className={`px-5 py-2 rounded-lg font-semibold text-xs transition flex items-center gap-2 ${
              mode === "normal"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Legitimate DH Key Exchange</span>
          </button>
          <button
            onClick={() => { setMode("mitm"); setStep(1); }}
            className={`px-5 py-2 rounded-lg font-semibold text-xs transition flex items-center gap-2 ${
              mode === "mitm"
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserX className="w-4 h-4 text-rose-400" />
            <span>Active MITM Interception (Mallory)</span>
          </button>
        </div>
      </div>

      {/* Public Parameters Banner */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center font-mono text-xs text-slate-300 flex flex-wrap justify-center gap-6">
        <span>Public Prime Modulus: <strong className="text-cyan-400">p = {p}</strong></span>
        <span>Public Generator: <strong className="text-cyan-400">g = {g}</strong></span>
        <span>Formula: <strong className="text-slate-200">Public Key = g^(Private) mod p</strong></span>
      </div>

      {/* Simulation Visual Flow */}
      {mode === "normal" ? (
        /* Normal Mode */
        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-emerald-500/30 shadow-xl space-y-6">
          <div className="text-center">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
              DIRECT END-TO-END NEGOTIATION
            </span>
            <h4 className="text-base font-bold text-slate-100 mt-2">
              Alice ←────────────── Direct Insecure Channel ──────────────→ Bob
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Alice */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-cyan-400 text-sm">Alice (Sender)</span>
                <span className="text-[10px] text-slate-500">Node A</span>
              </div>
              <p className="text-slate-400">1. Chooses secret private key: <strong className="text-cyan-300">a = {a}</strong></p>
              <p className="text-slate-400">
                2. Computes public key: <code className="text-slate-200">A = {g}^{a} mod {p} = </code>
                <strong className="text-cyan-400 text-sm"> {A}</strong>
              </p>
              <div className="p-2 rounded bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5 text-[11px]">
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                <span>Transmits public key A = {A} over the wire to Bob</span>
              </div>
              <p className="text-slate-400">
                3. Receives B = {B} from Bob. Computes shared secret:
                <br />
                <code className="text-slate-200">S = B^a mod p = {B}^{a} mod {p} = </code>
                <strong className="text-emerald-400 text-sm"> {S_Alice_Legit}</strong>
              </p>
            </div>

            {/* Bob */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-emerald-400 text-sm">Bob (Receiver)</span>
                <span className="text-[10px] text-slate-500">Node B</span>
              </div>
              <p className="text-slate-400">1. Chooses secret private key: <strong className="text-emerald-300">b = {b}</strong></p>
              <p className="text-slate-400">
                2. Computes public key: <code className="text-slate-200">B = {g}^{b} mod {p} = </code>
                <strong className="text-emerald-400 text-sm"> {B}</strong>
              </p>
              <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5 text-[11px]">
                <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                <span>Transmits public key B = {B} over the wire to Alice</span>
              </div>
              <p className="text-slate-400">
                3. Receives A = {A} from Alice. Computes shared secret:
                <br />
                <code className="text-slate-200">S = A^b mod p = {A}^{b} mod {p} = </code>
                <strong className="text-emerald-400 text-sm"> {S_Bob_Legit}</strong>
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Matching Shared Secret Established: S = {S_Alice_Legit}</span>
            </div>
            <span className="text-slate-400 text-[11px]">
              Eavesdroppers on wire only see p={p}, g={g}, A={A}, B={B} (Discrete Log Problem protects S)
            </span>
          </div>
        </div>
      ) : (
        /* MITM Mode */
        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-rose-500/40 shadow-xl space-y-6">
          <div className="text-center">
            <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-mono">
              ACTIVE MAN-IN-THE-MIDDLE ATTACK
            </span>
            <h4 className="text-base font-bold text-slate-100 mt-2">
              Alice ←──[Insecure Wire]──→ <span className="text-rose-400">Attacker (Mallory)</span> ←──[Insecure Wire]──→ Bob
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Alice */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 font-mono text-xs">
              <span className="font-bold text-cyan-400">Alice (Sender)</span>
              <p className="text-slate-400">Sends <strong className="text-cyan-300">A = {A}</strong> intended for Bob.</p>
              <div className="p-2 rounded bg-slate-900 text-slate-300 text-[11px]">
                Receives fake key <strong className="text-rose-400">M = {M}</strong> (believing it is Bob&apos;s key B).
              </div>
              <p className="text-slate-400">
                Computes secret:
                <br />
                <code className="text-slate-200">S = {M}^{a} mod {p} = </code>
                <strong className="text-amber-400"> {S_Alice_Mitm}</strong>
              </p>
              <div className="text-[10px] text-amber-300/80">Alice encrypts with Secret 13</div>
            </div>

            {/* Mallory (MITM) */}
            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/50 space-y-2.5 font-mono text-xs shadow-lg">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-400">Mallory (MITM Attacker)</span>
                <Unlock className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <p className="text-slate-300 text-[11px]">
                1. Intercepts Alice&apos;s A={A} and Bob&apos;s B={B}. Drops them!
              </p>
              <p className="text-slate-300 text-[11px]">
                2. Generates private key <strong className="text-rose-300">m = {m}</strong>, computes <strong className="text-rose-400">M = {M}</strong>.
              </p>
              <div className="space-y-1 text-[11px]">
                <div className="p-1.5 rounded bg-rose-900/30 text-rose-300">
                  Secret with Alice: <strong>{S_Mallory_A}</strong> (matches Alice)
                </div>
                <div className="p-1.5 rounded bg-rose-900/30 text-rose-300">
                  Secret with Bob: <strong>{S_Mallory_B}</strong> (matches Bob)
                </div>
              </div>
              <div className="p-2 rounded bg-rose-950/60 border border-rose-500/30 text-[10px] text-rose-200">
                Mallory decrypts Alice&apos;s file with key 13, alters content, re-encrypts with key 9, and forwards to Bob!
              </div>
            </div>

            {/* Bob */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 font-mono text-xs">
              <span className="font-bold text-emerald-400">Bob (Receiver)</span>
              <p className="text-slate-400">Sends <strong className="text-emerald-300">B = {B}</strong> intended for Alice.</p>
              <div className="p-2 rounded bg-slate-900 text-slate-300 text-[11px]">
                Receives fake key <strong className="text-rose-400">M = {M}</strong> (believing it is Alice&apos;s key A).
              </div>
              <p className="text-slate-400">
                Computes secret:
                <br />
                <code className="text-slate-200">S = {M}^{b} mod {p} = </code>
                <strong className="text-amber-400"> {S_Bob_Mitm}</strong>
              </p>
              <div className="text-[10px] text-amber-300/80">Bob decrypts with Secret 9</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs font-mono text-rose-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>
              <strong>EXPLOIT CONFIRMED:</strong> Unauthenticated Diffie-Hellman cannot verify the identity of the counterparty. Mallory controls both channels.
            </span>
          </div>
        </div>
      )}

      {/* Why It Matters & SecureDrop Solution */}
      <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
          Why It Matters & SecureDrop&apos;s Defense Architecture
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          Unauthenticated Diffie-Hellman fails because there is no cryptographic guarantee of identity or out-of-band trust. 
          <strong> How SecureDrop Solves This:</strong> SecureDrop does not rely on vulnerable unauthenticated in-band key exchanges. 
          Instead, the file key is generated strictly in the sender&apos;s browser and <strong>wrapped using PBKDF2 (100,000 iterations) with an out-of-band 6-character transfer code</strong>. 
          Even if an active MITM attacker captures all network traffic and presigned S3 URLs, they <em>cannot</em> derive the encryption key without knowing the secret transfer code shared out-of-band by the sender.
        </p>
      </div>
    </div>
  );
}
