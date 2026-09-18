import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as model from '../dashboard/cost-model.mjs';
import * as sm from '../dashboard/sensitivity-methods.mjs';
const {simulate, DEFAULT_PARAMS, conditionalSwing, spearmanCorr, mulberry32} = model;
const n = 4000;
const base = simulate(n, 42, {});

test('tail contrast with a 10% tail and the mean reproduces the engine swing', () => {
  for (const input of sm.displayedInputs(base, {})) {
    assert.ok(Math.abs(sm.tailContrast(input.data, base.unit_cost) - conditionalSwing(input.data, base.unit_cost, 0.10)) < 1e-9);
  }
  assert.equal(sm.tailContrast([1, 1, 1], [5, 6, 7]), 0);
  const below = sm.tailContrast(base.density_samples, base.unit_cost, {stat: {type: 'below', threshold: 25}});
  assert.ok(below > 0 && below <= 1);
  const {lo, hi} = sm.tailMeans(base.density_samples);
  assert.ok(lo < model.quantile(base.density_samples, 0.1) && hi > model.quantile(base.density_samples, 0.9));
});

test('rank helpers agree with the engine and handle ties', () => {
  assert.deepEqual(Array.from(sm.ranks([10, 20, 20, 5])), [2, 3.5, 3.5, 1]);
  assert.ok(Math.abs(sm.spearman(base.density_samples, base.unit_cost) - spearmanCorr(base.density_samples, base.unit_cost)) < 1e-12);
  assert.equal(sm.pearson([1, 1, 1], [1, 2, 3]), 0);
});

test('conditioning obeys the law of total variance and detects a known structure', () => {
  const rng = mulberry32(7);
  const x = Array.from({length: 20000}, () => rng());
  const noise = Array.from({length: 20000}, () => rng() - 0.5);
  const y = x.map((v, i) => 3 * v + noise[i]);
  // Var(3x) = 0.75, Var(noise) = 1/12: eta2 = 0.75 / (0.75 + 1/12) = 0.9
  const lv = sm.learningValue(x, y, 40);
  assert.ok(Math.abs(lv.eta2 - 0.9) < 0.02);
  assert.ok(lv.expectedWidth80 < lv.marginalWidth80 && lv.expectedSd < lv.marginalSd);
  assert.equal(sm.learningValue(new Array(50).fill(2), y.slice(0, 50)).eta2, 0);
  const profile = sm.conditionalProfile(x, y, 10);
  assert.equal(profile.length, 10);
  assert.equal(profile.reduce((s, b) => s + b.n, 0), 20000);
  for (let b = 1; b < profile.length; b++) assert.ok(profile[b].yMean > profile[b - 1].yMean);
});

test('rank regression recovers additive monotone effects and reports fit', () => {
  const rng = mulberry32(3);
  const a = Array.from({length: 5000}, () => rng()), b = Array.from({length: 5000}, () => rng());
  const y = a.map((v, i) => Math.exp(2 * v) - b[i] + 0.01 * (rng() - 0.5));
  const fit = sm.rankRegression([a, b], y);
  assert.ok(fit.coefficients[0] > 0 && fit.coefficients[1] < 0 && Math.abs(fit.coefficients[0]) > Math.abs(fit.coefficients[1]));
  assert.ok(fit.r2 > 0.95 && fit.r2 <= 1);
  assert.deepEqual(sm.solveLinear([[2, 0], [0, 4]], [2, 8]), [1, 2]);
  assert.throws(() => sm.solveLinear([[0, 0], [0, 0]], [1, 1]), RangeError);
});

test('Shapley effects sum to the explained variance and find an additive split', () => {
  const rng = mulberry32(11);
  const m = 400;
  const x1 = Array.from({length: m}, () => rng()), x2 = Array.from({length: m}, () => rng());
  const y = x1.map((v, i) => 2 * v + x2[i]);
  const r = sm.shapleyEffects([x1, x2], y, {k: 8, names: ['x1', 'x2']});
  assert.ok(Math.abs(r.shapley[0] + r.shapley[1] - r.explained) < 1e-9);
  // Var(2x1) = 4/12 and Var(x2) = 1/12: x1 should carry roughly 80% of variance.
  assert.ok(r.shapley[0] > r.shapley[1] * 2.5);
  assert.ok(r.explained > 0.8);
  for (let i = 0; i < 2; i++) assert.ok(r.first[i] <= r.shapley[i] + 0.05 && r.shapley[i] <= r.total[i] + 0.05);
  assert.throws(() => sm.shapleyEffects([x1], y, {k: 1}), RangeError);
  assert.throws(() => sm.shapleyEffects([x1, x2.slice(1)], y), RangeError);
  const idx = sm.subsampleIndices(1000, 100, 5);
  assert.equal(new Set(idx).size, 100);
  assert.ok(idx.every(i => i >= 0 && i < 1000));
});

test('displayed inputs follow the same activity rules as the association chart', () => {
  const keys = p => sm.displayedInputs(simulate(500, 42, p), p).map(i => i.key);
  assert.deepEqual(keys({}), ['density', 'media_turnover', 'media_cost_L', 'price_recf', 'g_recf', 'maturity', 'wacc', 'asset_life', 'plant_kta', 'cycle_days', 'uptime']);
  assert.ok(!keys({dependence_mode: 'independent_maturity'}).includes('maturity'));
  assert.ok(!keys({cdmo_mode: true}).some(k => ['wacc', 'asset_life', 'cycle_days', 'plant_kta', 'uptime'].includes(k)));
  const direct = keys({media_use_model: 'direct'});
  assert.ok(direct.includes('L_per_kg') && !direct.includes('media_turnover'));
  const override = keys({ep_media_p10: 5, ep_media_p90: 20});
  assert.ok(override.includes('media_override') && !override.includes('media_cost_L'));
  assert.ok(!keys({bundled_media: true}).includes('price_recf'));
});

test('interventions pin exactly one input and leave the paired draws intact', () => {
  const rows = sm.interventionContrasts(base, {}, {n: 1500, seed: 42});
  assert.deepEqual(rows.map(r => r.key), ['density', 'plant_kta', 'wacc', 'asset_life']);
  for (const r of rows) {
    assert.ok(Number.isFinite(r.conditional) && Number.isFinite(r.intervention));
    assert.ok(r.lo < r.hi);
  }
  const pinned = simulate(1500, 42, {plant_kta_p5: 20, plant_kta_p95: 20});
  assert.ok(pinned.plant_kta_samples.every(v => Math.abs(v - 20) < 1e-9));
  assert.deepEqual(pinned.uptime_samples, simulate(1500, 42, {}).uptime_samples);
  assert.equal(sm.interventionSpecs({cdmo_mode: true}).map(s => s.key).join(), 'density');
});

// The URL adapter must match the Advanced page's own parameter cell.
function pageParams(cell, globals) {
  const source = readFileSync(new URL('../dashboard/index.qmd', import.meta.url), 'utf8');
  const begin = source.indexOf(cell + ' = {');
  const body = source.slice(begin + (cell + ' = ').length, source.indexOf('\n```', begin));
  return vm.runInNewContext('(function() ' + body + ')()', {costModel: model, ...globals});
}
test('URL state adapter reproduces the Advanced page parameters', () => {
  const epNull = {media_p10: null, media_p50: null, media_p90: null, gf_p10: null, gf_p50: null, gf_p90: null, density_p10: null, density_p50: null, density_p90: null};
  const structure = {dependence_mode: 'shared', media_use_model: 'density', fresh_media_p5: 8, fresh_media_p95: 60, gf_dose_model: 'per_kg', gf_concentration_mg_L: 0.102, gf_cheap_dose_fraction: 0.4};
  const defaults = {
    structure_settings: structure, simpleMode: true, target_year: 2036, maturity: 0.5, plant_capacity: 20,
    uptime: 0.9, p_hydro: 0.75, p_recfactors: 0.5, p_supp_protein: 0.7,
    wacc_lo: 8, wacc_hi: 20, asset_life_lo: 8, asset_life_hi: 20,
    density_lo: 30, density_hi: 200, media_turnover_lo: 0.5, media_turnover_hi: 3,
    include_capex: true, include_fixed_opex: true, include_downstream: false,
    gf_progress: 50, cdmo_mode: false, cdmo_toll_p5: 4, cdmo_toll_p95: 40,
    p_fedbatch: 0.2, p_perfusion: 0.5, p_continuous: 0.3, override_mode_constraints: false,
    bundled_media: false, bundled_media_p5: 50, bundled_media_p95: 500, expert_priors_adv: epNull
  };
  const cases = [
    [{}, {}],
    [{simpleMode: '0', maturity: '0.7', target_year: '2044', plant_capacity: '35', wacc_lo: '6', include_capex: '0', cdmo_mode: '1',
      dependence_mode: 'independent_maturity', media_use_model: 'direct', fresh_media_p95: '80', p_fedbatch: '0.6',
      ep_media_p10: '4', ep_media_p50: '9', ep_media_p90: '30', ep_density_p10: '20', ep_density_p90: '90'},
     {simpleMode: false, maturity: 0.7, target_year: 2044, plant_capacity: 35, wacc_lo: 6, include_capex: false, cdmo_mode: true,
      structure_settings: {...structure, dependence_mode: 'independent_maturity', media_use_model: 'direct', fresh_media_p95: 80}, p_fedbatch: 0.6,
      expert_priors_adv: {...epNull, media_p10: 4, media_p50: 9, media_p90: 30, density_p10: 20, density_p90: 90}}]
  ];
  for (const [state, overrides] of cases) {
    const expected = pageParams('simParams', {...defaults, ...overrides});
    const actual = sm.advancedUrlStateToParams(state, model.maturityForYear);
    for (const key of Object.keys(expected)) assert.deepEqual(actual[key], expected[key], key);
    assert.deepEqual(simulate(500, 42, actual).unit_cost, simulate(500, 42, expected).unit_cost);
  }
  // An incomplete prior is ignored rather than crashing the page.
  assert.equal(sm.advancedUrlStateToParams({ep_gf_p10: '5'}, model.maturityForYear).ep_gf_p10, null);
});
