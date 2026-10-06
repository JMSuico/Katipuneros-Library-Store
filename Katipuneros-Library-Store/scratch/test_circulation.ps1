# 1. Login as Patron
$patronLogin = @{
    email = "patron@katipuneros.edu.ph"
    password = "Patron@2026!"
} | ConvertTo-Json
$patronRes = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $patronLogin -ContentType "application/json"
$patronToken = $patronRes.data.token
$patronHeaders = @{ Authorization = "Bearer $patronToken" }
Write-Host "Patron Logged In:" $patronRes.data.fullName

# 2. Get first book ID
$booksRes = Invoke-RestMethod -Uri "http://localhost:5000/api/books" -Method Get
$book = $booksRes.data[0]
Write-Host "Reserving Book:" $book.title "ID:" $book.id

# 3. Patron places reservation hold
$reserveBody = @{
    bookId = $book.id
    pickupBranch = "Katipunan Main Library - Ground Floor Lockers"
} | ConvertTo-Json
$reserveRes = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations" -Method Post -Body $reserveBody -Headers $patronHeaders -ContentType "application/json"
Write-Host "Reservation Status:" $reserveRes.message "Reservation ID:" $reserveRes.data.id

# 4. Login as Cashier
$cashierLogin = @{
    email = "cashier@katipuneros.edu.ph"
    password = "Cashier@2026!"
} | ConvertTo-Json
$cashierRes = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $cashierLogin -ContentType "application/json"
$cashierToken = $cashierRes.data.token
$cashierHeaders = @{ Authorization = "Bearer $cashierToken" }
Write-Host "Cashier Logged In:" $cashierRes.data.fullName

# 5. Cashier views pending queue
$queue = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations/pending" -Method Get -Headers $cashierHeaders
Write-Host "Pending Queue Count:" $queue.data.Count

# 6. Cashier assigns locker
$assignBody = @{
    lockerBay = "Bay-B4"
    pin = "4829"
} | ConvertTo-Json
$assignRes = Invoke-RestMethod -Uri "http://localhost:5000/api/reservations/$($reserveRes.data.id)/assign-locker" -Method Post -Body $assignBody -Headers $cashierHeaders -ContentType "application/json"
Write-Host "Locker Staging Result:" $assignRes.message
