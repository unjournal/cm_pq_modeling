# Audio Overview Script — Cultured Chicken Cost Model

*Updated May 2026. ~570 words. Replaces the earlier AI-narrated review.*

---

We built this model to answer a deceptively simple question: what would it actually cost to produce cultured chicken meat at commercial scale?

The answer depends on a lot of things we're genuinely uncertain about — which is the whole point. Rather than giving you a single number, the model runs thirty thousand simulated scenarios, each time drawing a different combination of parameter values from realistic ranges, and shows you the resulting distribution of costs. That approach, called Monte Carlo simulation, lets us see not just what the median cost might be, but how wide the uncertainty is and which inputs are driving it most.

The output is expressed as manufacturing cost per kilogram of cultured chicken cell biomass at harvest — wet weight, at the factory gate, before any texturization or blending. That's the accounting boundary: the edible cell mass that comes out of the bioreactor before anything downstream is added.

## Four cost components

We break costs into four pieces.

The first and usually the largest is variable operating cost. This is what scales directly with every kilogram you produce. It's dominated by two items. First, the growth medium: the liquid nutrient broth that feeds the cells, priced per liter and multiplied by how many liters you actually consume per kilogram of meat. That ratio depends heavily on how dense the cells grow and what kind of bioreactor process you're using. Second, growth factors — signaling proteins like FGF-2 that tell cells to keep dividing. Growth factors are currently very expensive, sometimes tens of thousands of dollars per gram, and whether the industry finds a cheaper route through precision fermentation, autocrine cell lines, or plant-based production is one of the biggest uncertainties in the whole model.

The second component is annualized capital cost per kilogram. We start with the cost of building a bioreactor facility at a reference scale, adjust for economies of scale, and spread that cost over the annual output using a standard capital recovery formula. The key parameters are the cost of the equipment itself — and whether the industry can move from expensive pharmaceutical-grade bioreactors toward cheaper food-grade alternatives — plus the financing cost, which depends on how risky investors think this sector is.

Third is fixed operating expense: labor, maintenance, and overhead. These don't vary with each batch, but they shrink on a per-kilogram basis as plant scale increases.

Fourth is downstream processing, which applies mainly to structured products and is optional in the model.

## The maturity factor

Across all these components, we use a single industry maturity variable to introduce realistic correlations. In a world where growth factor technology succeeds, financing conditions are also likely to be better, and hydrolysate-based media is more likely to be viable. These outcomes tend to come as a package. That single maturity draw prevents the model from generating incoherent scenarios — though it's a simplification.

## Known limitations

We want to be upfront about what this model doesn't do. It's a static snapshot, not a year-by-year learning curve. It assumes generic global costs, not region-specific labor or energy. It doesn't yet model supplemental recombinant proteins like albumin and transferrin, which could add several dollars per kilogram in pessimistic scenarios. And the sensitivity chart is a practical exploration tool, not a formal variance decomposition.

## What we'd like from you

The model is fully transparent — all equations, parameter ranges, and source citations are in the technical documentation, and you can annotate directly using Hypothes.is. We especially welcome scrutiny of the growth factor quantities and prices, the bioreactor capital cost ranges, and the correlation structure.

If you have expert knowledge of this space, please record your beliefs through the workshop beliefs form. Your estimates help us understand where genuine uncertainty lies and where experts actually disagree.
