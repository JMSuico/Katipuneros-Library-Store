$passwords = @("Password123!", "Admin123!", "Katipuneros123!", "TestPass123!")
$usernames = @("testadmin", "customadmin1", "SuicoJM99", "cashier1", "mariasantos")

foreach ($u in $usernames) {
    foreach ($p in $passwords) {
        $body = @{ username = $u; password = $p } | ConvertTo-Json
        try {
            $res = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
            Write-Host "FOUND: Username=$u Password=$p Role=$($res.data.role)" -ForegroundColor Green
            break
        } catch {
            # continue
        }
    }
}
