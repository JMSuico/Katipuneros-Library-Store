// [Layer: LANDING_PAGE/Features/Pages/Home]
// Home.tsx -- Main landing page route entry.
// Composes HeroSection, ServicesSection, Product/Catalog, LibraryMapSection, and ContactForm.
// DO NOT put business logic or direct API calls here.
import { FC, useState } from 'react';
import HeroSection from './Components/HeroSection';
import AboutSection from '../About/Components/AboutSection';
import ServicesSection from '../Services/Components/ServicesSection';
import Product from '../Products/Product';
import LibraryMapSection from './Components/LibraryMapSection';
import ContactForm from '../ContactMe/Components/ContactForm';

const Home: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-full">
      {/* Hero Section with 3D Canvas */}
      <HeroSection onSearch={(q) => setSearchQuery(q)} />

      {/* Institutional Heritage & About Section */}
      <AboutSection />

      {/* Services Section */}
      <ServicesSection />

      {/* Catalog & Curated Products */}
      <Product searchFilter={searchQuery} />

      {/* Library Map & Hours Section */}
      <LibraryMapSection />

      {/* Contact Section */}
      <ContactForm />
    </div>
  );
};

export default Home;
