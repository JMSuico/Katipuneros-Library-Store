# Unique Book Copy QR Code & Returns Circulation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement individual physical book copy tracking (`BookCopy` entity) where each physical volume possesses a unique Accession Number and distinct QR Code; integrate a live camera QR scanner + manual input in Cashier Returns; and provide physical copy inventory management and printable QR label generation in Admin Books Manager.

**Tech Stack:** .NET 10 ASP.NET Core, Entity Framework Core 10, SQL Server (`KatipunerosLibraryDb`), React 19, TypeScript, HTML5 Camera Barcode/QR API, TailwindCSS v3.

---

### Task 1: Backend Data Model, AppDbContext & Database Migration

**Files:**
- Create: `Backend/Features/Data/Models/BookCopy.cs`
- Modify: `Backend/Features/Data/Models/Book.cs`
- Modify: `Backend/Features/Data/Models/BorrowTransaction.cs`
- Modify: `Backend/Features/Data/AppDbContext.cs`

- [x] **Step 1: Create `BookCopy.cs` model**
Create `Backend/Features/Data/Models/BookCopy.cs` with properties:
`Id`, `BookId`, `Book`, `CopyNumber`, `AccessionNumber`, `QrCodeData`, `Status` (enum `CopyStatus`), `Condition`, `ConditionNotes`, `BayLocation`, `AcquiredDate`, `LastReturnedDate`, `BorrowTransactions`.

- [x] **Step 2: Update `Book.cs` & `BorrowTransaction.cs`**
- Add `public ICollection<BookCopy> Copies { get; set; } = new List<BookCopy>();` in `Book.cs`.
- Add `public Guid? BookCopyId { get; set; }` and navigation `public BookCopy? BookCopy { get; set; }` in `BorrowTransaction.cs`.

- [x] **Step 3: Register `BookCopies` in `AppDbContext.cs`**
Add `public DbSet<BookCopy> BookCopies => Set<BookCopy>();` and configure unique index on `AccessionNumber`.

- [x] **Step 4: Scaffold and apply EF Core migration**
Run:
```powershell
dotnet ef migrations add AddBookCopiesAndPhysicalQrCodes --project Backend
dotnet ef database update --project Backend
```

---

### Task 2: Backend Repository, Service, and Controllers

**Files:**
- Create: `Backend/Features/Repositories/Interfaces/IBookCopyRepository.cs`
- Create: `Backend/Features/Repositories/Implementations/BookCopyRepository.cs`
- Create: `Backend/Features/Services/Interfaces/IBookCopyService.cs`
- Create: `Backend/Features/Services/Implementations/BookCopyService.cs`
- Create: `Backend/Features/Api/Controllers/BookCopiesController.cs`
- Modify: `Backend/Features/Services/Implementations/BorrowService.cs`
- Modify: `Backend/Features/Api/Controllers/BorrowController.cs`
- Modify: `Backend/Program.cs` (DI registrations)

- [x] **Step 1: Implement `IBookCopyRepository` & `BookCopyRepository`**
Queries for `GetByBookIdAsync`, `GetByAccessionNumberAsync`, `GetByQrCodeAsync`, `GetAvailableCopyAsync`, `AddAsync`, `UpdateAsync`.

- [x] **Step 2: Implement `IBookCopyService` & `BookCopyService`**
Methods to generate accession numbers (e.g. `KP-ACC-{BookIdSubstring}-{CopyNumber}`), format QR payload (`KP:COPY:{BookId}:{AccessionNumber}`), seed missing copies for titles, and resolve scan queries.

- [x] **Step 3: Create `BookCopiesController.cs`**
Endpoints:
- `GET /api/books/{id}/copies`
- `POST /api/books/{id}/copies`
- `GET /api/copies/scan?code={qrOrAccession}`

- [x] **Step 4: Update `BorrowService.cs` for copy-aware check-in and return**
- On checkout: Claim available copy, set `Status = CopyStatus.Borrowed`.
- On return: Transition `BookCopy.Status = CopyStatus.Available` (or `Damaged` based on inspection), update condition notes, calculate late and damage fees.

- [x] **Step 5: Register DI in `Program.cs`, build and restart Backend**
Rebuild via `dotnet build Backend -c Debug` and restart detached process on `http://localhost:5000`.

---

### Task 3: Frontend API Client Endpoints

**Files:**
- Create: `Frontend/src/Endpoints/Admin/bookCopiesApi.ts`
- Modify: `Frontend/src/Endpoints/Cashier/transactionApi.ts`

- [x] **Step 1: Create `bookCopiesApi.ts`**
Typed methods for `getBookCopies(bookId)`, `addBookCopy(bookId, payload)`, `scanBookCopy(code)`.

- [x] **Step 2: Update `transactionApi.ts`**
Support `processBookReturn` with `bookCopyId`, `copyCode`, `condition`, and `conditionNotes`.

---

### Task 4: Cashier Returns Desk Camera QR Scanner & Manual Input UI

**Files:**
- Modify: `Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/ReturnsFines.tsx`

- [x] **Step 1: Build Camera QR Viewfinder Component in `ReturnsFines.tsx`**
- Embed live video viewfinder using `navigator.mediaDevices.getUserMedia`.
- Include camera device selection (switch between front, back, external USB webcam).
- Overlay scanner reticle frame with live scanning indicator.
- Automatically decode QR codes using standard browser `BarcodeDetector` (or canvas decode).

- [x] **Step 2: Connect Dual Input & Auto-Load**
- Both camera scan detection and manual typing of the Accession Number trigger `scanBookCopy(code)`.
- Automatically loads the matched borrowing record and physical copy details.

- [x] **Step 3: Condition Audit & One-Click Return**
- Radio/pill selector for condition: `Good` (₱0), `Minor Wear` (₱0), `Damaged` (₱150 fine), `Lost` (replacement fee).
- Display overdue fine calculation + condition assessment summary.
- One-click check-in button completing return and restoring copy to `Available`.

---

### Task 5: Admin Books Manager Physical Copies & Printable QR Code UI

**Files:**
- Modify: `Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/BooksManager.tsx`

- [x] **Step 1: Add "Physical Copies & QR Labels" Drawer/Modal**
Add action button in book table rows to open Physical Copies management.

- [x] **Step 2: Render Physical Copies Ledger**
Show copy index (#1, #2...), Accession Number, shelf bay, condition, and status (`Available` in green, `On Loan` in amber, `Damaged` in red).

- [x] **Step 3: Implement Printable QR Label Generator**
Generate crisp QR codes for each copy using SVG/Canvas with a **"Print QR Sticker"** button formatted for printing book inside-cover labels.

- [x] **Step 4: Verify Live Synchronization**
Verify that when a copy is returned in Cashier Returns, the Admin copies list immediately reflects `Available`.

---

### Task 6: Closed-Loop Automated Verification Suite

**Files:**
- Create: `Katipuneros-Library-Store/scratch/verify_unique_book_copy_qr_flow.ps1`

- [x] **Step 1: Write and run verification script**
Test end-to-end:
1. Book copy creation & QR payload verification.
2. Checkout binding to specific physical copy.
3. Dual QR scan resolution via `/api/copies/scan`.
4. Cashier return resetting copy status and recording condition audit.
5. Admin copy verification showing synchronized `Available` status.

- [x] **Step 2: Production Build Check**
Run `npm run build` in `Frontend` to verify 0 errors across all modules.
