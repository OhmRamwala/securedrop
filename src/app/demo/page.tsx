"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AesVs3DesDemo } from "./components/AesVs3DesDemo";
import { AvalancheDemo } from "./components/AvalancheDemo";
import { Sha256Demo } from "./components/Sha256Demo";
import { DiffieHellmanDemo } from "./components/DiffieHellmanDemo";
import { ArrowLeft } from "lucide-react";

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
    <main className="min-h-[calc(100vh-4rem)] bg-canvas py-8 sm:py-12 px-4 sm:px-6 max-w-5xl mx-auto flex flex-col justify-between transition-colors">
      <div>
        {/* Navigation & Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0F172A] dark:text-slate-400 dark:hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to SecureDrop</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            Security Demo
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Interactive demonstrations of core cryptographic primitives and attack simulations.
          </p>
        </div>

        {/* Full-width Tab Bar (Spans 100% of container width) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full p-1.5 rounded-xl bg-slate-200/70 dark:bg-slate-800/70 border border-[#E2E8F0] dark:border-slate-700/80 mb-6 shadow-inner">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all text-center flex items-center justify-center ${
                  isActive
                    ? "bg-white dark:bg-slate-900 text-[#0F172A] dark:text-[#F8FAFC] shadow-sm font-bold border border-slate-200/60 dark:border-slate-700/60"
                    : "text-slate-600 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 p-5 sm:p-7 shadow-sm transition-colors">
          {activeTab === "aes-vs-3des" && <AesVs3DesDemo />}
          {activeTab === "avalanche" && <AvalancheDemo />}
          {activeTab === "sha256" && <Sha256Demo />}
          {activeTab === "diffie-hellman" && <DiffieHellmanDemo />}
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="mt-16 pt-6 border-t border-[#E2E8F0] dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 font-normal transition-colors">
        <p className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">SecureDrop</p>
        <p className="mt-0.5">© 2026 SecureDrop</p>
      </footer>
    </main>
  );
}
