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

## Repository Structure

```
cm_pq_modeling/
├── data/                    # Input data, CSVs, extracted parameters
├── models/                  # Cost models, sensitivity analyses
├── metaculus/               # Metaculus question drafts and resolution criteria
├── outputs/                 # Generated reports, figures, tables
└── docs/                    # Working notes, evaluator guidance
```

## Models

### Squiggle Cost Model (v0.2)

Location: `models/cm_cost_v0.2.squiggle`

A Monte Carlo cost model estimating per-kg production cost for cultured meat in 2036. Core identity:

```
Unit Cost = Variable Costs + Capital Cost + Fixed OPEX
```

**Key features:**
- Explicit scale (plant capacity) and utilization parameters
- Beta distributions for probabilities/shares (bounded 0-1)
- Maturity factor to correlate technology adoption, costs, and financing
- Scenario toggles: hydrolysates, food-grade micros, cheap recombinant factors

**Live model:** [Squiggle Hub](https://squigglehub.org/models/Unjournal-modelingPQs/cultured_meat_improved_by_squiggle_improve)

Based on UC Davis ACBM calculator (Risner et al., 2021).

### Model Evaluation

See `docs/Cultivated Meat Model Eval.md` for detailed critique and improvement recommendations from David van der Linden and Jakub Kozlowski.

## Status

🚧 **Early development** — Structure and scope being defined.
