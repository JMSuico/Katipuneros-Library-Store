// [Layer: LayoutBars]
// LandingHeader.tsx -- Public landing page floating navigation header.
// Renders the floating pill-shaped header with glassmorphism, dynamic ScrollSpy, auth modal triggers,
// and a fully responsive mobile hamburger drawer (<md screens).
// Extracted from LandingPage/code.html header element.

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { KatipunanLogo } from '../Shared/Components/KatipunanLogo';

// Lucide-spec vector icons for zero-dependency responsive navigation
const Menu: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const X: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="18" x2="6" y1="6" y2="18" />
    <line x1="6" x2="18" y1="18" y2="6" />
  </svg>
);

interface NavItem {
  label: string;
  drawerLabel?: string;
  href: string;
  sectionId: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', drawerLabel: 'Home', href: '/#home', sectionId: 'home', icon: 'home' },
  { label: 'About', drawerLabel: 'About Us', href: '/#about', sectionId: 'about', icon: 'info' },
  { label: 'Services', drawerLabel: 'Services & Stacks', href: '/#services', sectionId: 'services', icon: 'room_service' },
  { label: 'Products', drawerLabel: 'Catalog / Products', href: '/#products', sectionId: 'products', icon: 'menu_book' },
  { label: 'Contact Me', drawerLabel: 'Contact Desk', href: '/#contact', sectionId: 'contact', icon: 'mail' },
];

const LandingHeader: React.FC = () => {
  const [activePath, setActivePath] = useState<string>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const location = useLocation();

  // Close drawer when route or hash changes (state adjustment during render without triggering cascading effects)
  const currentPathKey = location.pathname + location.hash;
  const [prevPathKey, setPrevPathKey] = useState<string>(currentPathKey);
  if (currentPathKey !== prevPathKey) {
    setPrevPathKey(currentPathKey);
    setIsMobileMenuOpen(false);
  }

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dynamic ScrollSpy tracking active section in viewport
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const sectionIds = ['home', 'about', 'services', 'products', 'contact'];
      const scrollPos = window.scrollY + 180;

      // When reaching near the bottom, guarantee 'contact' activation
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60) {
        setActivePath('contact');
        return;
      }

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) {
          setActivePath(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: NavItem) => {
    setIsMobileMenuOpen(false);
    if (typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '')) {
      e.preventDefault();
      setActivePath(item.sectionId);
      const target = document.getElementById(item.sectionId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        window.history.replaceState(null, '', `#${item.sectionId}`);
      }
    } else {
      setActivePath(item.sectionId);
    }
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 pointer-events-none py-4 px-gutter">
        <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto h-16 px-space-lg rounded-full bg-white/75 backdrop-blur-[18px] border border-white/80 shadow-[0_4px_24px_rgba(24,50,61,0.08)]">
          {/* Logo + Brand Name */}
          <KatipunanLogo
            variant="landing"
            to="/#home"
            onClick={(e) => handleNavClick(e as unknown as React.MouseEvent<HTMLAnchorElement>, NAV_ITEMS[0])}
          />

          {/* Desktop Navigation Links with Active Pill ScrollSpy (md:flex) */}
          <nav className="hidden md:flex items-center gap-1 bg-surface-container-low/60 p-1 rounded-full border border-outline-variant/15">
            {NAV_ITEMS.map((item) => {
              const isActive = activePath === item.sectionId;
              return (
                <a
                  key={item.sectionId}
                  href={item.href}
                  className={`font-body-medium text-body-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-primary text-white font-bold px-4 py-1.5 rounded-full shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-black/5 px-3.5 py-1.5 rounded-full'
                  }`}
                  onClick={(e) => handleNavClick(e, item)}
                  {...(isActive ? { 'aria-current': 'page' as const } : {})}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Right Actions -- Direct Navigation to Dedicated Separate Pages */}
          <div className="flex items-center gap-space-sm">
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center justify-center px-space-md py-space-xs min-h-[44px] rounded-full font-body-medium text-body-medium text-primary hover:bg-white/60 transition-colors cursor-pointer"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-space-md py-space-xs min-h-[44px] rounded-full font-body-medium text-body-medium bg-action-green text-text-primary hover:bg-action-green-hover transition-colors shadow-sm font-semibold cursor-pointer"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="hidden sm:flex w-8 h-8 rounded-full bg-primary items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
              title="Sign In to Circulation Portal"
            >
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </Link>

            {/* Mobile Hamburger Toggle Button (visible on <md screens) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-text-primary hover:text-primary hover:bg-black/5 active:bg-black/10 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label={isMobileMenuOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-[#8B0000]" />
              ) : (
                <Menu className="w-6 h-6 text-text-primary" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer Backdrop & Sheet (<md screens) */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-sm bg-white/95 backdrop-blur-2xl border-l border-stone-200/80 shadow-2xl flex flex-col justify-between p-6 transition-transform duration-300 ease-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
        }`}
        aria-label="Mobile navigation drawer"
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Header & Navigation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <KatipunanLogo
              variant="landing"
              to="/#home"
              onClick={(e) => {
                setIsMobileMenuOpen(false);
                handleNavClick(e as unknown as React.MouseEvent<HTMLAnchorElement>, NAV_ITEMS[0]);
              }}
            />
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-stone-700" />
            </button>
          </div>

          {/* Subtitle / Katipuneros Verified Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-600/20 text-[#B8860B] text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Katipuneros Public Archives & Library</span>
          </div>

          {/* Drawer Navigation Links */}
          <nav className="space-y-1 pt-1 overflow-y-auto max-h-[50vh]" aria-label="Mobile drawer navigation">
            {NAV_ITEMS.map((item) => {
              const isActive = activePath === item.sectionId;
              return (
                <a
                  key={item.sectionId}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-body-medium text-sm transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#8B0000] text-white font-bold shadow-md shadow-[#8B0000]/20'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100 active:bg-stone-200 font-medium'
                  }`}
                  {...(isActive ? { 'aria-current': 'page' as const } : {})}
                >
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-white' : 'text-[#8B0000]'}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.drawerLabel || item.label}</span>
                  {isActive ? (
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  ) : (
                    <span className="material-symbols-outlined text-[16px] text-stone-400">chevron_right</span>
                  )}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Drawer Bottom Actions: Sign In / Register */}
        <div className="pt-4 border-t border-stone-200/80 space-y-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 px-1">
            Patron Access
          </div>
          <Link
            to="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#8B0000]/30 text-[#8B0000] font-semibold hover:bg-[#8B0000]/5 transition-colors cursor-pointer text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            <span>Sign In to Circulation Portal</span>
          </Link>
          <Link
            to="/signup"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-action-green text-text-primary font-bold hover:bg-action-green-hover transition-colors shadow-sm cursor-pointer text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            <span>Register Patron Account</span>
          </Link>
          <div className="flex items-center justify-between text-[10px] text-stone-500 px-1 pt-1">
            <span>Katipuneros Library Store</span>
            <span className="font-mono text-[#B8860B] font-semibold">PORT 5173</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default LandingHeader;
