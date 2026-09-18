// node scripts/review-robustness.mjs > dashboard/review-2026-09-17-audit.json
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {simulate, quantile, mean, MODEL_VERSION, DEFAULT_PARAMS} from '../dashboard/cost-model.mjs';
const hash = path => createHash('sha256').update(readFileSync(new URL(path, import.meta.url))).digest('hex');
const variants = {
  baseline: {}, independent_maturity: {dependence_mode: 'independent_maturity'},
  direct_media: {media_use_model: 'direct'}, media_linked_gf: {gf_dose_model: 'media_linked'},
  direct_media_and_linked_gf: {media_use_model: 'direct', gf_dose_model: 'media_linked'}
};
function summarize(n, seed, overrides) {
  const r = simulate(n, seed, overrides);
  return {n, seed, p50: quantile(r.unit_cost, .5), p90: quantile(r.unit_cost, .9),
    p95: quantile(r.unit_cost, .95), mean: mean(r.unit_cost),
    p_under10: mean(r.unit_cost.map(c => +(c < 10))),
    p_under25: mean(r.unit_cost.map(c => +(c < 25))),
    p_under50: mean(r.unit_cost.map(c => +(c < 50)))};
}
console.log(JSON.stringify({
  model_version: MODEL_VERSION, engine_sha256: hash('../dashboard/cost-model.mjs'),
  basis: 'Hypothetical plant/process scenarios; USD/kg wet biomass; mixed dollar years; no commercialization conditioning',
  default_parameters: DEFAULT_PARAMS,
  variants: Object.fromEntries(Object.entries(variants).map(([key, overrides]) => [key, {
    overrides, runs: [42, 7, 99].map(seed => summarize(30000, seed, overrides))
  }])),
  sample_size_checks: [1000, 3000, 10000, 30000, 100000].flatMap(n => [42, 7, 99].map(seed => summarize(n, seed, {}))),
  interpretation: 'Exploratory numerical stability checks, not scientific validation or a formal convergence guarantee. Alternative input ranges are provisional.'
}, null, 2));
