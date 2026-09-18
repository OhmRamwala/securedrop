"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Navbar() {
  return (
    <header className="border-b border-slate-800/80 bg-[#0a0e17]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Typography-focused Brand */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-slate-100 hover:text-white transition-colors group"
        >
          <span className="font-bold text-lg sm:text-xl tracking-tight text-white">
            SecureDrop
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block mb-1 group-hover:scale-125 transition-transform" />
        </Link>

        {/* Simple Navigation */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/demo"
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 transition-all shadow-sm"
          >
            <span>Security Demo</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>
    </header>
  );
}
