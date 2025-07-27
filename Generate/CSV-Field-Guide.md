# BookMark Manager CSV Field Mapping Guide

## Overview
This guide explains the CSV-to-JSON workflow for managing bookmark data while preserving all advanced features of the BookMark Manager.

## Table of Contents
1. [Core Fields](#core-bookmark-fields)
2. [Support System](#support-system-fields)
3. [Contact Methods](#contact-method-fields)
4. [Access Requirements](#access-requirements-fields)
5. [Knowledge Base](#knowledge-base-fields)
6. [Usage Examples](#usage-examples)
7. [Conversion Workflow](#conversion-workflow)

---

## Core Bookmark Fields (Required)

| Field | Description | Example | Required |
|-------|-------------|---------|----------|
| `CategoryID` | Unique category identifier | `m365-admin` | ✅ |
| `CategoryName` | Display name | `Microsoft 365 Admin` | ✅ |
| `CategoryDescription` | Category description | `M365 administration portals` | ❌ |
| `CategoryColor` | Hex color code | `#0078d4` | ❌ |
| `BookmarkName` | Bookmark title | `Admin Center` | ✅ |
| `BookmarkURL` | Full URL | `https://admin.microsoft.com` | ✅ |
| `BookmarkDescription` | Description | `Main admin portal` | ❌ |
| `Tags` | Semicolon-separated tags | `admin;portal` | ❌ |

---

## Support System Fields

| Field | Description | Options | Example |
|-------|-------------|---------|---------|
| `SupportType` | Help system type | `ticket`, `popup`, `none` | `ticket` |
| `HelpDescription` | Detailed help text | Free text | `Access requires M365 admin rights` |
| `AccessLevel` | Required access | Free text | `Admin Only` |
| `AccessProcess` | How to get access | `email`, `meeting`, `self-service` | `email` |

---

## Contact Method Fields

### Email Contact Example
```csv
ContactType,ContactPerson,ContactEmail
email,Cloud Team,cloud@company.com
```

### Meeting Contact Example
```csv
ContactType,ContactPerson,MeetingSlots
meeting,Security Team,"Mon 2-4 PM;Wed 10-12 PM"
```

### Phone Contact Example
```csv
ContactType,ContactPhone,ContactHours
phone,+1-555-0123,"9AM-5PM EST"
```

---

## Access Requirements Fields

| Field | Description | Example |
|-------|-------------|---------|
| `Requirements` | Semicolon-separated requirements | `MFA;Security Training` |
| `ApprovalProcess` | Approval steps | `Manager → Security Team` |
| `EstimatedTime` | Access timeframe | `2 business days` |

---

## Knowledge Base Fields

### Training Materials
```csv
TrainingTitle,TrainingURL,TrainingTime
"M365 Training","/docs/m365-training.pdf","2 hours"
```

### External Links (JSON Format)
```csv
ExternalLinks
"[{"title":"Docs","url":"https://docs.microsoft.com"}]"
```

---

## Conversion Workflow

### Step 1: Edit CSV
```powershell
Start-Process "bookmarks-template.csv"
```

### Step 2: Convert to JSON
```powershell
.\Convert-CSVToBookmarks.ps1 -InputFile "custom.csv"
```

### Step 3: Generate JS
```powershell
.\Generate-BookmarksJS.ps1
```

### Output Files
```
bookmarks.json    # Intermediate JSON
bookmarks.js      # Final JavaScript
```

---

## Best Practices

### Data Organization
- Use lowercase for `CategoryID` (`azure-admin` not `Azure Admin`)
- Group related services in same category
- Use consistent tagging conventions

### Contact Methods
- Provide at least one contact method for restricted systems
- Include emergency contacts for critical systems
- Keep meeting slots updated

### Validation Tips
```powershell
# Test conversion without saving
.\Convert-CSVToBookmarks.ps1 -DryRun

# Skip URL validation (development only)
.\Convert-CSVToBookmarks.ps1 -Validate:$false
```

---

## Troubleshooting

### Common Issues

| Error | Solution |
|-------|----------|
| Missing required fields | Check `CategoryID`, `BookmarkName`, `BookmarkURL` |
| Invalid JSON in `ExternalLinks` | Use `[]` for empty or valid JSON array |
| CSV encoding issues | Save as UTF-8 in text editor |
| Permission denied | Run PowerShell as Admin |

---

**Version**: 2.2.6  
**Last Updated**: 2025-07-27  
**Author**: IT Documentation Team
