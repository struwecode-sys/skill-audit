export type RiskLevel = "SAFE" | "CAUTION" | "SUSPICIOUS" | "DANGEROUS";

export type Severity = "critical" | "warning" | "info";

export type Confidence = "high" | "medium" | "low";

export interface Finding {
  category: string;
  found: string;
  severity: Severity;
  confidence: Confidence;
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

// Returns true if the given line number is inside a fenced code block
function isInsideCodeFence(content: string, lineNumber: number): boolean {
  const lines = content.split("\n");
  let insideFence = false;
  for (let i = 0; i < Math.min(lineNumber, lines.length); i++) {
    if (/^```/.test(lines[i].trim())) {
      insideFence = !insideFence;
    }
  }
  return insideFence;
}

function getConfidenceForLine(content: string, lineNumber: number): Confidence {
  return isInsideCodeFence(content, lineNumber) ? "low" : "high";
}

// #1 - Base64 decoding: decode and re-scan contents
function decodeBase64Safe(str: string): string | null {
  try {
    // Node and browser-compatible base64 decode
    if (typeof Buffer !== "undefined") {
      return Buffer.from(str, "base64").toString("utf-8");
    }
    return atob(str);
  } catch {
    return null;
  }
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
      const confidence = lines.some((l) => getConfidenceForLine(content, l) === "high") ? "high" : "low";
      findings.push({
        category: "Hidden CSS",
        found: label,
        severity: "critical",
        confidence,
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
      const confidence = lines.some((l) => getConfidenceForLine(content, l) === "high") ? "high" : "low";
      findings.push({
        category: "White/Transparent Text",
        found: label,
        severity: "critical",
        confidence,
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
    const suspiciousComment = /<!--[\s\S]*?(ignore|override|system|instruction|prompt|pretend|roleplay|act as)[\s\S]*?-->/gi;
    const isSuspicious = suspiciousComment.test(content);

    findings.push({
      category: "HTML Comments",
      found: `${commentLines.length} comment(s) found${commentContents.length > 0 ? `: ${commentContents[0]}` : ""}`,
      severity: isSuspicious ? "critical" : "warning",
      confidence: isSuspicious ? "high" : "medium",
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
      const confidence = lines.some((l) => getConfidenceForLine(content, l) === "high") ? "high" : "low";
      findings.push({
        category: "Suspicious JavaScript",
        found: label,
        severity,
        confidence,
        lines,
        description: `Found "${label}" which could execute arbitrary code or exfiltrate data.`,
      });
    }
  }
  return findings;
}

function checkExternalURLs(content: string): Finding[] {
  const findings: Finding[] = [];
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
      confidence: "medium",
      lines: externalLines,
      description:
        "External URLs may point to malicious resources or be used for data exfiltration.",
    });
  }
  return findings;
}

// #1 - Enhanced base64: decode and scan contents
function checkBase64(content: string): Finding[] {
  const findings: Finding[] = [];
  const base64Pattern = /[A-Za-z0-9+/]{40,}={0,2}/g;
  const contentLines = content.split("\n");
  const b64Lines: number[] = [];
  const decodedThreats: string[] = [];

  for (let i = 0; i < contentLines.length; i++) {
    let match;
    const linePattern = /[A-Za-z0-9+/]{40,}={0,2}/g;
    while ((match = linePattern.exec(contentLines[i])) !== null) {
      if (!b64Lines.includes(i + 1)) {
        b64Lines.push(i + 1);
      }

      // Decode and scan the contents
      const decoded = decodeBase64Safe(match[0]);
      if (decoded) {
        const threatPatterns: Array<{ regex: RegExp; label: string }> = [
          { regex: /ignore\s+(all\s+)?previous/gi, label: "prompt injection" },
          { regex: /\beval\s*\(/gi, label: "eval()" },
          { regex: /\bfetch\s*\(/gi, label: "fetch()" },
          { regex: /<script/gi, label: "<script> tag" },
          { regex: /https?:\/\/[^\s]+/gi, label: "URL" },
          { regex: /system\s+override/gi, label: "system override" },
          { regex: /\b(rm|curl|wget|sudo)\b/gi, label: "shell command" },
        ];
        for (const { regex, label } of threatPatterns) {
          if (regex.test(decoded) && !decodedThreats.includes(label)) {
            decodedThreats.push(label);
          }
        }
      }
    }
  }

  if (b64Lines.length > 0) {
    if (decodedThreats.length > 0) {
      findings.push({
        category: "Base64 Encoding",
        found: `Decoded payload contains: ${decodedThreats.join(", ")}`,
        severity: "critical",
        confidence: "high",
        lines: b64Lines,
        description: `Base64-encoded content was decoded and found to contain suspicious elements: ${decodedThreats.join(", ")}. This is a strong indicator of obfuscated malicious content.`,
      });
    } else {
      findings.push({
        category: "Base64 Encoding",
        found: `${b64Lines.length} potential base64 encoded string(s)`,
        severity: "warning",
        confidence: "medium",
        lines: b64Lines,
        description:
          "Long base64-encoded strings may hide malicious payloads or obfuscated instructions.",
      });
    }
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
      const confidence = lines.some((l) => getConfidenceForLine(content, l) === "high") ? "high" : "low";
      findings.push({
        category: "Prompt Injection",
        found: label,
        severity,
        confidence,
        lines,
        description: `Found "${label}" pattern which is a known prompt injection technique.`,
      });
    }
  }
  return findings;
}

function checkYAMLStructure(content: string): Finding[] {
  const findings: Finding[] = [];

  const hasFrontmatter = /^---\s*\n/.test(content);
  if (!hasFrontmatter) {
    findings.push({
      category: "YAML Structure",
      found: "Missing YAML frontmatter",
      severity: "info",
      confidence: "high",
      lines: [1],
      description:
        "SKILL.md files typically start with YAML frontmatter (---). This file may not be a valid skill file.",
    });
    return findings;
  }

  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    findings.push({
      category: "YAML Structure",
      found: "Unclosed YAML frontmatter",
      severity: "warning",
      confidence: "high",
      lines: [1],
      description:
        "YAML frontmatter block is not properly closed with a second '---' delimiter.",
    });
    return findings;
  }

  const yaml = frontmatterMatch[1];

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
      findings.push({
        category: "YAML Structure",
        found: `Suspicious YAML key: ${label}`,
        severity: "warning",
        confidence: "high",
        lines: lines.map((l) => l + 1),
        description: `The YAML key "${label}" is unusual for a skill definition and may indicate an attempt to execute commands.`,
      });
    }
  }

  return findings;
}

// #2 - Shell command detection
function checkShellCommands(content: string): Finding[] {
  const findings: Finding[] = [];
  const patterns: Array<{ regex: RegExp; label: string; severity: Severity }> = [
    { regex: /\brm\s+(-rf?|--recursive)\b/gi, label: "rm -rf (recursive delete)", severity: "critical" },
    { regex: /\bcurl\s+[^\n]*\|\s*(sh|bash)\b/gi, label: "curl piped to shell", severity: "critical" },
    { regex: /\bwget\s+[^\n]*\|\s*(sh|bash)\b/gi, label: "wget piped to shell", severity: "critical" },
    { regex: /\bcurl\s+(-[^\s]*\s+)*https?:\/\//gi, label: "curl with URL", severity: "warning" },
    { regex: /\bwget\s+/gi, label: "wget", severity: "warning" },
    { regex: /\bsudo\s+/gi, label: "sudo", severity: "warning" },
    { regex: /\bchmod\s+(\+x|[0-7]{3,4})\s+/gi, label: "chmod (permission change)", severity: "warning" },
    { regex: /\bchown\s+/gi, label: "chown (ownership change)", severity: "warning" },
    { regex: /child_process/gi, label: "child_process (Node.js)", severity: "critical" },
    { regex: /\bspawn\s*\(/gi, label: "spawn()", severity: "critical" },
    { regex: /\bos\.system\s*\(/gi, label: "os.system() (Python)", severity: "critical" },
    { regex: /subprocess\.(run|call|Popen)\s*\(/gi, label: "subprocess (Python)", severity: "critical" },
    { regex: /\bdd\s+if=/gi, label: "dd (disk write)", severity: "critical" },
    { regex: />\s*\/dev\/sd[a-z]/gi, label: "write to disk device", severity: "critical" },
    { regex: /\bmkfs\b/gi, label: "mkfs (format filesystem)", severity: "critical" },
    { regex: /\bshutdown\b/gi, label: "shutdown", severity: "critical" },
    { regex: /\breboot\b/gi, label: "reboot", severity: "warning" },
  ];

  for (const { regex, label, severity } of patterns) {
    const lines = getLines(content, regex);
    if (lines.length > 0) {
      const confidence = lines.some((l) => getConfidenceForLine(content, l) === "high") ? "high" : "low";
      findings.push({
        category: "Shell Commands",
        found: label,
        severity,
        confidence,
        lines,
        description: `Found "${label}" which could execute destructive or unauthorized system commands.`,
      });
    }
  }
  return findings;
}

// #3 - Data exfiltration pattern detection
function checkDataExfiltration(content: string): Finding[] {
  const findings: Finding[] = [];

  // Sensitive data patterns
  const sensitivePatterns = [
    /process\.env/gi,
    /API[_-]?KEY/gi,
    /SECRET[_-]?KEY/gi,
    /ACCESS[_-]?TOKEN/gi,
    /PRIVATE[_-]?KEY/gi,
    /PASSWORD/gi,
    /CREDENTIALS?/gi,
    /AUTH[_-]?TOKEN/gi,
    /\.env\b/gi,
    /ssh[_-]?key/gi,
    /bearer\s+token/gi,
  ];

  // Outbound patterns
  const outboundPatterns = [
    /\bfetch\s*\(/gi,
    /XMLHttpRequest/gi,
    /https?:\/\/[^\s"'<>\]()]+/gi,
    /\bcurl\b/gi,
    /\bwget\b/gi,
    /\.send\s*\(/gi,
    /\.post\s*\(/gi,
  ];

  const contentLines = content.split("\n");
  const exfilLines: number[] = [];
  const sensitiveFound: string[] = [];

  // Check each line for sensitive data near outbound calls (within 3-line window)
  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i];
    const window = contentLines.slice(Math.max(0, i - 3), Math.min(contentLines.length, i + 4)).join("\n");

    const hasSensitive = sensitivePatterns.some((p) => {
      p.lastIndex = 0;
      return p.test(line);
    });

    if (hasSensitive) {
      const hasOutbound = outboundPatterns.some((p) => {
        p.lastIndex = 0;
        return p.test(window);
      });

      if (hasOutbound) {
        exfilLines.push(i + 1);
        // Track which sensitive data was found
        for (const p of sensitivePatterns) {
          p.lastIndex = 0;
          const match = p.exec(line);
          if (match && !sensitiveFound.includes(match[0]) && sensitiveFound.length < 5) {
            sensitiveFound.push(match[0]);
          }
        }
      }
    }
  }

  if (exfilLines.length > 0) {
    findings.push({
      category: "Data Exfiltration",
      found: `Sensitive data near outbound calls: ${sensitiveFound.join(", ")}`,
      severity: "critical",
      confidence: exfilLines.some((l) => getConfidenceForLine(content, l) === "high") ? "high" : "medium",
      lines: exfilLines,
      description:
        "Sensitive data references (API keys, tokens, credentials) were found near network calls, which may indicate data exfiltration.",
    });
  }
  return findings;
}

// #4 - Zero-width / Unicode obfuscation detection
function checkUnicodeObfuscation(content: string): Finding[] {
  const findings: Finding[] = [];
  const contentLines = content.split("\n");

  // Zero-width characters
  const zeroWidthPattern = /[\u200B\u200C\u200D\uFEFF\u00AD\u2060\u180E]/;
  const zeroWidthLines: number[] = [];
  for (let i = 0; i < contentLines.length; i++) {
    if (zeroWidthPattern.test(contentLines[i])) {
      zeroWidthLines.push(i + 1);
    }
  }
  if (zeroWidthLines.length > 0) {
    findings.push({
      category: "Unicode Obfuscation",
      found: `${zeroWidthLines.length} line(s) with zero-width characters`,
      severity: "critical",
      confidence: "high",
      lines: zeroWidthLines,
      description:
        "Zero-width characters (U+200B, U+200C, U+200D, U+FEFF) are invisible and can hide text or instructions from visual inspection.",
    });
  }

  // Right-to-left override
  const rtlPattern = /[\u202A\u202B\u202C\u202D\u202E\u2066\u2067\u2068\u2069]/;
  const rtlLines: number[] = [];
  for (let i = 0; i < contentLines.length; i++) {
    if (rtlPattern.test(contentLines[i])) {
      rtlLines.push(i + 1);
    }
  }
  if (rtlLines.length > 0) {
    findings.push({
      category: "Unicode Obfuscation",
      found: `${rtlLines.length} line(s) with bidirectional override characters`,
      severity: "critical",
      confidence: "high",
      lines: rtlLines,
      description:
        "Bidirectional text override characters can reverse text display direction, making malicious content appear different from what is actually executed.",
    });
  }

  // Homoglyph detection: non-ASCII characters that look like ASCII letters
  // Check for Cyrillic, Greek, or other scripts mixed with Latin text
  const homoglyphPattern = /[\u0400-\u04FF\u0370-\u03FF\u2100-\u214F]/;
  const homoglyphLines: number[] = [];
  for (let i = 0; i < contentLines.length; i++) {
    // Only flag if line also has ASCII letters (mixed scripts = suspicious)
    if (homoglyphPattern.test(contentLines[i]) && /[a-zA-Z]/.test(contentLines[i])) {
      homoglyphLines.push(i + 1);
    }
  }
  if (homoglyphLines.length > 0) {
    findings.push({
      category: "Unicode Obfuscation",
      found: `${homoglyphLines.length} line(s) with mixed-script characters (potential homoglyphs)`,
      severity: "warning",
      confidence: "medium",
      lines: homoglyphLines,
      description:
        "Lines contain a mix of Latin and non-Latin characters (Cyrillic, Greek) which could be homoglyph attacks — characters that look identical but have different Unicode values.",
    });
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
    ...checkShellCommands(content),
    ...checkDataExfiltration(content),
    ...checkUnicodeObfuscation(content),
  ];

  // Sort: critical first, then warning, then info; within same severity, high confidence first
  const severityOrder: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };
  const confidenceOrder: Record<Confidence, number> = { high: 0, medium: 1, low: 2 };
  allFindings.sort((a, b) => {
    const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return confidenceOrder[a.confidence] - confidenceOrder[b.confidence];
  });

  const riskLevel = calculateRiskLevel(allFindings);

  return {
    riskLevel,
    findings: allFindings,
    safeToUse: riskLevel === "SAFE",
    totalFindings: allFindings.length,
    summary: generateSummary(riskLevel, allFindings.length),
  };
}
