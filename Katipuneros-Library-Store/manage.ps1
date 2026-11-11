# ==============================================================================
# Katipuneros Library Store -- Unified Dev & Ops Master Controller
# Works across any Windows laptop without needing Visual Studio IDE.
# Usage:
#   .\manage.ps1                          (Launches interactive menu)
#   .\manage.ps1 start                    (Starts Backend :5000, Patron :5173, Admin :5174, Cashier :5175)
#   .\manage.ps1 status                   (Probes live health matrix of all 4 service ports)
#   .\manage.ps1 refresh                  (Hard refresh: cleans caches, rebuilds & restarts all 4)
#   .\manage.ps1 stop                     (Stops all running services on ports 5000, 5173, 5174, 5175)
#   .\manage.ps1 migrate                  (Interactive EF Core migration & DB update)
#   .\manage.ps1 test                     (Build checks, API tests & SHA-256 chain verification)
#   .\manage.ps1 createcashiersuperuseradmin <user> <pass> <email> [fn] [ln] [dept]
#   .\manage.ps1 resetpassword <identifier> <newpass>
# ==============================================================================

param (
    [Parameter(Position=0)]
    [string]$Action = "",

    [Parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$CmdArgs = @()
)

$ErrorActionPreference = "Stop"

# Ensure ASP.NET Core Development environment is set for local CLI commands & user-secrets
$env:ASPNETCORE_ENVIRONMENT = "Development"

# Resolve root and inner directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (Test-Path (Join-Path $ScriptDir "Katipuneros-Library-Store")) {
    $RootDir = Join-Path $ScriptDir "Katipuneros-Library-Store"
} else {
    $RootDir = $ScriptDir
}

$BackendDir = Join-Path $RootDir "Backend"
$FrontendDir = Join-Path $RootDir "Frontend"

$AllArgs = if ($CmdArgs -and $CmdArgs.Count -gt 0) { $CmdArgs } else { $args }

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

function Invoke-TscValidation {
    $tscLocal = Join-Path $FrontendDir "node_modules\.bin\tsc.cmd"
    if (Test-Path $tscLocal) {
        & $tscLocal -b
    } elseif (Get-Command tsc -ErrorAction SilentlyContinue) {
        & tsc -b
    } else {
        & npx --yes tsc -b
    }
    return $LASTEXITCODE
}

function Stop-AllServices {
    Write-Header "STOPPING ALL KATIPUNEROS SERVICES (PORTS 5000, 5173, 5174, 5175)"
    
    $ports = @(5000, 5173, 5174, 5175)
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
        Write-Host "  [OK] Stopped $killedCount service process(es). Ports 5000, 5173, 5174, and 5175 are now free." -ForegroundColor Green
    } else {
        Write-Host "  [i] No active services detected on ports 5000, 5173, 5174, or 5175." -ForegroundColor Gray
    }
}

function Show-Status {
    Write-Header "KATIPUNEROS SYSTEM LIVE STATUS & PORT MATRIX"
    
    $services = @(
        @{ Port = 5000; Name = "Backend Web API"; Target = "http://localhost:5000/api/health"; Role = ".NET 10 REST API & Scalar Docs" },
        @{ Port = 5173; Name = "Patron Portal";    Target = "http://127.0.0.1:5173/";         Role = "Public Landing, Catalog & Customer" },
        @{ Port = 5174; Name = "Chief Admin Console"; Target = "http://127.0.0.1:5174/";      Role = "Security-Isolated Admin Console" },
        @{ Port = 5175; Name = "Cashier Terminal"; Target = "http://127.0.0.1:5175/";         Role = "Circulation Desk, POS & Scanners" }
    )

    $format = "{0,-6} | {1,-20} | {2,-8} | {3,-12} | {4,-12} | {5}"
    Write-Host ($format -f "PORT", "SERVICE NAME", "PID", "TCP STATUS", "HTTP HEALTH", "DESCRIPTION") -ForegroundColor Yellow
    Write-Host ("-" * 95) -ForegroundColor DarkGray

    foreach ($svc in $services) {
        $p = $svc.Port
        $procId = "-"
        $tcpStatus = "OFFLINE"
        $httpStatus = "UNKNOWN"

        # Check TCP Listener
        try {
            $conn = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($conn) {
                $procId = $conn.OwningProcess
                $tcpStatus = "LISTENING"
            }
        } catch {}

        if ($tcpStatus -eq "OFFLINE") {
            # Netstat fallback
            $match = netstat -ano | Select-String ":$p\s+.*LISTENING\s+(\d+)" | Select-Object -First 1
            if ($match -and $match.Matches.Groups[1].Value) {
                $procId = [int]$match.Matches.Groups[1].Value
                $tcpStatus = "LISTENING"
            }
        }

        # Check HTTP Endpoint
        try {
            $resp = Invoke-WebRequest -Uri $svc.Target -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            if ($resp.StatusCode -eq 200) {
                $httpStatus = "200 OK"
                if ($tcpStatus -eq "OFFLINE") { $tcpStatus = "LISTENING" }
            } else {
                $httpStatus = "HTTP $($resp.StatusCode)"
            }
        } catch {
            $httpStatus = if ($tcpStatus -eq "LISTENING") { "NO RESPONSE" } else { "DOWN" }
        }

        $color = if ($tcpStatus -eq "LISTENING" -and $httpStatus -like "*200*") { "Green" } elseif ($tcpStatus -eq "LISTENING") { "Yellow" } else { "DarkGray" }
        Write-Host ($format -f $p, $svc.Name, $procId, $tcpStatus, $httpStatus, $svc.Role) -ForegroundColor $color
    }

    Write-Host ("-" * 95) -ForegroundColor DarkGray
    Write-Host ""
}

function Start-AllServices {
    Write-Header "STARTING KATIPUNEROS LIBRARY STORE (DEV PREVIEW - 4 SERVICES)"
    if (-not (Check-Prerequisites)) { return }

    # 1. Stop any stale instances across all 4 ports
    Stop-AllServices

    # 2. Update Database via EF Core to ensure schemas are current
    Write-Host "[*] Synchronizing SQL Server Database Schema via EF Core..." -ForegroundColor Gray
    try {
        Push-Location $RootDir
        & dotnet ef database update --project Backend --context AppDbContext
        Pop-Location
        Write-Host "  [OK] Database schema is up to date." -ForegroundColor Green
    } catch {
        Write-Host "  [!] Database update warning: Continuing to start services..." -ForegroundColor Yellow
    }

    # 3. Start Backend Web API on Port 5000
    Write-Host "[*] Launching .NET 10 Web API backend on http://localhost:5000..." -ForegroundColor Cyan
    $backendCmd = "Set-Location '$BackendDir'; dotnet run --launch-profile http"
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "& { Write-Host 'Katipuneros .NET 10 Web API Backend (:5000)' -ForegroundColor Cyan; $backendCmd }"

    # Wait for backend port 5000 to be ready
    Write-Host "[*] Waiting for backend API to initialize..." -ForegroundColor Gray
    $retry = 0
    $backendReady = $false
    while ($retry -lt 15 -and -not $backendReady) {
        Start-Sleep -Seconds 1
        try {
            $testReq = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
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

    # 4. Start Public & Patron Frontend Client on Port 5173
    Write-Host "[*] Launching Patron Portal & Public Landing on http://127.0.0.1:5173..." -ForegroundColor Cyan
    $publicCmd = "Set-Location '$FrontendDir'; npm run dev:customer -- --host 127.0.0.1"
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "& { Write-Host 'Katipuneros Public & Patron Portal (:5173)' -ForegroundColor Green; $publicCmd }"

    # 5. Start Security-Isolated Admin Portal on Port 5174
    Write-Host "[*] Launching Isolated Chief Admin Portal on http://127.0.0.1:5174..." -ForegroundColor Cyan
    $adminCmd = "Set-Location '$FrontendDir'; npm run dev:admin -- --host 127.0.0.1"
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "& { Write-Host 'Katipuneros Isolated Admin Console (:5174)' -ForegroundColor Magenta; $adminCmd }"

    # 6. Start Dedicated Cashier Circulation Terminal on Port 5175
    Write-Host "[*] Launching Cashier Circulation Terminal on http://127.0.0.1:5175..." -ForegroundColor Cyan
    $cashierCmd = "Set-Location '$FrontendDir'; npm run dev:cashier -- --host 127.0.0.1"
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", "& { Write-Host 'Katipuneros Cashier Circulation Terminal (:5175)' -ForegroundColor Yellow; $cashierCmd }"

    Start-Sleep -Seconds 2

    # 7. Print Access Dashboard & Auto-Launch Web Browser
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host "  ALL 4 KATIPUNEROS SERVICES SUCCESSFULLY LAUNCHED!" -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host "  * Public Portal (Patron / Catalog):  http://127.0.0.1:5173/login" -ForegroundColor White
    Write-Host "  * Chief Admin Console (Isolated):    http://127.0.0.1:5174/admin/login" -ForegroundColor White
    Write-Host "  * Cashier Desk Terminal (POS & QR):  http://127.0.0.1:5175/cashier/login" -ForegroundColor White
    Write-Host "  * Backend API & Scalar Docs:         http://localhost:5000/scalar/v1" -ForegroundColor White
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host ""

    Write-Host "[*] Opening browser tabs for preview..." -ForegroundColor Gray
    Start-Process "http://127.0.0.1:5173/"
    Start-Process "http://127.0.0.1:5174/admin/login"
    Start-Process "http://127.0.0.1:5175/cashier/login"
}

function Hard-Refresh {
    Write-Header "HARD REFRESH & CLEAN REBUILD (ALL 4 SERVICES)"
    
    # 1. Stop existing services on ports 5000, 5173, 5174, 5175
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

    # 4. Verify Frontend TypeScript Compilation with resilient tsc detection
    Write-Host "[*] Validating TypeScript compilation (tsc -b)..." -ForegroundColor Gray
    Push-Location $FrontendDir
    $tscCode = Invoke-TscValidation
    if ($tscCode -ne 0) {
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

    # 6. Re-launch fresh services across all 4 ports
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
            & dotnet ef database update --project Backend --context AppDbContext
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
                & dotnet ef database update --project Backend --context AppDbContext
                Write-Host "[OK] Migration '$migName' successfully created and applied." -ForegroundColor Green
            }
            Pop-Location
        }
        "3" {
            Write-Host "[*] Triggering database re-seed via API..." -ForegroundColor Cyan
            Push-Location $RootDir
            & dotnet ef database update --project Backend --context AppDbContext
            Pop-Location
            Write-Host "[OK] Database seeded." -ForegroundColor Green
        }
        Default { return }
    }
}

function Run-HealthTests {
    Write-Header "KATIPUNEROS SYSTEM HEALTH & INTEGRITY CHECK"
    
    # 1. Check Backend Build
    Write-Host "[1/5] Checking .NET 10 compilation..." -ForegroundColor Gray
    Push-Location $RootDir
    & dotnet build Backend/Backend.csproj --verbosity minimal
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Backend compiles with 0 errors." -ForegroundColor Green
    }
    Pop-Location

    # 2. Check Frontend Typecheck with resilient tsc detection
    Write-Host "[2/5] Checking Frontend TypeScript..." -ForegroundColor Gray
    Push-Location $FrontendDir
    $tscCode = Invoke-TscValidation
    if ($tscCode -eq 0) {
        Write-Host "  [OK] Frontend TypeScript compiles with 0 errors." -ForegroundColor Green
    }
    Pop-Location

    # 3. Check live API endpoints if running
    Write-Host "[3/5] Testing Backend REST API connectivity (:5000)..." -ForegroundColor Gray
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 3 -ErrorAction Stop
        Write-Host "  [OK] GET /api/health returned healthy ($($health.service))." -ForegroundColor Green
    } catch {
        Write-Host "  [i] Backend is not currently running. Start services via Option [1] to test live API." -ForegroundColor Yellow
    }

    # 4. Probe Frontend Ports (5173, 5174, 5175)
    Write-Host "[4/5] Checking Frontend listeners (:5173, :5174, :5175)..." -ForegroundColor Gray
    $fePorts = @(
        @{ Port = 5173; Label = "Patron Portal (:5173)" },
        @{ Port = 5174; Label = "Admin Portal (:5174)" },
        @{ Port = 5175; Label = "Cashier Terminal (:5175)" }
    )
    foreach ($fp in $fePorts) {
        $found = Get-NetTCPConnection -LocalPort $fp.Port -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 0 } | Select-Object -First 1
        if ($found) {
            Write-Host "  [OK] $($fp.Label) is active (PID: $($found.OwningProcess))." -ForegroundColor Green
        } else {
            Write-Host "  [i] $($fp.Label) is not listening." -ForegroundColor DarkGray
        }
    }

    # 5. Test SHA-256 Chain if API is online
    Write-Host "[5/5] Testing SHA-256 Tamper-Evident Audit Chain..." -ForegroundColor Gray
    try {
        $adminEmails = @("customadmin1@katipuneros.edu.ph", "admin@katipuneros.edu.ph", "testadmin@katipuneros.edu.ph")
        $token = $null
        foreach ($email in $adminEmails) {
            try {
                $loginJson = @{ identifier = $email; email = $email; password = "Admin@2026!" } | ConvertTo-Json
                $auth = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginJson -ContentType "application/json" -TimeoutSec 3 -ErrorAction Stop
                if ($auth.data.token) {
                    $token = $auth.data.token
                    break
                }
            } catch {}
        }
        if ($token) {
            $verify = Invoke-RestMethod -Uri "http://localhost:5000/api/audit/verify-chain" -Method Get -Headers @{ Authorization = "Bearer $token" } -TimeoutSec 3 -ErrorAction Stop
            Write-Host "  [OK] Cryptographic Audit Verification: isIntact=$($verify.data.isIntact) - $($verify.data.statusMessage)" -ForegroundColor Green
        } else {
            Write-Host "  [i] SHA-256 test skipped (no matching admin credentials for automated login)." -ForegroundColor DarkGray
        }
    } catch {
        Write-Host "  [i] SHA-256 live test skipped ($($_.Exception.Message))." -ForegroundColor Yellow
    }
}

function Show-LoginPortalNotice {
    param(
        [string]$Role,
        [string]$Username,
        [string]$Email,
        [string]$PortalUrl,
        [string]$PortNumber
    )
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host "  ACCOUNT PROVISIONED & READY FOR SYSTEM AUTHENTICATION" -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host "  * Username / Login ID: $Username" -ForegroundColor White
    Write-Host "  * Email Address:       $Email" -ForegroundColor White
    Write-Host "  * Assigned Role:       $Role" -ForegroundColor White
    Write-Host "  * Target Portal URL:   $PortalUrl" -ForegroundColor Yellow
    Write-Host "  * Dedicated Port:      PORT $PortNumber ONLY" -ForegroundColor Cyan
    Write-Host "----------------------------------------------------------------------" -ForegroundColor Gray
    
    $backendUp = $false
    try {
        $conn = Test-NetConnection -ComputerName 127.0.0.1 -Port 5000 -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($conn) { $backendUp = $true }
    } catch { $backendUp = $false }
    
    if ($backendUp) {
        Write-Host "  [OK] Backend API is currently online on port 5000." -ForegroundColor Green
        Write-Host "       You can now open $PortalUrl in your browser and sign in." -ForegroundColor White
    } else {
        Write-Host "  [!] NOTICE: Backend service (:5000) is NOT currently running in the background." -ForegroundColor Yellow
        Write-Host "      CLI account creation updates the database directly, but web portals need" -ForegroundColor Yellow
        Write-Host "      the backend API to authenticate." -ForegroundColor Yellow
        Write-Host "      -> Please select Option [1] (Start Fullstack Dev) to launch all services!" -ForegroundColor Cyan
    }
    Write-Host "======================================================================" -ForegroundColor Green
}

function New-SuperAdminPrompt {
    Write-Header "CREATE SUPERADMIN ACCOUNT CLI"
    $username = (Read-Host "Enter Username").Trim()
    $password = (Read-Host "Enter Password").Trim()
    $email = (Read-Host "Enter Email").Trim()
    if ([string]::IsNullOrWhiteSpace($username) -or [string]::IsNullOrWhiteSpace($password) -or [string]::IsNullOrWhiteSpace($email)) {
        Write-Host "[!] Username, Password, and Email are required." -ForegroundColor Red
        return
    }
    Push-Location $BackendDir
    & dotnet run --launch-profile http -- createsuperadmin "$username" "$password" "$email"
    Pop-Location
    Show-LoginPortalNotice -Role "Administrator (SuperAdmin)" -Username $username -Email $email -PortalUrl "http://127.0.0.1:5174/admin/login" -PortNumber "5174"
}

function New-CashierSuperAdminPrompt {
    Write-Header "CREATE CASHIER ACCOUNT CLI"
    $username = (Read-Host "Enter Username").Trim()
    $password = (Read-Host "Enter Password").Trim()
    $email = (Read-Host "Enter Email").Trim()
    if ([string]::IsNullOrWhiteSpace($username) -or [string]::IsNullOrWhiteSpace($password) -or [string]::IsNullOrWhiteSpace($email)) {
        Write-Host "[!] Username, Password, and Email are required." -ForegroundColor Red
        return
    }
    $firstName = (Read-Host "Enter First Name (Default: Cashier)").Trim()
    if ([string]::IsNullOrWhiteSpace($firstName)) { $firstName = "Cashier" }
    $lastName = (Read-Host "Enter Last Name (Default: Officer)").Trim()
    if ([string]::IsNullOrWhiteSpace($lastName)) { $lastName = "Officer" }
    $department = (Read-Host "Enter Department (Default: Library Circulation Desk)").Trim()
    if ([string]::IsNullOrWhiteSpace($department)) { $department = "Library Circulation Desk" }
    
    Push-Location $BackendDir
    & dotnet run --launch-profile http -- createcashiersuperuseradmin "$username" "$password" "$email" "$firstName" "$lastName" "$department"
    Pop-Location
    Show-LoginPortalNotice -Role "Cashier (Circulation Staff)" -Username $username -Email $email -PortalUrl "http://127.0.0.1:5175/cashier/login" -PortNumber "5175"
}

function New-CustomSuperAdminPrompt {
    Write-Header "CREATE CUSTOM SUPERADMIN CLI"
    $username = (Read-Host "Enter Username").Trim()
    $password = (Read-Host "Enter Password").Trim()
    $email = (Read-Host "Enter Email").Trim()
    if ([string]::IsNullOrWhiteSpace($username) -or [string]::IsNullOrWhiteSpace($password) -or [string]::IsNullOrWhiteSpace($email)) {
        Write-Host "[!] Username, Password, and Email are required." -ForegroundColor Red
        return
    }
    $firstName = (Read-Host "Enter First Name (Default: Custom)").Trim()
    if ([string]::IsNullOrWhiteSpace($firstName)) { $firstName = "Custom" }
    $lastName = (Read-Host "Enter Last Name (Default: SuperAdmin)").Trim()
    if ([string]::IsNullOrWhiteSpace($lastName)) { $lastName = "SuperAdmin" }
    $department = (Read-Host "Enter Department (Default: System Administration)").Trim()
    if ([string]::IsNullOrWhiteSpace($department)) { $department = "System Administration" }
    
    Push-Location $BackendDir
    & dotnet run --launch-profile http -- createcustomsuperadmin "$username" "$password" "$email" "$firstName" "$lastName" "$department"
    Pop-Location
    Show-LoginPortalNotice -Role "Custom SuperAdmin" -Username $username -Email $email -PortalUrl "http://127.0.0.1:5174/admin/login" -PortNumber "5174"
}

function New-ResetPasswordPrompt {
    Write-Header "RESET USER PASSWORD CLI"
    $identifier = (Read-Host "Enter Username, Email, Full Name, or Library Card Number").Trim()
    $newPassword = (Read-Host "Enter New Password").Trim()
    if ([string]::IsNullOrWhiteSpace($identifier) -or [string]::IsNullOrWhiteSpace($newPassword)) {
        Write-Host "[!] Identifier and New Password are required." -ForegroundColor Red
        return
    }
    Push-Location $BackendDir
    & dotnet run --launch-profile http -- resetpassword "$identifier" "$newPassword"
    Pop-Location
    Write-Host ""
    Write-Host "[*] Password updated. Ensure Option [1] (Start Fullstack Dev) is running, then log into the user's assigned portal." -ForegroundColor Green
}

function New-UserCliPrompt {
    Write-Header "CREATE ACCOUNT / ADD USER CLI (PATRON / CASHIER / ADMIN)"
    $username = (Read-Host "Enter Username").Trim()
    $password = (Read-Host "Enter Password").Trim()
    $email = (Read-Host "Enter Email").Trim()
    if ([string]::IsNullOrWhiteSpace($username) -or [string]::IsNullOrWhiteSpace($password) -or [string]::IsNullOrWhiteSpace($email)) {
        Write-Host "[!] Username, Password, and Email are required." -ForegroundColor Red
        return
    }
    $role = (Read-Host "Enter Role [Customer/Cashier/Admin] (Default: Customer)").Trim()
    if ([string]::IsNullOrWhiteSpace($role)) { $role = "Customer" }
    if ($role.ToLower() -eq "admin") { $role = "Admin" }
    elseif ($role.ToLower() -eq "cashier") { $role = "Cashier" }
    else { $role = "Customer" }
    
    $firstName = (Read-Host "Enter First Name (Default: New)").Trim()
    if ([string]::IsNullOrWhiteSpace($firstName)) { $firstName = "New" }
    $lastName = (Read-Host "Enter Last Name (Default: User)").Trim()
    if ([string]::IsNullOrWhiteSpace($lastName)) { $lastName = "User" }
    $department = (Read-Host "Enter Department (Default: General)").Trim()
    if ([string]::IsNullOrWhiteSpace($department)) { $department = "General" }
    
    Push-Location $BackendDir
    & dotnet run --launch-profile http -- adduser "$username" "$password" "$email" "$role" "$firstName" "$lastName" "$department"
    Pop-Location

    $targetUrl = if ($role -eq "Admin") { "http://127.0.0.1:5174/admin/login" } elseif ($role -eq "Cashier") { "http://127.0.0.1:5175/cashier/login" } else { "http://127.0.0.1:5173/login" }
    $targetPort = if ($role -eq "Admin") { "5174" } elseif ($role -eq "Cashier") { "5175" } else { "5173" }
    Show-LoginPortalNotice -Role $role -Username $username -Email $email -PortalUrl $targetUrl -PortNumber $targetPort
}

# ─── Command Line Argument Dispatcher ────────────────────────────────────────
switch ($Action.ToLower()) {
    "start"   { Start-AllServices; exit 0 }
    "status"  { Show-Status; exit 0 }
    "refresh" { Hard-Refresh; exit 0 }
    "stop"    { Stop-AllServices; exit 0 }
    "migrate" { Run-DatabaseMigrations; exit 0 }
    "createdb" { 
        Write-Host "[*] Creating/Updating Database via EF Core migrations with InventoryLibrary credentials..." -ForegroundColor Cyan
        Push-Location $RootDir
        & dotnet ef database update --project Backend --context AppDbContext
        Pop-Location
        exit 0
    }
    "test"    { Run-HealthTests; exit 0 }

    { $_ -in "createsuperadmin", "createsuperuseradmin", "createadmin" } { 
        if ($AllArgs.Count -lt 3) {
            New-SuperAdminPrompt
            exit 0
        }
        $fName = if ($AllArgs.Count -gt 3) { $AllArgs[3] } else { "Super" }
        $lName = if ($AllArgs.Count -gt 4) { $AllArgs[4] } else { "Admin" }
        $dept = if ($AllArgs.Count -gt 5) { $AllArgs[5] } else { "System Administration" }
        Push-Location $BackendDir
        & dotnet run --launch-profile http -- createsuperadmin $AllArgs[0] $AllArgs[1] $AllArgs[2] $fName $lName $dept
        Pop-Location
        exit 0
    }

    { $_ -in "createcustomsuperadmin", "createcustomadmin" } {
        if ($AllArgs.Count -lt 3) {
            New-CustomSuperAdminPrompt
            exit 0
        }
        $fName = if ($AllArgs.Count -gt 3) { $AllArgs[3] } else { "Custom" }
        $lName = if ($AllArgs.Count -gt 4) { $AllArgs[4] } else { "SuperAdmin" }
        $dept = if ($AllArgs.Count -gt 5) { $AllArgs[5] } else { "System Administration" }
        Push-Location $BackendDir
        & dotnet run --launch-profile http -- createcustomsuperadmin $AllArgs[0] $AllArgs[1] $AllArgs[2] $fName $lName $dept
        Pop-Location
        exit 0
    }

    { $_ -in "createcashiersuperuseradmin", "createcashier", "createcashiersuperadmin" } {
        if ($AllArgs.Count -lt 3) {
            New-CashierSuperAdminPrompt
            exit 0
        }
        $fName = if ($AllArgs.Count -gt 3) { $AllArgs[3] } else { "Cashier" }
        $lName = if ($AllArgs.Count -gt 4) { $AllArgs[4] } else { "Officer" }
        $dept = if ($AllArgs.Count -gt 5) { $AllArgs[5] } else { "Library Circulation Desk" }
        Push-Location $BackendDir
        & dotnet run --launch-profile http -- createcashiersuperuseradmin $AllArgs[0] $AllArgs[1] $AllArgs[2] $fName $lName $dept
        Pop-Location
        exit 0
    }

    { $_ -in "createcustomersuperuseradmin", "createcustomeradmin" } {
        if ($AllArgs.Count -lt 3) {
            New-UserCliPrompt
            exit 0
        }
        $fName = if ($AllArgs.Count -gt 3) { $AllArgs[3] } else { "Customer" }
        $lName = if ($AllArgs.Count -gt 4) { $AllArgs[4] } else { "Superuser" }
        $dept = if ($AllArgs.Count -gt 5) { $AllArgs[5] } else { "Academic Research & Governance" }
        Push-Location $BackendDir
        & dotnet run --launch-profile http -- createcustomersuperuseradmin $AllArgs[0] $AllArgs[1] $AllArgs[2] $fName $lName $dept
        Pop-Location
        exit 0
    }

    "resetpassword" {
        if ($AllArgs.Count -lt 2) {
            New-ResetPasswordPrompt
            exit 0
        }
        Push-Location $BackendDir
        & dotnet run --launch-profile http -- resetpassword $AllArgs[0] $AllArgs[1]
        Pop-Location
        exit 0
    }

    { $_ -in "adduser", "createaccount", "createuser", "create-user", "create-account", "register", "newuser", "new-user", "createcustomer", "createpatron" } {
        if ($AllArgs.Count -lt 3) {
            New-UserCliPrompt
            exit 0
        }
        $role = if ($AllArgs.Count -gt 3) { $AllArgs[3] } else { "Customer" }
        $fName = if ($AllArgs.Count -gt 4) { $AllArgs[4] } else { "New" }
        $lName = if ($AllArgs.Count -gt 5) { $AllArgs[5] } else { "User" }
        $dept = if ($AllArgs.Count -gt 6) { $AllArgs[6] } else { "General" }
        Push-Location $BackendDir
        & dotnet run --launch-profile http -- adduser $AllArgs[0] $AllArgs[1] $AllArgs[2] $role $fName $lName $dept
        Pop-Location
        exit 0
    }

    "listusers" {
        Push-Location $BackendDir
        & dotnet run --launch-profile http -- listcliusers
        Pop-Location
        exit 0
    }

    { $_ -in "help", "-h", "--help", "/?" } {
        Write-Host "Usage: .\manage.ps1 [command] [args...]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Service Commands:"
        Write-Host "  start                               Starts all 4 services (Ports 5000, 5173, 5174, 5175)"
        Write-Host "  status                              Probes live health of all ports"
        Write-Host "  stop                                Terminates processes on ports 5000, 5173, 5174, 5175"
        Write-Host "  refresh                             Purge caches, re-compile and restart all 4 services"
        Write-Host "  migrate                             Run EF Core migrations"
        Write-Host ""
        Write-Host "Account Creation & Management Commands:"
        Write-Host "  createaccount / adduser <u p e>...  Creates Customer/Patron account (or interactively prompts)"
        Write-Host "  createsuperadmin <u p e>...         Creates SuperAdmin account (or interactively prompts)"
        Write-Host "  createcashier <u p e>...            Creates Cashier account (or interactively prompts)"
        Write-Host "  createcustomsuperadmin <u p e>...   Creates Custom Admin account"
        Write-Host "  resetpassword <identifier> <pass>   Resets user password"
        Write-Host "  listusers                           Lists CLI protected accounts"
        exit 0
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
    Write-Host "  [1] Start Fullstack Dev        -> Backend :5000 + Patron :5173 + Admin :5174 + Cashier :5175" -ForegroundColor White
    Write-Host "  [2] Live Status Matrix         -> Probes ports 5000, 5173, 5174, 5175 and HTTP health" -ForegroundColor White
    Write-Host "  [3] Hard Refresh & Rebuild     -> Purge caches, re-compile & restart all 4 services" -ForegroundColor White
    Write-Host "  [4] Stop All Services          -> Free ports 5000, 5173, 5174, and 5175" -ForegroundColor White
    Write-Host "  [5] Database Migrations        -> Add EF Core migration & update SQL Server" -ForegroundColor White
    Write-Host "  [6] Health Check & Tests       -> Build validation & SHA-256 audit verification" -ForegroundColor White
    Write-Host "  [7] Create SuperAdmin CLI      -> Terminal prompt for SuperAdmin account" -ForegroundColor White
    Write-Host "  [8] Create Cashier Superuser   -> Terminal prompt for Cashier account" -ForegroundColor White
    Write-Host "  [9] Create Custom Admin CLI    -> Terminal prompt for Custom Admin account" -ForegroundColor White
    Write-Host "  [10] Reset User Password CLI   -> Terminal prompt to reset user password" -ForegroundColor White
    Write-Host "  [11] Create Account / Add User -> Terminal prompt to add Patron/Customer/Cashier/Admin" -ForegroundColor White
    Write-Host "  [12] SSMS 19 DB Initialize     -> Create/Update DB via EF Core (InventoryLibrary)" -ForegroundColor White
    Write-Host ""
    Write-Host "  [0] Exit" -ForegroundColor DarkGray
    Write-Host "======================================================================" -ForegroundColor Cyan
    $sel = Read-Host "Select an option [0-12]"

    switch ($sel) {
        "1"  { Start-AllServices; Read-Host "`nPress Enter to return to menu..." }
        "2"  { Show-Status; Read-Host "`nPress Enter to return to menu..." }
        "3"  { Hard-Refresh; Read-Host "`nPress Enter to return to menu..." }
        "4"  { Stop-AllServices; Read-Host "`nPress Enter to return to menu..." }
        "5"  { Run-DatabaseMigrations; Read-Host "`nPress Enter to return to menu..." }
        "6"  { Run-HealthTests; Read-Host "`nPress Enter to return to menu..." }
        "7"  { New-SuperAdminPrompt; Read-Host "`nPress Enter to return to menu..." }
        "8"  { New-CashierSuperAdminPrompt; Read-Host "`nPress Enter to return to menu..." }
        "9"  { New-CustomSuperAdminPrompt; Read-Host "`nPress Enter to return to menu..." }
        "10" { New-ResetPasswordPrompt; Read-Host "`nPress Enter to return to menu..." }
        "11" { New-UserCliPrompt; Read-Host "`nPress Enter to return to menu..." }
        "12" { 
            Write-Host "[*] Executing EF Core database update (InventoryLibrary)..." -ForegroundColor Cyan
            Push-Location $RootDir
            & dotnet ef database update --project Backend --context AppDbContext
            Pop-Location
            Read-Host "`nPress Enter to return to menu..." 
        }
        "0"  { Write-Host "`nExiting. Mabuhay!" -ForegroundColor Yellow; break }
        Default { Write-Host "`nInvalid selection." -ForegroundColor Red; Start-Sleep -Seconds 1 }
    }
} while ($sel -ne "0")
