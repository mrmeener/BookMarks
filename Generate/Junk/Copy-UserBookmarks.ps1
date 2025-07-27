param(
    [string]$SourcePath = "$env:LOCALAPPDATA\Temp\BookMarkManager",
    [string]$DestinationPath = $PSScriptRoot
)

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

Write-ColorOutput "Starting user bookmark copy process..." "Cyan"
Write-ColorOutput "Current user: $env:USERNAME" "Gray"
Write-ColorOutput "Source path: $SourcePath" "Gray"
Write-ColorOutput "Destination path: $DestinationPath" "Gray"

if (-not (Test-Path $SourcePath)) {
    Write-ColorOutput "ERROR: Source directory not found: $SourcePath" "Red"
    Write-ColorOutput "Please run Import-BrowserBookmarks.ps1 first to generate the bookmark files." "Yellow"
    exit 1
}

if (-not (Test-Path $DestinationPath)) {
    Write-ColorOutput "Creating destination directory: $DestinationPath" "Yellow"
    New-Item -Path $DestinationPath -ItemType Directory -Force | Out-Null
}

$filesProcessed = 0
$errors = 0

# Copy user-bookmarks.js
$jsSourceFile = Join-Path $SourcePath "user-bookmarks.js"
$jsDestFile = Join-Path $DestinationPath "user-bookmarks.js"

if (Test-Path $jsSourceFile) {
    try {
        if (Test-Path $jsDestFile) {
            $backupFile = Join-Path $DestinationPath "user-bookmarks.js.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
            Copy-Item $jsDestFile -Destination $backupFile -Force
            Write-ColorOutput "Created backup: $(Split-Path $backupFile -Leaf)" "Yellow"
        }
        Copy-Item $jsSourceFile -Destination $jsDestFile -Force
        Write-ColorOutput "✓ Copied user-bookmarks.js successfully" "Green"
        $filesProcessed++
    }
    catch {
        Write-ColorOutput "ERROR: Failed to copy user-bookmarks.js - $_" "Red"
        $errors++
    }
}
else {
    Write-ColorOutput "WARNING: user-bookmarks.js not found in source directory" "Yellow"
}

# Copy user-bookmarks.json
$jsonSourceFile = Join-Path $SourcePath "user-bookmarks.json"
$jsonDestFile = Join-Path $DestinationPath "user-bookmarks.json"

if (Test-Path $jsonSourceFile) {
    try {
        if (Test-Path $jsonDestFile) {
            $backupFile = Join-Path $DestinationPath "user-bookmarks.json.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
            Copy-Item $jsonDestFile -Destination $backupFile -Force
            Write-ColorOutput "Created backup: $(Split-Path $backupFile -Leaf)" "Yellow"
        }
        Copy-Item $jsonSourceFile -Destination $jsonDestFile -Force
        Write-ColorOutput "✓ Copied user-bookmarks.json successfully" "Green"
        $filesProcessed++
    }
    catch {
        Write-ColorOutput "ERROR: Failed to copy user-bookmarks.json - $_" "Red"
        $errors++
    }
}
else {
    Write-ColorOutput "WARNING: user-bookmarks.json not found in source directory" "Yellow"
}

# Copy log file if it exists
$logFiles = Get-ChildItem -Path $SourcePath -Filter "import-log-*.txt" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($logFiles) {
    $logDestFile = Join-Path $DestinationPath "latest-import.log"
    try {
        Copy-Item $logFiles.FullName -Destination $logDestFile -Force
        Write-ColorOutput "✓ Copied import log: $($logFiles.Name)" "Green"
        $filesProcessed++
    }
    catch {
        Write-ColorOutput "WARNING: Could not copy import log - $_" "Yellow"
    }
}

Write-ColorOutput "" "White"
Write-ColorOutput "=== Copy Summary ===" "Cyan"
Write-ColorOutput "Files processed: $filesProcessed" "Green"
Write-ColorOutput "Errors: $errors" "$(if($errors -gt 0) { 'Red' } else { 'Green' })"

if ($filesProcessed -gt 0) {
    Write-ColorOutput "" "White"
    Write-ColorOutput "✓ User bookmarks copied successfully!" "Green"
    Write-ColorOutput "Next steps:" "Cyan"
    Write-ColorOutput "1. Open your BookMark Manager application" "White"
    Write-ColorOutput "2. Refresh the page (F5) to load your imported bookmarks" "White"
    Write-ColorOutput "3. Your personal bookmarks should now appear in the dashboard" "White"
    
    $indexFile = Join-Path $DestinationPath "index.html"
    if (Test-Path $indexFile) {
        Write-ColorOutput "" "White"
        Write-ColorOutput "💡 Tip: You can open the BookMark Manager directly:" "Yellow"
        Write-ColorOutput "   start '$indexFile'" "Gray"
    }
}
else {
    Write-ColorOutput "No files were copied. Please check that Import-BrowserBookmarks.ps1 has been run successfully." "Yellow"
}

if ($errors -gt 0) {
    Write-ColorOutput "" "White"
    Write-ColorOutput "Some errors occurred during the copy process. Please check the messages above." "Red"
    exit 1
}

Write-ColorOutput "" "White"
Write-ColorOutput "Copy process completed successfully!" "Green"
