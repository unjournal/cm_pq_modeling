# Cultured meat cost estimates: systematic review

Nov 16, 2026 · @Alex

## Summary

The evidence does not support the favourable bounds that define the
model's competitive zone. For each of the three priority cost
parameters, the zone needs values at or beyond the most favourable
published figure, and those figures are model outputs or unverified
company claims, not measurements. No peer-reviewed plant design reaches
\$12–36/kg dry; the lowest is about \$57/kg dry (Negulescu's airlift),
and Pasitka's company-run continuous design comes to about \$80/kg dry
for cell mass.

- **Nutrient yield.** The competitive zone needs 22.7–37.4 g/L. The top
  of the model's 3–30 g/L range rests on Humbird's theoretical best case
  (about 35 g/L) and CE Delft 2021 figures that the same team withdrew
  in its 2023 peer-reviewed paper. An evidence-based range is about 2–15
  g/L.

- **Hydrolysate medium price.** Company claims of \$0.07–0.63/L exist,
  but only Pasitka's \$0.63/L discloses its composition, and it is a
  defined medium, not a hydrolysate. A cheap litre is usually a dilute
  one: Pasitka's own medium costs about \$47/kg dry of cells. The model
  draws price per litre and yield independently, which lets cheap litres
  and high yields coincide; they should be linked.

- **Fixed running costs.** Humbird's design gives \$5.78/kg wet
  (fed-batch) and \$10.62 (perfusion). The zone's \$1.13–1.81/kg wet is
  roughly labour alone, and would need plant capital of about \$9–27 per
  annual kg against \$45–108 in published designs.

- **Technology probabilities.** The only elicited figure found is
  Rethink Priorities' 30% for growth factors under \$1/kg wet by 2031.
  Nothing elicited exists for hydrolysates or continuous culture, and no
  source quantifies their correlation. Continuous culture has been run
  for 20 days only in a 1.8 L vessel, with experience up to 300 L, by a
  firm now closed.

- **Structure.** No academic engineering model is probabilistic, so the
  Unjournal model is unusual in a useful way. But the engineering models
  include physical limits and perfusion equipment costs the Unjournal
  model omits, and their omission favours continuous culture in the
  tail.

- **Independence.** Each priority parameter has two or three independent
  evidence lines; most published estimates descend from Humbird 2021 or
  CE Delft 2021. Evidence quality and favourability are negatively
  correlated.

Nine suggested model changes are listed near the end. The parameter
sheet holds all 423 extracted estimates with provenance, independence
grade and risk of bias.

## Methods

The review has two arms: a PRISMA-style search of the academic
literature, and a documented hand-search of everything else. The
protocol below was fixed before searching.

**Reference model.** The Unjournal cultured-chicken cost model, engine
version 2026-11-09.1, read from the public repository (cost-model.mjs
and the learn, docs and compare page sources).

**Questions.** (1) How do other cost models differ in structure from the
reference model? (2) What independent estimates exist for each of its
parameters, with most depth on the six priority items: nutrient yield,
hydrolysate medium price, fixed running costs, and the probabilities
that hydrolysates, cheap growth factors and continuous culture at scale
are available by 2036?

**Scope.** 2011 to November 2026, English, any species of cultured meat
or seafood.

|  | Academic arm (PRISMA) | Hand-searched arm |
|----|----|----|
| Sources | Peer-reviewed papers and preprints | Grey reports, analogue industries, company claims, forecasts |
| Search | Logged strings in bibliographic databases, plus backward and forward citation chasing | Named sources, targeted queries, citation chasing, stated stopping rule |
| Include | Original cost estimate, cost model, or cost-framed parameter estimate | Same, plus analogue-industry data for a model parameter |
| Exclude | Life-cycle studies without cost, consumer studies, reviews with no original estimate | Sources with no quantitative content |
| Reporting | Counts at each stage, exclusion reasons | Search log, list of sources sought but not retrieved |

**Extraction.** One row per source and parameter. Each row keeps the
original figure and basis, and adds a conversion to \$/kg dry cell mass
only where the source states its own solids fraction.

**Independence grade.** Every estimate is traced to where its number
came from.

| Grade | Meaning |
|----|----|
| 1 | Independent: measured data, vendor quote, own engineering design, or own elicitation |
| 2 | Partly derived: an inherited number adjusted with some new evidence |
| 3 | Fully derived: restates another source's number |

**Risk of bias.** No standard tool exists for cost models, so this
checklist is bespoke and open to challenge. Each item is scored Low,
Some concerns or High.

1.  Input transparency: are inputs and formulae published and
    reproducible?

2.  Empirical grounding: measured or quoted, as against assumed, and at
    what scale?

3.  Funding and conflicts of interest.

4.  Scale realism: is the assumed plant scale, and the extrapolation to
    it, defensible?

5.  Uncertainty treatment: sensitivity or probabilistic analysis, and
    whether favourable assumptions are stacked.

6.  Indirectness (hand-searched arm only): analogue industry, or
    forward-looking claim as against achieved result.

Grey literature starts at Some concerns overall. Company claims and
investor material start at High.

## PRISMA flow and included academic studies

The academic arm included 18 studies, but only six model cost at plant
level, and those six form about four independent lineages. The search
was PubMed-only: OpenAlex, Crossref, Europe PMC, Semantic Scholar,
bioRxiv and Google Scholar were unreachable from the research
environment. Before the review is called systematic, someone with Scopus
or Web of Science access should re-run the core string.

| Stage                                                            | Records |
|------------------------------------------------------------------|---------|
| Identified in PubMed (five logged strings, 16 Nov 2026)          | 162     |
| Duplicates removed                                               | 58      |
| Screened on title and abstract                                   | 104     |
| Excluded on title and abstract                                   | 65      |
| Full texts sought                                                | 39      |
| Full texts not retrieved (5 of these kept on the abstract alone) | 16      |
| Full texts assessed                                              | 23      |
| Excluded at full text                                            | 13      |
| Included from database search                                    | 15      |
| Added by citation chasing and web search                         | 3       |
| **Total included**                                               | **18**  |

Title and abstract exclusions: 27 narrative reviews, 27 experiments with
no quantified cost, 6 off-topic, 4 commentaries, 1 consumer study.
Full-text exclusions: 6 reviews, 5 with no quantified cost, 1 process
model with no cost output, 1 life-cycle assessment without cost.

**Plant-level cost models (6).**

| Study | Mode | Headline cost, as reported | Full text read |
|----|----|----|----|
| Humbird 2021, *Biotechnol Bioeng* | Fed-batch, perfusion | \$37/kg fed-batch, \$51/kg perfusion, wet cell mass; \$22/kg with cheap hydrolysate | Yes |
| Risner et al. 2021, *Foods* | Scenarios | About \$400,000/kg (scenario 1) to about \$2/kg (scenario 4) | Yes |
| Garrison et al. 2022 | Enterprise budget | \$63/kg (second-hand, via Leber et al. 2026) | No |
| Ashizawa et al. 2022 (insect cells; reuses Risner model) | Scenarios | Per-kg result in a table not captured | Partly |
| Negulescu et al. 2023, *Biotechnol Bioeng* | Fed-batch; three reactor sizes and types | \$35/kg (42,000 L) to \$17/kg (262,000 L) | Yes |
| Pasitka et al. 2024, *Nature Food* (Believer Meats) | Continuous perfusion, own data | About \$24/kg wet cell mass (50,000 L plant); \$6.2–6.8/lb for a hybrid product that is half plant ingredients; medium \$0.63/L | Yes (supplement not read) |

**Partial models and parameter-cost studies (12).** Pasitka 2025
(bovine, *Nature Food*; abstract only, no figure seen), Myers 2023
(waste nutrients), Wimble 2025 (lactic acid co-product), Stout 2022
(Beefy-9 medium) and Stout 2023 (Beefy-R, albumin replacement),
Venkatesan 2022 (in-house growth factors), Schenzle 2025 (albumin
substitutes), Lee 2024 and Han 2026 (serum substitutes), Wasmuth 2026
(repurposed media mixtures), Gershkoviz 2026 (growth factors bound to
scaffolds), and Zhou 2025 (hybrid inclusion rate).

**What is new to the Unjournal team.** Eleven of the 18 are not cited in
the model repository. Only Pasitka 2025 adds a new plant-level economic
claim, and its numbers could not be read. No new independent full TEA
from 2025 or 2026, and no peer-reviewed seafood TEA, was found. Three
uncited reviews are worth reading: Hoek 2026 (*Biotechnol Bioeng*) on
whether hydrolysates can replace purified amino acids, Nordhagen 2026
(*Lancet Planetary Health*) on prices, and Mainali 2025 on growth-factor
production cost.

**Limits of this arm.** One screener, one pass. Five studies were first
included on the abstract alone because publisher pages would not open;
Negulescu 2023 and Pasitka 2024 have since been read in full from copies
supplied by the reviewer (16 Nov), leaving three. Reference lists and
funding statements were often missing, so backward chasing used in-text
mentions only, forward chasing was not possible, and most
conflict-of-interest fields read "not seen". Goodwin et al. 2024, the
one dedicated scoping review of cost studies, could not be opened.

## Hand-searched arm: grey literature, analogues, company claims

The grey literature adds only two full cost models with published
inputs, Humbird 2020 (for Open Philanthropy) and CE Delft 2021, and no
new full model has appeared since. Its main value is a handful of
independent inputs and the only elicited probabilities found. This arm
stopped on time budget, not at saturation: 26 sources were extracted,
and about twenty named consultancy and government sources were not
searched.

**Grey sources by what they contribute.**

| Source | Type | Independent content | Risk of bias |
|----|----|----|----|
| Humbird 2020, Open Philanthropy report | Full cost model | Own engineering: capital, fixed costs, density limits | Some concerns |
| CE Delft 2021 (with corrigendum), for GFI and GAIA | Full cost model | Confidential company data on medium use, energy, equipment quotes | Some concerns to High (advocacy-funded, data unverifiable) |
| GFI 2025 amino-acid report | Input-price study | Supplier quotes for amino acids | Some concerns (advocacy) |
| Specht 2020 (GFI) | Medium-cost model | Bottom-up medium cost | Some concerns |
| Rethink Priorities 2021–2022 (three pieces) | Elicitation and track record | Elicited probabilities; record of past predictions | Some concerns |
| GFI 2026 State of the Industry | Industry survey | Little new cost data | Some concerns |
| Swartz 2024 cost-drivers deck | Presentation | Restates and updates inputs | Some concerns |
| McKinsey 2021; Kearney 2019; BCG/Blue Horizon 2021 | Consultancy | Parity dates; inputs mostly derived | High |
| Lever VC 2025 | Investor report | None verifiable: no companies, scale, basis or method named; holdings not disclosed | High |
| RethinkX 2019 | Think-tank forecast | Learning-curve projections | High |
| The Counter 2021 | Journalism | Named expert judgements (Humbird, Wood) | Some concerns |
| Metaculus (two questions) | Forecast platform | Community forecasts did not render | Not rated |

**What drives the gap with Humbird.** The disagreement is mostly about
financing and plant standard, not biology. CE Delft's move from a 4-year
to a 30-year payback is worth \$9.68/kg wet, against \$1.61/kg wet for
all its later process improvements combined (both derived as differences
between its scenarios). CE Delft also assumes a food-grade plant with a
total-to-equipment multiplier of about 3, where Humbird uses about 7
with cleanrooms.

**Lever VC 2025 misreports Humbird.** Its "60 g/L Humbird maximum"
refers to Humbird's air-sparged case (his preprint gives about 50 g/L
with air), not his base case of 120 g/L (110 g/L in the journal paper).
Humbird also disputes the \$6.50/L medium price the report attributes to
him; his own later figure was about \$3/L. The Unjournal page cites this
report, so the team may want to check those passages.

**Track record.** Rethink Priorities found that 75 of 84 resolved public
predictions about cultured meat were wrong, and none of the timing
misses was too pessimistic. An elicitation should start from that base
rate.

**Not retrieved or not searched.** Landing pages or press coverage only:
GFI 2023 growth-factor report, GFI 2024 scale-up survey, GFI "TEA 2.0"
Phase 1a (so far a cell-growth review with no cost output), Kearney
2019, BCG/Blue Horizon 2021, RethinkX 2019. Not searched: Barclays,
IDTechEx, Lux Research, Rabobank, ING, Deloitte, UK FSA, Government
Office for Science, EU JRC, USDA ERS, National Academies, Tufts, CSIRO,
New Harvest and others listed in the notes.

Company claims and the evidence on the three technology probabilities
are covered in the priority-parameter section below.

## Model structure: how other cost models differ

The Unjournal model is structurally unusual: none of the academic
engineering models is probabilistic, and every one treats technology
success as a scenario switch. So the literature offers no empirical
anchor for the model's success probabilities or the correlation between
them; those must come from elicitation. Going the other way, the
engineering models represent physical limits and equipment that the
Unjournal model either lacks or folds into broad ranges.

**Independent designs.** There are about four independent bottom-up
designs (Humbird 2021, Risner 2021, Negulescu 2023, Pasitka 2024) plus
Garrison 2022's enterprise budget. Ashizawa 2022 reuses Risner's engine;
Wimble 2025 builds on the CE Delft plant; Negulescu inherits cell
properties and input-price curves from Humbird, but measured its own
medium-use coefficients; Pasitka runs its own laboratory data through
Humbird's cost structure. The only Monte Carlo cost model found is a
2026 preprint (Daoutakou & Kintzios) whose inputs are mostly the
authors' assumptions.

| Feature | Humbird 2021 | Risner 2021 | Negulescu 2023 | Pasitka 2024 | Unjournal |
|----|----|----|----|----|----|
| Uncertainty | Scenarios, one-way sensitivity | Four stacked scenarios | Scenarios by reactor size and type; sensitivity to medium price and doubling time | Three plant scenarios; sensitivity to capital cost (−15% to +45%) and contamination loss (up to 30%) | Monte Carlo over all inputs |
| Process mode | Fed-batch and perfusion, compared | Fed-batch | Fed-batch only | Continuous perfusion | Three modes, chosen by feasibility draw |
| Technology success | Scenario switch | Scenario switch | Scenario switch | Assumed achieved | Probability, linked by a maturity factor |
| Cell density | Derived from oxygen, CO2 and waste limits | Assumed | Assumed 100 g wet/L (30 g dry/L), checked against oxygen supply | Measured at 1.8–5 L; plant assumes 1.8 kg wet per L of reactor per month | Sampled range by mode |
| Medium quantity | Mass balance on nutrients | Assumed | Yield coefficients measured in spent medium (mouse cells): 10.2 L per kg wet | Measured about 64 L per kg wet at 1.8 L; plant assumes 22 L per kg wet | Three options (density, direct, yield) |
| Capital | Equipment list, installation factors | Equipment list | Process simulator (SuperPro); straight-line depreciation, no financing cost | Humbird's structure plus vendor quotes | \$/L reactor × plant multiplier |
| Fixed costs | Tied to capital; labour built from tasks | Tied to capital | Tied to capital (maintenance, insurance, taxes) | Follows Humbird; labour has negligible effect | \$/kg at reference plant, scaled |
| Output basis | Wet cell mass | Product, basis unstated | Cultured beef, wet | Wet cell mass, and a hybrid product that is 50% cells | Dry cell mass |

**In the literature but missing from the Unjournal model.**

1.  Cell density and maximum vessel size derived from oxygen supply, CO2
    removal and waste build-up. The Unjournal oxygen cap is optional and
    off by default.

2.  Cell-retention equipment and membrane costs for perfusion. Humbird
    finds perfusion dearer than fed-batch once these are counted, while
    the Unjournal model gives most weight to perfusion and continuous
    culture without costing them. This matches the open note that
    continuous dominates the tail partly because its drawbacks are
    uncosted.

3.  Input prices that fall with industry-wide scale, and supply limits
    on inputs such as amino acids and growth factors. Negulescu's plants
    need about 20,500 kg of transferrin a year, against a global
    production capacity of 200–300 kg.

4.  Batch scheduling and turnaround time between runs.

5.  Fixed costs tied to capital (maintenance, insurance as a share of
    investment) rather than set independently per kg.

**In the Unjournal model but not in the literature.** A full cost
distribution; probabilistic technology switches with correlation;
process mode as an uncertain outcome; a dry-mass basis; failure and loss
adjustments; and a contract-manufacturing option.

**Bearing on the competitive zone.** Converted at 30% solids, the
bottom-up academic designs range from about \$57/kg dry (Negulescu,
262,000 L airlift) to about \$170/kg dry (Humbird, perfusion). None
reaches \$12–36/kg dry. Only Risner's "all challenges solved" scenario
(about \$2/kg, basis unstated) would, and it is a stacked best case
rather than a design. Pasitka 2024, now read in full, puts cell mass
itself at about \$24/kg wet in its 50,000 L plant (about \$80/kg dry at
30% solids). Its headline \$6.2/lb is for a hybrid product that is half
plant ingredients at \$3/kg, using theoretical 25,000 L perfusion
vessels.

**Corrections for the team.** Four small errors turned up in the model's
own documentation:

- The link labelled "Garrison et al. (PMC)" in learn.qmd points to a
  2025 narrative review that cites Garrison's \$63/kg, not to Garrison
  itself.

- docs.qmd gives the maturity factor's mean as 0.5, but the code default
  is 0.40.

- "Kim et al." is a chicken-cell culture paper, not a cost model.

- Negulescu 2023's preprint and journal versions disagree (\$30.4,
  \$20.8 and \$13.0 against \$35, \$25 and \$17 per kg). This review
  uses the journal figures.

## Parameter evidence: the six priority items

For all three priority cost parameters, the competitive zone needs
values at or beyond the most favourable published figure, and the
favourable figures are model outputs, not measurements. For the three
technology probabilities, no source gives an elicited value for
hydrolysates or continuous culture, and none quantifies the correlation.
Figures marked (derived) are this review's arithmetic on a source's own
numbers.

### 1. Nutrient yield

The model's upper bound of 30 g dry cells per litre rests on two models;
an evidence-based range is nearer 2–15 g/L. The competitive zone needs
22.7–37.4 g/L.

| Source | Litres per kg (as reported) | Implied g dry cells per L (derived) | Basis of the number | Independence |
|----|----|----|----|----|
| Humbird 2021, engineered best case | About 8 L/kg wet | About 35 | Stoichiometry: 1.21 g glucose and 0.87 g amino acids per g dry cells | 1 |
| CE Delft 2021, low scenario | 8 / 13.4 / 41.7 L/kg wet | About 29 (low scenario) | Confidential company data | 1, unverifiable |
| Sinke et al. 2023 (same team, peer-reviewed) | 21 / 47 / 103 L/kg | About 10–14 / 4–6 / 2–3 | Company data and mass balance; unverifiable low figures dropped | 2 |
| Negulescu 2023 | 10.2 L/kg wet | About 29 | Yield coefficients measured in spent medium (mouse cells, defined medium) | 2 |
| GFI 2025 amino-acid report | 28–183 L/kg | About 1–11 | Real medium formulations | 1 |
| Measured glucose use, animal cells (GFI Nov 2025 review) | 1.6–3.6 g glucose per g dry cells | Worse than Humbird assumes | Laboratory measurements | 1 |

**Pasitka 2024 gives the only measured yield for meat cells found.** Its
20-day continuous run in a 1.8 L vessel made 1.73 kg of wet cells from
110 L of medium. That is about 64 L per kg wet, or roughly 5 g dry cells
per litre at 30% solids (3 g at the model's 20%). Its plant model
instead assumes about 22 L per kg wet, roughly 13 g dry per litre:
nearly three times the run's average, matching the best conversion it
saw at any point. Pasitka states no solids fraction, so both conversions
are assumptions.

The key fact is that CE Delft's own team, in its 2023 peer-reviewed
paper, replaced the 2021 low-medium figures because some could not be
verified. With them goes most of the support for the top of the model's
range. Apart from Pasitka's run, no measured bioreactor yield for
chicken, bovine or fish cells was found, and that run sits at the bottom
of the model's range.

### 2. Hydrolysate medium price

Price per litre cannot be judged apart from yield, and the model draws
the two independently. The competitive zone needs \$0.17–0.26/L, and
company claims go lower still. Only Pasitka's \$0.63/L discloses what is
in the litre, and it is a defined medium, not a hydrolysate.

- **Claims:** Clever Carnivore \$0.07/L; Meatly £0.22/L; Meatly and
  Gourmey about \$0.20/L (relayed by GFI); Believer \$0.63/L (Pasitka
  2024: a DMEM/F12-based medium with albumin replaced by cheaper
  additives, priced from bulk vendor quotes at pilot scale); Lever VC
  "several under \$0.50/L" (data under non-disclosure).

- **Why the claims don't settle it:** a dilute medium such as FSF4 (3.55
  g amino acids and 5 g glucose per litre) can make at most about 4 g
  dry cells per litre. At that yield, \$0.20/L means at least \$50/kg
  dry and \$0.07/L at least \$17/kg dry (derived). A cheap litre is
  cheap partly because it carries few nutrients.

- **Input prices:** GFI 2025 supplier quotes put amino acids at
  \$1–15/kg feed-grade and \$3–75/kg food-grade, against Humbird's
  \$40–156/kg. Hydrolysates currently cost about \$5–30/kg and would
  need \$1.51–11.27/kg to compete.

- **Partial replacement:** the best modelled hydrolysate blends supply
  up to about 60% of amino acids, so a blended price fits the evidence
  better than a yes/no switch.

- **Floor:** at Humbird's ideal efficiency, glucose and amino acids at
  commodity prices cost about \$2–5/kg dry (derived), roughly double at
  Sinke's baseline efficiency. The competitive worlds imply \$4.6–11/kg
  dry for all medium, which works only with near-ideal efficiency and
  cheap amino acids together.

  - **The two full-text designs:** Pasitka's \$0.63/L at 22 L per kg wet
    makes medium about \$14/kg wet (about \$47/kg dry at 30% solids),
    59% of its cell-mass cost. Negulescu's \$1.40/L at 10.2 L per kg wet
    gives the same \$14/kg wet; its best plant gets under \$10/kg wet
    only with medium below about \$0.75/L.

**Suggested reparameterisation.** Replace yield and price per litre with
(a) kg of nutrients per kg dry cells (evidence: about 1.7–4.0; Humbird
2.1) times (b) \$ per kg of nutrient mix, plus a per-litre charge for
water and sterilisation. That removes the spurious freedom to draw a
cheap litre and a high yield in the same world.

### 3. Fixed running costs

The evidence sits at or above the top of the model's \$1–6/kg wet range.
The competitive zone's \$1.13–1.81/kg wet is roughly labour alone.

| Source | Fixed running cost | Notes |
|----|----|----|
| Humbird 2021, fed-batch, about 7 thousand t/yr | \$5.78/kg wet | Labour \$1.45, maintenance \$1.92, insurance \$2.40 |
| Humbird 2021, perfusion | \$10.62/kg wet | Above the model's range |
| Humbird fed-batch rescaled to the model's 20 thousand t reference (derived) | \$3.75–5.78/kg wet | Using the model's own scale exponents |
| CE Delft 2021 | About \$2.00/kg for labour alone (derived) | About 200 staff at \$100,000 each |
| Garrison 2022 | About \$17.65/kg (derived) | 94 staff, \$9.68m a year, about 548 t |

Because Humbird sets maintenance at 4% and insurance at 5% of capital
each year, \$1.13–1.81/kg wet would need plant capital of about \$9–27
per annual kg (derived). Published designs are at \$45–108. The model
draws fixed cost independently of capital, so it can pair low fixed cost
with expensive plant. Tying maintenance and insurance to capital would
remove that inconsistency, and would likely shrink the competitive
region. Negulescu ties facility costs (maintenance, insurance, taxes) to
capital in the same way. Pasitka follows Humbird, and reports that
labour has a negligible effect on cost.

### 4–6. Technology probabilities and their correlation

The model's probabilities have no external anchor except, partly, for
growth factors. The ranges in the last column are the research team's
judgement from the evidence, offered as starting points for elicitation,
not as findings.

| Technology | Model default | Evidence | Suggested starting range |
|----|----|----|----|
| Hydrolysates usable | 0.75 | No FDA memo read mentions them; a 2026 review found only partial replacement in meat and seafood cells; Swartz judges full replacement of purified amino acids unlikely | 0.3–0.5 as main amino-acid source; 0.70–0.85 for cheap medium by any route |
| Cheap growth factors | 0.50 | Rethink Priorities panel (2021): 30% for under \$1/kg wet by 2031 (individuals 6–35%). One Unjournal workshop expert: 100% by 2036. Dose evidence favourable: Stout grew cells at 5 ng/mL FGF2, 20 times below the model's 0.1 mg/L. No verified at-scale price; the two FDA-documented processes read (UPSIDE, Mission Barns) still use recombinant factors | 0.55–0.75, with albumin assessed separately |
| Continuous culture at scale | 0.30 (perfusion 0.70) | Run for 20 days and 12 harvests in a 1.8 L vessel, with hands-on experience in a 300 L vessel (Pasitka 2024), by a firm now closed. No expert probability found | 0.15–0.35; perfusion's 0.70 also looks generous |

**Reframe the hydrolysate switch.** Cheap purified amino acids reach the
same price band as hydrolysates (GFI 2025), so the decision-relevant
event is "cheap food-grade medium by any route", not "hydrolysates
work".

**Correlation.** No source quantifies it, so it must be elicited,
ideally as conditional probabilities (e.g. P(continuous \| cheap growth
factors)). The evidence points to two common causes: the cell line (an
immortalised, suspension-adapted, serum-free line helps all three) and
the funding and regulatory climate. Growth factors and continuous
culture share those causes most; medium price least, since it is mainly
a commodity-supply question. As coded, the model does the reverse. In
the default "mixture" setting each world's process is drawn from fixed
weights (20% fed-batch, 50% perfusion, 30% continuous) that ignore the
maturity factor, while hydrolysates and growth factors load on it. The
feasibility probabilities (perfusion 0.70, continuous 0.30) are used
only in the optional least-cost setting, where they are also drawn
independently of maturity. Under independence at the defaults, all three
succeed in about 11% of worlds (0.75 × 0.50 × 0.30).

**Base rate for any elicitation.** Rethink Priorities compiled 273
public predictions; by January 2022, 80 of 90 resolved ones had failed
(75 of 84 in the original 2021 count), every miss in the optimistic
direction. No company cost target was found that was met on time and
verified. The only peer-reviewed company data (Pasitka 2024) produced
its \$6.2/lb from a model of a theoretical 50,000 L plant, for a product
that is half plant ingredients, and Believer ceased operations in early
December 2025, weeks after its USDA approval was announced on 31
October. Arthur D. Little puts current finished-product cost in the low
€40s/kg, three to six times the modelled figures companies cite.

## Parameter evidence: remaining parameters

For the bioprocess and capital parameters, the evidence mostly says the
model's favourable bounds are optimistic: cost of capital, plant
multiplier, scale exponent and failure rates all sit at or beyond what
published sources support. The exceptions are fed-batch density and
harvest cost, where the defaults look conservative. Figures marked
(derived) are this review's arithmetic on a source's own numbers; "wet"
figures are per kg wet cell mass.

**Bioprocess and capital.**

| Parameter | Unjournal default (p5–p95) | What the evidence says | Verdict on the default |
|----|----|----|----|
| Harvest density, fed-batch | 1–6 g/L dry | Humbird simulations end at 11–14 g/L dry; Negulescu assumes about 30 g/L dry | Conservative |
| Harvest density, perfusion and continuous | 6–30 and 10–40 g/L dry | Densities above about 100 g/L wet measured only at 35 L or less (Believer 360 g/L at 2 L; Ever After Foods 285 g/L at 35 L, via GFI survey). Pasitka's 130 million cells/mL was reached in serum-containing medium in a 5 L vessel; in its animal-free medium the peak was 28 million | Upper tail unsupported at scale |
| Oxygen-limited maximum | 12–60 g/L dry, optional, off by default | Agrees with Humbird and Negulescu | Supported; consider switching on |
| Cycle time | 0.5–5 days | Doubling times 23–30 hours; 2–5 days per harvest. The 0.5–1.5 day end matches only fungi and bacteria | Lower end too fast |
| Batch failure | 0.5–8% fed-batch; up to 20% continuous | Biopharma over 1,000 L: 7.6% total, 2.3% contamination (BioPlan 2008). Cultured-meat firms: 11.2% lost to contamination (n = 11), 19.5% excluding R&D-only firms (n = 6). Pasitka assumes a 1.3% production loss; Negulescu sizes for one contamination in 50 years | Describes mature biopharma, not current cultured meat |
| Reactor cost, food-grade share of pharma | 0.15–0.55 | One source, Humbird Table 3.1: 0.52 bare, 0.34 installed (derived). Lower third rests on brewery analogies or company claims | Plausible centre, weak lower tail; risk of double-counting since Humbird already uses non-pharma costs |
| Plant multiplier (total plant / reactor) | 1.5–3.5 | Humbird's total capital is about 9× installed production reactors (derived); Lang factor 7.2 fed-batch; CE Delft about 3 | Low, unless reactor \$/L already carries part of the plant |
| Capital scale exponent | 0.6–0.9 | Plants scale by replicating vessels, so plant-level exponents nearer 1 | 0.6 end optimistic |
| Whole-plant capital per annual kg wet | Implied by the above | Humbird \$48 and \$96; CE Delft \$45; Negulescu stirred tanks \$58–108; Garrison \$109 (all derived). Favourable outliers: Negulescu airlift \$14, Believer claim \$12 | Favourable tail rests on two weak points |
| Cost of capital | 8–20% | Published analyses use 5–10%; Negulescu charges straight-line depreciation with no financing cost at all; CE Delft uses payback periods (4–30 years) with no rate | Wider and higher than published, which is defensible for a first-of-kind plant |
| Asset life | 8–20 years | Published 10–20 years | Consistent |
| Plant size | 10–40 thousand t/yr | Published designs about 1–25 thousand t/yr (Pasitka about 1, Negulescu 4–25) | Slightly large |
| Uptime | Mean 0.90 | Engineering designs 82–91% | Consistent |
| Utilities and consumables | \$0.30–3.00/kg | Humbird fed-batch \$1.79/kg wet for utilities and consumables together (utilities alone \$0.94); perfusion consumables \$4.56/kg wet, of which membranes \$4.53 | Perfusion membranes exceed the 95th percentile alone |
| Harvest, wash, dewater | \$2.5–15/kg dry (placeholder) | Bottom-up about \$1.5–2.5/kg dry (derived) | Conservative |
| Seed-train share | 5–25% fed-batch; 1–6% long run | Humbird 24% fed-batch, 3.5% perfusion | Consistent |
| Contract-manufacturing toll | \$20–200/kg dry | No reliable sourced figure found | Unsupported either way |

**Three structural points for the team.**

1.  **Fixed cost should move with capital.** Humbird sets maintenance at
    4% and insurance at 5% of total capital each year, so about
    three-quarters of his fixed cost scales with capital. The model
    draws fixed cost independently, which lets a world combine cheap
    fixed cost with expensive plant, or the reverse.

2.  **Perfusion membranes are uncosted.** At \$4.53/kg wet, membranes
    alone exceed the whole utilities-and-consumables 95th percentile.
    Pasitka confirms the scale of this: single-use retention filters
    cost \$8.78/kg wet more than reusable ones. This is the concrete
    number behind the open note that continuous culture dominates the
    tail partly because its drawbacks are uncosted.

3.  **Continuous culture at scale rests on analogy.** The largest
    animal-cell perfusion found is biopharma at 2,000 L. Pasitka's
    continuous chicken result is 12 harvests over 20 days in a 1.8 L
    vessel, with hands-on experience in a 300 L vessel; the 50,000 L
    plant is theoretical. Believer's North Carolina plant never entered
    commercial production, and its builder reports \$34 million of
    unpaid invoices.

**Documentation mismatch.** docs.qmd lists the contract-manufacturing
toll as \$4–40 without a basis. That is the engine's \$20–200 per kg dry
converted to wet at 20% solids, but it contradicts the same page's
statement that toll inputs are per kg dry.

## Lineage map: which estimates are independent

For each priority parameter there are only two or three independent
evidence lines, and most published estimates trace back to Humbird
2020/2021 or CE Delft 2021. Counting sources rather than lineages would
overstate how well the ranges are supported.

**Lineages.**

| Root source | What is original to it | Later sources that inherit from it |
|----|----|----|
| Humbird 2020 (Open Philanthropy) / 2021 (*Biotechnol Bioeng*) | Engineering design: capital, fixed costs, density limits, nutrient stoichiometry, growth-factor price regression | Negulescu 2023 (cell properties, input-price curves); GFI 2023 growth-factor concentration, and through it the Unjournal 0.102 mg/L; Lever VC 2025 (misquoted); many reviews |
| CE Delft 2021 (for GFI and GAIA) | Confidential company data on medium use, energy, equipment | Sinke et al. 2023 (same team, revised downwards); Wimble 2025; GFI summaries |
| Risner et al. 2021 | Scenario model | Ashizawa 2022 (insect cells) |
| Garrison et al. 2022 | Enterprise budget with staffing | None found |
| Pasitka et al. 2024 (Believer Meats) | Own perfusion data at small scale, run through Humbird's cost structure | Trade press; Unjournal comparison page |
| GFI 2025 amino-acid report | Supplier quotes for amino acids and hydrolysates | GFI Europe/ADL protein-cost work |
| Rethink Priorities 2021–2022 | Elicited probabilities; prediction track record | EA Forum discussion |
| Company self-reports | Medium price and density claims | GFI State of the Industry; Lever VC |

**Independent evidence lines per priority parameter.**

| Parameter | Independent lines | What they are |
|----|----|----|
| Nutrient yield | 3 | Humbird stoichiometry; CE Delft/Sinke company data (one lineage); GFI 2025 formulations |
| Hydrolysate medium price | 3, one unverifiable | Humbird hydrolysate case; GFI 2025 supplier quotes; company claims (composition undisclosed) |
| Fixed running costs | 3 | Humbird design; CE Delft staffing; Garrison enterprise budget |
| P(hydrolysates usable) | 0 elicited | Qualitative statements only (Swartz; 2026 review) |
| P(cheap growth factors) | 2 | Rethink Priorities panel; one Unjournal workshop respondent |
| P(continuous at scale) | 0 elicited | Demonstrations only (Believer, about 300 L) |

**Grades in the parameter sheet.** Of 423 extracted rows, 298 are graded
1 (the number originates in that source), 89 graded 2 and 36 graded 3.
Grade 1 is assigned per number, not per source, so a source like Humbird
contributes many grade-1 rows; use the lineage table, not the row count,
to judge how much independent evidence there is.

## Risk of bias across sources

No source in the review is at low overall risk of bias for the
favourable tail. The best-grounded sources (Humbird, Negulescu, Sinke
2023) give the least favourable numbers; the most favourable numbers
come from company self-reports and an advocacy-commissioned study whose
key inputs were later withdrawn by its own authors.

| Source | Transparency | Empirical grounding | Conflicts | Scale realism | Uncertainty | Overall |
|----|----|----|----|----|----|----|
| Humbird 2021 | Low | Some concerns (biopharma analogues) | Low (Open Philanthropy, no product stake) | Some concerns | Some concerns (scenarios only) | Some concerns |
| Negulescu 2023 | Low | Some concerns (medium use measured; density and prices inherited) | Low | Some concerns (airlift vessel priced at about one-sixth of NREL's figure) | Some concerns | Some concerns |
| Risner 2021 | Low | High (scenario 4 is stacked best case) | Low | High | Some concerns | Some concerns |
| Garrison 2022 | Not assessed (not opened) | — | — | — | — | Some concerns |
| Pasitka 2024 | Some concerns (supplement not read) | Some concerns (small-scale data, theoretical plant) | High (company authors) | High | Some concerns (capital and contamination only) | High |
| CE Delft 2021 | High (confidential data) | High (low inputs later withdrawn in Sinke 2023) | High (GFI- and GAIA-funded) | Some concerns | Some concerns (stacked scenarios) | High |
| Sinke et al. 2023 | Some concerns | Some concerns | Some concerns | Some concerns | Some concerns | Some concerns |
| GFI reports | Some concerns | Some concerns (supplier quotes) | Some concerns (advocacy) | Some concerns | Some concerns | Some concerns |
| Rethink Priorities | Low | Not applicable (elicitation, n = 6) | Low | Not applicable | Low | Some concerns (small panel) |
| McKinsey, Kearney, BCG | High | High | Some concerns | High | High | High |
| Lever VC 2025 | High | High | High (undisclosed holdings) | High | High | High |
| Company claims | High | High (unverified) | High | High | High | High |

The pattern is the important finding: evidence quality and favourability
are negatively correlated. A model whose favourable bounds are set by
the most favourable published figure will import the bias of the least
reliable sources. Ratings are by a single assessor using the bespoke
checklist in Methods; the team should treat them as a first pass.

## Limitations and suggested changes to put to the team

The review supports nine changes, four of them structural. Most would
shrink the competitive region, and the team should expect that: the
current competitive recipe sits on favourable bounds that the evidence
traces to model outputs and unverified claims.

**Suggested changes, most important first.**

1.  **Reparameterise medium cost.** Replace independent draws of
    nutrient yield and price per litre with kg of nutrients per kg dry
    cells (evidence about 1.7–4.0) times \$ per kg of nutrient mix, plus
    a per-litre charge for water and sterilisation. This removes worlds
    with a cheap, dilute litre and a high yield at once.

2.  **Lower the nutrient-yield upper bound** to about 15 g/L, or move
    15–35 g/L into a separate "engineered metabolism plus concentrated
    feed" world with its own probability. The current top of the range
    rests on Humbird's theoretical case and CE Delft figures its own
    team later withdrew.

3.  **Tie fixed running costs to capital.** Model fixed cost as labour
    plus a share of capital for maintenance and insurance (Humbird: 4%
    and 5% a year). This stops cheap fixed cost being drawn alongside
    expensive plant.

4.  **Cost the drawbacks of perfusion and continuous culture.** Add
    cell-retention membranes (Humbird: \$4.53/kg wet) and switch the
    oxygen cap on by default. Without these, continuous culture wins the
    tail partly by omission.

5.  **Reframe the hydrolysate switch** as "cheap food-grade medium by
    any route", with hydrolysate share as a continuous blend (evidence:
    up to about 60%).

6.  **Correlate continuous culture with the other technologies.** Load
    it on the maturity factor, and elicit conditional probabilities
    rather than marginals. The evidence suggests growth factors and
    continuous culture share the most common causes (cell line, funding
    climate).

7.  **Split out albumin** from supplemental proteins and widen the
    expensive regime; at \$200/kg albumin the cost is about \$16/kg dry,
    against the current \$0.50–4.00 range.

8.  **Revisit capital multipliers.** The plant multiplier of 1.5–3.5 is
    low against published Lang factors of about 3 (CE Delft) to 7
    (Humbird), unless reactor \$/L already covers part of the plant; a
    plant-level scale exponent of 0.6 is optimistic when plants scale by
    adding vessels.

9.  **Raise failure rates for the near term.** Cultured-meat firms
    report 11–20% of batches lost to contamination, against biopharma's
    2–8%. A maturity-linked decline to 2036 would be more defensible
    than biopharma rates throughout.

**Documentation fixes.** The "Garrison et al. (PMC)" link in learn.qmd
points to a different paper; docs.qmd gives a maturity mean of 0.5
against a code default of 0.40, and lists the contract-manufacturing
toll as \$4–40 with no basis (it is the wet equivalent of the engine's
\$20–200/kg dry), while saying toll inputs are per kg dry.

**Elicitation.** The six-item priority list holds up, with two changes:
ask for P(cheap medium by any route) rather than P(hydrolysates), and
ask for conditional probabilities across the three technologies. Show
experts the base rate first: 80 of 90 resolved public predictions
failed, all on the optimistic side.

**Limitations of this review.**

- **Search coverage.** The academic arm searched PubMed only; other
  databases were unreachable. It needs a Scopus or Web of Science re-run
  before it can be called systematic.

- **Key texts not read in full.** Garrison 2022 (second-hand) and
  Goodwin 2024's scoping review. Pasitka 2024 and Negulescu 2023 were
  read in full from copies the reviewer supplied, but not their
  supplementary tables.

- **Hand-search stopped on budget,** not saturation. About twenty named
  consultancy and government sources were not searched; paywalled
  consultancy reports were not retrieved.

- **Locators.** Long PDFs were read through a summarising fetch tool, so
  page and table locators for Humbird 2020 and the GFI amino-acid report
  should be checked before quoting.

- **Conversions.** Where a source gave no solids fraction, conversion to
  dry used 30% and is labelled; Humbird's own basis is ambiguous between
  20% and 30%.

- **Single assessor** for screening, independence grades and risk of
  bias.

- **Suggested probability ranges** in the priority section are the
  research team's judgement, not elicited values.

  - **Verification.** An independent check of 11 groups of key figures
    against the original sources (Humbird journal and preprint,
    Negulescu, CE Delft corrigendum, Sinke, Rethink Priorities, GFI,
    Pasitka, the model code) confirmed all but four details, which have
    been corrected here: Humbird's \$1.79/kg is utilities plus
    consumables, not utilities alone; Believer's approval date;
    Humbird's air-sparged and base-case densities; and the basis of the
    contract-manufacturing toll.

## Sources

Key sources only; the parameter sheet carries a link and locator for
every extracted figure. "Abstract" marks sources not read in full.

**Academic.**

- [Humbird 2021, Scale-up economics for cultured meat, *Biotechnol
  Bioeng*](https://doi.org/10.1002/bit.27848) and [2020
  preprint](https://engrxiv.org/preprint/download/1438/2973/2173)

- [Risner et al. 2021, *Foods*](https://doi.org/10.3390/foods10010003)

- [Negulescu et al. 2023, *Biotechnol
  Bioeng*](https://doi.org/10.1002/bit.28324) (abstract) and
  [preprint](https://engrxiv.org/preprint/download/2414/4659/3571)

- [Pasitka et al. 2024, *Nature
  Food*](https://doi.org/10.1038/s43016-024-01022-w) (abstract)

- [Garrison, Biermacher & Brorsen
  2022](https://www.sciencedirect.com/science/article/pii/S2666154322000916)
  (second-hand)

- [Ashizawa et al. 2022, *Foods*](https://doi.org/10.3390/foods11193037)

- [Sinke et al. 2023, *Int J Life Cycle
  Assess*](https://doi.org/10.1007/s11367-022-02128-8)

- [Stout et al. 2022, Beefy-9, *Commun
  Biol*](https://doi.org/10.1038/s42003-022-03423-8)

- [O'Neill et al. 2022, spent media, *npj Sci
  Food*](https://doi.org/10.1038/s41538-022-00157-z)

- [Brenner et al. 2026, *Front
  Nutr*](https://doi.org/10.3389/fnut.2026.1844185)

- [Daoutakou & Kintzios 2026, stochastic decision-support
  preprint](https://doi.org/10.20944/preprints202610.2016.v1)

- [Wimble et al. 2025,
  bioRxiv](https://www.biorxiv.org/content/10.1101/2025.04.30.651479.full.pdf)

**Grey literature and forecasts.**

- [CE Delft 2021, TEA of cultivated meat
  (corrigendum)](https://gfieurope.org/wp-content/uploads/2022/04/CE_Delft_190254_TEA_of_Cultivated_Meat_FINAL_corrigendum.pdf)

- [Specht 2020, GFI medium cost
  analysis](https://gfi.org/wp-content/uploads/2021/01/clean-meat-production-volume-and-medium-cost.pdf)

- [GFI 2025, Amino acid cost and supply chain
  analysis](https://gfi.org/wp-content/uploads/2025/12/Amino-acid-cost-and-supply-chain-analysis-for-cultivated-meat.pdf)

- [GFI growth factor volume and cost
  analysis](https://gfi.org/resource/cultivated-meat-growth-factor-volume-and-cost-analysis/)
  (landing page)

- [Harsini & Swartz 2024, GFI scale-up
  survey](https://gfi.org/resource/trends-in-cultivated-meat-scale-up-and-bioprocessing/)

- [GFI Europe & Arthur D. Little 2025, precision fermentation
  viability](https://gfieurope.org/wp-content/uploads/2025/07/Pathfinding-towards-precision-fermentation-viability.pdf)

- [Rethink Priorities: Cultured meat predictions were overly
  optimistic](https://forum.effectivealtruism.org/posts/YYurNqQDAWNiQJv9K/cultured-meat-predictions-were-overly-optimistic)

- [Rethink Priorities 2022: Forecasts estimate limited production
  through
  2050](https://rethinkpriorities.org/research-area/forecasts-estimate-limited-cultured-meat-production-through-2050/)

- [Rethink Priorities: Comparison of techno-economic
  analyses](https://forum.effectivealtruism.org/posts/y8jHKDkhPXApHp2gb/cultured-meat-a-comparison-of-techno-economic-analyses)

- [McKinsey
  2021](https://www.mckinsey.com/industries/agriculture/our-insights/cultivated-meat-out-of-the-lab-into-the-frying-pan)

- [Lever VC
  2025](https://www.levervc.com/wp-content/uploads/2025/04/Lever-VC-A-Second-Generation-of-Cultivated-Meat-Companies-Breaks-Through.pdf)

- [Fassler 2021, The
  Counter](https://thecounter.org/lab-grown-cultivated-meat-cost-at-scale/)

- [Unjournal workshop
  summary](https://uj-cm-workshop.netlify.app/summary)

**Analogues, regulators and company reporting.**

- [NREL 2017, large-scale aerobic cultivation
  design](https://www.nrel.gov/docs/fy17osti/67963.pdf)

- [Langer 2008, BioPlan batch failure
  survey](https://bioprocessintl.com/bioanalytical-methods/biotech-facilities-average-a-batch-failure-every-40-6-weeks)

- [Continuous cell culture at 2,000 L, BioProcess
  International](https://www.bioprocessintl.com/perfusion-cell-culture/continuous-cell-culture-operation-at-2-000-l-scale)

- FDA pre-market memos: [UPSIDE](https://fda.gov/media/163261/download),
  [GOOD Meat](https://fda.gov/media/166348/download), [Mission
  Barns](https://www.fda.gov/media/185744/download),
  [Believer](https://www.fda.gov/media/188067/download)

- [AgFunder: what went wrong at Believer
  Meats](https://agfundernews.com/what-went-wrong-at-believer-meats-sources-point-to-risk-scale-and-timing)

- [AgFunder: "Humbird was spectacularly
  wrong"](https://agfundernews.com/humbird-was-spectacularly-wrong-on-cultivated-meat-economics-says-report-as-vow-predicts-it-will-hit-price-parity-within-5-years)

- [FoodManufacture: Arthur D. Little on price parity
  (2026)](https://www.foodmanufacture.co.uk/Article/2026/07/20/cultivated-meat-close-to-price-parity/)

PubMed was used to locate and retrieve several academic articles; DOIs
are given above.

**Medium, growth factors and supplemental proteins.**

| Parameter | Unjournal default | What the evidence says | Verdict on the default |
|----|----|----|----|
| Fresh medium use | 40–300 L/kg dry | Humbird 25–29 L/kg dry (or 87 from his water table); CE Delft 35–139; Sinke 70–515; GFI 93–915; Specht 19–200 (all converted to dry) | Lower bound optimistic; upper bound too low against Sinke and GFI |
| Growth-factor concentration | 0.102 mg/L (Humbird via GFI 2023) | Stout sustained growth at 5 ng/mL FGF2, 20 times lower; Vow, Gourmey and Meatly claim few or none | Conservative |
| Growth-factor price, cheap vs expensive regime | See priceRanges in the engine | Only at-scale figures: Humbird's volume regression \$316–812/g FGF2; GFI target \$100/g; unsubstantiated supplier claims of \$1/g. Bulk food-grade recombinant protein modelled at \$12–100/kg (GFI Europe/ADL) | Humbird's price falls in the model's cheap regime, so the expensive regime is more pessimistic than Humbird |
| Supplemental proteins, expensive regime | \$0.50–4.00/kg dry | Albumin at 0.8 g/L and 100 L/kg dry costs \$0.80/kg dry at \$10/kg albumin but \$16 at Negulescu's \$200/kg (derived). Humbird's insulin plus transferrin alone about \$8/kg dry (derived) | Too low if albumin or Humbird's insulin and transferrin are used |
| Pharma-grade basal medium | \$0.5–2.5/L | Catalogue prices far higher; bulk-scale estimates depend on amino-acid price (above) | Not independently tested |

Albumin removal is reported by Believer, Vow, Meatly and Stout
(Beefy-R), which argues for treating albumin as its own switch rather
than inside "supplemental proteins".
