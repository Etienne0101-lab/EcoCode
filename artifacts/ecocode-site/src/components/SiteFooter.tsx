import { ArrowRight, ArrowUpRight, ChevronUp } from 'lucide-react';
import { Link } from 'wouter';
import { ECOGREEN_URL, HOME_SECTIONS, REPO_URL, SiteWordmark, WEB_APP_URL } from './SiteNav';
import './SiteFooter.css';

/**
 * Shared site footer — the same three columns on every page, mirroring
 * the integrated header: EXPLORE (homepage sections), PAGES (all four
 * pages), PROJECT (GitHub, live web app, EcoGreen Biotech). On subpages,
 * EXPLORE links are wouter Links to "/#section" (same landing behaviour
 * as the header); on the homepage they are plain in-page anchors.
 */
export default function SiteFooter({ onHome, topHref, lightAbove = false }: { onHome: boolean; topHref: string; lightAbove?: boolean }) {
  return (
    <footer className={`sn-footer ${lightAbove ? 'sn-footer-light-above' : ''}`}>
      <div className="sn-wrap sn-footer-main">
        <div className="sn-footer-brand">
          <SiteWordmark light />
          <p>Connected intelligence for environmental<br />and infrastructure operations.</p>
        </div>
        <div className="sn-footer-col">
          <span className="sn-footer-eyebrow">Explore</span>
          {HOME_SECTIONS.map(([label, href]) => onHome
            ? <a key={href} href={href} data-testid={`link-footer-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}>{label}</a>
            : <Link key={href} href={`/${href}`} data-testid={`link-footer-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}>{label}</Link>)}
        </div>
        <div className="sn-footer-col">
          <span className="sn-footer-eyebrow">Pages</span>
          <Link href="/" data-testid="link-footer-home-page">EcoCode home <ArrowRight size={12} /></Link>
          <Link href="/waste-intelligence" data-testid="link-footer-waste-intelligence">Waste Intelligence page <ArrowRight size={12} /></Link>
          <Link href="/knowledge-graph" data-testid="link-footer-knowledge-graph">Knowledge Graph page <ArrowRight size={12} /></Link>
          <Link href="/partners" data-testid="link-footer-partners">Partners page <ArrowRight size={12} /></Link>
        </div>
        <div className="sn-footer-col">
          <span className="sn-footer-eyebrow">Project</span>
          <a href={REPO_URL} target="_blank" rel="noreferrer" data-testid="link-footer-github">GitHub project <ArrowUpRight size={12} /></a>
          <a href={WEB_APP_URL} target="_blank" rel="noreferrer" data-testid="link-footer-live-web-app">Live web app <ArrowUpRight size={12} /></a>
          <a href={ECOGREEN_URL} target="_blank" rel="noreferrer" data-testid="link-footer-ecogreen">EcoGreen Biotech <ArrowUpRight size={12} /></a>
        </div>
        <div className="sn-footer-note">
          <span className="sn-footer-eyebrow">About this platform</span>
          <p>EcoCode brings common sensing, connectivity and analytics building blocks to diverse city and environmental systems.</p>
        </div>
      </div>
      <div className="sn-wrap sn-footer-bottom">
        <span data-testid="text-copyright">© {new Date().getFullYear()} EcoCode LLC</span>
        <span>Connected systems. Clearer decisions.</span>
        <a href={topHref} data-testid="link-back-to-top">Back to top <ChevronUp size={13} /></a>
      </div>
    </footer>
  );
}
