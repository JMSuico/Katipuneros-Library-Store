# COMPREHENSIVE AUDIT OF STATIC VALUES & HARDCODED MOCKS IN ADMIN PANEL MODULES
**Katipuneros Library Store -- Admin Operations & Governance Console**
**Audit Date:** October 2026
**Contract Reference:** `AGENTS.md`, `SKILL.md`, `CRUD_BACKEND_MAPPING.md`, `ADMIN DATA SHOW FORMULA.md`, `Ideas to prompt.txt`

---

## EXECUTIVE SUMMARY
This audit provides an exhaustive, line-by-line inspection across all 15 Admin Panel modules to detect:
1. Hardcoded mock strings, fake records, external stock imagery, and seed numbers that display even when the underlying database is empty ($N=0$).
2. Ad-hoc UI controls (raw `<input>`, raw `<select>`, inlined modals) violating the mandated `@/Shared` design primitives (`SearchBar`, `Dropdown`, `DefaultFloatingModalCard`, `Button`).
3. Missing global hooks (`useDebounce`, `usePagination`, `usePagesGlobalRefresh`) where contractually mandated by `Ideas to prompt.txt`.
4. Specific architectural discrepancies against `Ideas to prompt.txt` (notably in `AdminDashboard.tsx` and `Categories.tsx`).

---

## MODULE-BY-MODULE AUDIT & REMEDIATION MATRIX

### 1. Dashboard (`AdminDashboard.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/dashboard`
- **File:** [`Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/AdminDashboard.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/AdminDashboard.tsx)
- **Violations Identified:**
  1. **Lines 942–967 ("Facility Circulation Status" card):** Displays hardcoded strings `"RFID Turnstiles: Active"`, `"Normal Flow"`, `"Katipunan Campus Main Reading Hall"`, and static holding references.
     - *Violation against `Ideas to prompt.txt` (lines 172–184):* Explicitly commands:
       `REMOVE THIS Facility Circulation Status ... BUT CHANGE IT TO REAL MONITORING status LOGIN LOGOUT automation monitoring (admin user login) show what when it login with timestamps and dd:hh:mm:ss ago its successfully login with methods of 2FA or without 2FA`.
  2. **Lines 378–430 (Missing Shared Search Bar & Filters):** The dashboard lacks the universal `@/Shared` `SearchBar` with debouncing (`useDebounce`) and "STATUS" / "SORT" filter controls specified in `Ideas to prompt.txt` (lines 12–25).
  3. **Lines 712–718 ("View All" Pending Holds Queue):** The button is an ordinary link `<Link to="/admin/reservations">` rather than opening a `DefaultFloatingModalCard` displaying the complete holds list with `usePagination` (10, 25, 50, 100 rows per page via `@/Shared` `Dropdown`) as mandated in `Ideas to prompt.txt` (lines 149–152).
  4. **Lines 888–894 ("All Logs" Recent Activity Stream):** The button is an ordinary link `<Link to="/admin/audit-logs">` rather than opening a `DefaultFloatingModalCard` displaying the complete audit journal with `usePagination` (10, 25, 50, 100 rows per page via `@/Shared` `Dropdown`) as mandated in `Ideas to prompt.txt` (lines 166–169).
- **Remediation:**
  - Replace the entire "Facility Circulation Status" widget with a live **Authenticated Terminal Login/Logout Stream** wired directly to `getAuthMonitorStream()` / `getLoginAuditStream()`. Compute dynamic relative age elapsed strings (`dd:hh:mm:ss ago`) and render 2FA authentication badges (`2FA: Authenticator App` vs `Password Only`).
  - Introduce `@/Shared` `SearchBar` with `useDebounce` hook at top of dashboard, accompanied by Sort & Status filter toggles.
  - Implement two interactive floating modals (`DefaultFloatingModalCard`) for "View All Pending Holds" and "All Activity Logs", each powered by `usePagination` with rows-per-page options (10, 25, 50, 100) controlled by `@/Shared` `Dropdown`.

---

### 2. Categories (`Categories.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/categories`
- **File:** [`Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Categories.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Categories.tsx)
- **Violations Identified:**
  1. **Line 678 (Hardcoded Stock Image):** Uses external stock photograph `https://images.unsplash.com/photo-1541963463532-d68292c34b19...` in the inspector drawer. In an empty database or fresh system, this causes visual hallucination instead of reflecting real repository bay state.
  2. **Lines 438–445 (Raw Search Input):** Uses an ad-hoc `<input id="categorySearchInput">` instead of the global `@/Shared` `SearchBar`.
  3. **Lines 438–445 (Missing Debouncing):** Does not consume `useDebounce` hook, causing instantaneous re-renders on every keystroke.
  4. **Lines 293–322 (Ad-Hoc HTML Dropdown):** Uses an inlined manual toggle menu for "Export Schema" instead of the `@/Shared` `Dropdown` component.
  5. **Lines 628–643 (Hardcoded Table Pagination):** Renders static disabled buttons (`disabled={true}`) and a hardcoded page number `1`, rather than utilizing the `usePagination` hook and `@/Shared` `Dropdown` for rows-per-page.
  6. **Lines 778–909 (Inlined Modal Markup):** Uses raw fixed-position div `<div id="addCategoryModal">` with hand-rolled backdrops instead of `DefaultFloatingModalCard`.
  7. **Lines 850–858 (Hardcoded Wing Selection):** Uses a raw HTML `<select>` with hardcoded strings (`"Wing A (Main Hall)"`, `"Wing B (STEM & Tech)"`, `"Wing C (Filipiniana)"`) instead of `@/Shared` `Dropdown`.
- **Remediation:**
  - Remove external Unsplash stock image; replace with a clean dynamic SVG architectural bay / stack visualizer reflecting real classified titles and saturation.
  - Refactor search to use `@/Shared` `SearchBar` coupled with `useDebounce`.
  - Replace inlined export popup with `@/Shared` `Dropdown`.
  - Wire full client pagination using `usePagination` hook, complete with rows-per-page selector (10, 25, 50, 100) using `@/Shared` `Dropdown`.
  - Convert `addCategoryModal` to `DefaultFloatingModalCard`.
  - Convert Wing selector to `@/Shared` `Dropdown`.

---

### 3. Books Manager (`BooksManager.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/books`
- **File:** [`Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/BooksManager.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/BooksManager.tsx)
- **Violations Identified:**
  1. **Lines 233–234 (Hardcoded Default Copy State):** Initial state has hardcoded defaults: `manageCopiesCount: 4`, `manageBayLocation: 'Bay 14 · Shelf 3B'`.
  2. **Lines 1104, 1271, 1454, 1916 (Unsplash Image Fallbacks):** Uses hardcoded Unsplash fallback URLs (`https://images.unsplash.com/photo-1544947950-fa07a98d237f...`) when cover image is null or empty.
  3. **Lines 1364–1374 (Raw HTML Select for Pagination):** Table rows-per-page selector uses a native `<select>` element instead of the `@/Shared` `Dropdown` component.
- **Remediation:**
  - Initialize `manageCopiesCount` to `1` (or current book count) and `manageBayLocation` to empty string `''`.
  - Replace Unsplash fallback URLs with an inline SVG placeholder or clean SVG book cover glyph.
  - Replace raw HTML `<select>` with `@/Shared` `Dropdown` for table page size.

---

### 4. Inventory (`Inventory.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/inventory`
- **File:** [`Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Inventory.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Inventory.tsx)
- **Violations Identified:**
  1. **Line 58 (Hardcoded Allocated Budget):** Const `allocatedBudget = 55000` is hardcoded instead of derived dynamically or defaulting to ₱0.00 when unconfigured.
  2. **Lines 132–134 (Hardcoded Ingestion Modal Defaults):** Default form states pre-populate with:
     - `ingestTitle: 'Clean Code: Handbook of Agile'`
     - `ingestDewey: '005.133 MAR'`
     - `ingestBay: 'Bay 14, Shelf 3B'`
  3. **Lines 140–141 (Hardcoded Export Date Bounds):**
     - `exportStartDate: '2026-01-01'`
     - `exportEndDate: '2026-02-25'`
  4. **Line 151 (Hardcoded Edit Copy Bay Location):**
     - `editCopiesBay: 'Bay 14, Shelf 3B'`
- **Remediation:**
  - Derive `allocatedBudget` from real replacement/procurement ledger or initialize to `0`.
  - Clean all ingestion and edit form initial states to empty strings `''`.
  - Initialize export date bounds to dynamic current month bounds (e.g., `new Date().toISOString().slice(0, 10)`) or empty strings.

---

### 5. Returns & Assessments (`Returns.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/returns`
- **File:** [`Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Returns.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Returns.tsx)
- **Violations Identified:**
  1. **Lines 88–92 (Hardcoded Bindery & Replacement Modal Defaults):**
     - `binderyTechnician: 'Campus Bindery Bay 01'`
     - `binderyEstDays: '3-5 Workdays'`
     - `replacementVendor: 'National Book Store Academic'`
     - `replacementPrice: 1250.0`
     - `deaccessionReason: 'Irreparable spine detachment & severe water warp beyond salvage.'`
- **Remediation:**
  - Clear hardcoded sample strings to empty strings or populate dynamically from the selected damage case.
  - Set `replacementPrice` to `0` by default until entered by curator.

---

### 6. Admin Profile (`Profile.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/profile`
- **File:** [`Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Profile.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Profile.tsx)
- **Violations Identified:**
  1. **Lines 110–131 (Hardcoded Identity Badges):** Hardcoded strings in markup:
     - Badge: `'KP-ADM-0001'`
     - Title: `'Administrator (Super Admin)'`
     - Role: `'University Chief Curator & Systems Director'`
     - Email: `'super.admin@upk.edu.ph'`
     - Phone: `'+63 (2) 8981-8500 ext. 4201'`
     - Office: `'Room 304, Katipuneros Hall'`
     - Schedule: `'08:00 - 17:00 PHT (Morning Stacks)'`
  2. **Line 151 (Hardcoded Password Rotation):** Static string `'Rotated 42 days ago'`.
  3. **Lines 164–165 (Hardcoded 2FA Hardware):** Static text `'FIDO2 Hardware Key'` and `'YubiKey 5C NFC + Katipuneros Authenticator App'`.
  4. **Lines 189–216 (Hardcoded Active Sessions):** Static mock network sessions with hardcoded IP `'192.168.1.100'` and `'192.168.10.42'`, Chrome macOS Sonoma, Firefox ESR, etc.
- **Remediation:**
  - Bind identity fields directly to `currentUser` (`currentUser?.username`, `currentUser?.email`, `currentUser?.role`).
  - Fall back to clean unconfigured indicators (`—` or `Not Configured`) when fields are unpopulated.
  - Bind active sessions to real login audit records from `getLoginAuditStream()` rather than hardcoded mock sessions.

---

### 7. Users Management (`UserManagement.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/users`
- **File:** [`Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/UserManagement.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/UserManagement.tsx)
- **Violations Identified:**
  1. **Lines 281–282 (Hardcoded Export Date Range):**
     - `exportStartDate: '2026-01-01'`
     - `exportEndDate: '2026-02-25'`
- **Remediation:**
  - Initialize export dates to empty strings or dynamic current ISO dates.

---

### 8. Analytics (`Analytics.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/analytics`
- **File:** [`Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Analytics.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Analytics.tsx)
- **Violations Identified:**
  1. **Line 91 (Hardcoded Date Range Label):**
     - `selectedDateRange: 'Oct 01 – Oct 31, 2026'`
  2. **Lines 134–135 (Hardcoded Export Date Bounds):**
     - `exportStartDate: '2026-01-01'`
     - `exportEndDate: '2026-02-25'`
- **Remediation:**
  - Calculate `selectedDateRange` dynamically based on active granularity (`7D`, `30D`, `90D`, `1Y`).
  - Initialize export date bounds to empty strings or dynamic ISO dates.

---

### 9. Roles & Permissions (`RolesPermissions.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/roles`
- **File:** [`Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/RolesPermissions.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/RolesPermissions.tsx)
- **Violations Identified:**
  1. **Line 118 (Hardcoded Export Date Range):**
     - `exportDateRange: '2026-01-01 to 2026-02-25'`
- **Remediation:**
  - Initialize `exportDateRange` dynamically based on current date.

---

### 10. Audit Logs (`AuditLogs.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/audit-logs`
- **File:** [`Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/AuditLogs.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/AuditLogs.tsx)
- **Violations Identified:**
  1. **Lines 87–88 (Hardcoded Export Date Bounds):**
     - `exportDateStart: '2026-01-01'`
     - `exportDateEnd: '2026-02-25'`
- **Remediation:**
  - Initialize export date bounds to empty strings or dynamic ISO dates.

---

### 11. Reservations (`Reservations.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/reservations`
- **File:** [`Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Reservations.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Reservations.tsx)
- **Violations Identified:**
  1. **Line 87 (Hardcoded Locker / Pickup Bay Default):**
     - `batchLockerBay: 'Bay 01 Counter'`
- **Remediation:**
  - Set default batch bay location to `'Counter Pickup Staging'` or pull dynamically from configured campus pickup points.

---

### 12. Borrowings (`Borrowings.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/borrowings`
- **File:** [`Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Borrowings.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Borrowings.tsx)
- **Violations Identified:**
  1. **Line 58 (Hardcoded Override Interval):**
     - `overrideInterval: 'Standard +7 Days Academic Grace'`
- **Remediation:**
  - Set override interval to default to dynamic policy period or clean selection.

---

### 13. Reports (`Reports.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/reports`
- **File:** [`Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Reports.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Reports.tsx)
- **Status:** Verified clean; already consumes Shared Chart suite and dynamic ledger suites. Date range inputs are initialized to empty strings `''`.

---

### 14. Notifications (`Notifications.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/notifications`
- **File:** [`Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Notifications.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Notifications.tsx)
- **Status:** Verified clean; all queues, templates, and metrics are loaded via `Promise.all` from `.NET 10` API endpoints. Form fields initialize to empty or standard draft defaults.

---

### 15. Settings (`Settings.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/settings`
- **File:** [`Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Settings.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Settings.tsx)
- **Status:** Verified clean; fully bound to backend `settingsApi.ts` endpoints with interactive steppers, zero alert/confirm, and reactive toasts.

---

## REMEDIATION EXECUTION PLAN
1. **`AdminDashboard.tsx`:**
   - Remove "Facility Circulation Status" card and replace with **Real Monitoring Login/Logout Automation Stream** with live session timestamps, relative age elapsed counters (`dd:hh:mm:ss ago`), and 2FA authentication method badges.
   - Embed `@/Shared` `SearchBar` with global `useDebounce` hook at the top.
   - Wire dynamic Sort and Status filter buttons ("STATUS" and "SORT").
   - Wire "View All" on Pending Holds to open a `DefaultFloatingModalCard` with `usePagination` (10, 25, 50, 100 rows via `@/Shared` `Dropdown`).
   - Wire "All Logs" on Activity Stream to open a `DefaultFloatingModalCard` with `usePagination` (10, 25, 50, 100 rows via `@/Shared` `Dropdown`).
2. **`Categories.tsx`:**
   - Eradicate hardcoded Unsplash image; replace with clean SVG stack bay visualization.
   - Refactor search to use `@/Shared` `SearchBar` with `useDebounce`.
   - Replace inlined export popup with `@/Shared` `Dropdown`.
   - Implement `usePagination` with `@/Shared` `Dropdown` (10, 25, 50, 100 rows per page).
   - Convert `addCategoryModal` to `DefaultFloatingModalCard`.
   - Convert Wing selector to `@/Shared` `Dropdown`.
3. **`BooksManager.tsx` & `Inventory.tsx`:**
   - Purge hardcoded initial copy counts, hardcoded book titles, bays, and date strings.
   - Replace raw HTML `<select>` with `@/Shared` `Dropdown`.
4. **`Profile.tsx` & `Returns.tsx`:**
   - Bind profile fields dynamically to authenticated session and remove fake email, phone, room, and session IPs.
   - Clear hardcoded damage/bindery form initializers.
5. **Compilation Verification:**
   - Run `tsc -b && vite build` and `dotnet build` to ensure 0 errors / 0 warnings.

---

# MASTER INVENTORY: FRONTEND UI TO BACKEND DATABASE CONNECTIVITY
## (ADMIN PANEL ONLY -- COMPLETE CRUD, READ/VIEW & SHOW DATA MATRIX)

> **Architectural Standard:** All actions adhere strictly to the 6-Tier Clean Architecture:
> `React 19 View / UI Trigger` ──> `Typed Endpoint Stub (Frontend/src/Endpoints/)` ──> `ASP.NET Core Web API Controller` ──> `Domain Service Interface & Implementation` ──> `EF Core 10 Repository` ──> `Database Engine (SQL Server / AppDbContext)`

---

## 1. Executive Dashboard (`AdminDashboard.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/dashboard`
- **File:** `Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/AdminDashboard.tsx`

| Category | UI Element / Trigger | Action Description | Target Endpoint | HTTP Method | Target Database Table & Entity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SHOW / READ / VIEW** | **Executive Bento Metric Cards** (8 Cards) | Displays Total Physical Copies, Shelf Availability %, Active Borrowings, Pending Holds Queue, Maintenance Volumes, Total Patrons, Active Loans Due, and Unsettled Fines | `GET /api/admin/metrics`<br>`GET /api/borrow/metrics`<br>`GET /api/reservations/metrics`<br>`GET /api/returns/metrics` | `GET` | `Books`, `Circulations`, `Reservations`, `Users`, `ReturnRecords` |
| **SHOW / READ / VIEW** | **Velocity Trajectory Chart** (`AreaSplineChart`) | Renders multi-series loan vs return checkout trajectory over selectable intervals (`7D`, `30D`, `90D`, `1Y`) | `GET /api/admin/analytics/velocity?range={timeframe}` | `GET` | `Circulations`, `ReturnRecords` |
| **SHOW / READ / VIEW** | **Catalog Allocation Chart** (`PieGraphChart`) | Donut visualization showing physical copy breakdown across On-Shelf, Borrowed, Reserved, and Maintenance | `GET /api/books/catalog` | `GET` | `Books` (`TotalCopies`, `AvailableCopies`, `Status`) |
| **SHOW / READ / VIEW** | **Pending Holds Queue Table** | Preview table showing top 5 pending patron holds with patron name, book title, queue position, and priority | `GET /api/reservations?status=pending` | `GET` | `Reservations` (JOIN `Users`, `Books`) |
| **SHOW / READ / VIEW** | **Recent Activity Stream Table** | Preview table showing latest 5 institutional audit entries with action, user, module scope, and time ago | `GET /api/admin/audit-logs?pageSize=100` | `GET` | `AuditLogs` |
| **SHOW / READ / VIEW** | **2FA Terminal Login/Logout Stream** | Live terminal automation stream displaying active staff logins, relative time (`dd:hh:mm:ss ago`), IP, and 2FA badges | `GET /api/admin/roles/login-audits` | `GET` | `UserLogins`, `AuditLogs` |
| **SHOW / READ / VIEW** | **"View All" Pending Holds Modal** (`DefaultFloatingModalCard`) | Opens paginated floating modal (10, 25, 50, 100 per page via `@/Shared` `Dropdown`) for the entire pending holds roster | `GET /api/reservations?status=pending` | `GET` | `Reservations` |
| **SHOW / READ / VIEW** | **"All Logs" Activity Stream Modal** (`DefaultFloatingModalCard`) | Opens paginated floating modal (10, 25, 50, 100 per page via `@/Shared` `Dropdown`) for the entire system audit journal | `GET /api/admin/audit-logs?pageSize=100` | `GET` | `AuditLogs` |
| **SHOW / READ / VIEW** | **Global Dashboard Search Bar** (`@/Shared/SearchBar`) | Live debounced search across holds, audit events, catalog titles, and patrons | Client filtering + API search query | `GET` | `Reservations`, `AuditLogs`, `Books`, `Users` |
| **SHOW / READ / VIEW** | **Status & Sort Filter Dropdowns** (`@/Shared/Dropdown`) | Filters preview queues by status (`All`, `Pending`, `Overdue`, `Active`) and sort order (`Newest`, `Oldest`, `A-Z`) | Client state + Endpoint query parameters | `GET` | In-memory & DB query parameters |
| **ADD / CREATE** | **"+ Add User" Quick Action Button** | Quick navigates / opens modal to register new academic patron, cashier, or admin account | `POST /api/admin/users` | `POST` | `Users` |
| **ADD / CREATE** | **"+ Add Book" Quick Action Button** | Quick navigates / opens modal to catalog a new monograph title into the central collection | `POST /api/books` | `POST` | `Books` |
| **ADD / CREATE** | **"Generate Audit Report" Button** | Compiles and triggers official PDF/CSV audit summary dossier download | `POST /api/admin/reports/generate` | `POST` | `ReportDossiers`, `AuditLogs` |
| **EDIT / UPDATE** | **Hold Triage Action** (from Holds Modal) | Approve or Stage a hold into a smart locker bay directly from dashboard modal | `PUT /api/reservations/{id}/triage` | `PUT` | `Reservations` (`Status`, `LockerBay`, `LockerPin`) |
| **DELETE / REMOVE** | **Cancel Hold Action** (from Holds Modal) | Rejects or cancels a pending reservation hold directly from dashboard modal | `DELETE /api/reservations/{id}` | `DELETE` | `Reservations` |

---

## 2. User Management & Patron Governance (`UserManagement.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/users`
- **File:** `Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/UserManagement.tsx`

| Category | UI Element / Trigger | Action Description | Target Endpoint | HTTP Method | Target Database Table & Entity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SHOW / READ / VIEW** | **User Directory Table & Card View** | Displays User Full Name, Email, Role (`Customer`, `Cashier`, `Admin`), Status (`Active`, `Suspended`, `Pending`), Library Card #, Department, Joined Date, Loans/Fines | `GET /api/admin/users` | `GET` | `Users` (JOIN `Roles`, `Circulations`, `ReturnRecords`) |
| **SHOW / READ / VIEW** | **View Patron Details Modal** (`isViewModalOpen`) | Inspects full user profile, active loans count, hold queue history, accumulated fines, RFID tag, and login timestamps | `GET /api/admin/users/{id}` | `GET` | `Users`, `Circulations`, `Reservations` |
| **SHOW / READ / VIEW** | **Search Bar & Role Tabs** | Debounced search across Name, Email, Card #, Department; Scope tabs (`All`, `Customer`, `Cashier`, `Admin`) and State tabs (`All`, `Active`, `Inactive`, `Suspended`) | `GET /api/admin/users?query={search}&role={role}&status={status}` | `GET` | `Users` |
| **SHOW / READ / VIEW** | **Pagination & Drag-to-Scroll** | Navigates through user pages with selectable page size (`10`, `25`, `50`, `100` per page) | Client pagination / Backend Paged query | `GET` | `Users` |
| **ADD / CREATE** | **"+ Add User" Button & Modal** (`isAddModalOpen`) | Form: Full Name, Email, Username, Password, Role, Department, Library Card #, Initial Status | `POST /api/admin/users` | `POST` | `Users`, `UserCredentials`, `UserRoles` |
| **ADD / CREATE** | **Export Users Modal** (`isExportModalOpen`) | Form: Date Range, Alphabetical Filter, ID Prefix, Format (`CSV` / `XLSX`) -> Generates and streams spreadsheet | `GET /api/admin/users/export?startDate={s}&endDate={e}&format={f}` | `GET` | `Users` |
| **EDIT / UPDATE** | **Edit User Modal** (`isEditModalOpen`) | Form: Modify Full Name, Email, Department, Library Card #, Role, and Active Flag | `PUT /api/admin/users/{id}` | `PUT` | `Users` |
| **EDIT / UPDATE** | **Suspend / Activate User Modal** (`isSuspendModalOpen`) | Toggles user status between `Active` and `Suspended`, with suspension rationale note | `PUT /api/admin/users/{id}/toggle-status` | `PUT` | `Users` (`Status`, `IsActive`, `SuspensionReason`) |
| **DELETE / REMOVE** | **Single User Soft-Delete** | Soft-deletes user account, archives borrowing history, and frees library card number | `DELETE /api/admin/users/{id}` | `DELETE` | `Users` (`IsDeleted`, `DeletedAt`) |
| **DELETE / REMOVE** | **Bulk Delete Users Modal** (`isBulkDeleteModalOpen`) | Batch soft-deletes all selected patron/staff IDs from table checkbox selection | `POST /api/admin/users/bulk-delete` | `POST` | `Users` |

---

## 3. Books Catalog Manager (`BooksManager.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/books`
- **File:** `Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/BooksManager.tsx`

| Category | UI Element / Trigger | Action Description | Target Endpoint | HTTP Method | Target Database Table & Entity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SHOW / READ / VIEW** | **Catalog KPI Bento Cards** | Displays Total Catalog Titles, On Shelf Available, Active Circulation, Reserved Holds, Maintenance/Bindery | `GET /api/books/metrics` | `GET` | `Books`, `Circulations`, `Reservations` |
| **SHOW / READ / VIEW** | **Books Catalog Master Table** | Displays Title, Author, ISBN, Dewey Code, Category, Bay Location, Total Copies, Available Copies, Status Badge | `GET /api/books/catalog` | `GET` | `Books` (JOIN `Categories`) |
| **SHOW / READ / VIEW** | **Book Inspector Drawer / Panel** | Shows high-res cover, Synopsis, Publisher, Year, RFID Tag, Loan History, and Physical Copy Locations | `GET /api/books/{id}` | `GET` | `Books`, `PhysicalCopies`, `Categories` |
| **SHOW / READ / VIEW** | **SearchBar & Category Filter Pills** | Instant debounced catalog search; filters by Dewey Category pills (`STEM`, `Filipiniana`, `History`, etc.) | `GET /api/books/search?q={query}&category={catId}` | `GET` | `Books` |
| **ADD / CREATE** | **"+ Add New Book" Modal** (`isAddModalOpen`) | Form: Title, Author, ISBN, Dewey Decimal, Category Dropdown, Published Year, Total Copies, Shelf Bay, Synopsis, RFID Tag | `POST /api/books` | `POST` | `Books`, `PhysicalCopies` |
| **ADD / CREATE** | **"Batch ISBN Import" Modal** (`isBatchModalOpen`) | Bulk textarea input for comma/newline-separated ISBNs; auto-fetches MARC/OCLC metadata and ingests into database | `POST /api/books/batch-import` | `POST` | `Books`, `PhysicalCopies` |
| **ADD / CREATE** | **Export MARC 21 / CSV Modal** (`isExportModalOpen`) | Filters by Date, Title range, ID range -> Downloads MARC 21, CSV, or Excel catalog records | `GET /api/books/export?format={format}` | `GET` | `Books` |
| **EDIT / UPDATE** | **Edit Book Metadata Modal** (`isEditModalOpen`) | Form: Updates Title, Author, ISBN, Dewey Code, Category, Published Year, Description, Bay Location | `PUT /api/books/{id}` | `PUT` | `Books` |
| **EDIT / UPDATE** | **Manage Physical Copies Dialog** (`isManageCopiesModalOpen`) | Adjusts total copy count, allocates physical copies to specific campus shelf bays, updates copy condition | `PUT /api/books/{id}/copies` | `PUT` | `Books`, `PhysicalCopies` |
| **DELETE / REMOVE** | **De-accession / Archive Book Modal** | Confirms permanent removal or archiving of title from circulation (guards against titles with active loans) | `DELETE /api/books/{id}` | `DELETE` | `Books` (`IsArchived`, `Status = 'Deaccessioned'`) |
| **DELETE / REMOVE** | **Bulk De-accession Action** | Batch archives selected book titles from catalog checkbox selection | `POST /api/books/bulk-delete` | `POST` | `Books` |

---

## 4. Classification & Categories (`Categories.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/categories`
- **File:** `Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Categories.tsx`

| Category | UI Element / Trigger | Action Description | Target Endpoint | HTTP Method | Target Database Table & Entity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SHOW / READ / VIEW** | **Classification Metrics Strip** | Displays Total Disciplines, Indexed Titles, Physical Holdings, Classification Standard (`DDC 23 & LoC`), Concordance % | `GET /api/categories`<br>`GET /api/books/catalog` | `GET` | `Categories`, `Books` |
| **SHOW / READ / VIEW** | **Dewey Categories Master Table** | Displays Dewey Code Range (`000-099`, `500-599`), Discipline Name, Floor Wing, Shelf Bay Coordinates, Title Count, Copy Count | `GET /api/categories` | `GET` | `Categories` (LEFT JOIN `Books`) |
| **SHOW / READ / VIEW** | **Stacks & Bay Architectural Visualizer** | Interactive dynamic SVG blueprint of campus library bays showing shelf capacity, occupancy %, and category mapping | Computed from `Categories` & `Books` | `GET` | `Categories`, `Books` |
| **SHOW / READ / VIEW** | **Category Search & Pagination** | Debounced search across discipline name and Dewey number; page size options (`10`, `25`, `50`, `100` via Dropdown) | Client pagination & filtering | `GET` | `Categories` |
| **ADD / CREATE** | **"+ Add Category" Modal** (`DefaultFloatingModalCard`) | Form: Dewey Number Range, Category Name, Campus Wing (`Dropdown`), Shelf Bay Coordinates, Sub-Field Keywords | `POST /api/categories` | `POST` | `Categories` |
| **ADD / CREATE** | **Export Schema Dropdown Action** | Generates and exports Dewey Classification concordance table as CSV or JSON | `GET /api/categories/export?format={csv\|json}` | `GET` | `Categories` |
| **EDIT / UPDATE** | **Edit Category Modal** (`DefaultFloatingModalCard`) | Form: Modifies Dewey range, Category Name, Wing, Shelf Bay coordinates, keywords | `PUT /api/categories/{id}` | `PUT` | `Categories` |
| **DELETE / REMOVE** | **Delete Category Modal** (`DefaultFloatingModalCard`) | Confirms deletion of category; strictly validates that zero catalog titles are assigned to prevent orphan records | `DELETE /api/categories/{id}` | `DELETE` | `Categories` |

---

## 5. Physical Inventory, RFID & Stacks (`Inventory.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/inventory`
- **File:** `Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Inventory.tsx`

| Category | UI Element / Trigger | Action Description | Target Endpoint | HTTP Method | Target Database Table & Entity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SHOW / READ / VIEW** | **RFID & Stacks Telemetry Bento Cards** | Displays Total Tracked Copies, On Shelf (Available), In Circulation, In Maintenance, Lost/Discrepancy, RFID Health % | `GET /api/admin/inventory/audit` | `GET` | `PhysicalCopies`, `Books` |
| **SHOW / READ / VIEW** | **Replacement & Deprecation Ledger** | Shows Replacement Budget Allocated, Budget Spent, Budget Burn %, Critical Wear Titles count | `GET /api/admin/inventory/replacements` | `GET` | `InventoryReplacements`, `PhysicalCopies` |
| **SHOW / READ / VIEW** | **Inventory Physical Copies Table / Card** | Displays Barcode, RFID Tag ID, Book Title, Dewey Code, Shelf Bay, Physical Condition (`Mint`, `Wear`, `Damaged`), Status | `GET /api/admin/inventory/items` | `GET` | `PhysicalCopies` (JOIN `Books`) |
| **SHOW / READ / VIEW** | **Copy Details Modal** (`viewDetailsItem`) | Inspects circulation cycle history, last scanned antenna timestamp, bindery notes, and barcode verification | `GET /api/admin/inventory/items/{id}` | `GET` | `PhysicalCopies`, `Circulations` |
| **SHOW / READ / VIEW** | **Barcode Camera Scanner Modal** (`showCameraScannerModal`) | Uses camera feed to scan physical barcode / QR code and jump directly to inventory record | WebRTC / BarcodeDetector API | Local / `GET` | Client sensor / `PhysicalCopies` |
| **ADD / CREATE** | **"Ingest Physical Barcodes" Modal** (`showIngestBarcodesModal`) | Bulk ingestion modal to register new physical barcodes and associate them with existing book titles | `POST /api/admin/inventory/ingest-barcodes` | `POST` | `PhysicalCopies` |
| **ADD / CREATE** | **"Print Shelf Tags" Modal** (`showPrintTagsModal`) | Queues selected items for barcode spine label and shelf tag generation (PDF print sheet) | `POST /api/admin/inventory/print-tags` | `POST` | `SpineLabelQueue` |
| **ADD / CREATE** | **"Create Replacement Order" Modal** (`showReplacementsModal`) | Form: Title, Vendor, Estimated Cost, Wear Severity, Purchase Justification -> Adds item to procurement queue | `POST /api/admin/inventory/replacements` | `POST` | `InventoryReplacements` |
| **ADD / CREATE** | **Export Inventory Modal** (`showExportModal`) | Form: Export by status, wing, date, barcode range -> Downloads CSV or Excel file | `GET /api/admin/inventory/export` | `GET` | `PhysicalCopies` |
| **EDIT / UPDATE** | **"Update Status & Condition" Modal** (`updateStatusItem`) | Form: Updates Status (`Available`, `In Maintenance`, `Lost`), Condition (`Mint`, `Wear`, `Spine Damaged`), and Rationale | `PUT /api/admin/inventory/items/{id}/status` | `PUT` | `PhysicalCopies` (`Status`, `Condition`, `Notes`) |
| **EDIT / UPDATE** | **"Edit Shelf Bay & Copy Allocation" Modal** (`editCopiesItem`) | Re-allocates copy to a different library floor, wing, or shelf bay | `PUT /api/admin/inventory/items/{id}/location` | `PUT` | `PhysicalCopies` (`BayLocation`) |
| **EDIT / UPDATE** | **"Edit Spine Label & Note" Modal** (`labelDescItem`) | Updates custom spine note, call number label, and queues for re-printing | `PUT /api/admin/inventory/items/{id}/label` | `PUT` | `PhysicalCopies` |
| **DELETE / REMOVE** | **De-accession / Discard Physical Copy** (`showBulkDeleteModal`) | Permanently removes lost, irreparably damaged, or weeded physical volume from inventory ledger | `DELETE /api/admin/inventory/items/{id}`<br>`POST /api/admin/inventory/bulk-delete` | `DELETE`<br>`POST` | `PhysicalCopies` |

---

## 6. Master Reservations & Lockers (`Reservations.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/reservations`
- **File:** `Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Reservations.tsx`

| Category | UI Element / Trigger | Action Description | Target Endpoint | HTTP Method | Target Database Table & Entity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SHOW / READ / VIEW** | **Reservation Queue Bento Metrics** | Displays Active Hold Queue, Pending Staff Review, Staged Ready in Lockers, Expired / Unclaimed, Auto-Purge Cadence | `GET /api/reservations/metrics` | `GET` | `Reservations` |
| **SHOW / READ / VIEW** | **Master Reservation Queue Table / Card** | Displays Patron Name, Library Card #, Book Title, Call #, Reservation Date, Expiry Date, Queue Position, Priority, Status | `GET /api/reservations` | `GET` | `Reservations` (JOIN `Users`, `Books`) |
| **SHOW / READ / VIEW** | **View Hold Details Modal** (`isViewModalOpen`) | Inspects patron academic clearance, book copy availability, pickup branch, and locker staging credentials | `GET /api/reservations/{id}` | `GET` | `Reservations` |
| **SHOW / READ / VIEW** | **Smart Locker Matrix Modal** (`isLockerMatrixModalOpen`) | Visual interactive 24-bay locker grid showing occupied bays, vacant bays, staged titles, and countdown timer | `GET /api/reservations/lockers` | `GET` | `LockerBays`, `Reservations` |
| **SHOW / READ / VIEW** | **Locker Hardware Diagnostics Modal** (`isDiagnosticsModalOpen`) | Hardware health status: Smart locker controller status, door sensors, battery backup, firmware version | `GET /api/reservations/lockers/diagnostics` | `GET` | Hardware Telemetry / `SystemSettings` |
| **ADD / CREATE** | **Export Reservation Roster Modal** (`isExportModalOpen`) | Form: Date Range, Status Filter, ID Filter -> Downloads CSV or Excel reservation ledger | `GET /api/reservations/export` | `GET` | `Reservations` |
| **ADD / CREATE** | **Dispatch Patron Notification Modal** (`isNotifyModalOpen`) | Form: Channel (`SMS`, `Email`, `Push`, `All`), Custom Message -> Dispatches immediate pickup/hold alert | `POST /api/reservations/{id}/notify` | `POST` | `NotificationsQueue`, `AuditLogs` |
| **EDIT / UPDATE** | **Approve / Reject Triage Modal** (`isApproveRejectModalOpen`) | Form: Approve hold (assigns locker bay & generates pickup PIN) OR Reject hold with formal rejection reason | `PUT /api/reservations/{id}/triage` | `PUT` | `Reservations` (`Status`, `LockerBay`, `LockerPin`) |
| **EDIT / UPDATE** | **Manual Status Override Modal** (`isUpdateStatusModalOpen`) | Manually overrides reservation status (`Pending`, `StagedInLocker`, `Fulfilled`, `Cancelled`, `Expired`) with notes | `PUT /api/reservations/{id}/status-override` | `PUT` | `Reservations` |
| **EDIT / UPDATE** | **Release Hold for Pickup Modal** (`isReleaseModalOpen`) | Fulfills hold when patron arrives at desk; transitions reservation to completed and opens checkout flow | `PUT /api/reservations/{id}/fulfill` | `PUT` | `Reservations` (`Status = 'Fulfilled'`) |
| **EDIT / UPDATE** | **Adjust Institutional Quotas Modal** (`isAdjustQuotasModalOpen`) | Modifies max concurrent holds for Undergrads (e.g. 2) and Faculty (e.g. 5), toggles secondary triage | `PUT /api/reservations/quotas` | `PUT` | `SystemSettings` |
| **EDIT / UPDATE** | **Batch Hold Clearance Modal** (`isBatchClearanceModalOpen`) | Batch executes: Batch Stage (assigns bays), Batch Cancel, or Batch Release selected holds | `POST /api/reservations/batch-clearance` | `POST` | `Reservations` |
| **DELETE / REMOVE** | **Cancel Reservation Hold** | Cancels a single reservation hold, releases copy back to available shelf inventory, and notifies next patron in queue | `DELETE /api/reservations/{id}` | `DELETE` | `Reservations` (`Status = 'Cancelled'`) |

---

## 7. Circulation Audit & Borrowings (`Borrowings.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/borrowings`
- **File:** `Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Borrowings.tsx`

| Category | UI Element / Trigger | Action Description | Target Endpoint | HTTP Method | Target Database Table & Entity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SHOW / READ / VIEW** | **Circulation Metrics Strip** | Displays Total Active Circulations, Loans Due This Week, Overdue Fines Balance, Delinquent Accounts count | `GET /api/borrow/metrics` | `GET` | `Circulations`, `ReturnRecords` |
| **SHOW / READ / VIEW** | **Master Borrowings Ledger Table / Card** | Displays Loan ID, Patron Identity, Book Title, Call #, Borrow Date, Due Date, Days Remaining / Overdue, Status Badge | `GET /api/borrow/admin-ledger` | `GET` | `Circulations` (JOIN `Users`, `Books`) |
| **SHOW / READ / VIEW** | **Print Circulation Slip Modal** (`isSlipModalOpen`) | Generates printable digital circulation slip / receipt with loan barcodes, due dates, and patron clearance terms | `GET /api/borrow/{id}/slip` | `GET` | `Circulations`, `Users`, `Books` |
| **SHOW / READ / VIEW** | **SearchBar & Filter Tabs** | Debounced search across Patron, Book, Loan ID; Tabs: `All`, `Due Soon`, `Overdue`, `Faculty Scholars` | `GET /api/borrow/admin-ledger?query={q}&status={s}` | `GET` | `Circulations` |
| **ADD / CREATE** | **Fast-Lane Loan Override Modal** | Form: Patron ID, Book Barcode, Academic Grace Interval, Administrative Justification -> Bypasses borrowing caps | `POST /api/borrow/override` | `POST` | `Circulations`, `AuditLogs` |
| **ADD / CREATE** | **Export Loan Ledger Modal** (`isExportModalOpen`) | Form: Date Range, Alphabetical Filter, ID Filter -> Downloads CSV or Excel loan journal | `GET /api/borrow/export` | `GET` | `Circulations` |
| **EDIT / UPDATE** | **Force Loan Renewal Modal** (`isRenewalModalOpen`) | Form: Extends loan due date by N days (e.g. +7, +14, +28 days) with supervisor approval rationale | `POST /api/borrow/{id}/force-renew` | `POST` | `Circulations` (`DueDate`, `RenewalCount`) |
| **EDIT / UPDATE** | **Edit Circulation Policies Modal** (`isPolicyModalOpen`) | Form: Undergrad / Grad / Faculty loan limits and durations; daily fine rate (e.g. ₱15/day) | `PUT /api/admin/settings` | `PUT` | `SystemSettings` |
| **EDIT / UPDATE** | **Batch Loan Operations Modal** (`isBatchModalOpen`) | Batch executes: Batch Renew, Batch Dispatch Overdue Warning, or Batch Mark Returned | `POST /api/borrow/batch-action` | `POST` | `Circulations` |
| **DELETE / REMOVE** | **Void / Terminate Loan Transaction** | Voids an erroneous loan transaction and restores physical copy availability to the stacks | `DELETE /api/borrow/{id}` | `DELETE` | `Circulations`, `Books` |

---

## 8. Returns & Delinquency Journal (`Returns.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/returns`
- **File:** `Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Returns.tsx`

| Category | UI Element / Trigger | Action Description | Target Endpoint | HTTP Method | Target Database Table & Entity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SHOW / READ / VIEW** | **Returns & Delinquency Bento Cards** | Displays Volumes Checked In Today, Intake Capacity %, On-Time Return Rate %, Delinquency Fines, Fine Collection Rate % | `GET /api/returns/metrics` | `GET` | `ReturnRecords`, `Circulations` |
| **SHOW / READ / VIEW** | **Returns Master Journal Table / Card** | Displays Return ID, Loan ID, Book Title, Patron Identity, Return Date, Condition Grade, Assessed Fine, Settlement Status | `GET /api/returns/journal` | `GET` | `ReturnRecords` (JOIN `Circulations`, `Books`, `Users`) |
| **SHOW / READ / VIEW** | **Intake Clearance Receipt Modal** (`isReceiptModalOpen`) | Generates printable digital return receipt with damage assessment grade, return timestamp, and fine clearance status | `GET /api/returns/{id}/receipt` | `GET` | `ReturnRecords` |
| **SHOW / READ / VIEW** | **SearchBar & Condition Filters** | Debounced search across Patron, Book, Barcode; Filters: `All`, `On-Time`, `Late`, `Damaged`, `Waived` | `GET /api/returns/journal?query={q}&status={s}` | `GET` | `ReturnRecords` |
| **ADD / CREATE** | **Bulk Check-In & Returns Intake Modal** (`isBulkIntakeModalOpen`) | Rapid barcode intake scanner queue; processes batch returns, increments on-shelf counts, flags overdue loans | `POST /api/returns/bulk-intake` | `POST` | `ReturnRecords`, `Circulations`, `Books` |
| **ADD / CREATE** | **Send to Bindery & Repair Order Modal** (`isBinderyModalOpen`) | Form: Technician Name, Estimated Turnaround Days, Repair Notes -> Dispatches volume to maintenance | `POST /api/returns/{id}/bindery` | `POST` | `BinderyOrders`, `Books` |
| **ADD / CREATE** | **Create Replacement Procurement Order** (`isReplacementModalOpen`) | Form: Replacement Vendor, Quoted Price, Procurement Justification -> Adds book to replacement queue | `POST /api/returns/{id}/replacement` | `POST` | `InventoryReplacements` |
| **ADD / CREATE** | **Export Returns Journal Modal** (`isExportModalOpen`) | Form: Date Range, Alphabetical Filter, ID Filter -> Downloads CSV or Excel returns audit | `GET /api/returns/export` | `GET` | `ReturnRecords` |
| **EDIT / UPDATE** | **Settle / Waive Fine Status Action** | Settles fine balance (Cash / GCash) or applies an authorized courtesy / weather fine waiver | `PUT /api/returns/{id}/settle-fine`<br>`PUT /api/returns/{id}/waive-fine` | `PUT` | `ReturnRecords` (`FineStatus`, `WaivedReason`) |
| **EDIT / UPDATE** | **Assess Damage & Condition Grade** | Updates book physical condition grade (`Mint`, `Minor Wear`, `Spine Damaged`, `Water Damaged`) and adjusts penalty tariff | `PUT /api/returns/{id}/grade` | `PUT` | `ReturnRecords`, `PhysicalCopies` |
| **DELETE / REMOVE** | **De-accession Damaged Copy Modal** (`isDeaccessionModalOpen`) | Permanently weeds irreparably damaged book copy from library inventory | `DELETE /api/returns/{id}/deaccession` | `DELETE` | `PhysicalCopies`, `Books` |

---

## 9. Circulation Analytics & Velocity (`Analytics.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/analytics`
- **File:** `Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Analytics.tsx`

| Category | UI Element / Trigger | Action Description | Target Endpoint | HTTP Method | Target Database Table & Entity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SHOW / READ / VIEW** | **Executive Summary Metrics Strip** | Displays Total Circulations, Circulation Velocity, Peak Hourly Turnout, Shelf Saturation Index, Anomaly Rate % | `GET /api/admin/analytics/trends` | `GET` | `Circulations`, `ReturnRecords`, `Books` |
| **SHOW / READ / VIEW** | **Circulation Anomaly Alert Banner** | Alerts when abnormal borrowing spikes, missing book patterns, or delinquent surges are detected | `GET /api/admin/analytics/anomaly` | `GET` | `Circulations`, `AuditLogs` |
| **SHOW / READ / VIEW** | **Core Velocity Chart** (`AreaSplineChart`) | Dynamic multi-series SVG chart of daily checkouts vs returns across selectable periods (`7D`, `30D`, `90D`, `1Y`, `All`) | `GET /api/admin/analytics/velocity?granularity={g}` | `GET` | `Circulations`, `ReturnRecords` |
| **SHOW / READ / VIEW** | **Inventory Density Chart** (`BarVolumeChart`) | Distribution of catalog holdings across Dewey Decimal classifications (000s to 900s) | `GET /api/admin/analytics/density` | `GET` | `Books`, `Categories` |
| **SHOW / READ / VIEW** | **Community Flow Chart** (`PieGraphChart`) | Donut visualization of circulation share by College / Academic Department | `GET /api/admin/analytics/community` | `GET` | `Circulations`, `Users` |
| **SHOW / READ / VIEW** | **Hourly Circulation Heatmap** | 24-hour turnaround density heatmap highlighting peak library desk hours | `GET /api/admin/analytics/demand` | `GET` | `Circulations` |
| **SHOW / READ / VIEW** | **Monograph Performance Table** | Ranked list of monographs with Title, Author, Discipline, Checkouts, Active Holds, Available/Total Copies, Velocity Status | `GET /api/admin/analytics/ranked-books` | `GET` | `Books`, `Circulations`, `Reservations` |
| **SHOW / READ / VIEW** | **Inspect Book Performance Drawer** (`isInspectBookModalOpen`) | Deep dive into monograph checkout trajectory, patron demographic breakdown, and bay shelf occupancy | `GET /api/admin/analytics/books/{id}` | `GET` | `Books`, `Circulations` |
| **SHOW / READ / VIEW** | **Patron Segment Analytics Modal** (`isPatronSegmentsModalOpen`) | Breakdown of borrowing habits by undergraduate year level, graduate scholars, and faculty researchers | `GET /api/admin/analytics/patron-segments` | `GET` | `Users`, `Circulations` |
| **SHOW / READ / VIEW** | **Stacks Allocation Modal** (`isStacksModalOpen`) | Architectural capacity review of stacks occupancy across Wing A, B, and C | `GET /api/admin/analytics/stacks-capacity` | `GET` | `Categories`, `PhysicalCopies` |
| **ADD / CREATE** | **"+ Add Monograph" Modal** (`isCreateBookModalOpen`) | Fast-registers new monograph directly from analytics view | `POST /api/books` | `POST` | `Books` |
| **ADD / CREATE** | **Export Analytics Dossier Modal** (`isExportModalOpen`) | Form: Date Range, Granularity, Format (`CSV` / `XLSX`) -> Downloads complete analytical dataset | `GET /api/admin/analytics/export` | `GET` | `Circulations`, `Books` |
| **EDIT / UPDATE** | **"Edit Monograph" Modal** (`isEditBookModalOpen`) | Updates monograph metadata, classification, or assigned bay location | `PUT /api/books/{id}` | `PUT` | `Books` |
| **EDIT / UPDATE** | **Refresh Telemetry Button** | Forces immediate recalculation of velocity trends and cache invalidation | `POST /api/admin/analytics/refresh-telemetry` | `POST` | In-Memory Telemetry Cache |
| **DELETE / REMOVE** | **De-accession Monograph Modal** (`isDeleteBookModalOpen`) | Archives underperforming or obsolete title from active collection | `DELETE /api/books/{id}` | `DELETE` | `Books` |

---

## 10. Official Reports & Dossiers (`Reports.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/reports`
- **File:** `Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Reports.tsx`

| Category | UI Element / Trigger | Action Description | Target Endpoint | HTTP Method | Target Database Table & Entity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SHOW / READ / VIEW** | **Report Suite Metrics Cards** | Displays Total Dossiers Generated, Cryptographic Seal Compliance %, Disciplinary Share %, Active Scheduled Jobs | `GET /api/admin/reports/suites` | `GET` | `ReportDossiers`, `ScheduleTriggers` |
| **SHOW / READ / VIEW** | **Generated Dossiers Table / Card** | Displays Dossier ID, Template Name, Generated Timestamp, File Size, SHA-256 Cryptographic Seal Hash, Status | `GET /api/admin/reports/dossiers` | `GET` | `ReportDossiers` |
| **SHOW / READ / VIEW** | **Verify Cryptographic Seal Modal** | Enter SHA-256 seal hash to verify document authenticity, immutability, and issuing administrator identity | `POST /api/admin/reports/verify-seal` | `POST` | `ReportDossiers`, `AuditLogs` |
| **SHOW / READ / VIEW** | **Audit Attestation Journal Tab** | Displays automated compliance audit log entries and legal regulatory archiving events | `GET /api/admin/reports/attestations` | `GET` | `AuditAttestations` |
| **SHOW / READ / VIEW** | **Automated Schedule Triggers Tab** | Displays scheduled cron report dispatches: Job ID, Cron Pattern, Next Run Time, Recipient Roles, Channel, Status | `GET /api/admin/reports/schedules` | `GET` | `ScheduleTriggers` |
| **SHOW / READ / VIEW** | **Disciplinary Share Distribution Chart** | Donut breakdown of report volume generated by academic disciplines | `GET /api/admin/reports/disciplinary-share` | `GET` | `ReportDossiers` |
| **ADD / CREATE** | **"Generate Official Report Dossier" Form** | Form: Template Selection (`Circulation`, `Financial`, `Inventory`, `Audit`), Timeframe, Discipline, Format (`PDF`, `CSV`, `XLSX`), Delinquency Flag | `POST /api/admin/reports/generate` | `POST` | `ReportDossiers` |
| **ADD / CREATE** | **"+ New Automated Schedule" Modal** | Form: Template, Cron Expression (e.g. `0 0 1 * *`), Target Email Recipients, Format -> Registers automated background task | `POST /api/admin/reports/schedules` | `POST` | `ScheduleTriggers` |
| **EDIT / UPDATE** | **"Run Now" Manual Schedule Trigger** | Immediately forces execution of an automated scheduled report job | `POST /api/admin/reports/schedules/{id}/run-now` | `POST` | `ScheduleTriggers`, `ReportDossiers` |
| **EDIT / UPDATE** | **Toggle Schedule Active Status** | Enables or pauses an automated cron schedule trigger | `PUT /api/admin/reports/schedules/{id}/toggle` | `PUT` | `ScheduleTriggers` (`IsActive`) |
| **DELETE / REMOVE** | **Delete / Archive Report Dossier** | Purges old report file or marks dossier archived | `DELETE /api/admin/reports/dossiers/{id}` | `DELETE` | `ReportDossiers` |
| **DELETE / REMOVE** | **Delete Schedule Trigger** | Removes an automated report cron schedule | `DELETE /api/admin/reports/schedules/{id}` | `DELETE` | `ScheduleTriggers` |

---

## 11. Roles & RBAC Permissions (`RolesPermissions.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/roles`
- **File:** `Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/RolesPermissions.tsx`

| Category | UI Element / Trigger | Action Description | Target Endpoint | HTTP Method | Target Database Table & Entity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SHOW / READ / VIEW** | **Security Governance Metrics Strip** | Displays Total Governed Roles, Active Staff Sessions, 2FA Enforcement Rate %, Anomaly Privilege Escalations | `GET /api/admin/roles/metrics` | `GET` | `Roles`, `UserRoles`, `UserLogins` |
| **SHOW / READ / VIEW** | **Role Privilege Matrix Table** | Interactive permission grid: Rows (Modules: `Circulation`, `Catalog`, `Fines`, `Audit`), Columns (Roles: `Admin`, `Librarian`, `Cashier`, `Patron`) | `GET /api/admin/roles/privileges` | `GET` | `ModulePrivileges`, `Roles` |
| **SHOW / READ / VIEW** | **Security Profile Inspector Panel** | Inspects selected role capabilities: Granted Permissions Count, Max Concurrent Sessions, 2FA Required badge | `GET /api/admin/roles/{key}/config` | `GET` | `Roles`, `RoleCapabilities` |
| **SHOW / READ / VIEW** | **Authenticated Login Audit Stream** | Live telemetry of recent staff authentication attempts: Username, IP Address, Timestamp, 2FA Status, Status Badge | `GET /api/admin/roles/login-audits` | `GET` | `UserLogins` |
| **SHOW / READ / VIEW** | **Circulation Anomaly Alert Modal** (`isAnomalyModalOpen`) | Details privilege divergence detections and out-of-bounds role escalations | `GET /api/admin/roles/anomalies` | `GET` | `SecurityAnomalies`, `AuditLogs` |
| **ADD / CREATE** | **"+ Create Custom Role" Modal** (`isCustomRoleModalOpen`) | Form: Role Name, Description, Base Role Template (`Staff`, `Librarian`, `Cashier`) -> Registers new institutional role | `POST /api/admin/roles` | `POST` | `Roles`, `RoleCapabilities` |
| **ADD / CREATE** | **"Generate 2FA Emergency Backup Keys" Modal** (`is2FaModalOpen`) | Generates one-time emergency cryptographic recovery tokens for staff administrative accounts | `POST /api/admin/roles/generate-2fa-keys` | `POST` | `UserTwoFactorKeys` |
| **ADD / CREATE** | **Export Privilege Matrix Modal** (`isExportModalOpen`) | Form: Date Range, Alphabetical Filter, Format (`CSV` / `Excel`) -> Downloads permission audit sheet | `GET /api/admin/roles/export` | `GET` | `ModulePrivileges` |
| **EDIT / UPDATE** | **Granular Privilege Matrix Checkboxes** | Clicking any matrix cell toggles `Read`, `Write`, `Delete`, or `Special` permissions for that role and module | `PUT /api/admin/roles/privileges` | `PUT` | `ModulePrivileges` |
| **EDIT / UPDATE** | **Role Capabilities Checkbox Toggles** | Toggles specific capabilities: Emergency Hold Override, Cash Drawer Kickout, Fine Courtesy Waiver, Hold Staging Clearance | `PUT /api/admin/roles/{key}/config` | `PUT` | `RoleCapabilities` |
| **DELETE / REMOVE** | **Reset Roles to Institutional Defaults Modal** (`isResetConfirmModalOpen`) | Restores system RBAC matrix to factory university security policies | `POST /api/admin/roles/reset-defaults` | `POST` | `ModulePrivileges`, `RoleCapabilities` |
| **DELETE / REMOVE** | **Revoke Custom Role** | Deletes custom role and reassigns governed users to standard academic patron tier | `DELETE /api/admin/roles/{id}` | `DELETE` | `Roles` |

---

## 12. Cryptographic Audit Trail (`AuditLogs.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/audit-logs`
- **File:** `Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/AuditLogs.tsx`

| Category | UI Element / Trigger | Action Description | Target Endpoint | HTTP Method | Target Database Table & Entity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SHOW / READ / VIEW** | **Cryptographic Audit Metrics Cards** | Displays Total Events 24h, Event Growth Rate %, Security Anomalies, Hash Chain Status (`100%`), Merkle Root Hash | `GET /api/admin/audit-logs/metrics`<br>`GET /api/admin/audit-logs/merkle-root` | `GET` | `AuditLogs`, `AuditBlocks` |
| **SHOW / READ / VIEW** | **Immutable Audit Journal Table / Card** | Displays Event Action, User Identity, Module Scope, Severity (`Info`, `Warning`, `Critical`, `Anomaly`), Timestamp, IP, Hash | `GET /api/admin/audit-logs` | `GET` | `AuditLogs` |
| **SHOW / READ / VIEW** | **Audit Record Inspector Modal** (`isInspectorOpen`) | Inspects full event payload diff, Before vs After values, Previous Block Hash, Current Block Hash, Client User Agent | `GET /api/admin/audit-logs/{id}` | `GET` | `AuditLogs` |
| **SHOW / READ / VIEW** | **Raw JSON Telemetry Modal** (`isRawTelemetryOpen`) | Displays formatted JSON telemetry stream for export or SIEM ingestion | Computed client / `GET` | `GET` | `AuditLogs` |
| **SHOW / READ / VIEW** | **SearchBar & Severity Filters** | Debounced search across action, user, module; Dropdowns for Severity and Module Scope; Timeframe tabs (`Today`, `7D`, `30D`, `Custom`) | `GET /api/admin/audit-logs?query={q}&severity={s}&module={m}` | `GET` | `AuditLogs` |
| **ADD / CREATE** | **Export Audit Trail Modal** (`isExportModalOpen`) | Form: Date Range, Letter Filter, ID Filter, Format (`CSV` / `XLSX`) -> Downloads tamper-evident audit spreadsheet | `GET /api/admin/audit-logs/export` | `GET` | `AuditLogs` |
| **EDIT / UPDATE** | **Reindex / Verify Cryptographic Hash Chain** | Re-computes SHA-256 hash sequence and Merkle root across all blocks to verify zero ledger tampering | `POST /api/admin/audit-logs/reindex` | `POST` | `AuditLogs`, `AuditBlocks` |
| **DELETE / REMOVE** | **Purge Expired Audit Records Modal** (`isBulkDeleteModalOpen`) | Permanently purges audit entries older than the statutory institutional retention limit (e.g. 7 years) | `POST /api/admin/audit-logs/bulk-delete` | `POST` | `AuditLogs` |

---

## 13. Communications & Broadcasts (`Notifications.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/notifications`
- **File:** `Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Notifications.tsx`

| Category | UI Element / Trigger | Action Description | Target Endpoint | HTTP Method | Target Database Table & Entity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SHOW / READ / VIEW** | **Notification Bento Metrics Cards** | Displays Today Dispatched Total, Delivery Reliability %, Delivery Fail Rate %, Urgent Alerts Count, Active Bulletins Count | `GET /api/admin/notifications/metrics` | `GET` | `NotificationLogs`, `Announcements` |
| **SHOW / READ / VIEW** | **Queue Telemetry Monitor Strip** | Displays Next Batch Run Seconds, Daemon Status, Gateway Quotas (Twilio, SendGrid, Amazon SES), Pending SMS/Email Count | `GET /api/admin/notifications/telemetry` | `GET` | `DispatchQueue` |
| **SHOW / READ / VIEW** | **Alerts & Dispatches Table / Card** (`tab-alerts`) | Displays Title, Recipient Group, Channel (`SMS`, `Email`, `Push`, `In-App`), Dispatched Timestamp, Delivery Status Badge | `GET /api/admin/notifications/alerts` | `GET` | `NotificationLogs` |
| **SHOW / READ / VIEW** | **Campus Bulletins Tab** (`tab-bulletins`) | Displays public announcements: Title, Category, Priority, Sticky Status, Published Date, Expiry Date | `GET /api/admin/notifications/announcements` | `GET` | `Announcements` |
| **SHOW / READ / VIEW** | **Template Editor & Preview Drawer** (`tab-templates`) | Previews notification templates with dynamic tokens (`{{PatronName}}`, `{{BookTitle}}`, `{{DueDate}}`, `{{FineAmount}}`) | `GET /api/admin/notifications/templates` | `GET` | `NotificationTemplates` |
| **ADD / CREATE** | **"Compose Emergency Broadcast" Modal** (`dispatchBroadcast`) | Form: Title, Message, Urgency Level (`Normal`, `High`, `Urgent`), Channel Selection, Target Roles (`All`, `Customers`, `Cashiers`, `Admins`) | `POST /api/admin/notifications/broadcast` | `POST` | `NotificationLogs`, `DispatchQueue` |
| **ADD / CREATE** | **"+ Create New Bulletin" Modal** (`createAnnouncement`) | Form: Title, Content, Priority, Expiry Date, Sticky Banner Toggle -> Publishes campus-wide announcement | `POST /api/admin/notifications/announcements` | `POST` | `Announcements` |
| **ADD / CREATE** | **"+ Add Notification Template" Modal** | Form: Template Name, Subject, Channel, Body with Token Placeholders | `POST /api/admin/notifications/templates` | `POST` | `NotificationTemplates` |
| **EDIT / UPDATE** | **Mark Alert as Read Action** | Marks notification read in administrative inbox | `PUT /api/admin/notifications/{id}/mark-read` | `PUT` | `NotificationLogs` (`IsRead`) |
| **EDIT / UPDATE** | **Toggle Bulletin Sticky / Pin Status** | Toggles whether an announcement appears as a sticky top alert banner on public & patron portals | `PUT /api/admin/notifications/announcements/{id}/toggle-sticky` | `PUT` | `Announcements` (`IsSticky`) |
| **EDIT / UPDATE** | **Edit Bulletin Modal** (`updateAnnouncement`) | Updates announcement title, body, priority, or expiration date | `PUT /api/admin/notifications/announcements/{id}` | `PUT` | `Announcements` |
| **EDIT / UPDATE** | **Force Flush Queue Now Button** | Forces immediate execution of the background notification dispatch daemon | `POST /api/admin/notifications/flush-queue` | `POST` | `DispatchQueue` |
| **DELETE / REMOVE** | **Dismiss / Archive Alert** | Archives alert from active notification feed | `DELETE /api/admin/notifications/{id}` | `DELETE` | `NotificationLogs` |
| **DELETE / REMOVE** | **Delete Campus Bulletin Modal** (`deleteAnnouncement`) | Removes announcement from public portals | `DELETE /api/admin/notifications/announcements/{id}` | `DELETE` | `Announcements` |
| **DELETE / REMOVE** | **Delete Notification Template** | Removes custom template | `DELETE /api/admin/notifications/templates/{id}` | `DELETE` | `NotificationTemplates` |

---

## 14. System Governance, Policies & Whitelist (`Settings.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/settings`
- **File:** `Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Settings.tsx`

| Category | UI Element / Trigger | Action Description | Target Endpoint | HTTP Method | Target Database Table & Entity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SHOW / READ / VIEW** | **8 Institutional Policy Tabs** | Displays: 1. Circulation Caps, 2. Staging Rules, 3. Fines Tariff, 4. Network CIDR Whitelist, 5. Security & Audit, 6. Institutional Profile, 7. Data Archives, 8. Responsive Viewports | `GET /api/admin/settings` | `GET` | `SystemSettings` |
| **SHOW / READ / VIEW** | **Authorized CIDR Subnet Whitelist Table** | Displays IP Range (`192.168.1.0/24`), Classification (`Circulation Kiosk LAN`), Access Level (`Staff POS Desks`), Created Timestamp | `GET /api/admin/settings/cidr` | `GET` | `CidrSubnets` |
| **SHOW / READ / VIEW** | **Fine Calculation Simulator Widget** | Interactive calculator: enter N overdue days to test fine tariff and penalty ceiling before committing policy | Computed client-side from live policies | `GET` | Local computation / `SystemSettings` |
| **SHOW / READ / VIEW** | **Cryptographic Audit Node Status** | Displays Total System Events 24h, Events Growth %, Security Anomalies, Hash Chain Status (`100%`), Active Admin Sessions | `GET /api/admin/settings/telemetry` | `GET` | `AuditLogs`, `SystemSettings` |
| **SHOW / READ / VIEW** | **System Data Archives & Backups Table** | Displays Module Summaries (`Catalog`, `Circulation`, `Users`, `Audit`), Compressed Size, Record Count, Last Archive Date | `GET /api/admin/settings/archives` | `GET` | `SystemArchives` |
| **ADD / CREATE** | **"+ Add Authorized CIDR Subnet" Modal** (`isAddCidrModalOpen`) | Form: IP CIDR Range (e.g. `10.0.4.0/24`), Subnet Classification, Permitted Access Level -> Saves to database firewall | `POST /api/admin/settings/cidr` | `POST` | `CidrSubnets` |
| **ADD / CREATE** | **"Generate System Archive Backup" Modal** | Selects target modules (`Circulation`, `Catalog`, `Fines`, `Audit`) and triggers compressed SQL/JSON backup creation | `POST /api/admin/settings/archives/generate` | `POST` | `SystemArchives` |
| **EDIT / UPDATE** | **Policy Numeric Stepper Inputs** | Interactive steppers for: Undergrad Loan Limit, Faculty Loan Limit, Loan Days, Staging Window Hours, Daily Fine Tariff (₱), Auto-Logoff Minutes | `PUT /api/admin/settings` | `PUT` | `SystemSettings` |
| **EDIT / UPDATE** | **Governance Toggle Switches** | Toggles: Instant Reshelve Notice, Thesis Scholar Priority, Medical Fine Waiver, Typhoon Fine Waiver, 2FA Enforcement | `PUT /api/admin/settings` | `PUT` | `SystemSettings` |
| **EDIT / UPDATE** | **Save Settings Confirmation Modal** (`isSaveModalOpen`) | Checklist dialog confirming which governance domains (`Circulation`, `Reservations`, `Fines`, `Security`) to commit to database | `PUT /api/admin/settings` | `PUT` | `SystemSettings`, `AuditLogs` |
| **EDIT / UPDATE** | **Update Institutional Profile Form** | Form: University Name, Library Branch, Contact Email, Campus Building Hours -> Commits official branding | `PUT /api/admin/settings/profile` | `PUT` | `SystemSettings` (`InstitutionalProfile`) |
| **DELETE / REMOVE** | **Delete CIDR Subnet Action** | Removes IP range from authorized terminal access whitelist | `DELETE /api/admin/settings/cidr/{id}` | `DELETE` | `CidrSubnets` |
| **DELETE / REMOVE** | **Bulk Delete CIDR Subnets** | Batch deletes selected CIDR subnet ranges from table checkbox selection | `POST /api/admin/settings/cidr/bulk-delete` | `POST` | `CidrSubnets` |
| **DELETE / REMOVE** | **Reset to Institutional Defaults Modal** (`isResetModalOpen`) | Restores system settings across circulation, reservations, and fines back to factory institutional defaults | `POST /api/admin/settings/reset-defaults` | `POST` | `SystemSettings`, `AuditLogs` |
| **DELETE / REMOVE** | **Purge Staged System Archive** | Deletes temporary backup archive file | `DELETE /api/admin/settings/archives/{id}` | `DELETE` | `SystemArchives` |

---

## 15. Administrator Profile & Security Sessions (`Profile.tsx`)
- **Route:** `http://127.0.0.1:5174/admin/profile`
- **File:** `Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/Profile.tsx`

| Category | UI Element / Trigger | Action Description | Target Endpoint | HTTP Method | Target Database Table & Entity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SHOW / READ / VIEW** | **Admin Profile Overview Card** | Displays Profile Picture, Full Name, Admin Role Badge (`Level 4 Administrator`), Admin ID (`KP-ADM-...`), Email, Phone | `GET /api/auth/me` | `GET` | `Users` |
| **SHOW / READ / VIEW** | **Active Security Sessions Stream** | Displays current and recent admin login sessions: IP Address, Browser User Agent, Login Timestamp, 2FA Status | `GET /api/admin/roles/login-audits` | `GET` | `UserLogins` |
| **ADD / CREATE / UPLOAD** | **Admin Avatar Upload Button** (`fileInputRef`) | Opens file picker -> Converts image to base64 -> Uploads and persists new administrator profile picture | `POST /api/auth/upload-profile-picture` | `POST` | `Users` (`ProfilePictureUrl`) |
| **EDIT / UPDATE** | **Edit Profile Details Form** | Form: Updates Administrator Full Name, Contact Email, Phone Number, Assigned Office Room | `PUT /api/auth/profile` | `PUT` | `Users` |
| **EDIT / UPDATE** | **Change Master Password Form** | Form: Current Password, New Password, Confirm Password -> Updates cryptographic password hash in database | `POST /api/auth/change-password` | `POST` | `UserCredentials` |
| **EDIT / UPDATE** | **2FA Authenticator Re-Configuration** | Re-binds Google Authenticator / TOTP app with QR code verification | `POST /api/auth/setup-2fa` | `POST` | `UserTwoFactor` |
| **DELETE / REMOVE** | **Terminate Remote Sessions Action** | Invalidates all active session tokens across other devices, keeping only the current admin session active | `POST /api/auth/terminate-other-sessions` | `POST` | `UserSessions` |

---

## 16. ARCHITECTURAL FOUNDATION: DBINFRASTRUCTURE, DATABASE SEEDER & SECURITY
- **Files:**
  - [`Backend/Features/DBInfrastructure/Database/DatabaseSeeder.cs`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Backend/Features/DBInfrastructure/Database/DatabaseSeeder.cs)
  - [`Backend/Features/DBInfrastructure/Connections/DbConnectionFactory.cs`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Backend/Features/DBInfrastructure/Connections/DbConnectionFactory.cs)
  - [`Backend/Features/DBInfrastructure/Health/DbHealthCheck.cs`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Backend/Features/DBInfrastructure/Health/DbHealthCheck.cs)
  - [`Backend/Features/Helpers/Infrastructure/AuditHelper.cs`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Backend/Features/Helpers/Infrastructure/AuditHelper.cs)

### 16.1 Purpose of `DatabaseSeeder.cs`
`DatabaseSeeder.cs` is strictly the **Initial Infrastructure Bootstrap Orchestrator**. It adheres to the zero-static mandate:
1. **Zero Static Books & Zero Static Users:**
   - Books and patrons are **dynamic business entities** that must strictly follow the flowchain:
     $$\text{UI / Frontend View} \longrightarrow \text{API Controller} \longrightarrow \text{Domain Service} \longrightarrow \text{Repository} \longrightarrow \text{Database}$$
   - Pre-seeding static book titles (e.g., *Clean Architecture*, *SICP*, *CLRS*) creates ghost state disconnected from user cataloging operations. All hardcoded static books have been permanently removed.
2. **Classification Taxonomy Bootstrap (Head Foundation):**
   - A library management system cannot function without classification standards. `DatabaseSeeder.cs` seeds the formal **Dewey Decimal Classification (DDC 23)** ranges and core campus shelf bay coordinates:
     - `000 - 099`: Computer Science & Information (Bay A-01 to A-08)
     - `100 - 199`: Philosophy & Psychology (Bay B-01 to B-06)
     - `300 - 399`: Social Sciences & Law (Bay C-01 to C-10)
     - `500 - 599`: Pure Science & Mathematics (Bay D-01 to D-12)
     - `600 - 699`: Technology & Applied Sciences (Bay E-01 to E-14)
     - `800 - 899`: Literature & Rhetoric (Bay F-01 to F-10)
     - `900 - 999`: History & Filipiniana (Bay G-01 to G-08)
3. **Security & Cryptographic Genesis Head (`AuditHelper` Connection):**
   - Establishes the immutable root anchor:
     $$\text{AuditHelper.GenesisHash} = \text{"GENESIS\_ROOT\_HASH\_0000000000000000000000000000000000000000000000000000000000000000"}$$
   - Every operational audit entry in the entire application chains its SHA-256 signature to the previous entry:
     $$\text{Hash}_n = \text{SHA256}(\text{Hash}_{n-1} \mid \text{Action} \mid \text{Target} \mid \text{Delta} \mid \text{Timestamp})$$
   - Without `DatabaseSeeder.cs` establishing this immutable root anchor (`SYSTEM_GENESIS_ROOT`), the cryptographic audit log cannot guarantee mathematical tamper-evidence or chain verification.

### 16.2 Purpose of `DbConnectionFactory.cs`
- Manages pooled, secure SQL Server connection strings with active connection pooling, timeouts, and `TrustServerCertificate` controls without leaking credentials.
- Guarantees thread-safe database connection instantiation for high-throughput concurrency across API requests.

### 16.3 Purpose of `DbHealthCheck.cs`
- Powers the `/api/health` diagnostic endpoint and `SystemHealthService.cs`.
- Verifies SQL Server responsiveness, latency, and memory footprint without executing heavy domain queries, providing instant telemetry for heartbeat monitoring.

---

## 17. ADMINISTRATIVE ROOT CLI TOOL (`cli.ps1`) & TERMINAL GOVERNANCE
- **Files:**
  - [`cli.ps1`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/cli.ps1) (Workspace Root)
  - [`Katipuneros-Library-Store/cli.ps1`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/cli.ps1) (Repository Root)
  - [`Backend/Program.cs`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Backend/Program.cs) (CLI Command Dispatcher)
  - [`Backend/Features/Services/Implementations/UserService.cs`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Backend/Features/Services/Implementations/UserService.cs) (Protection Enforcement)

### 17.1 Security Architecture: Protected Accounts (`IsProtected = true`)
- Users created via the administrative CLI are designated as **Root Governance Accounts** (`IsProtected = true`).
- **Web UI Immunity:**
  - **Cannot be Deleted:** Web UI `DELETE /api/users/{id}` returns `HTTP 400 Bad Request` with:
    `"Protected CLI root account cannot be deleted via the Web UI. Administrative CLI terminal authority is required."`
  - **Cannot be Bulk Deleted:** Web UI bulk delete ignores and rejects protected users.
  - **Cannot be Suspended:** Web UI status toggle is blocked for protected accounts.
  - **Visual Indicator:** Frontend displays an amber `[CLI ROOT]` badge, disables row selection checkboxes, and disables delete/suspend buttons with explanatory tooltips.
- **Terminal Authority:** Only the CLI tool (`cli.ps1`) or administrative terminal commands possess the cryptographic authority to edit, delete, or bulk wipe CLI-created users.

### 17.2 CLI Commands Reference

| Command | Syntax | Description |
| :--- | :--- | :--- |
| **`listusers`** | `powershell -ExecutionPolicy Bypass -File .\cli.ps1 listusers` | Queries SQL Server and renders an ASCII table of all CLI-created protected accounts. |
| **`createsuperuseradmin`** | `powershell -ExecutionPolicy Bypass -File .\cli.ps1 createsuperuseradmin <username> <password> <email> [firstName] [lastName] [department]` | Creates a protected Administrator account with `KP-ADM` library card and `IsProtected = true`. |
| **`createcustomersuperuseradmin`** | `powershell -ExecutionPolicy Bypass -File .\cli.ps1 createcustomersuperuseradmin <username> <password> <email> [firstName] [lastName] [department]` | Creates a protected Customer/Patron superuser with `KP-LIB` library card and `IsProtected = true`. |
| **`edituser`** | `powershell -ExecutionPolicy Bypass -File .\cli.ps1 edituser <identifier> <field> <value>` | Updates field (`name`, `firstname`, `lastname`, `email`, `department`, `role`, `password`) of a CLI-protected user. |
| **`deleteuser`** | `powershell -ExecutionPolicy Bypass -File .\cli.ps1 deleteuser <identifier>` | Cascades foreign keys and permanently removes a single CLI-created user. |
| **`deleteallcliusers`** | `powershell -ExecutionPolicy Bypass -File .\cli.ps1 deleteallcliusers` | Prompts for confirmation and deletes all CLI-created protected users. |

### 17.3 Interactive CLI Menu
Running `powershell -ExecutionPolicy Bypass -File .\cli.ps1` without arguments launches the interactive terminal menu:
```text
==========================================================================================
               KATIPUNEROS LIBRARY STORE -- ADMINISTRATIVE ROOT CLI TOOL                  
               Governance Authority & Immutable Protected User Management                 
==========================================================================================

Select an administrative operation:
  [1] List all CLI-created protected users (listusers)
  [2] Create Superuser Admin (createsuperuseradmin)
  [3] Create Customer Superuser (createcustomersuperuseradmin)
  [4] Edit a CLI user (edituser)
  [5] Delete a single CLI user (deleteuser)
  [6] Delete ALL CLI users (deleteallcliusers)
  [7] Exit

Enter option (1-7):
```

### 17.4 Exact Visual Table Output (`listusers`)
When `listusers` is invoked, the CLI queries the database and renders the exact formatted table:

```text
==========================================================================================
               KATIPUNEROS LIBRARY STORE -- ADMINISTRATIVE ROOT CLI TOOL                  
               Governance Authority & Immutable Protected User Management                 
==========================================================================================

[*] Querying database for CLI-created protected root users...
  Total Protected Root Accounts: 2

+---------------------+------------------+--------------------------+-----------------------------------+-------------+----------+--------------+
| CARD NUMBER         | USERNAME         | FULL NAME                | EMAIL                             | ROLE        | STATUS   | CREATED AT   |
+---------------------+------------------+--------------------------+-----------------------------------+-------------+----------+--------------+
| KP-ADM-2026-69A4D   | customadmin1     | Andres Bonifacio         | customadmin1@katipuneros.edu.ph   | Admin       | Active   | 2026-10-03   |
| KP-LIB-2026-26FDD   | custsuperuser1   | Emilio Aguinaldo         | custsuperuser1@katipuneros.edu.ph | Customer    | Active   | 2026-10-03   |
+---------------------+------------------+--------------------------+-----------------------------------+-------------+----------+--------------+

  [i] All users above have 'IsProtected = true' and CANNOT be deleted or suspended via Web UI.
```
