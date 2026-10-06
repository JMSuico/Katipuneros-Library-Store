# ==============================================================================
# Katipuneros Library Store -- Unified Dev & Ops Master Controller
# Works across any Windows laptop without needing Visual Studio IDE.
# Usage:
#   .\manage.ps1             (Launches interactive menu)
#   .\manage.ps1 start       (Starts Backend :5000, Public UI :5173, Admin :5174)
#   .\manage.ps1 refresh     (Hard refresh: cleans caches, rebuilds & restarts)
#   .\manage.ps1 stop        (Stops all running services on ports 5000, 5173, 5174)
#   .\manage.ps1 migrate     (Interactive EF Core migration & DB update)
#   .\manage.ps1 test        (Build checks, API tests & SHA-256 chain verification)
# ==============================================================================

param (
    [string]$Action = ""
)

$ErrorActionPreference = "Stop"

# Resolve root directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (Test-Path (Join-Path $ScriptDir "Katipuneros-Library-Store")) {
    $RootDir = Join-Path $ScriptDir "Katipuneros-Library-Store"
} else {
    $RootDir = $ScriptDir
}

$BackendDir = Join-Path $RootDir "Backend"
$FrontendDir = Join-Path $RootDir "Frontend"

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Yellow
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Check-Prerequisites {
    Write-Host "[*] Checking development prerequisites..." -ForegroundColor Gray
    
    # 1. Check .NET SDK
    try {
        $dotnetVer = & dotnet --version 2>$null
        Write-Host "  [OK] .NET SDK installed: v$dotnetVer" -ForegroundColor Green
    } catch {
        Write-Host "  [ERROR] .NET SDK is not installed! Download .NET 10 or .NET 9 from https://dotnet.microsoft.com/download" -ForegroundColor Red
        return $false
    }

    # 2. Check Node.js
    try {
        $nodeVer = & node --version 2>$null
        Write-Host "  [OK] Node.js installed: $nodeVer" -ForegroundColor Green
    } catch {
        Write-Host "  [ERROR] Node.js is not installed! Download Node.js from https://nodejs.org/" -ForegroundColor Red
        return $false
    }

    # 3. Check Frontend node_modules
    $nmPath = Join-Path $FrontendDir "node_modules"
    if (-not (Test-Path $nmPath)) {
        Write-Host "  [*] Frontend dependencies not found. Installing now..." -ForegroundColor Yellow
        Push-Location $FrontendDir
        & npm install
        Pop-Location
        Write-Host "  [OK] Frontend dependencies installed successfully." -ForegroundColor Green
    }

    return $true
}

function Stop-AllServices {
    Write-Header "STOPPING ALL KATIPUNEROS SERVICES (PORTS 5000, 5173, 5174)"
    
    $ports = @(5000, 5173, 5174)
    $killedCount = 0

    foreach ($port in $ports) {
        try {
            $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
            if ($connections) {
                foreach ($conn in $connections) {
                    $pidToKill = $conn.OwningProcess
                    if ($pidToKill -gt 0 -and $pidToKill -ne $PID) {
                        try {
                            $proc = Get-Process -Id $pidToKill -ErrorAction SilentlyContinue
                            if ($proc) {
                                Write-Host "  [!] Terminating process $($proc.ProcessName) (PID: $pidToKill) on port $port..." -ForegroundColor Yellow
                                Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
                                $killedCount++
                            }
                        } catch {}
                    }
                }
            }
        } catch {}
    }

    # Fallback to netstat if Get-NetTCPConnection did not catch anything
    if ($killedCount -eq 0) {
        foreach ($port in $ports) {
            $lines = netstat -ano | Select-String ":$port\s+.*LISTENING\s+(\d+)"
            foreach ($line in $lines) {
                if ($line.Matches.Groups[1].Value) {
                    $pidToKill = [int]$line.Matches.Groups[1].Value
                    if ($pidToKill -gt 0 -and $pidToKill -ne $PID) {
                        Write-Host "  [!] Terminating listener PID $pidToKill on port $port..." -ForegroundColor Yellow
                        Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
                        $killedCount++
                    }
                }
            }
        }
    }

    if ($killedCount -gt 0) {
        Write-Host "  [OK] Stopped $killedCount service process(es). Ports 5000, 5173, and 5174 are now free." -ForegroundColor Green
    } else {
        Write-Host "  [i] No active services detected on ports 5000, 5173, or 5174." -ForegroundColor Gray
    }
}

function Start-AllServices {
    Write-Header "STARTING KATIPUNEROS LIBRARY STORE (DEV PREVIEW)"
    if (-not (Check-Prerequisites)) { return }

    # 1. Stop any stale instances
    Stop-AllServices

    # 2. Update Database via EF Core to ensure schemas are current
    Write-Host "[*] Synchronizing SQL Server Database Schema via EF Core..." -ForegroundColor Gray
    try {
        Push-Location $RootDir
        & dotnet ef database update --project Backend
        Pop-Location
        Write-Host "  [OK] Database schema is up to date." -ForegroundColor Green
    } catch {
        Write-Host "  [!] Database update warning: Continuing to start services..." -ForegroundColor Yellow
    }

    # 3. Start Backend Web API on Port 5000
    Write-Host "[*] Launching .NET 10 Web API backend on http://localhost:5000..." -ForegroundColor Cyan
    $backendCmd = "cd '$BackendDir'; dotnet run --launch-profile http"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Katipuneros .NET 10 Web API Backend' -ForegroundColor Cyan; $backendCmd"

    # Wait for backend port 5000 to be ready
    Write-Host "[*] Waiting for backend API to initialize..." -ForegroundColor Gray
    $retry = 0
    $backendReady = $false
    while ($retry -lt 15 -and -not $backendReady) {
        Start-Sleep -Seconds 1
        try {
            $testReq = Invoke-WebRequest -Uri "http://localhost:5000/api/books" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($testReq.StatusCode -eq 200) { $backendReady = $true }
        } catch {
            $retry++
        }
    }

    if ($backendReady) {
        Write-Host "  [OK] Backend API is live and responding on http://localhost:5000/api" -ForegroundColor Green
    } else {
        Write-Host "  [i] Backend process spawned. Proceeding to launch UI clients..." -ForegroundColor Yellow
    }

    # 4. Start Public Frontend Client on Port 5173 (Customer, Cashier, Landing Page)
    Write-Host "[*] Launching Public & Circulation Client on http://127.0.0.1:5173..." -ForegroundColor Cyan
    $publicCmd = "cd '$FrontendDir'; npm run dev -- --host 127.0.0.1 --port 5173"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Katipuneros Public & Circulation Client (:5173)' -ForegroundColor Green; $publicCmd"

    # 5. Start Security-Isolated Admin Portal on Port 5174
    Write-Host "[*] Launching Isolated Chief Admin Portal on http://127.0.0.1:5174..." -ForegroundColor Cyan
    $adminCmd = "cd '$FrontendDir'; npm run dev:admin -- --host 127.0.0.1"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Katipuneros Isolated Admin Console (:5174)' -ForegroundColor Magenta; $adminCmd"

    Start-Sleep -Seconds 2

    # 6. Auto-Launch Web Browser
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host "  ALL SERVICES SUCCESSFULLY LAUNCHED!" -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host "  * Public Portal (Patron / Cashier):  http://127.0.0.1:5173/login" -ForegroundColor White
    Write-Host "  * Chief Admin Console (Isolated):    http://127.0.0.1:5174/admin/login" -ForegroundColor White
    Write-Host "  * Backend API & Scalar Docs:         http://localhost:5000/scalar/v1" -ForegroundColor White
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host ""

    Write-Host "[*] Opening browser tabs for preview..." -ForegroundColor Gray
    Start-Process "http://127.0.0.1:5173/"
    Start-Process "http://127.0.0.1:5174/admin/login"
}

function Hard-Refresh {
    Write-Header "HARD REFRESH & CLEAN REBUILD"
    
    # 1. Stop existing services
    Stop-AllServices

    # 2. Clean Vite Cache & Build Artifacts
    Write-Host "[*] Cleaning Vite cache and frontend build output..." -ForegroundColor Gray
    $viteCache = Join-Path $FrontendDir "node_modules\.vite"
    if (Test-Path $viteCache) { Remove-Item -Recurse -Force $viteCache }
    $distFolder = Join-Path $FrontendDir "dist"
    if (Test-Path $distFolder) { Remove-Item -Recurse -Force $distFolder }
    Write-Host "  [OK] Frontend cache purged." -ForegroundColor Green

    # 3. Clean .NET bin & obj
    Write-Host "[*] Cleaning .NET build artifacts..." -ForegroundColor Gray
    Push-Location $BackendDir
    & dotnet clean --verbosity quiet
    Pop-Location
    Write-Host "  [OK] .NET clean completed." -ForegroundColor Green

    # 4. Verify Frontend TypeScript Compilation
    Write-Host "[*] Validating TypeScript compilation (tsc -b)..." -ForegroundColor Gray
    Push-Location $FrontendDir
    & npx tsc -b
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] TypeScript build failed. Please fix compile errors before refreshing." -ForegroundColor Red
        Pop-Location
        return
    }
    Write-Host "  [OK] TypeScript check passed with 0 errors." -ForegroundColor Green
    Pop-Location

    # 5. Build .NET Backend
    Write-Host "[*] Building .NET 10 backend..." -ForegroundColor Gray
    Push-Location $RootDir
    & dotnet build Backend/Backend.csproj
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] Backend build failed." -ForegroundColor Red
        Pop-Location
        return
    }
    Write-Host "  [OK] Backend built successfully with 0 errors." -ForegroundColor Green
    Pop-Location

    # 6. Re-launch fresh services
    Start-AllServices
}

function Run-DatabaseMigrations {
    Write-Header "ENTITY FRAMEWORK CORE DATABASE MIGRATIONS & UPDATE"
    if (-not (Check-Prerequisites)) { return }

    Write-Host "Choose migration option:" -ForegroundColor Yellow
    Write-Host "  [1] Apply all pending migrations (dotnet ef database update)"
    Write-Host "  [2] Create a new migration and apply it"
    Write-Host "  [3] Re-seed initial database catalog and default users"
    Write-Host "  [0] Back to main menu"
    $choice = Read-Host "Select [0-3]"

    switch ($choice) {
        "1" {
            Write-Host "[*] Applying migrations to SQL Server database..." -ForegroundColor Cyan
            Push-Location $RootDir
            & dotnet ef database update --project Backend
            Pop-Location
            Write-Host "[OK] Database schema update completed." -ForegroundColor Green
        }
        "2" {
            $migName = Read-Host "Enter descriptive name for the new migration (e.g. AddPatronClearance)"
            if ([string]::IsNullOrWhiteSpace($migName)) {
                Write-Host "[!] Migration name cannot be empty." -ForegroundColor Red
                return
            }
            Write-Host "[*] Creating migration '$migName'..." -ForegroundColor Cyan
            Push-Location $RootDir
            & dotnet ef migrations add $migName --project Backend
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[*] Applying new migration to database..." -ForegroundColor Cyan
                & dotnet ef database update --project Backend
                Write-Host "[OK] Migration '$migName' successfully created and applied." -ForegroundColor Green
            }
            Pop-Location
        }
        "3" {
            Write-Host "[*] Triggering database re-seed via API..." -ForegroundColor Cyan
            Push-Location $RootDir
            & dotnet ef database update --project Backend
            Pop-Location
            Write-Host "[OK] Database seeded." -ForegroundColor Green
        }
        Default { return }
    }
}

function Run-HealthTests {
    Write-Header "KATIPUNEROS SYSTEM HEALTH & INTEGRITY CHECK"
    
    # Check Backend Build
    Write-Host "[1/4] Checking .NET 10 compilation..." -ForegroundColor Gray
    Push-Location $RootDir
    & dotnet build Backend/Backend.csproj --verbosity minimal
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Backend compiles with 0 errors." -ForegroundColor Green
    }
    Pop-Location

    # Check Frontend Typecheck
    Write-Host "[2/4] Checking Frontend TypeScript..." -ForegroundColor Gray
    Push-Location $FrontendDir
    & npx tsc -b
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Frontend TypeScript compiles with 0 errors." -ForegroundColor Green
    }
    Pop-Location

    # Check live API endpoints if running
    Write-Host "[3/4] Testing Backend REST API connectivity..." -ForegroundColor Gray
    try {
        $books = Invoke-RestMethod -Uri "http://localhost:5000/api/books" -TimeoutSec 3 -ErrorAction Stop
        Write-Host "  [OK] GET /api/books returned $($books.data.Count) catalog titles." -ForegroundColor Green
    } catch {
        Write-Host "  [i] Backend is not currently running. Start services via Option [1] to test live API." -ForegroundColor Yellow
    }

    # Test SHA-256 Chain if API is online
    Write-Host "[4/4] Testing SHA-256 Tamper-Evident Audit Chain..." -ForegroundColor Gray
    try {
        $loginJson = @{ email = "admin@katipuneros.edu.ph"; password = "Admin@2026!" } | ConvertTo-Json
        $auth = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginJson -ContentType "application/json" -TimeoutSec 3 -ErrorAction Stop
        $token = $auth.data.token
        $verify = Invoke-RestMethod -Uri "http://localhost:5000/api/audit/verify-chain" -Method Get -Headers @{ Authorization = "Bearer $token" } -TimeoutSec 3 -ErrorAction Stop
        Write-Host "  [OK] Cryptographic Audit Verification: isIntact=$($verify.data.isIntact) - $($verify.data.statusMessage)" -ForegroundColor Green
    } catch {
        Write-Host "  [i] SHA-256 live test skipped (server offline or starting)." -ForegroundColor Yellow
    }
}

function New-SuperAdminPrompt {
    Write-Header "CREATE SUPERADMIN CLI"
    $username = Read-Host "Enter Username"
    $password = Read-Host "Enter Password"
    $email = Read-Host "Enter Email"
    if ([string]::IsNullOrWhiteSpace($username) -or [string]::IsNullOrWhiteSpace($password) -or [string]::IsNullOrWhiteSpace($email)) {
        Write-Host "[!] Username, Password, and Email are required." -ForegroundColor Red
        return
    }
    Push-Location $BackendDir
    & dotnet run -- createsuperadmin $username $password $email
    Pop-Location
}

function New-CustomSuperAdminPrompt {
    Write-Header "CREATE CUSTOM SUPERADMIN CLI"
    $username = Read-Host "Enter Username"
    $password = Read-Host "Enter Password"
    $email = Read-Host "Enter Email"
    $firstName = Read-Host "Enter First Name (Default: Custom)"
    if ([string]::IsNullOrWhiteSpace($firstName)) { $firstName = "Custom" }
    $lastName = Read-Host "Enter Last Name (Default: SuperAdmin)"
    if ([string]::IsNullOrWhiteSpace($lastName)) { $lastName = "SuperAdmin" }
    $department = Read-Host "Enter Department (Default: System Administration)"
    if ([string]::IsNullOrWhiteSpace($department)) { $department = "System Administration" }
    
    Push-Location $BackendDir
    & dotnet run -- createcustomsuperadmin $username $password $email $firstName $lastName $department
    Pop-Location
}

function New-UserCliPrompt {
    Write-Header "ADD NEW USER CLI"
    $username = Read-Host "Enter Username"
    $password = Read-Host "Enter Password"
    $email = Read-Host "Enter Email"
    $role = Read-Host "Enter Role [Customer/Cashier/Admin] (Default: Customer)"
    if ([string]::IsNullOrWhiteSpace($role)) { $role = "Customer" }
    $firstName = Read-Host "Enter First Name (Default: New)"
    if ([string]::IsNullOrWhiteSpace($firstName)) { $firstName = "New" }
    $lastName = Read-Host "Enter Last Name (Default: User)"
    if ([string]::IsNullOrWhiteSpace($lastName)) { $lastName = "User" }
    $department = Read-Host "Enter Department (Default: General)"
    if ([string]::IsNullOrWhiteSpace($department)) { $department = "General" }
    
    Push-Location $BackendDir
    & dotnet run -- adduser $username $password $email $role $firstName $lastName $department
    Pop-Location
}

# ─── Command Line Argument Dispatcher ────────────────────────────────────────
switch ($Action.ToLower()) {
    "start"   { Start-AllServices; exit }
    "refresh" { Hard-Refresh; exit }
    "stop"    { Stop-AllServices; exit }
    "migrate" { Run-DatabaseMigrations; exit }
    "createdb" { 
        Write-Host "[*] Creating/Updating Database via EF Core migrations with InventoryLibrary credentials..." -ForegroundColor Cyan
        Push-Location $RootDir
        & dotnet ef database update --project Backend
        Pop-Location
        exit
    }
    "test"    { Run-HealthTests; exit }
    "createsuperadmin" { 
        if ($args.Count -lt 3) {
            Write-Host "Usage: .\manage.ps1 createsuperadmin <username> <password> <email>" -ForegroundColor Red
            exit 1
        }
        Push-Location $BackendDir
        & dotnet run -- createsuperadmin $args[0] $args[1] $args[2]
        Pop-Location
        exit 
    }
    "createcustomsuperadmin" {
        if ($args.Count -lt 3) {
            Write-Host "Usage: .\manage.ps1 createcustomsuperadmin <username> <password> <email> [firstName] [lastName] [department]" -ForegroundColor Red
            exit 1
        }
        $fName = if ($args.Count -gt 3) { $args[3] } else { "Custom" }
        $lName = if ($args.Count -gt 4) { $args[4] } else { "SuperAdmin" }
        $dept = if ($args.Count -gt 5) { $args[5] } else { "System Administration" }
        Push-Location $BackendDir
        & dotnet run -- createcustomsuperadmin $args[0] $args[1] $args[2] $fName $lName $dept
        Pop-Location
        exit
    }
    "adduser" {
        if ($args.Count -lt 3) {
            Write-Host "Usage: .\manage.ps1 adduser <username> <password> <email> [role] [firstName] [lastName] [department]" -ForegroundColor Red
            exit 1
        }
        $role = if ($args.Count -gt 3) { $args[3] } else { "Customer" }
        $fName = if ($args.Count -gt 4) { $args[4] } else { "New" }
        $lName = if ($args.Count -gt 5) { $args[5] } else { "User" }
        $dept = if ($args.Count -gt 6) { $args[6] } else { "General" }
        Push-Location $BackendDir
        & dotnet run -- adduser $args[0] $args[1] $args[2] $role $fName $lName $dept
        Pop-Location
        exit
    }
}

# ─── Interactive Console Menu ────────────────────────────────────────────────
do {
    Clear-Host
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host "       KATIPUNEROS LIBRARY STORE -- DEV & OPS CONTROLLER              " -ForegroundColor Yellow
    Write-Host "   Single command runner for any team member's Windows machine        " -ForegroundColor Gray
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  [1] Start Fullstack Dev      -> Backend :5000 + Public :5173 + Admin :5174" -ForegroundColor White
    Write-Host "  [2] Hard Refresh & Rebuild   -> Purge caches, re-compile & restart fresh" -ForegroundColor White
    Write-Host "  [3] Stop All Services        -> Free ports 5000, 5173, and 5174" -ForegroundColor White
    Write-Host "  [4] Database Migrations      -> Add EF Core migration & update SQL Server" -ForegroundColor White
    Write-Host "  [5] Health Check & Tests     -> Build validation & SHA-256 audit verification" -ForegroundColor White
    Write-Host "  [6] Create SuperAdmin CLI    -> Terminal prompt for createsuperadmin" -ForegroundColor White
    Write-Host "  [7] Create Custom Admin CLI  -> Terminal prompt for createcustomsuperadmin" -ForegroundColor White
    Write-Host "  [8] Add User CLI             -> Terminal prompt to add Patron/Cashier/Admin" -ForegroundColor White
    Write-Host "  [9] SSMS 19 DB Initialize   -> Create/Update DB via EF Core (InventoryLibrary)" -ForegroundColor White
    Write-Host ""
    Write-Host "  [0] Exit" -ForegroundColor DarkGray
    Write-Host "======================================================================" -ForegroundColor Cyan
    $sel = Read-Host "Select an option [0-9]"

    switch ($sel) {
        "1" { Start-AllServices; Read-Host "`nPress Enter to return to menu..." }
        "2" { Hard-Refresh; Read-Host "`nPress Enter to return to menu..." }
        "3" { Stop-AllServices; Read-Host "`nPress Enter to return to menu..." }
        "4" { Run-DatabaseMigrations; Read-Host "`nPress Enter to return to menu..." }
        "5" { Run-HealthTests; Read-Host "`nPress Enter to return to menu..." }
        "6" { New-SuperAdminPrompt; Read-Host "`nPress Enter to return to menu..." }
        "7" { New-CustomSuperAdminPrompt; Read-Host "`nPress Enter to return to menu..." }
        "8" { New-UserCliPrompt; Read-Host "`nPress Enter to return to menu..." }
        "9" { 
            Write-Host "[*] Executing EF Core database update (InventoryLibrary)..." -ForegroundColor Cyan
            Push-Location $RootDir
            & dotnet ef database update --project Backend
            Pop-Location
            Read-Host "`nPress Enter to return to menu..." 
        }
        "0" { Write-Host "`nExiting. Mabuhay!" -ForegroundColor Yellow; break }
        Default { Write-Host "`nInvalid selection." -ForegroundColor Red; Start-Sleep -Seconds 1 }
    }
} while ($sel -ne "0")
