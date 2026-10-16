# Katipuneros-Library-Store/scratch/verify_stream3_crud_transactions.ps1
# Master Checklist Sections 2 (Functional), 3 (CRUD), 9 (API), 11 (Database), 20 (Business Logic & Transactions)
$ErrorActionPreference = "Stop"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " STREAM 3: ENTITY CRUD, DB & TRANSACTIONS (SECTIONS 2-3, 9, 11, 20)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Run All 7 CRUD Criteria
Write-Host "`n--- 1. Executing Full 7-Criteria CRUD Suite ---" -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File "scratch/run_all_crud_checks.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Error "CRIT-03 Full CRUD Suite Failed"
}

# 2. Run Adversarial & Challenged Edge-Cases Suite
Write-Host "`n--- 2. Executing 38-Test Adversarial Edge-Cases Suite ---" -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File "scratch/verify_challenged_edge_cases.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Error "CRIT-03 Challenged Edge-Cases Suite Failed"
}

Write-Host "`nStream 3 Result: ALL CRUD & TRANSACTION SUITES PASSED ALL GREEN!" -ForegroundColor Green
exit 0
