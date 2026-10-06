<#
.SYNOPSIS
    Katipuneros Library Store - Root Administrative CLI Governance Console
.DESCRIPTION
    Manages root protected superuser administrators and patron accounts.
    Accounts managed through this CLI are cryptographically protected from Web UI deletion or suspension.
.EXAMPLE
    .\cli.ps1 listusers
    .\cli.ps1 createsuperuseradmin superadmin MySecurePass123! superadmin@katipuneros.edu.ph Andres Bonifacio "System Administration"
    .\cli.ps1 createcustomersuperuseradmin custadmin CustPass123! custadmin@katipuneros.edu.ph Emilio Aguinaldo "Academic Governance"
    .\cli.ps1 edituser customadmin1 email newadmin@katipuneros.edu.ph
    .\cli.ps1 deleteuser customadmin1
    .\cli.ps1 deleteallcliusers
#>

param(
    [Parameter(Position=0)]
    [string]$Command = "",

    [Parameter(Position=1)]
    [string]$Arg1 = "",

    [Parameter(Position=2)]
    [string]$Arg2 = "",

    [Parameter(Position=3)]
    [string]$Arg3 = "",

    [Parameter(Position=4)]
    [string]$Arg4 = "",

    [Parameter(Position=5)]
    [string]$Arg5 = "",

    [Parameter(Position=6)]
    [string]$Arg6 = ""
)

$ErrorActionPreference = "Stop"

# Locate backend directory
$BackendDir = Join-Path $PSScriptRoot "Katipuneros-Library-Store\Backend"
if (-not (Test-Path $BackendDir)) {
    $BackendDir = Join-Path $PSScriptRoot "Backend"
}
if (-not (Test-Path $BackendDir)) {
    Write-Host "[!] Error: Backend directory not found at '$BackendDir'." -ForegroundColor Red
    exit 1
}

function Show-Header {
    Write-Host ""
    Write-Host "==========================================================================================" -ForegroundColor Cyan
    Write-Host "               KATIPUNEROS LIBRARY STORE -- ADMINISTRATIVE ROOT CLI TOOL                  " -ForegroundColor Yellow
    Write-Host "               Governance Authority & Immutable Protected User Management                 " -ForegroundColor DarkCyan
    Write-Host "==========================================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Show-TableFromUsersJson($rawOutput) {
    $inJson = $false
    $jsonLines = @()
    foreach ($line in ($rawOutput -split "`r?`n")) {
        if ($line.Trim() -eq "[CLI_USERS_JSON_BEGIN]") {
            $inJson = $true
            continue
        }
        if ($line.Trim() -eq "[CLI_USERS_JSON_END]") {
            $inJson = $false
            continue
        }
        if ($inJson) {
            $jsonLines += $line
        }
    }

    if ($jsonLines.Count -eq 0) {
        Write-Host "  No CLI-created protected users found in database." -ForegroundColor DarkYellow
        Write-Host ""
        return
    }

    $jsonStr = $jsonLines -join "`n"
    $users = ConvertFrom-Json $jsonStr

    if ($users.Count -eq 0) {
        Write-Host "  No CLI-created protected users found in database." -ForegroundColor DarkYellow
        Write-Host ""
        return
    }

    Write-Host "  Total Protected Root Accounts: $($users.Count)" -ForegroundColor Green
    Write-Host ""

    # Render ASCII Table
    $colCard = 19
    $colUser = 16
    $colName = 24
    $colEmail = 33
    $colRole = 11
    $colStatus = 8
    $colDate = 12

    $sep = "+-" + ("-" * $colCard) + "-+-" + ("-" * $colUser) + "-+-" + ("-" * $colName) + "-+-" + ("-" * $colEmail) + "-+-" + ("-" * $colRole) + "-+-" + ("-" * $colStatus) + "-+-" + ("-" * $colDate) + "-+"

    Write-Host $sep -ForegroundColor DarkGray
    $hdr = "| " + ("CARD NUMBER".PadRight($colCard)) + " | " + ("USERNAME".PadRight($colUser)) + " | " + ("FULL NAME".PadRight($colName)) + " | " + ("EMAIL".PadRight($colEmail)) + " | " + ("ROLE".PadRight($colRole)) + " | " + ("STATUS".PadRight($colStatus)) + " | " + ("CREATED AT".PadRight($colDate)) + " |"
    Write-Host $hdr -ForegroundColor Yellow
    Write-Host $sep -ForegroundColor DarkGray

    foreach ($u in $users) {
        $card = ($u.LibraryCardNumber).PadRight($colCard).Substring(0, $colCard)
        $uname = ($u.Username).PadRight($colUser).Substring(0, $colUser)
        $name = ($u.FullName).PadRight($colName).Substring(0, $colName)
        $email = ($u.Email).PadRight($colEmail).Substring(0, $colEmail)
        $role = ($u.Role).PadRight($colRole).Substring(0, $colRole)
        $statusStr = if ($u.IsActive) { "Active" } else { "Inactive" }
        $status = $statusStr.PadRight($colStatus).Substring(0, $colStatus)
        $date = ($u.CreatedAt).PadRight($colDate).Substring(0, $colDate)

        $row = "| $card | $uname | $name | $email | $role | $status | $date |"
        Write-Host $row -ForegroundColor White
    }
    Write-Host $sep -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "  [i] All users above have 'IsProtected = true' and CANNOT be deleted or suspended via Web UI." -ForegroundColor Cyan
    Write-Host ""
}

function Invoke-ListUsers {
    Write-Host "[*] Querying database for CLI-created protected root users..." -ForegroundColor Cyan
    $output = & dotnet run --project "$BackendDir" --no-build -- listcliusers
    Show-TableFromUsersJson $output
}

function Invoke-CreateSuperAdmin($uname, $pwd, $mail, $fn, $ln, $dept) {
    if (-not $uname -or -not $pwd -or -not $mail) {
        Write-Host "[!] Missing required arguments: <username> <password> <email>" -ForegroundColor Red
        return
    }
    Write-Host "[*] Registering Protected Superuser Admin '$uname'..." -ForegroundColor Cyan
    & dotnet run --project "$BackendDir" --no-build -- createsuperuseradmin "$uname" "$pwd" "$mail" "$fn" "$ln" "$dept"
    Write-Host ""
    Invoke-ListUsers
}

function Invoke-CreateCustomerSuperAdmin($uname, $pwd, $mail, $fn, $ln, $dept) {
    if (-not $uname -or -not $pwd -or -not $mail) {
        Write-Host "[!] Missing required arguments: <username> <password> <email>" -ForegroundColor Red
        return
    }
    Write-Host "[*] Registering Protected Customer Superuser '$uname'..." -ForegroundColor Cyan
    & dotnet run --project "$BackendDir" --no-build -- createcustomersuperuseradmin "$uname" "$pwd" "$mail" "$fn" "$ln" "$dept"
    Write-Host ""
    Invoke-ListUsers
}

function Invoke-EditUser($id, $fld, $val) {
    if (-not $id -or -not $fld -or -not $val) {
        Write-Host "[!] Missing arguments: <identifier> <field> <new-value>" -ForegroundColor Red
        Write-Host "    Allowed fields: name, firstname, lastname, email, department, role, password" -ForegroundColor Gray
        return
    }
    Write-Host "[*] Updating field '$fld' for user '$id'..." -ForegroundColor Cyan
    & dotnet run --project "$BackendDir" --no-build -- editcliuser "$id" "$fld" "$val"
    Write-Host ""
    Invoke-ListUsers
}

function Invoke-DeleteUser($id) {
    if (-not $id) {
        Write-Host "[!] Missing argument: <identifier> (username, email, or card number)" -ForegroundColor Red
        return
    }
    Write-Host "[*] Permanently deleting CLI-created protected user '$id'..." -ForegroundColor Yellow
    & dotnet run --project "$BackendDir" --no-build -- deletecliuser "$id"
    Write-Host ""
    Invoke-ListUsers
}

function Invoke-DeleteAllUsers {
    Write-Host "[!] CAUTION: This will delete ALL CLI-created protected users!" -ForegroundColor Red
    $confirm = Read-Host "Are you sure you want to proceed? (yes/no)"
    if ($confirm -eq "yes") {
        Write-Host "[*] Deleting all CLI-created protected users..." -ForegroundColor Yellow
        & dotnet run --project "$BackendDir" --no-build -- deleteallcliusers
        Write-Host ""
        Invoke-ListUsers
    } else {
        Write-Host "[-] Deletion cancelled." -ForegroundColor Gray
    }
}

function Show-InteractiveMenu {
    Show-Header
    while ($true) {
        Write-Host "Select an administrative operation:" -ForegroundColor Cyan
        Write-Host "  [1] List all CLI-created protected users (listusers)"
        Write-Host "  [2] Create Superuser Admin (createsuperuseradmin)"
        Write-Host "  [3] Create Customer Superuser (createcustomersuperuseradmin)"
        Write-Host "  [4] Edit a CLI user (edituser)"
        Write-Host "  [5] Delete a single CLI user (deleteuser)"
        Write-Host "  [6] Delete ALL CLI users (deleteallcliusers)"
        Write-Host "  [7] Exit"
        Write-Host ""
        $choice = Read-Host "Enter option (1-7)"

        switch ($choice) {
            "1" {
                Invoke-ListUsers
            }
            "2" {
                $u = Read-Host "Username"
                $p = Read-Host "Password"
                $e = Read-Host "Email"
                $fn = Read-Host "First Name (Default: Super)"
                if (-not $fn) { $fn = "Super" }
                $ln = Read-Host "Last Name (Default: Admin)"
                if (-not $ln) { $ln = "Admin" }
                $d = Read-Host "Department (Default: System Administration)"
                if (-not $d) { $d = "System Administration" }
                Invoke-CreateSuperAdmin $u $p $e $fn $ln $d
            }
            "3" {
                $u = Read-Host "Username"
                $p = Read-Host "Password"
                $e = Read-Host "Email"
                $fn = Read-Host "First Name (Default: Customer)"
                if (-not $fn) { $fn = "Customer" }
                $ln = Read-Host "Last Name (Default: Superuser)"
                if (-not $ln) { $ln = "Superuser" }
                $d = Read-Host "Department (Default: Academic Research & Governance)"
                if (-not $d) { $d = "Academic Research & Governance" }
                Invoke-CreateCustomerSuperAdmin $u $p $e $fn $ln $d
            }
            "4" {
                $id = Read-Host "User identifier (Username, Email, or Library Card #)"
                $fld = Read-Host "Field to edit (name, email, department, role, password)"
                $val = Read-Host "New value"
                Invoke-EditUser $id $fld $val
            }
            "5" {
                $id = Read-Host "User identifier to delete (Username, Email, or Library Card #)"
                Invoke-DeleteUser $id
            }
            "6" {
                Invoke-DeleteAllUsers
            }
            "7" {
                Write-Host "Exiting CLI tool. Goodbye!" -ForegroundColor Cyan
                return
            }
            default {
                Write-Host "[!] Invalid option." -ForegroundColor Red
            }
        }
        Write-Host ""
    }
}

# Direct command dispatch or interactive menu
if (-not $Command) {
    Show-InteractiveMenu
} else {
    Show-Header
    switch ($Command.ToLowerInvariant()) {
        "listusers" {
            Invoke-ListUsers
        }
        "createsuperuseradmin" {
            Invoke-CreateSuperAdmin $Arg1 $Arg2 $Arg3 $Arg4 $Arg5 $Arg6
        }
        "createcustomersuperuseradmin" {
            Invoke-CreateCustomerSuperAdmin $Arg1 $Arg2 $Arg3 $Arg4 $Arg5 $Arg6
        }
        "edituser" {
            Invoke-EditUser $Arg1 $Arg2 $Arg3
        }
        "deleteuser" {
            Invoke-DeleteUser $Arg1
        }
        "deleteallcliusers" {
            Invoke-DeleteAllUsers
        }
        default {
            Write-Host "[!] Unknown command: $Command" -ForegroundColor Red
            Write-Host "Supported commands: listusers, createsuperuseradmin, createcustomersuperuseradmin, edituser, deleteuser, deleteallcliusers" -ForegroundColor Gray
        }
    }
}
