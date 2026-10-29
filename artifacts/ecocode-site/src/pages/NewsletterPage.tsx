import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Mail, Rss } from 'lucide-react';
import { Link } from 'wouter';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import './NewsletterPage.css';

const WEB_APP_URL = 'https://ecocode-smart-city-infrastructure.github.io/waste-intelligence-platform/';
const ECOGREEN_ECOCODE_URL = 'https://ecogreenbiotech.com/ecocode/';
// Real signup: submissions are emailed to EcoCode's public contact inbox
// (already listed on the EcoGreen Biotech Facebook page). No account, no
// database, no third-party list — the first submission triggers a one-time
// activation email to that inbox; after that click, every signup arrives
// as an email. Swapping to a mailing provider later is a one-line change
// to this form action.
const SIGNUP_ACTION = 'https://formsubmit.co/ecosparkinnovationsllc@gmail.com';
const SUBSCRIBED_URL = 'https://etienne0101-lab.github.io/EcoCode/newsletter?subscribed=1';

type Milestone = { date: string; title: string; copy: string; link?: { label: string; href: string; external?: boolean } };

const GROUPS: { id: string; index: string; title: string; intro: string; items: Milestone[] }[] = [
  {
    id: 'site', index: '01', title: 'The site',
    intro: 'EcoCode on the open web, rebuilt in the open — every release verified live before it is claimed.',
    items: [
      { date: '19 Oct 2026', title: 'The EcoCode site goes live on GitHub Pages', copy: 'The full site — platform, Waste Intelligence, Knowledge Graph and Partners — replicated to a public Pages site and verified page by page.', link: { label: 'Visit the homepage', href: '/' } },
      { date: '25 Oct 2026', title: 'Dark theme, integrated navigation', copy: 'One shared header and footer across all four pages, dynamic radiant transitions, and a contrast audit — navigation that can never drift apart between pages.' },
      { date: '27 Oct 2026', title: 'EcoCode page published on ecogreenbiotech.com', copy: 'A dedicated EcoCode page goes live on the EcoGreen Biotech site, with its header navigation and buttons verified from the public page.', link: { label: 'See it on ecogreenbiotech.com', href: ECOGREEN_ECOCODE_URL, external: true } },
    ],
  },
  {
    id: 'graph', index: '02', title: 'The graph',
    intro: 'The Waste-to-Resource Knowledge Graph is the semantic engine underneath everything else on this site.',
    items: [
      { date: '20 Oct 2026', title: 'Knowledge Graph page launches', copy: '“Waste, mapped to what it can become.” An interactive five-mapping explorer — waste to processes, processes to resources, facilities to capabilities, constraints to rules, actors to demand.', link: { label: 'Explore the graph', href: '/knowledge-graph' } },
      { date: '27 Oct 2026', title: 'The graph grows — without touching the original sample', copy: 'The live sample grows from 31 nodes and 55 edges to 43 nodes and 81 edges, adding twelve sourced public-data nodes: citywide and commercial organics, community drop-offs, the Staten Island Compost Facility, Newtown Creek digestion, gardens, renewable gas and the Commercial Waste Zones. The original sample is untouched; the new material is merged in.', link: { label: 'How the graph works', href: '/knowledge-graph' } },
      { date: '27 Oct 2026', title: 'Two new curated loops, EPA factors throughout', copy: 'NYC Curbside Compost and Newtown Creek Biogas join the curated loops, and new organics edges carry EPA WARM v15 emission factors — so diversion, CO₂e and compost totals in the web app are modelled from published factors, not invented.' },
    ],
  },
  {
    id: 'twin', index: '03', title: 'The twin',
    intro: 'The homepage pilot: one stream, traced across a real city, on real streets, to real facilities.',
    items: [
      { date: '26 Oct 2026', title: 'Kepler view verified at street level', copy: 'The Waste Intelligence web app’s Kepler view renders the city at street level — the map thread that the twin later inherits.' },
      { date: '27 Oct 2026', title: 'The twin is rebuilt on real sites and real roads', copy: 'Pipelines now run from a typed address to pinned, verified facilities — Sims Sunset Park, Newtown Creek, Pratt Industries, the Fresh Kills hub — over real road geometry, with the DSNY collection routes honestly described: the city publishes district boundaries and facility assignments, not turn-by-turn truck routes, and the page says so.', link: { label: 'Try the twin on the homepage', href: '/#pilot' } },
      { date: '27 Oct 2026', title: 'One builder, two views, three data layers', copy: 'The Pipeline Studio builds a loop diagram and a map pipeline from a single input. Then three optional layers, all off by default: live borough tonnage from DSNY Monthly Tonnage, documented facility throughput, and all 59 DSNY district boundaries. Layers are labelled with their datasets; nothing loads until switched on.', link: { label: 'Open the live web app', href: WEB_APP_URL, external: true } },
    ],
  },
  {
    id: 'under', index: '04', title: 'The platform underneath',
    intro: 'The machinery that lets a static site behave like a living system — and lets the work keep shipping nightly.',
    items: [
      { date: '21–22 Oct 2026', title: 'Full-stack expansion, then a self-hosted gateway', copy: 'The Workbench gains a sandboxed preview, a Python runner, a Node runtime, an API tester and repo sync. Then a self-hosted gateway replaces a pile of hosted keys with one OpenAI-compatible endpoint, per-key cooldowns and a usage ledger.' },
      { date: '24 Oct 2026', title: 'A key vault for any provider, and an organism that grows', copy: 'One submission path for any provider key — presets plus unlimited user-defined providers — and a scheduler that grows the organism’s directives without ever overwriting another writer’s files. The Android Workbench ships v1.1.0 the same week.' },
    ],
  },
  {
    id: 'partners', index: '05', title: 'The partner story',
    intro: 'Science partnerships, kept inside what can actually be claimed.',
    items: [
      { date: '25 Oct 2026', title: 'Partners page: EcoGreen Biotech', copy: '“Deep science. Smarter cities.” The joint work — graph, platform, site intelligence, environmental health models — presented with the claim boundary intact: pilots are planned, not endorsed; partners described as they are.', link: { label: 'Meet the partner', href: '/partners' } },
      { date: '28 Oct 2026', title: 'Social relaunch, and a meeting in Oley', copy: 'The EcoGreen Innovations page is relaunched with verified identity details, and two launch posts go live — while the rename to EcoGreen Biotech waits on a password Facebook will accept. Meanwhile a meeting in Oley, Pennsylvania is set for 29 October to discuss a proposed EcoGreen × Oley partnership: feedstock, cultivation, equipment access and biorefinery space. Proposed, not yet agreed — the letter will report what actually happens.' },
    ],
  },
];


type WireItem = { date: string; title: string; copy: string; tag?: string; source?: string; link?: { label: string; href: string; external?: boolean } };

const WIRE_RECENT: WireItem[] = [
  { date: '28 Oct 2026', title: 'This newsletter launches — with a real signup', copy: 'Issue 001 goes live with its archive, and the Subscribe section actually subscribes: signups arrive as email to EcoCode’s public contact inbox, with an RSS feed alongside.', link: { label: 'Subscribe below', href: '#nl-subscribe' } },
  { date: '28 Oct 2026', title: 'Nexus dashboard overhaul verified live', copy: 'The Waste Intelligence web app’s overhaul33b is confirmed live: the AI Insights rail, the five-KPI row and the workspace sidebar, with no desktop defects found.', link: { label: 'Open the live web app', href: WEB_APP_URL, external: true } },
  { date: '27 Oct 2026', title: 'Twin data layers go live', copy: 'Three optional layers, all off by default: live borough tonnage for September 2026, documented facility throughput, and all 59 DSNY district boundaries — each labelled with its dataset.', link: { label: 'Try the twin', href: '/#pilot' } },
  { date: '27 Oct 2026', title: 'Pipeline Studio: one build, two views', copy: 'A single builder now drives both the loop diagram and the twin map from one waste stream and one address — the loop and the map can no longer disagree about what stream they show.', link: { label: 'Try the twin', href: '/#pilot' } },
  { date: '27 Oct 2026', title: 'EcoCode page published on ecogreenbiotech.com', copy: 'The EcoCode page goes live on the EcoGreen Biotech site with its header navigation and buttons verified from the public page.', link: { label: 'See it on ecogreenbiotech.com', href: ECOGREEN_ECOCODE_URL, external: true } },
  { date: '28 Oct 2026', title: 'EcoGreen social relaunch posts go live', copy: 'Welcome and Biomass posts publish on the EcoGreen Innovations page, the first pinned — while the page rename still waits on a password Facebook will accept.', link: { label: 'The partner story', href: '/partners' } },
];

const WIRE_WORKS: WireItem[] = [
  { date: 'Next', tag: 'Next', title: 'A backend with a public address', copy: 'The web app’s Connect panel already accepts a backend URL, so the day a hosted backend exists, no app change is needed. Hosting on a free platform is the next tangible step.' },
  { date: '29 Oct 2026', tag: 'In progress', title: 'The Oley meeting — and whatever it decides', copy: 'Stephen meets Jeffrey Brooks in Oley, Pennsylvania to discuss a proposed EcoGreen × Oley partnership. Issue 002 reports the outcome as it happened, proposed or agreed.' },
  { date: 'Nov 2026', tag: 'Target', title: 'The NYC pilot operational target', copy: 'November 2026 remains an operational target for the pilot — not a promised launch date. The letter will say when it moves from target to plan.' },
  { date: 'Awaiting verification', tag: 'Awaiting verification', title: 'Five marine transfer station pins', copy: 'North Shore, Hamilton Avenue, East 91st, Southwest Brooklyn and the Staten Island compost site all have verified addresses and no verified coordinates yet. They stay as addresses in print until a source pins them.' },
  { date: 'Awaiting check', tag: 'Awaiting check', title: 'Phone-width proof for the newest releases', copy: 'The studio, the twin layers and the newsletter are desktop-verified; their phone-width behaviour still awaits a real phone check.' },
  { date: 'One click', tag: 'Awaiting action', title: 'Newsletter signup activation', copy: 'The signup form is live and inspected, but delivery waits on one activation click in the contact inbox — the first test signup triggers it.' },
];

const WIRE_TRENDING: WireItem[] = [
  { date: 'Mar 2026', title: 'Cellulose, processed as a polymer — plastic-like films, inherently biodegradable', copy: 'Finland’s Films for Future project (VTT + LUT University, 34 industry partners) demonstrates pilot-scale cellulose films and coatings with plastic-comparable barrier performance — oxygen transmission below 1 cc/m²/day for films, below 0.2 for coatings — that biodegrade or recycle in fibre streams instead of persisting.', source: 'Processing Magazine / VTT, Mar 2026', link: { label: 'Read the report', href: 'https://www.processingmagazine.com/news-notes/news/55385801/new-cellulose-films-deliver-plastic-like-performance-and-inherent-biodegradability', external: true } },
  { date: 'Sep 2026', title: 'Hemp hurd cellulose makes biodegradable film 26% stronger', copy: 'KRICT researchers convert discarded hemp hurd into microfibrillated cellulose and blend it at 10 wt% into a starch/PBAT film: tensile strength up 26.2%, water-vapour transmission down about 17%, oxygen down about 9% — using ordinary oven drying, not freeze-drying.', source: 'Phys.org / Chemical Engineering Journal, Sep 2026', link: { label: 'Read the report', href: 'https://phys.org/news/2026-09-hemp-cellulose-tougher-biodegradable-plastics.html', external: true } },
  { date: 'May 2026', title: 'Bacterial cellulose, aligned as it grows — metal-strong, still biodegradable', copy: 'Rice University and University of Houston researchers steer cellulose-producing bacteria in a rotational bioreactor, aligning fibres during growth into sheets described as strong as some metals and glasses — yet flexible, foldable and transparent.', source: 'Neowin / Nature Communications, May 2026', link: { label: 'Read the report', href: 'https://www.neowin.net/news/this-amazing-bio-material-could-solve-one-of-our-biggest-problems/', external: true } },
  { date: 'Feb 2026', title: 'Mycelium + cellulose nanofibrils: plastic-free packaging grown in 3 days', copy: 'University of Maine researchers grow turkey-tail mycelium through wood-derived cellulose nanofibrils into a water- and oil-resistant barrier — cutting traditional mycelium growth from weeks to three days and aiming at roll-to-roll production.', source: 'MaterialDistrict / University of Maine, Feb 2026', link: { label: 'Read the report', href: 'https://materialdistrict.com/article/mycelium-and-cellulose-nanofibrils-form-plastic-free-food-packaging/', external: true } },
  { date: 'May 2026', title: 'Hemp seed hulls strengthen cellulose acetate bioplastics', copy: 'Kaunas University of Technology finds alkali-treated hemp seed hulls as biofillers lift tensile strength 21–23% and modulus 17–24% in cellulose acetate bioplastics — and biodegrade slightly faster than the base material.', source: 'The Marijuana Herald / Molecules, May 2026', link: { label: 'Read the report', href: 'https://themarijuanaherald.com/2026/05/study-hemp-seed-hulls-may-strengthen-bioplastics-while-improving-biodegradability/', external: true } },
  { date: 'Oct 2026', title: 'Hemp-derived cellulose hydrogels go electronic', copy: 'Hemp biomass cellulose hydrogels reinforced with nickel ferrite nanoparticles show tunable semiconductor behaviour (band gaps 2.75–3.57 eV) — cellulose biopolymers moving beyond packaging into flexible optoelectronics.', source: 'ACS Omega, Oct 2026', link: { label: 'Read the report', href: 'https://pubs.acs.org/acsodf/article/11/41/62852/5446515/Hemp-Derived-Cellulose-NiFe2O4-Biocomposite', external: true } },
  { date: 'Oct 2026', title: 'Hemp seed waste films gain up to 86% strength', copy: 'Modified hemp protein films cut water-vapour permeability about 38% and saw over 60% disintegrate in a 40-day soil burial test — lab results so far, with commercial performance still to be proven.', source: 'The Marijuana Herald, 21 Oct 2026', link: { label: 'Read the report', href: 'https://themarijuanaherald.com/2026/10/study-finds-hemp-seed-waste-can-be-turned-into-stronger-biodegradable-plastic-boosting-strength-by-86/', external: true } },
  { date: '26 Oct 2026', title: 'PET bottles, upcycled in one step', copy: 'Researchers in South Korea and Taiwan report a single-atom catalyst that converts ethylene glycol — a PET breakdown byproduct — directly into formate, an industrial feedstock, skipping costly purification.', source: 'Polyester Time, 26 Oct 2026', link: { label: 'Read the report', href: 'https://www.polyestertime.com/pet-plastic-upcycling-catalyst/', external: true } },
  { date: '30 Sep 2026', title: 'A first solvent route for PPS plastic', copy: 'Toray reports the industry’s first solvent-based recycling for polyphenylene sulfide — a super-engineering plastic previously near-impossible to recover — dissolving and re-crystallising it without breaking the polymer down.', source: 'Chemical Engineering, 30 Sep 2026', link: { label: 'Read the report', href: 'https://www.chemengonline.com/toray-industries-develops-first-solvent-based-recycling-technology-for-recovering-pps-from-waste/', external: true } },
];

const WIRE_TABS = [
  { id: 'recent' as const, label: 'Recent developments', note: 'From EcoCode’s own releases — every item links to the thing itself.' },
  { id: 'works' as const, label: 'What’s in the works', note: 'Statuses as of 28 October 2026. Targets are labelled targets; unverified items stay unverified.' },
  { id: 'trending' as const, label: 'Trending', note: 'Outside EcoCode: this edition leads with biomaterials — cellulose biopolymers first, hemp- and plant-based breakthroughs next — curated 28 October 2026 from public reporting. Biogas-led developments are held for a later issue. Links leave this site; nothing here is EcoCode’s work.' },
];

export default function NewsletterPage() {
  const [wireTab, setWireTab] = useState<'recent' | 'works' | 'trending'>('recent');
  const wireItems = wireTab === 'recent' ? WIRE_RECENT : wireTab === 'works' ? WIRE_WORKS : WIRE_TRENDING;
  const wireNote = WIRE_TABS.find((t) => t.id === wireTab)?.note ?? '';

  const [subscribed] = useState(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('subscribed') === '1',
  );

  return (
    <div className="nl-page" id="nl-top">
      <div className="nl-topline">
        <div className="nl-wrap nl-topline-inner">
          <span className="nl-eyebrow"><i /> Issue 001 · October 2026</span>
          <a href="/feed.xml" data-testid="link-nl-top-rss">Follow via RSS <Rss size={13} /></a>
        </div>
      </div>
      <SiteNav current="newsletter" sections={[['Issue 001', '#nl-issue'], ['The Wire', '#nl-wire'], ['Milestones', '#nl-timeline'], ['Deep dive', '#nl-deepdive'], ["What's next", '#nl-next'], ['Archive', '#nl-archive'], ['Subscribe', '#nl-subscribe']]} />

      <main id="main-content" tabIndex={-1}>
        <header className="nl-hero" id="nl-issue">
          <div className="nl-wrap">
            <p className="nl-eyebrow">The EcoCode Newsletter</p>
            <h1>What it can<br /><em>become.</em></h1>
            <p className="nl-standfirst">
              Issue 001 — everything the platform became in its first ten days on the open web:
              a site, a graph, a twin, and the machinery underneath. Every milestone below is
              something you can open and check, not something you have to take our word for.
            </p>
            <div className="nl-hero-meta">
              <span><b>10</b> days, 19–28 October 2026</span>
              <span><b>5</b> milestone threads</span>
              <span><b>1</b> graph, <b>43</b> nodes</span>
            </div>
            <div className="nl-hero-actions">
              <a className="nl-button nl-button-forest" href="#nl-timeline" data-testid="link-nl-hero-timeline">Read the milestones <ArrowRight size={15} /></a>
              <a className="nl-text-link" href="#nl-subscribe" data-testid="link-nl-hero-subscribe">Subscribe to the next issue</a>
            </div>
          </div>
        </header>

        <section className="nl-section nl-note">
          <div className="nl-wrap nl-note-inner">
            <span className="nl-eyebrow nl-section-index">Editor’s note</span>
            <p>
              We built this letter because the platform was shipping faster than any single page
              could explain. In ten days a brochure site became a working twin of a city’s waste
              system — real streets, real facilities, real public data, and a graph that keeps
              growing without breaking what came before. This issue is the record of that stretch:
              what shipped, what it is for, and what we are deliberately not claiming yet.
              If a milestone matters, it links to the thing itself.
            </p>
          </div>
        </section>

        <section className="nl-section nl-wire" id="nl-wire">
          <div className="nl-wrap">
            <span className="nl-eyebrow nl-section-index">The Wire · Updated 28 Oct 2026</span>
            <h2>Three feeds, <em>one page.</em></h2>
            <div className="nl-tabs" role="tablist" aria-label="Newsletter feeds">
              {WIRE_TABS.map((tab) => (
                <button key={tab.id} type="button" role="tab" aria-selected={wireTab === tab.id}
                  className={wireTab === tab.id ? 'nl-tab active' : 'nl-tab'}
                  onClick={() => setWireTab(tab.id)} data-testid={`button-nl-tab-${tab.id}`}>
                  {tab.label}
                </button>
              ))}
            </div>
            <p className="nl-wire-note">{wireNote}</p>
            <div className="nl-feed" data-testid={`feed-nl-${wireTab}`}>
              {wireItems.map((item) => (
                <article className="nl-feed-item" key={item.title}>
                  <div className="nl-feed-head">
                    <span className="nl-feed-date">{item.date}</span>
                    {item.tag && <span className="nl-feed-tag">{item.tag}</span>}
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                  {item.source && <span className="nl-feed-source">Source: {item.source}</span>}
                  {item.link && (item.link.external
                    ? <a className="nl-inline-link" href={item.link.href} target="_blank" rel="noreferrer">{item.link.label} <ArrowUpRight size={14} /></a>
                    : <Link className="nl-inline-link" href={item.link.href}>{item.link.label} <ArrowRight size={14} /></Link>)}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="nl-section" id="nl-timeline">
          <div className="nl-wrap">
            <span className="nl-eyebrow nl-section-index">The milestones</span>
            <h2>Ten days, <em>five threads.</em></h2>
            <div className="nl-timeline">
              {GROUPS.map((group) => (
                <div className="nl-group" key={group.id} id={`nl-group-${group.id}`}>
                  <div className="nl-group-head">
                    <span className="nl-group-index">{group.index}</span>
                    <div>
                      <h3>{group.title}</h3>
                      <p>{group.intro}</p>
                    </div>
                  </div>
                  <ol className="nl-items">
                    {group.items.map((item) => (
                      <li className="nl-item" key={item.title}>
                        <span className="nl-item-dot" aria-hidden="true" />
                        <span className="nl-item-date">{item.date}</span>
                        <h4>{item.title}</h4>
                        <p>{item.copy}</p>
                        {item.link && (item.link.external
                          ? <a className="nl-inline-link" href={item.link.href} target="_blank" rel="noreferrer" data-testid={`link-nl-${group.id}`}>{item.link.label} <ArrowUpRight size={14} /></a>
                          : <Link className="nl-inline-link" href={item.link.href} data-testid={`link-nl-${group.id}`}>{item.link.label} <ArrowRight size={14} /></Link>)}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="nl-section nl-deepdive" id="nl-deepdive">
          <div className="nl-wrap">
            <span className="nl-eyebrow nl-section-index">Deep dive · Issue 001</span>
            <h2>The graph that <em>learns the city.</em></h2>
            <p className="nl-deepdive-lede">
              A knowledge graph is only useful if it stays honest about what it knows. The
              Waste-to-Resource Knowledge Graph started as a 31-node sample — waste to process
              to resource to demand to facility — and grew the way a city grows: by adding
              real places, not by rewriting history.
            </p>
            <div className="nl-stats">
              <div><b>43</b><span>nodes, up from 31</span></div>
              <div><b>81</b><span>edges, up from 55</span></div>
              <div><b>12</b><span>sourced public-data nodes added</span></div>
              <div><b>6</b><span>curated loops, 2 of them new</span></div>
            </div>
            <p>
              The new nodes are places and policies you can verify: the Staten Island Compost
              Facility, Newtown Creek’s digestion, community drop-offs, gardens, renewable gas,
              the Commercial Waste Zones. The new edges carry EPA WARM v15 factors, so when the
              web app totals diversion, CO₂e and compost, those totals trace back to published
              factors. And the original sample sits inside the larger graph untouched — growth
              by merge, never by replacement. That discipline is the whole project in miniature:
              only build on the foundation already there.
            </p>
            <Link className="nl-inline-link" href="/knowledge-graph" data-testid="link-nl-deepdive-graph">Explore the five mappings <ArrowRight size={14} /></Link>
          </div>
        </section>

        <section className="nl-section" id="nl-next">
          <div className="nl-wrap">
            <span className="nl-eyebrow nl-section-index">What’s next</span>
            <h2>Honest <em>horizons.</em></h2>
            <ul className="nl-next-list">
              <li><b>November 2026, as a target —</b> the operational target for the NYC pilot, not a promised launch date. The letter will say when it moves from target to plan.</li>
              <li><b>A backend with a public address —</b> the web app’s Connect panel already accepts a backend URL, so the day a hosted backend exists, no app change is needed.</li>
              <li><b>Marine transfer station pins —</b> five verified DSNY addresses still wait on verified coordinates. They stay as addresses in print until a source pins them; they will not be guessed.</li>
              <li><b>The Oley outcome —</b> whatever the 29 October meeting decides about the proposed partnership, Issue 002 reports it as it happened.</li>
              <li><b>Phone-width proof —</b> several releases are desktop-verified and still await their phone check. That check is part of every release, not an afterthought.</li>
            </ul>
          </div>
        </section>

        <section className="nl-section nl-archive" id="nl-archive">
          <div className="nl-wrap">
            <span className="nl-eyebrow nl-section-index">Archive</span>
            <h2>Every issue, <em>kept.</em></h2>
            <div className="nl-archive-grid">
              <article className="nl-issue-card">
                <span className="nl-eyebrow">Issue 001 · October 2026</span>
                <h3>What it can become.</h3>
                <p>The first ten days on the open web: the site, the graph, the twin, the platform underneath, the partner story.</p>
                <span className="nl-issue-meta">You are reading it · 5 threads · 13 milestones</span>
              </article>
              <article className="nl-issue-card nl-issue-card-soon">
                <span className="nl-eyebrow">Issue 002 · Coming</span>
                <h3>To be written by events.</h3>
                <p>Future issues appear here when they ship — the Oley outcome, the backend, the pilot target. Nothing is pre-announced that hasn’t happened.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="nl-section nl-subscribe" id="nl-subscribe">
          <div className="nl-wrap nl-subscribe-inner">
            <span className="nl-eyebrow nl-section-index">Subscribe</span>
            <h2>Get the next issue <em>by email.</em></h2>
            {subscribed
              ? <p className="nl-subscribed" role="status" data-testid="text-nl-subscribed">Thank you — you’re on the list. The next issue will reach you by email when it ships.</p>
              : <p>One email when a new issue lands. No feed of noise, no paid tier, no resale of your address — the list is held by EcoCode alone.</p>}
            <form className="nl-form" action={SIGNUP_ACTION} method="POST" data-testid="form-nl-signup">
              <input type="hidden" name="_subject" value="New EcoCode newsletter subscriber" />
              <input type="hidden" name="_next" value={SUBSCRIBED_URL} />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="text" name="_honey" className="nl-honey" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <label className="nl-field">
                <span>Name (optional)</span>
                <input type="text" name="name" autoComplete="name" placeholder="Your name" />
              </label>
              <label className="nl-field">
                <span>Email address</span>
                <input type="email" name="email" required autoComplete="email" placeholder="you@example.com" data-testid="input-nl-email" />
              </label>
              <button className="nl-button nl-button-forest" type="submit" data-testid="button-nl-subscribe"><Mail size={15} /> Subscribe</button>
            </form>
            <p className="nl-subscribe-alt">
              Prefer a feed? <a href="/feed.xml" data-testid="link-nl-subscribe-rss">Subscribe via RSS <Rss size={13} /></a> — same issues, no inbox.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter onHome={false} topHref="#nl-top" />
    </div>
  );
}
