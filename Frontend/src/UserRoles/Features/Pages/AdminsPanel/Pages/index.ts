// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// index.ts -- Barrel exports for all Admin Panel pages.
// Route-level page components ONLY.
// DO NOT put business logic, state management, or direct API calls here.

export { default as AdminDashboard } from './AdminDashboard';
export { default as UserManagement } from './UserManagement';
export { default as BooksManager } from './BooksManager';
export { default as AdminReservations } from './Reservations';
export { default as AdminBorrowings } from './Borrowings';
export { default as AdminReturns } from './Returns';
export { default as Inventory } from './Inventory';
export { default as Analytics } from './Analytics';
export { default as Categories } from './Categories';
export { default as Reports } from './Reports';
export { default as AdminNotifications } from './Notifications';
export { default as RolesPermissions } from './RolesPermissions';
export { default as AuditLogs } from './AuditLogs';
export { default as AdminSettings } from './Settings';
export { default as AdminProfile } from './Profile';
