// [Layer: LANDING_PAGE/Features/Pages/Products/Components]
// BookCarousel.tsx -- Curator spotlight and featured book showcase banner with 3D tilt perspective.
// Converted from LandingPage/code.html lines 693-755.
// DO NOT put business logic or API calls here.
import { FC } from 'react';
import { BookDetailData } from '../../Home/Components/BookDetailModal';

interface BookCarouselProps {
  onOpenDetail: (book: BookDetailData) => void;
  onOpenReserve: (book: BookDetailData) => void;
}

const curatorSpotlightBook: BookDetailData = {
  title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
  author: 'Robert C. Martin (Uncle Bob)',
  category: 'Technology',
  stock: '4 copies available',
  isbn: '978-0132350884',
  synopsis:
    "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Master the paradigms of meaningful names, functions, error handling, and test-driven refactoring.",
  coverImage:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAFIQI3glyF09h3FcRXZ7KLl_mmTT8tmj4JshTnuFtOEPOrCY6E79x5Y2BaUh7NK2FhPi8t750myeqv04P1V5adAhhGLapucYyMn6aSW6w1d9wX-6gaXGPEfWe69ojvVtg6a_QS1zjpcxogBaKULmJLAzag0UGFv78PQcgrzZxKN-W03OAA82uIpiF5u3ZtBsAPvGnDy52IS-1mrcUtcr0wmUA7wRydRhCM11KK43i_4eJW0vCKOsSr',
};

export const BookCarousel: FC<BookCarouselProps> = ({ onOpenDetail, onOpenReserve }) => {
  return (
    <section className="w-full py-space-3xl px-gutter relative">
      <div className="max-w-7xl mx-auto">
        <div className="p-space-xl md:p-space-3xl rounded-[32px] bg-gradient-to-br from-white/90 via-white/75 to-soft-blue/50 backdrop-blur-xl shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-2xl items-center">
            {/* Left Cover Showcase with 3D tilt feel */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 md:w-80 h-96 md:h-[440px] rounded-2xl overflow-hidden shadow-2xl transform lg:-rotate-2 hover:rotate-0 transition-transform duration-500 bg-secondary group cursor-pointer">
                <img
                  className="w-full h-full object-cover"
                  alt="Curator spotlight book Clean Code"
                  src={curatorSpotlightBook.coverImage}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-text-primary/70 via-transparent to-transparent flex items-end p-space-lg">
                  <div className="text-white">
                    <span className="font-caption text-caption uppercase tracking-wider text-action-green font-bold">
                      Recommended Reading
                    </span>
                    <p className="font-headline-4 text-headline-4 font-semibold mt-1">Robert C. Martin</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Details */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-caption text-caption uppercase tracking-wider font-semibold mb-space-md">
                <span className="material-symbols-outlined text-[16px]">stars</span>
                <span>Curator Spotlight</span>
              </div>
              <h2 className="font-headline-1 text-headline-2 md:text-headline-1 text-text-primary font-bold mb-space-sm">
                Clean Code: A Handbook of Agile Software Craftsmanship
              </h2>
              <p className="font-body-large text-body-large text-primary font-medium mb-space-md">
                By Robert C. Martin (Uncle Bob)
              </p>
              <p className="font-body text-body text-text-secondary mb-space-lg leading-relaxed">
                Clean Code is divided into three parts. The first describes the principles, patterns, and practices of
                writing clean code. The second consists of several case studies of increasing complexity. The third part
                is the payoff: heuristics and smells gathered while creating the case studies.
              </p>

              {/* Metadata Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full bg-white/60 backdrop-blur-sm p-space-md rounded-2xl mb-space-xl">
                <div>
                  <span className="font-caption text-caption text-text-secondary block">ISBN</span>
                  <span className="font-small text-small text-text-primary font-semibold">978-0132350884</span>
                </div>
                <div>
                  <span className="font-caption text-caption text-text-secondary block">Pages</span>
                  <span className="font-small text-small text-text-primary font-semibold">464 Pages</span>
                </div>
                <div>
                  <span className="font-caption text-caption text-text-secondary block">Shelf Loc</span>
                  <span className="font-small text-small text-text-primary font-semibold">QA 76.76.C65</span>
                </div>
                <div>
                  <span className="font-caption text-caption text-text-secondary block">Hold Status</span>
                  <span className="font-small text-small text-status-available font-semibold">Ready for Hold</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-space-md">
                <button
                  className="px-8 py-3.5 rounded-full bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-semibold transition-all duration-200 shadow-md hover:-translate-y-0.5 flex items-center gap-2 min-h-[48px] cursor-pointer"
                  onClick={() => onOpenReserve(curatorSpotlightBook)}
                >
                  <span className="material-symbols-outlined text-[20px]">bookmark_add</span>
                  <span>Reserve Book</span>
                </button>
                <button
                  className="px-8 py-3.5 rounded-full bg-white text-primary hover:bg-soft-blue font-body-medium text-body-medium font-semibold transition-all duration-200 shadow-sm flex items-center gap-2 min-h-[48px] cursor-pointer"
                  onClick={() => onOpenDetail(curatorSpotlightBook)}
                >
                  <span className="material-symbols-outlined text-[20px]">menu_book</span>
                  <span>View Full Details</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookCarousel;
