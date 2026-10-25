import { useEffect, useRef, useState } from 'react';
import './LowerManhattanModel.css';

type Building = { gx: number; gy: number; tier: 1 | 2 | 3 | 4 | 5; label?: string };

/**
 * LowerManhattanModel — an original, schematic animated model of Lower
 * Manhattan for the homepage NYC pilot section. It is NOT the Downtown
 * Alliance LM3D tool and uses no LM3D data, no external map API, and no
 * surveyed building data: the peninsula outline, the Financial District
 * cluster, the One World Trade Center tower, and the East River piers are
 * illustrative shapes in the site's own palette, so nothing here claims a
 * measured height, footprint, or live development status.
 *
 * The 5-second endless loop follows the supplied sequence, in site colours
 * (dark green-black workbench, vivid green wireframe, bone-white model,
 * ochre accents):
 *   0-1s  Base layer: flat 2D street grid on the dark workbench.
 *   1-3s  Extrusion: buildings grow smoothly upward from their footprints.
 *   3-4s  Material transition: vivid-green wireframe fills into the chosen
 *         final material — bone-white architectural model, or a vivid-green
 *         holographic projection (toggle below the scene).
 *   4-5s  Reset loop: a quick cinematic pan while buildings retract flat
 *         into the 2D grid, then the loop restarts seamlessly.
 * Geometry is the same dependency-free isometric projection as EcoDataModel
 * (painter's algorithm, back-to-front), so it runs on a static GitHub Pages
 * site with no WebGL, no new package, and a phone-safe legend below.
 */
const BUILDINGS: Building[] = [
  { gx: 2, gy: 1, tier: 2 }, { gx: 3, gy: 1, tier: 1 }, { gx: 4, gy: 2, tier: 1 },
  { gx: 1, gy: 2, tier: 1 }, { gx: 2, gy: 2, tier: 3 }, { gx: 3, gy: 2, tier: 2 },
  { gx: 0, gy: 3, tier: 1 }, { gx: 1, gy: 3, tier: 2 }, { gx: 4, gy: 3, tier: 2 },
  { gx: 0, gy: 4, tier: 1 }, { gx: 1, gy: 4, tier: 3 },
  { gx: 2, gy: 4, tier: 5, label: 'One World Trade Center' },
  { gx: 3, gy: 4, tier: 4 }, { gx: 4, gy: 4, tier: 3 }, { gx: 5, gy: 4, tier: 2 },
  { gx: 1, gy: 5, tier: 2 }, { gx: 2, gy: 5, tier: 3 }, { gx: 3, gy: 5, tier: 2 },
  { gx: 4, gy: 5, tier: 2 }, { gx: 5, gy: 3, tier: 1 },
  { gx: 1, gy: 6, tier: 2 }, { gx: 2, gy: 6, tier: 3 }, { gx: 3, gy: 6, tier: 3 },
  { gx: 4, gy: 6, tier: 2 }, { gx: 2, gy: 7, tier: 2 }, { gx: 3, gy: 7, tier: 1 },
  { gx: 1, gy: 7, tier: 1 }, { gx: 2, gy: 8, tier: 1 }, { gx: 3, gy: 8, tier: 1 },
];

const PHASES = ['Base grid', 'Extrusion', 'Material', 'Reset'] as const;

export default function LowerManhattanModel() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [material, setMaterial] = useState<'bone' | 'holo'>('bone');
  const [phase, setPhase] = useState(0);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase(1);
      return;
    }
    const id = window.setInterval(() => {
      if (paused) return;
      elapsedRef.current = (elapsedRef.current + 100) % 5000;
      const t = elapsedRef.current;
      setPhase(t < 1000 ? 0 : t < 3000 ? 1 : t < 4000 ? 2 : 3);
    }, 100);
    return () => window.clearInterval(id);
  }, [paused]);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    scene.style.setProperty('--lm-tilt-x', `${(-py * 4).toFixed(2)}deg`);
    scene.style.setProperty('--lm-tilt-y', `${(px * 6).toFixed(2)}deg`);
  };
  const onPointerLeave = () => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.style.setProperty('--lm-tilt-x', '0deg');
    scene.style.setProperty('--lm-tilt-y', '0deg');
  };

  const tileW = 64;
  const tileH = 36;
  const originX = 360;
  const originY = 168;
  const tierHeight: Record<Building['tier'], number> = { 1: 28, 2: 48, 3: 72, 4: 96, 5: 150 };
  const point = (gx: number, gy: number, h: number): [number, number] => [
    originX + ((gx - gy) * tileW) / 2,
    originY + ((gx + gy) * tileH) / 2 - h,
  ];
  const poly = (pts: [number, number][]) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const faces = (b: Building) => {
    const h = tierHeight[b.tier];
    const [cx, cy] = point(b.gx, b.gy, 0);
    const w = tileW / 2;
    const d = tileH / 2;
    return {
      top: poly([[cx, cy - d], [cx + w, cy], [cx, cy + d], [cx - w, cy]]),
      left: poly([[cx - w, cy], [cx, cy + d], [cx, cy + d - h], [cx - w, cy - h]]),
      right: poly([[cx, cy + d], [cx + w, cy], [cx + w, cy - h], [cx, cy + d - h]]),
      footprint: poly([[cx, cy - d], [cx + w, cy], [cx, cy + d], [cx - w, cy]]),
      spire: b.tier === 5 ? `${cx},${cy - d - h} ${cx},${cy - d - h - 34}` : null,
    };
  };
  const bars = [...BUILDINGS].sort((a, b) => a.gx + a.gy - (b.gx + b.gy));
  const land = '360,128 572,232 432,412 360,432 288,382 148,232';

  return (
    <div className={`lm3d ${paused ? 'lm-paused' : ''} lm-${material}`} data-testid="lower-manhattan-model">
      <div className="lm3d-head">
        <span className="lm3d-eyebrow">LOWER MANHATTAN, IN MOTION</span>
        <span className="lm3d-note">Schematic animation — shapes and heights are illustrative, not surveyed data</span>
      </div>
      <div
        className="lm3d-scene"
        ref={sceneRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        role="img"
        aria-label="Animated schematic model of Lower Manhattan: a flat street grid extrudes into a wireframe city, then into a bone-white architectural model, then retracts flat in a loop"
      >
        <svg viewBox="0 0 720 460" aria-hidden="true">
          <defs>
            <clipPath id="lm-land-clip"><polygon points={land} /></clipPath>
          </defs>
          <g className="lm-camera">
            <rect x="8" y="8" width="704" height="444" rx="14" className="lm-bench" />
            <polygon points="0,190 148,232 288,382 0,460" className="lm-water" />
            <polygon points="572,232 720,190 720,460 432,412" className="lm-water" />
            <polygon points={land} className="lm-land" />
            <g clipPath="url(#lm-land-clip)" className="lm-grid" aria-hidden="true">
              {[0, 1, 2, 3, 4, 5, 6].map((gx) => {
                const [x1, y1] = point(gx, -1, 0);
                const [x2, y2] = point(gx, 9, 0);
                return <line key={`v${gx}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
              })}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((gy) => {
                const [x1, y1] = point(-1, gy, 0);
                const [x2, y2] = point(7, gy, 0);
                return <line key={`h${gy}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
              })}
            </g>
            <g className="lm-piers" aria-hidden="true">
              <line x1="500" y1="300" x2="560" y2="272" />
              <line x1="480" y1="330" x2="540" y2="302" />
              <line x1="452" y1="358" x2="508" y2="332" />
            </g>
            {bars.map((b) => {
              const f = faces(b);
              return (
                <g key={`${b.gx}-${b.gy}`} className="lm-building">
                  <polygon points={f.footprint} className="lm-footprint" />
                  <polygon points={f.left} className="lm-face lm-face-left" />
                  <polygon points={f.right} className="lm-face lm-face-right" />
                  <polygon points={f.top} className="lm-face lm-face-top" />
                  {f.spire && <line x1={f.spire.split(' ')[0].split(',')[0]} y1={f.spire.split(' ')[0].split(',')[1]} x2={f.spire.split(' ')[1].split(',')[0]} y2={f.spire.split(' ')[1].split(',')[1]} className="lm-spire" />}
                </g>
              );
            })}
            <text x="360" y="448" textAnchor="middle" className="lm-caption-text">LOWER MANHATTAN · SCHEMATIC</text>
          </g>
        </svg>
      </div>
      <div className="lm3d-controls">
        <button type="button" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
          {paused ? '▶ Resume loop' : '❚❚ Pause loop'}
        </button>
        <span className="lm3d-material-label">Final material:</span>
        <button type="button" className={material === 'bone' ? 'lm-active' : ''} onClick={() => setMaterial('bone')}>Bone-white model</button>
        <button type="button" className={material === 'holo' ? 'lm-active' : ''} onClick={() => setMaterial('holo')}>Holographic</button>
      </div>
      <ol className="lm3d-phases" aria-label="Animation phase">
        {PHASES.map((label, i) => (
          <li key={label} className={phase === i ? 'lm-phase-now' : ''}>
            <span>{i + 1}</span> {label}
            {i === 0 && ' · 0–1s'}
            {i === 1 && ' · 1–3s'}
            {i === 2 && ' · 3–4s'}
            {i === 3 && ' · 4–5s'}
          </li>
        ))}
      </ol>
      <p className="lm3d-caption">
        An original schematic in EcoCode colours, inspired by the idea of a living Lower Manhattan map — not the Downtown Alliance tool, and with no
        outside map data. Flat grid, then extrusion, then wireframe-to-model, then a pan-and-retract reset, looping every five seconds.
      </p>
      <ul className="lm3d-legend">
        <li><strong>One World Trade Center</strong><span>Tallest tower, with spire — illustrative height</span></li>
        <li><strong>Financial District</strong><span>Dense cluster toward the southern tip</span></li>
        <li><strong>East River piers</strong><span>Three piers along the eastern edge</span></li>
        <li><strong>Hudson + East River</strong><span>Deep teal water on either side of the peninsula</span></li>
      </ul>
    </div>
  );
}
