// The cost of a kg of dry cells written as five numbers, and how much each one matters.
//
//   cost = litres of medium per kg × (medium price per litre + growth-factor cost per litre)
//          + plant running costs + capital charge
//
// (Running costs here = supplemental proteins + utilities and consumables + fixed costs; every line
// includes the model's allowance for recovery losses and failed runs. With the default settings the
// identity reproduces the model's total exactly; checked below.)
//
// For each of the five numbers the script reports its typical value in all simulated worlds and in the
// worlds under two cost lines, and how much of the spread in cost disappears if that one number is
// held at its median while the others vary as drawn.
//
// Usage: node scripts/five-drivers.mjs [n=1000000] [seed=42] > dashboard/five-drivers-2026-11-17.json
import {simulate, MODEL_VERSION, DEFAULT_PARAMS} from '../dashboard/cost-model.mjs';

const n = +(process.argv[2] ?? 1000000), seed = +(process.argv[3] ?? 42);
const r = simulate(n, seed, {});
const total = r.unit_cost, L = r.L_per_kg_samples;
const media = r.cost_media, gf = r.cost_recf;
const running = total.map((_, i) => r.cost_supp_protein[i] + r.cost_other_var[i] + r.cost_fixed[i]);
const capital = r.cost_capex;
const pm = media.map((v, i) => v / L[i]), pg = gf.map((v, i) => v / L[i]);

// Identity check
let maxErr = 0;
for (let i = 0; i < n; i++) {
  const t = L[i] * (pm[i] + pg[i]) + running[i] + capital[i];
  maxErr = Math.max(maxErr, Math.abs(t - total[i]) / total[i]);
}
if (maxErr > 1e-9) throw new Error(`Five-number identity does not reproduce the total (max relative error ${maxErr}). A default-off cost line may be on.`);

const sorted = a => Float64Array.from(a).sort();
const qs = (s, p) => { const i = (s.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] * (1 - (i - lo)) + s[hi] * (i - lo); };
const med = a => qs(sorted(a), 0.5);
const drivers = {
  litres: {label: 'Litres of medium per kg of dry cells', unit: 'L per kg dry', v: L},
  medium_price: {label: 'Price of medium', unit: '$ per litre', v: pm},
  gf_per_litre: {label: 'Growth-factor cost', unit: '$ per litre of medium', v: pg},
  running: {label: 'Plant running costs', unit: '$ per kg dry', v: running},
  capital: {label: 'Capital charge', unit: '$ per kg dry', v: capital}
};
const lines = {
  medium: {label: 'Medium', v: media}, growth_factors: {label: 'Growth factors', v: gf},
  running: {label: 'Plant running costs', v: running}, capital: {label: 'Capital charge', v: capital}
};

const groups = {
  all: [...Array(n).keys()],
  under100: [...Array(n).keys()].filter(i => total[i] < 100),
  under36: [...Array(n).keys()].filter(i => total[i] < 36)
};
const pick = (a, idx) => idx.map(i => a[i]);
const summary = Object.fromEntries(Object.entries(groups).map(([g, idx]) => [g, {
  worlds: idx.length, share_of_worlds: idx.length / n,
  total_median: med(pick(total, idx)),
  drivers: Object.fromEntries(Object.entries(drivers).map(([k, d]) => [k, med(pick(d.v, idx))])),
  lines_median: Object.fromEntries(Object.entries(lines).map(([k, d]) => [k, med(pick(d.v, idx))])),
  lines_share_of_mean: Object.fromEntries(Object.entries(lines).map(([k, d]) => {
    const tot = idx.reduce((s, i) => s + total[i], 0);
    return [k, idx.reduce((s, i) => s + d.v[i], 0) / tot];
  }))
}]));

// How much of the spread in cost goes away when one number is held at its median?
// Spread = variance of log cost across all worlds.
const varLog = a => { let m = 0; for (const v of a) m += Math.log(v); m /= a.length; let s = 0; for (const v of a) s += (Math.log(v) - m) ** 2; return s / a.length; };
const base = varLog(total);
const mAll = Object.fromEntries(Object.entries(drivers).map(([k, d]) => [k, med(d.v)]));
const recompute = fixed => total.map((_, i) => {
  const g = k => fixed === k ? mAll[k] : drivers[k].v[i];
  return g('litres') * (g('medium_price') + g('gf_per_litre')) + g('running') + g('capital');
});
const spread_removed = Object.fromEntries(Object.keys(drivers).map(k => [k, 1 - varLog(recompute(k)) / base]));
const ts = sorted(total);
// Price lines people quote, each expressed three ways: per kg of dry cells, per kg of meat made only of
// cells (at chicken-meat water content), and per kg of the hybrid product (cells plus plant-based filler).
const P = DEFAULT_PARAMS, perMeat = P.target_solids_fraction, cellShare = P.cell_inclusion_rate, filler = P.filler_cost;
const hybridFromDry = d => d * perMeat * cellShare + filler * (1 - cellShare);
const dryFromHybrid = h => (h - filler * (1 - cellShare)) / (perMeat * cellShare);
const shareBelow = d => { let c = 0; for (const v of total) if (v < d) c++; return c / n; };
// The same cells in a product with only 10% cells (some products on sale are nearer that share).
const LOW_SHARE = 0.10;
const line = (label, dry) => ({label, dry, all_cell_meat: dry * perMeat, hybrid: hybridFromDry(dry),
  hybrid_low_share: dry * perMeat * LOW_SHARE + filler * (1 - LOW_SHARE), share_of_worlds_below: shareBelow(dry)});
const price_lines = [
  line("Parity with chicken on Alex Bates's page ($12 per kg of dry cells)", 12),
  line('Hybrid product at the wholesale price of chicken ($3.50 per kg)', dryFromHybrid(3.5)),
  line("Upper edge of Alex's price-competitive zone ($36 per kg of dry cells)", 36),
  line('Main page threshold card: hybrid product at $5 per kg', dryFromHybrid(5)),
  line('Main page threshold card: hybrid product at $10 per kg', dryFromHybrid(10)),
  line('Main page threshold card: hybrid product at $25 per kg', dryFromHybrid(25)),
  line("The model's median world", qs(ts, 0.5))
];

// --- Running costs and capital as a floor: what a kg would cost if medium and growth factors were free.
const floorCost = total.map((_, i) => running[i] + capital[i]);
const fs = sorted(floorCost);
const floor = {note: 'plant running costs + capital charge per kg dry: the cost if medium and growth factors were free',
  p10: qs(fs, 0.1), p50: qs(fs, 0.5), p90: qs(fs, 0.9),
  share_of_worlds_below: Object.fromEntries([12, 18, 36].map(t => [t, fs.filter(v => v < t).length / n])),
  under36: {floor_median: med(pick(floorCost, groups.under36)), total_median: med(pick(total, groups.under36))}};

// --- What lies behind each of the three medium numbers.
// Share of the spread (variance of the logarithm) of a number that is accounted for by one underlying
// input: group the worlds by that input (50 equal-sized groups, or yes/no) and compare group averages.
const logOf = a => a.map(v => Math.log(v));
const variance = a => { let m = 0; for (const v of a) m += v; m /= a.length; let q = 0; for (const v of a) q += (v - m) ** 2; return q / a.length; };
function shareExplained(y, x, bins = 50) {
  const idx = [...y.keys()].sort((a, b) => x[a] - x[b]);
  const distinct = new Set(x.slice(0, 2000)).size <= 2;
  const groupsOf = distinct ? [idx.filter(i => x[i] === x[idx[0]]), idx.filter(i => x[i] !== x[idx[0]])]
    : Array.from({length: bins}, (_, b) => idx.slice(Math.floor(b * idx.length / bins), Math.floor((b + 1) * idx.length / bins)));
  let grand = 0; for (const v of y) grand += v; grand /= y.length;
  let between = 0;
  for (const g of groupsOf) { if (!g.length) continue; let m = 0; for (const i of g) m += y[i]; m /= g.length; between += g.length * (m - grand) ** 2; }
  return between / y.length / variance(y);
}
const logL = logOf(L), logPm = logOf(pm), logPg = logOf(pg), logTotal = logOf(total);
// Process used: the engine draws the process independently of everything else, so the spread within each
// process comes from a run restricted to that process; what is left is the share due to the process itself.
const nProc = Math.min(n, 300000);
const procRuns = {fedbatch: simulate(nProc, seed, {p_fedbatch: 1, p_perfusion: 0, p_continuous: 0}),
  perfusion: simulate(nProc, seed, {p_fedbatch: 0, p_perfusion: 1, p_continuous: 0}),
  continuous: simulate(nProc, seed, {p_fedbatch: 0, p_perfusion: 0, p_continuous: 1})};
const weights = {fedbatch: r.pct_fedbatch, perfusion: r.pct_perfusion, continuous: r.pct_continuous};
const within = out => Object.entries(procRuns).reduce((sum, [k, pr]) => sum + weights[k] * variance(logOf(out(pr))), 0);
const by_process = Object.fromEntries(Object.entries(procRuns).map(([k, pr]) => [k, {share_of_worlds: weights[k],
  litres_median: med(pr.L_per_kg_samples), density_median: med(pr.density_samples), total_median: med(pr.unit_cost),
  share_under36: pr.unit_cost.filter(v => v < 36).length / nProc}]));
const behind = {
  note: 'share of the spread (variance of the logarithm) in each number accounted for by one underlying input, taken alone; shares need not add to 100%',
  litres: {process_used: 1 - within(pr => pr.L_per_kg_samples) / variance(logL), cell_density: shareExplained(logL, r.density_samples),
    nutrient_yield: shareExplained(logL, r.nutrient_yield_samples), medium_use_multiplier: shareExplained(logL, r.media_turnover_samples),
    nutrient_floor_sets_medium_use_in_share_of_worlds: r.nutrient_floor_binding_share},
  medium_price: {hydrolysates_usable: shareExplained(logPm, r.is_hydro_samples), hydrolysate_share_of_worlds: r.pct_hydro,
    median_if_usable: med(pm.filter((_, i) => r.is_hydro_samples[i] === 1)), median_if_not: med(pm.filter((_, i) => r.is_hydro_samples[i] === 0))},
  gf_per_litre: {cheap_growth_factors_exist: shareExplained(logPg, r.is_recf_cheap_samples), cheap_share_of_worlds: r.pct_recf_cheap,
    median_if_cheap: med(pg.filter((_, i) => r.is_recf_cheap_samples[i] === 1)), median_if_not: med(pg.filter((_, i) => r.is_recf_cheap_samples[i] === 0))},
  total_cost: {hydrolysates_usable: shareExplained(logTotal, r.is_hydro_samples), cheap_growth_factors_exist: shareExplained(logTotal, r.is_recf_cheap_samples),
    process_used: 1 - within(pr => pr.unit_cost) / variance(logTotal)}
};

// --- Optional link between the yes/no technologies (engine parameter tech_link).
const link_scenarios = ['maturity', '0', '0.3', '0.6'].map(t => {
  const lr = t === 'maturity' ? r : simulate(n, seed, {tech_link: t});
  let h = 0, both = 0, all3 = 0;
  for (let i = 0; i < n; i++) { const a = lr.is_hydro_samples[i], b = lr.is_recf_cheap_samples[i]; h += a; if (a && b) both++; }
  return {tech_link: t, median: med(lr.unit_cost), share_under36: lr.unit_cost.filter(v => v < 36).length / n,
    share_under100: lr.unit_cost.filter(v => v < 100).length / n, p_cheap_gf_given_hydrolysates: both / h, p_hydrolysates: h / n};
});

console.log(JSON.stringify({
  generated: new Date().toISOString().slice(0, 10), engine: MODEL_VERSION, n, seed,
  identity: 'cost = litres × (medium price + growth-factor cost per litre) + running costs + capital charge; all per kg dry cell mass, including the allowance for losses and failed runs',
  identity_max_relative_error: maxErr,
  running_includes: 'supplemental proteins, utilities and consumables, fixed costs (labour, maintenance, overhead)',
  total: {p10: qs(ts, 0.1), p50: qs(ts, 0.5), p90: qs(ts, 0.9)},
  price_lines, low_cell_share: LOW_SHARE, floor, behind, by_process, link_scenarios,
  drivers: Object.fromEntries(Object.entries(drivers).map(([k, d]) => [k, {label: d.label, unit: d.unit}])),
  lines: Object.fromEntries(Object.entries(lines).map(([k, d]) => [k, d.label])),
  summary, spread_removed_when_held_at_median: spread_removed,
  note: 'spread = variance of log cost across all simulated worlds; the shares need not add to 100% because the numbers multiply and add.',
  hybrid_convention: {cell_inclusion_rate: DEFAULT_PARAMS.cell_inclusion_rate, filler_cost: DEFAULT_PARAMS.filler_cost, target_solids_fraction: DEFAULT_PARAMS.target_solids_fraction}
}, null, 1));
