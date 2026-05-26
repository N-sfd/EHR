# Fix Admin Login Script
# This script will help you fix the admin login issue by running the SQL fix script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Admin Login Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is accessible
Write-Host "Checking PostgreSQL connection..." -ForegroundColor Yellow
$pgTest = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue

if (-not $pgTest.TcpTestSucceeded) {
    Write-Host "✗ ERROR: Cannot connect to PostgreSQL on localhost:5432" -ForegroundColor Red
    Write-Host "  Please ensure PostgreSQL is running." -ForegroundColor Red
    Write-Host ""
    Write-Host "To start PostgreSQL (if installed as service):" -ForegroundColor Yellow
    Write-Host "  net start postgresql-x64-16" -ForegroundColor Gray
    Write-Host "  (or check Services app for PostgreSQL service name)" -ForegroundColor Gray
    exit 1
}

Write-Host "✓ PostgreSQL is accessible" -ForegroundColor Green
Write-Host ""

# Database connection details
$dbName = "staff_db"
$dbUser = "postgres"
$dbHost = "localhost"
$dbPort = "5432"

Write-Host "Database Configuration:" -ForegroundColor Yellow
Write-Host "  Database: $dbName" -ForegroundColor Gray
Write-Host "  User: $dbUser" -ForegroundColor Gray
Write-Host "  Host: $dbHost" -ForegroundColor Gray
Write-Host "  Port: $dbPort" -ForegroundColor Gray
Write-Host ""

# Prompt for password
$dbPassword = Read-Host "Enter PostgreSQL password for user '$dbUser'" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
)

Write-Host ""
Write-Host "Running SQL fix script..." -ForegroundColor Yellow

# Set PGPASSWORD environment variable for psql
$env:PGPASSWORD = $dbPasswordPlain

# Run the SQL script
$sqlFile = Join-Path $PSScriptRoot "FIX_ADMIN_LOGIN_COMPLETE.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "✗ ERROR: SQL file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

try {
    $result = & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $sqlFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓✓✓ SQL script executed successfully! ✓✓✓" -ForegroundColor Green
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  Login Credentials" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  Username: admin" -ForegroundColor White
        Write-Host "  Password: password" -ForegroundColor White
        Write-Host ""
        Write-Host "You can now try logging in again." -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✗ ERROR: SQL script execution failed" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "✗ ERROR: Failed to execute SQL script" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} finally {
    # Clear password from environment
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

