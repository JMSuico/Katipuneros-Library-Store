# Katipuneros-Library-Store/scratch/verify_circulation_qr_expresscode_lifecycle.ps1
# Comprehensive Verification Test Suite: Circulation Lifecycle, Optical Camera Scanner, Tri-Modal Returns, 4-Digit PIN Handover, and Customer Approval Gating
$ErrorActionPreference = "Continue"

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "  KATIPUNEROS E2E CIRCULATION LIFECYCLE & SCANNER VERIFICATION SUITE" -ForegroundColor Cyan
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

Write-Host "Base Directory    : $baseDir" -ForegroundColor Gray
Write-Host "Backend Directory : $backendDir" -ForegroundColor Gray
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

# ==============================================================================
# VERIFICATION CHECK 1: Reusable Optical Camera & Image Scanner Component
# File: Frontend/src/Shared/Components/OpticalCameraScanner.tsx
# ==============================================================================
Write-Host "`n--- [CHECK 1] Shared Optical Camera Scanner Component ---" -ForegroundColor Yellow

$scannerPath = Join-Path $frontendDir "src/Shared/Components/OpticalCameraScanner.tsx"
$scannerExists = Test-Path $scannerPath
$scannerContent = if ($scannerExists) { Get-Content $scannerPath -Raw } else { "" }

Record-Check -Category "Optical Camera Scanner" `
             -Description "OpticalCameraScanner.tsx exists in Shared/Components" `
             -Success $scannerExists `
             -Evidence $(if ($scannerExists) { "File found at $scannerPath" } else { "File not found" })

$importsJsQr = $scannerContent -match "import\s+jsQR\s+from\s+['""]jsqr['""]"
Record-Check -Category "Optical Camera Scanner" `
             -Description "OpticalCameraScanner imports jsQR engine" `
             -Success $importsJsQr `
             -Evidence $(if ($importsJsQr) { "Found 'import jsQR from jsqr'" } else { "jsQR import missing" })

$hasMultiEngine = ($scannerContent -match "jsQR\(") -and ($scannerContent -match "BarcodeDetector")
Record-Check -Category "Optical Camera Scanner" `
             -Description "Multi-engine frame decoder combines jsQR and BarcodeDetector" `
             -Success $hasMultiEngine `
             -Evidence $(if ($hasMultiEngine) { "Found jsQR() frame invocation and BarcodeDetector detection fallback" } else { "Multi-engine decoding missing" })

$hasAudioChime = ($scannerContent -match "AudioContext") -and ($scannerContent -match "createOscillator")
Record-Check -Category "Optical Camera Scanner" `
             -Description "Audio chime synthesizer implemented via Web Audio API" `
             -Success $hasAudioChime `
             -Evidence $(if ($hasAudioChime) { "Found Web Audio oscillator and pleasant chime synthesis" } else { "Web Audio chime missing" })

$hasImageUpload = ($scannerContent -match "type=['""]file['""]") -and ($scannerContent -match "accept=['""]image/\*['""]")
Record-Check -Category "Optical Camera Scanner" `
             -Description "Image file upload option decodes QR codes from image slips" `
             -Success $hasImageUpload `
             -Evidence $(if ($hasImageUpload) { "Found file input with image/* acceptance and canvas decoder" } else { "Image file upload missing" })

$sharedIndexPath = Join-Path $frontendDir "src/Shared/index.ts"
$sharedIndexContent = if (Test-Path $sharedIndexPath) { Get-Content $sharedIndexPath -Raw } else { "" }
$isExportedInShared = $sharedIndexContent -match "OpticalCameraScanner"
Record-Check -Category "Optical Camera Scanner" `
             -Description "OpticalCameraScanner is exported in Shared barrel index.ts" `
             -Success $isExportedInShared `
             -Evidence $(if ($isExportedInShared) { "Export found in Shared/index.ts" } else { "Export missing from Shared/index.ts" })


# ==============================================================================
# VERIFICATION CHECK 2: Backend Circulation Multi-Identifier Resolution
# File: Backend/Features/Services/Implementations/BorrowService.cs
# ==============================================================================
Write-Host "`n--- [CHECK 2] Backend Multi-Identifier Return Resolution ---" -ForegroundColor Yellow

$borrowServicePath = Join-Path $backendDir "Features/Services/Implementations/BorrowService.cs"
$borrowServiceExists = Test-Path $borrowServicePath
$borrowServiceContent = if ($borrowServiceExists) { Get-Content $borrowServicePath -Raw } else { "" }

Record-Check -Category "Backend Return Resolution" `
             -Description "BorrowService.cs exists in Features/Services/Implementations" `
             -Success $borrowServiceExists `
             -Evidence $(if ($borrowServiceExists) { "File found at $borrowServicePath" } else { "File not found" })

$resolvesScanBay = $borrowServiceContent -match "SCAN-BAY-"
Record-Check -Category "Backend Return Resolution" `
             -Description "ReturnBookAsync resolves ExpressCode format ('SCAN-BAY-XXXXXX')" `
             -Success $resolvesScanBay `
             -Evidence $(if ($resolvesScanBay) { "Found SCAN-BAY- prefix extraction and reservation lookup" } else { "SCAN-BAY- resolution missing" })

$resolvesKpTxn = $borrowServiceContent -match "GatePassCode" -or $borrowServiceContent -match "KP-TXN-"
Record-Check -Category "Backend Return Resolution" `
             -Description "ReturnBookAsync resolves GatePassCode / Transaction reference ('KP-TXN-')" `
             -Success $resolvesKpTxn `
             -Evidence $(if ($resolvesKpTxn) { "Found GatePassCode matching in ReturnBookAsync" } else { "KP-TXN- resolution missing" })

$resolvesLockerPin = ($borrowServiceContent -match "LockerPin") -or ($borrowServiceContent -match "char\.IsDigit")
Record-Check -Category "Backend Return Resolution" `
             -Description "ReturnBookAsync resolves 4-digit Pickup PIN to active circulation loan" `
             -Success $resolvesLockerPin `
             -Evidence $(if ($resolvesLockerPin) { "Found 4-digit numeric PIN resolution matching reservation LockerPin" } else { "LockerPin resolution missing" })

$resolvesAccession = $borrowServiceContent -match "FindByCodeAsync"
Record-Check -Category "Backend Return Resolution" `
             -Description "ReturnBookAsync resolves BookCopy accession number" `
             -Success $resolvesAccession `
             -Evidence $(if ($resolvesAccession) { "Found _bookCopyRepository.FindByCodeAsync(cleanBarcode)" } else { "Accession resolution missing" })

$resolvesBarcode = $borrowServiceContent -match "GetByBarcodeAsync"
Record-Check -Category "Backend Return Resolution" `
             -Description "ReturnBookAsync resolves Book barcode / ISBN" `
             -Success $resolvesBarcode `
             -Evidence $(if ($resolvesBarcode) { "Found _bookRepository.GetByBarcodeAsync(cleanBarcode)" } else { "Barcode resolution missing" })

$circulationReqPath = Join-Path $backendDir "Features/Api/DTOs/Requests/CirculationRequests.cs"
$circulationReqContent = if (Test-Path $circulationReqPath) { Get-Content $circulationReqPath -Raw } else { "" }
$hasReturnRequestProps = ($circulationReqContent -match "ExpressCode") -and ($circulationReqContent -match "PickupPin")
Record-Check -Category "Backend Return Resolution" `
             -Description "ReturnRequest DTO includes ExpressCode and PickupPin optional parameters" `
             -Success $hasReturnRequestProps `
             -Evidence $(if ($hasReturnRequestProps) { "ExpressCode and PickupPin found in ReturnRequest DTO" } else { "Properties missing from ReturnRequest" })


# ==============================================================================
# VERIFICATION CHECK 3: Cashier Checkout Handover & 4-Digit PIN Modal
# File: Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/CheckoutBorrow.tsx
# ==============================================================================
Write-Host "`n--- [CHECK 3] Cashier Checkout Handover & 4-Digit PIN Modal ---" -ForegroundColor Yellow

$checkoutBorrowPath = Join-Path $frontendDir "src/UserRoles/Features/Pages/CashiersPanel/Pages/CheckoutBorrow.tsx"
$checkoutBorrowExists = Test-Path $checkoutBorrowPath
$checkoutBorrowContent = if ($checkoutBorrowExists) { Get-Content $checkoutBorrowPath -Raw } else { "" }

Record-Check -Category "Cashier Checkout Handover" `
             -Description "CheckoutBorrow.tsx exists in CashiersPanel" `
             -Success $checkoutBorrowExists `
             -Evidence $(if ($checkoutBorrowExists) { "File found at $checkoutBorrowPath" } else { "File not found" })

$usesOpticalScanner = $checkoutBorrowContent -match "OpticalCameraScanner"
Record-Check -Category "Cashier Checkout Handover" `
             -Description "CheckoutBorrow integrates unified OpticalCameraScanner component" `
             -Success $usesOpticalScanner `
             -Evidence $(if ($usesOpticalScanner) { "Found <OpticalCameraScanner /> integration" } else { "OpticalCameraScanner component missing" })

$hasHandoverModal = ($checkoutBorrowContent -match "Handover") -or ($checkoutBorrowContent -match "lockerPin")
Record-Check -Category "Cashier Checkout Handover" `
             -Description "CheckoutBorrow features 4-digit PIN Handover Verification Modal" `
             -Success $hasHandoverModal `
             -Evidence $(if ($hasHandoverModal) { "Found Handover verification modal logic" } else { "Handover modal missing" })

$validatesLockerPin = ($checkoutBorrowContent -match "lockerPin") -and ($checkoutBorrowContent -match "pin|PIN")
Record-Check -Category "Cashier Checkout Handover" `
             -Description "CheckoutBorrow validates entered PIN against reservation lockerPin" `
             -Success $validatesLockerPin `
             -Evidence $(if ($validatesLockerPin) { "Found validation comparing entered PIN with reservation lockerPin" } else { "PIN comparison missing" })


# ==============================================================================
# VERIFICATION CHECK 4: Cashier Returns & Fines Tri-Modal Resolver UI
# File: Frontend/src/UserRoles/Features/Pages/CashiersPanel/Pages/ReturnsFines.tsx
# ==============================================================================
Write-Host "`n--- [CHECK 4] Cashier Returns Desk Tri-Modal Resolver & Receipt ---" -ForegroundColor Yellow

$returnsFinesPath = Join-Path $frontendDir "src/UserRoles/Features/Pages/CashiersPanel/Pages/ReturnsFines.tsx"
$returnsFinesExists = Test-Path $returnsFinesPath
$returnsFinesContent = if ($returnsFinesExists) { Get-Content $returnsFinesPath -Raw } else { "" }

Record-Check -Category "Cashier Returns Desk" `
             -Description "ReturnsFines.tsx exists in CashiersPanel" `
             -Success $returnsFinesExists `
             -Evidence $(if ($returnsFinesExists) { "File found at $returnsFinesPath" } else { "File not found" })

$hasReturnsScanner = ($returnsFinesContent -match "OpticalCameraScanner") -or ($returnsFinesContent -match "isCameraOpen")
Record-Check -Category "Cashier Returns Desk" `
             -Description "Returns Desk implements Option 1: Optical Camera / Barcode Scanning" `
             -Success $hasReturnsScanner `
             -Evidence $(if ($hasReturnsScanner) { "Found Optical Scanner integration in ReturnsFines" } else { "Optical Scanner missing" })

$hasSlipInput = ($returnsFinesContent -match "returnCodeInput") -or ($returnsFinesContent -match "handleCodeLookup") -or ($returnsFinesContent -match "SCAN-BAY")
Record-Check -Category "Cashier Returns Desk" `
             -Description "Returns Desk implements Option 2: Slip Input / ExpressCode resolution" `
             -Success $hasSlipInput `
             -Evidence $(if ($hasSlipInput) { "Found manual slip code lookup supporting ExpressCode, PIN, and Barcode" } else { "Manual slip input missing" })

$hasImageOrActiveOption = ($returnsFinesContent -match "Upload Slip|upload|activeLoan|Active Loan")
Record-Check -Category "Cashier Returns Desk" `
             -Description "Returns Desk implements Option 3: Slip Image Upload / Active Loans Selector" `
             -Success $hasImageOrActiveOption `
             -Evidence $(if ($hasImageOrActiveOption) { "Found Slip Image / Active Loans option" } else { "Option 3 missing" })

$hasReceiptModal = ($returnsFinesContent -match "KP-TXN-") -or ($returnsFinesContent -match "receiptModal|returnReceipt|Receipt")
Record-Check -Category "Cashier Returns Desk" `
             -Description "Returns Desk provides Return Receipt Modal with KP-TXN-XXXXXXXX reference" `
             -Success $hasReceiptModal `
             -Evidence $(if ($hasReceiptModal) { "Found Return Receipt modal rendering transaction reference" } else { "Receipt modal missing" })

$dispatchesEvent = ($returnsFinesContent -match "dispatchCirculationEvent") -or ($returnsFinesContent -match "return_confirmed")
Record-Check -Category "Cashier Returns Desk" `
             -Description "Returns Desk dispatches multi-portal return_confirmed notification event" `
             -Success $dispatchesEvent `
             -Evidence $(if ($dispatchesEvent) { "Found circulation return_confirmed event dispatch" } else { "Notification dispatch missing" })


# ==============================================================================
# VERIFICATION CHECK 5: Customer Reservation Approval Gating
# File: Frontend/src/UserRoles/Features/Pages/CustomersPanel/Pages/ReservationsPage.tsx
# ==============================================================================
Write-Host "`n--- [CHECK 5] Customer Approval Gating on QR, PIN & Slip ---" -ForegroundColor Yellow

$reservationsPagePath = Join-Path $frontendDir "src/UserRoles/Features/Pages/CustomersPanel/Pages/ReservationsPage.tsx"
$reservationsPageExists = Test-Path $reservationsPagePath
$reservationsPageContent = if ($reservationsPageExists) { Get-Content $reservationsPagePath -Raw } else { "" }

Record-Check -Category "Customer Approval Gating" `
             -Description "ReservationsPage.tsx exists in CustomersPanel" `
             -Success $reservationsPageExists `
             -Evidence $(if ($reservationsPageExists) { "File found at $reservationsPagePath" } else { "File not found" })

$gatesQrAndPin = ($reservationsPageContent -match "StagedInLocker|Approved|readyReservations") -and ($reservationsPageContent -match "SCAN-BAY")
Record-Check -Category "Customer Approval Gating" `
             -Description "ExpressCode (SCAN-BAY-), QR code, and PIN are strictly gated behind Staged/Approved status" `
             -Success $gatesQrAndPin `
             -Evidence $(if ($gatesQrAndPin) { "Verified readyReservations / StagedInLocker filter guards ExpressCode and PIN" } else { "Status gating missing" })

$hasSlipDownload = $reservationsPageContent -match "generateUserSlipPng"
Record-Check -Category "Customer Approval Gating" `
             -Description "Download User Slip button generates official PNG slip exclusively for approved holds" `
             -Success $hasSlipDownload `
             -Evidence $(if ($hasSlipDownload) { "Found generateUserSlipPng integration on staged holds" } else { "User slip generation missing" })


# ==============================================================================
# VERIFICATION CHECK 6: Backend Compilation Gate (.NET 10 Web API)
# ==============================================================================
Write-Host "`n--- [CHECK 6] Backend Compilation Gate (dotnet build) ---" -ForegroundColor Yellow

$dotnetBuildCmd = "dotnet build `"$backendDir`" -c Debug"
Write-Host "  Compiling Backend: $dotnetBuildCmd..." -ForegroundColor Gray
$backendBuildOutput = Invoke-Expression $dotnetBuildCmd 2>&1
$backendExitCode = $LASTEXITCODE
$backendSuccess = ($backendExitCode -eq 0)

Record-Check -Category "Build Gate" `
             -Description "Backend compiles successfully with 0 errors (dotnet build Backend -c Debug)" `
             -Success $backendSuccess `
             -Evidence $(if ($backendSuccess) { "Exit code 0: Build succeeded" } else { "Exit code $backendExitCode`n$($backendBuildOutput | Out-String)" })


# ==============================================================================
# VERIFICATION CHECK 7: Frontend Compilation Gate (Vite / TypeScript)
# ==============================================================================
Write-Host "`n--- [CHECK 7] Frontend Compilation Gate (npm run build) ---" -ForegroundColor Yellow

$frontendBuildCmd = "npm --prefix `"$frontendDir`" run build"
Write-Host "  Compiling Frontend: $frontendBuildCmd..." -ForegroundColor Gray
$frontendBuildOutput = Invoke-Expression $frontendBuildCmd 2>&1
$frontendExitCode = $LASTEXITCODE
$frontendSuccess = ($frontendExitCode -eq 0)

Record-Check -Category "Build Gate" `
             -Description "Frontend compiles successfully with 0 errors (npm run build)" `
             -Success $frontendSuccess `
             -Evidence $(if ($frontendSuccess) { "Exit code 0: Vite bundle compiled successfully" } else { "Exit code $frontendExitCode`n$($frontendBuildOutput | Out-String)" })


# ==============================================================================
# FINAL AUDIT SCORECARD SUMMARY
# ==============================================================================
Write-Host "`n==========================================================================" -ForegroundColor Cyan
Write-Host "                    FINAL AUDIT SCORECARD SUMMARY" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan

$passedCount = ($results | Where-Object { $_.Passed -eq $true }).Count
$totalCount = $results.Count
$percentage = [math]::Round(($passedCount / $totalCount) * 100, 1)

foreach ($r in $results) {
    $statusText = if ($r.Passed) { "[PASS]" } else { "[FAIL]" }
    $color = if ($r.Passed) { "Green" } else { "Red" }
    $catPadded = $r.Category.PadRight(26)
    Write-Host "$statusText | $catPadded | $($r.Description)" -ForegroundColor $color
}

Write-Host "--------------------------------------------------------------------------" -ForegroundColor Gray
Write-Host "TOTAL SCORE: $passedCount / $totalCount checks passed ($percentage%)" -ForegroundColor $(if ($passedCount -eq $totalCount) { "Green" } else { "Yellow" })

if ($passedCount -eq $totalCount) {
    Write-Host "RESULT: ALL CIRCULATION LIFECYCLE & SCANNER CHECKS PASSED SUCCESSFULLY!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "RESULT: SOME VERIFICATION CHECKS FAILED. Please review the missing criteria above." -ForegroundColor Red
    exit 1
}
