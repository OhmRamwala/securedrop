"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Navbar() {
  return (
    <header className="border-b border-stone-200/80 bg-[#faf9f6]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Typography-first brand logo */}
        <Link
          href="/"
          className="text-stone-900 hover:text-black transition-colors"
        >
          <span className="font-extrabold text-xl tracking-tight">
            SecureDrop
          </span>
        </Link>

        {/* Sole Security Demo link in navbar */}
        <div className="flex items-center">
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200/80 border border-stone-300/70 transition-all shadow-sm"
          >
            <span>Security Demo</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-stone-500" />
          </Link>
        </div>
      </div>
    </header>
  );
}
