# BuiEdu — Public Website Preview

This repository contains **only the public BuiEdu preview website**. It is not the BuiEdu AI backend, authentication service, or database.

## Website
After GitHub Pages is enabled in **Settings → Pages → Build and deployment → GitHub Actions**, the deployment workflow builds the public static site from `main`.

Expected website after a successful Pages deployment: https://buithinh2000.github.io/buiedu-preview/

## Status
- Vietnamese/English responsive website
- Rule-based, browser-only sample plan
- **No actual AI agent or sign-in enabled**
- No customer details, server credentials, tokens, backend code, or private BuiTai Core assets

## Maintaining the preview
Website assets are managed in this repository on `main`. Changes to the website trigger the short GitHub Pages workflow. The canonical BuiEdu product development and decision history remains in the private BuiTai repository under `ventures/buiedu/`.

**buiedu.com is not pointed here.** Domain cutover requires owner review and separate Cloudflare changes.

## First deployment — one GitHub setting required

The first GitHub Actions run failed at `actions/configure-pages@v5` with `Get Pages site failed: Not Found`. This means GitHub Pages has not been enabled for this new repository. The source build step passed.

Open https://github.com/buithinh2000/buiedu-preview/settings/pages and choose **Build and deployment → Source → GitHub Actions**. This is a one-time repository setting. After that, the failed workflow may be rerun from GitHub Actions; future website changes on main will auto-deploy.

The preview URL is expected to be `https://buithinh2000.github.io/buiedu-preview/` only AFTER successful deployment. Do not confuse that expectation with a confirmed live site.
