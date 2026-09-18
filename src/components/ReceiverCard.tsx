"use client";

import React, { useState } from "react";
import {
  DownloadCloud,
  CheckCircle2,
  AlertOctagon,
  FileCheck,
  ShieldCheck,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import { downloadAndDecryptFile, DownloadProgress, DownloadResult } from "@/lib/s3/download";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function ReceiverCard() {
  const [code, setCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [result, setResult] = useState<DownloadResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Uppercase and alphanumeric only, max 6 chars
    const clean = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setCode(clean);
    setErrorMessage(null);
  };

  const handleStartReceive = async () => {
    if (code.length < 6) {
      setErrorMessage("Please enter a valid 6-character transfer code.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setResult(null);
    setProgress(null);

    try {
      const downloadResult = await downloadAndDecryptFile(
        code,
        (p) => setProgress(p),
        (msg) => setStatusMessage(msg)
      );

      setResult(downloadResult);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to download and decrypt file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadFile = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.blobUrl;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setCode("");
    setResult(null);
    setProgress(null);
    setStatusMessage("");
    setErrorMessage(null);
  };

  return (
    <div className="bg-[#0f141f] rounded-xl p-6 sm:p-7 border border-slate-800/80">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-100">
          Receive a File
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Enter the 6-character code to retrieve and decrypt the file in your browser.
        </p>
      </div>

      {!result && (
        <div className="space-y-4">
          {/* Transfer Code Input Field */}
          <div>
            <label
              htmlFor="transfer-code-input"
              className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2"
            >
              Transfer Code
            </label>
            <div className="relative">
              <input
                id="transfer-code-input"
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="e.g. 8F42K9"
                disabled={isProcessing}
                maxLength={6}
                className="w-full text-center tracking-widest font-mono text-2xl font-bold uppercase py-3 px-4 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                <KeyRound className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Action Button */}
          {!isProcessing && (
            <button
              onClick={handleStartReceive}
              disabled={code.length < 6}
              id="btn-receive-file"
              className={`w-full py-2.5 px-4 rounded-lg font-medium text-xs transition-colors flex items-center justify-center space-x-2 ${
                code.length === 6
                  ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                  : "bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-800"
              }`}
            >
              <DownloadCloud className="w-4 h-4" />
              <span>Receive File</span>
            </button>
          )}
        </div>
      )}

      {/* Progress & Status Messages */}
      {isProcessing && (
        <div className="mt-5 space-y-3 bg-slate-900/70 p-4 rounded-lg border border-slate-800">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span>{statusMessage || "Receiving..."}</span>
            </span>
            <span className="text-slate-400 font-mono">
              {progress ? `${progress.percent}%` : "0%"}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress ? progress.percent : 5}%` }}
            />
          </div>

          {progress && (
            <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono pt-0.5">
              <span>
                Part {progress.currentChunk} of {progress.totalChunks}
              </span>
              <span>
                {formatFileSize(progress.bytesDownloaded)} / {formatFileSize(progress.totalBytes)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Recovered File Result */}
      {result && (
        <div className="mt-4 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-5 text-center">
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 mb-2.5">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Verified
              </span>
              <h3 className="text-base font-semibold text-slate-100 pt-1">
                File Decrypted Successfully
              </h3>
            </div>

            <div className="mt-3.5 p-3 rounded-lg bg-slate-950 border border-slate-800 text-left flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/80 flex items-center justify-center shrink-0">
                <FileCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-200 truncate">
                  {result.filename}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {formatFileSize(result.fileSize)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-2.5">
              <button
                onClick={handleDownloadFile}
                id="btn-download-file"
                className="flex-1 py-2 px-4 rounded-lg font-medium text-xs bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center justify-center space-x-1.5"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>Download File</span>
              </button>
              <button
                onClick={handleReset}
                className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-center"
                title="Receive another"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-3 rounded-lg bg-red-950/20 border border-red-500/30 text-red-400 text-xs flex items-start space-x-2.5">
          <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Decryption Failed</p>
            <p className="mt-0.5 text-slate-300">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
