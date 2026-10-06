$challengeObj = Invoke-RestMethod -Uri "http://localhost:5000/api/altcha/challenge" -Method Get
Write-Host "Received Challenge:"
Write-Host "  Algorithm:" $challengeObj.algorithm
Write-Host "  Challenge:" $challengeObj.challenge
Write-Host "  Salt:     " $challengeObj.salt
Write-Host "  MaxNumber:" $challengeObj.maxnumber

$sha256 = [System.Security.Cryptography.SHA256]::Create()
$target = $challengeObj.challenge.ToLower()
$salt = $challengeObj.salt
$foundNumber = -1

Write-Host "Solving Proof-of-Work challenge in background..."
$sw = [System.Diagnostics.Stopwatch]::StartNew()

for ($n = 0; $n -le $challengeObj.maxnumber; $n++) {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes("$salt$n")
    $hashBytes = $sha256.ComputeHash($bytes)
    $hex = -join ($hashBytes | ForEach-Object { $_.ToString("x2") })
    if ($hex -eq $target) {
        $foundNumber = $n
        break
    }
}

$sw.Stop()
Write-Host "Solved in $($sw.ElapsedMilliseconds) ms! Number found: $foundNumber"

if ($foundNumber -ge 0) {
    $payloadObj = @{
        algorithm = $challengeObj.algorithm
        challenge = $challengeObj.challenge
        number    = $foundNumber
        salt      = $challengeObj.salt
        signature = $challengeObj.signature
    }
    $json = $payloadObj | ConvertTo-Json -Compress
    $base64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($json))

    Write-Host "Sending ALTCHA solution to /api/altcha/verify..."
    $body = @{ payload = $base64 } | ConvertTo-Json
    $verifyRes = Invoke-RestMethod -Uri "http://localhost:5000/api/altcha/verify" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Verification Result:" ($verifyRes | ConvertTo-Json)
} else {
    Write-Host "Failed to find PoW solution within maxnumber!"
}
