import { useEffect, useRef } from 'react';
import './EcoDataModel.css';

export type EcoDataItem = {
  label: string;
  detail: string;
  /** Schematic tier only (1-3). Heights show structure, never a measured value. */
  tier: 1 | 2 | 3;
  gx: number;
  gy: number;
};

/**
 * EcoDataModel — a dependency-free, real-time isometric data model.
 *
 * Why native, not the ChartLoad embed: the supplied ChartLoad script is a
 * loader that injects a sandboxed iframe of ChartLoad's chart-maker editor
 * (data-cl-tool), not a chart of EcoCode's own data. Embedding it would put
 * an editor UI and a third-party dependency on a public page, with no
 * EcoCode data wired in. This component renders EcoCode's own structures
 * (systems, pathways, pillars) directly in the browser, in the dark theme,
 * with no external script, no invented numbers, and a phone-safe fallback.
 *
 * How it renders, seamlessly, anywhere on the site:
 * 1. Data layer: a plain array of labelled items (see props). Swap the array
 *    to reuse the same scene for waste pathways, platform layers, or partner
 *    pillars — no new renderer per page.
 * 2. Geometry layer: isometric projection computed at render time from the
 *    grid positions (painter's algorithm, back-to-front), so bars, wireframe
 *    panels and connectors stay coherent at any size.
 * 3. Motion layer: bars grow in when the scene scrolls into view
 *    (IntersectionObserver), the scene tilts a few degrees with the pointer,
 *    and everything freezes for prefers-reduced-motion. No WebGL, no bundle
 *    cost, and the legend below the scene keeps every label readable on a
 *    phone where a 3D scene would shrink.
 */
export default function EcoDataModel({
  title,
  caption,
  items,
  testId = 'eco-data-model',
}: {
  title: string;
  caption: string;
  items: EcoDataItem[];
  testId?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!('IntersectionObserver' in window)) {
      root.classList.add('eco3d-in');
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            root.classList.add('eco3d-in');
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    scene.style.setProperty('--eco3d-tilt-x', `${(-py * 5).toFixed(2)}deg`);
    scene.style.setProperty('--eco3d-tilt-y', `${(px * 7).toFixed(2)}deg`);
  };

  const onPointerLeave = () => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.style.setProperty('--eco3d-tilt-x', '0deg');
    scene.style.setProperty('--eco3d-tilt-y', '0deg');
  };

  const tileW = 108;
  const tileH = 62;
  const originX = 320;
  const originY = 150;
  const tierHeight: Record<EcoDataItem['tier'], number> = { 1: 42, 2: 72, 3: 102 };

  const bars = [...items].sort((a, b) => a.gx + a.gy - (b.gx + b.gy));
  const point = (gx: number, gy: number, h: number): [number, number] => [
    originX + ((gx - gy) * tileW) / 2,
    originY + ((gx + gy) * tileH) / 2 - h,
  ];
  const barFaces = (item: EcoDataItem) => {
    const h = tierHeight[item.tier];
    const [cx, cy] = point(item.gx, item.gy, 0);
    const [tx, ty] = point(item.gx, item.gy, h);
    const w = tileW / 2;
    const d = tileH / 2;
    const top: [number, number][] = [
      [cx, cy - d],
      [cx + w, cy],
      [cx, cy + d],
      [cx - w, cy],
    ];
    const left: [number, number][] = [
      [cx - w, cy],
      [cx, cy + d],
      [cx, cy + d - h],
      [cx - w, cy - h],
    ];
    const right: [number, number][] = [
      [cx, cy + d],
      [cx + w, cy],
      [cx + w, cy - h],
      [cx, cy + d - h],
    ];
    const poly = (pts: [number, number][]) => pts.map(([x, y]) => `${x},${y}`).join(' ');
    return { top: poly(top), left: poly(left), right: poly(right), topPoint: [tx, ty] as [number, number], base: [cx, cy + d] as [number, number] };
  };

  const connector = bars.map((item) => barFaces(item).topPoint.join(',')).join(' ');

  return (
    <div className="eco3d" ref={rootRef} data-testid={testId}>
      <div className="eco3d-head">
        <span className="eco3d-eyebrow">{title}</span>
        <span className="eco3d-note">Illustrative model — heights are schematic, not measured values</span>
      </div>
      <div
        className="eco3d-scene"
        ref={sceneRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        role="img"
        aria-label={`${title}: isometric model of ${items.map((item) => item.label).join(', ')}`}
      >
        <svg viewBox="0 0 640 420" aria-hidden="true">
          <polyline points={connector} className="eco3d-connector" />
          {bars.map((item, index) => {
            const faces = barFaces(item);
            return (
              <g key={item.label} className="eco3d-bar" style={{ animationDelay: `${0.12 + index * 0.12}s` }}>
                <polygon points={faces.left} className="eco3d-face eco3d-face-left" />
                <polygon points={faces.right} className="eco3d-face eco3d-face-right" />
                <polygon points={faces.top} className="eco3d-face eco3d-face-top" />
                <text x={faces.base[0]} y={faces.base[1] + 22} textAnchor="middle" className="eco3d-label">
                  {item.label}
                </text>
              </g>
            );
          })}
          <g className="eco3d-panels" aria-hidden="true">
            <rect x="36" y="28" width="150" height="54" rx="4" />
            <rect x="458" y="28" width="150" height="54" rx="4" />
            <line x1="52" y1="46" x2="170" y2="46" />
            <line x1="52" y1="62" x2="140" y2="62" />
            <line x1="474" y1="46" x2="592" y2="46" />
            <line x1="474" y1="62" x2="562" y2="62" />
          </g>
        </svg>
      </div>
      <p className="eco3d-caption">{caption}</p>
      <ul className="eco3d-legend">
        {items.map((item) => (
          <li key={item.label}>
            <strong>{item.label}</strong>
            <span>{item.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
