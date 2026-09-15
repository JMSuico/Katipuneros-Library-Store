// [Layer: LANDING_PAGE/Features/Pages/Home]
// Home.tsx -- Main landing page route entry.
// Composes HeroSection, ServicesSection, Product/Catalog, LibraryMapSection, ContactForm, and dialogs.
// DO NOT put business logic or direct API calls here.
import { FC, useState } from 'react';
import HeroSection from './Components/HeroSection';
import ServicesSection from '../Services/Components/ServicesSection';
import Product from '../Products/Product';
import LibraryMapSection from './Components/LibraryMapSection';
import ContactForm from '../ContactMe/Components/ContactForm';
import { BookDetailModal, BookDetailData } from './Components/BookDetailModal';
import { ReservationModal } from './Components/ReservationModal';
import { AuthModal } from './Components/AuthModal';

const Home: FC = () => {
  const [selectedDetailBook, setSelectedDetailBook] = useState<BookDetailData | null>(null);
  const [selectedReserveBook, setSelectedReserveBook] = useState<BookDetailData | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-full">
      {/* Hero Section with 3D Canvas */}
      <HeroSection
        onOpenReserve={(book) => setSelectedReserveBook(book)}
        onSearch={(q) => setSearchQuery(q)}
      />

      {/* Services Section */}
      <ServicesSection />

      {/* Catalog & Curated Products */}
      <Product searchFilter={searchQuery} />

      {/* Library Map & Hours Section */}
      <LibraryMapSection />

      {/* Contact Section */}
      <ContactForm />

      {/* Modals */}
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

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
};

export default Home;
