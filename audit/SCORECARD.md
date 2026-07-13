# SCORECARD — Forged Landscapes

_0–100, one line of justification. Baseline = today (pre-fix). Re-score after each execution stage. Nothing ships "done" below 80 without an explicit accepted trade-off._

| Category | Score | Justification |
|---|---:|---|
| **Security & data protection** | **88** | RLS enabled on all 14 tables; **live anon test: every PII table returns `[]`**; no secret in client bundle; zod + rate-limit + `is_admin()` on every route. Held back by in-memory rate limit, no Turnstile, one moderate dev-dep vuln. |
| **Technical SEO** | **82** | Per-page metadata + canonicals; LocalBusiness/Service/FAQ/Article/Breadcrumb schema; sitemap/robots/OG image; 12 genuinely-local town pages + 3 guides. Missing `Review` schema + the 60-page service×town depth. |
| **Staff / portal usability** | **76** | Rich CRM: lead desk, drawer triage, assignment, team status board, messaging, AI quoter, rates, gallery, settings. Held back by no owner reporting screen and notifications not firing. |
| **Front-end performance** | **72** | Mostly Static/SSG; clean build. Held back by `/work` SSR, unmeasured bundle/CWV, Leaflet + assessor shipped site-wide. |
| **Visitor usability** | **70** | Excellent brief flow (autosave, photos, sketch, resume); tap-to-call; clear post-submit copy. Held back by no instant acknowledgement and thin trust proof. |
| **Design & brand** | **68** | Coherent premium token system, consistent marketing↔admin. Undercut by **stock imagery**, empty gallery, placeholder testimonials, utility-layer magic values. |
| **Accessibility** | **65** | Good foundations: focus-visible rings, `prefers-reduced-motion`, semantic HTML, labelled fields. No formal WCAG audit; contrast + drawer focus-trap risks unverified. |
| **Scalability** | **62** | Static site + free-tier stack scale well; RLS holds. Held back by no observability, in-memory rate limit, no load test, single email path off. |
| **Conversion readiness** | **55** | Strong structure, but **no analytics live, no real proof, no speed-to-lead automation** — can't measure or maximise conversion today. |
| **Observability** | **25** | Nothing installed. A silent failure in the brief flow could go unnoticed for days. Biggest single gap. |

**Weighted read:** the build is a **B+ on engineering, a C on go-to-market instrumentation.** Six categories are ≥80-adjacent or above on fundamentals; the four below 70 (conversion, scalability, a11y, observability) are all **switch-on / instrument / populate** work, not rebuilds.

### Target after Stages 1–3 (quick wins + measurement + notifications)
Conversion 55→72, Observability 25→60, Front-end 72→80, Scalability 62→72 — no category left below 60, most ≥75, on a few days of mostly-config work.
