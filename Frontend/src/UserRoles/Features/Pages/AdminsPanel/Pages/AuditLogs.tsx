// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// AuditLogs.tsx -- Admin Immutable System Audit Logs
// Converted directly from SidebarAuditLogsPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const AuditLogs: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
// Mock Data Store for Rows
  const auditEntries = [
    {
      title: "Event Inspector: SICP Classification Update",
      subtitle: "Record Reference: #BK-10492 | SHA-256 Validated",
      hash: "98a1f72a44b9b6e107567cfb42e7d3a245582c3f81e01f65d64acb8214fa397c",
      prev: '"classification": "005.1"',
      next: '"classification": "005.13"',
      actor: "Gabriel Reyes (Staff ID: UPK-4401)",
      role: "Admin Supervisor",
      terminal: "192.168.10.42 (Desk Alpha)",
      payload: {
        "ledger_version": "v3.2",
        "block_height": 41922,
        "transaction_id": "TX-BK-10492-MOD-88",
        "event_type": "CATALOG_CLASSIFICATION_MUTATE",
        "actor": { "uid": "usr_9912041", "email": "g.reyes@upk.edu.ph", "role": "ADMIN_SUPERVISOR" },
        "resource": { "entity": "book_master", "record_id": "BK-10492", "title": "SICP 2nd Ed" },
        "delta": { "field": "dewey_classification", "previous_value": "005.1", "new_value": "005.13" },
        "client_context": { "ip_address": "192.168.10.42", "node_id": "CIRC_DESK_ALPHA" },
        "timestamp": "2026-10-26T02:14:22.418Z",
        "sha256": "98a1f72a44b9b6e107567cfb42e7d3a245582c3f81e01f65d64acb8214fa397c"
      }
    },
    {
      title: "Event Inspector: Cash Fine Settled",
      subtitle: "Record Reference: #TX-20261026-087 | SHA-256 Validated",
      hash: "b412ff17a102c46deef890a88421c97a892b491a3847e70498a91340109eb812",
      prev: '"outstanding_balance": 150.00, "status": "OVERDUE_UNPAID"',
      next: '"outstanding_balance": 0.00, "status": "SETTLED_CASH"',
      actor: "Elena Vance (Staff ID: UPK-5102)",
      role: "Head Cashier",
      terminal: "192.168.10.12 (Terminal Bay 01)",
      payload: {
        "ledger_version": "v3.2",
        "block_height": 41921,
        "transaction_id": "TX-20261026-087",
        "event_type": "FISCAL_FINE_COLLECTION",
        "actor": { "uid": "usr_77192", "email": "rtan.staff@upk.edu.ph", "role": "HEAD_CASHIER" },
        "resource": { "entity": "account_receivable", "record_id": "#TX-20261026-087", "amount_php": 150.00 },
        "delta": { "field": "status", "previous_value": "OVERDUE_UNPAID", "new_value": "SETTLED_CASH" },
        "client_context": { "ip_address": "192.168.10.12", "node_id": "POS_BAY_01" },
        "timestamp": "2026-10-26T01:40:15.192Z",
        "sha256": "b412ff17a102c46deef890a88421c97a892b491a3847e70498a91340109eb812"
      }
    },
    {
      title: "Event Inspector: Late Fee Courtesy Waiver",
      subtitle: "Record Reference: #TX-20261026-084 | SHA-256 Validated",
      hash: "51fc612140a89047bbce010243e8876c2b1239aa807e127394856a90131a4819",
      prev: '"fine_due": 60.00, "waiver_reason": null',
      next: '"fine_due": 0.00, "waiver_reason": "TYPHOON_COURTESY_POLICY"',
      actor: "Elena Vance (Staff ID: UPK-5102)",
      role: "Head Cashier",
      terminal: "192.168.10.12 (Terminal Bay 01)",
      payload: {
        "ledger_version": "v3.2",
        "block_height": 41920,
        "transaction_id": "TX-20261026-084",
        "event_type": "FEE_WAIVER_OVERRIDE",
        "actor": { "uid": "usr_77192", "email": "rtan.staff@upk.edu.ph", "role": "HEAD_CASHIER" },
        "policy_applied": "COLLEGIATE_TYPHOON_COURTESY",
        "delta": { "waived_amount": 60.00, "patron_id": "ST-9912" },
        "client_context": { "ip_address": "192.168.10.12", "node_id": "POS_BAY_01" },
        "timestamp": "2026-10-26T00:35:10.012Z",
        "sha256": "51fc612140a89047bbce010243e8876c2b1239aa807e127394856a90131a4819"
      }
    },
    {
      title: "Event Inspector: Drawer Float Initialized",
      subtitle: "Record Reference: Shift #S-0812 | SHA-256 Validated",
      hash: "77a0bc42129991283e741005bca4028591efb0984817aa521360149021eed412",
      prev: '"drawer_state": "CLOSED", "cash_float": 0.00',
      next: '"drawer_state": "OPEN_ACTIVE", "cash_float": 1450.00',
      actor: "Elena Vance (Staff ID: UPK-5102)",
      role: "Head Cashier",
      terminal: "192.168.10.12 (Terminal Bay 01)",
      payload: {
        "ledger_version": "v3.2",
        "block_height": 41919,
        "transaction_id": "SHIFT-FLOAT-S0812",
        "event_type": "POS_FLOAT_CALIBRATE",
        "dual_custody_signoff": "G_REYES_SUPERVISOR_KEY",
        "cash_breakdown": { "1000_bills": 1, "100_bills": 4, "50_bills": 1 },
        "timestamp": "2026-10-26T00:00:00.000Z",
        "sha256": "77a0bc42129991283e741005bca4028591efb0984817aa521360149021eed412"
      }
    },
    {
      title: "Event Inspector: Privileged Role Policy Mutation",
      subtitle: "Record Reference: Policy #SEC-014 | SHA-256 Validated",
      hash: "33df8812bbac490192e4785461120019234857efcb901460394850123881fa49",
      prev: '"role": "Cashier Desk", "max_manual_waiver": 30.00',
      next: '"role": "Cashier Desk", "max_manual_waiver": 50.00',
      actor: "Administrator (Staff ID: UPK-0001)",
      role: "Super Admin",
      terminal: "192.168.1.100 (HQ Console)",
      payload: {
        "ledger_version": "v3.2",
        "block_height": 41918,
        "transaction_id": "SEC-POL-EDIT-014",
        "event_type": "ACCESS_CONTROL_POLICY_UPDATE",
        "target_role": "CASHIER_DESK",
        "modifications": { "attribute": "max_manual_waiver", "from": 30.00, "to": 50.00 },
        "authorization": "SUPER_ADMIN_ROOT_CREDENTIAL",
        "timestamp": "2026-10-25T09:45:11.831Z",
        "sha256": "33df8812bbac490192e4785461120019234857efcb901460394850123881fa49"
      }
    }
  ];

  function openInspector(index) {
    const entry = auditEntries[index];
    if (!entry) return;

    document.getElementById('drawerTitle').innerText = entry.title;
    document.getElementById('drawerSubtitle').innerText = entry.subtitle;
    document.getElementById('drawerHash').innerText = entry.hash;
    document.getElementById('drawerPrevState').innerText = entry.prev;
    document.getElementById('drawerNewState').innerText = entry.next;
    document.getElementById('drawerActorName').innerText = entry.actor;
    document.getElementById('drawerActorRole').innerText = entry.role;
    document.getElementById('drawerTerminal').innerText = entry.terminal;
    document.getElementById('drawerJsonPayload').innerText = JSON.stringify(entry.payload, null, 2);

    const backdrop = document.getElementById('inspectorBackdrop');
    const drawer = document.getElementById('inspectorDrawer');

    backdrop.classList.remove('hidden');
    setTimeout(() => {
      drawer.classList.remove('translate-x-full');
    }, 10);
  }

  function closeInspector() {
    const backdrop = document.getElementById('inspectorBackdrop');
    const drawer = document.getElementById('inspectorDrawer');

    drawer.classList.add('translate-x-full');
    setTimeout(() => {
      backdrop.classList.add('hidden');
    }, 300);
  }

  function copyPayload() {
    const payloadText = document.getElementById('drawerJsonPayload').innerText;
    navigator.clipboard.writeText(payloadText);
    alert('Cryptographic JSON Payload copied to clipboard.');
  }

  function downloadEvidence() {
    alert('Cryptographic proof bundle (.jwt) downloaded with SHA-256 signature.');
  }

  // Export Dropdown Toggle
  const exportBtn = document.getElementById('btnExportMenu');
  const exportDropdown = document.getElementById('exportDropdown');

  if (exportBtn && exportDropdown) {
    exportBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      exportDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      exportDropdown.classList.add('hidden');
    });
  }

  // Hash Chain Verification Trigger
  const verifyBtn = document.getElementById('btnVerifyChain');
  if (verifyBtn) {
    verifyBtn.addEventListener('click', () => {
      const originalText = verifyBtn.innerHTML;
      verifyBtn.innerHTML = `<span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span><span>Validating Blocks 0..41922...</span>`;
      setTimeout(() => {
        verifyBtn.innerHTML = `<span class="material-symbols-outlined text-[18px] text-action-green">task_alt</span><span>100% Chain Validated</span>`;
        setTimeout(() => {
          verifyBtn.innerHTML = originalText;
        }, 3000);
      }, 1200);
    });
  }

    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
<div className="flex flex-col gap-space-lg w-full">
{/* Top Action Banner & Ledger Title */}
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
<div className="flex flex-col gap-space-xs">
<div className="flex items-center gap-space-xs">
<span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-status-available animate-pulse"></span>
<span className="font-caption text-caption text-secondary uppercase tracking-wider font-semibold">Security &amp; Compliance Hub</span>
<span className="text-text-secondary text-caption font-caption">•</span>
<span className="font-caption text-caption text-text-secondary">WORM Storage Active (Write Once, Read Many)</span>
</div>
<h1 className="font-headline-3 text-headline-3 text-text-primary tracking-tight">Immutable System Audit Trail &amp; Security Telemetry</h1>
<p className="font-small text-small text-text-secondary max-w-3xl">
          Cryptographically chained ledger tracking administrative overrides, fiscal waivers, collection transfers, and privileged credentials across Katipuneros academic stores.
        </p>
</div>
<div className="flex flex-wrap items-center gap-space-sm">
<button className="h-11 px-space-md rounded-lg bg-soft-blue text-primary font-body-medium text-small font-semibold hover:bg-secondary-fixed transition-colors flex items-center gap-space-xs shadow-sm" id="btnVerifyChain" type="button">
<span className="material-symbols-outlined text-[18px]">verified_user</span>
<span className="">Verify Hash Chain</span>
</button>
<div className="relative inline-block text-left">
<button className="h-11 px-space-md rounded-lg bg-action-green text-text-primary font-body-medium text-small font-bold hover:bg-action-green-hover transition-colors flex items-center gap-space-xs shadow-sm" id="btnExportMenu" type="button">
<span className="material-symbols-outlined text-[18px]">lock_clock</span>
<span className="">Export Cryptographic Dossier</span>
<span className="material-symbols-outlined text-[16px]">expand_more</span>
</button>
<div className="hidden absolute right-0 mt-1 w-56 bg-surface-container-lowest rounded-lg shadow-xl py-space-xs z-50" id="exportDropdown">
<a className="flex items-center gap-space-sm px-space-md py-2 font-small text-small text-text-primary hover:bg-surface-container transition-colors" href="#">
<span className="material-symbols-outlined text-[18px] text-primary">description</span>
<span className="">CSV Ledger Export (.csv)</span>
</a>
<a className="flex items-center gap-space-sm px-space-md py-2 font-small text-small text-text-primary hover:bg-surface-container transition-colors" href="#">
<span className="material-symbols-outlined text-[18px] text-tertiary">data_object</span>
<span className="">Signed JSON Dossier (.json)</span>
</a>
<a className="flex items-center gap-space-sm px-space-md py-2 font-small text-small text-text-primary hover:bg-surface-container transition-colors" href="#">
<span className="material-symbols-outlined text-[18px] text-status-pending">policy</span>
<span className="">COA Regulatory Bundle</span>
</a>
</div>
</div>
</div>
</div>
{/* Telemetry Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
{/* Total System Events */}
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
<div className="flex items-center justify-between mb-space-sm">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">Total System Events (24h)</span>
<div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[18px]">receipt_long</span>
</div>
</div>
<div className="flex items-baseline gap-space-sm">
<span className="font-headline-2 text-headline-2 text-text-primary">1,842</span>
<span className="font-caption text-caption text-status-available font-semibold flex items-center">
<span className="material-symbols-outlined text-[14px]">arrow_upward</span> +14.2%
          </span>
</div>
<span className="font-caption text-caption text-text-secondary mt-space-xs">Logged into persistent WAL</span>
<div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20">
<div className="h-full bg-primary" style={{ width: '78%' }}></div>
</div>
</div>
{/* Security Anomalies */}
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden">
<div className="flex items-center justify-between mb-space-sm">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">Security Anomalies</span>
<div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-status-available">
<span className="material-symbols-outlined text-[18px]">gshield</span>
</div>
</div>
<div className="flex items-baseline gap-space-sm">
<span className="font-headline-2 text-headline-2 text-status-available">0</span>
<span className="font-caption text-caption text-text-secondary">Critical Alerts</span>
</div>
<span className="font-caption text-caption text-text-secondary mt-space-xs">Zero privilege escalation breaches</span>
<div className="absolute bottom-0 left-0 right-0 h-1 bg-status-available/30">
<div className="h-full bg-status-available" style={{ width: '100%' }}></div>
</div>
</div>
{/* Hash Chain Status */}
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden">
<div className="flex items-center justify-between mb-space-sm">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">Hash Chain Status</span>
<div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
<span className="material-symbols-outlined text-[18px]">link</span>
</div>
</div>
<div className="flex items-baseline gap-space-sm">
<span className="font-headline-2 text-headline-2 text-text-primary">100%</span>
<span className="font-caption text-caption text-primary font-semibold">SHA-256</span>
</div>
<span className="font-caption text-caption text-text-secondary mt-space-xs">Block #41,922 validated 2m ago</span>
<div className="absolute bottom-0 left-0 right-0 h-1 bg-action-green/30">
<div className="h-full bg-action-green" style={{ width: '100%' }}></div>
</div>
</div>
{/* Active Super-Admin Sessions */}
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden">
<div className="flex items-center justify-between mb-space-sm">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">Active Super-Admin Sessions</span>
<div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
</div>
</div>
<div className="flex items-baseline gap-space-sm">
<span className="font-headline-2 text-headline-2 text-text-primary">2</span>
<span className="font-caption text-caption text-text-secondary">Concurrent</span>
</div>
<span className="font-caption text-caption text-text-secondary mt-space-xs">HQ Console &amp; Terminal Alpha</span>
<div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-container/30">
<div className="h-full bg-primary-container" style={{ width: '40%' }}></div>
</div>
</div>
</div>
{/* Filter Control Bar */}
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-md">
<div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
{/* Live Search Field */}
<div className="relative flex-1">
<span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">filter_alt</span>
<input className="w-full bg-surface-container-low pl-11 pr-space-md py-2.5 rounded-full font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all" id="searchInput" placeholder="Filter by Actor, Email, Record ID, IP, or Hash suffix..." type="text" />
</div>
{/* Filter Chips & Selectors */}
<div className="flex flex-wrap items-center gap-space-sm">
{/* Severity Filter */}
<div className="flex items-center bg-surface-container-low p-1 rounded-full text-caption font-caption">
<button className="px-space-sm py-1 rounded-full bg-surface-container-lowest text-text-primary font-semibold shadow-xs">All Severities</button>
<button className="px-space-sm py-1 rounded-full text-text-secondary hover:text-text-primary transition-colors">Info</button>
<button className="px-space-sm py-1 rounded-full text-text-secondary hover:text-text-primary transition-colors">Warning</button>
<button className="px-space-sm py-1 rounded-full text-text-secondary hover:text-status-danger transition-colors">Critical</button>
</div>
{/* Module Selector */}
<div className="relative">
<select className="bg-surface-container-low text-text-primary font-small text-small py-2 px-space-md rounded-full appearance-none pr-8 cursor-pointer focus:outline-none">
<option>All Modules</option>
<option>Catalog Management</option>
<option>User Accounts</option>
<option>Loan Overrides</option>
<option>Fine Waivers &amp; Cash</option>
<option>POS Hardware</option>
<option>Access Control &amp; Roles</option>
</select>
<span className="material-symbols-outlined absolute right-space-sm top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary text-[18px]">expand_more</span>
</div>
{/* Time Range */}
<div className="flex items-center bg-surface-container-low p-1 rounded-full text-caption font-caption">
<button className="px-space-sm py-1 rounded-full bg-surface-container-lowest text-primary font-bold shadow-xs">Today (Oct 26)</button>
<button className="px-space-sm py-1 rounded-full text-text-secondary hover:text-text-primary transition-colors">7D</button>
<button className="px-space-sm py-1 rounded-full text-text-secondary hover:text-text-primary transition-colors">30D</button>
<button className="px-space-sm py-1 rounded-full text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">calendar_today</span>
<span className="">Custom</span>
</button>
</div>
<button className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors" title="Reset Filters" type="button">
<span className="material-symbols-outlined text-[18px]">restart_alt</span>
</button>
</div>
</div>
</div>
{/* Main Chronological Audit Ledger Table */}
<div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
<div className="px-space-lg py-space-md bg-surface-container-lowest flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-primary text-[20px]">history_edu</span>
<span className="font-headline-4 text-headline-4 text-text-primary">Ledger Stream</span>
<span className="bg-soft-blue text-primary font-caption text-caption px-space-xs py-0.5 rounded-full font-bold">5 Chronological Events Displayed</span>
</div>
<div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption">
<span className="material-symbols-outlined text-[16px] text-status-available">check_circle</span>
<span className="">Ledger Merkle Root: 0x89f4..d301</span>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left font-small text-small text-text-primary">
<thead>
<tr className="bg-surface-container-low text-text-secondary font-caption text-caption uppercase tracking-wider">
<th className="py-space-sm px-space-md font-semibold">Timestamp</th>
<th className="py-space-sm px-space-md font-semibold">Actor &amp; Identity</th>
<th className="py-space-sm px-space-md font-semibold">Role</th>
<th className="py-space-sm px-space-md font-semibold">Module / Scope</th>
<th className="py-space-sm px-space-md font-semibold">Event Action</th>
<th className="py-space-sm px-space-md font-semibold">Record Ref</th>
<th className="py-space-sm px-space-md font-semibold min-w-[220px]">Delta / Modification</th>
<th className="py-space-sm px-space-md font-semibold">Node &amp; IP</th>
<th className="py-space-sm px-space-md font-semibold">Integrity Seal</th>
<th className="py-space-sm px-space-md font-semibold text-right">Audit</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container">
{/* Row 1 */}
<tr className="hover:bg-surface-container-low/60 transition-colors cursor-pointer group" onClick={(e) => { (window as any).openInspector?.(0); }}>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="flex flex-col">
<span className="font-semibold text-text-primary">10:14:22 AM</span>
<span className="font-caption text-caption text-text-secondary">Today</span>
</div>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="flex items-center gap-space-sm">
<div className="w-7 h-7 rounded-full bg-soft-blue text-primary font-bold flex items-center justify-center font-caption text-caption">GR</div>
<div className="flex flex-col">
<span className="font-semibold text-text-primary leading-tight">Gabriel Reyes</span>
<span className="font-caption text-caption text-text-secondary">g.reyes@upk.edu.ph</span>
</div>
</div>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption font-caption font-semibold bg-secondary-container text-on-secondary-container">
                  Admin Supervisor
                </span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="font-semibold text-primary">Catalog</span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="inline-flex items-center gap-1 font-semibold text-text-primary">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
                  Title Update
                </span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="flex flex-col">
<span className="font-mono text-caption text-primary font-bold">#BK-10492</span>
<span className="font-caption text-caption text-text-secondary truncate max-w-[120px]">SICP 2nd Ed</span>
</div>
</td>
<td className="py-space-md px-space-md">
<p className="font-small text-small text-text-primary leading-snug">Changed classification from <span className="bg-surface-container px-1 py-0.5 rounded font-mono text-caption text-status-danger">005.1</span> to <span className="bg-soft-blue px-1 py-0.5 rounded font-mono text-caption text-primary font-bold">005.13</span></p>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="flex flex-col">
<span className="font-mono text-caption text-text-primary">192.168.10.42</span>
<span className="font-caption text-caption text-text-secondary">Desk Alpha</span>
</div>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="inline-flex items-center gap-1 font-mono text-[11px] text-text-secondary bg-surface-container px-2 py-1 rounded">
<span className="material-symbols-outlined text-[14px] text-status-available">lock</span>
                  98a1..c3f
                </span>
</td>
<td className="py-space-md px-space-md text-right whitespace-nowrap">
<button className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">terminal</span>
</button>
</td>
</tr>
{/* Row 2 */}
<tr className="hover:bg-surface-container-low/60 transition-colors cursor-pointer group" onClick={(e) => { (window as any).openInspector?.(1); }}>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="flex flex-col">
<span className="font-semibold text-text-primary">09:40:15 AM</span>
<span className="font-caption text-caption text-text-secondary">Today</span>
</div>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="flex items-center gap-space-sm">
<div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container font-bold flex items-center justify-center font-caption text-caption">EV</div>
<div className="flex flex-col">
<span className="font-semibold text-text-primary leading-tight">Elena Vance</span>
<span className="font-caption text-caption text-text-secondary">rtan.staff@upk.edu.ph</span>
</div>
</div>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption font-caption font-semibold bg-surface-container text-text-secondary">
                  Head Cashier
                </span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="font-semibold text-tertiary">Financial</span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="inline-flex items-center gap-1 font-semibold text-text-primary">
<span className="w-1.5 h-1.5 rounded-full bg-action-green"></span>
                  Fine Settled
                </span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="flex flex-col">
<span className="font-mono text-caption text-primary font-bold">#TX-20261026-087</span>
<span className="font-caption text-caption text-text-secondary">POS Receipt #12</span>
</div>
</td>
<td className="py-space-md px-space-md">
<p className="font-small text-small text-text-primary leading-snug">Collected <span className="font-semibold text-primary">₱150.00</span> cash payment for 10d overdue fine</p>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="flex flex-col">
<span className="font-mono text-caption text-text-primary">192.168.10.12</span>
<span className="font-caption text-caption text-text-secondary">Terminal Bay 01</span>
</div>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="inline-flex items-center gap-1 font-mono text-[11px] text-text-secondary bg-surface-container px-2 py-1 rounded">
<span className="material-symbols-outlined text-[14px] text-status-available">lock</span>
                  b412..09e
                </span>
</td>
<td className="py-space-md px-space-md text-right whitespace-nowrap">
<button className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">terminal</span>
</button>
</td>
</tr>
{/* Row 3 */}
<tr className="hover:bg-surface-container-low/60 transition-colors cursor-pointer group bg-soft-blue/20" onClick={(e) => { (window as any).openInspector?.(2); }}>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="flex flex-col">
<span className="font-semibold text-text-primary">08:35:10 AM</span>
<span className="font-caption text-caption text-text-secondary">Today</span>
</div>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="flex items-center gap-space-sm">
<div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container font-bold flex items-center justify-center font-caption text-caption">EV</div>
<div className="flex flex-col">
<span className="font-semibold text-text-primary leading-tight">Elena Vance</span>
<span className="font-caption text-caption text-text-secondary">rtan.staff@upk.edu.ph</span>
</div>
</div>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption font-caption font-semibold bg-surface-container text-text-secondary">
                  Head Cashier
                </span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="font-semibold text-primary">Operations</span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="inline-flex items-center gap-1 font-semibold text-status-pending">
<span className="w-1.5 h-1.5 rounded-full bg-status-pending"></span>
                  Fee Waiver
                </span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="flex flex-col">
<span className="font-mono text-caption text-primary font-bold">#TX-20261026-084</span>
<span className="font-caption text-caption text-text-secondary">Patron #ST-9912</span>
</div>
</td>
<td className="py-space-md px-space-md">
<p className="font-small text-small text-text-primary leading-snug">Waived <span className="font-semibold text-status-pending">₱60.00</span> late fee under collegiate typhoon courtesy policy</p>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="flex flex-col">
<span className="font-mono text-caption text-text-primary">192.168.10.12</span>
<span className="font-caption text-caption text-text-secondary">Terminal Bay 01</span>
</div>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="inline-flex items-center gap-1 font-mono text-[11px] text-text-secondary bg-surface-container px-2 py-1 rounded">
<span className="material-symbols-outlined text-[14px] text-status-available">lock</span>
                  51fc..31a
                </span>
</td>
<td className="py-space-md px-space-md text-right whitespace-nowrap">
<button className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">terminal</span>
</button>
</td>
</tr>
{/* Row 4 */}
<tr className="hover:bg-surface-container-low/60 transition-colors cursor-pointer group" onClick={(e) => { (window as any).openInspector?.(3); }}>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="flex flex-col">
<span className="font-semibold text-text-primary">08:00:00 AM</span>
<span className="font-caption text-caption text-text-secondary">Today</span>
</div>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="flex items-center gap-space-sm">
<div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container font-bold flex items-center justify-center font-caption text-caption">EV</div>
<div className="flex flex-col">
<span className="font-semibold text-text-primary leading-tight">Elena Vance</span>
<span className="font-caption text-caption text-text-secondary">rtan.staff@upk.edu.ph</span>
</div>
</div>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption font-caption font-semibold bg-surface-container text-text-secondary">
                  Head Cashier
                </span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="font-semibold text-secondary">POS Hardware</span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="inline-flex items-center gap-1 font-semibold text-text-primary">
<span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                  Drawer Float Calibrated
                </span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="flex flex-col">
<span className="font-mono text-caption text-primary font-bold">Shift #S-0812</span>
<span className="font-caption text-caption text-text-secondary">Till Registry A</span>
</div>
</td>
<td className="py-space-md px-space-md">
<p className="font-small text-small text-text-primary leading-snug">Initialized cash float <span className="font-semibold text-text-primary">₱1,450.00</span> verified with dual supervisor key</p>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="flex flex-col">
<span className="font-mono text-caption text-text-primary">192.168.10.12</span>
<span className="font-caption text-caption text-text-secondary">Terminal Bay 01</span>
</div>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="inline-flex items-center gap-1 font-mono text-[11px] text-text-secondary bg-surface-container px-2 py-1 rounded">
<span className="material-symbols-outlined text-[14px] text-status-available">lock</span>
                  77a0..eed
                </span>
</td>
<td className="py-space-md px-space-md text-right whitespace-nowrap">
<button className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">terminal</span>
</button>
</td>
</tr>
{/* Row 5 */}
<tr className="hover:bg-surface-container-low/60 transition-colors cursor-pointer group bg-error-container/20" onClick={(e) => { (window as any).openInspector?.(4); }}>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="flex flex-col">
<span className="font-semibold text-text-primary">17:45:11 PM</span>
<span className="font-caption text-caption text-text-secondary">Yesterday</span>
</div>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="flex items-center gap-space-sm">
<div className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center font-caption text-caption">AD</div>
<div className="flex flex-col">
<span className="font-semibold text-text-primary leading-tight">Administrator</span>
<span className="font-caption text-caption text-text-secondary">super.admin@upk.edu.ph</span>
</div>
</div>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption font-caption font-bold bg-primary text-on-primary">
                  Super Admin
                </span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="font-semibold text-status-danger">Access Control</span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="inline-flex items-center gap-1 font-semibold text-status-danger">
<span className="w-1.5 h-1.5 rounded-full bg-status-danger"></span>
                  Role Policy Edited
                </span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="flex flex-col">
<span className="font-mono text-caption text-primary font-bold">Role: Cashier Desk</span>
<span className="font-caption text-caption text-text-secondary">Policy #SEC-014</span>
</div>
</td>
<td className="py-space-md px-space-md">
<p className="font-small text-small text-text-primary leading-snug">Modified maximum manual waiver limit from <span className="bg-surface-container px-1 py-0.5 rounded font-mono text-caption text-status-danger">₱30.00</span> to <span className="bg-soft-blue px-1 py-0.5 rounded font-mono text-caption text-primary font-bold">₱50.00</span></p>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="flex flex-col">
<span className="font-mono text-caption text-text-primary">192.168.1.100</span>
<span className="font-caption text-caption text-text-secondary">HQ Console</span>
</div>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="inline-flex items-center gap-1 font-mono text-[11px] text-text-secondary bg-surface-container px-2 py-1 rounded">
<span className="material-symbols-outlined text-[14px] text-status-available">lock</span>
                  33df..881
                </span>
</td>
<td className="py-space-md px-space-md text-right whitespace-nowrap">
<button className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">terminal</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
{/* Table Footer & Merkle Pagination */}
<div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-xs text-caption font-caption text-text-secondary">
<span className="">Displaying 1–5 of 1,842 verified records</span>
<span className="">•</span>
<span className="flex items-center gap-1 text-primary font-semibold cursor-pointer hover:underline">
<span className="material-symbols-outlined text-[14px]">sync</span> Force Chain Re-index
          </span>
</div>
<div className="flex items-center gap-space-xs">
<button className="px-space-sm py-1 rounded bg-surface-container text-text-secondary text-caption font-caption cursor-not-allowed">Previous</button>
<button className="px-space-sm py-1 rounded bg-primary text-on-primary font-bold text-caption font-caption">1</button>
<button className="px-space-sm py-1 rounded bg-surface-container text-text-primary text-caption font-caption hover:bg-surface-container-highest transition-colors">2</button>
<button className="px-space-sm py-1 rounded bg-surface-container text-text-primary text-caption font-caption hover:bg-surface-container-highest transition-colors">3</button>
<span className="text-text-secondary text-caption px-1">...</span>
<button className="px-space-sm py-1 rounded bg-surface-container text-text-primary text-caption font-caption hover:bg-surface-container-highest transition-colors">369</button>
<button className="px-space-sm py-1 rounded bg-surface-container text-text-primary text-caption font-caption hover:bg-surface-container-highest transition-colors">Next</button>
</div>
</div>
</div>
</div>
{/* Detail Inspector Slide-over Modal / Drawer */}
<div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 hidden transition-opacity" id="inspectorBackdrop" onClick={(e) => { (window as any).closeInspector?.(); }}></div>
<div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-surface-container-lowest shadow-2xl z-50 transform translate-x-full transition-transform duration-300 flex flex-col" id="inspectorDrawer">
{/* Drawer Header */}
<div className="p-space-lg bg-surface-container-low flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-9 h-9 rounded-lg bg-soft-blue text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">fingerprint</span>
</div>
<div className="flex flex-col">
<h3 className="font-headline-4 text-headline-4 text-text-primary" id="drawerTitle">Event Inspector: SICP Classification Update</h3>
<span className="font-caption text-caption text-text-secondary" id="drawerSubtitle">Record Reference: #BK-10492 | SHA-256 Validated</span>
</div>
</div>
<button className="w-8 h-8 rounded-full hover:bg-surface-container text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors" onClick={(e) => { (window as any).closeInspector?.(); }}>
<span className="material-symbols-outlined text-[20px]">close</span>
</button>
</div>
{/* Drawer Content Scrollable */}
<div className="flex-1 overflow-y-auto p-space-lg flex flex-col gap-space-lg">
{/* Cryptographic Ledger Fingerprint Header */}
<div className="p-space-md rounded-xl bg-soft-blue/30 flex flex-col gap-space-xs">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider font-semibold text-text-secondary">Merkle Proof &amp; Chain Anchor</span>
<span className="px-2 py-0.5 rounded-full bg-status-available text-on-primary font-caption text-caption font-bold">Unbroken</span>
</div>
<div className="font-mono text-[12px] break-all text-primary font-semibold bg-surface-container-lowest p-space-sm rounded">
          SHA256: <span id="drawerHash" className="">98a1f72a44b9b6e107567cfb42e7d3a245582c3f81e01f65d64acb8214fa397c</span>
</div>
<div className="flex items-center justify-between text-caption font-caption text-text-secondary">
<span className="">Previous Block: <span className="font-mono text-text-primary">#41921 (b412..09e)</span></span>
<span className="">Signature: ED25519-Signed</span>
</div>
</div>
{/* State Mutation (Before vs After Diff) */}
<div className="flex flex-col gap-space-sm">
<h4 className="font-caption text-caption uppercase tracking-wider font-semibold text-text-secondary">State Delta (Before / After)</h4>
<div className="grid grid-cols-2 gap-space-sm">
<div className="p-space-md rounded-xl bg-error-container/30 flex flex-col gap-space-xs">
<span className="font-caption text-caption uppercase tracking-wider font-bold text-error">Pre-State (Value Expired)</span>
<div className="font-mono text-small text-on-surface bg-surface-container-lowest p-space-sm rounded font-medium" id="drawerPrevState">
              "classification": "005.1"
            </div>
</div>
<div className="p-space-md rounded-xl bg-action-green/20 flex flex-col gap-space-xs">
<span className="font-caption text-caption uppercase tracking-wider font-bold text-text-primary">Post-State (Committed)</span>
<div className="font-mono text-small text-on-surface bg-surface-container-lowest p-space-sm rounded font-medium" id="drawerNewState">
              "classification": "005.13"
            </div>
</div>
</div>
</div>
{/* Actor & Session Dossier */}
<div className="flex flex-col gap-space-sm">
<h4 className="font-caption text-caption uppercase tracking-wider font-semibold text-text-secondary">Actor &amp; Origin Matrix</h4>
<div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-space-sm">
<div className="grid grid-cols-2 gap-space-md font-small text-small">
<div>
<span className="text-text-secondary text-caption font-caption block">Authenticated Principal</span>
<span className="font-semibold text-text-primary" id="drawerActorName">Gabriel Reyes (Staff ID: UPK-4401)</span>
</div>
<div>
<span className="text-text-secondary text-caption font-caption block">Security Clearance Role</span>
<span className="font-semibold text-primary" id="drawerActorRole">Admin Supervisor</span>
</div>
<div>
<span className="text-text-secondary text-caption font-caption block">Source Socket &amp; Hardware</span>
<span className="font-mono text-text-primary" id="drawerTerminal">192.168.10.42 (Desk Alpha)</span>
</div>
<div>
<span className="text-text-secondary text-caption font-caption block">MFA Verification Status</span>
<span className="text-status-available font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">security</span> FIDO2 Hardware Key Authenticated
              </span>
</div>
</div>
</div>
</div>
{/* Raw Immutable Audit JSON Payload */}
<div className="flex flex-col gap-space-xs">
<div className="flex items-center justify-between">
<h4 className="font-caption text-caption uppercase tracking-wider font-semibold text-text-secondary">Full Telemetry JSON Payload</h4>
<button className="font-caption text-caption text-primary hover:underline flex items-center gap-1 font-semibold" onClick={(e) => { (window as any).copyPayload?.(); }}>
<span className="material-symbols-outlined text-[14px]">content_copy</span> Copy Raw Object
          </button>
</div>
<pre className="bg-inverse-surface text-inverse-on-surface p-space-md rounded-xl font-mono text-[12px] overflow-x-auto leading-relaxed max-h-72" id="drawerJsonPayload">{`{
  "ledger_version": "v3.2",
  "block_height": 41922,
  "transaction_id": "TX-BK-10492-MOD-88",
  "event_type": "CATALOG_CLASSIFICATION_MUTATE",
  "actor": {
    "uid": "usr_9912041",
    "email": "g.reyes@upk.edu.ph",
    "role": "ADMIN_SUPERVISOR",
    "session_id": "sess_live_9a7e8812c"
  },
  "resource": {
    "entity": "book_master",
    "record_id": "BK-10492",
    "isbn": "978-0262510875",
    "title": "Structure and Interpretation of Computer Programs"
  },
  "delta": {
    "field": "dewey_classification",
    "previous_value": "005.1",
    "new_value": "005.13"
  },
  "client_context": {
    "ip_address": "192.168.10.42",
    "node_id": "CIRC_DESK_ALPHA",
    "user_agent": "KatipunerosAdminClient/4.1 (Linux; x86_64)",
    "geofence": "CAMPUS_LAN_SUB10"
  },
  "timestamp": "2026-10-26T02:14:22.418Z",
  "sha256": "98a1f72a44b9b6e107567cfb42e7d3a245582c3f81e01f65d64acb8214fa397c"
}
        `}</pre>
</div>
</div>
{/* Drawer Footer Actions */}
<div className="p-space-md bg-surface-container-low flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary">Signed with Katipuneros CA Root Cert #KTP-2026</span>
<div className="flex items-center gap-space-sm">
<button className="px-space-md py-2 rounded-lg bg-surface-container text-text-primary font-small text-small font-medium hover:bg-surface-container-highest transition-colors" onClick={(e) => { (window as any).closeInspector?.(); }}>Close</button>
<button className="px-space-md py-2 rounded-lg bg-primary text-on-primary font-small text-small font-semibold hover:bg-primary-container transition-colors flex items-center gap-1" onClick={(e) => { (window as any).downloadEvidence?.(); }}>
<span className="material-symbols-outlined text-[16px]">download</span>
<span className="">Download Audit Token (.jwt)</span>
</button>
</div>
</div>
</div>
</div>

    </div>
  );
};

export default AuditLogs;
