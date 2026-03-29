import type { RiskLevel, Severity, AuditResult } from "./auditEngine";

export function riskLevelColor(level: RiskLevel): string {
  switch (level) {
    case "SAFE":
      return "text-green-600 dark:text-green-400";
    case "CAUTION":
      return "text-amber-600 dark:text-amber-400";
    case "SUSPICIOUS":
      return "text-orange-600 dark:text-orange-400";
    case "DANGEROUS":
      return "text-red-700 dark:text-red-400";
  }
}

export function riskLevelBg(level: RiskLevel): string {
  switch (level) {
    case "SAFE":
      return "bg-green-600";
    case "CAUTION":
      return "bg-amber-600";
    case "SUSPICIOUS":
      return "bg-orange-600";
    case "DANGEROUS":
      return "bg-red-700";
  }
}

export function riskLevelBgLight(level: RiskLevel): string {
  switch (level) {
    case "SAFE":
      return "bg-green-100 dark:bg-green-900/30";
    case "CAUTION":
      return "bg-amber-100 dark:bg-amber-900/30";
    case "SUSPICIOUS":
      return "bg-orange-100 dark:bg-orange-900/30";
    case "DANGEROUS":
      return "bg-red-100 dark:bg-red-900/30";
  }
}

export function severityColor(severity: Severity): string {
  switch (severity) {
    case "critical":
      return "text-red-700 dark:text-red-400";
    case "warning":
      return "text-amber-600 dark:text-amber-400";
    case "info":
      return "text-blue-600 dark:text-blue-400";
  }
}

export function severityBadgeBg(severity: Severity): string {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    case "warning":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    case "info":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
  }
}

export function riskLevelPercent(level: RiskLevel): number {
  switch (level) {
    case "SAFE":
      return 0;
    case "CAUTION":
      return 33;
    case "SUSPICIOUS":
      return 66;
    case "DANGEROUS":
      return 100;
  }
}

export function convertGitHubUrl(url: string): string {
  // Convert github.com blob URLs to raw.githubusercontent.com
  const githubBlobPattern =
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/;
  const match = url.match(githubBlobPattern);
  if (match) {
    return `https://raw.githubusercontent.com/${match[1]}/${match[2]}/${match[3]}`;
  }

  // Already a raw URL
  if (url.includes("raw.githubusercontent.com")) {
    return url;
  }

  // Try converting github.com to raw (for tree URLs or other formats)
  const githubPattern = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/(.+)$/;
  const githubMatch = url.match(githubPattern);
  if (githubMatch) {
    const path = githubMatch[3].replace(/^tree\//, "");
    return `https://raw.githubusercontent.com/${githubMatch[1]}/${githubMatch[2]}/${path}`;
  }

  return url;
}

export function formatResultsForClipboard(result: AuditResult): string {
  let text = `Skill Audit Results\n`;
  text += `${"=".repeat(40)}\n\n`;
  text += `Risk Level: ${result.riskLevel}\n`;
  text += `Total Findings: ${result.totalFindings}\n`;
  text += `Safe to Use: ${result.safeToUse ? "Yes" : "No"}\n`;
  text += `Summary: ${result.summary}\n\n`;

  if (result.findings.length > 0) {
    text += `Findings\n${"-".repeat(40)}\n\n`;
    for (const finding of result.findings) {
      text += `[${finding.severity.toUpperCase()}] ${finding.category}\n`;
      text += `  Found: ${finding.found}\n`;
      text += `  Lines: ${finding.lines.join(", ")}\n`;
      text += `  ${finding.description}\n\n`;
    }
  }

  return text;
}

export function validateGitHubUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "github.com" ||
      parsed.hostname === "raw.githubusercontent.com"
    );
  } catch {
    return false;
  }
}
