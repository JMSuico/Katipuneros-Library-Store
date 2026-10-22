param(
    [Parameter(Position=0)]
    [ValidateSet("build", "up", "down", "status", "logs", "restart")]
    [string]$Command = "status"
)

$ComposeFile = Join-Path $PSScriptRoot "docker-compose.yml"
$OverrideFile = Join-Path $PSScriptRoot "docker-compose.override.yml"
$EnvFile = Join-Path $PSScriptRoot ".env"

function Run-Compose($argsList) {
    if (-not (Test-Path $EnvFile)) {
        Write-Host "[!] Notice: docker/.env file not found. Creating from .env.example with secure development defaults..." -ForegroundColor Yellow
        $exampleFile = Join-Path $PSScriptRoot ".env.example"
        if (Test-Path $exampleFile) {
            $content = Get-Content $exampleFile -Raw
            $content = $content -replace '<choose-a-strong-password>', 'KatipunerosDevPass2026!'
            $content = $content -replace '<choose-a-different-strong-password>', 'KatipunerosReplPass2026!'
            $content = $content -replace '<openssl rand -base64 48>', 'Katipuneros_Dev_Jwt_Secret_Key_At_Least_64_Characters_Long_For_Security_2026_Prod_Standard'
            $content = $content -replace '<openssl rand -base64 32>', 'Katipuneros_Dev_Altcha_Secret_Key_32_Bytes_Long_2026'
            Set-Content -Path $EnvFile -Value $content -Encoding utf8
            Write-Host "[OK] Created docker/.env with development defaults." -ForegroundColor Green
        }
    }
    docker compose --env-file $EnvFile -f $ComposeFile -f $OverrideFile @argsList
}

switch ($Command) {
    "build" {
        Write-Host "Building all 8 layer Docker containers..." -ForegroundColor Cyan
        Run-Compose @("build")
    }
    "up" {
        Write-Host "Starting all 8 Katipuneros services in background..." -ForegroundColor Green
        Run-Compose @("up", "-d")
    }
    "down" {
        Write-Host "Stopping and removing all 8 Katipuneros services..." -ForegroundColor Yellow
        Run-Compose @("down")
    }
    "restart" {
        Write-Host "Restarting all services..." -ForegroundColor Cyan
        Run-Compose @("restart")
    }
    "logs" {
        Run-Compose @("logs", "-f", "--tail=100")
    }
    "status" {
        Write-Host "==========================================================" -ForegroundColor Cyan
        Write-Host " KATIPUNEROS 8-LAYER DOCKER COMPOSE STATUS" -ForegroundColor Cyan
        Write-Host "==========================================================" -ForegroundColor Cyan
        Run-Compose @("ps")
    }
}
