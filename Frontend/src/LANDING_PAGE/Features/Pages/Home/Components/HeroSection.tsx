// [Layer: LANDING_PAGE/Features/Pages/Home/Components]
// HeroSection.tsx -- Public landing page hero section with search, live stats, spotlight card, and 3D canvas.
// Extracted and converted from LandingPage/code.html lines 20-385.
// DO NOT put business logic or direct API calls here.
import { FC, useState } from 'react';
import BookHero3D from './BookHero3D';
import { BookDetailData } from './BookDetailModal';

interface HeroSectionProps {
  onOpenReserve: (book: BookDetailData) => void;
  onSearch: (query: string) => void;
}

const spotlightBook: BookDetailData = {
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  category: 'Literature & Classics',
  stock: '6 Copies Available',
  isbn: '978-0743273565',
  synopsis: 'The exemplary novel of the Jazz Age, exploring themes of decadence, idealism, and social upheaval in 1920s America.',
  coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7BawfTnhVcK1am4MWFQ8CFcN5Lr-W_W_Gv48kSY07bmMDBobOk9dJosnKet_QkbyPDbbP2saC_wVR6ebhaedpB_wvO4pbGYY1sVrN_qtLJh2eqHjdgi0HD6QWrb-hZy0mnrk4z0iuNxawhg-G9NpWBZw5XQmU8bY4nJrXVFzGlNt_T0rW9H0_b4qZt9euL68_UBaXmqW2JNd9mkxXsCGSIpHW8N-8POnAMyvqRopWenf_UpR2qHda',
};

export const HeroSection: FC<HeroSectionProps> = ({ onOpenReserve, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    const catalogEl = document.getElementById('products');
    if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full pt-28 pb-16 md:pt-36 md:pb-24 px-gutter overflow-hidden bg-gradient-to-b from-surface-container-low/80 via-background to-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline, Search, Quick Stats */}
          <div className="lg:col-span-6 flex flex-col items-start z-10">
            {/* Library Operational Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container border border-outline-variant/40 shadow-sm mb-space-md">
              <span className="w-2 h-2 rounded-full bg-action-green animate-pulse"></span>
              <span className="font-caption text-caption uppercase tracking-wider font-semibold text-text-primary">
                Open Today • 7:30 AM – 8:00 PM
              </span>
            </div>

            {/* Display Headline */}
            <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero text-text-primary tracking-tight font-extrabold mb-space-md leading-[1.1]">
              Browse, Reserve, &amp; Immerse in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-container to-secondary">
                Knowledge.
              </span>
            </h1>

            <p className="font-body text-body-large text-text-secondary mb-space-xl max-w-xl">
              The institutional repository and open circulation center of JRMSU Katipunan Campus. Browse volumes,
              request stack holds, or reserve physical books in real-time.
            </p>

            {/* Live Search Form */}
            <form onSubmit={handleSearchSubmit} className="w-full max-w-xl mb-space-lg">
              <div className="relative flex items-center p-1.5 rounded-2xl bg-white/90 backdrop-blur-xl shadow-lg border border-outline-variant/30">
                <span className="material-symbols-outlined text-text-secondary pl-3 pr-2 text-2xl">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, author, ISBN, or discipline..."
                  className="w-full py-2 bg-transparent text-text-primary placeholder:text-text-secondary/60 font-body text-small focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-small font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                >
                  <span>Find Book</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </form>

            {/* Quick Filter Tag Buttons */}
            <div className="flex flex-wrap items-center gap-2 mb-space-xl">
              <span className="font-caption text-caption font-semibold text-text-secondary mr-1">Popular:</span>
              {['Filipiniana', 'Computer Science', 'Literature', 'Natural Sciences', 'Periodicals'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    onSearch(tag);
                    const catalogEl = document.getElementById('products');
                    if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-text-primary font-caption text-caption transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Operational Metrics Bar */}
            <div className="grid grid-cols-3 gap-6 pt-space-md border-t border-outline-variant/30 w-full max-w-xl">
              <div>
                <div className="font-headline-3 text-headline-3 text-text-primary font-bold">18,000+</div>
                <div className="font-caption text-caption text-text-secondary">Cataloged Books</div>
              </div>
              <div>
                <div className="font-headline-3 text-headline-3 text-text-primary font-bold">500+</div>
                <div className="font-caption text-caption text-text-secondary">Active Members</div>
              </div>
              <div>
                <div className="font-headline-3 text-headline-3 text-primary font-bold">24/7</div>
                <div className="font-caption text-caption text-text-secondary">Digital Catalog</div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Scene + Floating Overlays */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[520px]">
            {/* Interactive 3D Canvas Container */}
            <div className="relative w-full h-[520px] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-tr from-soft-blue via-white/40 to-primary-fixed/30 backdrop-blur-sm">
              <BookHero3D />
            </div>

            {/* Floating Badge Top-Right */}
            <div className="absolute -top-4 -right-2 md:right-4 z-20 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/85 backdrop-blur-lg shadow-lg hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-action-green text-[18px]">verified</span>
              <span className="font-small text-small text-text-primary font-medium">248 Books Available Today</span>
            </div>

            {/* Floating Badge Middle-Left */}
            <div className="absolute top-28 -left-4 md:-left-8 z-20 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/90 backdrop-blur-lg shadow-lg hover:scale-105 transition-transform">
              <span className="flex h-2 w-2 rounded-full bg-status-available"></span>
              <span className="font-caption text-caption text-text-primary font-medium tracking-wide">
                Reservation Approved <span className="font-semibold text-primary">#KP-902</span>
              </span>
            </div>

            {/* Floating Badge Bottom-Right */}
            <div className="absolute bottom-6 right-2 md:-right-4 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 backdrop-blur-lg shadow-md hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-status-pending text-[18px]">local_fire_department</span>
              <span className="font-caption text-caption text-text-primary font-medium">Trending: Computer Science</span>
            </div>

            {/* Floating Glass Card Overlay (Hero Spotlight Book) */}
            <div className="absolute -bottom-8 left-4 md:left-8 z-30 max-w-xs w-full p-space-md rounded-2xl bg-white/85 backdrop-blur-xl shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">
                  Featured Book
                </span>
                <span className="inline-flex items-center gap-1 font-caption text-caption text-status-available font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-available"></span> Available
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-14 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-md bg-secondary-container">
                  <img
                    className="w-full h-full object-cover"
                    alt={spotlightBook.title}
                    src={spotlightBook.coverImage}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-headline-4 text-headline-4 text-text-primary truncate">{spotlightBook.title}</h4>
                  <p className="font-small text-small text-text-secondary truncate">{spotlightBook.author}</p>
                  <div className="flex items-center gap-0.5 text-[#EAB308] mt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className="material-symbols-outlined text-[16px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                className="mt-3 w-full py-2 px-3 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-small font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                onClick={() => onOpenReserve(spotlightBook)}
              >
                <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
                <span>Reserve Book</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
