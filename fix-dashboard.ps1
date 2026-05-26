# Fix Dashboard Error Script
# This script will link patient users to patient records so the dashboard works

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Dashboard Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is accessible
Write-Host "Checking PostgreSQL connection..." -ForegroundColor Yellow
$pgTest = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue

if (-not $pgTest.TcpTestSucceeded) {
    Write-Host "✗ ERROR: Cannot connect to PostgreSQL on localhost:5432" -ForegroundColor Red
    Write-Host "  Please ensure PostgreSQL is running." -ForegroundColor Red
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
Write-Host ""

# Prompt for password
$dbPassword = Read-Host "Enter PostgreSQL password for user '$dbUser'" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
)

Write-Host ""
Write-Host "Running dashboard fix script..." -ForegroundColor Yellow

# Set PGPASSWORD environment variable for psql
$env:PGPASSWORD = $dbPasswordPlain

# Run the SQL script
$sqlFile = Join-Path $PSScriptRoot "FIX_PATIENT_USER_LINK.sql"

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
        Write-Host "  IMPORTANT NEXT STEPS" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. LOGOUT from the application" -ForegroundColor Yellow
        Write-Host "2. LOGIN again as patient1 / password" -ForegroundColor Yellow
        Write-Host "3. The dashboard should now work!" -ForegroundColor Green
        Write-Host ""
        Write-Host "The session needs to be recreated with the new patient_id link." -ForegroundColor Gray
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

