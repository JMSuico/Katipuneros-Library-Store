# Katipuneros Library Store -- Master Customer Portal CRUD Architecture & Flowway Inventory (CRUS LIST FOR CUSTOMER)

> **Document Classification**: Master Frontend UI to Backend CRUD Mapping & Flowway Specification  
> **Target Audience**: Customer / Patron Role Portal (`/customer/*`)  
> **Frontend Stack**: React 19 + TypeScript + Vite + Tailwind CSS & LayoutStyles Tokens  
> **Backend Stack**: .NET 10 + ASP.NET Core Web API + C# (Universal Lambda `=>`) + EF Core 10  
> **Database Engine**: Microsoft SQL Server (SSMS)  
> **Binding Standards**: Governed by [`Katipuneros-Library-Store/SKILL.md`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/SKILL.md) and [`Katipuneros-Library-Store/AGENTS.md`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/AGENTS.md)  
> **Hardware Status**: **100% PURGED** -- Zero RFID hardware simulators, zero solenoid locks, zero antenna ping sockets. Pure barcode accession and software-driven circulation desk workflow.

---

## 1. Architectural Flowway Contract (UI $\to$ API $\to$ DB)

Every customer operation initiated from the browser strictly follows the 6-layer Domain-Driven Design (DDD) flowway. Direct database queries in controllers or services bypassing repositories, as well as raw `fetch()` calls inside React view components, are strictly prohibited.

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Frontend UI View (React 19 + TypeScript)                           │
│    Path: Frontend/src/UserRoles/Features/Pages/CustomersPanel/Pages/   │
│    Components: CustomerDashboard, CatalogPage, ReservationsPage,       │
│                BorrowingsPage, FavoritesPage, ProfileSettings          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Invokes typed endpoint function)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. Typed Client Endpoint Stubs (TypeScript + apiClient)               │
│    Path: Frontend/src/Endpoints/Customer/ & Endpoints/                 │
│    Files: borrowApi.ts, reservationApi.ts, favoriteApi.ts,             │
│           booksApi.ts, authApi.ts                                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Dispatches HTTP JSON to http://localhost:5000/api/...)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. ASP.NET Core 10 Web API Controller                                  │
│    Path: Backend/Features/Api/Controllers/                             │
│    Files: BooksController.cs, BorrowController.cs,                    │
│           ReservationsController.cs, AuthController.cs                 │
│    Enforces: [Authorize(Roles = "Customer")], ModelState, ClaimTypes  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Dispatches to Domain Service via DI)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 4. Domain Service Business Logic Layer (Interfaces & Implementations)  │
│    Path: Backend/Features/Services/                                    │
│    Files: IBookService, IBorrowService, IReservationService,           │
│           IUserService (Universal Lambda `=>` syntax)                  │
│    Enforces: Loan caps, fine clearances, hold expiry, renewal limits   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Calls Domain Repository via DI)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 5. Repository Layer (EF Core 10 LINQ queries against AppDbContext)     │
│    Path: Backend/Features/Repositories/                                │
│    Files: IBookRepository, IBorrowRepository, IReservationRepository, │
│           IUserRepository (AsNoTracking, compiled queries, LINQ only)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Executes SQL against database)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 6. Relational Database Engine                                          │
│    Tables: Books, BorrowTransactions, Reservations, FineTransactions, │
│            Users, Categories, AuditLogs (SQL Server / SSMS)            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Customer Portal Navigation & Route Inventory

| Page Title | Route Path | Component File | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Home / Dashboard** | `/customer/home` | [`CustomerDashboard.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/CustomersPanel/Pages/CustomerDashboard.tsx) | Live patron overview, quick stats, spotlight selection, high-circulation radar, quick hold/favorite triggers |
| **Catalog & OPAC** | `/customer/catalog` | [`CatalogPage.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/CustomersPanel/Pages/CatalogPage.tsx) | Full scholastic catalog search, discipline filters, live stock pills, grid/list view switcher, hold reservation modal |
| **Reservations** | `/customer/reservations` | [`ReservationsPage.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/CustomersPanel/Pages/ReservationsPage.tsx) | Active hold tracking, ready for pickup counter alerts, 48h SLA countdown, reservation cancellation, pickup pass viewer |
| **Borrowings** | `/customer/borrowings` | [`BorrowingsPage.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/CustomersPanel/Pages/BorrowingsPage.tsx) | Active circulating loans in possession, return due countdowns, automated +7 days loan renewal, past loan passbook audit |
| **Favorites** | `/customer/favorites` | [`FavoritesPage.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/CustomersPanel/Pages/FavoritesPage.tsx) | Saved stacks wishlist, custom reading lists, stock availability triage, batch hold reservation, BibTeX / CSV export |
| **Profile Settings** | `/customer/profile` | [`ProfileSettings.tsx`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/CustomersPanel/Pages/ProfileSettings.tsx) | Patron identity credentials, virtual library card barcode pass, photo upload, security password change, dispatch routing matrix |

---

## 3. Exhaustive CRUD Matrix & Flowway Mapping by Page

### 3.1 Module 1: Customer Dashboard (`/customer/home`)

| UI Trigger / Component | CRUD Type | Frontend Endpoint Stub | HTTP Method | Target Controller & Route | Backend Service & Method | Repository LINQ Target | Database Entity & Operation | Response State & UI Feedback |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Initial Mount: Patron Greeting & Role** | **READ** | `fetchCurrentProfile()` in `authApi.ts` | `GET` | `AuthController.GetCurrentUser()`<br>`/api/auth/me` | `IUserService.GetByIdAsync(patronId)` | `_context.Users.FindAsync(id)` | `Users` table (SELECT) | Replaces static "Jhon" with user full name, updates "Graduate Scholar" badge |
| **Initial Mount: Real Catalog Volume Count** | **READ** | `getCatalogMetrics()` in `booksApi.ts` | `GET` | `BooksController.GetMetrics()`<br>`/api/books/metrics` | `IBookService.GetCatalogMetricsAsync()` | `_context.Books.SumAsync(b => b.TotalCopies)` | `Books` table (COUNT / SUM) | Updates banner text from static "42,000+" to real physical copy count |
| **Quick Metrics Strip: Active Holds** | **READ** | `getCustomerReservations()` in `reservationApi.ts` | `GET` | `ReservationsController.GetMyReservations()`<br>`/api/reservations/my-holds` | `IReservationService.GetPatronReservationsAsync(patronId)` | `_context.Reservations.Where(r => r.PatronId == patronId && r.Status != Cancelled)` | `Reservations` table (SELECT) | Updates "Holds Active" card ($N=0 \implies 0$) |
| **Quick Metrics Strip: Active Loans** | **READ** | `getCustomerActiveLoans()` in `borrowApi.ts` | `GET` | `BorrowController.GetMyActiveLoans()`<br>`/api/borrow/my-loans` | `IBorrowService.GetPatronActiveLoansAsync(patronId)` | `_context.BorrowTransactions.Where(t => t.PatronId == patronId && t.Status == Active)` | `BorrowTransactions` table (SELECT) | Updates "Loans in Hand" card ($N=0 \implies 0$) |
| **Quick Metrics Strip: Nearest Due Date** | **READ** | Calculated from `getCustomerActiveLoans()` | `GET` | `BorrowController.GetMyActiveLoans()`<br>`/api/borrow/my-loans` | `IBorrowService.GetPatronActiveLoansAsync(patronId)` | Evaluated client-side: $\min(t.\text{DueDate}) - \text{Now}$ | `BorrowTransactions` table (SELECT) | Formats as `Xd` or `Today` or `—` if $N=0$ |
| **Circulation Notice Ribbon** | **READ** | Evaluated from `getCustomerReservations()` | `GET` | `ReservationsController.GetMyReservations()`<br>`/api/reservations/my-holds` | Filters holds where $r.\text{Status} == \text{Ready}$ | `Reservations` table (SELECT) | `Reservations` table (SELECT) | Shows desk pickup alert if ready holds exist; neutral message if $N=0$ |
| **Curator's Spotlight Selection** | **READ** | `getSpotlightBook()` in `booksApi.ts` | `GET` | `BooksController.GetSpotlight()`<br>`/api/books/spotlight` | `IBookService.GetSpotlightAsync()` | `_context.Books.FirstOrDefaultAsync(b => b.IsSpotlight)` | `Books` table (SELECT) | Binds 3D book cover, Dewey call number, bay location, and available copies |
| **Spotlight "Reserve Book Now" Button** | **CREATE** | `requestCustomerReservation()` in `reservationApi.ts` | `POST` | `ReservationsController.CreateReservation()`<br>`/api/reservations` | `IReservationService.CreateReservationAsync(patronId, bookId, bay)` | `_context.Reservations.AddAsync(new Reservation { ... })` | `Reservations` table (INSERT) | Dispatches toast: "Hold requested for [Title]. Staging at Circulation Desk." |
| **Spotlight "Bookmark" Heart Button** | **CREATE / DELETE** | `toggleCustomerFavorite()` in `favoriteApi.ts` | `POST` | Local storage sync / `Favorites` service | State management / User Preferences sync | User profile saved stack list | Client Cache / User Preferences | Heart fills with pulse animation; toast confirms saved status |
| **Popular Across Campus Radar** | **READ** | `getFeaturedBooks()` in `booksApi.ts` | `GET` | `BooksController.GetFeatured()`<br>`/api/books/featured` | `IBookService.GetFeaturedBooksAsync()` | `_context.Books.OrderByDescending(b => b.TotalCopies - b.AvailableCopies).Take(4)` | `Books` table (SELECT) | Displays 4 highest circulating volumes with real stack bays |

---

### 3.2 Module 2: Scholastic Catalog & OPAC Search (`/customer/catalog`)

| UI Trigger / Component | CRUD Type | Frontend Endpoint Stub | HTTP Method | Target Controller & Route | Backend Service & Method | Repository LINQ Target | Database Entity & Operation | Response State & UI Feedback |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Initial Mount: Catalog Books Query** | **READ** | `getBooks()` / `searchBooks()` in `booksApi.ts` | `GET` | `BooksController.GetBooks()`<br>`/api/books?query=...` | `IBookService.GetAllBooksAsync(query, categoryId, page, pageSize)` | `_context.Books.Include(b => b.Category).Where(...)` | `Books`, `Categories` tables (SELECT) | Renders catalog grid with real covers, titles, Dewey codes, and shelf locations |
| **Header Metric: Catalog Volumes** | **READ** | Derived from `getBooks()` or `getCatalogMetrics()` | `GET` | `BooksController.GetMetrics()`<br>`/api/books/metrics` | `IBookService.GetCatalogMetricsAsync()` | `_context.Books.CountAsync()` | `Books` table (COUNT) | Updates header pill from mock `1,248` to real count |
| **Header Metric: Active Circulation Rate** | **READ** | Derived from `getCatalogMetrics()` | `GET` | `BooksController.GetMetrics()`<br>`/api/books/metrics` | `IBookService.GetCatalogMetricsAsync()` | $\frac{\sum(Total - Available)}{\sum Total} \times 100\%$ | `Books` table (AGGREGATE) | Updates header pill from mock `89.4%` to real rate ($N=0 \implies 0.0\%$) |
| **Live Search Input (Keyword / Title / Author)** | **READ** | `searchBooks(term)` in `booksApi.ts` | `GET` | `BooksController.GetBooks()`<br>`/api/books?query={term}` | `IBookService.SearchBooksAsync(term)` | `_context.Books.Where(b => EF.Functions.Like(b.Title, pattern) \|\| ...)` | `Books` table (SELECT) | Instant debounced (300ms) catalog re-render; shows empty state if 0 matches |
| **Discipline Filter Pills** | **READ** | `getCategories()` in `categoryApi.ts` | `GET` | `CategoriesController.GetAll()`<br>`/api/categories` | `ICategoryService.GetAllCategoriesAsync()` | `_context.Categories.AsNoTracking().ToListAsync()` | `Categories` table (SELECT) | Dynamically renders filter pills; clicking filters book collection |
| **View Mode Switcher (Grid vs List)** | **READ (UI)** | In-memory React State | None | Client State Only | None | None | None | Toggles CSS container between grid layout and tabular list view |
| **Book Card: "Reserve" / "Join Waitlist" Button** | **CREATE** | `requestCustomerReservation()` in `reservationApi.ts` | `POST` | `ReservationsController.CreateReservation()`<br>`/api/reservations` | `IReservationService.CreateReservationAsync(patronId, bookId, bay)` | `_context.Reservations.AddAsync(reservation)` | `Reservations` table (INSERT) | Opens hold confirmation modal; on submit updates queue position and decrements available count |
| **Book Card: Heart Toggle** | **CREATE / DELETE** | `toggleCustomerFavorite()` in `favoriteApi.ts` | `POST` | Local storage sync / `Favorites` service | State management / User Preferences sync | User profile saved stack list | Client Cache / User Preferences | Toggles favorite state, updates active heart icon color |

---

### 3.3 Module 3: Book Reservations & Staging (`/customer/reservations`)

| UI Trigger / Component | CRUD Type | Frontend Endpoint Stub | HTTP Method | Target Controller & Route | Backend Service & Method | Repository LINQ Target | Database Entity & Operation | Response State & UI Feedback |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Initial Mount: Patron Holds Ledger** | **READ** | `getCustomerReservations()` in `reservationApi.ts` | `GET` | `ReservationsController.GetMyReservations()`<br>`/api/reservations/my-holds` | `IReservationService.GetPatronReservationsAsync(patronId)` | `_context.Reservations.Include(r => r.Book).Where(r => r.PatronId == patronId)` | `Reservations`, `Books` tables (SELECT) | Renders active hold cards and history table |
| **Ribbon Metric 1: Active Holds** | **READ** | Derived from `getCustomerReservations()` | `GET` | `ReservationsController.GetMyReservations()` | Filter: $r.\text{Status} \in [\text{Pending}, \text{Ready}]$ | In-memory LINQ / EF Core Count | `Reservations` table | Replaces static `02` with real count ($N=0 \implies 0$) |
| **Ribbon Metric 2: Ready for Pickup** | **READ** | Derived from `getCustomerReservations()` | `GET` | `ReservationsController.GetMyReservations()` | Filter: $r.\text{Status} == \text{Ready}$ | In-memory LINQ / EF Core Count | `Reservations` table | Replaces static `01` with real count ($N=0 \implies 0$) |
| **Ribbon Metric 3: Completed History** | **READ** | Derived from `getCustomerReservations()` | `GET` | `ReservationsController.GetMyReservations()` | Filter: $r.\text{Status} == \text{Fulfilled}$ | In-memory LINQ / EF Core Count | `Reservations` table | Replaces static `14` with real count ($N=0 \implies 0$) |
| **Ribbon Metric 4: Cancelled / Expired** | **READ** | Derived from `getCustomerReservations()` | `GET` | `ReservationsController.GetMyReservations()` | Filter: $r.\text{Status} \in [\text{Cancelled}, \text{Expired}]$ | In-memory LINQ / EF Core Count | `Reservations` table | Replaces static `01` with real count ($N=0 \implies 0$) |
| **Status Tabs Filtering (All, Pending, Ready, Completed, Cancelled)** | **READ (UI)** | Filter in-memory reservation collection | None | Client State Only | None | None | None | Filters active cards displayed based on status |
| **"Cancel Hold" Button Trigger** | **DELETE** | `cancelCustomerReservation(id)` in `reservationApi.ts` | `DELETE` | `ReservationsController.CancelReservation(id)`<br>`/api/reservations/{id}` | `IReservationService.CancelReservationAsync(id, patronId)` | `_context.Reservations.FirstOrDefaultAsync(r => r.Id == id && r.PatronId == patronId)` | `Reservations` table (UPDATE Status = Cancelled or DELETE) | Opens confirmation dialog; on confirmation triggers API call and toasts success |
| **"View Pickup Pass" Modal Button** | **READ** | `getPickupPass(id)` in `reservationApi.ts` | `GET` | `ReservationsController` / client pass generator | Formulates pickup pass token & barcode | In-memory reservation data | `Reservations` table | Displays modal with barcode accession serial and front desk counter directions |
| **"Refresh Ledger" Button** | **READ** | Re-triggers `getCustomerReservations()` | `GET` | `ReservationsController.GetMyReservations()` | `IReservationService.GetPatronReservationsAsync(patronId)` | `_context.Reservations.Where(...)` | `Reservations` table | Spin animation on button; reloads fresh data |

---

### 3.4 Module 4: Active Loans & Circulation History (`/customer/borrowings`)

| UI Trigger / Component | CRUD Type | Frontend Endpoint Stub | HTTP Method | Target Controller & Route | Backend Service & Method | Repository LINQ Target | Database Entity & Operation | Response State & UI Feedback |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Initial Mount: Active Loans List** | **READ** | `getCustomerActiveLoans()` in `borrowApi.ts` | `GET` | `BorrowController.GetMyActiveLoans()`<br>`/api/borrow/my-loans` | `IBorrowService.GetPatronActiveLoansAsync(patronId)` | `_context.BorrowTransactions.Include(t => t.Book).Where(t => t.PatronId == patronId && t.Status == Active)` | `BorrowTransactions`, `Books` tables (SELECT) | Binds active loan cards with real cover, title, due date, and days remaining |
| **Initial Mount: Loan History Ledger** | **READ** | `getCustomerLoanHistory()` in `borrowApi.ts` | `GET` | `BorrowController.GetMyLoanHistory()`<br>`/api/borrow/my-history` | `IBorrowService.GetPatronLoanHistoryAsync(patronId)` | `_context.BorrowTransactions.Include(t => t.Book).Where(t => t.PatronId == patronId)` | `BorrowTransactions` table (SELECT) | Populates past loans table with check-out date, return date, and condition |
| **Tile 1: Books in Possession vs Quota** | **READ** | Derived from active loans count | `GET` | `BorrowController.GetMyActiveLoans()` | Ratio: $N_{\text{active}} / \text{Quota}_{\text{user}}$ | Evaluated with user tier allowance | `BorrowTransactions`, `Users` | Shows `0 / 4` (Undergrad) or `0 / 8` (Faculty); progress bar reflects saturation |
| **Tile 2: Due in 3 Days (Critical SLA)** | **READ** | Evaluated from active loans collection | `GET` | `BorrowController.GetMyActiveLoans()` | Filter: $0 \le t.\text{DueDate} - \text{Now} \le 3\text{d}$ | In-memory evaluation | `BorrowTransactions` table | Formats count ($N=0 \implies 0$); warns user if loans expire soon |
| **Tile 3: Overdue Loans** | **READ** | Evaluated from active loans collection | `GET` | `BorrowController.GetMyActiveLoans()` | Filter: $t.\text{DueDate} < \text{Now}$ | In-memory evaluation | `BorrowTransactions` table | Formats count ($N=0 \implies 0$); displays delinquent warning badge |
| **Tile 4: Unpaid Fines Balance** | **READ** | Evaluated from `FineTransactions` / user profile | `GET` | `FinesController` / `UserService` | Sum: $\sum f.\text{BalanceRemaining}$ | `_context.FineTransactions.Where(f => f.PatronId == patronId && f.Status != Settled)` | `FineTransactions` table (SUM) | Displays currency: `₱0.00` if no fines ($N=0 \implies \text{₱}0.00$) |
| **"Request Renewal (+7 Days)" Button** | **UPDATE** | `renewCustomerLoan(loanId)` in `borrowApi.ts` | `POST` | `BorrowController.Renew(loanId)`<br>`/api/borrow/{id}/renew` | `IBorrowService.RenewLoanAsync(loanId, patronId)` | `_context.BorrowTransactions.FindAsync(loanId)` | `BorrowTransactions` table (UPDATE DueDate += 7 days, RenewalCount += 1) | Shows button loading spinner; updates card due date badge to green; toasts success |
| **Table Quick Search Input** | **READ (UI)** | In-memory text filter | None | Client State Only | None | None | None | Filters past loan table rows matching title or transaction code |
| **"Ledger Export" Button** | **READ** | `exportCustomerLoans()` in `borrowApi.ts` or client CSV bundle | `GET` | `BorrowController.ExportMyLoans()` / Client | Formulates structured CSV / print view | In-memory transaction list | `BorrowTransactions` table | Downloads structured CSV audit passbook file |

---

### 3.5 Module 5: Saved Stacks & Wishlist (`/customer/favorites`)

| UI Trigger / Component | CRUD Type | Frontend Endpoint Stub | HTTP Method | Target Controller & Route | Backend Service & Method | Repository LINQ Target | Database Entity & Operation | Response State & UI Feedback |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Initial Mount: Saved Titles Ledger** | **READ** | `getCustomerFavorites()` in `favoriteApi.ts` | `GET` | Client Favorites persistence / API query | Reads patron saved book IDs & loads catalog metadata | `_context.Books.Where(b => favoriteIds.Contains(b.Id))` | `Books` table (SELECT) | Renders wishlist cards with real stock badges and location coordinates |
| **Metric 1: Total Saved Titles** | **READ** | Count of saved items | `GET` | Client State / API | Count: $|\text{Favorites}|$ | In-memory count | Client Cache / DB | Replaces mock `12 Titles` ($N=0 \implies 0\text{ Titles}$) |
| **Metric 2: Available for Hold** | **READ** | Evaluated from saved catalog items | `GET` | In-memory evaluation | Filter: $b.\text{AvailableCopies} > 0$ | In-memory count | `Books` table | Replaces mock `08 Titles` ($N=0 \implies 0\text{ Titles}$) |
| **Metric 3: Low Stock (1 Left)** | **READ** | Evaluated from saved catalog items | `GET` | In-memory evaluation | Filter: $b.\text{AvailableCopies} == 1$ | In-memory count | `Books` table | Replaces mock `03 Titles` ($N=0 \implies 0\text{ Titles}$) |
| **Metric 4: Checked Out / Waitlist** | **READ** | Evaluated from saved catalog items | `GET` | In-memory evaluation | Filter: $b.\text{AvailableCopies} == 0$ | In-memory count | `Books` table | Replaces mock `01 Title` ($N=0 \implies 0\text{ Titles}$) |
| **"+ Create Reading List" Modal** | **CREATE** | `createReadingList(name)` in `favoriteApi.ts` | `POST` | Custom list state / User profile preference | Creates named collection category | User preferences dictionary | Client Storage / DB | Creates new list filter tab; toasts list creation confirmation |
| **"Reserve All Available" Batch Action** | **CREATE** | `batchReserveFavorites()` in `reservationApi.ts` | `POST` | Loops `requestCustomerReservation()` for each available title | `IReservationService.CreateReservationAsync(...)` | `_context.Reservations.AddRangeAsync(...)` | `Reservations` table (INSERT multiple) | Validates user loan quota; places holds on all in-stock books; toasts summary |
| **Card Action: "Remove from Stacks"** | **DELETE** | `removeCustomerFavorite(id)` in `favoriteApi.ts` | `DELETE` | Removes book ID from user favorites | Updates saved list collection | User preferences dictionary | Client Storage / DB | Smooth exit animation removes card; updates metric counters |
| **"Export (BibTeX / CSV)" Button** | **READ** | Client-side citation formatter | None | Formats saved book metadata into standard BibTeX `@book{...}` or CSV | Formats bibliographic citation entries | In-memory catalog metadata | None | Triggers browser file download (`saved_stacks.bib` or `saved_stacks.csv`) |

---

### 3.6 Module 6: Patron Profile & Preferences (`/customer/profile`)

| UI Trigger / Component | CRUD Type | Frontend Endpoint Stub | HTTP Method | Target Controller & Route | Backend Service & Method | Repository LINQ Target | Database Entity & Operation | Response State & UI Feedback |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Initial Mount: Patron Profile Data** | **READ** | `fetchCurrentProfile()` in `authApi.ts` | `GET` | `AuthController.GetCurrentUser()`<br>`/api/auth/me` | `IUserService.GetByIdAsync(patronId)` | `_context.Users.FindAsync(patronId)` | `Users` table (SELECT) | Populates legal name, email, phone, student ID, department, and avatar |
| **Header Metric: Active Loans** | **READ** | `getCustomerActiveLoans()` in `borrowApi.ts` | `GET` | `BorrowController.GetMyActiveLoans()` | `IBorrowService.GetPatronActiveLoansAsync(patronId)` | `_context.BorrowTransactions.CountAsync(...)` | `BorrowTransactions` table | Replaces static `02 / 04` with real ratio ($N=0 \implies 0/4$) |
| **Header Metric: Active Holds** | **READ** | `getCustomerReservations()` in `reservationApi.ts` | `GET` | `ReservationsController.GetMyReservations()` | `IReservationService.GetPatronReservationsAsync(patronId)` | `_context.Reservations.CountAsync(...)` | `Reservations` table | Replaces static `03 / 05` with real ratio ($N=0 \implies 0/5$) |
| **Header Metric: Balance / Fines** | **READ** | Evaluated from `FineTransactions` | `GET` | `FinesController` / `UserService` | Sum of unpaid fine balances | `_context.FineTransactions.SumAsync(...)` | `FineTransactions` table | Replaces static `₱0.00` ($N=0 \implies \text{₱}0.00$) |
| **Avatar Photo Upload** | **UPDATE** | `uploadProfilePicture(base64)` in `authApi.ts` | `POST` | `AuthController.UploadProfilePicture()`<br>`/api/auth/profile-picture` | `IUserService.UpdateProfilePictureAsync(id, url)` | `_context.Users.Update(user)` | `Users` table (UPDATE ProfilePictureUrl) | Instantly previews new avatar; updates persistent store; toasts success |
| **"Save Profile & Preferences" Button** | **UPDATE** | `updateCustomerProfile(payload)` in `authApi.ts` | `PUT` | `AuthController.UpdateProfile()`<br>`/api/auth/profile` | `IUserService.UpdateProfileAsync(id, dto)` | `_context.Users.Update(user)` | `Users` table (UPDATE Phone, Department, Preferences) | Validates phone format; persists changes; toasts "Profile & preferences updated" |
| **"Copy Card No." Action Button** | **READ (UI)** | `navigator.clipboard.writeText(cardNo)` | None | Client Clipboard API | None | None | None | Copies patron's actual `LibraryCardNumber` to clipboard; toasts confirmation |
| **Security: Password Change Modal** | **UPDATE** | `changePassword(oldPass, newPass)` in `authApi.ts` | `PUT` | `AuthController.ChangePassword()`<br>`/api/auth/change-password` | `IUserService.ChangePasswordAsync(id, old, new)` | `_context.Users.Update(user)` | `Users` table (UPDATE PasswordHash) | Validates password complexity; clears modal inputs; toasts success |
| **Default Pickup Bay Dropdown** | **UPDATE** | Stored in user preferences via `updateProfile()` | `PUT` | `AuthController.UpdateProfile()` | Persists preferred staging bay | `_context.Users.Update(user)` | `Users` table | Saves selected circulation desk bay (Bay 01, Bay 02, Bay 03, Bay 04) |

---

## 4. Hardware & RFID Purge Reconciliation Across Roles

All hardware-bound simulators, solenoid locker locks, and RFID peripherals have been completely audited and eradicated across the entire application stack:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        COMPREHENSIVE HARDWARE PURGE AUDIT                              │
├───────────────────────┬───────────────────────────────────┬────────────────────────────┤
│ PANEL / ROLE          │ DEPRECATED HARDWARE ELEMENT       │ CLEAN SOFTWARE REPLACEMENT │
├───────────────────────┼───────────────────────────────────┼────────────────────────────┤
│ Customer / Patron     │ Automated Smart Lockers & PINs    │ Counter Staging Bays       │
│                       │ "Automated Locker Drawer #B-04"   │ "Counter Pickup Bay A-04"  │
│                       │ Solenoid Lock Telemetry           │ Front Desk Staff Handoff   │
│                       │ RFID Gate Pass Disarm Alerts      │ Barcode / Receipt Voucher  │
├───────────────────────┼───────────────────────────────────┼────────────────────────────┤
│ Cashier / Desk        │ "⚡ Hardware Scanner Ready"        │ Clean Barcode/ISBN Input   │
│                       │ "RFID security disarm"            │ Circulation Loan Issue     │
│                       │ "Finalize Return & Re-arm RFID"   │ Check-In Condition Triage  │
│                       │ "RFID Staging Sync Live"          │ Real-Time Holds Queue      │
│                       │ "RFID Gate Synchronization"       │ Transaction Ledger Audit   │
├───────────────────────┼───────────────────────────────────┼────────────────────────────┤
│ Admin / Management    │ "RFID Turnstile Scanner Offline"  │ Stacks Inventory Audit     │
│                       │ "Physical Stacks RFID Audit"      │ Barcode Physical Census    │
│                       │ `pingHardwareTeam` & IP sockets   │ System Alert Triage        │
│                       │ Solenoid lock status telemetry    │ Storage Capacity Metrics   │
│                       │ Antenna ID parameters             │ Accession Serial Numbers   │
└───────────────────────┴───────────────────────────────────┴────────────────────────────┘
```

---

## 5. Summary & Verification Directives

1. **Zero Mock Seed Rule ($N=0$):** Every metric rendered across the Customer portal must evaluate to `0`, `0.0`, `₱0.00`, or an empty state when the database tables are empty.
2. **Strict Universal Lambda (`=>`):** Every service method, repository query, controller endpoint, and TypeScript function must be written with clean expression bodies (`=>`).
3. **No Browser Alerts:** Native `alert()` and `confirm()` are strictly forbidden; all user feedback must route through `useToasts()` or custom confirmation modals.
4. **Complete Flowway Adherence:** All UI actions must flow through typed endpoint stubs in `Frontend/src/Endpoints/Customer/` to ASP.NET Core controllers, services, repositories, and SQL Server tables.
