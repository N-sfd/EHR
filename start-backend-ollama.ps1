# Start API with local Ollama (OpenAI-compatible client at http://localhost:11434/v1)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$ollamaUrl = if ($env:OLLAMA_BASE_URL) { $env:OLLAMA_BASE_URL } else { "http://localhost:11434" }
$model = if ($env:OLLAMA_CHAT_MODEL) { $env:OLLAMA_CHAT_MODEL } else { "llama3" }

Write-Host "Checking Ollama at $ollamaUrl ..."
try {
    $tags = Invoke-RestMethod -Uri "$ollamaUrl/api/tags" -TimeoutSec 5
    $names = @($tags.models | ForEach-Object { $_.name })
    if ($names.Count -eq 0) {
        Write-Warning "Ollama is running but no models are installed. Run: ollama pull $model"
    } elseif ($names -notcontains $model -and ($names | Where-Object { $_ -like "$model*" }).Count -eq 0) {
        Write-Warning "Model '$model' not found. Installed: $($names -join ', ')"
        Write-Warning "Pull it with: ollama pull $model"
    } else {
        Write-Host "Ollama OK. Models: $($names -join ', ')"
    }
} catch {
    Write-Error "Ollama is not reachable at $ollamaUrl. Start it with: ollama serve"
}

$env:EHR_AI_ENABLED = "true"
$env:EHR_AI_OLLAMA = "true"
$env:EHR_AI_STREAMING = "true"
if (-not $env:OLLAMA_CHAT_MODEL) { $env:OLLAMA_CHAT_MODEL = $model }

& "$PSScriptRoot\start-backend.ps1" -SpringProfiles "ollama"
