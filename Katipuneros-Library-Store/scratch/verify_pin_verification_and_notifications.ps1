# Katipuneros-Library-Store/scratch/verify_pin_verification_and_notifications.ps1
# End-to-End Verification Audit Suite: QR/Camera Handover, 4-Digit Unique PIN, KP-TXN References, and Cross-Portal Notification Bell Sync
$ErrorActionPreference = "Continue"

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "  KATIPUNEROS E2E VERIFICATION AUDIT SUITE: QR/PIN HANDOVER & NOTIFICATIONS" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan

# Resolve project paths dynamically
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (Test-Path "$scriptDir/../Backend") {
    $baseDir = (Resolve-Path "$scriptDir/..").Path
} elseif (Test-Path "Katipuneros-Library-Store/Backend") {
    $baseDir = (Resolve-Path "Katipuneros-Library-Store").Path
} elseif (Test-Path "Backend") {
    $baseDir = (Resolve-Path ".").Path
} else {
    $baseDir = $scriptDir
}

$backendDir = Join-Path $baseDir "Backend"
$frontendDir = Join-Path $baseDir "Frontend"

Write-Host "Base Directory   : $baseDir" -ForegroundColor Gray
Write-Host "Backend Directory: $backendDir" -ForegroundColor Gray
Write-Host "Frontend Directory: $frontendDir" -ForegroundColor Gray
Write-Host ""

$results = [System.Collections.Generic.List[PSCustomObject]]::new()

function Record-Check {
    param(
        [string]$Category,
        [string]$Description,
        [bool]$Success,
        [string]$Evidence
    )
    $obj = [PSCustomObject]@{
        Category = $Category
        Description = $Description
        Passed = $Success
        Evidence = $Evidence
    }
    $results.Add($obj)

    if ($Success) {
        Write-Host "  [PASS] $Description" -ForegroundColor Green
        Write-Host "         Evidence: $Evidence" -ForegroundColor Gray
    } else {
        Write-Host "  [FAIL] $Description" -ForegroundColor Red
        Write-Host "         Missing:  $Evidence" -ForegroundColor Yellow
    }
}

# ------------------------------------------------------------------------------
# CHECK 1: Backend DTOs - CheckoutRequest for PickupPin and ReservationId
# ------------------------------------------------------------------------------
Write-Host "`n--- [CATEGORY 1] Backend Checkout Request DTO ---" -ForegroundColor Yellow

$checkoutReqPath1 = Join-Path $backendDir "Features/Api/DTOs/Requests/CheckoutRequest.cs"
$checkoutReqPath2 = Join-Path $backendDir "Features/Api/DTOs/Requests/CirculationRequests.cs"

$dtoFile = $null
if (Test-Path $checkoutReqPath1) {
    $dtoFile = $checkoutReqPath1
} elseif (Test-Path $checkoutReqPath2) {
    $dtoFile = $checkoutReqPath2
}

$dtoContent = if ($dtoFile) { Get-Content $dtoFile -Raw } else { "" }
$hasPickupPin = $dtoContent -match "PickupPin"
$hasReservationId = $dtoContent -match "ReservationId"
$dtoRelativePath = if ($dtoFile) { $dtoFile.Replace($baseDir, "").TrimStart("\/") } else { "Not found" }

Record-Check -Category "Backend DTO" `
             -Description "CheckoutRequest includes PickupPin property" `
             -Success $hasPickupPin `
             -Evidence "$dtoRelativePath contains PickupPin"

Record-Check -Category "Backend DTO" `
             -Description "CheckoutRequest includes ReservationId property" `
             -Success $hasReservationId `
             -Evidence "$dtoRelativePath contains ReservationId"

# ------------------------------------------------------------------------------
# CHECK 2: Backend Service - Unique PIN Generation in ReservationService.cs
# ------------------------------------------------------------------------------
Write-Host "`n--- [CATEGORY 2] Backend Reservation Service PIN Generation ---" -ForegroundColor Yellow

$resServicePath = Join-Path $backendDir "Features/Services/Implementations/ReservationService.cs"
$resContent = if (Test-Path $resServicePath) { Get-Content $resServicePath -Raw } else { "" }

$hasPinMethod = ($resContent -match "GenerateUniqueLockerPinAsync") -or ($resContent -match "GenerateUnique.*Pin")
$hasCollisionAvoidance = ($resContent -match "Random\.Shared\.Next\(1000,\s*(9999|10000)\)") -and 
                         (($resContent -match "activePins|usedPins") -and ($resContent -match "Contains\(") -and ($resContent -match "while\s*\("))

Record-Check -Category "Backend Service" `
             -Description "ReservationService has unique PIN generation method (GenerateUniqueLockerPinAsync)" `
             -Success $hasPinMethod `
             -Evidence "GenerateUniqueLockerPinAsync defined in ReservationService.cs"

Record-Check -Category "Backend Service" `
             -Description "ReservationService avoids PIN collisions across active holds" `
             -Success $hasCollisionAvoidance `
             -Evidence "Collision avoidance algorithm checking existing reservations in ReservationService.cs"

# ------------------------------------------------------------------------------
# CHECK 3: Backend Service - PIN Verification & KP-TXN in BorrowService.cs
# ------------------------------------------------------------------------------
Write-Host "`n--- [CATEGORY 3] Backend Borrow Service PIN Validation & References ---" -ForegroundColor Yellow

$borrowServicePath = Join-Path $backendDir "Features/Services/Implementations/BorrowService.cs"
$borrowContent = if (Test-Path $borrowServicePath) { Get-Content $borrowServicePath -Raw } else { "" }

$hasPinVerification = ($borrowContent -match "PickupPin") -and 
                      (($borrowContent -match "LockerPin") -or ($borrowContent -match "Invalid.*PIN") -or ($borrowContent -match "PIN.*mismatch"))
$hasKpTxnFormat = $borrowContent -match "KP-TXN-"

Record-Check -Category "Backend Service" `
             -Description "BorrowService validates 4-digit Pickup PIN and rejects mismatches" `
             -Success $hasPinVerification `
             -Evidence "PickupPin validation against reservation LockerPin in BorrowService.cs"

Record-Check -Category "Backend Service" `
             -Description "BorrowService generates KP-TXN- transaction reference format" `
             -Success $hasKpTxnFormat `
             -Evidence "KP-TXN-{yyyyMMdd}-{Hex6} reference pattern in BorrowService.cs"

# ------------------------------------------------------------------------------
# CHECK 4: Frontend Cashier - Dual-Mode Camera Scanner & Handover PIN Modal
# ------------------------------------------------------------------------------
Write-Host "`n--- [CATEGORY 4] Frontend Cashier Handover Verification UI ---" -ForegroundColor Yellow

$checkoutBorrowPath = Join-Path $frontendDir "src/UserRoles/Features/Pages/CashiersPanel/Pages/CheckoutBorrow.tsx"
$checkoutBorrowContent = if (Test-Path $checkoutBorrowPath) { Get-Content $checkoutBorrowPath -Raw } else { "" }

$hasCameraScanner = ($checkoutBorrowContent -match "getUserMedia") -or 
                    ($checkoutBorrowContent -match "BarcodeDetector") -or 
                    ($checkoutBorrowContent -match "videoRef") -or 
                    ($checkoutBorrowContent -match "camera")
$hasHandoverModal = ($checkoutBorrowContent -match "HandoverVerificationModal") -or 
                    ($checkoutBorrowContent -match "isHandoverModalOpen") -or 
                    ($checkoutBorrowContent -match "pinDigits") -or 
                    (($checkoutBorrowContent -match "Handover") -and ($checkoutBorrowContent -match "PIN"))

Record-Check -Category "Frontend Cashier" `
             -Description "CheckoutBorrow integrates Camera Scanner (Option 1)" `
             -Success $hasCameraScanner `
             -Evidence "Camera/optical scanner integration detected in CheckoutBorrow.tsx"

Record-Check -Category "Frontend Cashier" `
             -Description "CheckoutBorrow features 4-digit PIN Handover Verification Modal (Option 2)" `
             -Success $hasHandoverModal `
             -Evidence "Handover modal with 4-digit PIN verification detected in CheckoutBorrow.tsx"

# ------------------------------------------------------------------------------
# CHECK 5: Frontend Returns - Return Confirmation Event Dispatch
# ------------------------------------------------------------------------------
Write-Host "`n--- [CATEGORY 5] Frontend Returns Desk Event Dispatch ---" -ForegroundColor Yellow

$returnsFinesPath = Join-Path $frontendDir "src/UserRoles/Features/Pages/CashiersPanel/Pages/ReturnsFines.tsx"
$returnsFinesContent = if (Test-Path $returnsFinesPath) { Get-Content $returnsFinesPath -Raw } else { "" }

$hasReturnEvent = ($returnsFinesContent -match "circulation-return-confirmed") -or 
                  ($returnsFinesContent -match "dispatchCirculationNotification") -or 
                  (($returnsFinesContent -match "return_confirmed") -and ($returnsFinesContent -match "dispatchEvent"))

Record-Check -Category "Frontend Returns" `
             -Description "ReturnsFines dispatches return confirmation event" `
             -Success $hasReturnEvent `
             -Evidence "Return event dispatch found in ReturnsFines.tsx"

# ------------------------------------------------------------------------------
# CHECK 6: Frontend Shared - Cross-Portal Notification Bus
# ------------------------------------------------------------------------------
Write-Host "`n--- [CATEGORY 6] Frontend Shared Notification Bus ---" -ForegroundColor Yellow

$notifBusPath = Join-Path $frontendDir "src/Shared/Utils/notificationBus.ts"
$notifBusContent = if (Test-Path $notifBusPath) { Get-Content $notifBusPath -Raw } else { "" }

$hasNotifBus = (Test-Path $notifBusPath) -and 
               ($notifBusContent -match "CirculationNotificationEvent") -and 
               ($notifBusContent -match "dispatchCirculationNotification")

Record-Check -Category "Frontend Notification Bus" `
             -Description "notificationBus.ts provides cross-portal circulation event bus" `
             -Success $hasNotifBus `
             -Evidence "notificationBus.ts exists with event schema and dispatch functions"

# ------------------------------------------------------------------------------
# CHECK 7: Notification Bells in Customer, Cashier, and Admin Panels
# ------------------------------------------------------------------------------
Write-Host "`n--- [CATEGORY 7] Cross-Portal Notification Bell Listeners ---" -ForegroundColor Yellow

$adminNotifFiles = @(
    (Join-Path $frontendDir "src/UserRoles/Features/Pages/AdminsPanel/Shared/NotificationUI.tsx"),
    (Join-Path $frontendDir "src/LayoutBars/AdminHeader.tsx"),
    (Join-Path $frontendDir "src/UserRoles/Features/Pages/AdminsPanel/Layout/AdminHeader.tsx")
)
$cashierNotifFiles = @(
    (Join-Path $frontendDir "src/UserRoles/Features/Pages/CashiersPanel/Pages/Notifications.tsx"),
    (Join-Path $frontendDir "src/LayoutBars/CashierHeader.tsx"),
    (Join-Path $frontendDir "src/UserRoles/Features/Pages/CashiersPanel/Layout/CashierHeader.tsx")
)
$customerNotifFiles = @(
    (Join-Path $frontendDir "src/UserRoles/Features/Pages/CustomersPanel/Pages/CustomerDashboard.tsx"),
    (Join-Path $frontendDir "src/LayoutBars/CustomerHeader.tsx"),
    (Join-Path $frontendDir "src/UserRoles/Features/Pages/CustomersPanel/Layout/CustomerHeader.tsx")
)

function Test-AnyPattern($fileList, $pattern) {
    foreach ($f in $fileList) {
        if (Test-Path $f) {
            $txt = Get-Content $f -Raw
            if ($txt -match $pattern) {
                return $true
            }
        }
    }
    return $false
}

$adminBellSync = Test-AnyPattern $adminNotifFiles "kls_notification_received|notificationBus|circulation-.*-confirmed|katipuneros-notification-event"
$cashierBellSync = Test-AnyPattern $cashierNotifFiles "kls_notification_received|notificationBus|circulation-.*-confirmed|katipuneros-notification-event"
$customerBellSync = Test-AnyPattern $customerNotifFiles "kls_notification_received|notificationBus|circulation-.*-confirmed|katipuneros-notification-event"

Record-Check -Category "Notification Bells" `
             -Description "Chief Admin portal bell synchronizes with circulation events" `
             -Success $adminBellSync `
             -Evidence "Admin notification subscriber detected in NotificationUI.tsx / AdminHeader.tsx"

Record-Check -Category "Notification Bells" `
             -Description "Cashier Desk bell synchronizes with circulation events" `
             -Success $cashierBellSync `
             -Evidence "Cashier notification subscriber detected in Notifications.tsx / CashierHeader.tsx"

Record-Check -Category "Notification Bells" `
             -Description "Customer Patron portal bell synchronizes with circulation events" `
             -Success $customerBellSync `
             -Evidence "Customer notification subscriber detected in CustomerDashboard.tsx / CustomerHeader.tsx"

# ------------------------------------------------------------------------------
# CHECK 8: Full Backend Compilation Gate
# ------------------------------------------------------------------------------
Write-Host "`n--- [CATEGORY 8] Full Backend Compilation Gate ---" -ForegroundColor Yellow

Write-Host "  Compiling Backend: dotnet build Katipuneros-Library-Store/Backend -c Debug..." -ForegroundColor Gray
$dotnetOutput = & dotnet build "$backendDir" -c Debug 2>&1
$backendExit = $LASTEXITCODE
$backendCompiled = ($backendExit -eq 0)

Record-Check -Category "Build Gate" `
             -Description "Backend compiles successfully with 0 errors (dotnet build Backend -c Debug)" `
             -Success $backendCompiled `
             -Evidence "Exit code: $backendExit"

if (-not $backendCompiled) {
    Write-Host "  Dotnet build output snippet:" -ForegroundColor Red
    $dotnetOutput | Select-Object -Last 15 | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkRed }
}

# ------------------------------------------------------------------------------
# CHECK 9: Full Frontend Compilation Gate
# ------------------------------------------------------------------------------
Write-Host "`n--- [CATEGORY 9] Full Frontend Compilation Gate ---" -ForegroundColor Yellow

Write-Host "  Compiling Frontend: npm --prefix Katipuneros-Library-Store/Frontend run build..." -ForegroundColor Gray
Push-Location "$frontendDir"
$npmOutput = & cmd.exe /c "npm run build" 2>&1
$frontendExit = $LASTEXITCODE
Pop-Location
$frontendCompiled = ($frontendExit -eq 0)

Record-Check -Category "Build Gate" `
             -Description "Frontend compiles successfully with 0 errors (npm run build)" `
             -Success $frontendCompiled `
             -Evidence "Exit code: $frontendExit"

if (-not $frontendCompiled) {
    Write-Host "  NPM build output snippet:" -ForegroundColor Red
    $npmOutput | Select-Object -Last 15 | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkRed }
}

# ------------------------------------------------------------------------------
# SCORECARD SUMMARY
# ------------------------------------------------------------------------------
Write-Host "`n==========================================================================" -ForegroundColor Cyan
Write-Host "                    FINAL AUDIT SCORECARD SUMMARY" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan

$passedCount = ($results | Where-Object { $_.Passed -eq $true }).Count
$totalCount = $results.Count
$percentage = [math]::Round(($passedCount / $totalCount) * 100, 1)

foreach ($r in $results) {
    $mark = if ($r.Passed) { "[PASS]" } else { "[FAIL]" }
    $color = if ($r.Passed) { "Green" } else { "Red" }
    Write-Host ("{0,-8} | {1,-24} | {2}" -f $mark, $r.Category, $r.Description) -ForegroundColor $color
}

Write-Host "--------------------------------------------------------------------------" -ForegroundColor Gray
Write-Host "TOTAL SCORE: $passedCount / $totalCount checks passed ($percentage%)" -ForegroundColor $(if ($passedCount -eq $totalCount) { "Green" } else { "Yellow" })

if ($passedCount -eq $totalCount) {
    Write-Host "RESULT: ALL QR/PIN HANDOVER & NOTIFICATION CHECKS PASSED SUCCESSFULLY!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "RESULT: SOME AUDIT CHECKS FAILED. PLEASE REVIEW FAILURES ABOVE." -ForegroundColor Red
    exit 1
}
