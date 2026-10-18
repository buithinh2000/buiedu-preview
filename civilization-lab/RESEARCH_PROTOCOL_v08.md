# Civilization Lab — Systems Intelligence Framework v0.8

Date: 18 October 2026. Status: research-first prototype, **not** a validated instrument, causal effect estimator or predictive model. The eight-dimension framework is an original synthesis for Civilization Lab, NOT an OECD, MRC, CDC, AIFS or WHO scoring instrument.

## Core product redesign
A system must be analysed starting from the outcome that matters to an affected group, not a list of personalities or symptoms. Record the system boundary, relevant people, goals, observable baseline, context, safety and time horizon. Investigate mechanisms, alternate explanations and how a monitored intervention might change outcomes. A qualitative causal pathway does NOT prove causation.

## Eight interacting dimensions
1. Outcomes: who defines success and who benefits or is left out?
2. Capacity: money, time, health, service availability, skills, care capacity and buffers.
3. Roles: authority, responsibility, capabilities, work allocation.
4. Incentives: power distribution, rewards, conflicts of interest, consequences of rules.
5. Relationships: trust, support, safety and ability to voice concerns.
6. Feedback: observability, information distortion/delay and learning from errors.
7. Context: markets, policy, infrastructure, community, access and dependencies.
8. Resilience: ability to absorb shocks, adapt and restore essential functioning.

Dimensions are not independent scores to average. Each case requires hypotheses about causal interactions, feedback loops, delays and confounders.

## Research-to-product mapping
- OECD Systemic Thinking for Policy Making, ch. 15: impacts, feedbacks, trade-offs, emergence, stakeholders, stocks/flows, causal loops and multi-scale thinking. https://www.oecd.org/en/publications/systemic-thinking-for-policy-making_879c4f7a-en/full-report/component-24.html
- MRC/NIHR complex intervention framework (Skivington et al., 2021): development, feasibility, evaluation, implementation; context, programme theory, stakeholders, uncertainties, adaptation and economic considerations. https://pmc.ncbi.nlm.nih.gov/articles/PMC8482308/
- CDC 2024 Program Evaluation Framework: assess context, describe interventions, evaluation design, gather credible evidence, support conclusions and act on findings; with rigour and ethics. https://www.cdc.gov/evaluation/php/evaluation-framework/index.html
- UK Treasury Magenta Book, updated May 2026: theory of change, competing explanations, process tracing, triangulation, evaluating contribution rather than claiming certainty. https://www.gov.uk/government/publications/the-magenta-book/magenta-book-central-government-guidance-on-evaluation-html
- OECD How's Life? 2024: outcomes today vs capital and resources for future wellbeing; individual, household and community indicators have different distributional properties. https://www.oecd.org/en/publications/how-s-life-2024_90ba854a-en/full-report/component-5.html
- AIFS 2026 rapid scoping review (136 studies) of protective factors for parent/child wellbeing: relationships, caregiver wellbeing, healthcare access, family and community support; substantial context dependence and gaps. https://aifs.gov.au/all-research/research-reports/rapid-scoping-review-protective-factors-parent-and-child-wellbeing
- WHO/UNICEF Nurturing Care: good health, nutrition, security, responsive caregiving and early learning. https://www.who.int/teams/maternal-newborn-child-adolescent-health-and-ageing/child-health/nurturing-care
- Safe Work Australia psychosocial hazards: severity, duration, frequency, work design, hazards interacting and consulting workers. https://www.safeworkaustralia.gov.au/safety-topic/managing-health-and-safety/mental-health/managing-risks/identifying-assessing-controlling-and-reviewing
- OECD 2024 drivers of trust: reliability, responsiveness, integrity, openness, fairness; assess real experiences and accountability. https://www.oecd.org/en/publications/oecd-survey-on-drivers-of-trust-in-public-institutions-2024-results_9a20554b-en/full-report/overview-new-trends-persistent-patterns-and-necessary-changes_f3abe0c7.html

## Scope and domains
Six organization types currently supported: family, company, school, community, nonprofit and public institution. Each sector has outcome-first routes and its own language/questions mapping to common mechanisms. Custom user-defined questions can be investigated using all eight dimensions.

Family covers relationships, safety, material needs, caregiver supports, healthcare access, early learning, participation and environment, not deterministic child prediction. Autism is not caused by parenting and must not be scored as moral/parental failure. Culture, ethnicity, region, religion, disability and family structure do not by themselves predict misbehavior or dysfunction.

## Assessment process
1. Define desired outcome, people affected, baseline, timeframe and urgent safety.
2. Choose the most relevant 4–5 mechanisms (or all eight for custom cases).
3. Ask observable questions with PRESENT / ABSENT / UNKNOWN, keeping unknown distinct from no.
4. Record the self-described source and perspective; a source selected as documentary or cross-checked is **not verified** by the prototype.
5. Surface gaps: missing baseline, missing longitudinal series, one-sided perspectives, unclear causal links and rival hypotheses.
6. Show three qualitatively different futures: no planned change (still may improve or worsen); targeted reversible change; alternative dominant cause. No fake future percentages, success scores or artificial probability bands.
7. Propose a safe, small, measurable intervention with stop criteria and unintended-effect monitoring.
8. Capture contributions and counter-evidence locally. Community voting is NOT a scientific truth criterion.

## Guardrails
- Privacy: assessment details stay in browser memory; no central DB. Do not enter names or identifiable health/child information. Export explicitly warns about sharing.
- No external AI inference, API use or learned predictions in this preview.
- Crisis and violence safety are priority gates. Do not advise forced mediation when coercion or violence may exist.
- Published graph edges are explanatory hypotheses, not empirically established causal pathways.
- Allegations against identifiable people are not findings; independence, due process and meaningful counter-evidence are required.
- Effects on different groups must be assessed where relevant using consented data, not stereotype assumptions.

## Roadmap and verification gates
**Implemented:** six sectors, eight dimensions, fourteen predefined focus routes, custom issue route, branching evidence interview, source/perspective claims, qualitative graph, 3 scenarios, action plan, in-session idea log, JSON export, engineering tests and static public preview.
**Not yet implemented:** live AI analysis, authenticated community, shared evidence or votes, permissioned stakeholder surveys, real dataset ingestion, longitudinal tracking service, expert review, validated measurements, formal causal inference, calibration/backtesting, controlled interventions, independent audit.
**Next gates:** interview comprehension tests; expert/affected-person review; secure separated venture datastore; longitudinal case evidence; process-tracing and identification plans; external validation and subgroup fairness audits; monitoring in production before predictive marketing.
