# Start Backend Service
# This script ensures Java 21 is used and starts the Spring Boot application

Write-Host "Starting Staff Service Backend..." -ForegroundColor Cyan

# Ensure Java 21 is set (in case profile wasn't loaded)
$javaHome = "E:\Program Files\Java\jdk-21"

if (-not (Test-Path $javaHome)) {
    Write-Host "ERROR: Java 21 not found at $javaHome" -ForegroundColor Red
    Write-Host "Please install Java 21 or update the path in this script." -ForegroundColor Yellow
    exit 1
}

$env:JAVA_HOME = $javaHome
# Prepend Java bin to PATH to ensure it's used first
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Verify Java version
Write-Host "`nJava Version:" -ForegroundColor Yellow
$javaVersion = java -version 2>&1 | Select-Object -First 1
Write-Host $javaVersion

# Verify Maven is using correct Java
Write-Host "`nMaven Java Version:" -ForegroundColor Yellow
$mvnVersionOutput = mvn -version 2>&1 | Out-String
$mvnJava = $mvnVersionOutput | Select-String "Java version"
Write-Host $mvnJava

# Check if Maven is using Java 8 or older (class file version 52.0 or lower)
if ($mvnJava -match "1\.8|8\.0|52\.0|1\.7|7\.0|51\.0") {
    Write-Host "`nERROR: Maven is using Java 8 or older!" -ForegroundColor Red
    Write-Host "Spring Boot 3.5.8 requires Java 17 or higher." -ForegroundColor Yellow
    Write-Host "Current JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Cyan
    Write-Host "`nPlease ensure:" -ForegroundColor Yellow
    Write-Host "  1. Java 17+ is installed" -ForegroundColor White
    Write-Host "  2. JAVA_HOME points to Java 17+ installation" -ForegroundColor White
    Write-Host "  3. Java bin directory is in PATH before any Java 8 paths" -ForegroundColor White
    exit 1
}

# Verify Java version is 17 or higher
$javaVersionMatch = $javaVersion | Select-String -Pattern 'version\s+"(\d+)'
if ($javaVersionMatch) {
    $majorVersion = [int]$javaVersionMatch.Matches[0].Groups[1].Value
    if ($majorVersion -lt 17) {
        Write-Host "`nERROR: Java version $majorVersion is too old!" -ForegroundColor Red
        Write-Host "Spring Boot 3.5.8 requires Java 17 or higher." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "`nStarting Spring Boot application..." -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:8087" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Yellow

# Start the application
mvn spring-boot:run

