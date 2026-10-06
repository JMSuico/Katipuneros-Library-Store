// [Layer: LayoutBars]
// LandingHeader.tsx -- Public landing page floating navigation header.
// Renders the floating pill-shaped header with glassmorphism, dynamic ScrollSpy, and auth modal triggers.
// Extracted from LandingPage/code.html header element.

import React, { useState, useEffect } from 'react';
import { AuthModal } from '../Shared/Components/AuthModal';

const LOGO_URL = 'https://lh3.googleusercontent.com/aida/AEtjO1ULKR2-At3mMWWJpVDPDjA9IJakzSkbSa5XSRuHMRp9FP_z4wgxPquvURNmIn7pBo3qDybcHoJ0p3aqPmqigbmTF6L8uMiO50Pn_nfngEvaB2NjtIdS-AF002Kn2J_crIGUvNLPtaqOw0hjLWWotFcCcF92I98d8Wdb2_hqAxLH6KeWVXAQwnwge43KAC_-90WpmcqP7BNWnSvNgOgU-gywUu5UvIZ3bWseH7DSvWX4pWq1MmSHAz_pUe4';

interface NavItem {
  label: string;
  href: string;
  sectionId: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/#home', sectionId: 'home' },
  { label: 'About', href: '/#about', sectionId: 'about' },
  { label: 'Services', href: '/#services', sectionId: 'services' },
  { label: 'Products', href: '/#products', sectionId: 'products' },
  { label: 'Contact Me', href: '/#contact', sectionId: 'contact' },
];

const LandingHeader: React.FC = () => {
  const [activePath, setActivePath] = useState<string>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

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

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 pointer-events-none py-4 px-gutter">
        <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto h-16 px-space-lg rounded-full bg-white/75 backdrop-blur-[18px] border border-white/80 shadow-[0_4px_24px_rgba(24,50,61,0.08)]">
          {/* Logo + Brand Name */}
          <a
            href="/#home"
            onClick={(e) => handleNavClick(e, NAV_ITEMS[0])}
            className="flex items-center gap-space-sm cursor-pointer"
          >
            <img
              alt="Katipuneros Library Store logo"
              className="h-8 w-auto object-contain"
              src={LOGO_URL}
            />
            <span className="font-headline-4 text-headline-4 text-text-primary tracking-tight font-semibold">
              Katipuneros Library Store
            </span>
          </a>

          {/* Navigation Links with Active Pill ScrollSpy */}
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

          {/* Right Actions */}
          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              onClick={() => openAuth('signin')}
              className="hidden sm:inline-flex items-center justify-center px-space-md py-space-xs min-h-[44px] rounded-full font-body-medium text-body-medium text-primary hover:bg-white/60 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => openAuth('signup')}
              className="inline-flex items-center justify-center px-space-md py-space-xs min-h-[44px] rounded-full font-body-medium text-body-medium bg-action-green text-text-primary hover:bg-action-green-hover transition-colors shadow-sm font-semibold cursor-pointer"
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => openAuth('signin')}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
              title="Open Account Menu"
            >
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </button>
          </div>
        </div>
      </header>

      {/* Interactive Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default LandingHeader;
