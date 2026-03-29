"use client";

import { useState } from "react";
import type { Finding } from "@/lib/auditEngine";
import { severityBadgeBg } from "@/lib/utils";

interface FindingCardProps {
  finding: Finding;
  index: number;
}

export default function FindingCard({ finding, index }: FindingCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden transition-shadow duration-200 hover:shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150"
        aria-expanded={expanded}
        aria-controls={`finding-detail-${index}`}
      >
        <span
          className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${severityBadgeBg(finding.severity)}`}
        >
          {finding.severity}
        </span>
        <span className="flex-1 text-sm font-medium truncate">
          {finding.category}
        </span>
        <svg
          className={`shrink-0 w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        id={`finding-detail-${index}`}
        className={`grid transition-all duration-200 ease-in-out ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-3 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3">
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">Found: </span>
              <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5">
                {finding.found}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {finding.description}
            </p>
            {finding.lines.length > 0 && (
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Line{finding.lines.length > 1 ? "s" : ""}:{" "}
                </span>
                <span className="font-mono text-xs">
                  {finding.lines.join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
