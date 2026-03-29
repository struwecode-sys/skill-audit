"use client";

import { useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import type { AuditResult } from "@/lib/auditEngine";
import { riskLevelColor, riskLevelBg, formatResultsAsJSON, formatResultsAsMarkdown } from "@/lib/utils";
import ResultsDisplay from "./ResultsDisplay";

interface BatchResult {
  filename: string;
  result: AuditResult;
}

interface BatchResultsProps {
  results: BatchResult[];
}

export default function BatchResults({ results }: BatchResultsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const totalFindings = results.reduce((sum, r) => sum + r.result.totalFindings, 0);
  const dangerousCount = results.filter((r) => r.result.riskLevel === "DANGEROUS").length;
  const suspiciousCount = results.filter((r) => r.result.riskLevel === "SUSPICIOUS").length;
  const safeCount = results.filter((r) => r.result.riskLevel === "SAFE").length;

  const worstLevel = dangerousCount > 0 ? "DANGEROUS" : suspiciousCount > 0 ? "SUSPICIOUS" : totalFindings > 0 ? "CAUTION" : "SAFE";

  function downloadAllJSON() {
    const combined = {
      tool: "Skill Audit",
      url: "https://skill-audit.vercel.app",
      timestamp: new Date().toISOString(),
      totalFiles: results.length,
      results: results.map((r) => ({
        file: r.filename,
        ...r.result,
      })),
    };
    const blob = new Blob([JSON.stringify(combined, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "skill-audit-batch-report.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Batch Scan Results</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {results.length} files scanned &middot; {totalFindings} total findings
            </p>
          </div>
          <button
            onClick={downloadAllJSON}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export All (JSON)
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-xl font-bold">{results.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Files</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{safeCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Safe</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{suspiciousCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Suspicious</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-xl font-bold text-red-600 dark:text-red-400">{dangerousCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Dangerous</p>
          </div>
        </div>
      </div>

      {/* Individual results */}
      <div className="space-y-2">
        {results.map((item, i) => (
          <div
            key={item.filename}
            className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <button
              onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <div className={`w-2 h-2 rounded-full shrink-0 ${riskLevelBg(item.result.riskLevel)}`} />
              <span className="flex-1 text-sm font-medium font-mono truncate">
                {item.filename}
              </span>
              <span className={`text-xs font-bold ${riskLevelColor(item.result.riskLevel)}`}>
                {item.result.riskLevel}
              </span>
              <span className="text-xs text-gray-400">
                {item.result.totalFindings} finding{item.result.totalFindings !== 1 ? "s" : ""}
              </span>
              <ChevronDown
                className={`shrink-0 w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedIndex === i ? "rotate-180" : ""}`}
              />
            </button>
            {expandedIndex === i && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-4">
                <ResultsDisplay result={item.result} filename={item.filename} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
