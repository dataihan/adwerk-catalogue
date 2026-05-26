# Adwerk Brand Catalogue

Live at: https://adwerk-catalogue.netlify.app

## How data updates work

```
Google Sheet (source of truth)
    ↓  Google Apps Script (auto runs every hour)
GitHub: data/campaigns.json
    ↓  Netlify auto-deploys on file change (~30 seconds)
Live website updates
```

## Files
- `index.html` — the catalogue app (never needs to be edited manually)
- `data/campaigns.json` — data file pushed by Google Apps Script
- `google_apps_script.js` — paste into Google Sheet → Extensions → Apps Script

## Setup steps (one-time)
See SETUP.md
