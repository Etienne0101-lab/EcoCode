import { useState } from 'react';
import {
  Activity, ArrowDown, ArrowRight, ArrowUpRight, BarChart3, Building2,
  Check, ChevronRight, Cloud, Github, Layers3, Map, Menu, Radio,
  Recycle, Route, Signal, Truck, Waves, X,
} from 'lucide-react';
import { Link } from 'wouter';
import './WasteIntelligencePage.css';

const REPO_URL = 'https://github.com/EcoCode-Smart-City-Infrastructure/waste-intelligence-platform';

const scales = [
  {
    id: 'building',
    label: 'One building',
    descriptor: 'A close-up operating picture',
    title: 'Start at the point of disposal.',
    copy: 'A building context can bring together fill-level and collection observations across waste, recycling and organics areas. Building operators can review service patterns and surface conditions that may need attention.',
    places: ['Residential properties', 'Commercial buildings', 'Shared waste rooms'],
    nodes: ['WASTE ROOM', 'COLLECTION POINT', 'BUILDING TEAM'],
  },
  {
    id: 'district',
    label: 'Multi-block district',
    descriptor: 'Coordinate across nearby sites',
    title: 'Read the relationships between blocks.',
    copy: 'At district scale, aggregated signals can help teams compare collection conditions across nearby buildings and streets, and consider how service activity relates to routes and receiving facilities.',
    places: ['Mixed-use districts', 'Campus clusters', 'Commercial corridors'],
    nodes: ['BUILDINGS', 'BLOCK GATEWAY', 'DISTRICT VIEW'],
  },
  {
    id: 'borough',
    label: 'Borough context',
    descriptor: 'Plan across a wider service area',
    title: 'Make spatial patterns easier to inspect.',
    copy: 'A borough-scale context is intended to support wider spatial analysis: bringing service observations into a common frame for planning, facility coordination and public-facing waste insights.',
    places: ['Municipal service areas', 'Transfer and processing hubs', 'Neighborhood planning'],
    nodes: ['FIELD SIGNALS', 'SERVICE NETWORK', 'FACILITY CONTEXT'],
  },
] as const;

const layers = [
  {
    id: 'field',
    label: '01 / Field sensing',
    title: 'Observe the material stream',
    icon: Radio,
    copy: 'Modular sensing is designed to capture relevant conditions at bins and collection points. Potential signals include fill level, mass, temperature and gas indicators; contamination analysis may use optional imagery where appropriate.',
    bullets: ['Fill-level and service observations', 'Optional mass and environmental signals', 'Sensor modules configured to the site'],
  },
  {
    id: 'connectivity',
    label: '02 / Gateways & connectivity',
    title: 'Carry observations through dense streets',
    icon: Signal,
    copy: 'Gateways and resilient connectivity are intended to aggregate distributed observations across buildings and blocks. The architecture leaves room for different network choices based on coverage, installation and operating constraints.',
    bullets: ['Building and block-level aggregation', 'LoRaWAN / NB-IoT connectivity options', 'Designed for variable urban environments'],
  },
  {
    id: 'cloud',
    label: '03 / Cloud & analysis',
    title: 'Turn signals into useful context',
    icon: Cloud,
    copy: 'A cloud analytics layer is intended to organize incoming telemetry for review and analysis—not to remove human judgment. Forecasting and anomaly methods can be explored as the data and operating context allow.',
    bullets: ['Temporal forecasting concepts', 'Spatial patterns from block to borough', 'Anomaly and contamination analysis'],
  },
  {
    id: 'operators',
    label: '04 / Operator interfaces',
    title: 'Put the picture in reach of people',
    icon: BarChart3,
    copy: 'Operator interfaces are designed to help municipal teams, building managers, researchers and sustainability staff compare conditions, inspect patterns and communicate what the evidence does—and does not—show.',
    bullets: ['Operational and facility views', 'GIS-informed review', 'Public-engagement possibilities'],
  },
] as const;

const outcomes = [
  { index: 'A', title: 'Operational planning', icon: Route, text: 'Use observed service patterns to inform collection review and route planning.' },
  { index: 'B', title: 'Environmental insight', icon: Recycle, text: 'Explore diversion and contamination signals as inputs to waste-system learning.' },
  { index: 'C', title: 'Facility coordination', icon: Building2, text: 'Consider how inbound-load forecasts could support facility planning and congestion awareness.' },
  { index: 'D', title: 'Public understanding', icon: Waves, text: 'Make neighborhood-level waste context easier to explain and discuss.' },
];

function Wordmark() {
  return (
    <Link className="wi-wordmark" href="/" aria-label="EcoCode home" data-testid="link-wi-home">
      <span className="wi-brand-mark" aria-hidden="true"><i /><i /><i /></span>
      <span className="wi-brand-name">eco<span>code</span></span>
      <span className="wi-brand-llc">LLC</span>
    </Link>
  );
}

export default function WasteIntelligencePage() {
  const [scaleId, setScaleId] = useState<(typeof scales)[number]['id']>('district');
  const [layerId, setLayerId] = useState<(typeof layers)[number]['id']>('field');
  const [menuOpen, setMenuOpen] = useState(false);
  const scale = scales.find((item) => item.id === scaleId) ?? scales[1];
  const layer = layers.find((item) => item.id === layerId) ?? layers[0];
  const ActiveLayerIcon = layer.icon;

  return (
    <div className="wi-page" id="wi-top">
      <div className="wi-topline">
        <div className="wi-wrap wi-topline-inner">
          <span className="wi-eyebrow"><i /> Connected waste intelligence for city operations</span>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" data-testid="link-wi-top-project">Public project <ArrowUpRight size={13} /></a>
        </div>
      </div>
      <header className="wi-header">
        <div className="wi-wrap wi-header-inner">
          <Wordmark />
            <nav className="wi-nav" aria-label="Page navigation">
              <a href="#wi-purpose" data-testid="link-wi-nav-purpose">Purpose</a><a href="#wi-architecture" data-testid="link-wi-nav-architecture">Architecture</a><a href="#wi-capabilities" data-testid="link-wi-nav-capabilities">Capabilities</a><a href="#wi-collaborate" data-testid="link-wi-nav-collaborate">Collaborate</a>
          </nav>
            <a className="wi-header-cta" href={REPO_URL} target="_blank" rel="noopener noreferrer" data-testid="link-wi-header-github">Explore on GitHub <ArrowUpRight size={14} /></a>
          <button className="wi-menu-button" type="button" aria-expanded={menuOpen} aria-controls="wi-mobile-nav" aria-label={menuOpen ? 'Close page navigation' : 'Open page navigation'} onClick={() => setMenuOpen((open) => !open)} data-testid="button-wi-menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && <nav id="wi-mobile-nav" className="wi-mobile-nav" aria-label="Mobile page navigation">
          {[['Purpose', '#wi-purpose'], ['Architecture', '#wi-architecture'], ['Capabilities', '#wi-capabilities'], ['Collaborate', '#wi-collaborate']].map(([label, href]) => <a key={href} href={href} data-testid={`link-wi-mobile-${label.toLowerCase()}`} onClick={() => setMenuOpen(false)}>{label}<ArrowRight size={14} /></a>)}
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" data-testid="link-wi-mobile-github" onClick={() => setMenuOpen(false)}>Public GitHub project<ArrowUpRight size={14} /></a>
        </nav>}
      </header>

      <main>
        <section className="wi-hero" aria-labelledby="wi-title">
          <div className="wi-hero-map" aria-hidden="true" />
          <div className="wi-wrap wi-hero-layout">
            <div className="wi-hero-copy">
              <div className="wi-kicker"><span /> WASTE INTELLIGENCE PLATFORM / PROJECT 01</div>
              <h1 id="wi-title">Waste intelligence,<br /><em>made legible.</em></h1>
              <p className="wi-hero-lede">A modular sensing and analytics framework for understanding how waste moves through dense urban environments—from collection points to the facilities that receive it.</p>
              <div className="wi-hero-actions">
                <a className="wi-button wi-button-ochre" href="#wi-architecture" data-testid="link-wi-hero-architecture">Explore the architecture <ArrowRight size={15} /></a>
                <a className="wi-text-link" href="#wi-scale" data-testid="link-wi-hero-scale">Explore by scale <ArrowDown size={14} /></a>
              </div>
              <div className="wi-hero-note"><Activity size={15} /><span>A modular framework for connected collection operations.</span></div>
            </div>
              <div className="wi-hero-visual" role="img" aria-label="Illustrative map-like network connecting urban waste collection points and facilities" data-testid="visual-wi-network">
              <div className="wi-visual-meta"><span>FIELD → FACILITY</span><span>ILLUSTRATIVE SYSTEM VIEW / 01</span></div>
              <div className="wi-map-frame">
                <div className="wi-map-cross wi-cross-x" /><div className="wi-map-cross wi-cross-y" />
                <svg viewBox="0 0 600 420" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M74 272L163 196L251 235L337 128L431 182L526 91M163 196L195 319L311 325L431 182L475 283L526 91M251 235L337 128M195 319L74 272M311 325L387 375L475 283" />
                  <path className="wi-route-dash" d="M74 272L163 196L251 235L337 128L431 182L526 91" />
                </svg>
                {[
                  ['COLLECTION', 'n1'], ['BLOCK GATEWAY', 'n2'], ['TRANSFER', 'n3'], ['PROCESSING', 'n4'], ['BUILDING', 'n5'],
                ].map(([label, cls]) => <span key={cls} className={`wi-map-node ${cls}`}><i /><b>{label}</b></span>)}
                <span className="wi-map-label wi-map-label-a">DENSE-CITY CONTEXT<br /><small>STREETS · BUILDINGS · SERVICE</small></span>
                <span className="wi-map-label wi-map-label-b">SIGNAL / 02<br /><small>AGGREGATION</small></span>
                <span className="wi-map-coordinate">URBAN GRID<br />FIELD / 01</span>
              </div>
              <div className="wi-visual-footer"><span>CONNECTED FIELD OPERATIONS</span><span className="wi-mono">ILLUSTRATIVE SYSTEM VIEW</span></div>
            </div>
          </div>
          <div className="wi-hero-ribbon"><div className="wi-wrap"><span>ONE OPERATING PICTURE</span><i /> BUILDINGS <i /> BLOCKS <i /> ROUTES <i /> FACILITIES <i /> COMMUNITIES</div></div>
        </section>

        <section className="wi-purpose wi-section" id="wi-purpose">
          <div className="wi-wrap">
            <div className="wi-section-intro">
              <div><span className="wi-eyebrow wi-section-index">01 / THE URBAN WASTE PROBLEM</span><h2>Waste is local.<br /><em>The system is connected.</em></h2></div>
              <div className="wi-intro-aside">
                <p>In a dense city, waste moves through shared rooms, curbside collection, service routes and receiving facilities. Yet the observations that could help teams understand those handoffs are often distributed across places and workflows.</p>
                <p className="wi-aside-emphasis">The project asks a practical question: what becomes easier to see when field signals are brought into context?</p>
              </div>
            </div>
            <div className="wi-problem-strip" data-testid="text-wi-problem">
              <div className="wi-problem-lead"><span className="wi-mono">THE GAP</span><strong>Disconnected<br />observations.</strong></div>
              <div><span className="wi-small-index">01</span><h3>Static service assumptions</h3><p>Fixed schedules and occasional checks can leave limited context about changing conditions on the ground.</p></div>
              <div><span className="wi-small-index">02</span><h3>Signals in separate places</h3><p>Collection, building and facility observations may be hard to review as one connected material flow.</p></div>
              <div><span className="wi-small-index">03</span><h3>Planning without a shared lens</h3><p>Operators and civic teams need evidence that can be compared across sites, routes and service areas.</p></div>
            </div>
          </div>
        </section>

        <section className="wi-scale-section" id="wi-scale">
          <div className="wi-wrap">
            <div className="wi-scale-heading">
              <div><span className="wi-eyebrow wi-section-index">02 / EXPLORE THE OPERATING SCALE</span><h2>One building to<br /><em>a wider city view.</em></h2></div>
              <p>Choose a context to see how the same modular idea shifts from a close-up operating view to broader spatial coordination.</p>
            </div>
            <div className="wi-scale-explorer">
              <div className="wi-scale-side">
                <div className="wi-scale-tabs" role="group" aria-label="Choose deployment scale" data-testid="group-wi-scale">
                  {scales.map((item, index) => <button key={item.id} type="button" className={scaleId === item.id ? 'is-active' : ''} aria-pressed={scaleId === item.id} onClick={() => setScaleId(item.id)} data-testid={`button-wi-scale-${item.id}`}>
                    <span className="wi-mono">0{index + 1}</span><span><b>{item.label}</b><small>{item.descriptor}</small></span><ChevronRight size={15} />
                  </button>)}
                </div>
                <div className="wi-scale-copy" aria-live="polite" data-testid="panel-wi-scale">
                  <span className="wi-eyebrow">SELECTED CONTEXT / {scale.label.toUpperCase()}</span>
                  <h3>{scale.title}</h3><p>{scale.copy}</p>
                  <ul>{scale.places.map((place) => <li key={place}><Check size={13} />{place}</li>)}</ul>
                </div>
              </div>
              <div className={`wi-scale-graphic wi-scale-${scale.id}`} role="img" aria-label={`${scale.label} illustrative systems diagram`} data-testid="visual-wi-scale-diagram">
                <div className="wi-graphic-top"><span>CONNECTED OPERATIONS</span><span className="wi-mono">CONTEXT / {scale.id.toUpperCase()}</span></div>
                <div className="wi-scale-grid">
                  <div className="wi-block-map" aria-hidden="true">
                    <div className="wi-street wi-street-a" /><div className="wi-street wi-street-b" /><div className="wi-street wi-street-c" />
                    <span className="wi-block b-a" /><span className="wi-block b-b" /><span className="wi-block b-c" /><span className="wi-block b-d" /><span className="wi-block b-e" /><span className="wi-block b-f" />
                    <span className="wi-map-pin pin-a"><i /></span><span className="wi-map-pin pin-b"><i /></span><span className="wi-map-pin pin-c"><i /></span>
                    <svg viewBox="0 0 400 270" preserveAspectRatio="none"><path d="M54 184L134 104L220 146L300 72L348 188" /></svg>
                  </div>
                  <div className="wi-context-nodes">
                    {scale.nodes.map((node, i) => <div className="wi-context-node" key={node}><span className="wi-context-node-num">0{i + 1}</span><span className="wi-context-dot" /><b>{node}</b></div>)}
                    <div className="wi-context-arrow"><span /><span /><span /></div>
                    <div className="wi-view-card"><Map size={17} /><span>Shared operational<br />context</span></div>
                  </div>
                </div>
                <div className="wi-graphic-bottom"><span>FIELD SIGNALS / AGGREGATED BY CONTEXT</span><span>ILLUSTRATIVE ONLY</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="wi-architecture wi-section" id="wi-architecture">
          <div className="wi-wrap">
            <div className="wi-architecture-heading">
              <div><span className="wi-eyebrow wi-section-index">03 / MODULAR ARCHITECTURE</span><h2>From field signal<br /><em>to operator view.</em></h2></div>
              <p>Four connected layers describe the intended system shape. Select any layer to inspect its role and design considerations.</p>
            </div>
            <div className="wi-architecture-board">
              <div className="wi-layer-list" role="group" aria-label="Choose an architecture layer" data-testid="group-wi-architecture">
                {layers.map((item) => {
                  const Icon = item.icon;
                  return <button key={item.id} type="button" aria-pressed={layerId === item.id} aria-controls="wi-layer-panel" className={layerId === item.id ? 'is-active' : ''} onClick={() => setLayerId(item.id)} data-testid={`button-wi-layer-${item.id}`}>
                    <Icon size={18} /><span>{item.label}</span><ChevronRight size={15} />
                  </button>;
                })}
              </div>
              <article className="wi-layer-detail" id="wi-layer-panel" aria-live="polite" data-testid="panel-wi-architecture">
                <div className="wi-layer-detail-top"><span className="wi-mono">LAYER / {layer.label.slice(0, 2)}</span><ActiveLayerIcon size={19} /></div>
                <h3>{layer.title}</h3><p>{layer.copy}</p>
                <ul>{layer.bullets.map((bullet) => <li key={bullet}><span /><span>{bullet}</span></li>)}</ul>
              </article>
              <div className="wi-stack-preview" aria-label="Architecture sequence: sensing, aggregation, analytics and interfaces">
                <span className="wi-eyebrow">SIGNAL PATH</span>
                <div className="wi-stack-line">
                  <span className={layerId === 'field' ? 'current' : ''}><Radio size={18} /><b>Sense</b></span><i />
                  <span className={layerId === 'connectivity' ? 'current' : ''}><Signal size={18} /><b>Connect</b></span><i />
                  <span className={layerId === 'cloud' ? 'current' : ''}><Cloud size={18} /><b>Interpret</b></span><i />
                  <span className={layerId === 'operators' ? 'current' : ''}><BarChart3 size={18} /><b>Use</b></span>
                </div>
                <p>Modular by design; configuration depends on the site, available signals and operating needs.</p>
              </div>
            </div>
              <div className="wi-architecture-footnote"><Layers3 size={16} /><span>Each layer can be configured around site signals, operating conditions and the needs of the people using it.</span></div>
          </div>
        </section>

        <section className="wi-capabilities wi-section" id="wi-capabilities">
          <div className="wi-wrap">
            <div className="wi-capabilities-head">
              <div><span className="wi-eyebrow wi-section-index">04 / ANALYSIS CAPABILITIES</span><h2>Questions the signals<br /><em>could help answer.</em></h2></div>
              <div className="wi-capability-caveat"><span className="wi-caveat-mark">i</span><p>Machine-learning approaches to forecasting and anomaly analysis can help operators explore patterns. Useful signals and validation depend on local data, service definitions and operating context.</p></div>
            </div>
            <div className="wi-capability-grid">
              <article className="wi-capability wi-cap-forecast"><span className="wi-cap-number">01</span><div className="wi-cap-icon"><Activity size={19} /></div><span className="wi-eyebrow">TIME / FORECASTING</span><h3>When could demand change?</h3><p>Explore temporal forecasting of waste generation, overflow likelihood and facility loads as a planning aid.</p><div className="wi-mini-chart" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><i /></div><small className="wi-mono">CONCEPTUAL SIGNAL CURVE</small></article>
              <article className="wi-capability wi-cap-spatial"><span className="wi-cap-number">02</span><div className="wi-cap-icon"><Map size={19} /></div><span className="wi-eyebrow">PLACE / SPATIAL ANALYSIS</span><h3>Where do patterns gather?</h3><p>Compare observations across blocks, neighborhoods and broader service areas in a GIS-informed view.</p><div className="wi-spatial-marks" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><span /></div><small className="wi-mono">BLOCK → NEIGHBORHOOD → BOROUGH</small></article>
              <article className="wi-capability wi-cap-anomaly"><span className="wi-cap-number">03</span><div className="wi-cap-icon"><Activity size={19} /></div><span className="wi-eyebrow">EXCEPTION / ANOMALIES</span><h3>What needs a closer look?</h3><p>Investigate unusual sensor readings, cluster-level variation or unexpected changes in waste observations.</p><div className="wi-anomaly-line" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><i /></div><small className="wi-mono">REVIEWABLE DEVIATIONS</small></article>
              <article className="wi-capability wi-cap-contamination"><span className="wi-cap-number">04</span><div className="wi-cap-icon"><Recycle size={19} /></div><span className="wi-eyebrow">MATERIAL / CONTAMINATION</span><h3>What is entering the stream?</h3><p>Consider contamination analysis from sensor metadata and optional imagery, subject to appropriate data and validation.</p><div className="wi-material-tags" aria-hidden="true"><span>ORGANICS</span><span>RECYCLING</span><span>RESIDUAL</span></div><small className="wi-mono">VALIDATION-LED DESIGN</small></article>
            </div>
          </div>
        </section>

        <section className="wi-outcomes wi-section">
          <div className="wi-wrap wi-outcomes-layout">
            <div className="wi-outcomes-intro"><span className="wi-eyebrow wi-section-index">05 / AREAS OF OPPORTUNITY</span><h2>Better context.<br /><em>Better questions.</em></h2><p>A shared operating view can inform service planning, material recovery, facility coordination and public understanding.</p><a href="#wi-collaborate" className="wi-inline-link" data-testid="link-wi-outcomes-collaborate">Discuss the project direction <ArrowRight size={14} /></a></div>
            <div className="wi-outcomes-list">
              {outcomes.map(({ index, title, icon: Icon, text }) => <article key={index} data-testid={`card-wi-outcome-${index.toLowerCase()}`}>
                <span className="wi-outcome-index">{index}</span><span className="wi-outcome-icon"><Icon size={18} /></span><div><h3>{title}</h3><p>{text}</p></div><ArrowUpRight size={15} className="wi-outcome-arrow" />
              </article>)}
            </div>
          </div>
          <div className="wi-wrap wi-city-context" data-testid="card-wi-nyc-pilot">
            <div className="wi-city-copy">
              <span className="wi-eyebrow">NEW YORK CITY / WASTE + FLEET</span>
              <h3>Make the next collection visible.</h3>
              <p>For New York City, the pilot centers on connecting smart-bin fill signals with collection-vehicle telemetry to surface service patterns for review.</p>
            </div>
            <div className="wi-city-target"><span className="wi-eyebrow">OPERATIONAL TARGET</span><strong>November 2026</strong><span>Target milestone</span></div>
            <Link className="wi-city-link" href="/#pilot" data-testid="link-wi-home-nyc-pilot">Explore the NYC pilot <ArrowUpRight size={14} /></Link>
          </div>
          <div className="wi-material-flow" aria-label="Illustrative waste material flow">
            <span><Building2 size={15} /> BUILDINGS</span><i /><span><Truck size={15} /> COLLECTION</span><i /><span><Layers3 size={15} /> AGGREGATION</span><i /><span><Recycle size={15} /> FACILITIES</span><i /><span><BarChart3 size={15} /> SHARED INSIGHT</span>
          </div>
        </section>

        <section className="wi-collaborate" id="wi-collaborate">
          <div className="wi-collab-grid" aria-hidden="true" />
          <div className="wi-wrap wi-collab-layout">
            <div className="wi-collab-copy"><span className="wi-eyebrow">06 / OPEN PROJECT & COLLABORATION</span><h2>Start with a shared<br /><em>field question.</em></h2><p>EcoCode’s public GitHub project is a starting point for collaboration around connected waste intelligence and urban operations.</p><p>Municipal and building operators, sustainability teams, researchers and civic technologists can explore the architecture, exchange context and identify useful next questions.</p><a className="wi-button wi-button-light" href={REPO_URL} target="_blank" rel="noopener noreferrer" data-testid="link-wi-github">Open the public GitHub project <Github size={16} /><ArrowUpRight size={14} /></a></div>
            <aside className="wi-repo-card" data-testid="card-wi-project">
              <div className="wi-repo-head"><span><Github size={16} /></span><span className="wi-mono">PUBLIC PROJECT / STARTING POINT</span><ArrowUpRight size={15} /></div>
              <div className="wi-repo-name">waste-intelligence-<br />platform</div>
              <p>A project exploring modular sensing, aggregation and operational context for urban waste systems.</p>
              <div className="wi-repo-rule" />
              <div className="wi-repo-detail"><span>For</span><b>Municipal · Building · Research</b></div>
              <div className="wi-repo-detail"><span>Approach</span><b>Connected · Modular · Exploratory</b></div>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" data-testid="link-wi-repository-card">View project on GitHub <ArrowUpRight size={14} /></a>
            </aside>
          </div>
        </section>
      </main>
      <footer className="wi-footer">
        <div className="wi-wrap wi-footer-main"><div><Wordmark /><p>Environmental technology for connected public systems.</p></div><div className="wi-footer-links"><span className="wi-eyebrow">ON THIS PAGE</span><a href="#wi-purpose">Urban waste context</a><a href="#wi-architecture">Architecture</a><a href="#wi-capabilities">Analysis capabilities</a></div><div className="wi-footer-note"><span className="wi-eyebrow">PLATFORM APPROACH</span><p>Modular sensing, connectivity and analytics adapt to the signals, sites and operational questions that matter.</p></div></div>
        <div className="wi-wrap wi-footer-bottom"><span>© {new Date().getFullYear()} EcoCode LLC</span><span>Connected field operations, made legible.</span><a href="#wi-top" data-testid="link-wi-back-top">Back to top <ArrowUpRight size={12} /></a></div>
      </footer>
    </div>
  );
}
