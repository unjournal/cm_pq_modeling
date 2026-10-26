// Run from any directory: node /path/to/scripts/model-audit.mjs > snapshot.json
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {simulate, quantile, mean, MODEL_VERSION, DEFAULT_PARAMS} from '../dashboard/cost-model.mjs';
import {thresholdProfile} from '../dashboard/sensitivity-methods.mjs';
const n = 30000;
const componentKeys = ['media', 'recf', 'supp_protein', 'other_var', 'capex', 'fixed', 'cdmo_toll', 'downstream', 'harvest'];
function summary(r) {
  return {
    p5: quantile(r.unit_cost, 0.05), p50: quantile(r.unit_cost, 0.5), p95: quantile(r.unit_cost, 0.95),
    mean: mean(r.unit_cost),
    // Thresholds on threshold_cost: chicken-meat equivalent on the dry basis (docs.qmd#output-basis).
    probability_threshold_basis: r.basis.cost_basis === 'dry' ? 'chicken-meat equivalent' : 'wet biomass',
    probability_under_10: mean(r.threshold_cost.map(v => +(v < 10))),
    probability_under_25: mean(r.threshold_cost.map(v => +(v < 25))),
    probability_under_50: mean(r.threshold_cost.map(v => +(v < 50))),
    component_means: Object.fromEntries(componentKeys.map(k => [k, mean(r['cost_' + k])])),
    other_bases_p50: {dry: quantile(r.unit_cost_dry, 0.5), wet: quantile(r.unit_cost_wet, 0.5),
      meat_equivalent: quantile(r.unit_cost_meat_equiv, 0.5), protein: quantile(r.unit_cost_protein, 0.5)}
  };
}
const scenarios = {
  default: {}, fedbatch_only: {p_fedbatch: 1, p_perfusion: 0, p_continuous: 0},
  perfusion_only: {p_fedbatch: 0, p_perfusion: 1, p_continuous: 0},
  continuous_only: {p_fedbatch: 0, p_perfusion: 0, p_continuous: 1},
  low_utilization: {uptime_mean: 0.65}, cdmo: {cdmo_mode: true},
  no_capex: {include_capex: false}, complete_medium: {bundled_media: true},
  harvest_dewater_placeholder: {include_harvest_dewater: true},
  // Medium-rule structure check (sensitivity.qmd, Section 4.1).
  media_direct: {media_use_model: 'direct'},
  media_direct_with_forming: {media_use_model: 'direct', include_downstream: true},
  media_yield: {media_use_model: 'yield'},
  // The pre-October 26 headline: reproduces earlier wet-basis snapshots exactly.
  wet_basis: {cost_basis: 'wet'}
};
console.log(JSON.stringify({
  model_version: MODEL_VERSION,
  engine_sha256: createHash('sha256').update(readFileSync(new URL('../dashboard/cost-model.mjs', import.meta.url))).digest('hex'),
  n, seed: 42, default_parameters: DEFAULT_PARAMS,
  units: 'USD per kg dry cell mass (cost_basis "dry", default since 2026-10-26.4; the wet_basis scenario gives per wet kg); probability thresholds on the chicken-meat equivalent (dry × 0.275); mixed source-year dollars; scenario distribution, not a calibrated forecast',
  scenarios: Object.fromEntries(Object.entries(scenarios).map(([name, overrides]) => [name, {overrides, ...summary(simulate(n, 42, overrides))}])),
  seed_checks: [1, 7, 99, 2026].map(seed => ({seed, ...summary(simulate(n, seed))})),
  // What the default draws under $10/kg look like versus all draws (sensitivity.qmd, Section 4).
  threshold_profile_default_under_10: thresholdProfile(simulate(n, 42), 10)
}, null, 2));
