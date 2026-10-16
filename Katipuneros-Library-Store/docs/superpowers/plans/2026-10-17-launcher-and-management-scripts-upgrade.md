# Launcher and Management Scripts Tri-Port Architecture Upgrade Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade all launcher scripts (`hard-refresh.bat`, `manage.ps1`, `manage.bat`, `start-dev.bat`, `run.bat`, `cli.ps1`) in `Katipuneros-Library-Store` to fully orchestrate, monitor, start, stop, and clean the multi-portal tri-port frontend ecosystem (`:5173` Patron, `:5174` Admin, `:5175` Cashier) alongside the .NET 10 Web API backend (`:5000`), with added Cashier CLI governance and live status reporting.

**Architecture:** 
- The Katipuneros Library Store utilizes a 4-service topology:
  1. Backend API: `http://localhost:5000` (.NET 10 ASP.NET Core)
  2. Public Landing & Patron Portal: `http://127.0.0.1:5173` (`npm run dev:customer` / `dev`)
  3. Chief Administrator Console: `http://127.0.0.1:5174` (`npm run dev:admin`)
  4. Cashier Circulation Desk Terminal: `http://127.0.0.1:5175` (`npm run dev:cashier`)
- `manage.ps1` serves as the central control plane for process orchestration, port harvesting, cache clearing, and health checking.
- Batch files (`hard-refresh.bat`, `manage.bat`, `start-dev.bat`, `run.bat`) forward execution to `manage.ps1` with bypass execution policies and proper title telemetry.
- `cli.ps1` handles out-of-band administrative root user management directly with the compiled backend DLL without requiring the Web UI.

**Tech Stack:** PowerShell 7/5.1, Windows Batch (`.bat`), .NET 10 SDK, Node.js / Vite 6.

**Spec:** Multi-Portal Port Isolation & Circulation Lifecycle Architecture (`multi_portal_port_isolation_and_circulation_lifecycle_plan.md`).

## Global Constraints

- Backend must bind to port 5000 (`http://localhost:5000`).
- Customer / Patron Portal must bind to port 5173 (`http://127.0.0.1:5173`).
- Admin Portal must bind to port 5174 (`http://127.0.0.1:5174`).
- Cashier Terminal must bind to port 5175 (`http://127.0.0.1:5175`).
- All scripts must maintain zero external tool dependencies outside Windows native PowerShell, .NET SDK, and npm.
- No existing functionality (EF Core migrations, SHA-256 chain verification, superadmin prompts) should be broken or removed.

---

### Task 1: Upgrade `manage.ps1` for Full 4-Port Orchestration & Live Status

**Files:**
- Modify: `Katipuneros-Library-Store/manage.ps1:1-478`

**Interfaces:**
- Consumes: `Frontend/package.json` scripts (`dev`, `dev:admin`, `dev:cashier`), `Backend/Backend.csproj`
- Produces: `manage.ps1 start`, `manage.ps1 stop`, `manage.ps1 refresh`, `manage.ps1 status`, `manage.ps1 test`, and updated interactive menu

- [ ] **Step 1: Update Header & Comments**
  Document the 4-service architecture:
  - Port 5000: .NET 10 Web API Backend
  - Port 5173: Public Landing & Patron Portal (`npm run dev:customer`)
  - Port 5174: Chief Administrator Console (`npm run dev:admin`)
  - Port 5175: Cashier Circulation Desk Terminal (`npm run dev:cashier`)

- [ ] **Step 2: Update `Stop-AllServices` to include Port 5175**
  Expand `$ports = @(5000, 5173, 5174)` to `$ports = @(5000, 5173, 5174, 5175)`. Update console outputs to indicate ports 5000, 5173, 5174, and 5175 are cleared.

- [ ] **Step 3: Update `Start-AllServices` to launch Port 5175**
  In addition to launching Backend (5000), Patron Portal (5173), and Admin Console (5174), spawn a dedicated PowerShell window for Cashier Terminal:
  ```powershell
  # 6. Start Dedicated Cashier Circulation Terminal on Port 5175
  Write-Host "[*] Launching Cashier Circulation Terminal on http://127.0.0.1:5175..." -ForegroundColor Cyan
  $cashierCmd = "cd '$FrontendDir'; npm run dev:cashier -- --host 127.0.0.1"
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Katipuneros Cashier Circulation Terminal (:5175)' -ForegroundColor Yellow; $cashierCmd"
  ```
  Update the launch summary banner and browser auto-open calls to list all three frontends:
  - Patron Portal: `http://127.0.0.1:5173/login`
  - Admin Console: `http://127.0.0.1:5174/admin/login`
  - Cashier Terminal: `http://127.0.0.1:5175/cashier/login`
  - Backend API: `http://localhost:5000/scalar/v1`

- [ ] **Step 4: Implement `Show-Status` Function**
  Add a real-time status probe function that queries `Get-NetTCPConnection` or `netstat` and performs HTTP requests to each port:
  - `http://localhost:5000/api/health`
  - `http://127.0.0.1:5173/`
  - `http://127.0.0.1:5174/`
  - `http://127.0.0.1:5175/`
  Display a clear ASCII matrix indicating Port, Service Name, PID, Listener Status, and HTTP Status.

- [ ] **Step 5: Update `Hard-Refresh` and `Run-HealthTests`**
  Ensure `Hard-Refresh` wipes `.vite` cache, `.NET` artifacts, runs `tsc -b`, builds Backend, and restarts all 4 services. Ensure `Run-HealthTests` validates connectivity across all 4 endpoints.

- [ ] **Step 6: Update CLI Dispatcher & Interactive Menu**
  Add `"status"` to the CLI dispatcher (`switch ($Action.ToLower()) { "status" { Show-Status; exit } ... }`).
  Update Menu option `[1]` to "Start Fullstack Dev -> Backend :5000 + Patron :5173 + Admin :5174 + Cashier :5175".
  Update Menu option `[3]` to "Stop All Services -> Free ports 5000, 5173, 5174, and 5175".
  Add Menu option `[S]` or `[10]` to "Live Status Matrix -> Inspect all 4 ports and HTTP health".

---

### Task 2: Upgrade Batch Launchers (`hard-refresh.bat`, `start-dev.bat`, `run.bat`, `manage.bat`)

**Files:**
- Modify: `Katipuneros-Library-Store/hard-refresh.bat`
- Modify: `Katipuneros-Library-Store/start-dev.bat`
- Modify: `Katipuneros-Library-Store/run.bat`
- Modify: `Katipuneros-Library-Store/manage.bat`

**Interfaces:**
- Consumes: `manage.ps1`
- Produces: Seamless double-click and terminal launcher entry points

- [ ] **Step 1: Update `hard-refresh.bat`**
  Set descriptive window title: `Hard Refresh Katipuneros Library Store [Ports 5000, 5173, 5174, 5175]`.
  Ensure execution bypass and path resolution cleanly invoke `manage.ps1 refresh`.

- [ ] **Step 2: Update `start-dev.bat`**
  Set descriptive window title: `Start Katipuneros Library Store Dev [Backend :5000 | Patron :5173 | Admin :5174 | Cashier :5175]`.
  Provide informative startup greeting and invoke `manage.ps1 start`.

- [ ] **Step 3: Update `run.bat` & `manage.bat`**
  Set descriptive window titles.
  Ensure command line parameters (`%*`) pass cleanly to `manage.ps1` with double-quotes preserved.

---

### Task 3: Upgrade `cli.ps1` with Cashier Governance & Password Reset

**Files:**
- Modify: `Katipuneros-Library-Store/cli.ps1`

**Interfaces:**
- Consumes: `Backend/Program.cs` CLI arguments (`listcliusers`, `createsuperuseradmin`, `createcustomersuperuseradmin`, `adduser`, `resetpassword`, `editcliuser`, `deletecliuser`, `deleteallcliusers`)
- Produces: Enhanced root administrative governance tool with Cashier support and Password Reset

- [ ] **Step 1: Add Cashier Registration Support**
  Add `Invoke-CreateCashierSuperAdmin($uname, $pwd, $mail, $fn, $ln, $dept)` calling:
  ```powershell
  & dotnet run --project "$BackendDir" --no-build -- adduser "$uname" "$pwd" "$mail" Cashier "$fn" "$ln" "$dept"
  ```
  Add `createcashiersuperuseradmin` command to the dispatcher and interactive menu.

- [ ] **Step 2: Add Password Reset Command**
  Add `Invoke-ResetPassword($id, $newPassword)` calling:
  ```powershell
  & dotnet run --project "$BackendDir" --no-build -- resetpassword "$id" "$newPassword"
  ```
  Add `resetpassword` command to the dispatcher and interactive menu.

- [ ] **Step 3: Update Interactive Menu & Table Display**
  Ensure role coloring and display handle `Admin`, `Cashier`, and `Customer` cleanly. Add menu options for Cashier creation and Password Reset.

---

### Task 4: End-to-End Verification & Health Check

**Files:**
- Test scripts: `manage.ps1`, `cli.ps1`, `hard-refresh.bat`, `start-dev.bat`, `run.bat`, `manage.bat`

- [ ] **Step 1: Validate PowerShell Syntax**
  Run syntax checks on `manage.ps1` and `cli.ps1`:
  ```powershell
  [System.Management.Automation.Language.Parser]::ParseInput((Get-Content manage.ps1 -Raw), [ref]$null, [ref]$errors)
  [System.Management.Automation.Language.Parser]::ParseInput((Get-Content cli.ps1 -Raw), [ref]$null, [ref]$errors)
  ```
  Assert 0 syntax parse errors.

- [ ] **Step 2: Verify `manage.ps1 status` Command**
  Execute `powershell -ExecutionPolicy Bypass -File manage.ps1 status` and verify that ports 5000, 5173, 5174, and 5175 are reported.

- [ ] **Step 3: Verify `cli.ps1 listusers` Command**
  Execute `powershell -ExecutionPolicy Bypass -File cli.ps1 listusers` and verify the ASCII table renders properly.

- [ ] **Step 4: Verify `manage.ps1 test` Health Suite**
  Execute `powershell -ExecutionPolicy Bypass -File manage.ps1 test` to confirm build gates and SHA-256 verification pass.
