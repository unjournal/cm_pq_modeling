// Sensitivity and uncertainty-attribution methods for the cost model.
// Pure ESM with no dependencies: used by sensitivity.qmd, index.qmd, Node tests
// and scripts/sensitivity-shapley.mjs. Every estimator here works on the joint
// Monte Carlo sample the engine already produces, except the intervention
// helpers, which re-run the engine with one input collapsed to a point mass.
import {DEFAULT_PARAMS, quantile, mean, simulate, mulberry32} from "./cost-model.mjs";

// ---------------------------------------------------------------------------
// Basic statistics
// ---------------------------------------------------------------------------

export function variance(arr) {
  const m = mean(arr);
  let s = 0;
  for (const v of arr) s += (v - m) * (v - m);
  return s / (arr.length - 1);
}

// Average ranks, 1-based, ties share the mean rank.
export function ranks(arr) {
  const n = arr.length;
  const order = Array.from(arr.keys()).sort((a, b) => arr[a] - arr[b]);
  const out = new Float64Array(n);
  let i = 0;
  while (i < n) {
    let j = i;
    while (j < n - 1 && arr[order[j + 1]] === arr[order[j]]) j++;
    const r = (i + j) / 2 + 1;
    for (let t = i; t <= j; t++) out[order[t]] = r;
    i = j + 1;
  }
  return out;
}

export function pearson(x, y) {
  const n = x.length;
  const mx = mean(x), my = mean(y);
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx, dy = y[i] - my;
    num += dx * dy; dx2 += dx * dx; dy2 += dy * dy;
  }
  const den = Math.sqrt(dx2 * dy2);
  return den === 0 ? 0 : num / den;
}

export function spearman(x, y) {
  return pearson(ranks(x), ranks(y));
}

export function summaryStat(values, stat = {type: "mean"}) {
  switch (stat.type) {
    case "mean": return mean(values);
    case "median": return quantile(values, 0.5);
    case "quantile": return quantile(values, stat.q);
    case "below": return values.filter(v => v < stat.threshold).length / values.length;
    default: throw new RangeError(`Unknown statistic: ${stat.type}`);
  }
}

// ---------------------------------------------------------------------------
// Tail contrasts (the tornado chart) with a configurable tail and statistic
// ---------------------------------------------------------------------------

function sortedIndex(x) {
  return Array.from(x.keys()).sort((a, b) => x[a] - x[b]);
}

// Signed difference of a cost statistic between draws where `x` is in its top
// tail and draws where it is in its bottom tail. With tailFrac 0.10 and the
// mean, this is the engine's conditionalSwing.
export function tailContrast(x, y, {tailFrac = 0.10, stat = {type: "mean"}} = {}) {
  const n = x.length;
  if (x.every(v => v === x[0])) return 0;
  const order = sortedIndex(x);
  const count = Math.max(1, Math.floor(n * tailFrac));
  const lo = order.slice(0, count).map(i => y[i]);
  const hi = order.slice(n - count).map(i => y[i]);
  return summaryStat(hi, stat) - summaryStat(lo, stat);
}

// The same contrast with its Monte Carlo standard error (two independent tail
// groups), so small bars can be read against sampling noise. For the "below"
// statistic the variance is that of a proportion.
export function tailContrastDetail(x, y, {tailFrac = 0.10, stat = {type: "mean"}} = {}) {
  const n = x.length;
  const order = sortedIndex(x);
  const count = Math.max(2, Math.floor(n * tailFrac));
  const lo = order.slice(0, count).map(i => y[i]);
  const hi = order.slice(n - count).map(i => y[i]);
  const loStat = summaryStat(lo, stat), hiStat = summaryStat(hi, stat);
  let se;
  if (stat.type === "mean") se = Math.sqrt(variance(lo) / count + variance(hi) / count);
  else if (stat.type === "below") se = Math.sqrt((loStat * (1 - loStat) + hiStat * (1 - hiStat)) / count);
  else {
    // Quantile standard error via the binomial approximation of the order statistic.
    const q = stat.type === "median" ? 0.5 : stat.q;
    const qse = arr => {
      const s = [...arr].sort((a, b) => a - b);
      const half = Math.sqrt(q * (1 - q) / count);
      const at = p => s[Math.min(count - 1, Math.max(0, Math.round(p * (count - 1))))];
      return (at(Math.min(1, q + half)) - at(Math.max(0, q - half))) / 2;
    };
    se = Math.sqrt(qse(lo) ** 2 + qse(hi) ** 2);
  }
  return {contrast: x.every(v => v === x[0]) ? 0 : hiStat - loStat, se, loStat, hiStat, count};
}

// Mean of the input itself within each tail: the set-points an intervention
// needs to be comparable with the conditional contrast.
export function tailMeans(x, tailFrac = 0.10) {
  const n = x.length;
  const order = sortedIndex(x);
  const count = Math.max(1, Math.floor(n * tailFrac));
  return {lo: mean(order.slice(0, count).map(i => x[i])), hi: mean(order.slice(n - count).map(i => x[i]))};
}

// ---------------------------------------------------------------------------
// Conditioning on one input: profiles and expected remaining uncertainty
// ---------------------------------------------------------------------------

// Equal-count bins by rank of x; ties may straddle a boundary.
export function conditionalProfile(x, y, nBins = 10) {
  const n = x.length;
  const order = sortedIndex(x);
  const bins = [];
  for (let b = 0; b < nBins; b++) {
    const start = Math.floor(b * n / nBins), end = Math.floor((b + 1) * n / nBins);
    if (end <= start) continue;
    const idx = order.slice(start, end);
    const xs = idx.map(i => x[i]), ys = idx.map(i => y[i]);
    bins.push({
      bin: b + 1, n: idx.length, xLo: xs[0], xHi: xs[xs.length - 1], xMean: mean(xs),
      yMean: mean(ys), yMedian: quantile(ys, 0.5), yP10: quantile(ys, 0.1), yP90: quantile(ys, 0.9),
      yVar: ys.length > 1 ? variance(ys) : 0
    });
  }
  return bins;
}

// Expected remaining uncertainty if one input were learned exactly, approximated by
// conditioning on equal-count bins (law of total variance over the partition).
// eta2 is the first-order Sobol index when inputs are independent; under dependence
// it also counts information carried by correlated inputs, so shares need not sum to one.
export function learningValue(x, y, nBins = 30) {
  const varY = variance(y);
  if (x.every(v => v === x[0]) || varY === 0) {
    const w = quantile(y, 0.9) - quantile(y, 0.1);
    return {eta2: 0, marginalSd: Math.sqrt(varY), expectedSd: Math.sqrt(varY), marginalWidth80: w, expectedWidth80: w, bins: nBins};
  }
  const bins = conditionalProfile(x, y, nBins);
  const n = y.length;
  const expectedVar = bins.reduce((s, b) => s + b.yVar * (b.n - 1), 0) / (n - bins.length);
  const expectedWidth = bins.reduce((s, b) => s + (b.yP90 - b.yP10) * b.n, 0) / n;
  return {
    eta2: Math.max(0, 1 - expectedVar / varY),
    marginalSd: Math.sqrt(varY), expectedSd: Math.sqrt(expectedVar),
    marginalWidth80: quantile(y, 0.9) - quantile(y, 0.1), expectedWidth80: expectedWidth,
    bins: nBins
  };
}

// ---------------------------------------------------------------------------
// Rank regression: standardized rank regression coefficients (SRRC)
// ---------------------------------------------------------------------------

function standardize(arr) {
  const m = mean(arr);
  let s = 0;
  for (const v of arr) s += (v - m) * (v - m);
  const sd = Math.sqrt(s / arr.length);
  return Float64Array.from(arr, v => sd === 0 ? 0 : (v - m) / sd);
}

// Gaussian elimination with partial pivoting; A is an array of rows.
export function solveLinear(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    const pivot = M[c][c];
    if (pivot === 0) throw new RangeError("Singular system.");
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / pivot;
      if (f === 0) continue;
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}

// Regress rank(y) on the ranks of every column at once. Coefficients are in
// standard-deviation units; r2 is the share of rank variance explained by a
// monotone additive fit. A tiny ridge keeps near-collinear inputs solvable.
export function rankRegression(columns, y, {ridge = 1e-8} = {}) {
  const n = y.length, d = columns.length;
  const X = columns.map(c => standardize(ranks(c)));
  const yr = standardize(ranks(y));
  const A = Array.from({length: d}, () => new Array(d).fill(0));
  const b = new Array(d).fill(0);
  for (let j = 0; j < d; j++) {
    for (let k = j; k < d; k++) {
      let s = 0;
      for (let i = 0; i < n; i++) s += X[j][i] * X[k][i];
      A[j][k] = A[k][j] = s / n;
    }
    let s = 0;
    for (let i = 0; i < n; i++) s += X[j][i] * yr[i];
    b[j] = s / n;
    A[j][j] += ridge;
  }
  const beta = solveLinear(A, b);
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    let pred = 0;
    for (let j = 0; j < d; j++) pred += beta[j] * X[j][i];
    ssRes += (yr[i] - pred) ** 2;
  }
  return {coefficients: beta, r2: 1 - ssRes / n};
}

// ---------------------------------------------------------------------------
// Shapley effects from a single sample (nearest-neighbour conditional variances)
// ---------------------------------------------------------------------------

// Exact Shapley effects over all 2^d subsets. The cost function is the variance
// explained by a subset, c(u) = Var(Y) - E[Var(Y | X_u)], with the conditional
// variance estimated as the variance of y among each point's k nearest neighbours
// in rank-standardized X_u space (Broto, Bachoc & Depecker, 2020). Inputs may be
// dependent. The estimate is exploratory: neighbourhoods widen quickly with |u|,
// which overstates conditional variance for large subsets at modest n.
export function shapleyEffects(columns, y, {k = 10, names = null} = {}) {
  const d = columns.length, n = y.length;
  if (d < 1 || d > 14) throw new RangeError("Exact enumeration supports 1 to 14 inputs.");
  if (!Number.isInteger(k) || k < 2 || k > n) throw new RangeError("k must be an integer between 2 and n.");
  if (columns.some(c => c.length !== n)) throw new RangeError("Every column needs one value per draw.");
  const varY = variance(y);
  const U = columns.map(c => Float64Array.from(ranks(c), v => (v - 0.5) / n));
  const D = U.map(u => {
    const m = new Float32Array(n * n);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) m[i * n + j] = (u[i] - u[j]) ** 2;
    return m;
  });
  const acc = new Float64Array(n * n);
  const nSubsets = 1 << d;
  const cost = new Float64Array(nSubsets);
  const kdist = new Float64Array(k), kidx = new Int32Array(k);
  let prev = 0;
  for (let g = 1; g < nSubsets; g++) {
    const u = g ^ (g >> 1);
    const diff = u ^ prev;
    const bit = 31 - Math.clz32(diff);
    const m = D[bit];
    if (u & diff) for (let t = 0; t < n * n; t++) acc[t] += m[t];
    else for (let t = 0; t < n * n; t++) acc[t] -= m[t];
    let evar = 0;
    for (let i = 0; i < n; i++) {
      const base = i * n;
      let filled = 0;
      for (let j = 0; j < n; j++) {
        const dist = acc[base + j];
        if (filled === k && dist >= kdist[k - 1]) continue;
        let pos = filled < k ? filled : k - 1;
        while (pos > 0 && kdist[pos - 1] > dist) { kdist[pos] = kdist[pos - 1]; kidx[pos] = kidx[pos - 1]; pos--; }
        kdist[pos] = dist; kidx[pos] = j;
        if (filled < k) filled++;
      }
      let s = 0, s2 = 0;
      for (let t = 0; t < k; t++) { const v = y[kidx[t]]; s += v; s2 += v * v; }
      evar += (s2 - s * s / k) / (k - 1);
    }
    cost[u] = Math.max(0, varY - evar / n);
    prev = u;
  }
  const fact = [1];
  for (let i = 1; i <= d; i++) fact[i] = fact[i - 1] * i;
  const popcount = v => { let c = 0; while (v) { c += v & 1; v >>= 1; } return c; };
  const full = nSubsets - 1;
  const shapley = new Array(d).fill(0);
  for (let i = 0; i < d; i++) {
    for (let u = 0; u < nSubsets; u++) {
      if (u & (1 << i)) continue;
      const s = popcount(u);
      shapley[i] += fact[s] * fact[d - s - 1] / fact[d] * (cost[u | (1 << i)] - cost[u]);
    }
  }
  return {
    names, n, k, varY,
    explained: cost[full] / varY,
    shapley: shapley.map(v => v / varY),
    first: Array.from({length: d}, (_, i) => cost[1 << i] / varY),
    total: Array.from({length: d}, (_, i) => (cost[full] - cost[full ^ (1 << i)]) / varY)
  };
}

// Seeded subsample without replacement, for the quadratic-cost estimators above.
export function subsampleIndices(n, size, seed = 1) {
  if (size > n) throw new RangeError("Subsample larger than sample.");
  const rng = mulberry32(seed);
  const idx = Array.from({length: n}, (_, i) => i);
  for (let i = 0; i < size; i++) {
    const j = i + Math.floor(rng() * (n - i));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, size).sort((a, b) => a - b);
}

// ---------------------------------------------------------------------------
// The displayed inputs of the association chart, with the same activity rules
// on both pages. Each entry names the engine sample array it reads.
// ---------------------------------------------------------------------------

const DISPLAYED_INPUT_SPECS = [
  {key: "density",        name: "Cell Density (g/L)",                  sample: "density_samples",        kind: "primitive"},
  {key: "media_turnover", name: "Media-use multiplier (×)",            sample: "media_turnover_samples", kind: "primitive"},
  {key: "media_cost_L",   name: "Media $/L (incl. hydrolysate regime)", sample: "media_cost_L_samples",  kind: "mixture"},
  {key: "price_recf",     name: "GF Price ($/g, incl. regime)",        sample: "price_recf_samples",     kind: "mixture"},
  {key: "g_recf",         name: "GF Quantity (g/kg, incl. regime)",    sample: "g_recf_samples",         kind: "mixture"},
  {key: "maturity",       name: "Industry Maturity (latent — see note)", sample: "maturity_samples",     kind: "latent"},
  {key: "wacc",           name: "WACC (financing)",                    sample: "wacc_samples",           kind: "primitive"},
  {key: "asset_life",     name: "Asset Life (years)",                  sample: "asset_life_samples",     kind: "primitive"},
  {key: "plant_kta",      name: "Plant Capacity (kTA)",                sample: "plant_kta_samples",      kind: "primitive"},
  {key: "cycle_days",     name: "Effective production time (days)",   sample: "cycle_days_samples",     kind: "primitive"},
  {key: "uptime",         name: "Utilization Rate",                    sample: "uptime_samples",         kind: "primitive"}
];

// L/kg, "uses hydrolysates" and "has cheap GFs" are deliberately absent: L/kg is
// density × media-use multiplier, and the two regime switches are inside the
// Media $/L and GF bars. Replaced or disabled inputs are dropped rather than
// ranked as irrelevant random draws.
export function displayedInputs(results, params) {
  const p = {...DEFAULT_PARAMS, ...params};
  const mediaOverride = p.ep_media_p10 != null;
  const gfOverride = p.ep_gf_p10 != null;
  const capitalActive = !p.cdmo_mode && p.include_capex;
  const mediaVolumeActive = !mediaOverride || (p.gf_dose_model === "media_linked" && !gfOverride && !p.bundled_media);
  const active = {
    density: (p.media_use_model === "density" && mediaVolumeActive) || capitalActive,
    media_turnover: p.media_use_model === "density" && mediaVolumeActive,
    media_cost_L: !mediaOverride,
    price_recf: !p.bundled_media && !gfOverride,
    g_recf: !p.bundled_media && !gfOverride,
    maturity: p.dependence_mode === "shared",
    wacc: capitalActive, asset_life: capitalActive, cycle_days: capitalActive,
    plant_kta: capitalActive || (!p.cdmo_mode && p.include_fixed_opex),
    uptime: capitalActive || (!p.cdmo_mode && p.include_fixed_opex)
  };
  const out = DISPLAYED_INPUT_SPECS.filter(s => active[s.key]).map(s => ({key: s.key, name: s.name, kind: s.kind, data: results[s.sample]}));
  if (p.media_use_model === "direct" && mediaVolumeActive)
    out.push({key: "L_per_kg", name: "Fresh media (L/kg)", kind: "primitive", data: results.L_per_kg_samples});
  if (mediaOverride) out.push({key: "media_override", name: "Media cost override ($/kg)", kind: "override", data: results.cost_media});
  if (gfOverride && !p.bundled_media) out.push({key: "gf_override", name: "GF cost override ($/kg)", kind: "override", data: results.cost_recf});
  return out;
}

// ---------------------------------------------------------------------------
// Interventions: collapse one input to a point mass and re-run the engine.
// Only inputs the engine exposes as ranges can be pinned without changing the
// model's structure; the others would need engine changes.
// ---------------------------------------------------------------------------

export function interventionSpecs(params) {
  const p = {...DEFAULT_PARAMS, ...params};
  const specs = [];
  if (p.ep_density_p10 == null && !(p.media_use_model === "direct" && (p.cdmo_mode || !p.include_capex)))
    specs.push({key: "density", note: "Custom-prior override; removes the process-mode link to density but keeps the media-use multiplier's link.",
      set: v => ({ep_density_p10: v, ep_density_p50: v, ep_density_p90: v})});
  if (!p.cdmo_mode && (p.include_capex || p.include_fixed_opex))
    specs.push({key: "plant_kta", note: "Sets the p5 and p95 of plant capacity to the same value.",
      set: v => ({plant_kta_p5: v, plant_kta_p95: v})});
  if (!p.cdmo_mode && p.include_capex) {
    specs.push({key: "wacc", note: "Pins the sampled WACC; the maturity-linked ±3-point shift still applies.",
      set: v => ({wacc_p5: v, wacc_p95: v})});
    specs.push({key: "asset_life", note: "Sets the uniform range's endpoints to the same value.",
      set: v => ({asset_life_lo: v, asset_life_hi: v})});
  }
  if (p.media_use_model === "direct" && p.ep_media_p10 == null)
    specs.push({key: "L_per_kg", note: "Sets fresh media p5 and p95 to the same value.",
      set: v => ({fresh_media_p5: v, fresh_media_p95: v})});
  return specs;
}

// For each pinnable input: the conditional contrast at the tail set-points versus
// the contrast from actually setting the input to those values. Uses the same
// seed so that everything else is held draw for draw.
export function interventionContrasts(results, params, {n = 20000, seed = 42, tailFrac = 0.10, stat = {type: "mean"}} = {}) {
  const inputs = displayedInputs(results, params);
  const byKey = Object.fromEntries(inputs.map(i => [i.key, i]));
  return interventionSpecs(params).filter(s => byKey[s.key]).map(spec => {
    const input = byKey[spec.key];
    const {lo, hi} = tailMeans(input.data, tailFrac);
    const conditional = tailContrast(input.data, results.unit_cost, {tailFrac, stat});
    const rLo = simulate(n, seed, {...params, ...spec.set(lo)});
    const rHi = simulate(n, seed, {...params, ...spec.set(hi)});
    const intervention = summaryStat(rHi.unit_cost, stat) - summaryStat(rLo.unit_cost, stat);
    return {key: spec.key, name: input.name, lo, hi, conditional, intervention, note: spec.note,
      warnings: [...new Set([...rLo.warnings, ...rHi.warnings])]};
  });
}

// ---------------------------------------------------------------------------
// Advanced-page URL state -> engine parameters. Mirrors the simParams adapter in
// index.qmd so sensitivity.qmd can analyze a scenario shared from that page.
// ---------------------------------------------------------------------------

export function advancedUrlStateToParams(state = {}, maturityForYear) {
  const num = (k, d) => { const v = state[k]; if (v === undefined) return d; const x = Number(v); return Number.isFinite(x) ? x : d; };
  const bool = (k, d) => { const v = state[k]; if (v === undefined) return d; return v === true || v === "1" || v === "true"; };
  const choice = (k, d, options) => options.includes(state[k]) ? state[k] : d;
  const optional = k => { const v = state[k]; if (v === undefined || v === null || v === "") return null; const x = Number(v); return Number.isFinite(x) ? x : null; };
  const prior = key => {
    const lo = optional(`ep_${key}_p10`), mid = optional(`ep_${key}_p50`), hi = optional(`ep_${key}_p90`);
    const valid = lo != null && hi != null && lo > 0 && hi >= lo && (mid == null || (mid >= lo && mid <= hi));
    return valid ? {[`ep_${key}_p10`]: lo, [`ep_${key}_p50`]: mid, [`ep_${key}_p90`]: hi}
      : {[`ep_${key}_p10`]: null, [`ep_${key}_p50`]: null, [`ep_${key}_p90`]: null};
  };
  const simpleMode = bool("simpleMode", true);
  const target_year = num("target_year", 2036);
  const plant_capacity = num("plant_capacity", 20);
  return {
    ...DEFAULT_PARAMS,
    dependence_mode: choice("dependence_mode", DEFAULT_PARAMS.dependence_mode, ["shared", "independent_maturity"]),
    media_use_model: choice("media_use_model", DEFAULT_PARAMS.media_use_model, ["density", "direct"]),
    fresh_media_p5: num("fresh_media_p5", DEFAULT_PARAMS.fresh_media_p5),
    fresh_media_p95: num("fresh_media_p95", DEFAULT_PARAMS.fresh_media_p95),
    gf_dose_model: choice("gf_dose_model", DEFAULT_PARAMS.gf_dose_model, ["per_kg", "media_linked"]),
    gf_concentration_mg_L: num("gf_concentration_mg_L", DEFAULT_PARAMS.gf_concentration_mg_L),
    gf_cheap_dose_fraction: num("gf_cheap_dose_fraction", DEFAULT_PARAMS.gf_cheap_dose_fraction),
    target_year,
    plant_kta_p5: simpleMode ? 10 : plant_capacity * 0.5,
    plant_kta_p95: simpleMode ? 40 : plant_capacity * 2.0,
    uptime_mean: simpleMode ? 0.90 : num("uptime", 0.90),
    maturity_mean: maturityForYear(num("maturity", 0.5), target_year),
    p_hydro_mean: num("p_hydro", 0.75),
    p_recfactors_mean: num("p_recfactors", 0.5),
    p_supp_protein_mean: simpleMode ? 0.70 : num("p_supp_protein", 0.70),
    wacc_p5: simpleMode ? 0.08 : num("wacc_lo", 8) / 100,
    wacc_p95: simpleMode ? 0.20 : num("wacc_hi", 20) / 100,
    asset_life_lo: simpleMode ? 8 : num("asset_life_lo", 8),
    asset_life_hi: simpleMode ? 20 : num("asset_life_hi", 20),
    density_gL_p5: num("density_lo", 30),
    density_gL_p95: num("density_hi", 200),
    media_turnover_p5: simpleMode ? 0.5 : num("media_turnover_lo", 0.5),
    media_turnover_p95: simpleMode ? 3.0 : num("media_turnover_hi", 3.0),
    include_capex: simpleMode ? true : bool("include_capex", true),
    include_fixed_opex: simpleMode ? true : bool("include_fixed_opex", true),
    include_downstream: simpleMode ? false : bool("include_downstream", false),
    gf_progress: num("gf_progress", 50),
    cdmo_mode: bool("cdmo_mode", false),
    cdmo_toll_p5: num("cdmo_toll_p5", 4),
    cdmo_toll_p95: num("cdmo_toll_p95", 40),
    p_fedbatch: num("p_fedbatch", 0.20),
    p_perfusion: num("p_perfusion", 0.50),
    p_continuous: num("p_continuous", 0.30),
    override_mode_constraints: simpleMode ? false : bool("override_mode_constraints", false),
    bundled_media: simpleMode ? false : bool("bundled_media", false),
    bundled_media_p5: num("bundled_media_p5", 50),
    bundled_media_p95: num("bundled_media_p95", 500),
    ...prior("media"), ...prior("gf"), ...prior("density")
  };
}
