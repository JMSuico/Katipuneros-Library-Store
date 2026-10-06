# Cashier Panel Fullstack Connection & Real-Time Data Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect all 11 Cashier modules, TopBar, and Sidebar to live SQL Server database through the 6-tier DDD Clean Architecture flowchain, eliminating 100% of hardcoded static data with zero-data ($N=0$) empty state handling, and enforcing strict Cashier role governance.

**Architecture:** .NET 10 Web API backend on SQL Server with EF Core 10 repositories, domain services, and REST controllers. Frontend on React 19 + TypeScript + Vite with typed API endpoints, global hooks, and shared UI primitives. Universal expression-bodied lambda syntax (`=>`) across all layers.

**Tech Stack:** .NET 10, C# 13, Entity Framework Core 10, SQL Server, React 19, TypeScript, Tailwind CSS, Vite.

**Spec:** [`Katipuneros-Library-Store/CASHIER DATA SHOW FORMULA.md`](file:///c:/Users/provu/Desktop/KATIPUNEROS%20LIBRARY%20STORE/Katipuneros-Library-Store/CASHIER%20DATA%20SHOW%20FORMULA.md)

## Global Constraints
- Cashier CANNOT add, edit, or remove Books or Users (strict RBAC).
- Zero hardcoded static/seed metrics when empty ($N=0$).
- Strict 6-tier DDD flowchain: Database -> Repository -> Service -> Controller -> Endpoint -> React Page.
- Universal lambda expression (`=>`) syntax across all C# and TypeScript stubs.
- Zero browser `alert()` or `confirm()`; use `useToasts.ts`.
- Resilient initials avatar generator with image `onError` guards.

---

### Task 1: Backend Cashier DTOs & Domain Contracts

**Files:**
- Create: `Katipuneros-Library-Store/Backend/Features/Api/DTOs/Responses/CashierResponses.cs`
- Create: `Katipuneros-Library-Store/Backend/Features/Api/DTOs/Requests/CashierRequests.cs`

**Interfaces:**
- Produces: `CashierDashboardKpisResponse`, `CashierTransactionItemResponse`, `CashierShiftSummaryResponse`

- [ ] **Step 1: Write CashierResponses DTOs**
```csharp
namespace Backend.Features.Api.DTOs.Responses;

public class CashierDashboardKpisResponse
{
    public int PendingHoldsCount { get; set; }
    public int UrgentTodayHoldsCount { get; set; }
    public int ApprovedTodayCount { get; set; }
    public int ToReleaseCount { get; set; }
    public int ActiveLoansCount { get; set; }
    public int DueTodayCount { get; set; }
    public int OverdueLoansCount { get; set; }
    public int ReturnsTodayCount { get; set; }
    public decimal FinesDailyAmount { get; set; }
    public int FinesDailyReceiptsCount { get; set; }
    public decimal TotalRegisterCash { get; set; }
    public decimal BaseFloat { get; set; } = 1000.00m;
}

public class CashierTransactionItemResponse
{
    public Guid Id { get; set; }
    public string TransactionReference { get; set; } = string.Empty;
    public string TransactionType { get; set; } = string.Empty;
    public string PatronName { get; set; } = string.Empty;
    public string LibraryCardNumber { get; set; } = string.Empty;
    public string BookTitle { get; set; } = string.Empty;
    public string Barcode { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}
```

- [ ] **Step 2: Write CashierRequests DTOs**
```csharp
namespace Backend.Features.Api.DTOs.Requests;

public class CashierTransactionFilterRequest
{
    public DateTime? Date { get; set; }
    public string? Type { get; set; }
    public string? Search { get; set; }
}
```

---

### Task 2: Backend Cashier Repository (EF Core 10)

**Files:**
- Create: `Katipuneros-Library-Store/Backend/Features/Repositories/Interfaces/ICashierRepository.cs`
- Create: `Katipuneros-Library-Store/Backend/Features/Repositories/Implementations/CashierRepository.cs`

**Interfaces:**
- Produces: `ICashierRepository` (`GetDashboardKpisAsync`, `GetDailyTransactionsAsync`, `GetUrgentIntakeQueueAsync`, `GetPendingOverdueQueueAsync`)

- [ ] **Step 1: Define ICashierRepository interface**
```csharp
namespace Backend.Features.Repositories.Interfaces;

public interface ICashierRepository
{
    Task<CashierDashboardKpisResponse> GetDashboardKpisAsync();
    Task<List<BorrowTransaction>> GetRecentBorrowTransactionsAsync(DateTime? date, string? type);
    Task<List<Reservation>> GetIntakeQueueReservationsAsync(int limit = 5);
    Task<List<BorrowTransaction>> GetOverdueQueueLoansAsync(int limit = 5);
}
```

- [ ] **Step 2: Implement CashierRepository with universal lambda expressions**
```csharp
// Implements EF Core aggregate queries across Reservations, BorrowTransactions, FineTransactions.
```

---

### Task 3: Backend Cashier Domain Service

**Files:**
- Create: `Katipuneros-Library-Store/Backend/Features/Services/Interfaces/ICashierService.cs`
- Create: `Katipuneros-Library-Store/Backend/Features/Services/Implementations/CashierService.cs`

**Interfaces:**
- Produces: `ICashierService` (`GetDashboardKpisAsync`, `GetTransactionsLedgerAsync`, `ExportTransactionsCsvAsync`)

- [ ] **Step 1: Define ICashierService**
- [ ] **Step 2: Implement CashierService with business computations and zero-division protection**

---

### Task 4: Backend Cashier REST Controller & DI Registration

**Files:**
- Create: `Katipuneros-Library-Store/Backend/Features/Api/Controllers/CashierController.cs`
- Modify: `Katipuneros-Library-Store/Backend/Program.cs`

**Interfaces:**
- Exposes: `GET /api/cashier/dashboard-kpis`, `GET /api/cashier/transactions`, `GET /api/cashier/transactions/export`, `GET /api/cashier/intake-queue`

- [ ] **Step 1: Create CashierController.cs with [Authorize(Roles = "Cashier,Admin")] and universal => lambda methods**
- [ ] **Step 2: Register ICashierRepository and ICashierService in Program.cs**
- [ ] **Step 3: Test compilation via `dotnet build Backend /t:Compile`**

---

### Task 5: Frontend TypeScript Cashier API Client

**Files:**
- Create: `Katipuneros-Library-Store/Frontend/src/Endpoints/Cashier/cashierApi.ts`
- Modify: `Katipuneros-Library-Store/Frontend/src/Endpoints/Cashier/transactionApi.ts`
- Modify: `Katipuneros-Library-Store/Frontend/src/Endpoints/Cashier/fineApi.ts`

**Interfaces:**
- Produces: `getCashierDashboardKpis()`, `getCashierTransactions()`, `exportCashierTransactionsCsv()`, `getIntakeQueue()`

- [ ] **Step 1: Implement typed API methods in cashierApi.ts consuming apiClient.ts**
- [ ] **Step 2: Align transactionApi.ts and fineApi.ts with DTO response structures**

---

### Task 6: TopBar & Sidebar Real-Time Synchronization

**Files:**
- Modify: `Katipuneros-Library-Store/Frontend/src/LayoutBars/CashierTopBar.tsx`
- Modify: `Katipuneros-Library-Store/Frontend/src/LayoutBars/CashierSidebar.tsx`

**Features:**
- Initials avatar fallback badge (`getInitials(name)`) with `onError` handling.
- Event listeners for `katipuneros-auth-changed`, `profile-updated`, and `storage`.
- Dynamic badge counts on sidebar navigation (hidden when count $= 0$).

- [ ] **Step 1: Update CashierTopBar with avatar fallback, auth event listeners, and dynamic station indicators**
- [ ] **Step 2: Update CashierSidebar to fetch real badge counts dynamically**

---

### Task 7: Cashier Dashboard Live Connection (`CashierDashboard.tsx`)

**Files:**
- Modify: `Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/CashierDashboard.tsx`

**Features:**
- Connect 8 KPI cards to `getCashierDashboardKpis()`.
- Map real pending reservations in Intake Queue with Approve/Reject triggers.
- Map real overdue loans with dynamic fine calculation in Overdue Queue.
- Shift & Register Status dynamically showing authenticated cashier and calculated drawer balance.

- [ ] **Step 1: Replace all 8 hardcoded cards with live state metrics**
- [ ] **Step 2: Replace static intake rows with dynamic table mapping and empty state**
- [ ] **Step 3: Replace static overdue rows with dynamic table mapping and return check-in actions**
- [ ] **Step 4: Connect quick action buttons to respective routes**

---

### Task 8: Pending Reservations Queue Live Connection (`PendingReservations.tsx`)

**Files:**
- Modify: `Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/PendingReservations.tsx`

**Features:**
- Eradicate static dummy dataset (`const reservations = { ... }`).
- Connect to `reservationsApi.ts` (`getPendingReservations()`, `approveReservation()`, `cancelReservation()`).
- Add search input, filter chips (All, Today, Tomorrow, Priority), and reactive toast notifications.

- [ ] **Step 1: Remove inline DOM event queries and replace with React state**
- [ ] **Step 2: Map live reservations list from backend**
- [ ] **Step 3: Wire Approve and Reject modals to API endpoints**

---

### Task 9: Checkout & Borrowing Counter Live Connection (`CheckoutBorrow.tsx`)

**Files:**
- Modify: `Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/CheckoutBorrow.tsx`

**Features:**
- Live patron search by card number or student ID.
- Real-time patron standing and loan quota check.
- Barcode scanner input looking up real book titles.
- Submit checkout via `processCashierCheckout`.

- [ ] **Step 1: Replace hardcoded DOM listeners with React controlled inputs**
- [ ] **Step 2: Implement patron lookup & book barcode staging cart**
- [ ] **Step 3: Dispatch checkout to transactionApi.ts with receipt card trigger**

---

### Task 10: Returns & Delinquency Triage Desk Live Connection (`ReturnsFines.tsx`)

**Files:**
- Modify: `Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/ReturnsFines.tsx`

**Features:**
- Book barcode check-in looking up active loan.
- Real overdue days and fine formula calculation ($d \times ₱15$).
- Condition appraisal (Good, Minor Wear, Damaged).
- Submit return via `processBookReturn`.

- [ ] **Step 1: Connect barcode scan to active loan lookup**
- [ ] **Step 2: Wire fine calculation and damage fee addition**
- [ ] **Step 3: Submit return and trigger payment/waiver modal**

---

### Task 11: Customers & Book Availability Read-Only RBAC Governance

**Files:**
- Modify: `Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/CustomerLookup.tsx`
- Modify: `Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/BookAvailability.tsx`

**Features:**
- Strict RBAC: No Add/Edit/Delete actions for Cashiers.
- `CustomerLookup.tsx`: Read-only patron directory, standing badges, and "Initiate Checkout" button.
- `BookAvailability.tsx`: Read-only stacks inventory, availability rates, and bay locations.

- [ ] **Step 1: Connect CustomerLookup.tsx to userApi.ts (read-only)**
- [ ] **Step 2: Connect BookAvailability.tsx to booksApi.ts (read-only)**

---

### Task 12: Schedules, Overdue Fines, Transactions, Notifications & Profile

**Files:**
- Modify: `Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/Schedules.tsx`
- Modify: `Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/OverdueFines.tsx`
- Modify: `Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/Transactions.tsx`
- Modify: `Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/Notifications.tsx`
- Modify: `Katipuneros-Library-Store/Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/Profile.tsx`

- [ ] **Step 1: Update Schedules.tsx with real institutional shift hours**
- [ ] **Step 2: Connect OverdueFines.tsx to fineApi.ts with settle/waive modals**
- [ ] **Step 3: Connect Transactions.tsx to cashierApi.ts with CSV export**
- [ ] **Step 4: Connect Notifications.tsx to notificationApi.ts**
- [ ] **Step 5: Connect Profile.tsx with dynamic avatar dispatch**

---

### Task 13: End-to-End Build & Validation Verification

**Validation Commands:**
- Backend: `dotnet build Backend /t:Compile` (must pass with 0 warnings, 0 errors)
- Frontend: `npm run build` in `Frontend` (must pass with 0 errors)
- Idempotency & Clean Empty State: Verify $N=0$ empty state renders cleanly without mock numbers

- [ ] **Step 1: Run Backend compile verification**
- [ ] **Step 2: Run Frontend build verification**
- [ ] **Step 3: Review all modified files against architectural rules**
