# PowerShell script to fix appointment table doctor_id column
# This must run BEFORE starting the backend

$ErrorActionPreference = "Stop"

Write-Host "Fixing appointment table: adding doctor_id column..." -ForegroundColor Green

# Database connection parameters
$dbHost = "localhost"
$dbPort = "5432"
$dbName = "staff_db"
$dbUser = "postgres"
$dbPassword = "postgres"

# Try to find psql
$psqlPath = $null
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\17\bin\psql.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $psqlPath = $path
        break
    }
}

if (-not $psqlPath) {
    Write-Host "ERROR: psql not found. Please install PostgreSQL or add it to PATH." -ForegroundColor Red
    Write-Host "Alternatively, run the SQL manually:" -ForegroundColor Yellow
    Write-Host "  psql -h localhost -U postgres -d staff_db -f FIX_APPOINTMENT_DOCTOR_ID.sql" -ForegroundColor Yellow
    exit 1
}

Write-Host "Executing FIX_APPOINTMENT_DOCTOR_ID.sql..." -ForegroundColor Green

$env:PGPASSWORD = $dbPassword
& $psqlPath -h $dbHost -p $dbPort -U $dbUser -d $dbName -f "FIX_APPOINTMENT_DOCTOR_ID.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSUCCESS: appointment table fixed. You can now start the backend." -ForegroundColor Green
} else {
    Write-Host "`nERROR: Failed to fix appointment table. Check the error messages above." -ForegroundColor Red
    exit 1
}

