// [Layer: LayoutBars]
// AdminSidebar.tsx -- Fixed left navigation sidebar for the Admin panel.
// Renders institutional branding, Admin badge, collapsable sections, and administrative links.
// DO NOT put business logic or API calls here.
import { FC, useState } from 'react';
import { NavLink } from 'react-router-dom';

const AdminSidebar: FC = () => {
  const [mgmtOpen, setMgmtOpen] = useState(true);
  const [circOpen, setCircOpen] = useState(true);
  const [insightOpen, setInsightOpen] = useState(true);
  const [commOpen, setCommOpen] = useState(true);
  const [secOpen, setSecOpen] = useState(true);
  const [sysOpen, setSysOpen] = useState(true);

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#164E63] text-white shadow-xl z-50 flex flex-col justify-between overflow-y-auto">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 px-space-md flex items-center justify-between border-b border-white/10 bg-[#113E4F]/60 backdrop-blur-md">
          <div className="flex items-center gap-space-sm">
            <img
              alt="Katipuneros Logo"
              className="h-8 w-auto object-contain brightness-0 invert"
              src="https://lh3.googleusercontent.com/aida/AEtjO1ULKR2-At3mMWWJpVDPDjA9IJakzSkbSa5XSRuHMRp9FP_z4wgxPquvURNmIn7pBo3qDybcHoJ0p3aqPmqigbmTF6L8uMiO50Pn_nfngEvaB2NjtIdS-AF002Kn2J_crIGUvNLPtaqOw0hjLWWotFcCcF92I98d8Wdb2_hqAxLH6KeWVXAQwnwge43KAC_-90WpmcqP7BNWnSvNgOgU-gywUu5UvIZ3bWseH7DSvWX4pWq1MmSHAz_pUe4"
            />
            <div className="flex flex-col">
              <span className="font-headline-4 text-small font-bold text-white tracking-tight leading-none">
                KATIPUNEROS
              </span>
              <span className="font-caption text-caption text-white/70 uppercase tracking-wider scale-90 origin-left">
                Library Store
              </span>
            </div>
          </div>
          <span className="font-caption text-caption bg-[#9BE564] text-[#18323D] px-space-xs py-0.5 rounded font-bold uppercase tracking-wider text-[10px] shadow-sm">
            ADMIN
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-space-xs px-space-sm pt-space-md">
          {/* Dashboard */}
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-space-sm px-space-md py-space-sm transition-all duration-200 rounded-lg shadow-sm ${
                isActive
                  ? 'bg-[#9BE564] text-[#18323D] font-bold'
                  : 'text-white/85 hover:bg-[#9BE564] hover:text-[#18323D]'
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span className="font-small text-small">Dashboard</span>
          </NavLink>

          {/* Management Section */}
          <div className="mt-space-xs">
            <div
              onClick={() => setMgmtOpen(!mgmtOpen)}
              className="flex items-center justify-between px-space-md py-1.5 text-white/60 hover:text-white cursor-pointer select-none"
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[18px]">library_books</span>
                <span className="font-caption text-caption uppercase tracking-wider font-semibold text-white/75">
                  Management
                </span>
              </div>
              <span className="material-symbols-outlined text-[16px]">
                {mgmtOpen ? 'expand_less' : 'expand_more'}
              </span>
            </div>
            {mgmtOpen && (
              <div className="flex flex-col pl-space-lg pr-space-xs mt-1 gap-1">
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    `flex items-center gap-space-sm px-space-md py-1.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[#9BE564] text-[#18323D] font-bold'
                        : 'text-white/85 hover:bg-[#9BE564] hover:text-[#18323D]'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[16px]">group</span>
                  <span className="font-small text-small">Users</span>
                </NavLink>
                <NavLink
                  to="/admin/books"
                  className={({ isActive }) =>
                    `flex items-center gap-space-sm px-space-md py-1.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[#9BE564] text-[#18323D] font-bold'
                        : 'text-white/85 hover:bg-[#9BE564] hover:text-[#18323D]'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[16px]">book_2</span>
                  <span className="font-small text-small">Books</span>
                </NavLink>
                <NavLink
                  to="/admin/categories"
                  className={({ isActive }) =>
                    `flex items-center gap-space-sm px-space-md py-1.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[#9BE564] text-[#18323D] font-bold'
                        : 'text-white/85 hover:bg-[#9BE564] hover:text-[#18323D]'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[16px]">category</span>
                  <span className="font-small text-small">Categories</span>
                </NavLink>
                <NavLink
                  to="/admin/inventory"
                  className={({ isActive }) =>
                    `flex items-center gap-space-sm px-space-md py-1.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[#9BE564] text-[#18323D] font-bold'
                        : 'text-white/85 hover:bg-[#9BE564] hover:text-[#18323D]'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                  <span className="font-small text-small">Inventory</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Circulation Section */}
          <div className="mt-space-xs">
            <div
              onClick={() => setCircOpen(!circOpen)}
              className="flex items-center justify-between px-space-md py-1.5 text-white/60 hover:text-white cursor-pointer select-none"
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[18px]">sync_alt</span>
                <span className="font-caption text-caption uppercase tracking-wider font-semibold text-white/75">
                  Circulation
                </span>
              </div>
              <span className="material-symbols-outlined text-[16px]">
                {circOpen ? 'expand_less' : 'expand_more'}
              </span>
            </div>
            {circOpen && (
              <div className="flex flex-col pl-space-lg pr-space-xs mt-1 gap-1">
                <NavLink
                  to="/admin/reservations"
                  className={({ isActive }) =>
                    `flex items-center gap-space-sm px-space-md py-1.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[#9BE564] text-[#18323D] font-bold'
                        : 'text-white/85 hover:bg-[#9BE564] hover:text-[#18323D]'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[16px]">assignment</span>
                  <span className="font-small text-small">Reservations</span>
                </NavLink>
                <NavLink
                  to="/admin/borrowings"
                  className={({ isActive }) =>
                    `flex items-center gap-space-sm px-space-md py-1.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[#9BE564] text-[#18323D] font-bold'
                        : 'text-white/85 hover:bg-[#9BE564] hover:text-[#18323D]'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[16px]">auto_stories</span>
                  <span className="font-small text-small">Borrowings</span>
                </NavLink>
                <NavLink
                  to="/admin/returns"
                  className={({ isActive }) =>
                    `flex items-center gap-space-sm px-space-md py-1.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[#9BE564] text-[#18323D] font-bold'
                        : 'text-white/85 hover:bg-[#9BE564] hover:text-[#18323D]'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[16px]">assignment_return</span>
                  <span className="font-small text-small">Returns</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Insights Section */}
          <div className="mt-space-xs">
            <div
              onClick={() => setInsightOpen(!insightOpen)}
              className="flex items-center justify-between px-space-md py-1.5 text-white/60 hover:text-white cursor-pointer select-none"
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[18px]">insights</span>
                <span className="font-caption text-caption uppercase tracking-wider font-semibold text-white/75">
                  Insights
                </span>
              </div>
              <span className="material-symbols-outlined text-[16px]">
                {insightOpen ? 'expand_less' : 'expand_more'}
              </span>
            </div>
            {insightOpen && (
              <div className="flex flex-col pl-space-lg pr-space-xs mt-1 gap-1">
                <NavLink
                  to="/admin/analytics"
                  className={({ isActive }) =>
                    `flex items-center gap-space-sm px-space-md py-1.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[#9BE564] text-[#18323D] font-bold'
                        : 'text-white/85 hover:bg-[#9BE564] hover:text-[#18323D]'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[16px]">monitoring</span>
                  <span className="font-small text-small">Analytics</span>
                </NavLink>
                <NavLink
                  to="/admin/reports"
                  className={({ isActive }) =>
                    `flex items-center gap-space-sm px-space-md py-1.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[#9BE564] text-[#18323D] font-bold'
                        : 'text-white/85 hover:bg-[#9BE564] hover:text-[#18323D]'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  <span className="font-small text-small">Reports</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Communication Section */}
          <div className="mt-space-xs">
            <div
              onClick={() => setCommOpen(!commOpen)}
              className="flex items-center justify-between px-space-md py-1.5 text-white/60 hover:text-white cursor-pointer select-none"
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[18px]">forum</span>
                <span className="font-caption text-caption uppercase tracking-wider font-semibold text-white/75">
                  Communication
                </span>
              </div>
              <span className="material-symbols-outlined text-[16px]">
                {commOpen ? 'expand_less' : 'expand_more'}
              </span>
            </div>
            {commOpen && (
              <div className="flex flex-col pl-space-lg pr-space-xs mt-1 gap-1">
                <NavLink
                  to="/admin/notifications"
                  className={({ isActive }) =>
                    `flex items-center gap-space-sm px-space-md py-1.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[#9BE564] text-[#18323D] font-bold'
                        : 'text-white/85 hover:bg-[#9BE564] hover:text-[#18323D]'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[16px]">notifications</span>
                  <span className="font-small text-small">Notifications</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Security Section */}
          <div className="mt-space-xs">
            <div
              onClick={() => setSecOpen(!secOpen)}
              className="flex items-center justify-between px-space-md py-1.5 text-white/60 hover:text-white cursor-pointer select-none"
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[18px]">shield</span>
                <span className="font-caption text-caption uppercase tracking-wider font-semibold text-white/75">
                  Security
                </span>
              </div>
              <span className="material-symbols-outlined text-[16px]">
                {secOpen ? 'expand_less' : 'expand_more'}
              </span>
            </div>
            {secOpen && (
              <div className="flex flex-col pl-space-lg pr-space-xs mt-1 gap-1">
                <NavLink
                  to="/admin/roles-permissions"
                  className={({ isActive }) =>
                    `flex items-center gap-space-sm px-space-md py-1.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[#9BE564] text-[#18323D] font-bold'
                        : 'text-white/85 hover:bg-[#9BE564] hover:text-[#18323D]'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                  <span className="font-small text-small">Roles &amp; Permissions</span>
                </NavLink>
                <NavLink
                  to="/admin/audit-logs"
                  className={({ isActive }) =>
                    `flex items-center gap-space-sm px-space-md py-1.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[#9BE564] text-[#18323D] font-bold'
                        : 'text-white/85 hover:bg-[#9BE564] hover:text-[#18323D]'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[16px]">fact_check</span>
                  <span className="font-small text-small">Audit Logs</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* System Section */}
          <div className="mt-space-xs">
            <div
              onClick={() => setSysOpen(!sysOpen)}
              className="flex items-center justify-between px-space-md py-1.5 text-white/60 hover:text-white cursor-pointer select-none"
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[18px]">settings</span>
                <span className="font-caption text-caption uppercase tracking-wider font-semibold text-white/75">
                  System
                </span>
              </div>
              <span className="material-symbols-outlined text-[16px]">
                {sysOpen ? 'expand_less' : 'expand_more'}
              </span>
            </div>
            {sysOpen && (
              <div className="flex flex-col pl-space-lg pr-space-xs mt-1 gap-1">
                <NavLink
                  to="/admin/settings"
                  className={({ isActive }) =>
                    `flex items-center gap-space-sm px-space-md py-1.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[#9BE564] text-[#18323D] font-bold'
                        : 'text-white/85 hover:bg-[#9BE564] hover:text-[#18323D]'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span className="font-small text-small">Settings</span>
                </NavLink>
                <NavLink
                  to="/admin/profile"
                  className={({ isActive }) =>
                    `flex items-center gap-space-sm px-space-md py-1.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[#9BE564] text-[#18323D] font-bold'
                        : 'text-white/85 hover:bg-[#9BE564] hover:text-[#18323D]'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                  <span className="font-small text-small">Admin Profile</span>
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Bottom Exit to Public */}
      <div className="p-space-sm mt-auto border-t border-white/10 bg-[#113E4F]/40">
        <NavLink
          to="/"
          className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="font-small text-small font-semibold">Exit to Public</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default AdminSidebar;
