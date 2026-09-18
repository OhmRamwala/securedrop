"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AesVs3DesDemo } from "./components/AesVs3DesDemo";
import { AvalancheDemo } from "./components/AvalancheDemo";
import { Sha256Demo } from "./components/Sha256Demo";
import { DiffieHellmanDemo } from "./components/DiffieHellmanDemo";
import { ArrowLeft, Shield, Lock } from "lucide-react";

type DemoTab = "aes-vs-3des" | "avalanche" | "sha256" | "diffie-hellman";

export default function SecurityDemoPage() {
  const [activeTab, setActiveTab] = useState<DemoTab>("aes-vs-3des");

  const tabs: { id: DemoTab; label: string }[] = [
    {
      id: "aes-vs-3des",
      label: "AES-256-GCM vs 3DES",
    },
    {
      id: "avalanche",
      label: "Avalanche Effect",
    },
    {
      id: "sha256",
      label: "SHA-256 Integrity",
    },
    {
      id: "diffie-hellman",
      label: "Diffie-Hellman & MITM",
    },
  ];

  return (
    <main className="min-h-[calc(100vh-3.5rem)] py-8 sm:py-12 px-4 sm:px-6 max-w-5xl mx-auto flex flex-col justify-between">
      <div>
        {/* Navigation & Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to SecureDrop</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Security Demo
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Interactive demonstrations of core cryptographic primitives and attack simulations.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex overflow-x-auto pb-1 mb-6 border-b border-slate-800 gap-1 sm:gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-slate-800 text-white border border-slate-700/80 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="rounded-xl bg-[#0f141f] border border-slate-800/80 p-5 sm:p-7">
          {activeTab === "aes-vs-3des" && <AesVs3DesDemo />}
          {activeTab === "avalanche" && <AvalancheDemo />}
          {activeTab === "sha256" && <Sha256Demo />}
          {activeTab === "diffie-hellman" && <DiffieHellmanDemo />}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-6 border-t border-slate-800/60 text-center text-xs text-slate-500 font-normal">
        <p>SecureDrop</p>
        <p className="mt-1 text-[11px] text-slate-600">© 2026 SecureDrop</p>
      </footer>
    </main>
  );
}
