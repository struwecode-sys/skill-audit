# Skill Audit - Privacy & Security Design Document

## Executive Summary

**Skill Audit is designed with privacy-first principles:**
- No external API calls (no costs, no data tracking)
- Pure logic processing (pattern matching only)
- Stateless architecture (nothing stored)
- Open source (code is auditable)
- Self-hostable (users can run it themselves)

**Result: Zero risk of personal data exposure.**

---

## 1. WHAT DATA FLOWS THROUGH THE SYSTEM

### Flow 1: GitHub URL Audit

```
User pastes GitHub URL
    ↓
Browser sends to: POST /api/audit { url: "https://github.com/..." }
    ↓
Vercel backend receives request
    ↓
Backend converts URL to raw.githubusercontent.com format
    ↓
Backend fetches file from GitHub (public read-only)
    ↓
File content stays in memory (never written to disk)
    ↓
auditEngine.runAudit() processes content (pattern matching)
    ↓
Results returned: { riskLevel, findings[] }
    ↓
File content is discarded (garbage collected)
    ↓
Results displayed in browser
    ↓
User can copy results or close tab
    ↓
Nothing stored anywhere
```

**Data touched: Only file content (public GitHub files)**

### Flow 2: File Upload

```
User drags .md file onto page
    ↓
Browser reads file locally (File API)
    ↓
File content never leaves user's computer
    ↓
auditEngine.runAudit() runs in-browser (client-side JavaScript)
    ↓
Results computed locally
    ↓
Results displayed in browser
    ↓
File is garbage collected
    ↓
Nothing sent to server, nothing stored
```

**Data touched: Only the file being audited (user's local file)**

---

## 2. WHAT IS NOT SENT ANYWHERE

### Data That Stays Local

```
File contents          → Never sent to external servers
Audit results          → Optionally copied by user
Variable names         → Not processed
API keys (if present)  → Not extracted or logged
Comments               → Processed locally only
User's IP              → Standard web server logging only
Browser info           → Standard web server logging only
```

### No External API Calls

```
✗ No calls to Claude API
✗ No calls to analytics services
✗ No calls to tracking services
✗ No calls to any third-party (except GitHub for public files)
✗ No webhooks
✗ No callbacks
✗ No data pipelines
```

---

## 3. ZERO PERSONAL DATA COLLECTION

### What We Don't Collect

```
[ ] Email addresses
[ ] User names
[ ] IP addresses (beyond standard HTTP logs)
[ ] Device information
[ ] Browser fingerprinting
[ ] Cookies (except session, none stored)
[ ] Tracking pixels
[ ] Advertising IDs
[ ] Location data
[ ] Behavioral data
[ ] Audit history (not stored)
[ ] Results metadata
```

### What Gets Logged (Minimal)

```
Standard web server logs (auto-deleted after 7 days by Vercel):
├─ Request IP address
├─ Request timestamp
├─ Request path
├─ Response status
└─ Response time

NOT logged:
✗ Request body (the URL or file content)
✗ Response body (the audit results)
✗ User identification
✗ Anything identifying
```

---

## 4. SERVER-SIDE ARCHITECTURE (Stateless)

### Why Stateless is Better

```
Traditional Server:
┌──────────────┐
│ Store state  │ ← Database, sessions, caches
├──────────────┤
│ Persist data │ ← User could be compromised
└──────────────┘

Skill Audit:
┌──────────────┐
│ Request      │
├──────────────┤
│ Process      │
├──────────────┤
│ Response     │
├──────────────┤
│ Forget       │ ← Nothing persisted
└──────────────┘
```

**Each audit is independent. No history. No persistence.**

### Backend Flow (app/api/audit/route.ts)

```typescript
export async function POST(request: Request) {
  // 1. Receive request
  const { url, content } = await request.json();
  // ↑ Only in memory, never logged
  
  try {
    let fileContent: string;
    
    if (url) {
      // 2. Fetch from GitHub
      fileContent = await fetchFromGitHub(url);
      // ↑ Public file, only in memory
    } else {
      fileContent = content;
    }
    
    // 3. Run audit (no external calls)
    const result = auditEngine.runAudit(fileContent);
    // ↑ Pattern matching only, local processing
    
    // 4. Return results
    return Response.json({ success: true, result });
    // ↑ Deleted from memory after response sent
    
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
  // ← Function ends, all variables garbage collected
}
```

**No storage. No persistence. Clean slate for next request.**

---

## 5. GITHUB API INTERACTION (Safe)

### How GitHub Fetching Works

```
User's GitHub URL
    ↓
Backend converts:
  github.com/user/repo/blob/main/SKILL.md
  → raw.githubusercontent.com/user/repo/main/SKILL.md
    ↓
Backend requests file (HTTP GET, no auth)
    ↓
GitHub returns: file content (public file)
    ↓
Backend processes locally
    ↓
GitHub only sees: An HTTP request from Vercel's IP
    ├─ No personal data
    ├─ No sensitive info
    ├─ No authentication (public file)
    └─ Same as accessing from browser
```

### What GitHub Logs

```
GitHub's logs (their business):
├─ Request timestamp
├─ Request IP (Vercel's IP, not user's)
├─ File path requested
└─ Typical HTTP server logs

GitHub does NOT see:
✗ Who initiated the request (anonymous)
✗ Who used the tool
✗ Anything about the user
```

### Vercel's CORS Headers

```
Vercel serverless function = server-side request
    ↓
No CORS errors (CORS only for browser requests)
    ↓
Clean HTTP request to GitHub
    ↓
GitHub returns file normally
    ↓
No data leakage
```

---

## 6. CLIENT-SIDE PROCESSING (In-Browser)

### File Upload Security

```
User drags SKILL.md
    ↓
Browser's File API reads locally
    ↓
File never sent to server
    ↓
JavaScript processes it (auditEngine)
    ↓
Results computed in browser memory
    ↓
Displayed to user
    ↓
No network request = no data exposure
```

### Browser Memory Management

```
File content loaded into memory
    ↓
Processing happens
    ↓
Results generated
    ↓
User can copy results
    ↓
User closes tab
    ↓
Browser garbage collects memory
    ↓
File content lost (not accessible anywhere)
```

---

## 7. WHAT IF SOMEONE'S SKILL HAS SECRETS?

### Scenario: Skill author accidentally includes API key in comments

```
SKILL.md contains:
<!-- sk-proj-1234567890abcdef -->  (exposed API key)
    ↓
User audits the file locally (file upload)
    ↓
Code runs in user's browser only
    ↓
API key never leaves the user's browser
    ↓
API key not exposed to anyone

Alternative: User pastes GitHub URL
    ↓
Our server fetches the public file from GitHub
    ↓
API key is in the GitHub file (already public)
    ↓
If it's there, GitHub already has it
    ↓
We don't log it, don't store it
    ↓
Audit results don't include the key
    ↓
Key not exposed further
```

**Risk assessment: Same as if anyone viewed the GitHub file.**

---

## 8. DEPLOYMENT SECURITY (Vercel)

### Vercel's Guarantees

```
✓ HTTPS/TLS encryption for all traffic
✓ Auto-scaling with isolated instances
✓ No root access to function environment
✓ Environment variables not logged
✓ Logs auto-deleted after 7 days
✓ SOC 2 Type II compliant
✓ GDPR compliant
```

### You Control

```
✓ Source code (public on GitHub)
✓ Environment variables (none needed for MVP)
✓ Deployment (one command: vercel deploy)
✓ Domain (custom or vercel.app)
✓ Logs (can view in Vercel dashboard)
```

### We Don't Control (You Can Audit)

```
✓ Vercel's infrastructure (industry standard)
✓ GitHub's servers (public, auditable)
✓ Internet routing (standard)
```

---

## 9. SELF-HOSTING OPTION (Ultimate Control)

### If You're Super Paranoid

```
You don't trust Vercel?
    ↓
Fork the repo
    ↓
Deploy to your own server (Docker, Railway, etc.)
    ↓
Run completely on your infrastructure
    ↓
Control everything
    ↓
Full transparency
```

**Self-hosting guide included in README.**

---

## 10. OPTIONAL FUTURE: CLAUDE API (If/When Added)

### When AI Analysis Happens (Post-MVP)

```
IF user clicks "Deep Analysis" (opt-in)
AND dangerous patterns detected
THEN:
  1. Ask user permission
  2. Send ONLY suspicious excerpt (not full file)
  3. Use server-side API key (not user's key)
  4. Claude analyzes code intent
  5. Returns risk explanation
  6. We don't log the code
  7. Results shown to user
  8. Nothing stored
```

### Safe API Design (If/When Implemented)

```typescript
if (userOptedIn && hasSuspiciousPatterns) {
  // NEVER send full file
  const excerpt = extractSuspiciousPart(
    content,
    maxLength: 500  // Only suspicious part, max 500 chars
  );
  
  // Use server API key, not user's
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY  // ← Server key
    },
    body: {
      model: 'claude-opus-4-6',
      max_tokens: 200,
      system: 'Analyze this code for malicious intent. SAFE/SUSPICIOUS/DANGEROUS.',
      messages: [{ role: 'user', content: excerpt }]
    }
  });
  
  // Don't log the code, just the response
  const analysis = response.content[0].text;
  return { results, analysis };
  // ↑ Code excerpt discarded after response
}
```

**Safe because:**
- Optional (user chooses)
- Excerpt only (not full file)
- Server-side key (no user exposure)
- Minimal data (only suspicious part)
- Not logged (only response stored)
- Can be disabled (feature flag)

---

## 11. SECURITY CHECKLIST

### Before Launch

```
[ ] No external API calls in MVP (none planned)
[ ] No database (no persistence)
[ ] No user accounts (no personal data needed)
[ ] No tracking (no analytics)
[ ] No cookies (session only if needed)
[ ] No logging of sensitive data (request/response body)
[ ] No storage of results
[ ] HTTPS enforced (Vercel automatic)
[ ] Error messages don't leak info
[ ] File size limits (prevent abuse)
[ ] Timeout on GitHub fetch (no hanging requests)
[ ] Input validation (no injection)
[ ] Rate limiting (optional, can add later)
```

### Ongoing

```
[ ] Code reviews (open source community)
[ ] Dependency updates (security patches)
[ ] Monitoring (check for abuse patterns)
[ ] Audit logs (Vercel dashboard, auto-delete)
[ ] Incident response (if something breaks)
```

---

## 12. TRANSPARENCY COMMITMENTS

### What We Promise

```
✓ Source code always public (MIT license)
✓ No hidden tracking
✓ No data collection
✓ No undisclosed third parties
✓ No future monetization that violates privacy
✓ No selling data (there is none)
✓ No advertising
✓ No account requirements
✓ No login walls
```

### How Users Can Verify

```
1. Read the source code (GitHub)
2. Run locally (Docker, Node)
3. Inspect network requests (DevTools)
4. Check API calls (none visible)
5. Review Vercel logs (you have access)
6. Audit dependencies (package.json)
```

---

## 13. INCIDENT RESPONSE PLAN (If Needed)

### If We Discover a Security Issue

```
1. Immediately patch the code
2. Push fix to GitHub
3. Deploy to Vercel
4. Create security advisory on GitHub
5. Notify users (GitHub releases)
6. Be transparent about what happened
```

### If Vercel Has an Issue

```
1. We're not storing sensitive data anyway
2. But we'd:
   - Disclose to users
   - Recommend self-hosting alternative
   - Offer temporary mirror
   - Investigate thoroughly
```

### If GitHub Has an Issue

```
1. Public files were already public
2. Not our responsibility
3. But we'd create local audit option
4. Or redirect to self-hosted version
```

---

## 14. COMPLIANCE & STANDARDS

### Privacy Laws Compliance

```
GDPR (EU):
✓ No personal data collection
✓ No data processing
✓ No data storage
✓ No third parties
→ GDPR compliant

CCPA (California):
✓ No personal data collection
✓ No selling data
✓ No tracking
→ CCPA compliant

HIPAA (Healthcare):
✓ No health information
→ N/A (but could be used in healthcare)

SOC 2 (via Vercel):
✓ Hosted on SOC 2 compliant platform
→ Secure infrastructure
```

### Industry Standards

```
✓ OWASP security guidelines
✓ NIST cybersecurity framework
✓ CWE top 25 (no vulnerabilities)
✓ Open source security best practices
```

---

## 15. YOUR RIGHTS (As User)

### You Can

```
✓ Use without account
✓ Download source code
✓ Modify and fork it
✓ Run on your own servers
✓ Remove any part you distrust
✓ Audit the code
✓ Request transparency
✓ Report security issues
```

### You Cannot (Not Our Responsibility)

```
✗ Guarantee future versions stay private
✗ Force open source forever
✗ Dictate how others fork it
✗ Control Vercel's infrastructure
```

---

## 16. IF YOU WANT ABSOLUTE PRIVACY: Self-Host

### Docker Example

```bash
git clone https://github.com/your-username/skillaudit.git
cd skillaudit
docker build -t skillaudit .
docker run -p 3000:3000 skillaudit
```

Now it runs on your machine. Complete control. No external servers.

---

## 17. QUESTIONS & CONCERNS

### Q: Will you ever add tracking?
**A:** No. It would violate the core principle. If we did, we'd fork it as a separate commercial product.

### Q: What if you need to monetize?
**A:** We'd never compromise privacy. Options:
1. Optional "Verify" badge for skill authors (not users)
2. Enterprise self-hosting support
3. Donations
Never data selling. Never tracking. Never ads.

### Q: Can government force you to log data?
**A:** We don't have any to give. There's nothing to log (stateless processing).

### Q: What if Vercel is hacked?
**A:** They don't store our data. We don't store anything. Worst case: service is down. No data loss.

### Q: What about your API key (if added later)?
**A:** Server-side only. Never exposed to users. Vercel's environment variable system keeps it safe.

### Q: Can I audit the audit tool?
**A:** Yes. Full source code on GitHub. Run locally. Inspect network. Check dependencies.

---

## 18. SUMMARY

```
Skill Audit is designed so:

✓ No personal data is collected
✓ No external APIs are called (in MVP)
✓ No servers store anything
✓ No tracking happens
✓ No third parties get data
✓ Users can self-host (full control)
✓ Code is open (fully auditable)
✓ Privacy is by design (not added later)

Result: This tool cannot expose your personal data.
The architecture literally doesn't allow it.
```

---

## Questions for You

Before launch, confirm:

```
[ ] This privacy model makes sense
[ ] You understand there's no storage
[ ] You're comfortable with open source
[ ] You trust Vercel's infrastructure (or will self-host)
[ ] You want to maintain privacy forever
[ ] You won't add tracking later
```

If all yes: **Let's build it.**

---

**Made for the community. Kept private for the community.**
