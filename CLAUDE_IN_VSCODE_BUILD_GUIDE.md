# Skill Audit Web App - Claude in VS Code Build Guide

## Overview

This guide walks you through using Claude in VS Code to generate the entire Skill Audit web app, then deploying it with minimal manual steps.

**What Claude Does:**
- Generates all project files
- Creates components
- Builds API routes
- Configures Next.js
- Sets up styling

**What You Do:**
- Review code
- Run npm commands in terminal
- Test locally
- Deploy to Vercel
- Push to GitHub

---

## Phase 1: Setup (5 minutes)

### Step 1: Create Project Directory

```bash
mkdir skill-audit
cd skill-audit
```

### Step 2: Open in VS Code

```bash
code .
```

### Step 3: Open Claude in VS Code

```
Cmd+Shift+P (or Ctrl+Shift+P on Windows)
Type: "Claude"
Select: "Claude: Open Claude"
```

Claude sidebar should appear on the right.

---

## Phase 2: Generate Project (20 minutes)

### The Master Prompt (Copy This Exactly)

Paste this into Claude in VS Code. Claude will generate all files:

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

### Step 4: Paste the Prompt

1. Click in Claude chat (right sidebar)
2. Paste the master prompt above
3. Press Enter

Claude will generate the entire project.

### Step 5: Review Generated Code

Claude will output all files. Read through:
- package.json (make sure dependencies look right)
- lib/auditEngine.ts (verify 8 checks are there)
- app/api/audit/route.ts (verify GitHub URL handling)
- components (verify structure makes sense)

**If something looks wrong:**
```
Ask Claude: "Fix the [component name]. It should [specific requirement]"
```

---

## Phase 3: Create Files Locally (10 minutes)

### Step 1: Create project structure

```bash
cd skill-audit

# Create directories
mkdir -p app/api/audit
mkdir components
mkdir lib
mkdir public
mkdir -p src/styles
```

### Step 2: Copy Files from Claude Output

For each file Claude generated:

1. **In Claude chat:** Click the copy icon (or manually select)
2. **In VS Code:** Create the file (File > New File)
3. **Paste** the content
4. **Save** with correct filename

**Start with config files first:**
- package.json
- tsconfig.json
- next.config.js
- tailwind.config.ts
- postcss.config.js
- .gitignore

**Then components:**
- app/layout.tsx
- app/page.tsx
- app/globals.css
- app/api/audit/route.ts
- All files in /components
- All files in /lib

### Step 3: Verify File Structure

```bash
# From skill-audit directory, you should see:
ls -la

# Should show:
app/
components/
lib/
node_modules/ (will be created next)
package.json
tsconfig.json
tailwind.config.ts
...
```

---

## Phase 4: Install & Setup (5 minutes)

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- next
- react
- typescript
- tailwindcss
- next-themes
- Other needed packages

**Wait for it to complete.** (Takes 2-3 minutes)

### Step 2: Verify Installation

```bash
npm ls next

# Should show: next@14.x.x
```

---

## Phase 5: Test Locally (10 minutes)

### Step 1: Start Dev Server

```bash
npm run dev
```

You should see:
```
> skill-audit@1.0.0 dev
> next dev

  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local
```

### Step 2: Open in Browser

Visit: `http://localhost:3000`

You should see:
- Header with "Skill Audit" title
- Dark mode toggle
- Input field: "Paste GitHub URL"
- Drag-and-drop zone
- Clean, minimal design

### Step 3: Test GitHub URL Input

1. Open: `https://github.com/sickn33/antigravity-awesome-skills/blob/main/skills/brainstorming/SKILL.md`
2. Copy the URL
3. Go back to localhost:3000
4. Paste URL in input field
5. Click [Audit]

You should see:
- Loading spinner briefly
- Results appear with risk level
- 8 findings displayed
- Expandable cards

### Step 4: Test File Upload

1. Create a test file:
```bash
cat > /tmp/test-skill.md << 'EOF'
---
name: Test Skill
---

# Test

This is a test.
EOF
```

2. Go to localhost:3000
3. Drag `/tmp/test-skill.md` onto the drop zone
4. Results appear instantly (no loading bar)

### Step 5: Test Dark Mode

1. Click moon/sun icon (top right)
2. Colors should invert
3. Text should remain readable

### Step 6: Test Error Handling

1. Try invalid URL: "not-a-github-url"
2. You should see error message
3. Try file that's not text (optional)

### If Something Breaks

```bash
# Stop the server
Ctrl+C

# Check for errors in console output
# If you see TypeScript errors:
npm run build

# This will show what's wrong

# Ask Claude: "Fix this error: [error message]"
```

---

## Phase 6: Deploy to Vercel (5 minutes)

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login

# Opens browser to authorize
# Authenticate and come back
```

### Step 3: Deploy

```bash
vercel deploy

# Follow prompts:
# - Link to existing project? No (first time)
# - Set up and deploy? Yes
# - Project name: skill-audit
# - Framework preset: Next.js
# - Root directory: ./
# - Build command: Next.js default
# - Output: Next.js default
# - Environment variables: None needed

# Waits a minute...
# Shows: ✓ Production: https://skill-audit.vercel.app
```

### Step 4: Test Live Version

Visit the URL Vercel gave you (e.g., `https://skill-audit.vercel.app`)

Try:
- Paste a GitHub URL
- Get instant results
- Works exactly like localhost

**It's live!**

---

## Phase 7: Open Source on GitHub (5 minutes)

### Step 1: Create GitHub Repo

1. Go to github.com
2. Click "New repository"
3. Name: `skillaudit`
4. Description: "Free, open-source tool to audit Claude skills for security"
5. Public (important!)
6. Add README.md (from template? No, we'll write one)
7. Add .gitignore: Node
8. Add license: MIT

### Step 2: Initialize Git Locally

```bash
cd skill-audit

git init
git add .
git commit -m "Initial commit: Skill Audit web app"
```

### Step 3: Add Remote & Push

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/skillaudit.git
git branch -M main
git push -u origin main
```

### Step 4: Verify on GitHub

Visit: `https://github.com/YOUR_USERNAME/skillaudit`

You should see all your code there.

---

## Phase 8: Create README (10 minutes)

### Create README.md

In VS Code, create `README.md` in the root:

```markdown
# Skill Audit

Free, open-source tool to audit Claude skills for security vulnerabilities.

## Features

- **Instant Analysis**: Paste a GitHub URL or drag a file
- **8 Security Checks**: Hidden CSS, white text, comments, JavaScript, URLs, Base64, prompt injection, YAML structure
- **Clean Dashboard**: Visual risk meter, expandable findings, line numbers
- **No Costs**: Pure logic engine, zero API calls, completely free
- **No Tracking**: Open source, no analytics, no ads
- **Easy to Self-Host**: Fork, modify, deploy to your own Vercel instance

## Quick Start

Visit: https://skillaudit.vercel.app (or your deployment)

1. **Option A (GitHub URL):**
   - Paste: `https://github.com/user/repo/blob/main/SKILL.md`
   - Click [Audit]
   - See results

2. **Option B (File Upload):**
   - Drag a .md file onto the page
   - Results appear instantly

## Risk Levels

- 🟢 **SAFE** (0 findings) - Use confidently
- 🟡 **CAUTION** (1-3 findings) - Review details
- 🔴 **SUSPICIOUS** (4-5 findings) - Don't use
- 🔴 **DANGEROUS** (6+ findings) - Delete immediately

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Vercel serverless functions (no database)
- **Deployment**: Vercel (free tier)
- **License**: MIT

## Security & Privacy

- No external API calls
- No tracking or analytics
- No user accounts or data storage
- File uploads processed locally (not sent to server)
- GitHub URLs fetched server-side (no CORS issues)
- Full source code available for audit

## Self-Hosting

### Option 1: Vercel (Easiest)

1. Fork this repo
2. Connect to Vercel
3. Click "Deploy"

### Option 2: Docker

```bash
docker build -t skillaudit .
docker run -p 3000:3000 skillaudit
```

### Option 3: Local Development

```bash
git clone https://github.com/YOUR_USERNAME/skillaudit.git
cd skillaudit
npm install
npm run dev
```

Visit http://localhost:3000

## How It Works

### Audit Engine

8 pattern-based security checks:
1. Hidden CSS (display: none, visibility: hidden, opacity: 0)
2. White/transparent text overlays
3. HTML comments with instructions
4. Suspicious JavaScript (eval, fetch, XMLHttpRequest)
5. External URLs to suspicious domains
6. Base64-encoded obfuscated content
7. Prompt injection indicators
8. YAML frontmatter validation

Each check scans for specific patterns and returns:
- What was found
- Line numbers
- The exact content

### Risk Calculation

```
2+ critical findings    → DANGEROUS
1 critical finding      → SUSPICIOUS
3+ warning findings     → SUSPICIOUS
1+ warning finding      → CAUTION
No findings             → SAFE
```

## Contributing

Contributions welcome! Areas to improve:

- [ ] More sophisticated pattern detection
- [ ] Performance optimizations
- [ ] Additional security checks
- [ ] Better documentation
- [ ] Internationalization
- [ ] API layer (for automation)
- [ ] GitHub Actions integration

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Future Roadmap

Phase 2:
- [ ] Export results as JSON
- [ ] Share results via link
- [ ] Audit history (localStorage)
- [ ] Comparison view

Phase 3:
- [ ] Community skill database
- [ ] User trust ratings
- [ ] Skill author verification
- [ ] Claude Desktop integration

## License

MIT - Use freely, commercially or otherwise. See [LICENSE](LICENSE) for details.

## FAQ

**Q: Is this maintained?**
A: Yes, actively. Open an issue if you find bugs.

**Q: Can I self-host?**
A: Yes. Fork and deploy to Vercel, Docker, or your own server.

**Q: Will you add AI analysis?**
A: Potentially in future versions. Currently pure logic for reliability and cost.

**Q: How accurate is it?**
A: Very good at detecting obvious malicious patterns. Some sophisticated tricks might slip through. Always code review important skills.

**Q: Do you store my data?**
A: No. Audits are processed instantly and discarded. See Privacy section above.

## Author

[Your name/handle]

## Support

Found a skill that should be flagged but isn't? Open an issue with:
- The GitHub URL
- What you think is malicious
- Why the tool missed it

Help us improve!

---

Made with ❤️ for the Claude community
```

### Push README to GitHub

```bash
git add README.md
git commit -m "Add comprehensive README"
git push
```

---

## Phase 9: Final Verification

### Checklist

```
[ ] Local development works (npm run dev)
[ ] Live on Vercel (URL is accessible)
[ ] GitHub repo is public and visible
[ ] README is complete
[ ] Dark mode works
[ ] GitHub URL audit works
[ ] File upload audit works
[ ] Error handling works
[ ] Mobile responsive
```

### Test One More Time

1. Visit your Vercel URL
2. Paste a GitHub URL (try: `https://github.com/sickn33/antigravity-awesome-skills/blob/main/README.md`)
3. Get results
4. Test file upload
5. Toggle dark mode
6. Try invalid URL (see error)

---

## Optional: Custom Domain

If you want `skillaudit.dev` or similar:

```bash
# Buy domain (GoDaddy, Namecheap, etc.) - ~$10/year

# In Vercel dashboard:
# 1. Go to Project > Settings > Domains
# 2. Add your domain
# 3. Update DNS settings (Vercel gives instructions)
# 4. Takes ~15 minutes to propagate

# Then: skillaudit.dev is live!
```

**Note:** Not necessary for launch. Can add anytime.

---

## What You Now Have

✅ Live web app (https://skillaudit.vercel.app)  
✅ Open source on GitHub  
✅ MIT license  
✅ Complete README  
✅ 8 security checks  
✅ No costs  
✅ 100% private  
✅ Shareable with anyone  

---

## Next: Share & Get Feedback

### Where to Share

1. **HackerNews** - `Show HN: Free tool to audit Claude skills`
2. **Twitter/X** - Tag @OpenAI, @Anthropic
3. **Claude communities** - Discord, Reddit
4. **Your networks** - Friends, colleagues who use Claude

### What to Ask For

"We just launched Skill Audit. Try it and let us know:
- Does it work for you?
- Any skills it missed?
- Features you'd like?
- Would you use this in your workflow?"

### Feedback Loop

GitHub issues will show you:
- Bugs to fix
- Features people want
- Use cases you didn't expect
- Ways to improve

---

## Troubleshooting

### npm install fails

```bash
# Delete package-lock.json
rm package-lock.json

# Try again
npm install
```

### GitHub URL returns error

```
Check:
1. Is the URL public?
2. Does the file exist?
3. Is it a .md file?

Try with this URL:
https://github.com/sickn33/antigravity-awesome-skills/blob/main/README.md
```

### Vercel deploy fails

```bash
# Check build locally
npm run build

# Fix any errors Claude shows

# Then try deploy again
vercel deploy
```

### Dark mode looks broken

```
Claude might have missed next-themes setup.
Ask Claude: "Fix dark mode. Use next-themes properly in layout.tsx and ThemeToggle.tsx"
```

### File upload doesn't work

```
Check in browser console (F12):
- Are there JavaScript errors?
- Is the file being read?

Ask Claude: "Debug file upload. Show me the exact error."
```

---

## You're Done!

You have a **production-ready, open-source, free web tool** that:
- Solves a real problem
- Works perfectly
- Costs $0 to run
- Respects user privacy
- Can be self-hosted
- Can be improved by the community

**Timeline: 2-3 hours total (with Claude doing most of the work)**

Next: Watch for GitHub stars, issues, and feedback. Then decide what to build next.

---

## Additional Resources

- Next.js docs: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com
- Vercel deployment: https://vercel.com/docs
- GitHub Pages: https://pages.github.com
- Open source guide: https://opensource.guide

All links provided are public, no paywalls.

---

Happy building! 🚀
