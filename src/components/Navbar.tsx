"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <header className="border-b border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC]/90 dark:bg-[#090D16]/90 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Clean typography wordmark */}
        <Link
          href="/"
          className="text-[#0F172A] dark:text-[#F8FAFC] hover:text-[#2563EB] dark:hover:text-[#2563EB] transition-colors"
        >
          <span className="font-extrabold text-xl tracking-tight">
            SecureDrop
          </span>
        </Link>

        {/* Right side: Security Demo link & Dark mode toggle */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            href="/demo"
            className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            Security Demo
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
