# Comprehensive UI Verification, Global Font System, and Interactive State Plan

## 1. Goal Description
Perform a deep, comprehensive validation, double-check, and perfection of the Katipuneros Library Store frontend conversion from 32 static HTML pages + Three.js 3D assets to modern React + Vite + TypeScript.

This plan addresses:
1. **TreeJSAssets Placement**: Move and structure the 3D book hero asset into `Frontend/src/Assets/threejs/` as static assets per `SKILL.md` and wire it into the landing page.
2. **`LayoutStyles/FontSyle/` Creation**: Create the dedicated `FontSyle/` directory containing the global font styles, sizes, and Google Fonts / Material Symbols definitions, imported globally so that all pages call it.
3. **`SKILL.md` & `AGENTS.md` Rule Updates**:
   - Mandate `LayoutStyles/FontSyle/` in project structures and flowchains.
   - Enforce the **STRICT GLOBAL CALLING RULE**: No code in any file may input hardcoded colors directly; all colors, typography, and spacing must be called and imported from `LayoutStyles/` and `LayoutStyles/FontSyle/`.
   - Add comments and guidelines throughout `SKILL.md` and `AGENTS.md`.
4. **Complete Interaction Preservation**: Ensure all interactive features (modals, search filters, tab switching, multi-select checkboxes, inspection slideouts, drawers, and quick action flows) present in the original 32 HTML files are converted into idiomatic, typed React state (`useState`, `useEffect`, `useMemo`) while preserving **100% of the UI design, CSS classes, color schemes, and layout geometry intact**.

---

## 2. User Review Required

> [!IMPORTANT]
> **Directory Name Consistency**:
> The user specified `LayoutStyles/FontSyle` (exact spelling). We will create `Frontend/src/LayoutStyles/FontSyle/` and place `fontStyles.css` inside it, importing it into `Frontend/src/LayoutStyles/index.css` and `MainLayout.css` so that it is universally available across every single page and component.

> [!IMPORTANT]
> **Zero UI Changes Guarantee**:
> Every single Tailwind utility class, inline layout token, Material Symbols icon, image URL, font weight, line height, and border radius from the 32 source HTML files is preserved verbatim.

---

## 3. Proposed Changes

### Phase 1: Static 3D Asset Structure (`src/Assets/threejs/`)
- **[NEW]** `Frontend/src/Assets/threejs/bookHeroScene.ts`:
  - Typed Three.js scene engine extracted from `LandingPage/TreeJSAssets/code.html`.
  - Sets up: 6 floating books (open centerpiece, 4 hardcovers, 2 stacked), glass library card, 2 orbital torus rings, 48 ambient particles, studio lighting (ambient, key light, primary blue point light, lime accent point light), mouse parallax handler, and animation loop with clean disposal.
- **[NEW]** Copy raw `DESIGN.md` and `code.html` from `LandingPage/TreeJSAssets/` into `Frontend/src/Assets/threejs/` for static reference.
- **[MODIFY]** `Frontend/src/LANDING_PAGE/Features/Pages/Home/Components/BookHero3D.tsx`:
  - Import the scene engine from `@/Assets/threejs/bookHeroScene` and mount it via a typed `useRef` container.

---

### Phase 2: Global Font System (`src/LayoutStyles/FontSyle/`)
- **[NEW]** `Frontend/src/LayoutStyles/FontSyle/fontStyles.css`:
  - Contains:
    - `@import` for Google Fonts Inter (weights 100 to 900)
    - `@import` for Material Symbols Outlined (full optical size & fill gradient range)
    - Custom typography utility classes with explicit `fontSize`, `lineHeight`, `letterSpacing`, and `fontWeight`:
      - `.font-display-hero` (56px / 1.1 / -0.02em / 700)
      - `.font-display-hero-mobile` (36px / 1.15 / -0.01em / 700)
      - `.font-headline-1` (44px / 1.2 / -0.01em / 700)
      - `.font-headline-2` (36px / 1.25 / 600)
      - `.font-headline-3` (26px / 1.3 / 600)
      - `.font-headline-4` (22px / 1.35 / 600)
      - `.font-body-large` (18px / 1.5 / 500)
      - `.font-body-medium` (16px / 1.5 / 500)
      - `.font-body` (16px / 1.5 / 400)
      - `.font-small` (14px / 1.4 / 400)
      - `.font-caption` (12px / 1.4 / 0.02em / 500)
- **[MODIFY]** `Frontend/src/LayoutStyles/index.css`:
  - Import `./FontSyle/fontStyles.css` at the top of the global stylesheet.
- **[MODIFY]** `Frontend/src/LayoutStyles/MainLayout.css`:
  - Connect font tokens and CSS variables to `FontSyle/fontStyles.css`.

---

### Phase 3: Rule & Architecture Updates in `SKILL.md` and `AGENTS.md`
- **[MODIFY]** [SKILL.md](file:///C:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/SKILL.md):
  - Add `LayoutStyles/FontSyle/` folder to Section 4 folder maps with detailed comments.
  - Add `Assets/threejs/` folder to static assets map in Section 4.
  - Add **Hard Stop Rule**: Never input raw or exact colors in component code files; always call and import global tokens from `LayoutStyles/` (`MainLayout.css`, `PartLayout.css`, `FontSyle/fontStyles.css`).
  - Add placement rules for `FontSyle/` and static 3D assets in Section 13.
- **[MODIFY]** [AGENTS.md](file:///C:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/AGENTS.md):
  - Update CRITICAL RULES: Add rule requiring all font styling to be imported from `LayoutStyles/FontSyle/` and banning hardcoded colors in component files.
  - Update Frontend Folder Map to include `LayoutStyles/FontSyle/` and `Assets/threejs/`.

---

### Phase 4: Full Interactive State Implementation Across All 32 Pages
Audit every source HTML file and convert all embedded scripts, modals, tab switchers, and filtering into typed React interactions:

1. **Customer Panel (6 Pages)**:
   - `CustomerDashboard.tsx`: Search bar filter, quick borrow modal trigger, status card metrics.
   - `CatalogPage.tsx`: Active category filter chip state, search input filter, page switcher, book detail modal trigger.
   - `BorrowingsPage.tsx`: Tab switcher (Active Loans, Overdue, Returned History), renewal confirmation modal.
   - `ReservationsPage.tsx`: Cancel hold confirmation modal, filter tabs (All Holds, Ready for Pickup, Pending).
   - `FavoritesPage.tsx`: Category filter, remove from favorites toggle, quick reserve trigger.
   - `ProfileSettings.tsx`: Form input state, notification preference toggles, change PIN modal.

2. **Cashier Panel (10 Pages)**:
   - `CashierDashboard.tsx`: Live shift stats, quick action navigation.
   - `PendingReservations.tsx`: Active category filter tabs ("All Pending", "Due Today", "Tomorrow", "Scholastic Priority", "Waitlist"), live search filtering, checkbox multi-select with counter, row click updating the inspection slideover panel, batch approval modal, rejection modal.
   - `CheckoutBorrow.tsx`: Step 1 Patron Scan with live verification pill, Step 2 Book Barcode Staging, Step 3 Due Date selection (7/14/21 days) with calculated return date, Complete Checkout modal with receipt generation.
   - `ReturnsFines.tsx`: Barcode return scan, book condition selector, auto fine calculation, payment settlement drawer.
   - `CustomerLookup.tsx`: Search patron input, patron detail view, active loan records, pay fines button.
   - `BookAvailability.tsx`: Search catalog, Bay/Shelf locator map, copy availability toggle, quick hold staging.
   - `Schedules.tsx`: Date calendar picker, shift selector (Morning, Afternoon, Evening), duty assignment modal.
   - `OverdueFines.tsx`: Search overdue patrons, calculate daily fine accural, settle fine modal with cash/card toggle.
   - `Transactions.tsx`: Filter by transaction type (Borrow, Return, Fine Payment), date range picker, export CSV action, receipt inspection modal.
   - `Notifications.tsx`: Tab filter (Urgent, Circulation, Holds), mark as read action, clear notifications.

3. **Admin Panel (15 Pages)**:
   - `AdminDashboard.tsx`: Quick date filter, KPI card tooltips, recent activity stream.
   - `UserManagement.tsx`: Role filter tabs (All Users, Students, Faculty, Cashiers, Admins), search by name/ID/email, Create New User modal with validation.
   - `BooksManager.tsx`: Search by title/ISBN, category dropdown filter, Add New Book modal, Edit Book modal, Delete confirmation modal.
   - `Reservations.tsx`: Admin hold queue, override hold priority, approve/cancel actions.
   - `Borrowings.tsx`: Master circulation ledger, active/overdue filter, export log.
   - `Returns.tsx`: Returns audit, damaged book inspection modal, replacement fee calculator.
   - `Inventory.tsx`: RFID audit mode toggle, scan discrepancies filter, reconcile button.
   - `Analytics.tsx`: Timeframe selector (Weekly, Monthly, Annual), metric toggle.
   - `Categories.tsx`: Dewey decimal range accordion, Add Category modal.
   - `Reports.tsx`: Report type selector, date range filter, export PDF/CSV trigger.
   - `Notifications.tsx`: Broadcast announcement composer modal, tab switcher (Active, Broadcasts, Templates), institutional template previewer (`{{patron_name}}` bindings).
   - `RolesPermissions.tsx`: Role selection, permission checkbox matrix (Read, Write, Delete, Manage), save permissions toast.
   - `AuditLogs.tsx`: Row click telemetry inspector slideout, search by IP/User/Action, copy raw JSON object button.
   - `Settings.tsx`: Policy tab switcher (General, Circulation, Fines, Gateways), policy edit fields, save settings confirmation toast.
   - `Profile.tsx`: Admin account details, 2FA toggle, session terminator, password change form.

4. **Landing Page**:
   - `Home.tsx` + `HeroSection.tsx` + `BookHero3D.tsx`: Interactive Three.js hardcover cluster with mouse parallax.
   - `Products/Product.tsx`: Category filter chips, book card reserve button opening `ReservationModal`, details button opening `BookDetailModal`.
   - `ContactMe/ContactMe.tsx`: Public contact form with local state, validation, and submission notice.
   - Modals: `BookDetailModal`, `ReservationModal`, `AuthModal` (Sign In / Sign Up tab toggle).

---

## 4. Verification Plan

### Automated Verification:
1. `npx tsc -b` — Zero errors, strict type compliance across all 32 pages and support modules.
2. `npm run build` — Production Vite bundle build succeeds in < 3s.
3. Header comments verification across 100% of `.ts` and `.tsx` files.
4. Clean workspace check: verify no loose scripts or temp files in root.

### Manual Verification:
1. Start dev server: `npm run dev`.
2. Test landing page Three.js 3D animation and parallax.
3. Test customer catalog filtering and modal triggers.
4. Test cashier pending reservation filtering, row selection, counter, and inspection panel.
5. Test admin user management tabs, search, and modals.
6. Test admin audit logs telemetry JSON copy and drawer inspection.
