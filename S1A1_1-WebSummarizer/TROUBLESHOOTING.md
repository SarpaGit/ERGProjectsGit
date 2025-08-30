# Troubleshooting Guide for Web Content Summarizer

This guide helps resolve common issues when installing and using the Chrome extension.

## Common Error Messages and Solutions

### 1. Service Worker Registration Failed

**Error**: `Service worker registration failed. Status code: 15`

**Cause**: Usually related to context menu API or other Chrome extension APIs

**Solution**: 
1. **Reload the extension**:
   - Go to `chrome://extensions/`
   - Find "Web Content Summarizer"
   - Click the refresh/reload icon
2. **Check Chrome version**: Ensure you're using Chrome 88+
3. **Clear browser cache**: Clear browsing data for the extension

### 2. Cannot Read Properties of Undefined

**Error**: `Uncaught TypeError: Cannot read properties of undefined (reading 'create')`

**Cause**: Chrome extension API not available or not properly loaded

**Solution**:
1. **Check manifest.json**: Ensure all required permissions are listed
2. **Reload extension**: Use the refresh button in extensions page
3. **Restart Chrome**: Close and reopen the browser completely

### 3. Extension Not Loading

**Symptoms**: Extension appears in list but doesn't work

**Solutions**:
1. **Check file structure**: Ensure all files are in correct locations
2. **Verify manifest.json**: Check for syntax errors
3. **Enable Developer mode**: Toggle on in extensions page
4. **Check console errors**: Right-click extension icon → Inspect popup

### 4. Summaries Not Generating

**Symptoms**: Extension loads but no summaries appear

**Solutions**:
1. **Check content script**: Ensure it's running on the page
2. **Verify page content**: Page must have readable text content
3. **Check console errors**: Look for JavaScript errors
4. **Test on simple page**: Try the included `test-page.html` first

### 5. Popup Not Displaying

**Symptoms**: Clicking extension icon shows nothing

**Solutions**:
1. **Check popup files**: Ensure popup.html, popup.css, popup.js exist
2. **Verify file paths**: Check manifest.json popup path
3. **Inspect popup**: Right-click icon → Inspect popup
4. **Check for JavaScript errors**: Look in popup console

## Step-by-Step Debugging

### Step 1: Verify Installation

1. **Open Chrome** and go to `chrome://extensions/`
2. **Enable Developer mode** (top-right toggle)
3. **Check extension list** for "Web Content Summarizer"
4. **Verify status** shows "Enabled" with no error messages

### Step 2: Check File Structure

Ensure your directory structure matches:
```
CodeSessions/S1-WebSummarizer/
├── manifest.json
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content-scripts/
│   ├── content.js
│   └── content.css
├── background/
│   └── background.js
└── utils/
    ├── textProcessor.js
    ├── summarizer.js
    └── storage.js
```

### Step 3: Test Basic Functionality

1. **Open test page**: Use the included `test-page.html`
2. **Click extension icon**: Should open popup
3. **Wait for summary**: Should generate automatically
4. **Check console**: Right-click popup → Inspect → Console

### Step 4: Check Console Errors

1. **Open popup console**:
   - Right-click extension icon
   - Select "Inspect popup"
   - Go to Console tab
2. **Look for error messages**:
   - Red error text
   - Failed network requests
   - JavaScript exceptions

### Step 5: Verify Content Script

1. **Open target webpage**
2. **Right-click → Inspect**
3. **Go to Console tab**
4. **Look for messages** from content script
5. **Check for errors** related to content extraction

## Common Permission Issues

### Missing Permissions

If you see permission-related errors, ensure `manifest.json` includes:

```json
"permissions": [
  "activeTab",
  "storage",
  "scripting",
  "contextMenus"
],
"host_permissions": [
  "<all_urls>"
]
```

### Content Security Policy

If you see CSP errors, check that `manifest.json` includes:

```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self'"
}
```

## Performance Issues

### Slow Summary Generation

**Causes**:
- Large page content
- Complex page structure
- Browser performance issues

**Solutions**:
1. **Wait longer**: Large pages take more time
2. **Check page size**: Very long articles may timeout
3. **Refresh extension**: Reload if stuck

### Memory Issues

**Symptoms**: Browser becomes slow or crashes

**Solutions**:
1. **Close unused tabs**
2. **Restart browser**
3. **Check extension memory usage**

## Browser Compatibility

### Chrome Version Requirements

- **Minimum**: Chrome 88+
- **Recommended**: Chrome 100+
- **Latest**: Chrome 120+

### Other Browsers

- **Firefox**: Not yet supported (planned for future)
- **Edge**: Should work (Chromium-based)
- **Safari**: Not supported (different extension system)

## Testing Checklist

Before reporting an issue, verify:

- [ ] Chrome version is 88 or higher
- [ ] Developer mode is enabled
- [ ] All files are in correct locations
- [ ] Extension shows as "Enabled"
- [ ] Test page (`test-page.html`) works
- [ ] Console shows no critical errors
- [ ] Content script is running on target page

## Getting Help

If you still have issues:

1. **Check this guide** for your specific error
2. **Review console logs** for detailed error messages
3. **Test with included test page** first
4. **Check file permissions** and paths
5. **Try on different websites** to isolate the issue

## Common Solutions Summary

| Issue | Quick Fix |
|-------|-----------|
| Service worker failed | Reload extension |
| Undefined API errors | Restart Chrome |
| No summaries | Check page content |
| Popup not showing | Verify file paths |
| Context menu not working | Check permissions |

---

**Remember**: Most issues can be resolved by reloading the extension or restarting Chrome. The extension is designed to be robust and handle errors gracefully.
