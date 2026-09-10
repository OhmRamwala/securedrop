"use client";

import React from "react";
import { ShieldCheck, Lock, Radio } from "lucide-react";

export function Navbar() {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-wider text-slate-100">
                SECURE<span className="text-cyan-400">DROP</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PROTOTYPE
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Zero-Knowledge End-to-End Encrypted File Sharing
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] text-slate-300 hidden md:inline">
              AES-256-GCM Direct S3
            </span>
            <span className="font-mono text-[11px] text-emerald-400">
              E2EE ACTIVE
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
