import { useState } from 'react';
import {
  Activity, ArrowDown, ArrowRight, ArrowUpRight, Beaker, Building2,
  Check, ChevronRight, FlaskConical, Handshake, Leaf, Microscope,
  Recycle, Route, Sprout, Wind, Zap,
} from 'lucide-react';
import { Link } from 'wouter';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import './PartnersPage.css';

const ECOGREEN_URL = 'https://ecogreenbiotech.com/';

const focusAreas = [
  { index: '01', title: 'Advanced biomaterials', text: 'Materials designed to return value at end of life, rather than end as waste.' },
  { index: '02', title: 'Eco-friendly industrial processes', text: 'Production approaches that lower environmental impact at the point of manufacture.' },
  { index: '03', title: 'Waste-to-resource innovation', text: 'The science of turning organic streams into compost, biogas and nutrients.' },
  { index: '04', title: 'Environmental remediation', text: 'Technologies aimed at restoring soil, water and air affected by pollution.' },
  { index: '05', title: 'Circular-economy products', text: 'Product development built around reuse, recovery and regenerative value.' },
  { index: '06', title: 'Regenerative systems design', text: 'Systems thinking that spans biotechnology, materials and environmental engineering.' },
];

const pillars = [
  {
    id: 'science',
    label: '01 / Environmental science + IoT engineering',
    title: 'Science that makes sensor data legible.',
    icon: Microscope,
    copy: 'EcoGreen Biotech\u2019s research informs the biological, chemical and ecological models EcoCode uses to interpret sensor data \u2014 so a reading becomes an explanation, not just a number.',
    fromLabel: 'MODELS INFORM',
    from: ['Waste decomposition', 'Emissions behaviour', 'Soil and water quality', 'Organic waste processing', 'Microbial activity'],
    toLabel: 'PLATFORM OUTPUT',
    to: ['Scientifically grounded readings', 'Real-time environmental intelligence', 'Context for field decisions'],
  },
  {
    id: 'circularity',
    label: '02 / Waste-to-resource innovation',
    title: 'From waste stream to resource pathway.',
    icon: Recycle,
    copy: 'Work in bioconversion, composting science and bio-nutrient recovery directly supports the Waste Intelligence Platform and the Waste-to-Resource Knowledge Graph (W2RKG).',
    fromLabel: 'ECOGREEN EXPERTISE',
    from: ['Bioconversion', 'Composting science', 'Bio-nutrient recovery'],
    toLabel: 'WHAT IT ENABLES',
    to: ['Map waste to optimal pathways', 'Predict compost, digestate, biogas and nutrients', 'Quantify methane avoided and CO\u2082e reductions', 'Support circular decisions at city scale'],
  },
  {
    id: 'validation',
    label: '03 / Pilot deployment & real-world validation',
    title: 'Proven in the field, not just on paper.',
    icon: FlaskConical,
    copy: 'EcoGreen Biotech collaborates with EcoCode on the fieldwork that grounds the platform: testing, calibration and validation, and the design of pilot programmes with municipal and industrial partners.',
    fromLabel: 'FIELD COLLABORATION',
    from: ['Field testing', 'Sensor calibration', 'Environmental validation', 'Pilot programme design'],
    toLabel: 'PARTNERS IN THE FIELD',
    to: ['Municipal partners', 'Industrial partners', 'Research institutions'],
  },
] as const;

const innovations = [
  { index: '01', icon: Recycle, title: 'Waste-to-Resource Knowledge Graph (W2RKG)', text: 'A dynamic, sensor-driven semantic model mapping how every type of waste can become a resource. EcoGreen Biotech provides the biological and chemical intelligence behind the graph.', link: '/knowledge-graph', linkLabel: 'Explore the graph' },
  { index: '02', icon: Route, title: 'Waste Intelligence Platform', text: 'EcoGreen Biotech\u2019s environmental science powers multi-stream waste analytics, contamination detection and circularity scoring across the platform.', link: '/waste-intelligence', linkLabel: 'Explore the platform' },
  { index: '03', icon: Wind, title: 'Construction Site Environmental Intelligence', text: 'Emissions and particulate research informs construction-site monitoring \u2014 dust, VOCs, noise and microclimate analytics in one operational view.' },
  { index: '04', icon: Sprout, title: 'Urban Environmental Health Models', text: 'Ecological modelling for air-quality prediction, soil-health scoring, water-quality anomaly detection and microbial activity estimation \u2014 feeding city-scale environmental insight.' },
];

const visionOutcomes = ['Reduce waste', 'Lower emissions', 'Improve public health', 'Support circular economies', 'Empower communities', 'Strengthen climate resilience'];

const activeProjects = ['Waste Intelligence Platform', 'Organics diversion analytics', 'Construction emissions monitoring', 'Smart bin and sensor prototyping', 'Environmental validation studies', 'Circular-economy modelling'];
const upcomingProjects = ['NYC Smart City Testbed pilots', 'Hyper-local organics processing hubs', 'AI-driven environmental forecasting', 'Multi-domain environmental digital twins', 'Community environmental dashboards', 'Climate-positive building intelligence systems'];

export default function PartnersPage() {
  const [pillarId, setPillarId] = useState<(typeof pillars)[number]['id']>('science');
  const [collabTab, setCollabTab] = useState<'active' | 'upcoming'>('active');
  const pillar = pillars.find((item) => item.id === pillarId) ?? pillars[0];
  const ActivePillarIcon = pillar.icon;
  const collabItems = collabTab === 'active' ? activeProjects : upcomingProjects;

  return (
    <div className="pt-page" id="pt-top">
      <div className="pt-topline">
        <div className="pt-wrap pt-topline-inner">
          <span className="pt-eyebrow"><i /> Partners / EcoGreen Biotech</span>
          <a href={ECOGREEN_URL} target="_blank" rel="noopener noreferrer" data-testid="link-pt-top-ecogreen">Visit EcoGreen Biotech <ArrowUpRight size={13} /></a>
        </div>
      </div>
      <SiteNav current="partners" sections={[['Who they are', '#pt-who'], ['Why they matter', '#pt-why'], ['Joint innovations', '#pt-joint'], ['Shared vision', '#pt-vision'], ['Collaborations', '#pt-collab'], ['Partner with us', '#pt-partner']]} />

      <main id="main-content" tabIndex={-1}>
        <section className="pt-hero" aria-labelledby="pt-title">
          <div className="pt-hero-map" aria-hidden="true" />
          <div className="pt-wrap pt-hero-layout">
            <div className="pt-hero-copy">
              <div className="pt-kicker"><span /> PARTNERS / ECOGREEN BIOTECH</div>
              <h1 id="pt-title">Deep science.<br /><em>Smarter cities.</em></h1>
              <p className="pt-hero-lede">EcoGreen Biotech brings deep expertise in biotechnology, sustainable materials, environmental engineering and regenerative systems design — a core pillar of EcoCode’s mission to build smarter, cleaner and more resilient cities.</p>
              <div className="pt-hero-actions">
                <a className="pt-button pt-button-ochre" href="#pt-why" data-testid="link-pt-hero-why">Why the partnership matters <ArrowRight size={15} /></a>
                <a className="pt-text-link" href={ECOGREEN_URL} target="_blank" rel="noopener noreferrer" data-testid="link-pt-hero-ecogreen">Visit EcoGreen Biotech <ArrowDown size={14} /></a>
              </div>
              <div className="pt-hero-note"><Activity size={15} /><span>Together, redefining how cities understand, manage and transform waste, emissions and environmental data into actionable intelligence.</span></div>
            </div>
            <div className="pt-hero-visual" role="img" aria-label="Illustrative partnership diagram connecting EcoGreen Biotech science, EcoCode sensing and city outcomes" data-testid="visual-pt-partnership">
              <div className="pt-visual-meta"><span>SCIENCE → SENSING → CITY</span><span>PARTNERSHIP VIEW / 01</span></div>
              <div className="pt-graph-frame">
                <div className="pt-graph-cross pt-cross-x" /><div className="pt-graph-cross pt-cross-y" />
                <svg viewBox="0 0 600 420" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M84 292L196 190L318 246L452 138L536 210M196 190L262 88L452 138M318 246L388 322L536 210M196 190L318 246M84 292L196 336L318 246" />
                  <path className="pt-edge-dash" d="M84 292L196 190L318 246L452 138" />
                </svg>
                {[
                  ['ECOGREEN BIOTECH', 'g1'], ['SCIENCE', 'g2'], ['ECOCODE', 'g3'], ['SENSING', 'g4'], ['CITY OUTCOMES', 'g5'],
                ].map(([label, cls]) => <span key={cls} className={`pt-graph-node ${cls}`}><i /><b>{label}</b></span>)}
                <span className="pt-graph-label pt-graph-label-a">PARTNER<br /><small>BIOTECH · MATERIALS · ENGINEERING</small></span>
                <span className="pt-graph-label pt-graph-label-b">SHARED WORK<br /><small>WASTE · EMISSIONS · DATA</small></span>
                <span className="pt-graph-coordinate">PARTNERSHIP<br />MODEL / ECOCODE × ECOGREEN</span>
              </div>
              <div className="pt-visual-footer"><span>SCIENCE BEHIND THE SIGNALS</span><span className="pt-mono">ILLUSTRATIVE PARTNERSHIP VIEW</span></div>
            </div>
          </div>
          <div className="pt-hero-ribbon"><div className="pt-wrap"><span>ONE SHARED MISSION</span><i /> BIOTECHNOLOGY <i /> SUSTAINABLE MATERIALS <i /> ENVIRONMENTAL ENGINEERING <i /> REGENERATIVE DESIGN</div></div>
        </section>

        <section className="pt-section" id="pt-who">
          <div className="pt-wrap">
            <div className="pt-section-intro">
              <div><span className="pt-eyebrow pt-section-index">01 / WHO ECOGREEN BIOTECH IS</span><h2>A sustainability-driven<br /><em>biotechnology company.</em></h2></div>
              <div className="pt-intro-aside">
                <p>EcoGreen Biotech’s work spans multiple sectors — from municipal waste systems to industrial manufacturing — always with a focus on reducing environmental impact and unlocking new forms of regenerative value.</p>
                <p className="pt-aside-emphasis">Its leadership, including CEO Charles Craun, has played a pivotal role in shaping EcoCode’s vision and technical roadmap.</p>
              </div>
            </div>
            <div className="pt-signal-strip" data-testid="text-pt-focus">
              <div className="pt-signal-lead"><span className="pt-mono">FOCUS AREAS</span><strong>Five fields,<br />one direction.</strong></div>
              {focusAreas.map((area) => <div key={area.index}><span className="pt-small-index">{area.index}</span><h3>{area.title}</h3><p>{area.text}</p></div>)}
            </div>
            <p className="pt-inspiration-note">EcoCode LLC was founded by EcoGreen Biotech LLC, led by CEO Charles Craun, in collaboration with NGHI — the partnership on this page is foundational, not decorative.</p>
          </div>
        </section>

        <section className="pt-model-section" id="pt-why">
          <div className="pt-wrap">
            <div className="pt-model-heading">
              <div><span className="pt-eyebrow pt-section-index">02 / WHY ECOGREEN BIOTECH MATTERS TO ECOCODE</span><h2>Three ways the science<br /><em>strengthens the platform.</em></h2></div>
              <p>Select a pillar to see how EcoGreen Biotech’s expertise flows into EcoCode’s Smart City systems.</p>
            </div>
            <div className="pt-model-board">
              <div className="pt-radiant-strip" aria-hidden="true" />
              <div className="pt-step-list" role="group" aria-label="Choose a partnership pillar" data-testid="group-pt-pillars">
                {pillars.map((item) => {
                  const Icon = item.icon;
                  return <button key={item.id} type="button" aria-pressed={pillarId === item.id} aria-controls="pt-pillar-panel" className={pillarId === item.id ? 'is-active' : ''} onClick={() => setPillarId(item.id)} data-testid={`button-pt-pillar-${item.id}`}>
                    <Icon size={18} /><span>{item.label}</span><ChevronRight size={15} />
                  </button>;
                })}
              </div>
              <article className="pt-step-detail" id="pt-pillar-panel" aria-live="polite" data-testid="panel-pt-pillar">
                <div className="pt-step-detail-top"><span className="pt-mono">PILLAR / {pillar.label.slice(0, 2)}</span><ActivePillarIcon size={19} /></div>
                <h3>{pillar.title}</h3><p>{pillar.copy}</p>
                <div className="pt-mapping">
                  <div><span className="pt-eyebrow">{pillar.fromLabel}</span><ul>{pillar.from.map((chip) => <li key={chip}>{chip}</li>)}</ul></div>
                  <span className="pt-mapping-arrow" aria-hidden="true"><ArrowRight size={15} /></span>
                  <div><span className="pt-eyebrow">{pillar.toLabel}</span><ul>{pillar.to.map((chip) => <li key={chip}>{chip}</li>)}</ul></div>
                </div>
              </article>
            </div>
            <div className="pt-flow" aria-label="Partnership flow">
              <span><Beaker size={15} /> SCIENCE</span><i /><span><Activity size={15} /> SENSING</span><i /><span><Recycle size={15} /> CIRCULARITY</span><i /><span><Building2 size={15} /> FIELD VALIDATION</span><i /><span><Leaf size={15} /> CITY OUTCOMES</span>
            </div>
          </div>
        </section>

        <section className="pt-why pt-section" id="pt-joint">
          <div className="pt-wrap">
            <div className="pt-why-head">
              <div><span className="pt-eyebrow pt-section-index">03 / JOINT INNOVATIONS</span><h2>Built together.<br /><em>Designed for cities.</em></h2></div>
              <div className="pt-why-caveat"><span className="pt-caveat-mark">i</span><p>Joint work is described here as designed and intended. Capabilities depend on the data, facilities and partners in place, and pilot plans are plans — not claims of an approved or live deployment.</p></div>
            </div>
            <div className="pt-benefit-grid">
              {innovations.map(({ index, title, icon: Icon, text, link, linkLabel }) => <article className="pt-benefit" key={index} data-testid={`card-pt-innovation-${index}`}>
                <span className="pt-benefit-number">{index}</span><div className="pt-benefit-icon"><Icon size={19} /></div><h3>{title}</h3><p>{text}</p>
                {link && <Link className="pt-inline-link" href={link} data-testid={`link-pt-innovation-${index}`}>{linkLabel} <ArrowRight size={14} /></Link>}
                <small className="pt-mono">{index === '01' ? 'W2RKG · WASTE → RESOURCE' : index === '02' ? 'MULTI-STREAM · CONTAMINATION · CIRCULARITY' : index === '03' ? 'DUST · VOCS · NOISE · MICROCLIMATE' : 'AIR · SOIL · WATER · MICROBIAL'}</small>
              </article>)}
            </div>
          </div>
        </section>

        <section className="pt-section pt-lashie" id="pt-vision">
          <div className="pt-wrap">
            <div className="pt-section-intro">
              <div><span className="pt-eyebrow pt-section-index">04 / SHARED VISION: SMARTER, CLEANER, CIRCULAR CITIES</span><h2>Data into intelligence.<br /><em>Intelligence into regeneration.</em></h2></div>
              <div className="pt-intro-aside">
                <blockquote className="pt-quote">Transform environmental data into actionable intelligence that enables cities to operate sustainably, efficiently, and regeneratively.</blockquote>
                <p className="pt-aside-emphasis">Together, EcoCode and EcoGreen Biotech are building systems designed to deliver on that mission.</p>
              </div>
            </div>
            <div className="pt-answer-row" data-testid="text-pt-vision-outcomes">
              <span className="pt-eyebrow">TOGETHER, WE ARE BUILDING SYSTEMS THAT</span>
              <ul>{visionOutcomes.map((item) => <li key={item}><Check size={13} />{item}</li>)}</ul>
            </div>
          </div>
        </section>

        <section className="pt-platform pt-section" id="pt-collab">
          <div className="pt-wrap pt-platform-layout">
            <div className="pt-platform-intro"><span className="pt-eyebrow pt-section-index">05 / CURRENT &amp; FUTURE COLLABORATIONS</span><h2>Now, and<br /><em>next.</em></h2><p>Switch between work underway and initiatives planned for the future. Upcoming items are planned directions, including proposed NYC Smart City Testbed pilots — not a claim of testbed readiness or endorsement.</p>
              <div className="pt-tabs" role="group" aria-label="Choose collaboration timeframe" data-testid="group-pt-collab-tabs">
                <button type="button" aria-pressed={collabTab === 'active'} className={collabTab === 'active' ? 'is-active' : ''} onClick={() => setCollabTab('active')} data-testid="button-pt-collab-active">Active projects</button>
                <button type="button" aria-pressed={collabTab === 'upcoming'} className={collabTab === 'upcoming' ? 'is-active' : ''} onClick={() => setCollabTab('upcoming')} data-testid="button-pt-collab-upcoming">Upcoming initiatives</button>
              </div>
            </div>
            <div className="pt-platform-list" aria-live="polite" data-testid="list-pt-collab">
              {collabItems.map((item, idx) => <article key={item} data-testid={`row-pt-collab-${idx + 1}`}>
                <span className="pt-platform-index">{String(idx + 1).padStart(2, '0')}</span><span className="pt-platform-icon">{collabTab === 'active' ? <Zap size={18} /> : <Handshake size={18} />}</span><div><h3>{item}</h3><p>{collabTab === 'active' ? 'Collaboration underway.' : 'Planned initiative.'}</p></div><ArrowUpRight size={15} className="pt-platform-arrow" />
              </article>)}
            </div>
          </div>
        </section>

        <section className="pt-collaborate" id="pt-partner">
          <div className="pt-collab-grid" aria-hidden="true" />
          <div className="pt-wrap pt-collab-layout">
            <div className="pt-collab-copy"><span className="pt-eyebrow">06 / PARTNER WITH US</span><h2>Build the future of<br /><em>environmental intelligence.</em></h2><p>EcoCode and EcoGreen Biotech invite municipalities, research institutions, waste operators and sustainability innovators to join us in building the future of environmental intelligence.</p><p>Together, we can transform waste, emissions and environmental data into powerful tools for climate action and urban resilience.</p><a className="pt-button pt-button-light" href={ECOGREEN_URL} target="_blank" rel="noopener noreferrer" data-testid="link-pt-ecogreen">Learn more about EcoGreen Biotech <ArrowUpRight size={14} /></a></div>
            <aside className="pt-repo-card" data-testid="card-pt-partner">
              <div className="pt-repo-head"><span><Handshake size={16} /></span><span className="pt-mono">PARTNER / ECOGREEN BIOTECH</span><ArrowUpRight size={15} /></div>
              <div className="pt-repo-name">EcoGreen<br />Biotech</div>
              <p>Biotechnology, sustainable materials, environmental engineering and regenerative systems design — the scientific foundation behind EcoCode’s Smart City systems.</p>
              <div className="pt-repo-rule" />
              <div className="pt-repo-detail"><span>Founded by</span><b>ECOGREEN BIOTECH LLC</b></div>
              <div className="pt-repo-detail"><span>Leadership</span><b>CEO CHARLES CRAUN</b></div>
              <a href={ECOGREEN_URL} target="_blank" rel="noopener noreferrer" data-testid="link-pt-partner-card">Visit ecogreenbiotech.com <ArrowUpRight size={14} /></a>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter topHref="#pt-top" />
    </div>
  );
}
