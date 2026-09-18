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
    <div className="bg-[#0f141f] rounded-xl p-6 sm:p-7 border border-slate-800/80">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-100">
          Send a File
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Files are encrypted locally before uploading directly to S3. Up to 2 GB.
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
            className={`border border-dashed rounded-lg p-7 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-950/20"
                : file
                ? "border-slate-600 bg-slate-900/40"
                : "border-slate-700/80 hover:border-slate-600 bg-slate-900/20"
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
                <div className="w-11 h-11 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center mb-2.5">
                  <FileIcon className="w-5 h-5" />
                </div>
                <p className="text-slate-100 font-medium text-sm max-w-sm truncate">
                  {file.name}
                </p>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  {formatFileSize(file.size)}
                </p>
                <p className="text-[11px] text-slate-500 mt-2">
                  Click or drop another file to change
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-11 h-11 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/80 flex items-center justify-center mb-2.5">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-slate-200 font-normal text-sm">
                  Drag and drop a file, or{" "}
                  <span className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                    browse
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports any file type up to 2 GB
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          {file && !isProcessing && (
            <div className="mt-5 flex items-center space-x-2.5">
              <button
                onClick={handleStartUpload}
                id="btn-encrypt-and-send"
                className="flex-1 py-2.5 px-4 rounded-lg font-medium text-xs bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center justify-center space-x-2"
              >
                <span>Encrypt &amp; Send</span>
              </button>
              <button
                onClick={handleReset}
                className="p-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
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
        <div className="mt-5 space-y-3 bg-slate-900/70 p-4 rounded-lg border border-slate-800">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span>{statusMessage || "Processing..."}</span>
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
                {formatFileSize(progress.bytesUploaded)} / {formatFileSize(progress.totalBytes)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Transfer Code Display */}
      {transferCode && (
        <div className="mt-4 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-5 text-center">
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 mb-2.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-100">
              Transfer Ready
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              File encrypted and stored. Share this 6-character code with the recipient:
            </p>

            {/* Transfer Code Box */}
            <div className="mt-3.5 inline-flex items-center space-x-3 bg-slate-950 border border-slate-700 px-6 py-2.5 rounded-lg">
              <span
                id="transfer-code-display"
                className="font-mono text-2xl sm:text-3xl font-bold tracking-widest text-slate-100"
              >
                {transferCode}
              </span>
            </div>

            <div className="mt-3.5 flex items-center justify-center space-x-2">
              <button
                onClick={handleCopyCode}
                id="btn-copy-code"
                className="py-2 px-4 rounded-lg font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-2 px-4 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 text-xs font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Send Another File</span>
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-3 rounded-lg bg-red-950/20 border border-red-500/30 text-red-400 text-xs flex items-start space-x-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Upload Error</p>
            <p className="mt-0.5 text-slate-300">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
