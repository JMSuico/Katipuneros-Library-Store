param(
    [Parameter(Position=0)]
    [ValidateSet("build", "up", "down", "status", "logs", "restart")]
    [string]$Command = "status"
)

$ComposeFile = Join-Path $PSScriptRoot "docker-compose.yml"
$OverrideFile = Join-Path $PSScriptRoot "docker-compose.override.yml"

function Run-Compose($argsList) {
    docker compose -f $ComposeFile -f $OverrideFile @argsList
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
