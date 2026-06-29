# Stop the process listening on port 8087 (staff-service API)
$conn = Get-NetTCPConnection -LocalPort 8087 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $conn) {
    Write-Host "No process is listening on port 8087."
    exit 0
}

$processId = $conn.OwningProcess
$proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
Write-Host "Stopping PID $processId ($($proc.ProcessName))..."
Stop-Process -Id $processId -Force
Write-Host "Port 8087 is free. Run: mvn spring-boot:run"
