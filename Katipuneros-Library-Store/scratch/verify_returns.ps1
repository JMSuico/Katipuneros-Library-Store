# scratch/verify_returns.ps1 -- Automated test for Book Return & Copy Count Restoration
$ErrorActionPreference = "Stop"

Write-Host "1. Authenticating Admin on Port 5174..."
$adminLogin = @{ identifier = "testadmin@katipuneros.edu.ph"; password = "Password123!" } | ConvertTo-Json
$adminAuth = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $adminLogin -ContentType "application/json" -Headers @{ "Origin" = "http://localhost:5174" }
$adminToken = $adminAuth.data.token

Write-Host "2. Creating a Fresh Book for Circulation Testing..."
$catResp = Invoke-RestMethod -Uri "http://localhost:5000/api/categories" -Method GET
$catId = $catResp.data[0].id
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$isbn = "978-CIRC-$ts"

$bookPayload = @{
    title = "Circulation Protocol & Returns Testing $ts"
    author = "Hermano Pule"
    isbn = $isbn
    categoryId = $catId
    publishedYear = 2026
    totalCopies = 3
    bayLocation = "Circulation Shelf C-01"
} | ConvertTo-Json

$bookResp = Invoke-RestMethod -Uri "http://localhost:5000/api/books" -Method POST -Body $bookPayload -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }
$bookId = $bookResp.data.id
$barcode = $bookResp.data.isbnBarcode
if (-not $barcode) { $barcode = $isbn }
Write-Host "   -> Book Created! Id: $bookId | Initial Copies: $($bookResp.data.availableCopies) | Barcode: $barcode"

Write-Host "3. Creating Patron Account..."
$patronPayload = @{
    firstName = "Circulation"
    lastName = "Patron"
    email = "circ_patron_$ts@katipuneros.edu.ph"
    username = "circ_patron_$ts"
    password = "PatronPass2026!"
    employmentStatus = "Student"
    currentAddress = "Tayabas, Quezon"
    permanentAddress = "Tayabas, Quezon"
} | ConvertTo-Json
$patronResp = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $patronPayload -ContentType "application/json"
$patronId = $patronResp.data.userId
Write-Host "   -> Patron Created! Id: $patronId"

Write-Host "4. Checking Out Book to Patron..."
$checkoutPayload = @{
    patronId = $patronId
    bookBarcodes = @($barcode)
    dueDate = (Get-Date).AddDays(14).ToString("o")
} | ConvertTo-Json

$checkoutResp = Invoke-RestMethod -Uri "http://localhost:5000/api/borrow/checkout" -Method POST -Body $checkoutPayload -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }
if (-not $checkoutResp.success) {
    Write-Error "Checkout failed."
}
Write-Host "   -> Checkout successful! Transactions count: $($checkoutResp.data.Count)"

Write-Host "5. Verifying Available Copies Decremented..."
$postCheckoutBook = Invoke-RestMethod -Uri "http://localhost:5000/api/books/$bookId" -Method GET
$copiesAfterCheckout = $postCheckoutBook.data.availableCopies
Write-Host "   -> Copies after checkout: $copiesAfterCheckout (Expected: 2)"
if ($copiesAfterCheckout -ne 2) {
    Write-Error "Available copies did not decrement after checkout."
}

Write-Host "6. Returning Book via Circulation Desk..."
$returnPayload = @{
    barcode = $barcode
    conditionNotes = "Returned in pristine condition."
    damageFee = 0
} | ConvertTo-Json

$returnResp = Invoke-RestMethod -Uri "http://localhost:5000/api/borrow/return" -Method POST -Body $returnPayload -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $adminToken"; "Origin" = "http://localhost:5174" }
if (-not $returnResp.success) {
    Write-Error "Return failed."
}
Write-Host "   -> Return processed successfully! Clearance: $($returnResp.data.clearanceStatus)"

Write-Host "7. Verifying Book Copies Restored in Catalog..."
$postReturnBook = Invoke-RestMethod -Uri "http://localhost:5000/api/books/$bookId" -Method GET
$copiesAfterReturn = $postReturnBook.data.availableCopies
Write-Host "   -> Copies after return: $copiesAfterReturn (Expected: 3)"
if ($copiesAfterReturn -ne 3) {
    Write-Error "Available copies was not restored to initial level after return. Actual: $copiesAfterReturn"
}

Write-Host "`nCRIT-05 ALL GREEN: Book checkout, return, and catalog copy count recovery verified."
