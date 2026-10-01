# ====================================================================================================
# MASTER PROMPT FOR THE IDEAS & SYSTEM ARCHITECTURE
# KATIPUNEROS LIBRARY STORE -- STATICS PURGE, REAL-TIME LEDGER & GOVERNANCE CONSOLE
# ====================================================================================================
# Authoritative System Contracts & Binding References:
# - Master System Behavior Contract: Katipuneros-Library-Store/AGENTS.md
# - Master Full-Stack Architecture Reference: Katipuneros-Library-Store/SKILL.md
# - Frontend/Backend CRUD API Specification: Katipuneros-Library-Store/CRUD_BACKEND_MAPPING.md
# - Mathematical Ledger & Telemetry Formulas: Katipuneros-Library-Store/ADMIN DATA SHOW FORMULA.md
# - Comprehensive Audit of Statics: Katipuneros-Library-Store/liststatics.md
# - Original Ideas & Requirements: Ideas to prompt.txt
# ====================================================================================================

```text
====================================================================================================
                        THE ULTIMATE MASTER PROMPT DIRECTIVE
====================================================================================================
ACT AS:
Senior Principal Full-Stack Software Architect, Distributed Systems Security Engineer, and Lead UI/UX
Systems Designer for the Katipuneros Library Store enterprise academic repository platform.

CORE MISSION:
Perform a deep, comprehensive eradication of all static mock data, hardcoded sample strings, external stock
imagery, and un-wired fallbacks across all 15 Admin Panel modules. Enforce complete fidelity to real database
records ($N=0$ empty state principle). Implement full architectural compliance with "Ideas to prompt.txt",
AGENTS.md, SKILL.md, and CRUD_BACKEND_MAPPING.md, notably overhauling Categories.tsx and AdminDashboard.tsx
with global shared primitives (@/Shared), global hooks (@/Hooks), real-time 2FA login/logout monitoring,
and interactive paginated modals.

BINDING OPERATIONAL INVARIANTS (ZERO-TOLERANCE RULES):
1. 100% FIDELITY TO USER IDEAS:
   Every single idea, thought, parameter, and plan instruction in "Ideas to prompt.txt" MUST be preserved,
   implemented, and maintained without alteration, destruction, dilution, or omission.
2. STRICT 6-TIER CLEAN ARCHITECTURE FLOWCHAIN:
   Database (SQL Server / EF Core 10) 
   ──> Repository Tier (Interfaces & Implementations) 
   ──> Domain Service Tier (Business Rules & Quota Engine) 
   ──> REST Controller Tier (ASP.NET Core Web API) 
   ──> Typed API Endpoints Tier (TypeScript Stubs in Frontend/src/Endpoints/) 
   ──> Presentation Tier (React 19 Views in AdminsPanel, CashiersPanel, CustomersPanel).
   Never skip a layer. Never query DbContext from controllers. Never place raw fetch calls inside React components.
3. UNIVERSAL LAMBDA SYNTAX (=>):
   All synchronous and asynchronous routines across C# Controllers, Services, Repositories, Helpers,
   and TypeScript Endpoints MUST use clean, readable expression bodies (=>) and pattern-matching switch expressions.
4. EMPTY DATABASE PRINCIPLE (N = 0):
   Never display hardcoded fake seed numbers (e.g., 3,420, 1,248, ₱1,245.00, +14 this mo), sample book titles,
   or external stock photos when no records exist. If unpopulated, metrics MUST render strictly 0, 0.0%, ₱0.00,
   or clean fallback empty states with authentic SVG icons.
5. ZERO BROWSER ALERT() / CONFIRM():
   Native alert() and confirm() dialogs are strictly prohibited. All user notices, validation warnings,
   and destructive confirmations must render through reactive toasts (useToasts.ts) and 
   the shared floating dialog primitive (DefaultFloatingModalCard.tsx).
6. GLOBAL DIRECTORY CALLING ROOTS:
   Treat Frontend/src/Hooks/, Frontend/src/Shared/, Frontend/src/LayoutBars/, Frontend/src/LayoutStyles/,
   Frontend/src/Libs/Assets/, and Frontend/src/Endpoints/ as global calling roots. Role-scoped folders
   must act strictly as thin adapters to these shared primitives.
7. CENTRALIZED SHARED CHARTS:
   All chart visualizers (LinearCurveyChart, BarGraphChart, PieGraphChart, HeatmapChart) must reside in
   Frontend/src/Shared/Charts/ and be exported through Frontend/src/Shared/index.ts.
8. GLOBAL NETWORK RECOVERY HOOK (usePagesGlobalRefresh.ts):
   Every administrative and operational console page must bind to usePagesGlobalRefresh to automatically
   resynchronize live data upon network online recovery and browser tab visibility focus.
9. DUAL COMPILATION QUALITY GATE:
   Both the .NET 10 backend (dotnet build) and the React 19 frontend (npm run build) must compile
   with exactly 0 errors and 0 warnings.
====================================================================================================
```

---

# 1. EXHAUSTIVE SPECIFICATION OF USER IDEAS & ADMIN PANEL STATICS PURGE

### 1.1 Categories Module Overhaul (`Categories.tsx`)
- **Target File:** [`Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Categories.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Categories.tsx)
- **Identified Violations & Deficiencies:**
  1. *Hardcoded External Stock Photo:* Line 678 renders `https://images.unsplash.com/photo-1541963463532-d68292c34b19...` in the inspector drawer. In an empty catalog, this presents fake library imagery instead of real repository bay state.
  2. *Raw HTML Search Input:* Line 438 uses `<input id="categorySearchInput">` instead of the `@/Shared` `SearchBar` component.
  3. *Missing Global Debouncing:* Does not consume `useDebounce` hook, causing instantaneous re-filtering on every key stroke.
  4. *Ad-Hoc Export Popup:* Lines 293–322 use an inline toggle menu with raw button markup instead of `@/Shared` `Dropdown`.
  5. *Hardcoded Table Pagination:* Lines 628–643 render disabled buttons and a hardcoded page number `1` without real pagination.
  6. *Inlined Raw Modal:* Lines 778–909 use a custom `<div id="addCategoryModal">` with backdrop styles instead of `DefaultFloatingModalCard`.
  7. *Raw HTML Select for Wing Allocation:* Lines 850–858 use `<select>` with hardcoded strings instead of `@/Shared` `Dropdown`.
- **Architectural Solution & Remediation:**
  - Import `@/Shared` primitives: `SearchBar`, `Dropdown`, `DefaultFloatingModalCard`, `Button`.
  - Import `@/Hooks`: `useDebounce`, `usePagination`, `usePagesGlobalRefresh`.
  - Replace raw input with `<SearchBar value={searchQuery} onChange={setSearchQuery} />` wired to `useDebounce(searchQuery, 300)`.
  - Replace export menu with `<Dropdown items={[...]} onSelect={handleExportSelect} />`.
  - Wrap filtered categories in `usePagination(filteredCategories, { initialPageSize: 10, pageSizeOptions: [10, 25, 50, 100] })`.
  - Render dynamic table pagination with previous/next buttons, page indicator (`Page X of Y`), and a rows-per-page `<Dropdown>`.
  - Convert `addCategoryModal` into `<DefaultFloatingModalCard isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Academic Discipline" ...>`.
  - Replace Unsplash stock image in inspector drawer with a clean, dynamic architectural SVG bay graphic displaying real saturation and classification call range.

---

### 1.2 Dashboard Overhaul (`AdminDashboard.tsx`)
- **Target File:** [`Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/AdminDashboard.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/AdminDashboard.tsx)
- **Identified Violations & Deficiencies:**
  1. *Mock Facility Circulation Card:* Lines 942–967 render `"RFID Turnstiles: Active"`, `"Normal Flow"`, and static holdings.
     - *Ideas to prompt.txt instruction (lines 172–184):*
       `REMOVE THIS Facility Circulation Status ... BUT CHANGE IT TO REAL MONITORING status LOGIN LOGOUT automation monitoring (admin user login) show what when it login with timestamps and dd:hh:mm:ss ago its successfully login with methods of 2FA or without 2FA`.
  2. *Missing Search Bar & Filters:* Lacks top-level `@/Shared` `SearchBar` with `useDebounce` and Sort/Status toggle buttons.
  3. *Unconnected "View All" on Pending Holds:* Lines 712–718 link away to `/admin/reservations` instead of opening `DefaultFloatingModalCard` with `usePagination` (10, 25, 50, 100 rows per page via `@/Shared` `Dropdown`).
  4. *Unconnected "All Logs" on Activity Stream:* Lines 888–894 link away to `/admin/audit-logs` instead of opening `DefaultFloatingModalCard` with `usePagination` (10, 25, 50, 100 rows per page via `@/Shared` `Dropdown`).
- **Architectural Solution & Remediation:**
  - Replace "Facility Circulation Status" with **Real Monitoring Login/Logout Automation Stream** fetching live session telemetry from `getAuthMonitorStream()` / `getLoginAuditStream()`.
  - For each login/logout audit entry, display:
    - User identity & role badge (`Admin`, `Cashier`, `Customer`)
    - Action type (`LOGIN` / `LOGOUT`)
    - Exact ISO timestamp formatted in local PHT
    - Relative elapsed age counter: `dd:hh:mm:ss ago` (dynamically ticked)
    - 2FA authentication method badge: `2FA: Authenticator App` vs `Password Only`
    - Node IP & workstation descriptor
  - Add `@/Shared` `SearchBar` at top of dashboard with global `useDebounce` hook.
  - Add interactive Status & Sort buttons ("STATUS" and "SORT") to dynamically filter and order dashboard activity queues.
  - Implement two `<DefaultFloatingModalCard>` dialogs:
    1. **"Urgent Pending Holds Queue -- Complete Ledger"**: Full holds table powered by `usePagination` with rows-per-page selector (10, 25, 50, 100 via `@/Shared` `Dropdown`).
    2. **"Recent Institutional Activity Stream -- Complete Cryptographic Journal"**: Full audit log table powered by `usePagination` with rows-per-page selector (10, 25, 50, 100 via `@/Shared` `Dropdown`).

---

### 1.3 Books Manager (`BooksManager.tsx`)
- **Target File:** [`Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/BooksManager.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/BooksManager.tsx)
- **Identified Violations:**
  - Lines 233–234: `manageCopiesCount: 4`, `manageBayLocation: 'Bay 14 · Shelf 3B'`.
  - Lines 1104, 1271, 1454, 1916: Unsplash image fallbacks (`https://images.unsplash.com/photo-1544947950-fa07a98d237f...`).
  - Lines 1364–1374: Raw HTML `<select>` for pagination rows per page.
- **Remediation:**
  - Initialize copy counts to `1` and bay strings to empty `''`.
  - Replace Unsplash fallback URLs with an elegant SVG book placeholder component.
  - Replace raw HTML `<select>` with `@/Shared` `Dropdown`.

---

### 1.4 Inventory (`Inventory.tsx`)
- **Target File:** [`Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Inventory.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Inventory.tsx)
- **Identified Violations:**
  - Line 58: Hardcoded `allocatedBudget = 55000`.
  - Lines 132–134: Default form states `ingestTitle: 'Clean Code: Handbook of Agile'`, `ingestDewey: '005.133 MAR'`, `ingestBay: 'Bay 14, Shelf 3B'`.
  - Lines 140–141: `exportStartDate: '2026-01-01'`, `exportEndDate: '2026-02-25'`.
  - Line 151: `editCopiesBay: 'Bay 14, Shelf 3B'`.
- **Remediation:**
  - Set `allocatedBudget` to `0` or calculate dynamically from acquisition ledger.
  - Clear all ingestion/edit defaults to empty strings `''`.
  - Set export dates dynamically to current month bounds or empty strings.

---

### 1.5 Returns & Assessments (`Returns.tsx`)
- **Target File:** [`Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Returns.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Returns.tsx)
- **Identified Violations:**
  - Lines 88–92: Hardcoded defaults for bindery technician (`'Campus Bindery Bay 01'`), estimated days (`'3-5 Workdays'`), replacement vendor (`'National Book Store Academic'`), price (`1250.0`), and deaccession reason.
- **Remediation:**
  - Clear hardcoded form initializers to empty strings / `0`; populate dynamically from the selected damaged item.

---

### 1.6 Administrator Profile (`Profile.tsx`)
- **Target File:** [`Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Profile.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Profile.tsx)
- **Identified Violations:**
  - Lines 110–131: Static markup strings for ID (`'KP-ADM-0001'`), title, role (`'University Chief Curator & Systems Director'`), email (`'super.admin@upk.edu.ph'`), phone, room, and duty schedule.
  - Line 151: `'Rotated 42 days ago'`.
  - Lines 164–165: Hardcoded FIDO2 token text.
  - Lines 189–216: Static mock active sessions with hardcoded IP `'192.168.1.100'` and `'192.168.10.42'`.
- **Remediation:**
  - Dynamically read `currentUser` properties (`username`, `email`, `role`, `fullName`, `profilePictureUrl`).
  - Fall back to clean unconfigured dashes (`—`) when fields are unpopulated.
  - Bind active sessions to live audit telemetry from `getLoginAuditStream()` rather than hardcoded mock sessions.

---

### 1.7 Users, Analytics, Roles & Permissions, Audit Logs
- **Target Files:**
  - `UserManagement.tsx` (lines 281–282: clean `2026-01-01` to dynamic ISO/empty strings).
  - `Analytics.tsx` (lines 91, 134–135: clean static date strings).
  - `RolesPermissions.tsx` (line 118: clean static date strings).
  - `AuditLogs.tsx` (lines 87–88: clean static date strings).

---

# 2. IMPLEMENTATION WORKFLOW & EXECUTION STEPS

### Step 1: Overhaul `Categories.tsx`
1. Replace raw search input with `@/Shared` `SearchBar` wrapped with `useDebounce`.
2. Replace ad-hoc export dropdown with `@/Shared` `Dropdown`.
3. Integrate `usePagination` hook to manage table pages and rows-per-page (10, 25, 50, 100 via `@/Shared` `Dropdown`).
4. Replace raw HTML `<select>` for Wing selection with `@/Shared` `Dropdown`.
5. Convert `addCategoryModal` into `<DefaultFloatingModalCard>`.
6. Remove Unsplash stock image in inspector drawer and render dynamic SVG bay graphic.

### Step 2: Overhaul `AdminDashboard.tsx`
1. Replace "Facility Circulation Status" card with **Real Monitoring Login/Logout Automation Stream**.
2. Incorporate `@/Shared` `SearchBar` with global `useDebounce` hook at top of dashboard.
3. Add Sort and Status filter buttons ("STATUS" and "SORT").
4. Implement `DefaultFloatingModalCard` for "View All Pending Holds" with `usePagination` and `@/Shared` `Dropdown`.
5. Implement `DefaultFloatingModalCard` for "All Activity Logs" with `usePagination` and `@/Shared` `Dropdown`.

### Step 3: Cleanse Statics in Remaining Admin Modules
1. Cleanse `BooksManager.tsx` (initial copy count, bay, unsplash fallbacks, raw `<select>`).
2. Cleanse `Inventory.tsx` (clean code title, dewey, bay, budget, dates).
3. Cleanse `Returns.tsx` (bindery technician, vendor, price, reason).
4. Cleanse `Profile.tsx` (bind to `currentUser`, remove hardcoded contact info and mock sessions).
5. Cleanse `UserManagement.tsx`, `Analytics.tsx`, `RolesPermissions.tsx`, `AuditLogs.tsx` (date bounds).

### Step 4: Verification & Quality Assurance
1. Run `npm run build` in `Frontend` (must compile with 0 errors).
2. Run `dotnet build` in `Backend` (must compile with 0 errors).
3. Test empty database state ($N=0$) to ensure zero mock fallbacks appear.
