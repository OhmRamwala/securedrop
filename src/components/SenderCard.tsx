"use client";

import React, { useState, useRef, ChangeEvent, DragEvent } from "react";
import {
  UploadCloud,
  FileIcon,
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  HardDrive,
} from "lucide-react";
import { uploadFileSecurely, UploadProgress } from "@/lib/s3/upload";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function SenderCard() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferCode, setTransferCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    // 500 MB check
    const MAX_SIZE = 500 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      setErrorMessage("File exceeds the maximum limit of 500 MB.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setErrorMessage(null);
    setTransferCode(null);
    setProgress(null);
    setStatusMessage("");
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleStartUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setTransferCode(null);

    try {
      const result = await uploadFileSecurely(
        file,
        (p) => setProgress(p),
        (msg) => setStatusMessage(msg)
      );

      setTransferCode(result.code);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Upload and encryption failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyCode = () => {
    if (transferCode) {
      navigator.clipboard.writeText(transferCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTransferCode(null);
    setProgress(null);
    setStatusMessage("");
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <span>Send a File</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Files are encrypted locally with AES-256-GCM before direct streaming to S3.
        </p>
      </div>

      {/* File Dropzone */}
      {!transferCode && (
        <>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-cyan-400 bg-cyan-950/20"
                : file
                ? "border-emerald-500/40 bg-emerald-950/10"
                : "border-slate-800 hover:border-slate-700 bg-slate-900/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
              disabled={isProcessing}
            />

            {file ? (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3">
                  <FileIcon className="w-7 h-7" />
                </div>
                <p className="text-slate-100 font-semibold text-base max-w-sm truncate">
                  {file.name}
                </p>
                <p className="text-sm text-emerald-400 font-mono mt-1">
                  {formatFileSize(file.size)}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Click or drop another file to change
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-cyan-400 border border-slate-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <p className="text-slate-200 font-medium text-base">
                  Drag and drop your file here, or{" "}
                  <span className="text-cyan-400 underline underline-offset-2">
                    browse
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Supports any file type up to 500 MB (Direct S3 Presigned Upload)
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          {file && !isProcessing && (
            <div className="mt-6 flex items-center space-x-3">
              <button
                onClick={handleStartUpload}
                id="btn-encrypt-and-send"
                className="flex-1 py-3 px-5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 hover:opacity-95 shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.99] flex items-center justify-center space-x-2"
              >
                <span>Encrypt &amp; Send</span>
              </button>
              <button
                onClick={handleReset}
                className="p-3 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
                title="Cancel"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Progress & Live Status Messages */}
      {isProcessing && (
        <div className="mt-6 space-y-4 bg-slate-900/60 p-5 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-sm">
            <span className="text-cyan-400 font-medium flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span>{statusMessage || "Processing..."}</span>
            </span>
            <span className="text-slate-400 font-mono text-xs">
              {progress ? `${progress.percent}%` : "0%"}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden relative">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress ? progress.percent : 5}%` }}
            />
          </div>

          {progress && (
            <div className="flex justify-between items-center text-xs text-slate-400 font-mono pt-1">
              <span>
                Chunk {progress.currentChunk} of {progress.totalChunks}
              </span>
              <span>
                {formatFileSize(progress.bytesUploaded)} / {formatFileSize(progress.totalBytes)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Transfer Code Display */}
      {transferCode && (
        <div className="mt-4 space-y-5">
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">
              Transfer Ready
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Ciphertext is securely uploaded to S3. Share this 6-character transfer code with the receiver:
            </p>

            {/* Transfer Code Box */}
            <div className="mt-4 inline-flex items-center space-x-3 bg-slate-900 border border-cyan-500/40 px-6 py-3 rounded-xl shadow-inner glow-cyan">
              <span
                id="transfer-code-display"
                className="font-mono text-3xl sm:text-4xl font-extrabold tracking-widest text-cyan-300"
              >
                {transferCode}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-center space-x-3">
              <button
                onClick={handleCopyCode}
                id="btn-copy-code"
                className="py-2.5 px-5 rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-2 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-cyan-400" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-1">
            <div className="flex items-center space-x-2 text-slate-300 font-medium">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Zero-Knowledge Security Assurance</span>
            </div>
            <p className="pl-6">
              Neither AWS S3 nor Vercel servers have access to the encryption key or plaintext file. Decryption will occur purely within the receiver&apos;s browser.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 text-xs font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Send Another File</span>
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-400 text-xs flex items-start space-x-3">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Error occurred</p>
            <p className="mt-0.5 text-slate-300">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
