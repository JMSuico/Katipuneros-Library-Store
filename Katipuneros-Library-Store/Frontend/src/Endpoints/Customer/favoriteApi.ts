// [Layer: Endpoints/Customer]
// favoriteApi.ts -- API and persistence client for patron saved books, reading lists, and wishlist triage.
// Dispatches async operations via clean lambda expressions (=>).
// DO NOT put UI rendering or presentation logic here.

import { BackendBook, getBooks } from '../booksApi';
import { getStoredUser } from '../authApi';

const getFavoritesStorageKey = (): string => {
  const user = getStoredUser();
  const uid = user?.userId || (user as any)?.id || 'guest';
  return `patron_favorites_${uid}`;
};

const getReadingListsStorageKey = (): string => {
  const user = getStoredUser();
  const uid = user?.userId || (user as any)?.id || 'guest';
  return `patron_reading_lists_${uid}`;
};

export const getCustomerFavorites = async (): Promise<BackendBook[]> => {
  try {
    const raw = localStorage.getItem(getFavoritesStorageKey());
    const savedIds: string[] = raw ? JSON.parse(raw) : [];
    if (!savedIds.length) return [];

    // Hydrate saved books with latest catalog stock data
    const allBooks = await getBooks();
    return allBooks.filter((b) => savedIds.includes(b.id));
  } catch {
    return [];
  }
};

export const isBookFavorited = (bookId: string): boolean => {
  try {
    const raw = localStorage.getItem(getFavoritesStorageKey());
    const savedIds: string[] = raw ? JSON.parse(raw) : [];
    return savedIds.includes(bookId);
  } catch {
    return false;
  }
};

export const toggleCustomerFavorite = async (
  bookId: string
): Promise<{ isFavorited: boolean }> => {
  try {
    const raw = localStorage.getItem(getFavoritesStorageKey());
    const savedIds: string[] = raw ? JSON.parse(raw) : [];
    const index = savedIds.indexOf(bookId);
    let isFavorited = false;

    if (index >= 0) {
      savedIds.splice(index, 1);
      isFavorited = false;
    } else {
      savedIds.push(bookId);
      isFavorited = true;
    }

    localStorage.setItem(getFavoritesStorageKey(), JSON.stringify(savedIds));
    return { isFavorited };
  } catch {
    return { isFavorited: false };
  }
};

export const removeCustomerFavorite = async (bookId: string): Promise<boolean> => {
  try {
    const raw = localStorage.getItem(getFavoritesStorageKey());
    const savedIds: string[] = raw ? JSON.parse(raw) : [];
    const updated = savedIds.filter((id) => id !== bookId);
    localStorage.setItem(getFavoritesStorageKey(), JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
};

export const getReadingLists = async (): Promise<string[]> => {
  try {
    const raw = localStorage.getItem(getReadingListsStorageKey());
    return raw ? JSON.parse(raw) : ['All Saved'];
  } catch {
    return ['All Saved'];
  }
};

export const createReadingList = async (name: string): Promise<boolean> => {
  try {
    const cleanName = name.trim();
    if (!cleanName) return false;
    const raw = localStorage.getItem(getReadingListsStorageKey());
    const lists: string[] = raw ? JSON.parse(raw) : ['All Saved'];
    if (!lists.includes(cleanName)) {
      lists.push(cleanName);
      localStorage.setItem(getReadingListsStorageKey(), JSON.stringify(lists));
    }
    return true;
  } catch {
    return false;
  }
};
