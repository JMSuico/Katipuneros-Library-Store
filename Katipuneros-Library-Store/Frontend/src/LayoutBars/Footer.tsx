// [Layer: LayoutBars]
// Footer.tsx -- Global footer component for the Landing Page.
// Dark teal footer with logo, copyright, and navigation links.
// Extracted from LandingPage/code.html footer element.
// DO NOT put business logic or API calls here.

import React from 'react';
import { KatipunanLogo } from '../Shared/Components/KatipunanLogo';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#164E63] text-white py-space-2xl px-gutter">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-space-lg text-center md:text-left">
        {/* Logo + Brand */}
        <KatipunanLogo variant="footer" showSubtitle={false} />

        {/* Copyright */}
        <p className="font-small text-small text-white/70">
          © 2024 Katipuneros Library Store. Academic Excellence and Digital Discovery.
        </p>

        {/* Footer Nav Links */}
        <div className="flex items-center gap-space-md">
          <a className="font-small text-small text-white/80 hover:text-white transition-colors" href="/#home">
            Home
          </a>
          <a className="font-small text-small text-white/80 hover:text-white transition-colors" href="/about">
            About
          </a>
          <a className="font-small text-small text-white/80 hover:text-white transition-colors" href="/#services">
            Services
          </a>
          <a className="font-small text-small text-white/80 hover:text-white transition-colors" href="/products">
            Products
          </a>
          <a className="font-small text-small text-white/80 hover:text-white transition-colors" href="/contact">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
