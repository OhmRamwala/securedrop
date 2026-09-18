"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SenderCard } from "@/components/SenderCard";
import { ReceiverCard } from "@/components/ReceiverCard";
import { Upload, Download, ArrowRight } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"send" | "receive">("send");

  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-between py-10 sm:py-14 px-4 sm:px-6 max-w-5xl mx-auto">
      <div>
        {/* Header Section */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-2">
            SecureDrop
          </h1>

          <p className="text-sm sm:text-base text-slate-400">
            Secure file sharing.
          </p>

          <div className="mt-2.5">
            <Link
              href="/demo"
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition group"
            >
              <span>Security Demo</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Tab Selection Switcher */}
        <div className="flex justify-center mb-7">
          <div className="inline-flex p-1 rounded-lg bg-slate-900 border border-slate-800">
            <button
              id="tab-send"
              onClick={() => setActiveTab("send")}
              className={`flex items-center space-x-2 px-5 py-2 rounded-md font-medium text-xs transition-colors ${
                activeTab === "send"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Send a File</span>
            </button>

            <button
              id="tab-receive"
              onClick={() => setActiveTab("receive")}
              className={`flex items-center space-x-2 px-5 py-2 rounded-md font-medium text-xs transition-colors ${
                activeTab === "receive"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Receive a File</span>
            </button>
          </div>
        </div>

        {/* Main Action View */}
        <div className="max-w-lg mx-auto">
          {activeTab === "send" ? <SenderCard /> : <ReceiverCard />}
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
