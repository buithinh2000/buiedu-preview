# Cloudflare Pages — BuiEdu-only preview setup (Owner's one-time Git authorization)

This is a **static preview** build. It is NOT the signed-in AI Tutor, and connecting the repo does NOT approve public paid AI or custom-domain cutover.

Preverified isolated release: [GitHub Actions #40136377440](https://github.com/buithinh2000/buiedu-preview/actions/runs/40136377440).

## One-time Cloudflare Git repository connection

The assistant's current connected tools do not have the Cloudflare account API or dashboard authority. The owner must connect a Git repository once in Cloudflare if no existing Git integration is available. **No key or password should be pasted into ChatGPT.**

Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git** / **Import existing Git repository**, as shown in [official Pages Git integration guide](https://developers.cloudflare.com/pages/get-started/git-integration/).

Review these values **before Save and Deploy**:

| Cloudflare field | Value |
|---|---|
| GitHub account | `buithinh2000` |
| Repository | `buiedu-preview` |
| New Pages project name | `buiedu-preview` (only if not already used) |
| Production branch for temporary preview ONLY | `release/buiedu-cloudflare-isolated-20261025` |
| Framework preset | None |
| Root directory | repo root / leave blank |
| Build command | `bash deploy/cloudflare/build.sh` |
| Build output directory | `dist-buiedu` |
| Build environment secrets | None; do not add OpenAI keys or DB credentials |
| Custom domain | **Do not attach `buiedu.com` until authenticated AWS API, billing and smoke tests are verified.** |

The first build will publish a `*.pages.dev` preview site and should print `BUIEDU_CLOUDFLARE_BUIEDU_ONLY_STATIC_BUNDLE_VERIFIED`. Take the **actual Pages project URL from Cloudflare output**; never guess a deployment link.

### Controls

- Do not select the default `main` as BuiEdu's production branch while it bundles unrelated `civilization-lab/`; this candidate branch is intentionally isolated. The bundle has 13 reviewed product files and 2 generated static safeguards, with no `civilization-lab/` assets.
- Prefer restricting Cloudflare GitHub App to this repository rather than all account repositories. The Cloudflare repo integration can later be reused for review/prod.
- Preview remains **demo only**: `config.mjs` mode `preview`, no public API URL, `auth.mjs` always denies authentication. A `*.pages.dev` preview does not constitute public AI launch.
- The real AI/DB stays on AWS, independently isolated, with hard spending and identity approvals. The AI backend currently does **not** have a confirmed live public ingress. Keep JWT/OpenAI secrets out of Cloudflare frontend and git.
- Shared Cloudflare account and AWS authorization/policy should be coordinated with the **BuiTai Core infrastructure conversation**; BuiEdu product code stays on private PR #538.
