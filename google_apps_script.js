/**
 * ADWERK BRAND CATALOGUE — Google Apps Script
 * Paste this into your Google Sheet: Extensions → Apps Script
 *
 * HOW IT WORKS:
 * 1. Reads all rows from the "Data" sheet
 * 2. Converts to JSON
 * 3. Commits the JSON to GitHub (which triggers Netlify to rebuild)
 *
 * SETUP:
 * 1. Replace GITHUB_TOKEN, GITHUB_REPO, GITHUB_OWNER below
 * 2. Run syncToGitHub() once manually to test
 * 3. Set a time-based trigger: syncToGitHub → Every hour (or on edit)
 */

const GITHUB_OWNER = 'dataihan';   // ← change this
const GITHUB_REPO  = 'adwerk-monthly-list-of-brands-create-case-study';         // ← your repo name
const GITHUB_TOKEN = 'YOUR_GITHUB_PAT_TOKEN';   // ← GitHub Personal Access Token
const GITHUB_FILE  = 'data/campaigns.json';      // path inside repo

// Column mapping — matches your sheet headers exactly
const COL = {
  brand:              'Brand',
  industry:           'Industry',
  agency:             'Media Agency',
  country:            'Country',
  campaignType:       'Campaign Type',
  geotargeting:       'Geotargeting',
  campaignName:       'Campaign Name',
  startDate:          'Start Date',
  endDate:            'End Date',
  year:               'Year',
  budgetImpressions:  'Budget Impressions/Clicks',
  actualImpressions:  'Actual Impressions',
  actualClicks:       'Actual Clicks',
  budgetEUR:          'Budget EUR (Net)',
  achievement:        'Budget Achievement (%)',
  ctr:                'CTR%',
  maids:              'MAIDs',
  numLocs:            '# Locs',
  radiusTargeting:    'R. Targeting (m)',
  footfall:           'FootFall',
  footfallRadius:     'FF Radius',
  retargeting:        'Retargeting',
  status:             'Campaign Status',
};

function syncToGitHub() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Data');
  if (!sheet) { Logger.log('Sheet "Data" not found'); return; }

  const raw     = sheet.getDataRange().getValues();
  const headers = raw[0];
  const rows    = raw.slice(1);

  // Build header index
  const idx = {};
  headers.forEach((h, i) => { idx[h] = i; });

  function get(row, colName) {
    const i = idx[colName];
    return i !== undefined ? row[i] : '';
  }
  function num(v)  { const n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function int_(v) { const n = parseInt(v);   return isNaN(n) ? 0 : n; }
  function str(v)  { return v == null ? '' : String(v).trim(); }
  function fmtDate(v) {
    if (!v) return '';
    if (v instanceof Date) {
      return Utilities.formatDate(v, 'UTC', 'yyyy-MM-dd');
    }
    return str(v);
  }

  const records = rows
    .filter(r => r.some(c => c !== ''))   // skip blank rows
    .map(r => ({
      brand:              str(get(r, COL.brand))   || 'n/a',
      industry:           str(get(r, COL.industry)),
      agency:             str(get(r, COL.agency))  || '—',
      country:            str(get(r, COL.country)) || '—',
      campaignType:       str(get(r, COL.campaignType)),
      geotargeting:       str(get(r, COL.geotargeting)) || '—',
      campaignName:       str(get(r, COL.campaignName)),
      startDate:          fmtDate(get(r, COL.startDate)),
      endDate:            fmtDate(get(r, COL.endDate)),
      year:               int_(get(r, COL.year)) || null,
      budgetImpressions:  int_(get(r, COL.budgetImpressions)),
      actualImpressions:  int_(get(r, COL.actualImpressions)),
      actualClicks:       int_(get(r, COL.actualClicks)),
      budgetEUR:          num(get(r, COL.budgetEUR)),
      achievement:        num(get(r, COL.achievement)),
      ctr:                num(get(r, COL.ctr)),
      maids:              str(get(r, COL.maids))            || '—',
      numLocs:            int_(get(r, COL.numLocs)),
      radiusTargeting:    str(get(r, COL.radiusTargeting))  || '—',
      footfall:           int_(get(r, COL.footfall)),
      footfallRadius:     str(get(r, COL.footfallRadius))   || '—',
      retargeting:        str(get(r, COL.retargeting))      || '—',
      status:             str(get(r, COL.status))            || '—',
    }));

  const jsonContent = JSON.stringify(records, null, 2);
  const encoded     = Utilities.base64Encode(Utilities.newBlob(jsonContent).getBytes());

  // Get current file SHA (needed for update)
  const apiBase = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE}`;
  let sha = '';
  try {
    const getResp = UrlFetchApp.fetch(apiBase, {
      headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
      muteHttpExceptions: true,
    });
    if (getResp.getResponseCode() === 200) {
      sha = JSON.parse(getResp.getContentText()).sha;
    }
  } catch(e) {}

  // Commit
  const body = {
    message: `Auto-update campaigns.json — ${new Date().toISOString()}`,
    content: encoded,
    ...(sha ? { sha } : {}),
  };
  const putResp = UrlFetchApp.fetch(apiBase, {
    method: 'PUT',
    contentType: 'application/json',
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
    payload: JSON.stringify(body),
    muteHttpExceptions: true,
  });

  const code = putResp.getResponseCode();
  Logger.log(`GitHub response: ${code}`);
  if (code === 200 || code === 201) {
    Logger.log(`✓ Pushed ${records.length} records to GitHub`);
    SpreadsheetApp.getActive().toast(`✓ Synced ${records.length} campaigns to website`, 'Adwerk Sync', 4);
  } else {
    Logger.log(`✗ Error: ${putResp.getContentText()}`);
  }
}

// Install a time trigger: runs every hour automatically
function installTrigger() {
  ScriptApp.newTrigger('syncToGitHub')
    .timeBased()
    .everyHours(1)
    .create();
  Logger.log('Trigger installed: syncToGitHub runs every hour');
}
