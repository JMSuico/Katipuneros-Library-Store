# Katipuneros Library Store -- Master Cashier Data Show Formula & Algorithmic Architecture
# Complete Mathematical Formulas, Approach Algorithms, and File Flow Governance for Cashier Point of Sale & Circulation Modules

> **Binding References:**
> - System Architecture: [`Katipuneros-Library-Store/AGENTS.md`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/AGENTS.md)
> - CRUD Specification: [`Katipuneros-Library-Store/CRUD_BACKEND_MAPPING.md`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/CRUD_BACKEND_MAPPING.md)
> - Master Full-Stack Skill: [`Katipuneros-Library-Store/SKILL.md`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/SKILL.md)
> - Admin Formula Authority: [`Katipuneros-Library-Store/ADMIN DATA SHOW FORMULA.md`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/ADMIN%20DATA%20SHOW%20FORMULA.md)
> - Master Memory Cache: [`Katipuneros-Library-Store/PLUGINS_SKILLS_MEMORY_CACHE.md`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/PLUGINS_SKILLS_MEMORY_CACHE.md)

---

## 1. Core Binding Rule: Zero Hallucinated Values & Empty Database Principle

> ### ⚠️ STRICT UNIVERSAL LAW: REAL-TIME DATA FIRST
> 1. **No Fake Seed Metrics:** If no data exists in the database ($N = 0$), **never display hardcoded mock values** (e.g. `05`, `14`, `09`, `86`, `07`, `03`, `11`, `₱280.00`, `₱1,730.00`, etc.).
> 2. **Empty State Behavior:** When the database table is empty ($N = 0$), the metric MUST display `0` or `0.0`, currency amounts `₱0.00`, rates `0.0%`, or clean placeholder states (`—`).
> 3. **Division by Zero Protection:** Every percentage or ratio calculation MUST guard against zero denominators using safe ternary evaluations (e.g., `total === 0 ? 0 : (value / total) * 100`).
> 4. **Flowchain Integrity (Strict DDD Mandate):** All metrics must flow strictly through the project's Domain-Driven Design (DDD) flowchain:
>    $$\text{Database (SQL Server)} \longrightarrow \text{Repositories (EF Core 10)} \longrightarrow \text{Services (Business Logic)} \longrightarrow \text{Controllers (REST API)} \longrightarrow \text{Endpoints (TypeScript)} \longrightarrow \text{Pages (React 19)}$$
>    Direct database queries in controllers or services bypassing repositories, as well as direct fetch calls in UI components, are strictly forbidden (`AGENTS.md` Rule 1, 28, 32; `SKILL.md` Rule 56, 59).
> 5. **Universal Lambda Expression (`=>`) Rule:** Every sync/async method across Repositories, Services, Controllers, and Endpoint stubs MUST use clean, readable expression bodies (`=>`).
> 6. **Zero Browser Alerts:** Native `alert()` is prohibited; use reactive toast feedback (`useToasts.ts`).
> 7. **Cashier Role Governance (RBAC Binding Law):**
>    - **CASHIER CANNOT ADD, EDIT, OR REMOVE BOOKS:** Book catalog and stacks holdings are strictly read-only for cashiers. Cashiers use `BookAvailability.tsx` solely to verify shelf positions, on-shelf copy availability, and reservation holds.
>    - **CASHIER CANNOT ADD, EDIT, OR REMOVE USERS:** Patron identity records are strictly read-only for cashiers. Cashiers use `CustomerLookup.tsx` solely to inspect identity credentials, check patron standing, verify active loan quotas, and initiate checkout flows.
>    - **CIRCULATION & INTAKE OPERATIONAL AUTHORITY:** Cashiers have complete operational control to review and approve/reject pending reservations, stage books into pickup bays, execute walk-in and hold checkouts, accept returns with condition assessments, calculate and collect overdue fines, and manage daily cash drawer registers.

---

## 2. Summary Matrix: Cashier Management Modules & Formulas (Dashboard to Profile)

| Module | Metric Name | Mathematical Formula | Approach Algorithm | Connected Layers & Flow | Empty DB Value ($N=0$) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dashboard** | **Pending Holds** | $N_{\text{pending}} = \sum_{r \in \text{Reservations}} \mathbb{I}(r.\text{Status} = \text{Pending})$ | Count unfulfilled hold requests in queue | `Reservations` $\to$ `CashierRepository` $\to$ `CashierService` $\to$ `CashierController` $\to$ `cashierApi` $\to$ `CashierDashboard.tsx` | `0` (`0 urgent today`) |
| **Dashboard** | **Approved Today** | $N_{\text{appToday}} = \sum_{r} \mathbb{I}(r.\text{Status} = \text{Ready} \land r.\text{UpdatedAt}.\text{Date} = \text{Today})$ | Holds approved and staged in pickup bays today | `Reservations` $\to$ `CashierRepository` $\to$ `CashierService` $\to$ `CashierController` $\to$ `CashierDashboard.tsx` | `0` (`Cleared for pickup`) |
| **Dashboard** | **To Release** | $N_{\text{toRelease}} = \sum_{r} \mathbb{I}(r.\text{Status} = \text{Ready} \land \neg r.\text{IsFulfilled})$ | Active staged reservations awaiting patron pickup | `Reservations` $\to$ `CashierRepository` $\to$ `CashierService` $\to$ `CashierController` $\to$ `CashierDashboard.tsx` | `0` (`Staged in bay`) |
| **Dashboard** | **Active Loans** | $N_{\text{active}} = \sum_{t \in \text{BorrowTransactions}} \mathbb{I}(t.\text{Status} = \text{Active})$ | Total circulating items currently in user custody | `BorrowTransactions` $\to$ `CashierRepository` $\to$ `CashierService` $\to$ `CashierController` $\to$ `CashierDashboard.tsx` | `0` (`In user custody`) |
| **Dashboard** | **Due Today** | $N_{\text{dueToday}} = \sum_{t} \mathbb{I}(t.\text{Status} = \text{Active} \land t.\text{DueDate}.\text{Date} = \text{Today})$ | Circulating loans expiring before closing today | `BorrowTransactions` $\to$ `CashierRepository` $\to$ `CashierService` $\to$ `CashierController` $\to$ `CashierDashboard.tsx` | `0` (`Target 8:00 PM`) |
| **Dashboard** | **Overdue Loans** | $N_{\text{overdue}} = \sum_{t} \mathbb{I}(t.\text{Status} = \text{Active} \land t.\text{DueDate} < \text{Now})$ | Delinquent loans past due date calculating penalties | `BorrowTransactions` $\to$ `CashierRepository` $\to$ `CashierService` $\to$ `CashierController` $\to$ `CashierDashboard.tsx` | `0` (`Zero Overdue`) |
| **Dashboard** | **Returns In Today** | $N_{\text{retToday}} = \sum_{t} \mathbb{I}(t.\text{Status} = \text{Returned} \land t.\text{ReturnDate}.\text{Date} = \text{Today})$ | Volumes checked in at desk today | `BorrowTransactions` $\to$ `CashierRepository` $\to$ `CashierService` $\to$ `CashierController` $\to$ `CashierDashboard.tsx` | `0` (`Audit cleared`) |
| **Dashboard** | **Fines Daily** | $F_{\text{today}} = \sum_{f} [f.\text{AmountPaid} \mid f.\text{PaymentDate}.\text{Date} = \text{Today}]$ | Real cash/GCash fine settlements collected today | `FineTransactions` $\to$ `CashierRepository` $\to$ `CashierService` $\to$ `CashierController` $\to$ `CashierDashboard.tsx` | `₱0.00` (`0 receipts`) |
| **Dashboard** | **Register Cash** | $\text{Cash}_{\text{total}} = \text{FloatBase} + F_{\text{today}}$ | Front desk drawer physical currency reconciliation | `CashierService` $\to$ `CashierController` $\to$ `CashierDashboard.tsx` | `₱0.00` or Float |
| **Pending Holds**| **Queue Depth** | $\text{Count}(\{ r \in \text{Reservations} \mid r.\text{Status} = \text{Pending} \})$ | Full intake hold requests awaiting cashier action | `Reservations` $\to$ `ReservationRepository` $\to$ `ReservationService` $\to$ `ReservationsController` $\to$ `PendingReservations.tsx` | `0` Pending |
| **Pending Holds**| **Urgent Today** | $\sum_{r} \mathbb{I}(r.\text{Status} = \text{Pending} \land r.\text{ReservationDate}.\text{Date} = \text{Today})$ | High-priority holds requested for same-day pickup | `Reservations` $\to$ `ReservationRepository` $\to$ `ReservationService` $\to$ `PendingReservations.tsx` | `0` Urgent |
| **Pending Holds**| **Patron Quota** | $\text{CanApprove} \iff \text{ActiveLoans}(u) + \text{ActiveHolds}(u) < \text{Quota}(u)$ | Validates undergraduate ($\le 4$) or graduate ($\le 8$) caps | `Users`, `BorrowTransactions` $\to$ `ReservationService` $\to$ `PendingReservations.tsx` | Quota Check Verified |
| **Checkout** | **Borrow Eligibility**| $\text{Eligible} \iff u.\text{IsActive} \land \text{Fines}(u) = 0 \land \text{Loans}(u) < \text{Cap}$ | Patron standing appraisal before scanning books | `Users`, `FineTransactions`, `BorrowTransactions` $\to$ `BorrowService` $\to$ `CheckoutBorrow.tsx` | Verified Clear |
| **Checkout** | **Loan Due Date** | $\text{DueDate} = \text{Now} + D_{\text{term}} \quad (D \in [7, 14, 21, 30]\text{ days})$ | Automatic calendar dueDate generator based on role | `BorrowService` $\to$ `BorrowController` $\to$ `transactionApi` $\to$ `CheckoutBorrow.tsx` | Dynamic date |
| **Returns** | **Days Overdue** | $d_{\text{overdue}} = \max(0, \lfloor (\text{ReturnDate} - \text{DueDate}).\text{TotalDays} \rfloor)$ | Non-negative integer difference between return & due | `BorrowTransactions` $\to$ `BorrowService` $\to$ `ReturnsFines.tsx` | `0 Days` |
| **Returns** | **Fine Calculation**| $F_{\text{overdue}} = \min(d_{\text{overdue}} \times R_{\text{daily}}, M_{\text{cap}}) \quad [R=₱15, M=₱500]$ | Delinquency penalty calculation capped at institutional ceiling | `BorrowService` $\to$ `FinesController` $\to$ `ReturnsFines.tsx` | `₱0.00` |
| **Returns** | **Damage Triage** | $F_{\text{total}} = F_{\text{overdue}} + F_{\text{damage}} \quad (F_{\text{damage}} \in [0, 50, 150, 300])$ | Structural fault penalty addition for damaged spines | `BorrowTransactions` $\to$ `BorrowService` $\to$ `ReturnsFines.tsx` | `₱0.00` |
| **Customers** | **Patron Standing** | $\text{Standing} = \begin{cases} \text{Fined}, & \text{if Fines} > 0 \\ \text{Suspended}, & \text{if } \neg \text{IsActive} \\ \text{Clear}, & \text{otherwise} \end{cases}$ | Read-only patron standing classification badge | `Users`, `FineTransactions` $\to$ `UserService` $\to$ `CustomerLookup.tsx` | `Good Standing` |
| **Book Avail.** | **Availability Rate**| $\left( \frac{b.\text{AvailableCopies}}{b.\text{TotalCopies}} \times 100 \right)\% \quad (b.\text{TotalCopies} = 0 \implies 0.0\%)$ | Stacks stock saturation ratio per catalog item | `Books` $\to$ `BookService` $\to$ `BooksController` $\to$ `BookAvailability.tsx` | `0.0%` |
| **Book Avail.** | **Circulating Ratio**| $b.\text{TotalCopies} - b.\text{AvailableCopies}$ | Number of copies currently checked out in field | `Books` $\to$ `BookService` $\to$ `BooksController` $\to$ `BookAvailability.tsx` | `0` in circulation |
| **Overdue/Fines**| **Outstanding Fines**| $\sum_{f \in \text{FineTransactions}} f.\text{BalanceRemaining}$ | Cumulative institutional uncollected fine balance | `FineTransactions` $\to$ `FineRepository` $\to$ `FineService` $\to$ `FinesController` $\to$ `OverdueFines.tsx` | `₱0.00` |
| **Overdue/Fines**| **Collected Today**| $\sum [f.\text{AmountPaid} \mid f.\text{Status} = \text{Settled} \land f.\text{SettledAt} = \text{Today}]$ | Sum of settled transactions recorded today | `FineTransactions` $\to$ `FineService` $\to$ `FinesController` $\to$ `fineApi` $\to$ `OverdueFines.tsx` | `₱0.00` |
| **Transactions** | **24h Ledger Count**| $\sum_{t \in \text{CirculationLedger}} \mathbb{I}(t.\text{Timestamp} \ge \text{Now} - 24\text{h})$ | Total circulation desk actions executed in past 24h | `BorrowTransactions`, `FineTransactions` $\to$ `CashierService` $\to$ `Transactions.tsx` | `0 Transactions` |
| **Notifications**| **Unread Pings** | $\sum_{n} \mathbb{I}(\neg n.\text{IsRead} \land n.\text{TargetRole} \in [\text{Cashier}, \text{All}])$ | Unread system alerts, intake alerts, and handoffs | `Notifications` $\to$ `NotificationService` $\to$ `Notifications.tsx` | `0` Unread |

---

## 3. Detailed Algorithmic Specifications by Module

### 3.1 Module 1: Cashier Operations Dashboard (`CashierDashboard.tsx`)

#### Metric 1.1: Pending Holds & Urgent Count
- **Definition:** The number of reservations currently in `Pending` status awaiting cashier review, and how many are scheduled for pickup today.
- **Mathematical Formula:**
  $$N_{\text{pending}} = \sum_{r \in \text{Reservations}} \mathbb{I}(r.\text{Status} = \text{Pending})$$
  $$N_{\text{urgent}} = \sum_{r \in \text{Reservations}} \mathbb{I}(r.\text{Status} = \text{Pending} \land r.\text{ReservationDate}.\text{Date} = \text{Today})$$
- **Approach Algorithm:**
  ```csharp
  // Backend: CashierRepository.cs
  public async Task<int> GetPendingHoldsCountAsync() =>
      await _context.Reservations.CountAsync(r => r.Status == ReservationStatus.Pending);

  public async Task<int> GetUrgentHoldsCountAsync() =>
      await _context.Reservations.CountAsync(r => r.Status == ReservationStatus.Pending && r.ReservationDate.Date == DateTime.UtcNow.Date);
  ```
- **Connected File Flow:**
  `Reservation.cs` $\to$ `CashierRepository.cs` $\to$ `CashierService.cs` $\to$ `CashierController.cs` (`GET /api/cashier/dashboard-kpis`) $\to$ `cashierApi.ts` $\to$ `CashierDashboard.tsx`
- **Empty State Behavior:** Table empty $\to$ `0` (`0 urgent today`).

---

#### Metric 1.2: Approved Today
- **Definition:** Holds approved and marked `Ready` today for patron counter collection.
- **Mathematical Formula:**
  $$N_{\text{approved}} = \sum_{r \in \text{Reservations}} \mathbb{I}(r.\text{Status} = \text{Ready} \land r.\text{UpdatedAt}.\text{Date} = \text{Today})$$
- **Connected File Flow:**
  `Reservations` $\to$ `CashierRepository.cs` $\to$ `CashierService.cs` $\to$ `CashierController.cs` $\to$ `CashierDashboard.tsx`
- **Empty State Behavior:** `0` (`Cleared for pickup`).

---

#### Metric 1.3: Books To Release
- **Definition:** Approved reservations staged in pickup lockers or bays that have not yet been handed off to the patron.
- **Mathematical Formula:**
  $$N_{\text{toRelease}} = \sum_{r \in \text{Reservations}} \mathbb{I}(r.\text{Status} = \text{Ready} \land \neg r.\text{IsFulfilled})$$
- **Connected File Flow:**
  `Reservations` $\to$ `CashierRepository.cs` $\to$ `CashierService.cs` $\to$ `CashierController.cs` $\to$ `CashierDashboard.tsx`
- **Empty State Behavior:** `0` (`Staged in Bay`).

---

#### Metric 1.4: Active Loans
- **Definition:** Total physical book copies currently circulating in user possession.
- **Mathematical Formula:**
  $$N_{\text{activeLoans}} = \sum_{t \in \text{BorrowTransactions}} \mathbb{I}(t.\text{Status} = \text{TransactionStatus.Active})$$
- **Connected File Flow:**
  `BorrowTransactions` $\to$ `CashierRepository.cs` $\to$ `CashierService.cs` $\to$ `CashierController.cs` $\to$ `CashierDashboard.tsx`
- **Empty State Behavior:** `0` (`In user custody`).

---

#### Metric 1.5: Due Today
- **Definition:** Circulating loans whose statutory return date expires at 23:59:59 today.
- **Mathematical Formula:**
  $$N_{\text{dueToday}} = \sum_{t \in \text{BorrowTransactions}} \mathbb{I}(t.\text{Status} = \text{TransactionStatus.Active} \land t.\text{DueDate}.\text{Date} = \text{Today})$$
- **Connected File Flow:**
  `BorrowTransactions` $\to$ `CashierRepository.cs` $\to$ `CashierService.cs` $\to$ `CashierController.cs` $\to$ `CashierDashboard.tsx`
- **Empty State Behavior:** `0` (`Target 8:00 PM`).

---

#### Metric 1.6: Overdue Delinquencies
- **Definition:** Active circulating volumes past their due date where fines are actively accruing.
- **Mathematical Formula:**
  $$N_{\text{overdue}} = \sum_{t \in \text{BorrowTransactions}} \mathbb{I}(t.\text{Status} = \text{TransactionStatus.Active} \land t.\text{DueDate} < \text{Now})$$
- **Connected File Flow:**
  `BorrowTransactions` $\to$ `CashierRepository.cs` $\to$ `CashierService.cs` $\to$ `CashierController.cs` $\to$ `CashierDashboard.tsx`
- **Empty State Behavior:** `0` (`Zero Overdue`).

---

#### Metric 1.7: Returns In Today
- **Definition:** Volumes physically returned, inspected, and checked in at the circulation desk today.
- **Mathematical Formula:**
  $$N_{\text{returnsToday}} = \sum_{t \in \text{BorrowTransactions}} \mathbb{I}(t.\text{Status} = \text{TransactionStatus.Returned} \land t.\text{ReturnDate}.\text{Value}.\text{Date} = \text{Today})$$
- **Connected File Flow:**
  `BorrowTransactions` $\to$ `CashierRepository.cs` $\to$ `CashierService.cs` $\to$ `CashierController.cs` $\to$ `CashierDashboard.tsx`
- **Empty State Behavior:** `0` (`Audit cleared`).

---

#### Metric 1.8: Daily Fine Settlements & Register Total
- **Definition:** Monetary fines collected at the desk today and total physical drawer cash.
- **Mathematical Formula:**
  $$F_{\text{today}} = \sum [f.\text{AmountPaid} \mid f \in \text{FineTransactions}, f.\text{PaymentDate}.\text{Date} = \text{Today}]$$
  $$\text{DrawerCash} = \text{BaseFloat} + F_{\text{today}} \quad (\text{BaseFloat} = \text{₱}1,000.00 \text{ or institutional default})$$
- **Connected File Flow:**
  `FineTransactions` $\to$ `CashierRepository.cs` $\to$ `CashierService.cs` $\to$ `CashierController.cs` $\to$ `CashierDashboard.tsx`
- **Empty State Behavior:** `₱0.00` (`0 receipts settled`).

---

#### Section 1.9: Pending Reservation Intake Queue & Overdue Queue
- **Intake Table:** Renders earliest 5 pending reservations ordered by `ReservationDate ASC`. Provides instant `Approve` and `Review / Reject` actions.
- **Overdue Table:** Renders active overdue transactions ordered by `DueDate ASC` with dynamic fine evaluation. Provides instant `Process Return` action.
- **Zero-Data Rule:** If queues are empty, tables render clean empty state cards: *"No pending reservation intake requests"* and *"No overdue items in queue"*.

---

### 3.2 Module 2: Pending Reservation Review & Physical Stacks Queue (`PendingReservations.tsx`)

#### Metric 2.1: Reservation Status Transition Architecture
- **State Machine:**
  $$\text{Pending} \xrightarrow{\text{Approve (Stage in Locker)}} \text{Ready} \xrightarrow{\text{Fulfill (Handoff)}} \text{Fulfilled (Active Loan)}$$
  $$\text{Pending} \xrightarrow{\text{Reject (Cancel)}} \text{Cancelled (Restore Book Copy)}$$
- **Approve Action Flow:**
  1. Cashier inspects reservation details.
  2. Verifies physical book in stacks bay.
  3. Clicks `Approve` $\to$ calls `POST /api/reservations/{id}/approve` $\to$ updates `Reservation.Status = Ready`, assigns pickup locker/counter code.
  4. Dispatches reactive notification to patron: *"Your book is ready for pickup in Bay 01"*.
- **Reject Action Flow:**
  1. Cashier clicks `Reject` $\to$ inputs reason (e.g., "Damaged copy", "Missing from stacks") $\to$ calls `POST /api/reservations/{id}/cancel`.
  2. Restores book copy allocation: `AvailableCopies = AvailableCopies + 1`.
  3. Notifies patron with cancellation reason.

---

### 3.3 Module 3: Circulation Counter Fast Checkout & Loan Dispensation (`CheckoutBorrow.tsx`)

#### Metric 3.1: Patron Eligibility Validation Formula
- **Evaluation Rule:**
  $$\text{CanBorrow}(u) \iff u.\text{IsActive} = \text{true} \land \text{UnpaidFines}(u) < \text{₱}100.00 \land \text{ActiveLoans}(u) < \text{Quota}(u.\text{Role})$$
- **Role Quota Matrix:**
  $$\text{Quota} = \begin{cases} 4 \text{ volumes}, & \text{Undergraduate} \\ 8 \text{ volumes}, & \text{Graduate} \\ 15 \text{ volumes}, & \text{Faculty / Doctoral} \end{cases}$$
- **Due Date Calculation:**
  $$\text{DueDate} = \text{Now} + D_{\text{term}} \quad (D \in [7, 14, 21, 30]\text{ days})$$
- **Connected File Flow:**
  `Users`, `Books`, `BorrowTransactions` $\to$ `BorrowRepository.cs` $\to$ `BorrowService.cs` $\to$ `BorrowController.cs` (`POST /api/borrow/checkout`) $\to$ `transactionApi.ts` $\to$ `CheckoutBorrow.tsx`.

---

### 3.4 Module 4: Circulation Returns & Condition Triage Desk (`ReturnsFines.tsx`)

#### Metric 4.1: Return Check-In & Overdue Penalty Assessment
- **Evaluation Formula:**
  $$d_{\text{overdue}} = \max(0, \lfloor (\text{ReturnDate} - \text{DueDate}).\text{TotalDays} \rfloor)$$
  $$F_{\text{overdue}} = \min(d_{\text{overdue}} \times R_{\text{daily}}, M_{\text{cap}}) \quad (R_{\text{daily}} = \text{₱}15.00/\text{day}, M_{\text{cap}} = \text{₱}500.00)$$
  $$F_{\text{total}} = F_{\text{overdue}} + F_{\text{damage}}$$
- **Condition Triage Matrix:**
  $$F_{\text{damage}} = \begin{cases} \text{₱}0.00, & \text{Good Condition} \\ \text{₱}50.00, & \text{Minor Wear / Pencil Marks} \\ \text{₱}150.00, & \text{Torn Pages / Spine Fault} \\ \text{₱}300.00, & \text{Severe Damage / Water Warp} \end{cases}$$
- **Check-In Execution:**
  Calls `POST /api/borrow/return` $\to$ marks `BorrowTransaction.Status = Returned`, sets `ReturnDate = UtcNow`, increments `Book.AvailableCopies = AvailableCopies + 1`. If $F_{\text{total}} > 0$, creates a record in `FineTransactions` and triggers receipt modal.

---

### 3.5 Module 5: Patron Directory & Standing Verification (`CustomerLookup.tsx`)

#### Metric 5.1: Cashier Read-Only Patron Governance
- **Strict RBAC Rule:** Cashiers **CANNOT** create, edit, or delete user accounts. No `Add User`, `Edit User`, or `Delete User` buttons shall render.
- **Patron Standing Evaluation:**
  $$\text{Standing}(u) = \begin{cases} \text{"Suspended"}, & \text{if } \neg u.\text{IsActive} \\ \text{"Delinquent / Fined"}, & \text{if } \text{UnsettledFines}(u) > 0 \lor \text{OverdueLoans}(u) > 0 \\ \text{"Good Standing"}, & \text{otherwise} \end{cases}$$
- **Operational Integration:**
  Provides an instant **"Initiate Checkout"** button that navigates directly to `/cashier/checkout?patronId={user.id}&cardNumber={user.libraryCardNumber}`.

---

### 3.6 Module 6: Real-Time Stacks Inventory & Shelf Locator (`BookAvailability.tsx`)

#### Metric 6.1: Cashier Read-Only Stacks Locator
- **Strict RBAC Rule:** Cashiers **CANNOT** create, edit, or delete books. No `Add Book`, `Edit Book`, or `Archive Book` actions shall render.
- **Stacks Availability Formula:**
  $$\text{AvailabilityRate}(b) = \begin{cases} \left(\frac{b.\text{AvailableCopies}}{b.\text{TotalCopies}} \times 100\right)\%, & \text{if } b.\text{TotalCopies} > 0 \\ 0.0\%, & \text{if } b.\text{TotalCopies} = 0 \end{cases}$$
  $$\text{CirculatingCopies}(b) = \max(0, b.\text{TotalCopies} - b.\text{AvailableCopies})$$
- **Shelf Locator Display:**
  Displays Bay, Stacks, and Dewey Call Number coordinates (e.g. `Bay 14 • Shelf 3B • Call: 005.133 ABE`).

---

### 3.7 Module 7: Circulation Desk Shift Schedules & Operating Hours (`Schedules.tsx`)

#### Metric 7.1: Operating Hours & Shift Allocation
- **Standard Institutional Schedule:**
  - Morning Shift: `08:00 AM - 12:00 PM`
  - Afternoon Shift: `01:00 PM - 05:00 PM`
  - Operating Days: Monday through Saturday (Sunday Closed).
- **Active Duty Indicator:**
  Displays currently authenticated cashier on duty, assigned terminal station (`Front Desk Bay 01`), and shift coverage.

---

### 3.8 Module 8: Delinquency Reconciliation & Fine Settlement Desk (`OverdueFines.tsx`)

#### Metric 8.1: Fine Settlement & Waiver Tariff
- **Settlement Formula:**
  $$\text{BalanceAfterPayment} = \max(0, \text{BalanceRemaining} - \text{AmountPaid})$$
  $$\text{Status} = \begin{cases} \text{Settled}, & \text{if BalanceAfterPayment} = 0 \\ \text{Partial}, & \text{if BalanceAfterPayment} > 0 \end{cases}$$
- **Waiver Protocol:**
  With documented administrative cause, authorized cashier waives penalty: `WaivedAmount = BalanceRemaining`, `BalanceRemaining = 0`, `Status = Waived`.

---

### 3.9 Module 9: Circulation Register Audit Journal (`Transactions.tsx`)

#### Metric 9.1: Real-Time Chronological Action Ledger
- **Definition:** Complete chronological ledger of checkouts, returns, payments, and cancellations executed at cashier stations.
- **Mathematical Sum:**
  $$\text{TotalDeskRevenue}_{\text{today}} = \sum_{p \in \text{FinePayments}} [p.\text{Amount} \mid p.\text{Date} = \text{Today}]$$
- **Export Pipeline:**
  Streams CSV / Excel ledger export for end-of-shift cash drawer balance audit.

---

### 3.10 Module 10: Terminal Alerts & Dispatch Notifications (`Notifications.tsx`)

#### Metric 10.1: Shift Alerts & Intake Queue Pings
- **Filter Rule:**
  $$\text{CashierAlerts} = \{ n \in \text{Notifications} \mid n.\text{RecipientRole} \in [\text{"Cashier"}, \text{"All"}] \}$$
- **Priority Classification:** `Urgent` (red pulse), `Alert` (amber warning), `Info` (blue badge).

---

### 3.11 Module 11: Cashier Identity & Security Credentials (`Profile.tsx`)

#### Metric 11.1: Authentication Session & Dynamic Avatar Sync
- **Identity Binding:** Bound to `GET /api/auth/me` and localStorage session.
- **Dynamic Cross-Component Sync:** Upon saving new profile photo, dispatches `profile-updated` and `katipuneros-auth-changed` window events. `CashierTopBar.tsx` immediately updates the top-right avatar without a page reload.

---

### 3.12 Layout Chrome: Header & Sidebar Synchronization

#### Metric 12.1: Sidebar Dynamic Badges
- **Pending Reservations Badge:**
  $$\text{Badge}_{\text{res}} = \text{Count}(\{ r \in \text{Reservations} \mid r.\text{Status} = \text{Pending} \})$$
  (If count $= 0$, badge is hidden).
- **Overdue Delinquencies Badge:**
  $$\text{Badge}_{\text{overdue}} = \text{Count}(\{ t \in \text{BorrowTransactions} \mid t.\text{DueDate} < \text{Now} \land t.\text{Status} = \text{Active} \})$$
  (If count $= 0$, badge is hidden).
- **Unread Notifications Badge:**
  $$\text{Badge}_{\text{notif}} = \text{Count}(\{ n \in \text{Notifications} \mid \neg n.\text{IsRead} \land n.\text{Role} \in [\text{"Cashier"}, \text{"All"}] \})$$

#### Metric 12.2: TopBar Dynamic Avatar Fallback
- **Initials Fallback:**
  $$\text{Initials}(name) = \begin{cases} S_1[0] + S_2[0], & \text{if two or more name parts} \\ S_1[0], & \text{if single name part} \\ \text{"JM"}, & \text{if empty} \end{cases}$$
- **Image Error Guard:** Protected by `onError={() => setAvatarError(true)}` to guarantee zero broken image displays.

---

## 4. End-to-End Implementation Checklist for Real-Time Empty State Handling

| Layer | Component / File | Verification Criteria | Expected $N=0$ Output |
| :--- | :--- | :--- | :--- |
| **Backend DTO** | `CashierDashboardKpisResponse.cs` | Strongly-typed properties for all 8 metrics | Defaults to `0`, `0.0`, `0.00m` |
| **Backend Repo** | `CashierRepository.cs` | Pure EF Core 10 queries using `CountAsync()` and `SumAsync()` | Returns `0` and empty lists |
| **Backend Service** | `CashierService.cs` | Aggregates KPIs in a single roundtrip with expression lambdas (`=>`) | Zero-safe calculations |
| **Backend Controller** | `CashierController.cs` | REST API routes under `[Route("api/cashier")]` | HTTP 200 with structured JSON |
| **TypeScript Client** | `cashierApi.ts` | Strictly-typed API methods returning interfaces | Type-safe promise resolutions |
| **Frontend UI** | `CashierDashboard.tsx` | All 8 KPI cards consume live state; zero hardcoded strings | Renders `0`, `₱0.00`, clean empty tables |
| **Frontend UI** | `PendingReservations.tsx` | Maps real `Reservation` entities; no static `reservations = {...}` | Renders clean empty queue |
| **Frontend UI** | `CheckoutBorrow.tsx` | Live patron search and barcode checkout | Empty cart, clean scanner prompt |
| **Frontend UI** | `ReturnsFines.tsx` | Live return check-in with real overdue fine calculations | Standby scan input |
| **Frontend UI** | `CustomerLookup.tsx` | Read-only patron ledger with standing pills; no Add/Edit buttons | Live users or empty state |
| **Frontend UI** | `BookAvailability.tsx`| Read-only catalog inventory with Stacks bay indicators | Live books or empty state |
| **Frontend UI** | `OverdueFines.tsx` | Live delinquent loans and unsettled fine ledger | Renders `₱0.00`, `0` overdue |
| **Frontend UI** | `CashierTopBar.tsx` | Real initials fallback, reactive avatar event sync | Dynamic name & initials |
| **Frontend UI** | `CashierSidebar.tsx` | Dynamic badge counters that disappear when count $= 0$ | No hardcoded '5', '3', '4' |

---

## 5. Architectural Governance & Rule Compliance Verification

1. **Strict DDD 6-Tier Layering:**
   Every cashier data request flows uninterrupted from SQL Server through EF Core Repositories, Domain Services, REST Controllers, TypeScript API Endpoints, to React 19 pages.
2. **Universal Lambda Expression (`=>`) Syntax:**
   All C# methods across `CashierRepository`, `CashierService`, and `CashierController` utilize clean `=>` lambda bodies.
3. **Zero Browser `alert()` or `confirm()` Calls:**
   All mutations (reservation approval, checkout completion, return processing, fine settlements) trigger animated, non-blocking toast notifications via `useToasts.ts`.
4. **Strict RBAC Enforcement:**
   Cashier panels strictly prohibit catalog and identity mutations. The Cashier role acts as a high-efficiency circulation, triage, and point-of-sale operator.
5. **No Hallucinated Data:**
   When the database contains zero records, all cards, tables, badges, and progress bars accurately display zero without falling back to mock numbers.

---

## 6. Formal Audit, Verification & Confirmation Attestation

This specification serves as the permanent, authoritative mathematical contract for Cashier Operations in the Katipuneros Library Store. All subsequent implementation plans, subagent dispatches, and code commits must strictly adhere to the formulas, flows, and governance rules articulated herein.
