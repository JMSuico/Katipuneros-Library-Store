// [Layer: App Root]
// App.tsx -- Router setup with React.lazy + Suspense for code splitting.
// Route-level composition ONLY -- no business logic.
// DO NOT put UI components, API calls, or state management here.
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout wrappers (LayoutBars per SKILL.md Section 4 & 13)
import LandingLayout from './LayoutBars/LandingLayout';
import CustomerLayout from './LayoutBars/CustomerLayout';
import CashierLayout from './LayoutBars/CashierLayout';
import AdminLayout from './LayoutBars/AdminLayout';

// ─── Landing Page ────────────────────────────────────────────
const LandingPage = lazy(() => import('./LANDING_PAGE/Features/Pages/Home/Home'));

// ─── Customer Panel ──────────────────────────────────────────
const CustomerDashboard = lazy(() => import('./UserRoles/Features/Pages/CustomersPanel/Pages/CustomerDashboard'));
const CatalogPage = lazy(() => import('./UserRoles/Features/Pages/CustomersPanel/Pages/CatalogPage'));
const BorrowingsPage = lazy(() => import('./UserRoles/Features/Pages/CustomersPanel/Pages/BorrowingsPage'));
const ReservationsPage = lazy(() => import('./UserRoles/Features/Pages/CustomersPanel/Pages/ReservationsPage'));
const FavoritesPage = lazy(() => import('./UserRoles/Features/Pages/CustomersPanel/Pages/FavoritesPage'));
const ProfileSettings = lazy(() => import('./UserRoles/Features/Pages/CustomersPanel/Pages/ProfileSettings'));

// ─── Cashier Panel ───────────────────────────────────────────
const CashierDashboard = lazy(() => import('./UserRoles/Features/Pages/CashiersPanel/Pages/CashierDashboard'));
const PendingReservations = lazy(() => import('./UserRoles/Features/Pages/CashiersPanel/Pages/PendingReservations'));
const CheckoutBorrow = lazy(() => import('./UserRoles/Features/Pages/CashiersPanel/Pages/CheckoutBorrow'));
const ReturnsFines = lazy(() => import('./UserRoles/Features/Pages/CashiersPanel/Pages/ReturnsFines'));
const CustomerLookup = lazy(() => import('./UserRoles/Features/Pages/CashiersPanel/Pages/CustomerLookup'));
const BookAvailability = lazy(() => import('./UserRoles/Features/Pages/CashiersPanel/Pages/BookAvailability'));
const Schedules = lazy(() => import('./UserRoles/Features/Pages/CashiersPanel/Pages/Schedules'));
const OverdueFines = lazy(() => import('./UserRoles/Features/Pages/CashiersPanel/Pages/OverdueFines'));
const CashierTransactions = lazy(() => import('./UserRoles/Features/Pages/CashiersPanel/Pages/Transactions'));
const CashierNotifications = lazy(() => import('./UserRoles/Features/Pages/CashiersPanel/Pages/Notifications'));

// ─── Admin Panel ─────────────────────────────────────────────
const AdminDashboard = lazy(() => import('./UserRoles/Features/Pages/AdminsPanel/Pages/AdminDashboard'));
const UserManagement = lazy(() => import('./UserRoles/Features/Pages/AdminsPanel/Pages/UserManagement'));
const BooksManager = lazy(() => import('./UserRoles/Features/Pages/AdminsPanel/Pages/BooksManager'));
const AdminReservations = lazy(() => import('./UserRoles/Features/Pages/AdminsPanel/Pages/Reservations'));
const AdminBorrowings = lazy(() => import('./UserRoles/Features/Pages/AdminsPanel/Pages/Borrowings'));
const AdminReturns = lazy(() => import('./UserRoles/Features/Pages/AdminsPanel/Pages/Returns'));
const Inventory = lazy(() => import('./UserRoles/Features/Pages/AdminsPanel/Pages/Inventory'));
const Analytics = lazy(() => import('./UserRoles/Features/Pages/AdminsPanel/Pages/Analytics'));
const Categories = lazy(() => import('./UserRoles/Features/Pages/AdminsPanel/Pages/Categories'));
const Reports = lazy(() => import('./UserRoles/Features/Pages/AdminsPanel/Pages/Reports'));
const AdminNotifications = lazy(() => import('./UserRoles/Features/Pages/AdminsPanel/Pages/Notifications'));
const RolesPermissions = lazy(() => import('./UserRoles/Features/Pages/AdminsPanel/Pages/RolesPermissions'));
const AuditLogs = lazy(() => import('./UserRoles/Features/Pages/AdminsPanel/Pages/AuditLogs'));
const AdminSettings = lazy(() => import('./UserRoles/Features/Pages/AdminsPanel/Pages/Settings'));
const AdminProfile = lazy(() => import('./UserRoles/Features/Pages/AdminsPanel/Pages/Profile'));

function App() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-space-md">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="font-body-medium text-body-medium text-text-secondary">Loading...</span>
          </div>
        </div>
      }
    >
      <Routes>
        {/* ─── Landing Page ─── */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* ─── Customer Panel ─── */}
        <Route element={<CustomerLayout />}>
          <Route path="/customer" element={<Navigate to="/customer/home" replace />} />
          <Route path="/customer/home" element={<CustomerDashboard />} />
          <Route path="/customer/catalog" element={<CatalogPage />} />
          <Route path="/customer/borrowings" element={<BorrowingsPage />} />
          <Route path="/customer/reservations" element={<ReservationsPage />} />
          <Route path="/customer/favorites" element={<FavoritesPage />} />
          <Route path="/customer/profile" element={<ProfileSettings />} />
          <Route path="/customer/settings" element={<ProfileSettings />} />
        </Route>

        {/* ─── Cashier Panel ─── */}
        <Route element={<CashierLayout />}>
          <Route path="/cashier" element={<Navigate to="/cashier/dashboard" replace />} />
          <Route path="/cashier/dashboard" element={<CashierDashboard />} />
          <Route path="/cashier/pending-reservations" element={<PendingReservations />} />
          <Route path="/cashier/checkout" element={<CheckoutBorrow />} />
          <Route path="/cashier/returns" element={<ReturnsFines />} />
          <Route path="/cashier/customers" element={<CustomerLookup />} />
          <Route path="/cashier/book-availability" element={<BookAvailability />} />
          <Route path="/cashier/schedules" element={<Schedules />} />
          <Route path="/cashier/overdue-fines" element={<OverdueFines />} />
          <Route path="/cashier/transactions" element={<CashierTransactions />} />
          <Route path="/cashier/notifications" element={<CashierNotifications />} />
        </Route>

        {/* ─── Admin Panel ─── */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/books" element={<BooksManager />} />
          <Route path="/admin/reservations" element={<AdminReservations />} />
          <Route path="/admin/borrowings" element={<AdminBorrowings />} />
          <Route path="/admin/returns" element={<AdminReturns />} />
          <Route path="/admin/inventory" element={<Inventory />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/roles" element={<RolesPermissions />} />
          <Route path="/admin/audit-logs" element={<AuditLogs />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>

        {/* ─── Fallback Redirect ─── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
