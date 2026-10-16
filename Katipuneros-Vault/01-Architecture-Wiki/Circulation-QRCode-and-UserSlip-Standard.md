---
title: Circulation QRCode, ExpressCode, and User Slip Standard
created: 2026-10-17
tags:
  - circulation
  - qrcode
  - expresscode
  - userslip
  - canvas
  - reservation
  - cashier
  - return
aliases:
  - Circulation Standard
  - QR & Slip Standard
  - User Slip Spec
---

# 🎟️ Circulation QRCode, ExpressCode, and User Slip Standard

> [!NOTE] Specification Scope
> This document defines the standardized physical identity formats, client-side visual User Slip PNG generation, and the end-to-end circulation lifecycle across all user roles (**Patron**, **Cashier Desk**, **Chief Admin**) within the **Katipuneros Library Store System**.
> 
> Related Vault Docs: [[01-Architecture-Wiki/8-Layer-Docker-Kubernetes-Architecture|8-Layer Production Architecture]] | [[01-Architecture-Wiki/CRUD-Verification-Playbook|CRUD Verification Playbook]] | [[03-Agent-Memory/MEMORY|System Invariants]]

---

## 1. Executive Summary & Terminology Standardization

To eliminate outdated physical barcode references and modernize the circulation desk experience:
1. **Full QRCode & ExpressCode Adoption**:
   - Replaced all legacy barcode icons with modern Material Symbols: `qr_code_2`, `qr_code_scanner`, and `qr_code`.
   - Replaced physical barcode phrasing with *"Present this 4-digit PIN or your student QR code / ExpressCode to the desk cashier."*
2. **Individual Physical Copy Tracking (`BookCopy`)**:
   - Every physical volume in the library has an immutable **Accession Number** (`KP-ACC-...`) and a cryptographic **QR Code Payload** (`KP:COPY:...`).
3. **Client-Side Downloadable User Slip PNG**:
   - Staged reservations provide an interactive **"Download User Slip"** button rendering an official 800x1000px high-contrast slip via HTML5 Canvas and `qrcode`.
4. **Interchangeable Scanner Resolution**:
   - The cashier camera viewfinder and input parser accept raw QR payloads, ExpressCodes (`SCAN-BAY-XXXXXX`), Accession Numbers, and Transaction GUIDs interchangeably.

---

## 2. QRCode & Identifier Specifications

### 2.1 Identifier Format Matrix

| Identifier Type | Standard Format | Example | Target Entity | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Book Copy QR Payload** | `KP:COPY:{BookId}:{AccessionNumber}` | `KP:COPY:a1b2c3d4-...:KP-ACC-HIS-A1B2-C01` | `BookCopy` | Physical book cover sticker; scanned at return desk |
| **Accession Number** | `KP-ACC-{Prefix}-{BookHash}-C{CopyNum:D2}` | `KP-ACC-HIS-A1B2-C01` | `BookCopy` | Human-readable spine label and shelf audit |
| **ExpressCode** | `SCAN-BAY-{ReservationPrefix}` | `SCAN-BAY-9042FA` | `Reservation` | Embedded in User Slip QR code for rapid checkout scan |
| **Staged Counter Bay** | `Bay {Number:D2} Counter` | `Bay 01 Counter` | `Reservation` | Physical pickup counter location |
| **Staging Pickup PIN** | 4-Digit Numeric String (`\d{4}`) | `8492` | `Reservation` | Verified by patron at cashier desk for manual handover |
| **Patron Gate Pass Code** | `GP-{RandomHex4}-{RandomHex4}` | `GP-9F2B-841C` | `BorrowTransaction` | Digital proof of active loan for building exit gate |

---

### 2.2 Physical Volume Accession Generator Algorithm

Accession Numbers and QR Code payloads are generated deterministically in `Backend.Features.Services.Implementations.BookCopyService`:

```csharp
private static (string AccessionNumber, string QrCodeData) GenerateIdentifiers(Book book, int copyNumber)
{
    var prefix = !string.IsNullOrWhiteSpace(book.DeweyCode)
        ? book.DeweyCode.Replace(" ", "").Replace(".", "").ToUpper()
        : "BOOK";

    // Strip non-alphanumeric characters
    prefix = new string(prefix.Where(char.IsLetterOrDigit).ToArray());
    if (string.IsNullOrEmpty(prefix)) prefix = "BOOK";

    var bookHash = book.Id.ToString("N")[..4].ToUpper();
    var accession = $"KP-ACC-{prefix}-{bookHash}-C{copyNumber:D2}";
    var qr = $"KP:COPY:{book.Id}:{accession}";
    return (accession, qr);
}
```

---

## 3. Downloadable User Slip PNG Architecture

### 3.1 Slip Canvas Layout Design

The User Slip is generated client-side using HTML5 Canvas (`800 × 1000px`) at 2x pixel density for crisp thermal or paper printing:

```
┌────────────────────────────────────────────────────────┐
│  KATIPUNEROS LIBRARY STORE                             │
│  CIRCULATION & STAGING SLIP                            │
│  Est. 1892 • Heritage Collection                       │
├────────────────────────────────────────────────────────┤
│  PATRON INFORMATION                                    │
│  Name: Juan Dela Cruz                                  │
│  Library Card ID: KP-LIB-2026-0842                     │
│  Affiliation: College of Arts & Sciences               │
├────────────────────────────────────────────────────────┤
│  REQUESTED VOLUME                                      │
│  Title: Noli Me Tangere (First Edition Facsimile)      │
│  Author: Jose Rizal                                    │
│  Call Number: 899.211 R53n                             │
│  Accession Number: KP-ACC-899211-4FA1-C01              │
├────────────────────────────────────────────────────────┤
│  STAGING & PICKUP SPECIFICATIONS                       │
│  Assigned Bay: Bay 01 Counter                          │
│  Pickup PIN:   8 4 9 2                                 │
│  Valid Until:  October 19, 2026 • 5:00 PM              │
├────────────────────────────────────────────────────────┤
│                     █████████████                      │
│                     ██ ▄▄▄▄▄  ██                       │
│                     ██ █   █  ██                       │
│                     ██ █▄▄▄█  ██                       │
│                     ██        ██                       │
│                     █████████████                      │
│                 SCAN-BAY-9042FA                        │
│   Scan QR at Cashier Desk for Rapid Book Handover      │
├────────────────────────────────────────────────────────┤
│  Lending Terms: 14 days standard loan. Overdue fine:  │
│  ₱5.00/day. Uncollected holds release after 48 hours.  │
└────────────────────────────────────────────────────────┘
```

### 3.2 Client-Side Generation Implementation (`generateUserSlipPng.ts`)

```typescript
import QRCode from 'qrcode';

export interface UserSlipData {
  reservationId: string;
  patronName: string;
  patronLibraryId: string;
  bookTitle: string;
  bookAuthor: string;
  deweyCode?: string;
  stagedBay: string;
  pickupPin: string;
  expiryDate: string;
}

export async function generateUserSlipPng(data: UserSlipData): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create canvas 2D context');

  // 1. Draw Ivory Heritage Background
  ctx.fillStyle = '#FAFAF7';
  ctx.fillRect(0, 0, 800, 1000);

  // 2. Draw Decorative Border
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 760, 960);

  // 3. Draw Header
  ctx.fillStyle = '#064E3B'; // Emerald Forest
  ctx.font = 'bold 28px serif';
  ctx.textAlign = 'center';
  ctx.fillText('KATIPUNEROS LIBRARY STORE', 400, 70);

  ctx.fillStyle = '#64748B';
  ctx.font = '14px sans-serif';
  ctx.fillText('OFFICIAL CIRCULATION STAGING SLIP', 400, 95);

  // 4. Draw Staged Bay & Pickup PIN Highlight Box
  ctx.fillStyle = '#ECFDF5';
  ctx.fillRect(50, 130, 700, 120);
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 130, 700, 120);

  ctx.fillStyle = '#065F46';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`ASSIGNED BAY: ${data.stagedBay.toUpperCase()}`, 80, 175);

  ctx.fillStyle = '#047857';
  ctx.font = 'bold 36px monospace';
  ctx.fillText(`PIN: ${data.pickupPin}`, 80, 225);

  // 5. Draw Book & Patron Metadata
  ctx.fillStyle = '#0F172A';
  ctx.font = '18px sans-serif';
  ctx.fillText(`Patron: ${data.patronName} (${data.patronLibraryId})`, 80, 300);
  ctx.fillText(`Title: ${data.bookTitle}`, 80, 340);
  ctx.fillText(`Author: ${data.bookAuthor}`, 80, 380);
  ctx.fillText(`Valid Through: ${data.expiryDate}`, 80, 420);

  // 6. Generate & Render QR Code
  const expressCode = `SCAN-BAY-${data.reservationId.slice(0, 8).toUpperCase()}`;
  const qrDataUrl = await QRCode.toDataURL(expressCode, {
    width: 280,
    margin: 1,
    color: { dark: '#0F172A', light: '#FFFFFF' }
  });

  const qrImage = new Image();
  await new Promise((resolve) => {
    qrImage.onload = resolve;
    qrImage.src = qrDataUrl;
  });
  ctx.drawImage(qrImage, 260, 480, 280, 280);

  // 7. ExpressCode Human-Readable Text
  ctx.textAlign = 'center';
  ctx.font = 'bold 22px monospace';
  ctx.fillStyle = '#0F172A';
  ctx.fillText(expressCode, 400, 800);

  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('Present this slip or PIN at the cashier desk for volume release.', 400, 840);

  return canvas.toDataURL('image/png');
}
```

---

## 4. Cross-Role Circulation Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Patron as 👤 Patron
    participant CustomerUI as 💻 Customer Portal (:5176)
    participant Backend as ⚙️ Backend API (:5000)
    participant CashierUI as 🖥️ Cashier Desk (:5175)
    actor Cashier as 👨‍💼 Cashier Desk Staff
    participant AdminUI as 🏢 Admin Console (:5174)

    %% Phase 1: Hold Request
    Note over Patron,CustomerUI: Phase 1: Hold Creation
    Patron->>CustomerUI: Browse catalog & click "Reserve Volume"
    CustomerUI->>Backend: POST /api/reservations (BookId, PickupBranch)
    Backend-->>CustomerUI: HTTP 200 (Status: Pending, QueuePosition: #1)
    CustomerUI-->>Patron: Displays "⏳ Pending Staff Review"

    %% Phase 2: Cashier Triage
    Note over CashierUI,Backend: Phase 2: Once-Only Triage
    Cashier->>CashierUI: Opens Pending Reservations Queue
    CashierUI->>Backend: PUT /api/reservations/{id}/triage (approved: true)
    Backend->>Backend: Assign LockerBay="Bay 01 Counter", PIN="8492"
    Backend->>Backend: Lock decision (Status: StagedInLocker)
    Backend-->>CashierUI: HTTP 200 (Success)
    CashierUI-->>Cashier: Button locks to "APPROVED (ONCE)"

    %% Phase 3: Slip Download
    Note over Patron,CustomerUI: Phase 3: User Slip Download
    Patron->>CustomerUI: Refreshes /customer/reservations
    CustomerUI->>CustomerUI: Renders "✓ Reservation Approved & Staged"
    Patron->>CustomerUI: Clicks "Download Circulation Slip"
    CustomerUI->>CustomerUI: Generates Canvas PNG with QR & PIN
    CustomerUI-->>Patron: Saves Katipuneros_UserSlip_<ID>.png

    %% Phase 4: Desk Handover & Checkout
    Note over Patron,CashierUI: Phase 4: Checkout Handover
    Patron->>Cashier: Presents User Slip QR or states PIN 8492
    Cashier->>CashierUI: Scans QR code or types 8492
    CashierUI->>Backend: GET /api/copies/scan?code=SCAN-BAY-...
    Backend-->>CashierUI: Resolves Hold & matches physical copy
    Cashier->>CashierUI: Clicks "Complete Checkout"
    CashierUI->>Backend: POST /api/borrow/checkout
    Backend->>Backend: Set BookCopy.Status=Borrowed, Generate DueDate (+14d)
    Backend-->>CashierUI: Active Loan Generated with Gate Pass Code

    %% Phase 5: Return & Physical Inspection
    Note over Patron,CashierUI: Phase 5: QR Camera Return
    Patron->>Cashier: Returns book volume to counter
    Cashier->>CashierUI: Opens Returns Desk (/cashier/returns)
    Cashier->>CashierUI: Points webcam to Book Copy QR (KP:COPY:...)
    CashierUI->>Backend: GET /api/copies/scan?code=KP:COPY:...
    Backend-->>CashierUI: Returns Active Loan, Days Overdue & Daily Fine Rate
    Cashier->>CashierUI: Audits condition ("Good" / "Damaged"), clicks "Confirm Return"
    CashierUI->>Backend: POST /api/borrow/return
    Backend->>Backend: Set BookCopy.Status=Available, AvailableCopies++
    Backend-->>CashierUI: Return settled and inventory synchronized!
```

---

## 5. UI/UX Refactor and Quality Polish

### 5.1 Barcode to QR Standardization
Across all frontend views:
- **`ReservationsPage.tsx`**:
  - Replaced barcode icon with `qr_code_2`.
  - Fixed duplicate label text from `"Counter Bay Bay 01 Counter"` to clean `"Bay 01 Counter"`.
  - Added primary `"Download Circulation Slip"` action with automatic PNG download.
- **`ReturnsFines.tsx`**:
  - Embedded live camera viewfinder (`navigator.mediaDevices.getUserMedia`) with reticle guide and device selector.
  - Automatic `BarcodeDetector` decodes QR payloads instantly without manual typing.
- **`BooksManager.tsx`**:
  - Added dedicated **"Manage Physical Copies & QR Codes"** drawer.
  - Added **"Print QR Sticker"** button generating 300 DPI adhesive book labels.

---

## 6. Verification and Machine Gates

Run the full end-to-end circulation verification test suite:

```powershell
powershell -ExecutionPolicy Bypass -File .\scratch\verify_unique_book_copy_qr_flow.ps1
powershell -ExecutionPolicy Bypass -File .\scratch\verify_reservation_triage_flow.ps1
```

### Machine Test Criteria
- [x] **Test 1**: Dynamic patron registration and authentication.
- [x] **Test 2**: Unique physical `BookCopy` volume generated with sequential `AccessionNumber` (`KP-ACC-...`) and `QrCodeData` (`KP:COPY:...`).
- [x] **Test 3**: Resolution of raw QR payload and accession code via `/api/copies/scan?code=...`.
- [x] **Test 4**: Once-Only triage guard rejecting repeat approvals or conflicting declines with HTTP 400.
- [x] **Test 5**: User Slip PNG rendering with high-contrast QR code, staging bay, and pickup PIN.
- [x] **Test 6**: Camera/hardware scan checkout and return settlement resetting copy status to `Available`.

---

## 7. Cross-Document Navigation

- Return to [[HOME_DASHBOARD|Vault Home Dashboard]]
- View Infrastructure Topology: [[01-Architecture-Wiki/8-Layer-Docker-Kubernetes-Architecture|8-Layer Production Architecture]]
- View Testing Protocols: [[01-Architecture-Wiki/CRUD-Verification-Playbook|CRUD Verification Playbook]]
- View Deployment Telemetry: [[04-Task-Observer-Log/2026-10-17-Production-Infrastructure-and-UserSlip-Log|Production Infrastructure Log]]
