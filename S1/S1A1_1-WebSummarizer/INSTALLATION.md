# Installation Guide for Web Content Summarizer

This guide will help you install and test the Web Content Summarizer Chrome extension in development mode.

## Prerequisites

- **Google Chrome Browser** (version 88 or higher)
- **Basic knowledge** of Chrome extensions
- **Development environment** set up

## Step-by-Step Installation

### 1. Download the Extension

1. **Clone or download** this repository to your local machine
2. **Navigate** to the `CodeSessions/S1-WebSummarizer` folder
3. **Ensure all files** are present (manifest.json, popup/, content-scripts/, etc.)

### 2. Open Chrome Extensions Page

1. **Open Google Chrome**
2. **Navigate** to `chrome://extensions/`
3. **Enable Developer mode** by toggling the switch in the top-right corner

### 3. Load the Extension

1. **Click "Load unpacked"** button
2. **Select the extension folder** (`CodeSessions/S1-WebSummarizer`)
3. **Verify installation** - you should see the extension appear in the list

### 4. Pin the Extension

1. **Click the puzzle piece icon** in Chrome's toolbar
2. **Find "Web Content Summarizer"** in the dropdown
3. **Click the pin icon** to keep it visible in your toolbar

## Testing the Extension

### 1. Basic Functionality Test

1. **Open the test page**: `test-page.html` (included in the project)
2. **Click the extension icon** in your toolbar
3. **Wait for summary generation** (should take a few seconds)
4. **Verify the summary appears** with proper formatting

### 2. Test Different Summary Lengths

1. **Use the dropdown** to select different lengths:
   - **Short**: 1-2 sentences
   - **Medium**: 3-4 sentences (default)
   - **Long**: 5-7 sentences
2. **Click refresh button** to regenerate summaries
3. **Observe length differences** in generated summaries

### 3. Test Copy and Share Features

1. **Generate a summary**
2. **Click "Copy Summary"** button
3. **Paste elsewhere** to verify copying works
4. **Test share functionality** (if supported by your system)

### 4. Test on Real Websites

1. **Navigate to a news article** or blog post
2. **Click the extension icon**
3. **Verify content extraction** works on different site layouts
4. **Test with various content types** (articles, documentation, etc.)

## Troubleshooting

### Common Issues

#### Service Worker Registration Failed
- **Error**: `Service worker registration failed. Status code: 15`
- **Solution**: Reload the extension using the refresh button
- **Check**: Ensure Chrome version is 88+ and Developer mode is enabled

#### Extension Not Loading
- **Check manifest.json** syntax for errors
- **Verify all required files** are present
- **Check Chrome version** compatibility
- **Look for errors** in the extensions page

#### Summaries Not Generating
- **Check browser console** for JavaScript errors
- **Verify content script** is running on the page
- **Ensure page has readable content**
- **Check for permission issues**

#### UI Not Displaying Properly
- **Verify CSS files** are loading correctly
- **Check for JavaScript errors** in popup console
- **Ensure all HTML elements** have proper IDs

### Quick Fixes

If you encounter errors:
1. **Reload the extension** (refresh button in extensions page)
2. **Restart Chrome** completely
3. **Check the troubleshooting guide** (`TROUBLESHOOTING.md`)
4. **Test with the included test page** first

### Debug Mode

1. **Right-click the extension icon**
2. **Select "Inspect popup"**
3. **Check the console** for error messages
4. **Examine network requests** and responses

### Content Script Debugging

1. **Open the target webpage**
2. **Right-click and select "Inspect"**
3. **Go to Console tab**
4. **Look for messages** from the content script

## Development Workflow

### Making Changes

1. **Edit source files** (HTML, CSS, JavaScript)
2. **Save changes**
3. **Go to extensions page** (`chrome://extensions/`)
4. **Click the refresh icon** on your extension
5. **Test changes** immediately

### Reloading the Extension

- **Manual reload**: Click refresh icon on extensions page
- **Automatic reload**: Some IDEs can auto-reload extensions
- **Full restart**: Close and reopen Chrome if needed

## File Structure Reference

```
CodeSessions/S1-WebSummarizer/
├── manifest.json              # Extension configuration
├── popup/                     # Popup interface
│   ├── popup.html            # Main popup HTML
│   ├── popup.css             # Popup styling
│   └── popup.js              # Popup functionality
├── content-scripts/           # Content extraction
│   ├── content.js            # Main content script
│   └── content.css           # Content script styles
├── background/                # Background service
│   └── background.js         # Service worker
├── utils/                     # Utility functions
│   ├── textProcessor.js      # Text processing
│   ├── summarizer.js         # Summarization logic
│   └── storage.js            # Storage management
├── assets/icons/              # Extension icons
├── test-page.html            # Test page for development
├── README.md                 # Project documentation
├── INSTALLATION.md           # This file
└── package.json              # Project metadata
```

## Next Steps

### Phase 1: Foundation ✅
- Basic extension structure implemented
- Popup interface created
- Content extraction working
- Local summarization functional

### Phase 2: Content Extraction ✅
- Content detection algorithms implemented
- Text processing utilities created
- Basic summarization working

### Phase 3: AI Integration 🔄
- Integrate with OpenAI API
- Add Claude API support
- Implement hybrid summarization

### Phase 4: Advanced Features 📋
- Multi-language support
- Export functionality
- Advanced settings
- Performance optimization

## Support

If you encounter issues:

1. **Check this guide** for common solutions
2. **Review the README.md** for detailed information
3. **Examine console logs** for error messages
4. **Verify file permissions** and paths
5. **Test with the included test page** first

## Notes

- **This is a development version** - not ready for production use
- **Icon files are placeholders** - replace with actual PNG icons
- **AI integration** requires API keys and is not yet implemented
- **Performance optimization** will be addressed in later phases

---

**Happy Testing!** 🚀

The extension should now be working and ready for development and testing.
