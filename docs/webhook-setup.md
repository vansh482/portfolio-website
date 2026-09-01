# Webhook Setup — Auto-Rebuild Portfolio on Push

This guide explains how to configure your GitHub repos so that pushing to **any** of them triggers a rebuild of your portfolio site.

---

## Overview

```
Push to any repo → GitHub Actions fires repository_dispatch → portfolio-website rebuilds → GitHub Pages deploys
```

---

## Step 1: Create a GitHub Personal Access Token

The portfolio build needs a token to read your public repo data (repos, events, languages) from the GitHub API.

1. Go to [github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta) (fine-grained tokens)
2. Click **Generate new token**
3. Settings:
   - **Token name:** `portfolio-build`
   - **Expiration:** 90 days (set a calendar reminder to rotate)
   - **Repository access:** "All repositories" (or select specific ones)
   - **Permissions → Repository permissions:**
     - **Contents:** Read-only
     - **Metadata:** Read-only (selected by default)
4. Click **Generate token** and copy it immediately

> **Why fine-grained?** Classic tokens grant broad access. Fine-grained tokens are scoped to exactly what the build needs (read-only public repo data).

---

## Step 2: Add Secrets to the Portfolio Repo

The portfolio repo needs one secret for API calls during build.

1. Go to [github.com/vansh482/portfolio-website/settings/secrets/actions](https://github.com/vansh482/portfolio-website/settings/secrets/actions)
2. Click **New repository secret**
3. Add:
   - **Name:** `GH_API_TOKEN`
   - **Secret:** paste the token from Step 1
4. Click **Add secret**

---

## Step 3: Enable GitHub Pages

1. Go to [github.com/vansh482/portfolio-website/settings/pages](https://github.com/vansh482/portfolio-website/settings/pages)
2. Under **Source**, select **GitHub Actions**
3. Save

The deploy workflow (`.github/workflows/deploy.yml`) handles the rest automatically.

---

## Step 4: Add Webhook Trigger to Other Repos

For each repo you want to trigger a portfolio rebuild on push, add this workflow file:

**File: `.github/workflows/notify-portfolio.yml`**

```yaml
name: Notify Portfolio
on:
  push:
    branches: [main]
jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger portfolio rebuild
        env:
          TOKEN: ${{ secrets.PORTFOLIO_TOKEN }}
        run: |
          curl -X POST \
            -H "Authorization: token $TOKEN" \
            -H "Accept: application/vnd.github.v3+json" \
            https://api.github.com/repos/vansh482/portfolio-website/dispatches \
            -d '{"event_type": "rebuild"}'
```

### Add the PORTFOLIO_TOKEN secret to each repo

Each repo that triggers rebuilds needs a token with permission to dispatch events on the portfolio repo.

1. Go to that repo's **Settings → Secrets → Actions**
2. Add a new secret:
   - **Name:** `PORTFOLIO_TOKEN`
   - **Secret:** paste the same token from Step 1 (or create a separate one with `contents:write` on the portfolio repo only)
3. Click **Add secret**

> **Tip:** To avoid adding secrets to every repo individually, you can create an **Organization secret** or use a **GitHub App** instead. See the "Scaling" section below.

---

## Step 5: Test the Webhook

### Test locally

```bash
# Build with your token to verify API calls work
GITHUB_TOKEN=ghp_your_token_here npm run build
```

### Test the dispatch manually

```bash
curl -X POST \
  -H "Authorization: token ghp_your_token_here" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/vansh482/portfolio-website/dispatches \
  -d '{"event_type": "rebuild"}'
```

A successful dispatch returns **HTTP 204** (no content). Check the [Actions tab](https://github.com/vansh482/portfolio-website/actions) to see the triggered workflow.

### Test end-to-end

1. Push a commit to a repo that has the notify workflow
2. Go to that repo's Actions tab — you should see "Notify Portfolio" run
3. Go to the portfolio repo's Actions tab — you should see "Deploy to GitHub Pages" triggered by `repository_dispatch`
4. Once it completes, check your live site

---

## How It All Fits Together

```
vansh482/some-project (push to main)
  └→ .github/workflows/notify-portfolio.yml runs
       └→ calls GitHub API: POST /repos/vansh482/portfolio-website/dispatches
            └→ portfolio-website: deploy.yml triggers on repository_dispatch
                 └→ npm run build (fetches fresh data from GitHub API)
                      └→ deploys dist/ to GitHub Pages
```

### What triggers a rebuild

| Trigger | When |
|---------|------|
| Push to portfolio-website main | Direct changes to the site |
| `repository_dispatch` from any repo | Push to any repo with the notify workflow |
| Daily cron (6 AM UTC) | Safety net — catches any missed webhooks |

---

## Scaling: Beyond Per-Repo Workflows

Once you have many repos, adding the notify workflow to each one gets tedious. Options:

### Option A: Organization-level webhook (if you use a GitHub org)
Set up one webhook at the org level that fires on all push events.

### Option B: GitHub App
Create a GitHub App installed on your account. It automatically receives push events from all repos — no per-repo configuration needed. This is the cleanest long-term solution.

### Option C: Rely on the daily cron
The deploy workflow runs daily at 6 AM UTC regardless. If you don't push to non-portfolio repos frequently, this may be enough.

---

## Token Rotation

Fine-grained tokens expire. When yours does:

1. Generate a new token (Step 1)
2. Update `GH_API_TOKEN` in the portfolio repo
3. Update `PORTFOLIO_TOKEN` in all repos that trigger rebuilds
4. Set a new calendar reminder

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build succeeds but data is empty | Check that `GH_API_TOKEN` secret is set and the token hasn't expired |
| Dispatch returns 404 | The token doesn't have permission on the portfolio repo, or the repo name is wrong |
| Dispatch returns 422 | The `event_type` doesn't match — must be `"rebuild"` exactly |
| Pages deploy fails | Check Settings → Pages → Source is set to "GitHub Actions" |
| API rate limit (403) | The token may be invalid. Unauthenticated limit is 60 req/hr; authenticated is 5000 |
