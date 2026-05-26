# Build and run combined Admin + MyChart + API stack (Docker Compose)
param(
    [switch]$Down,
    [switch]$Logs
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed. Install Docker Desktop: https://www.docker.com/products/docker-desktop/"
}

if ($Down) {
    docker compose down
    exit 0
}

if ($Logs) {
    docker compose logs -f
    exit 0
}

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example — review passwords before exposing to the internet."
}

Write-Host "Building and starting EHR stack (first run may take several minutes)..."
docker compose up --build -d

$port = 8080
if (Test-Path ".env") {
    $line = Get-Content ".env" | Where-Object { $_ -match '^\s*APP_PORT\s*=' } | Select-Object -First 1
    if ($line -match '=\s*(\d+)') { $port = [int]$Matches[1] }
}

Write-Host ""
Write-Host "Combined deployment is up:"
Write-Host "  Admin portal:  http://localhost:${port}/"
Write-Host "  MyChart:       http://localhost:${port}/mychart/"
Write-Host "  API health:    http://localhost:${port}/api/health"
Write-Host ""
Write-Host "Logs:  .\deploy.ps1 -Logs"
Write-Host "Stop:  .\deploy.ps1 -Down"
