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
    <p class="links"><a href="../bates-rebuild.html">Notes, comparison and suggestions</a><a href="${DOC}">Literature review (Google Doc)</a><a href="../simple.html">Simplest model</a><span>Comment with Hypothes.is: the &lsaquo; tab on the right edge.</span></p>
  </div>
</div>
`;
if (!html.includes('</head>') || !html.includes('<body>')) throw new Error('unexpected page structure');
html = html.replace('</head>', headAdd + '</head>');
html = html.replace('<body>', '<body>\n' + bar);
html = html.replace('</body>', '<script src="https://hypothes.is/embed.js" async></script>\n</body>');
mkdirSync(outDir, {recursive: true});
writeFileSync(out, html);
console.log(`wrote ${out}`);
