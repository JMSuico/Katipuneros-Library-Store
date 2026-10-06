// [Layer: LANDING_PAGE/Features/Pages/Products]
// Product.tsx -- Route entry page for library products and book catalog.
// Route-level composition ONLY -- no business logic.
// DO NOT put business logic or direct API calls here.
import { FC, useState } from 'react';
import NewlyAcquiredBooks from './Components/NewlyAcquiredBooks';
import BookCarousel from './Components/BookCarousel';
import { BookDetailModal, BookDetailData } from '../Home/Components/BookDetailModal';
import { ReservationModal } from '../Home/Components/ReservationModal';

interface ProductPageProps {
  searchFilter?: string;
}

const Product: FC<ProductPageProps> = ({ searchFilter = '' }) => {
  const [selectedDetailBook, setSelectedDetailBook] = useState<BookDetailData | null>(null);
  const [selectedReserveBook, setSelectedReserveBook] = useState<BookDetailData | null>(null);

  return (
    <div className="w-full">
      <section className="w-full py-space-3xl px-gutter relative bg-surface-container-low/40" id="products">
        <div className="max-w-7xl mx-auto">
          <NewlyAcquiredBooks
            searchFilter={searchFilter}
            onOpenDetail={(book) => setSelectedDetailBook(book)}
            onOpenReserve={(book) => setSelectedReserveBook(book)}
          />
        </div>
      </section>

      <BookCarousel
        onOpenDetail={(book) => setSelectedDetailBook(book)}
        onOpenReserve={(book) => setSelectedReserveBook(book)}
      />

      <BookDetailModal
        isOpen={Boolean(selectedDetailBook)}
        onClose={() => setSelectedDetailBook(null)}
        book={selectedDetailBook}
        onReserve={(book) => setSelectedReserveBook(book)}
      />

      <ReservationModal
        isOpen={Boolean(selectedReserveBook)}
        onClose={() => setSelectedReserveBook(null)}
        book={selectedReserveBook}
      />
    </div>
  );
};

export default Product;
