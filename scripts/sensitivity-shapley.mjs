// node scripts/sensitivity-shapley.mjs > dashboard/sensitivity-shapley-2026-09.json
// Offline uncertainty attribution for the default scenario: sample-based Shapley
// effects (nearest-neighbour estimator) plus the full-sample statistics the
// sensitivity page also computes live. Runtime is dominated by the 2^d subset
// enumeration at n^2 cost each; the configuration below takes about a minute.
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {simulate, quantile, mean, MODEL_VERSION, DEFAULT_PARAMS, maturityForYear} from '../dashboard/cost-model.mjs';
import * as sm from '../dashboard/sensitivity-methods.mjs';

const hash = path => createHash('sha256').update(readFileSync(new URL(path, import.meta.url))).digest('hex');
const SEED = 42, DRAWS = 30000;
// The six inputs that carry nearly all of the variance in the default scenario.
// Financing, scale, timing and utilization inputs each explain well under 1%.
const REDUCED = ['density', 'media_turnover', 'media_cost_L', 'price_recf', 'g_recf', 'maturity'];
const runs = [
  {inputs: 'reduced', target: 'log_cost', subsample: 3000, subsampleSeed: 1, k: 10},
  {inputs: 'reduced', target: 'log_cost', subsample: 3000, subsampleSeed: 2, k: 10},
  {inputs: 'reduced', target: 'cost', subsample: 3000, subsampleSeed: 1, k: 10},
  {inputs: 'reduced', target: 'cost', subsample: 3000, subsampleSeed: 2, k: 10},
  {inputs: 'all', target: 'log_cost', subsample: 1500, subsampleSeed: 1, k: 10}
];

const params = {...DEFAULT_PARAMS, maturity_mean: maturityForYear(0.5, 2036), target_year: 2036};
const results = simulate(DRAWS, SEED, params);
const allInputs = sm.displayedInputs(results, params);
const targets = {cost: results.unit_cost, log_cost: results.unit_cost.map(Math.log)};

function fullSampleStats(y) {
  const fit = sm.rankRegression(allInputs.map(i => i.data), y);
  return {
    p10: quantile(y, .1), p50: quantile(y, .5), p90: quantile(y, .9), mean: mean(y), sd: Math.sqrt(sm.variance(y)),
    rank_r2: fit.r2,
    inputs: allInputs.map((input, j) => {
      const lv = sm.learningValue(input.data, y, 30);
      const row = {key: input.key, name: input.name, kind: input.kind, spearman: sm.spearman(input.data, y), srrc: fit.coefficients[j],
        eta2: lv.eta2, expected_sd_after_learning: lv.expectedSd, expected_width80_after_learning: lv.expectedWidth80};
      for (const tail of [0.05, 0.10, 0.25, 0.50]) {
        const d = sm.tailContrastDetail(input.data, y, {tailFrac: tail});
        row[`swing_mean_${Math.round(tail * 100)}`] = d.contrast;
        row[`swing_mean_${Math.round(tail * 100)}_se`] = d.se;
      }
      row.swing_median_10 = sm.tailContrastDetail(input.data, y, {tailFrac: 0.10, stat: {type: 'median'}}).contrast;
      row.swing_p_under25_10 = sm.tailContrastDetail(input.data, results.unit_cost, {tailFrac: 0.10, stat: {type: 'below', threshold: 25}}).contrast;
      return row;
    })
  };
}

const output = {
  model_version: MODEL_VERSION,
  engine_sha256: hash('../dashboard/cost-model.mjs'),
  methods_sha256: hash('../dashboard/sensitivity-methods.mjs'),
  generated: new Date().toISOString().slice(0, 10),
  basis: 'Advanced-page default scenario (maturity 0.5 mapped to 2036), seed 42, 30,000 draws; USD/kg wet biomass in mixed source-year dollars.',
  interpretation: 'Exploratory uncertainty attribution among displayed inputs. Variance shares are not research value. The nearest-neighbour Shapley estimator is biased toward zero or below for inputs that add little information, and breaks down with many inputs at these subsample sizes; compare runs before reading small differences.',
  default_parameters: params,
  reduced_inputs: REDUCED,
  full_sample: {cost: fullSampleStats(targets.cost), log_cost: fullSampleStats(targets.log_cost)},
  shapley_runs: []
};

for (const run of runs) {
  const inputs = run.inputs === 'reduced' ? allInputs.filter(i => REDUCED.includes(i.key)) : allInputs;
  const idx = sm.subsampleIndices(DRAWS, run.subsample, run.subsampleSeed);
  const columns = inputs.map(i => idx.map(t => i.data[t]));
  const y = idx.map(t => targets[run.target][t]);
  const t0 = performance.now();
  const r = sm.shapleyEffects(columns, y, {k: run.k, names: inputs.map(i => i.name)});
  const entry = {
    label: `${run.inputs === 'reduced' ? 'six main inputs' : 'all eleven inputs'}, ${run.target === 'log_cost' ? 'log cost' : 'cost'}, n=${run.subsample}, k=${run.k}, subsample ${run.subsampleSeed}`,
    inputs_set: run.inputs, target: run.target, subsample: run.subsample, subsample_seed: run.subsampleSeed, k: run.k,
    seconds: Math.round((performance.now() - t0) / 100) / 10,
    explained_share: r.explained,
    rank_r2_same_inputs: sm.rankRegression(inputs.map(i => i.data), targets[run.target]).r2,
    inputs: inputs.map((input, j) => ({key: input.key, name: input.name, shapley: r.shapley[j], first_order: r.first[j], total_effect: r.total[j]}))
  };
  output.shapley_runs.push(entry);
  console.error(`${entry.label}: ${entry.seconds}s, explained ${(r.explained * 100).toFixed(0)}%`);
}

console.log(JSON.stringify(output, null, 2));
