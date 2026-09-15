// [Layer: LayoutBars]
// LandingHeader.tsx -- Public landing page floating navigation header.
// Renders the floating pill-shaped header with glassmorphism.
// Extracted from LandingPage/code.html header element.
// DO NOT put business logic or API calls here.
import { useState } from 'react';

const LOGO_URL = 'https://lh3.googleusercontent.com/aida/AEtjO1ULKR2-At3mMWWJpVDPDjA9IJakzSkbSa5XSRuHMRp9FP_z4wgxPquvURNmIn7pBo3qDybcHoJ0p3aqPmqigbmTF6L8uMiO50Pn_nfngEvaB2NjtIdS-AF002Kn2J_crIGUvNLPtaqOw0hjLWWotFcCcF92I98d8Wdb2_hqAxLH6KeWVXAQwnwge43KAC_-90WpmcqP7BNWnSvNgOgU-gywUu5UvIZ3bWseH7DSvWX4pWq1MmSHAz_pUe4';

interface NavItem {
  label: string;
  href: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '#home', path: 'home' },
  { label: 'Services', href: '#services', path: 'services' },
  { label: 'Products', href: '#products', path: 'products' },
  { label: 'Contact Me', href: '#contact', path: 'contact-me' },
];

const LandingHeader: React.FC = () => {
  const [activePath, setActivePath] = useState<string>('home');

  const handleNavClick = (path: string) => {
    setActivePath(path);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 pointer-events-none py-4 px-gutter">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto h-16 px-space-lg rounded-full bg-white/65 backdrop-blur-[18px] border border-white/70 shadow-[0_4px_24px_rgba(24,50,61,0.06)]">
        {/* Logo + Brand Name */}
        <div className="flex items-center gap-space-sm">
          <img
            alt="Katipuneros Library Store logo"
            className="h-8 w-auto object-contain"
            src={LOGO_URL}
          />
          <span className="font-headline-4 text-headline-4 text-text-primary tracking-tight font-semibold">
            Katipuneros Library Store
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-space-lg">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.path}
              href={item.href}
              className={
                activePath === item.path
                  ? 'transition-colors text-primary font-bold'
                  : 'font-body-medium text-body-medium text-on-surface-variant hover:text-on-surface transition-colors'
              }
              onClick={() => handleNavClick(item.path)}
              {...(activePath === item.path ? { 'aria-current': 'page' as const } : {})}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-space-sm">
          <a
            className="hidden sm:inline-flex items-center justify-center px-space-md py-space-xs min-h-[44px] rounded-full font-body-medium text-body-medium text-primary hover:bg-white/50 transition-colors"
            href="#signin"
          >
            Sign In
          </a>
          <a
            className="inline-flex items-center justify-center px-space-md py-space-xs min-h-[44px] rounded-full font-body-medium text-body-medium bg-action-green text-text-primary hover:bg-action-green-hover transition-colors shadow-sm font-semibold"
            href="#signup"
          >
            Sign Up
          </a>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
