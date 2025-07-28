# BookMark Manager JSON Template v2.2.7

## Overview

This comprehensive JSON template (`bookmarks-template.json`) provides sysadmins with a complete reference for creating bookmark data that covers all features of the BookMark Manager application, including the new desktop application support.

## Quick Start

1. **Copy the template**:
   ```bash
   cp bookmarks-template.json my-bookmarks.json
   ```

2. **Edit with your organization's data**:
   ```bash
   # Use any text editor or JSON editor
   notepad my-bookmarks.json
   # or
   code my-bookmarks.json
   ```

3. **Generate the JavaScript file**:
   ```powershell
   .\Generate\Generate-BookmarksJS.ps1 -InputFile my-bookmarks.json
   ```

4. **Test the result**:
   ```bash
   # Open in browser to verify
   start index.html
   ```

## Template Features

### ✅ Complete Feature Coverage

This template demonstrates **every available field and feature**:

- **Web Bookmarks**: Traditional URL-based bookmarks
- **Desktop Applications**: Software applications with installation guidance
- **Help System Types**: All 3 support types (help, split-help, approval-process)
- **Contact Methods**: All 4 contact types (email, phone, meeting, self-service)
- **Knowledge Base**: Training, policies, quick reference, external links
- **Category Organization**: Colors, descriptions, collapse states
- **Tag System**: Flexible bookmark organization
- **Installation Guidance**: Desktop app requirements and steps
- **Approval Processes**: Complex approval workflows with requirements

### 📋 Template Structure

```json
{
  "_comments": { /* Template documentation */ },
  "settings": {
    "helpSystem": { /* Help system configuration */ },
    "defaultTheme": "corporate-blue",
    "version": "2.2.7",
    "helpDesk": { /* Email templates and support topics */ }
  },
  "categories": [
    {
      "name": "Category Name",
      "id": "category-id",
      "color": "#HEX-COLOR",
      "description": "Category description",
      "collapsed": false,
      "bookmarks": [ /* Array of bookmark objects */ ]
    }
  ]
}
```

## Bookmark Types

### Web Bookmarks

```json
{
  "name": "Service Name",
  "url": "https://example.com",
  "logo": "https://img.icons8.com/color/48/icon.png",
  "type": "web",
  "supportType": "help|split-help|approval-process",
  "tags": ["tag1", "tag2", "tag3"],
  "description": "Service description",
  "helpDescription": "Help system description",
  "helpPurpose": "What this service is used for",
  "accessLevel": "Standard User|Admin|Restricted",
  "contactMethod": { /* Contact configuration */ },
  "knowledgeBase": { /* Training and documentation */ }
}
```

### Desktop Applications

```json
{
  "name": "Application Name",
  "url": "Application Display Name",
  "logo": "https://img.icons8.com/color/48/icon.png",
  "type": "desktop",
  "supportType": "help|split-help|approval-process",
  "tags": ["software", "desktop", "productivity"],
  "description": "Application description",
  "installationGuidance": {
    "requirements": ["System requirements"],
    "installationSteps": ["Step-by-step instructions"],
    "troubleshooting": ["Common issues and solutions"],
    "recommendedExtensions": ["Optional: for development tools"]
  },
  "approvalInfo": { /* For approval-process type only */ },
  "contactMethod": { /* Contact configuration */ },
  "knowledgeBase": { /* Training and documentation */ }
}
```

## Support Types

### 1. Help (Self-Service)
```json
{
  "supportType": "help",
  "contactMethod": {
    "type": "self-service",
    "email": "support@company.com"
  }
}
```

### 2. Split Help (Documentation + Support)
```json
{
  "supportType": "split-help",
  "contactMethod": {
    "type": "email",
    "email": "team-support@company.com",
    "person": "Support Team Name",
    "responseTime": "4-6 hours during business hours"
  }
}
```

### 3. Approval Process (Restricted Access)
```json
{
  "supportType": "approval-process",
  "approvalInfo": {
    "approver": "Manager Title",
    "requirements": [
      "Business justification",
      "Manager approval",
      "Training completion"
    ],
    "process": "Detailed approval process description",
    "estimatedTime": "3-5 business days",
    "costCenter": "Department Name",
    "licenseType": "License Type"
  },
  "contactMethod": {
    "type": "email",
    "email": "approvals@company.com",
    "person": "Approval Team",
    "responseTime": "24 hours for approval requests"
  }
}
```

## Contact Methods

### Email Support
```json
{
  "type": "email",
  "email": "support@company.com",
  "person": "Support Team Name",
  "responseTime": "Response time expectation"
}
```

### Phone Support
```json
{
  "type": "phone",
  "phone": "+1-555-0123",
  "extension": "2847",
  "person": "Help Desk",
  "hours": "Monday-Friday 8:00 AM - 6:00 PM EST",
  "callScript": "Suggested script for calling"
}
```

### Meeting-Based Support
```json
{
  "type": "meeting",
  "person": "Team Name",
  "meetingSubject": "Meeting Subject Template",
  "meetingSlots": [
    "Tuesday 2:00-4:00 PM",
    "Thursday 10:00 AM-12:00 PM"
  ],
  "bookingInstructions": "How to book the meeting"
}
```

### Self-Service
```json
{
  "type": "self-service",
  "email": "general-support@company.com"
}
```

## Knowledge Base Integration

```json
{
  "knowledgeBase": {
    "training": [
      {
        "title": "Training Course Name",
        "url": "/docs/training/course.md",
        "description": "Course description",
        "estimatedTime": "4 hours",
        "level": "Beginner|Intermediate|Advanced",
        "prerequisites": ["Optional prerequisites"],
        "required": true
      }
    ],
    "quickReference": [
      {
        "title": "Quick Reference Guide",
        "url": "/docs/quick-reference/guide.md",
        "description": "Quick reference description"
      }
    ],
    "policies": [
      {
        "title": "Usage Policy",
        "url": "/docs/policies/policy.md",
        "description": "Policy description"
      }
    ],
    "externalLinks": [
      {
        "title": "External Resource",
        "url": "https://external-site.com",
        "description": "External resource description"
      }
    ]
  }
}
```

## Customization Guide

### 1. Organization Settings

Update the global settings for your organization:

```json
{
  "settings": {
    "defaultTheme": "corporate-blue",
    "version": "2.2.7",
    "helpDesk": {
      "defaultEmail": "your-helpdesk@company.com",
      "emailSubjectTemplate": "Help Request: {serviceName}"
    }
  }
}
```

### 2. Category Colors

Use your organization's brand colors:

```json
{
  "color": "#0078D4",  // Microsoft Blue
  "color": "#FF0000",  // Red
  "color": "#00AA00",  // Green
  "color": "#FFA500"   // Orange
}
```

### 3. Logo URLs

Replace with your organization's icons:

```json
{
  "logo": "https://your-cdn.com/icons/service-icon.png",
  "logo": "/assets/local-icon.png",
  "logo": "https://img.icons8.com/color/48/icon-name.png"
}
```

### 4. Internal URLs

Update paths to match your environment:

```json
{
  "url": "https://your-domain.com/service",
  "url": "https://intranet.company.com/portal",
  "training": "/docs/training/your-guide.md"
}
```

## Validation

### JSON Syntax Validation

```bash
# Use any JSON validator
python -m json.tool bookmarks-template.json
# or
jq . bookmarks-template.json
```

### Required Fields

Ensure these fields are present for each bookmark:
- `name` (string)
- `url` (string)
- `type` ("web" or "desktop")
- `supportType` ("help", "split-help", or "approval-process")
- `description` (string)

### Desktop Application Fields

For desktop applications, ensure:
- `type` is set to `"desktop"`
- `installationGuidance` object is present
- `url` contains application name, not a web URL

## Best Practices

### 1. Consistent Naming
- Use clear, descriptive bookmark names
- Follow consistent category naming conventions
- Use meaningful tag names

### 2. Comprehensive Descriptions
- Provide clear, concise descriptions
- Include the purpose and target audience
- Mention any prerequisites or requirements

### 3. Accurate Contact Information
- Verify all email addresses and phone numbers
- Include realistic response time expectations
- Provide clear escalation paths

### 4. Up-to-Date Training Materials
- Link to current documentation
- Include estimated completion times
- Specify skill level requirements

### 5. Proper Access Levels
- Clearly indicate who can access each service
- Document approval requirements
- Include cost center information where relevant

## Deployment Workflow

### 1. Development Environment
```bash
# Create development copy
cp bookmarks-template.json dev-bookmarks.json

# Edit and test
code dev-bookmarks.json
.\Generate\Generate-BookmarksJS.ps1 -InputFile dev-bookmarks.json
start index.html
```

### 2. Staging Environment
```bash
# Copy to staging
cp dev-bookmarks.json staging-bookmarks.json

# Generate staging version
.\Generate\Generate-BookmarksJS.ps1 -InputFile staging-bookmarks.json -OutputFile staging-bookmarks.js

# Deploy to staging server
copy staging-bookmarks.js \\staging-server\bookmarks\
```

### 3. Production Deployment
```bash
# Final production copy
cp staging-bookmarks.json bookmarks.json

# Generate production version
.\Generate\Generate-BookmarksJS.ps1

# Deploy to production
copy bookmarks.js \\production-server\bookmarks\
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| JSON syntax error | Use JSON validator to find syntax issues |
| Missing required fields | Check that name, url, type, supportType are present |
| Invalid contact method | Verify contact type is email, phone, meeting, or self-service |
| Desktop app not showing correctly | Ensure type is "desktop" and installationGuidance is present |
| Approval process not working | Check that approvalInfo object is complete |

### Validation Checklist

- [ ] JSON syntax is valid
- [ ] All required fields are present
- [ ] Contact information is accurate
- [ ] URLs are accessible
- [ ] Training links work
- [ ] Desktop apps have installation guidance
- [ ] Approval processes are complete
- [ ] Tags are meaningful and consistent
- [ ] Descriptions are clear and helpful

## Support

For questions about this template:

1. **Check the documentation**: Review this README and the main project documentation
2. **Validate your JSON**: Use online JSON validators to check syntax
3. **Test incrementally**: Add bookmarks one at a time to isolate issues
4. **Review examples**: Use the provided examples as reference

## Version History

- **v2.2.7** (2025-07-28): Added desktop application support and comprehensive template
- **v2.2.0** (2025-07-27): Enhanced help system and approval processes
- **v2.1.0** (2025-07-26): Added knowledge base integration
- **v2.0.0** (2025-07-25): Major redesign with contact methods

---

**Template File**: `bookmarks-template.json`  
**Generated Output**: `bookmarks.js`  
**Last Updated**: July 28, 2025  
**Version**: 2.2.7
