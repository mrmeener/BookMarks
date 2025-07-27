param(
    [string]$SourcePath = "$env:LOCALAPPDATA\Temp\BookMarkManager",
    [string]$DestinationPath = $PSScriptRoot
)

Write-Host "Starting user bookmark copy process..." -ForegroundColor Cyan
Write-Host "Source: $SourcePath" -ForegroundColor Gray
Write-Host "Destination: $DestinationPath" -ForegroundColor Gray

if (-not (Test-Path $SourcePath)) {
    Write-Host "ERROR: Source directory not found: $SourcePath" -ForegroundColor Red
    exit 1
}

$filesProcessed = 0

# Copy user-bookmarks.js
$jsSource = Join-Path $SourcePath "user-bookmarks.js"
$jsDest = Join-Path $DestinationPath "user-bookmarks.js"

if (Test-Path $jsSource) {
    Copy-Item $jsSource -Destination $jsDest -Force
    Write-Host "Copied user-bookmarks.js" -ForegroundColor Green
    $filesProcessed++
}

# Copy user-bookmarks.json
$jsonSource = Join-Path $SourcePath "user-bookmarks.json"
$jsonDest = Join-Path $DestinationPath "user-bookmarks.json"

if (Test-Path $jsonSource) {
    Copy-Item $jsonSource -Destination $jsonDest -Force
    Write-Host "Copied user-bookmarks.json" -ForegroundColor Green
    $filesProcessed++
}

Write-Host "Files processed: $filesProcessed" -ForegroundColor Green
Write-Host "Copy process completed!" -ForegroundColor Green
