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
├── dashboard/           # Interactive Quarto + OJS dashboard
│   ├── index.qmd        # Main dashboard with Monte Carlo simulation (OJS)
│   ├── learn.qmd        # Educational content: how cultured meat is made
│   ├── docs.qmd         # Technical reference: formulas and parameters
│   ├── about.qmd        # About page
│   ├── styles.css       # Custom styling
│   ├── _quarto.yml      # Quarto project config
│   └── model.py         # Standalone Python model (reference, not used by dashboard)
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

### Quarto + Observable JS (OJS)
- **Quarto**: Document/website generator (v1.6+)
- **Observable JS (OJS)**: Reactive JavaScript for interactive visualizations
- **No server required**: Fully static hosting on GitHub Pages

The dashboard was migrated from Shinylive (Python via WebAssembly) to OJS in Feb 2026 to resolve service worker path issues that caused 404 errors for Python wheel files.

### Key Dashboard Features
- Monte Carlo simulation (30,000 samples)
- Interactive parameter sliders with explanatory accordions
- Multiple visualization tabs (distributions, breakdown, CDF, sensitivity)
- Hypothesis integration for inline comments
- Model structure toggles (include/exclude CAPEX, Fixed OPEX, Downstream)
- Target year slider (2026-2050) affecting technology adoption probabilities

### Dashboard Code Structure
The main app is embedded in `dashboard/index.qmd` using OJS code blocks (`{ojs}`). Key sections:
1. **Model functions**: `simulate()`, sampling functions, CRF calculation (pure JavaScript)
2. **UI definition**: OJS inputs (`Inputs.range()`, `Inputs.toggle()`, etc.)
3. **Reactive calculations**: OJS reactive cells auto-update on input changes
4. **Visualizations**: Plot.js for histograms, CDFs, and bar charts

## Deployment

### GitHub Pages (Current)
- Workflow: `.github/workflows/deploy.yml`
- Triggers on push to `main` when `dashboard/**` changes
- URL: https://unjournal.github.io/cm_pq_modeling/

### Build Requirements
```yaml
- Quarto 1.6.40+
```

No Python dependencies are required for the dashboard — all simulation logic runs in JavaScript via OJS.

### Historical Note: Shinylive Migration

The dashboard originally used Shinylive (Python via WebAssembly) but was migrated to OJS in Feb 2026 due to persistent service worker issues causing 404 errors for wheel files. The OJS implementation is simpler, faster to load, and requires no Python dependencies.

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

## Review & Feedback Workflow

### Hypothesis Integration
The dashboard includes [Hypothesis](https://hypothes.is/) for inline annotations. Reviewers can comment directly on specific text, and comments are fetched via:
```bash
curl "https://api.hypothes.is/api/search?wildcard_uri=https://unjournal.github.io/cm_pq_modeling/*"
```

### Model Review Report
A detailed technical review report is maintained at `.private/model_review_report.md` (gitignored). This report:
- Summarizes the model architecture and equations
- Tracks Hypothesis comment resolution status
- Lists areas for external review (prioritized)
- Provides parameter summary table

Use this report when seeking external feedback or preparing for evaluator review.

### Documentation Structure
- **index.qmd**: Interactive sliders with inline `<details>` explanations
- **docs.qmd**: Technical reference with equations, parameter definitions, and methodology
- **learn.qmd**: Educational content for non-technical readers

When updating the model, ensure docs.qmd stays synchronized with code changes.

## Sensitivity Considerations

- Private meeting transcripts stored in `.private/` (gitignored)
- Model review reports stored in `.private/` (gitignored)
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
```
