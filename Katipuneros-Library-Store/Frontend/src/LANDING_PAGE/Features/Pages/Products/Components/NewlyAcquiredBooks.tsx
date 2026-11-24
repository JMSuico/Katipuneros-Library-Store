// [Layer: LANDING_PAGE/Features/Pages/Products/Components]
// NewlyAcquiredBooks.tsx -- Newly acquired book catalog grid with interactive category filtering.
// Extracted from LandingPage/code.html lines 482-691.
// Connects to Endpoints/booksApi.ts for catalog data via expression lambdas.
import { FC, useState, useEffect, useCallback } from 'react';
import { BookDetailData, CatalogBook } from '../../Home/Components/BookDetailModal';
import { getPublicBooks, getCategories } from '../../../../../Endpoints/booksApi';

export type { CatalogBook };

interface NewlyAcquiredBooksProps {
  onOpenDetail: (book: BookDetailData) => void;
  onOpenReserve: (book: BookDetailData) => void;
  searchFilter?: string;
}

export const NewlyAcquiredBooks: FC<NewlyAcquiredBooksProps> = ({
  onOpenDetail,
  onOpenReserve,
  searchFilter = '',
}) => {
  const [books, setBooks] = useState<BookDetailData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCatalog = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [liveBooks, liveCats] = await Promise.all([
        getPublicBooks(),
        getCategories(),
      ]);

      const catNames = Array.from(new Set(liveCats.map((c) => c.name).filter(Boolean)));
      setCategories(['All', ...catNames]);

      const liveAsCatalogBooks: CatalogBook[] = liveBooks.map((b, idx) => ({
        id: b.id || b.isbn || String(idx),
        title: b.title,
        author: b.author,
        category: b.category,
        stock: `${b.availableCopies} Available`,
        isbn: b.isbn,
        synopsis: b.summary || 'Curated volume from university archives.',
        coverImage: b.coverImage || '',
      }));
      setBooks(liveAsCatalogBooks);
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Unable to load the library catalog right now. Please try again.';
      setBooks([]);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCatalog();
  }, [fetchCatalog]);

  const filteredBooks = books.filter((b) => {
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
        {isLoading ? (
          <div className="col-span-full py-16 text-center flex flex-col items-center justify-center p-8 bg-white/70 rounded-3xl border border-outline-variant/20">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-3">progress_activity</span>
            <p className="font-small text-small text-text-secondary">Loading library catalog...</p>
          </div>
        ) : errorMessage ? (
          <div
            role="alert"
            className="col-span-full py-12 text-center flex flex-col items-center justify-center p-8 bg-status-danger/5 rounded-3xl border border-status-danger/25"
          >
            <span className="material-symbols-outlined text-4xl text-status-danger mb-3">cloud_off</span>
            <h3 className="font-headline-4 text-headline-4 text-text-primary font-bold">
              Catalog Unavailable
            </h3>
            <p className="font-small text-small text-text-secondary mt-1 max-w-md">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={() => void fetchCatalog()}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-action-green text-text-primary font-body-medium text-small font-semibold shadow-sm hover:bg-action-green-hover transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              <span>Retry</span>
            </button>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="col-span-full py-16 text-center flex flex-col items-center justify-center p-8 bg-white/70 rounded-3xl border border-dashed border-outline-variant/40">
            <span className="material-symbols-outlined text-5xl text-text-secondary/50 mb-3">menu_book</span>
            <h3 className="font-headline-4 text-headline-4 text-text-primary font-bold">No Catalog Items Found</h3>
            <p className="font-small text-small text-text-secondary mt-1 max-w-md">
              {books.length === 0
                ? 'The library catalog currently has no published titles.'
                : `No books currently match "${selectedCategory}"${searchFilter ? ` with keyword "${searchFilter}"` : ''}. Try selecting "All" or clearing your search filters.`}
            </p>
            {selectedCategory !== 'All' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className="mt-4 px-5 py-2 rounded-full bg-action-green text-text-primary font-body-medium text-small font-semibold shadow-sm hover:bg-action-green-hover transition-colors cursor-pointer"
              >
                Show All Categories
              </button>
            )}
          </div>
        ) : (
          filteredBooks.map((book, idx) => (
            <div
              key={book.id || book.isbn || `${book.title}-${idx}`}
              className="group p-space-lg rounded-3xl bg-white/80 backdrop-blur-md shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative w-full h-56 rounded-2xl overflow-hidden mb-space-md bg-secondary-container shadow-inner flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                  {book.coverImage ? (
                    <img
                      className="w-full h-full object-cover"
                      alt={book.title}
                      src={book.coverImage}
                    />
                  ) : (
                    <span className="material-symbols-outlined text-5xl text-primary/40">menu_book</span>
                  )}
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
          ))
        )}
      </div>
    </div>
  );
};

export default NewlyAcquiredBooks;
