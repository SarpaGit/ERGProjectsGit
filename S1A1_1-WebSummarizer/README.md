# Web Content Summarizer - Chrome Extension

A Chrome extension that automatically summarizes web page content to help users quickly understand the main points without reading entire articles.

## Features

### Core Functionality
- **Automatic Content Detection**: Intelligently identifies and extracts main content from web pages
- **Smart Parsing**: Distinguishes between navigation, ads, and actual content
- **Multiple Summary Lengths**: Short (1-2 sentences), Medium (3-4 sentences), Long (5-7 sentences)
- **Content Type Recognition**: Handles articles, blog posts, news, documentation, and more

### User Interface
- **Clean Popup Interface**: Modern, minimalist design following Material Design principles
- **Summary Display**: Well-formatted summaries with proper typography
- **Copy to Clipboard**: Easy copying of summaries
- **Share Functionality**: Native sharing when available, clipboard fallback
- **Settings Panel**: Customizable options and preferences

### Content Processing
- **Text Extraction**: Clean extraction of readable text content
- **Language Detection**: Support for multiple languages
- **Format Preservation**: Maintains important formatting (headings, lists, etc.)
- **Image Alt Text**: Includes relevant image descriptions when available

## Installation

### Development Installation

1. **Clone or download** this repository
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer mode** (toggle in top right)
4. **Click "Load unpacked"** and select the extension folder
5. **Pin the extension** to your toolbar for easy access

### Production Installation

1. **Download** the `.crx` file from releases
2. **Drag and drop** the file into Chrome's extensions page
3. **Confirm installation** when prompted

## Usage

### Basic Usage

1. **Navigate** to any web page with content
2. **Click** the extension icon in your toolbar
3. **Wait** for the summary to generate automatically
4. **Adjust length** using the dropdown (Short/Medium/Long)
5. **Copy or share** the summary as needed

### Advanced Features

- **Context Menu**: Right-click selected text to summarize specific portions
- **Keyboard Shortcuts**: Use `Ctrl+Shift+S` to generate summaries
- **Settings**: Customize API providers, themes, and preferences
- **History**: View your summary history and favorites

## Architecture

### File Structure
```
manifest.json
├── popup/
│   ├── popup.html          # Main popup interface
│   ├── popup.css           # Popup styling
│   └── popup.js            # Popup functionality
├── content-scripts/
│   ├── content.js          # Runs on web pages
│   └── content.css         # Content script styles
├── background/
│   └── background.js       # Service worker
├── assets/
│   └── icons/              # Extension icons
└── utils/
    ├── textProcessor.js    # Text processing utilities
    ├── summarizer.js       # Summarization logic
    └── storage.js          # Storage management
```

### Core Components

- **Manifest**: Extension configuration and permissions
- **Popup**: Main user interface for viewing summaries
- **Content Script**: Runs on web pages to extract content
- **Background Script**: Handles API calls and data processing
- **Storage**: Local storage for user preferences and history

## Development

### Prerequisites

- **Chrome Browser** (version 88+)
- **Basic knowledge** of HTML, CSS, and JavaScript
- **Chrome Extension APIs** understanding

### Setup Development Environment

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd web-content-summarizer
   ```

2. **Load in Chrome**:
   - Open `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the project folder

3. **Make changes** and reload the extension

### Building

Currently, the extension is loaded directly from source. For production:

1. **Minify** JavaScript and CSS files
2. **Optimize** images and assets
3. **Package** as `.crx` or `.zip` for Chrome Web Store

## Configuration

### Settings

The extension supports various configurable options:

- **Summary Length**: Default summary length preference
- **API Provider**: Choose between local, OpenAI, or Claude
- **Theme**: Light or dark mode
- **Language**: Preferred language for summaries
- **Notifications**: Enable/disable summary notifications

### API Configuration

To use AI-powered summarization:

1. **Get API keys** from OpenAI or Anthropic
2. **Open extension settings**
3. **Enter your API keys**
4. **Select your preferred provider**

## API Integration

### Current Status

- **Phase 1**: Basic extension structure ✅
- **Phase 2**: Content extraction and local summarization ✅
- **Phase 3**: AI API integration (OpenAI, Claude) 🔄
- **Phase 4**: Advanced features and optimization 📋

### Planned AI Features

- **OpenAI GPT Integration**: High-quality abstractive summaries
- **Claude Integration**: Alternative AI provider
- **Hybrid Summarization**: Combine extractive and abstractive approaches
- **Multi-language Support**: Summarize content in different languages

## Testing

### Manual Testing

1. **Test on different websites**:
   - News articles
   - Blog posts
   - Documentation
   - Research papers

2. **Test different content types**:
   - Short articles
   - Long-form content
   - Technical documentation
   - Multi-language content

### Automated Testing

- **Unit tests** for utility functions
- **Integration tests** for extension components
- **End-to-end tests** for user workflows

## Troubleshooting

### Common Issues

1. **Extension not loading**:
   - Check Chrome version compatibility
   - Verify manifest.json syntax
   - Check browser console for errors

2. **Summaries not generating**:
   - Ensure content script is running
   - Check for JavaScript errors
   - Verify page has readable content

3. **API errors**:
   - Verify API keys are correct
   - Check API rate limits
   - Ensure internet connectivity

### Debug Mode

Enable debug logging:

1. **Open extension popup**
2. **Right-click** and select "Inspect"
3. **Check console** for detailed logs

## Contributing

### Development Guidelines

1. **Follow existing code style** and structure
2. **Add comments** for complex logic
3. **Test changes** thoroughly
4. **Update documentation** as needed

### Code Style

- **JavaScript**: ES6+ with async/await
- **CSS**: BEM methodology for class naming
- **HTML**: Semantic markup with accessibility in mind

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

### Getting Help

- **Issues**: Report bugs and feature requests on GitHub
- **Discussions**: Ask questions in GitHub Discussions
- **Documentation**: Check this README and inline code comments

### Community

- **Contributors**: Welcome contributions from the community
- **Feedback**: Share your experience and suggestions
- **Testing**: Help test on different websites and content types

## Roadmap

### Short Term (Next 2-4 weeks)
- [ ] AI API integration (OpenAI, Claude)
- [ ] Improved content extraction algorithms
- [ ] Better error handling and user feedback
- [ ] Performance optimization

### Medium Term (Next 2-3 months)
- [ ] Multi-language support
- [ ] Advanced summarization strategies
- [ ] Export and sharing features
- [ ] User analytics and insights

### Long Term (Next 6-12 months)
- [ ] Firefox and Edge compatibility
- [ ] Mobile companion app
- [ ] Enterprise features
- [ ] Machine learning improvements

## Acknowledgments

- **Chrome Extension APIs** for the development platform
- **OpenAI and Anthropic** for AI summarization capabilities
- **Open source community** for inspiration and tools
- **Early users and testers** for valuable feedback

---

**Note**: This extension is currently in active development. Features and functionality may change between versions. Please report any issues or suggestions for improvement.
