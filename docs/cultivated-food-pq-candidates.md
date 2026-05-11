# Candidate Forecasting Questions: Cultivated & Precision-Fermentation Food Products

*Draft for discussion — potential Metaculus / forecasting tournament questions.*  
*Seven questions spanning market penetration, price parity, consumer acceptance, and production cost for cultivated and precision-fermentation food products.*

---

## Common operationalization notes

**"Price parity" definition**: the cultivated/PF product is available for commercial purchase at ≤ a stated multiple of the conventional commodity benchmark (defined per question), for orders of ≥ the stated minimum quantity, sustained for ≥3 consecutive months.

**"Commercially available"**: product available for regular ongoing purchase — not a one-time event, pilot, or laboratory demonstration. Minimum: ≥3 consecutive months, purchasable by any qualifying buyer.

**Resolution source verification note**: all sources cited below were confirmed as publicly accessible (free) as of 2025. Long-horizon questions (resolving 2033+) should specify a fallback hierarchy in case the primary source discontinues.

---

## Question 1 — Cultivated chicken: meaningful blend in retail ground chicken

### Title
Will a commercial ground/minced chicken product containing ≥10% cultivated chicken cells (by raw weight) be available in mainstream retail in any G20 country by 2035?

### Background
Cultivated chicken has received regulatory approval for limited commercial sale in Singapore (2020) and the United States (2023). Near-term commercial strategy for most companies involves blended products — combining conventional and cultivated chicken — to reduce per-unit cost while maintaining familiar taste. A 10% cultivated fraction represents a commercially meaningful threshold: sufficient to begin displacing conventional production at the margins. This question tracks whether blended cultivated chicken crosses from pilot/restaurant sales into mainstream grocery retail.

### Resolution criteria
Resolves **YES** if, before 31 December 2035:

- A ground or minced chicken product is available for purchase in ≥100 retail grocery outlets (physical or major online grocery) in any G20 member country
- The product contains ≥10% cultivated chicken cells by raw/wet weight, as stated on product labeling, in verified company documentation, or confirmed by a credible third-party industry analyst
- "Cultivated chicken cells" means myogenic cells derived from live chickens and expanded in bioreactors — not plant-based ingredients, flavoring extracts, or cell-based seasonings
- Product is available for ≥3 consecutive months

### Resolution sources
- Product label / company press release + independent verification from ≥1 of: Food Navigator USA, Bloomberg Intelligence, SPINS/NielsenIQ retail scanner data, or academic publication
- Regulatory approval documentation (USDA FSIS, Singapore SFA, or equivalent) confirming cultivated content ≥10%
- If labeling law does not require disclosure: third-party audit or investigative trade reporting

### Fine print
- Products sold exclusively in restaurants or food service do not qualify — must be retail
- Blended products where the cultivated fraction is derived from a non-chicken species do not qualify
- The 10% threshold is by raw wet weight of the cultivated cell component

### Resolution date: 31 December 2035

---

## Question 1b — Cultivated chicken blend: retail price parity with conventional ground chicken

### Title
Will a commercial ground chicken product containing ≥10% cultivated chicken cells be sold at ≤2× the retail price of equivalent conventional ground chicken in any G20 country by 2033?

### Background
Market penetration (Question 1) and consumer acceptance (Question 2) are necessary but not sufficient for mainstream adoption — price must also be competitive. A 2× price premium represents a plausible early commercial milestone for a novel ingredient positioned on sustainability grounds. For context, organic ground chicken typically sells at 1.5–2.5× the conventional price; a cultivated-blend product priced comparably would be within consumer willingness-to-pay for sustainability attributes.

### Resolution criteria
Resolves **YES** if, before 31 December 2033:

- A ground or minced chicken product meeting the ≥10% cultivated cell criteria (same as Question 1) is commercially available in retail
- The product's retail shelf price per kg (or equivalent per-unit price) is ≤2× the median retail price of comparable conventional ground chicken (same fat content, similar packaging size) in the same market and week
- Price comparison verified from ≥3 retail outlets in the same metropolitan area, or from a retail scanner database report (see sources)
- Sustained for ≥4 consecutive weeks (not a temporary introductory price)

### Resolution sources
- **USDA AMS Poultry Market News** — free, weekly, publishes retail chicken prices in selected US cities: https://www.ams.usda.gov/market-news/poultry
- **BLS Consumer Price Index** — free, monthly, "fresh whole chicken" (proxy): https://data.bls.gov/cgi-bin/surveymost?ap
- **Eurostat food price statistics** (EU markets): https://ec.europa.eu/eurostat/statistics-explained/index.php/Food_prices
- **Retail scanner data** (NielsenIQ, SPINS, Circana) — paywalled but widely cited in trade press; Food Navigator, Good Food Institute, or Bloomberg reports often include sourced price comparisons
- **Direct retail verification**: screenshot/documentation of shelf prices from ≥3 major retailers

### Fine print
- "Equivalent conventional ground chicken" means the same ground/minced form with comparable fat percentage (within 5 percentage points); premium chicken breeds (heritage, air-chilled) are not the benchmark
- Price per kg adjusted for packaging — bulk/value packs must be converted to per-kg basis
- If the cultivated blend is only sold in premium segments (e.g., "premium organic" section) where conventional chicken is also priced higher, the comparison uses the conventional ground chicken price in the same premium segment
- Temporary promotional or introductory pricing does not count — must be a sustained list price

### Resolution date: 31 December 2033

---

## Question 2 — Cultivated chicken: consumer taste equivalence

### Title
Will a commercially available cultivated or cultivated-blend ground chicken product pass a pre-registered blinded taste equivalence test by 2035?

### Background
A cultivated chicken product must be indistinguishable from (or preferred over) conventional ground chicken in taste and texture to achieve mainstream adoption. This question tracks publication of a credible third-party taste equivalence study on a commercial product — the moment where both production viability and consumer acceptance are independently validated for the same product.

### Resolution criteria
Resolves **YES** if, before 31 December 2035, a peer-reviewed or pre-registered study is published showing:

- A commercially available ground chicken product containing ≥10% cultivated cells passes a blinded taste test with ≥100 regular chicken consumers
- **Triangle test**: ≤40% correctly identify the cultivated/blend as different (not significantly above 33% chance rate at p < 0.10) — OR — **Preference test**: ≥50% rate the cultivated/blend as "equivalent to or better than" conventional
- Test conducted by a party independent of the manufacturer
- Cooking method standardized and described
- The tested product is the same commercially available product, purchased through normal retail channels

### Resolution sources
- Peer-reviewed publication in a food science or sensory science journal (e.g., *Food Quality and Preference*, *Journal of Sensory Studies*, *Appetite*, *Nature Food*)
- Pre-registered study on OSF (Open Science Framework), AsPredicted, or ClinicalTrials.gov with published results
- Third-party sensory analysis from a credentialed sensory science firm (e.g., Mérieux NutriSciences, Intertek, SGS) with methodology publicly disclosed

### Fine print
- Self-reported taste surveys by cultivated meat companies without third-party blinding do not qualify
- Tests on laboratory prototypes (not the commercial product as sold) do not qualify
- A product failing a triangle test but passing a preference test resolves YES

### Resolution date: 31 December 2035

---

## Question 3 — Average production cost of cultivated chicken at commercial scale in 2036

### Title
What will be the average production cost ($/kg, factory-gate wet weight) of cultivated chicken cell biomass at large-scale commercial plants globally, as of December 2036? [2025 USD]

*This is a numeric question resolving to a $/kg value.*

### Background
The fundamental cost question for cultivated chicken is whether production costs will fall sufficiently to enable price-competitive products. This question operationalizes the central metric tracked in published techno-economic analyses (TEAs): the all-in manufacturing cost per kg of cultivated chicken cell biomass (wet weight, at harvest) at commercial scale, excluding downstream processing, blending, packaging, and distribution. This matches the definition used in Humbird (2021), Pasitka et al. (2024), and the Unjournal's CM_01 pivotal question (https://www.metaculus.com/c/unjournal/38815/).

**"Large-scale"**: ≥10,000 L bioreactor working volume per facility; or ≥100 tonnes of cell biomass annual output.  
**"Factory-gate wet weight"**: cost at the point cells are separated from spent media, before downstream processing.  
**"Average across all plants"**: capacity-weighted average across operating commercial plants, not the most optimistic outlier.

### Resolution approaches

**Option A — LLM synthesis (preferred; Metaculus compatibility uncertain as of 2025)**

At resolution date, a designated moderator queries a frontier AI model (model version to be specified and frozen at question creation) with all available public evidence and the following standardized prompt:

> *"Based on all publicly available evidence, what is your best estimate of the capacity-weighted average production cost per kg (wet weight, factory gate) of cultivated chicken cell biomass at commercial-scale plants (≥10,000 L bioreactor capacity) globally, as of December 2036, in 2025 USD? Provide: (1) a point estimate, (2) a 90% confidence interval, (3) your primary sources ranked by weight, (4) the key assumptions driving your estimate. If no plants at this scale exist, provide the best available near-commercial estimate and state what scale it corresponds to."*

The AI's point estimate is used as the resolution value. If the AI's 90% CI is wider than $50/kg (indicating very high uncertainty), the question resolves ambiguous.

**Option B — GFI-based (Metaculus-compatible fallback)**

Resolves to the median production cost estimate for commercial-scale cultivated chicken cited in the most recent GFI State of the Industry — Cultivated Meat, Seafood and Ingredients annual report published before December 31, 2036 (https://gfi.org/resource/cultivated-meat-eggs-and-dairy-state-of-the-industry-report/).

- If GFI cites a range, the midpoint is used
- If GFI reports multiple figures (e.g., by company, scale, or scenario), the capacity-weighted median is used
- Cost converted to 2025 USD using US CPI if reported in nominal terms

If the GFI report is discontinued or does not contain a usable production cost estimate, falls back to Option C.

**Option C — Academic TEA median (secondary fallback)**

Resolves to the median production cost estimate across peer-reviewed TEA papers for commercial-scale cultivated chicken published between January 1, 2034 and December 31, 2036, identified by searching Google Scholar for "cultivated chicken production cost" or "cultured meat techno-economic."

### Resolution sources (verified as of 2025)

| Source | URL | Access | Reliability for 2036 |
|---|---|---|---|
| GFI State of the Industry (annual) | https://gfi.org/resource/cultivated-meat-eggs-and-dairy-state-of-the-industry-report/ | Free | Uncertain — depends on GFI continuing |
| Google Scholar / PubMed | https://scholar.google.com | Free | High — academic publishing will continue |
| USDA CPI deflator | https://www.bls.gov/cpi/ | Free | High — government series |
| The Unjournal CM_01 page | https://www.metaculus.com/c/unjournal/38815/ | Free | Moderate — Metaculus may change |
| SEC / EDGAR filings | https://www.sec.gov/cgi-bin/browse-edgar | Free | Applicable if any CM company is publicly traded |

### Fine print
- If no plants meeting the "large-scale" threshold exist as of December 2036, the question resolves to the best available near-commercial estimate from the most advanced pilot facility, with an explicit note about scale
- "Production cost" includes: media, growth factors, bioreactor capital (annualized), plant overhead, utilities. Excludes: texturization, blending, packaging, distribution, regulatory compliance overhead
- Costs reported in non-USD currencies are converted using 12-month average exchange rate preceding December 2036
- If Option A (LLM) produces a value outside the range [$1, $500/kg], the resolution is flagged for moderator review before finalizing

### Resolution date: 31 December 2036

---

## Question 4 — Precision fermentation egg white protein: price parity with conventional

### Title
Will precision fermentation-derived egg white protein (ovalbumin, ≥80% protein) be commercially available at ≤120% of the conventional dried egg white commodity price, in quantities ≥1 tonne, by 2033?

### Background
Ovalbumin (the dominant protein in egg whites) has been produced via precision fermentation by companies including Every Company (formerly Clara Foods). Replacing conventional egg whites with PF-derived ovalbumin at scale would reduce demand for egg production — with direct welfare benefits for laying hens and eliminating the routine culling of approximately 7 billion male chicks annually. The "120% threshold" reflects the typical early-market premium for novel food ingredients; this question asks whether that gap has narrowed to within 20%.

### Resolution criteria
Resolves **YES** if, before 31 December 2033:

- ≥1 company offers food-grade PF-derived ovalbumin (≥80% protein, spray-dried or equivalent dry form) for commercial purchase by food manufacturers, in quantities ≥1 tonne per order
- List price for ≥1 tonne orders is ≤120% of the USDA AMS Egg Products Report price for spray-dried conventional egg white, averaged over the preceding 12 months

### Resolution sources
- **USDA AMS Egg Products Report** — free, quarterly: https://www.ams.usda.gov/market-news/egg-products — confirmed to report spray-dried egg white prices
- **Company price sheets** corroborated by ≥1 independent source: distributor catalogs, Food Navigator, Bloomberg Intelligence, or trade press
- If product is not publicly listed, wholesale quotes received by ≥3 independent food manufacturers constitute resolution

### Fine print
- Products sold only for pharmaceutical or cosmetic applications at pharma-grade prices do not qualify
- 12-month rolling average used for the USDA benchmark if short-term volatility is high

### Resolution date: 31 December 2033

---

## Question 5 — Cultivated shrimp (minced/processed form): price-competitive availability

### Title
Will commercially available cultivated shrimp in minced or processed form (≥50% cultivated cells by weight) be sold at ≤2× the wholesale price of equivalent conventional processed shrimp by 2033?

### Background
Cultivated shrimp in minced/processed form — suitable for dumplings, shrimp balls, shrimp paste, and cooked applications — is the near-term achievable milestone, given the technical difficulty of whole-tail cultivation. Shrimp aquaculture involves hundreds of billions of animals in high-density conditions with routine practices including de-eyestalling of female broodstock.

### Resolution criteria
Resolves **YES** if, before 31 December 2033:

- A product containing ≥50% cultivated shrimp cells by raw wet weight (cells from *Penaeus* or equivalent edible shrimp species, grown in bioreactors) is available in minced, processed, or paste form
- Available for regular commercial purchase in ≥1 country for ≥3 consecutive months
- List price for ≥100 kg bulk orders is ≤2× the FOB benchmark for equivalent-grade conventional minced shrimp averaged over the preceding 12 months

### Resolution sources
- **FAO FishStat** — free, annual: https://www.fao.org/fishery/statistics/software/fishstat — shrimp production and trade price data
- **URNER BARRY seafood price sheets** — subscription, but widely cited in trade press; *Seafood Source*, *IntraFish*, *Undercurrent News* regularly publish prices from these
- **USDA NASS Aquaculture Survey** — free, annual: https://www.nass.usda.gov/Surveys/Guide_to_NASS_Surveys/Aquaculture/
- **Company disclosure / regulatory filings** in Singapore (SFA), US (USDA FSIS), or EU (EFSA) confirming cultivated content

### Fine print
- Products sold only as one-off restaurant promotions without a standard commercial price list do not qualify
- Cultivated fraction must be ≥50%; blends below this threshold do not qualify
- Price comparison uses bulk food-service pricing, not single-serve retail premium

### Resolution date: 31 December 2033

---

## Question 6 — Cultivated shrimp (whole tail): commercially available at competitive price

### Title
Will a commercially available whole-muscle cultivated shrimp tail (discrete tail morphology, ≥80% cultivated cells, no conventional shrimp casing) be sold at ≤3× the wholesale price of equivalent-size farmed shrimp in any market by 2038?

### Background
Whole-tail shrimp — the form familiar in Western and East Asian premium markets — requires organized muscle fiber structure, which demands scaffolding or advanced biofabrication. This is the harder milestone, set with a 3× price threshold rather than the 2× for minced forms.

### Resolution criteria
Resolves **YES** if, before 31 December 2038:

- Discrete pieces with shrimp-tail morphology (elongated, segmented, visually recognizable as a shrimp tail) containing ≥80% cultivated crustacean cells are commercially available
- Does NOT use a conventional shrimp exoskeleton as an external casing
- Available for regular commercial purchase in ≥1 country for ≥3 consecutive months
- List price for ≥10 kg bulk orders is ≤3× the FOB benchmark for equivalent-size conventional farmed shrimp

### Resolution sources
- Same as Question 5 (FAO FishStat, URNER BARRY via trade press, company/regulatory disclosure)
- Specific size-grade benchmark: headless shell-on *P. vannamei*, 16/20 count per pound (~22–28g per piece)

### Fine print
- Products where a conventional shrimp shell is filled with cultivated mass do not qualify — must be a freestanding cultivated piece
- Plant-based shrimp-substitute products are excluded
- Verification that product contains ≥80% cultivated cells must be independent of the manufacturer

### Resolution date: 31 December 2038

---

## Notes on resolution approach for long-horizon questions

**The GFI dependency problem**: Questions resolving in 2033–2038 depend partly on whether GFI and similar organizations continue publishing structured cost data. GFI has published annual State of the Industry reports since ~2018, but 10+ year continuity is not guaranteed.

**LLM-based resolution (Option A for Question 3)**: The Unjournal has explored using frontier AI models to synthesize available evidence at resolution date, rather than relying on a single institutional source. This is more robust to institutional discontinuity. As of 2025, Metaculus has not formally accepted this resolution format; GFI-based and TEA-median approaches remain the most Metaculus-compatible alternatives. This is an evolving area.

**Fallback hierarchy for all questions**: Where a primary source is cited, a fallback should be specified at question creation: (1) primary source, (2) equivalent industry body report, (3) academic literature median, (4) Metaculus community median at resolution.

---

*Prepared by The Unjournal for discussion as candidate questions for an animal welfare forecasting tournament.*  
*Download: https://raw.githubusercontent.com/unjournal/cm_pq_modeling/main/docs/cultivated-food-pq-candidates.md*
