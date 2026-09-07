// Run from any directory: node /path/to/scripts/model-audit.mjs > snapshot.json
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {simulate, quantile, mean, MODEL_VERSION, DEFAULT_PARAMS} from '../dashboard/cost-model.mjs';
const n = 30000;
const componentKeys = ['media', 'recf', 'supp_protein', 'other_var', 'capex', 'fixed', 'cdmo_toll', 'downstream'];
function summary(r) {
  return {
    p5: quantile(r.unit_cost, 0.05), p50: quantile(r.unit_cost, 0.5), p95: quantile(r.unit_cost, 0.95),
    mean: mean(r.unit_cost), probability_under_10: mean(r.unit_cost.map(v => +(v < 10))),
    probability_under_25: mean(r.unit_cost.map(v => +(v < 25))),
    component_means: Object.fromEntries(componentKeys.map(k => [k, mean(r['cost_' + k])]))
  };
}
const scenarios = {
  default: {}, fedbatch_only: {p_fedbatch: 1, p_perfusion: 0, p_continuous: 0},
  perfusion_only: {p_fedbatch: 0, p_perfusion: 1, p_continuous: 0},
  continuous_only: {p_fedbatch: 0, p_perfusion: 0, p_continuous: 1},
  low_utilization: {uptime_mean: 0.65}, cdmo: {cdmo_mode: true},
  no_capex: {include_capex: false}, complete_medium: {bundled_media: true}
};
console.log(JSON.stringify({
  model_version: MODEL_VERSION,
  engine_sha256: createHash('sha256').update(readFileSync(new URL('../dashboard/cost-model.mjs', import.meta.url))).digest('hex'),
  n, seed: 42, default_parameters: DEFAULT_PARAMS,
  units: 'USD/kg wet biomass; mixed source-year dollars; scenario distribution, not a conditional commercialization forecast',
  scenarios: Object.fromEntries(Object.entries(scenarios).map(([name, overrides]) => [name, {overrides, ...summary(simulate(n, 42, overrides))}])),
  seed_checks: [1, 7, 99, 2026].map(seed => ({seed, ...summary(simulate(n, seed))}))
}, null, 2));
