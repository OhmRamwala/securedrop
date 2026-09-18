"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AesVs3DesDemo } from "./components/AesVs3DesDemo";
import { AvalancheDemo } from "./components/AvalancheDemo";
import { Sha256Demo } from "./components/Sha256Demo";
import { DiffieHellmanDemo } from "./components/DiffieHellmanDemo";
import { WiresharkDemo } from "./components/WiresharkDemo";
import {
  ShieldAlert,
  Key,
  Sparkles,
  Hash,
  ArrowLeftRight,
  Activity,
  ArrowLeft,
  Terminal,
  Cpu,
  Lock,
} from "lucide-react";

type DemoTab = "aes-vs-3des" | "avalanche" | "sha256" | "diffie-hellman" | "wireshark";

export default function SecurityDemoPage() {
  const [activeTab, setActiveTab] = useState<DemoTab>("aes-vs-3des");

  const tabs: { id: DemoTab; label: string; icon: React.ReactNode; badge: string }[] = [
    {
      id: "aes-vs-3des",
      label: "AES-256-GCM vs 3DES",
      icon: <Key className="w-4 h-4" />,
      badge: "CIPAT #1",
    },
    {
      id: "avalanche",
      label: "Avalanche Effect",
      icon: <Sparkles className="w-4 h-4" />,
      badge: "CIPAT #2",
    },
    {
      id: "sha256",
      label: "SHA-256 Integrity",
      icon: <Hash className="w-4 h-4" />,
      badge: "CIPAT #3",
    },
    {
      id: "diffie-hellman",
      label: "Diffie-Hellman & MITM",
      icon: <ArrowLeftRight className="w-4 h-4" />,
      badge: "CIPAT #4",
    },
    {
      id: "wireshark",
      label: "Live Wireshark Demo",
      icon: <Activity className="w-4 h-4" />,
      badge: "CIPAT #5",
    },
  ];

  return (
    <main className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col justify-between">
      <div>
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-mono transition bg-cyan-950/40 px-2.5 py-1 rounded-md border border-cyan-500/30"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to SecureDrop</span>
              </Link>
              <span className="text-slate-600">|</span>
              <span className="text-xs font-mono uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                CIPAT Cryptography Lab
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Security</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                Lab & Demonstrations
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Interactive cryptographic demonstrations for the CIPAT evaluation. Isolated from the production 2 GB transfer engine.
            </p>
          </div>

          {/* Quick specs badge */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Production Engine</div>
              <div className="text-cyan-400 font-bold">AES-256-GCM Direct S3</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-thin border-b border-slate-800/80 gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-950/50"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase ${
                    isActive
                      ? "bg-cyan-400 text-slate-950 font-bold"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="rounded-2xl bg-slate-900/50 border border-slate-800/80 p-5 sm:p-7 shadow-2xl backdrop-blur-sm">
          {activeTab === "aes-vs-3des" && <AesVs3DesDemo />}
          {activeTab === "avalanche" && <AvalancheDemo />}
          {activeTab === "sha256" && <Sha256Demo />}
          {activeTab === "diffie-hellman" && <DiffieHellmanDemo />}
          {activeTab === "wireshark" && <WiresharkDemo />}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-slate-900 text-center text-xs text-slate-600 font-mono flex flex-col sm:flex-row justify-between items-center gap-2">
        <div>SecureDrop Cybersecurity Laboratory • Educational CIPAT Demonstrations</div>
        <div>Production Transfer Engine Untouched</div>
      </footer>
    </main>
  );
}
