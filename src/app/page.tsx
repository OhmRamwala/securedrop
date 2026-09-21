"use client";

import React, { useState } from "react";
import { SenderCard } from "@/components/SenderCard";
import { ReceiverCard } from "@/components/ReceiverCard";
import { Upload, Download, ShieldCheck, Zap, Lock } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"send" | "receive">("send");

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-canvas flex flex-col justify-between py-10 sm:py-16 px-4 sm:px-8 max-w-4xl mx-auto transition-colors">
      <div className="w-full my-auto space-y-8 text-center">
        {/* Concise, Polished Product Copy */}
        <div className="space-y-3 max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] leading-tight">
            Share files. Simply.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
            Fast, private file sharing for files up to 2 GB. No accounts, no clutter.
          </p>
        </div>

        {/* Feature Badges (Short, Minimal) */}
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs">
            <Lock className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Client-side Encrypted</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Up to 2 GB</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Instant 6-letter Code</span>
          </div>
        </div>

        {/* Centered Send / Receive Mode Selector */}
        <div className="flex justify-center pt-2">
          <div className="inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/70 border border-[#E2E8F0] dark:border-slate-700/80 w-full sm:w-auto shadow-inner">
            <button
              id="tab-send"
              onClick={() => setActiveTab("send")}
              className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg text-xs sm:text-sm transition-all ${
                activeTab === "send"
                  ? "bg-white dark:bg-slate-900 text-[#0F172A] dark:text-[#F8FAFC] shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white font-medium"
              }`}
            >
              <Upload className="w-4 h-4 text-[#2563EB]" />
              <span>Send a File</span>
            </button>

            <button
              id="tab-receive"
              onClick={() => setActiveTab("receive")}
              className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg text-xs sm:text-sm transition-all ${
                activeTab === "receive"
                  ? "bg-white dark:bg-slate-900 text-[#0F172A] dark:text-[#F8FAFC] shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white font-medium"
              }`}
            >
              <Download className="w-4 h-4 text-[#2563EB]" />
              <span>Receive a File</span>
            </button>
          </div>
        </div>

        {/* Transfer Hero Card */}
        <div className="max-w-xl mx-auto w-full text-left">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] dark:border-slate-800 shadow-sm transition-colors">
            {activeTab === "send" ? <SenderCard /> : <ReceiverCard />}
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="mt-16 pt-6 border-t border-[#E2E8F0] dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-normal gap-2 transition-colors">
        <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">SecureDrop</span>
        <span>© 2026 SecureDrop</span>
      </footer>
    </main>
  );
}
