"use client";

import React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";

export function Navbar() {
  return (
    <header className="border-b border-slate-800/80 bg-[#090d14]/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-slate-100 hover:text-white transition group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 group-hover:text-white group-hover:border-slate-600 transition">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-semibold text-base tracking-tight text-white">
            SecureDrop
          </span>
        </Link>

        {/* Navigation Action */}
        <div className="flex items-center gap-3">
          <Link
            href="/demo"
            className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-800/80 transition"
          >
            Security Demo
          </Link>
        </div>
      </div>
    </header>
  );
}
