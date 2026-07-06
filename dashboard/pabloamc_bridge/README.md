# Pablo AMC demand-side bridge

This folder holds an **extension**, not a replacement. Our existing cost model
(`dashboard/index.qmd`, `simple.qmd`, `model.py`, `docs.qmd`) is untouched.

## What this is

Pablo Antonio Moreno Casares' EA Forum post *"Cultivating hope: calibrating the
expectations for cultivated meat to end factory farming"* (July 2026) pairs a
review of published TEAs with an **interactive demand-side model**:

- Post: https://forum.effectivealtruism.org/posts/ED2ag8hYTWf4kmL3x/cultivating-hope-calibrating-the-expectations-for-cultivated
- Interactive model: https://pabloamc.github.io/Cultivated_meat/interactive.html

His model and ours are **complementary halves of the same pipeline**:

```
   OUR MODEL                          PABLO'S MODEL
   (supply / cost)                    (demand / adoption)
   bottom-up Monte Carlo    --$/kg->  cost→price-ratio→logit share→Bass diffusion
   → cost per kg distribution         → market share by species / tier / geography
```

He treats cost as **exogenous** — pinned from the same TEAs we model bottom-up
(Humbird 2021, Pasitka 2024, Negulescu 2023, CE Delft, GFI). So our cost
distribution is a natural **input** to his demand model.

## What lives here

- `README.md` — this file (provenance + relationship).
- The rendered page is `dashboard/demand.qmd` (nav item "Cost → Demand").
  It contains a **simplified, self-contained port** of the cost→price-ratio→share
  step so a reader can see how a cost number turns into a market share, seeded by
  our model's default output. For the full four-product, two-segment, income-aware,
  Bass-diffusion model, use Pablo's page — we link to it and do not attempt to
  reproduce it exactly.

## Faithfulness note

The bridge on `demand.qmd` is an **approximation** of Pablo's Stage 1–2 (biomass
cost → retail price ratio → binary conventional-vs-cultivated logit share per
species). It uses his documented defaults where we could read them off his
technical page, and transparent stand-ins where we could not (flagged inline).
It is meant to build intuition and enable comparison, not to restate his results.
Numbers should be read against his interactive page, which is authoritative for
his model.
