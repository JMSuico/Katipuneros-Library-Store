# Katipuneros-Library-Store/scratch/verify_stream1_smoke_health.ps1
# Master Checklist Section 1 (Smoke Testing) & Section 10 (Integration Testing)
$ErrorActionPreference = "Stop"
$BaseUrl = "http://localhost:5000"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " STREAM 1: SMOKE & HEALTH VERIFICATION (SECTIONS 1 & 10)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$Passed = 0
$Failed = 0

function Assert-Test($name, $condition, $detail) {
    if ($condition) {
        Write-Host "  [PASS] $name" -ForegroundColor Green
        if ($detail) { Write-Host "         $detail" -ForegroundColor Gray }
        $global:Passed++
    } else {
        Write-Host "  [FAIL] $name" -ForegroundColor Red
        if ($detail) { Write-Host "         Detail: $detail" -ForegroundColor Yellow }
        $global:Failed++
    }
}

# 1. Backend Server & Health Check
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/api/health" -Method Get
    Assert-Test "1.1 Backend Health Endpoint Accessible" ($health.success -eq $true) "Status: $($health.message)"
    Assert-Test "1.2 Database Connectivity Verified" ($health.data.databaseConnected -eq $true) "Memory: $($health.data.memoryUsageMb) MB, Env: $($health.data.environment)"
} catch {
    Assert-Test "1.1 Backend Health Endpoint" $false $_.Exception.Message
}

# 2. Taxonomy & Database Seeding
try {
    $cats = Invoke-RestMethod -Uri "$BaseUrl/api/categories" -Method Get
    Assert-Test "1.3 Categories Catalog Seeded" ($cats.data.Count -gt 0) "Total categories: $($cats.data.Count)"
} catch {
    Assert-Test "1.3 Categories Catalog Seeded" $false $_.Exception.Message
}

# 3. Security Altcha Challenge
try {
    $altcha = Invoke-RestMethod -Uri "$BaseUrl/api/altcha/challenge" -Method Get
    Assert-Test "1.4 Altcha Proof-of-Work Challenge Service" ($altcha.challenge -ne $null -or $altcha.data.challenge -ne $null) "Challenge generated successfully"
} catch {
    Assert-Test "1.4 Altcha Proof-of-Work Challenge Service" $false $_.Exception.Message
}

# 4. Catalog Books Read
try {
    $books = Invoke-RestMethod -Uri "$BaseUrl/api/books" -Method Get
    Assert-Test "1.5 Catalog Books Read Endpoint Active" ($books.success -eq $true -and $books.data -ne $null) "Catalog books count: $($books.data.Count)"
} catch {
    Assert-Test "1.5 Catalog Books Read Endpoint Active" $false $_.Exception.Message
}

Write-Host "`nStream 1 Result: $Passed Passed, $Failed Failed" -ForegroundColor $(if ($Failed -eq 0) { "Green" } else { "Red" })
if ($Failed -gt 0) { exit 1 } else { exit 0 }
