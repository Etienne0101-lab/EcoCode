import { useEffect, useRef, useState } from 'react';
import { classifyStream } from './loopGenerator';
import { chainFor, resolveRoute, DSNY_HUBS_UNPINNED, SITES, type Chain, type RouteKey } from './twinSites';
import './DigitalTwinMap.css';

/**
 * DigitalTwinMap — the homepage pipeline twin, built on real sites.
 *
 * The pipeline model is hub-and-spoke, from public sources (full
 * citations live in twinSites.ts and in the panel's sources note):
 * - Spokes: the visitor's collection point (typed address via
 *   OpenStreetMap Nominatim, or a borough centre).
 * - Hubs/processors: pinned, verified sites — Sims Sunset Park MRF,
 *   Newtown Creek WRRF, Pratt Industries paper mill, and the Fresh
 *   Kills hub (SI Transfer Station + Staten Island Compost Facility
 *   complex). Five DSNY marine transfer stations are listed by
 *   verified address as text but NOT pinned, because address lookup
 *   failed for them during this build and their coordinates are not
 *   guessed — that gap is stated in the panel.
 * - Routes: road-following geometry from OSRM on OpenStreetMap data
 *   between the pinned points (with a straight-line fallback if the
 *   routing request fails). These are NOT DSNY collection routes:
 *   DSNY does not publish turn-by-turn collection routes. What DSNY
 *   does publish — district/frequency boundaries, district-to-vendor
 *   assignments, and disposal facilities used by year — is cited
 *   instead, so the panel never claims a DSNY route it cannot show.
 * - Any waste stream: the stream select covers the five verified
 *   pipelines, and the free-text box classifies anything else into
 *   one of them, or into an honest gap path that stops at the nearest
 *   pinned hub when no verified processor pin exists for it.
 *
 * The map library (MapLibre GL) and the building data load only when
 * this panel scrolls into view (or the visitor presses Load), so the
 * homepage's first load is unaffected. No API key is needed anywhere:
 * Esri's dark-gray tiles, Nominatim, and OSRM's demo routing are all
 * token-free.
 */

type TwinSelect = 'food' | 'yard' | 'paper' | 'mgp' | 'refuse';

const TWIN_SELECTS: { id: TwinSelect; label: string; route: RouteKey }[] = [
  { id: 'food', label: 'Food organics', route: 'food' },
  { id: 'yard', label: 'Yard organics', route: 'yard' },
  { id: 'paper', label: 'Paper & cardboard', route: 'paper' },
  { id: 'mgp', label: 'Metal / glass / plastic', route: 'mgp' },
  { id: 'refuse', label: 'Refuse', route: 'refuse' },
];

const BOROUGHS: Record<string, { label: string; center: [number, number]; zoom: number; buildings: boolean }> = {
  manhattan: { label: 'Manhattan', center: [-74.006, 40.712], zoom: 14, buildings: true },
  brooklyn: { label: 'Brooklyn', center: [-73.99, 40.68], zoom: 12, buildings: false },
  queens: { label: 'Queens', center: [-73.86, 40.728], zoom: 11, buildings: false },
  bronx: { label: 'Bronx', center: [-73.9, 40.85], zoom: 11, buildings: false },
  staten: { label: 'Staten Island', center: [-74.15, 40.58], zoom: 11, buildings: false },
};

// Documented throughput figures for the pinned sites (phase 3 layer).
// Sims: 1,000 tons/day capacity (Columbia / facility coverage). Newtown
// Creek: 500 tons/day food-waste capacity target (Waste360 / DEP coverage).
// Pratt: ~75% of DSNY recycled paper (Curb-to-Market Challenge). Fresh
// Kills compost: qualitative — NYC's largest permitted compost facility
// (DSNY facility page). No figure is estimated or rounded beyond its source.
const THROUGHPUT: { siteId: string; figure: string; source: string }[] = [
  { siteId: 'sims', figure: '1,000 tons/day capacity', source: 'Facility coverage (Columbia CGEP tour; NAWIC walkthrough)' },
  { siteId: 'newtown', figure: '500 tons/day food-waste capacity target', source: 'Waste360 / NYC DEP resource-recovery coverage' },
  { siteId: 'pratt', figure: '~75% of DSNY recycled paper', source: 'NYC Curb-to-Market Challenge resources' },
  { siteId: 'freshkills', figure: "NYC's largest permitted compost facility", source: 'DSNY Staten Island Compost Facility page' },
];

const TONNAGE_URL = 'https://data.cityofnewyork.us/resource/ebb7-mvp5.json?$select=month,borough,refusetonscollected,papertonscollected,mgptonscollected,resorganicstons,schoolorganictons&$limit=500&$order=month%20DESC';
const DISTRICTS_URL = 'https://data.cityofnewyork.us/api/v3/views/i6mn-amj2/query.geojson?accessType=DOWNLOAD';

type BoroughTonnage = { key: string; label: string; month: string; refuse: number; paper: number; mgp: number; organics: number; total: number; coord: [number, number] };

// Lower Manhattan building-data bbox (for the lime highlight guard).
const LM_BBOX = { lonMin: -74.022, lonMax: -73.985, latMin: 40.7, latMax: 40.732 };
const inLM = (coord: [number, number]) =>
  coord[0] >= LM_BBOX.lonMin && coord[0] <= LM_BBOX.lonMax && coord[1] >= LM_BBOX.latMin && coord[1] <= LM_BBOX.latMax;

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

async function roadGeometry(points: [number, number][]): Promise<[number, number][] | null> {
  try {
    const legs: [number, number][][] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const [lon1, lat1] = points[i];
      const [lon2, lat2] = points[i + 1];
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`,
      );
      if (!res.ok) return null;
      const data = await res.json();
      const coords = data?.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined;
      if (!coords || coords.length < 2) return null;
      legs.push(coords);
    }
    const merged: [number, number][] = [];
    for (const leg of legs) {
      for (const c of leg) {
        const last = merged[merged.length - 1];
        if (!last || last[0] !== c[0] || last[1] !== c[1]) merged.push(c);
      }
    }
    return merged.length >= 2 ? merged : null;
  } catch {
    return null;
  }
}

export default function DigitalTwinMap({ studioSignal }: { studioSignal?: import('./PipelineStudio').StudioSignal | null }) {
  const appliedStudioNonce = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const featuresRef = useRef<any[]>([]);
  const trajectoryRef = useRef<[number, number][]>([]);
  const cumulativeRef = useRef<number[]>([0]);
  const dotProgressRef = useRef(0);
  const durationRef = useRef(14000);
  const rafRef = useRef(0);
  const mlRef = useRef<any>(null);
  const requestRef = useRef(0);

  const [visible, setVisible] = useState(false);
  const [started, setStarted] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [buildingsLoaded, setBuildingsLoaded] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [streamId, setStreamId] = useState<TwinSelect>('food');
  const [customInput, setCustomInput] = useState('');
  const [customActive, setCustomActive] = useState<string | null>(null);
  const [boroughId, setBoroughId] = useState('manhattan');
  const [address, setAddress] = useState('');
  const [addressPoint, setAddressPoint] = useState<[number, number] | null>(null);
  const [addressLabel, setAddressLabel] = useState('');
  const [locating, setLocating] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState('Map loads when this panel scrolls into view.');
  const [routeMode, setRouteMode] = useState<'road' | 'straight' | ''>('');
  const [layers, setLayers] = useState({ tonnage: false, throughput: false, districts: false });
  const [layerNote, setLayerNote] = useState('');
  const [tonnage, setTonnage] = useState<BoroughTonnage[] | null>(null);
  const tonnageCache = useRef<BoroughTonnage[] | null>(null);
  const districtsCache = useRef(false);

  // Phase 2: a studio build re-routes the twin to the same stream and
  // origin, once per build. The twin's own controls still work after —
  // the next studio build overrides again.
  useEffect(() => {
    if (!studioSignal || studioSignal.nonce === appliedStudioNonce.current) return;
    appliedStudioNonce.current = studioSignal.nonce;
    setCustomInput(studioSignal.streamText);
    setCustomActive(studioSignal.streamText);
    setBoroughId(studioSignal.boroughId);
    setAddressPoint(studioSignal.addressPoint);
    setAddressLabel(studioSignal.addressLabel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studioSignal]);
  const [chain, setChain] = useState<Chain | null>(null);
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const stageRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const borough = BOROUGHS[boroughId] ?? BOROUGHS.manhattan;
  const origin: [number, number] = addressPoint ?? borough.center;
  const originLabel = addressPoint ? (addressLabel || 'Your located point') : `${borough.label} centre`;
  const activeRoute: RouteKey = customActive
    ? resolveRoute(customActive, classifyStream).route
    : (TWIN_SELECTS.find((s) => s.id === streamId)?.route ?? 'food');
  const activeLabel = customActive
    ? resolveRoute(customActive, classifyStream).label
    : (TWIN_SELECTS.find((s) => s.id === streamId)?.label ?? 'Food organics');

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

  // Dot animation along the current trajectory (road geometry or straight fallback).
  useEffect(() => {
    if (!playing) { cancelAnimationFrame(rafRef.current); return; }
    let last = performance.now();
    const step = (now: number) => {
      const pts = trajectoryRef.current;
      const cum = cumulativeRef.current;
      const map = mapRef.current;
      if (pts.length >= 2 && cum.length === pts.length && map) {
        const dt = Math.min(100, now - last);
        last = now;
        dotProgressRef.current = (dotProgressRef.current + dt / durationRef.current) % 1;
        const total = cum[cum.length - 1] || 1;
        const target = dotProgressRef.current * total;
        let idx = 0;
        while (idx < cum.length - 2 && cum[idx + 1] < target) idx++;
        const segLen = cum[idx + 1] - cum[idx] || 1;
        const t = Math.min(1, Math.max(0, (target - cum[idx]) / segLen));
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
        const map = new ml.Map({
          container: containerRef.current as HTMLElement,
          style: {
            version: 8,
            sources: {
              'esri-base': {
                type: 'raster',
                tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'],
                tileSize: 256,
                attribution: 'Esri, © OpenStreetMap contributors',
              },
              'esri-ref': {
                type: 'raster',
                tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'],
                tileSize: 256,
                attribution: 'Esri, © OpenStreetMap contributors',
              },
            },
            layers: [
              { id: 'esri-base', type: 'raster', source: 'esri-base' },
              { id: 'esri-ref', type: 'raster', source: 'esri-ref' },
            ],
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
          map.addSource('trajectory-dot', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Point', coordinates: BOROUGHS.manhattan.center }, properties: {} } });
          map.addLayer({ id: 'trajectory-dot-layer', type: 'circle', source: 'trajectory-dot', paint: { 'circle-radius': 8, 'circle-color': '#ec4899', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2 } });
          // Phase 3 layers: all present but hidden until toggled on.
          map.addSource('tonnage-points', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
          map.addLayer({ id: 'tonnage-circles', type: 'circle', source: 'tonnage-points', layout: { visibility: 'none' }, paint: { 'circle-radius': ['get', 'radius'], 'circle-color': '#2ee06f', 'circle-opacity': 0.55, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1.5 } });
          map.addSource('throughput-points', { type: 'geojson', data: { type: 'FeatureCollection', features: SITES.map((s) => { const t = THROUGHPUT.find((x) => x.siteId === s.id); return { type: 'Feature', geometry: { type: 'Point', coordinates: [s.lon, s.lat] }, properties: { name: s.name, figure: t?.figure ?? '', source: t?.source ?? '' } }; }) } });
          map.addLayer({ id: 'throughput-circles', type: 'circle', source: 'throughput-points', layout: { visibility: 'none' }, paint: { 'circle-radius': 11, 'circle-color': '#d3a96c', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1.5 } });
          map.addSource('dsny-districts', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
          map.addLayer({ id: 'districts-fill', type: 'fill', source: 'dsny-districts', layout: { visibility: 'none' }, paint: { 'fill-color': '#2ee06f', 'fill-opacity': 0 } });
          map.addLayer({ id: 'districts-line', type: 'line', source: 'dsny-districts', layout: { visibility: 'none' }, paint: { 'line-color': '#2ee06f', 'line-width': 1, 'line-opacity': 0.45 } });
          map.on('click', 'tonnage-circles', (e: any) => {
            const f = e.features?.[0];
            if (!f) return;
            const p = f.properties;
            setLayerNote(`${p.label} — ${p.month}: ${Number(p.total).toLocaleString()} tons total (refuse ${Number(p.refuse).toLocaleString()}, paper ${Number(p.paper).toLocaleString()}, metal/glass/plastic ${Number(p.mgp).toLocaleString()}, organics ${Number(p.organics).toLocaleString()}). Source: DSNY Monthly Tonnage (NYC Open Data, ebb7-mvp5).`);
          });
          map.on('click', 'throughput-circles', (e: any) => {
            const f = e.features?.[0];
            if (!f) return;
            setLayerNote(`${f.properties.name} — ${f.properties.figure}. Source: ${f.properties.source}.`);
          });
          map.on('click', 'districts-fill', (e: any) => {
            const f = e.features?.[0];
            if (!f) return;
            const p = f.properties ?? {};
            const id = p.district ?? p.DISTRICT ?? p.name ?? p.NAME ?? p.borough ?? 'DSNY district';
            setLayerNote(`DSNY district boundary: ${id}. Source: DSNY Districts (NYC Open Data, i6mn-amj2) — boundaries only, congruent with community districts.`);
          });
          setMapLoaded(true);
        });
      } catch (err) {
        if (!cancelled) setMapError(err instanceof Error ? err.message : 'The map failed to load.');
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  // Rebuild the pipeline whenever stream, borough, or located address changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getSource('trajectory')) return;
    const nextChain = chainFor(activeRoute, origin, originLabel);
    setChain(nextChain);
    setActiveStage(null);
    const stepCoords = nextChain.steps.map((s) => s.coord);
    const requestId = ++requestRef.current;
    setRouteMode('');
    setStatus(`Tracing ${activeLabel}: ${nextChain.steps.map((s) => s.label).join(' → ')}. Fetching the road route…`);
    (async () => {
      const road = await roadGeometry(stepCoords);
      if (requestId !== requestRef.current) return;
      const line = road ?? stepCoords;
      trajectoryRef.current = line;
      const cum: number[] = [0];
      for (let i = 0; i < line.length - 1; i++) {
        const dx = (line[i + 1][0] - line[i][0]) * 85;
        const dy = (line[i + 1][1] - line[i][1]) * 111;
        cum.push(cum[cum.length - 1] + Math.hypot(dx, dy));
      }
      cumulativeRef.current = cum;
      const km = cum[cum.length - 1] || 1;
      durationRef.current = Math.min(30000, Math.max(12000, km * 700));
      dotProgressRef.current = 0;
      (map.getSource('trajectory') as any).setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: line }, properties: {} });
      (map.getSource('trajectory-dot') as any).setData({ type: 'Feature', geometry: { type: 'Point', coordinates: stepCoords[0] }, properties: {} });
      setRouteMode(road ? 'road' : 'straight');
      setStatus(
        road
          ? `Pipeline for ${activeLabel}: ${nextChain.steps.map((s) => s.label).join(' → ')} — about ${km.toFixed(1)} km by road, following real streets.`
          : `Road routing was unavailable, so the pipeline for ${activeLabel} is drawn straight between its real sites.`,
      );
      // Fit the whole pipeline in view.
      let lonMin = Infinity;
      let lonMax = -Infinity;
      let latMin = Infinity;
      let latMax = -Infinity;
      for (const [lon, lat] of line) {
        lonMin = Math.min(lonMin, lon); lonMax = Math.max(lonMax, lon);
        latMin = Math.min(latMin, lat); latMax = Math.max(latMax, lat);
      }
      map.fitBounds([[lonMin, latMin], [lonMax, latMax]], { padding: 70, duration: 900, maxZoom: 14 });
    })();
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    const ml = mlRef.current;
    if (ml) {
      nextChain.steps.forEach((step, i) => {
        const el = document.createElement('div');
        el.className = 'twin-marker';
        el.innerHTML = `<span>${step.label}</span>`;
        el.addEventListener('click', () => setActiveStage(i));
        markersRef.current.push(new ml.Marker({ element: el }).setLngLat(step.coord).addTo(map));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoute, originLabel, addressPoint, boroughId, buildingsLoaded, mapLoaded]);

  // Stage sync: the selected stage's building glows lime (only where the
  // building data covers it); with no selection, the whole pipeline's
  // nearest buildings glow. The rail button scrolls into view.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !buildingsLoaded || !featuresRef.current.length || !map.getLayer('buildings-highlight') || !chain) return;
    const steps = activeStage === null ? chain.steps : [chain.steps[activeStage]];
    const fids = steps
      .filter((s) => inLM(s.coord))
      .map((s) => nearestFid(featuresRef.current, s.coord))
      .filter((f): f is number => f !== null);
    map.setFilter('buildings-highlight', ['in', ['get', 'fid'], ['literal', fids]]);
    if (activeStage !== null) stageRefs.current[activeStage]?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [activeStage, chain, buildingsLoaded, mapLoaded]);

  const selectStage = (i: number) => {
    setActiveStage(i);
    const map = mapRef.current;
    const step = chain?.steps[i];
    if (map && step) {
      map.flyTo({ center: step.coord, zoom: Math.max(map.getZoom(), inLM(step.coord) ? 15.5 : 13), pitch: 60, duration: 900 });
    }
  };

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    markersRef.current.forEach((m) => m.remove());
    if (mapRef.current) mapRef.current.remove();
  }, []);

  const toggleLayer = async (key: 'tonnage' | 'throughput' | 'districts') => {
    const map = mapRef.current;
    const next = !layers[key];
    setLayers((prev) => ({ ...prev, [key]: next }));
    if (!map) return;
    if (!next) {
      const hide = (id: string) => { if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none'); };
      if (key === 'tonnage') hide('tonnage-circles');
      if (key === 'throughput') hide('throughput-circles');
      if (key === 'districts') { hide('districts-fill'); hide('districts-line'); }
      // No layer left on: clear the caption so it can't describe a hidden layer.
      if (!Object.entries(layers).some(([k, v]) => k !== key && v)) setLayerNote('');
      return;
    }
    try {
      if (key === 'tonnage') {
        if (!tonnageCache.current) {
          setLayerNote('Loading borough tonnage (DSNY Monthly Tonnage)…');
          const res = await fetch(TONNAGE_URL);
          if (!res.ok) throw new Error(`Tonnage data failed to load (HTTP ${res.status})`);
          const rows = await res.json();
          const latest = rows.length ? rows[0].month : '';
          const byKey: Record<string, BoroughTonnage> = {};
          for (const r of rows) {
            if (r.month !== latest) continue;
            const raw = String(r.borough ?? '').toLowerCase();
            const bKey = raw.includes('staten') ? 'staten' : raw.includes('manhattan') ? 'manhattan' : raw.includes('brooklyn') ? 'brooklyn' : raw.includes('queens') ? 'queens' : raw.includes('bronx') ? 'bronx' : '';
            if (!bKey || !BOROUGHS[bKey]) continue;
            const num = (v: any) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
            const refuse = num(r.refusetonscollected);
            const paper = num(r.papertonscollected);
            const mgp = num(r.mgptonscollected);
            const organics = num(r.resorganicstons) + num(r.schoolorganictons);
            const prev = byKey[bKey];
            byKey[bKey] = prev
              ? { ...prev, refuse: prev.refuse + refuse, paper: prev.paper + paper, mgp: prev.mgp + mgp, organics: prev.organics + organics, total: prev.total + refuse + paper + mgp + organics }
              : { key: bKey, label: BOROUGHS[bKey].label, month: latest, refuse, paper, mgp, organics, total: refuse + paper + mgp + organics, coord: BOROUGHS[bKey].center };
          }
          tonnageCache.current = Object.values(byKey);
          setTonnage(tonnageCache.current);
        }
        const features = (tonnageCache.current ?? []).map((b) => ({
          type: 'Feature', geometry: { type: 'Point', coordinates: b.coord },
          properties: { ...b, radius: Math.min(30, 6 + Math.sqrt(b.total / 1000)) },
        }));
        (map.getSource('tonnage-points') as any).setData({ type: 'FeatureCollection', features });
        map.setLayoutProperty('tonnage-circles', 'visibility', 'visible');
        setLayerNote(`Borough tonnage for ${(tonnageCache.current ?? [])[0]?.month ?? 'the latest month'} (DSNY Monthly Tonnage, ebb7-mvp5). Circle size = total tons. Tap a circle or a row below for the breakdown.`);
      } else if (key === 'throughput') {
        map.setLayoutProperty('throughput-circles', 'visibility', 'visible');
        setLayerNote('Facility throughput — documented figures only, as cited per site. Tap a gold circle or a row below.');
      } else {
        if (!districtsCache.current) {
          setLayerNote('Loading DSNY district boundaries…');
          const res = await fetch(DISTRICTS_URL);
          if (!res.ok) throw new Error(`District boundaries failed to load (HTTP ${res.status})`);
          const geojson = await res.json();
          (map.getSource('dsny-districts') as any).setData(geojson);
          districtsCache.current = true;
        }
        map.setLayoutProperty('districts-fill', 'visibility', 'visible');
        map.setLayoutProperty('districts-line', 'visibility', 'visible');
        setLayerNote('DSNY district boundaries (59 districts, congruent with community districts). Outlines only — tap a district for its identifier. Source: DSNY Districts (i6mn-amj2).');
      }
    } catch (err) {
      setLayers((prev) => ({ ...prev, [key]: false }));
      setLayerNote(err instanceof Error ? err.message : 'Layer failed to load and was switched off.');
    }
  };

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
          A real street grid and real building geometry, with a hub-and-spoke waste-to-resource pipeline traced
          across real, named sites. Pick a stream and a borough, type any waste stream, or locate an address —
          the pipeline re-routes through the sites that actually handle that stream.
        </p>
      </div>

      <div className="twin-controls">
        <label> Waste stream
          <select value={streamId} onChange={(e) => { setStreamId(e.target.value as TwinSelect); setCustomActive(null); }} data-testid="select-twin-stream">
            {TWIN_SELECTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
        <label> Any other waste stream
          <input
            type="text" value={customInput} placeholder="e.g. old phones, cooking oil, textiles"
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && customInput.trim()) setCustomActive(customInput.trim()); }}
            data-testid="input-twin-custom"
          />
        </label>
        <button type="button" onClick={() => { if (customInput.trim()) setCustomActive(customInput.trim()); }} disabled={!customInput.trim()} data-testid="button-twin-custom">
          Build pipeline
        </button>
        {customActive && (
          <button type="button" onClick={() => { setCustomActive(null); setCustomInput(''); }} data-testid="button-twin-custom-clear">
            Clear custom stream ({customActive})
          </button>
        )}
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

      {chain && (
        <div className="twin-stages" role="group" aria-label="Pipeline stages" data-testid="twin-stage-rail">
          {chain.steps.map((step, i) => (
            <span className="twin-stage-wrap" key={`${step.name}-${i}`}>
              {i > 0 && <span className="twin-stage-sep" aria-hidden="true">→</span>}
              <button
                type="button"
                ref={(el) => { stageRefs.current[i] = el; }}
                className={activeStage === i ? 'twin-stage active' : 'twin-stage'}
                aria-pressed={activeStage === i}
                onClick={() => selectStage(i)}
                data-testid={`twin-stage-${i}`}
              >
                <span className="twin-stage-role">{step.label}</span>
                <span className="twin-stage-name">{step.kind === 'origin' ? 'Collection point' : step.name.replace(/^.* — /, '')}</span>
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="twin-layers" role="group" aria-label="Map layers">
        <span className="twin-layers-label">Map layers (off by default):</span>
        <button type="button" className={layers.tonnage ? 'twin-layer-btn active' : 'twin-layer-btn'} aria-pressed={layers.tonnage} disabled={!mapLoaded} onClick={() => toggleLayer('tonnage')} data-testid="button-twin-layer-tonnage">
          Borough tonnage
        </button>
        <button type="button" className={layers.throughput ? 'twin-layer-btn active' : 'twin-layer-btn'} aria-pressed={layers.throughput} disabled={!mapLoaded} onClick={() => toggleLayer('throughput')} data-testid="button-twin-layer-throughput">
          Facility throughput
        </button>
        <button type="button" className={layers.districts ? 'twin-layer-btn active' : 'twin-layer-btn'} aria-pressed={layers.districts} disabled={!mapLoaded} onClick={() => toggleLayer('districts')} data-testid="button-twin-layer-districts">
          DSNY district boundaries
        </button>
      </div>
      {layerNote && <p className="twin-layer-note" aria-live="polite">{layerNote}</p>}

      <div className="twin-map-wrap" ref={containerRef}>
        {!started && (
          <div className="twin-placeholder">
            <p>Interactive street-level twin map — loads when you scroll here, so the homepage stays fast.</p>
            <button type="button" onClick={() => setStarted(true)}>Load digital twin map</button>
          </div>
        )}
        {started && mapError && <div className="twin-error" role="alert">{mapError}</div>}
      </div>

      {layers.tonnage && tonnage && (
        <ul className="twin-layer-panel" data-testid="twin-tonnage-panel">
          {tonnage.map((b) => (
            <li key={b.key}>
              <button type="button" onClick={() => { const m = mapRef.current; if (m) m.flyTo({ center: b.coord, zoom: 11, duration: 800 }); }}>
                <b>{b.label}</b> — {b.total.toLocaleString()} tons ({b.month})
              </button>
              <span>refuse {b.refuse.toLocaleString()} · paper {b.paper.toLocaleString()} · metal/glass/plastic {b.mgp.toLocaleString()} · organics {b.organics.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
      {layers.throughput && (
        <ul className="twin-layer-panel" data-testid="twin-throughput-panel">
          {SITES.map((s) => {
            const t = THROUGHPUT.find((x) => x.siteId === s.id);
            return (
              <li key={s.id}>
                <button type="button" onClick={() => { const m = mapRef.current; if (m) m.flyTo({ center: [s.lon, s.lat], zoom: 13, duration: 800 }); }}>
                  <b>{s.name}</b> — {t?.figure}
                </button>
                <span>{s.address} · {t?.source}</span>
              </li>
            );
          })}
        </ul>
      )}

      <p className="twin-status" aria-live="polite">{status}</p>
      {addressLabel && <p className="twin-address">Located point: {addressLabel}</p>}
      {routeMode === 'straight' && (
        <p className="twin-note">Road routing was unavailable for this pipeline, so the line is drawn straight between its real sites.</p>
      )}
      {!borough.buildings && (
        <p className="twin-note">
          Building geometry in this panel covers Lower Manhattan only. {borough.label} shows its real street grid
          with pipeline nodes — no buildings are invented for it.
        </p>
      )}

      {chain && (
        <ol className="twin-itinerary" data-testid="twin-itinerary">
          {chain.steps.map((step, i) => (
            <li key={`${step.name}-${i}`}>
              <span className={`twin-step-role twin-step-${step.kind}`}>{step.label}</span>
              <b>{step.name}</b>
              <span className="twin-step-address">{step.address}</span>
              <span className="twin-step-note">{step.note}</span>
            </li>
          ))}
        </ol>
      )}
      {chain?.onward && <p className="twin-note">{chain.onward}</p>}
      {chain?.gapNote && <p className="twin-note">{chain.gapNote}</p>}

      <p className="twin-legend">
        <span><i className="twin-swatch twin-swatch-line" /> Pipeline route</span>
        <span><i className="twin-swatch twin-swatch-lime" /> Pipeline building (nearest real building, lime)</span>
      </p>
      <p className="twin-sources">
        Sources: site locations — Sims Sunset Park MRF, Newtown Creek WRRF (NYC DEP), Pratt Industries paper mill,
        Fresh Kills hub (DSNY); street grid — Esri World Dark Gray (Esri, © OpenStreetMap contributors); buildings
        — NYC Open Data, Building Footprints (7,209 Lower Manhattan buildings, roof heights); road geometry — OSRM
        on OpenStreetMap data. Routes follow real streets between real sites; they are not DSNY collection routes.
        DSNY does not publish turn-by-turn collection routes — it publishes district/frequency boundaries,
        district-to-vendor assignments, and disposal facilities used by year (NYC Open Data). DSNY marine transfer
        stations with verified addresses but no map pin (address lookup failed during this build, so no coordinates
        were guessed): {DSNY_HUBS_UNPINNED.map((h) => `${h.name} (${h.address})`).join('; ')}. Layers: borough tonnage — DSNY Monthly Tonnage (ebb7-mvp5), latest month, borough totals; district boundaries — DSNY Districts (i6mn-amj2), outlines only; throughput figures — as cited per site in the throughput panel.
      </p>
    </div>
  );
}
