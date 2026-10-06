$loginBody = @{
    email = "admin@katipuneros.edu.ph"
    password = "Admin@2026!"
} | ConvertTo-Json

try {
    $loginRes = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginRes.data.token
    Write-Host "Admin Login Successful! Role:" $loginRes.data.role

    $headers = @{
        Authorization = "Bearer $token"
    }

    $inquiries = Invoke-RestMethod -Uri "http://localhost:5000/api/contact/inquiries" -Method Get -Headers $headers
    Write-Host "Inquiries Count:" $inquiries.data.Count
    Write-Host "Latest Inquiry Subject:" $inquiries.data[0].subject

    $auditLogs = Invoke-RestMethod -Uri "http://localhost:5000/api/audit/logs" -Method Get -Headers $headers
    Write-Host "Audit Logs Count:" $auditLogs.data.Count

    $verifyChain = Invoke-RestMethod -Uri "http://localhost:5000/api/audit/verify-chain" -Method Get -Headers $headers
    Write-Host "Audit Chain Integrity:" $verifyChain.data.statusMessage

    $users = Invoke-RestMethod -Uri "http://localhost:5000/api/users" -Method Get -Headers $headers
    Write-Host "Registered Users Count:" $users.data.Count
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "Error:" $reader.ReadToEnd()
}
