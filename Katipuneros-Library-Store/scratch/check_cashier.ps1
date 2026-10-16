$passwords = @("Password123!", "Cashier123!", "Staff123!", "123456", "testpass")
foreach ($p in $passwords) {
    $body = @{ username = "testcashier"; password = $p } | ConvertTo-Json
    try {
        $res = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
        Write-Host "FOUND: Username=testcashier Password=$p Role=$($res.data.role)" -ForegroundColor Green
        break
    } catch {}
}
