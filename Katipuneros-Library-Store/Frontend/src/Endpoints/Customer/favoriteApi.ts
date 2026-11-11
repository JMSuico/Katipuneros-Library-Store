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

    // Also remove book from any assigned reading lists
    const assignments = getStoredReadingListAssignments();
    let modified = false;
    for (const key of Object.keys(assignments)) {
      if (assignments[key]?.some((id) => String(id) === String(bookId))) {
        assignments[key] = assignments[key].filter((id) => String(id) !== String(bookId));
        modified = true;
      }
    }
    if (modified) {
      saveStoredReadingListAssignments(assignments);
    }

    return true;
  } catch {
    return false;
  }
};

const DEFAULT_READING_LISTS = ['All Favorites', 'Academic Thesis', 'Weekend Reads'];

export const getReadingLists = async (): Promise<string[]> => {
  try {
    const raw = localStorage.getItem(getReadingListsStorageKey());
    if (!raw) return DEFAULT_READING_LISTS;
    let lists: string[] = JSON.parse(raw);
    if (!Array.isArray(lists) || !lists.length) return DEFAULT_READING_LISTS;
    lists = lists.map((l) => (l === 'All Saved' ? 'All Favorites' : l));
    if (!lists.includes('All Favorites')) {
      lists.unshift('All Favorites');
    }
    return lists;
  } catch {
    return DEFAULT_READING_LISTS;
  }
};

export const createReadingList = async (name: string): Promise<boolean> => {
  try {
    const cleanName = name.trim();
    if (!cleanName) return false;
    const raw = localStorage.getItem(getReadingListsStorageKey());
    const lists: string[] = raw ? JSON.parse(raw) : [...DEFAULT_READING_LISTS];
    if (!lists.includes(cleanName)) {
      lists.push(cleanName);
      localStorage.setItem(getReadingListsStorageKey(), JSON.stringify(lists));
    }
    return true;
  } catch {
    return false;
  }
};

// ==========================================
// Reading List Book Assignments & Filtering
// Storage Key: patron_reading_list_assignments
// ==========================================

export const READING_LIST_ASSIGNMENTS_STORAGE_KEY = 'patron_reading_list_assignments';

export const getStoredReadingListAssignments = (): Record<string, (string | number)[]> => {
  try {
    const raw = localStorage.getItem(READING_LIST_ASSIGNMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveStoredReadingListAssignments = (
  assignments: Record<string, (string | number)[]>
): void => {
  try {
    localStorage.setItem(READING_LIST_ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments));
  } catch {
    // Ignore storage quota errors
  }
};

export const addBookToReadingList = (listName: string, bookId: string | number): void => {
  const cleanList = listName.trim();
  if (!cleanList) return;
  const assignments = getStoredReadingListAssignments();
  const currentList = assignments[cleanList] || [];
  const exists = currentList.some((id) => String(id) === String(bookId));
  if (!exists) {
    currentList.push(bookId);
    assignments[cleanList] = currentList;
    saveStoredReadingListAssignments(assignments);
  }
};

export const removeBookFromReadingList = (listName: string, bookId: string | number): void => {
  const cleanList = listName.trim();
  if (!cleanList) return;
  const assignments = getStoredReadingListAssignments();
  if (!assignments[cleanList]) return;
  assignments[cleanList] = assignments[cleanList].filter((id) => String(id) !== String(bookId));
  saveStoredReadingListAssignments(assignments);
};

export function getBooksInReadingList<T extends string | number = string | number>(
  listName: string
): T[] {
  const cleanList = listName.trim();
  if (!cleanList) return [];
  const assignments = getStoredReadingListAssignments();
  return (assignments[cleanList] || []) as T[];
}

export const getBookReadingLists = (bookId: string | number): string[] => {
  const assignments = getStoredReadingListAssignments();
  const matchedLists: string[] = [];
  for (const [listName, bookIds] of Object.entries(assignments)) {
    if (Array.isArray(bookIds) && bookIds.some((id) => String(id) === String(bookId))) {
      matchedLists.push(listName);
    }
  }
  return matchedLists;
};
