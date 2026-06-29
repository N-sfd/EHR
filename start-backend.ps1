# Start Spring Boot API on http://localhost:8087 (required for frontend/MyChart dev proxies)
param(
    [switch]$Ollama,
    [string]$SpringProfiles = ""
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if ($Ollama) {
    $env:EHR_AI_ENABLED = "true"
    $env:EHR_AI_OLLAMA = "true"
    $env:EHR_AI_STREAMING = "true"
    if (-not $env:OLLAMA_CHAT_MODEL) { $env:OLLAMA_CHAT_MODEL = "llama3" }
    if (-not $SpringProfiles) { $SpringProfiles = "ollama" }
    Write-Host "AI: local Ollama mode (model $($env:OLLAMA_CHAT_MODEL))"
}

if (-not (Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue).TcpTestSucceeded) {
    Write-Error "PostgreSQL is not running on localhost:5432. Start the postgresql service, then retry."
}

$listener = Get-NetTCPConnection -LocalPort 8087 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) {
    $procId = $listener.OwningProcess
    try {
        $health = Invoke-WebRequest -Uri "http://localhost:8087/api/health" -TimeoutSec 3 -UseBasicParsing
        if ($health.StatusCode -eq 200) {
            Write-Host "Backend already running at http://localhost:8087 (PID $procId). Do not run mvn spring-boot:run again."
            Write-Host "To restart: .\stop-backend.ps1  then  .\start-backend.ps1"
            exit 0
        }
    } catch {
        Write-Warning "Port 8087 is used by PID $procId but /api/health did not respond. Run .\stop-backend.ps1 then start again."
        exit 1
    }
}

$mvnArgs = @("spring-boot:run")
if ($SpringProfiles) {
    $mvnArgs += "-Dspring-boot.run.profiles=$SpringProfiles"
}

Write-Host "Starting staff-service API on port 8087..."
if (Get-Command mvn -ErrorAction SilentlyContinue) {
    mvn @mvnArgs
} else {
    & "$PSScriptRoot\mvnw.cmd" @mvnArgs
}
