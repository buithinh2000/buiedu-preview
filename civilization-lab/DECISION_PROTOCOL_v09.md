# Civilization Lab v0.9 — SME Decision Studio

Status: Public GitHub Pages **preview**, self-contained static frontend. No external AI inference service, no authenticated multi-user, no shared database, no medical or legal decision making. Local-only work unless the user explicitly clicks **Save to device**.

## What is implemented
1. Natural-language free-text intake and *transparent keyword-based* domain routing, with a human override.
2. Five problem domains: cash flow, project delivery, quality/rework, people/work design, customer demand.
3. Thirteen competing mechanisms, each with specific falsifying signal, two diagnostic questions, suggested data sources, bounded intervention and operational outcome measure.
4. Explicit unknown/no/yes answers; self-reported evidence origins distinguished from verified data. No "risk 73%" or invented future curves.
5. A small, reversible trial with owner role, start/end date, metric, baseline, target, side-effects and stop criterion.
6. Actual dated measurement log; direction-aware delta vs baseline; chart renders only user-provided numeric observations.
7. Private-by-default in-session data, user-initiated device save/reload, JSON import/export, CSV export with formula injection protection.
8. Automated Node tests and GitHub Pages deployment. Keep sector modules separate from BuiTai Core, CabinetOS, BQS, BuiEdu, Heritage.

## Example
Case: "Projects run late, workers await materials, cash is tight."
Research flow: identify delivery as candidate focus -> test bottleneck vs capacity vs estimates -> request waiting-time records and cross-functional perspective -> choose ONE safe process change -> monitor on-time completion rate weekly -> compare actual data, ask if delays changed because of workload, season, customer mix, staffing or unrelated shocks.

## Scientific & safety limitations
- Text matching is deterministic categorization, not deep AI comprehension. Never market it as autonomous causal intelligence.
- Diagnostic hypotheses are a structured expert-inspired library, not proven causes of a customer's specific issue. Provisional matches must not be used to infer guilt or performance of identifiable people.
- Self-declared documents do not constitute independent verification.
- Users can choose metrics/targets that are unrealistic or biased; contextualize before action.
- A pre/post change is a *temporal association*; measuring impact requires suitable controls, identification of confounders, selection bias checks, and repeated observations.
- Trial gate checks completeness of user-entered information, not independent safety approval.
- Worker health, industrial relations, tax, safety and financial obligations require qualified advice and compliance; avoid intervention that changes contractual/regulated obligations automatically.
- Browser device storage can be accessed by other users of shared devices. No PII, child information, names, employee records or private documents should be entered into the public demo.

## References
- Australian Government business.gov.au — Cash flow forecast and statement: https://business.gov.au/finance/cash-flow/set-up-a-cash-flow-statement
- Australian Government business.gov.au — Improving productivity: https://business.gov.au/planning/innovation/improving-productivity-in-your-business
- Safe Work Australia — Psychosocial hazard Job demands: https://www.safeworkaustralia.gov.au/safety-topic/managing-health-and-safety/mental-health/psychosocial-hazards/job-demands
- CDC 2024 Program Evaluation Framework: https://www.cdc.gov/evaluation/php/evaluation-framework/index.html
- Skivington et al. MRC/NIHR 2021 complex interventions: https://pmc.ncbi.nlm.nih.gov/articles/PMC8482308/

## Next release gates — do not claim deployed
1. A separate authenticated API and database for this venture only; privacy impact review and informed consent for multiparty evidence.
2. Secure LLM gateway if owner approves spending; per-user quotas, hard monthly cap, no browser keys, structured model outputs and source verification.
3. Field usability testing with consenting small-business operators; evaluate hypothesis relevance and comprehension against human expert review.
4. Longitudinal dashboards, follow-up/alerts with opt-in and accuracy audits; validated counterfactual analysis when a defensible comparison exists.
5. Maintain research versioning, reversible experiments, adverse-event monitoring, safe stopping gates, documented bias and model performance.
