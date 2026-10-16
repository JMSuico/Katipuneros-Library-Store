$vaultRoot = 'C:\Users\provu\Desktop\KATIPUNEROS LIBRARY STORE\Katipuneros-Vault'

$dirs = @(
    "$vaultRoot\.obsidian",
    "$vaultRoot\00-Inbox-Clippings",
    "$vaultRoot\01-Architecture-Wiki",
    "$vaultRoot\02-Knowledge-Graph",
    "$vaultRoot\03-Agent-Memory",
    "$vaultRoot\04-Task-Observer-Log",
    "$vaultRoot\05-Harness-Engineering",
    "$vaultRoot\06-Bases",
    "$vaultRoot\07-Canvases",
    "$vaultRoot\08-Templates"
)

foreach ($d in $dirs) {
    if (-not (Test-Path $d)) {
        New-Item -ItemType Directory -Path $d -Force | Out-Null
    }
}

# 1. .obsidian config
$appJson = @'
{
  "spellcheck": false,
  "livePreview": true,
  "useMarkdownLinks": false,
  "strictLineBreaks": false
}
'@
Set-Content -Path "$vaultRoot\.obsidian\app.json" -Value $appJson -Encoding UTF8

$communityPluginsJson = @'
[
  "obsidian-kanban",
  "dataview"
]
'@
Set-Content -Path "$vaultRoot\.obsidian\community-plugins.json" -Value $communityPluginsJson -Encoding UTF8

# 2. index.md & HOME_DASHBOARD.md
$indexMd = @'
---
title: Katipuneros Library Store - Obsidian Vault Index
created: 2026-10-16
tags: [index, dashboard, architecture, memory]
---

# 📚 Katipuneros Library Store — Obsidian Vault

Welcome to the **Katipuneros Library Store System Knowledge Vault & Agent Memory System**.

> [!INFO] Project Architecture Overview
> - **Frontend**: React 19 + TypeScript + Vite (`Frontend/`) on Port 5173 (Customer & Cashier) and Port 5174 (Admin)
> - **Backend**: .NET 10 ASP.NET Core Web API (`Backend/`) on Port 5000
> - **Database**: SQL Server Express (`KatipunerosLibraryDb`) with EF Core 10 + Dapper
> - **Cache**: Redis Cache-Aside (`katipuneros:*`)
> - **Authentication**: JWT Bearer + BCrypt Password Hashing + Role-Based Access Control (`Customer`, `Cashier`, `Admin`)

## 🗺️ Quick Links & MOCs
- [[01-Architecture-Wiki/Frontend-Flowchain]] — React 19 UI, component hierarchy, and endpoints
- [[01-Architecture-Wiki/Backend-Flowchain]] — ASP.NET Core Controllers, Services, Repositories
- [[01-Architecture-Wiki/Database-Schema]] — SQL Server Tables, DDL, relationships, and constraints
- [[01-Architecture-Wiki/Redis-Cache-Design]] — Cache keys, TTLs, and invalidation triggers
- [[01-Architecture-Wiki/CRUD-Verification-Playbook]] — Full-Stack Verification & Bug-Hunting Protocol
- [[02-Knowledge-Graph/GRAPH_REPORT]] — Architecture hubs, coupling matrix, god nodes
- [[03-Agent-Memory/MEMORY]] — Agent memory discipline, active projects, and system invariants
- [[04-Task-Observer-Log/observation-log]] — Engineering lessons, patterns, and anti-patterns
- [[05-Harness-Engineering/Loop-Eng-Contracts]] — Autonomous loop-eng verify commands and invariants

## 🧭 Visual Canvases
- `07-Canvases/FullStack-Flowchain.canvas`
'@
Set-Content -Path "$vaultRoot\index.md" -Value $indexMd -Encoding UTF8
Set-Content -Path "$vaultRoot\HOME_DASHBOARD.md" -Value $indexMd -Encoding UTF8

# 3. 01-Architecture-Wiki/
$crudPlaybook = @'
---
title: CRUD Verification & Edit-Lock-Save Protocol
tags: [crud, verification, security, architecture]
---

# 🛡️ Full-Stack CRUD Verification & Edit-Lock-Save Protocol

## 1. Universal Profile Edit-Lock-Save Rule
Across **all user portals** (`Customer`, `Cashier`, `Admin`):
1. **Locked by Default (`isEditing === false`)**:
   - All profile credential inputs (`firstName`, `middleName`, `lastName`, `username`, `email`, `phoneNumber`, `currentAddress`, `permanentAddress`, `department`, `employmentStatus`, `age`) MUST be disabled/readOnly.
   - Clear visual lock indicator and non-editable background styling.
2. **Unlock Transition**:
   - User clicks **"Edit Profile"** button.
   - `isEditing` transitions to `true`.
   - All input controls unlock.
   - The button transforms into **"Save Changes"** alongside a **"Cancel"** button.
3. **Save & Persist Transition**:
   - User clicks **"Save Changes"**.
   - Frontend validates input fields.
   - Calls `PUT /api/auth/profile` (or `PUT /api/users/profile`).
   - Persists to SQL Server `[Users]` table.
   - Updates `localStorage.setItem('katipuneros_user', ...)`.
   - Updates React UI context/state across header and sidebar.
   - `isEditing` returns to `false` (re-locking inputs).
4. **Cancel Transition**:
   - Resets state back to last persisted user values and sets `isEditing = false`.

## 2. Image & Avatar Upload Rule
- Profile pictures: `POST /api/auth/profile-picture` or `PUT /api/users/{id}` persists base64/URL to `[Users].[ProfilePictureUrl]` (`NVARCHAR(MAX)`).
- Book cover images: `POST /api/books` or `PUT /api/books/{id}` persists base64/URL to `[Books].[CoverImage]` (`NVARCHAR(MAX)`).
'@
Set-Content -Path "$vaultRoot\01-Architecture-Wiki\CRUD-Verification-Playbook.md" -Value $crudPlaybook -Encoding UTF8

# 4. 03-Agent-Memory/
$agentMemory = @'
---
title: Agent Memory Core
updated: 2026-10-16
tags: [memory, discipline, rules]
---

# Agent Memory Core

## System Invariants
1. **Never mock data when an API exists**: Every UI action must communicate with .NET 10 Backend API on Port 5000 and persist in SQL Server `KatipunerosLibraryDb`.
2. **Normalize API paths**: `apiClient.ts` must strip redundant `/api/` prefixes.
3. **Lock Credentials by Default**: All user profile forms must enforce the Edit-Lock-Save pattern.
4. **Base64 & URL Support for Media**: `[Users].[ProfilePictureUrl]` and `[Books].[CoverImage]` must be `NVARCHAR(MAX)`.
5. **Always Verify Live**: Run machine verification (`dotnet build`, `npx tsc --noEmit`, E2E test script) before completing any task.
'@
Set-Content -Path "$vaultRoot\03-Agent-Memory\MEMORY.md" -Value $agentMemory -Encoding UTF8

$agentLessons = @'
---
title: Lessons Learned
updated: 2026-10-16
tags: [lessons, bugs, fixes]
---

# Lessons Learned & Antipatterns

1. **Path Prefix Duplication**: Frontend endpoints written as `/api/returns/...` became `/api/api/returns/...` through `apiClient.ts`. Fixed by stripping duplicate `/api/` in `apiClient.ts` and keeping endpoint paths clean.
2. **Barcode Ingestion FK Constraint**: Ingesting barcodes without setting `CategoryId` resulted in foreign key failures. Fixed by defaulting to default CategoryId.
3. **Borrow PatronId Fallback**: Self-checkout must extract patronId from JWT `NameIdentifier` if not explicitly supplied in request body.
4. **CoverImage Column Length**: Default `[MaxLength(500)]` truncates base64 data URLs. Upgraded to `NVARCHAR(MAX)`.
'@
Set-Content -Path "$vaultRoot\03-Agent-Memory\lessons.md" -Value $agentLessons -Encoding UTF8

# 5. 07-Canvases/FullStack-Flowchain.canvas
$canvasContent = @'
{
  "nodes": [
    {"id": "node-react-ui", "x": 100, "y": 200, "width": 280, "height": 160, "type": "text", "text": "## 1. React 19 Frontend\n- Customer Portal (Port 5173)\n- Cashier Circulation (Port 5173)\n- Admin Command Center (Port 5174)"},
    {"id": "node-endpoints", "x": 450, "y": 200, "width": 280, "height": 160, "type": "text", "text": "## 2. API Endpoints\n- `apiClient.ts` (JWT Bearer)\n- `authApi.ts`, `booksApi.ts`\n- `borrowingsApi.ts`, `fineApi.ts`"},
    {"id": "node-controllers", "x": 800, "y": 200, "width": 280, "height": 160, "type": "text", "text": "## 3. ASP.NET Core API\n- `AuthController`, `UsersController`\n- `BooksController`, `BorrowController`\n- `ReservationsController`, `FinesController`"},
    {"id": "node-services", "x": 800, "y": 420, "width": 280, "height": 160, "type": "text", "text": "## 4. Service & Cache Layer\n- `UserService`, `BookService`\n- `BorrowService`, `CashierService`\n- Redis Cache-Aside (`katipuneros:*`)"},
    {"id": "node-database", "x": 450, "y": 420, "width": 280, "height": 160, "type": "text", "text": "## 5. SQL Server 2022\n- `KatipunerosLibraryDb`\n- EF Core 10 + Dapper\n- `Users`, `Books`, `BorrowRecords`\n- `Reservations`, `FineTransactions`"}
  ],
  "edges": [
    {"id": "edge-1", "fromNode": "node-react-ui", "fromSide": "right", "toNode": "node-endpoints", "toSide": "left"},
    {"id": "edge-2", "fromNode": "node-endpoints", "fromSide": "right", "toNode": "node-controllers", "toSide": "left"},
    {"id": "edge-3", "fromNode": "node-controllers", "fromSide": "bottom", "toNode": "node-services", "toSide": "top"},
    {"id": "edge-4", "fromNode": "node-services", "fromSide": "left", "toNode": "node-database", "toSide": "right"}
  ]
}
'@
Set-Content -Path "$vaultRoot\07-Canvases\FullStack-Flowchain.canvas" -Value $canvasContent -Encoding UTF8

Write-Host "Vault created successfully at $vaultRoot"
