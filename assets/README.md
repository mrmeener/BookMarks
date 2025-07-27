# Assets Directory

This directory contains static assets for the BookMark Manager application.

## Company Logo

### Current Logo
- **File**: `company-logo.svg`
- **Format**: SVG (Scalable Vector Graphics)
- **Dimensions**: 80x80 pixels
- **Usage**: Displayed in the top-left corner of the application header

### Replacing the Company Logo

#### Option 1: File Share Storage (Recommended)
1. **Place your logo file on a network file share** accessible to all users
2. **Update the HTML file** (`index.html`) to point to the file share location:
   ```html
   <img src="\\server\share\company-assets\company-logo.svg" alt="Company Logo" class="company-logo">
   ```
3. **Supported formats**: SVG, PNG, JPG, GIF
4. **Recommended size**: 80x80 pixels (will be automatically scaled)

#### Option 2: Local Replacement
1. **Replace the existing file** `assets/company-logo.svg` with your company logo
2. **Keep the same filename** or update the reference in `index.html`
3. **Maintain aspect ratio** for best results

### Logo Requirements

#### Technical Specifications
- **Maximum size**: 80x80 pixels (automatically scaled)
- **Supported formats**: SVG (preferred), PNG, JPG, GIF
- **Background**: Transparent or white background recommended
- **File size**: Keep under 100KB for optimal loading

#### Design Guidelines
- **Simple design** works best at small sizes
- **High contrast** for visibility across different themes
- **Square aspect ratio** (1:1) recommended
- **Professional appearance** suitable for corporate environment

### File Share Setup Examples

#### Windows Network Share
```html
<img src="\\fileserver\company\logos\company-logo.svg" alt="Company Logo" class="company-logo">
```

#### SharePoint/OneDrive
```html
<img src="https://yourcompany.sharepoint.com/sites/assets/company-logo.svg" alt="Company Logo" class="company-logo">
```

#### Local Network Drive
```html
<img src="Z:\company-assets\company-logo.svg" alt="Company Logo" class="company-logo">
```

### Fallback Behavior

If the logo file cannot be loaded (network issues, missing file, etc.), the application will automatically display a styled placeholder with the text "Company Logo".

### Testing Your Logo

1. **Replace the logo file** or update the path
2. **Open `index.html`** in a web browser
3. **Check the top-left corner** of the header
4. **Test different themes** to ensure visibility
5. **Verify on mobile devices** for responsive behavior

### Troubleshooting

#### Logo Not Displaying
- Check file path is correct
- Verify file permissions (read access required)
- Ensure network share is accessible
- Check browser console for error messages

#### Logo Too Large/Small
- Resize image to 80x80 pixels
- Use CSS to adjust if needed
- Consider using SVG for perfect scaling

#### Logo Not Visible on Dark Themes
- Use transparent background
- Add white border or shadow
- Test across all available themes

### Advanced Customization

To modify logo styling, edit the CSS classes in `styles.css`:

```css
.company-logo {
    max-width: 80px;
    max-height: 80px;
    /* Add custom styling here */
}

.logo-placeholder {
    width: 80px;
    height: 80px;
    /* Customize placeholder appearance */
}
```

### Version History

- **v1.0**: Initial SVG placeholder logo with "CO" text
- **v1.1**: Added file share support and comprehensive documentation

---

For technical support or questions about logo implementation, contact your system administrator.

For general information about the application, see the main [README.md](../README.md).
