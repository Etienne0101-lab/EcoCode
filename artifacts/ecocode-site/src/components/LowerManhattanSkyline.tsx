import { useEffect, useRef, useState } from 'react';
import './LowerManhattanSkyline.css';

/**
 * LowerManhattanSkyline — real Lower Manhattan, in 3D, on the homepage.
 *
 * Geometry comes from NYC Open Data Building Footprints (dataset 5zhs-2jue),
 * Manhattan BIN 1000000–1999999, filtered to Lower Manhattan (lon −74.022 to
 * −73.985, lat 40.700 to 40.732) and projected to metres around the area
 * centre: 7,209 buildings, each with a surveyed roof height (feet converted
 * to metres; 75 buildings with no height in the source use a 4 m fallback,
 * counted in the stats below rather than hidden).
 *
 * Honest claim boundary: footprints and heights are surveyed data. Facades
 * are a procedural window-grid illustration (canvas texture, ~3 m floor
 * spacing) — not photographs, not surveyed facades. Roofs are flat.
 *
 * Performance: three.js and the 1.16 MB dataset load lazily, only when this
 * panel scrolls into view, so the homepage's initial load is untouched.
 * Walls and roofs are two merged geometries; the map's own canvas rule
 * (pale background on every canvas) is neutralised for this panel only.
 */

type SkyState = 'idle' | 'loading' | 'ready' | 'error';
type Building = { h: number; rings: number[][][] };
type Stats = { n: number; avg: string; max: string; fallback: number };

type SkyApi = {
  play: () => void;
  reset: () => void;
  setOrbit: (v: boolean) => void;
  dispose: () => void;
};

function makeWindowTexture(THREE: any, renderer: any) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, 256, 256);
  // One tile = 12 m wide (4 windows) x one 3 m floor. Window glass is dark;
  // roughly one window in six is warm-lit. The texture is multiplied by the
  // per-building vertex colour, so walls keep their height tint.
  const glass = ['#22384f', '#22384f', '#2c4a66', '#1a2c3e', '#314f6b'];
  for (let i = 0; i < 4; i++) {
    const x = 8 + i * 64;
    const lit = Math.random() < 0.16;
    g.fillStyle = lit ? '#ffd27a' : glass[(Math.random() * glass.length) | 0];
    g.fillRect(x, 44, 44, 168);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  try {
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  } catch (e) {}
  return tex;
}

async function buildSkyline(stage: HTMLDivElement): Promise<{ api: SkyApi; stats: Stats }> {
  const THREE = await import('three');
  const earcutMod: any = await import('earcut');
  const earcutFn: (data: number[], holes?: number[], dim?: number) => number[] =
    earcutMod.default ?? earcutMod;
  const base = ((import.meta as any).env?.BASE_URL as string | undefined) || '/';
  const res = await fetch(`${base}lm-skyline-data.json`);
  if (!res.ok) throw new Error(`Skyline dataset failed to load: ${res.status}`);
  const data = await res.json();
  const buildings = data.buildings as Building[];

  const positions: number[] = [];
  const colors: number[] = [];
  const uvs: number[] = [];
  const roofPos: number[] = [];
  const roofCol: number[] = [];
  const cLow = new THREE.Color(0x1d7a4f);
  const cMid = new THREE.Color(0xf5f2e8);
  const cGold = new THREE.Color(0xd3a96c);
  const heightColor = (h: number) => {
    const col = new THREE.Color();
    if (h <= 20) col.copy(cLow);
    else if (h <= 100) col.copy(cLow).lerp(cMid, (h - 20) / 80);
    else col.copy(cMid).lerp(cGold, Math.min(1, (h - 100) / 200));
    return col;
  };
  const pushWallTri = (
    a: number[],
    b: number[],
    c: number[],
    col: any,
    ua: number,
    ub: number,
    va: number,
    vb: number,
    vc: number,
  ) => {
    positions.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    uvs.push(ua, va, ub, vb, ub, vc);
    for (let i = 0; i < 3; i++) colors.push(col.r, col.g, col.b);
  };
  const pushRoofTri = (a: number[], b: number[], c: number[], col: any) => {
    roofPos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    for (let i = 0; i < 3; i++) roofCol.push(col.r, col.g, col.b);
  };

  buildings.forEach((b) => {
    const h = b.h;
    const col = heightColor(h);
    const rings = b.rings;
    if (!rings || !rings.length) return;
    rings.forEach((ring) => {
      for (let i = 0; i < ring.length; i++) {
        const p = ring[i];
        const q = ring[(i + 1) % ring.length];
        const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
        const u = L / 12;
        const v = h / 3;
        const p0 = [p[0], 0, -p[1]];
        const q0 = [q[0], 0, -q[1]];
        const qh = [q[0], h, -q[1]];
        const ph = [p[0], h, -p[1]];
        pushWallTri(p0, q0, qh, col, 0, u, 0, 0, v);
        pushWallTri(p0, qh, ph, col, 0, u, 0, v, v);
      }
    });
    const outer = rings[0];
    let roofed = false;
    try {
      const flat: number[] = [];
      const holes: number[] = [];
      let idx = 0;
      rings.forEach((ring, ri) => {
        if (ri > 0) holes.push(idx);
        ring.forEach((pt) => {
          flat.push(pt[0], -pt[1]);
          idx++;
        });
      });
      const tris = earcutFn(flat, holes, 2);
      for (let t = 0; t + 2 < tris.length; t += 3) {
        const a = [flat[tris[t] * 2], h, flat[tris[t] * 2 + 1]];
        const bb = [flat[tris[t + 1] * 2], h, flat[tris[t + 1] * 2 + 1]];
        const cc = [flat[tris[t + 2] * 2], h, flat[tris[t + 2] * 2 + 1]];
        pushRoofTri(a, bb, cc, col);
      }
      roofed = tris.length > 0;
    } catch (e) {}
    if (!roofed) {
      for (let j = 1; j < outer.length - 1; j++) {
        pushRoofTri(
          [outer[0][0], h, -outer[0][1]],
          [outer[j][0], h, -outer[j][1]],
          [outer[j + 1][0], h, -outer[j + 1][1]],
          col,
        );
      }
    }
  });

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a231a);
  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.position.set(-3000, 5000, 2000);
  scene.add(sun);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(stage.clientWidth, stage.clientHeight);
  renderer.domElement.style.touchAction = 'none';
  stage.appendChild(renderer.domElement);

  const wallsGeo = new THREE.BufferGeometry();
  wallsGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  wallsGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  wallsGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  wallsGeo.computeVertexNormals();
  const roofsGeo = new THREE.BufferGeometry();
  roofsGeo.setAttribute('position', new THREE.Float32BufferAttribute(roofPos, 3));
  roofsGeo.setAttribute('color', new THREE.Float32BufferAttribute(roofCol, 3));
  roofsGeo.computeVertexNormals();

  const tex = makeWindowTexture(THREE, renderer);
  const wallsMat = new THREE.MeshLambertMaterial({ vertexColors: true, map: tex });
  const roofsMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const group = new THREE.Group();
  group.add(new THREE.Mesh(wallsGeo, wallsMat));
  group.add(new THREE.Mesh(roofsGeo, roofsMat));
  scene.add(group);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(20000, 20000),
    new THREE.MeshBasicMaterial({ color: 0x071a14 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1;
  scene.add(ground);

  const camera = new THREE.PerspectiveCamera(
    50,
    stage.clientWidth / stage.clientHeight,
    1,
    50000,
  );
  const view = { az: -0.6, pol: 1.05, dist: 5200, tx: 0, tz: 0 };
  const HOME = { ...view };
  const applyCamera = () => {
    const sp = Math.sin(view.pol);
    camera.position.set(
      view.dist * sp * Math.sin(view.az) + view.tx,
      view.dist * Math.cos(view.pol),
      view.dist * sp * Math.cos(view.az) + view.tz,
    );
    camera.lookAt(view.tx, 0, view.tz);
  };
  applyCamera();

  // Pointer controls: one finger / mouse drag rotates, right-drag pans,
  // two-finger pinch zooms, wheel zooms. One implementation for mouse
  // and touch alike, so the panel works on phones as well as desktops.
  const pointers = new Map<number, { x: number; y: number }>();
  let panning = false;
  let pinchD = 0;
  const el = renderer.domElement;
  const onDown = (e: PointerEvent) => {
    el.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    panning = e.button === 2;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchD = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };
  const onMove = (e: PointerEvent) => {
    if (!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId)!;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchD > 0) view.dist = Math.max(800, Math.min(15000, view.dist * (pinchD / d)));
      pinchD = d;
    } else if (panning) {
      view.tx -= (dx * view.dist) / 1000;
      view.tz += (dy * view.dist) / 1000;
    } else {
      view.az -= dx * 0.005;
      view.pol = Math.max(0.15, Math.min(1.45, view.pol - dy * 0.005));
    }
    applyCamera();
  };
  const onUp = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchD = 0;
    if (pointers.size === 0) panning = false;
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    view.dist = Math.max(800, Math.min(15000, view.dist * (1 + e.deltaY * 0.001)));
    applyCamera();
  };
  const onCtx = (e: Event) => e.preventDefault();
  el.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  el.addEventListener('wheel', onWheel, { passive: false });
  el.addEventListener('contextmenu', onCtx);

  const ro = new ResizeObserver(() => {
    renderer.setSize(stage.clientWidth, stage.clientHeight);
    camera.aspect = stage.clientWidth / stage.clientHeight;
    camera.updateProjectionMatrix();
  });
  ro.observe(stage);

  const orbitRef = { on: false };
  let anim: { start: number; fromAz: number } | null = null;
  let raf = 0;
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (anim) {
      const t = Math.min(1, (now - anim.start) / 5000);
      const e = 1 - Math.pow(1 - t, 3);
      view.az = anim.fromAz + e * 0.9;
      view.pol = 0.35 + e * (HOME.pol - 0.35);
      view.dist = 11000 + e * (HOME.dist - 11000);
      group.scale.y = 0.03 + e * 0.97;
      applyCamera();
      if (t >= 1) anim = null;
    } else if (orbitRef.on) {
      view.az += 0.0012;
      applyCamera();
    }
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(frame);

  const api: SkyApi = {
    play: () => {
      group.scale.y = 0.03;
      anim = { start: performance.now(), fromAz: view.az };
    },
    reset: () => {
      anim = null;
      group.scale.y = 1;
      Object.assign(view, HOME);
      applyCamera();
    },
    setOrbit: (v: boolean) => {
      orbitRef.on = v;
    },
    dispose: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('contextmenu', onCtx);
      wallsGeo.dispose();
      roofsGeo.dispose();
      wallsMat.dispose();
      roofsMat.dispose();
      tex.dispose();
      renderer.dispose();
      if (el.parentElement === stage) stage.removeChild(el);
    },
  };
  const hs = buildings.map((b) => b.h);
  const sum = hs.reduce((a, b) => a + b, 0);
  return {
    api,
    stats: {
      n: hs.length,
      avg: (sum / hs.length).toFixed(1),
      max: Math.max(...hs).toFixed(0),
      fallback: (data as any).fallback_4m_count || 0,
    },
  };
}

export default function LowerManhattanSkyline() {
  const stageRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<SkyApi | null>(null);
  const startedRef = useRef(false);
  const [state, setState] = useState<SkyState>('idle');
  const [error, setError] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [orbit, setOrbit] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let cancelled = false;
    const start = async () => {
      if (startedRef.current) return;
      startedRef.current = true;
      setState('loading');
      try {
        const { api, stats } = await buildSkyline(stage);
        if (cancelled) {
          api.dispose();
          return;
        }
        apiRef.current = api;
        setStats(stats);
        setState('ready');
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Skyline failed to load.');
          setState('error');
        }
      }
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((en) => en.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(stage);
    return () => {
      cancelled = true;
      io.disconnect();
      apiRef.current?.dispose();
      apiRef.current = null;
    };
  }, []);

  const retry = () => {
    startedRef.current = false;
    setError('');
    const stage = stageRef.current;
    if (stage) {
      setState('loading');
      buildSkyline(stage)
        .then(({ api, stats }) => {
          apiRef.current = api;
          setStats(stats);
          setState('ready');
        })
        .catch((e: any) => {
          setError(e?.message || 'Skyline failed to load.');
          setState('error');
        });
    }
  };

  return (
    <div className="lm-skyline">
      <div className="lm-skyline-label">LOWER MANHATTAN, IN 3D</div>
      <p className="lm-skyline-caption">
        Real footprints, real heights — NYC Open Data Building Footprints,
        7,209 Lower Manhattan buildings. Facades are a window-grid
        illustration, not photographs.
      </p>
      <div className="lm-stage" ref={stageRef}>
        {state === 'loading' && (
          <div className="lm-stage-note">Building the skyline from surveyed footprints…</div>
        )}
        {state === 'idle' && (
          <div className="lm-stage-note">Scroll to load the 3D skyline…</div>
        )}
        {state === 'error' && (
          <div className="lm-stage-note lm-stage-error">
            <span>{error || 'Skyline failed to load.'}</span>
            <button className="lm-btn" type="button" onClick={retry}>
              Retry
            </button>
          </div>
        )}
      </div>
      <div className="lm-controls">
        <button
          className="lm-btn primary"
          type="button"
          disabled={state !== 'ready'}
          onClick={() => apiRef.current?.play()}
        >
          ▶ Play 2D → 3D rise
        </button>
        <button
          className="lm-btn"
          type="button"
          disabled={state !== 'ready'}
          onClick={() => apiRef.current?.reset()}
        >
          Reset view
        </button>
        <label className="lm-orbit">
          <input
            type="checkbox"
            checked={orbit}
            disabled={state !== 'ready'}
            onChange={(e) => {
              setOrbit(e.target.checked);
              apiRef.current?.setOrbit(e.target.checked);
            }}
          />
          Slow auto-orbit
        </label>
        <span className="lm-hint">
          Drag to rotate · Scroll / pinch to zoom · Right-drag to pan
        </span>
      </div>
      {stats && (
        <div className="lm-stats">
          <div>
            <b>{stats.n.toLocaleString()}</b>
            <span>Building polygons</span>
          </div>
          <div>
            <b>{stats.avg} m</b>
            <span>Average height</span>
          </div>
          <div>
            <b>{stats.max} m</b>
            <span>Tallest roof</span>
          </div>
          <div>
            <b>{stats.fallback.toLocaleString()}</b>
            <span>4 m fallback heights</span>
          </div>
        </div>
      )}
    </div>
  );
}
