import { useEffect, useRef, useState } from 'react';
import {
  Building2, Coffee, Factory, Leaf, Package, Store, Trash2, TreePine,
  UtensilsCrossed, type LucideIcon,
} from 'lucide-react';
import LoopBuilderChat from './LoopBuilderChat';
import type { LoopStream } from './loopGenerator';
import './PilotLoopInteractive.css';

/**
 * PilotLoopInteractive — replaces the Lower Manhattan phased 3D loop.
 *
 * A dynamic, interactive 2D waste-to-resource loop for the homepage NYC
 * Pilot section. No WebGL, no 3D model, no endless phased loop: the dot
 * travels only while you press Play, and you can pause it, change its
 * speed, step stage by stage, or tap any stage node to jump to it.
 *
 * Every pathway and metric below comes from the Waste Intelligence
 * Platform's real W2RKG sample (31 nodes / 55 edges) as used by the live
 * web app — not from live pilot telemetry. The NYC pilot itself is
 * planned; deployment coordination with local operators will shape
 * rollout, as the pilot section above states. Nothing here claims a
 * live bin, a live route, or a surveyed building.
 */

// Built-in sample loops, now typed as LoopStream so generated loops from
// the chat below slot into the same player unchanged.
const STREAMS: LoopStream[] = [
  {
    id: 'food',
    label: 'Restaurant food waste',
    icon: 'food',
    wasteNote: 'Downtown Manhattan · 80,000 t/yr in the sample · daily collection · 5% contamination in the sample',
    stages: [
      { role: 'WASTE', name: 'Restaurant food waste', detail: 'Collected daily from 1,500 establishments in the sample. 95% food scraps, 5% fats, oils and grease.' },
      { role: 'PROCESS', name: 'Anaerobic digestion', detail: '90% efficiency · 336 h · 45 kWh/t · 30 kg CO₂/t · 37 °C · pH 6.8–7.4 in the sample.' },
      { role: 'RESOURCE', name: 'Biogas', detail: '150 m³ per tonne of waste · 60% methane in the sample. Used for electricity, heating and vehicle fuel.' },
      { role: 'DEMAND', name: 'Waste processor / energy buyer', detail: 'The demand actor that takes biogas in the sample pathway.' },
      { role: 'FACILITY', name: 'Queens AD plant (sample)', detail: '200,000 t/yr capacity in the sample. The loop closes when the facility takes the next load.' },
    ],
    metrics: [
      { label: 'Process efficiency', value: '90%' },
      { label: 'Biogas yield', value: '150 m³/t' },
      { label: 'Processing time', value: '336 h' },
      { label: 'Energy use', value: '45 kWh/t' },
    ],
  },
  {
    id: 'organics',
    label: 'Brooklyn residential organics',
    icon: 'leaf',
    wasteNote: 'Brooklyn · 150,000 t/yr in the sample · weekly collection · 45% participation · 85% diversion',
    stages: [
      { role: 'WASTE', name: 'Residential organics', detail: '70% food scraps, 30% yard waste in the sample stream.' },
      { role: 'PROCESS', name: 'Aerobic composting', detail: '85% efficiency · 168 h · 25 kWh/t · 50 kg CO₂/t · 55 °C in the sample.' },
      { role: 'RESOURCE', name: 'Compost amendment', detail: '0.4 t of compost per tonne of waste · high quality in the sample. Used as soil amendment and in urban agriculture.' },
      { role: 'DEMAND', name: 'Urban farm', detail: 'The demand actor that takes compost in the sample pathway.' },
      { role: 'FACILITY', name: 'Brooklyn compost facility (sample)', detail: 'The sample facility that closes this loop by taking the next load.' },
    ],
    metrics: [
      { label: 'Process efficiency', value: '85%' },
      { label: 'Compost yield', value: '0.4 t/t' },
      { label: 'Processing time', value: '168 h' },
      { label: 'Sample diversion', value: '85%' },
    ],
  },
  {
    id: 'coffee',
    label: 'Coffee grounds',
    icon: 'coffee',
    wasteNote: 'Coffee shops, offices, households · 97% organic content in the sample',
    stages: [
      { role: 'WASTE', name: 'Coffee grounds', detail: 'High nitrogen content — mixed with carbon-rich materials in the sample pathway.' },
      { role: 'PROCESS', name: 'Black soldier fly larvae', detail: '75% efficiency · 720 h · 15 kWh/t · 20 kg CO₂/t · 27 °C in the sample.' },
      { role: 'RESOURCE', name: 'Animal feed', detail: '150 kg per tonne of waste · high quality in the sample. Used for poultry, aquaculture and livestock feed.' },
      { role: 'DEMAND', name: 'Waste processor', detail: 'The demand actor that takes animal feed in the sample pathway.' },
      { role: 'FACILITY', name: 'Bronx BSFL farm (sample)', detail: 'The sample facility that closes this loop by taking the next load.' },
    ],
    metrics: [
      { label: 'Process efficiency', value: '75%' },
      { label: 'Larvae yield', value: '150 kg/t' },
      { label: 'Processing time', value: '720 h' },
      { label: 'Energy use', value: '15 kWh/t' },
    ],
  },
  {
    id: 'yard',
    label: 'Yard waste',
    icon: 'yard',
    wasteNote: 'Residential, parks, landscaping · 98% organic content in the sample',
    stages: [
      { role: 'WASTE', name: 'Yard waste', detail: 'Woody yard waste, dried and size-reduced before processing in the sample pathway.' },
      { role: 'PROCESS', name: 'Biochar production', detail: '80% efficiency · 2 h · 150 kWh/t · 100 kg CO₂/t · 500 °C pyrolysis in the sample. Syngas produced.' },
      { role: 'RESOURCE', name: 'Biochar', detail: '30% yield in the sample. Used as soil amendment, for carbon sequestration and water filtration.' },
      { role: 'DEMAND', name: 'Waste processor', detail: 'The demand actor that takes biochar in the sample pathway.' },
      { role: 'FACILITY', name: 'Staten Island biochar plant (sample)', detail: 'The sample facility that closes this loop by taking the next load.' },
    ],
    metrics: [
      { label: 'Process efficiency', value: '80%' },
      { label: 'Biochar yield', value: '30%' },
      { label: 'Processing time', value: '2 h' },
      { label: 'Carbon sequestration', value: 'High (sample)' },
    ],
  },
];

// Themed icons for stage roles and stream kinds (lucide, already a site dep).
const ROLE_ICONS: Record<string, LucideIcon> = {
  WASTE: Trash2, PROCESS: Factory, RESOURCE: Package, DEMAND: Store, FACILITY: Building2,
};
const STREAM_ICONS: Record<string, LucideIcon> = {
  food: UtensilsCrossed, leaf: Leaf, coffee: Coffee, yard: TreePine,
  paper: Package, plastic: Package, glass: Package, metal: Factory,
  ewaste: Factory, textiles: Package, construction: Building2, mixed: Trash2,
};

// Five nodes around a loop, in Waste → Process → Resource → Demand → Facility order.
const NODE_POS: [number, number][] = [[300, 52], [500, 150], [430, 300], [170, 300], [100, 150]];

export default function PilotLoopInteractive() {
  const [streamId, setStreamId] = useState<string>('food');
  const [customStreams, setCustomStreams] = useState<LoopStream[]>([]);
  const allStreams = [...STREAMS, ...customStreams];
  const isCustom = (id: string) => customStreams.some((s) => s.id === id);
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [speed, setSpeed] = useState(1);
  const progressRef = useRef(0);
  const [, setTick] = useState(0);

  const stream = allStreams.find((s) => s.id === streamId) ?? STREAMS[0];
  const current = stream.stages[stage];
  const StageIcon = ROLE_ICONS[current.role] ?? Trash2;

  const handleGenerate = (generated: LoopStream) => {
    setCustomStreams((prev) => [...prev.filter((s) => s.id !== generated.id), generated]);
    setStreamId(generated.id);
    setPlaying(true);
  };

  useEffect(() => {
    progressRef.current = 0;
    setStage(0);
  }, [streamId]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      progressRef.current = (progressRef.current + 0.008 * speed) % 1;
      const next = Math.floor(progressRef.current * 5) % 5;
      setStage((prev) => (prev === next ? prev : next));
      setTick((t) => t + 1);
    }, 50);
    return () => window.clearInterval(id);
  }, [playing, speed]);

  const jumpTo = (i: number) => {
    progressRef.current = i / 5;
    setStage(i);
  };

  // Dot position: travel straight between node centres, stage by stage.
  const seg = Math.floor(progressRef.current * 5) % 5;
  const segT = (progressRef.current * 5) % 1;
  const from = NODE_POS[seg];
  const to = NODE_POS[(seg + 1) % 5];
  const dotX = from[0] + (to[0] - from[0]) * segT;
  const dotY = from[1] + (to[1] - from[1]) * segT;

  return (
    <div className="pilot-loop" data-testid="pilot-loop-interactive">
      <div className="pilot-loop-head">
        <span className="pilot-loop-eyebrow">TRY IT — THE PILOT LOOP, PLAYABLE</span>
        <h3>From bin to resource, in one loop.</h3>
        <p>Pick a waste stream, press Play, and follow it around. Tap any stage to jump to it. Illustrative pathways from the W2RKG sample — not live pilot telemetry.</p>
      </div>

      <div className="pilot-loop-pickers" role="group" aria-label="Choose a waste stream">
        {allStreams.map((s) => {
          const StreamIcon = STREAM_ICONS[s.icon] ?? Trash2;
          return (
            <button key={s.id} type="button" className={s.id === streamId ? 'pilot-loop-active' : ''} onClick={() => setStreamId(s.id)}>
              <StreamIcon size={15} /> {s.label}
              {isCustom(s.id) && <span className="pilot-loop-gen-tag">Generated</span>}
            </button>
          );
        })}
      </div>
      <p className="pilot-loop-waste-note">{stream.wasteNote}</p>

      <div className="pilot-loop-body">
        <svg viewBox="0 0 600 360" className="pilot-loop-svg" role="img" aria-label={`Animated loop for ${stream.label}: waste, process, resource, demand, facility`}>
          {NODE_POS.map((p, i) => {
            const next = NODE_POS[(i + 1) % 5];
            const mx = (p[0] + next[0]) / 2;
            const my = (p[1] + next[1]) / 2 - 18;
            return <path key={`edge-${i}`} d={`M ${p[0]} ${p[1]} Q ${mx} ${my} ${next[0]} ${next[1]}`} className="pilot-loop-edge" fill="none" />;
          })}
          {NODE_POS.map((p, i) => (
            <g key={`node-${i}`} className={`pilot-loop-node ${i === stage ? 'pilot-loop-now' : ''}`} onClick={() => jumpTo(i)} role="button" tabIndex={0} aria-label={`${stream.stages[i].role}: ${stream.stages[i].name}`} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); jumpTo(i); } }}>
              <circle cx={p[0]} cy={p[1]} r={i === stage ? 34 : 28} />
              <text x={p[0]} y={p[1] - 4} textAnchor="middle">{stream.stages[i].role}</text>
              <text x={p[0]} y={p[1] + 14} textAnchor="middle" className="pilot-loop-node-name">{stream.stages[i].name.length > 18 ? stream.stages[i].name.slice(0, 17) + '…' : stream.stages[i].name}</text>
            </g>
          ))}
          <circle cx={dotX} cy={dotY} r={9} className="pilot-loop-dot" />
        </svg>

        <div className="pilot-loop-detail">
          <span className="pilot-loop-stage-label"><StageIcon size={15} className="pilot-loop-stage-icon" /> STAGE {stage + 1} OF 5 — {current.role}</span>
          <h4>{current.name}</h4>
          <p>{current.detail}</p>
          <div className="pilot-loop-metrics">
            {stream.metrics.map((m) => (
              <div key={m.label}><b>{m.value}</b><span>{m.label}</span></div>
            ))}
          </div>
          <div className="pilot-loop-controls">
            <button type="button" onClick={() => jumpTo((stage + 4) % 5)}>← Previous stage</button>
            <button type="button" className="pilot-loop-play" onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>{playing ? '❚❚ Pause loop' : '▶ Play loop'}</button>
            <button type="button" onClick={() => jumpTo((stage + 1) % 5)}>Next stage →</button>
          </div>
          <label className="pilot-loop-speed">Speed
            <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
              <option value={0.5}>0.5×</option>
              <option value={1}>1×</option>
              <option value={2}>2×</option>
            </select>
          </label>
          <p className="pilot-loop-foot">The loop closes at the facility, which takes the next load — the same circular shape as the Knowledge Graph page, played here for one stream at a time.</p>
        </div>
      </div>

      <LoopBuilderChat onGenerate={handleGenerate} />
    </div>
  );
}
