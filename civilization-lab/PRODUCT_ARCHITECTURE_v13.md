# Civilization Lab v1.3 — Private Dossier & Scenario Workspace

Date: 2026-10-19. **Research prototype, not a live public marketplace, independently verified evidence service or forecasting model.**

## What was implemented
- Fourth entry mode **Private Workspace** alongside Structured Assessment, Freeform Exploration and Campaign Marketplace.
- Save a new assessment or campaign only after the user explicitly clicks a save action. Supports up to 35 local, segregated cases using a namespaced browser-storage key. Storage has no special encryption; do not enter personal, employee or child records.
- See cases in a private list; reopen them in the assessment/campaign editor, delete them individually, back up all as JSON and restore after explicit confirmation.
- Evidence ledger per case: mark a claim as support, challenge, or context; record source type, optional date and reference description. **Every item remains “self-reported, unverified”; selecting a documentary source never makes it verified.** Check for absent counterviews, absent documents and absent source locators.
- A controlled *what-if* panel with four user-editable assumptions: resource pressure (0-3), readiness to adopt change (0-3), volatility of external context (0-3), and observation horizon (30/90/180/365 days). These are discrete narrative options, not continuous predictive weights. Three cases: no planned change, one bounded intervention, alternative dominant cause. No numerical prediction/probability.
- Real observation journal using user-entered date and numeric values, with baseline, user-defined target, unit and desired direction. Feedback is descriptive; a favourable trend is not proof of intervention effects.
- Portable per-case Markdown dossier, with methodological disclaimers and observations. No automatic publication of any campaign or content.
- Continuity: preserve v1.2 marketplace under /civilization-lab/v12-hub.html and v1.1 guided interviewer under /civilization-lab/legacy-v11.html.

## Intentional limits
1. No user accounts, network syncing, moderation, crowd participation, external evidence verification, LLM inference or notifications.
2. Browser localStorage is not a secure repository for allegations, sensitive evidence, regulated data or identifiable children's information. Only use anonymized examples in public demo. Users need explicit consent and proper secure infrastructure before sharing.
3. Local campaign records are **private drafts only**, even if a user enters a real organization name; no direct publication or defamatory verdict.
4. The three scenario modes are qualitative *if–then* descriptions. Changing ordinal assumptions changes narrative conditions, not probabilities, time-series forecasts, causal effects or confidence.
5. A before/after number is an observation. Stronger causal inference requires outcome comparators, temporal context, confounders, plausible alternative explanations, safe/ethical designs and repeated measurements.

## Scientific / community governance references
- OECD Guidelines for Citizen Participation Processes: https://www.oecd.org/en/publications/oecd-guidelines-for-citizen-participation-processes_f765caf6-en.html
- CDC Program Evaluation Framework: https://www.cdc.gov/evaluation/php/evaluation-framework/index.html
- UK HM Treasury Magenta Book evaluation guidance: https://www.gov.uk/government/publications/the-magenta-book/magenta-book-central-government-guidance-on-evaluation-html
- Decidim participatory phases/components: https://docs.decidim.org/en/develop/features/components.html
- Existing project guidance: [PRODUCT_ARCHITECTURE_v12.md](./PRODUCT_ARCHITECTURE_v12.md) and [RESEARCH_PROTOCOL_v08.md](./RESEARCH_PROTOCOL_v08.md).

## Product decision for next real build
The next worthwhile work is not more decorative charts. Before public campaigns:
- Provision **Civilization-Lab-specific** backend and domain with separation from BuiTai Core, BuiEdu, BQS and other ventures.
- Build authentication, clear role-based boundaries, private assessment store and source-linked evidence with permission and consent.
- Implement **moderation + right-of-reply + appeal/takedown** workflow, detailed version/audit history and abuse prevention.
- Run usability pilots of guided assessment in a narrow organization sector; audit whether users can distinguish observation from interpretation and whether they can safely test outcomes.
- Only connect hosted AI analysis after an explicit rate/budget cap, source verification and protection of tenant/private data.
- Only add predictive quantitative charts when longitudinal data and reliable out-of-sample validation justify them.

## Verification
Node tests (v13.test.cjs) cover opt-in persistence, tenant-agnostic local case separation, source provenance, counter-evidence, qualitative scenario changes, actual measured values, invalid input handling and backup integrity. GitHub Pages pipeline runs all legacy tests and v13 tests without running paid services.
