import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Link } from 'wouter';
import './SiteNav.css';

/**
 * Integrated site navigation — one header on every page.
 *
 * Two tiers, one bar:
 *   1. Site pages: Home, Waste Intelligence, Knowledge Graph, Partners,
 *      plus the public GitHub project (the live web app lives in the
 *      footer and on the Waste Intelligence page, so the bar stays short).
 *   2. On this page: the current page's sections, so every titled section
 *      is reachable without scrolling or hunting through the footer.
 *
 * On the homepage, section links are plain in-page anchors. On subpages
 * they are wouter Links to "/#section", which land on the homepage and
 * scroll to the section on mount (the homepage already scrolls to the
 * URL hash when it loads). The mobile panel carries both tiers, labelled,
 * and closes on link click or Escape. A skip link targets #main-content,
 * which every page's <main> now carries.
 */

export const REPO_URL = 'https://github.com/EcoCode-Smart-City-Infrastructure/waste-intelligence-platform';
export const WEB_APP_URL = 'https://ecocode-smart-city-infrastructure.github.io/waste-intelligence-platform/';
export const ECOGREEN_URL = 'https://ecogreenbiotech.com/';

export type SitePageId = 'home' | 'waste' | 'knowledge' | 'partners';

export const HOME_SECTIONS: ReadonlyArray<readonly [string, string]> = [
  ['Approach', '#approach'],
  ['Architecture', '#architecture'],
  ['Applications', '#applications'],
  ['NYC pilot', '#pilot'],
  ['Open project', '#project'],
  ['About', '#about'],
];

const SITE_PAGES: ReadonlyArray<readonly [string, string, SitePageId]> = [
  ['Home', '/', 'home'],
  ['Waste Intelligence', '/waste-intelligence', 'waste'],
  ['Knowledge Graph', '/knowledge-graph', 'knowledge'],
  ['Partners', '/partners', 'partners'],
];

export function SiteWordmark({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`sn-wordmark ${light ? 'sn-wordmark-light' : ''}`} aria-label="EcoCode home" data-testid={light ? 'link-footer-home' : 'link-header-home'}>
      <span className="sn-brand-mark" aria-hidden="true"><span /><span /><span /></span>
      <span className="sn-brand-name">eco<span>code</span></span><span className="sn-brand-llc">LLC</span>
    </Link>
  );
}

function SectionLink({ label, href, onHome, onClick, testPrefix }: {
  label: string; href: string; onHome: boolean; onClick?: () => void; testPrefix: string;
}) {
  const testId = `${testPrefix}-${label.toLowerCase().replace(/\s+/g, '-')}`;
  if (onHome) {
    return <a href={href} data-testid={testId} onClick={onClick}>{label}</a>;
  }
  return <Link href={`/${href}`} data-testid={testId} onClick={onClick}>{label}</Link>;
}

export default function SiteNav({ current, sections, onHome }: {
  current: SitePageId;
  sections: ReadonlyArray<readonly [string, string]>;
  onHome: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <>
      <a className="sn-skip" href="#main-content">Skip to content</a>
      <header className="sn-header">
        <div className="sn-wrap sn-main-row">
          <SiteWordmark />
          <nav className="sn-site-nav" aria-label="Site pages">
            {SITE_PAGES.map(([label, href, id]) => (
              <Link key={href} href={href} aria-current={id === current ? 'page' : undefined} data-testid={`link-nav-page-${id}`}>
                {label}
              </Link>
            ))}
          </nav>
          <a className="sn-cta" href={REPO_URL} target="_blank" rel="noreferrer" data-testid="link-nav-github">
            GitHub project <ArrowUpRight size={14} />
          </a>
          <button
            className="sn-toggle" type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen} aria-controls="sn-mobile-nav"
            data-testid="button-toggle-navigation" onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        <div className="sn-wrap sn-sections-row">
          <span className="sn-sections-label" aria-hidden="true">On this page</span>
          <nav className="sn-sections-nav" aria-label="On this page">
            {sections.map(([label, href]) => (
              <SectionLink key={href} label={label} href={href} onHome={onHome} testPrefix="link-nav-section" />
            ))}
          </nav>
        </div>
        {menuOpen && (
          <nav id="sn-mobile-nav" className="sn-mobile-nav" aria-label="Site and page navigation">
            <span className="sn-mobile-group-label">Site</span>
            {SITE_PAGES.map(([label, href, id]) => (
              <Link key={href} href={href} aria-current={id === current ? 'page' : undefined} data-testid={`link-mobile-page-${id}`} onClick={closeMenu}>
                {label} <ArrowUpRight size={15} />
              </Link>
            ))}
            <a href={REPO_URL} target="_blank" rel="noreferrer" data-testid="link-mobile-github" onClick={closeMenu}>
              GitHub project <ArrowUpRight size={15} />
            </a>
            <a href={WEB_APP_URL} target="_blank" rel="noreferrer" data-testid="link-mobile-web-app" onClick={closeMenu}>
              Live web app <ArrowUpRight size={15} />
            </a>
            <span className="sn-mobile-group-label">On this page</span>
            {sections.map(([label, href]) => (
              <SectionLink key={href} label={label} href={href} onHome={onHome} onClick={closeMenu} testPrefix="link-mobile-section" />
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
