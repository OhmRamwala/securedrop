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
    const MAX_SIZE = 2 * 1024 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      setErrorMessage("File exceeds the maximum limit of 2 GB.");
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
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          Send a File
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Encrypted directly in your browser. Up to 2 GB.
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
            className={`border-2 border-dashed rounded-xl p-8 sm:p-9 text-center cursor-pointer transition-all duration-200 group ${
              isDragging
                ? "border-[#2563EB] bg-blue-50/80 dark:bg-blue-950/30 ring-4 ring-blue-100 dark:ring-blue-950/60"
                : file
                ? "border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40"
                : "border-[#E2E8F0] dark:border-slate-800 hover:border-[#2563EB] dark:hover:border-[#2563EB] bg-slate-50/60 dark:bg-slate-800/30 hover:bg-blue-50/20 dark:hover:bg-blue-950/20"
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
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center mb-2.5">
                  <FileIcon className="w-6 h-6 stroke-[2]" />
                </div>
                <p className="text-[#0F172A] dark:text-[#F8FAFC] font-bold text-sm max-w-xs sm:max-w-sm truncate">
                  {file.name}
                </p>
                <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                  {formatFileSize(file.size)}
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
                  Click or drag another file to replace
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105">
                  <UploadCloud className="w-6 h-6 stroke-[2]" />
                </div>
                <p className="text-[#0F172A] dark:text-[#F8FAFC] font-medium text-sm">
                  Drag and drop a file, or{" "}
                  <span className="text-[#2563EB] font-semibold underline underline-offset-2 hover:text-blue-700">
                    browse
                  </span>
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
                  Supports any file type up to 2 GB
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          {file && !isProcessing && (
            <div className="flex items-center space-x-2.5 pt-1">
              <button
                onClick={handleStartUpload}
                id="btn-encrypt-and-send"
                className="flex-1 py-3 px-5 rounded-xl font-semibold text-xs sm:text-sm bg-[#2563EB] hover:bg-blue-700 text-white shadow-sm active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
              >
                <span>Encrypt &amp; Send</span>
              </button>
              <button
                onClick={handleReset}
                className="p-3 rounded-xl border border-[#E2E8F0] dark:border-slate-800 text-slate-500 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-[#E2E8F0] dark:border-slate-800">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#0F172A] dark:text-[#F8FAFC] font-medium flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2563EB]"></span>
              </span>
              <span>{statusMessage || "Processing..."}</span>
            </span>
            <span className="text-[#2563EB] font-bold font-mono">
              {progress ? `${progress.percent}%` : "0%"}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#2563EB] h-full rounded-full transition-all duration-300"
              style={{ width: `${progress ? progress.percent : 5}%` }}
            />
          </div>

          {progress && (
            <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 font-mono pt-0.5">
              <span>
                Part {progress.currentChunk} of {progress.totalChunks}
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
        <div className="space-y-4">
          <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 mb-2.5">
              <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Transfer Ready
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              Share this 6-character code with the recipient:
            </p>

            {/* Transfer Code Box */}
            <div className="mt-4 inline-flex items-center space-x-3 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 px-6 py-2.5 rounded-xl shadow-xs">
              <span
                id="transfer-code-display"
                className="font-mono text-2xl sm:text-3xl font-extrabold tracking-widest text-[#0F172A] dark:text-[#F8FAFC]"
              >
                {transferCode}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-center space-x-2">
              <button
                onClick={handleCopyCode}
                id="btn-copy-code"
                className="py-2.5 px-4 rounded-lg font-medium text-xs bg-[#0F172A] hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-[#0F172A] flex items-center space-x-1.5 transition-colors shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-2.5 px-4 rounded-xl border border-[#E2E8F0] dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Send Another File</span>
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs flex items-start space-x-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">
            <p className="font-semibold">Upload Error</p>
            <p className="mt-0.5 text-slate-600 dark:text-slate-400">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
