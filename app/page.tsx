"use client";

import { useState } from "react";
import {
  EyeOff,
  Type,
  MessageSquareCode,
  Zap,
  ExternalLink,
  Lock,
  Crosshair,
  FileCode2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import type { AuditResult } from "@/lib/auditEngine";
import { runAudit } from "@/lib/auditEngine";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuditForm from "@/components/AuditForm";
import DragDropZone from "@/components/DragDropZone";
import ResultsDisplay from "@/components/ResultsDisplay";

export default function Home() {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [filename, setFilename] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUrlSubmit(url: string) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setFilename(undefined);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "An unexpected error occurred.");
        return;
      }

      setResult(data.result);
      // Extract filename from URL
      const parts = url.split("/");
      setFilename(parts[parts.length - 1] || "SKILL.md");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleFileContent(content: string, name: string) {
    setError(null);
    setIsLoading(false);
    setFilename(name);
    // Process locally - no API call needed
    const auditResult = runAudit(content);
    setResult(auditResult);
  }

  function handleReset() {
    setResult(null);
    setFilename(undefined);
    setError(null);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Input section */}
        {!result && (
          <div className="space-y-6">
            <div className="text-center space-y-2 pb-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Audit a Claude Skill
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                Paste a URL to a SKILL.md file or drag-and-drop a local file to
                scan for security vulnerabilities.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-6">
              <AuditForm onSubmit={handleUrlSubmit} isLoading={isLoading} />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-gray-900 px-3 text-gray-400">
                    or
                  </span>
                </div>
              </div>

              <DragDropZone onFileContent={handleFileContent} />
            </div>

            {/* Error display */}
            {error && (
              <div
                className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4"
                role="alert"
              >
                <div className="flex gap-3">
                  <AlertCircle className="shrink-0 w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* What we check */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
                Security Checks
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { Icon: EyeOff, label: "Hidden CSS", desc: "display:none, visibility:hidden, opacity:0" },
                  { Icon: Type, label: "Invisible Text", desc: "White/transparent text colors" },
                  { Icon: MessageSquareCode, label: "HTML Comments", desc: "Hidden instructions in comments" },
                  { Icon: Zap, label: "JavaScript", desc: "eval, fetch, script tags" },
                  { Icon: ExternalLink, label: "External URLs", desc: "Non-GitHub domain links" },
                  { Icon: Lock, label: "Base64 Encoding", desc: "Obfuscated encoded content" },
                  { Icon: Crosshair, label: "Prompt Injection", desc: "Override/ignore instructions" },
                  { Icon: FileCode2, label: "YAML Structure", desc: "Frontmatter validation" },
                ].map((check) => (
                  <div key={check.label} className="flex items-start gap-3 text-sm">
                    <check.Icon className="w-5 h-5 shrink-0 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="font-medium">{check.label}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        {check.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results section */}
        {result && (
          <div className="space-y-4">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Scan another file
            </button>
            <ResultsDisplay result={result} filename={filename} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
