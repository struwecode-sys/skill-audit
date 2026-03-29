# <img src="public/icon.svg" width="28" height="28" alt="Skill Audit" /> Skill Audit

A free, open-source web app that scans Claude SKILL.md files for security vulnerabilities — no AI, no API calls, just pattern matching.

**Live at:** [skill-audit.vercel.app](https://skill-audit.vercel.app)

## What It Does

Claude skills are defined in Markdown files that get loaded into conversations. A malicious skill file could contain hidden instructions, invisible text, or embedded scripts. Skill Audit checks for these risks before you use a skill.

### Security Checks (11 categories)

| Check | What It Detects |
|---|---|
| **Hidden CSS** | `display:none`, `visibility:hidden`, `opacity:0`, off-screen positioning |
| **Invisible Text** | White text, transparent colors, zero-opacity text |
| **HTML Comments** | Hidden instructions inside `<!-- -->` blocks |
| **Suspicious JavaScript** | `eval()`, `fetch()`, `<script>` tags, inline event handlers |
| **External URLs** | Links to unexpected external domains that could exfiltrate data |
| **Base64 Encoding** | Decodes encoded strings and scans contents for hidden threats |
| **Prompt Injection** | "Ignore previous instructions", "system override", identity hijacking |
| **YAML Structure** | Validates frontmatter and flags suspicious YAML keys |
| **Shell Commands** | `rm -rf`, `curl \| sh`, `sudo`, `spawn()`, `subprocess`, and more |
| **Data Exfiltration** | Sensitive data (API keys, tokens) near network/outbound calls |
| **Unicode Obfuscation** | Zero-width characters, bidirectional overrides, homoglyphs |

### Confidence Scoring

Each finding includes a confidence level (high, medium, low) to help you distinguish real threats from noise. Findings inside code fences are automatically marked as lower confidence since they're likely documentation examples rather than active threats.

### Risk Levels

- **SAFE** — No issues found
- **CAUTION** — Minor issues worth reviewing
- **SUSPICIOUS** — Potential security risks detected
- **DANGEROUS** — Multiple critical findings, do not use without review

## How to Use

1. **Paste any URL** to a SKILL.md file and click Scan — works with GitHub, GitLab, Bitbucket, or any hosted file
2. **Or drag-and-drop** local `.md` files (processed entirely in your browser)
3. Review the findings, expand each one for details, line numbers, and confidence
4. Export results as JSON or Markdown, or copy to clipboard

### Batch Scanning

Drop multiple `.md` files at once to scan them all. You'll get a summary dashboard showing the risk level for each file, with expandable details and a combined JSON export.

GitHub blob URLs are automatically converted to raw file URLs.

## Privacy

- No data is stored
- No AI APIs are called
- File uploads are processed locally in the browser
- URL fetches go through a serverless function with no logging

## Disclaimer

Skill Audit is a best-effort scanning tool that uses pattern matching to detect common security issues. **A clean scan does not guarantee that a file is safe.** Sophisticated or novel attacks may evade detection. Always review skill files manually before use, especially from untrusted sources. This tool is provided as-is with no warranty — use it as one layer of defence, not your only one.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- Vercel serverless functions
- next-themes (dark/light mode)

## Run Locally

```bash
git clone https://github.com/struwecode-sys/skill-audit.git
cd skill-audit
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fstruwecode-sys%2Fskill-audit)

## License

MIT
