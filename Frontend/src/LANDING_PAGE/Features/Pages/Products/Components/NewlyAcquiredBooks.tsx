// [Layer: LANDING_PAGE/Features/Pages/Products/Components]
// NewlyAcquiredBooks.tsx -- Newly acquired book catalog grid with interactive category filtering.
// Extracted from LandingPage/code.html lines 482-691.
// DO NOT put business logic or API calls here.
import { FC, useState } from 'react';
import { BookDetailData } from '../../Home/Components/BookDetailModal';

interface NewlyAcquiredBooksProps {
  onOpenDetail: (book: BookDetailData) => void;
  onOpenReserve: (book: BookDetailData) => void;
  searchFilter?: string;
}

export const CATALOG_BOOKS: BookDetailData[] = [
  {
    title: 'Introduction to Algorithms (4th Edition)',
    author: 'Thomas H. Cormen, Charles E. Leiserson',
    category: 'Technology',
    stock: '18 Available',
    isbn: '978-0262046305',
    synopsis: 'The leading comprehensive textbook and reference for modern algorithms research, covering dynamic programming, graph traversal, and multithreading.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQf-XWzD_o5lE50r6j0s7_qZ4y2n-K4gTqZ5F5jL0cI9Q_Y8f-1u2w3e4r5t6y7u8i9o0p=w400',
  },
  {
    title: 'The Feynman Lectures on Physics',
    author: 'Richard Feynman, Robert Leighton',
    category: 'Science',
    stock: '7 Available',
    isbn: '978-0465023820',
    synopsis: 'Legendary lectures delivering deep intuition on quantum electrodynamics, classical mechanics, gravitation, and thermodynamics.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcIeS2Woom5vrHVaF2Q1MlJ9H7qDaaLnIjiAKAIRfoQZz2__2lPUogwfJp2qUvBuIhMipDBa0GugWXUNhqh8it0yVHxVNCXHTlVxXgEFadBM2ki7MogVWhYIFX_Ku0OSjCUYUJBF8a8t3CyTUD0DeAKHHhRL_JBkLOkRMYna1S3f9k9BBvyMba4i8WgcY2rpm6BubN6ZT51-P217OBXL3Xuf4oPIFynbo3IJVPgjg5EM8u4cp6Kd8P',
  },
  {
    title: 'Noli Me Tangere',
    author: 'Dr. Jose P. Rizal',
    category: 'History',
    stock: '24 Available',
    isbn: '978-0143106395',
    synopsis: 'The foundational novel of Philippine national consciousness exposing social cancer, colonial tyranny, and the yearning for liberty.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0s7qB5_v_c2w1r3t4y5u6i7o8p9a0s1d2f3g4h5j6k7l8z9x0c1v2b3n4m5=w400',
  },
  {
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell, Peter Norvig',
    category: 'Technology',
    stock: '9 Available',
    isbn: '978-0134610993',
    synopsis: 'The standard global authority on artificial intelligence, neural networks, machine learning, probabilistic reasoning, and robotics.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9e8r7t6y5u4i3o2p1a0s9d8f7g6h5j4k3l2z1x0c9v8b7n6m5=w400',
  },
  {
    title: 'Meditations',
    author: 'Marcus Aurelius',
    category: 'History',
    stock: '12 Available',
    isbn: '978-0812968255',
    synopsis: 'A collection of personal writings by the Roman Emperor Marcus Aurelius on Stoic philosophy, cosmic order, spiritual resilience, and ethical leadership.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuE1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6j7k8l9z0x1c2v3b4n5=w400',
  },
  {
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    category: 'Science',
    stock: '11 Available',
    isbn: '978-0465050659',
    synopsis: 'The seminal guide to human-centered cognitive ergonomics, affordances, signifiers, and usable product architecture.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA87Z3xipnijFCsV4bwTpKjnd2TNwCGQMvOJwoCiQV32OU5RsqUW1C0SX6cq10zUTDNITGy7Pg-5n8wLGMWLH3yp2eT319vnWw0PhBgAqZhJuRauLZGZWm9HZoXxMG1eee5Ut8EfBPLif-0nXtod2q89SlWcQTnqZbO7M6WmhlaTUaGUfRnXLFYSnrPGFFfGYQDRfaUHdP13dIPl8n8ruYc717lhrScdrYUlD806A4xfIh1XNN5XQcM',
  },
];

export const NewlyAcquiredBooks: FC<NewlyAcquiredBooksProps> = ({
  onOpenDetail,
  onOpenReserve,
  searchFilter = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Technology', 'Science', 'History'];

  const filteredBooks = CATALOG_BOOKS.filter((b) => {
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    const matchesSearch =
      !searchFilter ||
      b.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.author.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.isbn.includes(searchFilter);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full">
      {/* Header and counter */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-xl gap-4">
        <div>
          <span className="font-caption text-caption tracking-widest uppercase text-primary font-semibold">
            CURATED ARCHIVE
          </span>
          <h2 className="font-headline-2 text-headline-2 text-text-primary mt-1">Explore Our Collection</h2>
          <p className="font-body text-body text-text-secondary mt-1">
            Discover books across multiple scholastic disciplines and reserve your physical copy instantly.
          </p>
        </div>
        <div className="flex items-center gap-2 text-text-secondary font-small text-small bg-white/80 px-4 py-2 rounded-full shadow-sm">
          <span className="material-symbols-outlined text-action-green text-[18px]">auto_stories</span>
          <span>
            Showing <strong className="text-text-primary">{filteredBooks.length}</strong> volumes
          </span>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-space-xl no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-full font-body-medium text-small transition-all duration-200 whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? 'bg-action-green text-text-primary font-semibold shadow-sm'
                : 'bg-white/70 text-text-secondary hover:bg-white shadow-sm'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
        {filteredBooks.map((book) => (
          <div
            key={book.title}
            className="group p-space-lg rounded-3xl bg-white/80 backdrop-blur-md shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="relative w-full h-56 rounded-2xl overflow-hidden mb-space-md bg-secondary-container shadow-inner flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                <img
                  className="w-full h-full object-cover"
                  alt={book.title}
                  src={book.coverImage}
                />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md font-caption text-caption text-status-available font-semibold shadow-sm">
                  {book.stock}
                </div>
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-primary/90 backdrop-blur-md font-caption text-caption text-white font-medium">
                  {book.category}
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#EAB308] mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    className="material-symbols-outlined text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
                <span className="font-caption text-caption text-text-primary font-bold ml-1">4.9</span>
              </div>
              <h3 className="font-headline-4 text-headline-4 text-text-primary font-bold line-clamp-1">
                {book.title}
              </h3>
              <p className="font-small text-small text-text-secondary mb-3">{book.author}</p>
              <p className="font-small text-small text-text-secondary line-clamp-2">{book.synopsis}</p>
            </div>
            <div className="pt-space-md grid grid-cols-2 gap-2 mt-2">
              <button
                className="py-2.5 px-3 rounded-xl bg-soft-blue text-primary font-body-medium text-small font-semibold hover:bg-white transition-colors cursor-pointer"
                onClick={() => onOpenDetail(book)}
              >
                Details
              </button>
              <button
                className="py-2.5 px-3 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-small font-semibold transition-all shadow-sm cursor-pointer"
                onClick={() => onOpenReserve(book)}
              >
                Reserve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewlyAcquiredBooks;
