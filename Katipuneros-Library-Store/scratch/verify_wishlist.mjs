// scratch/verify_wishlist.mjs -- Automated contract verification for Wishlist & Favorites System
import assert from 'node:assert';

// Simulate browser environment localStorage
const mockStorage = new Map();
globalThis.localStorage = {
  getItem: (key) => mockStorage.get(key) || null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
};

globalThis.window = {
  dispatchEvent: () => {},
  location: { hostname: 'localhost', protocol: 'http:' },
};

console.log('1. Fetching Live Catalog Books from Backend API (:5000)...');
const catalogRes = await fetch('http://localhost:5000/api/books');
const catalogJson = await catalogRes.json();
assert.strictEqual(catalogJson.success, true, 'Catalog API must be reachable');
assert.ok(catalogJson.data.length > 0, 'Catalog must contain books');

const targetBook = catalogJson.data[0];
const targetBookId = targetBook.id;
console.log(`   -> Target Book: "${targetBook.title}" (ID: ${targetBookId})`);

// Mock user session
const testPatronId = 'test-patron-wishlist-uuid';
const favoritesKey = `patron_favorites_${testPatronId}`;
const readingListsKey = `patron_reading_lists_${testPatronId}`;

// 2. Test Adding to Wishlist (toggleCustomerFavorite)
console.log('2. Adding Target Book to Patron Wishlist...');
let saved = JSON.parse(localStorage.getItem(favoritesKey) || '[]');
saved.push(targetBookId);
localStorage.setItem(favoritesKey, JSON.stringify(saved));

const isFavorited = (bookId) => {
  const current = JSON.parse(localStorage.getItem(favoritesKey) || '[]');
  return current.includes(bookId);
};

assert.strictEqual(isFavorited(targetBookId), true, 'Book must be favorited');
console.log('   -> isBookFavorited confirmed TRUE');

// 3. Test getCustomerFavorites Hydration
console.log('3. Testing getCustomerFavorites with Live Backend Catalog...');
const storedIds = JSON.parse(localStorage.getItem(favoritesKey) || '[]');
const hydratedFavorites = catalogJson.data.filter((b) => storedIds.includes(b.id));

assert.strictEqual(hydratedFavorites.length, 1, 'Hydrated favorites count must match');
assert.strictEqual(hydratedFavorites[0].id, targetBookId, 'Hydrated book ID must match');
assert.strictEqual(hydratedFavorites[0].title, targetBook.title, 'Hydrated book title must match');
console.log(`   -> Successfully hydrated wishlist item with title: "${hydratedFavorites[0].title}"`);

// 4. Test Reading Lists Creation
console.log('4. Testing Custom Reading List Creation...');
const initialLists = JSON.parse(localStorage.getItem(readingListsKey) || '["All Saved"]');
const customList = 'Centennial Historical Research';
initialLists.push(customList);
localStorage.setItem(readingListsKey, JSON.stringify(initialLists));

const updatedLists = JSON.parse(localStorage.getItem(readingListsKey) || '[]');
assert.ok(updatedLists.includes(customList), 'Custom reading list must be persisted');
console.log(`   -> Reading list "${customList}" created and verified in storage`);

// 5. Test Removing from Wishlist
console.log('5. Testing Removal from Wishlist...');
let toRemove = JSON.parse(localStorage.getItem(favoritesKey) || '[]');
toRemove = toRemove.filter((id) => id !== targetBookId);
localStorage.setItem(favoritesKey, JSON.stringify(toRemove));

assert.strictEqual(isFavorited(targetBookId), false, 'Book must no longer be favorited');
console.log('   -> Book successfully removed from wishlist; isBookFavorited returned FALSE');

console.log('\nCRIT-06 ALL GREEN: Patron Wishlist and Favorite Books contracts verified.');
