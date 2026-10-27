/**
 * twinSites — the real-site backbone of the digital twin's pipelines.
 *
 * What is pinned here, and where each coordinate came from:
 * - Sims Sunset Park MRF: 472 2nd Ave, Brooklyn — coordinates
 *   40.66194, -74.00889 from its facility record (NYSDEC permit notice
 *   gives the same address). NYC's primary MRF for curbside metal,
 *   glass and plastic; Bronx/Queens material arrives by barge.
 * - Newtown Creek WRRF: 327 Greenpoint Ave, Brooklyn — full-address
 *   geocode (40.73283, -73.94732). DEP co-digests food scraps with
 *   sludge here; biogas is refined to renewable natural gas for
 *   National Grid.
 * - Pratt Industries paper mill: 4435 Victory Blvd, Staten Island —
 *   business geocode (40.58805, -74.20051). Recycles DSNY paper into
 *   100% recycled boxes; Manhattan paper arrives by barge from the
 *   West 59th Street MTS.
 * - Fresh Kills hub: SI Transfer Station, 300 West Service Rd,
 *   Staten Island — full-address geocode (40.5862, -74.19353). The
 *   Staten Island Compost Facility (450 West Service Rd) sits in the
 *   same Fresh Kills complex, so yard-waste pipelines pin to the
 *   complex and say so, rather than pretending to a separate exact
 *   building pin.
 *
 * NOT pinned, and why: five DSNY marine transfer stations (North
 * Shore, Hamilton Avenue, West 59th Street, East 91st Street,
 * Southwest Brooklyn) have verified addresses from DSNY contract
 * documents, listed below as text, but address lookup failed for
 * them during this build and their coordinates are therefore NOT
 * guessed. Their pins are a known gap, stated in the panel, not
 * papered over with invented points.
 *
 * Routes between pinned points are road-network routes (OSRM on
 * OpenStreetMap data), NOT DSNY collection routes: DSNY does not
 * publish turn-by-turn collection routes. What DSNY does publish is
 * district/frequency boundaries, district-to-vendor assignments, and
 * disposal facilities used by year (NYC Open Data) — the panel cites
 * those instead of claiming a DSNY route.
 */

export type Site = {
  id: string;
  name: string;
  address: string;
  lon: number;
  lat: number;
  source: string;
  note: string;
};

export const SITES: Site[] = [
  {
    id: 'sims',
    name: 'Sims Sunset Park MRF',
    address: '472 2nd Ave, Brooklyn, NY 11232',
    lon: -74.00889,
    lat: 40.66194,
    source: 'NYSDEC permit notice (same address); facility coordinates 40.66194, -74.00889',
    note: "NYC's primary MRF for curbside metal, glass and plastic; Bronx and Queens material arrives by barge.",
  },
  {
    id: 'newtown',
    name: 'Newtown Creek Wastewater Resource Recovery Facility',
    address: '327 Greenpoint Ave, Brooklyn, NY 11222',
    lon: -73.94732,
    lat: 40.73283,
    source: 'NYC DEP resource-recovery pages; full-address geocode',
    note: 'Food scraps arrive as bioslurry via preprocessing, then are co-digested with sludge; biogas goes to National Grid.',
  },
  {
    id: 'pratt',
    name: 'Pratt Industries paper mill',
    address: '4435 Victory Blvd, Staten Island, NY 10314',
    lon: -74.20051,
    lat: 40.58805,
    source: 'DSNY / Curb-to-Market Challenge; business geocode',
    note: 'Recycles DSNY paper into 100% recycled boxes; Manhattan paper arrives by barge from West 59th Street MTS.',
  },
  {
    id: 'freshkills',
    name: 'Fresh Kills hub — Staten Island Transfer Station',
    address: '300 West Service Rd, Staten Island, NY 10314',
    lon: -74.19353,
    lat: 40.5862,
    source: 'DSNY contract facility list; full-address geocode',
    note: 'DSNY transfer station beside Fresh Kills. The Staten Island Compost Facility (450 West Service Rd) is in the same complex.',
  },
];

/** DSNY marine transfer stations with verified addresses but no pin (see header). */
export const DSNY_HUBS_UNPINNED: { name: string; address: string }[] = [
  { name: 'North Shore MTS', address: '119-01 31st Ave, Flushing, NY 11354' },
  { name: 'Hamilton Avenue MTS', address: '500 Hamilton Ave, Brooklyn, NY 11232' },
  { name: 'West 59th Street MTS', address: '901 12th Ave, New York, NY 10023' },
  { name: 'East 91st Street MTS', address: '1740 York Ave, New York, NY 10128' },
  { name: 'Southwest Brooklyn MTS', address: '400 Bay 41st St, Brooklyn, NY 11214' },
];

export type ChainStep = {
  kind: 'origin' | 'hub' | 'processor' | 'demand';
  label: string;
  name: string;
  address: string;
  coord: [number, number];
  note: string;
};

export type Chain = {
  steps: ChainStep[];
  /** Text-only follow-on (no map step) — e.g. refuse onward disposal. */
  onward?: string;
  /** Explains a gap when no verified processor pin exists for the stream. */
  gapNote?: string;
};

const siteById = (id: string): Site => SITES.find((s) => s.id === id) as Site;
const offset = (s: Site, dLon: number, dLat: number): [number, number] => [s.lon + dLon, s.lat + dLat];

function demandAt(site: Site, label: string, note: string): ChainStep {
  return {
    kind: 'demand',
    label,
    name: `${site.name} — ${label}`,
    address: site.address,
    coord: offset(site, 0.01, -0.005),
    note: `${note} Demand marker sits beside the site for visibility; the demand itself is at the site.`,
  };
}

export type RouteKey = 'food' | 'yard' | 'paper' | 'mgp' | 'refuse' | 'gap';

/** Map a free-text stream to a pipeline route. Returns the route plus a human label. */
export function resolveRoute(text: string, classify: (t: string) => string): { route: RouteKey; label: string } {
  if (/\b(refuse|trash|garbage|rubbish|municipal solid waste)\b/i.test(text)) {
    return { route: 'refuse', label: 'Refuse' };
  }
  const category = classify(text);
  if (category === 'organics') return { route: 'food', label: 'Food organics' };
  if (category === 'yard') return { route: 'yard', label: 'Yard organics' };
  if (category === 'paper') return { route: 'paper', label: 'Paper & cardboard' };
  if (category === 'plastic' || category === 'glass' || category === 'metal') return { route: 'mgp', label: 'Metal / glass / plastic' };
  return { route: 'gap', label: text.trim().slice(0, 48) };
}

function nearestSite(origin: [number, number]): Site {
  let best = SITES[0];
  let bestD = Infinity;
  for (const s of SITES) {
    const d = (s.lon - origin[0]) ** 2 + (s.lat - origin[1]) ** 2;
    if (d < bestD) { bestD = d; best = s; }
  }
  return best;
}

export function chainFor(route: RouteKey, origin: [number, number], originLabel: string): Chain {
  const originStep: ChainStep = {
    kind: 'origin',
    label: 'Collection point',
    name: originLabel,
    address: 'As entered or borough centre',
    coord: origin,
    note: 'Where the stream starts in this pipeline.',
  };
  const freshkills = siteById('freshkills');
  const newtown = siteById('newtown');
  const pratt = siteById('pratt');
  const sims = siteById('sims');

  if (route === 'food') {
    return {
      steps: [
        originStep,
        { kind: 'processor', label: 'Processor', name: newtown.name, address: newtown.address, coord: [newtown.lon, newtown.lat], note: newtown.note },
        demandAt(newtown, 'Demand: National Grid gas network', 'Refined biogas is injected as renewable natural gas.'),
      ],
    };
  }
  if (route === 'yard') {
    return {
      steps: [
        originStep,
        { kind: 'processor', label: 'Processor', name: 'Staten Island Compost Facility (Fresh Kills complex)', address: '450 West Service Rd, Staten Island, NY 10314', coord: [freshkills.lon, freshkills.lat], note: 'Pin marks the Fresh Kills complex: the compost facility address is 450 West Service Rd in the same complex as the transfer station pin. Accepts food scraps and yard waste; NYC’s largest permitted compost facility.' },
        demandAt(freshkills, 'Demand: compost distribution', 'DSNY compost giveback and bulk compost return compost to city soils.'),
      ],
    };
  }
  if (route === 'paper') {
    return {
      steps: [
        originStep,
        { kind: 'processor', label: 'Processor', name: pratt.name, address: pratt.address, coord: [pratt.lon, pratt.lat], note: pratt.note },
        demandAt(pratt, 'Demand: NYC market', 'Recycled boxes return to the NYC market they came from — the tightest loop in the system.'),
      ],
    };
  }
  if (route === 'mgp') {
    return {
      steps: [
        originStep,
        { kind: 'processor', label: 'Processor', name: sims.name, address: sims.address, coord: [sims.lon, sims.lat], note: sims.note },
        demandAt(sims, 'Demand: commodity markets', 'Sorted commodities ship from the South Brooklyn Marine Terminal to markets.'),
      ],
    };
  }
  if (route === 'refuse') {
    return {
      steps: [
        originStep,
        { kind: 'hub', label: 'Hub', name: freshkills.name, address: freshkills.address, coord: [freshkills.lon, freshkills.lat], note: freshkills.note },
      ],
      onward: 'Onward: containerized refuse leaves by rail/barge; the final disposal site varies by district and vendor — see DSNY Disposal Facilities Used by Year (NYC Open Data, data.cityofnewyork.us/d/6r9j-qrwz). Documented examples include waste-to-energy in Newark, NJ and landfills in Virginia and South Carolina.',
    };
  }
  const hub = nearestSite(origin);
  return {
    steps: [
      originStep,
      { kind: 'hub', label: 'Hub', name: hub.name, address: hub.address, coord: [hub.lon, hub.lat], note: hub.note },
    ],
    gapNote: 'No verified NYC processing site for this stream is pinned in this panel yet — for example, e-waste runs through DSNY’s ecycleNYC program with Electronic Recyclers International at program level, with no single facility pin verified. The pipeline therefore stops at the nearest pinned hub, and the processor step is a program, not a place.',
  };
}
