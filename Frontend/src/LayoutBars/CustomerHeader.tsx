// [Layer: LayoutBars]
// CustomerHeader.tsx -- Customer panel top navigation header.
// Fixed header with glassmorphism, pill-shaped nav, search, notifications, profile.
// Extracted from CustomerPage/NavHomePage/code.html header element.
// DO NOT put business logic or API calls here.
import { useLocation, Link } from 'react-router-dom';

const LOGO_URL = 'https://lh3.googleusercontent.com/aida/AEtjO1ULKR2-At3mMWWJpVDPDjA9IJakzSkbSa5XSRuHMRp9FP_z4wgxPquvURNmIn7pBo3qDybcHoJ0p3aqPmqigbmTF6L8uMiO50Pn_nfngEvaB2NjtIdS-AF002Kn2J_crIGUvNLPtaqOw0hjLWWotFcCcF92I98d8Wdb2_hqAxLH6KeWVXAQwnwge43KAC_-90WpmcqP7BNWnSvNgOgU-gywUu5UvIZ3bWseH7DSvWX4pWq1MmSHAz_pUe4';

const PROFILE_URL = 'https://lh3.googleusercontent.com/aida/AEtjO1W-XmIunATvylcU6ZudrKG8B-mfq1yQQXyix8riDqwGsJnlxJCYiVDojqTon9vqRL7z8Ad5T_3ZtWukWO4SvHRgVsEoJhRTFRMfqoAFpjAge5_T4DgBP3Omz30PxQewMXcRRLUotFunX8pgenSaLE2I3uwjc2NliBlKaLmQjI2xKSwgLHM09oPggG5JwcO4RGHtUPm8rBuc97yjVx5rv1h5Avg0NuREUvT19ldKFdd8L99REO-e0i6Bkg';

interface NavItem {
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/customer/home' },
  { label: 'Catalog', path: '/customer/catalog' },
  { label: 'Reservations', path: '/customer/reservations' },
  { label: 'Borrowings', path: '/customer/borrowings' },
  { label: 'Favorites', path: '/customer/favorites' },
  { label: 'Settings', path: '/customer/profile' },
];

const CustomerHeader: React.FC = () => {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-chip-unselected-bg backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 w-full px-gutter flex items-center justify-between gap-space-md">
        {/* Logo + Brand */}
        <div className="flex items-center gap-space-sm shrink-0">
          <img alt="Katipuneros logo" className="h-8 w-auto object-contain" src={LOGO_URL} />
          <div className="flex flex-col">
            <span className="font-headline-4 text-headline-4 text-text-primary leading-tight">Katipuneros</span>
            <span className="font-caption text-caption text-text-secondary">Academic &amp; Digital Stacks</span>
          </div>
        </div>

        {/* Pill Navigation */}
        <nav className="hidden xl:flex items-center gap-space-xs px-space-xs py-space-xs bg-glass-surface rounded-full shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={
                  isActive
                    ? 'px-space-md py-space-xs transition-colors bg-primary-container text-on-primary-container font-medium rounded-full shadow-sm'
                    : 'px-space-md py-space-xs text-on-surface-variant hover:text-on-surface font-small text-small transition-colors rounded-full'
                }
                {...(isActive ? { 'aria-current': 'page' as const } : {})}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm">
          <div className="w-full flex items-center bg-surface-container-lowest/80 rounded-full px-space-md py-space-xs shadow-[0_1px_8px_rgba(0,0,0,0.02)] focus-within:ring-2 focus-within:ring-primary">
            <span className="material-symbols-outlined text-text-secondary mr-space-xs text-xl shrink-0">search</span>
            <input
              className="w-full bg-transparent font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none"
              placeholder="Search books, authors, ISBN... (Ctrl+K)"
              type="text"
            />
            <span className="hidden lg:inline-block font-caption text-caption bg-surface-container-high text-text-secondary px-space-xs py-0.5 rounded ml-space-xs shrink-0">
              ⌘K
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-space-sm shrink-0">
          {/* Holds & Borrowed Summary */}
          <div className="hidden sm:flex items-center gap-space-xs bg-soft-blue/60 text-text-primary font-caption text-caption px-space-md py-space-xs rounded-full shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
            <span className="material-symbols-outlined text-primary text-base">bookmark</span>
            <span>3 Holds</span>
            <span className="text-outline-variant">•</span>
            <span>2 Borrowed</span>
          </div>

          {/* Notification Bell */}
          <button
            className="relative p-space-xs rounded-full hover:bg-surface-container-high hover:text-on-surface text-on-surface-variant transition-colors flex items-center justify-center"
            type="button"
          >
            <span className="material-symbols-outlined text-text-primary">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-action-green rounded-full shadow-sm" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-space-xs pl-space-xs cursor-pointer rounded-full hover:bg-surface-container-high hover:text-on-surface p-space-xs transition-colors">
            <img alt="Profile" className="w-8 h-8 rounded-full object-cover" src={PROFILE_URL} />
            <span className="hidden lg:inline-block font-small text-small text-text-primary font-medium">Jhon Doe</span>
            <span className="material-symbols-outlined text-text-secondary text-base">arrow_drop_down</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
