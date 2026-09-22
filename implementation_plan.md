# Comprehensive Frontend CRUD Analysis & Backend Integration Plan

> **Document Type**: Master Frontend UI Analysis, CRUD Inventory & Backend Integration Architecture  
> **Frontend Stack**: React 19 + TypeScript + Vite + Tailwind CSS + LayoutStyles Tokens  
> **Backend Stack**: .NET 10 + ASP.NET Core Web API + C# + EF Core 10 (Code-First)  
> **Database Engine**: SQL Server (SSMS) / PostgreSQL / MariaDB (XAMPP)  
> **Architectural Rules & Flow Chains**: Strictly governed by `SKILL.md`, `AGENTS.md`, and `CRUD_BACKEND_MAPPING.md`  
> **Mandatory Standard**: Expression-bodied lambda expressions (`=>`) for all synchronous and asynchronous operations across ALL layers.

---

## User Review Required

> [!IMPORTANT]
> - **Lambda Expression (`=>`) Standard**: In accordance with the project rule (*"used lambda expression for asynchronous and synchronous not only in the Services and Repositories, all uses asynchronous and synchronous"*), all functions in Frontend endpoint stubs, Backend Controllers, Services, Repositories, and Helpers must strictly use clean, readable expression bodies (`=>`).
> - **End-to-End Type Safety**: Every frontend endpoint stub in `Frontend/src/Endpoints/` will strictly type its request/response DTOs to mirror the C# DTO contracts in `Backend/Features/Api/DTOs/`.
> - **Database Migrations**: EF Core migrations will be maintained and executed via `dotnet ef migrations add` and `dotnet ef database update`. No manual SQL table alterations are permitted.
> - **Layer Isolation**: React page assemblies in `Pages/` contain zero business logic or direct HTTP requests. All UI triggers call typed functions in `Endpoints/` via global client `apiClient.ts`.

---

## 1. Frontend Architecture & Flow Analysis

The **Katipuneros Library Store** frontend is architected as a feature-based vertical slice design, cleanly segregated into four primary operational domains:

```
src/
├── LANDING_PAGE/                      # Public showcase, catalog, 3D hero & inquiries
│   └── Features/Pages/                # Home, Services, Products, ContactMe
├── UserRoles/Features/Pages/
│   ├── CustomersPanel/                # Patron portal (Dashboard, Catalog, Borrowings, Holds, Wishlist, Profile)
│   ├── CashiersPanel/                 # Circulation desk terminal (Intake, Checkout, Returns, Fines, Schedules)
│   └── AdminsPanel/                   # Executive management console (Users, Books, Audit, Reports, Settings, RBAC)
├── Endpoints/                         # GLOBAL CALLING: Typed API client stubs (apiClient.ts, Customer, Cashier, Admin)
├── LayoutBars/                        # GLOBAL CALLING: Chrome layouts (LandingLayout, CustomerLayout, CashierLayout, AdminLayout)
├── LayoutStyles/                      # GLOBAL CALLING: Master design tokens, colors & FontSyle typography
└── Hooks/                             # GLOBAL CALLING: useFluidResposiveness.ts, useToasts, useDraggable, useAutoRefresh
```

### Architectural Request-Response Flow Chain

```
[React 19 Component UI Event] 
  │  (Trigger: button click, form submit, modal confirm, filter pill)
  ▼
[Custom Hook / Local State]
  │  (Manages local loading, optimistic updates, toast dispatch)
  ▼
[Typed Endpoint Stub] (`Endpoints/**/*.ts`)
  │  (Dispatches lambda-based async HTTP request via apiClient.ts)
  ▼
[ASP.NET Core 10 Web API Controller]
  │  (Validates ModelState/DTO, checks [Authorize(Roles = "...")], parses JWT claims)
  ▼
[Service Layer (`ISomethingService` -> `SomethingService`)]
  │  (Enforces domain policies, quota checks, fine calculations, sanitizes via InputSanitizer.cs)
  ▼
[Repository Layer (`ISomethingRepository` -> `SomethingRepository`)]
  │  (Executes EF Core 10 LINQ queries against AppDbContext ONLY via => lambdas)
  ▼
[Database Engine (SQL Server)]
```

---

## 2. Exhaustive Real & Possible CRUD Functions by Slice

Below is the complete catalog of all **VIEW (Read)**, **CREATE (Post)**, **EDIT (Put)**, **DELETE (Remove)**, and **PATCH (Toggle/Partial)** operations discovered across all 31 frontend pages, components, and interactive dialogs.

---

### Slice 1: Public Landing Page (`LANDING_PAGE`)

| Page / Component | UI Element & Trigger | CRUD Type | Action / Flow | Target Backend Endpoint | HTTP Method | Request / Response DTO | Auth Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Home (`Home.tsx`)** | Initial page load & hero spotlight | **VIEW** | Retrieve spotlight books, new releases & patron statistics | `GET /api/books?spotlight=true`<br>`GET /api/health` | `GET` | Response: `ApiResponse<BookResponse[]>` | Public |
| **Auth Modal (`AuthModal.tsx`)** | Tab "Sign In" form submit | **CREATE** | Authenticate user credentials, obtain JWT Bearer token & role claims | `POST /api/auth/login` | `POST` | Request: `LoginRequest { Email, Password }`<br>Response: `AuthResponse { Token, Role, User }` | Public |
| **Auth Modal (`AuthModal.tsx`)** | Tab "Sign Up" form submit | **CREATE** | Register new patron account with student/faculty verification | `POST /api/auth/register` | `POST` | Request: `RegisterRequest { FullName, Email, Password, Department, CardNumber }` | Public |
| **Reservation Modal (`ReservationModal.tsx`)** | "Confirm Reservation" button submit | **CREATE** | Create public book reservation voucher with pickup branch and expected return date | `POST /api/reservations` | `POST` | Request: `CreateReservationRequest { BookId, PickupBranch, PickupDate, DurationDays }` | Public / Patron |
| **Book Detail Modal (`BookDetailModal.tsx`)** | "View Details" click on book card | **VIEW** | Fetch bibliographic metadata, Dewey classification, physical shelf bay location & copy availability | `GET /api/books/{id}` | `GET` | Response: `ApiResponse<BookDetailResponse>` | Public |
| **Product Showcase (`Product.tsx`)** | Discipline filter pills, instant search input | **VIEW** | Paginated query of library catalog with keyword search and category filtering | `GET /api/books?query={q}&categoryId={c}` | `GET` | Response: `ApiResponse<PagedResult<BookResponse>>` | Public |
| **Contact Form (`ContactForm.tsx`)** | "Send Message" button submit | **CREATE** | Submit public inquiry, sanitize via `InputSanitizer.cs`, send auto-acknowledgment email | `POST /api/contact` | `POST` | Request: `ContactSubmissionRequest { Name, Email, Subject, Message }` | Public |
| **Visitor Feedback (`ServicesSection.tsx`)** | Feedback rating stars & review submit | **CREATE** | Record visitor service feedback rating & testimonial | `POST /api/feedback` | `POST` | Request: `FeedbackSubmissionRequest { Rating, Comments, ServiceCategory }` | Public |
| **Curator Showcase (`NewlyAcquiredBooks.tsx`)** | Personnel / staff curator carousel | **VIEW** | Retrieve active archival curators and library personnel roster | `GET /api/personnel` | `GET` | Response: `ApiResponse<PersonnelResponse[]>` | Public |
| **Library Map (`LibraryMapSection.tsx`)** | Interactive floor plan pins & bay hover | **VIEW** | Query real-time stacks bay occupancy, queue count, and reading room capacity | `GET /api/branches/occupancy` | `GET` | Response: `ApiResponse<BranchOccupancyDto>` | Public |

---

### Slice 2: Customer / Patron Portal (`CustomersPanel`)

| Page / Component | UI Element & Trigger | CRUD Type | Action / Flow | Target Backend Endpoint | HTTP Method | Request / Response DTO | Auth Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Dashboard (`CustomerDashboard.tsx`)** | Page mount | **VIEW** | Load patron metrics (Active loans count, pending holds count, next due date, card standing) | `GET /api/customer/overview` | `GET` | Response: `PatronOverviewDto { ActiveLoans, PendingHolds, NextDue, Balance }` | `[Authorize(Roles = "Customer")]` |
| **Dashboard (`CustomerDashboard.tsx`)** | Instant search bar (`Enter` key) | **VIEW** | Quick search query redirecting to catalog with pre-filtered keyword | `GET /api/books?query={q}` | `GET` | Response: `ApiResponse<BookResponse[]>` | `[Authorize(Roles = "Customer")]` |
| **Catalog (`CatalogPage.tsx`)** | Discipline filter pills, availability chips, search bar | **VIEW** | Search and filter catalog by title, author, ISBN, Dewey decimal, and availability | `GET /api/books?query={q}&category={c}&available={a}` | `GET` | Response: `ApiResponse<BookResponse[]>` | `[Authorize(Roles = "Customer")]` |
| **Catalog (`CatalogPage.tsx`)** | Favorite heart toggle button | **CREATE** / **DELETE** | Add or remove book title from patron's personal reading wishlist | `POST /api/customer/favorites/toggle` | `POST` | Request: `ToggleFavoriteRequest { BookId }`<br>Response: `FavoriteStatusDto { IsFavorited }` | `[Authorize(Roles = "Customer")]` |
| **Catalog (`CatalogPage.tsx`)** | "Reserve Book" button | **CREATE** | Submit hold request for physical book copy at circulation desk or smart locker | `POST /api/reservations` | `POST` | Request: `CreateReservationRequest { BookId, PickupBranch }` | `[Authorize(Roles = "Customer")]` |
| **Borrowings (`BorrowingsPage.tsx`)** | Page mount & tab switcher (Active, Returned, Renewals) | **VIEW** | Fetch active loans and historical borrowing ledger for the authenticated patron | `GET /api/borrow/my-loans` | `GET` | Response: `ApiResponse<CustomerLoanRecord[]>` | `[Authorize(Roles = "Customer")]` |
| **Borrowings (`BorrowingsPage.tsx`)** | "Request Renewal (+7 Days)" button | **EDIT** (Update) | Extend borrowing due date by 7 days after verifying renewal policy and quota caps | `POST /api/borrow/{id}/renew` | `POST` | Request: `None (Path ID)`<br>Response: `ApiResponse<LoanRecord>` | `[Authorize(Roles = "Customer")]` |
| **Borrowings (`BorrowingsPage.tsx`)** | "Ledger Export" button | **VIEW** (Export) | Generate printable loan statement or download PDF passbook of loan history | `GET /api/borrow/my-loans/export` | `GET` | Response: `FileStreamResult (application/pdf)` | `[Authorize(Roles = "Customer")]` |
| **Reservations (`ReservationsPage.tsx`)** | Page mount & status tabs (Ready, Locker, Pending, Cancelled) | **VIEW** | Query active reservations queue with queue positions and locker PIN passes | `GET /api/reservations/my-reservations` | `GET` | Response: `ApiResponse<CustomerReservationRecord[]>` | `[Authorize(Roles = "Customer")]` |
| **Reservations (`ReservationsPage.tsx`)** | "Cancel Hold" button -> Confirm Modal | **DELETE** | Cancel active reservation hold and release allocated physical copy to next in queue | `DELETE /api/reservations/{id}` | `DELETE` | Request: `None (Path ID)`<br>Response: `ApiResponse<object>` | `[Authorize(Roles = "Customer")]` |
| **Reservations (`ReservationsPage.tsx`)** | "View Pickup Pass" button | **VIEW** | Retrieve digital pickup pass with locker access barcode and 4-digit PIN | `GET /api/reservations/{id}/pass` | `GET` | Response: `LockerPassDto { Barcode, Pin, ExpiryDate }` | `[Authorize(Roles = "Customer")]` |
| **Favorites (`FavoritesPage.tsx`)** | Page mount | **VIEW** | Retrieve patron's saved reading list with real-time stack inventory availability | `GET /api/customer/favorites` | `GET` | Response: `ApiResponse<BookResponse[]>` | `[Authorize(Roles = "Customer")]` |
| **Favorites (`FavoritesPage.tsx`)** | "+ Create Reading List" button | **CREATE** | Create custom named reading list (e.g. "Thesis Reserves", "Robotics Coursework") | `POST /api/customer/reading-lists` | `POST` | Request: `CreateReadingListRequest { Name, Description }` | `[Authorize(Roles = "Customer")]` |
| **Favorites (`FavoritesPage.tsx`)** | "Export (BibTeX / CSV)" button | **VIEW** (Export) | Generate RFC-compliant BibTeX citation file for reference managers (Zotero, Mendeley) | `GET /api/customer/favorites/export?format=bibtex` | `GET` | Response: `FileContentResult (text/plain)` | `[Authorize(Roles = "Customer")]` |
| **Favorites (`FavoritesPage.tsx`)** | "Reserve All Available" button | **CREATE** | Batch create reservation holds for all currently available books in wishlist | `POST /api/customer/reservations/batch` | `POST` | Request: `BatchReserveRequest { BookIds[] }` | `[Authorize(Roles = "Customer")]` |
| **Favorites (`FavoritesPage.tsx`)** | "Remove from List" button | **DELETE** | Remove title from specific reading list or global favorites | `DELETE /api/customer/favorites/{bookId}` | `DELETE` | Request: `None (Path ID)` | `[Authorize(Roles = "Customer")]` |
| **Profile (`ProfileSettings.tsx`)** | Page mount | **VIEW** | Retrieve patron card credentials, department standing, clearances, and preference settings | `GET /api/customer/profile` | `GET` | Response: `ApiResponse<PatronProfileDto>` | `[Authorize(Roles = "Customer")]` |
| **Profile (`ProfileSettings.tsx`)** | "Save Profile & Preferences" form submit | **EDIT** (Update) | Update patron contact information, campus address, and default shelf bay preference | `PUT /api/customer/profile` | `PUT` | Request: `UpdatePatronProfileRequest { FullName, Phone, Department, BayPreference }` | `[Authorize(Roles = "Customer")]` |
| **Profile (`ProfileSettings.tsx`)** | Dispatch rules & reminders toggles | **PATCH** | Update notification channels (SMS, Email, Push) and reminder lead time preferences | `PATCH /api/customer/preferences` | `PATCH` | Request: `UpdatePreferencesRequest { EmailAlerts, SmsAlerts, LeadDays }` | `[Authorize(Roles = "Customer")]` |
| **Profile (`ProfileSettings.tsx`)** | "Rotate Password" submit | **EDIT** (Update) | Update account password after verifying current password hash via BCrypt | `PUT /api/auth/change-password` | `PUT` | Request: `ChangePasswordRequest { CurrentPassword, NewPassword }` | `[Authorize(Roles = "Customer")]` |

---

### Slice 3: Cashier / Circulation Desk Terminal (`CashiersPanel`)

| Page / Component | UI Element & Trigger | CRUD Type | Action / Flow | Target Backend Endpoint | HTTP Method | Request / Response DTO | Auth Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Terminal Dashboard (`CashierDashboard.tsx`)** | Terminal mount | **VIEW** | Retrieve cash drawer float balance, transactions processed today, returns pending triage | `GET /api/cashier/terminal/stats` | `GET` | Response: `TerminalMetricsDto { CashDrawer, LoansCount, ReturnsCount }` | `[Authorize(Roles = "Cashier")]` |
| **Pending Holds (`PendingReservations.tsx`)** | Queue mount & filter tabs (General, High Demand, Faculty) | **VIEW** | Retrieve roster of pending book holds awaiting desk triage and physical staging | `GET /api/reservations/pending` | `GET` | Response: `ApiResponse<ReservationQueueDto[]>` | `[Authorize(Roles = "Cashier")]` |
| **Pending Holds (`PendingReservations.tsx`)** | "Approve for Pickup" single row action | **EDIT** (Update) | Transition hold status to `ReadyForPickup` and dispatch patron pickup SMS/Email | `PUT /api/reservations/{id}/approve` | `PUT` | Request: `None (Path ID)`<br>Response: `ApiResponse<Reservation>` | `[Authorize(Roles = "Cashier")]` |
| **Pending Holds (`PendingReservations.tsx`)** | "Batch Approve" button | **EDIT** (Update) | Process bulk approval for multiple checked reservations simultaneously | `POST /api/reservations/batch-approve` | `POST` | Request: `BatchApproveRequest { ReservationIds[] }` | `[Authorize(Roles = "Cashier")]` |
| **Pending Holds (`PendingReservations.tsx`)** | "Transfer to Smart Locker" button | **EDIT** (Update) | Assign designated smart locker bay (A-01 to D-20) and generate random 4-digit PIN | `POST /api/reservations/{id}/assign-locker` | `POST` | Request: `AssignLockerRequest { LockerBay, Pin }` | `[Authorize(Roles = "Cashier")]` |
| **Pending Holds (`PendingReservations.tsx`)** | "Reject Hold" modal submit | **EDIT** (Update) | Reject hold with specified institutional reason (Damaged Copy, Patron Limit Reached, Missing) | `PUT /api/reservations/{id}/reject` | `PUT` | Request: `RejectReservationRequest { Reason, InternalNotes }` | `[Authorize(Roles = "Cashier")]` |
| **Checkout Desk (`CheckoutBorrow.tsx`)** | Patron barcode / ID scanner input | **VIEW** | Verify patron identity, check unreturned items count, active fines balance, and loan eligibility | `GET /api/users/lookup?card={id}` | `GET` | Response: `ApiResponse<PatronStandingDto>` | `[Authorize(Roles = "Cashier")]` |
| **Checkout Desk (`CheckoutBorrow.tsx`)** | Book barcode scanner input | **VIEW** | Retrieve book title, shelf location, current circulation status, and physical condition | `GET /api/books/barcode/{barcode}` | `GET` | Response: `ApiResponse<BookCopyDto>` | `[Authorize(Roles = "Cashier")]` |
| **Checkout Desk (`CheckoutBorrow.tsx`)** | "Complete Checkout" button | **CREATE** | Create physical circulation loan records, update copy status to `Borrowed`, issue gate pass | `POST /api/borrow/checkout` | `POST` | Request: `CheckoutBorrowRequest { PatronId, BookBarcodes[], DueDate }`<br>Response: `CheckoutReceiptDto` | `[Authorize(Roles = "Cashier")]` |
| **Returns & Fines (`ReturnsFines.tsx`)** | Barcode scan simulation / reader | **VIEW** | Identify active borrowing record, calculate elapsed days, grace period, and base overdue fee | `GET /api/borrow/active-by-barcode/{code}` | `GET` | Response: `ActiveLoanDto { LoanId, DueDate, DaysElapsed, BaseFine }` | `[Authorize(Roles = "Cashier")]` |
| **Returns & Fines (`ReturnsFines.tsx`)** | Condition pills (Pristine, Wear, Damaged, Lost) | **VIEW** / Calc | Calculate condition surcharge in real-time (₱0 for good, ₱150 for damaged, ₱1,450 for lost) | Client/Service formula | N/A | Local computation mirrored in service logic | `[Authorize(Roles = "Cashier")]` |
| **Returns & Fines (`ReturnsFines.tsx`)** | "Complete Return" button | **CREATE** / **EDIT** | Finalize return, record return timestamp, update book available copies, and assess fine if any | `POST /api/borrow/return` | `POST` | Request: `ReturnBookRequest { Barcode, ConditionNotes, DamageFee, Method }` | `[Authorize(Roles = "Cashier")]` |
| **Returns & Fines (`ReturnsFines.tsx`)** | "Print Slip" button | **VIEW** (Print) | Dispatch 80mm thermal receipt payload to circulation station printer | `GET /api/borrow/receipt/{txId}` | `GET` | Response: `ThermalReceiptDto` | `[Authorize(Roles = "Cashier")]` |
| **Patron Lookup (`CustomerLookup.tsx`)** | Search input (Name, KP-ID, Email) | **VIEW** | Search patron directory and display summary cards with active loan counts and standing | `GET /api/users?role=0&query={q}` | `GET` | Response: `ApiResponse<UserResponse[]>` | `[Authorize(Roles = "Cashier")]` |
| **Patron Lookup (`CustomerLookup.tsx`)** | Patron card click -> `patronModal` | **VIEW** | Inspect comprehensive patron record: Active Loans tab, Holds History tab, Clearance Ledger | `GET /api/users/{id}/details` | `GET` | Response: `PatronFullDetailsDto` | `[Authorize(Roles = "Cashier")]` |
| **Patron Lookup (`CustomerLookup.tsx`)** | "Issue Clearance Certificate" button | **CREATE** | Verify zero balance & zero outstanding items, generate digitally signed clearance PDF | `POST /api/cashier/clearance/{patronId}` | `POST` | Request: `IssueClearanceRequest { PatronId }`<br>Response: `ClearanceCertificateDto` | `[Authorize(Roles = "Cashier")]` |
| **Shelf Locator (`BookAvailability.tsx`)** | Catalog query & Bay/Floor filter | **VIEW** | View real-time physical stack inventory, call numbers, shelf bay coordinates, and available copies | `GET /api/books?query={q}&bay={b}` | `GET` | Response: `ApiResponse<BookResponse[]>` | `[Authorize(Roles = "Cashier")]` |
| **Shelf Locator (`BookAvailability.tsx`)** | "Show Stacks Floorplan" -> `floorplanModal` | **VIEW** | Display interactive SVG blueprint with highlighted shelf bay coordinate | `GET /api/inventory/floorplan/{bayId}` | `GET` | Response: `FloorplanHighlightDto` | `[Authorize(Roles = "Cashier")]` |
| **Overdue Fines (`OverdueFines.tsx`)** | Ledger mount & search input | **VIEW** | Query delinquent loan ledger, calculated fines, billable days, and overdue status | `GET /api/fines?unpaidOnly=true` | `GET` | Response: `ApiResponse<FineRecord[]>` | `[Authorize(Roles = "Cashier")]` |
| **Overdue Fines (`OverdueFines.tsx`)** | "Collect & Print Receipt" button | **EDIT** (Update) | Settle fine balance via Cash, GCash, or Campus Pay and issue official receipt | `POST /api/fines/{id}/settle` | `POST` | Request: `FinePaymentRequest { FineId, AmountPaid, PaymentMethod }` | `[Authorize(Roles = "Cashier")]` |
| **Overdue Fines (`OverdueFines.tsx`)** | "Apply Courtesy Waiver" button | **EDIT** (Update) | Apply authorized courtesy waiver (up to ₱50) with required institutional justification memo | `PUT /api/fines/{id}/waive` | `PUT` | Request: `WaiveFineRequest { FineId, Reason }` | `[Authorize(Roles = "Cashier")]` |
| **Overdue Fines (`OverdueFines.tsx`)** | "Dispatch Immediate Notice" button | **CREATE** | Dispatch overdue notification notice via SMS / Email to delinquent patron | `POST /api/fines/{id}/notify` | `POST` | Request: `None (Path ID)` | `[Authorize(Roles = "Cashier")]` |
| **Transactions (`Transactions.tsx`)** | Daily ledger mount & payment filter pills | **VIEW** | Retrieve daily register transactions ledger (Overdue, Lost, Damage, Clearance) | `GET /api/cashier/transactions?date={d}` | `GET` | Response: `ApiResponse<CashierTransactionDto[]>` | `[Authorize(Roles = "Cashier")]` |
| **Transactions (`Transactions.tsx`)** | "Export Audit CSV" button | **VIEW** (Export) | Stream daily register journal CSV for fiscal reconciliation and cashier audit | `GET /api/cashier/transactions/export` | `GET` | Response: `FileStreamResult (text/csv)` | `[Authorize(Roles = "Cashier")]` |
| **Duty Schedules (`Schedules.tsx`)** | Week switcher & shift calendar | **VIEW** | View weekly desk duty roster and cashier station shift assignments | `GET /api/cashier/schedules?week={w}` | `GET` | Response: `ApiResponse<StaffShiftDto[]>` | `[Authorize(Roles = "Cashier")]` |
| **Duty Schedules (`Schedules.tsx`)** | "Request Shift Swap" form submit | **CREATE** | Submit peer-to-peer shift swap request for supervisor approval | `POST /api/cashier/schedules/swap-request` | `POST` | Request: `ShiftSwapRequest { TargetStaffId, ShiftDate, Reason }` | `[Authorize(Roles = "Cashier")]` |
| **Notifications (`Notifications.tsx`)** | Terminal alert list mount | **VIEW** | Retrieve cashier station operational alerts (locker pickups, overdue limits, desk notices) | `GET /api/cashier/notifications` | `GET` | Response: `ApiResponse<TerminalAlertDto[]>` | `[Authorize(Roles = "Cashier")]` |
| **Notifications (`Notifications.tsx`)** | "Mark All as Read" button | **PATCH** | Mark all unread terminal notifications as acknowledged | `PUT /api/cashier/notifications/mark-read` | `PUT` | Request: `None` | `[Authorize(Roles = "Cashier")]` |
| **Notifications (`Notifications.tsx`)** | "Dispatch Desk Broadcast" form | **CREATE** | Dispatch broadcast announcement to other circulation terminals | `POST /api/cashier/notifications/broadcast` | `POST` | Request: `BroadcastNoticeRequest { Title, Message, Urgency }` | `[Authorize(Roles = "Cashier")]` |

---

### Slice 4: Administrator Executive Console (`AdminsPanel`)

| Page / Component | UI Element & Trigger | CRUD Type | Action / Flow | Target Backend Endpoint | HTTP Method | Request / Response DTO | Auth Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin Dashboard (`AdminDashboard.tsx`)** | Console mount & time filter pills | **VIEW** | Load high-level executive KPIs (Active Patrons, Total Titles, Circulation Rate, Total Revenue) | `GET /api/admin/metrics?range={r}` | `GET` | Response: `ApiResponse<AdminKpiResponse>` | `[Authorize(Roles = "Admin")]` |
| **User Directory (`UserManagement.tsx`)** | Directory mount, role tabs, search bar | **VIEW** | Paginated query of user accounts filtered by role (Patron, Cashier, Admin) and status | `GET /api/users?role={r}&query={q}&status={s}` | `GET` | Response: `ApiResponse<PagedResult<UserResponse>>` | `[Authorize(Roles = "Admin")]` |
| **User Directory (`UserManagement.tsx`)** | "+ Add User" drawer form submit | **CREATE** | Provision new user account with hashed password, library card barcode, and assigned role | `POST /api/users` | `POST` | Request: `CreateUserRequest { FullName, Email, Password, Role, Department, CardNumber }` | `[Authorize(Roles = "Admin")]` |
| **User Directory (`UserManagement.tsx`)** | Edit User Profile drawer submit | **EDIT** (Update) | Update account details, institutional affiliation, department, and role grants | `PUT /api/users/{id}` | `PUT` | Request: `UpdateUserRequest { FullName, Email, Role, Department, PhoneNumber }` | `[Authorize(Roles = "Admin")]` |
| **User Directory (`UserManagement.tsx`)** | Account status toggle switch | **PATCH** | Toggle account suspension status (`Active` <-> `Suspended`) | `PUT /api/users/{id}/status` | `PUT` | Request: `ToggleStatusRequest { IsActive }` | `[Authorize(Roles = "Admin")]` |
| **User Directory (`UserManagement.tsx`)** | "Reset Password" button | **EDIT** (Update) | Generate temporary password or send password reset link to user email | `POST /api/users/{id}/reset-password` | `POST` | Request: `None (Path ID)` | `[Authorize(Roles = "Admin")]` |
| **User Directory (`UserManagement.tsx`)** | "Delete Account" row action | **DELETE** | Soft-delete user account (marks `IsActive = false`, archives historical loans) | `DELETE /api/users/{id}` | `DELETE` | Request: `None (Path ID)` | `[Authorize(Roles = "Admin")]` |
| **User Directory (`UserManagement.tsx`)** | "Export CSV / Excel" button | **VIEW** (Export) | Stream full user directory spreadsheet with circulation standing | `GET /api/users/export?format=csv` | `GET` | Response: `FileStreamResult (text/csv)` | `[Authorize(Roles = "Admin")]` |
| **Books Manager (`BooksManager.tsx`)** | Catalog mount & discipline filter pills | **VIEW** | Query master bibliographic catalog with copies breakdown (Total / Available / Bound) | `GET /api/books?page={p}&category={c}` | `GET` | Response: `ApiResponse<PagedResult<BookResponse>>` | `[Authorize(Roles = "Admin")]` |
| **Books Manager (`BooksManager.tsx`)** | "+ Add New Book" button / modal | **CREATE** | Ingest new book catalog record into database and assign Dewey classification | `POST /api/books` | `POST` | Request: `CreateBookRequest { Title, Author, Isbn, DeweyCode, CategoryId, TotalCopies, BayLocation }` | `[Authorize(Roles = "Admin")]` |
| **Books Manager (`BooksManager.tsx`)** | "Batch ISBN Import" button | **CREATE** | Ingest multiple bibliographic records from uploaded CSV/JSON ISBN list | `POST /api/books/batch-import` | `POST` | Request: `BatchIsbnImportRequest { IsbnList[] }` | `[Authorize(Roles = "Admin")]` |
| **Books Manager (`BooksManager.tsx`)** | Edit Book Metadata row action | **EDIT** (Update) | Update title, author, Dewey code, bay location, total copies, or cover asset URL | `PUT /api/books/{id}` | `PUT` | Request: `UpdateBookRequest { Title, Author, Isbn, DeweyCode, TotalCopies, BayLocation }` | `[Authorize(Roles = "Admin")]` |
| **Books Manager (`BooksManager.tsx`)** | "Archive / De-accession" action | **DELETE** | De-accession book title from circulation and archive historical records | `DELETE /api/books/{id}` | `DELETE` | Request: `None (Path ID)` | `[Authorize(Roles = "Admin")]` |
| **Books Manager (`BooksManager.tsx`)** | "Export MARC 21 / CSV" button | **VIEW** (Export) | Export catalog in Library of Congress standard MARC 21 bibliographic interchange format | `GET /api/books/export?format=marc21` | `GET` | Response: `FileStreamResult (application/octet-stream)` | `[Authorize(Roles = "Admin")]` |
| **Master Holds (`Reservations.tsx`)** | Queue mount & location filter tabs | **VIEW** | Query master reservation queue across all campus branches with locker bay assignments | `GET /api/reservations` | `GET` | Response: `ApiResponse<ReservationQueueDto[]>` | `[Authorize(Roles = "Admin")]` |
| **Master Holds (`Reservations.tsx`)** | "Batch Hold Clearance" button | **EDIT** (Update) | Clear expired holds or force-release staged items back to main stacks | `POST /api/reservations/batch-clearance` | `POST` | Request: `BatchClearanceRequest { HoldIds[], Action }` | `[Authorize(Roles = "Admin")]` |
| **Master Holds (`Reservations.tsx`)** | "Export Roster" button | **VIEW** (Export) | Stream active holds roster spreadsheet with patron details | `GET /api/reservations/export` | `GET` | Response: `FileStreamResult (text/csv)` | `[Authorize(Roles = "Admin")]` |
| **Circulation Audit (`Borrowings.tsx`)** | Audit ledger mount & search bar | **VIEW** | Inspect institutional circulation audit trail with borrower identity, due dates, and renewals | `GET /api/borrow/ledger` | `GET` | Response: `ApiResponse<BorrowTransaction[]>` | `[Authorize(Roles = "Admin")]` |
| **Circulation Audit (`Borrowings.tsx`)** | "New Circulation Loan Override" | **CREATE** | Executive manual override loan creation (bypass borrowing quota or patron standing limits) | `POST /api/borrow/override` | `POST` | Request: `LoanOverrideRequest { PatronId, BookId, DueDate, OverrideReason }` | `[Authorize(Roles = "Admin")]` |
| **Circulation Audit (`Borrowings.tsx`)** | "Extend / Renew" -> `renewalModal` | **EDIT** (Update) | Executive force renewal with custom deadline date override | `POST /api/borrow/{id}/force-renew` | `POST` | Request: `ForceRenewRequest { NewDueDate, Reason }` | `[Authorize(Roles = "Admin")]` |
| **Circulation Audit (`Borrowings.tsx`)** | "Export Loan Ledger" button | **VIEW** (Export) | Export complete circulation history ledger to CSV | `GET /api/borrow/ledger/export` | `GET` | Response: `FileStreamResult (text/csv)` | `[Authorize(Roles = "Admin")]` |
| **Master Returns (`Returns.tsx`)** | Returns journal mount & status tabs | **VIEW** | Inspect certified daily returns journal, condition logs, and delinquency records | `GET /api/admin/returns/journal` | `GET` | Response: `ApiResponse<ReturnJournalDto[]>` | `[Authorize(Roles = "Admin")]` |
| **Master Returns (`Returns.tsx`)** | "Process Bulk Returns" button | **CREATE** | Bulk return check-in for drop-box or inter-branch return batches | `POST /api/admin/returns/bulk` | `POST` | Request: `BulkReturnRequest { Barcodes[] }` | `[Authorize(Roles = "Admin")]` |
| **Master Returns (`Returns.tsx`)** | "Export Daily Returns Journal" button | **VIEW** (Export) | Download certified daily returns journal PDF / CSV | `GET /api/admin/returns/journal/export` | `GET` | Response: `FileStreamResult (application/pdf)` | `[Authorize(Roles = "Admin")]` |
| **Inventory & RFID (`Inventory.tsx`)** | Inventory registry mount & status chips | **VIEW** | Real-time physical asset registry: Tagged vs Untagged copies, preservation status | `GET /api/admin/inventory/audit` | `GET` | Response: `ApiResponse<InventoryAuditDto>` | `[Authorize(Roles = "Admin")]` |
| **Inventory & RFID (`Inventory.tsx`)** | "RFID Sync Batch" button | **CREATE** | Ingest RFID antenna readings and update physical copy stack coordinates | `POST /api/admin/inventory/rfid-sync` | `POST` | Request: `RfidSyncRequest { AntennaId, TagUids[] }` | `[Authorize(Roles = "Admin")]` |
| **Inventory & RFID (`Inventory.tsx`)** | "Ingest Physical Barcodes" button | **CREATE** | Ingest batch of newly printed physical copy barcodes for catalog title | `POST /api/admin/inventory/barcodes` | `POST` | Request: `IngestBarcodesRequest { BookId, Barcodes[] }` | `[Authorize(Roles = "Admin")]` |
| **Inventory & RFID (`Inventory.tsx`)** | "Print Shelf Tags" button | **VIEW** (Print) | Generate print spool for physical spine labels and shelf tags with Dewey call numbers | `GET /api/admin/inventory/shelf-tags` | `GET` | Response: `PdfLabelSpoolDto` | `[Authorize(Roles = "Admin")]` |
| **Circulation Analytics (`Analytics.tsx`)** | Velocity graphs & range filter (7D/30D/1Y) | **VIEW** | Query aggregated circulation velocity, peak desk utilization, and department borrowing stats | `GET /api/admin/analytics/trends?range={r}` | `GET` | Response: `ApiResponse<AnalyticsDossierDto>` | `[Authorize(Roles = "Admin")]` |
| **Circulation Analytics (`Analytics.tsx`)** | "Export Dossier (PDF/CSV)" button | **VIEW** (Export) | Generate analytical executive summary report dossier | `GET /api/admin/analytics/export` | `GET` | Response: `FileStreamResult (application/pdf)` | `[Authorize(Roles = "Admin")]` |
| **Categories (`Categories.tsx`)** | Category tree mount & search bar | **VIEW** | Browse Dewey Decimal taxonomy concordance with titles and copies breakdown | `GET /api/categories` | `GET` | Response: `ApiResponse<Category[]>` | `[Authorize(Roles = "Admin")]` |
| **Categories (`Categories.tsx`)** | "+ Add Category" -> `addCategoryModal` | **CREATE** | Add new Dewey classification range (e.g. `005.1` - Software Engineering) | `POST /api/categories` | `POST` | Request: `CreateCategoryRequest { DeweyRange, Name, ShelfBay, Description }` | `[Authorize(Roles = "Admin")]` |
| **Categories (`Categories.tsx`)** | Edit category row action | **EDIT** (Update) | Update classification name, shelf bay allocation, or sub-disciplines | `PUT /api/categories/{id}` | `PUT` | Request: `UpdateCategoryRequest { DeweyRange, Name, ShelfBay, Description }` | `[Authorize(Roles = "Admin")]` |
| **Categories (`Categories.tsx`)** | Delete category row action | **DELETE** | Remove classification (guarded: cannot delete if referenced by existing catalog books) | `DELETE /api/categories/{id}` | `DELETE` | Request: `None (Path ID)` | `[Authorize(Roles = "Admin")]` |
| **Categories (`Categories.tsx`)** | "Export Schema" button | **VIEW** (Export) | Export taxonomy schema in JSON or CSV format | `GET /api/categories/export` | `GET` | Response: `FileStreamResult (application/json)` | `[Authorize(Roles = "Admin")]` |
| **Official Reports (`Reports.tsx`)** | Template selector (CHEd A-1, PAS 16, COA) | **CREATE** (Generate) | Trigger server-side compilation of certified official compliance report dossier | `POST /api/admin/reports/generate` | `POST` | Request: `GenerateReportRequest { TemplateId, DateRange, FiscalYear }`<br>Response: `FileStreamResult (application/pdf)` | `[Authorize(Roles = "Admin")]` |
| **Official Reports (`Reports.tsx`)** | Historical dossiers archive tab | **VIEW** | List compiled historical dossiers with SHA-256 validation signatures | `GET /api/admin/reports/archive` | `GET` | Response: `ApiResponse<ReportDossierRecord[]>` | `[Authorize(Roles = "Admin")]` |
| **System Broadcasts (`Notifications.tsx`)** | Dispatch notice form & broadcast modal | **CREATE** | Dispatch multi-channel emergency announcement (In-App, SMS, Email) across roles | `POST /api/admin/notifications/broadcast` | `POST` | Request: `BroadcastRequest { Title, Message, Channels[], TargetRoles[] }` | `[Authorize(Roles = "Admin")]` |
| **System Broadcasts (`Notifications.tsx`)** | Delivery telemetry tab | **VIEW** | View real-time message delivery telemetry and open-rate metrics | `GET /api/admin/notifications/telemetry` | `GET` | Response: `ApiResponse<BroadcastTelemetryDto>` | `[Authorize(Roles = "Admin")]` |
| **RBAC Roles (`RolesPermissions.tsx`)** | Role switcher & privilege matrix | **VIEW** | View granular permission matrix for Super Admin, Cashier, Patron, and Curator | `GET /api/admin/roles/matrix` | `GET` | Response: `ApiResponse<RoleMatrixDto>` | `[Authorize(Roles = "Admin")]` |
| **RBAC Roles (`RolesPermissions.tsx`)** | "Save Role Policy" button | **EDIT** (Update) | Persist updated RBAC privilege grants and timeout policies | `PUT /api/admin/roles/{roleId}/permissions` | `PUT` | Request: `UpdateRolePermissionsRequest { RoleId, Grants[], TimeoutMinutes }` | `[Authorize(Roles = "Admin")]` |
| **RBAC Roles (`RolesPermissions.tsx`)** | "Create Custom Role" button | **CREATE** | Provision new custom administrative role | `POST /api/admin/roles` | `POST` | Request: `CreateRoleRequest { RoleName, Description, BaseGrants[] }` | `[Authorize(Roles = "Admin")]` |
| **Audit Logs (`AuditLogs.tsx`)** | Log stream mount & severity filter | **VIEW** | Inspect immutable, tamper-evident system security audit logs | `GET /api/audit/logs?severity={s}&limit={l}` | `GET` | Response: `ApiResponse<AuditLogItem[]>` | `[Authorize(Roles = "Admin")]` |
| **Audit Logs (`AuditLogs.tsx`)** | "Verify Hash Chain" button | **VIEW** | Execute cryptographic verification of SHA-256 hash-chained audit blocks | `GET /api/audit/verify-chain` | `GET` | Response: `ApiResponse<HashChainVerification>` | `[Authorize(Roles = "Admin")]` |
| **Audit Logs (`AuditLogs.tsx`)** | "Export Cryptographic Dossier" button | **VIEW** (Export) | Download signed audit certificate dossier with block proofs | `GET /api/audit/export` | `GET` | Response: `FileStreamResult (application/json)` | `[Authorize(Roles = "Admin")]` |
| **System Settings (`Settings.tsx`)** | Settings tabs mount | **VIEW** | Load global configuration parameters (Loan limits, daily fines, SMTP, Redis TTLs) | `GET /api/admin/settings` | `GET` | Response: `ApiResponse<SystemSettingsDto>` | `[Authorize(Roles = "Admin")]` |
| **System Settings (`Settings.tsx`)** | "Save Configurations" button submit | **EDIT** (Update) | Save system configuration parameters across circulation, fines, security, and hardware | `PUT /api/admin/settings` | `PUT` | Request: `UpdateSettingsRequest { LoanDays, DailyRate, FineCap, Smtp, Redis }` | `[Authorize(Roles = "Admin")]` |
| **System Settings (`Settings.tsx`)** | "Reset to Defaults" button | **EDIT** (Update) | Reset all system configuration parameters to institutional defaults | `POST /api/admin/settings/reset` | `POST` | Request: `None` | `[Authorize(Roles = "Admin")]` |
| **Admin Profile (`Profile.tsx`)** | Profile card & active sessions mount | **VIEW** | Display admin credentials, access keycard metadata, and active JWT sessions | `GET /api/admin/profile` | `GET` | Response: `ApiResponse<AdminProfileDto>` | `[Authorize(Roles = "Admin")]` |
| **Admin Profile (`Profile.tsx`)** | "Rotate Password Now" form submit | **EDIT** (Update) | Rotate administrator password hash via BCrypt | `PUT /api/admin/profile/password` | `PUT` | Request: `ChangePasswordRequest { CurrentPassword, NewPassword }` | `[Authorize(Roles = "Admin")]` |
| **Admin Profile (`Profile.tsx`)** | "Terminate All Other Sessions" button | **DELETE** | Invalidate all active JWT refresh tokens except current session | `POST /api/admin/profile/terminate-sessions` | `POST` | Request: `None` | `[Authorize(Roles = "Admin")]` |

---

## 3. Interactive Modals Catalog (16 Specialized Dialogs)

| Modal Identifier | Hosting Page / Route | Primary Role & Purpose | Form Fields & Inputs | Target Action & HTTP Method |
| :--- | :--- | :--- | :--- | :--- |
| `authModal` | Public Landing (`Home.tsx`) | Patron & Staff Authentication / Sign Up | Email, Password, Full Name, Department, Student ID | `POST /api/auth/login`<br>`POST /api/auth/register` |
| `bookDetailModal` | Public Landing (`Home.tsx`) & Catalog (`Product.tsx`) | Bibliographic detail inspection | Display-only (Dewey, MARC synopsis, availability) | `GET /api/books/{id}` |
| `reservationModal` | Public Landing (`Home.tsx`) & Catalog (`Product.tsx`) | Public book reservation voucher | Preferred pickup date, loan duration (7/14/21 days) | `POST /api/reservations` |
| `cancelModal` | Customer Portal (`ReservationsPage.tsx`) | Confirm cancellation of active reservation hold | Confirmation checkbox & reason | `DELETE /api/reservations/{id}` |
| `pickupModal` | Customer Portal (`ReservationsPage.tsx`) | Reveal smart locker access barcode and 4-digit PIN | Display-only (Barcode & PIN) | `GET /api/reservations/{id}/pass` |
| `rejection-modal` | Cashier Terminal (`PendingReservations.tsx`) | Reject pending reservation hold | Rejection reason dropdown, internal staff notes | `PUT /api/reservations/{id}/reject` |
| `patronModal` | Cashier Terminal (`CustomerLookup.tsx`) | Deep patron audit (Loans, Holds, Clearance ledger) | Tab switcher (Active Loans, Holds, Clearance) | `GET /api/users/{id}/details` |
| `floorplanModal` | Cashier Terminal (`BookAvailability.tsx`) | Interactive floor plan and physical shelf locator | Bay selector (Bay 01 to 14), floor zoom | `GET /api/inventory/floorplan/{bayId}` |
| `renewalModal` | Admin Console (`Borrowings.tsx`) | Executive force loan renewal override | New due date picker, authorization rationale | `POST /api/borrow/{id}/force-renew` |
| `addCategoryModal` | Admin Console (`Categories.tsx`) | Add new Dewey Decimal taxonomy category | Dewey range, Name, Shelf bay, Description | `POST /api/categories` |
| `broadcast-modal` | Admin Console (`Notifications.tsx`) | System-wide emergency notification dispatch | Title, Message, Channels (SMS/Email/Push), Roles | `POST /api/admin/notifications/broadcast` |
| `addUserDrawer` | Admin Console (`UserManagement.tsx`) | Slide-over drawer for user account provisioning | Full Name, Email, Password, Role, ID Number | `POST /api/users` |
| `editUserDrawer` | Admin Console (`UserManagement.tsx`) | Slide-over drawer for user profile and role editing | Full Name, Role, Department, Status toggle | `PUT /api/users/{id}` |
| `customReportModal`| Admin Console (`Reports.tsx`) | Custom report template builder | Template name, Modules checklist, Output format | `POST /api/admin/reports/custom-template` |
| `barcodeIngestModal`| Admin Console (`Inventory.tsx`) | Bulk ingest printed barcode numbers for title | Catalog book selector, Barcode text input list | `POST /api/admin/inventory/barcodes` |
| `rolePolicyModal` | Admin Console (`RolesPermissions.tsx`) | Granular RBAC privilege and timeout policy editor | Privilege checkboxes, Inactivity timeout slider | `PUT /api/admin/roles/{id}/permissions` |

---

## 4. Master Data Tables & Search Algorithms (18 Tables)

| Table DOM ID / Ref | Host Page | Columns Architecture | Filter & Search Features | Target Backend API Query |
| :--- | :--- | :--- | :--- | :--- |
| `borrowingsTable` | Customer `BorrowingsPage.tsx` | Book Title, Barcode, Borrow Date, Due Date, Duration, Fine Status, Actions | Client live search, Filter tabs (Active, Returned, Renewed) | `GET /api/borrow/my-loans` |
| `reservationsTable` | Customer `ReservationsPage.tsx` | Hold Ref, Catalog Title, Reserved Date, Fulfillment Desk, Status, Actions | Status tabs (Ready, Locker, Processing, Cancelled) | `GET /api/reservations/my-reservations` |
| `customerFavoritesTable`| Customer `FavoritesPage.tsx` | Cover, Title & Author, Dewey, Stacks Bay, Availability, Actions | Search input, Reading list selector pills | `GET /api/customer/favorites` |
| `pendingReservationsTable`| Cashier `PendingReservations.tsx`| Checkbox, Hold Ref, Patron Details, Volume, Stacks Bay, Hold Schedule, Actions | Live search, Category tabs (General, High Demand, Faculty) | `GET /api/reservations/pending` |
| `checkoutStreamTable` | Cashier `CheckoutBorrow.tsx` | Scanned Barcode, Book Title, Call No, Security Tag Status, Actions | Real-time scanner queue, Duplicate barcode guard | In-memory cart -> `POST /api/borrow/checkout` |
| `todayReturnsTable` | Cashier `ReturnsFines.tsx` | Barcode, Volume, Patron, Overdue Status, Assessed Fee, Settlement, Slip | Live search, Condition grading filters | `GET /api/borrow/returns/today` |
| `cashierPatronTable` | Cashier `CustomerLookup.tsx` | Patron Name, ID / Dept, Active Loans, Holds, Overdue Fines, Standing, Action | Keyboard shortcut (⌘K / Ctrl+K), Instant filter | `GET /api/users?role=0&query={q}` |
| `overdueLedgerTable` | Cashier `OverdueFines.tsx` | Patron ID, Book Title, Call No, Due Date, Elapsed Days, Accrued Fee, Action | Status tabs (Unpaid, In Dispute, Settled), Search | `GET /api/fines?unpaidOnly=true` |
| `dailyTransactionsTable`| Cashier `Transactions.tsx` | Tx ID, Shift Time, Type, Patron, Book, Amount, Payment Method, Status, Receipt | Category filter pills (Overdue, Lost, Damage, Clearance) | `GET /api/cashier/transactions?date={d}` |
| `shelfAvailabilityTable`| Cashier `BookAvailability.tsx`| Dewey Call No, Title, Discipline, Total Copies, Ready on Stacks, Bay, Action | Discipline pills, Floor / Bay dropdowns | `GET /api/books?query={q}&bay={b}` |
| `cashierScheduleTable` | Cashier `Schedules.tsx` | Day, Shift Slot (Morning, Afternoon, Evening), Assigned Cashier, Station | Week switcher (chevron_left, chevron_right) | `GET /api/cashier/schedules?week={w}` |
| `adminUserDirectoryTable`| Admin `UserManagement.tsx` | User ID, Full Name, Email, Institutional Role, Account Status, Loans, Actions | Role tabs (All, Patron, Cashier, Admin), Search (⌘K) | `GET /api/users?page={p}&role={r}` |
| `masterBooksTable` | Admin `BooksManager.tsx` | Title & Edition, Dewey / ISBN, Area, Copies Breakdown, Status, Actions | Category filter pills, Active status dropdown, Sort | `GET /api/books?page={p}&category={c}` |
| `adminHoldsMasterTable`| Admin `Reservations.tsx` | Hold Ref, Patron, Title, Bay / Locker Slot, Expiry, Status, Actions | Campus branch tabs, Batch selection checkboxes | `GET /api/reservations?page={p}` |
| `masterBorrowAuditTable`| Admin `Borrowings.tsx` | Loan ID, Patron, Book & Barcode, Checkout, Due Date, Renewals, Status, Actions| Filter tabs (Active, Overdue, Term), Search input | `GET /api/borrow/ledger?status={s}` |
| `returnsJournalTable` | Admin `Returns.tsx` | Return ID, Patron, Item & Barcode, Overdue Days, Fine, Condition, Desk, Slip | Status tabs (On-Time, Late, Damaged) | `GET /api/admin/returns/journal` |
| `physicalInventoryTable`| Admin `Inventory.tsx` | Barcode & RFID, Title, Call No, Stacks Coordinate, Condition, Status, Actions | Status pills (On-Shelf, Loan, Staged, Repairs) | `GET /api/admin/inventory/audit` |
| `deweyTaxonomyTable` | Admin `Categories.tsx` | Call Range, Field Name, Sub-Fields, Titles Count, Copies Count, Actions | Live search, Category selection highlight | `GET /api/categories` |

---

## 5. Export & Report Engines (13 Output Pipelines)

| Export Channel | Format | Trigger Component | Backend Generation Pipeline |
| :--- | :--- | :--- | :--- |
| **Loan Passbook Statement** | PDF | Customer `BorrowingsPage.tsx` | Server-rendered PDF of patron loan history with barcode stamp |
| **Patron Hold Voucher** | PDF (80mm) | Customer `ReservationsPage.tsx` | Thermal receipt layout with locker access barcode & PIN |
| **BibTeX Citations** | `.bib` / Plaintext | Customer `FavoritesPage.tsx` | RFC BibTeX bibliographic export for reference citation tools |
| **Intake Staging Sheet** | CSV | Cashier `PendingReservations.tsx` | CSV roster of pending holds and assigned locker bays |
| **Daily Register Audit** | CSV | Cashier `Transactions.tsx` | Shift transaction records, cash breakdown, and employee audit IDs |
| **Clearance Certificate** | Digitally Signed PDF | Cashier `CustomerLookup.tsx` | Institutional Library Clearance Certificate with SHA-256 seal |
| **User Directory Export** | CSV / XLSX | Admin `UserManagement.tsx` | Full patron/staff directory with active circulation standing |
| **Catalog MARC 21** | `.mrc` / CSV | Admin `BooksManager.tsx` | Library of Congress standard MARC 21 machine-readable records |
| **Circulation Audit Ledger** | CSV | Admin `Borrowings.tsx` | Full historical circulation ledger with checkout/return timestamps |
| **Daily Returns Journal** | PDF / CSV | Admin `Returns.tsx` | Certified daily returns journal with condition logs and fine tallies |
| **Circulation Analytics** | PDF / CSV | Admin `Analytics.tsx` | Visual circulation trends, peak usage graphs, and departmental trends |
| **Dewey Schema** | JSON / CSV | Admin `Categories.tsx` | Full Dewey Decimal taxonomy tree with title and copy distribution |
| **Cryptographic Audit** | `.jwt` / JSON / PDF | Admin `AuditLogs.tsx` | Tamper-evident audit log ledger export with SHA-256 block proofs |

---

## 6. Implementation Plan: Connecting Frontend to Backend

### Phase 1: Global HTTP Client & Endpoint Stubs Refactoring with Expression-Bodied Lambdas (`=>`)

Refactor all typed endpoint stubs in `Frontend/src/Endpoints/` to use concise arrow functions (`const fn = async (...) => ...`), strict TypeScript types, Bearer token management, and error envelope handling.

#### [MODIFY] [apiClient.ts](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/Endpoints/apiClient.ts)
- Refactor helper functions (`getAuthToken`, `setAuthToken`, `clearAuthSession`) to expression-bodied syntax.
- Ensure `apiRequest<T>` unwraps standard .NET `ApiResponse<T>` envelope `{ success, message, data, errors }`.

#### [MODIFY] [booksApi.ts](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/Endpoints/booksApi.ts)
- Expression-bodied lambdas for `getPublicBooks`, `searchBooks`, `getBookById`, `createBook`, `updateBook`, `deleteBook`.

#### [MODIFY] [Customer/borrowApi.ts](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/Endpoints/Customer/borrowApi.ts)
- Expression-bodied lambdas for `getCustomerActiveLoans`, `renewCustomerLoan`, `requestCustomerBorrow`.

#### [MODIFY] [Customer/reservationApi.ts](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/Endpoints/Customer/reservationApi.ts)
- Expression-bodied lambdas for `getCustomerReservations`, `requestCustomerReservation`, `cancelCustomerReservation`.

#### [MODIFY] [Cashier/fineApi.ts](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/Endpoints/Cashier/fineApi.ts)
- Expression-bodied lambdas for `getAllFines`, `settleFine`, `waiveFine`.

#### [MODIFY] [Cashier/transactionApi.ts](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/Endpoints/Cashier/transactionApi.ts)
- Expression-bodied lambdas for `processCashierCheckout`, `processBookReturn`, `getCirculationLedger`.

#### [MODIFY] [Admin/userApi.ts](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/Endpoints/Admin/userApi.ts)
- Expression-bodied lambdas for `getAdminUsersList`, `updateUserRole`, `toggleUserStatus`, `createAdminUser`, `deleteAdminUser`.

#### [MODIFY] [Admin/cmsApi.ts](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/Endpoints/Admin/cmsApi.ts)
- Expression-bodied lambdas for `adminCreateBook`, `adminGetCategories`, `adminCreateCategory`, `adminUpdateCategory`, `adminDeleteCategory`, `adminGetPersonnel`.

#### [MODIFY] [Admin/notificationApi.ts](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/Frontend/src/Endpoints/Admin/notificationApi.ts)
- Expression-bodied lambdas for `getAdminAlerts`, `verifyAuditChain`.

---

### Phase 2: Backend Lambda Expressions Refactoring (`=>`) Across All Layers

Refactor every Controller, Service, Repository, and Helper in `Backend/Features/` to use expression-bodied lambda syntax (`=>`) for both synchronous and asynchronous operations.

#### Repositories (`Backend/Features/Repositories/Implementations/`)
- [MODIFY] `UserRepository.cs`: All queries and CRUD via `=>`
- [MODIFY] `BookRepository.cs`: All catalog lookups and copy counters via `=>`
- [MODIFY] `BorrowRepository.cs`: Active loans, renewals, and overdue queries via `=>`
- [MODIFY] `ReservationRepository.cs`: Holds lookups, staging, and quota counts via `=>`
- [MODIFY] `FineRepository.cs`: Fine queries and balance adjustments via `=>`
- [MODIFY] `CategoryRepository.cs`: Taxonomy lookups and mutations via `=>`
- [MODIFY] `AuditRepository.cs`: SHA-256 block insertions and chain verification queries via `=>`
- [MODIFY] `ContactRepository.cs`: Inquiries and feedback persistence via `=>`
- [MODIFY] `PersonnelRepository.cs`: Staff roster queries via `=>`

#### Services (`Backend/Features/Services/Implementations/`)
- [MODIFY] `UserService.cs`: Password verification, role assignments, user status toggles via `=>`
- [MODIFY] `BookService.cs`: Catalog search, stock validation, and copy adjustments via `=>`
- [MODIFY] `BorrowService.cs`: Quota checks, renewals, return check-in, and fine triggers via `=>`
- [MODIFY] `ReservationService.cs`: Hold allocations, locker bay assignments, and cancellations via `=>`
- [MODIFY] `FineService.cs`: Overdue tariff calculations, payments, and waivers via `=>`
- [MODIFY] `CategoryService.cs`: Taxonomy governance via `=>`
- [MODIFY] `ContactService.cs`: Input sanitization and inquiry routing via `=>`
- [MODIFY] `PersonnelService.cs`: CMS operations via `=>`
- [MODIFY] `SystemHealthService.cs`: Diagnostic probes via `=>`

#### Controllers (`Backend/Features/Api/Controllers/`)
- [MODIFY] `AuthController.cs`: Actions via `=>`
- [MODIFY] `BooksController.cs`: Actions via `=>`
- [MODIFY] `BorrowController.cs`: Actions via `=>`
- [MODIFY] `ReservationsController.cs`: Actions via `=>`
- [MODIFY] `FinesController.cs`: Actions via `=>`
- [MODIFY] `CategoriesController.cs`: Actions via `=>`
- [MODIFY] `UsersController.cs`: Actions via `=>`
- [MODIFY] `PersonnelController.cs`: Actions via `=>`
- [MODIFY] `AuditController.cs`: Actions via `=>`
- [MODIFY] `ContactController.cs`: Actions via `=>`
- [MODIFY] `FeedbackController.cs`: Actions via `=>`
- [MODIFY] `HealthController.cs`: Actions via `=>`

---

### Phase 3: Database Migration Execution (`add-migration` and `update-database`)

1. Build backend solution to confirm zero syntax errors:
   ```powershell
   dotnet build Backend/Backend.csproj
   ```
2. Verify existing migrations (`InitialCreate`, `AddPersonnelAndRefinements`):
   ```powershell
   dotnet ef migrations list --project Backend
   ```
3. Apply all pending migrations to the local database:
   ```powershell
   dotnet ef database update --project Backend
   ```
4. Verify database connectivity and schema tables in SQL Server.

---

### Phase 4: Wire Frontend Pages to Typed Endpoints

Connect key interactive pages from static mock state to live endpoint calls:
1. `ContactMe/Components/ContactForm.tsx`: Wire form submission to `submitContactMessage`.
2. `LANDING_PAGE/Features/Pages/Products/Components/NewlyAcquiredBooks.tsx`: Wire catalog cards to `getPublicBooks()`.
3. `CustomersPanel/Pages/BorrowingsPage.tsx`: Wire table and renewal button to `getCustomerActiveLoans()` and `renewCustomerLoan()`.
4. `CustomersPanel/Pages/ReservationsPage.tsx`: Wire active holds and cancellation modal to `getCustomerReservations()` and `cancelCustomerReservation()`.
5. `CashiersPanel/Pages/CheckoutBorrow.tsx`: Wire checkout submission to `processCashierCheckout()`.
6. `CashiersPanel/Pages/ReturnsFines.tsx`: Wire return finalization to `processBookReturn()`.
7. `AdminsPanel/Pages/UserManagement.tsx`: Wire user directory table and status toggles to `getAdminUsersList()` and `toggleUserStatus()`.
8. `AdminsPanel/Pages/AuditLogs.tsx`: Wire cryptographic verification to `verifyAuditChain()`.

---

## Verification Plan

### Automated Verification
1. **Backend C# Compilation**:
   ```powershell
   dotnet build Backend/Backend.csproj
   ```
   *Expected: Build succeeded. 0 Errors, 0 Warnings.*
2. **EF Core Database Migration**:
   ```powershell
   dotnet ef database update --project Backend
   ```
   *Expected: Database updated successfully to latest migration snapshot.*
3. **Frontend TypeScript Check**:
   ```powershell
   npm run build --prefix Frontend
   ```
   *Expected: Vite bundle built without any TypeScript compilation errors.*

### Manual & End-to-End Verification
1. **Public Contact Submission**: Submit an inquiry on the Landing Page and verify record persistence in `ContactMessages` table.
2. **Patron Active Loans**: Log in as patron and confirm loan records rendered from `BorrowTransactions` table.
3. **Desk Checkout**: Scan patron and book barcodes in Cashier terminal and confirm new loan record created.
4. **Admin User Roster**: Navigate to `/admin/users` and confirm live user accounts with working status toggles.
5. **Scalar API Documentation**: Navigate to `http://localhost:5000/scalar/v1` to inspect all live REST endpoints.
