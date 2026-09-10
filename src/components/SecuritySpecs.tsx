import React from "react";
import { ShieldCheck, Cpu, Key, Database, ArrowRight } from "lucide-react";

export function SecuritySpecs() {
  return (
    <div className="mt-12 pt-8 border-t border-slate-800/80">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographic Architecture &amp; Security Model</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Zero-knowledge design: the file is encrypted before leaving the sender&apos;s browser.
          </p>
        </div>
      </div>

      {/* Architecture Flow Diagram */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 mb-6 text-xs font-mono text-slate-300">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-cyan-400 font-bold block">Sender Browser</span>
            <span className="text-[10px] text-slate-400">AES-256-GCM Encrypt</span>
          </div>

          <div className="hidden md:flex justify-center text-slate-600">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-emerald-400 font-bold block">AWS S3 (Ciphertext)</span>
            <span className="text-[10px] text-slate-400">Direct Multipart PUT</span>
          </div>

          <div className="hidden md:flex justify-center text-slate-600">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-cyan-400 font-bold block">Receiver Browser</span>
            <span className="text-[10px] text-slate-400">Local Decryption</span>
          </div>
        </div>
      </div>

      {/* Security Properties Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
          <div className="flex items-center space-x-2 text-cyan-400 font-semibold mb-1">
            <Cpu className="w-4 h-4" />
            <span>AES-256-GCM</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Authenticated chunked encryption with 128-bit authentication tags and unique 96-bit counter IVs per 8 MB block.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold mb-1">
            <Key className="w-4 h-4" />
            <span>Key Management</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Transfer codes derive a wrapping key via PBKDF2 (100k rounds) to encrypt the raw AES key. The server only sees ciphertext.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
          <div className="flex items-center space-x-2 text-purple-400 font-semibold mb-1">
            <Database className="w-4 h-4" />
            <span>Direct S3 Presigned</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Ciphertext is streamed directly between the browser and S3 via signed URLs. Backend never handles or proxies file bytes.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Tamper Detection</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Any modification to ciphertext, tags, or keys instantly fails AEAD verification with zero plaintext leakage.
          </p>
        </div>
      </div>
    </div>
  );
}
