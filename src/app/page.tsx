"use client";

import React, { useState } from "react";
import { SenderCard } from "@/components/SenderCard";
import { ReceiverCard } from "@/components/ReceiverCard";
import { Upload, Download, Sparkles, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"send" | "receive">("send");

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-ambient-canvas relative overflow-hidden flex flex-col justify-between py-8 sm:py-12 px-4 sm:px-8 max-w-6xl mx-auto">
      {/* Subtle colorful ambient shapes */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-amber-200/40 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl pointer-events-none -z-10" />

      <div className="my-auto py-6">
        {/* Asymmetric Editorial Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Typography, Brand Narrative & Features */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-semibold text-blue-700 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Direct Browser-to-Cloud Transfer</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-stone-900 leading-[1.08]">
              Send anything, up to 2 GB.
            </h1>

            <p className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed max-w-lg">
              Files are encrypted locally in your browser before upload and retrieved directly with a 6-character code. No account, no trackers, no clutter.
            </p>

            {/* Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/80 border border-stone-200 shadow-sm">
                <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>AES-256-GCM</span>
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">Encrypted in browser</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-stone-200 shadow-sm">
                <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Up to 2 GB</span>
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">Direct multipart stream</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-stone-200 shadow-sm">
                <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>No Account</span>
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">Instant 6-letter code</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Transfer Card */}
          <div className="lg:col-span-6 w-full max-w-lg mx-auto lg:max-w-none">
            {/* Segmented Switcher */}
            <div className="flex justify-start mb-4">
              <div className="inline-flex p-1.5 rounded-2xl bg-stone-200/70 border border-stone-300/60 shadow-inner w-full sm:w-auto">
                <button
                  id="tab-send"
                  onClick={() => setActiveTab("send")}
                  className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm transition-all ${
                    activeTab === "send"
                      ? "bg-white text-stone-950 shadow-sm font-bold"
                      : "text-stone-600 hover:text-stone-900 font-semibold"
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Send a File</span>
                </button>

                <button
                  id="tab-receive"
                  onClick={() => setActiveTab("receive")}
                  className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm transition-all ${
                    activeTab === "receive"
                      ? "bg-white text-stone-950 shadow-sm font-bold"
                      : "text-stone-600 hover:text-stone-900 font-semibold"
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>Receive a File</span>
                </button>
              </div>
            </div>

            {/* Transfer Card Container */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 card-hero-shadow relative">
              {activeTab === "send" ? <SenderCard /> : <ReceiverCard />}
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="mt-16 pt-6 border-t border-stone-200/80 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 font-normal gap-2">
        <span className="font-bold text-stone-700">SecureDrop</span>
        <span>© 2026 SecureDrop</span>
      </footer>
    </main>
  );
}
