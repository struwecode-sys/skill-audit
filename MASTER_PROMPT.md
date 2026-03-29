# MASTER PROMPT FOR CLAUDE IN VS CODE
## Copy Everything Below This Line (Starting with "You are building...")

```
You are building "Skill Audit" - a free, open-source web app that audits Claude skills for security vulnerabilities.

SPECIFICATIONS:
- Frontend: Next.js 14 with App Router, TypeScript, Tailwind CSS, dark mode (next-themes)
- Backend: Vercel serverless functions (no database needed)
- No external dependencies beyond Next.js + Tailwind
- Pure logic audit engine (no AI, no API calls)

FEATURES:
1. GitHub URL input - user pastes GitHub link to SKILL.md
2. File upload - drag-and-drop .md files
3. 8 security checks (pattern matching):
   - Hidden CSS (display: none, visibility: hidden, opacity: 0)
   - White/transparent text (color: white, transparent)
   - HTML comments (<!-- instructions -->)
   - Suspicious JavaScript (eval, fetch, XMLHttpRequest)
   - External URLs (flag non-GitHub domains)
   - Base64 encoding (long encoded strings)
   - Prompt injection ("ignore previous", "system override")
   - YAML structure (validate frontmatter)
4. Risk level calculation and display
5. Expandable findings with line numbers
6. Copy results to clipboard
7. Dark/light mode toggle
8. Mobile responsive design
9. Error handling for all edge cases

PROJECT STRUCTURE:
```
skill-audit/
├── app/
│   ├── page.tsx (main page)
│   ├── layout.tsx (root layout)
│   ├── globals.css (tailwind)
│   └── api/
│       └── audit/
│           └── route.ts (POST endpoint)
├── components/
│   ├── Header.tsx
│   ├── AuditForm.tsx (GitHub URL input)
│   ├── DragDropZone.tsx (file upload)
│   ├── ResultsDisplay.tsx (main dashboard)
│   ├── RiskMeter.tsx (visual bar)
│   ├── FindingCard.tsx (individual finding)
│   ├── ThemeToggle.tsx (dark mode)
│   └── Footer.tsx
├── lib/
│   ├── auditEngine.ts (all 8 checks)
│   └── utils.ts (helpers)
├── public/
│   └── (assets if needed)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
└── .gitignore
```

AUDIT ENGINE IMPLEMENTATION (lib/auditEngine.ts):
- Export type AuditResult with fields: riskLevel, findings[], safeToUse, totalFindings
- Export type Finding with: category, found, severity, lines[]
- Export type RiskLevel: "SAFE" | "CAUTION" | "SUSPICIOUS" | "DANGEROUS"
- Implement 8 check functions (checkHiddenCSS, checkWhiteText, etc.)
- Risk calculation: 2+ critical findings = DANGEROUS, 1 critical = SUSPICIOUS, 3+ warnings = SUSPICIOUS, 1+ warning = CAUTION, 0 findings = SAFE
- All processing is synchronous, no async calls

API ENDPOINT (app/api/audit/route.ts):
- POST /api/audit
- Accept { url?: string, content?: string }
- If URL provided:
  * Convert github.com URLs to raw.githubusercontent.com
  * Fetch file with 5s timeout
  * Handle network errors gracefully
- If content provided:
  * Use directly (no fetch)
- Run auditEngine.runAudit()
- Return { success: true, result: AuditResult } or { success: false, error: string }
- Proper error handling with meaningful messages

FRONTEND BEHAVIOR:
- GitHub URL path: Show loading spinner during fetch, then results
- File upload path: Process locally (no API call), instant results
- Expandable findings: Click to show/hide details with smooth animation
- Copy button: Copy stringified results to clipboard
- Error states: Show user-friendly messages (invalid URL, network error, file too large)
- Responsive: Works on mobile, tablet, desktop
- Dark mode: Uses next-themes, respects system preference

STYLING:
- Use Tailwind CSS utility classes only (no custom CSS)
- Color scheme:
  * Safe: green-600
  * Caution: amber-600
  * Suspicious: orange-600
  * Dangerous: red-700
- Spacing: 24px (sections), 16px (cards), 8px (elements)
- Typography: System fonts, semantic HTML
- Animations: Smooth transitions (150-300ms)

REQUIREMENTS:
1. Generate all files with complete, production-ready code
2. Include proper error handling throughout
3. Add helpful comments where logic is complex
4. Ensure TypeScript is strict (no "any" types)
5. Make components reusable and clean
6. Include loading states and error states
7. Add accessibility attributes (aria-labels where appropriate)
8. Optimize for performance (no unnecessary re-renders)
9. Make sure dark mode works perfectly
10. Include proper favicon/metadata in layout.tsx

GENERATE:
1. package.json (with dependencies)
2. tsconfig.json
3. next.config.js
4. tailwind.config.ts
5. postcss.config.js
6. .gitignore
7. All component files
8. API route
9. Audit engine
10. Global styles

Start by creating the complete file structure with all code. I will copy these files into the project directory.
```

---

## How to Use This Prompt

1. **Open VS Code with Claude extension**
2. **Open Claude in VS Code** (Cmd+Shift+P > "Claude: Open Claude")
3. **Copy everything from the triple backticks above** (the entire prompt)
4. **Paste into Claude chat**
5. **Press Enter and wait**

Claude will generate all files for the entire project.

---

## What Comes Next

After Claude generates the code:

1. **Review each file** (make sure it looks right)
2. **Create the files locally** in your skill-audit directory
3. **Run npm install**
4. **Run npm run dev** to test locally
5. **Deploy to Vercel** with `vercel deploy`
6. **Push to GitHub**

See CLAUDE_IN_VSCODE_BUILD_GUIDE.md for detailed step-by-step instructions.
