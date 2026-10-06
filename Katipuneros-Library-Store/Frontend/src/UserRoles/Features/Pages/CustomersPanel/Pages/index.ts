// [Layer: UserRoles/Features/Pages/CustomersPanel/Pages]
// index.ts -- Barrel exports for all Customer Panel pages.
// Route-level page components ONLY.
// DO NOT put business logic, state management, or direct API calls here.

export { default as CustomerDashboard } from './CustomerDashboard';
export { default as CatalogPage } from './CatalogPage';
export { default as BorrowingsPage } from './BorrowingsPage';
export { default as ReservationsPage } from './ReservationsPage';
export { default as FavoritesPage } from './FavoritesPage';
export { default as ProfileSettings } from './ProfileSettings';
