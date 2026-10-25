import { useState } from 'react';
import './EcoArchitectureInfographic.css';

/**
 * Interactive 2D infographic for the homepage Architecture section.
 *
 * Replaces the isometric 3D model (EcoDataModel), which kept failing on
 * phones: its 640px scene shrank labels to ~5px, its seven bars overlapped
 * by design, and it hid behind a scroll observer. This version renders
 * everything as ordinary, fully visible HTML — no SVG scene, no 3D
 * transforms, no IntersectionObserver, no pointer tilt, no WebGL. The
 * only motion is a CSS dash pulse along the flow connectors, which stops
 * under prefers-reduced-motion. All content is on the page at load; tapping
 * only changes which detail is shown.
 *
 * Data is the same seven connected systems already on the page, with the
 * same details. "Depth" is the schematic tier from the old model (1–3 dots),
 * not a measured value — no performance claim is made here.
 */
export type EcoSystemItem = {
  label: string;
  detail: string;
  tier: number;
};

const FLOW_LAYERS = [
  { label: 'Sensors & modules', detail: 'Field sensing at the asset: fill, emissions, water, traffic, health, energy and green-space signals.' },
  { label: 'Gateways', detail: 'Gateways collect field signals and forward them, even where connectivity is patchy.' },
  { label: 'LoRaWAN / NB-IoT', detail: 'Resilient, low-power connectivity between the field and the cloud.' },
  { label: 'Cloud telemetry', detail: 'Telemetry lands in the cloud, where it is stored, checked and made auditable.' },
  { label: 'Analytics & GIS', detail: 'Analytics and mapping turn signals into the shared operational picture.' },
];

export default function EcoArchitectureInfographic({
  title,
  caption,
  items,
}: {
  title: string;
  caption: string;
  items: EcoSystemItem[];
}) {
  const [view, setView] = useState<'systems' | 'layers'>('systems');
  const [selected, setSelected] = useState(0);
  const system = items[selected] ?? items[0];

  return (
    <div className="eco-info" data-testid="eco-architecture-infographic">
      <div className="eco-info-head">
        <div>
          <div className="eco-info-eyebrow">Interactive infographic</div>
          <h3>{title}</h3>
        </div>
        <p className="eco-info-note">Tap a system, or switch to the flow layers, to explore it. Nothing here is measured — this is the structure of the platform.</p>
      </div>

      <div className="eco-info-views" role="group" aria-label="Choose infographic view">
        <button type="button" aria-pressed={view === 'systems'} className={view === 'systems' ? 'is-active' : ''} onClick={() => setView('systems')} data-testid="button-eco-info-systems">By system</button>
        <button type="button" aria-pressed={view === 'layers'} className={view === 'layers' ? 'is-active' : ''} onClick={() => setView('layers')} data-testid="button-eco-info-layers">By flow layer</button>
      </div>

      {view === 'systems' ? (
        <>
          <div className="eco-info-grid" role="list">
            {items.map((item, idx) => (
              <button
                key={item.label}
                type="button"
                role="listitem"
                aria-pressed={selected === idx}
                className={selected === idx ? 'is-active' : ''}
                onClick={() => setSelected(idx)}
                data-testid={`button-eco-info-system-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span className="eco-info-label">{item.label}</span>
                <span className="eco-info-detail">{item.detail}</span>
                <span className="eco-info-depth" aria-label={`Schematic depth ${item.tier} of 3`}>
                  {[1, 2, 3].map((dot) => (
                    <i key={dot} className={dot <= item.tier ? 'on' : ''} />
                  ))}
                </span>
              </button>
            ))}
          </div>
          <div className="eco-info-detail-panel" aria-live="polite" data-testid="panel-eco-info-system">
            <span className="eco-info-eyebrow">Selected system</span>
            <h4>{system.label}</h4>
            <p>{system.detail}</p>
            <p className="eco-info-flow-note">It runs on the shared flow below: sensors → gateways → LoRaWAN / NB-IoT → cloud telemetry → analytics &amp; GIS.</p>
          </div>
        </>
      ) : (
        <ol className="eco-info-layers">
          {FLOW_LAYERS.map((layer, idx) => (
            <li key={layer.label} data-testid={`row-eco-info-layer-${idx + 1}`}>
              <span className="eco-info-layer-num">{String(idx + 1).padStart(2, '0')}</span>
              <div>
                <b>{layer.label}</b>
                <p>{layer.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="eco-info-flow" aria-label="Shared platform flow">
        <span>Sensors &amp; modules</span><i className="eco-info-pulse" /><span>Gateways</span><i className="eco-info-pulse" /><span>LoRaWAN / NB-IoT</span><i className="eco-info-pulse" /><span>Cloud telemetry</span><i className="eco-info-pulse" /><span>Analytics &amp; GIS</span>
      </div>

      <p className="eco-info-caption">{caption}</p>
    </div>
  );
}
