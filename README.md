# 🛡️ Skill Audit

A free, open-source web app that scans Claude SKILL.md files for security vulnerabilities — no AI, no API calls, just pattern matching.

**Live at:** [skill-audit.vercel.app](https://skill-audit.vercel.app)

## What It Does

Claude skills are defined in Markdown files that get loaded into conversations. A malicious skill file could contain hidden instructions, invisible text, or embedded scripts. Skill Audit checks for these risks before you use a skill.

### Security Checks

| Check | What It Detects |
|---|---|
| **Hidden CSS** | `display:none`, `visibility:hidden`, `opacity:0`, off-screen positioning |
| **Invisible Text** | White text, transparent colors, zero-opacity text |
| **HTML Comments** | Hidden instructions inside `<!-- -->` blocks |
| **Suspicious JavaScript** | `eval()`, `fetch()`, `<script>` tags, inline event handlers |
| **External URLs** | Links to non-GitHub domains that could exfiltrate data |
| **Base64 Encoding** | Long encoded strings that may hide obfuscated payloads |
| **Prompt Injection** | "Ignore previous instructions", "system override", identity hijacking |
| **YAML Structure** | Validates frontmatter and flags suspicious YAML keys |

### Risk Levels

- **SAFE** — No issues found
- **CAUTION** — Minor issues worth reviewing
- **SUSPICIOUS** — Potential security risks detected
- **DANGEROUS** — Multiple critical findings, do not use without review

## How to Use

1. **Paste a GitHub URL** to any SKILL.md file and click Scan
2. **Or drag-and-drop** a local `.md` file (processed entirely in your browser)
3. Review the findings, expand each one for details and line numbers
4. Copy results to clipboard if needed

## Privacy

- No data is stored
- No AI APIs are called
- File uploads are processed locally in the browser
- GitHub URL fetches go through a serverless function with no logging

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
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
