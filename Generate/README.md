# BookMark Manager CSV-to-JSON Workflow

## Overview

This directory contains a complete CSV-to-JSON workflow system that allows sysadmins to manage BookMark Manager data using simple CSV files while preserving all advanced features like help systems, contact methods, and knowledge base integration.

## Files in this Directory

### Core Files
- **`bookmarks-template.csv`** - Sample CSV file with all field mappings from the existing bookmarks.json
- **`Convert-CSVToBookmarks.ps1`** - Main conversion script (CSV → JSON → JS)
- **`Generate-BookmarksJS.ps1`** - Existing script to convert JSON to JavaScript format
- **`CSV-Field-Guide.md`** - Comprehensive field mapping documentation

### Generated Files
- **`bookmarks.json`** - Generated JSON file (copied to parent directory)
- **`bookmarks.js`** - Generated JavaScript file (copied to parent directory)
- **`*.backup-*`** - Automatic backups of existing files

### Legacy Files
- **`Import-BrowserBookmarks.ps1`** - Browser bookmark import script
- **`generate-bookmarks-js.py`** - Python version of JS generator
- **`bookmarks-clean.json`** - Clean version of bookmarks data

## Quick Start

### 1. Edit Bookmarks in CSV Format
```bash
# Open the template CSV file in Excel or any spreadsheet application
notepad bookmarks-template.csv
# or
excel bookmarks-template.csv
```

### 2. Convert CSV to JSON and JavaScript
```powershell
# Basic conversion (recommended)
.\Convert-CSVToBookmarks.ps1

# Custom options
.\Convert-CSVToBookmarks.ps1 -InputFile "my-bookmarks.csv" -Validate:$false
```

### 3. Test the Results
```bash
# Open the webpage to test
start ..\index.html
```

## CSV Field Structure

The CSV template includes **42 columns** that map to all BookMark Manager features:

### Required Fields (3)
- `CategoryID` - Unique category identifier
- `BookmarkName` - Bookmark title  
- `BookmarkURL` - Full URL

### Optional Fields (39)
- **Category Info**: Name, Description, Color
- **Bookmark Details**: Description, Logo, Tags, SupportType
- **Help System**: Description, Purpose, AccessLevel, AccessProcess
- **Contact Methods**: Type, Person, Email, Phone, Hours, Scripts
- **Access Control**: Requirements, Approval Process, Timeframes
- **Knowledge Base**: Training, Quick Reference, Policies, External Links

## Key Features

### 🔄 **Automated Workflow**
```
CSV File → Convert-CSVToBookmarks.ps1 → bookmarks.json → Generate-BookmarksJS.ps1 → bookmarks.js
```

### 🛡️ **Data Validation**
- URL validation
- Required field checking
- JSON syntax validation
- Automatic error reporting

### 📋 **Rich Field Mapping**
- Semicolon-separated lists (Tags, Requirements)
- JSON objects (External Links)
- Complex contact methods (Email, Phone, Meeting)
- Knowledge base integration

### 🔧 **Flexible Configuration**
- Skip validation for faster processing
- Custom input/output files
- Automatic backups
- Detailed logging

## Contact Method Examples

### Email Support
```csv
ContactType,ContactEmail,ContactPerson
email,cloud-ops@company.com,Cloud Operations Team
```

### Meeting-Based Access
```csv
ContactType,ContactPerson,MeetingSubject,MeetingSlots
meeting,IT Security Team,M365 Admin Access Request,Tuesday 2-4 PM;Thursday 10-12 PM
```

### Phone Support
```csv
ContactType,ContactPhone,ContactExtension,ContactHours,CallScript
phone,+1-555-0199,2847,Monday-Friday 8 AM - 6 PM EST,Hi I need access to [system]...
```

### Self-Service
```csv
ContactType,ContactEmail
self-service,helpdesk@company.com
```

## Advanced Usage

### Custom Templates
Create specialized CSV templates for different use cases:
```powershell
# Copy template for admin tools
Copy-Item bookmarks-template.csv admin-tools.csv

# Convert specific template
.\Convert-CSVToBookmarks.ps1 -InputFile admin-tools.csv
```

### Batch Processing
```powershell
# Process multiple CSV files
Get-ChildItem *.csv | ForEach-Object {
    .\Convert-CSVToBookmarks.ps1 -InputFile $_.Name -OutputFile "$($_.BaseName).json"
}
```

### Integration with Version Control
```bash
# Add CSV files to Git for version tracking
git add *.csv
git commit -m "Updated bookmark data"

# Regenerate after pulling changes
git pull
.\Convert-CSVToBookmarks.ps1
```

## Troubleshooting

### Common Issues

**CSV Format Errors**
```
Solution: Ensure CSV is UTF-8 encoded and uses proper semicolon separators
```

**Missing Required Fields**
```
Solution: Check that CategoryID, BookmarkName, and BookmarkURL are filled
```

**Invalid JSON in ExternalLinks**
```
Solution: Use proper JSON format or leave field empty
Example: [{"title":"Link","url":"https://example.com","description":"Description"}]
```

**PowerShell Execution Policy**
```powershell
# Check current policy
Get-ExecutionPolicy

# Set policy if needed (run as Administrator)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Getting Help

1. **View detailed help**:
   ```powershell
   .\Convert-CSVToBookmarks.ps1 -Help
   ```

2. **Check field documentation**:
   ```bash
   notepad CSV-Field-Guide.md
   ```

3. **Validate CSV data**:
   - Use Excel's data validation features
   - Check for missing required fields
   - Verify URL formats

## Benefits for Sysadmins

### ✅ **Simplified Data Entry**
- Familiar spreadsheet interface
- Bulk operations support
- Copy/paste from existing systems

### ✅ **Preserved Functionality**
- All BookMark Manager features supported
- Rich help system integration
- Complex contact workflows

### ✅ **Automated Processing**
- One-command conversion
- Automatic validation
- Built-in backup system

### ✅ **Version Control Friendly**
- CSV files work well with Git
- Easy to track changes
- Merge conflict resolution

## Migration from JSON

To convert existing JSON data to CSV format:

1. **Use the template**: The `bookmarks-template.csv` contains sample data from your existing `bookmarks.json`
2. **Add new entries**: Follow the same pattern for additional bookmarks
3. **Test conversion**: Run the script to ensure data integrity
4. **Switch workflow**: Use CSV as your primary data source

## Performance

The conversion script processes:
- ✅ **33 bookmarks** in ~2 seconds
- ✅ **8 categories** with full metadata
- ✅ **Complex help systems** with contact methods
- ✅ **Knowledge base integration** with training materials

## Version History

- **v1.0** (2025-01-26)
  - Initial CSV-to-JSON conversion system
  - Complete field mapping from existing JSON structure
  - Automated JavaScript generation
  - Comprehensive validation and error handling
  - Full documentation and examples

## Next Steps

1. **Customize the template** with your organization's bookmarks
2. **Train your team** on the CSV workflow
3. **Set up automation** for regular updates
4. **Integrate with CI/CD** for automatic deployments

---

**Need help?** Check the `CSV-Field-Guide.md` for detailed field documentation and examples.

For general information about the application, see the main [README.md](../README.md).
