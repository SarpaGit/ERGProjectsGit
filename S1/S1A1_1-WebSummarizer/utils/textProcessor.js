// Text Processor Utility for Web Content Summarizer
class TextProcessor {
    constructor() {
        this.init();
    }

    init() {
        // Initialize any necessary configurations
    }

    /**
     * Clean and normalize text content
     * @param {string} text - Raw text to clean
     * @returns {string} - Cleaned text
     */
    cleanText(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        let cleaned = text;

        // Remove HTML tags
        cleaned = this.removeHtmlTags(cleaned);
        
        // Remove extra whitespace
        cleaned = this.normalizeWhitespace(cleaned);
        
        // Remove common unwanted patterns
        cleaned = this.removeUnwantedPatterns(cleaned);
        
        // Normalize punctuation
        cleaned = this.normalizePunctuation(cleaned);
        
        // Remove control characters
        cleaned = this.removeControlCharacters(cleaned);

        return cleaned.trim();
    }

    /**
     * Remove HTML tags from text
     * @param {string} text - Text containing HTML
     * @returns {string} - Text without HTML tags
     */
    removeHtmlTags(text) {
        return text.replace(/<[^>]*>/g, ' ');
    }

    /**
     * Normalize whitespace (remove extra spaces, tabs, newlines)
     * @param {string} text - Text with irregular whitespace
     * @returns {string} - Text with normalized whitespace
     */
    normalizeWhitespace(text) {
        return text.replace(/\s+/g, ' ');
    }

    /**
     * Remove unwanted patterns like brackets, parentheses content
     * @param {string} text - Text to clean
     * @returns {string} - Cleaned text
     */
    removeUnwantedPatterns(text) {
        // Remove content in brackets
        text = text.replace(/\[.*?\]/g, '');
        
        // Remove content in parentheses (but keep some)
        text = text.replace(/\([^)]*\)/g, '');
        
        // Remove common unwanted patterns
        text = text.replace(/Click here|Read more|Continue reading|Learn more/gi, '');
        
        // Remove email patterns
        text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
        
        // Remove URL patterns
        text = text.replace(/https?:\/\/[^\s]+/g, '');
        
        return text;
    }

    /**
     * Normalize punctuation marks
     * @param {string} text - Text with irregular punctuation
     * @returns {string} - Text with normalized punctuation
     */
    normalizePunctuation(text) {
        // Fix multiple punctuation marks
        text = text.replace(/[.!?]{2,}/g, '.');
        text = text.replace(/[,;]{2,}/g, ',');
        
        // Ensure proper spacing around punctuation
        text = text.replace(/\s*([.!?,;:])\s*/g, '$1 ');
        
        // Fix spacing before punctuation
        text = text.replace(/\s+([.!?,;:])/g, '$1');
        
        return text;
    }

    /**
     * Remove control characters and non-printable characters
     * @param {string} text - Text to clean
     * @returns {string} - Cleaned text
     */
    removeControlCharacters(text) {
        return text.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    }

    /**
     * Split text into sentences
     * @param {string} text - Text to split
     * @returns {string[]} - Array of sentences
     */
    splitIntoSentences(text) {
        if (!text) return [];
        
        // Split by sentence endings, but be smart about abbreviations
        const sentences = text.split(/(?<=[.!?])\s+/);
        
        // Filter out empty sentences and very short ones
        return sentences
            .map(s => s.trim())
            .filter(s => s.length > 10);
    }

    /**
     * Split text into paragraphs
     * @param {string} text - Text to split
     * @returns {string[]} - Array of paragraphs
     */
    splitIntoParagraphs(text) {
        if (!text) return [];
        
        // Split by double newlines or paragraph breaks
        const paragraphs = text.split(/\n\s*\n/);
        
        return paragraphs
            .map(p => p.trim())
            .filter(p => p.length > 0);
    }

    /**
     * Count words in text
     * @param {string} text - Text to count
     * @returns {number} - Word count
     */
    countWords(text) {
        if (!text) return 0;
        
        const cleanText = this.cleanText(text);
        const words = cleanText.split(/\s+/);
        
        // Filter out empty strings
        return words.filter(word => word.length > 0).length;
    }

    /**
     * Count characters in text
     * @param {string} text - Text to count
     * @param {boolean} includeSpaces - Whether to include spaces in count
     * @returns {number} - Character count
     */
    countCharacters(text, includeSpaces = true) {
        if (!text) return 0;
        
        if (includeSpaces) {
            return text.length;
        } else {
            return text.replace(/\s/g, '').length;
        }
    }

    /**
     * Extract key phrases from text (simple approach)
     * @param {string} text - Text to analyze
     * @param {number} maxPhrases - Maximum number of phrases to return
     * @returns {string[]} - Array of key phrases
     */
    extractKeyPhrases(text, maxPhrases = 5) {
        if (!text) return [];
        
        const cleanText = this.cleanText(text);
        const sentences = this.splitIntoSentences(cleanText);
        
        // Simple approach: take first few sentences as key phrases
        return sentences.slice(0, maxPhrases);
    }

    /**
     * Detect language of text (basic implementation)
     * @param {string} text - Text to analyze
     * @returns {string} - Detected language code
     */
    detectLanguage(text) {
        if (!text) return 'en';
        
        // This is a very basic language detection
        // In a real implementation, you'd use a proper language detection library
        
        const sample = text.substring(0, 100).toLowerCase();
        
        // Check for common language indicators
        if (sample.includes('the') && sample.includes('and')) return 'en';
        if (sample.includes('le') && sample.includes('et')) return 'fr';
        if (sample.includes('el') && sample.includes('y')) return 'es';
        if (sample.includes('der') && sample.includes('und')) return 'de';
        
        // Default to English
        return 'en';
    }

    /**
     * Truncate text to specified length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @param {string} suffix - Suffix to add when truncating
     * @returns {string} - Truncated text
     */
    truncateText(text, maxLength = 100, suffix = '...') {
        if (!text || text.length <= maxLength) {
            return text;
        }
        
        // Try to truncate at word boundary
        const truncated = text.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');
        
        if (lastSpace > maxLength * 0.8) {
            return truncated.substring(0, lastSpace) + suffix;
        }
        
        return truncated + suffix;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextProcessor;
} else if (typeof window !== 'undefined') {
    window.TextProcessor = TextProcessor;
}
