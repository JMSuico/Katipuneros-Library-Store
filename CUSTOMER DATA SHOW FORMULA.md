# Katipuneros Library Store -- Master Customer Data Show Formula & Algorithmic Architecture
# Complete Mathematical Formulas, Approach Algorithms, and File Flow Governance for Customer Portal Modules

> **Binding References:**
> - System Architecture: [`Katipuneros-Library-Store/AGENTS.md`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/AGENTS.md)
> - CRUD Specification: [`CRUS LIST FOR CUSTOMER.md`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/CRUS%20LIST%20FOR%20CUSTOMER.md)
> - Master Full-Stack Skill: [`Katipuneros-Library-Store/SKILL.md`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/SKILL.md)
> - Admin Formula Authority: [`ADMIN DATA SHOW FORMULA.md`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/ADMIN%20DATA%20SHOW%20FORMULA.md)
> - Cashier Formula Authority: [`CASHIER DATA SHOW FORMULA.md`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/CASHIER%20DATA%20SHOW%20FORMULA.md)

---

## 1. Core Binding Rule: Zero Hallucinated Values & Empty Database Principle

> ### ⚠️ STRICT UNIVERSAL LAW: REAL-TIME DATA FIRST
> 1. **No Fake Seed Metrics:** If no data exists in the database ($N = 0$), **never display hardcoded mock values** (e.g. `42,000+`, `1,248`, `89.4%`, `02 Holds`, `14 History`, `12 Titles`, `₱0.00`, etc.).
> 2. **Empty State Behavior:** When the database table is empty ($N = 0$), the metric MUST display `0` or `0.0`, currency amounts `₱0.00`, rates `0.0%`, or clean neutral placeholder states (`—`).
> 3. **Division by Zero Protection:** Every percentage or ratio calculation MUST guard against zero denominators using safe ternary evaluations (e.g., `total === 0 ? 0 : (value / total) * 100`).
> 4. **Flowchain Integrity (Strict DDD Mandate):** All metrics must flow strictly through the project's Domain-Driven Design (DDD) flowchain:
>    $$\text{Database (SQL Server)} \longrightarrow \text{Repositories (EF Core 10)} \longrightarrow \text{Services (Business Logic)} \longrightarrow \text{Controllers (REST API)} \longrightarrow \text{Endpoints (TypeScript)} \longrightarrow \text{Pages (React 19)}$$
>    Direct database queries in controllers or services bypassing repositories, as well as direct fetch calls in UI components, are strictly forbidden (`AGENTS.md` Rule 1, 28, 32; `SKILL.md` Rule 56, 59).
> 5. **Universal Lambda Expression (`=>`) Rule:** Every sync/async method across Repositories, Services, Controllers, and Endpoint stubs MUST use clean, readable expression bodies (`=>`).
> 6. **Zero Browser Alerts:** Native `alert()` is prohibited; use reactive toast feedback (`useToasts.ts`).
> 7. **Customer Role Governance (RBAC Binding Law):**
>    - **PATRON CANNOT ACCESS CASHIER OR ADMIN ENDPOINTS:** Patrons cannot modify catalog holdings, manage user records, or override circulation transactions.
>    - **AUTHENTICATED USER CONTEXT:** All customer queries for loans and holds MUST be scoped to the authenticated patron's `ClaimTypes.NameIdentifier` extracted from the verified JWT bearer token.
>    - **CIRCULATION RIGHTS:** Patrons can search the catalog, request reservation holds, extend eligible loans (+7 days), save favorite titles, and manage personal profile credentials and notification preferences.

---

## 2. Summary Matrix: Customer Portal Modules & Formulas (Dashboard to Profile)

| Module | Metric Name | Mathematical Formula | Approach Algorithm | Connected Layers & Flow | Empty DB Value ($N=0$) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dashboard** | **Holds Active** | $N_{\text{holds}} = \sum_{r \in \text{Reservations}} \mathbb{I}(r.\text{PatronId} = u.\text{Id} \land r.\text{Status} \in [\text{Pending}, \text{Ready}])$ | Count active unfulfilled holds for user | `Reservations` $\to$ `ReservationRepository` $\to$ `ReservationService` $\to$ `ReservationsController` $\to$ `CustomerDashboard.tsx` | `0` |
| **Dashboard** | **Loans in Hand** | $N_{\text{loans}} = \sum_{t \in \text{BorrowTransactions}} \mathbb{I}(t.\text{PatronId} = u.\text{Id} \land t.\text{Status} = \text{Active})$ | Count physical items in patron custody | `BorrowTransactions` $\to$ `BorrowRepository` $\to$ `BorrowService` $\to$ `BorrowController` $\to$ `CustomerDashboard.tsx` | `0` |
| **Dashboard** | **Next Due Delta** | $\Delta d_{\text{due}} = \min_{t \in \text{ActiveLoans}} \lfloor (t.\text{DueDate} - \text{Now}).\text{TotalDays} \rfloor$ | Earliest days remaining until return cut-off | `BorrowTransactions` $\to$ `BorrowService` $\to$ `BorrowController` $\to$ `CustomerDashboard.tsx` | `—` |
| **Dashboard** | **Ready Hold Alert** | $N_{\text{ready}} = \sum_{r} \mathbb{I}(r.\text{PatronId} = u.\text{Id} \land r.\text{Status} = \text{Ready})$ | Count staged holds ready for counter pickup | `Reservations` $\to$ `ReservationService` $\to$ `ReservationsController` $\to$ `CustomerDashboard.tsx` | `0 ready` (neutral) |
| **Dashboard** | **Total Catalog Volumes** | $V_{\text{total}} = \sum_{b \in \text{Books}} b.\text{TotalCopies}$ | Sum of all registered physical holdings | `Books` $\to$ `BookRepository` $\to$ `BookService` $\to$ `BooksController` $\to$ `CustomerDashboard.tsx` | `0 volumes` |
| **Catalog** | **Catalog Volumes** | $N_{\text{titles}} = \text{Count}(\text{Books})$ | Total count of catalog title records | `Books` $\to$ `BookRepository` $\to$ `BookService` $\to$ `BooksController` $\to$ `CatalogPage.tsx` | `0` |
| **Catalog** | **Active Circulation** | $S_{\text{circ}} = \left( \frac{\sum (b.\text{TotalCopies} - b.\text{AvailableCopies})}{\sum b.\text{TotalCopies}} \times 100 \right)\%$ | Institutional circulation saturation ratio | `Books` $\to$ `BookRepository` $\to$ `BookService` $\to$ `BooksController` $\to$ `CatalogPage.tsx` | `0.0%` |
| **Catalog** | **Copy Availability Rate**| $A_b = \left( \frac{b.\text{AvailableCopies}}{b.\text{TotalCopies}} \times 100 \right)\% \quad (b.\text{TotalCopies} = 0 \implies 0.0\%)$ | On-shelf availability percentage per book | `Books` $\to$ `BookRepository` $\to$ `BookService` $\to$ `BooksController` $\to$ `CatalogPage.tsx` | `0.0%` |
| **Catalog** | **Waitlist Queue Depth** | $Q_p = \text{Count}(\{ r \in \text{Reservations} \mid r.\text{BookId} = b.\text{Id} \land r.\text{Status} = \text{Pending} \})$ | Number of patrons waiting for circulating title | `Reservations` $\to$ `ReservationRepository` $\to$ `ReservationService` $\to$ `CatalogPage.tsx` | `0 users waiting` |
| **Reservations** | **Active Holds** | $N_{\text{activeHolds}} = \sum_{r} \mathbb{I}(r.\text{Status} \in [\text{Pending}, \text{Ready}])$ | Total pending and staged holds for patron | `Reservations` $\to$ `ReservationRepository` $\to$ `ReservationService` $\to$ `ReservationsPage.tsx` | `0` |
| **Reservations** | **Ready for Pickup** | $N_{\text{readyPickup}} = \sum_{r} \mathbb{I}(r.\text{Status} = \text{Ready})$ | Staged reservations awaiting counter pickup | `Reservations` $\to$ `ReservationRepository` $\to$ `ReservationService` $\to$ `ReservationsPage.tsx` | `0` |
| **Reservations** | **Completed History** | $N_{\text{completed}} = \sum_{r} \mathbb{I}(r.\text{Status} = \text{Fulfilled})$ | Lifetime fulfilled reservations for patron | `Reservations` $\to$ `ReservationRepository` $\to$ `ReservationService` $\to$ `ReservationsPage.tsx` | `0` |
| **Reservations** | **Cancelled / Expired** | $N_{\text{cancelled}} = \sum_{r} \mathbb{I}(r.\text{Status} \in [\text{Cancelled}, \text{Expired}])$ | Holds voided or expired without pickup | `Reservations` $\to$ `ReservationRepository` $\to$ `ReservationService` $\to$ `ReservationsPage.tsx` | `0` |
| **Reservations** | **48h Pickup Expiry SLA** | $T_{\text{rem}} = \max(0, r.\text{ExpiryDate} - \text{Now})$ | Decrementing countdown for counter collection | `Reservations` $\to$ `ReservationsPage.tsx` | `00h 00m` |
| **Borrowings** | **Books in Possession** | $P_{\text{quota}} = \frac{N_{\text{active}}}{\text{Quota}_{\text{user}}} \times 100\% \quad (\text{Quota} \in [4, 8])$ | Borrowing capacity saturation percentage | `BorrowTransactions`, `Users` $\to$ `BorrowService` $\to$ `BorrowingsPage.tsx` | `0 / 4 (0%)` |
| **Borrowings** | **Due in 3 Days** | $N_{\text{due3d}} = \sum_{t} \mathbb{I}(t.\text{Status} = \text{Active} \land 0 \le t.\text{DueDate} - \text{Now} \le 3\text{d})$ | Loans requiring urgent return or renewal | `BorrowTransactions` $\to$ `BorrowService` $\to$ `BorrowingsPage.tsx` | `0` |
| **Borrowings** | **Overdue Loans** | $N_{\text{overdue}} = \sum_{t} \mathbb{I}(t.\text{Status} = \text{Active} \land t.\text{DueDate} < \text{Now})$ | Delinquent loans past statutory cut-off | `BorrowTransactions` $\to$ `BorrowService` $\to$ `BorrowingsPage.tsx` | `0` |
| **Borrowings** | **Fine Accrual Rate** | $F_{\text{accrued}} = \max(0, \lfloor (\text{Now} - t.\text{DueDate}).\text{TotalDays} \rfloor) \times \text{₱}15.00$ | Statutory daily delinquency penalty | `BorrowTransactions` $\to$ `BorrowService` $\to$ `BorrowingsPage.tsx` | `₱0.00` |
| **Borrowings** | **Loan Extension (+7d)** | $\text{CanRenew} \iff t.\text{RenewalCount} < 1 \land \neg \text{IsOverdue}(t) \land Q_p = 0$ | Eligibility rule: single 7-day renewal allowed | `BorrowTransactions` $\to$ `BorrowService` $\to$ `BorrowingsPage.tsx` | Action Gate |
| **Favorites** | **Total Saved Titles** | $N_{\text{saved}} = |\text{Favorites}(u)|$ | Total wishlist titles preserved by patron | Local Storage / Preferences $\to$ `FavoritesPage.tsx` | `0 Titles` |
| **Favorites** | **Available for Hold** | $N_{\text{availHold}} = \sum_{b \in \text{Fav}} \mathbb{I}(b.\text{AvailableCopies} > 0)$ | Saved books with copies currently on shelf | `Books` $\to$ `BookService` $\to$ `FavoritesPage.tsx` | `0 Titles` |
| **Favorites** | **Low Stock (1 Left)** | $N_{\text{lowStock}} = \sum_{b \in \text{Fav}} \mathbb{I}(b.\text{AvailableCopies} = 1)$ | Saved books with solitary available copy | `Books` $\to$ `BookService` $\to$ `FavoritesPage.tsx` | `0 Titles` |
| **Favorites** | **Checked Out Demand** | $N_{\text{checkedOut}} = \sum_{b \in \text{Fav}} \mathbb{I}(b.\text{AvailableCopies} = 0)$ | Saved titles requiring waitlist reservations | `Books` $\to$ `BookService` $\to$ `FavoritesPage.tsx` | `0 Titles` |
| **Profile** | **Patron Standing** | $\text{Standing} = \begin{cases} \text{Fined}, & \text{if Fines} > 0 \\ \text{Suspended}, & \text{if } \neg \text{IsActive} \\ \text{Good Standing}, & \text{otherwise} \end{cases}$ | Evaluates account circulation clearance | `Users`, `FineTransactions` $\to$ `UserService` $\to$ `ProfileSettings.tsx` | `Good Standing` |
| **Profile** | **Merit Reliability Score**| $M = \max(0, 1000 + 10 \times N_{\text{onTime}} - 50 \times N_{\text{overdue}})$ | Patron promptness index (Default 1,000) | `BorrowTransactions` $\to$ `UserService` $\to$ `ProfileSettings.tsx` | `1,000` |
| **Profile** | **Outstanding Fines** | $\sum_{f \in \text{FineTransactions}} [f.\text{BalanceRemaining} \mid f.\text{PatronId} = u.\text{Id}]$ | Cumulative unpaid fees for patron | `FineTransactions` $\to$ `FineRepository` $\to$ `ProfileSettings.tsx` | `₱0.00` |

---

## 3. Detailed Algorithmic Specifications by Module

### 3.1 Module 1: Customer Operations Dashboard (`CustomerDashboard.tsx`)

#### Metric 1.1: Active Holds Count
- **Definition:** The number of reservation requests belonging to the authenticated patron that are either awaiting cashier triage (`Pending`) or staged at the desk (`Ready`).
- **Mathematical Formula:**
  $$N_{\text{holds}} = \sum_{r \in \text{Reservations}} \mathbb{I}(r.\text{PatronId} = u.\text{Id} \land (r.\text{Status} = \text{ReservationStatus.Pending} \lor r.\text{Status} = \text{ReservationStatus.Ready}))$$
- **Approach Algorithm:**
  ```csharp
  // Backend: ReservationRepository.cs
  public async Task<int> GetPatronActiveHoldsCountAsync(Guid patronId) =>
      await _context.Reservations.CountAsync(r =>
          r.PatronId == patronId &&
          (r.Status == ReservationStatus.Pending || r.Status == ReservationStatus.Ready));
  ```
- **Connected File Flow:**
  `Reservation.cs` $\to$ `ReservationRepository.cs` $\to$ `ReservationService.cs` $\to$ `ReservationsController.cs` (`GET /api/reservations/my-holds`) $\to$ `reservationApi.ts` $\to$ `CustomerDashboard.tsx`
- **Empty State Behavior:** Table empty $\to$ `0` (`Holds Active`).

---

#### Metric 1.2: Loans in Hand
- **Definition:** The number of physical book volumes currently checked out and in the possession of the authenticated patron.
- **Mathematical Formula:**
  $$N_{\text{loans}} = \sum_{t \in \text{BorrowTransactions}} \mathbb{I}(t.\text{PatronId} = u.\text{Id} \land t.\text{Status} = \text{TransactionStatus.Active})$$
- **Approach Algorithm:**
  ```csharp
  // Backend: BorrowRepository.cs
  public async Task<int> GetPatronActiveLoansCountAsync(Guid patronId) =>
      await _context.BorrowTransactions.CountAsync(t =>
          t.PatronId == patronId && t.Status == TransactionStatus.Active);
  ```
- **Connected File Flow:**
  `BorrowTransaction.cs` $\to$ `BorrowRepository.cs` $\to$ `BorrowService.cs` $\to$ `BorrowController.cs` (`GET /api/borrow/my-loans`) $\to$ `borrowApi.ts` $\to$ `CustomerDashboard.tsx`
- **Empty State Behavior:** Table empty $\to$ `0` (`Loans in Hand`).

---

#### Metric 1.3: Nearest Due Date Delta
- **Definition:** The integer difference in calendar days between today and the closest due date among all active loans held by the patron.
- **Mathematical Formula:**
  $$\Delta d_{\text{due}} = \min_{t \in \text{ActiveLoans}} \left\lfloor (t.\text{DueDate} - \text{Now}).\text{TotalDays} \right\rfloor$$
  $$\text{Display} = \begin{cases} \text{"—"}, & \text{if } N_{\text{loans}} = 0 \\ \text{"Today"}, & \text{if } \Delta d_{\text{due}} = 0 \\ \Delta d_{\text{due}} + \text{"d"}, & \text{if } \Delta d_{\text{due}} > 0 \\ \text{"Overdue"}, & \text{if } \Delta d_{\text{due}} < 0 \end{cases}$$
- **Approach Algorithm (TypeScript Client):**
  ```typescript
  export const calculateNearestDueDate = (loans: CustomerLoanRecord[]): string => {
    if (!loans.length) return '—';
    const active = loans.filter((l) => l.status === 0); // Active
    if (!active.length) return '—';
    const now = new Date();
    const diffs = active.map((l) => {
      const due = new Date(l.dueDate);
      return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    });
    const minDays = Math.min(...diffs);
    if (minDays < 0) return 'Overdue';
    if (minDays === 0) return 'Today';
    return `${minDays}d`;
  };
  ```
- **Empty State Behavior:** No active loans $\to$ `—`.

---

#### Metric 1.4: Ready Holds Pickup Alert
- **Definition:** Dynamic circulation note alerting the patron if any reserved book has been staged at the circulation desk counter and is awaiting collection.
- **Mathematical Formula:**
  $$N_{\text{ready}} = \sum_{r \in \text{Reservations}} \mathbb{I}(r.\text{PatronId} = u.\text{Id} \land r.\text{Status} = \text{ReservationStatus.Ready})$$
  $$\text{AlertText} = \begin{cases} N_{\text{ready}} + \text{" hold ready! Pick up at Circulation Desk before 5:00 PM."}, & \text{if } N_{\text{ready}} > 0 \\ \text{"All active accounts in good standing. Explore stacks today."}, & \text{otherwise} \end{cases}$$
- **Connected File Flow:**
  `Reservations` $\to$ `ReservationService` $\to$ `ReservationsController` $\to$ `CustomerDashboard.tsx`
- **Empty State Behavior:** Neutral good standing banner.

---

### 3.2 Module 2: Scholastic Catalog & OPAC Search (`CatalogPage.tsx`)

#### Metric 2.1: Catalog Volumes & Active Circulation Saturation
- **Definition:** Total distinct accession records in the library stacks and the proportion of physical copies currently circulating among campus patrons.
- **Mathematical Formulas:**
  $$N_{\text{volumes}} = \sum_{b \in \text{Books}} b.\text{TotalCopies}$$
  $$S_{\text{circ}} = \begin{cases} 0.0\%, & \text{if } N_{\text{volumes}} = 0 \\ \left( \frac{\sum_{b} (b.\text{TotalCopies} - b.\text{AvailableCopies})}{N_{\text{volumes}}} \times 100 \right)\%, & \text{otherwise} \end{cases}$$
- **Approach Algorithm:**
  ```csharp
  // Backend: BookService.cs
  public async Task<CatalogMetricsDto> GetCatalogMetricsAsync()
  {
      var totalCopies = await _bookRepo.SumTotalCopiesAsync();
      var availableCopies = await _bookRepo.SumAvailableCopiesAsync();
      var circulating = Math.Max(0, totalCopies - availableCopies);
      var rate = totalCopies > 0 ? (double)circulating / totalCopies * 100.0 : 0.0;
      return new CatalogMetricsDto(totalCopies, Math.Round(rate, 1));
  }
  ```
- **Connected File Flow:**
  `Books` $\to$ `BookRepository.cs` $\to$ `BookService.cs` $\to$ `BooksController.cs` (`GET /api/books/metrics`) $\to$ `booksApi.ts` $\to$ `CatalogPage.tsx`
- **Empty State Behavior:** `0` Volumes, `0.0%` Active Circulation.

---

#### Metric 2.2: Stacks Copy Availability Percentage per Title
- **Definition:** The on-shelf availability ratio for an individual catalog title displayed on its catalog card.
- **Mathematical Formula:**
  $$A_b = \begin{cases} 0.0\%, & \text{if } b.\text{TotalCopies} = 0 \\ \left( \frac{b.\text{AvailableCopies}}{b.\text{TotalCopies}} \times 100 \right)\%, & \text{otherwise} \end{cases}$$
  $$\text{StatusBadge} = \begin{cases} \text{"Available • "} + b.\text{AvailableCopies} + \text{" in stock"}, & \text{if } b.\text{AvailableCopies} > 1 \\ \text{"1 Copy Left"}, & \text{if } b.\text{AvailableCopies} = 1 \\ \text{"Checked Out • 0 Available"}, & \text{if } b.\text{AvailableCopies} = 0 \end{cases}$$
- **Division by Zero Protection:** `b.TotalCopies === 0 ? 0 : (b.AvailableCopies / b.TotalCopies) * 100`.

---

#### Metric 2.3: Real-time Waitlist Queue Position Calculation
- **Definition:** The dynamic queue ordinal assigned to a patron when placing a hold on an out-of-stock circulating book.
- **Mathematical Formula:**
  $$Q_p = \text{Count}(\{ r \in \text{Reservations} \mid r.\text{BookId} = b.\text{Id} \land r.\text{Status} = \text{ReservationStatus.Pending} \land r.\text{CreatedAt} < r_{\text{current}}.\text{CreatedAt} \}) + 1$$
- **Approach Algorithm:**
  ```csharp
  // Backend: ReservationRepository.cs
  public async Task<int> CalculateQueuePositionAsync(Guid bookId, DateTime reservationDate) =>
      await _context.Reservations.CountAsync(r =>
          r.BookId == bookId &&
          r.Status == ReservationStatus.Pending &&
          r.CreatedAt < reservationDate) + 1;
  ```
- **UI Feedback:** Toast displays: `Waitlist Position Confirmed: #` + $Q_p$.

---

### 3.3 Module 3: Book Reservations & Staging (`ReservationsPage.tsx`)

#### Metric 3.1: Ribbon KPI Counters
- **Mathematical Formulas:**
  $$N_{\text{active}} = \sum_{r} \mathbb{I}(r.\text{Status} \in [\text{Pending}, \text{Ready}])$$
  $$N_{\text{ready}} = \sum_{r} \mathbb{I}(r.\text{Status} = \text{Ready})$$
  $$N_{\text{completed}} = \sum_{r} \mathbb{I}(r.\text{Status} = \text{Fulfilled})$$
  $$N_{\text{cancelled}} = \sum_{r} \mathbb{I}(r.\text{Status} \in [\text{Cancelled}, \text{Expired}])$$
- **Empty State Behavior:**
  - Active Holds: `0`
  - Ready for Pickup: `0`
  - Completed History: `0`
  - Cancelled / Expired: `0`

---

#### Metric 3.2: 48-Hour Counter Pickup Expiry SLA Countdown
- **Definition:** Real-time countdown timer tracking the statutory 48-hour pickup window once a book is approved and staged at the counter.
- **Mathematical Formula:**
  $$T_{\text{rem}} = \max(0, r.\text{ExpiryDate} - \text{Now})$$
  $$H_{\text{rem}} = \lfloor T_{\text{rem}}.\text{TotalHours} \rfloor, \quad M_{\text{rem}} = \lfloor T_{\text{rem}}.\text{Minutes} \rfloor$$
  $$\text{Display} = \begin{cases} H_{\text{rem}} + \text{"h "} + M_{\text{rem}} + \text{"m remaining"}, & \text{if } T_{\text{rem}} > 0 \\ \text{"Expired — Subject to Re-shelving"}, & \text{otherwise} \end{cases}$$
- **Connected File Flow:**
  `Reservation.ExpiryDate` $\to$ `ReservationsPage.tsx` reactive interval timer.

---

### 3.4 Module 4: Active Loans & Borrowings History (`BorrowingsPage.tsx`)

#### Metric 4.1: Books in Possession vs Max Allowance Ratio
- **Definition:** The proportion of statutory borrowing quota currently utilized by the patron.
- **Mathematical Formula:**
  $$P_{\text{quota}} = \begin{cases} 0.0\%, & \text{if } \text{Quota}_{\text{user}} = 0 \\ \left( \frac{N_{\text{activeLoans}}}{\text{Quota}_{\text{user}}} \times 100 \right)\%, & \text{otherwise} \end{cases} \quad (\text{Undergrad} = 4, \ \text{Faculty} = 8)$$
- **Visual Presentation:** Display as `N_active / Quota max allowance`, with a proportional progress bar width: `style={{ width: `${Math.min(100, (active / quota) * 100)}%` }}`.
- **Empty State Behavior:** `0 / 4 (0%)`.

---

#### Metric 4.2: Critical Loan Expiry Window ($\le 72\text{h}$)
- **Definition:** Active loans due within the next 3 calendar days that require return or renewal.
- **Mathematical Formula:**
  $$N_{\text{due3d}} = \sum_{t \in \text{BorrowTransactions}} \mathbb{I}(t.\text{PatronId} = u.\text{Id} \land t.\text{Status} = \text{Active} \land 0 \le (t.\text{DueDate} - \text{Now}).\text{TotalDays} \le 3)$$
- **Empty State Behavior:** `0` (`Action needed soon`).

---

#### Metric 4.3: Daily Fine Accrual & Institutional Cap
- **Definition:** Delinquency penalty calculating at ₱15.00/day past due date, capped at institutional ceiling (₱500.00).
- **Mathematical Formula:**
  $$d_{\text{overdue}} = \max(0, \lfloor (\text{Now} - t.\text{DueDate}).\text{TotalDays} \rfloor)$$
  $$F_{\text{loan}} = \min(d_{\text{overdue}} \times 15.00, \ 500.00)$$
  $$F_{\text{total}} = \sum_{t \in \text{OverdueLoans}} F_{\text{loan}}(t) + \sum_{f \in \text{UnsettledFines}} f.\text{BalanceRemaining}$$
- **Empty State Behavior:** `₱0.00` (`Zero delinquent fee`).

---

#### Metric 4.4: Loan Extension (+7 Days) Feasibility Engine
- **Definition:** Business rule validating whether an active loan can be extended by +7 days.
- **Mathematical Eligibility Logic:**
  $$\text{CanRenew} \iff t.\text{Status} = \text{Active} \land t.\text{RenewalCount} < 1 \land t.\text{DueDate} \ge \text{Now} \land Q_{\text{waitlist}}(t.\text{BookId}) = 0$$
- **Mutation Effect:**
  $$t.\text{DueDate}_{\text{new}} = t.\text{DueDate} + 7\text{ days}$$
  $$t.\text{RenewalCount}_{\text{new}} = t.\text{RenewalCount} + 1$$
- **Connected File Flow:**
  `BorrowController.cs` (`POST /api/borrow/{id}/renew`) $\to$ `borrowApi.ts` $\to$ `BorrowingsPage.tsx`.

---

### 3.5 Module 5: Saved Stacks & Wishlist (`FavoritesPage.tsx`)

#### Metric 5.1: Wishlist Stock Triage Counters
- **Definition:** Breakdown of patron saved titles by physical stock status in the stacks.
- **Mathematical Formulas:**
  $$N_{\text{saved}} = |\text{Favorites}|$$
  $$N_{\text{availHold}} = \sum_{b \in \text{Favorites}} \mathbb{I}(b.\text{AvailableCopies} > 0)$$
  $$N_{\text{lowStock}} = \sum_{b \in \text{Favorites}} \mathbb{I}(b.\text{AvailableCopies} = 1)$$
  $$N_{\text{checkedOut}} = \sum_{b \in \text{Favorites}} \mathbb{I}(b.\text{AvailableCopies} = 0)$$
- **Progress Bar Safe Ratios:**
  $$\text{AvailRatio} = N_{\text{saved}} = 0 \ ? \ 0 : (N_{\text{availHold}} / N_{\text{saved}}) \times 100$$
  $$\text{LowRatio} = N_{\text{saved}} = 0 \ ? \ 0 : (N_{\text{lowStock}} / N_{\text{saved}}) \times 100$$
  $$\text{CheckedOutRatio} = N_{\text{saved}} = 0 \ ? \ 0 : (N_{\text{checkedOut}} / N_{\text{saved}}) \times 100$$
- **Empty State Behavior:** All metric counts evaluate to `0 Titles` with `0%` progress bars.

---

#### Metric 5.2: Batch Hold Reservation Quota Allocation
- **Definition:** The maximum number of available saved titles that can be reserved simultaneously in a single click without exceeding the patron's active quota ceiling.
- **Mathematical Formula:**
  $$\text{RemainingQuota} = \max(0, \text{Quota}_{\text{user}} - (N_{\text{activeLoans}} + N_{\text{activeHolds}}))$$
  $$\text{BatchAllocatable} = \min(N_{\text{availHold}}, \text{RemainingQuota})$$
- **UI Button Label:** Display dynamic count: `"Reserve All Available (" + BatchAllocatable + ")"` or disabled if `BatchAllocatable === 0`.

---

#### Metric 5.3: BibTeX / CSV Citation Generation Algorithm
- **Definition:** Client-side generation of standardized bibliographic citations for thesis and academic research bundles.
- **BibTeX Transformation Algorithm:**
  ```typescript
  export const generateBibTeX = (books: BookResponse[]): string =>
    books.map((b) => {
      const citeKey = `${b.author.split(' ').pop()?.toLowerCase() || 'book'}${b.publishedYear}`;
      return `@book{${citeKey},
    title = {${b.title}},
    author = {${b.author}},
    year = {${b.publishedYear}},
    isbn = {${b.isbn}},
    note = {Call Number: ${b.deweyCode || 'Unassigned'}, JRMSU Katipuneros Library}
  }`;
    }).join('\n\n');
  ```

---

### 3.6 Module 6: Patron Profile & Preferences (`ProfileSettings.tsx`)

#### Metric 6.1: Patron Academic Standing Classifier Badge
- **Definition:** Tri-state indicator badge classifying the patron's clearance standing for circulation services.
- **Mathematical Logic:**
  $$\text{Standing} = \begin{cases} \text{"Suspended"}, & \text{if } \neg u.\text{IsActive} \\ \text{"Delinquent Fines Pending"}, & \text{if } F_{\text{unpaid}} > 0 \\ \text{"Active User • Good Standing"}, & \text{otherwise} \end{cases}$$
- **Visual Styles:**
  - Good Standing: `bg-soft-blue text-secondary`, green pulse dot.
  - Delinquent: `bg-error-container/40 text-status-danger`, red exclamation dot.
  - Suspended: `bg-surface-container-highest text-text-secondary`.

---

#### Metric 6.2: Patron Merit Reliability Score
- **Definition:** Academic merit index rewarding on-time circulation returns and penalizing delinquencies.
- **Mathematical Formula:**
  $$M = \max(0, 1000 + 10 \times N_{\text{onTime}} - 50 \times N_{\text{overdue}})$$
- **Empty State Behavior:** $N_{\text{onTime}} = 0 \land N_{\text{overdue}} = 0 \implies 1,000$ (Default Baseline Score).

---

#### Metric 6.3: Virtual Library Card Code128 / Code39 Barcode Generator
- **Definition:** High-fidelity machine-readable SVG barcode encoding the patron's verified `LibraryCardNumber` (e.g. `KP-LIB-2024-08912-JD`).
- **Algorithm:**
  - Converts alphanumeric card number into valid Code39 start/stop pattern (`*` + `CardNumber` + `*`).
  - Renders crisp SVG rect elements without external heavy font dependencies.

---

## 4. Hardware & RFID Purge Audit Across All Roles

The following table explicitly audits and records the replacement of all hardware-bound simulators and fake physical devices across Customer, Cashier, and Admin panels:

| File Location | Deprecated Hardware Terminology / Simulator | Clean Software Architecture Replacement | Rationale |
| :--- | :--- | :--- | :--- |
| `ReservationsPage.tsx` | `"Assigned Locker #B-04"` | `"Counter Staging Bay A-04"` | Replaces fake solenoid locker drawer with circulation desk pickup bays |
| `ReservationsPage.tsx` | `"Automated Locker Drawer #B-04"` | `"Circulation Counter Bay 02"` | Clean physical desk handoff |
| `ProfileSettings.tsx` | `"Smart Locker Bank B — Science Hall"` | `"Bay 01 — Main Central Circulation Desk"` | Physical library desk counters |
| `ProfileSettings.tsx` | `"Instant PIN code and dynamic barcode"` | `"Instant notification sent when staged"` | Software alert notification |
| `CheckoutBorrow.tsx` | `"⚡ Hardware Scanner Ready"` | `"Ready for Barcode / Accession Input"` | Barcode accession scanner or keyboard wedge input |
| `CheckoutBorrow.tsx` | `"RFID security disarm"` | `"Circulation Custody Transfer"` | Database status transition from Available to Borrowed |
| `CheckoutBorrow.tsx` | `"RFID Status Armed"` | `"Accession Status: Cataloged"` | Standard stacks status |
| `PendingReservations.tsx` | `"RFID Staging Sync Live"` | `"Live Holds Queue Active"` | SignalR / Web API reactive sync |
| `ReturnsFines.tsx` | `"Finalize Return & Re-arm RFID"` | `"Finalize Return & Restock Stacks"` | Increments `AvailableCopies` in SQL database |
| `Inventory.tsx` | `"RFID_UID"`, `item.rfidTag` | Accession Serial Number / Barcode | Relational catalog barcode accession |
| `BooksManager.tsx` | `"RFID Tag (Optional)"` | Accession Barcode Number | Database column `IsbnBarcode` |
| `UserManagement.tsx` | `rfid: 'RF-9821-KP77'` | `LibraryCardNumber` (e.g. `KP-LIB-2024-08912`) | Patron digital card identifier |
| `Reservations.tsx` (Admin)| `"Automated solenoid lock and RFID antenna status"` | `"Circulation Desk Staging & Hold Verification"` | Human-verified circulation workflows |
| `Notifications.tsx` (Admin)| `"Facility Hardware Failure: RFID Turnstile Scanner"` | `"Circulation Stacks Deficit Alert"` | Real inventory deficit notifications |
| `notificationApi.ts` | `pingHardwareTeam()`, `repollHardwareSocket()` | Deprecated & superseded by system health checks | Zero fake network sockets |

---

## 5. Verification Commands & Regression Directives

### 5.1 Dual-Stack Compilation Verification
```powershell
# 1. Backend Compilation (Must return 0 errors, 0 warnings)
dotnet build Backend /t:Compile

# 2. Frontend Production Bundle (Must exit code 0)
cd Frontend
npm run build

# 3. TypeScript Linter Check (Must return 0 errors)
npm run lint
```

### 5.2 Zero Mock Seed Assertion Verification
When launching the application against an empty database ($N = 0$):
- Customer Dashboard MUST display: `0 Holds Active`, `0 Loans in Hand`, `— Next Due`, `0 volumes`.
- Customer Catalog MUST display: `0 Catalog Volumes`, `0.0% Active Circulation`, clean empty search state.
- Customer Reservations MUST display: `0 Active Holds`, `0 Ready for Pickup`, `0 Completed History`, `0 Cancelled`.
- Customer Borrowings MUST display: `0 / 4 (0%) Books in Possession`, `0 Due in 3 Days`, `0 Overdue`, `₱0.00 Fines Due`.
- Customer Favorites MUST display: `0 Titles Total Saved`, `0 Titles Available for Hold`, `0%` progress bars.
- Customer Profile MUST display: Real logged-in user name, `0 / 4 Active Loans`, `0 / 5 Active Holds`, `₱0.00 Balance / Fines`.
