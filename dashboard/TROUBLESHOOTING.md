# Shinylive Dashboard Troubleshooting

## Current Status (Feb 2025)

**The dashboard is NOT working.** The Shinylive Python-in-browser app fails to load with 404 errors for Python wheel files.

## The Problem

When you load the dashboard (locally or on GitHub Pages), the browser shows a loading spinner that never completes. Browser console shows:

```
404: /site_libs/quarto-contrib/shinylive-0.10.7/shinylive/pyodide/shiny-1.5.1-py3-none-any.whl
404: /site_libs/quarto-contrib/shinylive-0.10.7/shinylive/pyodide/typing_extensions-4.11.0-py3-none-any.whl
404: /site_libs/quarto-contrib/shinylive-0.10.7/shinylive/pyodide/starlette-0.38.1-py3-none-any.whl
... (18+ files)
```

**The paradox**: These files EXIST in `_site/site_libs/...` after rendering. They're correctly generated. But the browser can't fetch them.

## Environment

```
Quarto: 1.6.40
Shinylive Python package: 0.8.5 (pip show shinylive)
Shinylive assets version: 0.10.7 (shinylive extension info)
Shinylive Quarto extension: 0.2.0 (_extensions/quarto-ext/shinylive/_extension.yml)
Python: 3.12
macOS: Darwin 24.5.0
```

## What Has Been Tried

| Attempt | Result |
|---------|--------|
| Upgrade Quarto 1.4 → 1.6.40 | No change |
| Install shinylive Python package | No change |
| Update shinylive extension | No change |
| Add `#| packages: [shiny]` directive | No change |
| Set `embed-resources: false` | No change |
| Edit shinylive.lua (remove warning) | No change |
| Clean rebuild (rm -rf _site) | No change |
| Different preview ports | No change |
| Verify files exist in _site | Files ARE there |

## Suspected Root Causes

1. **Service worker issue**: `shinylive-sw.js` intercepts fetch requests but may have path resolution bugs
2. **Version mismatch**: Extension 0.2.0 may expect different asset structure than 0.10.7
3. **Browser caching**: Stale service worker cached from previous failed attempt
4. **MIME type issue**: Server may not be serving .whl files with correct content-type

## Debugging Steps

### 1. Check Browser Service Workers

1. Open DevTools (F12)
2. Go to Application tab
3. Click "Service Workers" in sidebar
4. Click "Unregister" for any shinylive workers
5. Clear site data
6. Hard refresh (Cmd+Shift+R)

### 2. Try Incognito Window

Open `http://localhost:8766` in incognito/private mode (no cached service worker)

### 3. Check Network Tab

1. Open DevTools > Network tab
2. Reload page
3. Filter by ".whl"
4. Check the actual URL being requested vs what's available
5. Check response headers

### 4. Test Minimal Example

Create `test.qmd`:
```qmd
---
title: "Test"
filters:
  - shinylive
---

```{shinylive-python}
#| standalone: true
from shiny import App, ui
app_ui = ui.page_fluid(ui.h2("Hello"))
app = App(app_ui, None)
```
```

Then: `quarto render test.qmd && open _site/test.html`

### 5. Test Shinylive Standalone

```bash
# Create a simple app
mkdir test-shinylive && cd test-shinylive
echo 'from shiny import App, ui
app_ui = ui.page_fluid(ui.h2("Hello"))
app = App(app_ui, None)' > app.py

# Export to static
shinylive export . site

# Serve
python -m http.server -d site
```

## Fix: Service Worker Base-Path Rewrite (GitHub Pages)

**Symptom**: The browser requests wheels at `/site_libs/...` (missing repo base path) and gets 404 on GitHub Pages.

**Root cause**: The Shinylive service worker rewrites requests from `/cm_pq_modeling/app_x/...` to `/...`, dropping the repo base path. On GitHub Pages this breaks asset and wheel paths.

**Fix**: Patch `shinylive-sw.js` after render to preserve the base path.

This repo includes a post-render patch that rewrites:
```
url.pathname = url.pathname.replace(appPathRegex, "/");
```
to:
```
url.pathname = url.pathname.replace(appPathRegex, base_path + "/");
```

### How It Is Applied
- A post-render hook in `dashboard/_quarto.yml` runs:
  `python scripts/fix_shinylive_sw.py`
- It patches:
  - `_site/shinylive-sw.js`
  - `_site/site_libs/quarto-contrib/shinylive-*/shinylive-sw.js`

### Verify
1. `quarto render`
2. Open `test.html` (incognito)
3. Check DevTools > Network for `.whl` requests:
   - They should be under `/cm_pq_modeling/site_libs/...` on GitHub Pages
   - They should return 200

### 6. Check Shinylive GitHub Issues

- https://github.com/posit-dev/py-shinylive/issues
- https://github.com/quarto-ext/shinylive/issues
- Search for "404" or "wheel" or "pyodide"

## Files to Investigate

```
dashboard/
├── _extensions/quarto-ext/shinylive/
│   ├── _extension.yml          # Extension version
│   └── shinylive.lua           # Lua filter (processes code blocks)
├── _site/
│   └── site_libs/quarto-contrib/shinylive-0.10.7/
│       ├── shinylive-sw.js     # Service worker
│       └── shinylive/pyodide/  # Python wheels (these exist!)
└── _quarto.yml                 # Project config
```

## Version Combinations to Try

| Quarto | Shinylive ext | Shinylive pkg | Status |
|--------|---------------|---------------|--------|
| 1.6.40 | 0.2.0 | 0.8.5 | FAILING |
| 1.5.x | 0.2.0 | 0.6.x | Unknown |
| 1.4.x | 0.1.x | 0.4.x | Unknown |

## Quick Commands

```bash
# Check versions
quarto --version
pip show shinylive | grep Version
shinylive --version
cat _extensions/quarto-ext/shinylive/_extension.yml

# Clean rebuild
rm -rf _site _freeze .quarto
quarto render

# Preview
quarto preview --port 8766 --no-browser

# Check if wheels exist
ls _site/site_libs/quarto-contrib/shinylive-*/shinylive/pyodide/*.whl | wc -l
```

## Alternative Approaches

If shinylive can't be fixed:

1. **Use R Shiny instead**: Shinylive-R may work better
2. **Use Observable/OJS**: Quarto supports this natively
3. **Use PyScript**: Alternative Python-in-browser solution
4. **Deploy to Shiny Server**: Traditional server-based deployment
5. **Use Streamlit**: Deploy to Streamlit Cloud instead

## Contact

- Shinylive issues: https://github.com/posit-dev/py-shinylive/issues
- Quarto discussions: https://github.com/quarto-dev/quarto-cli/discussions
