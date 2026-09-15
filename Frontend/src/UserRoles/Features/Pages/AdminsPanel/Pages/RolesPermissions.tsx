// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// RolesPermissions.tsx -- Admin RBAC Roles and Security Matrix
// Converted directly from SidebarRole&PermissionsPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const RolesPermissions: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
const roleConfigs = {
  admin: {
    id: 'ROLE-ADM-00',
    title: 'Administrator',
    desc: 'Root governance, campus security architecture & database master authority',
    landingTitle: 'System Admin Operations',
    landingSub: 'Full institutional telemetry, audit logs & system health',
    tierBadge: 'Super Admin Tier',
    privileges: [
      { name: 'Root Security Governance', desc: 'Manage global boundary tokens and identity grants' },
      { name: 'Ledger Audit & Cryptographic Signing', desc: 'Approve institution fiscal waivers and quarterly settlements' },
      { name: 'Schema Mutation & RBAC Calibrations', desc: 'Direct access to institutional database and role definitions' },
      { name: 'Emergency Lockdown & Terminal Unbind', desc: 'Master override to release locks across all branch terminals' }
    ],
    policyTitle: '2FA Hardware Key & Session',
    policyBadge: 'Mandatory FIDO2',
    policyDesc: 'Hardware YubiKey / WebAuthn token required. Re-authentication triggered after 60 min inactivity.',
    assignedCount: '16 Super Admins',
    avatarBadge: '+13',
    avatarSub: 'Campus IT & Chief Librarians'
  },
  cashier: {
    id: 'ROLE-POS-01',
    title: 'Cashier Desk',
    desc: 'Front desk terminal & express book checkout gates',
    landingTitle: 'Cashier Circulation Console',
    landingSub: 'Express barcode loans, holds & returns',
    tierBadge: 'Station Tier',
    privileges: [
      { name: 'Emergency Hold Override', desc: 'Permits physical checkouts during queue conflicts' },
      { name: 'Cash Drawer Hardware Kickout', desc: 'Manual release with automatic audit trace log' },
      { name: 'Fine Courtesy Waiver (up to ₱50)', desc: 'Immediate settlement without supervisor secondary key' },
      { name: 'Hold Staging Clearance', desc: 'Process arrival of books to express pickup lockers' }
    ],
    policyTitle: 'Inactivity & Station Token',
    policyBadge: '15 Min Timeout',
    policyDesc: 'Station lock triggers automatically on idle. POS terminal PIN and cashier badge required to restore session.',
    assignedCount: '24 Terminals',
    avatarBadge: '+21',
    avatarSub: 'Active on Terminal Fleet'
  },
  patron: {
    id: 'ROLE-PTR-02',
    title: 'Patron / Customer',
    desc: 'University students, faculty researchers, and registered community members',
    landingTitle: 'Patron Discovery Portal',
    landingSub: 'Public book browsing, virtual catalog & mobile card',
    tierBadge: 'End-User Scope',
    privileges: [
      { name: 'Self-Service Catalog Discovery', desc: 'Browse full OPAC library store, availability & reading lists' },
      { name: 'Active Holds Queue (Max 4 Holds)', desc: 'Reserve physical copies with notification upon shelf locker arrival' },
      { name: 'Online Loan Self-Renewal (1x)', desc: 'Extend borrowing term up to 7 calendar days before due date' },
      { name: 'Digital Library ID & Fine Settlement', desc: 'QR pass for turnstiles and GCash/Maya fine clearing' }
    ],
    policyTitle: 'Patron Portal Security',
    policyBadge: 'Single Sign-On (SSO)',
    policyDesc: 'University Google Workspace SSO integration. Session remains persistent on verified mobile devices.',
    assignedCount: '3,372 Active Patrons',
    avatarBadge: '+3.3k',
    avatarSub: 'Enrolled University Students & Faculty'
  },
  curator: {
    id: 'ROLE-CUR-03',
    title: 'Department Curator',
    desc: 'Subject specialist bibliographers, preservation curators & departmental liaisons',
    landingTitle: 'Curatorial & Collection Workbench',
    landingSub: 'Subject ontology tagging, course reserves & bindery routing',
    tierBadge: 'Specialist Staff',
    privileges: [
      { name: 'Faculty Reserve Approvals', desc: 'Authorize high-demand semester syllabus course reserves' },
      { name: 'Specialized Acquisition Requests', desc: 'Submit and approve departmental academic acquisitions' },
      { name: 'Subject Ontology Classification', desc: 'Manage LoC and Dewey Decimal classification taxonomy' },
      { name: 'Bindery & Rare Volume Routing', desc: 'Direct items to preservation lab or digital archival queue' }
    ],
    policyTitle: 'Departmental Access Policy',
    policyBadge: 'TOTP Enforced',
    policyDesc: 'Subject curator role is locked to university campus VPN and authenticated mobile authenticator app.',
    assignedCount: '8 Curators',
    avatarBadge: '+5',
    avatarSub: 'Department Subject Specialists'
  }
};

function selectInspectorRole(key) {
  const data = roleConfigs[key];
  if (!data) return;
  
  document.getElementById('inspector-role-id').innerText = 'ID: ' + data.id;
  document.getElementById('inspector-role-title').innerText = data.title;
  document.getElementById('inspector-role-desc').innerText = data.desc;
  document.getElementById('role-landing-title').innerText = data.landingTitle;
  document.getElementById('role-landing-sub').innerText = data.landingSub;
  document.getElementById('role-tier-badge').innerText = data.tierBadge;
  document.getElementById('role-policy-title').innerText = data.policyTitle;
  document.getElementById('role-policy-badge').innerText = data.policyBadge;
  document.getElementById('role-policy-desc').innerText = data.policyDesc;
  document.getElementById('role-assigned-count').innerText = data.assignedCount;
  document.getElementById('role-avatar-badge').innerText = data.avatarBadge;
  document.getElementById('role-avatar-sub').innerText = data.avatarSub;
  
  const privContainer = document.getElementById('role-privilege-list');
  privContainer.innerHTML = data.privileges.map(p => `
    <div class="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low/50">
      <span class="material-symbols-outlined text-[18px] text-status-available mt-0.5">check_circle</span>
      <div class="flex flex-col">
        <span class="font-small text-small font-semibold text-text-primary">${p.name}</span>
        <span class="font-caption text-caption text-text-secondary">${p.desc}</span>
      </div>
    </div>
  `).join('');
  
  document.querySelectorAll('.drawer-tab-btn').forEach(btn => {
    btn.className = 'drawer-tab-btn py-1 px-1.5 text-center font-caption text-[11px] font-semibold text-text-secondary hover:text-text-primary rounded-md transition-all';
  });
  const activeBtn = document.getElementById('btn-drawer-' + key);
  if (activeBtn) {
    activeBtn.className = 'drawer-tab-btn py-1 px-1.5 text-center font-caption text-[11px] font-bold bg-primary text-on-primary rounded-md shadow-xs transition-all';
  }
}

function switchRoleView(view) {
  document.querySelectorAll('.role-tab-btn').forEach(btn => {
    btn.className = 'role-tab-btn px-space-md py-2 rounded-full font-small text-small font-medium bg-chip-unselected-bg text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest transition-all flex items-center gap-space-xs cursor-pointer';
  });
  const activeTab = document.getElementById('tab-btn-' + view);
  if (activeTab) {
    activeTab.className = 'role-tab-btn px-space-md py-2 rounded-full font-small text-small font-semibold bg-primary text-on-primary shadow-sm flex items-center gap-space-xs transition-all cursor-pointer';
  }
  if (view !== 'all') {
    selectInspectorRole(view);
  }
}
try { w.selectInspectorRole = selectInspectorRole; } catch (_) {}
try { w.switchRoleView = switchRoleView; } catch (_) {}
    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
{/* Dynamic Atmospheric Header Overlay */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
<div>
<div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption mb-1 tracking-wider uppercase">
<span className="">Admin Console</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="">Security</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="text-primary font-semibold">Roles &amp; Permissions</span>
</div>
<h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">Access Governance &amp; Granular Privilege Matrix</h1>
<p className="font-body text-small text-text-secondary mt-1 max-w-3xl">
        Manage institutional role assignments, define boundary tokens, and calibrate runtime permission sets for staff, cashiers, and active patrons across all Katipuneros library store branches.
      </p>
</div>
{/* Action Toolbelt */}
<div className="flex items-center flex-wrap gap-space-sm self-start md:self-end">
<button className="h-11 px-space-md rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-small text-small font-semibold transition-all flex items-center gap-space-xs shadow-sm active:scale-95" type="button">
<span className="material-symbols-outlined text-[18px]">restart_alt</span>
<span className="">Reset to Defaults</span>
</button>
<button className="h-11 px-space-md rounded-xl bg-surface-container-lowest hover:bg-surface text-text-primary font-small text-small font-semibold transition-all flex items-center gap-space-xs shadow-sm active:scale-95" type="button">
<span className="material-symbols-outlined text-[18px]">file_download</span>
<span className="">Export Security Policy</span>
</button>
<button className="h-11 px-space-lg rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-bold transition-all flex items-center gap-space-xs shadow-md hover:shadow-lg active:scale-95" type="button">
<span className="material-symbols-outlined text-[20px]">add_moderator</span>
<span className="">Create Custom Role</span>
</button>
</div>
</div>
{/* Key Security Metrics Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-xl">
{/* Metric 1 */}
<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="absolute -right-6 -bottom-6 w-28 h-28 bg-soft-blue/40 rounded-full blur-2xl pointer-events-none"></div>
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">Configured Roles</span>
<span className="w-9 h-9 rounded-lg bg-soft-blue text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">badge</span>
</span>
</div>
<div className="mt-space-md">
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-1 text-headline-2 text-text-primary font-bold">4</span>
<span className="font-caption text-caption text-text-secondary">Roles Active</span>
</div>
<div className="mt-space-xs flex items-center gap-1.5 flex-wrap">
<span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-caption text-caption">3 Default</span>
<span className="px-2 py-0.5 rounded-full bg-surface-container-high text-text-primary font-caption text-caption font-semibold">1 Custom</span>
</div>
</div>
</div>
{/* Metric 2 */}
<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="absolute -right-6 -bottom-6 w-28 h-28 bg-secondary-container/30 rounded-full blur-2xl pointer-events-none"></div>
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">Active Identities</span>
<span className="w-9 h-9 rounded-lg bg-soft-blue text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">group</span>
</span>
</div>
<div className="mt-space-md">
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-1 text-headline-2 text-text-primary font-bold">3,420</span>
<span className="font-caption text-caption text-status-available font-semibold flex items-center gap-0.5">
<span className="material-symbols-outlined text-[14px]">arrow_upward</span> +14% mo
          </span>
</div>
<p className="font-caption text-caption text-text-secondary mt-1">Bound to active campus card IDs</p>
</div>
</div>
{/* Metric 3 */}
<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="absolute -right-6 -bottom-6 w-28 h-28 bg-status-pending/20 rounded-full blur-2xl pointer-events-none"></div>
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">High-Privilege Grants</span>
<span className="w-9 h-9 rounded-lg bg-error-container text-error flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">security</span>
</span>
</div>
<div className="mt-space-md">
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-1 text-headline-2 text-text-primary font-bold">16</span>
<span className="font-caption text-caption text-status-danger font-semibold">Super Admins</span>
</div>
<div className="w-full bg-surface-container h-1.5 rounded-full mt-space-sm overflow-hidden">
<div className="bg-primary h-full rounded-full" style={{ width: '14%' }}></div>
</div>
</div>
</div>
{/* Metric 4 */}
<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="absolute -right-6 -bottom-6 w-28 h-28 bg-action-green/30 rounded-full blur-2xl pointer-events-none"></div>
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">2FA Enforcement</span>
<span className="w-9 h-9 rounded-lg bg-surface-container text-status-available flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: '\'FILL\' 1' }}>verified_user</span>
</span>
</div>
<div className="mt-space-md">
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-1 text-headline-2 text-text-primary font-bold">100%</span>
<span className="font-caption text-caption text-status-available font-semibold">Mandatory</span>
</div>
<p className="font-caption text-caption text-text-secondary mt-1">FIDO2 &amp; TOTP on staff tiers</p>
</div>
</div>
</div>
{/* Role Selector Ribbon */}
<div className="flex items-center justify-between flex-wrap gap-space-sm mb-space-md">
<div className="flex items-center gap-space-xs overflow-x-auto py-1"><button onClick={(e) => { (window as any).switchRoleView?.('all'); }} id="tab-btn-all" className="role-tab-btn px-space-md py-2 rounded-full font-small text-small font-semibold bg-primary text-on-primary shadow-sm flex items-center gap-space-xs transition-all cursor-pointer"><span className="material-symbols-outlined text-[18px]">grid_view</span><span className="">All Roles Matrix</span></button><button onClick={(e) => { (window as any).switchRoleView?.('admin'); }} id="tab-btn-admin" className="role-tab-btn px-space-md py-2 rounded-full font-small text-small font-medium bg-chip-unselected-bg text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest transition-all flex items-center gap-space-xs cursor-pointer"><span className="material-symbols-outlined text-[18px]">shield_person</span><span className="">Administrator (16)</span></button><button onClick={(e) => { (window as any).switchRoleView?.('cashier'); }} id="tab-btn-cashier" className="role-tab-btn px-space-md py-2 rounded-full font-small text-small font-medium bg-chip-unselected-bg text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest transition-all flex items-center gap-space-xs cursor-pointer"><span className="material-symbols-outlined text-[18px]">point_of_sale</span><span className="">Cashier Desk (24)</span></button><button onClick={(e) => { (window as any).switchRoleView?.('patron'); }} id="tab-btn-patron" className="role-tab-btn px-space-md py-2 rounded-full font-small text-small font-medium bg-chip-unselected-bg text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest transition-all flex items-center gap-space-xs cursor-pointer"><span className="material-symbols-outlined text-[18px]">person</span><span className="">Patron / Customer (3,372)</span></button><button onClick={(e) => { (window as any).switchRoleView?.('curator'); }} id="tab-btn-curator" className="role-tab-btn px-space-md py-2 rounded-full font-small text-small font-medium bg-chip-unselected-bg text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest transition-all flex items-center gap-space-xs cursor-pointer"><span className="material-symbols-outlined text-[18px]">auto_stories</span><span className="">Department Curator (8)</span></button></div>
{/* Table Search & Filter */}
<div className="flex items-center gap-space-xs">
<div className="relative w-64">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">filter_list</span>
<input className="w-full bg-surface-container-lowest pl-9 pr-3 py-1.5 rounded-full font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none shadow-sm focus:bg-surface-container-lowest" placeholder="Filter module privileges..." type="text" />
</div>
</div>
</div>
{/* Split View: Matrix (Left 68%) and Role Inspector Drawer (Right 32%) */}
<div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
{/* Matrix Table Panel */}
<div className="xl:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
<div className="px-space-lg py-space-md bg-surface-container-lowest flex items-center justify-between">
<div>
<h2 className="font-headline-4 text-headline-4 text-text-primary font-bold">Functional Module Privileges</h2>
<p className="font-caption text-caption text-text-secondary">Granular operational grants mapped across institutional subsystems</p>
</div>
<div className="flex items-center gap-space-xs text-caption font-caption text-text-secondary">
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-action-green"></span> Full</span>
<span className="flex items-center gap-1 ml-2"><span className="w-2 h-2 rounded-full bg-soft-blue"></span> Scoped</span>
<span className="flex items-center gap-1 ml-2"><span className="w-2 h-2 rounded-full bg-surface-variant"></span> Restricted</span>
</div>
</div>
{/* Scrollable Matrix Table */}
<div className="overflow-x-auto"><table className="w-full text-left font-small text-small border-collapse"><thead className="sticky top-0 z-10"><tr className="bg-surface-container-low text-text-secondary font-caption text-caption uppercase tracking-wider border-b border-surface-container-high"><th className="py-3.5 px-space-md font-semibold">Functional Module</th><th className="py-3.5 px-3 text-center font-semibold text-primary bg-secondary-container/20 rounded-t-lg"><div className="flex flex-col items-center"><span className="material-symbols-outlined text-[16px]">shield_person</span><span className="">Admin</span><span className="text-[10px] font-normal normal-case text-text-secondary">(16)</span></div></th><th className="py-3.5 px-3 text-center font-semibold text-primary bg-soft-blue/40 rounded-t-lg"><div className="flex flex-col items-center"><span className="material-symbols-outlined text-[16px]">point_of_sale</span><span className="">Cashier</span><span className="text-[10px] font-normal normal-case text-text-secondary">(24)</span></div></th><th className="py-3.5 px-3 text-center font-semibold text-primary bg-surface-container/40 rounded-t-lg"><div className="flex flex-col items-center"><span className="material-symbols-outlined text-[16px]">person</span><span className="">Patron</span><span className="text-[10px] font-normal normal-case text-text-secondary">(3,372)</span></div></th><th className="py-3.5 px-3 text-center font-semibold text-primary bg-secondary-container/15 rounded-t-lg"><div className="flex flex-col items-center"><span className="material-symbols-outlined text-[16px]">auto_stories</span><span className="">Curator</span><span className="text-[10px] font-normal normal-case text-text-secondary">(8)</span></div></th><th className="py-3.5 px-space-sm text-center font-semibold">Operational Grant Scope</th></tr></thead><tbody className="text-text-primary divide-y divide-surface-container-high"><tr className="hover:bg-surface-container-low/60 transition-colors"><td className="py-3 px-space-md"><div className="flex flex-col"><span className="font-semibold text-text-primary flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px] text-primary">manage_accounts</span> Users &amp; Accounts</span><span className="font-caption text-caption text-text-secondary">Patron profiles, staff credentials &amp; KYC</span></div></td><td className="text-center py-3 px-3 bg-secondary-container/10"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-action-green/30 text-text-primary text-[11px] font-bold gap-0.5"><span className="material-symbols-outlined text-[14px]">check_circle</span> Full</span></td><td className="text-center py-3 px-3 bg-soft-blue/20"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-soft-blue text-primary text-[11px] font-semibold gap-0.5"><span className="material-symbols-outlined text-[14px]">rule</span> Read/KYC</span></td><td className="text-center py-3 px-3"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-soft-blue text-primary text-[11px] font-semibold gap-0.5"><span className="material-symbols-outlined text-[14px]">person</span> Own Profile</span></td><td className="text-center py-3 px-3 bg-secondary-container/5"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-surface-container text-text-secondary text-[11px] gap-0.5"><span className="material-symbols-outlined text-[14px]">visibility</span> Read-only</span></td><td className="py-3 px-space-sm text-caption text-text-secondary">Admins manage full RBAC; Cashiers verify borrower IDs; Patrons edit self avatar/contact.</td></tr><tr className="bg-surface-container-low/30 hover:bg-surface-container-low/70 transition-colors"><td className="py-3 px-space-md"><div className="flex flex-col"><span className="font-semibold text-text-primary flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px] text-primary">book_2</span> Books &amp; Catalog</span><span className="font-caption text-caption text-text-secondary">Marc21 tags, metadata &amp; digital shelves</span></div></td><td className="text-center py-3 px-3 bg-secondary-container/10"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-action-green/30 text-text-primary text-[11px] font-bold gap-0.5"><span className="material-symbols-outlined text-[14px]">check_circle</span> Full</span></td><td className="text-center py-3 px-3 bg-soft-blue/20"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-soft-blue text-primary text-[11px] font-semibold gap-0.5"><span className="material-symbols-outlined text-[14px]">rule</span> Read/Barcode</span></td><td className="text-center py-3 px-3"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-soft-blue text-primary text-[11px] font-semibold gap-0.5"><span className="material-symbols-outlined text-[14px]">search</span> Search Only</span></td><td className="text-center py-3 px-3 bg-secondary-container/5"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-action-green/30 text-text-primary text-[11px] font-bold gap-0.5"><span className="material-symbols-outlined text-[14px]">edit_note</span> Full Catalog</span></td><td className="py-3 px-space-sm text-caption text-text-secondary">Curators classify LoC/DDC &amp; curate bibliographies; Patrons browse catalog opac.</td></tr><tr className="hover:bg-surface-container-low/60 transition-colors"><td className="py-3 px-space-md"><div className="flex flex-col"><span className="font-semibold text-text-primary flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px] text-primary">nfc</span> Copy Inventory &amp; RFID</span><span className="font-caption text-caption text-text-secondary">RFID tags, copy health &amp; shelf-scanners</span></div></td><td className="text-center py-3 px-3 bg-secondary-container/10"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-action-green/30 text-text-primary text-[11px] font-bold gap-0.5"><span className="material-symbols-outlined text-[14px]">check_circle</span> Full</span></td><td className="text-center py-3 px-3 bg-soft-blue/20"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-action-green/30 text-text-primary text-[11px] font-bold gap-0.5"><span className="material-symbols-outlined text-[14px]">qr_code_scanner</span> Tag Scan</span></td><td className="text-center py-3 px-3"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-surface-container text-text-secondary text-[11px] gap-0.5"><span className="material-symbols-outlined text-[14px]">block</span> Restricted</span></td><td className="text-center py-3 px-3 bg-secondary-container/5"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-soft-blue text-primary text-[11px] font-semibold gap-0.5"><span className="material-symbols-outlined text-[14px]">inventory</span> Bindery</span></td><td className="py-3 px-space-sm text-caption text-text-secondary">Cashiers scan tag checkouts; Curators flag preservation, binding &amp; rare volume stacks.</td></tr><tr className="bg-surface-container-low/30 hover:bg-surface-container-low/70 transition-colors"><td className="py-3 px-space-md"><div className="flex flex-col"><span className="font-semibold text-text-primary flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px] text-primary">event_available</span> Reservations &amp; Holds</span><span className="font-caption text-caption text-text-secondary">Staging queue, hold timeouts &amp; lockers</span></div></td><td className="text-center py-3 px-3 bg-secondary-container/10"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-action-green/30 text-text-primary text-[11px] font-bold gap-0.5"><span className="material-symbols-outlined text-[14px]">check_circle</span> Full</span></td><td className="text-center py-3 px-3 bg-soft-blue/20"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-action-green/30 text-text-primary text-[11px] font-bold gap-0.5"><span className="material-symbols-outlined text-[14px]">outgoing_mail</span> Staging</span></td><td className="text-center py-3 px-3"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-soft-blue text-primary text-[11px] font-semibold gap-0.5"><span className="material-symbols-outlined text-[14px]">add_task</span> Max 4 Holds</span></td><td className="text-center py-3 px-3 bg-secondary-container/5"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-action-green/30 text-text-primary text-[11px] font-bold gap-0.5"><span className="material-symbols-outlined text-[14px]">stars</span> Faculty Res.</span></td><td className="py-3 px-space-sm text-caption text-text-secondary">Patrons hold up to 4 titles; Curators place priority semester faculty course reserves.</td></tr><tr className="hover:bg-surface-container-low/60 transition-colors"><td className="py-3 px-space-md"><div className="flex flex-col"><span className="font-semibold text-text-primary flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px] text-primary">sync_alt</span> Loans &amp; Circulation</span><span className="font-caption text-caption text-text-secondary">Check-in, checkout gates &amp; renewal permits</span></div></td><td className="text-center py-3 px-3 bg-secondary-container/10"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-action-green/30 text-text-primary text-[11px] font-bold gap-0.5"><span className="material-symbols-outlined text-[14px]">check_circle</span> Full</span></td><td className="text-center py-3 px-3 bg-soft-blue/20"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-action-green/30 text-text-primary text-[11px] font-bold gap-0.5"><span className="material-symbols-outlined text-[14px]">point_of_sale</span> Fast POS</span></td><td className="text-center py-3 px-3"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-soft-blue text-primary text-[11px] font-semibold gap-0.5"><span className="material-symbols-outlined text-[14px]">autorenew</span> 1x Renewal</span></td><td className="text-center py-3 px-3 bg-secondary-container/5"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-soft-blue text-primary text-[11px] font-semibold gap-0.5"><span className="material-symbols-outlined text-[14px]">school</span> Ext. Loans</span></td><td className="py-3 px-space-sm text-caption text-text-secondary">Cashiers authorize express circulation; Patrons self-renew unreserved items 1 time.</td></tr><tr className="bg-surface-container-low/30 hover:bg-surface-container-low/70 transition-colors"><td className="py-3 px-space-md"><div className="flex flex-col"><span className="font-semibold text-text-primary flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px] text-primary">payments</span> Financial Ledger &amp; Fines</span><span className="font-caption text-caption text-text-secondary">Payment terminals, petty cash &amp; billing waivers</span></div></td><td className="text-center py-3 px-3 bg-secondary-container/10"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-action-green/30 text-text-primary text-[11px] font-bold gap-0.5"><span className="material-symbols-outlined text-[14px]">check_circle</span> Full</span></td><td className="text-center py-3 px-3 bg-soft-blue/20"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-action-green/30 text-text-primary text-[11px] font-bold gap-0.5"><span className="material-symbols-outlined text-[14px]">price_check</span> Collect/₱50</span></td><td className="text-center py-3 px-3"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-soft-blue text-primary text-[11px] font-semibold gap-0.5"><span className="material-symbols-outlined text-[14px]">credit_card</span> Pay Fines</span></td><td className="text-center py-3 px-3 bg-secondary-container/5"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-surface-container text-text-secondary text-[11px] gap-0.5"><span className="material-symbols-outlined text-[14px]">block</span> Restricted</span></td><td className="py-3 px-space-sm text-caption text-text-secondary">Cashiers process cash/GCash &amp; ₱50 courtesy waivers; Patrons pay online via portal.</td></tr><tr className="hover:bg-surface-container-low/60 transition-colors"><td className="py-3 px-space-md"><div className="flex flex-col"><span className="font-semibold text-text-primary flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px] text-primary">monitoring</span> Institutional Analytics</span><span className="font-caption text-caption text-text-secondary">Circulation trends, loss ratios &amp; patron dwell time</span></div></td><td className="text-center py-3 px-3 bg-secondary-container/10"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-action-green/30 text-text-primary text-[11px] font-bold gap-0.5"><span className="material-symbols-outlined text-[14px]">check_circle</span> Full</span></td><td className="text-center py-3 px-3 bg-soft-blue/20"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-surface-container text-text-secondary text-[11px] gap-0.5"><span className="material-symbols-outlined text-[14px]">lock</span> Shift Stats</span></td><td className="text-center py-3 px-3"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-surface-container text-text-secondary text-[11px] gap-0.5"><span className="material-symbols-outlined text-[14px]">block</span> Restricted</span></td><td className="text-center py-3 px-3 bg-secondary-container/5"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-soft-blue text-primary text-[11px] font-semibold gap-0.5"><span className="material-symbols-outlined text-[14px]">analytics</span> Subject Rpt</span></td><td className="py-3 px-space-sm text-caption text-text-secondary">Curators analyze collection usage &amp; gap reports; Admins have executive university metrics.</td></tr><tr className="bg-surface-container-low/30 hover:bg-surface-container-low/70 transition-colors"><td className="py-3 px-space-md"><div className="flex flex-col"><span className="font-semibold text-text-primary flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px] text-primary">shield</span> Security &amp; Audit Logs</span><span className="font-caption text-caption text-text-secondary">Immutable trace trails, auth attempts &amp; overrides</span></div></td><td className="text-center py-3 px-3 bg-secondary-container/10"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-action-green/30 text-text-primary text-[11px] font-bold gap-0.5"><span className="material-symbols-outlined text-[14px]">security</span> Root Trace</span></td><td className="text-center py-3 px-3 bg-soft-blue/20"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-surface-container text-text-secondary text-[11px] gap-0.5"><span className="material-symbols-outlined text-[14px]">lock</span> No Access</span></td><td className="text-center py-3 px-3"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-surface-container text-text-secondary text-[11px] gap-0.5"><span className="material-symbols-outlined text-[14px]">lock</span> No Access</span></td><td className="text-center py-3 px-3 bg-secondary-container/5"><span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-surface-container text-text-secondary text-[11px] gap-0.5"><span className="material-symbols-outlined text-[14px]">lock</span> No Access</span></td><td className="py-3 px-space-sm text-caption text-text-secondary">Exclusive to Super Administrators with 2FA TOTP/FIDO2 hardware key enforcement.</td></tr></tbody></table></div>
{/* Quick Matrix Audit Footer */}
<div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm text-caption font-caption text-text-secondary">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[18px] text-status-available">verified</span>
<span className="">Matrix schema synced with Central Security Directive v4.12</span>
</div>
<div className="flex items-center gap-space-md">
<span className="">Target Environment: <strong>Branch Cluster Alpha</strong></span>
<button className="text-primary font-semibold hover:underline flex items-center gap-1" type="button">
<span className="">Audit Changelog</span>
<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</button>
</div>
</div>
</div>
{/* Role Configuration Inspector (Cashier Terminal) */}
<div className="xl:col-span-4 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">{/* Inspector Header with Role Switcher Quick Pill Strip */}<div className="p-space-lg bg-secondary-container/25 relative border-b border-surface-container-high"><div className="flex items-center justify-between mb-space-xs"><span className="px-2.5 py-0.5 rounded-full bg-primary text-on-primary font-caption text-caption font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-action-green"></span> Role Inspector</span><span id="inspector-role-id" className="font-caption text-caption text-text-secondary font-mono font-bold">ID: ROLE-POS-01</span></div><h3 id="inspector-role-title" className="font-headline-4 text-headline-4 text-text-primary font-bold">Cashier Desk</h3><p id="inspector-role-desc" className="font-caption text-caption text-text-secondary mt-0.5">Front desk terminal &amp; express book checkout gates</p>{/* Interactive Mini Role Selector Buttons inside Drawer */}<div className="grid grid-cols-4 gap-1 mt-3 bg-surface-container-lowest p-1 rounded-lg shadow-sm"><button onClick={(e) => { (window as any).selectInspectorRole?.('admin'); }} id="btn-drawer-admin" className="drawer-tab-btn py-1 px-1.5 text-center font-caption text-[11px] font-semibold text-text-secondary hover:text-text-primary rounded-md transition-all"><span className="material-symbols-outlined text-[16px] block mx-auto">shield_person</span>Admin</button><button onClick={(e) => { (window as any).selectInspectorRole?.('cashier'); }} id="btn-drawer-cashier" className="drawer-tab-btn py-1 px-1.5 text-center font-caption text-[11px] font-bold bg-primary text-on-primary rounded-md shadow-xs transition-all"><span className="material-symbols-outlined text-[16px] block mx-auto">point_of_sale</span>Cashier</button><button onClick={(e) => { (window as any).selectInspectorRole?.('patron'); }} id="btn-drawer-patron" className="drawer-tab-btn py-1 px-1.5 text-center font-caption text-[11px] font-semibold text-text-secondary hover:text-text-primary rounded-md transition-all"><span className="material-symbols-outlined text-[16px] block mx-auto">person</span>Patron</button><button onClick={(e) => { (window as any).selectInspectorRole?.('curator'); }} id="btn-drawer-curator" className="drawer-tab-btn py-1 px-1.5 text-center font-caption text-[11px] font-semibold text-text-secondary hover:text-text-primary rounded-md transition-all"><span className="material-symbols-outlined text-[16px] block mx-auto">auto_stories</span>Curator</button></div></div><div className="p-space-lg flex flex-col gap-space-lg">{/* Dynamic Content Section: Injected via tab or displayed by active profile */}<div id="role-detail-container">{/* Section: Default Landing Scope */}<div className="mb-space-md"><label className="block font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold mb-space-xs">Assigned Default Landing View</label><div className="p-space-sm rounded-lg bg-soft-blue/60 border border-soft-blue flex items-center justify-between"><div className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-primary text-[20px]">point_of_sale</span><div><span id="role-landing-title" className="font-small text-small font-bold text-text-primary block leading-tight">Cashier Circulation Console</span><span id="role-landing-sub" className="font-caption text-caption text-text-secondary">Express barcode loans, holds &amp; returns</span></div></div><span className="px-2 py-0.5 rounded bg-surface-container-lowest font-caption text-caption text-primary font-semibold">Default</span></div></div>{/* Section: Core Entitlements & Boundaries */}<div className="mb-space-md"><div className="flex items-center justify-between mb-space-xs"><label className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">Role Governance Bounds</label><span id="role-tier-badge" className="font-caption text-caption px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-semibold">Station Tier</span></div><div id="role-privilege-list" className="space-y-2"><div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low/50"><span className="material-symbols-outlined text-[18px] text-status-available mt-0.5">check_circle</span><div className="flex flex-col"><span className="font-small text-small font-semibold text-text-primary">Emergency Hold Override</span><span className="font-caption text-caption text-text-secondary">Permits physical checkouts during queue conflicts</span></div></div><div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low/50"><span className="material-symbols-outlined text-[18px] text-status-available mt-0.5">check_circle</span><div className="flex flex-col"><span className="font-small text-small font-semibold text-text-primary">Cash Drawer Hardware Kickout</span><span className="font-caption text-caption text-text-secondary">Manual release with automatic audit trace log</span></div></div><div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low/50"><span className="material-symbols-outlined text-[18px] text-status-available mt-0.5">check_circle</span><div className="flex flex-col"><span className="font-small text-small font-semibold text-text-primary">Fine Courtesy Waiver (up to ₱50)</span><span className="font-caption text-caption text-text-secondary">Immediate settlement without supervisor secondary key</span></div></div><div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low/50"><span className="material-symbols-outlined text-[18px] text-status-available mt-0.5">check_circle</span><div className="flex flex-col"><span className="font-small text-small font-semibold text-text-primary">Hold Staging Clearance</span><span className="font-caption text-caption text-text-secondary">Process arrival of books to express pickup lockers</span></div></div></div></div>{/* Section: Session & Security Policy */}<div className="p-space-md rounded-xl bg-surface-container-low mb-space-md"><div className="flex items-center justify-between mb-1.5"><span className="font-small text-small font-medium text-text-primary flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px] text-primary">security_update_good</span><span id="role-policy-title" className="">Inactivity &amp; Station Token</span></span><span id="role-policy-badge" className="font-caption text-caption font-bold text-primary">15 Min Timeout</span></div><p id="role-policy-desc" className="font-caption text-caption text-text-secondary leading-relaxed">Station lock triggers automatically on idle. POS terminal PIN and cashier badge required={true} to restore session.</p></div>{/* Section: Assigned Identities Preview */}<div className="mb-space-md"><div className="flex items-center justify-between mb-2"><span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold block">Assigned Active Operators</span><span id="role-assigned-count" className="font-caption text-caption text-primary font-bold">24 Terminals</span></div><div className="flex items-center gap-space-xs"><img className="w-8 h-8 rounded-full object-cover shadow-sm" data-alt="Portrait photo of a young female academic librarian wearing spectacles, soft library shelving in background, warm natural lighting, professional badge" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMQDQyLV5gCc9XcblZNcn8V3RKkOmccAu2yjTxp82zIRbRf7m5z-LZ4-lvhirhsKnNbYEP8MMsZ9-KPvMdXwUTiHwRPnUiVFGPmplyh5V1LiI7f7u3Odxuwpl0iAHBJ3uqZK0nZjiRxE5ddSDrGqMyPeRLUytQGtUfGXibI-NqtlenhPJ9kGqRWef4sWOd37D8lMBkE3cxXO9PP2mPrx46WK9YSHa03w_xbUgkfRsu_yoYVfqbajTR" /><img className="w-8 h-8 rounded-full object-cover shadow-sm" data-alt="Portrait photo of a university library assistant, smiling confidently in navy blue polo shirt, catalog stacks blurred in warm ambient bokeh" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwlHPQTeddwjEAl1SSwLSDUJEAq6_Vx67pGrype1ExTDQVLOmLwe9NCtAJ7T1awhIa4ax9dKdmXu6icYAclrv12QO2KzJhLNLx0jyu41xR7ek77XAGYFNv9mfFVuB29Twh0NAac5wHjAszRGQVR81UcXAAHmkBUUQBk_qu44SI9WCJOYs6n3osCoHIPU-McEvcvK6VeAfMeZTnHCPiyqlOqCp9Y3tpSAvjxOnN2Wi_MYOJJKMNCc2n" /><img className="w-8 h-8 rounded-full object-cover shadow-sm" data-alt="Portrait photo of an experienced archival staff member with glasses, library background, soft cyan and clean ambient highlights" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDt1s-pk-lZaRVRnxMPFzlahHHByh3KO_wbKHU0UrSpDNmPDxpxeKq4g6Un5a-N0sSNSd2HAFlKnIqUV-DOyOCifbhQ5KOgmUOxMjthGUhqFlEsC5s_-s7AN8U3dCdORzzWIHra88eDdRJmVuMJQKEeliDUMErOIaJOwHDfXNOw_yQZXzu0K2fbPYgZ_FMh2Dmn6_ELaQPDD4A4q6JIKBaSdjwOyrgu7POTUn-8NuSjJZnWHtakaqas" /><div id="role-avatar-badge" className="w-8 h-8 rounded-full bg-soft-blue text-primary font-caption text-[11px] font-bold flex items-center justify-center shadow-sm">+21</div><span id="role-avatar-sub" className="font-caption text-caption text-text-secondary ml-space-xs">Active on Terminal Fleet</span></div></div></div>{/* Inspector Action Buttons */}<div className="pt-space-xs flex flex-col gap-space-xs"><button className="w-full h-11 px-space-md rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-bold transition-all flex items-center justify-center gap-space-xs shadow-md active:scale-98 cursor-pointer" type="button"><span className="material-symbols-outlined text-[20px]">save</span><span className="">Save Role Policy</span></button><button className="w-full h-10 px-space-md rounded-xl hover:bg-surface-container text-text-secondary hover:text-text-primary font-small text-small font-medium transition-all flex items-center justify-center gap-space-xs cursor-pointer" type="button"><span className="">Clone as Custom Profile</span></button></div></div></div>
</div>
{/* Security Audit Trail & Event Stream (Collapsible Section) */}
<div className="mt-space-xl bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
<div>
<h3 className="font-headline-4 text-headline-4 text-text-primary font-bold">Privilege Modulation Trace</h3>
<p className="font-caption text-caption text-text-secondary">Recent automated &amp; manual security governance updates across the network</p>
</div>
<div className="flex items-center gap-space-sm">
<span className="font-caption text-caption text-status-available font-semibold flex items-center gap-1">
<span className="w-2 h-2 rounded-full bg-status-available"></span> Real-time Ingestion
        </span>
<button className="px-space-md py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary font-small text-small font-medium transition-colors" type="button">
          View Raw Telemetry
        </button>
</div>
</div>
<div className="space-y-3">
{/* Audit Item 1 */}
<div className="flex flex-col sm:flex-row sm:items-center justify-between p-space-md rounded-lg bg-surface-container-low/50 gap-space-sm">
<div className="flex items-center gap-space-md">
<div className="w-9 h-9 rounded-lg bg-action-green/30 text-text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">verified_user</span>
</div>
<div>
<p className="font-small text-small font-semibold text-text-primary">Role "Cashier Terminal" Policy Modified</p>
<p className="font-caption text-caption text-text-secondary">Manual waiver threshold adjusted to ₱50.00 by <strong>SuperAdmin (admin-sec-01)</strong></p>
</div>
</div>
<div className="flex items-center gap-space-md self-end sm:self-center">
<span className="font-caption text-caption text-text-secondary font-mono">14 minutes ago</span>
<span className="px-2 py-0.5 rounded bg-surface-container text-text-primary font-caption text-[11px] font-semibold">Branch Alpha</span>
</div>
</div>
{/* Audit Item 2 */}
<div className="flex flex-col sm:flex-row sm:items-center justify-between p-space-md rounded-lg bg-surface-container-low/50 gap-space-sm">
<div className="flex items-center gap-space-md">
<div className="w-9 h-9 rounded-lg bg-soft-blue text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[18px]">key</span>
</div>
<div>
<p className="font-small text-small font-semibold text-text-primary">FIDO2 Hardware Key Enforced</p>
<p className="font-caption text-caption text-text-secondary">System-wide 100% staff tier enforcement policy applied successfully</p>
</div>
</div>
<div className="flex items-center gap-space-md self-end sm:self-center">
<span className="font-caption text-caption text-text-secondary font-mono">2 hours ago</span>
<span className="px-2 py-0.5 rounded bg-surface-container text-text-primary font-caption text-[11px] font-semibold">Global System</span>
</div>
</div>
</div>
</div>
</div>
    </div>
  );
};

export default RolesPermissions;
