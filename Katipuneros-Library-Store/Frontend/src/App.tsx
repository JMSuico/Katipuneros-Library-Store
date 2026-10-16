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
import ProtectedRoute from './Shared/Components/ProtectedRoute';

// ─── Landing Page ────────────────────────────────────────────
const LandingPage = lazy(() => import('./LANDING_PAGE/Features/Pages/Home/Home'));
const AboutPage = lazy(() => import('./LANDING_PAGE/Features/Pages/About/About'));
const ProductsPage = lazy(() => import('./LANDING_PAGE/Features/Pages/Products/Product'));
const ContactPage = lazy(() => import('./LANDING_PAGE/Features/Pages/ContactMe/ContactMe'));

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
const CashierProfile = lazy(() => import('./UserRoles/Features/Pages/CashiersPanel/Pages/Profile'));

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

// ─── Authentication Pages ─────────────────────────────────────
const LoginPage = lazy(() => import('./Features/Auth/LoginPage'));
const CashierLoginPage = lazy(() => import('./Features/Auth/CashierLoginPage'));
const SignupPage = lazy(() => import('./Features/Auth/SignupPage'));
const AdminLoginPage = lazy(() => import('./Features/Auth/AdminLoginPage'));

import { useAccountTheme } from './Hooks/useAccountTheme';

const PortNotice = ({ targetPort, targetRole, targetPath }: { targetPort: string; targetRole: string; targetPath: string }) => {
  const hostname = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1';
  const targetUrl = `http://${hostname}:${targetPort}${targetPath}`;
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full p-8 rounded-3xl bg-surface-container border border-outline-variant shadow-xl text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary-container flex items-center justify-center text-primary text-3xl">
          <span className="material-symbols-outlined text-3xl">lan</span>
        </div>
        <h2 className="font-headline-2 text-headline-2 text-text-primary font-bold">
          Dedicated {targetRole} Terminal
        </h2>
        <p className="font-body text-body text-text-secondary">
          To maintain strict session security and prevent multi-role credential collisions, {targetRole} operations are hosted exclusively on dedicated <strong>Port {targetPort}</strong>.
        </p>
        <a
          href={targetUrl}
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl bg-primary text-on-primary font-body-medium font-bold shadow-md hover:bg-primary-hover transition-all"
        >
          <span>Open {targetRole} Portal (Port {targetPort})</span>
          <span className="material-symbols-outlined text-lg">open_in_new</span>
        </a>
      </div>
    </div>
  );
};

function App() {
  useAccountTheme();
  const host = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
  const port = typeof window !== 'undefined' ? window.location.port : '';
  const isPortAdmin = port === '5174' || host.startsWith('admin.');
  const isPortCashier = port === '5175' || host.startsWith('cashier.');

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
      {isPortAdmin ? (
        /* ═══════════════════════════════════════════════════════════
           PORT 5174: Security-Isolated Chief Administrator Console
           ═══════════════════════════════════════════════════════════ */
        <Routes>
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin Panel Layout Protected */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} redirectPath="/admin/login" />}>
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
          </Route>

          {/* Catch-all on port 5174 */}
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      ) : isPortCashier ? (
        /* ═══════════════════════════════════════════════════════════
           PORT 5175: Security-Isolated Cashier Circulation Terminal
           ═══════════════════════════════════════════════════════════ */
        <Routes>
          <Route path="/" element={<Navigate to="/cashier/login" replace />} />
          <Route path="/login" element={<Navigate to="/cashier/login" replace />} />
          <Route path="/cashier/login" element={<CashierLoginPage />} />

          {/* Cashier Panel Layout Protected */}
          <Route element={<ProtectedRoute allowedRoles={['Cashier']} redirectPath="/cashier/login" />}>
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
              <Route path="/cashier/profile" element={<CashierProfile />} />
            </Route>
          </Route>

          {/* Catch-all on port 5175 */}
          <Route path="*" element={<Navigate to="/cashier/login" replace />} />
        </Routes>
      ) : (
        /* ═══════════════════════════════════════════════════════════
           PORT 5173: Public Landing & Dedicated Patron/Customer Portal
           ═══════════════════════════════════════════════════════════ */
        <Routes>
          {/* Landing Page */}
          <Route element={<LandingLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* Customer Authentication */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Cross-Port Redirection Notices on Port 5173 */}
          <Route path="/cashier/login" element={<PortNotice targetPort="5175" targetRole="Cashier Circulation" targetPath="/cashier/login" />} />
          <Route path="/cashier/*" element={<PortNotice targetPort="5175" targetRole="Cashier Circulation" targetPath="/cashier/login" />} />
          <Route path="/admin/login" element={<PortNotice targetPort="5174" targetRole="Administrator" targetPath="/admin/login" />} />
          <Route path="/admin/*" element={<PortNotice targetPort="5174" targetRole="Administrator" targetPath="/admin/login" />} />

          {/* Customer Panel Protected */}
          <Route element={<ProtectedRoute allowedRoles={['Customer']} redirectPath="/login" />}>
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
          </Route>

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </Suspense>
  );
}

export default App;
