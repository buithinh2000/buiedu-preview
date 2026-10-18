# Civilization Lab v1.2 — Systems & Collective Intelligence Hub

Date: 2026-10-19. **Status: static interactive preview, not a public participation network, a validated assessment instrument, an AI diagnostic tool or a scientific forecasting model.** Civilization Lab is a venture separate from BuiTai Core and other projects.

## Product decision: Three entry paths, one evidence protocol
1. **Structured Assessment:** research-informed sector-specific templates with prompts for actual incidents, strengths, alternate explanations, affected stakeholders, evidence, desired outcomes and measures. Templates are designed by Civilization Lab; NOT officially certified diagnostic scales.
2. **Open Exploration:** free narration with optional structure. The v1.2 local rule engine only maps the selected template/lens and identifies missing evidence; the free text is not deeply interpreted by an LLM. It must never pretend to discover causes from sparse narration.
3. **Campaign Marketplace:** a space to propose improvement and explore uncertain futures, not a leaderboard naming "bad organizations". A campaign represents an observed service/system question and a change proposal, not a verified accusation. Static demo provides fictitious examples and private in-tab drafts only.

## Why this approach
- AAPOR best practices: use clear unbiased questions, one construct per question, sensible sequence, voluntary unknowns, comprehension testing. https://aapor.org/standards-and-ethics/best-practices/
- OECD Guidelines for Citizen Participation Processes (2022): planning, selecting appropriate participation methods, inclusive stakeholder voices, impact/accountability, transparency/privacy, evaluation and feedback. https://www.oecd.org/en/publications/oecd-guidelines-for-citizen-participation-processes_f765caf6-en.html
- Decidim participatory components: proposal creation wizard, collaborative drafts, amendments, deliberation, decisions and outcome monitoring; dynamic phases. https://docs.decidim.org/en/develop/features/components.html and https://docs.decidim.org/en/develop/admin/spaces/processes.html
- Polis: perspective mapping / minority viewpoints and common ground; votes represent viewpoints, not fact validation. https://pol.is/home and https://compdemocracy.org/opinion-groups/
- Existing Civilization Lab v0.8 research on systems thinking, programme evaluation, evidence quality and causal inference: [RESEARCH_PROTOCOL_v08.md](./RESEARCH_PROTOCOL_v08.md).

## Campaign lifecycle (future hosted system, not implemented)
**Private draft → submit request for review → safety / privacy / defamation screening → request right of reply from named organization → verify evidence provenance → publish bounded question & proposal (if approved) → accept alternative perspectives and counter-evidence → deliberate / co-design → choose small reversible trial → monitor actual outcomes → correct, archive or withdraw.**
- A published proposal must show method, sponsor/interest conflicts, date, history, response opportunities and known missing evidence.
- Human moderation handles allegations; automatic model flags are NOT findings. No public campaign involving private family or identifiable student data without appropriate legal/safeguarding basis; the demo blocks publication for everybody.
- A vote indicates interest or preference, not objective truth. No fabricated popularity counts.
- No unauthorized calls, harassment, targeting people, doxxing, fraud, organized manipulation or campaigns encouraging retaliatory harms.
- Forum replies should support four types: idea, counter-explanation, evidence request and risk/undesired consequence. Future moderation and rate limiting required.

## Simulation policy
Three **qualitative** branches: unchanged planned intervention, one small change and an alternative dominant explanation. A future can improve, worsen or remain steady in each branch.
- No quantitative future percentage, impact probability, confidence bound or estimated timing without calibrated longitudinal data and an identifiable/defensible causal model.
- Users select outcomes and empirical metrics; a claim of source availability is not verified evidence.
- Real effect estimation requires comparative cases, context, confounder investigation and follow-up; do not claim cause solely from pre/post changes.

## What is actually in the v1.2 preview
- 6 sectors; 7 guided assessment templates and freeform path.
- Evidence completeness hints, three labeled qualitative scenarios, hypothetical mechanisms and source caveats.
- Marketplace browsing/search/filter with three wholly fictitious seed scenarios.
- Local-only campaign drafts, explicit source/other-side fields, review warnings, local contributions, JSON export.
- V1.1 guided questionnaire remains available as a separate linked entrypoint, and Business Case Studio remains accessible via legacy page.
- Front end has no account system, email invitations, global voting, database, AI gateway, multi-user community, real-time interaction or predictive computation.
- GitHub hosts static assets; user-submitted drafts in the app are not automatically published or synced. No public uploads.

## Release gates for real marketplace / SaaS
1. Define privacy impact assessment, safety policy, content takedown and appeals, right-of-reply policy, organization verification.
2. Provision separate AWS/Cloudflare backend for Civilization Lab with authenticated tenant/user roles and evidence provenance; strict separation from BuiEdu and other venture datasets.
3. Moderation queue with audit logs, report/remove requests, anti-spam protections, decision traces and explicit review of high-risk claims.
4. Run comprehension and fairness tests, then a narrow pilot on a low-risk public-interest proposal domain (e.g., anonymized service access rather than named allegations).
5. Add evidence-linked community deliberation (possible inspiration: Decidim/Polis) including minority views; do not infer consensus from raw vote count without representative sampling.
6. Collect measured outcome time series and ethically compliant comparisons; validate prediction methods before exposing numeric forecasts.
7. Only then build audited, rate-limited AI reasoning gateway with user-approved costs, privacy controls and source validation.

## Acceptance tests
- Switching between assessment types never changes data into verdicts.
- User-entered text cannot become a verified allegation or public content merely by clicking Create.
- Sensitive sectors remain non-publishable on static preview; no publish button.
- Demo examples are labeled fictitious, not represented as real organizations.
- Contributions are local-only and marked as suggestions, evidence requests or counterviews.
- No API keys, paid calls or cross-venture databases in static code.
