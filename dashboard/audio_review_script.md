# Audio Overview Script — Cultured Chicken Cost Model
## Updated May 2026 · ~1,400 words · approx. 10 minutes

---

We built this model to answer a deceptively simple question: what would it actually cost to produce cultured chicken meat at commercial scale?

The reason this question is hard is not that the math is complicated — it isn't. It's that almost every number that goes into the calculation is genuinely uncertain. We don't yet know what growth factors will cost in 2036. We don't know which bioreactor process will dominate. We don't know how dense cells will grow at scale, or how cheaply media can be made. These aren't things we can look up — they depend on breakthroughs that may or may not happen.

So rather than pretending we know the answer, the model runs thirty thousand simulated scenarios. Each simulation draws a different combination of parameter values from realistic distributions, and the result is a full distribution of possible costs — not a single number, but a picture of the range of outcomes and what's driving the uncertainty. That approach is called Monte Carlo simulation, and it's the right tool for this kind of problem.

The output is expressed as manufacturing cost per kilogram of cultured chicken cell biomass at harvest — wet weight, at the factory gate, before any texturization or blending with other ingredients. That accounting boundary matters, because a lot of published cost figures refer to different things. We try to be precise.

---

**What goes into that cost?**

We break it into four pieces.

The first is variable operating cost — everything that scales directly with each kilogram you produce. This is almost always the dominant component, and within it, two things dominate: cell culture media and growth factors.

Cell culture media is the liquid nutrient broth that feeds growing cells. Think of it as a highly engineered blood substitute — it has to provide amino acids, glucose, vitamins, buffers, and everything else cells need to grow. The cost per liter varies enormously depending on the grade. Pharmaceutical-grade media, made from purified individual components, currently costs something like fifty cents to a few dollars per liter. But what matters for cost isn't the price per liter — it's how many liters you consume per kilogram of output. And that depends on how dense the cells grow.

At low densities, say thirty grams of cells per liter, you're consuming a lot of media to produce a small amount of meat. At high densities — commercial perfusion systems can potentially reach a hundred to two hundred grams per liter — you're making much more efficient use of each liter of media. So the cell density and the media price interact, and both are deeply uncertain.

There's also the question of media composition. Expensive purified amino acids are a major cost driver. Hydrolysates — protein-breakdown products from yeast or plant sources — might substitute for them at a fraction of the cost, and there's real industry momentum in that direction. Whether hydrolysate substitution works consistently at scale is one of the key empirical questions the model reflects.

Growth factors are the second component of variable cost, and they are the source of the model's widest uncertainty band. Growth factors are small proteins — molecules like FGF-2 and IGF-1 — that signal cells to keep dividing. At research scale, they are extraordinarily expensive: tens of thousands of dollars per gram. That's because they're currently made for pharmaceutical research applications in tiny quantities with extreme purity requirements.

At the volumes that commercial cultured meat would require, no one currently produces growth factors this way. The question is which lower-cost production route will succeed. Precision fermentation — using microbes to produce the proteins at scale — is the leading candidate and could reduce prices by two to three orders of magnitude if it works. Plant molecular farming, where transgenic plants produce growth factors, is another route. Engineering cells to produce their own growth factors — autocrine cell lines — would essentially reduce the price to near zero for that component. And there are small-molecule alternatives that can activate the same receptors without using proteins at all.

Any one of these working at commercial scale by 2036 would be transformative. The model treats this as a probabilistic question, not a certainty in either direction, and the resulting distribution is wide: in pessimistic scenarios growth factors represent thirty to fifty percent of total cost; in optimistic scenarios they're nearly negligible.

---

**Capital costs**

The second major component is annualized capital cost — the cost of building and financing the bioreactors and facility, spread across all the kilograms produced.

Bioreactors are the heart of the operation. Large-scale bioreactors — we use ten to twenty thousand liters as a reference — are currently expensive, primarily because they're built to pharmaceutical standards that cultured meat doesn't require. A food-grade bioreactor could potentially be built for a fraction of the pharmaceutical price. Some companies are already demonstrating this: one recent industry report documented a twenty thousand liter bioreactor built for well under a million dollars, compared to ten to fifteen million for a pharmaceutical-grade equivalent.

The capital cost per kilogram is also sensitive to scale — large plants spread fixed construction costs over more kilograms, which is why the model shows dramatically lower costs at higher production volumes. A plant producing two thousand tonnes per year has very different economics from one producing ten tonnes per year.

Finally, capital cost depends on how you're financing the facility — the WACC, or weighted average cost of capital. Early-stage startups paying twenty percent for capital have very different capex-per-kg than an established food company paying ten percent. The financing environment is one of several places where sector maturity makes a nonlinear difference.

---

**Fixed costs and downstream**

Fixed operating costs — labor, maintenance, utilities overhead — are the third component. These don't change batch to batch, but they do shrink per kilogram as plant scale increases. At scale, they're typically a smaller share of total cost than media or capital, but in early, smaller facilities they can dominate.

The fourth component, downstream processing, covers scaffolding, texturization, and other steps for structured products like whole-cut analogues. For unstructured products — ground meat, nuggets, hybrid products — this may be minimal. The model treats it as optional and scenario-dependent.

---

**The maturity factor**

Cutting across all four components is what we call the industry maturity variable. In a world where cultured meat succeeds, many things tend to be true simultaneously: growth factor breakthroughs occur, financing costs fall as the sector matures, companies can afford custom food-grade equipment, and hydrolysate substitution is well-established. These things tend to come as a package.

The model uses a single maturity draw to introduce this correlation, preventing scenarios where everything pessimistic happens except one thing that's wildly optimistic. That's a simplification — different technologies could advance at different rates — and it's one of the known structural limitations of the current model. But it's better than treating every variable as fully independent.

---

**How to read the model**

When you open the interactive dashboard, you see a cost distribution — a histogram showing the spread of simulated outcomes. The median gives you the central estimate. The tail on the right tells you how bad things could get under pessimistic assumptions. The tornado chart below shows which parameters move the median cost most when varied across their plausible range.

The most important thing about the model is what it tells you about uncertainty, not what it tells you about the central estimate. The central estimate can be made to look optimistic or pessimistic depending on parameter choices. The shape of the distribution — whether it's tightly concentrated or spread across two orders of magnitude — is the signal.

---

**What we're asking experts**

This model is designed to be updated. Rather than anchoring on any single set of parameter assumptions, we want to know what people who actually work in this space think about these distributions.

That's what the beliefs form is for. We're asking workshop participants — TEA researchers, bioprocess engineers, industry operators, and animal welfare analysts — to give us their estimates for the key parameters: what will media cost, what will growth factors cost, what densities are achievable, what process mode will dominate. We're doing this before and after a structured day of evidence review, so we can see how expert views shift when confronted with the full technical picture.

Where experts agree, that's important. Where they disagree sharply, that's even more important — it tells us where the genuine uncertainty lives and where better research would do the most good.

---

The model is fully open: all equations, parameter ranges, and source citations are in the technical documentation. You can annotate any section directly using Hypothes.is, and longer discussion threads are on GitHub. We especially welcome scrutiny of the growth factor assumptions, the bioreactor capital cost ranges, and the maturity correlation structure — these are the places where the model's outputs are most sensitive and where expert judgment matters most.

If you have direct knowledge of any of these areas, please fill out the beliefs form. Your estimates don't need to be certain — a wide credible interval is useful information too. The goal is to understand the range of informed opinion, not to converge prematurely on a single answer.
