"use client";

import React, { useState } from "react";
import { Activity, Terminal, ArrowDown, ShieldCheck, Copy, Check, ExternalLink, Network, Lock } from "lucide-react";

export function WiresharkDemo() {
  const [copiedFilter, setCopiedFilter] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFilter(id);
    setTimeout(() => setCopiedFilter(null), 2000);
  };

  const steps = [
    {
      num: "01",
      title: "Launch Wireshark GUI",
      desc: "Open your local Wireshark desktop application. Double-click your active network adapter (typically Wi-Fi or Ethernet) to start packet capturing.",
    },
    {
      num: "02",
      title: "Apply Display Filter in Wireshark",
      desc: "In the filter bar at the top of Wireshark, enter the filter below to isolate HTTPS/TLS and S3 multipart traffic:",
      filter: "tcp.port == 443 and (http2 or tls)",
      filterId: "f1",
    },
    {
      num: "03",
      title: "Initiate SecureDrop Upload",
      desc: "Open a new tab to SecureDrop (/) and upload a file (e.g., 5 MB - 50 MB test archive or ISO). Observe the animated progress bar as chunks are encrypted and uploaded.",
    },
    {
      num: "04",
      title: "Inspect Encrypted HTTP PUT Stream",
      desc: "In Wireshark, look for HTTP/2 PUT requests to *.s3.ap-south-1.amazonaws.com. Right-click any packet and select Follow ➔ TCP Stream or Follow ➔ HTTP/2 Stream.",
    },
    {
      num: "05",
      title: "Verify Zero-Knowledge Plaintext Leakage",
      desc: "Observe that the payload body consists of opaque, high-entropy AES-GCM ciphertext blocks. The file header, magic bytes (e.g. %PDF, PK..), and content are completely unrecognizable.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Overview */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Live Wireshark Demonstration & Network Traffic Verification
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          This section provides the live protocol inspection procedure for your CIPAT viva. 
          Using your installed <strong>Wireshark GUI</strong>, you can empirically prove to evaluators that SecureDrop performs 
          <strong> client-side zero-knowledge encryption</strong>: files are encrypted in Web Crypto memory before any packet touches the network card.
        </p>
      </div>

      {/* Conceptual Flow Diagram */}
      <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900/90 border border-cyan-500/30 shadow-xl">
        <div className="text-xs font-mono text-cyan-400 uppercase font-semibold text-center mb-4">
          Data Path: Browser Memory to AWS S3 Private Storage
        </div>

        <div className="flex flex-col items-center space-y-3 max-w-lg mx-auto">
          {/* Step 1 */}
          <div className="w-full p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold">
                1
              </div>
              <div>
                <div className="font-bold text-xs text-slate-100">Original File Selected</div>
                <div className="text-[11px] text-slate-400">Resides strictly in browser RAM via File.slice()</div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Plaintext In Memory
            </span>
          </div>

          <ArrowDown className="w-4 h-4 text-cyan-400 animate-pulse" />

          {/* Step 2 */}
          <div className="w-full p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/50 flex items-center justify-between shadow-lg shadow-cyan-950/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold">
                2
              </div>
              <div>
                <div className="font-bold text-xs text-cyan-300">AES-256-GCM in Browser Web Worker</div>
                <div className="text-[11px] text-slate-300">Web Crypto API encrypts 8 MB chunks with unique IVs</div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Zero-Knowledge
            </span>
          </div>

          <ArrowDown className="w-4 h-4 text-cyan-400 animate-pulse" />

          {/* Step 3 */}
          <div className="w-full p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">
                3
              </div>
              <div>
                <div className="font-bold text-xs text-slate-100">High-Entropy Encrypted Chunks</div>
                <div className="text-[11px] text-slate-400">Indistinguishable from true random noise</div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Ciphertext
            </span>
          </div>

          <ArrowDown className="w-4 h-4 text-cyan-400 animate-pulse" />

          {/* Step 4 */}
          <div className="w-full p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold">
                4
              </div>
              <div>
                <div className="font-bold text-xs text-slate-100">HTTPS / TLS 1.3 Transport</div>
                <div className="text-[11px] text-slate-400">Encrypted transmission over wire (Double Encryption)</div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Wireshark Capture Layer
            </span>
          </div>

          <ArrowDown className="w-4 h-4 text-cyan-400 animate-pulse" />

          {/* Step 5 */}
          <div className="w-full p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">
                5
              </div>
              <div>
                <div className="font-bold text-xs text-emerald-300">AWS S3 Private Bucket</div>
                <div className="text-[11px] text-slate-300">Direct multipart upload via presigned URL; AWS never sees plaintext</div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Encrypted at Rest
            </span>
          </div>
        </div>
      </div>

      {/* Step-by-step Viva Guide */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono text-slate-400 uppercase font-semibold">
          Live Viva Demonstration Steps
        </h4>
        <div className="space-y-3">
          {steps.map((s) => (
            <div
              key={s.num}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/50 border border-cyan-500/30 px-2 py-1 rounded">
                  {s.num}
                </span>
                <div>
                  <div className="font-semibold text-xs text-slate-200">{s.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{s.desc}</div>
                </div>
              </div>

              {s.filter && (
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <code className="text-[11px] font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800 text-cyan-300">
                    {s.filter}
                  </code>
                  <button
                    onClick={() => copyToClipboard(s.filter!, s.filterId!)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Copy filter"
                  >
                    {copiedFilter === s.filterId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Alternate Filters */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
        <div className="text-xs font-mono text-slate-400 uppercase font-semibold">
          Additional Useful Wireshark Filters
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">tls.handshake.type == 1</span>
            <button
              onClick={() => copyToClipboard("tls.handshake.type == 1", "alt1")}
              className="text-cyan-400 hover:text-cyan-300 text-[10px]"
            >
              {copiedFilter === "alt1" ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">http2.streamid and http2.data</span>
            <button
              onClick={() => copyToClipboard("http2.streamid and http2.data", "alt2")}
              className="text-cyan-400 hover:text-cyan-300 text-[10px]"
            >
              {copiedFilter === "alt2" ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      {/* Why It Matters */}
      <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
          Why It Matters (Defense-in-Depth)
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          Standard web applications rely only on TLS in transit (transport layer encryption). 
          If a malicious proxy, rogue certificate authority, or enterprise TLS inspector inspects the stream, they can reconstruct files in plaintext. 
          In SecureDrop, <strong>application-layer AES-256-GCM encryption occurs prior to transmission</strong>. 
          Even if TLS is stripped or terminated, the packet capture captures only undecipherable AES-GCM ciphertext chunks.
        </p>
      </div>
    </div>
  );
}
