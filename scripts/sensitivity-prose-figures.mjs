// Prints the default-scenario numbers quoted in prose on dashboard/sensitivity.qmd
// (Sections 2.3, 2.4, 4, 4.1 and the practical reading) and the wholesale-chicken
// counts in docs.qmd and limits.qmd. Rerun after engine changes and update the prose.
//   node scripts/sensitivity-prose-figures.mjs
const dash = new URL("../dashboard/", import.meta.url);
const cm = await import(new URL("cost-model.mjs", dash).href);
const sm = await import(new URL("sensitivity-methods.mjs", dash).href);

const N = 30000, SEED = 42;
const params = sm.advancedUrlStateToParams({}, cm.maturityForYear);
const r = cm.simulate(N, SEED, params);
const uc = r.unit_cost, tc = r.threshold_cost, h = r.unit_cost_hybrid;
const q = cm.quantile, below = (a, t) => a.filter(v => v < t).length;
const pct = (k, n = N) => (100 * k / n).toFixed(2) + "%";

console.log(`engine ${cm.MODEL_VERSION}, basis ${r.basis.cost_basis}, seed ${SEED}, ${N} draws`);
console.log(`median ${q(uc, 0.5).toFixed(2)}  mean ${cm.mean(uc).toFixed(2)}  sd ${Math.sqrt(sm.variance(uc)).toFixed(1)}  median hybrid ${q(h, 0.5).toFixed(2)}`);
for (const t of [5, 10, 25, 50]) console.log(`  under $${t} hybrid: ${below(tc, t)} (${pct(below(tc, t))})`);
console.log(`nutrient floor binding share: ${r.nutrient_floor_binding_share}`);

console.log("\nWholesale chicken comparison (hybrid $/kg):");
for (const t of [2.6, 3.5, 4.6]) console.log(`  below $${t}: ${below(h, t)} (${pct(below(h, t))})`);
console.log(`  min ${Math.min(...h).toFixed(2)}  p5 ${q(h, 0.05).toFixed(2)}`);

const inputs = sm.displayedInputs(r, params);
const fit = sm.rankRegression(inputs.map(i => i.data), uc);
console.log(`\nInputs (rank-regression R2 ${fit.r2.toFixed(3)}): mean swing ± se | median swing | P(<$10) swing | eta2`);
inputs.forEach((i, k) => {
  const d = sm.tailContrastDetail(i.data, uc);
  const m = sm.tailContrastDetail(i.data, uc, {stat: {type: "median"}});
  const p = sm.tailContrastDetail(i.data, tc.map(v => v < 10 ? 1 : 0));
  const lv = sm.learningValue(i.data, uc);
  console.log(`  ${i.key.padEnd(15)} ${d.contrast.toFixed(1).padStart(7)} ± ${d.se.toFixed(1).padEnd(5)} | ${m.contrast.toFixed(1).padStart(7)} | ${(100 * p.contrast).toFixed(1).padStart(6)}pp ± ${(100 * p.se).toFixed(1)} | ${(100 * lv.eta2).toFixed(1)}%  srrc ${fit.coefficients[k].toFixed(3)}`);
});

console.log("\nInterventions (mean, 10% tails):");
for (const x of sm.interventionContrasts(r, params, {n: 20000, seed: SEED, tailFrac: 0.10}))
  console.log(`  ${x.name.padEnd(30)} conditional ${x.conditional.toFixed(1)}  intervention ${x.intervention.toFixed(1)}`);

for (const t of [5, 10]) {
  const p = sm.thresholdProfile(r, t);
  console.log(`\nThreshold profile under $${t}: ${p.count} draws (${(100 * p.share).toFixed(2)}%)${p.warning ? "  [" + p.warning + "]" : ""}`);
  const f = s => s ? `${s.p50.toPrecision(3)} (${s.p10.toPrecision(3)}-${s.p90.toPrecision(3)})` : "-";
  for (const c of p.continuous) console.log(`  ${c.key.padEnd(15)} all ${f(c.all).padEnd(26)} under ${f(c.under)}`);
  for (const b of p.binary) console.log(`  ${b.name}: all ${(100 * b.all).toFixed(0)}%, under ${b.under == null ? "-" : (100 * b.under).toFixed(0) + "%"}`);
  const fmt = o => o ? Object.entries(o).map(([k, v]) => `${k} ${v.toFixed(2)}`).join(", ") : "-";
  console.log(`  mean components, all:   ${fmt(p.components.all)}`);
  console.log(`  mean components, under: ${fmt(p.components.under)}`);
}

const rules = [
  ["(a) density, default", {...params, media_use_model: "density"}],
  ["(b) direct", {...params, media_use_model: "direct"}],
  ["(c) direct + forming", {...params, media_use_model: "direct", include_downstream: true}],
  ["(d) yield", {...params, media_use_model: "yield"}],
  ["(a) + forming", {...params, include_downstream: true}],
];
const runs = rules.map(([k, p]) => [k, cm.simulate(N, SEED, p)]);
console.log("\nStructure check (hybrid thresholds; L/kg per kg dry):");
for (const [k, s] of runs)
  console.log(`  ${k.padEnd(21)} <$5 ${pct(below(s.threshold_cost, 5))}  <$10 ${pct(below(s.threshold_cost, 10))}  <$25 ${pct(below(s.threshold_cost, 25))}  median ${q(s.unit_cost, 0.5).toFixed(1)}  L/kg p50 ${q(s.L_per_kg_samples, 0.5).toFixed(0)} p90 ${q(s.L_per_kg_samples, 0.9).toFixed(0)}`);
const [a, b, , d] = runs.map(x => x[1]);
for (const t of [5, 10]) {
  let n = 0, lostB = 0, lostD = 0;
  for (let i = 0; i < N; i++) if (a.threshold_cost[i] < t) { n++; if (b.threshold_cost[i] >= t) lostB++; if (d.threshold_cost[i] >= t) lostD++; }
  console.log(`  default under $${t}: ${n}; rise above under direct ${lostB} (${pct(lostB, n)}), under yield ${lostD} (${pct(lostD, n)})`);
}
