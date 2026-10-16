# Dual-Mode QR/Camera & 4-Digit PIN Handover Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a dual-mode handover verification system in the Cashier Desk (Option 1: Optical Camera Scanner, Option 2: Manual Search + 4-Digit PIN), enforce physical-copy unique 4-digit PINs, generate unique transaction references (`KP-TXN-XXXXXXXX`), and synchronize real-time notification bells across Customer, Cashier, and Admin for borrow and return flows.

**Architecture:** Extend .NET 10 `ReservationService` with collision-free PIN generation linked to title and physical `BookCopy`; update `BorrowService` to validate PINs on hold checkouts and issue `KP-TXN-XXXXXXXX` references; build an integrated multi-driver camera scanner + 4-digit PIN handover modal in React/Vite `CheckoutBorrow.tsx`; dispatch real-time notifications on borrow and return to synchronize all three portals' notification bells; verify with a 100% automated PowerShell test suite and archive in Obsidian.

**Tech Stack:** .NET 10 ASP.NET Core, EF Core (Npgsql/SQLServer), React 19, TypeScript 5.8, Vite 8, TailwindCSS 4, MediaDevices API / html5-qrcode.

**Spec:** `Katipuneros-Library-Store/docs/superpowers/specs/2026-10-17-qr-pin-verification-circulation-and-notifications-design.md`

## Global Constraints
- **Barcode Retirement**: All references to barcodes are replaced with **Patron QR Pass**, **QRCode**, or **ExpressCode** (`SCAN-BAY-XXXXXX`).
- **PIN Format**: 4-digit integer (`1000`–`9999`), strictly unique among active holds for that title/physical copy.
- **Transaction Reference**: Formatted as `KP-TXN-{yyyyMMdd}-{Hex6}`.
- **Port Isolation**: Backend :5000, Patron :5173, Admin :5174, Cashier :5175.
- **Zero Breakage**: `dotnet build Backend -c Debug` and `npm --prefix Frontend run build` must compile with 0 errors.

---

### Task 1: Backend Unique 4-Digit PIN Generation, Validation & Transaction Reference

**Files:**
- Modify: `Backend/Features/Api/DTOs/Requests/CheckoutRequest.cs`
- Modify: `Backend/Features/Services/Implementations/ReservationService.cs:170-240`
- Modify: `Backend/Features/Services/Implementations/BorrowService.cs:60-140`
- Modify: `Backend/Features/Api/Controllers/BorrowController.cs:25-45`
- Test: `scratch/InfraTestRunner/Program.cs`

**Interfaces:**
- Consumes: `Reservation.LockerPin`, `BookCopy`, `BorrowTransaction`
- Produces: `CheckoutRequest.PickupPin`, `CheckoutRequest.ReservationId`, `BorrowTransaction.GatePassCode` with `KP-TXN-XXXXXXXX` format

- [ ] **Step 1: Update `CheckoutRequest.cs` DTO**
Add `PickupPin` and `ReservationId` optional fields to `CheckoutRequest`:
```csharp
public class CheckoutRequest
{
    public Guid PatronId { get; set; }
    public List<string> BookBarcodes { get; set; } = new();
    public DateTime? DueDate { get; set; }
    public string? PickupPin { get; set; }
    public Guid? ReservationId { get; set; }
}
```

- [ ] **Step 2: Implement collision-free PIN generation in `ReservationService.cs`**
Ensure 4-digit PIN is unique across active reservations for that `BookId`:
```csharp
private async Task<string> GenerateUniqueLockerPinAsync(Guid bookId)
{
    var activePins = await _context.Reservations
        .Where(r => r.BookId == bookId && (r.Status == ReservationStatus.StagedInLocker || r.Status == ReservationStatus.Pending))
        .Select(r => r.LockerPin)
        .ToListAsync();

    string pin;
    int attempts = 0;
    do
    {
        pin = Random.Shared.Next(1000, 9999).ToString();
        attempts++;
    } while (activePins.Contains(pin) && attempts < 50);

    return pin;
}
```
Update `TriageReservationAsync` and `BatchClearanceAsync` to call `await GenerateUniqueLockerPinAsync(r.BookId)`.

- [ ] **Step 3: Update `BorrowService.CheckoutAsync` to validate PIN & generate `KP-TXN-XXXXXXXX`**
In `BorrowService.cs`:
1. If `reservationId` is provided or matching active hold exists, verify that `request.PickupPin == reservation.LockerPin`. If mismatch, return `(false, null, "Invalid 4-digit Pickup PIN for this reservation hold.")`.
2. Generate `GatePassCode = $"KP-TXN-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}"`.
3. Dispatch notification records to Patron, Cashier, and Admin queues.

- [ ] **Step 4: Verify with `dotnet build Backend -c Debug`**
Run: `dotnet build Backend -c Debug`
Expected: 0 errors.

- [ ] **Step 5: Commit changes**
```bash
git add Backend/
git commit -m "feat(backend): add unique 4-digit PIN validation and KP-TXN transaction reference"
```

---

### Task 2: Cashier Handover Verification Modal & Multi-Driver Camera Scanner

**Files:**
- Modify: `Frontend/src/Endpoints/Cashier/transactionApi.ts`
- Modify: `Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/CheckoutBorrow.tsx`
- Test: `npm --prefix Frontend run build`

**Interfaces:**
- Consumes: `BackendReservation`, `CashierCheckoutRequest`, `generateUserSlipPng`
- Produces: `isHandoverModalOpen`, `handoverTargetReservation`, camera stream listener, 4-digit PIN verification state

- [ ] **Step 1: Update `CashierCheckoutRequest` in `transactionApi.ts`**
Add `pickupPin?: string; reservationId?: string;` to `CashierCheckoutRequest`:
```typescript
export interface CashierCheckoutRequest {
  patronId: string;
  bookBarcodes: string[];
  dueDate?: string;
  pickupPin?: string;
  reservationId?: string;
}
```

- [ ] **Step 2: Add Handover Verification Modal to `CheckoutBorrow.tsx`**
1. State management:
   - `isHandoverModalOpen: boolean`
   - `handoverHold: BackendReservation | null`
   - `pinDigits: string[]` (`['', '', '', '']`)
   - `isCameraActive: boolean`
   - `cameraDevices: MediaDeviceInfo[]`
   - `selectedCameraId: string`
2. **Option 1 (Camera Scanner)**:
   - Uses `navigator.mediaDevices.getUserMedia({ video: { deviceId: selectedCameraId } })`.
   - Continuous frame decoding scanning for QR code or ExpressCode `SCAN-BAY-XXXXXX`.
   - On scan: auto-selects patron and hold, focuses PIN entry or validates if PIN is embedded.
3. **Option 2 (Manual Search & PIN Entry)**:
   - When cashier clicks "Stage Hold Volume" or searches patron/book, opens `HandoverVerificationModal`.
   - 4-digit input inputs auto-advancing on keystroke.
   - Validates that `pinDigits.join('') === handoverHold.lockerPin`.
   - On success, stages book copy and auto-attaches `pickupPin` to checkout payload.

- [ ] **Step 3: Wire checkout button to pass `pickupPin` and `reservationId`**
Ensure `processCashierCheckout` payload includes the verified `pickupPin` and `reservationId`.

- [ ] **Step 4: Verify with `npm --prefix Frontend run build`**
Run: `npm --prefix Frontend run build`
Expected: 0 errors.

- [ ] **Step 5: Commit changes**
```bash
git add Frontend/src/Endpoints/Cashier/transactionApi.ts Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/CheckoutBorrow.tsx
git commit -m "feat(cashier): implement dual-mode camera scanner and 4-digit PIN handover modal"
```

---

### Task 3: Circulation Return Processing & Multi-Portal Return Notifications

**Files:**
- Modify: `Backend/Features/Services/Implementations/BorrowService.cs:220-290`
- Modify: `Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/ReturnsFines.tsx`
- Test: `dotnet build Backend -c Debug` & `npm --prefix Frontend run build`

**Interfaces:**
- Consumes: `BorrowTransaction.GatePassCode`, `ReturnRequest`
- Produces: `circulation-return-confirmed` event, return notification records in DB

- [ ] **Step 1: Enhance `ReturnBookAsync` in `BorrowService.cs`**
When a loan is returned:
1. Lookup transaction by `GatePassCode` (`KP-TXN-...`), QR code payload, or copy accession number.
2. Formulate return audit record with transaction reference.
3. Call `_emailService.SendLoanNotificationAsync(activeLoan, "Returned", totalFine)`.
4. Persist system notifications for Patron, Cashier, and Admin queues.

- [ ] **Step 2: Update `ReturnsFines.tsx` to dispatch return confirmation event**
In `ReturnsFines.tsx`:
On return success:
```typescript
window.dispatchEvent(new CustomEvent('circulation-return-confirmed', {
  detail: {
    reference: res.transaction?.gatePassCode || res.transaction?.id,
    title: selectedReturnItem?.title,
    patronName: selectedReturnItem?.patronName,
    fine: res.assessedFine
  }
}));
```

- [ ] **Step 3: Verify build**
Run: `dotnet build Backend -c Debug` && `npm --prefix Frontend run build`
Expected: 0 errors.

- [ ] **Step 4: Commit changes**
```bash
git add Backend/ Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/ReturnsFines.tsx
git commit -m "feat(returns): add multi-portal return notifications and reference synchronization"
```

---

### Task 4: Cross-Portal Notification Bell Real-Time Synchronization

**Files:**
- Modify: `Frontend/src/UserRoles/Features/Pages/AdminsPanel/Shared/NotificationUI.tsx`
- Modify: `Frontend/src/UserRoles/Features/Pages/CustomersPanel/Pages/CustomerDashboard.tsx`
- Modify: `Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/Notifications.tsx`
- Create: `Frontend/src/Shared/Utils/notificationBus.ts`
- Test: `npm --prefix Frontend run build`

**Interfaces:**
- Consumes: Custom events `circulation-borrow-confirmed`, `circulation-return-confirmed`
- Produces: Shared notification store, badge counts, and toast alerts across portals

- [ ] **Step 1: Create `Frontend/src/Shared/Utils/notificationBus.ts`**
Unified broadcast channel for cross-portal event propagation:
```typescript
export interface CirculationNotificationEvent {
  id: string;
  type: 'borrow_confirmed' | 'return_confirmed';
  reference: string;
  title: string;
  patronName: string;
  timestamp: string;
  message: string;
  recipientRoles: ('Customer' | 'Cashier' | 'Admin')[];
}

export const dispatchCirculationNotification = (event: CirculationNotificationEvent) => {
  localStorage.setItem('kls_latest_notification', JSON.stringify(event));
  window.dispatchEvent(new CustomEvent('kls_notification_received', { detail: event }));
};
```

- [ ] **Step 2: Wire Notification Bells in Admin, Cashier, and Customer Portals**
1. In `Admin/NotificationUI.tsx`: Listen for `kls_notification_received` and append to admin notifications with red badge count.
2. In `CustomerDashboard.tsx`: Listen for `kls_notification_received` filtering for `Customer` role and update patron notifications.
3. In `Cashier/Notifications.tsx`: Listen for `kls_notification_received` and prepend to terminal alert list.

- [ ] **Step 3: Verify build**
Run: `npm --prefix Frontend run build`
Expected: 0 errors.

- [ ] **Step 4: Commit changes**
```bash
git add Frontend/src/Shared/Utils/notificationBus.ts Frontend/src/UserRoles/
git commit -m "feat(notifications): synchronize real-time notification bells across all 3 portals"
```

---

### Task 5: End-to-End Verification Audit Suite & Obsidian Vault Archival

**Files:**
- Create: `scratch/verify_pin_verification_and_notifications.ps1`
- Modify: `Katipuneros-Vault/01-Architecture-Wiki/Circulation-QRCode-and-UserSlip-Standard.md`
- Modify: `Katipuneros-Vault/04-Task-Observer-Log/2026-10-17-Production-Infrastructure-and-UserSlip-Log.md`
- Test: `powershell -ExecutionPolicy Bypass -File scratch/verify_pin_verification_and_notifications.ps1`

**Interfaces:**
- Consumes: Backend API endpoints, Frontend compiled bundles, Obsidian vault
- Produces: Full audit pass report and updated circulation documentation

- [ ] **Step 1: Implement `scratch/verify_pin_verification_and_notifications.ps1`**
Automated checks covering:
1. 4-digit PIN generation collision avoidance in `ReservationService.cs`.
2. PIN validation check in `BorrowService.cs` (throws error on invalid PIN).
3. `KP-TXN-XXXXXXXX` reference generation format check.
4. Camera scanner and manual PIN handover modal existence in `CheckoutBorrow.tsx`.
5. Return confirmation dispatch in `ReturnsFines.tsx`.
6. Cross-portal `notificationBus.ts` event wiring in Admin, Cashier, and Customer portals.
7. Zero build errors on both Backend and Frontend.

- [ ] **Step 2: Run verification script**
Run: `powershell -ExecutionPolicy Bypass -File scratch/verify_pin_verification_and_notifications.ps1`
Expected: 100% checks PASS (Exit code 0).

- [ ] **Step 3: Update Obsidian Documentation**
Update `Katipuneros-Vault/01-Architecture-Wiki/Circulation-QRCode-and-UserSlip-Standard.md` with:
- Dual-mode verification specification (Camera scanner & Manual PIN input).
- Unique 4-digit PIN algorithm.
- `KP-TXN-XXXXXXXX` transaction reference format and notification bell routing matrix.

- [ ] **Step 4: Commit changes**
```bash
git add scratch/ Katipuneros-Vault/
git commit -m "test(audit): add automated verification suite for QR/PIN handover and update Obsidian vault"
```
