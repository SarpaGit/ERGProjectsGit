# Web Content Summarizer - Comprehensive Test Cases

## Overview
This document outlines comprehensive test cases for the Web Content Summarizer Chrome extension, covering all major functionality, edge cases, and integration scenarios.

## Test Categories

### 1. Unit Tests

#### 1.1 TextProcessor Class Tests
**File**: `utils/textProcessor.js`

```javascript
// Test Case 1.1.1: cleanText() method
describe('TextProcessor.cleanText()', () => {
  test('should remove HTML tags', () => {
    const input = '<p>Hello <b>world</b></p>';
    const expected = 'Hello world';
    expect(textProcessor.cleanText(input)).toBe(expected);
  });

  test('should normalize whitespace', () => {
    const input = 'Hello    world\n\ntest';
    const expected = 'Hello world test';
    expect(textProcessor.cleanText(input)).toBe(expected);
  });

  test('should remove unwanted patterns', () => {
    const input = 'Hello [advertisement] world (sponsored content)';
    const expected = 'Hello world';
    expect(textProcessor.cleanText(input)).toBe(expected);
  });

  test('should handle empty input', () => {
    expect(textProcessor.cleanText('')).toBe('');
    expect(textProcessor.cleanText(null)).toBe('');
    expect(textProcessor.cleanText(undefined)).toBe('');
  });

  test('should remove control characters', () => {
    const input = 'Hello\x00\x1F world\x7F\x9F';
    const expected = 'Hello world';
    expect(textProcessor.cleanText(input)).toBe(expected);
  });
});

// Test Case 1.1.2: splitIntoSentences() method
describe('TextProcessor.splitIntoSentences()', () => {
  test('should split text into sentences correctly', () => {
    const input = 'First sentence. Second sentence! Third sentence?';
    const expected = ['First sentence', 'Second sentence', 'Third sentence'];
    expect(textProcessor.splitIntoSentences(input)).toEqual(expected);
  });

  test('should filter out short sentences', () => {
    const input = 'Hi. This is a proper sentence. OK.';
    const expected = ['This is a proper sentence'];
    expect(textProcessor.splitIntoSentences(input)).toEqual(expected);
  });

  test('should handle empty input', () => {
    expect(textProcessor.splitIntoSentences('')).toEqual([]);
    expect(textProcessor.splitIntoSentences(null)).toEqual([]);
  });
});

// Test Case 1.1.3: countWords() method
describe('TextProcessor.countWords()', () => {
  test('should count words correctly', () => {
    const input = 'Hello world this is a test';
    expect(textProcessor.countWords(input)).toBe(6);
  });

  test('should handle multiple spaces', () => {
    const input = 'Hello    world   test';
    expect(textProcessor.countWords(input)).toBe(3);
  });

  test('should handle empty input', () => {
    expect(textProcessor.countWords('')).toBe(0);
    expect(textProcessor.countWords(null)).toBe(0);
  });
});

// Test Case 1.1.4: detectLanguage() method
describe('TextProcessor.detectLanguage()', () => {
  test('should detect English', () => {
    const input = 'The quick brown fox jumps over the lazy dog and runs away';
    expect(textProcessor.detectLanguage(input)).toBe('en');
  });

  test('should detect French', () => {
    const input = 'Le renard brun saute par-dessus le chien paresseux et court';
    expect(textProcessor.detectLanguage(input)).toBe('fr');
  });

  test('should default to English for unknown', () => {
    const input = 'Random text without clear indicators';
    expect(textProcessor.detectLanguage(input)).toBe('en');
  });

  test('should handle empty input', () => {
    expect(textProcessor.detectLanguage('')).toBe('en');
  });
});

// Test Case 1.1.5: truncateText() method
describe('TextProcessor.truncateText()', () => {
  test('should truncate text correctly', () => {
    const input = 'This is a very long text that needs to be truncated';
    const result = textProcessor.truncateText(input, 20);
    expect(result.length).toBeLessThanOrEqual(23); // 20 + '...'
    expect(result).toContain('...');
  });

  test('should not truncate short text', () => {
    const input = 'Short text';
    const result = textProcessor.truncateText(input, 50);
    expect(result).toBe(input);
  });

  test('should truncate at word boundary', () => {
    const input = 'This is a test sentence';
    const result = textProcessor.truncateText(input, 10);
    expect(result).not.toContain('tes'); // Should not cut in middle of word
  });
});
```

#### 1.2 Summarizer Class Tests
**File**: `utils/summarizer.js`

```javascript
// Test Case 1.2.1: generateSummary() method
describe('Summarizer.generateSummary()', () => {
  test('should generate short summary', async () => {
    const input = 'First sentence. Second sentence. Third sentence. Fourth sentence.';
    const result = await summarizer.generateSummary(input, 'short');
    expect(result.split('.').length).toBeLessThanOrEqual(2);
  });

  test('should generate medium summary', async () => {
    const input = 'First sentence. Second sentence. Third sentence. Fourth sentence. Fifth sentence.';
    const result = await summarizer.generateSummary(input, 'medium');
    const sentences = result.split('.').filter(s => s.trim().length > 0);
    expect(sentences.length).toBeLessThanOrEqual(4);
  });

  test('should generate long summary', async () => {
    const input = 'First sentence. Second sentence. Third sentence. Fourth sentence. Fifth sentence. Sixth sentence. Seventh sentence.';
    const result = await summarizer.generateSummary(input, 'long');
    const sentences = result.split('.').filter(s => s.trim().length > 0);
    expect(sentences.length).toBeLessThanOrEqual(6);
  });

  test('should handle empty input', async () => {
    await expect(summarizer.generateSummary('')).rejects.toThrow('No text provided');
  });

  test('should handle null input', async () => {
    await expect(summarizer.generateSummary(null)).rejects.toThrow('No text provided');
  });
});

// Test Case 1.2.2: calculateSentenceScore() method
describe('Summarizer.calculateSentenceScore()', () => {
  test('should score sentences with important keywords higher', () => {
    const importantSentence = 'This is an important and critical statement.';
    const normalSentence = 'This is a regular statement.';
    
    const importantScore = summarizer.calculateSentenceScore(importantSentence);
    const normalScore = summarizer.calculateSentenceScore(normalSentence);
    
    expect(importantScore).toBeGreaterThan(normalScore);
  });

  test('should score medium-length sentences higher', () => {
    const shortSentence = 'Short.';
    const mediumSentence = 'This is a medium length sentence with good content.';
    const longSentence = 'This is an extremely long sentence that goes on and on with too much information that might not be necessary for a good summary.';
    
    const shortScore = summarizer.calculateSentenceScore(shortSentence);
    const mediumScore = summarizer.calculateSentenceScore(mediumSentence);
    const longScore = summarizer.calculateSentenceScore(longSentence);
    
    expect(mediumScore).toBeGreaterThan(shortScore);
    expect(mediumScore).toBeGreaterThan(longScore);
  });

  test('should score questions higher', () => {
    const question = 'What is the main point?';
    const statement = 'This is the main point.';
    
    const questionScore = summarizer.calculateSentenceScore(question);
    const statementScore = summarizer.calculateSentenceScore(statement);
    
    expect(questionScore).toBeGreaterThan(statementScore);
  });
});

// Test Case 1.2.3: extractiveSummarization() method
describe('Summarizer.extractiveSummarization()', () => {
  test('should select highest scoring sentences', async () => {
    const input = 'Low score sentence. This is an important and critical sentence with key information. Another low score sentence. This significant sentence contains essential data.';
    const result = await summarizer.extractiveSummarization(input, 'short');
    
    expect(result).toContain('important');
    expect(result).toContain('critical');
  });

  test('should maintain original sentence order', async () => {
    const input = 'First sentence is important. Second sentence. Third sentence is critical.';
    const result = await summarizer.extractiveSummarization(input, 'medium');
    
    const firstPos = result.indexOf('First');
    const thirdPos = result.indexOf('Third');
    
    if (firstPos !== -1 && thirdPos !== -1) {
      expect(firstPos).toBeLessThan(thirdPos);
    }
  });
});
```

#### 1.3 AIServiceManager Class Tests
**File**: `utils/aiService.js`

```javascript
// Test Case 1.3.1: Initialize method
describe('AIServiceManager.initialize()', () => {
  test('should initialize with valid config', async () => {
    const config = {
      provider: 'openai',
      openaiApiKey: 'test-key'
    };
    
    await aiService.initialize(config);
    expect(aiService.apiConfig).toEqual(config);
  });

  test('should handle empty config', async () => {
    await expect(aiService.initialize({})).not.toThrow();
  });
});

// Test Case 1.3.2: Provider validation
describe('AIServiceManager provider methods', () => {
  test('should identify available providers', () => {
    const providers = aiService.getAvailableProviders();
    expect(providers).toContain('openai');
    expect(providers).toContain('claude');
    expect(providers).toContain('gemini');
    expect(providers).toContain('local');
  });

  test('should check provider configuration correctly', () => {
    aiService.apiConfig = { openaiApiKey: 'test-key' };
    expect(aiService.isProviderConfigured('openai')).toBe(true);
    expect(aiService.isProviderConfigured('claude')).toBe(false);
    expect(aiService.isProviderConfigured('local')).toBe(true);
  });
});

// Test Case 1.3.3: Prompt creation
describe('AIServiceManager prompt creation', () => {
  test('should create OpenAI prompt correctly', () => {
    const text = 'Test content';
    const prompt = aiService.createOpenAIPrompt(text, 'medium');
    
    expect(prompt).toContain('3-4 sentences');
    expect(prompt).toContain(text);
    expect(prompt).toContain('Summary:');
  });

  test('should create Claude prompt correctly', () => {
    const text = 'Test content';
    const prompt = aiService.createClaudePrompt(text, 'short');
    
    expect(prompt).toContain('1-2 sentences');
    expect(prompt).toContain(text);
  });

  test('should create Gemini prompt correctly', () => {
    const text = 'Test content';
    const prompt = aiService.createGeminiPrompt(text, 'long');
    
    expect(prompt).toContain('5-7 sentences');
    expect(prompt).toContain(text);
  });
});

// Test Case 1.3.4: Token limits
describe('AIServiceManager.getMaxTokens()', () => {
  test('should return correct token limits', () => {
    expect(aiService.getMaxTokens('short')).toBe(150);
    expect(aiService.getMaxTokens('medium')).toBe(250);
    expect(aiService.getMaxTokens('long')).toBe(400);
    expect(aiService.getMaxTokens('invalid')).toBe(250); // default
  });
});
```

### 2. Integration Tests

#### 2.1 Content Script Integration Tests
**File**: `content-scripts/content.js`

```javascript
// Test Case 2.1.1: Message handling
describe('ContentExtractor message handling', () => {
  test('should handle getPageInfo request', async () => {
    const mockSendResponse = jest.fn();
    const request = { action: 'getPageInfo' };
    
    await contentExtractor.handleMessage(request, null, mockSendResponse);
    
    expect(mockSendResponse).toHaveBeenCalledWith({
      success: true,
      contentType: expect.any(String),
      wordCount: expect.any(Number)
    });
  });

  test('should handle extractContent request', async () => {
    const mockSendResponse = jest.fn();
    const request = { 
      action: 'extractContent', 
      summaryLength: 'medium' 
    };
    
    await contentExtractor.handleMessage(request, null, mockSendResponse);
    
    expect(mockSendResponse).toHaveBeenCalledWith({
      success: true,
      summary: expect.any(String)
    });
  });

  test('should handle unknown action', async () => {
    const mockSendResponse = jest.fn();
    const request = { action: 'unknownAction' };
    
    await contentExtractor.handleMessage(request, null, mockSendResponse);
    
    expect(mockSendResponse).toHaveBeenCalledWith({
      success: false,
      error: 'Unknown action'
    });
  });
});

// Test Case 2.1.2: Content extraction
describe('ContentExtractor content extraction', () => {
  test('should extract main content from article element', () => {
    document.body.innerHTML = `
      <nav>Navigation</nav>
      <article>Main article content here</article>
      <footer>Footer</footer>
    `;
    
    const content = contentExtractor.extractMainText();
    expect(content).toContain('Main article content');
    expect(content).not.toContain('Navigation');
    expect(content).not.toContain('Footer');
  });

  test('should extract content from main element', () => {
    document.body.innerHTML = `
      <header>Header</header>
      <main>Main content section</main>
      <aside>Sidebar</aside>
    `;
    
    const content = contentExtractor.extractMainText();
    expect(content).toContain('Main content section');
    expect(content).not.toContain('Header');
    expect(content).not.toContain('Sidebar');
  });

  test('should fallback to body when no main content found', () => {
    document.body.innerHTML = `
      <div>Some content without semantic tags</div>
    `;
    
    const content = contentExtractor.extractMainText();
    expect(content).toContain('Some content without semantic tags');
  });
});

// Test Case 2.1.3: Content type detection
describe('ContentExtractor.detectContentType()', () => {
  test('should detect news articles', () => {
    Object.defineProperty(window, 'location', {
      value: { href: 'https://news.example.com/article/123' }
    });
    document.title = 'Breaking News Story';
    
    const contentType = contentExtractor.detectContentType();
    expect(contentType).toBe('News Article');
  });

  test('should detect blog posts', () => {
    Object.defineProperty(window, 'location', {
      value: { href: 'https://example.com/blog/my-post' }
    });
    document.title = 'My Blog Post';
    
    const contentType = contentExtractor.detectContentType();
    expect(contentType).toBe('Blog Post');
  });

  test('should detect documentation', () => {
    Object.defineProperty(window, 'location', {
      value: { href: 'https://docs.example.com/guide' }
    });
    document.title = 'API Documentation Guide';
    
    const contentType = contentExtractor.detectContentType();
    expect(contentType).toBe('Documentation');
  });

  test('should default to Article', () => {
    Object.defineProperty(window, 'location', {
      value: { href: 'https://example.com/random-page' }
    });
    document.title = 'Random Page';
    
    const contentType = contentExtractor.detectContentType();
    expect(contentType).toBe('Article');
  });
});
```

#### 2.2 Background Service Integration Tests
**File**: `background/background.js`

```javascript
// Test Case 2.2.1: Message routing
describe('BackgroundService message handling', () => {
  test('should handle getSettings request', async () => {
    const mockSendResponse = jest.fn();
    const request = { action: 'getSettings' };
    
    await backgroundService.handleMessage(request, null, mockSendResponse);
    
    expect(mockSendResponse).toHaveBeenCalledWith({
      success: true,
      settings: expect.any(Object)
    });
  });

  test('should handle updateSettings request', async () => {
    const mockSendResponse = jest.fn();
    const request = { 
      action: 'updateSettings',
      settings: { summaryLength: 'short' }
    };
    
    await backgroundService.handleMessage(request, null, mockSendResponse);
    
    expect(mockSendResponse).toHaveBeenCalledWith({
      success: true
    });
  });

  test('should handle getApiConfig request', async () => {
    const mockSendResponse = jest.fn();
    const request = { action: 'getApiConfig' };
    
    await backgroundService.handleMessage(request, null, mockSendResponse);
    
    expect(mockSendResponse).toHaveBeenCalledWith({
      success: true,
      settings: expect.objectContaining({
        provider: expect.any(String)
      })
    });
  });
});

// Test Case 2.2.2: Storage operations
describe('BackgroundService storage operations', () => {
  test('should set default settings on installation', async () => {
    const mockChromeStorageSet = jest.fn();
    chrome.storage.sync.set = mockChromeStorageSet;
    
    await backgroundService.setDefaultSettings();
    
    expect(mockChromeStorageSet).toHaveBeenCalledWith(
      expect.objectContaining({
        summaryLength: 'medium',
        apiProvider: 'local',
        enableNotifications: true
      })
    );
  });

  test('should retrieve settings correctly', async () => {
    const mockSettings = { summaryLength: 'short', apiProvider: 'openai' };
    chrome.storage.sync.get = jest.fn().mockResolvedValue(mockSettings);
    
    const result = await backgroundService.getSettings();
    
    expect(result).toEqual(mockSettings);
  });

  test('should update settings correctly', async () => {
    const mockChromeStorageSet = jest.fn();
    chrome.storage.sync.set = mockChromeStorageSet;
    
    const newSettings = { summaryLength: 'long' };
    await backgroundService.updateSettings(newSettings);
    
    expect(mockChromeStorageSet).toHaveBeenCalledWith(newSettings);
  });
});

// Test Case 2.2.3: Context menu functionality
describe('BackgroundService context menu', () => {
  test('should create context menu successfully', () => {
    const mockChromeContextMenusCreate = jest.fn();
    chrome.contextMenus.create = mockChromeContextMenusCreate;
    
    backgroundService.createContextMenu();
    
    expect(mockChromeContextMenusCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'summarizeSelection',
        title: 'Summarize selected text',
        contexts: ['selection']
      }),
      expect.any(Function)
    );
  });

  test('should handle context menu click', async () => {
    const mockInfo = {
      menuItemId: 'summarizeSelection',
      selectionText: 'Selected text to summarize'
    };
    const mockTab = { id: 123 };
    const mockSendMessage = jest.fn();
    chrome.tabs.sendMessage = mockSendMessage;
    
    await backgroundService.handleContextMenuClick(mockInfo, mockTab);
    
    expect(mockSendMessage).toHaveBeenCalledWith(123, {
      action: 'summarizeSelection',
      text: 'Selected text to summarize'
    });
  });
});
```

#### 2.3 Popup Interface Integration Tests
**File**: `popup/popup.js`

```javascript
// Test Case 2.3.1: Popup initialization
describe('PopupManager initialization', () => {
  test('should initialize UI elements correctly', async () => {
    document.body.innerHTML = `
      <div id="summaryContent"></div>
      <select id="summaryLength"></select>
      <button id="refreshBtn"></button>
      <button id="copyBtn"></button>
      <button id="shareBtn"></button>
      <span id="pageTitle"></span>
      <span id="contentType"></span>
      <span id="wordCount"></span>
      <span id="statusText"></span>
      <button id="settingsBtn"></button>
    `;
    
    const popup = new PopupManager();
    await popup.init();
    
    expect(popup.elements.summaryContent).toBeTruthy();
    expect(popup.elements.summaryLength).toBeTruthy();
    expect(popup.elements.refreshBtn).toBeTruthy();
  });

  test('should load page info correctly', async () => {
    const mockTab = { id: 123, title: 'Test Page' };
    const mockResponse = {
      success: true,
      contentType: 'Article',
      wordCount: 500
    };
    
    chrome.tabs.sendMessage = jest.fn().mockResolvedValue(mockResponse);
    
    const popup = new PopupManager();
    popup.currentTab = mockTab;
    popup.elements = {
      pageTitle: { textContent: '' },
      contentType: { textContent: '' },
      wordCount: { textContent: '' }
    };
    
    await popup.loadPageInfo();
    
    expect(popup.elements.pageTitle.textContent).toBe('Test Page');
    expect(popup.elements.contentType.textContent).toBe('Article');
    expect(popup.elements.wordCount.textContent).toBe('500');
  });
});

// Test Case 2.3.2: Summary generation
describe('PopupManager summary generation', () => {
  test('should generate summary successfully', async () => {
    const mockResponse = {
      success: true,
      summary: 'This is a test summary.'
    };
    
    chrome.tabs.sendMessage = jest.fn().mockResolvedValue(mockResponse);
    
    const popup = new PopupManager();
    popup.currentTab = { id: 123 };
    popup.elements = {
      summaryLength: { value: 'medium' },
      summaryContent: { innerHTML: '' }
    };
    popup.enableActions = jest.fn();
    popup.updateStatus = jest.fn();
    
    await popup.generateSummary();
    
    expect(popup.currentSummary).toBe('This is a test summary.');
    expect(popup.enableActions).toHaveBeenCalled();
  });

  test('should handle summary generation error', async () => {
    const mockResponse = {
      success: false,
      error: 'Failed to extract content'
    };
    
    chrome.tabs.sendMessage = jest.fn().mockResolvedValue(mockResponse);
    
    const popup = new PopupManager();
    popup.currentTab = { id: 123 };
    popup.elements = {
      summaryLength: { value: 'medium' },
      summaryContent: { innerHTML: '' }
    };
    popup.showError = jest.fn();
    popup.updateStatus = jest.fn();
    
    await popup.generateSummary();
    
    expect(popup.showError).toHaveBeenCalledWith(
      'Failed to generate summary. Please try again.'
    );
  });
});

// Test Case 2.3.3: Copy functionality
describe('PopupManager copy functionality', () => {
  test('should copy summary to clipboard', async () => {
    const mockWriteText = jest.fn().mockResolvedValue();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText }
    });
    
    const popup = new PopupManager();
    popup.currentSummary = 'Test summary';
    popup.elements = {
      copyBtn: { innerHTML: 'Copy' }
    };
    popup.updateStatus = jest.fn();
    
    await popup.copySummary();
    
    expect(mockWriteText).toHaveBeenCalledWith('Test summary');
    expect(popup.updateStatus).toHaveBeenCalledWith('Summary copied to clipboard');
  });

  test('should handle copy error', async () => {
    const mockWriteText = jest.fn().mockRejectedValue(new Error('Clipboard error'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText }
    });
    
    const popup = new PopupManager();
    popup.currentSummary = 'Test summary';
    popup.elements = {
      copyBtn: { innerHTML: 'Copy' }
    };
    popup.updateStatus = jest.fn();
    
    await popup.copySummary();
    
    expect(popup.updateStatus).toHaveBeenCalledWith('Failed to copy summary');
  });
});
```

### 3. End-to-End Tests

#### 3.1 Complete Workflow Tests

```javascript
// Test Case 3.1.1: Full summarization workflow
describe('Complete summarization workflow', () => {
  test('should complete full workflow from content extraction to display', async () => {
    // Setup mock page content
    document.body.innerHTML = `
      <article>
        <h1>Test Article</h1>
        <p>This is the first paragraph of the test article.</p>
        <p>This is the second paragraph with more content.</p>
        <p>This is the third paragraph concluding the article.</p>
      </article>
    `;
    
    // Initialize extension components
    const contentExtractor = new ContentExtractor();
    const popupManager = new PopupManager();
    
    // Mock tab information
    popupManager.currentTab = { id: 123, title: 'Test Article' };
    
    // Test content extraction
    const content = contentExtractor.extractMainText();
    expect(content).toContain('first paragraph');
    expect(content).toContain('second paragraph');
    expect(content).toContain('third paragraph');
    
    // Test summarization
    const summary = contentExtractor.createSimpleSummary(content, 'medium');
    expect(summary).toBeTruthy();
    expect(typeof summary).toBe('string');
    expect(summary.length).toBeGreaterThan(0);
  });

  test('should handle different content types correctly', async () => {
    const testCases = [
      {
        url: 'https://news.example.com/article',
        title: 'Breaking News',
        expectedType: 'News Article'
      },
      {
        url: 'https://blog.example.com/post',
        title: 'My Blog Post',
        expectedType: 'Blog Post'
      },
      {
        url: 'https://docs.example.com/guide',
        title: 'Documentation Guide',
        expectedType: 'Documentation'
      }
    ];
    
    for (const testCase of testCases) {
      Object.defineProperty(window, 'location', {
        value: { href: testCase.url }
      });
      document.title = testCase.title;
      
      const contentExtractor = new ContentExtractor();
      const contentType = contentExtractor.detectContentType();
      
      expect(contentType).toBe(testCase.expectedType);
    }
  });
});

// Test Case 3.1.2: API integration workflow
describe('API integration workflow', () => {
  test('should fallback to local summarization when API fails', async () => {
    // Mock API failure
    global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));
    
    const aiService = new AIServiceManager();
    await aiService.initialize({
      provider: 'openai',
      openaiApiKey: 'invalid-key'
    });
    
    const testText = 'This is a test text for summarization.';
    const summary = await aiService.generateAISummary(testText, 'medium');
    
    expect(summary).toBeTruthy();
    expect(typeof summary).toBe('string');
  });

  test('should use configured API when available', async () => {
    // Mock successful API response
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: 'API generated summary'
          }
        }]
      })
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);
    
    const aiService = new AIServiceManager();
    await aiService.initialize({
      provider: 'openai',
      openaiApiKey: 'valid-key'
    });
    
    const testText = 'This is a test text for summarization.';
    const summary = await aiService.openaiService(testText, 'medium');
    
    expect(summary).toBe('API generated summary');
  });
});
```

### 4. Error Handling Tests

#### 4.1 Network Error Tests

```javascript
// Test Case 4.1.1: Network connectivity issues
describe('Network error handling', () => {
  test('should handle network timeout', async () => {
    global.fetch = jest.fn().mockImplementation(() => 
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), 100)
      )
    );
    
    const aiService = new AIServiceManager();
    await aiService.initialize({
      provider: 'openai',
      openaiApiKey: 'test-key'
    });
    
    const testText = 'Test text';
    const summary = await aiService.generateAISummary(testText, 'medium');
    
    // Should fallback to local summarization
    expect(summary).toBeTruthy();
    expect(typeof summary).toBe('string');
  });

  test('should handle API rate limiting', async () => {
    const mockResponse = {
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      json: () => Promise.resolve({
        error: { message: 'Rate limit exceeded' }
      })
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);
    
    const aiService = new AIServiceManager();
    await aiService.initialize({
      provider: 'openai',
      openaiApiKey: 'test-key'
    });
    
    const testText = 'Test text';
    
    await expect(aiService.openaiService(testText, 'medium'))
      .rejects.toThrow('Rate limit exceeded');
  });
});

// Test Case 4.1.2: Invalid API responses
describe('Invalid API response handling', () => {
  test('should handle malformed API response', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        // Missing expected structure
        invalidField: 'value'
      })
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);
    
    const aiService = new AIServiceManager();
    await aiService.initialize({
      provider: 'openai',
      openaiApiKey: 'test-key'
    });
    
    const testText = 'Test text';
    
    await expect(aiService.openaiService(testText, 'medium'))
      .rejects.toThrow('No summary generated');
  });

  test('should handle empty API response', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: ''  // Empty content
          }
        }]
      })
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);
    
    const aiService = new AIServiceManager();
    await aiService.initialize({
      provider: 'openai',
      openaiApiKey: 'test-key'
    });
    
    const testText = 'Test text';
    
    await expect(aiService.openaiService(testText, 'medium'))
      .rejects.toThrow('No summary generated');
  });
});
```

#### 4.2 Content Extraction Error Tests

```javascript
// Test Case 4.2.1: Page content issues
describe('Content extraction error handling', () => {
  test('should handle pages with no readable content', () => {
    document.body.innerHTML = `
      <script>var x = 1;</script>
      <style>.test { color: red; }</style>
      <nav>Navigation only</nav>
    `;
    
    const contentExtractor = new ContentExtractor();
    
    expect(() => {
      contentExtractor.extractContent('medium');
    }).rejects.toThrow('No readable content found');
  });

  test('should handle malformed HTML', () => {
    document.body.innerHTML = `
      <div>Unclosed div
      <p>Paragraph without closing tag
      <span>Some content</span>
    `;
    
    const contentExtractor = new ContentExtractor();
    const content = contentExtractor.extractMainText();
    
    expect(content).toContain('Some content');
    expect(typeof content).toBe('string');
  });

  test('should handle special characters and encoding', () => {
    document.body.innerHTML = `
      <article>
        <p>Content with special chars: àáâãäå æç èéêë ìíîï ñ òóôõö ùúûü ý</p>
        <p>Unicode symbols: ★ ☆ ♥ ♦ ♣ ♠ © ® ™ € £ ¥</p>
        <p>Math symbols: ∞ ∑ ∏ ∫ ∆ ∇ ± × ÷</p>
      </article>
    `;
    
    const contentExtractor = new ContentExtractor();
    const content = contentExtractor.extractMainText();
    
    expect(content).toBeTruthy();
    expect(content).toContain('special chars');
    expect(content).toContain('Unicode symbols');
  });
});

// Test Case 4.2.2: Browser compatibility issues
describe('Browser compatibility handling', () => {
  test('should handle missing Chrome APIs gracefully', async () => {
    // Mock missing Chrome API
    const originalChrome = global.chrome;
    global.chrome = undefined;
    
    const contentExtractor = new ContentExtractor();
    
    // Should not throw error when Chrome APIs are missing
    expect(() => {
      contentExtractor.init();
    }).not.toThrow();
    
    global.chrome = originalChrome;
  });

  test('should handle missing clipboard API', async () => {
    // Mock missing clipboard API
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined
    });
    
    const popup = new PopupManager();
    popup.currentSummary = 'Test summary';
    popup.updateStatus = jest.fn();
    
    await popup.copySummary();
    
    expect(popup.updateStatus).toHaveBeenCalledWith('Failed to copy summary');
    
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard
    });
  });
});
```

### 5. Performance Tests

#### 5.1 Large Content Handling

```javascript
// Test Case 5.1.1: Large document processing
describe('Large content performance', () => {
  test('should handle large documents efficiently', () => {
    // Generate large content (1MB+)
    const largeContent = 'Lorem ipsum dolor sit amet. '.repeat(50000);
    document.body.innerHTML = `<article>${largeContent}</article>`;
    
    const startTime = performance.now();
    
    const contentExtractor = new ContentExtractor();
    const extractedContent = contentExtractor.extractMainText();
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    expect(extractedContent).toBeTruthy();
    expect(processingTime).toBeLessThan(1000); // Should complete within 1 second
  });

  test('should limit summary generation time', async () => {
    // Generate very large text
    const sentences = [];
    for (let i = 0; i < 10000; i++) {
      sentences.push(`This is sentence number ${i} with some content.`);
    }
    const largeText = sentences.join(' ');
    
    const startTime = performance.now();
    
    const summarizer = new Summarizer();
    const summary = await summarizer.generateSummary(largeText, 'medium');
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    expect(summary).toBeTruthy();
    expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
  });
});

// Test Case 5.1.2: Memory usage tests
describe('Memory usage optimization', () => {
  test('should not cause memory leaks with repeated operations', async () => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0;
    
    // Perform many summarization operations
    const summarizer = new Summarizer();
    const testText = 'This is a test sentence. '.repeat(1000);
    
    for (let i = 0; i < 100; i++) {
      await summarizer.generateSummary(testText, 'medium');
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (less than 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
});
```

### 6. Security Tests

#### 6.1 Input Sanitization Tests

```javascript
// Test Case 6.1.1: XSS prevention
describe('XSS prevention', () => {
  test('should sanitize malicious HTML in content', () => {
    const maliciousContent = `
      <script>alert('XSS');</script>
      <img src="x" onerror="alert('XSS')">
      <div onclick="alert('XSS')">Click me</div>
      Normal content here.
    `;
    
    document.body.innerHTML = `<article>${maliciousContent}</article>`;
    
    const contentExtractor = new ContentExtractor();
    const cleanContent = contentExtractor.extractMainText();
    
    expect(cleanContent).not.toContain('<script>');
    expect(cleanContent).not.toContain('onerror');
    expect(cleanContent).not.toContain('onclick');
    expect(cleanContent).toContain('Normal content');
  });

  test('should handle malicious input in text processor', () => {
    const maliciousInput = `
      <script>window.location='http://evil.com';</script>
      <iframe src="http://evil.com"></iframe>
      javascript:alert('XSS')
      Normal text content.
    `;
    
    const textProcessor = new TextProcessor();
    const cleanText = textProcessor.cleanText(maliciousInput);
    
    expect(cleanText).not.toContain('<script>');
    expect(cleanText).not.toContain('<iframe>');
    expect(cleanText).not.toContain('javascript:');
    expect(cleanText).toContain('Normal text content');
  });
});

// Test Case 6.1.2: API key security
describe('API key security', () => {
  test('should not expose API keys in console logs', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    const aiService = new AIServiceManager();
    aiService.initialize({
      provider: 'openai',
      openaiApiKey: 'sk-secret-key-here'
    });
    
    // Check all console.log calls
    const logCalls = consoleSpy.mock.calls;
    logCalls.forEach(call => {
      call.forEach(arg => {
        if (typeof arg === 'string') {
          expect(arg).not.toContain('sk-secret-key-here');
        }
      });
    });
    
    consoleSpy.mockRestore();
  });

  test('should validate API key format', () => {
    const aiService = new AIServiceManager();
    
    // Test invalid API key formats
    const invalidKeys = [
      '', // empty
      'invalid', // too short
      'sk-', // incomplete
      'not-a-real-key' // wrong format
    ];
    
    invalidKeys.forEach(key => {
      expect(() => {
        aiService.initialize({
          provider: 'openai',
          openaiApiKey: key
        });
      }).not.toThrow(); // Should handle gracefully
    });
  });
});
```

### 7. Accessibility Tests

#### 7.1 Screen Reader Compatibility

```javascript
// Test Case 7.1.1: ARIA labels and roles
describe('Accessibility compliance', () => {
  test('should have proper ARIA labels on interactive elements', () => {
    document.body.innerHTML = `
      <div id="summaryContent" role="region" aria-label="Summary content"></div>
      <select id="summaryLength" aria-label="Summary length preference"></select>
      <button id="refreshBtn" aria-label="Refresh summary"></button>
      <button id="copyBtn" aria-label="Copy summary to clipboard"></button>
      <button id="shareBtn" aria-label="Share summary"></button>
    `;
    
    const summaryContent = document.getElementById('summaryContent');
    const summaryLength = document.getElementById('summaryLength');
    const refreshBtn = document.getElementById('refreshBtn');
    const copyBtn = document.getElementById('copyBtn');
    const shareBtn = document.getElementById('shareBtn');
    
    expect(summaryContent.getAttribute('role')).toBe('region');
    expect(summaryContent.getAttribute('aria-label')).toBe('Summary content');
    expect(summaryLength.getAttribute('aria-label')).toBeTruthy();
    expect(refreshBtn.getAttribute('aria-label')).toBeTruthy();
    expect(copyBtn.getAttribute('aria-label')).toBeTruthy();
    expect(shareBtn.getAttribute('aria-label')).toBeTruthy();
  });

  test('should provide status updates for screen readers', () => {
    document.body.innerHTML = `
      <div id="statusText" role="status" aria-live="polite"></div>
    `;
    
    const popup = new PopupManager();
    popup.elements = {
      statusText: document.getElementById('statusText')
    };
    
    popup.updateStatus('Summary generated successfully');
    
    const statusElement = document.getElementById('statusText');
    expect(statusElement.getAttribute('role')).toBe('status');
    expect(statusElement.getAttribute('aria-live')).toBe('polite');
    expect(statusElement.textContent).toBe('Summary generated successfully');
  });
});

// Test Case 7.1.2: Keyboard navigation
describe('Keyboard accessibility', () => {
  test('should support keyboard navigation', () => {
    document.body.innerHTML = `
      <button id="refreshBtn" tabindex="0">Refresh</button>
      <select id="summaryLength" tabindex="0">
        <option value="short">Short</option>
        <option value="medium">Medium</option>
        <option value="long">Long</option>
      </select>
      <button id="copyBtn" tabindex="0">Copy</button>
      <button id="shareBtn" tabindex="0">Share</button>
    `;
    
    const elements = document.querySelectorAll('button, select');
    elements.forEach(element => {
      expect(element.getAttribute('tabindex')).toBe('0');
    });
  });

  test('should handle Enter key activation', () => {
    document.body.innerHTML = `
      <button id="refreshBtn">Refresh</button>
    `;
    
    const refreshBtn = document.getElementById('refreshBtn');
    const clickSpy = jest.fn();
    refreshBtn.addEventListener('click', clickSpy);
    
    // Simulate Enter key press
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    refreshBtn.dispatchEvent(enterEvent);
    
    // Button should be activated
    expect(clickSpy).toHaveBeenCalled();
  });
});
```

## Test Environment Setup

### Testing Framework Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  collectCoverageFrom: [
    'utils/*.js',
    'popup/*.js',
    'content-scripts/*.js',
    'background/*.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '<rootDir>/test/**/*.test.js'
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1'
  }
};

// test/setup.js
// Mock Chrome Extension APIs
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn()
    },
    sendMessage: jest.fn(),
    getURL: jest.fn()
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn()
  },
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  contextMenus: {
    create: jest.fn(),
    onClicked: {
      addListener: jest.fn()
    }
  },
  windows: {
    create: jest.fn()
  }
};

// Mock Web APIs
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn()
  }
});

Object.defineProperty(navigator, 'share', {
  value: jest.fn()
});

// Mock performance API
Object.defineProperty(performance, 'memory', {
  value: {
    usedJSHeapSize: 1000000
  }
});
```

### Manual Testing Checklist

#### Core Functionality
- [ ] Extension loads correctly in Chrome
- [ ] Popup opens and displays content
- [ ] Summary generation works on various websites
- [ ] All summary lengths (short/medium/long) work
- [ ] Copy to clipboard functionality works
- [ ] Share functionality works (where supported)
- [ ] Settings page opens and saves preferences

#### Content Types
- [ ] News articles summarize correctly
- [ ] Blog posts summarize correctly
- [ ] Documentation pages summarize correctly
- [ ] Research papers summarize correctly
- [ ] E-commerce product pages handle gracefully
- [ ] Social media pages handle gracefully

#### Error Scenarios
- [ ] Pages with no content show appropriate error
- [ ] Network connectivity issues handle gracefully
- [ ] Invalid API keys show appropriate error
- [ ] Rate limiting shows appropriate error
- [ ] Extension works on restricted pages (where allowed)

#### Performance
- [ ] Large pages (1MB+) process within reasonable time
- [ ] Multiple quick operations don't cause issues
- [ ] Memory usage remains stable over time
- [ ] CPU usage is reasonable during processing

#### Accessibility
- [ ] Screen reader announces status changes
- [ ] All interactive elements have proper labels
- [ ] Keyboard navigation works throughout
- [ ] High contrast mode displays correctly
- [ ] Text scaling works properly

#### Browser Compatibility
- [ ] Works in latest Chrome stable
- [ ] Works in Chrome Dev/Canary
- [ ] Manifest V3 compliance verified
- [ ] No deprecated API usage

#### Security
- [ ] No XSS vulnerabilities in content processing
- [ ] API keys not exposed in console/logs
- [ ] Content Security Policy compliance
- [ ] No unsafe-eval or unsafe-inline usage