# Cultured Meat Cost Models

## cm_cost_v0.2.squiggle

**Purpose:** PQ-integrated cost model for evaluators to estimate 2036 cultured meat production costs.

### Model Structure

```
COGS/kg = VOC/kg + Capital/kg + Fixed OPEX/kg
```

### Key Improvements over v0.1

| Issue | v0.1 Problem | v0.2 Fix |
|-------|--------------|----------|
| **Scenario toggles** | `sample(bernoulli(median(...)))` locks entire run into one scenario | `bernoulli(p)` as distribution + `SampleSet.map` for per-sample scenarios |
| **Hidden scale** | $/kg values embed implicit plant scale/utilization | Explicit `plant_kta` and `uptime` parameters |
| **Unbounded distributions** | `a to b` (lognormal) for probabilities can exceed 1 | `beta()` for all [0,1] quantities |
| **Independence assumption** | No correlation between drivers | `maturity` latent factor ties adoption, costs, and WACC |
| **Micronutrients** | Lumped together | Split into commodity micros vs recombinant factors |

### Parameters for PQ Evaluators

**Edit these first:**
- `maturity` — Industry maturity index (0-1)
- `plant_kta` — Plant capacity in kTA/year
- `uptime` — Utilization rate (0-1)
- `p_hydro_base` — Probability of hydrolysate adoption by 2036
- `p_foodgrade_base` — Probability of food-grade commodity micros
- `p_recfactors_base` — Probability of cheap recombinant factors

### Outputs

- `unit_cost` — Distribution of fully-loaded unit cost ($/kg)
- `summary` — Quantiles (p5, p50, p95), probabilities (<$10/kg, <$25/kg), cost shares

### Links

- **Live model:** https://squigglehub.org/models/Unjournal-modelingPQs/cultured_meat_improved_by_squiggle_improve
- **Squiggle docs:** https://www.squiggle-language.com/docs

## Future Work

1. Host interactive visualization (Quarto/web app)
2. Allow parameter tweaking via UI
3. Integrate evaluator feedback
4. Add sensitivity analysis (tornado charts)
5. Consider mechanistic TEA model (Python) for detailed engineering scenarios
