/**
 * loopGenerator — turns any waste stream a visitor types into a playable
 * 5-stage waste-to-resource loop (Waste → Process → Resource → Demand →
 * Facility, the same shape as the built-in sample loops).
 *
 * Honesty contract, stated in the chat UI itself:
 * - By default this is an ON-PAGE TEMPLATE ENGINE, not a model call. It
 *   classifies the input by keyword into one of ten pathways and fills
 *   that pathway's stages and metrics. Every generated value is labelled
 *   illustrative — none of it is measured, surveyed, or live telemetry.
 * - If the visitor pastes their own provider key, LoopBuilderChat may
 *   call that provider's chat API from the browser instead; that path is
 *   labelled "Generated via Groq" (or whichever provider) and its output
 *   is schema-validated before it is allowed into the player. A failed
 *   model call NEVER silently falls back to the template — the chat says
 *   the call failed and offers the template as an explicit choice.
 */

export type LoopStage = { role: string; name: string; detail: string };
export type LoopStream = {
  id: string;
  label: string;
  /** Icon key the player maps to a themed icon (food, leaf, coffee, yard, …). */
  icon: string;
  wasteNote: string;
  stages: LoopStage[];
  metrics: { label: string; value: string }[];
};

type Category = {
  key: string;
  icon: string;
  match: RegExp;
  process: string;
  resource: string;
  demand: string;
  facility: string;
  processNote: string;
  resourceNote: string;
  metrics: { label: string; value: string }[];
};

const CATEGORIES: Category[] = [
  {
    key: 'organics', icon: 'leaf', match: /\b(food|organic|kitchen|restaurant|cafeteria|grocery|produce|bread|fruit|vegetable|cooking|grease|fats|fog)\b/i,
    process: 'Anaerobic digestion', resource: 'Biogas', demand: 'Energy buyer', facility: 'AD plant (illustrative)',
    processNote: 'Illustrative digestion pathway for organic material.',
    resourceNote: 'Biogas captured for heat, power or vehicle fuel in this illustrative pathway.',
    metrics: [
      { label: 'Process efficiency', value: '85% (illustrative)' },
      { label: 'Biogas yield', value: '120 m³/t (illustrative)' },
      { label: 'Processing time', value: '300 h (illustrative)' },
      { label: 'Energy use', value: '40 kWh/t (illustrative)' },
    ],
  },
  {
    key: 'yard', icon: 'yard', match: /\b(yard|garden|leaf|leaves|grass|branch|wood chip|landscap)\w*\b/i,
    process: 'Aerobic composting', resource: 'Compost', demand: 'Urban farm', facility: 'Compost site (illustrative)',
    processNote: 'Illustrative composting pathway for green material.',
    resourceNote: 'Compost returned to soil in this illustrative pathway.',
    metrics: [
      { label: 'Process efficiency', value: '80% (illustrative)' },
      { label: 'Compost yield', value: '0.4 t/t (illustrative)' },
      { label: 'Processing time', value: '168 h (illustrative)' },
      { label: 'Energy use', value: '25 kWh/t (illustrative)' },
    ],
  },
  {
    key: 'paper', icon: 'paper', match: /\b(paper|cardboard|carton|newspaper|magazine|office paper)\b/i,
    process: 'Pulping & deinking', resource: 'Recycled pulp', demand: 'Packaging maker', facility: 'Paper mill (illustrative)',
    processNote: 'Illustrative fibre-recovery pathway.',
    resourceNote: 'Recovered fibre remade into paper and board in this illustrative pathway.',
    metrics: [
      { label: 'Process efficiency', value: '82% (illustrative)' },
      { label: 'Pulp yield', value: '0.8 t/t (illustrative)' },
      { label: 'Processing time', value: '48 h (illustrative)' },
      { label: 'Energy use', value: '180 kWh/t (illustrative)' },
    ],
  },
  {
    key: 'plastic', icon: 'plastic', match: /\b(plastic|pet\b|hdpe|bottle|packaging film|polymer)\b/i,
    process: 'Mechanical recycling', resource: 'Recycled pellets', demand: 'Plastics manufacturer', facility: 'Plastics recovery facility (illustrative)',
    processNote: 'Illustrative sort–wash–pelletise pathway.',
    resourceNote: 'Pellets remoulded into new products in this illustrative pathway.',
    metrics: [
      { label: 'Process efficiency', value: '78% (illustrative)' },
      { label: 'Pellet yield', value: '0.7 t/t (illustrative)' },
      { label: 'Processing time', value: '24 h (illustrative)' },
      { label: 'Energy use', value: '220 kWh/t (illustrative)' },
    ],
  },
  {
    key: 'glass', icon: 'glass', match: /\b(glass|cullet|jar)\b/i,
    process: 'Crushing & melting', resource: 'Cullet', demand: 'Glass manufacturer', facility: 'Glass plant (illustrative)',
    processNote: 'Illustrative glass-recovery pathway.',
    resourceNote: 'Cullet remelted into new glass in this illustrative pathway.',
    metrics: [
      { label: 'Process efficiency', value: '90% (illustrative)' },
      { label: 'Cullet yield', value: '0.95 t/t (illustrative)' },
      { label: 'Processing time', value: '12 h (illustrative)' },
      { label: 'Energy use', value: '150 kWh/t (illustrative)' },
    ],
  },
  {
    key: 'metal', icon: 'metal', match: /\b(metal|aluminium|aluminum|steel|tin|can\b|scrap)\b/i,
    process: 'Smelting & refining', resource: 'Secondary metal', demand: 'Metal fabricator', facility: 'Scrap metal yard (illustrative)',
    processNote: 'Illustrative metal-recovery pathway.',
    resourceNote: 'Secondary metal cast into new products in this illustrative pathway.',
    metrics: [
      { label: 'Process efficiency', value: '92% (illustrative)' },
      { label: 'Metal yield', value: '0.9 t/t (illustrative)' },
      { label: 'Processing time', value: '36 h (illustrative)' },
      { label: 'Energy use', value: '400 kWh/t (illustrative)' },
    ],
  },
  {
    key: 'ewaste', icon: 'ewaste', match: /\b(e-waste|electronic|battery|batteries|phone|computer|laptop|circuit|appliance)\b/i,
    process: 'Dismantling & recovery', resource: 'Recovered metals', demand: 'Electronics maker', facility: 'E-waste recycler (illustrative)',
    processNote: 'Illustrative electronics-recovery pathway. Batteries need specialist handling — this is a diagram, not handling advice.',
    resourceNote: 'Recovered metals and components re-enter manufacturing in this illustrative pathway.',
    metrics: [
      { label: 'Process efficiency', value: '70% (illustrative)' },
      { label: 'Metal yield', value: '0.4 t/t (illustrative)' },
      { label: 'Processing time', value: '72 h (illustrative)' },
      { label: 'Energy use', value: '300 kWh/t (illustrative)' },
    ],
  },
  {
    key: 'textiles', icon: 'textiles', match: /\b(textile|clothing|clothes|fabric|garment|shoe|apparel)\b/i,
    process: 'Sorting & fibre recovery', resource: 'Recycled fibre', demand: 'Textile maker', facility: 'Textile sorting centre (illustrative)',
    processNote: 'Illustrative fibre-recovery pathway.',
    resourceNote: 'Recovered fibre spun into new textiles in this illustrative pathway.',
    metrics: [
      { label: 'Process efficiency', value: '65% (illustrative)' },
      { label: 'Fibre yield', value: '0.5 t/t (illustrative)' },
      { label: 'Processing time', value: '48 h (illustrative)' },
      { label: 'Energy use', value: '120 kWh/t (illustrative)' },
    ],
  },
  {
    key: 'construction', icon: 'construction', match: /\b(concrete|brick|demolition|construction|asphalt|rubble|timber)\b/i,
    process: 'Crushing & sorting', resource: 'Recycled aggregate', demand: 'Builder', facility: 'C&D recovery site (illustrative)',
    processNote: 'Illustrative construction-material recovery pathway.',
    resourceNote: 'Aggregate reused in new construction in this illustrative pathway.',
    metrics: [
      { label: 'Process efficiency', value: '85% (illustrative)' },
      { label: 'Aggregate yield', value: '0.8 t/t (illustrative)' },
      { label: 'Processing time', value: '24 h (illustrative)' },
      { label: 'Energy use', value: '60 kWh/t (illustrative)' },
    ],
  },
];

const GENERIC: Category = {
  key: 'mixed', icon: 'mixed', match: /$^/,
  process: 'Sorting & material recovery', resource: 'Secondary materials', demand: 'Manufacturer', facility: 'Materials recovery facility (illustrative)',
  processNote: 'Generic recovery pathway — no specific match was found for this stream, so the stages are illustrative placeholders.',
  resourceNote: 'Recovered materials re-enter manufacturing in this illustrative pathway.',
  metrics: [
    { label: 'Process efficiency', value: '— (illustrative)' },
    { label: 'Material yield', value: '— (illustrative)' },
    { label: 'Processing time', value: '— (illustrative)' },
    { label: 'Energy use', value: '— (illustrative)' },
  ],
};

function titleCase(input: string): string {
  const clean = input.trim().replace(/\s+/g, ' ');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export function generateLoop(input: string, origin?: string): LoopStream {
  const text = input.trim();
  const category = CATEGORIES.find((c) => c.match.test(text)) ?? GENERIC;
  const label = titleCase(text).slice(0, 48);
  const originNote = origin?.trim()
    ? `Origin as entered: ${origin.trim().slice(0, 80)} (stored as entered, not geocoded here).`
    : 'No origin given.';
  return {
    id: `gen-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
    label,
    icon: category.icon,
    wasteNote: `Generated loop · ${category.key === 'mixed' ? 'generic pathway' : `${category.key} pathway`} · ${originNote} All values below are illustrative, not measured.`,
    stages: [
      { role: 'WASTE', name: label, detail: `Stream as entered: "${text.slice(0, 120)}". ${originNote}` },
      { role: 'PROCESS', name: category.process, detail: category.processNote },
      { role: 'RESOURCE', name: category.resource, detail: category.resourceNote },
      { role: 'DEMAND', name: category.demand, detail: `The demand actor that takes ${category.resource.toLowerCase()} in this illustrative pathway.` },
      { role: 'FACILITY', name: category.facility, detail: 'The loop closes when the facility takes the next load — the same circular shape as the sample loops. Facility location is illustrative.' },
    ],
    metrics: category.metrics,
  };
}

/** Classify a free-text stream to a pathway key (used by the twin's free-text routing). */
export function classifyStream(input: string): string {
  const text = input.trim();
  const category = CATEGORIES.find((c) => c.match.test(text));
  return category ? category.key : 'mixed';
}

/** Validate an externally produced loop (e.g. from a provider API) before it enters the player. */
export function validateLoop(value: unknown): LoopStream | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if (typeof v.label !== 'string' || !v.label.trim()) return null;
  if (!Array.isArray(v.stages) || v.stages.length !== 5) return null;
  const roles = ['WASTE', 'PROCESS', 'RESOURCE', 'DEMAND', 'FACILITY'];
  const stages: LoopStage[] = [];
  for (let i = 0; i < 5; i++) {
    const s = v.stages[i] as Record<string, unknown>;
    if (!s || typeof s.name !== 'string' || !s.name.trim() || typeof s.detail !== 'string') return null;
    stages.push({ role: roles[i], name: s.name.trim().slice(0, 60), detail: s.detail.trim().slice(0, 300) });
  }
  if (!Array.isArray(v.metrics) || v.metrics.length === 0) return null;
  const metrics = (v.metrics as Record<string, unknown>[]).slice(0, 4)
    .filter((m) => typeof m.label === 'string' && typeof m.value === 'string')
    .map((m) => ({ label: (m.label as string).slice(0, 40), value: (m.value as string).slice(0, 40) }));
  if (metrics.length === 0) return null;
  return {
    id: `ai-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
    label: (v.label as string).trim().slice(0, 48),
    icon: typeof v.icon === 'string' ? v.icon : 'mixed',
    wasteNote: typeof v.wasteNote === 'string' ? v.wasteNote.slice(0, 200) : 'Generated via provider key — values are illustrative unless the provider states otherwise.',
    stages,
    metrics,
  };
}
