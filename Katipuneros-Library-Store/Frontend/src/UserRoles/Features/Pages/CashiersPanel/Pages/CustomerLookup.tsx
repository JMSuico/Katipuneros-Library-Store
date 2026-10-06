// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// CustomerLookup.tsx -- Cashier Desk User Directory & Patron Verification.
// Strict Read-Only RBAC: Cashiers can review, inspect, and verify patrons, but cannot add, edit, or delete users.
// Strictly adheres to real-time data mandate: zero hardcoded mock values, clean empty states when N=0.
// Universal lambda syntax (=>), zero browser alert().

import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { useToasts } from '../../../../../Hooks/useToasts';
import { getAdminUsersList, AdminUserRecord } from '../../../../../Endpoints/Admin/userApi';

export const CustomerLookup: FC = () => {
  const { toasts, addToast, removeToast } = useToasts();

  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'restricted' | 'faculty'>('all');

  // Inspection Modal State
  const [inspectedUser, setInspectedUser] = useState<AdminUserRecord | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'details' | 'clearance'>('details');

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminUsersList();
      setUsers(data);
    } catch {
      addToast('Failed to load university patron directory.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Derived Metrics
  const totalUsers = users.length;
  const goodStandingCount = useMemo(() => users.filter((u) => u.isActive && u.status === 'active').length, [users]);
  const activePercentage = totalUsers > 0 ? ((goodStandingCount / totalUsers) * 100).toFixed(1) : '0.0';
  const facultyCount = useMemo(() => users.filter((u) => u.role === 'Admin' || (u.department || '').toLowerCase().includes('faculty')).length, [users]);

  // Filtered List
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        if (statusFilter === 'active') return u.isActive && u.status === 'active';
        if (statusFilter === 'restricted') return !u.isActive || u.status === 'suspended';
        if (statusFilter === 'faculty') return (u.department || '').toLowerCase().includes('faculty') || u.role === 'Admin';
        return true;
      })
      .filter((u) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          u.fullName?.toLowerCase().includes(q) ||
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.libraryCardNumber?.toLowerCase().includes(q) ||
          u.department?.toLowerCase().includes(q)
        );
      });
  }, [users, statusFilter, searchQuery]);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full pb-16 space-y-6">
        {/* Role Restriction Banner (Cashier Scoped Read-Only Mode) */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-soft-blue text-primary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-2xl">verified_user</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-body-large text-body-large font-bold text-text-primary">
                  Cashier Desk User Directory
                </span>
                <span className="inline-flex items-center gap-1 bg-surface-container-high text-text-secondary font-caption text-caption px-2 py-0.5 rounded font-bold">
                  <span className="material-symbols-outlined text-xs">lock</span> READ-ONLY DIRECTORY
                </span>
              </div>
              <p className="font-small text-small text-text-secondary">
                Circulation eligibility validation, clearance auditing, and hold verification. Personal records
                modification is reserved for Registrar/Chief Librarian.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => {
                loadUsers();
                addToast('Patron directory refreshed.', 'info');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container text-primary font-small text-small font-medium hover:bg-surface-container-high transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">sync</span>
              <span>Refresh Ledger</span>
            </button>
          </div>
        </div>

        {/* Metric Summary Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Total Registered Users */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption font-bold uppercase tracking-wider text-text-secondary">
                Registered Patrons
              </span>
              <span className="material-symbols-outlined text-primary text-xl">contacts</span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-headline-2 text-headline-2 font-bold text-text-primary">
                {totalUsers}
              </span>
              <span className="inline-flex items-center text-status-available font-caption text-caption font-semibold">
                Verified Database
              </span>
            </div>
            <div className="mt-2 text-text-secondary font-caption text-caption">
              Undergraduate, Graduate &amp; University Faculty
            </div>
          </div>

          {/* In Good Standing */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption font-bold uppercase tracking-wider text-text-secondary">
                In Good Standing
              </span>
              <span className="material-symbols-outlined text-status-available text-xl">verified</span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-headline-2 text-headline-2 font-bold text-text-primary">
                {goodStandingCount}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-action-green/30 text-text-primary font-caption text-caption font-bold">
                {activePercentage}%
              </span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-action-green h-full rounded-full" style={{ width: `${activePercentage}%` }}></div>
            </div>
          </div>

          {/* Faculty / Scholastic */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption font-bold uppercase tracking-wider text-text-secondary">
                Faculty / Scholastic
              </span>
              <span className="material-symbols-outlined text-secondary text-xl">school</span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-headline-2 text-headline-2 font-bold text-text-primary">
                {facultyCount}
              </span>
              <span className="font-caption text-caption text-primary font-bold">
                Special Privileges
              </span>
            </div>
            <div className="mt-2 text-text-secondary font-caption text-caption">
              Academic Extended Loan Tier
            </div>
          </div>

          {/* Blocked / Delinquent */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption font-bold uppercase tracking-wider text-text-secondary">
                Restricted Accounts
              </span>
              <span className="material-symbols-outlined text-error text-xl">block</span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-headline-2 text-headline-2 font-bold text-error">
                {totalUsers - goodStandingCount}
              </span>
              <span className="font-caption text-caption text-error font-medium">
                Hold Pending
              </span>
            </div>
            <div className="mt-2 text-text-secondary font-caption text-caption">
              Requires clearance settlement
            </div>
          </div>
        </div>

        {/* Directory Controls & Table */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
          {/* Search & Filter Header */}
          <div className="p-4 border-b border-surface-container flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-secondary text-base">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-container-low rounded-xl text-small font-small text-text-primary placeholder:text-text-secondary outline-none focus:bg-surface-container transition-colors"
                placeholder="Search by patron name, library card, email, or dept..."
                type="text"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-full text-caption font-caption font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-text-secondary hover:text-text-primary'
                }`}
                type="button"
              >
                All Patrons ({users.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-full text-caption font-caption font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'active'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-text-secondary hover:text-text-primary'
                }`}
                type="button"
              >
                In Good Standing
              </button>
              <button
                onClick={() => setStatusFilter('restricted')}
                className={`px-3 py-1.5 rounded-full text-caption font-caption font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'restricted'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-text-secondary hover:text-text-primary'
                }`}
                type="button"
              >
                Restricted / Suspended
              </button>
              <button
                onClick={() => setStatusFilter('faculty')}
                className={`px-3 py-1.5 rounded-full text-caption font-caption font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'faculty'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-text-secondary hover:text-text-primary'
                }`}
                type="button"
              >
                Faculty / Staff
              </button>
            </div>
          </div>

          {/* Patrons Table */}
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="font-caption text-caption text-text-secondary mt-2">Loading directory...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center p-6">
              <span className="material-symbols-outlined text-5xl text-text-secondary/40 mb-2">
                group_off
              </span>
              <p className="font-body-medium text-body-medium text-text-primary font-semibold">
                No university patrons found
              </p>
              <p className="font-caption text-caption text-text-secondary max-w-sm mt-1">
                {searchQuery
                  ? `No accounts matching "${searchQuery}". Check spelling or clear filters.`
                  : 'The patron directory currently contains no registered users.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-surface-container-low text-text-secondary font-caption text-caption uppercase tracking-wider">
                    <th className="py-3 px-4">Patron Name &amp; Contact</th>
                    <th className="py-3 px-4">Library Card &amp; Department</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Standing Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/40 text-small font-small">
                  {filteredUsers.map((u) => {
                    const isGood = u.isActive && u.status === 'active';
                    return (
                      <tr key={u.id} className="hover:bg-surface-container-low/60 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-soft-blue text-primary flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0">
                              {u.fullName?.charAt(0) || u.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-body-medium text-body-medium font-bold text-text-primary leading-snug">
                                {u.fullName || u.name}
                              </span>
                              <span className="font-caption text-caption text-text-secondary truncate">
                                {u.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-primary">
                              {u.libraryCardNumber || 'N/A'}
                            </span>
                            <span className="font-caption text-caption text-text-secondary">
                              {u.department || 'General Academic'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-md bg-surface-container text-text-primary font-caption text-caption font-semibold">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-caption text-caption font-bold ${
                              isGood
                                ? 'bg-status-available/20 text-status-available'
                                : 'bg-error-container text-on-error-container'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isGood ? 'bg-status-available' : 'bg-status-danger'
                              }`}
                            ></span>
                            {isGood ? 'Good Standing' : 'Suspended / Hold'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => {
                              setInspectedUser(u);
                              setActiveModalTab('details');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-small text-small font-semibold transition-colors cursor-pointer"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-base">visibility</span>
                            <span>Inspect Profile</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-surface-container flex items-center justify-between font-caption text-caption text-text-secondary">
            <span>
              Showing {filteredUsers.length} of {users.length} verified patrons
            </span>
            <span className="font-mono text-primary font-bold">Terminal Desk 01 Directory Live</span>
          </div>
        </div>
      </div>

      {/* Patron Inspection Modal */}
      {inspectedUser && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface-container-lowest max-w-2xl w-full rounded-2xl shadow-2xl p-6 flex flex-col space-y-5 border border-outline/10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-soft-blue text-primary flex items-center justify-center font-bold text-2xl shadow-sm flex-shrink-0">
                  {inspectedUser.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-headline-3 text-headline-3 font-bold text-text-primary">
                    {inspectedUser.fullName || inspectedUser.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-bold text-primary">
                      {inspectedUser.libraryCardNumber || 'KP-CARD'}
                    </span>
                    <span className="text-text-secondary">•</span>
                    <span className="font-caption text-caption text-text-secondary">
                      {inspectedUser.department || 'Academic Department'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectedUser(null)}
                className="p-1 rounded-lg text-text-secondary hover:bg-surface-container"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-surface-container pb-2">
              <button
                onClick={() => setActiveModalTab('details')}
                className={`px-3 py-1.5 rounded-lg text-small font-small font-bold transition-colors cursor-pointer ${
                  activeModalTab === 'details'
                    ? 'bg-primary text-on-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                type="button"
              >
                Patron Master Details
              </button>
              <button
                onClick={() => setActiveModalTab('clearance')}
                className={`px-3 py-1.5 rounded-lg text-small font-small font-bold transition-colors cursor-pointer ${
                  activeModalTab === 'clearance'
                    ? 'bg-primary text-on-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                type="button"
              >
                Circulation Standing Audit
              </button>
            </div>

            {/* Tab Contents */}
            {activeModalTab === 'details' ? (
              <div className="grid grid-cols-2 gap-4 text-small font-small">
                <div className="p-3 bg-surface-container-low rounded-xl">
                  <span className="text-caption font-caption text-text-secondary block">Email Address</span>
                  <span className="font-bold text-text-primary truncate block">{inspectedUser.email}</span>
                </div>
                <div className="p-3 bg-surface-container-low rounded-xl">
                  <span className="text-caption font-caption text-text-secondary block">Phone Contact</span>
                  <span className="font-bold text-text-primary">{inspectedUser.phoneNumber || 'N/A'}</span>
                </div>
                <div className="p-3 bg-surface-container-low rounded-xl">
                  <span className="text-caption font-caption text-text-secondary block">Role / Classification</span>
                  <span className="font-bold text-primary">{inspectedUser.role}</span>
                </div>
                <div className="p-3 bg-surface-container-low rounded-xl">
                  <span className="text-caption font-caption text-text-secondary block">Current Address</span>
                  <span className="font-bold text-text-primary truncate block">
                    {inspectedUser.currentAddress || 'On-Campus Resident'}
                  </span>
                </div>
                <div className="p-3 bg-surface-container-low rounded-xl">
                  <span className="text-caption font-caption text-text-secondary block">Registration Date</span>
                  <span className="font-bold text-text-primary">
                    {inspectedUser.joinedDate ? new Date(inspectedUser.joinedDate).toLocaleDateString() : 'Active Member'}
                  </span>
                </div>
                <div className="p-3 bg-surface-container-low rounded-xl">
                  <span className="text-caption font-caption text-text-secondary block">Account Standing</span>
                  <span
                    className={`font-bold ${
                      inspectedUser.isActive ? 'text-status-available' : 'text-status-danger'
                    }`}
                  >
                    {inspectedUser.isActive ? 'Active (Eligible to Borrow)' : 'Suspended (Clearance Required)'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-small font-small">
                <div className="p-4 bg-surface-container-low rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-body-medium text-body-medium font-bold text-text-primary block">
                      Circulation Desk Clearance Certificate
                    </span>
                    <span className="font-caption text-caption text-text-secondary">
                      Desk Terminal Verification Protocol
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full font-caption text-caption font-bold ${
                      inspectedUser.isActive
                        ? 'bg-status-available/20 text-status-available'
                        : 'bg-error-container text-on-error-container'
                    }`}
                  >
                    {inspectedUser.isActive ? 'Clearance Verified' : 'Clearance On Hold'}
                  </span>
                </div>
                <p className="font-caption text-caption text-text-secondary">
                  Cashiers have read-only access to verify patron standing. If patron requires fine waivers, loan
                  overrides, or registration updates, refer them to the Chief Librarian.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end pt-3 border-t border-surface-container">
              <button
                onClick={() => setInspectedUser(null)}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-caption text-caption font-bold cursor-pointer"
                type="button"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Notifications Toast Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`px-4 py-3 rounded-xl shadow-lg border text-caption font-bold transition-all pointer-events-auto flex items-center gap-2 cursor-pointer animate-in fade-in duration-200 ${
              toast.type === 'success'
                ? 'bg-action-green text-text-primary border-action-green/30'
                : toast.type === 'error'
                ? 'bg-error text-on-error border-error/30'
                : toast.type === 'warning'
                ? 'bg-status-pending text-on-primary border-status-pending/30'
                : 'bg-primary text-on-primary border-primary/30'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {toast.type === 'success'
                ? 'check_circle'
                : toast.type === 'error'
                ? 'error'
                : toast.type === 'warning'
                ? 'warning'
                : 'info'}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerLookup;
