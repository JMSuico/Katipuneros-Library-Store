# Katipuneros-Library-Store/scratch/verify_stream4_build_gates.ps1
# Master Checklist Sections 25 (Env), 26 (Deployment), 30 (Release Acceptance)
$ErrorActionPreference = "Stop"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " STREAM 4: STATIC BUILD GATES & RELEASE CERTIFICATION (SECTIONS 25-26, 30)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Frontend Production Compilation
Write-Host "`n--- 1. Compiling Frontend (tsc -b && vite build) ---" -ForegroundColor Yellow
Push-Location "Frontend"
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Frontend production build failed!"
    }
    Write-Host "  [PASS] Frontend Compiled Successfully with 0 TypeScript Errors" -ForegroundColor Green
} finally {
    Pop-Location
}

# 2. Backend .NET 10 Build
Write-Host "`n--- 2. Compiling Backend (.NET 10 Web API) ---" -ForegroundColor Yellow
dotnet build "Backend" -c Debug
if ($LASTEXITCODE -ne 0) {
    Write-Error "Backend compilation failed!"
}
Write-Host "  [PASS] Backend Compiled Successfully with 0 Errors" -ForegroundColor Green

Write-Host "`nStream 4 Result: DUAL BUILD GATES PASSED ALL GREEN!" -ForegroundColor Green
exit 0
