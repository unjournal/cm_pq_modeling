// Make the hosted copy of Alex Bates's page: original content untouched, plus a slim
// Unjournal host bar at the top and the Hypothes.is client.
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
const src = '/Users/yosemite/githubs/cm_pq_modeling/models/bates-rebuild-2026-11/cultured-meat-model-v0.9.7.html';
const outDir = '/Users/yosemite/githubs/cm_pq_modeling/dashboard/alt';
const out = `${outDir}/bates-rebuild-v0.9.7.html`;
const DOC = 'https://docs.google.com/document/d/1yjP2WTf3bWa_OjaTolOXJXydQDxH4ZsbcXMPOdrz2mo/edit';
let html = readFileSync(src, 'utf8');

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
</style>
`;
const bar = `<div class="uj-host" role="note">
  <div class="uj-host-in">
    <p><strong>Alternative model, hosted for discussion.</strong> A step-structured rebuild of the Unjournal cost model by Alex Bates (file v0.9.7, 16 November 2026). The <a href="../index.html">main Unjournal model</a> remains the better-validated reference; this page proposes structural changes and a "what has to go right" analysis.</p>
    <p>Every input can be changed: open <em>Assumptions</em> under each step (central estimate and 95% optimistic value, per process where it matters). Alex removed some structural choices of the main model, such as the probability-weighted process mix and contract manufacturing; see his Notes at the bottom.</p>
    <p class="links"><a href="../bates-rebuild.html">Notes, comparison and suggestions</a><a href="${DOC}">Literature review (Google Doc)</a><a href="../simple.html">Simplest model</a><span>Comment with Hypothes.is: the &lsaquo; tab on the right edge.</span></p>
  </div>
</div>
`;
if (!html.includes('</head>') || !html.includes('<body>')) throw new Error('unexpected page structure');
html = html.replace('</head>', headAdd + '</head>');
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
<p><strong>Baseline.</strong> Start from a deliberately unfavourable world: every uncertain input at its central estimate, and every technology in its bad state (it does not exist, or a blocker is found). That world is far from competitive.</p>
<p><strong>Improvements.</strong> For each simulated world that does reach the competitive zone (under $36/kg dry), list every way it differs favourably from the baseline: an input that came out better than its central estimate, or a technology that worked. Each of these is a candidate improvement.</p>
<p><strong>Smallest set.</strong> Switch the improvements off one at a time, in random order, keeping each one off only if the world is still competitive without it. What is left is a minimal set: together these improvements make the world competitive, and taking away any single one of them makes it uncompetitive. That is the sense of "necessary". "Smallest" means nothing more can be removed, not that no shorter set exists: a different removal order can leave a different minimal set, so the analysis tries three orders per world. Each competitive world counts once, so routes that come up often in the simulation carry more weight.</p>
<p><strong>The rows</strong> are the bars directly below. Each is one input or technology; its percentage is the share of minimal sets that include it. "Plant operating cost 98%", for example, means almost every route to the competitive zone needs operating cost better than its central estimate. The grey line under each says how far that input typically had to move (for operating cost, "typically in its best 7.3%" of draws) or how likely the technology is. Inputs in fewer than 10% of sets are listed under "Rarely needed".</p>
<p class="tiny">Explanation added by the Unjournal host, from the comments in Alex's code; not part of his page.</p>
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
console.log(`wrote ${out}`);
