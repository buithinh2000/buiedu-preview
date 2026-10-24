# Civilization Lab — Backend P0 (source-only, not deployed)

25 October 2026. Independent venture at civilization-lab/backend. Backend files are NEVER part of the public GitHub Pages artifact. This is a source-level API and security test harness, NOT a hosted service or working community marketplace.

## Implemented
- src/service.cjs — owner-only assessments, campaign drafts, owner editing, consent-based submission, protected family/school sectors, independently reviewed publication, suspension of public excerpts.
- src/http.cjs — prospective API Gateway JWT Lambda adapter. Reads authenticated identity only from requestContext.authorizer.jwt.claims, never from request body or Authorization string.
- test/service.test.cjs — offline regression tests with in-memory repository. No AWS calls or paid APIs.

## Source-only API paths
POST /v1/private/cases — owner
GET /v1/private/cases — owner-scoped list
GET or PATCH /v1/private/cases/{id} — owner
POST /v1/private/campaigns — owner
GET or PATCH /v1/private/campaigns/{id} — owner; edits only private drafts or changes requested
POST /v1/private/campaigns/{id}/submit — owner consent + protected-sector gate
POST /v1/moderation/campaigns/{id}/decision — independently scoped reviewer
GET /v1/moderation/campaigns/{id}/audit — reviewer
POST /v1/publication/campaigns/{id}/publish — independent publisher
POST /v1/moderation/campaigns/{id}/suspend — reviewer
GET /v1/public/campaigns and /v1/public/campaigns/{id} — approved, hand-curated excerpts only

The campaign submitter, reviewer and publisher must be different subjects. Named real organizations are blocked from public approval until genuine right of reply exists. Family and school cases do not enter the public review route.

## Mandatory production gates

1. Identity: API Gateway JWT authorizer MUST validate trusted issuer, audience, signature, expiry and route-specific scopes. The source code does not validate JWT signatures independently. The event's claims are trusted ONLY behind correctly configured JWT authorization and a restricted Lambda invoke policy. Direct Lambda invocations, a public function URL, or missing API Gateway authorizers would make it unsafe.
2. Token scopes: civilization:moderate and civilization:publish must be assigned by an authorized identity provider, never a user-controlled body or header.
3. Persistence: memoryRepository is FOR TESTS ONLY and is neither durable nor concurrency-safe. Production uses a dedicated Civilization Lab DynamoDB table, indexed owner reads, server-side public projection, and conditional version writes. No unrestricted Scan queries for public listings.
4. Audit: the test event history is mutable, not tamperproof. Real moderation requires independently logged actors, append-only version history, time, source snapshot, explicit decision and appeal/takedown.
5. Content: title/summary moderation in P0 does not verify evidence, identify named organizations hidden in free text, or run actual human review. Therefore no public exposure or deployment before independent review, evidence validation, redaction, consent and right-of-reply.
6. Production safety: request quotas, consent, privacy retention/deletion, abuse reporting, quarantined uploads, XSS-safe rendering, CSP, throttling, object-level authorization, backup/recovery and incident response must be in place.
7. Budget: AWS Budgets provides alerts, not a hard spending limit. Gate staged cloud resources on Owner approval of the account, region, monthly estimate, IAM least privilege, concurrency and traffic limits.

## Proposed P1 architecture (NOT built or deployed)

Dedicated GitHub repo and own Cloudflare frontend. HTTP API Gateway with JWT authorizer -> AWS Lambda -> dedicated DynamoDB table (case records, campaign drafts and moderated public extracts); isolated S3 for separately consented evidence if necessary. Separate GSI on owner identity and approved-public content. Implement DynamoDB conditional writes using version fields so a simultaneous edit, approval, publication or suspension cannot overwrite a newer state. Route scopes and Lambda invoke permissions must be locked to Civilization Lab. Never reuse BuiEdu, Core, BQS or other venture identities, budgets or databases.

Production implementation is not ready until an actual audited human-moderation pipeline and verified reply invitations exist. No AWS, Cloudflare API or paid model was invoked as part of this P0.

## Repeatable checks

node --check civilization-lab/backend/src/service.cjs
node --check civilization-lab/backend/src/http.cjs
node --test civilization-lab/backend/test/service.test.cjs

AWS technical sources:
- https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html
- https://docs.aws.amazon.com/us_en/amazondynamodb/latest/developerguide/BestPractices_OptimisticLocking.html


## P1 source additions (25 October 2026)

- `src/dynamo-repository.cjs`: AWS SDK v3 DocumentClient adapter using conditional version writes. In-memory tests verify conflict rejection and owner-scoped GSI queries. For public listing, re-reads each GSI candidate from the base table with strong consistency before releasing it, to prevent stale suspended records appearing.
- `src/lambda.cjs`, `package.json`: deferred AWS Lambda entrypoint and explicit SDK dependencies for a future packaged deployment.
- `template.staging.yaml`: PRIVATE ONLY AWS SAM draft. JWT authorizer and required member scope on every exposed route; 2 rps/4 burst API settings and reserved Lambda concurrency 2; venture-specific DynamoDB GSIs and a limited IAM policy. No moderator, publisher or public campaign route in this staged template.
- `test/dynamo.test.cjs`, `test/staging.test.cjs`: offline index/locking/privacy and staging guard tests. Latest verified CI: 30/30 tests passed, GitHub Actions run 40141757301 (prior to this documentation update).
- `BUI_TAI_CORE_P1_HANDOFF_2026-10-25.md`: centralized platform provisioning/Owner Gate contract, reusable for future ventures.

P1 is **source-complete for a disposable private-data staging experiment**, not production-ready. The SAM template has not undergone an actual SAM build, CloudFormation change-set review, signed-in end-to-end test, or AWS deployment. No live backend URL exists. AWS and Cloudflare remain unchanged.

### Read before AWS staging

The code trusts JWT claims passed by API Gateway **only if a correctly configured authorizer validated the token**, all private routes require an authenticated access token, and direct Lambda invocation is restricted. It does not implement its own JWT cryptography.

DynamoDB indexes are eventually consistent, so any public-list candidate must be checked again from the primary table with strongly consistent read. Optimistic versions prevent lost updates, but a production publication flow still requires durable audit/transaction safeguards, identity/organization verification, moderated content, consent, abuse response and deletion/retention policy.

AWS staged resources are potentially billable despite small limits. Budget alerts do not impose a hard cost ceiling. The launch requires approval of AWS account, region, OIDC issuer/audience, designated IAM deploy role, exact change set and monthly spend threshold. To date none has been executed.
