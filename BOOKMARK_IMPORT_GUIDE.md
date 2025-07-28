# BookMark Manager - Import Guide

This guide explains how to import bookmarks from your browser into the BookMark Manager application, which supports both web bookmarks and desktop applications.

## Quick Start

1. **Import from Browser**
   ```powershell
   .\Generate\Import-BrowserBookmarks.ps1
   ```

2. **Copy to BookMark Manager**
   ```powershell
   .\Copy-UserBookmarks.ps1
   ```

3. **Refresh the Application**
   - Open `index.html` in your browser
   - Press F5 to refresh and load your imported bookmarks

## Detailed Steps

### Step 1: Import Browser Bookmarks

Run the import script from the Generate directory:

```powershell
cd Generate
.\Import-BrowserBookmarks.ps1
```

This script will:
- Detect installed browsers (Chrome, Edge)
- Extract bookmarks from browser data files
- Convert them to BookMark Manager format
- Save files to: `%LOCALAPPDATA%\Temp\BookMarkManager\`

### Step 2: Copy Files to Application Directory

Run the copy script from the main directory:

```powershell
.\Copy-UserBookmarks.ps1
```

This script will:
- Copy `user-bookmarks.js` to the application directory
- Copy `user-bookmarks.json` as a backup
- Create backups of existing files
- Work with any Windows user account

### Step 3: View Your Bookmarks

1. Open `index.html` in your web browser
2. Refresh the page (F5) to load the new bookmarks
3. Your imported bookmarks will appear alongside the default corporate bookmarks

## File Locations

| File | Purpose | Location |
|------|---------|----------|
| `user-bookmarks.js` | Main bookmark data file | Application root directory |
| `user-bookmarks.json` | Backup/readable format | Application root directory |
| `latest-import.log` | Import process log | Application root directory |

## Troubleshooting

### Bookmarks Not Appearing

1. **Check if files were copied:**
   ```powershell
   ls user-bookmarks.*
   ```

2. **Verify file contents:**
   ```powershell
   Get-Content user-bookmarks.js -Head 5
   ```

3. **Check browser console:**
   - Press F12 in your browser
   - Look for JavaScript errors in the Console tab

### Import Script Issues

1. **Browser not detected:**
   - Ensure Chrome or Edge is installed
   - Check if browser data directories exist

2. **Permission errors:**
   - Run PowerShell as Administrator
   - Close browser applications before importing

3. **No bookmarks found:**
   - Verify you have bookmarks in your browser
   - Check if browser profile is the default one

### Copy Script Issues

1. **Source files not found:**
   - Run the import script first
   - Check the temp directory: `%LOCALAPPDATA%\Temp\BookMarkManager\`

2. **Permission denied:**
   - Ensure you have write access to the application directory
   - Close any applications that might be using the files

## Advanced Usage

### Custom Paths

You can specify custom source and destination paths:

```powershell
.\Copy-UserBookmarks.ps1 -SourcePath "C:\MyBookmarks" -DestinationPath "D:\BookMarkManager"
```

### Automated Import

Create a batch file for regular imports:

```batch
@echo off
cd /d "C:\KC\Scripts\BookMarks"
powershell -ExecutionPolicy Bypass -File ".\Generate\Import-BrowserBookmarks.ps1"
powershell -ExecutionPolicy Bypass -File ".\Copy-UserBookmarks.ps1"
echo Import completed! Refresh your BookMark Manager to see changes.
pause
```

## Desktop Applications

### Adding Desktop Applications

The BookMark Manager now supports desktop applications alongside web bookmarks. Desktop applications:

- Display with a 🖥️ icon and unique styling
- Show installation guidance when clicked
- Support the same help system as web bookmarks
- Can be added manually through the web interface

### Desktop App vs Web Bookmark

| Feature | Web Bookmark | Desktop Application |
|---------|--------------|-------------------|
| **Clickable** | ✅ Opens URL | ❌ Shows info modal |
| **Visual Indicator** | 🌐 Web icon | 🖥️ Desktop icon |
| **URL Field** | Full web URL | Application name/ID |
| **Help System** | Full support | Full support |
| **Installation** | Not applicable | Guidance provided |

### Adding Desktop Apps via Web Interface

1. Click "Add Bookmark" button
2. Select "Desktop Application" from Type dropdown
3. Enter application name instead of URL
4. Fill in description, category, and help information
5. Save - the app will display with desktop styling

## File Structure

```
BookMarks/
├── index.html                 # Main application
├── script.js                  # Application logic
├── bookmarks.js              # Default corporate bookmarks (web + desktop)
├── user-bookmarks.js         # Your imported bookmarks
├── Copy-UserBookmarks.ps1    # Copy script
└── Generate/
    └── Import-BrowserBookmarks.ps1  # Import script
```

## Security Notes

- The import process only reads browser bookmark files
- No passwords or sensitive data are accessed
- All processing is done locally on your machine
- Temporary files are stored in your user's temp directory

## Support

If you encounter issues:

1. Check the `latest-import.log` file for detailed error messages
2. Verify PowerShell execution policy allows script execution
3. Ensure you have the necessary permissions to read browser data
4. Contact IT support if problems persist

---

**Last Updated:** July 28, 2025  
**Version:** 2.2.7
