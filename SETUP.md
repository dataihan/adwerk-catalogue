# Setup Guide

## Step 1 — GitHub repo
1. Go to github.com → New repository → name it `adwerk-catalogue`
2. Upload all files from this folder
3. Go to Settings → Developer Settings → Personal Access Tokens → Fine-grained token
   - Name: adwerk-catalogue-sync
   - Repository access: only `adwerk-catalogue`
   - Permissions: Contents → Read and Write
   - Copy the token (save it!)

## Step 2 — Netlify
1. Go to netlify.com → Add new site → Import from Git
2. Choose GitHub → select `adwerk-catalogue` repo
3. Build command: (leave empty)
4. Publish directory: `.`
5. Click Deploy
6. In Site settings → Domain → change to `adwerk-brands.netlify.app` (or custom domain)

## Step 3 — Google Sheet
1. Create a new Google Sheet
2. Name the first sheet exactly: `Data`
3. Row 1 = headers (copy from the list below)
4. Go to Extensions → Apps Script
5. Paste the contents of `google_apps_script.js`
6. Fill in:
   - GITHUB_OWNER = your GitHub username
   - GITHUB_REPO  = adwerk-catalogue
   - GITHUB_TOKEN = the token from Step 1
7. Click Run → syncToGitHub (first run: approve permissions)
8. Run → installTrigger (sets hourly auto-sync)

## Sheet headers (Row 1, in this exact order)
Brand | Industry | Media Agency | Country | Campaign Type | Geotargeting |
Campaign Name | Start Date | End Date | Year |
Budget Impressions/Clicks | Actual Impressions | Actual Clicks |
Budget EUR (Net) | Budget Achievement (%) | CTR% |
MAIDs | # Locs | R. Targeting (m) | FootFall | FF Radius | Retargeting | Campaign Status
