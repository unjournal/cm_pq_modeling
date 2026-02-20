# Cultured Meat Pivotal Questions Modeling

This repository contains modeling and analysis work for The Unjournal's Pivotal Questions project focused on **cultured meat cost and feasibility research**.

## Purpose

- Analyze and synthesize techno-economic assessments (TEAs) of cultured meat production
- Develop cost models and parameter estimates
- Interface with Metaculus forecasting questions
- Support evaluator synthesis and research prioritization

## Related Resources

- [The Unjournal](https://unjournal.org) — Open evaluation of impactful research
- [Pivotal Questions documentation](https://globalimpact.gitbook.io/the-unjournal-project-and-communication-space/pivotal-questions) — General PQ methodology
- [Unjournal Dashboard](https://unjournal.shinyapps.io/uj-dashboard/) — Evaluation metrics and data

## Interactive Dashboard

**Live:** [unjournal.github.io/cm_pq_modeling](https://unjournal.github.io/cm_pq_modeling) *(coming soon)*

An interactive Monte Carlo dashboard for exploring cultured meat production costs. Features:

- **Parameter sliders** for key inputs (plant capacity, utilization, technology adoption)
- **Cost distribution visualization** with percentile summaries
- **Cost breakdown charts** showing component contributions
- **Tiered parameters**: Basic controls + expandable advanced options

### Run Locally

```bash
cd dashboard
quarto add quarto-ext/shinylive  # Install Shinylive extension
quarto preview                    # Live preview
quarto render                     # Build static site
```

## Repository Structure

```
cm_pq_modeling/
├── dashboard/               # Interactive Quarto + Shinylive app
│   ├── index.qmd           # Main dashboard
│   ├── model.py            # Python cost model
│   └── _quarto.yml         # Quarto config
├── data/                    # Input data, CSVs, extracted parameters
├── models/                  # Cost models (Squiggle versions)
├── docs/                    # Working notes, evaluator guidance
└── .github/workflows/       # GitHub Actions for auto-deployment
```

## Models

### Python Cost Model (dashboard)

Location: `dashboard/model.py`

A "first-principles" Monte Carlo TEA model in Python, powering the interactive dashboard. Computes unit cost from:

- **Process intensities**: Cell density, cycle time, media turnover
- **Variable costs**: Media, micronutrients, recombinant factors
- **Capital costs**: Reactor volume → CAPEX → annualized via CRF
- **Fixed OPEX**: Scaled with plant size

### Squiggle Cost Model (v0.2)

Location: `models/cm_cost_v0.2.squiggle`

A Monte Carlo cost model in Squiggle language with:

- Explicit scale (plant capacity) and utilization parameters
- Beta distributions for probabilities/shares (bounded 0-1)
- Maturity factor to correlate technology adoption, costs, and financing
- Scenario toggles: hydrolysates, food-grade micros, cheap recombinant factors

**Live model:** [Squiggle Hub](https://squigglehub.org/models/Unjournal-modelingPQs/cultured_meat_improved_by_squiggle_improve)

### Model Evaluation

See `docs/Cultivated Meat Model Eval.md` for detailed critique and improvement recommendations from David van der Linden and Jakub Kozlowski.

### Sources

- Risner et al. (2021) - [UC Davis ACBM Calculator](https://acbmcostcalculator.ucdavis.edu/)
- CE Delft TEA studies
- Humbird (2021) - Scale-up economics
- Rethink Priorities forecasts

## Status

🚧 **Early development** — Structure and scope being defined.
