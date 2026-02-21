# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Repository Overview

This is The Unjournal's modeling repository for **cultured meat pivotal questions** — analyzing techno-economic assessments (TEAs) to inform research prioritization and forecasting.

**Live Dashboard**: https://unjournal.github.io/cm_pq_modeling/

**GitHub Repo**: https://github.com/unjournal/cm_pq_modeling (public)

## Key Context

- **Domain**: Cultured meat / cellular agriculture cost modeling
- **Goal**: Synthesize TEA research to answer pivotal questions about cultured meat feasibility and cost trajectories
- **Outputs**: Parameter estimates, cost models, Metaculus questions, evaluator guidance
- **Target Year**: 2036 cost projections

## Repository Structure

```
cm_pq_modeling/
├── dashboard/           # Interactive Quarto + Shinylive dashboard
│   ├── index.qmd        # Main dashboard with embedded Shiny Python app
│   ├── model.py         # Standalone Python model (reference)
│   ├── docs.qmd         # Model documentation page
│   ├── about.qmd        # About page
│   ├── styles.css       # Custom styling
│   ├── _quarto.yml      # Quarto project config
│   └── _extensions/     # Shinylive Quarto extension
├── models/              # Model code versions
│   ├── cm_cost_v0.2.squiggle  # Squiggle version of cost model
│   └── README.md        # Parameter guide for evaluators
├── docs/                # Documentation and evaluations
│   ├── Cultivated Meat Model Eval.md  # Collaborative evaluation document
│   └── ChatGPT-Critique of Cultivated Meat Model.md
├── .github/workflows/
│   └── deploy.yml       # GitHub Actions for Pages deployment
├── .private/            # Local-only private content (gitignored)
└── .gitignore
```

## Dashboard Technology Stack

### Quarto + Shinylive
- **Quarto**: Document/website generator (v1.6+)
- **Shinylive**: Runs Python Shiny apps in browser via WebAssembly (Pyodide)
- **No server required**: Fully static hosting on GitHub Pages

### Key Dashboard Features
- Monte Carlo simulation (30,000 samples)
- Interactive parameter sliders with explanatory accordions
- Multiple visualization tabs (distributions, breakdown, CDF)
- Hypothesis integration for inline comments
- Model structure toggles (include/exclude CAPEX, Fixed OPEX)

### Dashboard Code Structure
The main app is embedded in `dashboard/index.qmd` as a `{shinylive-python}` code block. Key sections:
1. **Model functions**: `simulate()`, sampling functions, CRF calculation
2. **UI definition**: `app_ui` with sidebar, tabs, value boxes
3. **Server logic**: Reactive calculations and plot rendering

## Deployment

### GitHub Pages (Current)
- Workflow: `.github/workflows/deploy.yml`
- Triggers on push to `main` when `dashboard/**` changes
- URL: https://unjournal.github.io/cm_pq_modeling/

### Build Requirements
```yaml
- Python 3.11
- pip install shinylive
- Quarto 1.6.40+
- Shinylive extension (committed in _extensions/)
```

### CURRENT BLOCKING ISSUE (Feb 2025)

**Status**: Shinylive dashboard NOT working - shows 404 errors for Python wheel files

**The Problem**:
When loading the dashboard in browser, shinylive fails to load required Python packages (.whl files). The browser console shows errors like:
```
404: /site_libs/quarto-contrib/shinylive-0.10.7/shinylive/pyodide/shiny-1.5.1-py3-none-any.whl
404: /site_libs/quarto-contrib/shinylive-0.10.7/shinylive/pyodide/typing_extensions-4.11.0-py3-none-any.whl
... (18+ wheel files)
```

**Paradox**: The wheel files DO exist in `_site/site_libs/quarto-contrib/shinylive-0.10.7/shinylive/pyodide/` - they are correctly generated during `quarto render`. But the browser/service worker cannot fetch them.

**Current Versions**:
- Quarto: 1.6.40
- Shinylive Python package: 0.8.5
- Shinylive assets version: 0.10.7
- Shinylive Quarto extension: 0.2.0

**What Has Been Tried**:
1. ✗ Upgrading Quarto from 1.4.550 to 1.6.40
2. ✗ Installing shinylive Python package (`pip install shinylive`)
3. ✗ Updating shinylive extension (`quarto add quarto-ext/shinylive`)
4. ✗ Adding `#| packages: [shiny, numpy, matplotlib]` directive
5. ✗ Setting `embed-resources: false` in _quarto.yml
6. ✗ Editing shinylive.lua to remove warning text prepend
7. ✗ Clean rebuild (`rm -rf _site _freeze && quarto render`)
8. ✗ Different ports for preview server
9. ✗ Checking file permissions (files are readable)

**Suspected Root Causes** (unconfirmed):
- Service worker (shinylive-sw.js) path resolution issues
- Version mismatch between extension (0.2.0) and assets (0.10.7)
- Browser caching of stale service worker
- Pyodide loading mechanism incompatibility

**Files to Investigate**:
- `_site/site_libs/quarto-contrib/shinylive-0.10.7/shinylive-sw.js` - Service worker
- `_extensions/quarto-ext/shinylive/shinylive.lua` - Lua filter that processes code blocks
- Browser DevTools > Application > Service Workers

**Next Steps to Try**:
1. Clear browser service workers and hard refresh
2. Try in incognito/private window
3. Check if issue is browser-specific (Chrome vs Firefox vs Safari)
4. Test with shinylive standalone (not Quarto) to isolate issue
5. Check shinylive GitHub issues for similar reports
6. Try older/newer version combinations

See `dashboard/TROUBLESHOOTING.md` for detailed debugging steps.

### Previous Known Issues

**Shinylive "No module named 'shiny'" error**:
- Occurs when shinylive Python package version doesn't match extension version
- Extension version in `_extensions/quarto-ext/shinylive/_extension.yml`
- Test locally with `quarto preview` before deploying
- Check browser console for detailed errors

**Version Compatibility**:
- Shinylive extension and Python package versions must match
- Quarto version affects shinylive compatibility

## Model Details

### Cost Components
1. **Variable Operating Costs (VOC)**:
   - Media (amino acids, glucose, vitamins)
   - Micronutrients (minerals, trace elements)
   - Recombinant growth factors
   - Other VOC (utilities, consumables)

2. **Capital Costs (CAPEX)**:
   - Bioreactor costs (pharma vs custom)
   - Plant factor multiplier
   - Annualized via Capital Recovery Factor (CRF)

3. **Fixed Operating Costs**:
   - Labor, maintenance, overhead
   - Scales with plant capacity

### Key Parameters
| Parameter | Distribution | Description |
|-----------|--------------|-------------|
| Plant capacity | Lognormal | kTA/year production |
| Maturity | Beta(mean, 0.20) | Industry maturity factor 0-1 |
| Technology adoption | Beta + Bernoulli | P(hydrolysates), P(food-grade), P(cheap factors) |
| WACC | Lognormal | Weighted average cost of capital |
| Cell density | Lognormal | g/L at harvest |

### Maturity Correlation
The model uses a latent "maturity" factor that correlates:
- Technology adoption rates
- Reactor costs (custom vs pharma)
- Financing costs (WACC)

This prevents unrealistic scenarios where technology succeeds but financing remains difficult.

## Related Resources

- **Squiggle Model**: https://squigglehub.org/models/Unjournal-modelingPQs/cultured_meat_improved_by_squiggle_improve
- **Pivotal Questions**: https://globalimpact.gitbook.io/the-unjournal-project-and-communication-space/pivotal-questions
- **UC Davis ACBM Calculator**: https://acbmcostcalculator.ucdavis.edu/
- **The Unjournal**: https://unjournal.org

## Data Sources

- Published TEA papers (Risner et al. 2021, Humbird 2021, CE Delft)
- Extracted cost parameters from evaluations
- Metaculus question data
- Good Food Institute industry reports

## Typical Tasks

- Extracting and harmonizing cost parameters from TEA papers
- Building/updating cost models (Python in dashboard, Squiggle for quick iteration)
- Drafting Metaculus questions with clear resolution criteria
- Generating summaries for evaluators
- Updating dashboard visualizations

## Sensitivity Considerations

- Private meeting transcripts stored in `.private/` (gitignored)
- Some working documents may reference specific evaluator feedback — apply standard Unjournal confidentiality rules
- Draft Metaculus questions should be reviewed before public posting
- The repo is PUBLIC - do not commit sensitive content

## Commands Reference

```bash
# Local development
cd dashboard
quarto preview              # Start local server with hot reload

# Build
quarto render               # Build static site to _site/

# Deploy (automatic via GitHub Actions on push to main)
git push origin main        # Triggers deploy workflow

# Check shinylive version
cat _extensions/quarto-ext/shinylive/_extension.yml

# Install/update shinylive extension
quarto add quarto-ext/shinylive --no-prompt
```
