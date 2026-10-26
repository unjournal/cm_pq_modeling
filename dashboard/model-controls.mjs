import {DEFAULT_PARAMS, REVIEW_PROVENANCE} from './cost-model.mjs';

// Shared controls keep Simple/Advanced prior semantics and validation identical.
export function expertPriorControl(initial = new URLSearchParams()) {
  const container = document.createElement('div');
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = 'Set my own uncertainty ranges';
  summary.title = REVIEW_PROVENANCE.quantiles;
  details.append(summary);
  const intro = document.createElement('p');
  intro.textContent = 'Enter p10 and p90; add a median (p50) to preserve asymmetric beliefs. Leave a whole row blank for defaults. Without p50, the median is √(p10 × p90).';
  details.append(intro);
  const fields = {};
  const rows = [
    ['media', 'Media cost ($/kg wet biomass)', 'Basal medium excluding proteins in separable mode; all medium inputs in complete-medium mode. Replaces the L/kg × $/L calculation.'],
    ['gf', 'Growth-factor cost ($/kg wet biomass)', 'Total external growth-factor cost; overrides dose, price and adoption settings. Ignored when complete medium already includes proteins.'],
    ['density', 'Representative harvest density (g/L)', 'Density for the hypothetical plant being modeled, not a frontier maximum. Changes CAPEX and, in density-derived media mode, L/kg.']
  ];
  for (const [key, label, hint] of rows) {
    const group = document.createElement('fieldset');
    group.style.cssText = 'margin:10px 0;padding:6px;border:1px solid #bcc8cc;';
    const legend = document.createElement('legend');
    legend.textContent = label;
    legend.title = hint;
    legend.style.fontSize = '0.85rem';
    group.append(legend);
    const inputs = document.createElement('div');
    inputs.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
    for (const q of ['p10', 'p50', 'p90']) {
      const name = `${key}_${q}`;
      const labelEl = document.createElement('label');
      labelEl.textContent = q === 'p50' ? 'p50 (optional)' : q;
      labelEl.style.cssText = 'font-size:0.75rem;display:flex;flex-direction:column;';
      const input = document.createElement('input');
      Object.assign(input, {type: 'number', min: '0', step: 'any', name, value: initial.get(`ep_${name}`) ?? ''});
      input.style.width = '76px';
      fields[name] = input;
      labelEl.append(input);
      inputs.append(labelEl);
    }
    const clear = document.createElement('button');
    clear.type = 'button'; clear.textContent = 'Clear';
    clear.onclick = () => {
      for (const q of ['p10', 'p50', 'p90']) fields[`${key}_${q}`].value = '';
      container.dispatchEvent(new Event('input', {bubbles: true}));
    };
    inputs.append(clear);
    group.append(inputs);
    details.append(group);
  }
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  const source = document.createElement('a');
  source.href = 'review-response-2026-09.html#quantiles';
  source.textContent = 'Provenance and fitting assumptions';
  details.append(status, source);
  container.append(details);
  let committed = Object.fromEntries(Object.keys(fields).map(k => [k, null]));
  function update() {
    const candidate = {};
    const errors = [];
    for (const [key] of rows) {
      const vals = ['p10', 'p50', 'p90'].map(q => {
        const input = fields[`${key}_${q}`];
        const v = input.value === '' ? null : Number(input.value);
        candidate[`${key}_${q}`] = v;
        return input.validity.badInput ? NaN : v;
      });
      if (vals.every(v => v === null)) continue;
      const [lo, mid, hi] = vals;
      if (!(Number.isFinite(lo) && lo > 0 && Number.isFinite(hi) && hi >= lo)
          || (mid !== null && !(Number.isFinite(mid) && mid >= lo && mid <= hi)))
        errors.push(`${key}: require 0 < p10 ≤ p90, with p50 between them if supplied.`);
    }
    if (errors.length) {
      status.textContent = errors.join(' ') + ' Results retain the last valid ranges until corrected.';
      status.style.color = '#a32121';
    } else {
      committed = candidate;
      status.textContent = Object.values(candidate).some(v => v != null) ? 'Custom priors active.' : 'Using built-in priors.';
      status.style.color = '';
    }
  }
  container.addEventListener('input', update);
  Object.defineProperty(container, 'value', {get: () => ({...committed})});
  update();
  if (Object.values(fields).some(input => input.value !== '')) details.open = true;
  return container;
}

export function structuralControl(initial = new URLSearchParams()) {
  const container = document.createElement('div');
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = 'Structural stress tests (provisional)';
  details.append(summary);
  const fields = {};
  const specs = [
    ['dependence_mode', 'Maturity dependence', [['shared', 'Shared maturity (baseline)'], ['independent_maturity', 'Independent maturity channels']], REVIEW_PROVENANCE.dependence],
    ['media_use_model', 'Fresh-media calculation', [['density', 'Density-derived (baseline)'], ['direct', 'Direct fresh L/kg'], ['yield', 'From nutrient yield (density-invariant)']], REVIEW_PROVENANCE.media + ' ' + REVIEW_PROVENANCE.media_yield],
    ['fresh_media_p5', 'Fresh media p5 (L/kg)', null, REVIEW_PROVENANCE.media],
    ['fresh_media_p95', 'Fresh media p95 (L/kg)', null, REVIEW_PROVENANCE.media],
    ['nutrient_yield_p5', 'Nutrient yield p5 (g cell solids per L of medium)', null, REVIEW_PROVENANCE.media_yield],
    ['nutrient_yield_p95', 'Nutrient yield p95 (g cell solids per L of medium)', null, REVIEW_PROVENANCE.media_yield],
    ['gf_dose_model', 'Growth-factor dosage', [['per_kg', 'Separate g/kg prior (baseline)'], ['media_linked', 'Concentration × fresh L/kg']], REVIEW_PROVENANCE.gf],
    ['gf_concentration_mg_L', 'GF concentration (mg/L)', null, REVIEW_PROVENANCE.gf],
    ['gf_cheap_dose_fraction', 'Cheap-regime dose fraction (0–1)', null, REVIEW_PROVENANCE.gf],
    ['mode_selection', 'Process-mode selection', [['mixture', 'Draw mode by weights (baseline)'], ['least_cost', 'Cheapest feasible mode']], REVIEW_PROVENANCE.mode_selection],
    ['p_feasible_perfusion', 'P(perfusion feasible at scale) (0–1)', null, 'Probability that perfusion works at commercial scale and is permitted by the projection year. Fed-batch is always feasible as the fallback. ' + REVIEW_PROVENANCE.mode_selection],
    ['p_feasible_continuous', 'P(continuous feasible at scale) (0–1)', null, 'Probability that continuous culture works at commercial scale and is permitted by the projection year, drawn independently of perfusion. ' + REVIEW_PROVENANCE.mode_selection],
    ['mode_choice_noise', 'Choice sharpness: decision noise β (0 = always cheapest)', null, 'β = 0: each world uses its cheapest feasible mode. β > 0: firms choose on noisy cost estimates, and a mode costing half as much as another is chosen 2^(1/β) times as often (β = 0.25: 16×; 0.5: 4×; 1: 2×). Realized cost of the chosen mode is reported.'],
    ['solids_fraction', 'Solids content of the harvested biomass the costs refer to (0–1)', null, 'Share of the wet kg that is dry matter. Used only to convert the wet-basis result to the other bases. ' + REVIEW_PROVENANCE.basis],
    ['target_solids_fraction', 'Target solids content for the standard basis (0–1)', null, REVIEW_PROVENANCE.basis],
    ['protein_fraction_of_solids', 'Protein share of cell solids (0–1)', null, REVIEW_PROVENANCE.basis]
  ];
  for (const [key, text, choices, provenance] of specs) {
    const label = document.createElement('label');
    label.textContent = text;
    label.title = provenance;
    label.style.cssText = 'display:flex;flex-direction:column;margin:8px 0;font-size:0.85rem;';
    const el = document.createElement(choices ? 'select' : 'input');
    el.name = key;
    if (choices) {
      for (const [value, title] of choices) {
        const option = document.createElement('option');
        option.value = value; option.textContent = title; el.append(option);
      }
    } else Object.assign(el, {type: 'number', min: '0', step: 'any'});
    el.value = initial.get(key) ?? DEFAULT_PARAMS[key];
    fields[key] = el;
    label.append(el); details.append(label);
  }
  const note = document.createElement('p');
  note.textContent = 'Direct-media range 8–60 L/kg, the nutrient-yield range 3–25 g/L, the GF dose fraction, the feasibility defaults and the solids and protein shares are illustrative assumptions. Cheapest-feasible selection ignores the process-mode weights above. Hover over labels for provenance, or read the linked notes. The Simple view uses baseline structures.';
  const link = document.createElement('a');
  link.href = 'review-response-2026-09.html#structures'; link.textContent = 'Sources, justification and open questions';
  const modeLink = document.createElement('a');
  modeLink.href = 'docs.html#least-cost-mode-selection'; modeLink.textContent = 'Least-cost mode selection: method and caveats';
  const links = document.createElement('p');
  links.append(link, document.createElement('br'), modeLink);
  const status = document.createElement('p'); status.setAttribute('role', 'status');
  details.append(note, links, status); container.append(details);
  let committed = Object.fromEntries(specs.map(([key]) => [key, DEFAULT_PARAMS[key]]));
  function update() {
    const values = Object.fromEntries(specs.map(([key, , choices]) => [key, choices ? fields[key].value : fields[key].value === '' ? NaN : Number(fields[key].value)]));
    const valid = specs.every(([key, , choices]) => choices ? choices.some(([v]) => v === values[key]) : Number.isFinite(values[key]))
      && values.fresh_media_p5 > 0 && values.fresh_media_p95 >= values.fresh_media_p5
      && values.nutrient_yield_p5 > 0 && values.nutrient_yield_p95 >= values.nutrient_yield_p5
      && values.gf_concentration_mg_L >= 0 && values.gf_cheap_dose_fraction >= 0 && values.gf_cheap_dose_fraction <= 1
      && [values.p_feasible_perfusion, values.p_feasible_continuous].every(p => p >= 0 && p <= 1) && values.mode_choice_noise >= 0
      && [values.solids_fraction, values.target_solids_fraction, values.protein_fraction_of_solids].every(f => f > 0 && f <= 1);
    if (valid) { committed = values; status.textContent = ''; }
    else status.textContent = 'Enter positive ordered media and yield endpoints, nonnegative concentration and noise, a dose fraction and feasibility probabilities from 0 to 1, and solids and protein shares above 0 and at most 1. Results retain the last valid settings.';
    fields.fresh_media_p5.disabled = fields.fresh_media_p95.disabled = values.media_use_model !== 'direct';
    fields.nutrient_yield_p5.disabled = fields.nutrient_yield_p95.disabled = values.media_use_model !== 'yield';
    fields.gf_concentration_mg_L.disabled = fields.gf_cheap_dose_fraction.disabled = values.gf_dose_model !== 'media_linked';
    fields.p_feasible_perfusion.disabled = fields.p_feasible_continuous.disabled = fields.mode_choice_noise.disabled = values.mode_selection !== 'least_cost';
  }
  container.addEventListener('input', update);
  Object.defineProperty(container, 'value', {get: () => ({...committed})});
  update();
  if (specs.some(([key]) => initial.has(key))) details.open = true;
  return container;
}
