# scratch/verify_wishlist.ps1 -- Automated test runner for Patron Wishlist & Favorite Books
$ErrorActionPreference = "Stop"

node scratch/verify_wishlist.mjs
if ($LASTEXITCODE -ne 0) {
    Write-Error "Wishlist verification failed."
}
