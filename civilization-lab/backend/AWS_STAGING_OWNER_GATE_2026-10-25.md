# Civilization Lab — AWS staging execution checkpoint
Date: 2026-10-25
Status: CODE PREPARED, CLOUD DEPLOYMENT NOT AUTHORIZED OR EXECUTED

## Why provisioning cannot proceed automatically from this ChatGPT connection
The connected GitHub integration can edit source and inspect workflows; there is no connected tool with authority to inspect or provision this user's AWS account or Cloudflare account. Do not assume an AWS account identifier, existing Cognito pool/client, domain, or budget from another venture. Do not reuse Core's privileged IAM role.

## Recommended decisions for shared BuiTai governance
- AWS region: propose ap-southeast-2 (Sydney) for Australian pilot users, subject to Owner selection.
- Auth: ask BuiTai Core provisioning to supply an existing validated issuer + venture-specific audience/scope (civilization:member) when available. Do **not** duplicate Cognito pools merely because Civilization Lab is a new venture. Tenant/data storage must be isolated even if SSO is shared.
- Separate staging resources and IAM role scoped to civilization-lab-p1-<account>-<region>.
- Starting target: estimated <= US$5/month for a low-traffic private staging pilot; this is a target, **not a guaranteed bill or enforced spending cap**. Confirm using AWS Pricing Calculator and change set.
- Frontend CORS origin: https://buithinh2000.github.io for current preview, later approved Cloudflare staging hostname.
- No public marketplace routes, real organization publications, AI paid API or evidence file uploads.

## Owner action — only a read-only inspection at first
1. Sign in to AWS Console using a non-root profile used for BuiTai deployments.
2. Select the account and region intended for the venture. Confirm the top-right account ID and displayed region. Do not share access keys or secret tokens in ChatGPT.
3. Use AWS Console → Cognito → User pools to see whether a shared BuiTai development identity service already exists. Do NOT create a new one yet.
4. Confirm the preferred deployment budget, issuer strategy and whether BuiTai Core can provide a venture-scoped provisioning role.
5. Review the prepared template.staging.yaml and the GitHub Action SAM validate/build evidence before approving any AWS CloudFormation change set.

## Gate A read-only success criteria
- Authorized account ID / intended region recorded locally; no root account.
- Existing shared IdP and scope support confirmed, or gap documented.
- Staging estimated cost, budget alerts and quota defaults reviewed.
- Explicit owner decision on the independent repository: current code is a separate backend directory in the **temporary** buiedu-preview repository, not yet a new repo.
- No AWS changes performed.

## Gate B/C — only after separate explicit approval
- Create a dedicated non-Core deployment role and **review a named CloudFormation change set** (not yet done).
- Ensure published routes are absent in SAM, user permissions verified in issuer, JWT bearer token checks and CORS browser preflight pass.
- Apply only the approved change set; smoke-test two independently authenticated accounts: A create/read/reopen/update, B cannot list or read A; conflicting update rejected.
- Enable CloudWatch and budgets with active human monitoring; use bounded concurrency, throttling and service quotas.
- Publish no campaign. Authorize public participation only under a separate review process.

## Verified source checks
- SAM template validation/build: https://github.com/buithinh2000/buiedu-preview/actions/runs/40148627481
- 37/37 backend tests: https://github.com/buithinh2000/buiedu-preview/actions/runs/40148641964
- Source README: https://github.com/buithinh2000/buiedu-preview/blob/main/civilization-lab/backend/README.md

## Blocking fact
Without a connected AWS provisioning tool or Owner action inside AWS Console, nobody in this conversation can truthfully claim AWS staging is live. Continue at Gate A; don't create more preparatory PRs just for appearance of progress.
