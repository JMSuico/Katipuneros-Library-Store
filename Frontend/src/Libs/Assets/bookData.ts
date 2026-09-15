// [Layer: Libs/Assets]
// bookData.ts -- Static book data catalog for landing page and preview displays.
// DO NOT put UI components or business logic here.

export interface StaticBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  coverImage: string;
  status: 'available' | 'borrowed' | 'reserved';
  rating: number;
  availableCopies: number;
  totalCopies: number;
  summary: string;
  location: string;
}

export const FEATURED_BOOKS: StaticBook[] = [
  {
    id: 'book-1',
    title: 'The Great Philippine Revolution',
    author: 'Teodoro Agoncillo',
    isbn: '978-971-555-001-2',
    category: 'Philippine History',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    status: 'available',
    rating: 4.9,
    availableCopies: 8,
    totalCopies: 10,
    summary: 'A comprehensive study of the Katipunan movement and Philippine independence struggle.',
    location: 'Filipiniana Sec. Row 3',
  },
  {
    id: 'book-2',
    title: 'Noli Me Tangere: Centenary Edition',
    author: 'Dr. Jose P. Rizal',
    isbn: '978-971-555-002-9',
    category: 'Literature & Classics',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80',
    status: 'available',
    rating: 5.0,
    availableCopies: 12,
    totalCopies: 15,
    summary: 'The defining masterpiece of Philippine literature and social awakening.',
    location: 'Filipiniana Sec. Row 1',
  },
  {
    id: 'book-3',
    title: 'Data Structures and Algorithms in Modern C#',
    author: 'Robert Lafore',
    isbn: '978-013-142-923-9',
    category: 'Computer Science',
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=400&q=80',
    status: 'reserved',
    rating: 4.7,
    availableCopies: 2,
    totalCopies: 6,
    summary: 'In-depth algorithms guide with enterprise design pattern considerations.',
    location: 'Technology Stack 4',
  },
  {
    id: 'book-4',
    title: 'Modern Organic Chemistry: Principles and Applications',
    author: 'Paula Yurkanis Bruice',
    isbn: '978-013-404-228-2',
    category: 'Natural Sciences',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
    status: 'available',
    rating: 4.6,
    availableCopies: 5,
    totalCopies: 8,
    summary: 'Foundational organic reactions and laboratory procedures.',
    location: 'Sciences Bay B',
  },
];
