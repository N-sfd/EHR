# Start backend and frontend concurrently on Windows

Write-Host "Starting Staff Service Backend and Frontend..." -ForegroundColor Green
Write-Host "Backend will run on http://localhost:8080" -ForegroundColor Cyan
Write-Host "Frontend will run on http://localhost:4200" -ForegroundColor Cyan
Write-Host ""

# Start backend in a new window
Write-Host "Starting Backend (Spring Boot)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "mvn spring-boot:run" -WindowStyle Normal

# Give backend time to start
Start-Sleep -Seconds 3

# Start frontend in a new window
Write-Host "Starting Frontend (Angular)..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd frontend; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "Both applications are starting in separate windows." -ForegroundColor Green
Write-Host "Press Ctrl+C in each window to stop the services." -ForegroundColor Cyan
