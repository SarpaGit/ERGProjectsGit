// Content Script for Web Content Summarizer
class ContentExtractor {
    constructor() {
        this.init();
    }

    init() {
        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async response
        });
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'getPageInfo':
                    const pageInfo = this.getPageInfo();
                    sendResponse({ success: true, ...pageInfo });
                    break;
                    
                case 'extractContent':
                    const content = await this.extractContent(request.summaryLength);
                    sendResponse({ success: true, summary: content });
                    break;
                    
                case 'summarizeSelection':
                    const selectionSummary = await this.summarizeSelection(request.text, request.summaryLength);
                    sendResponse({ success: true, summary: selectionSummary });
                    break;
                    
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Content script error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    getPageInfo() {
        const contentType = this.detectContentType();
        const wordCount = this.countWords();
        
        return {
            contentType,
            wordCount
        };
    }

    detectContentType() {
        // Check for common content indicators
        const url = window.location.href;
        const title = document.title.toLowerCase();
        const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
        
        // Check for news sites
        if (url.includes('news') || url.includes('article') || title.includes('news')) {
            return 'News Article';
        }
        
        // Check for blog posts
        if (url.includes('blog') || url.includes('post') || title.includes('blog')) {
            return 'Blog Post';
        }
        
        // Check for documentation
        if (url.includes('docs') || url.includes('documentation') || title.includes('guide')) {
            return 'Documentation';
        }
        
        // Check for academic/research content
        if (url.includes('research') || url.includes('paper') || title.includes('study')) {
            return 'Research Paper';
        }
        
        // Default to article
        return 'Article';
    }

    countWords() {
        const text = this.extractMainText();
        if (!text) return 0;
        
        // Remove extra whitespace and count words
        const cleanText = text.replace(/\s+/g, ' ').trim();
        return cleanText.split(' ').length;
    }

    async extractContent(summaryLength = 'medium') {
        const mainText = this.extractMainText();
        
        if (!mainText) {
            throw new Error('No readable content found on this page');
        }

        try {
            // Try to use AI service if available
            if (typeof AIServiceManager !== 'undefined') {
                const aiService = new AIServiceManager();
                
                // Get API configuration from storage
                const response = await chrome.runtime.sendMessage({
                    action: 'getApiConfig'
                });
                
                if (response && response.success && response.settings.apiProvider !== 'local') {
                    // Use AI service
                    await aiService.initialize(response.settings);
                    const summary = await aiService.generateAISummary(mainText, summaryLength, response.settings.apiProvider);
                    return summary;
                }
            }
            
            // Fallback to local summarization
            const summary = this.createSimpleSummary(mainText, summaryLength);
            return summary;
            
        } catch (error) {
            console.error('AI summarization failed, using local fallback:', error);
            // Fallback to local summarization
            const summary = this.createSimpleSummary(mainText, summaryLength);
            return summary;
        }
    }

    extractMainText() {
        // Remove script and style elements
        const scripts = document.querySelectorAll('script, style, nav, header, footer, aside, .sidebar, .navigation, .ad, .advertisement');
        scripts.forEach(el => el.remove());

        // Try to find main content areas
        const selectors = [
            'main',
            'article',
            '[role="main"]',
            '.content',
            '.post-content',
            '.entry-content',
            '.article-content',
            '.main-content',
            '#content',
            '#main'
        ];

        let mainContent = null;
        
        // Try to find main content using selectors
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim().length > 100) {
                mainContent = element;
                break;
            }
        }

        // If no main content found, use body
        if (!mainContent) {
            mainContent = document.body;
        }

        // Extract text content
        let text = mainContent.textContent || '';
        
        // Clean up the text
        text = this.cleanText(text);
        
        return text;
    }

    cleanText(text) {
        if (!text) return '';
        
        // Remove extra whitespace
        text = text.replace(/\s+/g, ' ');
        
        // Remove common unwanted patterns
        text = text.replace(/\[.*?\]/g, ''); // Remove brackets content
        text = text.replace(/\(.*?\)/g, ''); // Remove parentheses content
        text = text.replace(/[^\w\s\.\,\!\?\:\;\-]/g, ''); // Keep only basic punctuation
        
        // Remove multiple spaces and trim
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    }

    /**
     * Clean text for summarization
     * @param {string} text - Raw text to clean
     * @returns {string} - Cleaned text
     */
    cleanText(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        let cleaned = text;

        // Remove HTML tags
        cleaned = cleaned.replace(/<[^>]*>/g, ' ');
        
        // Remove extra whitespace
        cleaned = cleaned.replace(/\s+/g, ' ');
        
        // Remove common unwanted patterns
        cleaned = cleaned.replace(/\[.*?\]/g, '');
        cleaned = cleaned.replace(/\([^)]*\)/g, '');
        
        // Remove control characters
        cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

        return cleaned.trim();
    }

    createSimpleSummary(text, length) {
        if (!text) return 'No content available to summarize.';
        
        // Split into sentences
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        
        if (sentences.length === 0) {
            return text.substring(0, 200) + (text.length > 200 ? '...' : '');
        }
        
        let summaryLength;
        switch (length) {
            case 'short':
                summaryLength = 1;
                break;
            case 'long':
                summaryLength = 5;
                break;
            case 'medium':
            default:
                summaryLength = 3;
                break;
        }
        
        // Take first few sentences
        const selectedSentences = sentences.slice(0, summaryLength);
        let summary = selectedSentences.join('. ').trim();
        
        // Ensure proper ending
        if (!summary.endsWith('.') && !summary.endsWith('!') && !summary.endsWith('?')) {
            summary += '.';
        }
        
        // Add ellipsis if we truncated content
        if (sentences.length > summaryLength) {
            summary += '...';
        }
        
        return summary;
    }

    /**
     * Summarize selected text
     * @param {string} selectedText - Text selected by user
     * @param {string} summaryLength - Length preference
     * @returns {string} - Summary of selected text
     */
    async summarizeSelection(selectedText, summaryLength = 'medium') {
        if (!selectedText || selectedText.trim().length === 0) {
            throw new Error('No text selected for summarization');
        }

        try {
            // Clean the selected text
            const cleanText = this.cleanText(selectedText);
            
            // Create summary using the same logic
            const summary = this.createSimpleSummary(cleanText, summaryLength);
            
            return summary;
        } catch (error) {
            console.error('Error summarizing selection:', error);
            throw new Error(`Failed to summarize selection: ${error.message}`);
        }
    }
}

// Initialize content extractor when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ContentExtractor();
    });
} else {
    new ContentExtractor();
}
