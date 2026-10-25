import { useState } from 'react';
import {
  Activity, ArrowDown, ArrowRight, ArrowUpRight, BarChart3, Building2,
  Check, ChevronRight, Github, Layers3, Menu, Recycle, Route,
  ShieldCheck, Signal, Sprout, Wind, X, Zap,
} from 'lucide-react';
import { Link } from 'wouter';
import './KnowledgeGraphPage.css';

const REPO_URL = 'https://github.com/EcoCode-Smart-City-Infrastructure/waste-intelligence-platform';

const steps = [
  {
    id: 'waste',
    label: '01 / Waste types → Processes',
    title: 'Every material has a pathway.',
    icon: Recycle,
    copy: 'Every organic waste type is a node in the graph, mapped to the processes that can transform it. Food scraps, yard waste, coffee grounds, spent grain and fats, oils and grease each carry their own set of viable pathways.',
    fromLabel: 'WASTE TYPES', from: ['Food scraps', 'Yard waste', 'Coffee grounds', 'Spent grain', 'Fats, oils & grease'],
    toLabel: 'PROCESSES', to: ['Aerobic composting', 'Anaerobic digestion', 'BSFL conversion', 'Fermentation', 'Biochar production'],
  },
  {
    id: 'process',
    label: '02 / Processes → Resources',
    title: 'Processes become value chains.',
    icon: Zap,
    copy: 'Each process produces one or more valuable outputs. By following the edges from process to resource, the graph can show what a given batch of organics is positioned to become — before it is collected.',
    fromLabel: 'PROCESSES', from: ['Composting', 'Digestion', 'Fermentation', 'Biochar'],
    toLabel: 'RESOURCES', to: ['Compost', 'Biogas', 'Digestate fertilizer', 'Soil conditioners', 'Animal feed', 'Bio-nutrients'],
  },
  {
    id: 'facility',
    label: '03 / Facilities → Capabilities',
    title: 'Capacity, represented as part of the graph.',
    icon: Building2,
    copy: 'Every facility is represented as a node with its own capabilities and limits, so the graph can reason about where material can actually go — not just where it could go in principle.',
    fromLabel: 'FACILITY NODE', from: ['Accepted waste types', 'Supported processes'],
    toLabel: 'LIVE CONTEXT', to: ['Real-time capacity', 'Environmental constraints', 'Operating schedules'],
  },
  {
    id: 'constraints',
    label: '04 / Constraints → Rules',
    title: 'Rules the graph respects.',
    icon: ShieldCheck,
    copy: 'Regulations, odor limits, contamination thresholds and transport restrictions are encoded as graph constraints, so recommended pathways stay inside the rules a city and its operators actually work under.',
    fromLabel: 'CONSTRAINTS', from: ['Regulatory thresholds', 'Odor limits'],
    toLabel: 'ENCODED RULES', to: ['Compliance rules', 'Contamination thresholds', 'Transport restrictions'],
  },
  {
    id: 'actors',
    label: '05 / Actors → Demand',
    title: 'Demand completes the loop.',
    icon: Sprout,
    copy: 'Urban farms, landscapers, energy buyers and municipal agencies are modeled as resource consumers. Connecting supply to demand is what turns a waste pathway into a circular one.',
    fromLabel: 'RESOURCE OUTPUTS', from: ['Compost', 'Digestate', 'Biogas'],
    toLabel: 'RESOURCE CONSUMERS', to: ['Urban farms', 'Landscapers', 'Energy buyers', 'Municipal agencies'],
  },
] as const;

const benefits = [
  {
    index: 'A', title: 'Real-time circularity', icon: Route,
    text: 'The graph is designed to answer questions that were previously out of reach: where should this batch of organics go to maximize recovery, which facility can process it most efficiently right now, what will it become, and who needs that resource today?',
    foot: 'BATCH → FACILITY → RESOURCE → BUYER',
  },
  {
    index: 'B', title: 'Verified climate impact', icon: Wind,
    text: 'By combining source-level organics mass data with environmental telemetry, the graph is designed to compute methane avoided, CO₂e reductions, energy recovered and nutrient value generated — auditable metrics for cities, regulators and ESG reporting.',
    foot: 'METHANE · CO₂E · ENERGY · NUTRIENTS',
  },
  {
    index: 'C', title: 'Operational optimization', icon: Activity,
    text: 'The same graph structure supports smart routing for organics haulers, facility load balancing, contamination mitigation, odor and air-quality management, pickup scheduling and processing pathway selection.',
    foot: 'ROUTE · BALANCE · SCHEDULE · SELECT',
  },
  {
    index: 'D', title: 'Cross-domain intelligence', icon: Layers3,
    text: 'Integrated into the EcoCode platform, the graph connects organics data to air quality, water quality, soil health, construction emissions, fleet telemetry and building operations — one environmental intelligence layer for the city.',
    foot: 'AIR · WATER · SOIL · FLEET · BUILDINGS',
  },
];

const platformUses = [
  { index: '01', icon: Route, title: 'Real-time organics routing', text: 'Designed to direct organics to the optimal facility based on waste type, facility load, processing efficiency, environmental constraints and carbon impact.' },
  { index: '02', icon: Recycle, title: 'Contamination detection', text: 'Combines bin-level source data with computer-vision models to flag contamination before it reaches processing facilities.' },
  { index: '03', icon: Building2, title: 'Facility optimization', text: 'Explores when facilities will reach capacity, which processes produce the highest resource value, and how loads can balance across the city.' },
  { index: '04', icon: Sprout, title: 'Circular resource marketplace', text: 'Connects resource outputs — compost, digestate, biogas — to the urban farms, landscapers, utilities and agencies that can use them.' },
  { index: '05', icon: BarChart3, title: 'Policy simulation', text: 'Lets cities test new organics mandates, facility expansions, route redesigns, local processing hubs and carbon strategies against the graph before committing.' },
];

function Wordmark() {
  return (
    <Link className="kg-wordmark" href="/" aria-label="EcoCode home" data-testid="link-kg-home">
      <span className="kg-brand-mark" aria-hidden="true"><i /><i /><i /></span>
      <span className="kg-brand-name">eco<span>code</span></span>
      <span className="kg-brand-llc">LLC</span>
    </Link>
  );
}

export default function KnowledgeGraphPage() {
  const [stepId, setStepId] = useState<(typeof steps)[number]['id']>('waste');
  const [menuOpen, setMenuOpen] = useState(false);
  const step = steps.find((item) => item.id === stepId) ?? steps[0];
  const ActiveStepIcon = step.icon;

  return (
    <div className="kg-page" id="kg-top">
      <div className="kg-topline">
        <div className="kg-wrap kg-topline-inner">
          <span className="kg-eyebrow"><i /> The semantic engine of the Waste Intelligence Platform</span>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" data-testid="link-kg-top-project">Public project <ArrowUpRight size={13} /></a>
        </div>
      </div>
      <header className="kg-header">
        <div className="kg-wrap kg-header-inner">
          <Wordmark />
          <nav className="kg-nav" aria-label="Page navigation">
            <a href="#kg-inspiration" data-testid="link-kg-nav-inspiration">Inspiration</a><a href="#kg-model" data-testid="link-kg-nav-model">The model</a><a href="#kg-why" data-testid="link-kg-nav-why">Why it matters</a><a href="#kg-platform" data-testid="link-kg-nav-platform">In the platform</a><a href="#kg-collaborate" data-testid="link-kg-nav-collaborate">Collaborate</a>
          </nav>
          <Link className="kg-header-cta" href="/waste-intelligence" data-testid="link-kg-header-waste">Waste Intelligence <ArrowUpRight size={14} /></Link>
          <button className="kg-menu-button" type="button" aria-expanded={menuOpen} aria-controls="kg-mobile-nav" aria-label={menuOpen ? 'Close page navigation' : 'Open page navigation'} onClick={() => setMenuOpen((open) => !open)} data-testid="button-kg-menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && <nav id="kg-mobile-nav" className="kg-mobile-nav" aria-label="Mobile page navigation">
          {[['Inspiration', '#kg-inspiration'], ['The model', '#kg-model'], ['Why it matters', '#kg-why'], ['In the platform', '#kg-platform'], ['Collaborate', '#kg-collaborate']].map(([label, href]) => <a key={href} href={href} data-testid={`link-kg-mobile-${label.toLowerCase().replace(/\s+/g, '-')}`} onClick={() => setMenuOpen(false)}>{label}<ArrowRight size={14} /></a>)}
          <Link href="/waste-intelligence" data-testid="link-kg-mobile-waste" onClick={() => setMenuOpen(false)}>Waste Intelligence platform<ArrowUpRight size={14} /></Link>
        </nav>}
      </header>

      <main>
        <section className="kg-hero" aria-labelledby="kg-title">
          <div className="kg-hero-map" aria-hidden="true" />
          <div className="kg-wrap kg-hero-layout">
            <div className="kg-hero-copy">
              <div className="kg-kicker"><span /> WASTE INTELLIGENCE PLATFORM / SEMANTIC ENGINE</div>
              <h1 id="kg-title">Waste, mapped to<br /><em>what it can become.</em></h1>
              <p className="kg-hero-lede">The EcoCode Waste-to-Resource Knowledge Graph (W2RKG) transforms raw waste data into actionable environmental intelligence — mapping how every type of organic waste can become a resource: biogas, compost, soil amendments, feedstock or energy.</p>
              <div className="kg-hero-actions">
                <a className="kg-button kg-button-ochre" href="#kg-model" data-testid="link-kg-hero-model">Explore the model <ArrowRight size={15} /></a>
                <a className="kg-text-link" href="#kg-inspiration" data-testid="link-kg-hero-inspiration">The research behind it <ArrowDown size={14} /></a>
              </div>
              <div className="kg-hero-note"><Activity size={15} /><span>A living digital model of the city&rsquo;s organic waste ecosystem.</span></div>
            </div>
            <div className="kg-hero-visual" role="img" aria-label="Illustrative knowledge graph connecting waste types, processes, resources and demand" data-testid="visual-kg-graph">
              <div className="kg-visual-meta"><span>WASTE → RESOURCE</span><span>ILLUSTRATIVE GRAPH VIEW / 01</span></div>
              <div className="kg-graph-frame">
                <div className="kg-graph-cross kg-cross-x" /><div className="kg-graph-cross kg-cross-y" />
                <svg viewBox="0 0 600 420" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M84 292L196 190L318 246L452 138L536 210M196 190L262 88L452 138M318 246L388 322L536 210M196 190L318 246M84 292L196 336L318 246" />
                  <path className="kg-edge-dash" d="M84 292L196 190L318 246L452 138" />
                </svg>
                {[
                  ['FOOD SCRAPS', 'g1'], ['DIGESTION', 'g2'], ['BIOGAS', 'g3'], ['COMPOST', 'g4'], ['URBAN FARM', 'g5'],
                ].map(([label, cls]) => <span key={cls} className={`kg-graph-node ${cls}`}><i /><b>{label}</b></span>)}
                <span className="kg-graph-label kg-graph-label-a">NODE FAMILIES<br /><small>WASTE · PROCESS · RESOURCE</small></span>
                <span className="kg-graph-label kg-graph-label-b">EDGES / PATHWAYS<br /><small>TRANSFORMS · ACCEPTS · NEEDS</small></span>
                <span className="kg-graph-coordinate">CIRCULARITY<br />MODEL / W2RKG</span>
              </div>
              <div className="kg-visual-footer"><span>EVERY MATERIAL, A PATHWAY</span><span className="kg-mono">ILLUSTRATIVE GRAPH VIEW</span></div>
            </div>
          </div>
          <div className="kg-hero-ribbon"><div className="kg-wrap"><span>ONE CONNECTED MODEL</span><i /> WASTE TYPES <i /> PROCESSES <i /> RESOURCES <i /> FACILITIES <i /> CONSTRAINTS <i /> DEMAND</div></div>
        </section>

        <section className="kg-section" id="kg-inspiration">
          <div className="kg-wrap">
            <div className="kg-section-intro">
              <div><span className="kg-eyebrow kg-section-index">01 / SCIENTIFIC INSPIRATION</span><h2>From a research model<br />to <em>a living system.</em></h2></div>
              <div className="kg-intro-aside">
                <p>In 2025, published research demonstrated that waste systems can be represented as knowledge graphs — networks of nodes and relationships describing waste types, processing pathways, resource outputs, facility capabilities and regulatory constraints.</p>
                <p className="kg-aside-emphasis">EcoCode extends that foundation: where the academic model was static, the W2RKG is designed to be dynamic, sensor-driven and operational.</p>
              </div>
            </div>
            <div className="kg-signal-strip" data-testid="text-kg-signals">
              <div className="kg-signal-lead"><span className="kg-mono">LIVE INPUTS</span><strong>Continuously<br />enriched.</strong></div>
              <div><span className="kg-small-index">01</span><h3>Organics mass data</h3><p>Real-time organics mass from source-level sensing hardware, including the Lashie System.</p></div>
              <div><span className="kg-small-index">02</span><h3>Environmental telemetry</h3><p>Air quality, VOCs, temperature and humidity read alongside the material stream.</p></div>
              <div><span className="kg-small-index">03</span><h3>Contamination signals</h3><p>Stream quality and contamination flags attached to the batches they describe.</p></div>
              <div><span className="kg-small-index">04</span><h3>Facility load &amp; capacity</h3><p>Processing load and available capacity kept current at each facility node.</p></div>
              <div><span className="kg-small-index">05</span><h3>Hauler logistics</h3><p>Routing and collection context that connect sources to facilities.</p></div>
              <div><span className="kg-small-index">06</span><h3>Regulatory thresholds</h3><p>Compliance rules and thresholds encoded directly into the graph.</p></div>
            </div>
            <p className="kg-inspiration-note">The result is a living digital model of the city&rsquo;s organic waste ecosystem for cities like New York — updated by sensors, enriched by analysis, and oriented toward circularity.</p>
          </div>
        </section>

        <section className="kg-model-section" id="kg-model">
          <div className="kg-wrap">
            <div className="kg-model-heading">
              <div><span className="kg-eyebrow kg-section-index">02 / HOW THE W2RKG WORKS</span><h2>Five mappings.<br /><em>One graph.</em></h2></div>
              <p>The graph is built from five kinds of relationship. Select any mapping to see what it connects — and what it makes possible.</p>
            </div>
            <div className="kg-model-board">
              <div className="kg-step-list" role="group" aria-label="Choose a graph mapping" data-testid="group-kg-steps">
                {steps.map((item) => {
                  const Icon = item.icon;
                  return <button key={item.id} type="button" aria-pressed={stepId === item.id} aria-controls="kg-step-panel" className={stepId === item.id ? 'is-active' : ''} onClick={() => setStepId(item.id)} data-testid={`button-kg-step-${item.id}`}>
                    <Icon size={18} /><span>{item.label}</span><ChevronRight size={15} />
                  </button>;
                })}
              </div>
              <article className="kg-step-detail" id="kg-step-panel" aria-live="polite" data-testid="panel-kg-step">
                <div className="kg-step-detail-top"><span className="kg-mono">MAPPING / {step.label.slice(0, 2)}</span><ActiveStepIcon size={19} /></div>
                <h3>{step.title}</h3><p>{step.copy}</p>
                <div className="kg-mapping">
                  <div><span className="kg-eyebrow">{step.fromLabel}</span><ul>{step.from.map((chip) => <li key={chip}>{chip}</li>)}</ul></div>
                  <span className="kg-mapping-arrow" aria-hidden="true"><ArrowRight size={15} /></span>
                  <div><span className="kg-eyebrow">{step.toLabel}</span><ul>{step.to.map((chip) => <li key={chip}>{chip}</li>)}</ul></div>
                </div>
              </article>
            </div>
            <div className="kg-flow" aria-label="Illustrative pathway through the graph">
              <span><Recycle size={15} /> WASTE</span><i /><span><Zap size={15} /> PROCESS</span><i /><span><Sprout size={15} /> RESOURCE</span><i /><span><Building2 size={15} /> FACILITY</span><i /><span><Signal size={15} /> DEMAND</span>
            </div>
          </div>
        </section>

        <section className="kg-why kg-section" id="kg-why">
          <div className="kg-wrap">
            <div className="kg-why-head">
              <div><span className="kg-eyebrow kg-section-index">03 / WHY THIS MATTERS</span><h2>Questions a graph<br /><em>can answer.</em></h2></div>
              <div className="kg-why-caveat"><span className="kg-caveat-mark">i</span><p>The W2RKG is a design for operational intelligence: capabilities are described as designed and intended, and depend on the data, facilities and partners in place.</p></div>
            </div>
            <div className="kg-benefit-grid">
              {benefits.map(({ index, title, icon: Icon, text, foot }) => <article className="kg-benefit" key={index} data-testid={`card-kg-benefit-${index.toLowerCase()}`}>
                <span className="kg-benefit-number">{index}</span><div className="kg-benefit-icon"><Icon size={19} /></div><h3>{title}</h3><p>{text}</p><small className="kg-mono">{foot}</small>
              </article>)}
            </div>
          </div>
        </section>

        <section className="kg-section kg-lashie">
          <div className="kg-wrap">
            <div className="kg-section-intro">
              <div><span className="kg-eyebrow kg-section-index">04 / INTEGRATION WITH LASHIE SYSTEM</span><h2>Source data in.<br /><em>Intelligence out.</em></h2></div>
              <div className="kg-intro-aside">
                <p>The W2RKG is designed to work seamlessly with Lashie System, a potential NYC Smart City pilot partner. Lashie provides verified, source-level organics data; EcoCode enriches it with environmental and operational context.</p>
                <p className="kg-aside-emphasis">Together, they form a unified organics intelligence stack designed for city scale.</p>
              </div>
            </div>
            <div className="kg-exchange">
              <div className="kg-exchange-col">
                <span className="kg-eyebrow">LASHIE SYSTEM PROVIDES</span>
                <ul>
                  {['Verified organics mass', 'Tenant-level waste events', 'Source-level diversion metrics', 'Organics quality and contamination flags'].map((item) => <li key={item}><Check size={13} />{item}</li>)}
                </ul>
              </div>
              <span className="kg-exchange-arrow" aria-hidden="true"><ArrowRight size={17} /></span>
              <div className="kg-exchange-col">
                <span className="kg-eyebrow">ECOCODE ENRICHES WITH</span>
                <ul>
                  {['AQI and odor telemetry', 'Facility capacity and processing pathways', 'Hauler logistics', 'Environmental correlations', 'Carbon accounting', 'Circularity scoring'].map((item) => <li key={item}><Check size={13} />{item}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="kg-platform kg-section" id="kg-platform">
          <div className="kg-wrap kg-platform-layout">
            <div className="kg-platform-intro"><span className="kg-eyebrow kg-section-index">05 / INSIDE THE WASTE INTELLIGENCE PLATFORM</span><h2>The semantic<br /><em>backbone.</em></h2><p>The W2RKG is the semantic backbone of the EcoCode Waste Intelligence Platform — the layer that lets sensing, routing and planning reason about the same material world.</p><Link className="kg-inline-link" href="/waste-intelligence" data-testid="link-kg-platform-waste">See the platform it powers <ArrowRight size={14} /></Link></div>
            <div className="kg-platform-list">
              {platformUses.map(({ index, title, icon: Icon, text }) => <article key={index} data-testid={`card-kg-use-${index}`}>
                <span className="kg-platform-index">{index}</span><span className="kg-platform-icon"><Icon size={18} /></span><div><h3>{title}</h3><p>{text}</p></div><ArrowUpRight size={15} className="kg-platform-arrow" />
              </article>)}
            </div>
          </div>
        </section>

        <section className="kg-beyond kg-section">
          <div className="kg-wrap">
            <div className="kg-section-intro">
              <div><span className="kg-eyebrow kg-section-index">06 / BEYOND WASTE: THE URBAN OS</span><h2>Not just a waste tool.<br /><em>A city intelligence engine.</em></h2></div>
              <div className="kg-intro-aside">
                <p>Built on EcoCode&rsquo;s modular IoT platform, the same graph approach can extend to construction emissions, stormwater quality, soil contamination, air-quality hotspots, industrial waste flows, fleet emissions and building health.</p>
                <p className="kg-aside-emphasis">One environmental operating system for modern cities.</p>
              </div>
            </div>
            <div className="kg-city-strip" data-testid="text-kg-city">
              <div className="kg-city-lead"><span className="kg-mono">WHY CITIES NEED THIS</span><strong>Pressure is<br />mounting.</strong></div>
              <div><h3>Organics mandates</h3><p>New rules require diversion that cities must be able to plan and prove.</p></div>
              <div><h3>Climate deadlines</h3><p>Landfill restrictions and emissions targets are converging on the same waste streams.</p></div>
              <div><h3>Community concerns</h3><p>Odor and air-quality concerns shape where and how facilities can operate.</p></div>
              <div><h3>Fragmented data</h3><p>Infrastructure bottlenecks persist when every actor sees only their own slice.</p></div>
            </div>
            <div className="kg-answer-row">
              <span className="kg-eyebrow">THE GRAPH ANSWERS WITH</span>
              <ul>{['Unified data', 'Real-time intelligence', 'Circular resource pathways', 'Verified climate impact', 'Operational optimization', 'Scalable Smart City integration'].map((item) => <li key={item}><Check size={13} />{item}</li>)}</ul>
            </div>
          </div>
        </section>

        <section className="kg-collaborate" id="kg-collaborate">
          <div className="kg-collab-grid" aria-hidden="true" />
          <div className="kg-wrap kg-collab-layout">
            <div className="kg-collab-copy"><span className="kg-eyebrow">07 / CALL TO ACTION</span><h2>Turn waste into a<br /><em>city-scale asset.</em></h2><p>EcoCode invites municipalities, waste haulers, facility operators and technology partners — like Lashie System — to join us in building the next generation of waste-to-resource intelligence.</p><p>Together, we can transform organic waste from a liability into a city-scale environmental asset.</p><a className="kg-button kg-button-light" href={REPO_URL} target="_blank" rel="noopener noreferrer" data-testid="link-kg-github">Open the public GitHub project <Github size={16} /><ArrowUpRight size={14} /></a></div>
            <aside className="kg-repo-card" data-testid="card-kg-project">
              <div className="kg-repo-head"><span><Github size={16} /></span><span className="kg-mono">PUBLIC PROJECT / KNOWLEDGE GRAPH</span><ArrowUpRight size={15} /></div>
              <div className="kg-repo-name">waste-intelligence-<br />platform</div>
              <p>The W2RKG engine lives in EcoCode&rsquo;s open waste intelligence project — the semantic layer connecting materials, processes, facilities and demand.</p>
              <div className="kg-repo-rule" />
              <div className="kg-repo-detail"><span>Engine</span><b>W2RKG · WASTE → RESOURCE</b></div>
              <div className="kg-repo-detail"><span>Approach</span><b>Semantic · Sensor-driven · Open</b></div>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" data-testid="link-kg-repository-card">View project on GitHub <ArrowUpRight size={14} /></a>
            </aside>
          </div>
        </section>
      </main>
      <footer className="kg-footer">
        <div className="kg-wrap kg-footer-main"><div><Wordmark /><p>Environmental technology for connected public systems.</p></div><div className="kg-footer-links"><span className="kg-eyebrow">ON THIS PAGE</span><a href="#kg-inspiration">Scientific inspiration</a><a href="#kg-model">How the graph works</a><a href="#kg-why">Why it matters</a></div><div className="kg-footer-links"><span className="kg-eyebrow">PLATFORM</span><Link href="/waste-intelligence">Waste Intelligence page</Link><Link href="/partners">Partners page</Link><Link href="/">EcoCode home</Link></div><div className="kg-footer-note"><span className="kg-eyebrow">THE ENGINE</span><p>Waste types, processes, resources, facilities, constraints and demand — one graph, oriented toward circularity.</p></div></div>
        <div className="kg-wrap kg-footer-bottom"><span>© {new Date().getFullYear()} EcoCode LLC</span><span>Every material, a pathway.</span><a href="#kg-top" data-testid="link-kg-back-top">Back to top <ArrowUpRight size={12} /></a></div>
      </footer>
    </div>
  );
}
