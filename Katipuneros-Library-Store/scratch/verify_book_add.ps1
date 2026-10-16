# scratch/verify_book_add.ps1 -- Automated test for Admin Adding Book & Public Catalog Display
$ErrorActionPreference = "Stop"

Write-Host "1. Authenticating Chief Administrator on Port 5174..."
$adminLogin = @{
    identifier = "testadmin@katipuneros.edu.ph"
    password = "Password123!"
} | ConvertTo-Json

$adminAuth = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $adminLogin -ContentType "application/json" -Headers @{ "Origin" = "http://localhost:5174" }
if (-not $adminAuth.success -or $adminAuth.data.role -ne "Admin") {
    Write-Error "Admin authentication failed."
}
$adminToken = $adminAuth.data.token
Write-Host "   -> Admin authenticated! Token length: $($adminToken.Length)"

Write-Host "2. Fetching Catalog Categories..."
$catResp = Invoke-RestMethod -Uri "http://localhost:5000/api/categories" -Method GET
$categories = $catResp.data
if (-not $categories -or $categories.Count -eq 0) {
    Write-Error "No categories available."
}
$targetCategoryId = $categories[0].id
Write-Host "   -> Selected Category: '$($categories[0].name)' ($targetCategoryId)"

Write-Host "3. Creating New Book in Catalog..."
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$bookTitle = "El Filibusterismo - Centennial Volume $ts"
$bookAuthor = "Dr. Jose Rizal"
$isbn = "978-971-$ts"
$bay = "Filipiniana Stacks B-04"

$createBookPayload = @{
    title = $bookTitle
    author = $bookAuthor
    isbn = $isbn
    categoryId = $targetCategoryId
    publishedYear = 2026
    totalCopies = 5
    bayLocation = $bay
    description = "Special patriotic edition published for Katipuneros Library patrons."
    rfidTag = "RFID-$ts"
} | ConvertTo-Json

$createResp = Invoke-RestMethod -Uri "http://localhost:5000/api/books" -Method POST -Body $createBookPayload -ContentType "application/json" -Headers @{ 
    "Authorization" = "Bearer $adminToken"
    "Origin" = "http://localhost:5174" 
}

if (-not $createResp.success -or -not $createResp.data.id) {
    Write-Error "Failed to add book."
}
$newBookId = $createResp.data.id
Write-Host "   -> Book created with Id: $newBookId | Available Copies: $($createResp.data.availableCopies)"

Write-Host "4. Verifying Book Displays in Public Catalog..."
$catalogResp = Invoke-RestMethod -Uri "http://localhost:5000/api/books" -Method GET
$matchingBook = $catalogResp.data | Where-Object { $_.id -eq $newBookId }

if (-not $matchingBook) {
    Write-Error "Newly added book not found in public catalog."
}

if ($matchingBook.title -ne $bookTitle -or $matchingBook.availableCopies -ne 5) {
    Write-Error "Catalog book properties mismatch."
}

Write-Host "   -> Confirmed in public catalog: '$($matchingBook.title)' | Copies: $($matchingBook.availableCopies) | Bay: $($matchingBook.bayLocation)`n"
Write-Host "CRIT-02 ALL GREEN: Admin book addition and catalog display verified."
