import { useState } from 'react';
import { generateLoop, type LoopStream } from './loopGenerator';
import './PipelineStudio.css';

/**
 * PipelineStudio — phase 2 of the loop/twin merge: ONE builder box that
 * drives both views at once.
 *
 * Type any waste stream, pick a borough, optionally locate an address,
 * and press Build pipeline. One action then does two things:
 * - Diagram view: a loop for that stream is generated (on-page template
 *   engine, values labelled illustrative) and starts playing in the
 *   pilot loop, joining its picker like any loop-builder loop.
 * - Map view: the twin re-routes to the same stream, from the same
 *   origin (located address, or the borough centre when no address
 *   resolves).
 *
 * The Diagram/Map toggle below the builder switches views without
 * unmounting either panel, so each view keeps its own stage selection
 * while the stream stays shared. For a model-generated loop (Groq key),
 * the loop builder inside Diagram view still offers that path.
 */

export type StudioSignal = {
  nonce: number;
  streamText: string;
  boroughId: string;
  addressPoint: [number, number] | null;
  addressLabel: string;
  loop: LoopStream | null;
};

export type StudioView = 'diagram' | 'map';

const BOROUGHS = [
  { id: 'manhattan', label: 'Manhattan' },
  { id: 'brooklyn', label: 'Brooklyn' },
  { id: 'queens', label: 'Queens' },
  { id: 'bronx', label: 'Bronx' },
  { id: 'staten', label: 'Staten Island' },
];

export default function PipelineStudio({
  view,
  onViewChange,
  onBuild,
}: {
  view: StudioView;
  onViewChange: (view: StudioView) => void;
  onBuild: (signal: StudioSignal) => void;
}) {
  const [streamInput, setStreamInput] = useState('');
  const [boroughId, setBoroughId] = useState('manhattan');
  const [address, setAddress] = useState('');
  const [building, setBuilding] = useState(false);
  const [status, setStatus] = useState(
    'One input drives both views: the loop diagram and the geographic pipeline. Build once, then switch views — your stream stays shared and each view keeps its stage.',
  );

  const build = async () => {
    const text = streamInput.trim();
    if (!text) { setStatus('Type a waste stream first.'); return; }
    setBuilding(true);
    setStatus('Building your pipeline…');
    let addressPoint: [number, number] | null = null;
    let addressLabel = '';
    let geoNote = '';
    const query = address.trim();
    if (query) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`, {
          headers: { Accept: 'application/json' },
        });
        const data = await res.json();
        if (res.ok && data.length) {
          addressPoint = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
          addressLabel = data[0].display_name ?? query;
        } else {
          geoNote = ' Address not found, so the pipeline starts at the borough centre instead.';
        }
      } catch {
        geoNote = ' Address lookup failed, so the pipeline starts at the borough centre instead.';
      }
    }
    const boroughLabel = BOROUGHS.find((b) => b.id === boroughId)?.label ?? boroughId;
    const loop = generateLoop(text, query || boroughLabel);
    onBuild({
      nonce: Date.now(),
      streamText: text,
      boroughId,
      addressPoint,
      addressLabel,
      loop,
    });
    onViewChange('diagram');
    setStatus(
      `Pipeline built for “${text}” — the loop is now playing in Diagram view, and the map is re-routed to the same stream from ${addressPoint ? 'your located address' : 'the borough centre'}. Switch to Map to see it.${geoNote} Loop values are illustrative, not measured.`,
    );
    setBuilding(false);
  };

  return (
    <div className="pipeline-studio" data-testid="pipeline-studio">
      <div className="pipeline-studio-head">
        <span className="pipeline-studio-eyebrow">PIPELINE STUDIO</span>
        <h3>Build a loop and a map, in one go.</h3>
        <p>Type any waste stream and the studio builds both views of its journey: the loop diagram and the geographic pipeline.</p>
      </div>
      <div className="pipeline-studio-controls">
        <label> Waste stream
          <input
            type="text" value={streamInput} placeholder="e.g. used cooking oil, old phones, yard waste"
            onChange={(e) => setStreamInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') build(); }}
            data-testid="input-studio-stream"
          />
        </label>
        <label> Borough
          <select value={boroughId} onChange={(e) => setBoroughId(e.target.value)} data-testid="select-studio-borough">
            {BOROUGHS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        </label>
        <label> Address (optional)
          <input
            type="text" value={address} placeholder="e.g. 1 Centre St, New York, NY"
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') build(); }}
            data-testid="input-studio-address"
          />
        </label>
        <button type="button" onClick={build} disabled={building || !streamInput.trim()} data-testid="button-studio-build">
          {building ? 'Building…' : 'Build pipeline'}
        </button>
      </div>
      <div className="pipeline-studio-views" role="group" aria-label="Pipeline view">
        <span className="pipeline-studio-views-label">View:</span>
        <button type="button" className={view === 'diagram' ? 'studio-view-btn active' : 'studio-view-btn'} aria-pressed={view === 'diagram'} onClick={() => onViewChange('diagram')} data-testid="button-studio-view-diagram">
          Diagram
        </button>
        <button type="button" className={view === 'map' ? 'studio-view-btn active' : 'studio-view-btn'} aria-pressed={view === 'map'} onClick={() => onViewChange('map')} data-testid="button-studio-view-map">
          Map
        </button>
      </div>
      <p className="pipeline-studio-status" aria-live="polite">{status}</p>
    </div>
  );
}
