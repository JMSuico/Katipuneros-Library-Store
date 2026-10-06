// [Layer: LayoutBars]
// Footer.tsx -- Global footer component for the Landing Page.
// Dark teal footer with logo, copyright, and navigation links.
// Extracted from LandingPage/code.html footer element.
// DO NOT put business logic or API calls here.

const LOGO_URL = 'https://lh3.googleusercontent.com/aida/AEtjO1ULKR2-At3mMWWJpVDPDjA9IJakzSkbSa5XSRuHMRp9FP_z4wgxPquvURNmIn7pBo3qDybcHoJ0p3aqPmqigbmTF6L8uMiO50Pn_nfngEvaB2NjtIdS-AF002Kn2J_crIGUvNLPtaqOw0hjLWWotFcCcF92I98d8Wdb2_hqAxLH6KeWVXAQwnwge43KAC_-90WpmcqP7BNWnSvNgOgU-gywUu5UvIZ3bWseH7DSvWX4pWq1MmSHAz_pUe4';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#164E63] text-white py-space-2xl px-gutter">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-space-lg text-center md:text-left">
        {/* Logo + Brand */}
        <div className="flex items-center gap-space-sm">
          <img
            alt="Katipuneros Library Store logo"
            className="h-8 w-auto object-contain brightness-0 invert"
            src={LOGO_URL}
          />
          <span className="font-headline-4 text-headline-4 text-white font-semibold tracking-tight">
            Katipuneros Library Store
          </span>
        </div>

        {/* Copyright */}
        <p className="font-small text-small text-white/70">
          © 2024 Katipuneros Library Store. Academic Excellence and Digital Discovery.
        </p>

        {/* Footer Nav Links */}
        <div className="flex items-center gap-space-md">
          <a className="font-small text-small text-white/80 hover:text-white transition-colors" href="#home">
            Home
          </a>
          <a className="font-small text-small text-white/80 hover:text-white transition-colors" href="#services">
            Services
          </a>
          <a className="font-small text-small text-white/80 hover:text-white transition-colors" href="#products">
            Products
          </a>
          <a className="font-small text-small text-white/80 hover:text-white transition-colors" href="#contact">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
