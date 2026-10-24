# Civilization Lab v1.4 — Campaign Governance & Backend Readiness

Date: 25 October 2026. Status: preview + backend design only. **No AWS resources deployed; no paid APIs, account authentication, crowdsourced publication or live moderation.**

## Delivered
- Campaign-only review rehearsal inside each private dossier. It uses the existing v1.3 local workspace and backup; does not modify BuiEdu landing or backend.
- Structured evidence/support and counter-evidence ledger; perspectives described by one user; privacy review; an optional plan for right of reply. **No external party is actually contacted.**
- Local-only workflow: private_draft → evidence_needed → response_planned → ready_for_human_review, with on_hold and archived alternatives. **There is no approved/published state.**
- The user may export a packet clearly labeled NOT_PUBLISHED, NOT_CONDUCTED, NOT_SENT and SELF_REPORTED_UNVERIFIED.
- Backward-compatible reading of old v1.3 backups, with local review event history preserved in new backups.
- Automated regression tests verify no publication ability, transition prerequisites, no false independent verification, valid restore and review-event bounds.

## Production trust boundaries — proposed, not deployed
The browser must never approve publication, authenticate reviewers, verify organizations or send invitations. All frontend flags and local event history can be altered by the user and **are not an actual audit trail**.

Before public participation:
1. Separate authenticated Civilization Lab organization/user identities; strict per-tenant ownership for private assessments.
2. Private assessments must never be exposed by the public campaign API.
3. Submitting a campaign creates a **pending review** object, not a publicly indexed post.
4. Independent human moderation handles named allegations, privacy/safety/defamation concerns, abuse reports and right of reply. The submitter must not be able to approve their own work.
5. Organization representatives reply only through a consented, verified invitation flow. A checkbox or text entered in the demo is not proof of contact.
6. Editorial decisions require signed-in reviewer identity, source provenance, explicit reasons, server-side immutable versions, retention and appeals/takedown workflow.
7. Contributions go into a moderation queue; rate limits and abuse response must be in place. Raw vote counts indicate preferences, **never objective truth**.
8. Family and school/student cases remain private by default with special safeguarding and consent rules.
9. Scenario labels remain qualitative until longitudinal data, defensible comparisons and out-of-sample validation justify quantitative predictions.

## Proposed isolated architecture
- Dedicated Civilization Lab production repository, GitHub Actions validation, own minimal AWS role/account permissions, own domain and Cloudflare front end.
- AWS API Gateway JWT authorizer (Cognito/OIDC) → Lambda → tenant-scoped DynamoDB records; encrypted S3 objects only when evidence uploads are explicitly consented; versioned review history, operational logs and abuse reporting.
- Public campaign search only indexes **moderator-approved redacted public extracts**. Private drafts and unreviewed attachments cannot be indexed.
- Never share databases, budgets, credentials, task runtimes or IAM roles with BuiEdu, CabinetOS, BQS, Heritage, Core or other ventures.
- The existing GitHub Pages path under buiedu-preview is **temporary hosting only**, not the production venture repository.

### Roles and API contract (NOT live)
- User: create/read/update own private cases; propose a campaign; never self-approve publication.
- Moderator: read assigned pending reviews, request evidence, put on hold/reject with reason. Approval needs authenticated separate publisher/reviewer controls for high-risk named allegations.
- Organization responder: respond only via verified time-bounded invitation for one campaign.
- Public reader: see redacted approved content only.

Potential routes: POST/GET/PATCH /private/cases; POST /private/campaigns; POST /private/campaigns/{id}/submit; POST /moderation/{id}/decision; POST /organization-invitations/{id}/response; GET /public/campaigns; POST /public/campaigns/{id}/contributions.

Backend must enforce JWT identity not supplied by client body, per-object authorization, size limits, safe rendering, idempotency, retention/deletion policy, external report/takedown, rate limits, replay protection, audit history and cross-tenant isolation. Verify with automated negative security tests.

## Spending and deployment gate
No AWS deployment or paid AI without Owner approval of account, region, specific services, bounded IAM policy and estimated staging spend. **AWS Budget alerts are not a hard cost cap.** Use API limits, execution timeouts, bounded Lambda concurrency and cost circuit breakers. No Render/Supabase.

## Reference methods
- OECD Guidelines for Citizen Participation: https://www.oecd.org/en/publications/oecd-guidelines-for-citizen-participation-processes_f765caf6-en.html
- Decidim participation/proposal components: https://docs.decidim.org/en/develop/features/components.html
- AAPOR survey design: https://aapor.org/standards-and-ethics/best-practices/
- Prior Civilization Lab protocol: [PRODUCT_ARCHITECTURE_v12.md](./PRODUCT_ARCHITECTURE_v12.md)
