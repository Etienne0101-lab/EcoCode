import { useEffect, useState } from 'react';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Building2,
  Check, ChevronUp, Cloud, Code2, Github, Layers3, Leaf, Menu,
  Radio, Route, ShieldCheck, Signal, Sprout, Waves, Wind, X, Zap,
} from 'lucide-react';
import { Link, Route as WouterRoute, Router, Switch, useLocation } from 'wouter';
import NotFound from './pages/not-found';
import WasteIntelligencePage from './pages/WasteIntelligencePage';

const REPO_URL = 'https://github.com/EcoCode-Smart-City-Infrastructure/waste-intelligence-platform';
const SITE_ORIGIN = 'https://etienne0101-lab.github.io/EcoCode';
const homeMetadata = {
  title: 'EcoCode LLC | Connected City & Environmental Intelligence',
  description: 'EcoCode connects shared sensing, resilient networks and practical analytics across waste, emissions, water, mobility, infrastructure, green space and energy.',
};
const wasteMetadata = {
  title: 'Waste Intelligence Platform for Cities | EcoCode LLC',
  description: 'Explore EcoCode’s Waste Intelligence Platform for dense cities: modular sensing, collection visibility, spatial analysis, operational planning and connected service context.',
};
const navItems = [
  ['Approach', '#approach'],
  ['Architecture', '#architecture'],
  ['Applications', '#applications'],
  ['NYC pilot', '#pilot'],
  ['About', '#about'],
] as const;

const foundations = [
  { icon: Layers3, index: 'CORE 01', title: 'Waste Intelligence Platform', description: 'A connected foundation for waste-service visibility: fill-level signals, collection activity, and operational context in one place.', tags: ['Fill levels', 'Service patterns', 'Fleet context'] },
  { icon: Wind, index: 'CORE 02', title: 'Emissions Monitoring', description: 'Modular air-quality and emissions sensing brings local conditions into the same operational picture.', tags: ['Air quality', 'Emissions signals', 'Reporting'] },
];

const applications = [
  {
    number: '01', icon: Waves, category: 'WATER · RESILIENCE', title: 'Smart Stormwater & Flood Intelligence Network',
    description: 'Water-level, flow, turbidity and pollutant sensors for catch basins, culverts, ponds and drains.',
    outcomes: ['Flood-risk and illicit-discharge detection', 'Public-works alerts informed by rainfall radar and predictive models', 'GIS overlays that highlight vulnerable neighborhoods'],
    market: 'Municipal utilities and stormwater authorities',
    value: 'Flood mitigation and stronger EPA-compliance visibility',
  },
  {
    number: '02', icon: Route, category: 'MOVEMENT · AIR', title: 'Intelligent Traffic & Mobility Flow Monitoring',
    description: 'Vision, traffic-count, air-quality and acoustic sensing across intersections, bike lanes and freight corridors.',
    outcomes: ['Vehicle, pedestrian and cyclist flows, congestion and Vision Zero insights', 'Freight-emissions attribution and noise-pollution mapping', 'Adaptive-signal potential and a path to DSNY waste-truck telematics'],
    market: 'DOTs and transportation agencies',
    value: 'Safer movement, less congestion and attributable emissions',
  },
  {
    number: '03', icon: Building2, category: 'ASSETS · PUBLIC WORKS', title: 'Building Health & Infrastructure Integrity Monitoring',
    description: 'Vibration, tilt, humidity, temperature, corrosion and indoor-air sensing for public buildings, schools, bridges and tunnels.',
    outcomes: ['Structural-fatigue and moisture-intrusion alerts', 'Indoor air-quality signals for CO₂, VOCs and PM2.5', 'Predictive maintenance with municipal asset-system integration'],
    market: 'Public works, facilities and infrastructure operators',
    value: 'Longer-lived assets, fewer emergency repairs and safer spaces',
  },
  {
    number: '04', icon: Sprout, category: 'LAND · CLIMATE', title: 'Urban Green Space & Biodiversity Monitoring',
    description: 'Soil moisture, microclimate, pollinator and tree-health sensing in parks, medians and green roofs.',
    outcomes: ['Irrigation planning and tree-stress signals from temperature, moisture and sap flow', 'Pollinator activity tracking and biodiversity observations', 'Heat-island mapping for sustainability dashboards'],
    market: 'Parks departments and sustainability offices',
    value: 'Climate resilience, lower water use and urban biodiversity',
  },
  {
    number: '05', icon: Zap, category: 'ENERGY · CAMPUS', title: 'Smart Energy & Microgrid Optimization',
    description: 'Connected views of building and transformer loads, solar, batteries and EV charging.',
    outcomes: ['Load balancing, peak shaving and demand-response support', 'Solar and battery optimization with emissions-monitoring inputs', 'EV-charging utilization analytics and carbon accounting'],
    market: 'Municipal energy teams, campuses and utilities',
    value: 'Lower-carbon energy, improved grid stability and cost control',
  },
];

const pilotSteps = [
  { number: '01', title: 'Connect field signals', text: 'Bring smart-bin fill levels and collection-vehicle telemetry into one shared view of municipal operations.' },
  { number: '02', title: 'Coordinate service', text: 'Surface collection conditions and fleet context to support clear, timely decisions for field teams.' },
  { number: '03', title: 'Improve planning', text: 'Use service patterns and operating data to inform route planning and resource allocation.' },
];

function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <a href="#top" className={`wordmark ${light ? 'wordmark-light' : ''}`} aria-label="EcoCode home" data-testid={light ? 'link-footer-home' : 'link-header-home'}>
      <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
      <span className="brand-name">eco<span>code</span></span><span className="brand-llc">LLC</span>
    </a>
  );
}

function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    if (hash) {
      document.getElementById(decodeURIComponent(hash))?.scrollIntoView({ behavior: 'auto', block: 'start' });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
  }, []);

  return (
    <div id="top" className="site-shell">
      <div className="topline">
        <div className="wrap topline-inner">
          <span className="eyebrow"><span className="status-dot" /> Shared intelligence for the systems cities depend on</span>
          <a href="#pilot" className="topline-link" data-testid="link-topline-nyc-pilot">Explore the NYC pilot <ArrowRight size={13} /></a>
        </div>
      </div>
      <header className="site-header">
        <div className="wrap header-inner">
          <Wordmark />
          <nav className="desktop-nav" aria-label="Main navigation">{navItems.map(([label, href]) => <a key={href} className="nav-link" href={href} data-testid={`link-desktop-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}>{label}</a>)}</nav>
          <Link className="header-cta" href="/waste-intelligence" data-testid="link-header-waste-intelligence">Explore Waste Intelligence <ArrowUpRight size={15} /></Link>
          <button className="mobile-toggle" type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation" data-testid="button-toggle-navigation" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        {menuOpen && <nav id="mobile-navigation" className="mobile-nav menu-panel" aria-label="Mobile navigation">
          {navItems.map(([label, href]) => <a key={href} href={href} data-testid={`link-mobile-nav-${label.toLowerCase().replace(/\s+/g, '-')}`} onClick={closeMenu}>{label}<ArrowRight size={15} /></a>)}
          <Link href="/waste-intelligence" data-testid="link-mobile-waste-intelligence" onClick={closeMenu}>Explore Waste Intelligence<ArrowUpRight size={15} /></Link>
        </nav>}
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-art grid-lines" aria-hidden="true" />
          <div className="wrap hero-layout">
            <div className="hero-copy">
              <div className="eyebrow hero-kicker reveal"><span className="kicker-rule" /> One platform. Many city systems.</div>
              <h1 id="hero-title" className="display reveal reveal-delay">Make the<br /><em>unseen</em> work<br />for the city.</h1>
              <p className="hero-description reveal reveal-delay-2">EcoCode connects field sensing, resilient communications and practical analytics—bringing waste, emissions, water, mobility, infrastructure, green space and energy into a shared operational picture.</p>
              <div className="hero-actions reveal reveal-delay-2">
                <a className="button button-primary" href="#architecture" data-testid="link-hero-architecture">Explore the platform <ArrowRight size={16} /></a>
                <a className="button button-text" href="#applications" data-testid="link-hero-applications">See five applications <ArrowDownRight size={16} /></a>
              </div>
              <div className="hero-footnote"><ShieldCheck size={15} /><span>A common architecture, shaped for distinct field realities.</span></div>
            </div>
            <div className="hero-visual reveal reveal-delay" role="img" aria-label="Illustrative network of connected civic, industrial and environmental systems" data-testid="visual-connected-systems-map">
              <div className="visual-caption"><span className="live-indicator" /> PLATFORM MAP / ILLUSTRATIVE</div>
              <div className="map-overlay">
                <div className="map-grid-label top-left">CONNECTED SYSTEMS <span>01—07</span></div>
                <div className="map-grid-label bottom-left">FIELD TO DECISION<br /><span>ILLUSTRATIVE SYSTEMS VIEW</span></div>
                <div className="map-nodes">
                  <span className="node node-a"><i /><b>WASTE</b></span><span className="node node-b"><i /><b>AIR</b></span>
                  <span className="node node-c"><i /><b>WATER</b></span><span className="node node-d"><i /><b>MOBILITY</b></span>
                  <span className="node node-e"><i /><b>ASSETS</b></span><span className="node node-f"><i /><b>ENERGY</b></span>
                  <span className="node node-g"><i /><b>GREEN SPACE</b></span>
                  <svg className="network-lines" viewBox="0 0 600 450" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M90 145L202 94L326 153L459 97M90 145L180 266L326 153L404 300L459 97M180 266L308 357L404 300M326 153L308 357M202 94L308 357" />
                  </svg>
                </div>
                <div className="map-coordinate mono">FIELD SIGNALS<br />→ SHARED CONTEXT</div>
              </div>
              <div className="visual-index mono">FIG. 01&nbsp;&nbsp; / &nbsp;&nbsp;A CITY, IN SIGNALS</div>
            </div>
          </div>
          <div className="hero-ribbon"><div className="wrap ribbon-inner"><span className="eyebrow">One connective layer</span><span>Municipal</span><i /><span>Industrial</span><i /><span>Environmental</span><i /><span>Open interfaces</span><i /><span>Shared insight</span></div></div>
        </section>

        <section className="approach section-pad" id="approach">
          <div className="wrap">
            <div className="section-heading approach-heading">
              <div><div className="eyebrow section-kicker"><span>01</span> / THE OPERATING IDEA</div><h2 className="display">A city is a network<br />of <em>everyday signals.</em></h2></div>
              <div className="approach-aside"><p>Waste routes, storm drains, buildings, streets, parks and power systems each generate signals. EcoCode’s platform direction is to connect those signals to the teams and decisions that need them.</p><a className="arrow-link" href="#architecture" data-testid="link-approach-architecture">See the shared architecture <ArrowRight size={15} /></a></div>
            </div>
            <div className="principles">
              <article className="principle" data-testid="card-principle-field"><span className="principle-index mono">01 — FIELD</span><div className="principle-icon"><Radio size={20} /></div><h3>Sense where work happens.</h3><p>Use adaptable sensor modules to observe conditions across streets, assets and essential services.</p></article>
              <article className="principle" data-testid="card-principle-platform"><span className="principle-index mono">02 — PLATFORM</span><div className="principle-icon"><Code2 size={20} /></div><h3>Bring signals together.</h3><p>Carry distributed telemetry through common connectivity and cloud analytics into usable context.</p></article>
              <article className="principle" data-testid="card-principle-evidence"><span className="principle-index mono">03 — EVIDENCE</span><div className="principle-icon"><BarChart3 size={20} /></div><h3>Make decisions legible.</h3><p>Give operators a path to compare conditions, coordinate response and document what they learn.</p></article>
            </div>
          </div>
        </section>

        <section className="infrastructure section-pad" id="architecture">
          <div className="wrap">
            <div className="infrastructure-head">
              <div><div className="eyebrow section-kicker"><span>02</span> / THE SHARED ARCHITECTURE</div><h2 className="display">One connective layer.<br /><em>Many field realities.</em></h2></div>
              <p>A common family of sensors and modules, gateways, resilient connectivity and cloud analytics supports a growing portfolio of civic, industrial and environmental applications.</p>
            </div>
            <div className="module-grid">
              {foundations.map(({ icon: Icon, index, title, description, tags }) => <article className="module-card foundation-card" key={index} data-testid={`card-platform-foundation-${index.replace(/\s+/g, '-')}`}>
                <div className="module-top"><span className="module-index mono">{index}</span><Icon size={19} strokeWidth={1.7} /></div><h3>{title}</h3><p>{description}</p><div className="module-tags">{tags.map(tag => <span key={tag}>{tag}</span>)}</div>
              </article>)}
            </div>
            <div className="architecture-flow" aria-label="Shared platform architecture" data-testid="status-platform-architecture">
              <span><Radio size={17} /> Sensors &amp; modules</span><i /><span><Signal size={17} /> Gateways</span><i /><span className="flow-connectivity">LoRaWAN / NB-IoT</span><i /><span><Cloud size={17} /> Cloud telemetry</span><i /><span><Activity size={17} /> Analytics &amp; GIS</span>
            </div>
            <p className="architecture-family-list" data-testid="text-platform-module-families"><span>MODULE FAMILIES</span> EdgeSense · LoadTrack · FleetNode · EmisGuard · SiteBeacon</p>
            <p className="architecture-caption">The same building blocks can be configured around different assets, environments and operator needs.</p>
          </div>
        </section>

        <section className="applications section-pad" id="applications">
          <div className="wrap">
            <div className="applications-heading"><div><div className="eyebrow section-kicker"><span>03</span> / APPLICATIONS ON ONE PLATFORM</div><h2 className="display">Five lenses on<br /><em>shared infrastructure.</em></h2></div><p>Different operating environments. Familiar building blocks. Each system adapts the same sensor, gateway, connectivity and analytics family to the work at hand.</p></div>
            <div className="application-list">
              {applications.map(({ number, icon: Icon, category, title, description, outcomes, market, value }) => <article className="application-row" key={number} data-testid={`card-application-${number}`}>
                <div className="application-identity"><span className="application-number mono">{number}</span><span className="application-icon"><Icon size={22} strokeWidth={1.6} /></span><span className="eyebrow">{category}</span></div>
                <div className="application-main"><h3>{title}</h3><p>{description}</p></div>
                <ul>{outcomes.map((item, index) => <li key={item} data-testid={`text-application-outcome-${number}-${index + 1}`}><Check size={14} />{item}</li>)}</ul>
                <div className="application-meta">
                  <div data-testid={`text-application-market-${number}`}><span>BUYER / REVENUE PATH</span><b>{market}</b></div>
                  <div data-testid={`text-application-value-${number}`}><span>STRATEGIC VALUE</span><b>{value}</b></div>
                </div>
              </article>)}
            </div>
            <div className="reuse-band"><div className="reuse-mark"><Layers3 size={20} /></div><div><span className="eyebrow">SHARED PLATFORM, CONFIGURED FOR CONTEXT</span><p>EdgeSense · LoadTrack · FleetNode · EmisGuard · SiteBeacon <b>→</b> gateways <b>→</b> LoRaWAN / NB-IoT mesh <b>→</b> cloud telemetry <b>→</b> analytics</p></div></div>
          </div>
        </section>

        <section className="pilot section-pad" id="pilot">
          <div className="wrap">
            <div className="pilot-top">
              <div><div className="eyebrow section-kicker"><span>04</span> / NYC SMART CITY PILOT</div><h2 className="display">Make the next<br />collection <em>visible.</em></h2></div>
              <div className="pilot-note"><span className="concept-label"><Activity size={12} /> NEW YORK CITY</span><p>The NYC pilot applies EcoCode’s shared waste and fleet intelligence to municipal collection operations: connect smart-bin fill signals with vehicle telemetry, surface service patterns and support better route decisions.</p><p className="pilot-coordination">Deployment coordination with local operators will shape rollout.</p></div>
            </div>
            <div className="pilot-target" data-testid="status-pilot-operational-target"><span className="target-icon"><Activity size={19} /></span><span className="eyebrow">OPERATIONAL TARGET</span><strong>November 2026</strong><span className="target-note">Target milestone</span></div>
            <div className="pilot-steps">{pilotSteps.map(step => <article className="pilot-step" key={step.number} data-testid={`row-pilot-workflow-${step.number}`}><span className="step-num mono">{step.number}</span><div><h3>{step.title}</h3><p>{step.text}</p></div><ArrowDownRight className="step-arrow" size={17} /></article>)}</div>
            <div className="pilot-outcomes" data-testid="card-pilot-outcomes"><div className="outcome-intro"><span className="eyebrow">INTENDED OPERATING OUTCOMES</span><h3>Signals that support<br />day-to-day decisions.</h3></div><div className="outcome-item" data-testid="text-pilot-outcome-collection-visibility"><span className="outcome-index mono">A</span><div><b>Collection visibility</b><small>Surface bin status and service patterns for operational review.</small></div></div><div className="outcome-item" data-testid="text-pilot-outcome-coordinated-response"><span className="outcome-index mono">B</span><div><b>Coordinated response</b><small>Bring field alerts and fleet context into a shared view.</small></div></div><div className="outcome-item" data-testid="text-pilot-outcome-planning"><span className="outcome-index mono">C</span><div><b>Evidence for planning</b><small>Use accumulated signals to inform future service planning.</small></div></div></div>
          </div>
        </section>

        <section className="repo-section">
          <div className="wrap repo-layout">
            <div className="repo-copy"><div className="eyebrow section-kicker"><span>05</span> / OPEN PROJECT</div><h2 className="display">Build across<br /><em>connected systems.</em></h2>
              <p>The EcoCode Smart-City Infrastructure project brings together an open, modular approach to connected waste intelligence and wider urban operations.</p>
              <p>Explore the project and its shared architecture for municipal, industrial and environmental applications.</p>
              <a className="button button-light" href={REPO_URL} target="_blank" rel="noreferrer" data-testid="link-project-github"><Github size={16} /> Explore the GitHub project <ArrowUpRight size={15} /></a>
            </div>
            <div className="repo-card" data-testid="card-open-project"><div className="repo-card-head"><span className="repo-mark"><Code2 size={17} /></span><span className="mono">OPEN PROJECT</span><Github size={17} /></div><div className="repo-title">waste-intelligence-platform</div><p>Distributed IoT mesh for waste intelligence, environmental signals and connected city operations.</p><div className="repo-rule" /><div className="repo-facts"><span>Platform direction</span><b>Modular · connected · open</b></div><div className="repo-facts"><span>Explore the source</span><b>GitHub project</b></div><a href={REPO_URL} target="_blank" rel="noreferrer" className="repo-foot" data-testid="link-project-repository-card">View on GitHub <ArrowUpRight size={14} /></a></div>
          </div>
        </section>

        <section className="about section-pad" id="about">
          <div className="wrap about-layout">
            <div><div className="eyebrow section-kicker"><span>06</span> / WHO WE ARE</div><h2 className="display">Built around<br /><em>public systems.</em></h2></div>
            <div className="about-copy"><p className="about-lede">EcoCode LLC is an environmental technology company founded by EcoGreen Biotech LLC, led by CEO Charles Craun, in collaboration with NGHI.</p><p>Its mission is to help municipalities and operators make environmental and infrastructure operations more measurable through modular connected sensing, open software, cloud telemetry, analytics and reporting designed to be auditable.</p><div className="about-values"><span><Waves size={15} /> Practical field context</span><span><Cloud size={15} /> Connected by design</span><span><ShieldCheck size={15} /> Evidence before claims</span></div></div>
          </div>
        </section>

        <section className="closing">
          <div className="wrap closing-layout"><div className="closing-mark"><Leaf size={22} /></div><div><div className="eyebrow">A SHARED PLATFORM FOR REAL-WORLD SYSTEMS</div><h2 className="display">Start with the<br /><em>right question.</em></h2></div><div className="closing-action"><p>Explore the platform architecture, compare application concepts or open the public GitHub project.</p><a className="button button-primary" href="#applications" data-testid="link-closing-applications">Explore applications <ArrowRight size={15} /></a><a className="closing-secondary" href={REPO_URL} target="_blank" rel="noreferrer" data-testid="link-closing-github">Open the GitHub project <ArrowUpRight size={14} /></a></div></div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer-main">
          <div className="footer-brand"><Wordmark light /><p>Connected intelligence for environmental<br />and infrastructure operations.</p></div>
          <div className="footer-col"><span className="eyebrow">EXPLORE</span>{navItems.map(([label, href]) => <a key={href} href={href} data-testid={`link-footer-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}>{label}</a>)}</div>
          <div className="footer-col"><span className="eyebrow">PROJECT</span><Link href="/waste-intelligence" data-testid="link-footer-waste-intelligence">Waste Intelligence page <ArrowRight size={12} /></Link><a href={REPO_URL} target="_blank" rel="noreferrer" data-testid="link-footer-github">GitHub project <ArrowUpRight size={12} /></a><a href="#architecture" data-testid="link-footer-architecture">Shared architecture <ArrowRight size={12} /></a><a href="#applications" data-testid="link-footer-applications">Application concepts <ArrowRight size={12} /></a></div>
          <div className="footer-note"><span className="eyebrow">ABOUT THIS PLATFORM</span><p>EcoCode brings common sensing, connectivity and analytics building blocks to diverse city and environmental systems.</p></div>
        </div>
        <div className="wrap footer-bottom"><span data-testid="text-copyright">© {new Date().getFullYear()} EcoCode LLC</span><span>Connected systems. Clearer decisions.</span><a href="#top" data-testid="link-back-to-top">Back to top <ChevronUp size={13} /></a></div>
      </footer>
    </div>
  );
}

function setMetaContent(selector: string, content: string) {
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content);
}

function RouteMetadata({ pathname }: { pathname: string }) {
  useEffect(() => {
    const normalizedPath = pathname.replace(/\/+$/, '') || '/';
    const isHome = normalizedPath === '/';
    const isWastePage = normalizedPath === '/waste-intelligence';
    const isPublicRoute = isHome || isWastePage;
    const metadata = isWastePage ? wasteMetadata : homeMetadata;
    const canonicalUrl = `${SITE_ORIGIN}${normalizedPath === '/' ? '/' : normalizedPath}`;

    document.title = isPublicRoute ? metadata.title : 'Page not found | EcoCode LLC';
    setMetaContent('meta[name="description"]', metadata.description);
    setMetaContent('meta[property="og:title"]', metadata.title);
    setMetaContent('meta[property="og:description"]', metadata.description);
    setMetaContent('meta[name="twitter:title"]', metadata.title);
    setMetaContent('meta[name="twitter:description"]', metadata.description);
    setMetaContent('meta[name="robots"]', isPublicRoute ? 'index, follow' : 'noindex, nofollow');

    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (isPublicRoute) {
      const link = canonical ?? document.head.appendChild(document.createElement('link'));
      link.rel = 'canonical';
      link.href = canonicalUrl;
    } else {
      canonical?.remove();
    }
    setMetaContent('meta[property="og:url"]', canonicalUrl);
  }, [pathname]);

  return null;
}

function AppRoutes() {
  const [location] = useLocation();
  const pathname = location.split(/[?#]/, 1)[0] || '/';

  return (
    <>
      <RouteMetadata pathname={pathname} />
      <Switch>
        <WouterRoute path="/waste-intelligence" component={WasteIntelligencePage} />
        <WouterRoute path="/" component={HomePage} />
        <WouterRoute component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  // Serve from a subpath (e.g. GitHub Pages project site) when built with one.
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <Router base={base}>
      <AppRoutes />
    </Router>
  );
}

export default App;
