$body = @{
    rating = 4
    comments = "The digital catalog and smart reservation lockers are incredible!"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "http://localhost:5000/api/feedback" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Success:" ($res | ConvertTo-Json)
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "Error:" $reader.ReadToEnd()
}

$getFeedbacks = Invoke-RestMethod -Uri "http://localhost:5000/api/feedback" -Method Get
Write-Host "Feedbacks Count:" $getFeedbacks.data.Count
