$body = @{
    name = "Juan Dela Cruz"
    email = "juan.delacruz@gmail.com"
    subject = "Book Inquiry"
    message = "Do you have El Filibusterismo in stock?"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "http://localhost:5000/api/contact" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Success:" ($res | ConvertTo-Json)
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    Write-Host "Error:" $reader.ReadToEnd()
}
