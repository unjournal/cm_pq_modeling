import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as model from '../dashboard/cost-model.mjs';
const {simulate, DEFAULT_PARAMS, crf, conditionalSwing, sampleBetaMeanStdev, mulberry32} = model;
const components = ['media', 'recf', 'supp_protein', 'other_var', 'capex', 'fixed', 'cdmo_toll', 'downstream'];
const n = 2000;

test('finite costs and exact component accounting across production modes', () => {
  for (const options of [{}, {bundled_media: true}, {cdmo_mode: true}, {include_downstream: true},
    {include_capex: false, include_fixed_opex: false}, {override_mode_constraints: true},
    {ep_media_p10: 1, ep_media_p90: 10, ep_gf_p10: 1, ep_gf_p90: 20}]) {
    const r = simulate(n, 42, options);
    r.unit_cost.forEach((cost, i) => {
      assert.ok(Number.isFinite(cost) && cost >= 0);
      assert.ok(Math.abs(cost - components.reduce((s, k) => s + r['cost_' + k][i], 0)) < 1e-8);
    });
  }
});

test('turning off CAPEX changes only CAPEX, including with downstream enabled', () => {
  const a = simulate(n, 42, {include_downstream: true});
  const b = simulate(n, 42, {include_downstream: true, include_capex: false});
  for (const k of components.filter(k => k !== 'capex')) assert.deepEqual(a['cost_' + k], b['cost_' + k]);
  a.unit_cost.forEach((v, i) => assert.ok(Math.abs(v - b.unit_cost[i] - a.cost_capex[i]) < 1e-8));
});

test('CDMO comparison preserves all shared costs draw for draw', () => {
  const a = simulate(n, 42, {include_downstream: true});
  const b = simulate(n, 42, {include_downstream: true, cdmo_mode: true});
  for (const k of ['media', 'recf', 'supp_protein', 'other_var', 'downstream']) assert.deepEqual(a['cost_' + k], b['cost_' + k]);
  assert.ok(b.cost_capex.every(v => v === 0) && b.cost_fixed.every(v => v === 0));
});

test('lower utilization increases fixed and capital cost per kg for the same plant', () => {
  const high = simulate(n, 42, {uptime_mean: 0.95});
  const low = simulate(n, 42, {uptime_mean: 0.65});
  for (const k of ['capex', 'fixed']) {
    // Annual cost is unchanged; only realized output changes.
    high['cost_' + k].forEach((v, i) => assert.ok(Math.abs(v * high.uptime_samples[i] - low['cost_' + k][i] * low.uptime_samples[i]) < 1e-8));
    assert.ok(model.mean(low['cost_' + k]) > model.mean(high['cost_' + k]));
  }
});

test('complete medium includes proteins once, and ignores separate GF override', () => {
  const r = simulate(n, 42, {bundled_media: true, ep_gf_p10: 100, ep_gf_p90: 200});
  assert.ok(r.cost_recf.every(v => v === 0) && r.cost_supp_protein.every(v => v === 0));
  assert.ok(r.warnings.some(s => s.includes('ignored')));
});

test('adoption endpoints remain certain despite maturity adjustment', () => {
  for (const p of [0, 1]) {
    const r = simulate(n, 42, {p_hydro_mean: p, p_recfactors_mean: p, maturity_mean: p ? 0.1 : 0.9});
    assert.equal(r.pct_hydro, p);
    assert.equal(r.pct_recf_cheap, p);
  }
});

test('invalid process weights and ranges are handled explicitly', () => {
  const r = simulate(n, 42, {p_fedbatch: 0, p_perfusion: 0, p_continuous: 0});
  assert.equal(r.warnings.length, 1);
  assert.deepEqual(r.unit_cost, simulate(n, 42).unit_cost);
  assert.throws(() => simulate(n, 42, {plant_kta_p5: 50, plant_kta_p95: 10}), RangeError);
  assert.throws(() => simulate(n, 42, {p_fedbatch: -1}), RangeError);
  assert.throws(() => simulate(n, 42, {uptime_mean: 0}), RangeError);
});

test('sampler boundaries and zero-rate capital recovery remain finite', () => {
  for (const p of [0, 0.0001, 0.01, 0.99, 0.9999, 1]) {
    const samples = sampleBetaMeanStdev(mulberry32(42), p, 0.2, 10000);
    assert.ok(samples.every(v => Number.isFinite(v) && v >= 0 && v <= 1));
    assert.ok(Math.abs(model.mean(samples) - p) < 0.015);
  }
  assert.equal(crf(0, 20), 0.05);
  assert.ok(Math.abs(crf(1e-12, 20) - 0.05) < 1e-10);
  assert.equal(conditionalSwing([1, 1, 1], [100, 1, 20]), 0);
});

// Execute each actual page's parameter adapter. This catches drift in page defaults,
// year mapping, and overrides rather than just comparing the engine with itself.
function pageParams(file, cell, globals) {
  const source = readFileSync(new URL('../dashboard/' + file, import.meta.url), 'utf8');
  assert.ok(source.includes('costModel = import(new URL("./cost-model.mjs", window.location.href).href)'));
  assert.ok(!source.includes('function simulate('));
  const begin = source.indexOf(cell + ' = {');
  const body = source.slice(begin + (cell + ' = ').length, source.indexOf('\n```', begin));
  return vm.runInNewContext('(function() ' + body + ')()', {costModel: model, ...globals});
}
test('Simple and Advanced adapters yield identical draws at matching settings', () => {
  for (const year of [2026, 2036, 2050]) {
    for (const ep of [{}, {media_p10: 5, media_p50: 8, media_p90: 30, density_p10: 20, density_p50: 35, density_p90: 100}]) {
      const epNull = {media_p10: null, media_p90: null, gf_p10: null, gf_p90: null, density_p10: null, density_p90: null, ...ep};
      const a = pageParams('index.qmd', 'simParams', {
        structure_settings: {}, simpleMode: false, target_year: year, maturity: 0.5, plant_capacity: 20,
        uptime: 0.9, p_hydro: 0.75, p_recfactors: 0.5, p_supp_protein: 0.7,
        wacc_lo: 8, wacc_hi: 20, asset_life_lo: 8, asset_life_hi: 20,
        density_lo: 30, density_hi: 200, media_turnover_lo: 0.5, media_turnover_hi: 3,
        include_capex: true, include_fixed_opex: true, include_downstream: false,
        gf_progress: 50, cdmo_mode: false, cdmo_toll_p5: 4, cdmo_toll_p95: 40,
        p_fedbatch: 0.2, p_perfusion: 0.5, p_continuous: 0.3, override_mode_constraints: false,
        bundled_media: false, bundled_media_p5: 50, bundled_media_p95: 500, expert_priors_adv: epNull
      });
      const b = pageParams('simple.qmd', 'simParams_simple', {
        target_year_s: year, p_hydro_s: 75, p_recfactors_s: 50,
        p_fedbatch_s: 20, p_perfusion_s: 50, p_continuous_s: 30, expert_priors: epNull
      });
      assert.deepEqual(simulate(n, 42, a).unit_cost, simulate(n, 42, b).unit_cost);
    }
  }
});

test('three-quantile prior preserves an asymmetric median and rejects incomplete/invalid priors', () => {
  for (const [z, expected] of [[-1.2815515655446004, 8], [0, 20], [1.2815515655446004, 100]])
    assert.ok(Math.abs(model.threeQuantileTransform(z, 8, 20, 100) - expected) < 1e-10);
  const r = simulate(50000, 42, {ep_media_p10: 8, ep_media_p50: 20, ep_media_p90: 100});
  assert.ok(Math.abs(model.quantile(r.cost_media, 0.5) - 20) < 0.5);
  const constant = simulate(n, 42, {ep_gf_p10: 2, ep_gf_p50: 2, ep_gf_p90: 2});
  assert.ok(constant.cost_recf.every(v => v === 2));
  for (const p of [{ep_media_p50: 10}, {ep_media_p10: 2}, {ep_media_p10: 3, ep_media_p50: 2, ep_media_p90: 8}, {ep_density_p10: 0, ep_density_p90: 8}])
    assert.throws(() => simulate(n, 42, p), RangeError);
});

test('GF adoption matters at default progress; progress rescales both regimes exactly', () => {
  const low = simulate(n, 42, {p_recfactors_mean: 0.1});
  const high = simulate(n, 42, {p_recfactors_mean: 0.9});
  assert.ok(high.pct_recf_cheap > low.pct_recf_cheap);
  assert.ok(model.mean(high.cost_recf) < model.mean(low.cost_recf));
  for (const p of [0, 1]) {
    const a = simulate(n, 42, {p_recfactors_mean: p, gf_progress: 0});
    const b = simulate(n, 42, {p_recfactors_mean: p, gf_progress: 100});
    a.cost_recf.forEach((v, i) => assert.ok(Math.abs(v / 100 - b.cost_recf[i]) < 1e-8));
  }
  assert.deepEqual(model.gfPriceRanges(50), {cheap: [10, 1000], expensive: [500, 50000]});
});

test('direct fresh media breaks density/media identity while retaining density/CAPEX relation', () => {
  const p = {media_use_model: 'direct', fresh_media_p5: 20, fresh_media_p95: 20, ep_density_p10: 10, ep_density_p90: 10};
  const a = simulate(n, 42, p);
  const b = simulate(n, 42, {...p, ep_density_p10: 100, ep_density_p90: 100});
  assert.deepEqual(a.cost_media, b.cost_media);
  assert.ok(model.mean(b.cost_capex) < model.mean(a.cost_capex));
  assert.ok(a.L_per_kg_samples.every(v => Math.abs(v - 20) < 1e-10));
});

test('media-linked GF dose scales with fresh volume and respects override precedence', () => {
  const p = {media_use_model: 'direct', gf_dose_model: 'media_linked', fresh_media_p5: 10, fresh_media_p95: 10};
  const a = simulate(n, 42, p);
  const b = simulate(n, 42, {...p, fresh_media_p5: 20, fresh_media_p95: 20});
  a.cost_recf.forEach((v, i) => assert.ok(Math.abs(b.cost_recf[i] - 2 * v) < 1e-9));
  for (const r of [a, b, simulate(n, 42, {...p, bundled_media: true}), simulate(n, 42, {...p, ep_gf_p10: 5, ep_gf_p50: 10, ep_gf_p90: 40})]) {
    r.unit_cost.forEach((v, i) => assert.ok(Math.abs(v - components.reduce((sum, k) => sum + r['cost_' + k][i], 0)) < 1e-8));
  }
  const override = simulate(n, 42, {...p, ep_gf_p10: 5, ep_gf_p90: 5});
  assert.ok(override.cost_recf.every(v => Math.abs(v - 5) < 1e-10));
  assert.ok(override.warnings.some(w => w.includes('no cost effect')));
});

test('independent maturity channels preserve marginal finance distribution and remove common-factor association', () => {
  const shared = simulate(30000, 42);
  const independent = simulate(30000, 42, {dependence_mode: 'independent_maturity'});
  assert.ok(Math.abs(model.mean(shared.wacc_samples) - model.mean(independent.wacc_samples)) < 0.002);
  assert.ok(Math.abs(model.spearmanCorr(independent.maturity_samples, independent.wacc_samples)) < 0.03);
  assert.ok(model.spearmanCorr(shared.maturity_samples, shared.wacc_samples) < -0.05);
  assert.deepEqual(shared.density_samples, independent.density_samples);
  assert.deepEqual(independent.unit_cost, simulate(30000, 42, {dependence_mode: 'independent_maturity'}).unit_cost);
});

test('actual CSV exporter includes reproducible configuration with valid quote escaping', () => {
  const source = readFileSync(new URL('../dashboard/index.qmd', import.meta.url), 'utf8');
  const begin = source.indexOf('  function downloadCSV()');
  const fn = source.slice(begin, source.indexOf('  function downloadJSON()', begin));
  const results = simulate(2, 42, {ep_media_p10: 8, ep_media_p50: 20, ep_media_p90: 100, media_use_model: 'direct'});
  let csv;
  vm.runInNewContext(fn + '\ndownloadCSV();', {results, stamp: () => 'test', downloadBlob: content => { csv = content; }});
  const lines = csv.split('\n');
  assert.equal(lines.length, 3);
  assert.ok(lines[0].endsWith('model_version,seed,sample_count,effective_params_json'));
  const encoded = '"' + JSON.stringify(results.effective_params).replaceAll('"', '""') + '"';
  assert.ok(lines[1].endsWith(encoded));
  assert.ok(lines[2].endsWith(',""'));
  assert.ok(lines[1].includes(`"${model.MODEL_VERSION}","42","2"`));
});
