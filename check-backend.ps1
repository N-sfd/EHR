# Quick script to check if backend is running
Write-Host "Checking backend status..." -ForegroundColor Cyan

$portCheck = netstat -ano | findstr :8087
if ($portCheck) {
    Write-Host "`n✓ Backend is running on port 8087!" -ForegroundColor Green
    Write-Host $portCheck
} else {
    Write-Host "`n✗ Backend is NOT running on port 8087" -ForegroundColor Red
    Write-Host "`nTo start the backend, run:" -ForegroundColor Yellow
    Write-Host "  .\start-backend.ps1" -ForegroundColor Cyan
    Write-Host "`nOr in a new PowerShell window:" -ForegroundColor Yellow
    Write-Host '  mvn spring-boot:run' -ForegroundColor Cyan
}

