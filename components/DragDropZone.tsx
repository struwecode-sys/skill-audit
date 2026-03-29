"use client";

import { useState, useRef } from "react";
import { CloudUpload } from "lucide-react";

interface DragDropZoneProps {
  onFileContent: (content: string, filename: string) => void;
  onBatchFiles?: (files: Array<{ name: string; content: string }>) => void;
}

const MAX_FILE_SIZE = 500_000; // 500KB

export default function DragDropZone({ onFileContent, onBatchFiles }: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function processFile(file: File) {
    setError(null);

    if (!file.name.endsWith(".md")) {
      setError("Please upload a Markdown (.md) file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File is too large (max 500KB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        onFileContent(content, file.name);
      }
    };
    reader.onerror = () => {
      setError("Failed to read file. Please try again.");
    };
    reader.readAsText(file);
  }

  function processMultipleFiles(fileList: FileList) {
    const mdFiles = Array.from(fileList).filter((f) => f.name.endsWith(".md"));
    if (mdFiles.length === 0) {
      setError("No Markdown (.md) files found.");
      return;
    }
    if (mdFiles.length === 1) {
      processFile(mdFiles[0]);
      return;
    }
    if (!onBatchFiles) {
      processFile(mdFiles[0]);
      return;
    }

    const totalSize = mdFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_FILE_SIZE * 10) {
      setError("Total file size is too large (max 5MB for batch).");
      return;
    }

    setError(null);
    const results: Array<{ name: string; content: string }> = [];
    let loaded = 0;
    for (const file of mdFiles) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result;
        if (typeof content === "string") {
          results.push({ name: file.name, content });
        }
        loaded++;
        if (loaded === mdFiles.length) {
          onBatchFiles(results);
        }
      };
      reader.readAsText(file);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 1) {
      processMultipleFiles(e.dataTransfer.files);
    } else {
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 1) {
      processMultipleFiles(e.target.files);
    } else {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    }
    e.target.value = "";
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Or upload a file</label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
        aria-label="Upload a Markdown file by dragging and dropping or clicking"
        className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors duration-200 ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
            : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
        }`}
      >
        <CloudUpload className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Drop <span className="font-medium">.md</span> file(s) here or{" "}
          <span className="text-blue-600 dark:text-blue-400 font-medium">
            click to browse
          </span>
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md"
          multiple
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
