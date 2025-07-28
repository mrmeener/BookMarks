# BookMark Manager Documentation

## Overview
The BookMark Manager is a professional bookmark management system designed for corporate environments, offering advanced organization, search, and management capabilities for business tools and websites.

# BookMark Manager Documentation

## Overview
The BookMark Manager is a professional bookmark management system designed for corporate environments, offering advanced organisation, search, and management capabilities for business tools and websites.

---

## Version History

### Version 2.2.7 (2025-07-28)
- **Desktop Application Support**: Added comprehensive desktop application management alongside web bookmarks
- **Visual Differentiation**: Desktop apps display with unique styling, 🖥️ icons, and specialised badges
- **Enhanced Add Bookmark Form**: Type selector (Web/Desktop) with dynamic form behaviour and validation
- **Desktop App Information Modals**: Click desktop apps to view installation guidance and IT support options
- **Help System Integration**: Desktop apps support all 3 help types (Help, Split Help, Approval Process)
- **Responsive Design**: Desktop app cards work seamlessly across all screen sizes and themes
- **Data Structure Enhancement**: Added `type` field to bookmark objects with backwards compatibility
- **Theme Update**: Streamlined default theme selection to 6 core professional options (reduced from 17) for improved usability
- Fixed infinite loading issue when adding user bookmarks
- Improved mergeUserBookmarks() method to prevent duplicate accumulation

### Version 2.2.6 (2025-07-28)
- Fixed syntax error in user-bookmarks.js causing load failures  
- Enhanced error handling for malformed bookmark data  
- Improved console logging for debugging  
- Updated documentation and version numbers  
- Added comprehensive troubleshooting guide  

### Version 2.2.5 (2025-07-27)
- **Theme Customisation**: Reduced default themes to 6 core professional options while maintaining full customisation capabilities  
- **Palette Flexibility**: Easily add/modify themes according to your colour palette preferences  
- Enhanced theme organisation and categorisation  
- Improved colour accessibility and contrast  
- Updated theme selector with grouped options  

### Version 2.2.0 (2025-01-27)
- Added advanced help system with context-aware support  
- Added knowledge base integration  
- Added IT support ticket integration  
- Enhanced search with autocomplete  
- Improved mobile responsiveness  
- Added recent visits tracking  

### Version 2.1.0 (2025-01-27)
- Introduced CSV-to-JSON workflow for sysadmins  
- Added comprehensive field mapping documentation  
- Implemented automated validation and conversion  
- Added support for complex contact methods in CSV format  

### Version 2.0.0 (2025-01-26)
- Implemented multi-user deployment capabilities  
- Added browser bookmark import functionality  
- Created PowerShell scripts for automated deployment  
- Established corporate/personal bookmark merging  

### Version 1.0.0 (2025-01-26)
- Initial release with core bookmark management  
- 9 professional themes  
- Basic import/export system  
- User bookmark creation capabilities  

---

## Deployment Guide

### Architecture
```
File Share (Corporate):
├── index.html
├── script.js
├── styles.css
└── bookmarks.js

Local Workstation:
├── %TEMP%\BookMarkManager\
│   ├── user-bookmarks.json
│   └── backups\
```

### Deployment Options
1. **Group Policy Deployment**  
   ```powershell
   powershell.exe -ExecutionPolicy Bypass -File "\\fileserver\BookMarkManager\Import-BrowserBookmarks.ps1"
   ```

2. **Manual User Deployment**  
   ```powershell
   cd \\fileserver\BookMarkManager\
   .\Import-BrowserBookmarks.ps1
   ```

3. **Self-Service Portal**  
   ```batch
   @echo off
   powershell.exe -ExecutionPolicy Bypass -File "\\fileserver\BookMarkManager\Import-BrowserBookmarks.ps1"
   pause
   ```

---

## CSV-to-JSON Workflow

## NEEDS A REWRITE!

### Core Fields
| Field | Required | Example |
|-------|----------|---------|
| CategoryID   | ✅ | `m365-admin` |
| BookmarkName | ✅ | `Microsoft 365 Admin` |
| BookmarkURL  | ✅ | `https://admin.microsoft.com` |

### Conversion Process
```powershell
.\Convert-CSVToBookmarks.ps1 -InputFile "bookmarks.csv" -Validate:$true
```

---

## User Guide

### Key Features
- 🔍 Advanced search with tag filtering (`tag:admin`)  
- 🎨 6 professional themes (easily customisable to add more)  
- 📚 Integrated knowledge base  
- 🔄 Import/export functionality  

### Keyboard Shortcuts
- `Ctrl+F`: Focus search bar  
- `F5`: Refresh bookmarks  
- `F1`: Easter egg game  

---

## File Structure
```
BookMarks/
├── index.html                    # Main application
├── script.js                     # Core logic
├── styles.css                    # Styling
├── docs/                         # Documentation
└── generate/                     # Conversion tools
```

---

## Support
- **IT Help Desk**: helpdesk@company.com  
- **System Admin**: sysadmin@company.com  
- **Application Owner**: MrMeener  

**Version**: 2.2.7  
**Last Updated**: 2025-07-28  
**Licence**: MIT  

---

### Theme Customisation Notes
The core distribution now includes 6 optimised professional themes. To customise:
1. Edit `styles.css` and locate the `:root` variables
2. Modify colour values using HEX/RGB formats
3. Add new theme blocks using existing templates
4. Update the theme selector in `script.js` (search for `themeSelector`)

### Out for now.

