// Canonical browser model. Pure ESM: used by both Quarto views and Node tests.
// Parameter distributions are scenario assumptions, not a calibrated posterior.
export const MODEL_VERSION = "2026-10-26.3";
export const DEFAULT_PARAMS = Object.freeze({
  plant_kta_p5: 10, plant_kta_p95: 40, uptime_mean: 0.90,
  maturity_mean: 0.40, p_hydro_mean: 0.75, p_recfactors_mean: 0.50,
  p_supp_protein_mean: 0.70, wacc_p5: 0.08, wacc_p95: 0.20,
  asset_life_lo: 8, asset_life_hi: 20, density_gL_p5: 30, density_gL_p95: 200,
  media_turnover_p5: 0.5, media_turnover_p95: 3,
  p_fedbatch: 0.20, p_perfusion: 0.50, p_continuous: 0.30,
  gf_progress: 50, include_capex: true, include_fixed_opex: true,
  include_downstream: false, cdmo_mode: false, cdmo_toll_p5: 4, cdmo_toll_p95: 40,
  bundled_media: false, bundled_media_p5: 50, bundled_media_p95: 500,
  override_mode_constraints: false,
  ep_media_p10: null, ep_media_p90: null, ep_gf_p10: null, ep_gf_p90: null,
  ep_density_p10: null, ep_density_p90: null,
  ep_media_p50: null, ep_gf_p50: null, ep_density_p50: null,
  dependence_mode: "shared", media_use_model: "density",
  fresh_media_p5: 8, fresh_media_p95: 60,
  gf_dose_model: "per_kg", gf_concentration_mg_L: 0.102,
  gf_cheap_dose_fraction: 0.4,
  mode_selection: "mixture", p_feasible_perfusion: 0.70, p_feasible_continuous: 0.30,
  mode_choice_noise: 0,
  // Output basis. unit_cost stays per kg of wet biomass at solids_fraction; the
  // target-solids and protein views are extra outputs and leave it unchanged.
  solids_fraction: 0.20, target_solids_fraction: 0.275, protein_fraction_of_solids: 0.65,
  include_harvest_dewater: false, harvest_dewater_p5: 0.5, harvest_dewater_p95: 3.0,
  // media_use_model "yield": grams of cell solids per litre of medium consumed.
  nutrient_yield_p5: 3, nutrient_yield_p95: 25
});

// Review-driven structural alternatives. These are scenario choices, not new evidence.
export const REVIEW_PROVENANCE = Object.freeze({
  quantiles: "Report 5, Belief elicitation: preserve p10/p50/p90. Two-piece lognormal; tails remain assumed.",
  dependence: "Reports 5 and 6, dependence sensitivity. Independent maturity draws per channel retain each channel's marginal distribution; other process/accounting dependencies remain.",
  media: "Report 5, media identity critique. Direct fresh L/kg separates media throughput from harvest density. 8–60 L/kg p5–p95 is an illustrative stress range, not an elicited or fitted prior.",
  media_yield: "October 26, 2026 design decision; two independent reviewers argue medium used per kg depends on nutrient yield and is roughly invariant to density. L per wet kg = 1000 × solids fraction ÷ yield (g cell solids per L of medium consumed). 3–25 g/L p5–p95 is illustrative, chosen so that at 20% solids it implies about 8–67 L/kg, close to the direct stress range; not elicited or fitted.",
  gf: "Report 5, dosage coherence. GF g/kg = fresh L/kg × mg/L / 1000 × regime dose fraction. 0.102 mg/L reuses the earlier engine's formulation assumption; 0.4 is a rounded approximation to its cheap/expensive median-dose ratio, not a measured retention estimate.",
  basis: "October 26, 2026 design decision. Cost per wet kg is not a stable unit, so results are also reported per kg at a target solids content and per kg protein: × target/solids and ÷ (solids × protein share). 0.20 solids matches the 80%-water reference used in the CM_01 question; 0.275 is the midpoint of the 25–30% placeholder; 0.65 protein share of cell solids is an unverified placeholder. Recovery losses are not modeled.",
  harvest: "October 26, 2026 design decision. Harvest, washing and dewatering to the standard basis belong inside the estimate. The $0.50–3.00/kg p5–p95 range is a placeholder until values from the planned process model are available (see docs); off by default.",
  mode_selection: "October 2026 design discussion. Least-cost selection prices each world under every process mode and keeps the cheapest feasible one; fed-batch is the always-feasible fallback. Feasibility defaults 0.70/0.30 reproduce the 20/50/30 weights when modes are strictly ranked; they are not elicited. Noise β > 0 gives P(mode) ∝ cost^(−1/β). Mode-specific equipment, consumable and contamination costs are not modeled, so selection favors the least-specified modes."
});

export function gfPriceRanges(progress) {
  if (!Number.isFinite(progress) || progress < 0 || progress > 100)
    throw new RangeError("GF progress must be between 0 and 100.");
  const factor = Math.pow(0.01, progress / 100);
  return {cheap: [100 * factor, 10000 * factor], expensive: [5000 * factor, 500000 * factor]};
}

// A monotone transform of a standard normal, with separate log scales either side
// of its median. Equal quantiles deliberately allow point masses.
export function threeQuantileTransform(z, p10, p50, p90) {
  validateRange(p10, p90);
  if (!Number.isFinite(p50) || p50 < p10 || p50 > p90)
    throw new RangeError("Require 0 < p10 <= p50 <= p90.");
  const sigma = z < 0 ? Math.log(p50 / p10) / 1.2815515655446004
    : Math.log(p90 / p50) / 1.2815515655446004;
  return Math.exp(Math.log(p50) + sigma * z);
}

function sampleExpertPrior(rng, params, key, n) {
  const lo = params[`ep_${key}_p10`], mid = params[`ep_${key}_p50`], hi = params[`ep_${key}_p90`];
  if (mid == null) return sampleLognormalP10P90(rng, lo, hi, n);
  return Array.from({length: n}, () => threeQuantileTransform(boxMuller(rng), lo, mid, hi));
}

// Retains the Advanced view's existing scenario mapping; not a learning curve.
export function maturityForYear(maturity, year) {
  return maturity * (0.5 + 0.5 * Math.max(0, Math.min(1, (year - 2024) / 20)));
}

function validateRange(lo, hi) {
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo <= 0 || hi < lo)
    throw new RangeError("Uncertainty endpoints must be finite, positive, and ordered (low <= high).");
}

function adjustedAdoption(base, samples, maturity, strength) {
  // The UI's 0% and 100% choices are hard scenario settings.
  if (base === 0 || base === 1) return samples.map(() => base);
  return clip(samples.map((p, i) => p + strength * (maturity[i] - 0.5)), 0, 1);
}

// Separate streams keep unrelated draws identical when a component is toggled.
function namedStream(seed, name) {
  let hash = seed >>> 0;
  for (const char of name) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return mulberry32(hash >>> 0);
}

function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

// ============================================================
// STATISTICAL SAMPLING FUNCTIONS
// ============================================================

// Box-Muller transform for standard normal
function boxMuller(rng) {
  const u1 = 1 - rng();
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Sample from lognormal given p5 and p95
function sampleLognormalP5P95(rng, p5, p95, n) {
  validateRange(p5, p95);
  const Z_95 = 1.6448536269514722;
  const mu = (Math.log(p5) + Math.log(p95)) / 2;
  const sigma = (Math.log(p95) - Math.log(p5)) / (2 * Z_95);

  const samples = new Array(n);
  for (let i = 0; i < n; i++) {
    samples[i] = Math.exp(mu + sigma * boxMuller(rng));
  }
  return samples;
}

// Like sampleLognormalP5P95 but takes an 80% CI (p10/p90) — matches the beliefs form.
function sampleLognormalP10P90(rng, p10, p90, n) {
  validateRange(p10, p90);
  const Z_90 = 1.2815515655446004;
  const mu = (Math.log(p10) + Math.log(p90)) / 2;
  const sigma = (Math.log(p90) - Math.log(p10)) / (2 * Z_90);
  const samples = new Array(n);
  for (let i = 0; i < n; i++) samples[i] = Math.exp(mu + sigma * boxMuller(rng));
  return samples;
}

// Sample uniform
function sampleUniform(rng, lo, hi, n) {
  const samples = new Array(n);
  for (let i = 0; i < n; i++) {
    samples[i] = lo + (hi - lo) * rng();
  }
  return samples;
}

// Beta distribution parameters from mean/stdev
function betaFromMeanStdev(mean, stdev) {
  let variance = stdev * stdev;
  const maxVar = mean * (1 - mean);
  if (variance <= 0 || variance >= maxVar) {
    stdev = Math.sqrt(maxVar * 0.99);
    variance = stdev * stdev;
  }
  const t = maxVar / variance - 1;
  const a = mean * t;
  const b = (1 - mean) * t;
  return [a, b];
}

// Compute the gamma ratio in log space to avoid underflow near beta boundaries.
function sampleBeta(rng, a, b) {
  const logGamma = shape => shape < 1
    ? Math.log(sampleGamma(rng, shape + 1)) + Math.log(1 - rng()) / shape
    : Math.log(sampleGamma(rng, shape));
  const delta = logGamma(b) - logGamma(a);
  return delta > 0 ? Math.exp(-delta) / (1 + Math.exp(-delta)) : 1 / (1 + Math.exp(delta));
}

// Sample from gamma distribution (Marsaglia and Tsang's method)
function sampleGamma(rng, shape) {
  if (shape < 1) {
    return sampleGamma(rng, shape + 1) * Math.pow(rng(), 1 / shape);
  }

  const d = shape - 1/3;
  const c = 1 / Math.sqrt(9 * d);

  while (true) {
    let x, v;
    do {
      x = boxMuller(rng);
      v = 1 + c * x;
    } while (v <= 0);

    v = v * v * v;
    const u = rng();

    if (u < 1 - 0.0331 * (x * x) * (x * x)) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

// Sample from beta given mean/stdev
function sampleBetaMeanStdev(rng, mean, stdev, n) {
  // Guard: Beta is undefined at the boundaries (mean=0 or mean=1).
  // betaFromMeanStdev returns NaN params → sampleBeta returns NaN →
  // rng() < NaN is always false, silently flipping boolean outcomes.
  // E.g. p_recf_mean=1.0 (slider at 100%) → all treated as expensive GF.
  if (mean <= 0) return new Array(n).fill(0);
  if (mean >= 1) return new Array(n).fill(1);
  if (stdev === 0) return new Array(n).fill(mean);
  const [a, b] = betaFromMeanStdev(mean, stdev);
  const samples = new Array(n);
  for (let i = 0; i < n; i++) {
    samples[i] = sampleBeta(rng, a, b);
  }
  return samples;
}

// Capital Recovery Factor
function crf(wacc, nYears) {
  if (wacc === 0) return 1 / nYears;
  return wacc / -Math.expm1(-nYears * Math.log1p(wacc));
}

// Clip values between min and max
function clip(arr, min, max) {
  return arr.map(v => Math.min(Math.max(v, min), max));
}

// Element-wise operations
function add(a, b) { return a.map((v, i) => v + b[i]); }
function mul(a, b) { return a.map((v, i) => v * b[i]); }
function div(a, b) { return a.map((v, i) => v / b[i]); }
function scale(arr, s) { return arr.map(v => v * s); }

// ============================================================
// MAIN SIMULATION FUNCTION
// ============================================================

const PROCESS_MODES = ["fedbatch", "perfusion", "continuous"];

// "mixture" (baseline) draws each world's process mode from the weights.
// "least_cost" prices every world under each mode and keeps the feasible one
// with the lowest unit cost; the weights are then unused.
function simulate(n, seed, params = {}) {
  params = {...DEFAULT_PARAMS, ...params};
  if (!["mixture", "least_cost"].includes(params.mode_selection))
    throw new RangeError(`Unknown mode_selection: ${params.mode_selection}`);
  for (const key of ["p_feasible_perfusion", "p_feasible_continuous"]) {
    if (!Number.isFinite(params[key]) || params[key] < 0 || params[key] > 1)
      throw new RangeError(`${key} must be between 0 and 1.`);
  }
  if (!Number.isFinite(params.mode_choice_noise) || params.mode_choice_noise < 0)
    throw new RangeError("Mode choice noise must be finite and nonnegative.");
  if (params.mode_selection === "mixture") return simulateDrawnMode(n, seed, params);
  if (params.override_mode_constraints) {
    const r = simulateDrawnMode(n, seed, params);
    r.warnings.push("Least-cost mode selection ignored: process-mode constraints are overridden.");
    return r;
  }
  return selectLeastCostMode(n, seed, params);
}

// The three runs share every named stream, and the process stream pre-draws
// density and media use for all modes, so run k is each world priced under mode k.
// Fed-batch is always feasible. With Gumbel noise of scale β on log cost,
// P(mode k) = c_k^(-1/β) / Σ over feasible j of c_j^(-1/β): the relative-cost
// logit used for technology shares in GCAM. β = 0 is strict least cost.
function selectLeastCostMode(n, seed, params) {
  const runs = PROCESS_MODES.map(mode => simulateDrawnMode(n, seed, {...params,
    ...Object.fromEntries(PROCESS_MODES.map(m => [`p_${m}`, +(m === mode)]))}));
  let rng = namedStream(seed, "mode-feasibility");
  const feasible = [new Array(n).fill(true),
    sampleUniform(rng, 0, 1, n).map(u => u < params.p_feasible_perfusion),
    sampleUniform(rng, 0, 1, n).map(u => u < params.p_feasible_continuous)];
  rng = namedStream(seed, "mode-choice");
  // Drawn at every β so that changing β leaves all other draws unchanged.
  const gumbel = PROCESS_MODES.map(() => sampleUniform(rng, 0, 1, n)
    .map(u => -Math.log(-Math.log(Math.min(Math.max(u, 1e-12), 1 - 1e-12)))));
  const beta = params.mode_choice_noise;
  const chosen = new Array(n);
  let binding = 0, notCheapestFeasible = 0;
  for (let i = 0; i < n; i++) {
    let best = 0, bestScore = Infinity, cheapest = 0, cheapestAny = 0;
    for (let k = 0; k < PROCESS_MODES.length; k++) {
      const cost = runs[k].unit_cost[i];
      if (cost < runs[cheapestAny].unit_cost[i]) cheapestAny = k;
      if (!feasible[k][i]) continue;
      if (cost < runs[cheapest].unit_cost[i]) cheapest = k;
      const score = Math.log(cost) - beta * gumbel[k][i];
      if (score < bestScore) { bestScore = score; best = k; }
    }
    chosen[i] = best;
    if (!feasible[cheapestAny][i]) binding++;
    if (best !== cheapest) notCheapestFeasible++;
  }
  const out = {...runs[0]};
  for (const [key, value] of Object.entries(runs[0])) {
    if (Array.isArray(value) && value.length === n) out[key] = value.map((_, i) => runs[chosen[i]][key][i]);
  }
  const share = k => chosen.filter(c => c === k).length / n;
  return {...out,
    effective_params: params,
    warnings: [...new Set(runs.flatMap(r => r.warnings))],
    mode_is_override: false,
    pct_fedbatch: share(0), pct_perfusion: share(1), pct_continuous: share(2),
    mode_selection_stats: {
      feasible_share: Object.fromEntries(PROCESS_MODES.map((m, k) => [m, feasible[k].filter(Boolean).length / n])),
      // Worlds whose cheapest mode overall is infeasible, so feasibility decides the choice.
      feasibility_binding_share: binding / n,
      // Worlds where decision noise picks a feasible mode other than the cheapest.
      not_cheapest_feasible_share: notCheapestFeasible / n
    }};
}

function simulateDrawnMode(n, seed, params) {
  if (!Number.isInteger(n) || n < 1) throw new RangeError("Sample count must be a positive integer.");
  for (const key of ["maturity_mean", "uptime_mean", "p_hydro_mean", "p_recfactors_mean", "p_supp_protein_mean"]) {
    if (!Number.isFinite(params[key]) || params[key] < 0 || params[key] > 1)
      throw new RangeError(`${key} must be between 0 and 1.`);
  }
  if (params.uptime_mean === 0) throw new RangeError("Positive utilization is required for a cost per kg.");
  if (!Number.isFinite(params.gf_progress) || params.gf_progress < 0 || params.gf_progress > 100)
    throw new RangeError("GF progress must be between 0 and 100.");
  validateRange(params.asset_life_lo, params.asset_life_hi);
  for (const [key, choices] of Object.entries({dependence_mode: ["shared", "independent_maturity"], media_use_model: ["density", "direct", "yield"], gf_dose_model: ["per_kg", "media_linked"]})) {
    if (!choices.includes(params[key])) throw new RangeError(`Unknown ${key}: ${params[key]}`);
  }
  validateRange(params.fresh_media_p5, params.fresh_media_p95);
  for (const key of ["solids_fraction", "target_solids_fraction", "protein_fraction_of_solids"]) {
    if (!Number.isFinite(params[key]) || params[key] <= 0 || params[key] > 1)
      throw new RangeError(`${key} must be above 0 and at most 1.`);
  }
  if (params.include_harvest_dewater) validateRange(params.harvest_dewater_p5, params.harvest_dewater_p95);
  if (params.media_use_model === "yield") validateRange(params.nutrient_yield_p5, params.nutrient_yield_p95);
  if (!Number.isFinite(params.gf_concentration_mg_L) || params.gf_concentration_mg_L < 0
      || !Number.isFinite(params.gf_cheap_dose_fraction) || params.gf_cheap_dose_fraction < 0 || params.gf_cheap_dose_fraction > 1)
    throw new RangeError("GF concentration must be nonnegative and dose fraction between 0 and 1.");
  for (const key of ["media", "gf", "density"]) {
    const lo = params[`ep_${key}_p10`], mid = params[`ep_${key}_p50`], hi = params[`ep_${key}_p90`];
    if ([lo, mid, hi].every(v => v == null)) continue;
    validateRange(lo, hi);
    if (mid != null) threeQuantileTransform(0, lo, mid, hi);
  }
  const warnings = [];
  const modeKeys = ["p_fedbatch", "p_perfusion", "p_continuous"];
  if (modeKeys.some(k => !Number.isFinite(params[k]) || params[k] < 0))
    throw new RangeError("Process weights must be finite and nonnegative.");
  if (modeKeys.every(k => params[k] === 0)) {
    modeKeys.forEach(k => { params[k] = DEFAULT_PARAMS[k]; });
    warnings.push("All process weights were zero; using 20% fed-batch, 50% perfusion, 30% continuous.");
  }
  let rng = namedStream(seed, "maturity");

  // Latent maturity factor
  const maturity = sampleBetaMeanStdev(rng, params.maturity_mean, 0.20, n);
  // Independent channel factors keep the same Beta marginal, including the mean
  // shift and clipping. Setting coefficients to zero would also change marginals.
  const maturityChannel = name => params.dependence_mode === "shared" ? maturity
    : sampleBetaMeanStdev(namedStream(seed, `maturity-${name}`), params.maturity_mean, 0.20, n);
  const hydroMaturity = maturityChannel("hydro"), gfMaturity = maturityChannel("gf");
  const suppMaturity = maturityChannel("supp"), financeMaturity = maturityChannel("finance");
  const equipmentMaturity = maturityChannel("equipment");

  rng = namedStream(seed, "scale");
  // Scale and uptime
  const plant_kta = sampleLognormalP5P95(rng, params.plant_kta_p5, params.plant_kta_p95, n);
  const uptime = sampleBetaMeanStdev(rng, params.uptime_mean, 0.05, n);
  const nameplate_kgpy = scale(plant_kta, 1e6);
  const output_kgpy = mul(nameplate_kgpy, uptime);

  rng = namedStream(seed, "adoption");
  // Adoption probabilities (maturity-adjusted)
  let p_hydro = sampleBetaMeanStdev(rng, params.p_hydro_mean, 0.10, n);
  p_hydro = adjustedAdoption(params.p_hydro_mean, p_hydro, hydroMaturity, 0.25);

  let p_recf = sampleBetaMeanStdev(rng, params.p_recfactors_mean, 0.15, n);
  p_recf = adjustedAdoption(params.p_recfactors_mean, p_recf, gfMaturity, 0.25);

  // Bernoulli draws for adoption
  const is_hydro = p_hydro.map(p => rng() < p);
  const is_recf_cheap = p_recf.map(p => rng() < p);

  rng = namedStream(seed, "process");
  // Mode-specific scenario distributions are soft priors, not feasibility bounds.
  // cycle_days is an effective biomass replacement time; continuous processes
  // still need a mechanistic productivity/bleed-rate model.
  const cycle_days = sampleLognormalP5P95(rng, 0.5, 5.0, n);

  let density_gL, media_turnover, mode_labels;
  if (params.override_mode_constraints) {
    // Expert override: use manually specified density and turnover ranges directly.
    density_gL = sampleLognormalP5P95(rng, params.density_gL_p5, params.density_gL_p95, n);
    media_turnover = sampleLognormalP5P95(rng, params.media_turnover_p5, params.media_turnover_p95, n);
    mode_labels = new Array(n).fill("override");
  } else {
    // Default: sample process mode per run, then draw density and turnover from that
    // mode's range. Pre-generate all six arrays (vectorized) for performance.
    const p_total = params.p_fedbatch + params.p_perfusion + params.p_continuous;
    const p0  = params.p_fedbatch / p_total;
    const p01 = p0 + params.p_perfusion / p_total;
    const d_fb = sampleLognormalP5P95(rng, 5, 30, n);    // Fed-batch density
    const d_pf = sampleLognormalP5P95(rng, 30, 150, n);  // Perfusion density
    const d_ct = sampleLognormalP5P95(rng, 50, 200, n);  // Continuous density
    const t_fb = sampleLognormalP5P95(rng, 1.0, 2.0, n); // Fed-batch media-use multiplier
    const t_pf = sampleLognormalP5P95(rng, 1.0, 5.0, n); // Perfusion media-use multiplier
    const t_ct = sampleLognormalP5P95(rng, 0.5, 3.0, n); // Continuous media-use multiplier
    const mode_rand = sampleUniform(rng, 0, 1, n);
    mode_labels = mode_rand.map(r => r < p0 ? "fedbatch" : r < p01 ? "perfusion" : "continuous");
    density_gL    = mode_labels.map((m, i) =>
      m === "fedbatch" ? d_fb[i] : m === "perfusion" ? d_pf[i] : d_ct[i]);
    media_turnover = mode_labels.map((m, i) =>
      m === "fedbatch" ? t_fb[i] : m === "perfusion" ? t_pf[i] : t_ct[i]);
  }

  rng = namedStream(seed, "density-override");
  // Expert prior override: cell density — must precede L_per_kg so CAPEX also sees it
  if (params.ep_density_p10 != null) {
    density_gL = sampleExpertPrior(rng, params, "density", n);
  }

  // "yield": medium consumed per kg follows from how much cell solids the nutrients
  // in a litre support, independent of how concentrated the cells are at harvest.
  const nutrient_yield = params.media_use_model === "yield"
    ? sampleLognormalP5P95(namedStream(seed, "nutrient-yield"), params.nutrient_yield_p5, params.nutrient_yield_p95, n)
    : null;
  const L_per_kg = params.media_use_model === "direct"
    ? sampleLognormalP5P95(namedStream(seed, "fresh-media"), params.fresh_media_p5, params.fresh_media_p95, n)
    : params.media_use_model === "yield"
    ? nutrient_yield.map(y => 1000 * params.solids_fraction / y)
    : mul(div(density_gL.map(_ => 1000), density_gL), media_turnover);

  rng = namedStream(seed, "media");
  // Media cost ($/L of basal media, including vitamins/minerals/trace salts,
  // excluding growth factors and supplemental recombinant proteins)
  // Basal micronutrients (vitamins, minerals, trace salts) are NOT modeled as a
  // separate line item — O'Neill et al. (2021) note vitamin sourcing is a "less
  // pressing issue" and required minerals can be obtained relatively inexpensively,
  // so they are rolled into media $/L alongside amino acids and glucose.
  // Hydrolysate-based: $0.20-1.20/L (O'Neill et al. 2021; Humbird 2021 hydrolysate estimate)
  const media_cost_hydro = sampleLognormalP5P95(rng, 0.2, 1.2, n);
  // Pharma-grade: $0.50-2.50/L — REVISED downward from $1.00-4.00
  // Rationale: GFI amino acid supply chain report (Dec 2025), based on real supplier quotes,
  // found Humbird's amino acid prices overestimated by 2-10x. Since amino acids are the
  // dominant basal media cost component (~60-80%), this substantially lowers the pharma range.
  // Previous range ($1-4) was anchored on Humbird's Table 3.4 values.
  const media_cost_pharma = sampleLognormalP5P95(rng, 0.5, 2.5, n);
  const media_cost_L = is_hydro.map((h, i) => h ? media_cost_hydro[i] : media_cost_pharma[i]);
  const cost_media = mul(L_per_kg, media_cost_L);

  rng = namedStream(seed, "growth-factors");
  // Recombinant growth factors (FGF-2, IGF-1, TGF-β, etc.)
  // CRITICAL: Literature shows GFs can be 55-95% of media cost at current prices
  // Current prices: FGF-2 ~$50,000/g, TGF-β up to $1M/g
  // Target prices: $1-10/g with scaled recombinant production

  // Quantity (g/kg meat) — derived from cited medium concentrations × media-use assumptions.
  // Humbird formulation reproduced in GFI 2023 recombinant-protein report:
  //   FGF 1.0e-4 g/L, TGFβ 2.0e-6 g/L → true-GF total ≈ 1.02e-4 g/L.
  // Efficient future scenarios in GFI 2023 assume ≈8–13 L media/kg product;
  // less-optimized processes may use up to ~60 L/kg (matching our L_per_kg range).
  //   0.102 mg/L × 8 L/kg  ≈ 0.00082 g/kg
  //   0.102 mg/L × 13 L/kg ≈ 0.00133 g/kg
  //   0.102 mg/L × 60 L/kg ≈ 0.00612 g/kg
  // Pasitka et al. (2024) ACF TEA implies ≈0.00187 g GF/kg wet biomass — inside this band.
  // Previous ranges (0.0001–0.02 g/kg) were too broad on both tails; tightened below.
  // Expensive regime: Humbird formulation across the full media-use range (no breakthrough).
  const g_recf_exp = sampleLognormalP5P95(rng, 1e-3, 6e-3, n);
  // Cheap regime: breakthrough technologies (thermostable FGF2-G3, autocrine lines,
  // recycling systems, polyphenol substitution) reduce effective per-kg usage ~3×.
  const g_recf_cheap = sampleLognormalP5P95(rng, 5e-4, 2e-3, n);
  const g_recf = is_recf_cheap.map((c, i) => params.gf_dose_model === "media_linked"
    ? L_per_kg[i] * params.gf_concentration_mg_L / 1000 * (c ? params.gf_cheap_dose_fraction : 1)
    : c ? g_recf_cheap[i] : g_recf_exp[i]);

  // Price ($/g) - Scaled by gf_progress parameter (0-100%)
  // At 0% progress: current prices ($5k-500k expensive, $100-10k cheap)
  // At 100% progress: target prices ($50-5k expensive, $1-100 cheap)
  const priceRanges = gfPriceRanges(params.gf_progress);

  // Interpolate price ranges based on progress
  // Cheap scenario: $100-10,000 at 0% → $1-100 at 100%
  const [cheap_p5, cheap_p95] = priceRanges.cheap;
  const price_recf_cheap = sampleLognormalP5P95(rng, cheap_p5, cheap_p95, n);

  // Expensive scenario: $5,000-500,000 at 0% → $50-5,000 at 100%
  const [exp_p5, exp_p95] = priceRanges.expensive;
  const price_recf_exp = sampleLognormalP5P95(rng, exp_p5, exp_p95, n);

  const price_recf = is_recf_cheap.map((c, i) => c ? price_recf_cheap[i] : price_recf_exp[i]);
  const cost_recf = mul(g_recf, price_recf);

  rng = namedStream(seed, "supplemental-proteins");
  // Supplemental recombinant proteins: albumin, transferrin, insulin
  // These are distinct from growth factors (FGF/IGF/TGF-β) — they are grouped separately for
  // cost accounting; insulin also has signalling functions. GFI 2024 supply-chain
  // analysis projects albumin alone to be 96.6% of anticipated recombinant protein
  // production volume for CM. Cost depends on whether food-grade production at scale
  // (recombinant albumin from yeast, etc.) replaces pharma-grade sourcing.
  // Cheap regime: food-grade recombinant at scale → p5=$0.03/kg, p95=$0.60/kg cell mass
  // Exp. regime:  pharma-grade → p5=$0.50/kg, p95=$4.00/kg cell mass
  let p_supp = sampleBetaMeanStdev(rng, params.p_supp_protein_mean, 0.12, n);
  p_supp = adjustedAdoption(params.p_supp_protein_mean, p_supp, suppMaturity, 0.20);
  const is_supp_cheap = p_supp.map(p => rng() < p);
  const supp_cheap_cost = sampleLognormalP5P95(rng, 0.03, 0.60, n);
  const supp_exp_cost   = sampleLognormalP5P95(rng, 0.50, 4.00, n);
  let cost_supp_protein = is_supp_cheap.map((c, i) => c ? supp_cheap_cost[i] : supp_exp_cost[i]);

  rng = namedStream(seed, "other-variable");
  // Other variable costs (utilities, consumables, small-molecule additives)
  // Reduced from p5=0.5/p95=5.0 — supplemental proteins now have their own term above
  const other_var = sampleLognormalP5P95(rng, 0.30, 3.0, n);

  rng = namedStream(seed, "bundled-media");
  // Bundled media override (advanced full-view mode): replaces the separable basal+GF
  // structure with a single complete-medium $/L figure, matching the convention used in
  // sources that explicitly quote complete medium, including all proteins.
  // Independent component streams preserve other costs across accounting switches.
  let cost_media_eff = cost_media;
  let cost_recf_eff = cost_recf;
  let media_cost_L_eff = media_cost_L;
  if (params.bundled_media) {
    const complete_media_L = sampleLognormalP5P95(rng, params.bundled_media_p5, params.bundled_media_p95, n);
    cost_media_eff  = mul(L_per_kg, complete_media_L);
    cost_recf_eff   = new Array(n).fill(0);
    cost_supp_protein = new Array(n).fill(0);
    media_cost_L_eff = complete_media_L;
  }

  // In bundled mode a media override means complete medium; no separate proteins.
  // These bypass the regime-switching logic and express direct beliefs in $/kg biomass.
  if (params.ep_media_p10 != null) {
    rng = namedStream(seed, "media-override");
    cost_media_eff = sampleExpertPrior(rng, params, "media", n);
  }
  if (params.bundled_media && params.ep_gf_p10 && params.ep_gf_p90)
    warnings.push("Separate growth-factor override ignored: complete medium already includes all proteins.");
  if (!params.bundled_media && params.ep_gf_p10 != null) {
    rng = namedStream(seed, "gf-override");
    cost_recf_eff = sampleExpertPrior(rng, params, "gf", n);
  }
  if (params.media_use_model !== "density" && params.ep_media_p10 != null)
    warnings.push("Direct media cost prior overrides fresh L/kg for media cost; fresh L/kg still affects media-linked GF dosage when active.");
  if (params.gf_dose_model === "media_linked" && (params.bundled_media || params.ep_gf_p10 != null))
    warnings.push("Media-linked GF dosage has no cost effect: complete medium or a direct GF cost prior takes precedence.");

  // VOC total: media + growth factors + supplemental proteins + other
  const voc = add(add(add(cost_media_eff, cost_recf_eff), cost_supp_protein), other_var);

  rng = namedStream(seed, "cdmo");
  // CDMO mode: replace CAPEX + Fixed OPEX with a contract toll fee ($/kg)
  // The toll covers the CDMO's amortized capital, labor, overhead, and margin.
  // VOC (media, GFs) remain as direct company costs.
  let cdmo_toll_perkg = new Array(n).fill(0);
  if (params.cdmo_mode) {
    cdmo_toll_perkg = sampleLognormalP5P95(rng, params.cdmo_toll_p5, params.cdmo_toll_p95, n);
  }

  rng = namedStream(seed, "finance");
  // CAPEX calculation (skipped in CDMO mode — CDMO bears the capital)
  let capex_perkg = new Array(n).fill(0);
  // Pre-allocate WACC and asset-life sample arrays so they exist for the
  // tornado chart even when CAPEX is excluded (in those cases they're
  // sampled here purely for the sensitivity export, with no cost effect).
  let wacc_samples_out = sampleLognormalP5P95(rng, params.wacc_p5, params.wacc_p95, n);
  wacc_samples_out = clip(wacc_samples_out.map((w, i) => w - 0.03 * (financeMaturity[i] - 0.5)), 0.03, 1);
  let asset_life_samples_out = sampleUniform(rng, params.asset_life_lo, params.asset_life_hi, n);
  if (!params.cdmo_mode && params.include_capex) {
    rng = namedStream(seed, "capex");
    const prod_kg_L_day = div(scale(density_gL, 1/1000), cycle_days);
    const total_working_volume_L = div(nameplate_kgpy, scale(prod_kg_L_day, 365));
    const reactor_cost_L_pharma = sampleLognormalP5P95(rng, 50, 500, n);
    const custom_ratio = sampleUniform(rng, 0.35, 0.85, n);
    let custom_share = sampleBetaMeanStdev(rng, 0.55, 0.15, n);
    custom_share = clip(add(custom_share, scale(equipmentMaturity.map(m => m - 0.5), 0.30)), 0, 1);

    const reactor_cost_L_avg = reactor_cost_L_pharma.map((p, i) =>
      p * (custom_share[i] * custom_ratio[i] + (1 - custom_share[i]))
    );

    const capex_s = sampleUniform(rng, 0.6, 0.9, n);
    const plant_factor = sampleLognormalP5P95(rng, 1.5, 3.5, n);
    const V_ref = 1e6;

    const capex_total = reactor_cost_L_avg.map((r, i) =>
      r * total_working_volume_L[i] * Math.pow(total_working_volume_L[i] / V_ref, capex_s[i] - 1) * plant_factor[i]
    );

    // Re-use the pre-sampled wacc/asset_life so the tornado chart has access
    // to the realized values regardless of CAPEX inclusion.
    const wacc = wacc_samples_out;
    const asset_life = asset_life_samples_out;
    const crf_val = wacc.map((w, i) => crf(w, asset_life[i]));

    capex_perkg = capex_total.map((c, i) => (c * crf_val[i]) / output_kgpy[i]);
  }

  rng = namedStream(seed, "fixed");
  // Fixed OPEX calculation (skipped in CDMO mode — CDMO bears overhead)
  let fixed_perkg = new Array(n).fill(0);
  if (!params.cdmo_mode && params.include_fixed_opex) {
    const ref_output = 20e6 * 0.9;
    const fixed_perkg_ref = sampleUniform(rng, 1.0, 6.0, n);
    const fixed_annual_ref = scale(fixed_perkg_ref, ref_output);
    const fixed_scale = sampleUniform(rng, 0.6, 1.0, n);

    const fixed_annual = fixed_annual_ref.map((f, i) =>
      f * Math.pow(nameplate_kgpy[i] / 20e6, fixed_scale[i])
    );
    fixed_perkg = div(fixed_annual, output_kgpy);
  }

  rng = namedStream(seed, "downstream");
  // Downstream processing (scaffolding, texturization) for structured products
  let downstream_perkg = new Array(n).fill(0);
  if (params.include_downstream) {
    // Downstream adds $2-15/kg for structured products
    downstream_perkg = sampleLognormalP5P95(rng, 2.0, 15.0, n);
  }

  rng = namedStream(seed, "harvest-dewater");
  // Harvest, washing and dewatering to the standard basis: inside the estimate,
  // unlike forming/texturization above. Placeholder range; see REVIEW_PROVENANCE.harvest.
  let harvest_perkg = new Array(n).fill(0);
  if (params.include_harvest_dewater) {
    harvest_perkg = sampleLognormalP5P95(rng, params.harvest_dewater_p5, params.harvest_dewater_p95, n);
  }

  // Total unit cost
  const unit_cost = add(add(add(add(add(voc, capex_perkg), fixed_perkg), cdmo_toll_perkg), downstream_perkg), harvest_perkg);
  // A kg at the target basis needs target/solids wet kg; a wet kg holds solids × protein share of protein.
  const target_solids_factor = params.target_solids_fraction / params.solids_fraction;
  const protein_factor = 1 / (params.solids_fraction * params.protein_fraction_of_solids);

  return {
    unit_cost,
    model_version: MODEL_VERSION,
    seed, sample_count: n,
    provenance: REVIEW_PROVENANCE,
    effective_params: params,
    warnings,
    cost_media: cost_media_eff,
    cost_recf: cost_recf_eff,
    cost_supp_protein,
    cost_other_var: other_var,
    cost_capex: capex_perkg,
    cost_fixed: fixed_perkg,
    cost_cdmo_toll: cdmo_toll_perkg,
    cost_downstream: downstream_perkg,
    cost_harvest: harvest_perkg,
    unit_cost_target_solids: scale(unit_cost, target_solids_factor),
    unit_cost_protein: scale(unit_cost, protein_factor),
    basis_factors: {target_solids: target_solids_factor, protein: protein_factor},
    pct_hydro: is_hydro.filter(x => x).length / n,
    pct_recf_cheap: is_recf_cheap.filter(x => x).length / n,
    // Process mode realized shares — stored as scalars (not the full 30k string array)
    // to keep OJS reactive graph lightweight
    mode_is_override: mode_labels[0] === "override",
    pct_fedbatch:  mode_labels.filter(m => m === "fedbatch").length  / n,
    pct_perfusion: mode_labels.filter(m => m === "perfusion").length / n,
    pct_continuous: mode_labels.filter(m => m === "continuous").length / n,
    mode_selection_stats: null,
    // Input parameters for sensitivity analysis
    maturity_samples: maturity,
    density_samples: density_gL,
    media_turnover_samples: media_turnover,
    L_per_kg_samples: L_per_kg,
    nutrient_yield_samples: nutrient_yield,
    media_cost_L_samples: media_cost_L_eff,
    is_hydro_samples: is_hydro.map(x => x ? 1 : 0),
    is_recf_cheap_samples: is_recf_cheap.map(x => x ? 1 : 0),
    g_recf_samples: g_recf,
    price_recf_samples: price_recf,
    plant_kta_samples: plant_kta,
    uptime_samples: uptime,
    cycle_days_samples: cycle_days,
    wacc_samples: wacc_samples_out,
    asset_life_samples: asset_life_samples_out
  };
}

// Statistical helpers
function quantile(arr, q) {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = (sorted.length - 1) * q;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  const frac = idx - lo;
  return sorted[lo] * (1 - frac) + sorted[hi] * frac;
}

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// Conditional-mean dollar swing.
// Signed $/kg difference between mean(uc) among samples where `paramArr`
// is in its top tail and mean(uc) among samples where it is in its bottom tail.
// Sign: positive → parameter increases cost; negative → decreases cost.
// This is an association statistic under the joint sampling distribution —
// it honors latent-variable propagation (e.g. maturity → hydrolysate adoption)
// but can overlap across correlated parameters and should not be summed.
function conditionalSwing(paramArr, uc, tailFrac = 0.10) {
  const n = paramArr.length;
  if (paramArr.every(v => v === paramArr[0])) return 0;
  const paired = paramArr.map((p, i) => [p, uc[i]]).sort((a, b) => a[0] - b[0]);
  const tailCount = Math.max(1, Math.floor(n * tailFrac));
  let loSum = 0, hiSum = 0;
  for (let i = 0; i < tailCount; i++) loSum += paired[i][1];
  for (let i = n - tailCount; i < n; i++) hiSum += paired[i][1];
  return (hiSum - loSum) / tailCount; // $/kg, signed
}

// Spearman rank correlation coefficient (retained for reference; not currently plotted)
function spearmanCorr(x, y) {
  const n = x.length;

  // Rank function (handles ties with average rank)
  function rank(arr) {
    const sorted = arr.map((v, i) => ({v, i})).sort((a, b) => a.v - b.v);
    const ranks = new Array(n);
    let i = 0;
    while (i < n) {
      let j = i;
      while (j < n - 1 && sorted[j + 1].v === sorted[j].v) j++;
      const avgRank = (i + j) / 2 + 1;
      for (let k = i; k <= j; k++) ranks[sorted[k].i] = avgRank;
      i = j + 1;
    }
    return ranks;
  }

  const rx = rank(x);
  const ry = rank(y);

  // Pearson correlation of ranks
  const meanRx = mean(rx);
  const meanRy = mean(ry);

  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = rx[i] - meanRx;
    const dy = ry[i] - meanRy;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  return num / Math.sqrt(denX * denY);
}
export {simulate, quantile, mean, conditionalSwing, spearmanCorr, crf, sampleBetaMeanStdev, sampleLognormalP5P95, mulberry32};
