# How strongly should the model link the four technology breakthroughs? Research note for calibrating the maturity link

Prepared 17 November 2026 as background for the cultured-chicken cost model. This is a research note, not a change to the model. It was written by an AI research agent (Claude) for David Reinstein and has not been reviewed by a person. Its central calculation, the correlation the current link implies, was re-derived independently and agrees (about 0.01); the literature citations have not been re-checked.

## Summary

The current "maturity" link is so weak that it is, for practical purposes, independence. With the stated strengths (0.20 to 0.30) and a maturity draw whose standard deviation is 0.20, I calculate that the correlation between any two of the four yes/no technologies is about 0.01 (range 0.009 to 0.014). Put on the scale that the literature uses, the equivalent correlation of an underlying bell-curve variable is about 0.01 to 0.02. The conventions I could verify in other fields are far higher: 0.2 to 0.3 for dependence between cost elements in United States defence and space cost-risk analysis, and 0.20 for success events in a published drug-development portfolio model. Those conventions are not evidence about cultured meat, and the drug-development authors say plainly that they found no empirical estimate; I found none for bioprocess technologies either. Established energy-technology portfolio work built on expert elicitation often simply assumed independence (I verified this for one such paper), so the current model is not unusual in the energy-technology tradition, but it is far weaker than the conventions used in cost-risk practice. The literature on eliciting dependence from experts says that experts find probability-style dependence questions hard and that results are noisy (in one pilot study the average error in an assessed correlation was about 0.25), so any elicited number should be treated as a wide range and tested by sensitivity analysis. I recommend, from least to most change: (a) set the strengths from a stated target correlation, noting that the current mechanism cannot reach a correlation of 0.2 without pushing probabilities outside 0 to 1; (b) replace the mechanism with a Gaussian copula (defined below) with one correlation parameter, using 0.3 as a default convention and running 0, 0.3 and 0.6 as scenarios; or (c) build the three named common causes, which needs about a dozen elicited quantities.

A note on how to read this file. Statements marked "Opened" come from a source whose text I actually read, with a direct URL. Statements marked "My calculation" are my own and the method is shown. Statements marked "Not verified" are things I could not open or confirm; I give no numbers from memory for those as if they were checked.

---

## 1. How do established models represent dependence between technology breakthroughs?

### 1.1 What the practice looks like in broad terms

Four practices appear in the literature I could reach.

1. Assume independence. In a paper that builds an energy research-and-development portfolio model from three large expert elicitation studies, Baker, Olaleye and Reis write that they "assume that all technology parameters are independent of each other", which produces an eight-dimensional sampling distribution for the eight technology parameters. (Opened: https://ageconsearch.umn.edu/record/204431/files/NDL2015-042.pdf, a FEEM working paper titled "Decision Frameworks and the investment in R&D".) I did not find a statement in any of the energy-elicitation papers I could open that justified independence empirically. I could not open the other Anadon, Bosetti, Baker and Nemet papers in full, so I cannot say whether other papers in that group handle dependence differently. (Not verified: the search tool returned summaries of those papers that did not mention correlation either way.)

2. Apply a conventional default correlation between cost elements. This is the practice in United States defence and space cost-risk analysis. Cost-risk analysis builds a total-cost distribution by simulating many uncertain cost elements; if the elements are treated as independent, the total looks too certain, so analysts add correlation. Three pieces of evidence, with different levels of checking:
   - Opened: an ICEAA (International Cost Estimating and Analysis Association) training presentation on the Joint Cost and Schedule Risk and Uncertainty Handbook says "Default to apply is 0.3" and, in a table of options, "Default 0.3 (based on 2012 MDA Cost Handbook)". The slide deck is dated 5 April 2013. (https://www.iceaaonline.com/wp-content/uploads/2017/09/R2-5_Presentation_JointCostScheduleRiskAndUncertaintyHandbook_Thomas.pdf). The same slides recommend measuring the correlation already built into the model's equations first and adding extra correlation only where needed.
   - Opened: a paper by Christian Smart, "Robust Default Correlation for Cost Risk Analysis" (ICEAA 2013), states that the commonly used value is 20 percent, attributed to Dr. Steve Book, that there is some empirical evidence for it but the evidence is limited, and that the result is sensitive to errors in the assumption. For example, if the true correlation in a 100-element cost structure is 60 percent, total risk is underestimated by 40 percent. The page I opened did not show the paper's own recommended default. (https://iceaaonline.com/?p=6997)
   - Not verified, reported only by a search-engine summary: that a United States government cost guide says the Joint Agency Handbook notes academic papers proposing defaults of 0.25, 0.45 or 0.63 and recommends 0.3. The page (https://gaoinnovations.gov/cost-guide/correlation-between-cost-elements.html, which redirects to https://guides.gaoinnovations.gov/cost-guide/correlation-between-cost-elements.html) returned an access error to me. I also could not open the Handbook itself, nor the Book article in the Crosslink magazine to which the search summary attributes "0.2 or 0.3". Treat the 0.25/0.45/0.63 range as unconfirmed.
   - Opened: a counterpoint. Lewin, Shittu, Mazzuchi and Dorp studied ten satellite programmes and found that cost and schedule variance for discrete cost accounts were not correlated, while level-of-effort accounts were correlated at well below perfect. So even in this field the 0.2 to 0.3 default is a convention, not a law. (Abstract: https://ideas.repec.org/a/spr/envsyd/v41y2021i2d10.1007_s10669-021-09799-y.html)

   Important caveat for the comparison later: these defaults are Pearson correlations between continuous cost quantities, which is a different object from the correlation between two yes/no events.

3. Model drug-development success events with a common factor and a Gaussian copula. A copula is a way of building a joint distribution from separate (marginal) distributions plus a dependence structure; a Gaussian copula takes the dependence from a multivariate normal distribution. Lo and Siah (2021), "Financing Correlated Drug Development Projects", Journal of Structured Finance, use "a single-factor model with a Gaussian copula" for clinical-phase success events, and assume "a relatively conservative value of 0.20 for pairwise correlation in phase transitions". They write that "a literature search has not found any estimates of historical correlation among drug development projects", and justify 0.20 as weak because orphan diseases often have unrelated mechanisms. They run a sensitivity analysis over a range of correlation values. (Opened: https://www.choderalab.org/s/Financing-correlated-drug-development-projects.pdf; the copy I read is the author-lab PDF of the Spring 2021 article.) This is the closest structural precedent for the model's four yes/no events: Bernoulli events linked by a latent normal factor, with the correlation assumed from judgement and stress-tested.

4. Cross-impact analysis, a forecasting method in which experts give each event's probability and then conditional probabilities of event pairs, and a simulation uses them. The sources I saw describe it as developed in the 1960s and 1970s, with Monte Carlo simulation used to revise the probabilities. (Not verified beyond a search summary and a Wikipedia entry I did not open; the attribution to specific authors and years was not confirmed: https://en.wikipedia.org/wiki/Cross_impact_analysis.) It matters here only as a precedent for asking experts conditional probabilities of technology events.

### 1.2 Other analogues I looked for and did not find numbers for

- Pharmaceutical portfolios: besides Lo and Siah, search results pointed to a real-options paper (Van Bekkum, Pennings and Smit) and to the NBER paper by Danzon, Nicholson and Pereira (https://www.nber.org/papers/w9615.pdf). I did not open them, so I report no correlation values from them. One search summary said none of these sources gives an empirical pairwise correlation for shared-technology projects; I could not confirm that.
- Common-cause failure in nuclear safety analysis uses a "beta factor", the fraction of a component's failures that are shared with its twin components. I did not open any document that states typical values, so I give none. It is a useful conceptual precedent for the named common causes in option (c): dependence is modelled as a shared cause, not as pairwise links.
- Copulas in cost models: the Lewin et al. satellite paper above fits copulas to cost and schedule variance in ten programmes. That is one example of data-based calibration, but of a different dependence (cost and schedule within an account), not breakthroughs.

### 1.3 What this means for the model

By these standards the model's current link is not typical of cost-risk practice (which uses much higher correlations), is roughly typical of older energy-technology portfolio work (independence), and is far below the one close structural precedent (0.20 in a Gaussian copula, itself an unsupported judgement).

---

## 2. Is there empirical evidence on how strongly breakthroughs in related bioprocess technologies co-occur?

I found no direct evidence, and I want to be plain about that. The literature review already in the repository reached the same conclusion for cultured meat ("No source quantifies it", models/bates-rebuild-2026-11/bates-cm-cost-systematic-review-2026-11-16.md, section 4 to 6). My own searches on biopharmaceutical manufacturing, precision fermentation and cultured-meat expert surveys did not turn up a study that measures how often, say, a cheap growth factor and a stable serum-free cell line arrive together. A search for a quantified expert survey on growth-factor cost, serum-free medium and cell lines returned only reviews and company-style analyses. The one relevant technical source I saw, a Good Food Institute analysis of growth-factor costs and volumes (https://gfi.org/resource/cultivated-meat-growth-factor-volume-and-cost-analysis), discusses growth factors and albumin separately; I did not read it closely enough to say it says anything about dependence, and it does not. I cannot rule out that a relevant study exists that my searches did not surface.

What does exist is weaker, indirect evidence:

1. The Rethink Priorities forecasting panel (2021). Six forecasters (five highly ranked Metaculus forecasters and one cultured-meat scientist) answered questions about production volumes, prices, funding and inputs, including "growth factors under $1/kg by 2031: 30%". The report, in the version I opened, elicited two explicit conditional questions (both conditional on a production threshold, about protests and consumer willingness) and gave no joint distribution over technologies. According to the fetch tool's summary of the report, the authors compared forecasts across questions and found that predictions about biotechnology venture funding correlated with several volume predictions, and that no significant negative correlations appeared. That is a correlation between forecasters' answers across questions, which is not the same thing as the correlation between actual technology outcomes. I have not independently verified those statements beyond the tool's summary. (https://rethinkpriorities.org/research-area/forecasts-estimate-limited-cultured-meat-production-through-2050/)

2. The Rethink Priorities track-record review of public cultured-meat predictions. A search summary says that by the January 2022 update, 80 of 90 resolved predictions had failed, all in the direction of expecting more cultured meat on sale than there was. (Not opened by me; the figures come from the search summary and from the repository's own review, which gives the same numbers. https://rethinkpriorities.org/research-area/cultured-meat-predictions-were-overly-optimistic/.) My interpretation, not a finding from the source: if many independent companies and researchers all missed in the same direction, something common drove the misses (shared technical difficulty, funding conditions, or shared optimism). That is some evidence that industry outcomes move together to a meaningful degree, but it measures forecaster error, not technology correlation, and I cannot turn it into a number.

3. Plausible mechanisms, as stated in the repository's review and in the model's own documents: a better cell line (for example one adapted to suspension growth and serum-free medium) helps growth-factor needs, nutrient yield and long runs together; funding and policy climate affect everything. These are arguments from engineering reasoning, not measurements. The same documents say medium price (a commodity-supply question) is probably the least linked to the others.

Bottom line for this point: there is nothing to calibrate to. Any value has to be a stated judgement, ideally elicited from experts, and carried as a range with sensitivity analysis.

---

## 3. What do elicitation methods recommend for dependence, and how reliable are experts?

### 3.1 The main ways to ask

Werner, Bedford, Cooke, Hanea and Morales-Nápoles (2017), "Expert judgement for dependence in probabilistic modelling: A systematic literature review and future research directions", European Journal of Operational Research 258(3), 801 to 819, is the main systematic review. I read the accepted manuscript. (Opened: https://strathprints.strath.ac.uk/58428/1/Werner_etal_EJOR_2016_Expert_judgement_for_dependence_in_probabilistic.pdf.) The quantities that can be elicited are, in plain terms:

- A conditional probability: "Suppose technology A works by 2036. What is the probability that technology B works?" This is the form the repository's review recommends. It maps directly onto a binary model.
- A concordance probability (also called a quadrant probability): the probability that two quantities are both above, or both below, their medians. The review notes that it is a simple, intuitive measure, and gives the translation to a rank correlation (a correlation based on the ordering of values rather than their size) under a bell-curve assumption: Blomqvist's measure is (2 divided by pi) times the arcsine of the correlation.
- A rank correlation or ordinary correlation asked for directly, or a ratio of rank correlations.
- A joint probability ("probability that both work"), which the review says is cognitively complex.

### 3.2 What the research says about reliability

All of this is from sources I opened unless marked.

- The review says that little guidance exists on eliciting dependence compared with eliciting single quantities, and that developing defensible processes for multivariate quantities "is still much under development".
- The review reports that experts find probabilistic dependence questions difficult. Citing Clemen and co-authors (2000) and Morales-Nápoles and co-authors (2008), it says conditional and joint probability assessments were rated by experts as the most difficult of the methods presented, that difficulty grows with the number of conditioning variables, and that experts tend to overestimate the probability of conjunctive events (A and B both happen) and underestimate disjunctive ones. It also reports that when joint probabilities elicited from experts were converted to correlations, the values were often outside feasible bounds, and that the joint-probability method was the least accurate against empirical data in that study.
- Rephrasing questions as relative frequencies ("in how many of 100 worlds") is reported to reduce the burden and improve accuracy in the single-quantity case (the review cites Hoffrage and co-authors, 2000). The review does not claim this was tested for dependence.
- The review notes that conditional probability assessment worked better with scaffolding: Moskowitz and Sarin (1983) gave experts a joint probability table, which "led to large improvements in performance" per the review, and the review recommends eliciting several conditioning values.
- The review also notes that experts need training and familiarity with the format, citing the Joint European Commission and United States Nuclear Regulatory Commission uncertainty studies as a case where experts became familiar with conditional exceedance probabilities.
- Direct correlation questions are contested. The review says some studies (it names Kadane and Wolfson 1998, Morgan and co-authors 1992, and Gokhale and Press 1982) view direct assessment as unreliable, with even trained statisticians having difficulty. The Morgan reference is a secondhand citation; I did not open it, nor the book by Morgan and Henrion, so I cannot report what that book says.
- On the other side, Clemen, Fischer and Winkler (2000), "Assessing Dependence: Some Experimental Results", Management Science 46(8), compared six methods in two experiments and concluded: "simply asking experts to report a correlation is a reasonable approach"; direct estimation was more accurate than the other methods, did not produce mathematically inconsistent answers, and was judged less difficult. Experience with the variables and training helped somewhat, and averaging the estimates from several methods used by one judge "can also lead to better performance". (Opened abstract: https://ideas.repec.org/a/inm/ormnsc/v46y2000i8p1100-1115.html.) Note the participants were business students and the variables were financial returns, not technology outcomes.
- Clemen and Reilly (1999), "Correlations and copulas for decision and risk analysis", Management Science 45(2), describe how to build a joint distribution from marginal distributions plus pairwise correlations through a normal copula and report a small pilot with 58 business students assessing correlations of financial variables by three methods (probability of concordance, conditional fractile, direct estimate). The actual correlations of the three pairs were 0.95, 0.74 and 0.17, and "the average absolute error falls consistently near 0.25" across methods; subjects tended to underestimate the two highly correlated pairs. The authors suggest the question is whether correlations can be assessed well enough to be useful, and conclude the answer looks affirmative, though they call their results preliminary. (Opened: https://people.duke.edu/~clemen/bio/Published%20Papers/27.Correlations&Copulas-Clemen&Reilly-MS-99.pdf.)
- Morales-Nápoles, Hanea and Worm (2014) compared two ways of eliciting conditional rank correlations from 14 experts on an air-pollution model. They report that good performance on ordinary uncertainty questions does not automatically carry over to dependence estimates, and that combining experts according to their performance gave better dependence estimates. They also say, citing Clemen and co-authors (2000), that previous results, though not conclusive, indicate that the most accurate way to get a bivariate dependence measure is simply to ask for the correlation. (Opened: https://publications.tno.nl/publication/34609900/ApjTng/moralesnapoles-2014-experimental.pdf.)
- Cooke's classical model of structured expert judgement (weighting experts by their performance on calibration questions) is the method behind the performance weighting in the previous bullet. I did not open Cooke's own book, so I rely on the secondary description.

### 3.3 Practical reading

Taken together: experts can supply a dependence judgement that is useful but noisy (average error of about 0.25 on a correlation in the best-documented pilot, with students and financial data). The literature is split on whether to ask for conditional probabilities or for a correlation directly; Clemen and co-authors favour the direct question, Werner and co-authors favour conditional or concordance questions framed as frequencies and caution about joint probabilities. Averaging across two or three phrasings and across experts is the best-supported way to reduce noise. Because the technologies in this model are yes/no events, the conditional-probability phrasing maps most naturally to the model, and I suggest using it with a frequency framing and pairing it with a direct "how often do these tend to go together" question as a cross-check.

Two cautions specific to this model, from my own reasoning rather than a source: (1) the elicited conditionals must be consistent with the marginal probabilities already entered, so the expert should be shown those marginals first, and only one conditional needs asking per pair, because the other follows from the law of total probability: the marginal probability of B equals the probability of B given A times the probability of A, plus the probability of B given not-A times the probability of not-A; (2) the repository's review says experts have been over-optimistic about cultured meat, so the marginal probabilities themselves should be elicited unconditionally, before dependence is asked, to avoid counting an optimistic trajectory twice.

---

## 4. What correlation does the current link imply?

### 4.1 The structure

In each simulated world the model draws a maturity value m from a Beta distribution with mean 0.40 and standard deviation 0.20 (that is Beta(2, 3), the parameters I derived and checked: variance equals 2 times 3 divided by (5 squared times 6), which is 0.04). Technology i then works with probability P_i equal to its entered probability p_i plus k_i times (m minus 0.40), clipped to the range 0 to 1. Given m, the technologies are drawn independently. The entered probabilities are 0.75 (hydrolysates), 0.50 (cheap growth factors), 0.70 (food-grade supplemental proteins) and 0.55 (food-grade reactor share, treated here as a yes/no event); the strengths k are 0.25, 0.25, 0.20 and 0.30. I read these from the repository's docs.qmd section 4 and bates-rebuild.qmd. I did not read the engine code, so if the reactor share is drawn as a continuous share rather than a yes/no event the correlation with it would be of similar small size but is not calculated here.

### 4.2 The calculation (my calculation, analytic)

Because the average of m is 0.40, each technology's overall probability of working is exactly p_i (when no clipping occurs). The covariance of two technologies' outcomes, each coded as 1 for works and 0 for fails, is the expected product of their conditional probabilities minus the product of the overall probabilities. Given m the two outcomes are independent, so:

covariance of technologies i and j = k_i times k_j times the variance of m = k_i times k_j times 0.04.

Each technology's own variance is p_i times (1 minus p_i). The correlation is therefore

correlation(i, j) = k_i times k_j times 0.04, divided by the square root of [p_i(1 minus p_i) times p_j(1 minus p_j)].

For hydrolysates and growth factors: 0.25 times 0.25 times 0.04 equals 0.0025; the denominator is the square root of (0.1875 times 0.25), which is 0.2165; so the correlation is 0.0025 divided by 0.2165, or 0.0115.

### 4.3 Simulation check (my calculation)

I ran 4 million simulated worlds in Python with the structure above and also computed the "tetrachoric" correlation, which is the correlation of the underlying bell-curve variables that would produce the observed yes/no pattern, and is the fair like-for-like comparison with a copula correlation. The script is at /private/tmp/claude-503/-Users-yosemite--claude-spares-spare-3V5cTR/85001cf6-0c78-4edf-96d5-036a42524ca2/scratchpad/corr.py and may be cleared; it is about 50 lines and uses numpy and scipy.

| Pair | Correlation of the yes/no outcomes, analytic | Same, simulated | Equivalent underlying-normal correlation | Probability the second works given the first works, versus its overall probability |
|---|---|---|---|---|
| Hydrolysates and growth factors | 0.012 | 0.012 | 0.017 | 0.503 versus 0.500 |
| Hydrolysates and supplemental proteins | 0.010 | 0.010 | 0.012 | 0.702 versus 0.700 |
| Hydrolysates and reactor share | 0.014 | 0.014 | 0.024 | 0.554 versus 0.550 |
| Growth factors and supplemental proteins | 0.009 | 0.009 | 0.011 | 0.704 versus 0.700 |
| Growth factors and reactor share | 0.012 | 0.013 | 0.019 | 0.557 versus 0.550 |
| Supplemental proteins and reactor share | 0.011 | 0.011 | 0.017 | 0.554 versus 0.550 |

Other checks from the same run: the simulated mean of m was 0.400 with standard deviation 0.200; the realised probabilities match the entered ones to the third decimal (0.750, 0.500, 0.700, 0.550), confirming no bias after the 17 November correction; clipping never binds at these strengths (the lowest conditional probability seen was 0.43, the highest 0.90). The chance that hydrolysates, growth factors and supplemental proteins all work is 0.267 under the link versus 0.2625 under independence; all four work in 15.0 percent of worlds versus 14.4 percent.

### 4.4 Comparison with the ranges in section 1

- Verified in the sources above: 0.2 to 0.3 (cost-element default, between continuous quantities) and 0.20 (Lo and Siah, latent normal correlation between yes/no success events).
- The model's equivalent latent correlation is about 0.01 to 0.02. That is roughly one-tenth to one-twentieth of the conventions.
- The comparison is not exact, because a correlation of 0.2 between latent normal variables produces a smaller correlation between the yes/no outcomes. I simulated that conversion for probabilities 0.75, 0.50 and 0.70: a latent correlation of 0.2 gives an outcome correlation of about 0.12, and 0.3 gives about 0.18 (table in section 5). So on the outcome scale the literature's conventions would be about 0.12 to 0.18, still ten times the current 0.01.

Plain verdict: by every standard I could verify, the current link is weak, so weak that it is not distinguishable from independence in any output. This agrees with the model's own finding that switching it off hardly changes the share of draws under the cost threshold (0.049 percent versus 0.048 percent in docs.qmd). The strengths of 0.20 to 0.30 sound moderate when written as "k", but their effect is capped because m has a standard deviation of only 0.20 and the probabilities move by only k times 0.20, which is 4 to 6 percentage points. A probability that moves by 5 points when maturity moves by one standard deviation, around a value like 0.5, generates a correlation near 0.01 because most of the variation in a yes/no outcome is the coin flip itself.

### 4.5 A structural limit worth knowing

For the mechanism to reach a given outcome correlation, k must be large. My calculation for two technologies each at probability 0.5: k squared equals the target correlation times 0.25 divided by 0.04. A target of 0.1 needs k of 0.79; 0.2 needs 1.12; 0.3 needs 1.37. At k of 1.12 the probability in the lowest-maturity worlds is clipped at zero in about 1.3 percent of worlds, and at k of 1.37 in about 5.0 percent (simulated). Clipping breaks the property that each technology's average probability equals the value entered, which is what the 17 November correction was meant to secure. So the shift mechanism cannot deliver the correlation strengths seen in the literature without distorting the marginals. This is the strongest argument for option (b) below.

---

## 5. Recommended options, least to most change

All three keep each technology's entered probability exactly, so no double counting of optimism is introduced.

### Option (a): keep the mechanism, set k from a stated target correlation

What it does: replace the six hand-picked numbers with one stated target for the correlation between technology outcomes, and compute k from it with the formula in section 4.2.

What to elicit: one number (the target correlation), or equivalently one conditional probability for one representative pair. One question, asked in two phrasings.

Default before elicitation: I would not use this option if the target is above about 0.1, because of the clipping problem in section 4.5. If it is used, a target outcome correlation of 0.1 needs k of roughly 0.7 to 0.8, with the exact values depending on each pair's probabilities; that is about three times the present strengths. The justification for 0.1 as a default is the conversion of the 0.2 to 0.3 latent-scale conventions in section 1 to the outcome scale (about 0.12 to 0.18) and rounding down for the clipping limit; this is my judgement, not a sourced number. The cost-of-capital link would need separate treatment, because its size depends on the spread of the cost of capital, which I did not assess.

Effect on the model: modest, since the mechanism stays one-dimensional.

### Option (b): Gaussian copula with one correlation (or a few loadings)

What it does: give each technology a latent normal variable, correlated across technologies, and count the technology as working when its latent variable falls below the threshold that reproduces its entered probability. Marginals are exactly preserved and the correlation can be any value from 0 to near 1 with no clipping. This is the structure used by Lo and Siah for drug-development success events and described by Clemen and Reilly for decision analysis. A single common latent correlation r is the simplest form; a one-factor version with a separate loading per technology (the loading squared being the share of the latent variable explained by the common factor) allows some technologies, such as medium price, to be less linked.

What to elicit: with one common r, one conditional probability, for example "if hydrolysate medium works by 2036, what is the chance cheap growth factors do?", converted to r by a short calculation. To check consistency, ask two or three more pairs and the direct phrasing "how closely do these tend to go together?". With one loading per technology, four loadings need about four to six pairwise questions (for four technologies there are six pairs).

Default before elicitation: r equal to 0.3, with 0 and 0.6 as sensitivity scenarios (the repository's rebuild page already suggests 0, 0.3 and 0.6). Sources for the default: 0.3 is the cost-risk handbook default (opened: ICEAA presentation, above), 0.20 is Lo and Siah's "conservative" value for yes/no events, and 0.2 is Book's value as reported by Smart. All of these are conventions, not measurements, and the two closest applications (Lo and Siah; Smart) both say the empirical support is thin or absent. So I would present 0.3 as "a conventional placeholder, chosen to be clearly nonzero but not extreme", not as a finding.

What r equal to 0.3 implies (my calculation, 3 million simulated worlds each, probabilities 0.75, 0.50, 0.70):

| Latent correlation r | Outcome correlation (hydrolysates and growth factors) | Probability growth factors work given hydrolysates work (overall 0.50) | All three work (independence 0.2625) | None of the three work (independence 0.037) |
|---|---|---|---|---|
| 0 | 0.00 | 0.501 | 0.263 | 0.038 |
| 0.1 | 0.06 | 0.516 | 0.287 | 0.051 |
| 0.2 | 0.12 | 0.534 | 0.311 | 0.065 |
| 0.3 | 0.18 | 0.551 | 0.334 | 0.081 |
| 0.5 | 0.30 | 0.586 | 0.382 | 0.116 |
| 0.7 | 0.43 | 0.624 | 0.433 | 0.157 |

(Script: /private/tmp/claude-503/-Users-yosemite--claude-spares-spare-3V5cTR/85001cf6-0c78-4edf-96d5-036a42524ca2/scratchpad/cop.py.) So a latent correlation of 0.3 raises the chance that all three favourable technologies work by 7 percentage points (from 26 to 33 percent) and doubles the chance that none work. Expert-friendly translation: "among 100 worlds where hydrolysates work, growth factors work in 55, versus 50 in the average world." The model's current link implies 50.3.

Effect on the model: because a copula keeps every marginal exactly, and correlation between favourable events fattens the joint tail, price-competitive worlds should become somewhat more common than under independence; the size needs to be run, not guessed.

### Option (c): named common causes (cell line, food-grade supply at scale, investment and policy climate)

What it does: the rebuild page's proposal. Three named drivers, each a latent normal variable; each technology and continuous input loads on one or two of them through a loading between 0 and 1. It is a multi-factor Gaussian copula. It also links the continuous inputs (harvest density, nutrient yield, cycle time) that the present model leaves independent.

What to elicit: for each driver, the conditional probability of each linked technology given the driver is favourable and given it is unfavourable (or, equivalently, the loading directly). With three drivers and four technologies, where each technology loads on one or two drivers, that is about 6 to 8 loadings, plus the continuous inputs if they are included. If conditionals are asked in both states for each loaded pair, the count rises to about 12 to 16 numbers. The literature says experts cope poorly as conditioning sets grow (section 3), so I would limit each question to one condition and use the frequency framing. The driver definitions need to be concrete enough that experts agree on what "good cell line" means. Pooling several experts with performance weights (Cooke's method, as in Morales-Nápoles et al.) is the best-supported way to reduce noise but needs calibration questions.

Default before elicitation: loadings that give a pairwise latent correlation of about 0.3 between two technologies that share the main driver, which means a loading of about 0.55 (0.55 squared is 0.30), and zero loading where the repository's review says the link is weakest (medium price on cell line). I chose 0.55 by arithmetic from the 0.3 convention; it has no separate source. The review's suggestion that growth factors and continuous culture are the most linked and medium price the least linked is the team's judgement, not a measurement.

Effect on the model: largest. Needs documentation, a copula implementation and new inputs on the page; it also forces decisions about which continuous inputs share a driver, which should be agreed before anyone is asked.

### Which to pick

Option (a) is the quick fix, but because of the clipping limit it can only produce weak dependence, so it does not really resolve the "ad hoc" objection. Option (b) fixes the structural problem with the least new machinery and gives one number that can be elicited and shown as scenarios. Option (c) is justified if the team wants the continuous inputs linked as well, but its extra detail cannot be calibrated from any data I found, so it adds assumptions faster than evidence. My recommendation: implement (b) now with the 0, 0.3, 0.6 scenarios and a single elicited conditional probability, and move to (c) only if the elicitation shows experts see clearly different strengths for different drivers.

---

## What I could not verify

- The Joint Agency Cost and Schedule Risk and Uncertainty Handbook itself, and the claim (from a search summary) that it notes academic defaults of 0.25, 0.45 and 0.63. The GAO page returned an access error. I only opened an ICEAA slide deck stating the default of 0.3, "based on 2012 MDA Cost Handbook".
- Stephen Book's original statement ("0.2 or 0.3", Crosslink magazine, as quoted by a search summary), and Garvey, Book and Covert's book. I saw the value only through Christian Smart's paper summary (20 percent, attributed to Book).
- Morgan and Henrion's book "Uncertainty": I could not find or open a passage on dependence; I cite Morgan and co-authors (1992) only as reported second-hand in the Werner review.
- Cooke's own book and the Joint European Commission and Nuclear Regulatory Commission uncertainty-study documents.
- Energy-technology elicitation papers beyond the one working paper that assumes independence; I did not find whether other Anadon, Bosetti, Baker or Nemet papers treat dependence differently.
- Pharmaceutical portfolio correlations beyond Lo and Siah, including the Danzon NBER paper and the real-options paper, and the original Fernandez, Stein and Lo (2012) paper.
- Any empirical measurement of co-occurrence of bioprocess breakthroughs. I found none; I cannot rule out that one exists.
- The Rethink Priorities statements on cross-question correlations come from a fetch tool's summary of the report, not my own reading of the full report, and the 80-of-90 track-record figure comes from a search summary and the repository's own review.
- Typical nuclear beta-factor values, and the history of cross-impact analysis.
- The correlation between the cost-of-capital shift and the technology draws, and how the food-grade reactor share is drawn in the engine; I did not read the engine code.
- The Clemen and Reilly pilot used students and financial data, so the 0.25 average error may not transfer to technology experts, either better or worse.

## Sources I opened, with direct URLs

- Werner, Bedford, Cooke, Hanea, Morales-Nápoles (2017), accepted manuscript: https://strathprints.strath.ac.uk/58428/1/Werner_etal_EJOR_2016_Expert_judgement_for_dependence_in_probabilistic.pdf
- Clemen, Fischer, Winkler (2000), abstract: https://ideas.repec.org/a/inm/ormnsc/v46y2000i8p1100-1115.html
- Clemen and Reilly (1999), full text: https://people.duke.edu/~clemen/bio/Published%20Papers/27.Correlations&Copulas-Clemen&Reilly-MS-99.pdf
- Morales-Nápoles, Hanea, Worm (2014): https://publications.tno.nl/publication/34609900/ApjTng/moralesnapoles-2014-experimental.pdf
- Lo and Siah (2021), Financing Correlated Drug Development Projects: https://www.choderalab.org/s/Financing-correlated-drug-development-projects.pdf
- Baker, Olaleye, Reis, Decision Frameworks and the investment in R&D: https://ageconsearch.umn.edu/record/204431/files/NDL2015-042.pdf
- ICEAA slides on the Joint Cost and Schedule Risk and Uncertainty Handbook: https://www.iceaaonline.com/wp-content/uploads/2017/09/R2-5_Presentation_JointCostScheduleRiskAndUncertaintyHandbook_Thomas.pdf
- Smart, Robust Default Correlation for Cost Risk Analysis: https://iceaaonline.com/?p=6997
- Lewin, Shittu, Mazzuchi, Dorp (2021), abstract: https://ideas.repec.org/a/spr/envsyd/v41y2021i2d10.1007_s10669-021-09799-y.html
- Rethink Priorities forecasts report (via summary tool): https://rethinkpriorities.org/research-area/forecasts-estimate-limited-cultured-meat-production-through-2050/
