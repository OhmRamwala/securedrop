import React from "react";
import { ShieldCheck, Cpu, Key, Database, ArrowRight, Lock, CheckCircle2 } from "lucide-react";

export function SecuritySpecs() {
  return (
    <section className="mt-16 pt-12 border-t border-slate-800/80">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 mb-1.5 uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Zero-Knowledge Security Architecture</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            End-to-End Cryptographic Protocol
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Files are chunked, authenticated, and encrypted client-side in the browser before transmission. The server and storage providers never possess plaintext or decryption keys.
          </p>
        </div>
        <div className="text-left sm:text-right">
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            <span>NIST Approved Primitives</span>
          </span>
        </div>
      </div>

      {/* Architecture Flow Diagram */}
      <div className="product-card rounded-xl p-5 mb-6">
        <div className="text-[11px] font-medium text-slate-400 mb-3 flex items-center justify-between">
          <span>Data Lifecycle Pipeline</span>
          <span className="text-slate-500 font-mono">Stream &amp; Chunk Size: 8 MB</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center">
          <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-blue-400 font-semibold text-xs">Sender Browser</div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">AES-256-GCM + Counter IV</div>
          </div>

          <div className="hidden md:flex justify-center text-slate-600">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-emerald-400 font-semibold text-xs">AWS S3 Storage</div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">Direct Multipart PUT (Encrypted)</div>
          </div>

          <div className="hidden md:flex justify-center text-slate-600">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-blue-400 font-semibold text-xs">Receiver Browser</div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">AEAD Decrypt &amp; Verify</div>
          </div>
        </div>
      </div>

      {/* Security Properties Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl product-card hover:border-slate-700 transition-colors">
          <div className="flex items-center space-x-2 text-slate-200 font-semibold mb-1.5">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>AES-256-GCM AEAD</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Chunked authenticated encryption with 128-bit GHASH authentication tags and deterministic 96-bit counter IVs per 8 MB part.
          </p>
        </div>

        <div className="p-4 rounded-xl product-card hover:border-slate-700 transition-colors">
          <div className="flex items-center space-x-2 text-slate-200 font-semibold mb-1.5">
            <Key className="w-4 h-4 text-blue-400" />
            <span>Key Encapsulation</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Transfer codes derive a wrapping key via PBKDF2 (100,000 iterations) to wrap the master AES key before transit.
          </p>
        </div>

        <div className="p-4 rounded-xl product-card hover:border-slate-700 transition-colors">
          <div className="flex items-center space-x-2 text-slate-200 font-semibold mb-1.5">
            <Database className="w-4 h-4 text-blue-400" />
            <span>Presigned S3 Pipeline</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Payload bytes stream directly between browser and storage via pre-authenticated presigned URLs. No server proxying.
          </p>
        </div>

        <div className="p-4 rounded-xl product-card hover:border-slate-700 transition-colors">
          <div className="flex items-center space-x-2 text-slate-200 font-semibold mb-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Tamper Detection</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Any modification to ciphertext, tags, or keys instantly aborts decryption via AEAD verification with zero plaintext leakage.
          </p>
        </div>
      </div>
    </section>
  );
}

