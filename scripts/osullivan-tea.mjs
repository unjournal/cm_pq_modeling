// Denis O'Sullivan's spreadsheet TEA (Cultured_Chicken_TEA_DOS_v1.xlsx, shared 24 November 2026), ported
// to code so it can be checked, taken apart and set beside the main model.
//
// What this does:
//   1. Reproduces the workbook's six cases (Today / Future × fed-batch / perfusion / continuous) and stops
//      if any total differs from the workbook's own value.
//   2. Reproduces the workbook's static ±25% sensitivity table, then repeats the exercise moving each input
//      across the "typical range" the workbook itself gives for it.
//   3. Splits the fall in cost from Today to Future among groups of inputs (Shapley shares of the log fall).
//   4. Expresses each case in the main model's terms (per kg of dry cells delivered; medium, growth factors,
//      running costs, capital) and reports where each value falls in the main model's simulated worlds.
//
// The workbook is a first draft that its author describes as containing errors. Inputs below are copied
// from it unchanged. The workbook itself is not in this repository.
//
// Usage: node scripts/osullivan-tea.mjs [n=300000] [seed=42] > dashboard/osullivan-tea-2026-11-24.json
import {simulate, MODEL_VERSION, DEFAULT_PARAMS} from '../dashboard/cost-model.mjs';
import {CHICKEN_WHOLESALE, hybridCost} from '../dashboard/model-controls.mjs';

// Cell-retention filter consumables, dollars per litre of medium passed through. Low: Pasitka et al.
// 2024 supplement, tangential-flow case (about $0.016/L). High: single-use hollow-fibre membranes
// replaced every run, Humbird 2021 (about $0.5–0.6/L) and Pasitka's ATF case (about $0.4/L).
// Uses the main model's own range when the engine has one.
const FILTER_PER_L = DEFAULT_PARAMS.include_retention
  ? [DEFAULT_PARAMS.retention_per_L_p5, DEFAULT_PARAMS.retention_per_L_p95] : [0.01, 0.50];

const n = +(process.argv[2] ?? 300000), seed = +(process.argv[3] ?? 42);

// ---------------------------------------------------------------------------------------------------
// Inputs: [today, future, low, high]. low/high are the workbook's "typical range" (null where it gives none).
const IN = {
  inc: [0.5, 0.5, 0.03, 1.0], ncost: [3, 2.5, 1.5, 5], dsp_y: [0.92, 0.97, 0.85, 0.98],
  mcell: [3.3, 3.3, 2, 4], dm: [0.25, 0.25, 0.15, 0.30], td: [24, 16, 14, 36], lag: [12, 6, 0, 24],
  qo2: [0.25, 0.25, 0.1, 0.5], split: [10, 10, 5, 20], xseed: [5e6, 1e7, 2e6, 2e7], seed_ta: [24, 12, 8, 36],
  nreac: [10, 10, 1, 50], vves: [20, 20, 2, 200], wvf: [0.8, 0.8, 0.7, 0.85], ophr: [8000, 8400, 7500, 8600],
  ta: [24, 12, 8, 48], fail_b: [0.05, 0.01, 0, 0.15], fail_c: [0.1, 0.03, 0, 0.3], otr_max: [10, 20, 5, 30],
  xa: [1.5e7, 3e7, 5e6, 4e7], mfa: [1, 1, 1, 2], xb: [3e7, 8e7, 1e7, 1.3e8], cspr: [60, 40, 20, 100],
  xc: [3e7, 6e7, 1e7, 1e8], td_ss: [36, 24, 18, 72], camp: [30, 90, 10, 180],
  rec: [0, 0.25, 0, 0.5], rec_cost: [0.05, 0.02, 0.01, 0.10],
  pec_ref: [1.5e6, 0.6e6, 0.5e6, 4e6], v_ref: [20, 20, null, null], exp: [0.6, 0.6, 0.5, 0.7],
  perf_add: [0.4, 0.25, 0.15, 0.6], mp_ref: [2e6, 1.2e6, null, null], mp_cap: [100, 100, null, null],
  dsp_ref: [4e6, 3e6, null, null], dsp_cap: [5000, 5000, null, null], lang: [4.5, 3.5, 3, 6],
  life: [15, 15, 10, 20], wacc: [0.10, 0.08, 0.06, 0.15],
  p_elec: [0.21, 0.21, 0.10, 0.30], p_heat: [0.07, 0.07, 0.04, 0.10], pv: [150, 75, 30, 300],
  med_e: [5, 3, 2, 10], med_th: [25, 10, 5, 40], cip_th: [40, 25, 15, 60], base: [2, 1, 0.5, 4],
  fixed_fte: [40, 25, 15, 80], rpo: [2, 4, 1, 6], crews: [5, 5, 4.5, 5.5], fte_cost: [85000, 85000, 60000, 110000],
  maint: [0.04, 0.03, 0.02, 0.06], ins: [0.02, 0.015, 0.01, 0.03],
  cons: [5, 2, 1, 15], water: [4, 3, 2, 8], qc: [2000, 500, 200, 5000],
  dsp_op: [1, 0.5, 0.3, 2], pack: [0.25, 0.2, 0.1, 0.5], logi: [0.4, 0.3, 0.2, 0.8],
  // Medium sheet, part A: concentration and price of each component paid per litre. No ranges given.
  salts_c: [10, 10], salts_p: [1.5, 0.8], hepes_c: [3.6, 0], hepes_p: [40, 40],
  ins_c: [5, 2], ins_p: [20, 5], tf_c: [5, 2], tf_p: [20, 5], alb_c: [0.5, 0.5], alb_p: [200, 20],
  fgf_c: [20, 10], fgf_p: [2000, 500], ogf_c: [20, 5], ogf_p: [2000, 500], vit_c: [1, 1], vit_p: [0.1, 0.03],
  // Medium sheet, part B: nutrients paid per kg of cells grown.
  aa_cons: [1.2, 0.9], aa_util: [0.6, 0.8], hydro_share: [0.3, 0.7], p_aa: [15, 4], p_hydro: [8, 2.5],
  aa_floor: [1.5, 1.5], aa_max: [30, 30], glc_cons: [4, 2], glc_util: [0.8, 0.9], p_glc: [1, 0.5], glc_floor: [3, 3]
};
const scenario = k => Object.fromEntries(Object.entries(IN).map(([key, v]) => [key, v[k]]));
const TODAY = scenario(0), FUTURE = scenario(1);
const MODES = {A: 'fedbatch', B: 'perfusion', C: 'continuous'};
const MODE_LABEL = {A: 'Fed-batch', B: 'Perfusion, then harvest', C: 'Continuous perfusion'};

// ---------------------------------------------------------------------------------------------------
// The workbook's Calc sheet, line by line. `volScale` multiplies the per-litre component prices (the
// workbook's "volume-based medium price" sensitivity row).
export function tea(I, mode, {volScale = 1} = {}) {
  const A = mode === 'A', C = mode === 'C';
  const wetkg = I.inc / I.dsp_y, drykg = wetkg * I.dm;
  const wv = I.vves * I.wvf, mu = Math.LN2 / I.td, x0 = I.xseed / I.split;
  const xh = A ? I.xa : C ? I.xc : I.xb;
  const tgrow = I.lag + Math.log2(xh / x0) * I.td, tss = C ? I.camp * 24 : 0, tcyc = tgrow + tss + I.ta;
  const mu_ss = C ? Math.LN2 / I.td_ss * 24 : 0;
  const cells = xh * wv * 1e6 * (C ? 1 + mu_ss * I.camp : 1);
  const wetcyc = cells * I.mcell * 1e-12, pfail = C ? I.fail_c : I.fail_b;
  const fpcyc = wetcyc * (1 - pfail) / wetkg;
  const growthMedium = I.cspr * (xh - x0) * wv * 1e-9 / (mu * 24);
  const med_prod = A ? wv * I.mfa : wv + growthMedium + (C ? I.cspr * xh * wv * 1e-9 * I.camp : 0);
  const med_tot = med_prod + wv / (I.split - 1);
  const cpk = 1 / fpcyc;
  const med_kg = med_tot * (1 - I.rec) * 1000 * cpk, medtot_kg = med_tot * 1000 * cpk, rec_kg = med_tot * I.rec * 1000 * cpk;
  const aa_price = I.hydro_share * I.p_hydro + (1 - I.hydro_share) * I.p_aa;
  const aa_kg = Math.max(I.aa_cons / I.aa_util * drykg / (1 - pfail), I.aa_floor * med_kg / 1000);
  const glc_kg = Math.max(I.glc_cons / I.glc_util * drykg / (1 - pfail), I.glc_floor * med_kg / 1000);
  const aa_conc = aa_kg * 1000 / med_kg, our = I.qo2 * xh * 1e-6;
  const cyc_yr = I.ophr / tcyc, fpkg_yr = I.nreac * cyc_yr * fpcyc;
  const med_day = fpkg_yr * medtot_kg / 1000 / (I.ophr / 24);
  const pecBase = I.pec_ref * (I.vves / I.v_ref) ** I.exp;
  const pec_rt = I.nreac * pecBase * (A ? 1 : 1 + I.perf_add);
  const seed_cyc = I.lag + Math.log2(I.split) * I.td + I.seed_ta;
  const n_seed = Math.ceil(I.nreac * cyc_yr / (I.ophr / seed_cyc) - 1e-12);
  const pec_seed = n_seed * pecBase * (I.split ** -I.exp + I.split ** (-2 * I.exp) + I.split ** (-3 * I.exp));
  const pec_mp = I.mp_ref * (med_day / I.mp_cap) ** I.exp;
  const pec_dsp = I.dsp_ref * (fpkg_yr / 1000 / I.dsp_cap) ** I.exp;
  const pec_tot = pec_rt + pec_seed + pec_mp + pec_dsp;
  const fci = pec_tot * I.lang, fcell = (pec_tot - pec_dsp) / pec_tot;
  const crf = I.wacc * (1 + I.wacc) ** I.life / ((1 + I.wacc) ** I.life - 1);
  const dep_yr = fci / I.life, cc_yr = fci * crf - dep_yr;
  const kwh_e = I.pv * (tgrow + tss) * wv * cpk / 1000 + medtot_kg / 1000 * I.med_e + I.base * I.nreac * I.vves * 8760 / fpkg_yr;
  const kwh_th = med_kg / 1000 * I.med_th + I.cip_th * I.vves * cpk;
  const fte = I.fixed_fte + Math.ceil(I.nreac / I.rpo - 1e-12) * I.crews;
  // Per-litre components, $/L of fresh medium
  const perL = {
    salts: I.salts_c * I.salts_p * 1e-3, hepes: I.hepes_c * I.hepes_p * 1e-3, vitamins: I.vit_c * I.vit_p,
    insulin: I.ins_c * I.ins_p * 1e-3, transferrin: I.tf_c * I.tf_p * 1e-3, albumin: I.alb_c * I.alb_p * 1e-3,
    fgf2: I.fgf_c * I.fgf_p * 1e-6, other_gf: I.ogf_c * I.ogf_p * 1e-6
  };
  for (const k of Object.keys(perL)) perL[k] *= volScale;
  const volPerL = Object.values(perL).reduce((a, b) => a + b, 0);
  const c = {
    vol: med_kg * volPerL, aa: aa_kg * aa_price, glc: glc_kg * I.p_glc, rec: rec_kg * I.rec_cost,
    ing: (1 - I.inc) * I.ncost, dep: dep_yr / fpkg_yr, cc: cc_yr / fpkg_yr,
    en: kwh_e * I.p_elec + kwh_th * I.p_heat, lab: fte * I.fte_cost / fpkg_yr,
    maint: I.maint * fci / fpkg_yr, ins: I.ins * fci / fpkg_yr,
    cons: medtot_kg / 1000 * (I.cons + I.water) + I.qc * I.nreac * (I.ophr / 168) / fpkg_yr,
    dsp: I.dsp_op, pack: I.pack, logi: I.logi
  };
  const total = Object.values(c).reduce((a, b) => a + b, 0);
  const cellfp = c.vol + c.aa + c.glc + c.rec + (c.dep + c.cc + c.maint + c.ins) * fcell + c.en + c.lab + c.cons;
  // The main model's terms, per kg of dry cells DELIVERED (inc × dm kg of dry cells in a kg of product).
  // The workbook's own "$/kg dry" row divides by dry cells harvested, before the recovery loss.
  const dryDelivered = I.inc * I.dm, per = v => v / dryDelivered;
  const basalPerL = perL.salts + perL.hepes + perL.vitamins, gfPerL = perL.fgf2 + perL.other_gf;
  const suppPerL = perL.insulin + perL.transferrin + perL.albumin;
  const lines = {
    medium: per(c.aa + c.glc + med_kg * basalPerL),
    growth_factors: per(med_kg * gfPerL),
    running: per(med_kg * suppPerL + c.rec + c.en + c.cons + c.lab + (c.maint + c.ins) * fcell),
    capital: per((c.dep + c.cc) * fcell)
  };
  // Pieces of those lines that the page quotes separately.
  const detail = {amino_acids_and_glucose: per(c.aa + c.glc), added_proteins: per(med_kg * suppPerL), labour: per(c.lab),
    upkeep: per((c.maint + c.ins) * fcell), energy: per(c.en), consumables: per(c.cons + c.rec),
    nutrients_kg_per_kg_dry: (aa_kg + glc_kg) / dryDelivered};
  return {
    total, cost_dry_harvested: cellfp / drykg, cost_wet_harvested: cellfp / wetkg,
    cost_dry_delivered: per(cellfp), lines, detail, c,
    physical: {
      density_g_dry_per_L: xh * I.mcell * 1e-6 * I.dm, density_g_wet_per_L: xh * I.mcell * 1e-6,
      litres_fresh_per_kg_dry: med_kg / drykg, litres_total_per_kg_dry: medtot_kg / drykg,
      medium_price_per_L: (c.aa + c.glc) / med_kg + basalPerL, gf_per_L: gfPerL, supp_protein_per_L: suppPerL,
      gf_concentration_mg_per_L: (I.fgf_c + I.ogf_c) / 1000,
      nutrients_g_per_L_fresh: (aa_kg + glc_kg) * 1000 / med_kg,
      productivity_g_dry_per_L_day: wetcyc * I.dm / (wv * tcyc / 24),
      cycle_h: tcyc, output_t_product: fpkg_yr / 1000, output_t_dry: fpkg_yr * drykg / 1000,
      capex_musd: fci / 1e6, capex_per_L_working: fci * fcell / (I.nreac * wv * 1000), fte, crf,
      filter_and_consumables_per_L: (I.cons + I.water) / 1000
    },
    flags: {aa_conc_g_per_L: aa_conc, aa_limit: I.aa_max, aa_high: aa_conc > I.aa_max,
      o2_demand: our, o2_limit: I.otr_max, o2_exceeds: our > I.otr_max, o2_at_limit: Math.abs(our - I.otr_max) < 1e-9}
  };
}

// ---------------------------------------------------------------------------------------------------
// 1. Replication of the workbook's own results.
const WORKBOOK = {
  total: {today: {A: 51.30221401653418, B: 46.4957600737164, C: 32.39392706922866},
    future: {A: 6.976573249442175, B: 5.415609270338235, C: 4.401737082714567}},
  dry: {today: {A: 343.38798583259944, B: 310.1805269917409, C: 209.36664753860694},
    future: {A: 33.27751366612617, B: 22.065993380672996, C: 14.948904981513996}}
};
const SC = {today: TODAY, future: FUTURE};
let maxRel = 0;
const cases = [];
for (const [s, I] of Object.entries(SC)) for (const m of Object.keys(MODES)) {
  const r = tea(I, m);
  for (const [got, want] of [[r.total, WORKBOOK.total[s][m]], [r.cost_dry_harvested, WORKBOOK.dry[s][m]]])
    maxRel = Math.max(maxRel, Math.abs(got - want) / want);
  cases.push({scenario: s, mode: m, process: MODES[m], label: `${s === 'today' ? 'Today' : 'Future'}, ${MODE_LABEL[m].toLowerCase()}`, ...r});
}
if (maxRel > 1e-9) throw new Error(`Port does not reproduce the workbook (max relative error ${maxRel}).`);
// Depreciation + capital charge is exactly the annuity (capital recovery factor × capital): not a double count.
const capitalIdentity = Math.max(...cases.map(k => Math.abs((k.c.dep + k.c.cc) - k.physical.crf * k.physical.capex_musd * 1e6 / (k.physical.output_t_product * 1000))));
if (capitalIdentity > 1e-9) throw new Error('Depreciation + capital charge does not equal the annuity.');

// ---------------------------------------------------------------------------------------------------
// 2. Sensitivity. Each row moves one input (or one small set of inputs) and leaves the rest alone.
const ROWS = [
  ['Share of cells in the product', ['inc']], ['Wet mass per cell', ['mcell']], ['Target cell density', ['xh']],
  ['Doubling time (growth phase)', ['td']], ['Doubling time at steady state', ['td_ss']],
  ['Installation (Lang) factor', ['lang']], ['Bioreactor purchase price', ['pec_ref']], ['Vessel size', ['vves']],
  ['Cost of capital', ['wacc']], ['Price of per-litre medium components', ['VOL']], ['Labour cost per person', ['fte_cost']],
  ['Number of production reactors', ['nreac']], ['Turnaround time per cycle', ['ta']],
  ['Amino-acid and hydrolysate prices', ['p_aa', 'p_hydro']], ['Amino acids consumed per kg dry cells', ['aa_cons']],
  ['Failure rate', ['fail']], ['Price of non-cell ingredients', ['ncost']], ['Electricity price', ['p_elec']],
  ['Medium per cell per day (perfusion rate)', ['cspr']]
];
const resolve = (key, mode) => key === 'xh' ? (mode === 'A' ? 'xa' : mode === 'C' ? 'xc' : 'xb') : key === 'fail' ? (mode === 'C' ? 'fail_c' : 'fail_b') : key;
const applies = (key, mode) => !(mode === 'A' && (key === 'cspr' || key === 'td_ss')) && !(mode === 'B' && key === 'td_ss');
function moved(I, mode, keys, f) {
  const J = {...I}; let volScale = 1;
  for (const k0 of keys) { if (k0 === 'VOL') volScale = f; else { const k = resolve(k0, mode); J[k] = I[k] * f; } }
  return tea(J, mode, {volScale});
}
function quarterTable(I, mode, out) {
  const base = tea(I, mode)[out];
  return ROWS.filter(([, keys]) => keys.every(k => applies(k, mode))).map(([label, keys]) => {
    const lo = moved(I, mode, keys, 0.75)[out], hi = moved(I, mode, keys, 1.25)[out];
    return {label, at_minus_25: lo, at_plus_25: hi, swing: Math.abs(hi - lo), base};
  }).sort((a, b) => b.swing - a.swing);
}
// The workbook's printed swings, to check the replication (top rows of each of its two tables).
const PRINTED = {
  todayA: {'Share of cells in the product': 22.8803, 'Wet mass per cell': 22.8441, 'Target cell density': 19.309,
    'Doubling time (growth phase)': 12.9439, 'Installation (Lang) factor': 12.6439, 'Bioreactor purchase price': 11.3415,
    'Vessel size': 10.0395, 'Cost of capital': 4.9495, 'Price of per-litre medium components': 4.1028,
    'Labour cost per person': 3.8353, 'Number of production reactors': 2.9003, 'Turnaround time per cycle': 2.6331,
    'Amino-acid and hydrolysate prices': 1.845, 'Amino acids consumed per kg dry cells': 1.845, 'Failure rate': 1.2438,
    'Price of non-cell ingredients': 0.75, 'Electricity price': 0.5412},
  futureC: {'Wet mass per cell': 0.7603, 'Doubling time at steady state': 0.7032, 'Price of non-cell ingredients': 0.625,
    'Target cell density': 0.3873, 'Share of cells in the product': 0.3837, 'Medium per cell per day (perfusion rate)': 0.3453,
    'Installation (Lang) factor': 0.3222, 'Vessel size': 0.273, 'Price of per-litre medium components': 0.263,
    'Amino-acid and hydrolysate prices': 0.2205, 'Amino acids consumed per kg dry cells': 0.2205,
    'Bioreactor purchase price': 0.1561, 'Number of production reactors': 0.1381, 'Labour cost per person': 0.1217,
    'Cost of capital': 0.1135, 'Failure rate': 0.0312}
};
const sens = {todayA: quarterTable(TODAY, 'A', 'total'), futureC: quarterTable(FUTURE, 'C', 'total')};
let sensMaxDiff = 0, sensChecked = 0;
for (const [k, printed] of Object.entries(PRINTED)) for (const [label, swing] of Object.entries(printed)) {
  const row = sens[k].find(r => r.label === label);
  if (!row) throw new Error(`No sensitivity row ${label}`);
  row.workbook_swing = swing; sensMaxDiff = Math.max(sensMaxDiff, Math.abs(row.swing - swing)); sensChecked++;
}

// The same exercise across the range the workbook itself gives for each input, on cost per kg of dry cells
// (so that the share of cells in the product, a design choice, drops out).
const RANGE_LABEL = {
  dsp_y: 'Recovery of cells after harvest', mcell: 'Wet mass per cell', dm: 'Dry-matter share of wet cells',
  td: 'Doubling time (growth phase)', lag: 'Lag after inoculation', split: 'Seed expansion ratio', xseed: 'Seed transfer density',
  seed_ta: 'Seed reactor turnaround', nreac: 'Number of production reactors', vves: 'Vessel size', wvf: 'Working volume share',
  ophr: 'Operating hours per year', ta: 'Turnaround time per cycle', fail: 'Failure rate', xh: 'Target cell density',
  mfa: 'Medium per batch (fed-batch)', cspr: 'Medium per cell per day (perfusion rate)', td_ss: 'Doubling time at steady state',
  camp: 'Length of a continuous run', rec: 'Share of medium recycled', rec_cost: 'Cost of recycling',
  pec_ref: 'Bioreactor purchase price', exp: 'Scale exponent', perf_add: 'Perfusion equipment add-on', lang: 'Installation (Lang) factor',
  life: 'Depreciation life', wacc: 'Cost of capital', p_elec: 'Electricity price', p_heat: 'Heat price', pv: 'Mixing and aeration power',
  med_e: 'Medium preparation electricity', med_th: 'Medium heating', cip_th: 'Cleaning and sterilising heat', base: 'Facility base load',
  fixed_fte: 'Fixed staff', rpo: 'Reactors per operator', crews: 'Shift crews', fte_cost: 'Labour cost per person',
  maint: 'Maintenance rate', ins: 'Insurance and overhead rate', cons: 'Consumables per m³ of medium', water: 'Water and effluent', qc: 'Quality control'
};
function rangeTable(I, mode) {
  const base = tea(I, mode).cost_dry_delivered;
  const rows = [];
  for (const [k0, label] of Object.entries(RANGE_LABEL)) {
    if ((mode === 'A' && ['cspr', 'td_ss', 'camp', 'perf_add'].includes(k0)) || (mode !== 'A' && k0 === 'mfa') || (mode === 'B' && ['td_ss', 'camp'].includes(k0))) continue;
    const k = resolve(k0, mode), [, , lo, hi] = IN[k];
    const at = v => tea({...I, [k]: v}, mode).cost_dry_delivered;
    const a = at(lo), b = at(hi);
    rows.push({label, low: lo, high: hi, value: I[k], cost_at_low: a, cost_at_high: b, swing: Math.abs(b - a),
      ratio: Math.max(a, b) / Math.min(a, b), quarter_swing: Math.abs(at(I[k] * 1.25) - at(I[k] * 0.75))});
  }
  rows.sort((x, y) => y.quarter_swing - x.quarter_swing); rows.forEach((r, i) => r.rank_quarter = i + 1);
  rows.sort((x, y) => y.swing - x.swing); rows.forEach((r, i) => r.rank_range = i + 1);
  return {base, rows};
}

// ---------------------------------------------------------------------------------------------------
// 3. What the Future column changes, and how much of the fall each group of changes accounts for.
const GROUPS = {
  cells: {label: 'How the cells perform', detail: 'harvest density, doubling time, lag, seed density',
    keys: ['xa', 'xb', 'xc', 'td', 'lag', 'td_ss', 'xseed']},
  operation: {label: 'How the plant is run', detail: 'turnaround times, operating hours, failure rates, length of a continuous run, recovery after harvest',
    keys: ['ta', 'seed_ta', 'ophr', 'fail_b', 'fail_c', 'camp', 'dsp_y']},
  recipe: {label: 'How much of each medium ingredient is needed', detail: 'medium per cell per day, recycling, concentrations of buffer, proteins and growth factors, nutrients consumed and wasted per kg of cells, share supplied as hydrolysate',
    keys: ['cspr', 'rec', 'rec_cost', 'hepes_c', 'ins_c', 'tf_c', 'fgf_c', 'ogf_c', 'aa_cons', 'aa_util', 'hydro_share', 'glc_cons', 'glc_util']},
  prices: {label: 'What medium ingredients cost', detail: 'prices of salts, insulin, transferrin, albumin, growth factors, vitamins, amino acids, hydrolysate and glucose',
    keys: ['salts_p', 'ins_p', 'tf_p', 'alb_p', 'fgf_p', 'ogf_p', 'vit_p', 'p_aa', 'p_hydro', 'p_glc']},
  capital: {label: 'What the plant costs to build and finance', detail: 'reactor price, perfusion add-on, media-preparation and downstream equipment, installation factor, cost of capital',
    keys: ['pec_ref', 'perf_add', 'mp_ref', 'dsp_ref', 'lang', 'wacc']},
  overhead: {label: 'Staffing, upkeep and consumables', detail: 'fixed staff, reactors per operator, maintenance and insurance rates, consumables, water, quality control',
    keys: ['fixed_fte', 'rpo', 'maint', 'ins', 'cons', 'water', 'qc']},
  energy: {label: 'Energy use', detail: 'mixing power, medium preparation and heating, cleaning heat, facility base load',
    keys: ['pv', 'med_e', 'med_th', 'cip_th', 'base']}
};
const OUTSIDE = ['ncost', 'dsp_op', 'pack', 'logi', 'otr_max'];  // no effect on cost per kg of dry cells
const changed = Object.keys(IN).filter(k => IN[k][0] !== IN[k][1]);
const grouped = new Set([...Object.values(GROUPS).flatMap(g => g.keys), ...OUTSIDE]);
const ungrouped = changed.filter(k => !grouped.has(k));
if (ungrouped.length) throw new Error(`Changed inputs not assigned to a group: ${ungrouped}`);
const gk = Object.keys(GROUPS), G = gk.length;
const fact = [1]; for (let i = 1; i <= G; i++) fact[i] = fact[i - 1] * i;
function decompose(mode) {
  const cost = mask => {
    const I = {...TODAY};
    gk.forEach((g, j) => { if (mask >> j & 1) for (const k of GROUPS[g].keys) I[k] = FUTURE[k]; });
    return tea(I, mode).cost_dry_delivered;
  };
  const all = (1 << G) - 1, v = Array.from({length: 1 << G}, (_, m) => Math.log(cost(m)));
  const today = Math.exp(v[0]), future = Math.exp(v[all]), fall = v[0] - v[all];
  const check = Math.abs(future - tea(FUTURE, mode).cost_dry_delivered) / future;
  if (check > 1e-9) throw new Error('Groups do not account for every changed input.');
  const out = {};
  gk.forEach((g, j) => {
    let phi = 0;
    for (let m = 0; m <= all; m++) if (!(m >> j & 1)) {
      let s = 0; for (let b = 0; b < G; b++) s += m >> b & 1;
      phi += fact[s] * fact[G - s - 1] / fact[G] * (v[m] - v[m | 1 << j]);
    }
    out[g] = {label: GROUPS[g].label, detail: GROUPS[g].detail, inputs_changed: GROUPS[g].keys.length,
      share_of_fall: phi / fall, factor: Math.exp(phi),
      cost_if_only_this_changes: Math.exp(v[1 << j]), cost_if_everything_else_changes: Math.exp(v[all & ~(1 << j)])};
  });
  return {today, future, ratio: today / future, groups: out};
}

// ---------------------------------------------------------------------------------------------------
// 4. Beside the main model: the same quantities across its simulated worlds, all worlds and each process.
const sorted = a => Float64Array.from(a).sort();
const qs = (s, p) => { const i = (s.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] * (1 - (i - lo)) + s[hi] * (i - lo); };
const shareBelow = (s, v) => { let lo = 0, hi = s.length; while (lo < hi) { const m = lo + hi >> 1; if (s[m] < v) lo = m + 1; else hi = m; } return lo / s.length; };
function quantities(r) {
  const t = r.unit_cost;
  return {
    cost_dry: t, medium: r.cost_media, growth_factors: r.cost_recf,
    running: t.map((_, i) => r.cost_supp_protein[i] + r.cost_other_var[i] + r.cost_fixed[i]), capital: r.cost_capex,
    density: r.density_samples, litres: r.L_per_kg_samples, medium_price: r.media_cost_L_samples,
    productivity: r.density_samples.map((d, i) => d / r.cycle_days_samples[i])
  };
}
const runs = {all: simulate(n, seed, {}),
  fedbatch: simulate(n, seed, {p_fedbatch: 1, p_perfusion: 0, p_continuous: 0}),
  perfusion: simulate(n, seed, {p_fedbatch: 0, p_perfusion: 1, p_continuous: 0}),
  continuous: simulate(n, seed, {p_fedbatch: 0, p_perfusion: 0, p_continuous: 1})};
const dist = Object.fromEntries(Object.entries(runs).map(([k, r]) => [k, Object.fromEntries(Object.entries(quantities(r)).map(([q, a]) => [q, sorted(a)]))]));
const summarise = d => Object.fromEntries(Object.entries(d).map(([q, s]) => [q, {p5: qs(s, 0.05), p10: qs(s, 0.1), p50: qs(s, 0.5), p90: qs(s, 0.9), p95: qs(s, 0.95), min: s[0], max: s[s.length - 1]}]));
const basis = {cell_inclusion_rate: DEFAULT_PARAMS.cell_inclusion_rate, target_solids_fraction: DEFAULT_PARAMS.target_solids_fraction, filler_cost: DEFAULT_PARAMS.filler_cost};
const theirs = k => ({cost_dry: k.cost_dry_delivered, medium: k.lines.medium, growth_factors: k.lines.growth_factors,
  running: k.lines.running, capital: k.lines.capital, density: k.physical.density_g_dry_per_L,
  litres: k.physical.litres_fresh_per_kg_dry, medium_price: k.physical.medium_price_per_L, productivity: k.physical.productivity_g_dry_per_L_day});
for (const k of cases) {
  const v = theirs(k);
  k.in_main_model = {
    values: v,
    share_of_same_process_worlds_below: Object.fromEntries(Object.entries(v).map(([q, x]) => [q, shareBelow(dist[k.process][q], x)])),
    share_of_all_worlds_below: Object.fromEntries(Object.entries(v).map(([q, x]) => [q, shareBelow(dist.all[q], x)])),
    hybrid_on_main_model_convention: hybridCost(k.cost_dry_delivered, basis)
  };
  delete k.c;
}

// How many of the changed inputs move in the direction that lowers cost? Checked one at a time from Today.
const direction = changed.map(k => {
  const d = Object.keys(MODES).map(m => tea({...TODAY, [k]: FUTURE[k]}, m).total - tea(TODAY, m).total);
  const raises = d.some(x => x > 1e-12), lowers = !raises && d.some(x => x < -1e-12);
  return {key: k, lowers, raises, no_effect: !raises && !lowers};
});

const result = {
  generated: new Date().toISOString().slice(0, 10), workbook: 'Cultured_Chicken_TEA_DOS_v1.xlsx (shared 24 November 2026)',
  main_model_version: MODEL_VERSION, n, seed,
  replication: {max_relative_error_six_cases: maxRel, capital_lines_equal_annuity: true,
    sensitivity_rows_checked: sensChecked, sensitivity_max_abs_difference: sensMaxDiff},
  inputs: {total: Object.keys(IN).length, changed_between_today_and_future: changed.length,
    changed_that_lower_cost: direction.filter(d => d.lowers).length, changed_that_raise_cost: direction.filter(d => d.raises).map(d => d.key),
    changed_with_no_effect_on_cost: direction.filter(d => d.no_effect).map(d => d.key),
    with_a_typical_range: Object.values(IN).filter(v => v.length === 4 && v[2] != null).length,
    today: TODAY, future: FUTURE},
  cases,
  decomposition: Object.fromEntries(Object.keys(MODES).map(m => [MODES[m], decompose(m)])),
  sensitivity: {quarter: sens,
    range: {todayA: rangeTable(TODAY, 'A'), futureC: rangeTable(FUTURE, 'C')},
    mass_per_cell_note: {
      // Hold the mass of cells per litre fixed (density in cells/mL falls as cells get heavier): no change.
      todayA_cost_if_cells_25pct_heavier_and_fewer: tea({...TODAY, mcell: TODAY.mcell * 1.25, xa: TODAY.xa / 1.25, xseed: TODAY.xseed / 1.25}, 'A').total,
      todayA_base: tea(TODAY, 'A').total}},
  checks: {
    oxygen: {
      future_perfusion_demand: tea(FUTURE, 'B').flags.o2_demand, future_limit: FUTURE.otr_max, today_limit: TODAY.otr_max,
      future_cases_over_today_limit: Object.keys(MODES).filter(m => tea(FUTURE, m).flags.o2_demand > TODAY.otr_max).map(m => MODES[m])},
    // Cell-retention filters: the workbook charges consumables per m³ of medium. Published designs give
    // $0.01–0.50 per litre for the filters alone (FILTER_PER_L). Cost per kg dry at each end.
    retention: Object.fromEntries(['B', 'C'].map(m => { const k = tea(FUTURE, m); return [MODES[m], {
      workbook_consumables_per_L: FUTURE.cons / 1000, litres_total_per_kg_dry: k.physical.litres_total_per_kg_dry,
      added_per_kg_dry_at_low: k.physical.litres_total_per_kg_dry * FILTER_PER_L[0],
      added_per_kg_dry_at_high: k.physical.litres_total_per_kg_dry * FILTER_PER_L[1],
      cost_dry: k.cost_dry_delivered}]; }))
  },
  main_model: {summary: Object.fromEntries(Object.entries(dist).map(([k, d]) => [k, summarise(d)])),
    share_of_all_worlds_below: Object.fromEntries([15, 18, 25, 36, 50, 100].map(t => [t, shareBelow(dist.all.cost_dry, t)])),
    basis, chicken_wholesale: CHICKEN_WHOLESALE,
    // Plant size: the main model's range is tonnes of wet cells a year at 20% solids.
    plant_t_dry_per_year: [DEFAULT_PARAMS.plant_kta_p5, DEFAULT_PARAMS.plant_kta_p95].map(k => k * 1000 * DEFAULT_PARAMS.solids_fraction),
    density_ranges_g_dry_per_L: {fedbatch: [1, 6], perfusion: [6, 30], continuous: [10, 40]},
    oxygen_cap_g_dry_per_L: [DEFAULT_PARAMS.max_density_o2_p5, DEFAULT_PARAMS.max_density_o2_p95],
    gf_concentration_mg_per_L: DEFAULT_PARAMS.gf_concentration_mg_L,
    retention_per_L: FILTER_PER_L,
    charges_filters: Boolean(DEFAULT_PARAMS.include_retention)}
};
console.log(JSON.stringify(result, null, 1));
