export type RiskLevel = "SAFE" | "CAUTION" | "SUSPICIOUS" | "DANGEROUS";

export type Severity = "critical" | "warning" | "info";

export interface Finding {
  category: string;
  found: string;
  severity: Severity;
  lines: number[];
  description: string;
}

export interface AuditResult {
  riskLevel: RiskLevel;
  findings: Finding[];
  safeToUse: boolean;
  totalFindings: number;
  summary: string;
}

function getLines(content: string, pattern: RegExp): number[] {
  const lines: number[] = [];
  const contentLines = content.split("\n");
  for (let i = 0; i < contentLines.length; i++) {
    if (pattern.test(contentLines[i])) {
      lines.push(i + 1);
    }
  }
  return lines;
}

function checkHiddenCSS(content: string): Finding[] {
  const findings: Finding[] = [];
  const patterns: Array<{ regex: RegExp; label: string }> = [
    { regex: /display\s*:\s*none/gi, label: "display: none" },
    { regex: /visibility\s*:\s*hidden/gi, label: "visibility: hidden" },
    { regex: /opacity\s*:\s*0[^.]|opacity\s*:\s*0$/gm, label: "opacity: 0" },
    { regex: /font-size\s*:\s*0/gi, label: "font-size: 0" },
    { regex: /height\s*:\s*0[^.]|width\s*:\s*0[^.]/gi, label: "zero dimensions" },
    { regex: /position\s*:\s*absolute.*left\s*:\s*-\d{4,}/gi, label: "off-screen positioning" },
    { regex: /overflow\s*:\s*hidden/gi, label: "overflow: hidden" },
  ];

  for (const { regex, label } of patterns) {
    const lines = getLines(content, regex);
    if (lines.length > 0) {
      findings.push({
        category: "Hidden CSS",
        found: label,
        severity: "critical",
        lines,
        description: `Found "${label}" which can hide malicious content from visual inspection.`,
      });
    }
  }
  return findings;
}

function checkWhiteText(content: string): Finding[] {
  const findings: Finding[] = [];
  const patterns: Array<{ regex: RegExp; label: string }> = [
    { regex: /color\s*:\s*white/gi, label: "color: white" },
    { regex: /color\s*:\s*#fff(fff)?/gi, label: "color: #fff/#ffffff" },
    { regex: /color\s*:\s*transparent/gi, label: "color: transparent" },
    { regex: /color\s*:\s*rgba?\(\s*255\s*,\s*255\s*,\s*255/gi, label: "color: rgb(255,255,255)" },
    { regex: /color\s*:\s*rgba?\([^)]*,\s*0\s*\)/gi, label: "fully transparent color" },
  ];

  for (const { regex, label } of patterns) {
    const lines = getLines(content, regex);
    if (lines.length > 0) {
      findings.push({
        category: "White/Transparent Text",
        found: label,
        severity: "critical",
        lines,
        description: `Found "${label}" which can make text invisible against a white background.`,
      });
    }
  }
  return findings;
}

function checkHTMLComments(content: string): Finding[] {
  const findings: Finding[] = [];
  const commentPattern = /<!--[\s\S]*?-->/g;
  const contentLines = content.split("\n");
  const commentLines: number[] = [];
  const commentContents: string[] = [];

  for (let i = 0; i < contentLines.length; i++) {
    if (/<!--/.test(contentLines[i])) {
      commentLines.push(i + 1);
    }
  }

  let match;
  while ((match = commentPattern.exec(content)) !== null) {
    const inner = match[0].replace(/<!--|-->/g, "").trim();
    if (inner.length > 0) {
      commentContents.push(inner.length > 80 ? inner.substring(0, 80) + "..." : inner);
    }
  }

  if (commentLines.length > 0) {
    // Check if comments contain suspicious instructions
    const suspiciousComment = /<!--[\s\S]*?(ignore|override|system|instruction|prompt|pretend|roleplay|act as)[\s\S]*?-->/gi;
    const isSuspicious = suspiciousComment.test(content);

    findings.push({
      category: "HTML Comments",
      found: `${commentLines.length} comment(s) found${commentContents.length > 0 ? `: ${commentContents[0]}` : ""}`,
      severity: isSuspicious ? "critical" : "warning",
      lines: commentLines,
      description: isSuspicious
        ? "HTML comments contain suspicious instructions that may attempt prompt injection."
        : "HTML comments can contain hidden instructions not visible when rendered.",
    });
  }
  return findings;
}

function checkSuspiciousJS(content: string): Finding[] {
  const findings: Finding[] = [];
  const patterns: Array<{ regex: RegExp; label: string; severity: Severity }> = [
    { regex: /\beval\s*\(/gi, label: "eval()", severity: "critical" },
    { regex: /\bfetch\s*\(/gi, label: "fetch()", severity: "critical" },
    { regex: /XMLHttpRequest/gi, label: "XMLHttpRequest", severity: "critical" },
    { regex: /\bexec\s*\(/gi, label: "exec()", severity: "critical" },
    { regex: /document\.write/gi, label: "document.write", severity: "critical" },
    { regex: /\.innerHTML\s*=/gi, label: "innerHTML assignment", severity: "warning" },
    { regex: /new\s+Function\s*\(/gi, label: "new Function()", severity: "critical" },
    { regex: /setTimeout\s*\(\s*["'`]/gi, label: "setTimeout with string", severity: "warning" },
    { regex: /setInterval\s*\(\s*["'`]/gi, label: "setInterval with string", severity: "warning" },
    { regex: /<script[\s>]/gi, label: "<script> tag", severity: "critical" },
    { regex: /\bon\w+\s*=\s*["']/gi, label: "inline event handler", severity: "warning" },
    { regex: /javascript\s*:/gi, label: "javascript: URI", severity: "critical" },
  ];

  for (const { regex, label, severity } of patterns) {
    const lines = getLines(content, regex);
    if (lines.length > 0) {
      findings.push({
        category: "Suspicious JavaScript",
        found: label,
        severity,
        lines,
        description: `Found "${label}" which could execute arbitrary code or exfiltrate data.`,
      });
    }
  }
  return findings;
}

function checkExternalURLs(content: string): Finding[] {
  const findings: Finding[] = [];
  const urlPattern = /https?:\/\/[^\s"'<>\]()]+/gi;
  const contentLines = content.split("\n");
  const externalLines: number[] = [];
  const externalUrls: string[] = [];
  const allowedDomains = [
    "github.com",
    "raw.githubusercontent.com",
    "docs.github.com",
  ];

  for (let i = 0; i < contentLines.length; i++) {
    let match;
    const linePattern = /https?:\/\/[^\s"'<>\]()]+/gi;
    while ((match = linePattern.exec(contentLines[i])) !== null) {
      const url = match[0];
      try {
        const hostname = new URL(url).hostname;
        const isAllowed = allowedDomains.some(
          (d) => hostname === d || hostname.endsWith("." + d)
        );
        if (!isAllowed) {
          if (!externalLines.includes(i + 1)) {
            externalLines.push(i + 1);
          }
          if (!externalUrls.includes(hostname) && externalUrls.length < 5) {
            externalUrls.push(hostname);
          }
        }
      } catch {
        // Invalid URL, skip
      }
    }
  }

  if (externalLines.length > 0) {
    findings.push({
      category: "External URLs",
      found: `${externalUrls.length} external domain(s): ${externalUrls.join(", ")}`,
      severity: "warning",
      lines: externalLines,
      description:
        "External URLs may point to malicious resources or be used for data exfiltration.",
    });
  }
  return findings;
}

function checkBase64(content: string): Finding[] {
  const findings: Finding[] = [];
  // Match base64 strings that are at least 40 chars long (likely encoded payloads)
  const base64Pattern = /[A-Za-z0-9+/]{40,}={0,2}/g;
  const contentLines = content.split("\n");
  const b64Lines: number[] = [];

  for (let i = 0; i < contentLines.length; i++) {
    if (base64Pattern.test(contentLines[i])) {
      b64Lines.push(i + 1);
    }
    base64Pattern.lastIndex = 0;
  }

  if (b64Lines.length > 0) {
    findings.push({
      category: "Base64 Encoding",
      found: `${b64Lines.length} potential base64 encoded string(s)`,
      severity: "warning",
      lines: b64Lines,
      description:
        "Long base64-encoded strings may hide malicious payloads or obfuscated instructions.",
    });
  }
  return findings;
}

function checkPromptInjection(content: string): Finding[] {
  const findings: Finding[] = [];
  const patterns: Array<{ regex: RegExp; label: string; severity: Severity }> = [
    { regex: /ignore\s+(all\s+)?previous\s+(instructions?|prompts?)/gi, label: "ignore previous instructions", severity: "critical" },
    { regex: /system\s+override/gi, label: "system override", severity: "critical" },
    { regex: /you\s+are\s+now/gi, label: "identity override (you are now)", severity: "critical" },
    { regex: /pretend\s+(you\s+are|to\s+be)/gi, label: "pretend to be", severity: "critical" },
    { regex: /act\s+as\s+(if\s+you|a|an)/gi, label: "act as", severity: "warning" },
    { regex: /disregard\s+(all\s+)?(previous|prior|above)/gi, label: "disregard previous", severity: "critical" },
    { regex: /new\s+instructions?\s*:/gi, label: "new instructions:", severity: "critical" },
    { regex: /do\s+not\s+follow\s+(the\s+)?(above|previous)/gi, label: "do not follow above", severity: "critical" },
    { regex: /\[SYSTEM\]/gi, label: "[SYSTEM] tag", severity: "critical" },
    { regex: /\[INST\]/gi, label: "[INST] tag", severity: "warning" },
    { regex: /jailbreak/gi, label: "jailbreak", severity: "critical" },
    { regex: /bypass\s+(safety|filter|restriction)/gi, label: "bypass safety", severity: "critical" },
  ];

  for (const { regex, label, severity } of patterns) {
    const lines = getLines(content, regex);
    if (lines.length > 0) {
      findings.push({
        category: "Prompt Injection",
        found: label,
        severity,
        lines,
        description: `Found "${label}" pattern which is a known prompt injection technique.`,
      });
    }
  }
  return findings;
}

function checkYAMLStructure(content: string): Finding[] {
  const findings: Finding[] = [];

  // Check for frontmatter
  const hasFrontmatter = /^---\s*\n/.test(content);
  if (!hasFrontmatter) {
    findings.push({
      category: "YAML Structure",
      found: "Missing YAML frontmatter",
      severity: "info",
      lines: [1],
      description:
        "SKILL.md files typically start with YAML frontmatter (---). This file may not be a valid skill file.",
    });
    return findings;
  }

  // Check frontmatter is properly closed
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    findings.push({
      category: "YAML Structure",
      found: "Unclosed YAML frontmatter",
      severity: "warning",
      lines: [1],
      description:
        "YAML frontmatter block is not properly closed with a second '---' delimiter.",
    });
    return findings;
  }

  const yaml = frontmatterMatch[1];

  // Check for suspicious YAML keys
  const suspiciousKeys = [
    { regex: /^\s*system\s*:/gm, label: "system:" },
    { regex: /^\s*execute\s*:/gm, label: "execute:" },
    { regex: /^\s*run\s*:/gm, label: "run:" },
    { regex: /^\s*shell\s*:/gm, label: "shell:" },
    { regex: /^\s*command\s*:/gm, label: "command:" },
    { regex: /^\s*eval\s*:/gm, label: "eval:" },
  ];

  for (const { regex, label } of suspiciousKeys) {
    const lines = getLines(yaml, regex);
    if (lines.length > 0) {
      // Offset by 1 for the opening --- line
      findings.push({
        category: "YAML Structure",
        found: `Suspicious YAML key: ${label}`,
        severity: "warning",
        lines: lines.map((l) => l + 1),
        description: `The YAML key "${label}" is unusual for a skill definition and may indicate an attempt to execute commands.`,
      });
    }
  }

  return findings;
}

function calculateRiskLevel(findings: Finding[]): RiskLevel {
  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const warningCount = findings.filter((f) => f.severity === "warning").length;

  if (criticalCount >= 2) return "DANGEROUS";
  if (criticalCount === 1) return "SUSPICIOUS";
  if (warningCount >= 3) return "SUSPICIOUS";
  if (warningCount >= 1) return "CAUTION";
  return "SAFE";
}

function generateSummary(riskLevel: RiskLevel, totalFindings: number): string {
  switch (riskLevel) {
    case "SAFE":
      return "No security issues detected. This skill file appears safe to use.";
    case "CAUTION":
      return `Found ${totalFindings} minor issue(s). Review the findings before using this skill.`;
    case "SUSPICIOUS":
      return `Found ${totalFindings} issue(s) including potential security risks. Careful review recommended.`;
    case "DANGEROUS":
      return `Found ${totalFindings} issue(s) with multiple critical security risks. Do NOT use this skill without thorough review.`;
  }
}

export function runAudit(content: string): AuditResult {
  const allFindings: Finding[] = [
    ...checkHiddenCSS(content),
    ...checkWhiteText(content),
    ...checkHTMLComments(content),
    ...checkSuspiciousJS(content),
    ...checkExternalURLs(content),
    ...checkBase64(content),
    ...checkPromptInjection(content),
    ...checkYAMLStructure(content),
  ];

  // Sort: critical first, then warning, then info
  const severityOrder: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };
  allFindings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const riskLevel = calculateRiskLevel(allFindings);

  return {
    riskLevel,
    findings: allFindings,
    safeToUse: riskLevel === "SAFE",
    totalFindings: allFindings.length,
    summary: generateSummary(riskLevel, allFindings.length),
  };
}
