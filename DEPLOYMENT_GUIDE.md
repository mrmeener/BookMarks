# BookMark Manager Deployment Guide

## Overview
This guide covers deploying the BookMark Manager in corporate environments with shared corporate bookmarks and user-specific personal bookmarks.

## Table of Contents
1. [Architecture](#architecture)
2. [Server Setup](#server-setup)
3. [Corporate Bookmarks](#corporate-bookmarks-configuration)
4. [User Deployment](#user-deployment)
   - [Group Policy](#option-a-group-policy-deployment)
   - [Manual](#option-b-manual-user-deployment)
   - [Self-Service](#option-c-self-service-portal)
5. [Advanced Configuration](#advanced-configuration)
6. [Troubleshooting](#troubleshooting)

---

## Architecture

### File Share Structure (Corporate)
```
\\fileserver\shares\BookMarkManager\
├── index.html                    # Main application
├── script.js                     # Application logic
├── styles.css                    # Styling
├── bookmarks.json                # Corporate bookmarks
├── bookmarks.js                  # Corporate bookmarks (JSONP)
├── Import-BrowserBookmarks.ps1   # User deployment script
└── DEPLOYMENT_GUIDE.md           # This document
```

### Local User Structure
```
%TEMP%\BookMarkManager\
├── user-bookmarks.json           # Personal bookmarks
├── user-bookmarks.js             # Personal bookmarks (JSONP)
├── backups\                      # Local backups
└── import-log-*.txt              # Import logs
```

---

## Server Setup

### 1. Create Shared Directory
```powershell
New-Item -Path "\\fileserver\shares\BookMarkManager" -ItemType Directory
```

### 2. Set Permissions
| Permission | Users |
|------------|-------|
| Read       | All employees |
| Write      | IT Administrators |

### 3. Copy Application Files
```powershell
Copy-Item -Path ".\*" -Destination "\\fileserver\shares\BookMarkManager\" -Recurse
```

---

## Corporate Bookmarks Configuration

### 1. Edit `bookmarks.json`
```json
{
  "categories": [
    {
      "id": "company-portals",
      "name": "Company Portals",
      "bookmarks": [
        {
          "name": "Company Intranet",
          "url": "https://intranet.company.com"
        }
      ]
    }
  ]
}
```

### 2. Regenerate JavaScript
```powershell
.\Generate\Generate-BookmarksJS.ps1
```

---

## User Deployment

### Option A: Group Policy Deployment
```powershell
# Computer Configuration > Policies > Windows Settings > Scripts > Startup
powershell.exe -ExecutionPolicy Bypass -File "\\fileserver\BookMarkManager\Import-BrowserBookmarks.ps1"
```

### Option B: Manual User Deployment
```batch
1. Open PowerShell as Administrator
2. Run: \\fileserver\BookMarkManager\Import-BrowserBookmarks.ps1
3. Follow prompts
```

### Option C: Self-Service Portal
Create `ImportBookmarks.bat`:
```batch
@echo off
powershell.exe -ExecutionPolicy Bypass -File "\\fileserver\BookMarkManager\Import-BrowserBookmarks.ps1"
pause
```

---

## Advanced Configuration

### Custom Output Locations
```powershell
.\Import-BrowserBookmarks.ps1 -OutputPath "H:\BookMarks"
```

### Scheduled Updates
```powershell
$Action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-File \\fileserver\BookMarkManager\Import-BrowserBookmarks.ps1"
Register-ScheduledTask -TaskName "Weekly Bookmark Update" -Action $Action -Trigger (New-ScheduledTaskTrigger -Weekly -At 9am)
```

### Category Customization
```powershell
.\Import-BrowserBookmarks.ps1 -CategoryPrefix "MyBookmarks"
```

---

## Troubleshooting

### Common Issues

| Error | Solution |
|-------|----------|
| `Execution of scripts is disabled` | `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| `No browsers found` | Run as same user who installed browsers |
| `Access denied` | Close browsers before running script |
| `Bookmarks not loading` | Check console errors in browser (F12) |

### Log Locations
```
%TEMP%\BookMarkManager\import-log-YYYYMMDD-HHMMSS.txt
```

---

## Security Considerations
- 🔒 User bookmarks stored locally only
- 🔐 Corporate bookmarks read-only for users
- 📁 Regular permission audits recommended

**Last Updated**: 2025-07-27  
**Version**: 2.2.6
```

### Key Features of This Guide:
1. **Ready-to-Use Markdown Format**: Properly structured with headers, code blocks, and tables
2. **Complete Deployment Coverage**: From server setup to troubleshooting
3. **Copy-Paste Friendly**: All code snippets are properly formatted
4. **Visual Hierarchy**: Clear section organization with consistent formatting
5. **Version Controlled**: Includes last update and version number
