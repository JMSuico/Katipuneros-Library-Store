# Unique Book Copy QR Code & Returns Circulation Architecture Specification

**Status:** Approved  
**Date:** 2026-10-16  
**Scope:** Full-Stack (.NET 10 Web API + Entity Framework Core + SQL Server + React 19 Frontend)  

---

## 1. Executive Summary & Objective

Every physical copy of a library book is a distinct physical asset with its own condition, wear history, shelf location, and unique identity. This specification establishes a dedicated **`BookCopy`** architecture:
1. **Unique Physical Identity**: Each physical copy of a title has an immutable institutional **Accession Number** (e.g. `KP-ACC-0042-C1`) and an encrypted/structured **QR Code Payload** (`KP:COPY:{BookId}:{AccessionNumber}`).
2. **Cashier Returns Camera & Manual Scanner**: The Cashier Returns desk (`ReturnsFines.tsx`) features an in-browser live camera viewfinder (supporting laptop built-in webcams, USB external cameras, and document/ID scanners) alongside manual text input. Scanning a book's physical QR code automatically identifies the borrowed volume, evaluates overdue days, prompts for physical condition inspection, calculates any fines, and completes the check-in.
3. **Admin Physical Copy & Printable QR Center**: In the Admin Books Manager (`BooksManager.tsx`), library staff can view all individual physical copies per title, monitor real-time copy status (`Available`, `On Loan`, `Damaged`), print individual QR code label stickers, and verify that returns processed at the cashier desk immediately sync back to the catalog inventory.

---

## 2. Database Schema & Data Models

### A. New Entity: `BookCopy` (`Backend/Features/Data/Models/BookCopy.cs`)
```csharp
namespace Backend.Features.Data.Models;

public enum CopyStatus
{
    Available = 0,
    Borrowed = 1,
    InInspection = 2,
    Damaged = 3,
    Lost = 4,
    Archived = 5
}

public class BookCopy
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid BookId { get; set; }

    [ForeignKey(nameof(BookId))]
    public Book? Book { get; set; }

    [Required]
    public int CopyNumber { get; set; }

    [Required]
    [MaxLength(100)]
    public string AccessionNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string QrCodeData { get; set; } = string.Empty;

    public CopyStatus Status { get; set; } = CopyStatus.Available;

    [MaxLength(50)]
    public string Condition { get; set; } = "Good";

    [MaxLength(500)]
    public string? ConditionNotes { get; set; }

    [MaxLength(100)]
    public string? BayLocation { get; set; }

    public DateTime AcquiredDate { get; set; } = DateTime.UtcNow;

    public DateTime? LastReturnedDate { get; set; }

    // Navigation properties
    public ICollection<BorrowTransaction> BorrowTransactions { get; set; } = new List<BorrowTransaction>();
}
```

### B. Updated `Book` Entity
- Add navigation property:
  ```csharp
  public ICollection<BookCopy> Copies { get; set; } = new List<BookCopy>();
  ```

### C. Updated `BorrowTransaction` Entity
- Add physical copy link:
  ```csharp
  public Guid? BookCopyId { get; set; }

  [ForeignKey(nameof(BookCopyId))]
  public BookCopy? BookCopy { get; set; }
  ```

### D. EF Core `AppDbContext` Configuration & Seeding
- Register `DbSet<BookCopy> BookCopies { get; set; }`.
- Add unique index on `BookCopy.AccessionNumber`.
- Migration will auto-populate initial `BookCopy` records for existing books using their existing `TotalCopies`.

---

## 3. Backend API Architecture

### A. Physical Copies & Scan Controller (`Backend/Features/Api/Controllers/BookCopiesController.cs`)
1. **`GET /api/books/{bookId}/copies`** `[Authorize(Roles = "Cashier,Admin")]`
   - Returns all physical copies for the title, including `CopyNumber`, `AccessionNumber`, `QrCodeData`, `Status`, `Condition`, and current active borrower info if on loan.
2. **`POST /api/books/{bookId}/copies`** `[Authorize(Roles = "Admin")]`
   - Adds a new physical copy to an existing catalog title, auto-generating the next sequential `AccessionNumber` and `QrCodeData`, and increments `Book.TotalCopies` and `Book.AvailableCopies`.
3. **`GET /api/copies/scan?code={qrOrAccession}`** `[Authorize(Roles = "Cashier,Admin")]`
   - Dual-purpose lookup: Accepts raw scanned QR data (`KP:COPY:...`), Accession Number, or GUID.
   - Returns the `BookCopy`, catalog metadata, and any current active `BorrowTransaction` with patron details and overdue fine calculations.

### B. Updated Circulation Endpoints (`Backend/Features/Api/Controllers/BorrowController.cs`)
1. **`POST /api/borrow/checkout`**:
   - Accepts optional `bookCopyId`. If omitted, automatically claims the first `Available` copy for that title.
   - Transitions `BookCopy.Status` to `Borrowed`.
2. **`POST /api/borrow/return`**:
   - Accepts `transactionId` or `bookCopyId` or `scannedCode`.
   - Transitions `BookCopy.Status` back to `Available` (or `Damaged` if cashier flags damage).
   - Saves condition notes and assessed fines.
   - Increments catalog `Book.AvailableCopies`.

---

## 4. Frontend UI/UX Architecture

### A. Cashier Returns Desk (`ReturnsFines.tsx`)
1. **Live Camera QR Viewfinder**:
   - Browser `navigator.mediaDevices.getUserMedia` video stream displayed in an interactive scan modal / drawer.
   - Device selector dropdown: switch between laptop camera, external USB camera, or document scanner.
   - Frame guide overlay with scanning targeting reticle.
   - Instant decode via standard `BarcodeDetector` (modern Chromium/Edge) with canvas fallback.
2. **Instant Dual Input Bar**:
   - High-contrast search & scan field: scanning with a 2D barcode scanner (which types characters + Enter) or typing the Accession Number immediately triggers lookup.
3. **Condition Audit & Settlement Card**:
   - Once scanned, loads the matched loan and book copy.
   - Cashier selects condition: `Good` (₱0), `Minor Wear` (₱0), `Damaged` (configurable fine, default ₱150), `Lost` (replacement fee).
   - Shows days overdue and calculated late fines.
   - One-click **"Confirm Return & Restock Copy"** button.

### B. Admin Books Manager (`BooksManager.tsx`)
1. **"Manage Physical Copies & QR Codes" Modal**:
   - Accessible via the table row action or details pane for any book.
   - Lists all copies with status badges (`Available` in green, `On Loan` in amber, `Damaged` in red).
   - Visual QR Code Generator: Renders crisp, scalable QR codes using SVG/Canvas.
   - **"Print QR Sticker"** button: Opens a print-ready formatted sticker with Book Title, Author, Accession Number, Call Number, and QR code suitable for pasting onto the book inside cover.
2. **Inventory Sync**:
   - Cashier returns immediately update the copy status and available count in the Admin view.

---

## 5. Verification Protocol & Quality Gates
1. **Database Migration**: `dotnet ef migrations add AddBookCopiesAndPhysicalQrCodes` and `dotnet ef database update` with 0 warnings.
2. **TypeScript Compilation**: `npx tsc --noEmit` in `Frontend` with 0 errors.
3. **Production Build**: `npm run build` with 143+ modules bundled in 0 errors.
4. **Closed-Loop PowerShell Automation**: `scratch/verify_unique_book_copy_qr_flow.ps1` validating:
   - Book copy creation and unique QR payload generation.
   - Circulation checkout assigning exact physical copy.
   - Camera/text QR resolution resolving exact loan.
   - Cashier return resetting copy to Available and auditing condition.
   - Admin physical copy ledger synchronization.
