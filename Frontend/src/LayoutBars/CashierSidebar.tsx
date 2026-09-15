// [Layer: LayoutBars]
// CashierSidebar.tsx -- Fixed left navigation sidebar for the Cashier panel.
// Renders terminal branding, operational station indicator, and cashier module navigation links.
// DO NOT put business logic or API calls here.
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/cashier/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { path: '/cashier/pending-reservations', icon: 'assignment', label: 'Pending Reservations', badge: '5', badgeColor: 'bg-status-pending text-on-primary' },
  { path: '/cashier/checkout', icon: 'menu_book', label: 'Checkout / Borrow' },
  { path: '/cashier/returns', icon: 'keyboard_return', label: 'Returns' },
  { path: '/cashier/customers', icon: 'group', label: 'Customers' },
  { path: '/cashier/book-availability', icon: 'book_2', label: 'Book Availability' },
  { path: '/cashier/schedules', icon: 'calendar_today', label: 'Schedules' },
  { path: '/cashier/overdue-fines', icon: 'warning', label: 'Overdue & Fines', badge: '3', badgeColor: 'bg-status-danger text-on-primary' },
  { path: '/cashier/transactions', icon: 'receipt_long', label: 'Transactions' },
  { path: '/cashier/notifications', icon: 'notifications', label: 'Notifications', badge: '4', badgeColor: 'bg-action-green text-text-primary' },
];

const CashierSidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-[#123B5D] text-white shadow-md z-50 flex flex-col justify-between py-space-md">
      <div className="flex flex-col gap-space-md">
        <div className="px-space-md flex items-center gap-space-sm">
          <img
            alt="Modern minimalist academic library book emblem"
            className="h-8 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida/AEtjO1ULKR2-At3mMWWJpVDPDjA9IJakzSkbSa5XSRuHMRp9FP_z4wgxPquvURNmIn7pBo3qDybcHoJ0p3aqPmqigbmTF6L8uMiO50Pn_nfngEvaB2NjtIdS-AF002Kn2J_crIGUvNLPtaqOw0hjLWWotFcCcF92I98d8Wdb2_hqAxLH6KeWVXAQwnwge43KAC_-90WpmcqP7BNWnSvNgOgU-gywUu5UvIZ3bWseH7DSvWX4pWq1MmSHAz_pUe4"
          />
          <div className="flex flex-col">
            <span className="font-headline-4 text-headline-4 text-white leading-tight">Katipuneros</span>
            <span className="font-caption text-caption text-[#D9EEF5]/80">Cashier Terminal • Desk 01</span>
          </div>
        </div>

        <div className="px-space-md">
          <div className="bg-white/10 text-white px-space-sm py-space-xs rounded-lg flex items-center justify-between border border-white/10">
            <span className="font-caption text-caption font-bold tracking-wide uppercase text-white">Terminal Bay 01</span>
            <span className="w-2 h-2 rounded-full bg-action-green animate-pulse"></span>
          </div>
        </div>

        <nav className="flex flex-col gap-space-xs px-space-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center justify-between px-space-sm py-space-sm rounded-xl transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-action-green text-text-primary font-body-medium shadow-sm'
                    : 'text-white/90 hover:bg-action-green hover:text-text-primary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-space-sm">
                    <span
                      className={`material-symbols-outlined text-xl ${
                        isActive ? 'text-text-primary' : 'text-[#D9EEF5] group-hover:text-text-primary'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className={`font-small text-small ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`${item.badgeColor} font-caption text-caption px-space-xs py-0.5 rounded-full font-bold`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="px-space-sm flex flex-col gap-space-xs pt-4 border-t border-white/10">
        <nav className="flex flex-col gap-space-xs">
          <NavLink
            to="/cashier/profile"
            className={({ isActive }) =>
              `group flex items-center gap-space-sm px-space-sm py-space-sm rounded-xl transition-colors cursor-pointer ${
                isActive
                  ? 'bg-action-green text-text-primary font-body-medium shadow-sm'
                  : 'text-white/90 hover:bg-action-green hover:text-text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined text-xl text-[#D9EEF5] group-hover:text-text-primary">
              account_circle
            </span>
            <span className="font-small text-small">Profile</span>
          </NavLink>
          <NavLink
            to="/"
            className="group flex items-center gap-space-sm px-space-sm py-space-sm rounded-xl text-error-container hover:bg-error-container hover:text-on-error-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl group-hover:text-on-error-container text-error-container">
              logout
            </span>
            <span className="font-small text-small font-medium">Exit to Public</span>
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};

export default CashierSidebar;
