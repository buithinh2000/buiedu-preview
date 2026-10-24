# Civilization Lab — P1 staging handoff to BuiTai Core

Date: 2026-10-25. Venture: civilization-lab. Scope: independent PRIVATE workspace first, NOT public Marketplace launch.

## Current verified state
- Source: civilization-lab/backend/src/service.cjs, http.cjs, dynamo-repository.cjs, lambda.cjs.
- AWS SAM draft: civilization-lab/backend/template.staging.yaml.
- Offline CI: 30/30 tests PASS (run 40141757301).
- No real AWS stack, Cognito provider, DynamoDB table, Lambda or Cloudflare staging route has been created.
- Frontend remains v1.4 static preview. It is NOT connected to this API.
- Code lives in an isolated directory within the temporary buiedu-preview repository; it is not a dedicated venture repo yet.
- No paid AI API, Supabase, Render or secret has been used.

## BuiTai Core deployment orchestration contract

The platform-level venture provisioner should manage centralized deployment, rather than asking the Owner to configure every new venture manually.

Inputs needed from centralized provisioning:
- Unique venture slug civilization-lab.
- AWS account alias/ID selected by Owner; avoid root credentials.
- Deployment region selected by Owner. The SAM template reads region from AWS CloudFormation; does not pin it.
- Maximum permitted estimated spend per month and escalation gate. This is not approved yet.
- OIDC issuer and audience/client ID for a proper OAuth **access token**. A scope civilization:member must be granted to authenticated members by an authorized identity provider.
- Dedicated least-privilege deployment role (temporary AssumeRole/OIDC), no broad BuiTai Core admin role.
- Approved Cloudflare staging hostname and CORS origin, separately from the main domain and BuiEdu.
- Retention/deletion conditions for disposable staging data, including backup and privacy policy.

Owner Gates:
A. Read-only account/region/IAM inventory and cost estimate: permissible after confirming centralized connection, but no resource creation.
B. Approve a specific AWS CloudFormation change set, estimated cost, named IAM resources, OIDC trust and timeout/concurrency/quota.
C. Execute staging only with explicit Owner authorization. Never create an AWS account, grant IAM, activate a billable API or move a venture into Core implicitly.
D. Production/Public Marketplace is a **different Gate** after moderation, right of reply, redaction, anti-abuse and independent human validation exist.

## Conservative staging rollout
1. Dedicated repository or release artifact isolated from the preview repo; keep public GitHub Pages artifact free of backend sources.
2. Run Node 22 syntax and 30+ offline tests; validate SAM transformation and dependency installation during packaging. No deployment before this is green.
3. Create a scoped staging IAM role and private DynamoDB table via approved change set only.
4. Provision verified JWT authorizer and member identity provider. The template DOES NOT create the identity provider or verify tokens in Lambda; API Gateway must do that.
5. Staging SAM permits ONLY authenticated private-case and private-campaign endpoints. It does **not** expose publication, moderation, or public browse routes even though later API domain functions have been written.
6. Run 2-account E2E: member A create/read/edit own case; member B denied A's case; submitted campaign remains private. Race two updates and verify VERSION_CONFLICT, never lost write.
7. Verify anonymous and expired JWT requests fail at API Gateway, and direct Lambda invocation is not publicly permitted.
8. Monitor CloudWatch usage / AWS costs; enforce backend traffic throttling, Lambda reserved concurrency, database budget alarms. AWS Budgets are alerts, not hard limits.
9. Only after successful staging E2E, connect authenticated frontend under staging Cloudflare hostname. No migration of BuiEdu/Render data needed.

## Blocking items at end of current session
- No direct AWS or Cloudflare deployment connector is available here.
- No dedicated civilization-lab GitHub repository exists (GitHub connector does not expose repository creation in this chat).
- Approved AWS account/region/cost ceiling/issuer/audience are not yet resolved for this venture.
- AWS SAM template has passed static source tests, but has NOT been validated via sam build/sam validate, packaged or applied to AWS.
- Need production-grade audit records, verified right of reply, PII/privacy policy, moderation, abusive-content safeguards, and reliable data retention before public campaigns.

## Non-negotiable architecture
Data from family/school/private assessments never enters a public index; campaign names referencing real organizations remain blocked pending rights and review. Public participation should expose only human-reviewed, redacted extracts with appeal and takedown. No simulated vote counts or unverifiable causal forecasting.
