# Cultivated chicken cost model: critique, revision, and open questions

This is an AI-generated audio briefing about The Unjournal's cultivated chicken production cost model. It was prepared on September seventeenth, twenty twenty-six. It is based on the current model, two supplied deep research reports, the written response to those reports, and the numerical checks run after the model changes. It is a description of the model and its uncertainties, not an endorsement of the model's estimates.

I will start with what the model is trying to do. Then I will explain the main critiques in ordinary language. After that, I will describe what changed, what the changed scenarios show, and what still needs to be decided or researched.

## What this model is actually estimating

The model is a techno-economic assessment. A techno-economic assessment combines an engineering description of a production process with assumptions about input prices, equipment, financing, labor, and other costs. The output is an estimate of the cost of producing something at a specified scale.

Here, the thing being estimated is one kilogram of wet cultivated chicken cell biomass at the factory gate. Cultivated meat is also called cultured meat. It is made by growing animal cells outside an animal, usually in vessels called bioreactors. Wet biomass means the cells together with their associated water at harvest. Factory gate means the manufacturing cost before retail margins, taxes, product formulation, cooking, packaging, and distribution.

That definition matters. One kilogram of wet cells is not necessarily one kilogram of a finished chicken product. A burger, nugget, or whole-cut product may contain plant ingredients, fat, scaffolding material, binders, flavoring, and added water. The current model can help study the cost of the cultivated cell ingredient, but it does not by itself establish a retail price or show whether consumers would buy the product.

The model uses Monte Carlo simulation. That means it does not calculate only one result. It repeatedly draws uncertain values for things such as cell density, media use, plant size, growth-factor prices, equipment costs, and financing. Each draw represents one hypothetical plant and process scenario. The current dashboard normally performs thirty thousand draws. The results are then summarized with percentiles and probabilities.

For example, the median, also called the fiftieth percentile, is the point where half the simulated costs are lower and half are higher. The ninetieth percentile is a high-cost result: ninety percent of simulated costs are lower and ten percent are higher. A probability such as “cost below twenty-five dollars per kilogram” is the share of simulated scenarios below that threshold.

The model is useful because it makes the assumptions visible and adjustable. It has a simpler interface for the main levers and an advanced interface for more detailed changes. It exposes formulas, distributions, sources, scenario links, and downloadable data. The model runs in the browser through a shared JavaScript calculation engine. The model is also explicit that it has not been independently validated and that many parameter ranges remain provisional.

The two research reports both treated this openness as a real strength. Their central concern was not that one slider was obviously wrong. It was that some of the questions, equations, and probability interpretations did not line up. A model can be transparent and still answer a slightly different question from the one users think they are asking.

## The first major issue: deciding exactly what quantity we want

The most important critique concerns the estimand. An estimand is simply the quantity we intend to estimate.

The current simulation draws one hypothetical plant and one process arrangement at a time. If a draw selects perfusion, for example, that simulated world uses perfusion for that plant. Perfusion is a process in which fresh liquid medium flows through the bioreactor while cells are retained. In another draw, the model may select fed-batch production, where nutrients are added during a run but the vessel is not operated as a continuous flow system.

This setup can represent uncertainty about the process used by a representative future plant. It does not calculate a production-weighted average across a whole future industry in which many kinds of plants coexist. A production-weighted average would require each simulated future to contain several plant or process types, calculate each type's cost, and weight those costs by the amount of output each type produces.

The same distinction applies to technology adoption. The probability that a technology is widely adopted is not necessarily the same as the share of industry output made with that technology. It also applies to plant size. A large plant contributes more kilograms to an industry average than a small plant.

The reports therefore recommend separating at least three questions.

The first is the engineering cost of a clearly specified process or representative plant.

The second is the production-weighted industry cost, conditional on an industry reaching the required scale.

The third is the probability that qualifying commercial production exists at all by the target date.

These quantities should not be collapsed into one output. A world in which the process never reaches commercial scale is different from a world in which it reaches scale at a very high cost. Similarly, a frontier plant run by the strongest company is different from an average kilogram across the industry.

The revised dashboard now states clearly that each draw is a hypothetical plant and process scenario. It does not call the current mixture a production-weighted industry average. The probability of commercialization, frontier cost, and industry-average cost remain open quantities. This is a clarification rather than a new forecast, but it prevents a serious overinterpretation.

Two related details are still unresolved. First, the input sources use money from different years, so the output should not yet be described as a clean result in a single real-dollar year. Second, studies can use different assumptions about water content, recovery losses, and the boundary between cell mass and final product. Those need standard definitions before comparisons can be treated as directly comparable.

## The second major issue: the media equation

Cells need a liquid growth medium containing amino acids, sugars, vitamins, minerals, and other nutrients. The baseline model calculates fresh-media volume per kilogram through an inverse relationship with harvest cell density. In simplified form, the equation is one thousand divided by cell density, multiplied by a media-use factor.

This means that higher harvest density automatically produces lower media use per kilogram. There is a sensible intuition behind the relationship: if a liter contains more biomass, fewer liters of harvested culture are needed for a kilogram. But fresh-media consumption is not always the same as harvested liquid volume. In perfusion, fresh medium can flow through the system continuously. Higher density may require more nutrient supply, and the relationship among density, feed rate, residence time, nutrient yield, recycling, and washout can be complicated.

The critique is therefore about model structure, not algebra. The equation calculates exactly what it says. The concern is that it embeds a strong biological and process assumption, particularly for high-density perfusion.

The revised advanced model now offers a structural alternative. Instead of deriving liters per kilogram from density, it can draw fresh-media intensity directly and multiply liters per kilogram by the price per liter. Cell density still affects the reactor volume and capital cost, but it no longer mechanically determines fresh-media use.

The initial range for this alternative runs from a fifth-percentile value of eight liters per kilogram to a ninety-fifth-percentile value of sixty liters per kilogram. This is an illustrative stress range selected for exploring the equation. It is not a confidence interval from one study, an expert consensus, or a calibrated commercial process. The dashboard marks that provenance and allows the user to change the range.

This distinction is important when reading the results. The direct-media scenario changes both the formula and the input assumptions. If it produces a lower estimated cost, that does not prove that the new equation is more optimistic or more accurate. It shows what happens under that particular alternative structure and range.

The better long-term approach is probably process-specific. It could use fresh-media liters per kilogram as an elicited primitive for a reduced-form model, or derive it from nutrient balances, cell-specific consumption, retention, recycling, and process losses in a more mechanistic model. The current alternative is a way to expose the question, not the final answer.

## The third major issue: growth factors and other recombinant proteins

Growth factors are signaling proteins used to encourage cells to grow or behave in a desired way. They can be expensive when produced to pharmaceutical standards. Cultivated-meat production may use food-grade production, improved formulations, recycling, or lower doses, but the eventual prices and quantities are uncertain.

The baseline model separately draws a growth-factor quantity per kilogram and a price per gram. One critique is that the quantity was partly motivated by a concentration in the growth medium, yet the realized quantity in the model was not mechanically connected to the realized amount of fresh medium. That can create combinations with very low media use and high growth-factor quantity, or high media use and low growth-factor quantity, without a biological reason.

The revised advanced model includes an alternative in which growth-factor quantity is linked to media volume. The calculation multiplies fresh-media liters per kilogram by an aggregate growth-factor concentration, then applies a regime-specific dose factor. The starting concentration is zero point one zero two milligrams per liter. The model uses a dose factor of one for the expensive regime and zero point four for the cheaper regime.

Both values have visible provenance. The concentration is reused from an earlier aggregate formulation assumption and has not been revalidated for all processes. The zero point four factor is a rounded version of an earlier ratio between median cheap- and expensive-regime doses. It is a scenario setting, not an estimated biological recycling efficiency.

The reports also questioned whether two existing growth-factor controls were redundant. One control sets the probability of reaching a scalable low-cost regime. Another represents progress in prices. A code and behavior review showed that both controls do operate. The probability control selects between cheaper and more expensive regimes, while the progress control changes the price distribution within each regime.

The interface now shows the resulting price ranges. At the default progress setting of fifty, the central ninety percent range for the scalable regime is ten to one thousand dollars per gram. For the expensive regime it is five hundred to fifty thousand dollars per gram. Those are assumed interpolations rather than fitted learning curves. Showing the numbers makes the semantics easier to inspect.

The model already includes supplemental proteins such as albumin, transferrin, and insulin in a separate cost block. The second report called attention to these proteins, but adding another block would count them twice. The unresolved issue is the evidence behind formulation-specific doses and prices, including whether a single aggregate growth-factor basket is useful enough for the decisions at hand.

## The fourth major issue: dependence and the maturity factor

Uncertain inputs are not always independent. Technical progress, supplier maturity, financing conditions, equipment costs, and adoption may move together. The baseline model represents this with one latent maturity factor. Latent means that it is an unobserved summary variable rather than a directly measured quantity.

In the shared-maturity version, favorable maturity draws make several favorable outcomes more likely at the same time. Hydrolysate adoption, lower-cost growth factors, supplemental-protein progress, lower financing costs, and cheaper equipment become partly connected. This creates coherent optimistic and pessimistic worlds, but it can also create an “everything goes well” or “everything goes badly” structure by assumption.

The reports recommend comparing different dependence structures rather than treating one maturity factor as established. The advanced model now includes independent maturity channels. Each channel keeps the same marginal maturity distribution and its existing effect, but the maturity draw for one channel is independent of the draws for the others.

This is not a model in which every input is independent. Media use, process choice, density, cost accounting, and other relationships still connect variables. The name “independent maturity channels” is meant to be precise about the limited change.

A three-factor structure remains a plausible next step. One factor could represent biological and technical feasibility. A second could represent supply chains and manufacturing. A third could represent commercialization, regulation, and cost of capital. But adding three factors now would require new coefficients and correlations with little empirical support. The revised model therefore exposes a simpler comparison and leaves the more elaborate design for expert input.

## The fifth major issue: representing expert beliefs faithfully

The model allows a user to replace some default distributions with custom quantiles. A quantile describes a point in a probability distribution. A tenth percentile, often called p ten, means the user assigns a ten percent chance to a lower value. A ninetieth percentile means a ten percent chance to a higher value. The median is the fiftieth percentile.

Previously, the dashboard accepted the tenth and ninetieth percentiles and fit a lognormal distribution. A lognormal distribution is a positive, right-skewed distribution often used for costs and biological quantities. With only two endpoints, the fitted median becomes the geometric mean of the two values.

The first research report argued that a workflow eliciting a tenth percentile, median, and ninetieth percentile should not throw away the stated median. The earlier dashboard did not literally accept and discard a median, but it was incomplete for importing three-quantile beliefs.

Both the simple and advanced interfaces now accept an optional median. When the median is supplied, the model uses a two-piece lognormal transform: one spread below the median and another above it. This preserves all three stated population quantiles and allows asymmetric beliefs. For example, quantiles of eight, twenty, and one hundred retain a median of twenty instead of forcing a median of about twenty-eight point three.

When the median is left blank, the previous two-endpoint behavior is retained. The interface checks that the values are positive and correctly ordered. Invalid entries produce a message and do not replace the last valid settings. This change affects user-supplied priors only. It did not rewrite workshop responses or alter any respondent's data.

The reports also recommend improving the elicitation process itself. A strong two-round process would first collect private individual judgments and reasoning. It would then show anonymized distributions and the main reasons for disagreement, allow participants to discuss evidence and interpretation, and collect a second private judgment. The original answers and reasons for revision should be preserved.

The unit and target quantity must match before any belief enters the model. A forecast of the maximum plausible cell density is not a prior for the density of a representative plant. A price forecast for one protein is not automatically a dose-weighted price for an aggregate growth-factor basket. A cost for dry protein is not directly comparable to a cost for wet cell biomass.

Equal-weight pooling can provide a descriptive mixture of expert beliefs. Subgroup comparisons and leave-one-out checks can show whether the result depends on one expert or one area of expertise. Performance weighting should be used only when there are relevant calibration questions. An expertise label by itself is not evidence for assigning more numerical weight.

## What the scenario results show

The original baseline numerical assumptions were retained. At thirty thousand draws and random seed forty-two, the median baseline cost is forty-two dollars and sixty-two cents per kilogram. The ninetieth percentile is one hundred fifty-nine dollars and seventy-nine cents. The ninety-fifth percentile is two hundred thirty-two dollars and seventy-seven cents. About twenty-seven point seven percent of simulated costs are below twenty-five dollars per kilogram.

These numbers describe the model's current hypothetical plant scenarios. They are not a validated forecast and are not conditional on commercial success.

The independent-maturity-channels comparison gives a median of forty-two dollars and fifty-seven cents and a ninetieth percentile of about one hundred fifty-nine dollars and forty-five cents. The difference from the baseline is very small. Across three random seeds, the baseline median itself ranges from about forty-two dollars and twenty cents to forty-two dollars and sixty-two cents. This means the small maturity difference should not be treated as an important result. The structure may still matter under other settings or for joint outcomes, but this particular default comparison does not show a meaningful median shift.

The illustrative direct-media scenario gives a median of thirty-four dollars and forty-nine cents and a ninetieth percentile of ninety-nine dollars and fifty-seven cents. About thirty-two point one percent of draws fall below twenty-five dollars per kilogram. The result is lower than the baseline, but the alternative range is provisional and changes the assumed media-volume distribution. It should not be called a better forecast.

The media-linked growth-factor scenario gives a median of forty-one dollars and five cents. Its ninetieth percentile rises to one hundred ninety-one dollars and thirty cents, and its ninety-fifth percentile rises to about three hundred seven dollars and thirty-three cents. Linking dosage to media use produces a wider upper tail under the chosen assumptions. This is a useful warning that structural coupling can affect high-cost outcomes even when the median changes little.

The dashboard now puts these comparisons in one table. Each row changes one structural choice relative to the selected scenario and reports the median, the ninetieth percentile, and the probability of cost below twenty-five dollars per kilogram. The comparison is designed to reveal model-form sensitivity. It is not a formal decomposition of uncertainty.

The existing association chart was also clarified. It compares average cost when an input is in its upper tail with average cost when it is in its lower tail. That is a conditional mean difference measured in dollars per kilogram. It is not a causal effect, and it is not the share of output variance explained by that input. Under dependence, an input can inherit associations from other variables. The chart now says “association under the current uncertainty model,” and inputs made inactive by a selected structure are omitted.

## Changes to implementation, documentation, and verification

The simple and advanced pages continue to use one shared browser calculation engine. The reports reasonably warned about drift among JavaScript, Python, and Squiggle versions. In the current project, Python and Squiggle are historical reference implementations. The dashboard's two active interfaces use the same JavaScript core, and adapter tests check that they agree.

The new controls share definitions and provenance metadata through one controls module. Provenance appears through explanatory text and hover tooltips. Shared scenario links retain the structural choices and valid custom priors. Downloads record the engine version, random seed, sample count, effective parameters, provenance, and structural comparisons. A numerical audit records the exact hash of the calculation engine, so a result can be tied to the code that produced it.

Automated tests cover cost accounting, reactor utilization, complete-medium precedence, parity between the simple and advanced views, preservation and validation of custom quantiles, interaction of the growth-factor controls, media-volume coupling, dependence behavior, and reproducibility. The baseline engine remained identical draw by draw after the new options were added.

The audit also checks several random seeds and sample sizes. This helps distinguish simulation noise from larger changes. It does not establish scientific validity. A model can be calculated and rendered correctly while still using weak assumptions.

## What still needs the most attention

The first priority is to choose and document the target quantities. I would define a representative-process cost, a production-weighted industry cost conditional on commercial scale, a frontier cost, and the probability of commercial scale separately. Each should specify the target year, geography, real-dollar year, output basis, water or dry-matter basis, recovery losses, and which production stages are included.

The second priority is a parameter and assumption registry. Each numerical input should have a definition, unit, cost year, process scope, source, transformation, reason for its uncertainty range, and status. Status might distinguish literature-derived values, expert judgments, developer-selected stress tests, and historical assumptions. This would make provenance systematic instead of relying on scattered notes.

The third priority is evidence on fresh-media use and recombinant-protein cost. Experts should assess fresh liters per kilogram for specified process modes, formulations, densities, and recycling arrangements. For proteins, the model needs protein-specific concentrations or total cost per kilogram under clearly defined media-use assumptions. The current direct-media and linked-dose settings are questions presented in executable form.

The fourth priority is study reproduction. Presets that reproduce studies such as the Humbird, Risner, and Pasitka assessments would test whether the model can represent materially different published architectures. A headline estimate falling somewhere between published results is not a validation test. Reproduction requires matching boundaries, formulas, and assumptions closely enough to explain any difference.

The fifth priority is a separate commercialization layer. It should represent whether a qualifying process reaches scale, rather than allowing every simulated technical scenario to appear as a very expensive operating plant. Commercialization probability could depend on technical feasibility, capital access, regulation, and demand, but those relationships should be explicit.

The sixth priority is richer process engineering where it changes decisions. Candidates include nutrient and mass balances, oxygen-transfer limits, contamination and batch-failure losses, downtime, washout, recovery yield, discrete reactor trains, and capacity constraints. More detail is useful when it resolves a material ambiguity. Detail added without evidence can make the model harder to inspect without making it more accurate.

The seventh priority is a more complete sensitivity analysis. Morris screening can identify influential inputs over a wide space. Sobol analysis can decompose variance when primitive inputs are independent. Dependence-aware methods such as Shapley effects are more appropriate when correlations are part of the model. These methods answer different questions, so the model should name the question before selecting the method.

The final priority is connecting cost outputs to actual decisions. A twenty-five-dollar manufacturing threshold does not by itself show retail competitiveness, consumer demand, displacement of conventional meat, or animal-welfare impact. Those require assumptions about formulation, processing, margins, prices, demand, and counterfactual production. The existing demand page begins this bridge, but the evidence and uncertainty should remain separate from the manufacturing-cost calculation.

## A practical sequence for the next round

The next round should begin with definitions rather than another layer of sliders.

First, agree on the estimands and reporting units. Make it impossible to confuse a representative plant, an industry average, a frontier result, and commercialization probability.

Second, build the parameter and assumption registry, including a single real-dollar convention and clear output-basis conversions.

Third, use a two-round expert process to improve the highest-value uncertain inputs, especially fresh-media intensity, recombinant-protein dose and price, failure losses, and process-specific scale constraints.

Fourth, add study-specific reproduction cases and document what the shared model can and cannot reproduce.

Fifth, add an explicit commercialization layer and then connect conditional production costs to product and welfare outcomes.

Finally, apply more advanced sensitivity methods after the primitive inputs and dependence choices are defined well enough for those methods to have a clear interpretation.

The main value of the September revision is not that it produces one new preferred cost number. It makes several disputed assumptions selectable, visible, and exportable while preserving the old baseline for comparison. The model is now better at showing where the result depends on structure. The remaining task is to replace illustrative structure and broad ranges with evidence and well-defined expert beliefs.

This briefing and its transcript are AI-generated. The underlying changes were technically tested, but the scientific assumptions have not received independent validation. For the detailed source-by-source response, parameter provenance, equations, and numerical audit, use the September twenty twenty-six review response linked from the model page.
