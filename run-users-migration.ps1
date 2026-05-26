# PowerShell script to manually run the users table creation SQL
# This will create the users table directly in PostgreSQL

Write-Host "Creating users table in PostgreSQL..." -ForegroundColor Cyan

$sqlFile = "create-users-table-manual.sql"
$dbName = "staff_db"
$dbUser = "postgres"
$dbPassword = "postgres"

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "ERROR: psql command not found. Please ensure PostgreSQL is installed and in your PATH." -ForegroundColor Red
    exit 1
}

# Check if SQL file exists
if (-not (Test-Path $sqlFile)) {
    Write-Host "ERROR: SQL file '$sqlFile' not found!" -ForegroundColor Red
    exit 1
}

# Set PGPASSWORD environment variable for psql
$env:PGPASSWORD = $dbPassword

# Run the SQL file
Write-Host "Executing SQL file: $sqlFile" -ForegroundColor Yellow
psql -U $dbUser -d $dbName -f $sqlFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSUCCESS: Users table created successfully!" -ForegroundColor Green
    Write-Host "You can now restart the backend and try logging in." -ForegroundColor Green
} else {
    Write-Host "`nERROR: Failed to create users table. Check the error messages above." -ForegroundColor Red
    exit 1
}

# Clear password from environment
Remove-Item Env:\PGPASSWORD

