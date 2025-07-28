# BookMark Manager Deployment Guide

## Overview
This guide covers deploying the BookMark Manager in corporate environments with shared corporate bookmarks and user-specific personal bookmarks. The system supports both web bookmarks and desktop applications with comprehensive help system integration.

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
          "url": "https://intranet.company.com",
          "type": "web"
        }
      ]
    },
    {
      "id": "desktop-apps",
      "name": "Desktop Applications",
      "bookmarks": [
        {
          "name": "Microsoft Word",
          "url": "Microsoft Word 2021",
          "type": "desktop",
          "description": "Word processing application for creating documents",
          "supportType": "help"
        }
      ]
    }
  ]
}
```

### 2. Desktop Application Support

The system now supports desktop applications alongside web bookmarks:

#### Desktop App Configuration
- **Type Field**: Set `"type": "desktop"` for desktop applications
- **URL Field**: Use application name or identifier instead of web URL
- **Visual Differentiation**: Desktop apps display with 🖥️ icons and unique styling
- **Help Integration**: Full support for all 3 help types (Help, Split Help, Approval Process)

#### Example Desktop Application Entry
```json
{
  "name": "Adobe Photoshop",
  "url": "Adobe Photoshop 2024",
  "type": "desktop",
  "description": "Professional image editing software",
  "supportType": "approval-process",
  "helpDescription": "Request access to Adobe Creative Suite",
  "accessRequirements": ["Manager approval", "Business justification"],
  "contactMethod": {
    "type": "email",
    "email": "software-requests@company.com",
    "person": "IT Software Team"
  }
}
```

### 3. Regenerate JavaScript
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

**Last Updated**: 2025-07-28  
**Version**: 2.2.7
```

### Key Features of This Guide:
1. **Ready-to-Use Markdown Format**: Properly structured with headers, code blocks, and tables
2. **Complete Deployment Coverage**: From server setup to troubleshooting
3. **Copy-Paste Friendly**: All code snippets are properly formatted
4. **Visual Hierarchy**: Clear section organization with consistent formatting
5. **Version Controlled**: Includes last update and version number
