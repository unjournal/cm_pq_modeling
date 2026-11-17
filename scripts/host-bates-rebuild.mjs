// Make the two hosted copies of Alex Bates's page (David, 17 Nov 2026):
//   alt/bates-rebuild-v0.9.7-as-shared.html  his page as shared; only the typeface matched to this site,
//                                            plus a one-line host bar and Hypothes.is
//   alt/bates-rebuild-v0.9.7.html            'first-pass edits': host notes, explanations and minor
//                                            wording/label/display changes (EDITS below)
// In both, Alex's model logic and inputs are untouched (substantive changes need his consent).
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
const src = '/Users/yosemite/githubs/cm_pq_modeling/models/bates-rebuild-2026-11/cultured-meat-model-v0.9.7.html';
const outDir = '/Users/yosemite/githubs/cm_pq_modeling/dashboard/alt';
const out = `${outDir}/bates-rebuild-v0.9.7.html`;
const outShared = `${outDir}/bates-rebuild-v0.9.7-as-shared.html`;
const DOC = 'https://docs.google.com/document/d/1yjP2WTf3bWa_OjaTolOXJXydQDxH4ZsbcXMPOdrz2mo/edit';
const original = readFileSync(src, 'utf8');
let html = original;

const headAdd = `<meta name="description" content="Alternative cultured chicken cost model: a step-structured rebuild by Alex Bates (v0.9.7), hosted by The Unjournal for comparison and discussion.">
<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
/* Host styling (David, 17 Nov 2026): same type as the rest of the dashboard; the colour scheme stays as Alex designed it. */
:root, :root[data-theme="dark"] {
  --font-display: "Source Sans Pro", "Source Sans 3", -apple-system, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-body: var(--font-display); --font-ui: var(--font-display); --font-mono: var(--font-display);
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --font-display: "Source Sans Pro", "Source Sans 3", -apple-system, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; } }
body { font-size: 17px; line-height: 1.5; }
h1, h2, h3 { font-weight: 600; letter-spacing: 0; line-height: 1.2; }
h1 { font-size: 2.1rem; } h2 { font-size: 1.5rem; } h3 { font-size: 1.2rem; }
.tile .v, .tile.main .v, .step-n, .step-cost { font-weight: 600; }
.uj-host { background: var(--surface); border-bottom: 1px solid var(--rule); font: 0.86rem/1.45 var(--font-ui); color: var(--ink-2); }
.uj-host-in { max-width: 760px; margin: 0 auto; padding: 10px 16px; display: grid; gap: 4px; }
.uj-host strong { color: var(--ink); }
.uj-host a { color: var(--accent); }
.uj-host .links { display: flex; flex-wrap: wrap; gap: 4px 14px; }
.uj-nav { display: flex; flex-wrap: wrap; gap: 4px 14px; font-weight: 500; padding-bottom: 6px; border-bottom: 1px solid var(--rule); }
.uj-nav .uj-sep { color: var(--ink-3); }
</style>
`;
// Page navigation shared by both versions: main model, notes, the two versions, the review.
const nav = current => {
  const item = (key, href, label) => key === current ? `<strong aria-current="page">${label}</strong>` : `<a href="${href}">${label}</a>`;
  return `<nav class="uj-nav" aria-label="Cost model pages">
    <a href="../index.html">&larr; Main model</a><a href="../simple.html">Simplest model</a><a href="../bates-rebuild.html">Notes and comparison</a>
    <span class="uj-sep">Alex's rebuild:</span>${item('shared', 'bates-rebuild-v0.9.7-as-shared.html', 'as shared')}${item('edited', 'bates-rebuild-v0.9.7.html', 'first-pass edits')}
    <a href="${DOC}">Literature review</a></nav>`;
};
const bar = `<div class="uj-host" role="note">
  <div class="uj-host-in">
    ${nav('edited')}
    <p><strong>Alex Bates's rebuild, with first-pass edits.</strong> A step-structured rebuild of the Unjournal cost model by Alex Bates (file v0.9.7, 16 November 2026), with host notes and minor changes made in response to comments: typeface, labels and wording, explanations, and display of the "What has to go right" rows. Alex's model, inputs and code logic are unchanged. The <a href="../index.html">main Unjournal model</a> remains the master copy (Alex suggested this; neither model is fully validated).</p>
    <p>Every input can be changed: open <em>Assumptions</em> under each step (central estimate and 95% optimistic value, per process where it matters). Alex removed some structural choices of the main model, such as the probability-weighted process mix and contract manufacturing; see his Notes at the bottom. Open points from the first round of comments: <a href="#questions-for-alex">Questions for Alex</a>. Comment with Hypothes.is: the &lsaquo; tab on the right edge.</p>
  </div>
</div>
`;
const barShared = `<div class="uj-host" role="note">
  <div class="uj-host-in">
    ${nav('shared')}
    <p><strong>Alex Bates's rebuild, as he shared it</strong> (file v0.9.7, 16 November 2026), hosted by The Unjournal for discussion. Only the typeface has been changed to match this site. The <a href="../index.html">main Unjournal model</a> remains the master copy (Alex suggested this; neither model is fully validated). Comment with Hypothes.is: the &lsaquo; tab on the right edge.</p>
  </div>
</div>
`;
// First-pass edits (edited version only): wording and labels prompted by Hypothes.is comments, 17 Nov 2026.
// Each target must exist in Alex's file; replaceAll covers the two copies of the engine source in the page.
const EDITS = [
  ['rebuild v0.9.4', 'rebuild v0.9.7 &middot; first-pass edits'],
  ['label: "Outlay per cell bank", unit: "$"', 'label: "Outlay per cell bank", unit: "$ per bank, one-off"'],
  ['label: "Output per outlay", unit: "kg dry cell mass"', 'label: "Output per cell bank", unit: "kg dry cell mass per bank"'],
  ['Very minor cost, modelled abstractly', 'Very minor cost, modelled with one or two summary inputs rather than built up from equipment, staff and materials'],
  ['If they exist at scale in 2036, the plant buys whichever medium is cheaper (3.2); if not, it pays for purified amino acids.',
   'If they exist at scale in 2036, the plant buys whichever medium is cheaper (3.2); if not, it pays for purified amino acids. The default probability (0.75) is carried over from the main Unjournal model; no published or elicited source was found.'],
  ['lt.textContent = "Approximate parity to";', 'lt.textContent = `Parity with chicken ${tickLabel(S.parity.dry)};`;'],
  ['lt2.textContent = `commercial chicken ${tickLabel(S.parity.dry)}–${tickLabel(S.parity.premium)}`;', 'lt2.textContent = `price-competitive zone to ${tickLabel(S.parity.premium)}`;'],
  ['reach the competitive zone', 'reach the price-competitive zone'],
  ['smallest sets of improvements on the central world that make it competitive', 'smallest sets of improvements on the central world that make it price-competitive'],
  ['competitive worlds need one or the other', 'price-competitive worlds need one or the other'],
  ['Production reactors, the most major source of cost in the model.', 'Production reactors: the largest source of cost in the model.'],
  ['label: "Food-grade supplemental proteins available by 2036"', 'label: "Food-grade supplemental proteins usable at scale by 2036 (permitted and reliable in this process)"'],
  ['label: "Hydrolysate medium available by 2036"', 'label: "Hydrolysate medium usable at scale by 2036 (permitted and reliable in this process)"'],
  ['This is the cost of making and qualifying one bank."', 'This is the cost of making and qualifying one bank. Default (central about $447,000) is Alex\'s assumption; no source given."'],
  ['how many kg of dry mass you can obtain from one cell bank."', 'how many kg of dry mass you can obtain from one cell bank. The default central value, about 7 million kg, is 7,000 tonnes of dry cells (about 35,000 t wet at 20% solids): roughly 1.75 years of output from a plant making 20,000 t of wet cells a year. Alex\'s assumption; no source given."']
];
// Edited version only: make steps and substeps visually distinct.
const EDIT_CSS = `<style>
.step:not(.substep) { border-left: 4px solid var(--accent); }
.step:not(.substep) > .step-head .step-title h3 { font-size: 1.45rem; color: var(--accent); }
.step.substep { margin-left: 18px; }
.step.substep .step-title h3 { font-size: 1.1rem; }
.step.substep .step-n { font-size: 1.05rem; }
</style>
`;
if (!html.includes('</head>') || !html.includes('<body>')) throw new Error('unexpected page structure');
html = html.replace('</head>', headAdd + '</head>');
let shared = html.replace('<body>', '<body>\n' + barShared)
  .replace('</body>', '<script src="https://hypothes.is/embed.js" async></script>\n</body>');
for (const [from, to] of EDITS) {
  if (!html.includes(from)) throw new Error(`first-pass edit target not found: ${from.slice(0, 60)}`);
  html = html.split(from).join(to);
}
html = html.replace('</head>', EDIT_CSS + '</head>');
// Questions for Alex (David, 17 Nov 2026): a folding box at the end of the page, linkable as #questions-for-alex.
const NOTES = '../bates-rebuild.html';
const QUESTIONS = `<section class="card notes" id="questions-for-alex" aria-labelledby="qa-h">
  <details class="more" id="qa-details"><summary><h2 id="qa-h" style="display:inline">Questions for Alex, from the first round of comments</h2></summary>
  <div class="more-body" style="font-family:var(--font-body);font-size:0.95rem">
    <p>David Reinstein read through this page on 17 November 2026 and left comments with Hypothes.is (open the sidebar on the right to see them). Claude, working with David, collected the open points below. Each one says what the issue is, why it matters, what we would suggest, and what we would like to know from you. Several of them apply to the main Unjournal model as well, which shares the same structure in these places.</p>
    <p>We will not change how your model calculates anything without your agreement. You can reply with Hypothes.is on this page, on Slack, or simply by changing your own version.</p>
    <p class="small muted">A few terms used below. A <em>world</em> is one simulated draw of every input. The <em>competitive zone</em> is your range of cell costs between parity with chicken ($12/kg dry) and $36/kg dry. The share of worlds below $36/kg dry is our main summary of how often cultured meat comes out price-competitive. A <em>minimal set</em> is one of the smallest combinations of favourable inputs that gets a world into the competitive zone, as computed in your "What has to go right" section.</p>
    <ol style="display:grid;gap:14px;padding-left:1.3em">
      <li>
        <p><strong>Plant operating cost: one input or three?</strong></p>
        <p>Your page merges two of the main model's inputs, fixed running costs (labour, maintenance, overhead) and utilities and consumables, into one plant operating cost. Its central value, $23.50 per kg of dry cells, is the median of the sum of the main model's two ranges. Those ranges have no published source, so the merged number does not either.</p>
        <p>This input matters a great deal: it appears in 98% of the minimal sets, more than any other input. But its parts are driven by different things. Labour depends mostly on the size and complexity of the plant. Maintenance and insurance are usually estimated as a share of the plant's capital cost (Humbird 2021 uses 4% and 5% of capital a year). Utilities and consumables scale with output and differ by process; for example, perfusion uses filter membranes that fed-batch does not need. Drawing one combined number independently of everything else means a simulated world can pair very cheap running costs with a very expensive plant, which is not realistic.</p>
        <p>We suggest splitting it into three parts: labour per plant; maintenance and insurance as a share of capital; and utilities and consumables per kg, with values that differ by process. This follows point 3 of your own literature review. Does this fit how you would want the frontier plant modelled? (There is also a <a href="https://hyp.is/NylaxOLIEfGDNu_mZUPu2A/unjournal.github.io/cm_pq_modeling/alt/bates-rebuild-v0.9.7.html">sidebar note</a> on this.)</p>
      </li>
      <li>
        <p><strong>Perfusion membranes are not costed.</strong></p>
        <p>Perfusion and continuous culture keep the cells in the reactor while medium flows through, which needs cell-retention equipment such as filter membranes. Neither your model nor the main model charges for these. In Humbird's perfusion design the membranes alone cost about $4.53 per kg of wet cells; Pasitka et al. report that single-use filters cost $8.78 per kg of wet cells more than reusable ones.</p>
        <p>This matters because almost all of the worlds that reach the competitive zone use perfusion or continuous culture. Leaving out a cost that only those processes carry makes them look better than they are. Would you add a membrane cost for those two processes, with a range that allows for reusable filters?</p>
      </li>
      <li>
        <p><strong>The limit on economies of scale.</strong></p>
        <p>You fixed a real problem: in the main model, reactor cost per litre keeps falling as the plant gets bigger, with no limit. Your fix prices every world's reactors as if the plant held 6,500 m³ of reactor volume. But the worlds that reach the competitive zone are high-productivity worlds that only need about 530 m³ (median) to make the same output. Pricing them as a 6,500 m³ plant gives them a much bigger volume discount than before, so the share of worlds under $36/kg dry rises from 0.049% to 0.080% when this change is made on its own. The 6,500 m³ figure also has no source yet.</p>
        <p>Could the limit be tied to engineering instead? Most economies of scale come from making each vessel bigger, and vessel size is limited by oxygen transfer, mixing and sterility; beyond that, plants add identical vessels. So we would suggest a scale discount on vessel size up to a maximum vessel size, a smaller discount for shared plant infrastructure, and a plant no larger than the 2036 market and lenders would plausibly support. More detail is on the <a href="${NOTES}#errors-and-economies-of-scale-that-never-run-out">notes page</a>.</p>
      </li>
      <li>
        <p><strong>Inputs that can be set separately for each process.</strong></p>
        <p>Many inputs have a tick box, "Same for all three processes", which a user can untick to enter different values for fed-batch, perfusion and continuous culture. This leaves a lot for the user to invent. Some inputs should clearly be the same for every process (input prices, the cost of capital); others differ in systematic ways that a user would have to work out for themselves.</p>
        <p>We suggest: lock the inputs that should not differ by process; give the inputs that do differ separate default values for each process, with sources; and where the difference follows a pattern, write it as a rule (for example, perfusion density as a multiple of fed-batch density, or membrane costs charged only for perfusion and continuous culture) rather than as free columns.</p>
      </li>
      <li>
        <p><strong>Other choices besides the process.</strong></p>
        <p>The page treats the process (fed-batch, perfusion, continuous) as the main fork in how a plant could work. Other forks may matter as much: the cell line (for example genetically engineered or not, immortalised, adapted to grow in suspension without serum), the route to cheap medium, and whether a scaffold is used. Should some of these be modelled the same way as the processes, as a few named routes, each with a probability and its own inputs?</p>
      </li>
      <li>
        <p><strong>How growth factors are represented.</strong></p>
        <p>"Cheap growth factors exist by 2036" is a yes-or-no switch inherited from the main model, and it is fairly arbitrary: "cheap" is really a matter of degree, and several different advances could get there, with different consequences. Cheaper production of the proteins (for example by precision fermentation) lowers the price per gram. Longer-lasting or more potent factors lower the dose. Cell lines that make their own growth factors, or need fewer, lower the requirement altogether.</p>
        <p>A cleaner approach might be to elicit the growth-factor cost per kg of cells directly, as a range, and to treat those advances as distinct routes. What do you think?</p>
      </li>
      <li>
        <p><strong>The "industry maturity" factor, and inputs that should move together.</strong></p>
        <p>Both models draw one "industry maturity" value per world and use it to nudge four technology probabilities and the cost of capital up or down together. Which inputs it links was a simplifying choice, not based on evidence, and in practice it has almost no effect: giving each of those inputs its own independent draw moves the share of worlds under $36/kg dry only from 0.049% to 0.048%. Meanwhile, things that plausibly share a cause are not linked at all. Better cell lines, for instance, would likely lower growth-factor needs, raise cell density and nutrient yield, and make long continuous runs more reliable, all at once.</p>
        <p>On the <a href="${NOTES}#linked-uncertainties">notes page</a> we propose replacing the single maturity factor with a few named common causes (cell-line quality, food-grade supply chains at scale, and the investment and policy climate), each linked to the inputs it plausibly affects, while keeping every input's own range exactly as entered so that nothing is counted twice. A related question: the whole analysis is arguably conditional on a large R&amp;D effort. Should that be stated as an explicit scenario rather than represented by a random maturity draw?</p>
      </li>
      <li>
        <p><strong>Sources for every input.</strong></p>
        <p>Each input should show where its default comes from, even if only in a tooltip or a link. At the moment some have no source at all, including the two cell-bank inputs, the plant operating cost and the 6,500 m³ scale limit. Most of your other defaults come from the main model, whose sources are in its <a href="../docs.html">technical reference</a>.</p>
      </li>
      <li>
        <p><strong>Medium recycling.</strong></p>
        <p>The "medium-use multiplier" is the number of reactor volumes of fresh medium used per harvest. You do not allow it to go below 1, because using less than one reactor volume of medium per harvest is only possible if spent medium is cleaned and reused, and the model does not charge anything for that. We agree that recycling should not be free, but it is physically possible, so ruling it out entirely may be too strict.</p>
        <p>We checked how much it matters, by running the main model's settings with and without the limit and comparing the same simulated worlds. Without the limit, free recycling lowers the cost in only 3.7% of worlds, because in most worlds the amount of nutrients the cells need already sets how much medium is used. In those worlds, adding the limit raises the cost by 7.6% at the median (by 28% or more in a tenth of them). Among the worlds under $36/kg dry, 29% are affected, by 8.9% at the median.</p>
        <p>Because the typical effect is under 10%, we would suggest keeping values below 1 but charging a cost for each litre of medium saved by recycling (covering the equipment, energy and replacement nutrients), rather than adding another yes-or-no choice for users. Does that seem reasonable to you, and do you know of a source for the cost of recycling medium?</p>
      </li>
      <li>
        <p><strong>Where the competitive zone ends.</strong></p>
        <p>You set the upper edge of the competitive zone at $36 per kg of dry cells, about three times your parity line and roughly the price level of organic chicken. Is that the right line for "price-competitive"? For reference, $36 per kg of dry cells works out to $9.90 per kg as meat made entirely of cells (at the water content of chicken meat), or $4.73 per kg for a product that is 25% cells and 75% plant-based filler at $3/kg. US wholesale boneless chicken has averaged about $3.50 per kg.</p>
      </li>
    </ol>
    <p class="small muted">The wording, label and display changes already made in this version of your page are listed in the hosting script (<code>scripts/host-bates-rebuild.mjs</code>, in the list called EDITS). We are happy to copy any of them into your own version.</p>
  </div></details>
</section>
<script>(function () { if (location.hash === '#questions-for-alex') { var d = document.getElementById('qa-details'); if (d) d.open = true; } })();</script>
`;
if (!html.includes('</main>')) throw new Error('no </main> in page');
html = html.replace('</main>', QUESTIONS + '</main>');
html = html.replace('<body>', '<body>\n' + bar);
// Host explanations (David, 17 Nov 2026): what the dry-cell thresholds mean per kg of product.
// Arithmetic: meat at 27.5% solids = dry x 0.275; hybrid = meat x 0.25 + $3 x 0.75 (the main model's conventions).
const r2 = x => (Math.round(x * 100 + 1e-6) / 100).toFixed(2);   // half-up, avoiding 4.725 -> 4.72
const meat = d => r2(d * 0.275), hybrid = d => r2(d * 0.275 * 0.25 + 3 * 0.75);
const CHICKEN = 'US wholesale boneless chicken averaged about $3.50/kg (2026 dollars, September 2022 to September 2026; middle 80% of months $2.60-4.60; USDA)';
const note = `What $12-36 per kg of dry cells means for a product: at chicken-meat moisture (27.5% solids) it is $${meat(12)}-${meat(36)} per kg of all-cell meat; as a hybrid product (25% cells, 75% plant-based filler at $3/kg) it is $${hybrid(12)}-${hybrid(36)} per kg. For comparison, ${CHICKEN}. These are ingredient costs for cell mass: forming, texturizing and packaging are not included, whereas wholesale chicken is already cut and packed. (Note added by the Unjournal host, not part of Alex's model.)`;
const tip = `Under $36/kg dry = under $${meat(36)}/kg as all-cell meat at chicken moisture, or $${hybrid(36)}/kg as a 25%-cell hybrid. Wholesale slaughtered chicken: ${CHICKEN}. No wholesale price for cultivated chicken is published; Arthur D. Little puts the current cost of finished cultivated products in the low EUR 40s per kg (2026, as cited in Alex's literature review).`;
// Explanation of the minimal-set analysis, paraphrasing the routes-src comments in Alex's page.
const howTo = `<details class="more uj-host-howto"><summary>How to read this: what a "smallest set" is, and what the rows are</summary>
<div class="more-body small">
<p><strong>Baseline.</strong> Start from a deliberately unfavourable world: every uncertain input at its central estimate, and every technology in its bad state (it does not exist, or a blocker is found). That world is far from price-competitive with chicken.</p>
<p><strong>Improvements.</strong> For each simulated world that does reach the competitive zone (under $36/kg dry), list every way it differs favourably from the baseline: an input that came out better than its central estimate, or a technology that worked. Each of these is a candidate improvement.</p>
<p><strong>Smallest set.</strong> Switch the improvements off one at a time, in random order, keeping each one off only if the world is still price-competitive without it. What is left is a minimal set: together these improvements make the world price-competitive (under $36/kg dry), and taking away any single one of them puts it back above that line. That is the sense of "necessary". "Smallest" means nothing more can be removed, not that no shorter set exists: a different removal order can leave a different minimal set, so the analysis tries three orders per world. Each competitive world counts once, so routes that come up often in the simulation carry more weight.</p>
<p><strong>The rows</strong> are the bars directly below. Each is one input or technology; its percentage is the share of minimal sets that include it. "Plant operating cost 98%", for example, means almost every route to the competitive zone needs operating cost better than its central estimate. The grey line under each says how far that input typically had to move (for operating cost, "typically in its best 7.3%" of draws) or how likely the technology is. Inputs in fewer than 10% of sets are listed under "Rarely needed".</p>
<p><strong>Which distributions.</strong> The simulated worlds are drawn from the inputs set under each step's <em>Assumptions</em> (a central estimate and a 95% optimistic value each; the pessimistic side mirrors the optimistic one). Most defaults are the main model's ranges, re-expressed this way; Alex's changes are listed in his Notes at the bottom. Sources for the main model's ranges are in its <a href="../docs.html">technical reference</a>; Alex's literature review argues many favourable ends are optimistic.</p>
<p><strong>"Rerun with current settings"</strong> recomputes this analysis after you change inputs under the steps' Assumptions or the run settings at the bottom. What you see on first load was computed at the default settings; a rerun simulates 1.5 million worlds (about a minute).</p>
<p><strong>What moves together in this model.</strong> The four technologies (hydrolysates, cheap growth factors, food-grade supplemental proteins, food-grade reactors) and the cost of capital share one "industry maturity" draw, so they tend to go well or badly together. Pharma-grade and food-grade reactor prices move together, as do the two whole-plant multipliers. Growth-factor use follows medium use. Everything else is drawn independently, including plant operating cost, nutrient yield, medium prices, harvest density and whether perfusion or continuous culture hits a blocker. Alex's literature review argues some of these should be linked (operating cost with capital, medium price with nutrient yield). The maturity link itself is ad hoc and has little effect; a proposal to replace it with named common causes such as cell-line quality is <a href="../bates-rebuild.html#linked-uncertainties">on the notes page</a>.</p>
<p><strong>Why plant operating cost tops the list.</strong> It is a single input here (labour, maintenance, overheads, energy, consumables), centred at $23.50/kg dry. Against a $36/kg dry zone edge, that alone uses up about two thirds of the budget, so almost every price-competitive world needs it below its centre. In the main model the same costs are two smaller inputs and matter little across all draws, but in its cheapest 10% of draws they make up about 30% of cost (fixed costs about 22%, utilities and consumables about 7%).</p>
<p class="tiny">Explanation added by the Unjournal host, from the comments and code in Alex's page; not part of his page.</p>
</div></details>`;
const hostScript = `<script>
(function () {
  var note = ${JSON.stringify(note)}, tip = ${JSON.stringify(tip)}, howTo = ${JSON.stringify(howTo)};
  var leadEl = document.getElementById('recipe-lead');
  if (leadEl) leadEl.insertAdjacentHTML('afterend', howTo);
  // Group the rows: in most routes (half of minimal sets or more) vs in some routes; fade the second group.
  var rowsEl = document.getElementById('recipe-rows');
  function tier() {
    if (!rowsEl) return;
    obs.disconnect();
    rowsEl.querySelectorAll('.uj-tier').forEach(function (h) { h.remove(); });
    var first = {hi: null, lo: null};
    rowsEl.querySelectorAll('.rrow').forEach(function (r) {
      var v = parseFloat((r.querySelector('.rval') || {}).textContent) / 100;
      var hi = v >= 0.5;
      r.style.opacity = hi ? '' : '0.72';
      if (hi && !first.hi) first.hi = r;
      if (!hi && !first.lo) first.lo = r;
    });
    function head(r, t) { if (!r) return; var h = document.createElement('p'); h.className = 'tiny uj-tier'; h.style.cssText = 'margin:6px 0 0;text-transform:uppercase;letter-spacing:.05em;font-weight:600'; h.textContent = t; r.insertAdjacentElement('beforebegin', h); }
    head(first.hi, 'Needed in most routes (half of minimal sets or more)');
    head(first.lo, 'Needed in some routes (under half): less often decisive');
    obs.observe(rowsEl, {childList: true});
  }
  var obs = new MutationObserver(tier);
  if (rowsEl) { obs.observe(rowsEl, {childList: true}); tier(); }
  var runBtn = document.getElementById('recipe-run');
  if (runBtn) { var rn = document.createElement('p'); rn.className = 'tiny uj-host-note'; rn.textContent = 'Settings are the inputs under each step’s Assumptions (below) and the run settings at the bottom of the page. The analysis shown was computed at the defaults; rerun it after changing them. (Host note.)'; runBtn.parentElement.insertAdjacentElement('afterend', rn); }
  var wrap = document.getElementById('hist-wrap');
  if (wrap) { var p = document.createElement('p'); p.className = 'small muted uj-host-note'; p.textContent = note; wrap.insertAdjacentElement('afterend', p); }
  var lead = document.getElementById('recipe-lead');
  if (lead) { lead.title = tip; lead.style.textDecoration = 'underline dotted'; lead.style.textUnderlineOffset = '3px'; lead.style.cursor = 'help'; }
})();
</script>
`;
html = html.replace('</body>', hostScript + '<script src="https://hypothes.is/embed.js" async></script>\n</body>');
mkdirSync(outDir, {recursive: true});
writeFileSync(out, html);
writeFileSync(outShared, shared);
console.log(`wrote ${out} and ${outShared}`);
