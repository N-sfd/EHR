# Start Spring Boot API on http://localhost:8087 (required for frontend/MyChart dev proxies)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue).TcpTestSucceeded) {
    Write-Error "PostgreSQL is not running on localhost:5432. Start the postgresql service, then retry."
}

$listener = Get-NetTCPConnection -LocalPort 8087 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) {
    $pid = $listener.OwningProcess
    try {
        $health = Invoke-WebRequest -Uri "http://localhost:8087/api/health" -TimeoutSec 3 -UseBasicParsing
        if ($health.StatusCode -eq 200) {
            Write-Host "Backend already running at http://localhost:8087 (PID $pid). Do not run mvn spring-boot:run again."
            Write-Host "To restart: .\stop-backend.ps1  then  mvn spring-boot:run"
            exit 0
        }
    } catch {
        Write-Warning "Port 8087 is used by PID $pid but /api/health did not respond. Run .\stop-backend.ps1 then start again."
        exit 1
    }
}

Write-Host "Starting staff-service API on port 8087..."
if (Get-Command mvn -ErrorAction SilentlyContinue) {
    mvn spring-boot:run
} else {
    & "$PSScriptRoot\mvnw.cmd" spring-boot:run
}
