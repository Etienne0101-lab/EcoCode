import { useEffect, useRef, useState } from 'react';
import './DigitalTwinMap.css';

/**
 * DigitalTwinMap — the homepage 3D panel, rebuilt as a digital twin.
 *
 * What is real here, and what is not — stated in the panel itself:
 * - REAL: the street grid (CARTO dark basemap, © OpenStreetMap
 *   contributors © CARTO) and the building footprints + roof heights
 *   (NYC Open Data, the same 7,209 Lower Manhattan buildings as the
 *   earlier prototype, rendered as MapLibre fill-extrusions).
 * - ILLUSTRATIVE: facility, bin-cluster and demand node locations, and
 *   the trajectory lines between them. They demonstrate how a
 *   waste-to-resource pipeline would trace across the map; they are
 *   not live operations, live bins, or surveyed facilities.
 * - Building geometry exists only for Lower Manhattan in this dataset.
 *   Other boroughs show the real street grid with illustrative nodes
 *   and a plain note saying so — never invented buildings.
 * - An address a visitor types is geocoded once, on demand, via
 *   OpenStreetMap Nominatim, used only to centre the map, and never
 *   stored. If geocoding fails, the panel says so and drops no marker.
 *
 * The map library (MapLibre GL) and the building data are loaded only
 * when this panel scrolls into view (or the visitor presses Load), so
 * the homepage's first load is unaffected. No API key is needed
 * anywhere: CARTO's dark tiles and Nominatim are token-free, which is
 * why this uses MapLibre rather than kepler.gl — kepler.gl's built-in
 * styles need a Mapbox token, and its full analytics app would be
 * far heavier than this focused twin view for the same street grid.
 */

type TwinStream = {
  id: string;
  label: string;
  facilityLabel: string;
  demandLabel: string;
};

const TWIN_STREAMS: TwinStream[] = [
  { id: 'organics', label: 'Organic waste', facilityLabel: 'AD plant (illustrative)', demandLabel: 'Energy buyer (illustrative)' },
  { id: 'food', label: 'Restaurant food waste', facilityLabel: 'AD plant (illustrative)', demandLabel: 'Energy buyer (illustrative)' },
  { id: 'paper', label: 'Paper & cardboard', facilityLabel: 'Paper mill (illustrative)', demandLabel: 'Packaging maker (illustrative)' },
  { id: 'plastic', label: 'Plastic', facilityLabel: 'Plastics recovery (illustrative)', demandLabel: 'Plastics maker (illustrative)' },
  { id: 'glass', label: 'Glass', facilityLabel: 'Glass plant (illustrative)', demandLabel: 'Glass maker (illustrative)' },
  { id: 'metal', label: 'Metal', facilityLabel: 'Scrap yard (illustrative)', demandLabel: 'Fabricator (illustrative)' },
  { id: 'ewaste', label: 'E-waste', facilityLabel: 'E-waste recycler (illustrative)', demandLabel: 'Electronics maker (illustrative)' },
  { id: 'textiles', label: 'Textiles', facilityLabel: 'Textile sorting (illustrative)', demandLabel: 'Textile maker (illustrative)' },
];

const BOROUGHS: Record<string, { label: string; center: [number, number]; zoom: number; buildings: boolean }> = {
  manhattan: { label: 'Manhattan', center: [-74.006, 40.712], zoom: 14, buildings: true },
  brooklyn: { label: 'Brooklyn', center: [-73.99, 40.68], zoom: 12, buildings: false },
  queens: { label: 'Queens', center: [-73.86, 40.728], zoom: 11, buildings: false },
  bronx: { label: 'Bronx', center: [-73.9, 40.85], zoom: 11, buildings: false },
  staten: { label: 'Staten Island', center: [-74.15, 40.58], zoom: 11, buildings: false },
};

// Illustrative pipeline nodes on Lower Manhattan's real street grid.
const LM_ORIGIN: [number, number] = [-74.0135, 40.7075];
const LM_FACILITY: [number, number] = [-74.0025, 40.718];
const LM_DEMAND: [number, number] = [-73.994, 40.7245];

function packedToGeoJSON(data: any) {
  const lon0 = data.origin.lon;
  const lat0 = data.origin.lat;
  const kx = 111320 * Math.cos((lat0 * Math.PI) / 180);
  const ky = 110540;
  const features = data.buildings.map((b: any, i: number) => {
    const rings = b.rings.map((ring: any) => {
      const coords: [number, number][] = ring.map(([x, y]: [number, number]) => [lon0 + x / kx, lat0 + y / ky]);
      const first = coords[0];
      const last = coords[coords.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) coords.push(first);
      return coords;
    });
    return { type: 'Feature', properties: { h: b.h, fid: i }, geometry: { type: 'Polygon', coordinates: rings } };
  });
  return { type: 'FeatureCollection', features };
}

function nearestFid(features: any[], point: [number, number]): number | null {
  let best: number | null = null;
  let bestD = Infinity;
  for (const f of features) {
    const ring = f.geometry.coordinates[0] as [number, number][];
    let sx = 0;
    let sy = 0;
    for (const [x, y] of ring) { sx += x; sy += y; }
    const cx = sx / ring.length;
    const cy = sy / ring.length;
    const d = (cx - point[0]) ** 2 + (cy - point[1]) ** 2;
    if (d < bestD) { bestD = d; best = f.properties.fid; }
  }
  return best;
}

export default function DigitalTwinMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const featuresRef = useRef<any[]>([]);
  const trajectoryRef = useRef<[number, number][]>([]);
  const dotProgressRef = useRef(0);
  const rafRef = useRef(0);
  const mlRef = useRef<any>(null);

  const [visible, setVisible] = useState(false);
  const [started, setStarted] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [buildingsLoaded, setBuildingsLoaded] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [streamId, setStreamId] = useState('organics');
  const [boroughId, setBoroughId] = useState('manhattan');
  const [address, setAddress] = useState('');
  const [addressPoint, setAddressPoint] = useState<[number, number] | null>(null);
  const [addressLabel, setAddressLabel] = useState('');
  const [locating, setLocating] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState('Map loads when this panel scrolls into view.');

  const stream = TWIN_STREAMS.find((s) => s.id === streamId) ?? TWIN_STREAMS[0];
  const borough = BOROUGHS[boroughId] ?? BOROUGHS.manhattan;

  // Load when the panel scrolls into view (or the visitor presses Load).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => { if (visible) setStarted(true); }, [visible]);

  // Dot animation along the current trajectory.
  useEffect(() => {
    if (!playing) { cancelAnimationFrame(rafRef.current); return; }
    let last = performance.now();
    const step = (now: number) => {
      const pts = trajectoryRef.current;
      const map = mapRef.current;
      if (pts.length >= 2 && map) {
        const dt = Math.min(100, now - last);
        last = now;
        dotProgressRef.current = (dotProgressRef.current + dt / 12000) % 1;
        // Walk the polyline by segment length.
        let total = 0;
        const segs: number[] = [];
        for (let i = 0; i < pts.length - 1; i++) {
          const len = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
          segs.push(len);
          total += len;
        }
        let target = dotProgressRef.current * total;
        let idx = 0;
        while (idx < segs.length - 1 && target > segs[idx]) { target -= segs[idx]; idx++; }
        const t = segs[idx] ? target / segs[idx] : 0;
        const x = pts[idx][0] + (pts[idx + 1][0] - pts[idx][0]) * t;
        const y = pts[idx][1] + (pts[idx + 1][1] - pts[idx][1]) * t;
        const src = map.getSource('trajectory-dot');
        if (src) src.setData({ type: 'Feature', geometry: { type: 'Point', coordinates: [x, y] }, properties: {} });
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  // Create the map once.
  useEffect(() => {
    if (!started || mapRef.current || !containerRef.current) return;
    let cancelled = false;
    (async () => {
      try {
        const ml = await import('maplibre-gl');
        await import('maplibre-gl/dist/maplibre-gl.css');
        if (cancelled) return;
        mlRef.current = ml;
        if (!ml.supported()) { setMapError('This browser cannot run WebGL maps, so the twin map is unavailable here.'); return; }
        const map = new ml.Map({
          container: containerRef.current as HTMLElement,
          style: {
            version: 8,
            sources: {
              carto: {
                type: 'raster',
                tiles: ['https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors © CARTO',
              },
            },
            layers: [{ id: 'carto', type: 'raster', source: 'carto' }],
          },
          center: BOROUGHS.manhattan.center,
          zoom: 13.5,
          pitch: 60,
          bearing: -20,
        });
        mapRef.current = map;
        map.on('load', async () => {
          try {
            const base = import.meta.env.BASE_URL;
            const res = await fetch(`${base}lm-skyline-data.json`);
            if (!res.ok) throw new Error(`Building data failed to load (HTTP ${res.status})`);
            const packed = await res.json();
            const geojson = packedToGeoJSON(packed);
            featuresRef.current = geojson.features;
            map.addSource('buildings', { type: 'geojson', data: geojson });
            map.addLayer({
              id: 'buildings-3d', type: 'fill-extrusion', source: 'buildings', minzoom: 11,
              paint: {
                'fill-extrusion-color': ['interpolate', ['linear'], ['get', 'h'], 0, '#16382c', 50, '#2a5a44', 200, '#7a9a88', 429, '#e8e0c8'],
                'fill-extrusion-height': ['get', 'h'],
                'fill-extrusion-base': 0,
                'fill-extrusion-opacity': 0.9,
              },
            });
            map.addLayer({
              id: 'buildings-highlight', type: 'fill-extrusion', source: 'buildings', minzoom: 11,
              filter: ['in', ['get', 'fid'], ['literal', []]],
              paint: {
                'fill-extrusion-color': '#2ee06f',
                'fill-extrusion-height': ['get', 'h'],
                'fill-extrusion-base': 0,
                'fill-extrusion-opacity': 1,
              },
            });
            setBuildingsLoaded(true);
            setStatus('Real street grid and Lower Manhattan buildings loaded. Pick a stream to trace its pipeline.');
          } catch (err) {
            setMapError(err instanceof Error ? err.message : 'Building data failed to load.');
          }
          map.addSource('trajectory', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: {} } });
          map.addLayer({ id: 'trajectory-line', type: 'line', source: 'trajectory', paint: { 'line-color': '#2ee06f', 'line-width': 3, 'line-dasharray': [2, 1.5], 'line-opacity': 0.9 } });
          map.addSource('trajectory-dot', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Point', coordinates: LM_ORIGIN }, properties: {} } });
          map.addLayer({ id: 'trajectory-dot-layer', type: 'circle', source: 'trajectory-dot', paint: { 'circle-radius': 8, 'circle-color': '#ec4899', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2 } });
          setMapLoaded(true);
        });
      } catch (err) {
        if (!cancelled) setMapError(err instanceof Error ? err.message : 'The map failed to load.');
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  // Rebuild the trajectory whenever stream, borough, or located address changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getSource('trajectory')) return;
    const isManhattan = boroughId === 'manhattan';
    let origin: [number, number];
    let facility: [number, number];
    let demand: [number, number];
    if (addressPoint) {
      origin = addressPoint;
      if (isManhattan) { facility = LM_FACILITY; demand = LM_DEMAND; }
      else {
        const c = borough.center;
        facility = [c[0] + 0.012, c[1] + 0.006];
        demand = [c[0] - 0.012, c[1] - 0.006];
      }
    } else if (isManhattan) {
      origin = LM_ORIGIN; facility = LM_FACILITY; demand = LM_DEMAND;
    } else {
      const c = borough.center;
      origin = [c[0] - 0.012, c[1] - 0.004];
      facility = [c[0] + 0.004, c[1] + 0.006];
      demand = [c[0] + 0.014, c[1] - 0.004];
    }
    const pts: [number, number][] = [origin, facility, demand];
    trajectoryRef.current = pts;
    dotProgressRef.current = 0;
    (map.getSource('trajectory') as any).setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: pts }, properties: {} });
    (map.getSource('trajectory-dot') as any).setData({ type: 'Feature', geometry: { type: 'Point', coordinates: origin }, properties: {} });
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    const ml = mlRef.current;
    if (ml) {
      const labels: [string, [number, number]][] = [
        [addressPoint ? 'Your point (geocoded)' : 'Bin cluster (illustrative)', origin],
        [stream.facilityLabel, facility],
        [stream.demandLabel, demand],
      ];
      for (const [label, coord] of labels) {
        const el = document.createElement('div');
        el.className = 'twin-marker';
        el.innerHTML = `<span>${label}</span>`;
        markersRef.current.push(new ml.Marker({ element: el }).setLngLat(coord).addTo(map));
      }
    }
    // Highlight the real buildings nearest the facility and demand nodes (Manhattan only).
    if (isManhattan && buildingsLoaded && featuresRef.current.length) {
      const fids = [nearestFid(featuresRef.current, facility), nearestFid(featuresRef.current, demand)].filter((f): f is number => f !== null);
      if (map.getLayer('buildings-highlight')) map.setFilter('buildings-highlight', ['in', ['get', 'fid'], ['literal', fids]]);
    } else if (map.getLayer('buildings-highlight')) {
      map.setFilter('buildings-highlight', ['in', ['get', 'fid'], ['literal', []]]);
    }
    if (map.getLayer('buildings-3d')) {
      map.setLayoutProperty('buildings-3d', 'visibility', borough.buildings ? 'visible' : 'none');
      map.setLayoutProperty('buildings-highlight', 'visibility', borough.buildings ? 'visible' : 'none');
    }
    const focus = addressPoint ?? borough.center;
    const focusZoom = addressPoint ? Math.max(borough.zoom, 15) : borough.zoom;
    map.flyTo({ center: focus, zoom: focusZoom, essential: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamId, boroughId, addressPoint, buildingsLoaded, mapLoaded]);

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    markersRef.current.forEach((m) => m.remove());
    if (mapRef.current) mapRef.current.remove();
  }, []);

  const locateAddress = async () => {
    const query = address.trim();
    if (!query) return;
    setLocating(true);
    setStatus('Looking up that address…');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`Geocoding failed (HTTP ${res.status})`);
      const data = await res.json();
      if (!data.length) {
        setStatus('Address not found — try a borough instead, or check the spelling. No marker was placed.');
        return;
      }
      const point: [number, number] = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
      setAddressPoint(point);
      setAddressLabel(data[0].display_name ?? query);
      setStatus(`Located via OpenStreetMap Nominatim: ${data[0].display_name ?? query}. The point is used only to centre this map and is not stored.`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Geocoding failed. No marker was placed.');
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="twin" data-testid="digital-twin-map">
      <div className="twin-head">
        <span className="twin-eyebrow">DIGITAL TWIN, IN ACTION</span>
        <h3>One stream, traced across a real city.</h3>
        <p>
          A real street grid and real Lower Manhattan building geometry, with an illustrative waste-to-resource
          pipeline traced across them in lime green. Pick a stream and a borough, or locate an address, and the
          pipeline re-routes. Facility, bin and demand placements are illustrative — streets and buildings are real.
        </p>
      </div>

      <div className="twin-controls">
        <label> Waste stream
          <select value={streamId} onChange={(e) => setStreamId(e.target.value)} data-testid="select-twin-stream">
            {TWIN_STREAMS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
        <label> Borough
          <select value={boroughId} onChange={(e) => { setBoroughId(e.target.value); setAddressPoint(null); setAddressLabel(''); }} data-testid="select-twin-borough">
            {Object.entries(BOROUGHS).map(([id, b]) => <option key={id} value={id}>{b.label}</option>)}
          </select>
        </label>
        <label> Address (optional)
          <input
            type="text" value={address} placeholder="e.g. 1 Centre St, New York, NY"
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') locateAddress(); }}
            data-testid="input-twin-address"
          />
        </label>
        <button type="button" onClick={locateAddress} disabled={!address.trim() || locating} data-testid="button-twin-locate">
          {locating ? 'Locating…' : 'Locate on map'}
        </button>
        <button type="button" className="twin-play" onClick={() => setPlaying((p) => !p)} aria-pressed={playing} data-testid="button-twin-play">
          {playing ? '❚❚ Pause pipeline' : '▶ Play pipeline'}
        </button>
      </div>

      <div className="twin-map-wrap" ref={containerRef}>
        {!started && (
          <div className="twin-placeholder">
            <p>Interactive street-level twin map — loads when you scroll here, so the homepage stays fast.</p>
            <button type="button" onClick={() => setStarted(true)}>Load digital twin map</button>
          </div>
        )}
        {started && mapError && <div className="twin-error" role="alert">{mapError}</div>}
      </div>

      <p className="twin-status" aria-live="polite">{status}</p>
      {addressLabel && <p className="twin-address">Located point: {addressLabel}</p>}
      {!borough.buildings && (
        <p className="twin-note">
          Building geometry in this panel covers Lower Manhattan only. {borough.label} shows its real street grid
          with illustrative pipeline nodes — no buildings are invented for it.
        </p>
      )}
      <p className="twin-legend">
        <span><i className="twin-swatch twin-swatch-line" /> Pipeline trajectory</span>
        <span><i className="twin-swatch twin-swatch-lime" /> Pipeline building (nearest real building, lime)</span>
        <span><i className="twin-swatch twin-swatch-dot" /> Travelling load</span>
      </p>
      <p className="twin-attribution">
        Street grid: © OpenStreetMap contributors © CARTO. Buildings: NYC Open Data, Building Footprints (7,209 Lower
        Manhattan buildings, roof heights). Nodes and trajectories are illustrative demo placements, not live operations.
      </p>
    </div>
  );
}
