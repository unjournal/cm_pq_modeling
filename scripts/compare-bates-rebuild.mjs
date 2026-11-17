// Compare the Unjournal engine with Alex Bates's step-structured rebuild (v0.9.7, 16 Nov 2026),
// and attribute the difference to individual rebuild changes, one at a time from the original.
//
// The rebuild's engine is embedded in its page as <script type="text/plain" id="engine-src">;
// this script extracts it to a temporary module. With fromLegacy() + ORIGINAL_DECISIONS it
// reproduces dashboard/cost-model.mjs 2026-11-09.1 draw for draw (checked in the first two rows).
//
// Usage: node scripts/compare-bates-rebuild.mjs [n=1000000] [seed=42] > docs/bates-rebuild-comparison-2026-11-17.json
// Units: US$ per kg dry cell mass. Shares are of all simulated worlds.
//   under12 = below Bates's parity line (US wholesale chicken breast / 27.5% solids)
//   under36 = below Bates's "competitive zone" upper edge (about 3 x parity, organic-chicken level)
//   under40 = the dry equivalent of the Unjournal $5/kg hybrid threshold (25% cells, $3/kg filler)
import {readFileSync, writeFileSync, mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import * as UJ from '../dashboard/cost-model.mjs';

const PAGE = new URL('../models/bates-rebuild-2026-11/cultured-meat-model-v0.9.7.html', import.meta.url);
const html = readFileSync(PAGE, 'utf8');
const grab = id => {
  const start = html.indexOf(`<script type="text/plain" id="${id}">`);
  if (start < 0) throw new Error(`No ${id} block in ${PAGE.pathname}`);
  const from = html.indexOf('>', start) + 1;
  return html.slice(from, html.indexOf('</script>', from));
};
const modPath = join(mkdtempSync(join(tmpdir(), 'bates-')), 'engine.mjs');
writeFileSync(modPath, grab('engine-src') + `
export {simulate, fromLegacy, toEngineParams, defaultDecisions, ORIGINAL_DECISIONS, ENGINE_VERSION, MODES};
`);
const AB = await import(modPath);

const n = +(process.argv[2] ?? 1000000), seed = +(process.argv[3] ?? 42);
const finite = a => a.filter(Number.isFinite);
const q = (a, p) => { const s = finite(a).sort((x, y) => x - y); const i = (s.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] * (1 - (i - lo)) + s[hi] * (i - lo); };
const share = (a, t) => a.filter(v => Number.isFinite(v) && v < t).length / a.length;
const row = (name, total) => {
  const f = finite(total);
  return {name, worlds: total.length, p5: q(total, 0.05), p50: q(total, 0.5), mean: f.reduce((s, v) => s + v, 0) / f.length,
    under12: share(total, 12), under36: share(total, 36), under40: share(total, 40), under100: share(total, 100),
    count_under36: total.filter(v => v < 36).length, cheapest: f.reduce((m, v) => v < m ? v : m, Infinity)};
};
const fixed = v => AB.MODES.map(() => ({d: 'fixed', v}));
const ln = (p5, p95) => AB.MODES.map(() => ({d: 'ln', p5, p95}));

const rows = [];
// The rebuild started from the main model as it stood on 9 November 2026 (engine 2026-11-09.1). Since engine
// 2026-11-17.1 the main model includes two of the rebuild's corrections; OLD switches them back off so the
// one-change-at-a-time rows stay paired with the rebuild's 'original settings'.
const OLD = {maturity_centre: 0.5, medium_choice: 'hydrolysate'};
rows.push(row('Unjournal engine, 9 November settings', UJ.simulate(n, seed, OLD).unit_cost));
// How much does the shared 'maturity' link matter? Same model with one independent maturity draw per channel.
const indep = UJ.simulate(n, seed, {...OLD, dependence_mode: 'independent_maturity'});
rows.push(row('Unjournal engine, maturity channels independent', indep.unit_cost));
const ujShared = UJ.simulate(n, seed, OLD);
const realised = {p_hydro_stated: UJ.DEFAULT_PARAMS.p_hydro_mean,
  p_hydro_realised: ujShared.is_hydro_samples.reduce((a, b) => a + b, 0) / n};
const L = AB.fromLegacy({}), O = AB.ORIGINAL_DECISIONS;
const ab = (name, params, dec) => rows.push(row(name, AB.simulate(n, seed, params, dec).total));
ab('Rebuild engine, original settings (should equal row 1)', L, O);
ab('Original + hydrolysate medium only when cheaper', L, {...O, medium: 'cheapest'});
ab('Original + least-cost feasible process', L, {...O, process: 'least_cost'});
ab('Original + economies of scale stop at 6,500 m3', {...L, econ_scale_m3: fixed(6500)}, O);
ab('Original + economies of scale stop at 1,000 m3 (no discount past the price quote)', {...L, econ_scale_m3: fixed(1000)}, O);
ab('Original + economies of scale stop at 20,000 m3', {...L, econ_scale_m3: fixed(20000)}, O);
ab('Original + medium-use multiplier floored at 1', {...L, turnover_floor: 1}, O);
ab('Original + maturity nudge centred on its mean', {...L, maturity_centre: 'mean'}, O);
rows.push(row('Unjournal engine, current defaults', UJ.simulate(n, seed, {}).unit_cost));
const page = AB.toEngineParams(), D = AB.defaultDecisions();
ab('Rebuild page defaults (all changes)', page, D);
ab('Rebuild page, economies of scale by volume, uncapped', {...page, econ_scale_m3: null}, D);
ab('Rebuild page + oxygen cap on', {...page, oxygen_cap: true}, D);
ab('Rebuild page + nutrient yield 2-15 g/L (review evidence range)', {...page, nutrient_yield: ln(2, 15)}, D);
ab('Rebuild page + nutrient yield 2-15 g/L + oxygen cap', {...page, nutrient_yield: ln(2, 15), oxygen_cap: true}, D);

// Reactor volume each world needs under the original settings (20% solids; plant_kta is wet nameplate),
// overall and in the worlds under $36/kg dry: where do the competitive worlds sit relative to the
// 1,000 m3 price quote and the rebuild's 6,500 m3 frontier plant?
const orig = AB.simulate(n, seed, L, O), T = orig.trace;
const vol = [], volComp = [];
for (let i = 0; i < n; i++) {
  const v = T.plant_kta[i] * 1e6 / ((T.density[i] / 0.20) / 1000 / T.cycle_days[i] * 365) / 1000;
  vol.push(v); if (orig.total[i] < 36) volComp.push(v);
}
const vstats = a => ({worlds: a.length, p10: q(a, 0.1), p50: q(a, 0.5), p90: q(a, 0.9), under1000: share(a, 1000), under6500: share(a, 6500)});
const volume_m3 = {note: 'Original settings: reactor working volume needed for the drawn plant size', all: vstats(vol), under36: vstats(volComp)};

console.log(JSON.stringify({generated: new Date().toISOString().slice(0, 10), n, seed, volume_m3, realised,
  unjournal_engine: UJ.MODEL_VERSION, rebuild_engine: AB.ENGINE_VERSION, rebuild_page: 'cultured-meat-model-v0.9.7.html',
  units: 'USD per kg dry cell mass; shares of all simulated worlds (worlds with every process blocked count as not competitive)',
  thresholds: {under12: 'Bates parity (wholesale chicken breast at 27.5% solids)', under36: 'Bates competitive-zone upper edge (~3x parity)',
    under40: 'dry equivalent of the Unjournal $5/kg hybrid threshold', under100: 'reference'},
  rows}, null, 1));
