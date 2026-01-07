# Script to set up PowerShell profile with Java 21
# Run this once: .\setup-java-profile.ps1

$profilePath = Split-Path $PROFILE -Parent

# Create profile directory if it doesn't exist
if (-not (Test-Path $profilePath)) {
    New-Item -ItemType Directory -Path $profilePath -Force | Out-Null
    Write-Host "Created profile directory: $profilePath" -ForegroundColor Green
}

# Check if Java 21 exists
$java21Path = "E:\Program Files\Java\jdk-21"
if (-not (Test-Path $java21Path)) {
    Write-Host "ERROR: Java 21 not found at: $java21Path" -ForegroundColor Red
    Write-Host "Please update the path in this script to point to your Java 21 installation." -ForegroundColor Yellow
    exit 1
}

# Create or update profile
$profileContent = @"
# Set JAVA_HOME to Java 21 (required for Spring Boot 3.x)
`$env:JAVA_HOME = "$java21Path"
`$env:PATH = "`$env:JAVA_HOME\bin;`$env:PATH"

# Remove any Java 8 from PATH if present
`$env:PATH = (`$env:PATH -split ';' | Where-Object { `$_ -notlike "*jdk1.8*" }) -join ';'

Write-Host "JAVA_HOME set to: `$env:JAVA_HOME" -ForegroundColor Green
"@

# Check if profile already exists and has Java configuration
if (Test-Path $PROFILE) {
    $existingContent = Get-Content $PROFILE -Raw
    if ($existingContent -match "JAVA_HOME") {
        Write-Host "Profile already contains JAVA_HOME configuration." -ForegroundColor Yellow
        Write-Host "Backing up existing profile to: `$PROFILE.backup" -ForegroundColor Yellow
        Copy-Item $PROFILE "$PROFILE.backup" -Force
        
        # Remove old JAVA_HOME lines and add new ones
        $lines = Get-Content $PROFILE | Where-Object { 
            $_ -notmatch "JAVA_HOME" -and 
            $_ -notmatch "jdk1.8" -and
            $_ -notmatch "Set JAVA_HOME"
        }
        $lines + $profileContent | Set-Content $PROFILE
        Write-Host "Updated profile with Java 21 configuration." -ForegroundColor Green
    } else {
        Add-Content -Path $PROFILE -Value "`n$profileContent"
        Write-Host "Added Java 21 configuration to existing profile." -ForegroundColor Green
    }
} else {
    Set-Content -Path $PROFILE -Value $profileContent
    Write-Host "Created new profile with Java 21 configuration." -ForegroundColor Green
}

Write-Host "`nProfile setup complete! Restart PowerShell or run: . `$PROFILE" -ForegroundColor Cyan
Write-Host "To verify, run: mvn -version" -ForegroundColor Cyan

