# Skill Audit Web App - Implementation Checklist

## Pre-Build (Make Sure Everything is Ready)

```
[ ] Read: SKILL_AUDIT_WEB_OVERVIEW.md (understand architecture)
[ ] Read: SKILL_AUDIT_WEB_SPEC.md (understand details)
[ ] Read: PRIVACY_SECURITY_DESIGN.md (understand data handling)
[ ] Confirmed: Pure logic (no AI calls in MVP)
[ ] Confirmed: Claude in VS Code will build it
[ ] Have VS Code open
[ ] Have Claude extension installed
```

---

## Phase 1: Setup (5 minutes)

```
[ ] Create directory: mkdir skill-audit
[ ] Navigate: cd skill-audit
[ ] Open in VS Code: code .
[ ] Open Claude in VS Code (Cmd+Shift+P > Claude)
```

---

## Phase 2: Generate Code (20 minutes)

```
[ ] Copy master prompt (from MASTER_PROMPT.md)
[ ] Paste into Claude chat
[ ] Wait for generation (might take 1-2 minutes)
[ ] Review all generated files
  [ ] package.json looks right (has next, react, tailwind, next-themes)
  [ ] lib/auditEngine.ts has 8 check functions
  [ ] app/api/audit/route.ts handles GitHub URL conversion
  [ ] components/ folder has all required components
  [ ] tailwind.config.ts configured
  [ ] tsconfig.json strict mode enabled
```

---

## Phase 3: File Creation (15 minutes)

```
Setup directories:
[ ] mkdir -p app/api/audit
[ ] mkdir components
[ ] mkdir lib
[ ] mkdir public

Create config files:
[ ] Copy package.json → root
[ ] Copy tsconfig.json → root
[ ] Copy next.config.js → root
[ ] Copy tailwind.config.ts → root
[ ] Copy postcss.config.js → root
[ ] Copy .gitignore → root

Create app directory:
[ ] Copy layout.tsx → app/
[ ] Copy page.tsx → app/
[ ] Copy globals.css → app/
[ ] Copy route.ts → app/api/audit/

Create components:
[ ] Copy Header.tsx → components/
[ ] Copy AuditForm.tsx → components/
[ ] Copy DragDropZone.tsx → components/
[ ] Copy ResultsDisplay.tsx → components/
[ ] Copy RiskMeter.tsx → components/
[ ] Copy FindingCard.tsx → components/
[ ] Copy ThemeToggle.tsx → components/
[ ] Copy Footer.tsx → components/

Create lib:
[ ] Copy auditEngine.ts → lib/
[ ] Copy utils.ts → lib/
```

---

## Phase 4: Install Dependencies (5 minutes)

```
[ ] Run: npm install
[ ] Wait for completion (2-3 minutes)
[ ] Check: npm ls next (verify Next.js installed)
```

---

## Phase 5: Local Testing (15 minutes)

```
Start dev server:
[ ] Run: npm run dev
[ ] See: "http://localhost:3000"

Test UI:
[ ] Visit: http://localhost:3000
[ ] See: Header with "Skill Audit" title
[ ] See: Dark mode toggle
[ ] See: GitHub URL input field
[ ] See: Drag-and-drop zone
[ ] Page looks clean and minimal

Test GitHub URL audit:
[ ] Copy: https://github.com/sickn33/antigravity-awesome-skills/blob/main/skills/brainstorming/SKILL.md
[ ] Paste into input
[ ] Click [Audit]
[ ] See: Loading spinner
[ ] See: Results appear (risk level badge, findings)
[ ] See: 8 findings displayed

Test file upload:
[ ] Create test file:
    cat > /tmp/test.md << 'EOF'
    ---
    name: Test
    ---
    # Test Skill
    Just a test.
    EOF
[ ] Drag /tmp/test.md onto page
[ ] See: Results appear instantly (no loading bar)
[ ] Risk level: SAFE (0 findings)

Test dark mode:
[ ] Click moon/sun icon
[ ] Colors invert
[ ] Text remains readable

Test error handling:
[ ] Paste invalid URL: "not-a-github-url"
[ ] See: Error message appears
[ ] Message explains what's wrong

Test mobile:
[ ] Open DevTools (F12)
[ ] Click mobile icon
[ ] Resize to iPhone 12 width
[ ] Page looks good (responsive)
[ ] All buttons clickable
```

---

## Phase 6: Deploy to Vercel (10 minutes)

```
Install Vercel CLI:
[ ] npm i -g vercel

Login:
[ ] vercel login
[ ] Browser opens
[ ] Authenticate
[ ] Return to terminal

Deploy:
[ ] vercel deploy
[ ] Answer prompts:
  [ ] "Link to existing project?" → No
  [ ] "Set up and deploy?" → Yes
  [ ] "Project name:" → skill-audit
  [ ] "Framework preset:" → Next.js
  [ ] "Root directory:" → ./
  [ ] Rest: defaults (press Enter)
[ ] Wait for deployment (~1-2 minutes)
[ ] See: ✓ Production: https://skill-audit-xxx.vercel.app

Test live version:
[ ] Visit the Vercel URL
[ ] Paste GitHub URL
[ ] Get results
[ ] Test file upload
[ ] Toggle dark mode
[ ] Everything works same as local
```

---

## Phase 7: Git & GitHub (10 minutes)

```
Initialize Git:
[ ] git init
[ ] git add .
[ ] git commit -m "Initial commit: Skill Audit web app"

Create GitHub repo:
[ ] Go to github.com
[ ] Click "New repository"
[ ] Name: skillaudit
[ ] Description: "Free, open-source tool to audit Claude skills for security"
[ ] Public (important!)
[ ] Skip creating README/license (we'll add them)
[ ] Click "Create repository"

Add remote:
[ ] Copy the HTTPS URL from GitHub
[ ] git remote add origin [paste URL]
[ ] git branch -M main
[ ] git push -u origin main

Verify:
[ ] Visit https://github.com/YOUR_USERNAME/skillaudit
[ ] See: All your code there
[ ] See: Package.json, components, etc.
```

---

## Phase 8: Create README (15 minutes)

```
Create file:
[ ] Create: README.md (at root)
[ ] Add: Comprehensive content (see CLAUDE_IN_VSCODE_BUILD_GUIDE.md section Phase 8)

Commit:
[ ] git add README.md
[ ] git commit -m "Add comprehensive README"
[ ] git push
```

---

## Phase 9: Optional - Add License

```
Add MIT License:
[ ] Create: LICENSE (at root)
[ ] Content:
    MIT License
    
    Copyright (c) 2024 [Your Name]
    
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction...
    
    [Full MIT text: https://opensource.org/licenses/MIT]

Commit:
[ ] git add LICENSE
[ ] git commit -m "Add MIT license"
[ ] git push
```

---

## Phase 10: Final Verification

```
Local version:
[ ] npm run dev works
[ ] All features work
[ ] No errors in console

Live version:
[ ] Vercel URL is accessible
[ ] All features work
[ ] Performance is good (<2s for GitHub audits)
[ ] Dark mode works

GitHub repo:
[ ] Code is public
[ ] README is visible
[ ] LICENSE is visible (if added)
[ ] All files are there

README quality:
[ ] Clear description
[ ] Quick start instructions
[ ] Feature list
[ ] Risk level explanation
[ ] Tech stack documented
[ ] Privacy statement
[ ] License mentioned
[ ] Links to GitHub, Vercel
```

---

## Phase 11: Optional - Custom Domain

```
If you want skillaudit.dev:
[ ] Buy domain (~$10/year from GoDaddy, Namecheap, etc.)
[ ] In Vercel dashboard:
  [ ] Project > Settings > Domains
  [ ] Add your domain
  [ ] Vercel gives DNS instructions
[ ] Update DNS at registrar
[ ] Wait 15 minutes for propagation
[ ] Test: skillaudit.dev loads

Otherwise:
[ ] Skip this step
[ ] Use vercel.app URL (free, works fine)
```

---

## Phase 12: Share & Gather Feedback

```
GitHub:
[ ] Add GitHub topic: "skill-audit", "claude", "security"
[ ] Write GitHub Discussions intro
[ ] Enable Issues for bug reports

Communities (optional):
[ ] HackerNews: "Show HN: Free tool to audit Claude skills"
[ ] Twitter/X: Share link, tag @Anthropic
[ ] Claude communities: Reddit, Discord
[ ] Your network: Email friends, colleagues

Request feedback:
[ ] "Does it work for you?"
[ ] "Any skills it missed?"
[ ] "Features you'd like?"
[ ] "Would you use this?"
```

---

## Success Criteria

```
✓ Local dev works (npm run dev)
✓ Live on Vercel (URL accessible)
✓ GitHub code is public
✓ README explains everything
✓ 8 security checks work correctly
✓ GitHub URL audit works
✓ File upload audit works
✓ Results are accurate
✓ Dark mode works
✓ Mobile responsive
✓ Error handling works
✓ No console errors
✓ Performance: <2s per audit
✓ Open source (MIT license)
✓ No costs ($0)
✓ Privacy by design (no data storage)
```

---

## Troubleshooting During Build

### npm install fails
```bash
rm package-lock.json
npm install
```

### "Cannot find module"
```bash
# Make sure all files are created in right locations
# Check file names match import statements
```

### API returns 500 error
```bash
# Check app/api/audit/route.ts exists
# Verify it's in correct path: app/api/audit/route.ts
# Not: components/api/ or anywhere else
```

### Dark mode doesn't work
```bash
# Ask Claude in VS Code: "Fix dark mode in next-themes"
# Verify: layout.tsx has <ThemeProvider>
# Verify: ThemeToggle.tsx properly imports next-themes
```

### Vercel deploy fails
```bash
# Run locally: npm run build
# Fix any errors it shows
# Then: vercel deploy
```

### Can't push to GitHub
```bash
# Verify: git remote -v (shows origin URL)
# Verify: You have GitHub auth set up
# Try: git push -u origin main
```

---

## Post-Launch (After Live)

```
Day 1:
[ ] Test live site thoroughly
[ ] Share with 2-3 people for feedback
[ ] Fix any bugs that appear
[ ] Monitor GitHub Issues

Week 1:
[ ] Gather feedback
[ ] Fix reported bugs
[ ] Consider feature requests
[ ] Document learnings

Month 1:
[ ] Share more broadly (HackerNews, Twitter)
[ ] Monitor usage patterns (check Vercel logs)
[ ] Decide on next features
[ ] Consider Phase 2 roadmap
```

---

## Total Time Estimate

| Phase | Time |
|-------|------|
| Setup | 5 min |
| Generate (Claude) | 20 min |
| Create files | 15 min |
| Install deps | 5 min |
| Test locally | 15 min |
| Deploy to Vercel | 10 min |
| Git + GitHub | 10 min |
| Create README | 15 min |
| Verification | 10 min |
| **Total** | **~2 hours** |

(Plus optional: domain setup, sharing, etc.)

---

## Ready to Start?

1. **Read the three key docs:**
   - SKILL_AUDIT_WEB_OVERVIEW.md
   - PRIVACY_SECURITY_DESIGN.md
   - CLAUDE_IN_VSCODE_BUILD_GUIDE.md

2. **Keep this checklist open** while building

3. **Follow phase by phase** (don't skip ahead)

4. **Ask Claude in VS Code** if anything breaks

5. **You'll have a live, open-source tool in ~2 hours**

---

**Let's build something great.** 🚀
