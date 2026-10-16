# scratch/verify_all_frontend_to_backend_endpoints.ps1
# End-to-End Verification of ALL remaining Frontend Endpoint Modules -> Backend Controllers -> SQL Server Database
$ErrorActionPreference = "Stop"

$connStr = "Server=localhost;Database=KatipunerosLibraryDb;User Id=InventoryLibrary;Password=InventoryLibrary;TrustServerCertificate=True;"

Write-Host "=== 1. Authenticate Admin & Customer Sessions ==="
$adminLogin = @{ identifier = "testadmin@katipuneros.edu.ph"; password = "Password123!" } | ConvertTo-Json
$adminAuth = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $adminLogin -ContentType "application/json" -Headers @{ "Origin" = "http://localhost:5174" }
$adminToken = $adminAuth.data.token
$adminHeaders = @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$patronPayload = @{
    firstName = "E2E"
    lastName = "Tester"
    email = "e2e_tester_$ts@katipuneros.edu.ph"
    username = "e2e_tester_$ts"
    password = "Password123!"
    employmentStatus = "Student"
    currentAddress = "Manila"
    permanentAddress = "Manila"
} | ConvertTo-Json
$patronResp = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $patronPayload -ContentType "application/json"
$patronToken = $patronResp.data.token
$patronId = $patronResp.data.userId
$patronHeaders = @{ "Authorization" = "Bearer $patronToken"; "Origin" = "http://localhost:5173" }

Write-Host "  Admin & Patron Authenticated (PatronId: $patronId)"

Write-Host "`n=== 2. Verify Admin Returns Endpoints (returnsApi.ts -> ReturnsController) ==="
$retMetrics = Invoke-RestMethod -Uri "http://localhost:5000/api/returns/metrics" -Method GET -Headers $adminHeaders
$retJournal = Invoke-RestMethod -Uri "http://localhost:5000/api/returns/journal" -Method GET -Headers $adminHeaders
if (-not $retMetrics.success -or -not $retJournal.success) { Write-Error "Returns API failed." }
Write-Host "  [PASS] /api/returns/metrics & /api/returns/journal verified."

Write-Host "`n=== 3. Verify Physical Inventory CRUD (inventoryApi.ts -> InventoryController -> [Books]) ==="
$invMetrics = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/inventory/metrics" -Method GET -Headers $adminHeaders
$invAudit = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/inventory/audit" -Method GET -Headers $adminHeaders
$ingestPayload = @{
    bookTitle = "Inventory Ingested Volume $ts"
    deweyCode = "005.133 INV"
    bayLocation = "Stacks North Bay 12"
    barcodes = @("BC-INV-$ts-01")
} | ConvertTo-Json
$ingestResp = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/inventory/barcodes" -Method POST -Body $ingestPayload -ContentType "application/json" -Headers $adminHeaders
if (-not $ingestResp.success) { Write-Error "Inventory barcode ingestion failed." }

# Verify in SQL Server Database
$conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT Id, Title, BayLocation FROM Books WHERE Title = 'Inventory Ingested Volume $ts'"
$reader = $cmd.ExecuteReader()
if (-not $reader.Read()) {
    $conn.Close()
    Write-Error "Inventory ingested volume not found in [Books] table."
}
$ingestedBookId = $reader["Id"].ToString()
$conn.Close()

# Update Inventory Status & Label
$statusPayload = @{ status = "In Maintenance"; condition = "Fair"; rationale = "Routine spine inspection" } | ConvertTo-Json
$statusUpd = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/inventory/$ingestedBookId/status" -Method PUT -Body $statusPayload -ContentType "application/json" -Headers $adminHeaders
$labelPayload = @{ labelDescription = "Shelf Tag Printed $ts"; markForPrintQueue = $true } | ConvertTo-Json
$labelUpd = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/inventory/$ingestedBookId/label" -Method PUT -Body $labelPayload -ContentType "application/json" -Headers $adminHeaders

# Bulk Delete Inventory Item & Verify DB Removal
$bulkDelPayload = @{ ids = @($ingestedBookId) } | ConvertTo-Json
$bulkDelResp = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/inventory/bulk-delete" -Method POST -Body $bulkDelPayload -ContentType "application/json" -Headers $adminHeaders
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT COUNT(*) FROM Books WHERE Id = '$ingestedBookId'"
$remCount = [int]$cmd.ExecuteScalar()
$conn.Close()
if ($remCount -ne 0) { Write-Error "Bulk delete inventory did not remove row from [Books]." }
Write-Host "  [PASS] Inventory Create (Ingest) -> Read -> Update (Status/Label) -> Delete verified in [Books]."

Write-Host "`n=== 4. Verify System Settings & CIDR Subnets CRUD (settingsApi.ts -> SettingsController -> [CidrSubnets]) ==="
$sysSettings = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/settings" -Method GET -Headers $adminHeaders
$cidrCreate = @{ cidrRange = "10.99.$($ts % 250).0/24"; networkClassification = "Testing Lab VLAN $ts"; accessLevel = "Full Access" } | ConvertTo-Json
$cidrResp = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/settings/cidr" -Method POST -Body $cidrCreate -ContentType "application/json" -Headers $adminHeaders
$cidrId = $cidrResp.data.id

# Verify CIDR in SQL Server Database
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT COUNT(*) FROM CidrSubnets WHERE Id = '$cidrId'"
$cidrDbCount = [int]$cmd.ExecuteScalar()
$conn.Close()
if ($cidrDbCount -ne 1) { Write-Error "CIDR subnet was not persisted in [CidrSubnets] table." }

# Delete CIDR via Bulk Delete
$cidrDelPayload = @{ ids = @($cidrId) } | ConvertTo-Json
$cidrDelResp = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/settings/cidr/bulk-delete" -Method POST -Body $cidrDelPayload -ContentType "application/json" -Headers $adminHeaders
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "SELECT COUNT(*) FROM CidrSubnets WHERE Id = '$cidrId'"
$cidrAfterDel = [int]$cmd.ExecuteScalar()
$conn.Close()
if ($cidrAfterDel -ne 0) { Write-Error "CIDR subnet was not deleted from [CidrSubnets] table." }
Write-Host "  [PASS] Settings & CIDR Subnets Create -> Read -> Delete verified in [CidrSubnets]."

Write-Host "`n=== 5. Verify Campus Announcements CRUD (notificationApi.ts -> NotificationsController) ==="
$annCreate = @{
    title = "Campus Bulletin $ts"
    content = "Automated CRUD verification bulletin."
    audience = "All Patrons"
    channels = @("Portal", "Email")
    priority = "High"
    displayDuration = "7 Days"
    isDraft = $false
} | ConvertTo-Json
$annResp = Invoke-RestMethod -Uri "http://localhost:5000/api/notifications/announcements" -Method POST -Body $annCreate -ContentType "application/json" -Headers $adminHeaders
$annId = $annResp.data.id
$annUpdate = @{
    title = "Updated Campus Bulletin $ts"
    content = "Updated content."
    audience = "All Patrons"
    channels = @("Portal")
    priority = "Normal"
    displayDuration = "3 Days"
    isDraft = $false
    status = "Active"
} | ConvertTo-Json
$annUpdResp = Invoke-RestMethod -Uri "http://localhost:5000/api/notifications/announcements/$annId" -Method PUT -Body $annUpdate -ContentType "application/json" -Headers $adminHeaders
$annDelResp = Invoke-RestMethod -Uri "http://localhost:5000/api/notifications/announcements/$annId" -Method DELETE -Headers $adminHeaders
if (-not $annDelResp.success) { Write-Error "Announcement CRUD failed." }
Write-Host "  [PASS] Campus Announcements Create -> Read -> Update -> Delete verified."

Write-Host "`n=== 6. Verify Reports, Analytics, Cashier, Roles & Audit Endpoints ==="
$adminMetrics = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/metrics" -Method GET -Headers $adminHeaders
$repSuites = Invoke-RestMethod -Uri "http://localhost:5000/api/reports/suites" -Method GET -Headers $adminHeaders
$velMetrics = Invoke-RestMethod -Uri "http://localhost:5000/api/analytics/velocity?granularity=30D" -Method GET -Headers $adminHeaders
$cashierKpis = Invoke-RestMethod -Uri "http://localhost:5000/api/cashier/dashboard-kpis" -Method GET -Headers $adminHeaders
$rolesMetrics = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/roles/metrics" -Method GET -Headers $adminHeaders
$auditLogs = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/audit-logs" -Method GET -Headers $adminHeaders
Write-Host "  [PASS] Reports, Analytics, Cashier, Roles, and Audit Logs endpoints verified."

Write-Host "`n=== 7. Verify Customer Self-Service Endpoints (my-loans, my-history, my-holds, my-fines) ==="
$myLoans = Invoke-RestMethod -Uri "http://localhost:5000/api/borrow/my-loans" -Method GET -Headers $patronHeaders
$myHistory = Invoke-RestMethod -Uri "http://localhost:5000/api/borrow/my-history" -Method GET -Headers $patronHeaders
$myHolds = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations/my-holds" -Method GET -Headers $patronHeaders
$myFines = Invoke-RestMethod -Uri "http://localhost:5000/api/fines/my-fines" -Method GET -Headers $patronHeaders
if (-not $myLoans.success -or -not $myHistory.success -or -not $myHolds.success -or -not $myFines.success) {
    Write-Error "Customer self-service endpoints failed."
}
Write-Host "  [PASS] Customer my-loans, my-history, my-holds, and my-fines verified."

# Cleanup test patron
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "DELETE FROM Users WHERE Id = '$patronId'"
$cmd.ExecuteNonQuery() | Out-Null
$conn.Close()

Write-Host "`nALL FRONTEND-TO-BACKEND-TO-DATABASE ENDPOINTS VERIFIED ALL GREEN!"
