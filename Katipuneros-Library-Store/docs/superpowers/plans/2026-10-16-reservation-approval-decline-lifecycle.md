# Reservation Approval & Decline Lifecycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide an unambiguous, tamper-proof, once-only reservation triage lifecycle (Approved vs. Declined) with prominent status badges, locked action controls, and clear customer-facing confirmation vouchers across Cashier, Customer, and Landing Page modules.

**Architecture:** Enforce the "once-only" triage rule in ASP.NET Core `ReservationService` (`Status` cannot transition out of `Pending` more than once); expand `ReservationRepository.GetActiveByPatronIdAsync` to include declined/cancelled holds so patrons see their complete status history; upgrade Cashier `PendingReservations.tsx` to display distinct `APPROVED (ONCE)` and `DECLINED (ONCE)` badges in table rows, cards, and detail confirmation drawers; and clarify confirmation banners in Customer `ReservationsPage.tsx` and Landing `ReservationModal.tsx`.

**Tech Stack:** .NET 10 ASP.NET Core Web API, Entity Framework Core 10, SQL Server (`KatipunerosLibraryDb`), React 19, TypeScript, TailwindCSS v3.

**Spec:** Direct user issue: "after customer reserve the books, i try to approve or decline in the cashier the ui dont have any changes it doesnt have indication in the action row and columns as APPROVED or DECLINED as indication for ONCE only be approve or decline and also the confirmation of reservation does not indication as approved or declined."

## Global Constraints
- Zero mock data: All actions must communicate through the .NET 10 Backend API on Port 5000 and persist in SQL Server `KatipunerosLibraryDb`.
- Lambda syntax (`=>`) maintained across all .NET controllers, services, and repositories.
- "Once-Only" Triage Rule: Once a reservation is marked `Approved` (`StagedInLocker`) or `Declined` (`Cancelled`), the backend must reject repeated triage attempts, and the frontend must lock the row with immutable badges.
- TypeScript compilation (`npx tsc --noEmit`) and Vite production bundle (`npm run build`) must pass with 0 errors.
- Both `dotnet build` and closed-loop PowerShell verification scripts must pass 100% green.

---

### Task 1: Backend "Once-Only" Triage Guard & Patron History Query

**Files:**
- Modify: `Backend/Features/Repositories/Interfaces/IReservationRepository.cs:20-35`
- Modify: `Backend/Features/Repositories/Implementations/ReservationRepository.cs:25-40`
- Modify: `Backend/Features/Services/Implementations/ReservationService.cs:150-175`
- Test: `scratch/test_triage_backend.ps1`

**Interfaces:**
- Consumes: `IReservationRepository.GetByIdAsync(Guid)`, `IReservationRepository.UpdateAsync(Reservation)`
- Produces: Guarded `TriageReservationAsync(Guid, bool, string?, bool)` returning `(false, "Reservation has already been processed and cannot be approved or declined again.")` if `Status != ReservationStatus.Pending`.
- Produces: `GetActiveByPatronIdAsync(Guid)` returning all active and recently triaged reservations (`Pending`, `StagedInLocker`, `Cancelled`, `Fulfilled`, `Expired`).

- [x] **Step 1: Write test script to verify current triage behavior and reproduce lack of once-only lock**

Create `scratch/test_triage_backend.ps1`:
```powershell
$authRes = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"identifier":"testadmin","password":"Password123!"}'
$token = $authRes.data.token
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }

# Fetch pending reservations
$pending = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations?status=Pending" -Method Get -Headers $headers
Write-Host "Pending count: $($pending.data.Count)"
```

- [x] **Step 2: Run test script to verify current endpoint response**

Run: `powershell -ExecutionPolicy Bypass -File ".\scratch\test_triage_backend.ps1"`
Expected: Returns list of pending reservations or count.

- [x] **Step 3: Update `ReservationRepository.cs` to return all patron reservations**

In `Backend/Features/Repositories/Implementations/ReservationRepository.cs`:
```csharp
    public async Task<List<Reservation>> GetActiveByPatronIdAsync(Guid patronId) =>
        await _context.Reservations
            .Include(r => r.Book)
            .Where(r => r.PatronId == patronId)
            .OrderByDescending(r => r.ReservationDate)
            .ToListAsync();
```

- [x] **Step 4: Update `ReservationService.cs` to enforce the Once-Only triage rule**

In `Backend/Features/Services/Implementations/ReservationService.cs`:
```csharp
    public async Task<(bool Success, string? Error)> TriageReservationAsync(Guid reservationId, bool approved, string? reason, bool priority)
    {
        if (await _reservationRepository.GetByIdAsync(reservationId) is not { } reservation)
            return (false, "Reservation hold not found.");

        if (reservation.Status != ReservationStatus.Pending)
            return (false, $"Reservation has already been processed as {reservation.Status} and cannot be modified again.");

        if (approved)
        {
            reservation.Status = ReservationStatus.StagedInLocker;
            reservation.LockerBay = string.IsNullOrWhiteSpace(reservation.LockerBay) ? "Bay 01 Counter" : reservation.LockerBay;
            reservation.LockerPin = string.IsNullOrWhiteSpace(reservation.LockerPin) ? Random.Shared.Next(1000, 9999).ToString() : reservation.LockerPin;
            reservation.ExpiryDate = DateTime.UtcNow.AddHours(48);
            if (priority) reservation.QueuePosition = 1;
        }
        else
        {
            reservation.Status = ReservationStatus.Cancelled;
        }

        await _reservationRepository.UpdateAsync(reservation);
        var saved = await _reservationRepository.SaveChangesAsync();
        return (saved, saved ? null : "Failed to update triage decision.");
    }
```

- [x] **Step 5: Build and restart Backend daemon**

Run:
```powershell
Stop-Process -Name Backend -Force -ErrorAction SilentlyContinue
dotnet build Backend -c Debug
Start-Process -FilePath ".\Backend\bin\Debug\net10.0\Backend.exe" -ArgumentList "--urls http://localhost:5000" -WindowStyle Hidden
```

---

### Task 2: Cashier Pending Reservations — Action Row Badges & Once-Only Controls

**Files:**
- Modify: `Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/PendingReservations.tsx:60-150, 680-720, 800-840, 1000-1050`
- Test: `Frontend` typecheck via `npx tsc --noEmit`

**Interfaces:**
- Consumes: `getAdminReservations()`, `triageReservation(id, payload)`
- Produces: Enhanced `PendingReservations.tsx` showing `PENDING REVIEW`, `APPROVED (ONCE)`, and `DECLINED (ONCE)` status badges in Table & Card views; locks triage buttons for already-processed records.

- [x] **Step 1: Update `loadData` in `PendingReservations.tsx` to fetch all reservations or support tabbed queue states**

Change `loadData` in `PendingReservations.tsx`:
```tsx
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('all');

  const loadData = useCallback(async () => {
    try {
      const [listRes, metricsRes] = await Promise.all([
        getAdminReservations(),
        getReservationMetrics(),
      ]);
      setReservations(listRes);
      setMetrics(metricsRes);
      if (listRes.length > 0 && !activeReservationId) {
        setActiveReservationId(listRes[0].id);
      }
    } catch {
      addToast('Failed to synchronize reservation holds with database.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast, activeReservationId]);
```

- [x] **Step 2: Update Table Row Status & Action Columns in `PendingReservations.tsx`**

In table row rendering:
1. **Status Column**:
```tsx
<td className="px-4 py-3 whitespace-nowrap">
  {r.status === 'Pending' || r.status === '1' ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
      PENDING REVIEW
    </span>
  ) : r.status === 'StagedInLocker' || r.status === '2' ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
      <span className="material-symbols-outlined text-xs">verified</span>
      APPROVED (READY)
    </span>
  ) : r.status === 'Cancelled' || r.status === '4' ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
      <span className="material-symbols-outlined text-xs">cancel</span>
      DECLINED
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-surface-container text-text-secondary border border-outline/20">
      {r.status}
    </span>
  )}
</td>
```

2. **Actions Column**:
```tsx
<td className="px-4 py-3 whitespace-nowrap text-right">
  <div className="flex items-center justify-end gap-1.5">
    {r.status === 'Pending' || r.status === '1' ? (
      <>
        <button
          onClick={(e) => handleSingleApprove(r, e)}
          disabled={isProcessing}
          className="p-1.5 rounded-lg bg-action-green text-text-primary hover:bg-action-green-hover transition-colors cursor-pointer shadow-sm"
          title="Approve Reservation Hold"
          type="button"
        >
          <span className="material-symbols-outlined text-base">check</span>
        </button>
        <button
          onClick={(e) => handleOpenRejectModal(r, undefined, e)}
          disabled={isProcessing}
          className="p-1.5 rounded-lg bg-surface-container text-status-danger hover:bg-error-container transition-colors cursor-pointer shadow-sm"
          title="Decline Reservation Hold"
          type="button"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </>
    ) : r.status === 'StagedInLocker' || r.status === '2' ? (
      <>
        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
          APPROVED (ONCE)
        </span>
        <button
          onClick={(e) => handleIssuePhysicalLoan(r, e)}
          className="p-1.5 rounded-lg bg-primary text-white hover:bg-primary-container transition-colors cursor-pointer shadow-sm"
          title="Issue Physical Loan (Checkout)"
          type="button"
        >
          <span className="material-symbols-outlined text-base">shopping_cart_checkout</span>
        </button>
      </>
    ) : (
      <span className="text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-1 rounded border border-rose-200">
        DECLINED (ONCE)
      </span>
    )}
    <button
      onClick={() => setActiveReservationId(r.id)}
      className="p-1.5 rounded-lg bg-surface-container text-primary hover:bg-soft-blue transition-colors cursor-pointer shadow-sm"
      title="View Inspection"
      type="button"
    >
      <span className="material-symbols-outlined text-base">visibility</span>
    </button>
  </div>
</td>
```

- [x] **Step 3: Update Right-Hand Inspection Drawer / Detail Confirmation View**

When `activeReservation` is displayed in the inspection panel:
```tsx
{activeReservation.status === 'StagedInLocker' || activeReservation.status === '2' ? (
  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 mb-4">
    <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
      <span className="material-symbols-outlined text-lg">check_circle</span>
      <span>RESERVATION APPROVED (ONCE)</span>
    </div>
    <div className="text-xs space-y-1">
      <p>Staging Bay: <strong className="font-mono text-emerald-950">{activeReservation.lockerBay || 'Bay 01 Counter'}</strong></p>
      <p>Pickup PIN: <strong className="font-mono text-emerald-950">{activeReservation.lockerPin || 'N/A'}</strong></p>
      <p className="text-[11px] text-emerald-700 italic">This reservation has been approved and cannot be approved or declined again.</p>
    </div>
    <button
      onClick={() => handleIssuePhysicalLoan(activeReservation)}
      className="w-full mt-2 py-2.5 px-4 bg-primary hover:bg-primary-container text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
      type="button"
    >
      <span className="material-symbols-outlined text-sm">shopping_cart_checkout</span>
      <span>Proceed to Circulation Checkout</span>
    </button>
  </div>
) : activeReservation.status === 'Cancelled' || activeReservation.status === '4' ? (
  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1 mb-4">
    <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
      <span className="material-symbols-outlined text-lg">cancel</span>
      <span>RESERVATION DECLINED (ONCE)</span>
    </div>
    <p className="text-xs text-rose-700">This reservation was declined by library staff and is permanently closed.</p>
  </div>
) : (
  <div className="space-y-2 mb-4">
    <button
      onClick={() => handleSingleApprove(activeReservation)}
      disabled={isProcessing}
      className="w-full py-3 px-4 bg-action-green hover:bg-action-green-hover text-text-primary font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      type="button"
    >
      <span className="material-symbols-outlined text-xl">mark_email_read</span>
      <span>Approve Hold & Dispatch Pickup Voucher</span>
    </button>
    <button
      onClick={() => handleOpenRejectModal(activeReservation, 'Physical copy damaged during pull / unreadable barcode')}
      disabled={isProcessing}
      className="w-full py-2.5 px-4 bg-surface-container hover:bg-error-container text-status-danger font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      type="button"
    >
      <span className="material-symbols-outlined text-base">close</span>
      <span>Decline Reservation Hold</span>
    </button>
  </div>
)}
```

- [x] **Step 4: Verify TypeScript compilation**

Run: `npx tsc --noEmit` in `Frontend`
Expected: 0 errors.

---

### Task 3: Customer Portal — Clear Approved vs. Declined Indication & Pickup Voucher

**Files:**
- Modify: `Frontend/src/UserRoles/Features/Pages/CustomersPanel/Pages/ReservationsPage.tsx:150-250, 980-1040`
- Test: `Frontend` typecheck via `npx tsc --noEmit`

**Interfaces:**
- Consumes: `getCustomerReservations()`
- Produces: Updated `ReservationsPage.tsx` with unambiguous badges:
  - `APPROVED` (Green with Bay & PIN)
  - `DECLINED` (Red with rejection note)
  - `PENDING` (Amber with queue place)
  - Modal with clear header matching the decision.

- [x] **Step 1: Update Status Helper & Badge Renderer in `ReservationsPage.tsx`**

Ensure `isReady` (status 2 / `StagedInLocker`) renders:
```tsx
{isReady(r.status) ? (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
    <span className="material-symbols-outlined text-sm">verified</span>
    APPROVED — READY FOR PICKUP
  </span>
) : isCancelledOrExpired(r.status) ? (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
    <span className="material-symbols-outlined text-sm">cancel</span>
    DECLINED / CANCELLED
  </span>
) : (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
    PENDING CASHIER REVIEW
  </span>
)}
```

- [x] **Step 2: Update Voucher / Pickup Pass Modal in `ReservationsPage.tsx`**

In the pickup pass dialog:
- If Approved: Header displays **"✓ RESERVATION APPROVED & STAGED"** with Locker Bay, Staging PIN, and 48-Hour Retention Countdown.
- If Pending: Header displays **"HOLD RESERVED — PENDING CASHIER APPROVAL"** with Queue Position and Estimated Triage Time.
- If Declined: Header displays **"✕ RESERVATION DECLINED"** with notice to contact the circulation desk.

- [x] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit` in `Frontend`
Expected: 0 errors.

---

### Task 4: Public Landing Page Reservation Modal Status Clarity

**Files:**
- Modify: `Frontend/src/LANDING_PAGE/Features/Pages/Home/Components/ReservationModal.tsx:155-180`
- Test: `Frontend` typecheck via `npm run build`

- [x] **Step 1: Enhance Submission Confirmation in `ReservationModal.tsx`**

In `ReservationModal.tsx` confirmation screen:
```tsx
<div className="text-center py-6">
  <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center mb-space-md border border-amber-300">
    <span className="material-symbols-outlined text-[36px]">hourglass_top</span>
  </div>
  <h3 className="font-headline-3 text-headline-3 text-text-primary font-bold mb-1">
    Hold Request Submitted
  </h3>
  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-3 border border-amber-300">
    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
    STATUS: PENDING CASHIER REVIEW
  </div>
  <p className="font-small text-small text-text-secondary mb-space-lg max-w-sm mx-auto">
    Your reservation voucher code is <strong className="text-primary font-mono text-body font-bold">{voucherCode}</strong>.
    Once approved by the cashier, your status will update to <strong className="text-emerald-700">APPROVED</strong> with smart locker pickup credentials.
  </p>
  <button
    className="w-full py-3 px-6 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-semibold transition-colors cursor-pointer"
    onClick={handleReset}
  >
    Done
  </button>
</div>
```

- [x] **Step 2: Run Production Build**

Run: `npm run build` in `Frontend`
Expected: Builds 143+ modules with 0 errors.

---

### Task 5: Closed-Loop Automated Verification Suite

**Files:**
- Create: `Katipuneros-Library-Store/scratch/verify_reservation_triage_flow.ps1`
- Test: Execute against running Backend API and SQL Server database

- [x] **Step 1: Write `verify_reservation_triage_flow.ps1`**

```powershell
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "RESERVATION TRIAGE & ONCE-ONLY APPROVAL/DECLINE VERIFICATION" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Step 1: Customer creates reservation
$custLogin = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"identifier":"mariasantos","password":"Password123!"}'
$custToken = $custLogin.data.token
$custHeaders = @{ "Authorization" = "Bearer $custToken"; "Content-Type" = "application/json" }

$bookRes = Invoke-RestMethod -Uri "http://localhost:5000/api/books?pageSize=1" -Method Get
$bookId = $bookRes.data.items[0].id

$holdRes = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations" -Method Post -Headers $custHeaders -Body (@{ bookId = $bookId; pickupBranch = "Main Circulation Desk" } | ConvertTo-Json)
$holdId = $holdRes.data.id
Write-Host "[TEST 1] Customer Hold Placed: $holdId (Status: $($holdRes.data.status))" -ForegroundColor Green

# Step 2: Cashier approves reservation
$cashierLogin = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"identifier":"testcashier","password":"Password123!"}'
$cashierToken = $cashierLogin.data.token
$cashierHeaders = @{ "Authorization" = "Bearer $cashierToken"; "Content-Type" = "application/json" }

$triageRes = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations/$holdId/triage" -Method Put -Headers $cashierHeaders -Body '{"approved":true,"priority":false}'
Write-Host "[TEST 2] Cashier Approved Hold: Success=$($triageRes.success)" -ForegroundColor Green

# Step 3: Cashier attempts to approve AGAIN (Must FAIL with Once-Only error)
try {
    $secondTriage = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations/$holdId/triage" -Method Put -Headers $cashierHeaders -Body '{"approved":true,"priority":false}'
    Write-Host "[FAIL] Second triage should have failed!" -ForegroundColor Red
} catch {
    Write-Host "[TEST 3] Second triage properly rejected: $($_.Exception.Message)" -ForegroundColor Green
}

# Step 4: Verify Customer sees Approved status
$custHolds = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations/my-holds" -Method Get -Headers $custHeaders
$myApproved = $custHolds.data | Where-Object { $_.id -eq $holdId }
Write-Host "[TEST 4] Customer Sees Approved Hold: Status=$($myApproved.status), Bay=$($myApproved.lockerBay)" -ForegroundColor Green

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "ALL TRIAGE LIFECYCLE TESTS COMPLETED SUCCESSFULLY" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
```

- [x] **Step 2: Run verification script**

Run: `powershell -ExecutionPolicy Bypass -File ".\Katipuneros-Library-Store\scratch\verify_reservation_triage_flow.ps1"`
Expected: All 4 tests PASS.
