# Set JAVA_HOME to Java 21 for this session
$env:JAVA_HOME = "E:\Program Files\Java\jdk-21"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

Write-Host "JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Green
Write-Host "Java version:" -ForegroundColor Green
java -version

