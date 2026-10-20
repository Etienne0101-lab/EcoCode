import { useState } from 'react';
import './_group.css';
import {
  Activity, ArrowDown, ArrowRight, ArrowUpRight, BarChart3,
  Check, ChevronDown, CircleDot, Cloud, Code2, Droplets, ExternalLink,
  Github, Layers3, Leaf, Menu, Radio, ShieldCheck, Signal,
  Truck, Waves, Wind, X,
} from 'lucide-react';

const REPO_URL = 'https://github.com/EcoCode-Smart-City-Infrastructure/waste-intelligence-platform';
const OTI_CONTACT_URL = 'https://www.nyc.gov/content/oti/pages/email-the-chief-technology-officer';
const TESTBED_URL = 'https://testbed.cityofnewyork.us/apply';
const TESTBED_SOURCE_CHECKED_AT = 'October 6, 2026';

const navItems = [
  ['Approach', '#approach'],
  ['Infrastructure', '#infrastructure'],
  ['Pilot concept', '#pilot'],
  ['About', '#about'],
] as const;

const modules = [
  { icon: Layers3, number: '01', title: 'Waste & materials', description: 'A proposed sensor mesh for fill-level signals, collection patterns, and service visibility.', tags: ['Fill level', 'Collection events'] },
  { icon: Wind, number: '02', title: 'Air & emissions', description: 'Modular sensing concepts to help operators observe local air conditions and emissions indicators.', tags: ['Air quality', 'Emissions'] },
  { icon: Droplets, number: '03', title: 'Water systems', description: 'Monitoring building blocks for water conditions, usage patterns, and potential anomalies.', tags: ['Water quality', 'Flow'] },
  { icon: Truck, number: '04', title: 'Fleet & mobility', description: 'Connected operational signals for fleet activity, routes, and resource utilization.', tags: ['Fleet telemetry', 'Routes'] },
  { icon: Activity, number: '05', title: 'Assets & infrastructure', description: 'A common view of distributed assets—designed to bring condition and activity into focus.', tags: ['Asset status', 'Maintenance'] },
  { icon: BarChart3, number: '06', title: 'Open data layer', description: 'An intended software layer for live analytics, integrations, and audit-friendly reporting.', tags: ['Open interfaces', 'Reporting'] },
];

const pilotSteps = [
  { number: '01', title: 'Choose a bounded question', text: 'Work with an operator to define one operational challenge, its baseline, and what a useful signal would look like.' },
  { number: '02', title: 'Design a small footprint', text: 'Specify candidate locations, sensor needs, data ownership, privacy safeguards, and a deployment plan before installation.' },
  { number: '03', title: 'Observe and evaluate', text: 'If approved and resourced, compare collected signals with agreed measures and document limitations as clearly as findings.' },
];

function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <a href="#top" className={`wordmark ${light ? 'wordmark-light' : ''}`} aria-label="EcoCode home">
      <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
      <span className="brand-name">eco<span>code</span></span>
      <span className="brand-llc">LLC</span>
    </a>
  );
}

export function Current() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div id="top" className="site-shell">
      <div className="topline">
        <div className="wrap topline-inner">
          <span className="eyebrow"><span className="status-dot" /> A proposal for more observable city systems</span>
          <a href="#pilot" className="topline-link">Explore the pilot concept <ArrowRight size={13} /></a>
        </div>
      </div>

      <header className="site-header">
        <div className="wrap header-inner">
          <Wordmark />
          <nav className="desktop-nav" aria-label="Main navigation">
            {navItems.map(([label, href]) => <a key={href} className="nav-link" href={href}>{label}</a>)}
          </nav>
          <a className="header-cta" href={OTI_CONTACT_URL} target="_blank" rel="noreferrer">
            Contact NYC OTI <ArrowUpRight size={15} />
          </a>
          <button className="mobile-toggle" type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-nav menu-panel" aria-label="Mobile navigation">
            {navItems.map(([label, href]) => <a key={href} href={href} onClick={closeMenu}>{label}<ArrowRight size={15} /></a>)}
            <a href={OTI_CONTACT_URL} target="_blank" rel="noreferrer" onClick={closeMenu}>Contact NYC OTI<ArrowUpRight size={15} /></a>
          </nav>
        )}
      </header>

      <main>
        <section className="hero">
          <div className="hero-art grid-lines" aria-hidden="true" />
          <div className="wrap hero-layout">
            <div className="hero-copy">
              <div className="eyebrow hero-kicker reveal"><span className="kicker-rule" /> Civic systems, made more visible</div>
              <h1 className="display reveal reveal-delay">Make the<br /><em>unseen</em> work<br />for the city.</h1>
              <p className="hero-description reveal reveal-delay-2">EcoCode is exploring a connected, open approach to environmental infrastructure—turning distributed field signals into clearer decisions for the people who run our cities.</p>
              <div className="hero-actions reveal reveal-delay-2">
                <a className="button button-primary" href="#pilot">Explore the pilot concept <ArrowRight size={16} /></a>
                <a className="button button-text" href={REPO_URL} target="_blank" rel="noreferrer">View the open-source starting point <Github size={16} /></a>
              </div>
              <div className="hero-footnote"><ShieldCheck size={15} /><span>Design-stage concept. No city deployment or Testbed selection is claimed.</span></div>
            </div>
              <div className="hero-visual reveal reveal-delay" role="img" aria-label="Illustrative map visualization of connected urban infrastructure">
              <div className="visual-caption"><span className="live-indicator" /> SYSTEMS VIEW / CONCEPTUAL</div>
              <div className="map-overlay">
                <div className="map-grid-label top-left">FIELD SIGNALS <span>01—06</span></div>
                <div className="map-grid-label bottom-left">CONNECTED INFRASTRUCTURE<br /><span>ILLUSTRATIVE ONLY · NOT LIVE DATA</span></div>
                <div className="map-nodes">
                  <span className="node node-a"><i /><b>WASTE</b></span>
                  <span className="node node-b"><i /><b>AIR</b></span>
                  <span className="node node-c"><i /><b>WATER</b></span>
                  <span className="node node-d"><i /><b>FLEET</b></span>
                  <span className="node node-e"><i /><b>ASSETS</b></span>
                  <svg className="network-lines" viewBox="0 0 600 450" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M90 145L202 94L326 153L459 97M90 145L180 266L326 153L404 300L459 97M180 266L308 357L404 300M326 153L308 357" />
                  </svg>
                </div>
                <div className="map-coordinate mono">40°42'51.0"N<br />74°00'21.0"W</div>
              </div>
              <div className="visual-index mono">FIG. 01&nbsp;&nbsp; / &nbsp;&nbsp;A CITY, IN SIGNALS</div>
            </div>
          </div>
          <div className="hero-ribbon"><div className="wrap ribbon-inner"><span className="eyebrow">One connected view</span><span>Waste</span><i /><span>Air</span><i /><span>Water</span><i /><span>Fleet</span><i /><span>Infrastructure</span><i /><span>Data</span></div></div>
        </section>

        <section className="status-section" aria-label="NYC Smart City Testbed status">
          <div className="wrap">
            <div className="status-banner">
              <div className="status-icon"><CircleDot size={19} /></div>
              <div className="status-copy">
                <div className="eyebrow">NYC Smart City Testbed · application status</div>
                <h2>New applications are paused.</h2>
                <p>NYC OTI’s Apply page currently directs interested organizations to its main contact page. This is a proposed pilot pathway—not an application, selection, city endorsement, or active deployment.</p>
                <div className="status-meta">
                  <span><span className="status-dot paused" /> SOURCE CHECKED {TESTBED_SOURCE_CHECKED_AT.toUpperCase()}</span>
                  <a href={TESTBED_URL} target="_blank" rel="noreferrer">Official Testbed Apply page <ExternalLink size={12} /></a>
                </div>
              </div>
              <a className="button button-dark" href={OTI_CONTACT_URL} target="_blank" rel="noreferrer">Contact NYC OTI <ArrowUpRight size={15} /></a>
            </div>
            <p className="status-source">NYC’s program page describes pilots as typically 6–9 months and says organizations should be prepared to self-fund. Status checked {TESTBED_SOURCE_CHECKED_AT}; confirm current terms directly with OTI.</p>
          </div>
        </section>

        <section className="approach section-pad" id="approach">
          <div className="wrap">
            <div className="section-heading approach-heading">
              <div>
                <div className="eyebrow section-kicker"><span>01</span> / THE OPERATING IDEA</div>
                <h2 className="display">A city is a network<br />of <em>everyday signals.</em></h2>
              </div>
              <div className="approach-aside">
                <p>Waste collection, air conditions, water systems, fleet activity. Each generates information. Too often, those signals are isolated from one another—and from the decisions they could inform.</p>
                <a className="arrow-link" href="#infrastructure">See the infrastructure model <ArrowRight size={15} /></a>
              </div>
            </div>
            <div className="principles">
              <article className="principle">
                <span className="principle-index mono">01 — FIELD</span><div className="principle-icon"><Radio size={20} /></div>
                <h3>Sense where work happens.</h3><p>Modular, connected sensor concepts designed for real-world environments—not a single all-or-nothing installation.</p>
              </article>
              <article className="principle">
                <span className="principle-index mono">02 — PLATFORM</span><div className="principle-icon"><Code2 size={20} /></div>
                <h3>Bring signals together.</h3><p>An open software direction for making data understandable, shareable, and useful across operational boundaries.</p>
              </article>
              <article className="principle">
                <span className="principle-index mono">03 — EVIDENCE</span><div className="principle-icon"><BarChart3 size={20} /></div>
                <h3>Make decisions auditable.</h3><p>Live analytics and reporting are design goals—so a pilot can document what changed, what did not, and why.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="infrastructure section-pad" id="infrastructure">
          <div className="wrap">
            <div className="infrastructure-head">
              <div>
                <div className="eyebrow section-kicker"><span>02</span> / MODULAR BY DESIGN</div>
                <h2 className="display">One connective layer.<br /><em>Many field realities.</em></h2>
              </div>
              <p>EcoCode’s profile describes a family of sensor and software modules. The components below are proposed capabilities—not a statement that hardware or a working platform is already deployed.</p>
            </div>
            <div className="module-grid">
              {modules.map(({ icon: Icon, number, title, description, tags }) => (
                <article className="module-card" key={number}>
                  <div className="module-top"><span className="module-index mono">{number} / 06</span><Icon size={19} strokeWidth={1.7} /></div>
                  <h3>{title}</h3><p>{description}</p>
                  <div className="module-tags">{tags.map(tag => <span key={tag}>{tag}</span>)}</div>
                </article>
              ))}
            </div>
            <div className="platform-band">
              <div className="platform-glyph"><Signal size={19} /><span /><span /><span /></div>
              <div><span className="eyebrow">PROPOSED PLATFORM LAYER</span><p>Sensor inputs <b>→</b> open interfaces <b>→</b> live operational view <b>→</b> auditable report</p></div>
              <span className="platform-note mono">DESIGN INTENT</span>
            </div>
          </div>
        </section>

        <section className="repo-section">
          <div className="wrap repo-layout">
            <div className="repo-copy">
              <div className="eyebrow section-kicker"><span>03</span> / OPEN STARTING POINT</div>
              <h2 className="display">A public idea,<br /><em>at its beginning.</em></h2>
              <p>The EcoCode Smart-City Infrastructure GitHub project is the open-source starting point for a potential waste-intelligence pilot concept in New York City. The public repository currently contains a license and an initial commit; its description outlines a distributed IoT mesh for waste analytics and operations.</p>
              <p>It is not evidence of finished software, working hardware, live data, or an operating deployment. A pilot would require further design, implementation, partners, permissions, and funding.</p>
              <a className="button button-light" href={REPO_URL} target="_blank" rel="noreferrer"><Github size={16} /> Explore the public repository <ArrowUpRight size={15} /></a>
            </div>
            <div className="repo-card">
              <div className="repo-card-head"><span className="repo-mark"><Code2 size={17} /></span><span className="mono">PUBLIC REPOSITORY</span><Github size={17} /></div>
              <div className="repo-title">waste-intelligence-platform</div>
              <p>Distributed IoT mesh waste-intelligence platform for NYC smart-city waste analytics and operations.</p>
              <div className="repo-rule" />
              <div className="repo-facts"><span>Current contents</span><b>LICENSE · initial commit</b></div>
              <div className="repo-facts"><span>Role in this concept</span><b>Open-source starting point</b></div>
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="repo-foot">View on GitHub <ArrowUpRight size={14} /></a>
              <div className="repo-stamp">EARLY<br />STAGE</div>
            </div>
          </div>
        </section>

        <section className="pilot section-pad" id="pilot">
          <div className="wrap">
            <div className="pilot-top">
              <div>
                <div className="eyebrow section-kicker"><span>04</span> / A POSSIBLE NEXT STEP</div>
                <h2 className="display">A pilot starts<br />with a <em>question.</em></h2>
              </div>
              <div className="pilot-note"><span className="concept-label"><CircleDot size={12} /> PROPOSED CONCEPT</span><p>A potential NYC Smart City Testbed pilot could explore whether localized waste signals help an operator understand collection conditions and service patterns. That is a question to test—not an outcome to promise.</p></div>
            </div>
            <div className="pilot-steps">
              {pilotSteps.map(step => <article className="pilot-step" key={step.number}><span className="step-num mono">{step.number}</span><div><h3>{step.title}</h3><p>{step.text}</p></div><ArrowDown className="step-arrow" size={17} /></article>)}
            </div>
            <div className="pilot-scale">
              <div className="pilot-scale-intro">
                <span className="eyebrow">ILLUSTRATIVE SIZING · COMPANY PROFILE</span>
                <h3>A starting scenario<br />to validate together.</h3>
              </div>
              <div className="scale-metric"><strong>500</strong><span>SMART BINS</span></div>
              <div className="scale-metric"><strong>10</strong><span>COLLECTION VEHICLES</span></div>
              <p className="scale-caveat">A planning example from EcoCode’s profile—not a selected NYC site, approved scope, or claim of available equipment. Final scale would depend on a willing operator, technical readiness, funding, permissions, and OTI review.</p>
            </div>
            <div className="pilot-measures">
              <div className="measure-intro"><span className="eyebrow">EVALUATION, NOT PROMOTION</span><h3>Agree on evidence<br />before collecting it.</h3><p>Candidate measures would be co-defined with a participating operator. No performance range or impact claim is verified today.</p></div>
              <div className="measure-list">
                <div><span className="measure-mark"><Check size={14} /></span><span><b>Operational fit</b><small>Can the signal be gathered reliably in the actual setting?</small></span></div>
                <div><span className="measure-mark"><Check size={14} /></span><span><b>Decision usefulness</b><small>Does it inform a decision the operator already needs to make?</small></span></div>
                <div><span className="measure-mark"><Check size={14} /></span><span><b>Transparent limits</b><small>Are coverage, gaps, uncertainty, and data handling documented?</small></span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="program section-pad">
          <div className="wrap program-layout">
            <div>
              <div className="eyebrow section-kicker"><span>05</span> / PROGRAM CONTEXT</div>
              <h2 className="display">Test in the<br /><em>real world.</em></h2>
              <p className="program-intro">NYC’s Smart City Testbed Program offers a pathway for organizations to test emerging technologies in real-world urban settings. Eligibility, application timing, deployment approvals, and funding all require direct discussion with OTI.</p>
              <a className="arrow-link" href={TESTBED_URL} target="_blank" rel="noreferrer">Read NYC’s official program information <ExternalLink size={14} /></a>
            </div>
            <div className="program-facts">
              <article><span className="fact-num">6–9</span><span className="eyebrow">MONTHS · TYPICAL PILOT DURATION</span><p>NYC program materials describe pilots as typically lasting six to nine months.</p></article>
              <article><span className="fact-word">Self-funded</span><span className="eyebrow">ORGANIZATIONS SHOULD BE PREPARED</span><p>The program says participating organizations should be prepared to fund their own pilot.</p></article>
              <article className="fact-paused"><span className="fact-word">Paused</span><span className="eyebrow">NEW APPLICATIONS · SOURCE CHECKED {TESTBED_SOURCE_CHECKED_AT.toUpperCase()}</span><p>The Apply page currently directs interested organizations to OTI’s main contact page.</p></article>
            </div>
          </div>
          <div className="wrap program-caveat"><ShieldCheck size={17} /><p>EcoCode has not been selected for the NYC Testbed, is not presenting an application as submitted, and does not claim a partnership, city endorsement, or deployment.</p></div>
        </section>

        <section className="about section-pad" id="about">
          <div className="wrap about-layout">
            <div>
              <div className="eyebrow section-kicker"><span>06</span> / WHO WE ARE</div>
              <h2 className="display">Built around<br /><em>public systems.</em></h2>
            </div>
            <div className="about-copy">
              <p className="about-lede">EcoCode LLC is an environmental technology company founded by EcoGreen Biotech LLC, led by CEO Charles Craun, in collaboration with NGHI.</p>
              <p>Its mission is to help municipalities and operators make environmental and infrastructure operations more measurable through modular connected sensing, open software, live analytics, and reporting designed to be auditable.</p>
              <div className="about-values"><span><Waves size={15} /> Practical field context</span><span><Cloud size={15} /> Connected by design</span><span><ShieldCheck size={15} /> Evidence before claims</span></div>
            </div>
          </div>
        </section>

        <section className="closing">
          <div className="wrap closing-layout">
            <div className="closing-mark"><Leaf size={22} /></div>
            <div><div className="eyebrow">A CONVERSATION, NOT AN APPLICATION</div><h2 className="display">Start with the<br /><em>right question.</em></h2></div>
            <div className="closing-action"><p>For current Testbed application status, contact NYC OTI directly. To review the design-stage starting point, explore the public repository.</p><a className="button button-primary" href={OTI_CONTACT_URL} target="_blank" rel="noreferrer">Contact NYC OTI <ArrowUpRight size={15} /></a><a className="closing-secondary" href={REPO_URL} target="_blank" rel="noreferrer">Open the GitHub project <ArrowRight size={14} /></a></div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer-main">
          <div className="footer-brand"><Wordmark light /><p>More measurable environmental<br />and infrastructure operations.</p></div>
          <div className="footer-col"><span className="eyebrow">EXPLORE</span>{navItems.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</div>
          <div className="footer-col"><span className="eyebrow">PUBLIC SOURCES</span><a href={REPO_URL} target="_blank" rel="noreferrer">GitHub repository <ArrowUpRight size={12} /></a><a href={TESTBED_URL} target="_blank" rel="noreferrer">NYC Testbed information <ArrowUpRight size={12} /></a><a href={OTI_CONTACT_URL} target="_blank" rel="noreferrer">NYC OTI contact page <ArrowUpRight size={12} /></a></div>
          <div className="footer-note"><span className="eyebrow">IMPORTANT DISTINCTION</span><p>This site presents a proposed, design-stage pilot concept. It does not indicate program selection, city affiliation, partnership, or active deployment.</p></div>
        </div>
        <div className="wrap footer-bottom"><span>© {new Date().getFullYear()} EcoCode LLC</span><span>Designed for clarity. Grounded in what is known.</span><a href="#top">Back to top <ChevronDown size={13} /></a></div>
      </footer>
    </div>
  );
}

