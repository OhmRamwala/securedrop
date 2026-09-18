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
    // 2 GB check
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
        <h2 className="text-lg font-bold text-stone-900">
          Send a File
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Files are encrypted locally before upload. Up to 2 GB.
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
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 group ${
              isDragging
                ? "border-blue-500 bg-blue-50 ring-4 ring-blue-100"
                : file
                ? "border-stone-300 bg-stone-50/90"
                : "border-stone-300/90 hover:border-blue-500 bg-stone-50/60 hover:bg-blue-50/20"
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
                <div className="w-13 h-13 p-3 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 shadow-sm">
                  <FileIcon className="w-7 h-7 stroke-[2]" />
                </div>
                <p className="text-stone-900 font-bold text-sm max-w-xs sm:max-w-sm truncate">
                  {file.name}
                </p>
                <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-200/80 text-stone-700 font-mono">
                  {formatFileSize(file.size)}
                </div>
                <p className="text-[11px] text-stone-400 mt-3 font-medium">
                  Click or drag another file to replace
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-13 h-13 p-3 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-7 h-7 stroke-[2]" />
                </div>
                <p className="text-stone-800 font-medium text-sm">
                  Drag and drop a file, or{" "}
                  <span className="text-blue-600 font-semibold underline underline-offset-2 hover:text-blue-700">
                    browse
                  </span>
                </p>
                <p className="text-xs text-stone-400 mt-1.5 font-medium">
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
                className="flex-1 py-3 px-5 rounded-xl font-semibold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
              >
                <span>Encrypt &amp; Send</span>
              </button>
              <button
                onClick={handleReset}
                className="p-3 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
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
        <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-800 font-medium flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span>{statusMessage || "Processing..."}</span>
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
                {formatFileSize(progress.bytesUploaded)} / {formatFileSize(progress.totalBytes)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Transfer Code Display */}
      {transferCode && (
        <div className="space-y-4">
          <div className="bg-emerald-50/60 border border-emerald-200/90 rounded-2xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 mb-2.5 shadow-sm">
              <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              Transfer Ready
            </h3>
            <p className="text-xs text-stone-600 mt-1 max-w-xs mx-auto">
              File encrypted and stored. Share this 6-character code with the recipient:
            </p>

            {/* Transfer Code Box */}
            <div className="mt-4 inline-flex items-center space-x-3 bg-white border-2 border-stone-200 px-6 py-2.5 rounded-xl shadow-sm">
              <span
                id="transfer-code-display"
                className="font-mono text-2xl sm:text-3xl font-extrabold tracking-widest text-stone-900"
              >
                {transferCode}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-center space-x-2">
              <button
                onClick={handleCopyCode}
                id="btn-copy-code"
                className="py-2.5 px-4 rounded-xl font-semibold text-xs bg-stone-900 hover:bg-black text-white flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-300" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-2.5 px-4 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 text-xs font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Send Another File</span>
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">
            <p className="font-semibold">Upload Error</p>
            <p className="mt-0.5 text-stone-700">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
