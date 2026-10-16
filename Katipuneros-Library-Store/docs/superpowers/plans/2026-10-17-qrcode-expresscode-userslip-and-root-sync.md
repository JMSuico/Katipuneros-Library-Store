# QRCode, ExpressCode, User Slip PNG, Root Launchers & Infra Verification Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:dispatching-parallel-agents to execute these 5 focused work streams.

**Goal:** Standardize Barcode terminology and functionality to QRCode and ExpressCode across all user roles, implement client-side downloadable User Slip PNG, synchronize 8 root launcher scripts with the 4-port topology, verify Redis cache & PostgreSQL replica infrastructure, and persist full architecture documentation into the Obsidian vault.

**Architecture:** 
1. Replace physical barcode references and icons with QR Code & ExpressCode across Customer, Cashier, and Admin panels while ensuring cashier lookup and return scanners accept QR codes, ExpressCodes, and User Slip reference IDs interchangeably.
2. Render and export an official, downloadable Katipuneros User Slip as PNG using HTML5 canvas and the `qrcode` library, embedding the reservation pickup PIN, assigned bay, expiry timestamp, and high-contrast QR code.
3. Synchronize the 8 root scripts in `C:\Users\provu\Desktop\KATIPUNEROS LIBRARY STORE\` to support the 4-port topology (`:5000` API, `:5173` Patron, `:5174` Admin, `:5175` Cashier) with robust error handling.
4. Verify Redis distributed cache connectivity and PostgreSQL read/write replication split.
5. Archive complete system design, flowcharts, and verification records in `Katipuneros-Vault`.

**Tech Stack:** React 19, TypeScript, HTML5 Canvas, `qrcode`, .NET 10 ASP.NET Core, Npgsql, Redis, PowerShell, Obsidian Flavored Markdown.

---

### Stream 1: Synchronize 8 Root Launcher Scripts (`C:\Users\provu\Desktop\KATIPUNEROS LIBRARY STORE\`)
- **Target Files**:
  - `stop-all.bat`
  - `start-dev.bat`
  - `run.bat`
  - `manage.ps1`
  - `manage.bat`
  - `db-migrate.bat`
  - `hard-refresh.bat`
  - `cli.ps1`
- **Actions**:
  - Update `manage.ps1` to detect inner repo `Katipuneros-Library-Store`, expose 4-port topology (:5000, :5173, :5174, :5175), provide `Show-Status` matrix, and include `createcashiersuperuseradmin` & `resetpassword` commands.
  - Update `start-dev.bat`, `stop-all.bat`, `hard-refresh.bat`, `manage.bat`, `db-migrate.bat`, and `cli.ps1` to cleanly delegate to the upgraded master controller.
  - Run verification test `powershell -ExecutionPolicy Bypass -File .\manage.ps1 test`.

### Stream 2: Barcode to QRCode & ExpressCode Standardization
- **Target Files**:
  - `Frontend/src/UserRoles/Features/Pages/CustomersPanel/Pages/ReservationsPage.tsx`
  - `Frontend/src/UserRoles/Features/Pages/CustomersPanel/Pages/BorrowingsPage.tsx`
  - `Frontend/src/UserRoles/Features/Pages/CustomersPanel/Pages/ProfileSettings.tsx`
  - `Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/CheckoutBorrow.tsx`
  - `Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/ReturnsFines.tsx`
  - `Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/PendingReservations.tsx`
  - `Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/CustomerLookup.tsx`
  - `Frontend/src/UserRoles/Features/Pages/AdminsPanel/Pages/BooksManager.tsx`
- **Actions**:
  - Replace barcode mentions and icons with `qr_code_2`, `qr_code_scanner`, `qr_code`.
  - Fix phrasing in pickup modal: "Present this 4-digit PIN or your student QR code / ExpressCode to the desk cashier."
  - Fix duplicate text: "Counter Bay Bay 01 Counter" -> "Bay 01 Counter".
  - Ensure searching and scanning accepts QRCode data, ExpressCode (`SCAN-BAY-XXXXXX`), and book accession code seamlessly.

### Stream 3: Downloadable User Slip PNG Component
- **Target Files**:
  - `Frontend/src/Shared/Utils/generateUserSlipPng.ts` (New utility)
  - `Frontend/src/UserRoles/Features/Pages/CustomersPanel/Pages/ReservationsPage.tsx`
  - `Frontend/src/UserRoles/Features/Pages/CustomersPanel/Pages/BorrowingsPage.tsx`
- **Actions**:
  - Implement canvas-based PNG renderer generating a branded 800x1000px User Slip:
    - Heritage header & Katipuneros Library Store seal
    - Patron Name & Library Card ID
    - Book Title, Author, Call Number
    - Staged Bay Location & 4-Digit Pickup PIN
    - Generated QR Code containing the ExpressCode
    - Human-readable ExpressCode (`SCAN-BAY-XXXXXX`)
    - Expiration & loan terms
  - Wire button onClick to generate PNG and trigger browser download `Katipuneros_UserSlip_<ReservationID>.png`.

### Stream 4: Infrastructure Verification (Redis Cache & PostgreSQL Replica)
- **Target Files**:
  - `scratch/verify_infra_redis_replica.ps1`
  - `Backend/Features/DBInfrastructure/Cache/CacheService.cs`
  - `Backend/Features/Data/ReadOnlyAppDbContext.cs`
- **Actions**:
  - Test Redis cache connection string and fallback behavior.
  - Verify PostgreSQL streaming replication configuration and `ReadOnlyAppDbContext` query isolation.
  - Validate that mutation queries are rejected on `ReadOnlyAppDbContext` and allowed on `AppDbContext`.

### Stream 5: Obsidian Documentation & Process Archiving
- **Target Files in `Katipuneros-Vault/`**:
  - `01-Architecture-Wiki/8-Layer-Docker-Kubernetes-Architecture.md`
  - `01-Architecture-Wiki/Circulation-QRCode-and-UserSlip-Standard.md`
  - `04-Task-Observer-Log/2026-10-17-Production-Infrastructure-and-UserSlip-Log.md`
  - `HOME_DASHBOARD.md` (Update links)
  - `index.md` (Update links)
- **Actions**:
  - Write detailed Obsidian Flavored Markdown notes with callouts, wikilinks, and metadata tags documenting the complete 8-layer architecture, QRCode & ExpressCode standardization, and User Slip feature.
