"use client";

import { useState } from "react";
import { Check, Copy, ShieldCheck, Download } from "lucide-react";
import type { AuditResult } from "@/lib/auditEngine";
import { riskLevelColor, riskLevelBgLight, formatResultsForClipboard, formatResultsAsJSON, formatResultsAsMarkdown } from "@/lib/utils";
import RiskMeter from "./RiskMeter";
import FindingCard from "./FindingCard";

interface ResultsDisplayProps {
  result: AuditResult;
  filename?: string;
}

export default function ResultsDisplay({ result, filename }: ResultsDisplayProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatResultsForClipboard(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = formatResultsForClipboard(result);
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function downloadFile(content: string, name: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className={`rounded-xl p-6 ${riskLevelBgLight(result.riskLevel)}`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            {filename && (
              <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                {filename}
              </p>
            )}
            <h2 className={`text-2xl font-bold ${riskLevelColor(result.riskLevel)}`}>
              {result.riskLevel}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {result.summary}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
              aria-label="Copy results to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={() => downloadFile(formatResultsAsJSON(result, filename), "skill-audit-report.json", "application/json")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
              aria-label="Download JSON report"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
            <button
              onClick={() => downloadFile(formatResultsAsMarkdown(result, filename), "skill-audit-report.md", "text/markdown")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
              aria-label="Download Markdown report"
            >
              <Download className="w-4 h-4" />
              MD
            </button>
          </div>
        </div>
      </div>

      {/* Risk meter */}
      <RiskMeter level={result.riskLevel} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 text-center">
          <p className="text-2xl font-bold">{result.totalFindings}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Findings</p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {result.findings.filter((f) => f.severity === "critical").length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Critical</p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {result.findings.filter((f) => f.severity === "warning").length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Warnings</p>
        </div>
      </div>

      {/* Findings */}
      {result.findings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Findings
          </h3>
          <div className="space-y-2">
            {result.findings.map((finding, i) => (
              <FindingCard key={`${finding.category}-${finding.found}-${i}`} finding={finding} index={i} />
            ))}
          </div>
        </div>
      )}

      {result.findings.length === 0 && (
        <div className="text-center py-8">
          <ShieldCheck className="w-10 h-10 text-green-600 dark:text-green-400 mx-auto mb-3" />
          <p className="text-green-600 dark:text-green-400 font-medium">
            No security issues found!
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            This skill file passed all security checks.
          </p>
        </div>
      )}
    </div>
  );
}
