<#
.SYNOPSIS
    Import Browser Bookmarks to BookMark Manager (Multi-User Version)
    
.DESCRIPTION
    Extracts bookmarks from Chrome and Edge browsers and creates local user bookmark files
    for use with the shared BookMark Manager system. Designed for corporate environments
    where the main BookMark Manager is on a file share and users have personal bookmarks
    stored locally.
    
.PARAMETER Browser
    Specify which browser to import from: 'Chrome', 'Edge', or 'All' (default)
    
.PARAMETER OutputPath
    Local directory to store user bookmark files (default: user temp directory)
    
.PARAMETER DryRun
    Preview changes without creating files
    
.PARAMETER CategoryPrefix
    Prefix for imported bookmark categories (default: 'Personal')
    
.PARAMETER Backup
    Create backup of existing user bookmarks (default: true)
    
.EXAMPLE
    .\Import-BrowserBookmarks.ps1
    Import bookmarks from all detected browsers to default location
    
.EXAMPLE
    .\Import-BrowserBookmarks.ps1 -Browser Chrome -DryRun
    Preview Chrome bookmark import without making changes
    
.EXAMPLE
    .\Import-BrowserBookmarks.ps1 -OutputPath "C:\Users\$env:USERNAME\BookMarks"
    Import to specific local directory
    
.NOTES
    Author: Keith Clarke
    Version: 1.0.0
    Created: 2025-01-26
    
    This script is designed for multi-user environments where:
    - BookMark Manager files are on a shared file server
    - Each user runs this script locally to import their personal bookmarks
    - User bookmarks are stored locally and loaded alongside corporate bookmarks
#>

[CmdletBinding()]
param(
    [ValidateSet('Chrome', 'Edge', 'All')]
    [string]$Browser = 'All',
    
    [string]$OutputPath = "$env:TEMP\BookMarkManager",
    
    [switch]$DryRun,
    
    [string]$CategoryPrefix = 'Personal',
    
    [switch]$Backup = $true
)

# Script configuration
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'Continue'

# Initialize logging
$LogFile = Join-Path $OutputPath "import-log-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
$Script:ImportStats = @{
    ChromeBookmarks = 0
    EdgeBookmarks = 0
    CategoriesCreated = 0
    DuplicatesSkipped = 0
    ErrorsEncountered = 0
}

function Write-Log {
    param([string]$Message, [string]$Level = 'INFO')
    $Timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $LogEntry = "[$Timestamp] [$Level] $Message"
    Write-Host $LogEntry
    if (-not $DryRun) {
        Add-Content -Path $LogFile -Value $LogEntry -ErrorAction SilentlyContinue
    }
}

function Initialize-OutputDirectory {
    Write-Log "Initialising output directory: $OutputPath"
    
    if (-not $DryRun) {
        if (-not (Test-Path $OutputPath)) {
            New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
            Write-Log "Created output directory: $OutputPath"
        }
        
        # Create backup directory
        $BackupPath = Join-Path $OutputPath "backups"
        if (-not (Test-Path $BackupPath)) {
            New-Item -Path $BackupPath -ItemType Directory -Force | Out-Null
        }
    }
}

function Get-BrowserPaths {
    Write-Log "Detecting installed browsers..."
    
    $BrowserPaths = @{}
    
    # Chrome paths
    $ChromePaths = @(
        "$env:LOCALAPPDATA\Google\Chrome\User Data",
        "$env:LOCALAPPDATA\Google\Chrome Beta\User Data",
        "$env:LOCALAPPDATA\Google\Chrome Dev\User Data"
    )
    
    foreach ($Path in $ChromePaths) {
        if (Test-Path $Path) {
            $BrowserPaths['Chrome'] = $Path
            Write-Log "Found Chrome installation: $Path"
            break
        }
    }
    
    # Edge paths
    $EdgePaths = @(
        "$env:LOCALAPPDATA\Microsoft\Edge\User Data",
        "$env:LOCALAPPDATA\Microsoft\Edge Beta\User Data",
        "$env:LOCALAPPDATA\Microsoft\Edge Dev\User Data"
    )
    
    foreach ($Path in $EdgePaths) {
        if (Test-Path $Path) {
            $BrowserPaths['Edge'] = $Path
            Write-Log "Found Edge installation: $Path"
            break
        }
    }
    
    if ($BrowserPaths.Count -eq 0) {
        Write-Log "No supported browsers found" -Level 'WARNING'
    }
    
    return $BrowserPaths
}

function Get-BrowserProfiles {
    param([string]$BrowserPath)
    
    $Profiles = @()
    
    # Default profile
    $DefaultBookmarks = Join-Path $BrowserPath "Default\Bookmarks"
    if (Test-Path $DefaultBookmarks) {
        $Profiles += @{
            Name = "Default"
            Path = $DefaultBookmarks
        }
    }
    
    # Additional profiles
    $ProfileDirs = Get-ChildItem -Path $BrowserPath -Directory | Where-Object { $_.Name -match '^Profile \d+$' }
    foreach ($ProfileDir in $ProfileDirs) {
        $BookmarksFile = Join-Path $ProfileDir.FullName "Bookmarks"
        if (Test-Path $BookmarksFile) {
            $Profiles += @{
                Name = $ProfileDir.Name
                Path = $BookmarksFile
            }
        }
    }
    
    return $Profiles
}

function Parse-ChromiumBookmarks {
    param(
        [string]$BookmarksFile,
        [string]$BrowserName,
        [string]$ProfileName
    )
    
    Write-Log "Parsing bookmarks from $BrowserName ($ProfileName): $BookmarksFile"
    
    try {
        $BookmarksJson = Get-Content -Path $BookmarksFile -Raw -Encoding UTF8 | ConvertFrom-Json
        $ParsedBookmarks = @()
        
        # Process bookmark bar
        if ($BookmarksJson.roots.bookmark_bar) {
            $ParsedBookmarks += Parse-BookmarkFolder -Folder $BookmarksJson.roots.bookmark_bar -ParentPath "Bookmarks Bar" -BrowserName $BrowserName
        }
        
        # Process other bookmarks
        if ($BookmarksJson.roots.other) {
            $ParsedBookmarks += Parse-BookmarkFolder -Folder $BookmarksJson.roots.other -ParentPath "Other Bookmarks" -BrowserName $BrowserName
        }
        
        # Process synced bookmarks (if available)
        if ($BookmarksJson.roots.synced) {
            $ParsedBookmarks += Parse-BookmarkFolder -Folder $BookmarksJson.roots.synced -ParentPath "Synced Bookmarks" -BrowserName $BrowserName
        }
        
        Write-Log "Parsed $($ParsedBookmarks.Count) bookmarks from $BrowserName ($ProfileName)"
        return $ParsedBookmarks
        
    } catch {
        Write-Log "Error parsing bookmarks from $BookmarksFile`: $($_.Exception.Message)" -Level 'ERROR'
        $Script:ImportStats.ErrorsEncountered++
        return @()
    }
}

function Parse-BookmarkFolder {
    param(
        [object]$Folder,
        [string]$ParentPath,
        [string]$BrowserName
    )
    
    $Bookmarks = @()
    
    if (-not $Folder.children) {
        return $Bookmarks
    }
    
    foreach ($Item in $Folder.children) {
        if ($Item.type -eq 'url') {
            # It's a bookmark
            $Bookmark = @{
                name = $Item.name
                url = $Item.url
                description = "Imported from $BrowserName"
                logo = ""
                tags = @("imported", $BrowserName.ToLower())
                category = $ParentPath
                dateAdded = $null
            }
            
            # Convert Chrome timestamp if available
            if ($Item.date_added) {
                try {
                    $ChromeEpoch = [DateTime]::new(1601, 1, 1, 0, 0, 0, [DateTimeKind]::Utc)
                    $Bookmark.dateAdded = $ChromeEpoch.AddMicroseconds($Item.date_added).ToString('yyyy-MM-dd')
                } catch {
                    # Ignore timestamp conversion errors
                }
            }
            
            $Bookmarks += $Bookmark
            
        } elseif ($Item.type -eq 'folder') {
            # It's a folder, recurse into it
            $FolderPath = if ($ParentPath) { "$ParentPath > $($Item.name)" } else { $Item.name }
            $Bookmarks += Parse-BookmarkFolder -Folder $Item -ParentPath $FolderPath -BrowserName $BrowserName
        }
    }
    
    return $Bookmarks
}

function Convert-ToBookmarkManagerFormat {
    param([array]$ImportedBookmarks)
    
    Write-Log "Converting $($ImportedBookmarks.Count) bookmarks to BookMark Manager format..."
    
    # Group bookmarks by category
    $Categories = @{}
    
    foreach ($Bookmark in $ImportedBookmarks) {
        $CategoryName = "$CategoryPrefix - $($Bookmark.category)"
        
        if (-not $Categories.ContainsKey($CategoryName)) {
            $Categories[$CategoryName] = @{
                id = ($CategoryName -replace '[^a-zA-Z0-9]', '-').ToLower()
                name = $CategoryName
                description = "Personal bookmarks imported from browser"
                colour = Get-CategoryColour -CategoryName $CategoryName
                bookmarks = @()
            }
            $Script:ImportStats.CategoriesCreated++
        }
        
        # Create bookmark object
        $BookmarkObj = @{
            name = $Bookmark.name
            url = $Bookmark.url
            description = $Bookmark.description
            logo = $Bookmark.logo
            tags = $Bookmark.tags
        }
        
        $Categories[$CategoryName].bookmarks += $BookmarkObj
    }
    
    # Convert to array format
    $CategoryArray = @()
    foreach ($Category in $Categories.Values) {
        $CategoryArray += $Category
    }
    
    Write-Log "Created $($CategoryArray.Count) categories"
    return $CategoryArray
}

function Get-CategoryColour {
    param([string]$CategoryName)
    
    # Assign colours based on category type
    $ColourMap = @{
        'chrome' = '#4285f4'
        'edge' = '#0078d4'
        'bookmarks-bar' = '#34a853'
        'other' = '#ea4335'
        'synced' = '#fbbc04'
    }
    
    foreach ($Key in $ColourMap.Keys) {
        if ($CategoryName.ToLower().Contains($Key)) {
            return $ColourMap[$Key]
        }
    }
    
    # Default colour for personal bookmarks
    return '#6c757d'
}

function Backup-ExistingBookmarks {
    param([string]$OutputPath)
    
    if (-not $Backup) {
        return
    }
    
    $UserBookmarksFile = Join-Path $OutputPath "user-bookmarks.json"
    if (Test-Path $UserBookmarksFile) {
        $BackupPath = Join-Path $OutputPath "backups"
        $BackupFile = Join-Path $BackupPath "user-bookmarks-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
        
        if (-not $DryRun) {
            Copy-Item -Path $UserBookmarksFile -Destination $BackupFile
            Write-Log "Created backup: $BackupFile"
        } else {
            Write-Log "[DRY RUN] Would create backup: $BackupFile"
        }
    }
}

function Save-UserBookmarks {
    param(
        [array]$Categories,
        [string]$OutputPath
    )
    
    $UserBookmarksData = @{
        _metadata = @{
            title = "BookMark Manager - User Data File"
            description = "Personal bookmarks imported from browsers"
            author = $env:USERNAME
            version = "1.0.0"
            created = (Get-Date -Format 'yyyy-MM-dd')
            importDate = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
            format = "JSON"
            licence = "MIT"
        }
        settings = @{
            defaultTheme = "corporate-blue"
            version = "1.0.0"
            userBookmarks = $true
        }
        categories = $Categories
    }
    
    $UserBookmarksFile = Join-Path $OutputPath "user-bookmarks.json"
    $UserBookmarksJsFile = Join-Path $OutputPath "user-bookmarks.js"
    
    if (-not $DryRun) {
        # Save JSON file
        $UserBookmarksData | ConvertTo-Json -Depth 10 | Set-Content -Path $UserBookmarksFile -Encoding UTF8
        Write-Log "Saved user bookmarks: $UserBookmarksFile"
        
        # Generate JS file for local loading
        $JsContent = @"
/**
 * BookMark Manager - User Bookmarks (JSONP)
 * Personal bookmarks imported from browsers
 * 
 * @author $env:USERNAME
 * @version 1.0.0
 * @created $(Get-Date -Format 'yyyy-MM-dd')
 * @description JSONP wrapper for user bookmarks to enable local file loading
 * @licence MIT
 */

// Load user bookmarks if BookMark Manager is available
if (typeof window !== 'undefined' && window.bookmarkApp && window.bookmarkApp.loadUserBookmarks) {
    window.bookmarkApp.loadUserBookmarks($($UserBookmarksData | ConvertTo-Json -Depth 10 -Compress));
} else {
    console.warn('BookMark Manager not found - user bookmarks not loaded');
}
"@
        
        $JsContent | Set-Content -Path $UserBookmarksJsFile -Encoding UTF8
        Write-Log "Generated user bookmarks JS: $UserBookmarksJsFile"
        
    } else {
        Write-Log "[DRY RUN] Would save user bookmarks to: $UserBookmarksFile"
        Write-Log "[DRY RUN] Would generate JS file: $UserBookmarksJsFile"
    }
}

function Show-ImportSummary {
    Write-Log "=== Import Summary ===" -Level 'INFO'
    Write-Log "Chrome bookmarks imported: $($Script:ImportStats.ChromeBookmarks)" -Level 'INFO'
    Write-Log "Edge bookmarks imported: $($Script:ImportStats.EdgeBookmarks)" -Level 'INFO'
    Write-Log "Categories created: $($Script:ImportStats.CategoriesCreated)" -Level 'INFO'
    Write-Log "Duplicates skipped: $($Script:ImportStats.DuplicatesSkipped)" -Level 'INFO'
    Write-Log "Errors encountered: $($Script:ImportStats.ErrorsEncountered)" -Level 'INFO'
    Write-Log "Output directory: $OutputPath" -Level 'INFO'
    
    if (-not $DryRun) {
        Write-Log "Log file: $LogFile" -Level 'INFO'
    }
    
    Write-Log "=== Next Steps ===" -Level 'INFO'
    Write-Log "1. Copy the generated files to your local BookMark Manager directory" -Level 'INFO'
    Write-Log "2. Open the BookMark Manager from the file share" -Level 'INFO'
    Write-Log "3. Your personal bookmarks will be loaded automatically" -Level 'INFO'
}

# Main execution
try {
    Write-Log "Starting Browser Bookmark Import for user: $env:USERNAME"
    Write-Log "Target browsers: $Browser"
    Write-Log "Output path: $OutputPath"
    Write-Log "Dry run mode: $DryRun"
    
    # Initialize
    Initialize-OutputDirectory
    
    # Backup existing bookmarks
    Backup-ExistingBookmarks -OutputPath $OutputPath
    
    # Get browser installations
    $BrowserPaths = Get-BrowserPaths
    
    if ($BrowserPaths.Count -eq 0) {
        Write-Log "No supported browsers found. Exiting." -Level 'WARNING'
        exit 1
    }
    
    # Collect all bookmarks
    $AllBookmarks = @()
    
    # Process each browser
    foreach ($BrowserName in $BrowserPaths.Keys) {
        if ($Browser -ne 'All' -and $Browser -ne $BrowserName) {
            continue
        }
        
        Write-Log "Processing $BrowserName browser..."
        $BrowserPath = $BrowserPaths[$BrowserName]
        $Profiles = Get-BrowserProfiles -BrowserPath $BrowserPath
        
        if ($Profiles.Count -eq 0) {
            Write-Log "No profiles found for $BrowserName" -Level 'WARNING'
            continue
        }
        
        foreach ($Profile in $Profiles) {
            $Bookmarks = Parse-ChromiumBookmarks -BookmarksFile $Profile.Path -BrowserName $BrowserName -ProfileName $Profile.Name
            $AllBookmarks += $Bookmarks
            
            if ($BrowserName -eq 'Chrome') {
                $Script:ImportStats.ChromeBookmarks += $Bookmarks.Count
            } elseif ($BrowserName -eq 'Edge') {
                $Script:ImportStats.EdgeBookmarks += $Bookmarks.Count
            }
        }
    }
    
    if ($AllBookmarks.Count -eq 0) {
        Write-Log "No bookmarks found to import" -Level 'WARNING'
        exit 0
    }
    
    # Convert to BookMark Manager format
    $Categories = Convert-ToBookmarkManagerFormat -ImportedBookmarks $AllBookmarks
    
    # Save user bookmarks
    Save-UserBookmarks -Categories $Categories -OutputPath $OutputPath
    
    # Show summary
    Show-ImportSummary
    
    Write-Log "Browser bookmark import completed successfully!"
    
} catch {
    Write-Log "Fatal error during import: $($_.Exception.Message)" -Level 'ERROR'
    Write-Log "Stack trace: $($_.ScriptStackTrace)" -Level 'ERROR'
    exit 1
}
