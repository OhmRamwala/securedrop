"use client";

import React, { useState } from "react";
import { SenderCard } from "@/components/SenderCard";
import { ReceiverCard } from "@/components/ReceiverCard";
import { SecuritySpecs } from "@/components/SecuritySpecs";
import { Upload, Download, ShieldCheck, Zap, Lock } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"send" | "receive">("send");

  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div>
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-4">
            <Lock className="w-3.5 h-3.5" />
            <span>Zero-Knowledge End-to-End Encryption</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
            Secure<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Drop</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal">
            End-to-End Encrypted File Sharing
          </p>

          <p className="text-xs text-slate-500 mt-2">
            Files are encrypted locally in your browser before uploading directly to AWS S3. Up to 500 MB supported.
          </p>
        </div>

        {/* Tab Selection Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl">
            <button
              id="tab-send"
              onClick={() => setActiveTab("send")}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === "send"
                  ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Send a File</span>
            </button>

            <button
              id="tab-receive"
              onClick={() => setActiveTab("receive")}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === "receive"
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Receive a File</span>
            </button>
          </div>
        </div>

        {/* Main Action View */}
        <div className="max-w-xl mx-auto">
          {activeTab === "send" ? <SenderCard /> : <ReceiverCard />}
        </div>

        {/* Cryptographic Architecture & Security Specs */}
        <SecuritySpecs />
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-6 border-t border-slate-900 text-center text-xs text-slate-600 font-mono">
        <p>SecureDrop Prototype • Web Crypto AES-256-GCM • AWS S3 Presigned Multipart</p>
      </footer>
    </main>
  );
}
