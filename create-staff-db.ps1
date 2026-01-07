# PowerShell script to create staff_db database
# Make sure PostgreSQL is running and accessible

Write-Host "=== Creating staff_db Database ===" -ForegroundColor Cyan
Write-Host ""

# Try to find psql in common locations
$psqlPaths = @(
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "E:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe",
    "C:\Program Files\PostgreSQL\12\bin\psql.exe",
    "C:\Program Files\PostgreSQL\11\bin\psql.exe"
)

$psql = $null
foreach ($path in $psqlPaths) {
    if (Test-Path $path) {
        $psql = $path
        break
    }
}

if ($null -eq $psql) {
    Write-Host "PostgreSQL psql not found in common locations." -ForegroundColor Red
    Write-Host "Please create the database manually using one of these methods:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Method 1: Using pgAdmin" -ForegroundColor Cyan
    Write-Host "  1. Open pgAdmin"
    Write-Host "  2. Right-click on 'Databases'"
    Write-Host "  3. Select 'Create' > 'Database'"
    Write-Host "  4. Enter database name: staff_db"
    Write-Host "  5. Click 'Save'"
    Write-Host ""
    Write-Host "Method 2: Using SQL Command" -ForegroundColor Cyan
    Write-Host "  Connect to PostgreSQL and run: CREATE DATABASE staff_db;"
    Write-Host ""
    Write-Host "Method 3: Add PostgreSQL to PATH" -ForegroundColor Cyan
    Write-Host "  Add PostgreSQL bin directory to your system PATH, then run:"
    Write-Host "  psql -U postgres -c 'CREATE DATABASE staff_db;'"
    exit 1
}

Write-Host "Found PostgreSQL at: $psql" -ForegroundColor Green
Write-Host ""

# Check if database already exists
Write-Host "Checking if database already exists..." -ForegroundColor Yellow
$env:PGPASSWORD = "postgres"
$dbCheck = & $psql -U postgres -lqt 2>&1 | Select-String "staff_db"

if ($null -ne $dbCheck -and $dbCheck.ToString().Trim() -ne "") {
    Write-Host "Database 'staff_db' already exists!" -ForegroundColor Green
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    exit 0
}

Write-Host "Database 'staff_db' not found. Creating..." -ForegroundColor Yellow
Write-Host ""

# Prompt for password
$password = Read-Host "Enter PostgreSQL password for user 'postgres' (default: postgres)" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
if ([string]::IsNullOrWhiteSpace($plainPassword)) {
    $plainPassword = "postgres"
}
$env:PGPASSWORD = $plainPassword

# Create the database
Write-Host "Creating database 'staff_db'..." -ForegroundColor Yellow
$result = & $psql -U postgres -c "CREATE DATABASE staff_db;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Database 'staff_db' created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Start the backend service: cd backend && mvn spring-boot:run" -ForegroundColor White
    Write-Host "  2. Or use: .\start-backend.ps1" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "✗ Failed to create database. Error code: $LASTEXITCODE" -ForegroundColor Red
    if ($result) {
        Write-Host "Error details: $result" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Alternative methods:" -ForegroundColor Yellow
    Write-Host "  1. Using pgAdmin: Right-click Databases > Create > Database > Name: staff_db" -ForegroundColor White
    Write-Host "  2. Using SQL: psql -U postgres -c 'CREATE DATABASE staff_db;'" -ForegroundColor White
}

# Clear password from environment
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue

