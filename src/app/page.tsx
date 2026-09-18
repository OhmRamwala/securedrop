"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SenderCard } from "@/components/SenderCard";
import { ReceiverCard } from "@/components/ReceiverCard";
import { SecuritySpecs } from "@/components/SecuritySpecs";
import { Upload, Download, ArrowRight } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"send" | "receive">("send");

  return (
    <main className="min-h-[calc(100vh-4rem)] subtle-pattern flex flex-col justify-between py-8 sm:py-12 px-4 sm:px-8 max-w-6xl mx-auto">
      <div className="my-auto py-6">
        {/* Asymmetric Product Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column: Product Value & Editorial Typography */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Zero-Knowledge File Transfer</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Simple, secure file transfer up to 2 GB.
            </h1>

            <p className="text-base sm:text-lg text-slate-400 font-normal leading-relaxed max-w-xl">
              Files are encrypted locally in your browser with AES-256-GCM before being streamed directly to storage. Shared instantly via a short 6-character transfer code.
            </p>

            {/* Feature Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80">
                <div className="text-xs font-semibold text-slate-200">Browser AES-256</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Encrypted locally</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80">
                <div className="text-xs font-semibold text-slate-200">Up to 2 GB</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Direct multipart stream</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80">
                <div className="text-xs font-semibold text-slate-200">No Account</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Instant transfer code</div>
              </div>
            </div>

            {/* Security Demo Link Card */}
            <div className="pt-2">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/70 hover:border-slate-600 text-xs sm:text-sm font-medium text-slate-200 transition-all group shadow-sm"
              >
                <span>Security Demo (Interactive Cryptography Lab)</span>
                <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Transfer Workspace */}
          <div className="lg:col-span-6 w-full max-w-lg mx-auto lg:max-w-none">
            {/* Segmented Switcher */}
            <div className="flex justify-start mb-4">
              <div className="inline-flex p-1 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm shadow-sm w-full sm:w-auto">
                <button
                  id="tab-send"
                  onClick={() => setActiveTab("send")}
                  className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                    activeTab === "send"
                      ? "bg-slate-800 text-white shadow-sm font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Send a File</span>
                </button>

                <button
                  id="tab-receive"
                  onClick={() => setActiveTab("receive")}
                  className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                    activeTab === "receive"
                      ? "bg-slate-800 text-white shadow-sm font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>Receive a File</span>
                </button>
              </div>
            </div>

            {/* Transfer Card Container */}
            <div className="product-card rounded-2xl p-6 sm:p-8 backdrop-blur-md relative">
              {activeTab === "send" ? <SenderCard /> : <ReceiverCard />}
            </div>
          </div>
        </div>

        {/* Cryptographic Architecture & Security Specifications */}
        <SecuritySpecs />
      </div>

      {/* Minimal Footer */}
      <footer className="mt-16 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 font-normal gap-2">
        <span className="font-semibold text-slate-400">SecureDrop</span>
        <span>© 2026 SecureDrop</span>
      </footer>
    </main>
  );
}
