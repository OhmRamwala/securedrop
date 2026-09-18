"use client";

import React, { useState } from "react";
import {
  DownloadCloud,
  AlertOctagon,
  FileCheck,
  CheckCircle2,
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
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-stone-900">
          Receive a File
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Enter the 6-character transfer code to download and decrypt.
        </p>
      </div>

      {!result && (
        <div className="space-y-4">
          {/* Transfer Code Input Field */}
          <div>
            <label
              htmlFor="transfer-code-input"
              className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2"
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
                className="w-full text-center tracking-widest font-mono text-3xl font-extrabold uppercase py-3.5 px-4 rounded-xl bg-stone-50 border-2 border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                <KeyRound className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Action Button */}
          {!isProcessing && (
            <button
              onClick={handleStartReceive}
              disabled={code.length < 6}
              id="btn-receive-file"
              className={`w-full py-3 px-5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
                code.length === 6
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-[0.99] cursor-pointer"
                  : "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200"
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
        <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-800 font-medium flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span>{statusMessage || "Receiving..."}</span>
            </span>
            <span className="text-blue-600 font-bold font-mono">
              {progress ? `${progress.percent}%` : "0%"}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress ? progress.percent : 5}%` }}
            />
          </div>

          {progress && (
            <div className="flex justify-between items-center text-[11px] text-stone-500 font-mono pt-0.5">
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
        <div className="space-y-4">
          <div className="bg-emerald-50/60 border border-emerald-200/90 rounded-2xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 mb-2.5 shadow-sm">
              <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Verified &amp; Decrypted
              </span>
              <h3 className="text-base font-bold text-stone-900 pt-1">
                File Ready to Download
              </h3>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-white border border-stone-200 text-left flex items-center space-x-3 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-stone-900 truncate">
                  {result.filename}
                </p>
                <p className="text-[11px] text-stone-500 font-mono">
                  {formatFileSize(result.fileSize)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-2.5">
              <button
                onClick={handleDownloadFile}
                id="btn-download-file"
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center space-x-1.5"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>Download File</span>
              </button>
              <button
                onClick={handleReset}
                className="p-3 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors flex items-center justify-center"
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
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5">
          <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">
            <p className="font-semibold">Decryption Error</p>
            <p className="mt-0.5 text-stone-700">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
