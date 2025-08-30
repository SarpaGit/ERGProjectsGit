// Summarizer Utility for Web Content Summarizer
class Summarizer {
    constructor() {
        this.init();
    }

    init() {
        // Initialize summarization strategies
        this.strategies = {
            extractive: this.extractiveSummarization,
            abstractive: this.abstractiveSummarization,
            hybrid: this.hybridSummarization
        };
    }

    /**
     * Generate summary using specified strategy and length
     * @param {string} text - Text to summarize
     * @param {string} length - Summary length ('short', 'medium', 'long')
     * @param {string} strategy - Summarization strategy
     * @returns {string} - Generated summary
     */
    async generateSummary(text, length = 'medium', strategy = 'extractive') {
        if (!text || text.trim().length === 0) {
            throw new Error('No text provided for summarization');
        }

        try {
            // Clean the text first
            const cleanText = this.cleanText(text);
            
            // Get the appropriate strategy function
            const strategyFunc = this.strategies[strategy] || this.strategies.extractive;
            
            // Generate summary
            const summary = await strategyFunc(cleanText, length);
            
            return this.postProcessSummary(summary, length);
            
        } catch (error) {
            console.error('Error generating summary:', error);
            throw new Error(`Failed to generate summary: ${error.message}`);
        }
    }

    /**
     * Clean text for summarization
     * @param {string} text - Raw text
     * @returns {string} - Cleaned text
     */
    cleanText(text) {
        // Remove HTML tags
        text = text.replace(/<[^>]*>/g, ' ');
        
        // Remove extra whitespace
        text = text.replace(/\s+/g, ' ');
        
        // Remove common unwanted patterns
        text = text.replace(/\[.*?\]/g, '');
        text = text.replace(/\([^)]*\)/g, '');
        
        // Remove control characters
        text = text.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        
        return text.trim();
    }

    /**
     * Extractive summarization - select important sentences
     * @param {string} text - Text to summarize
     * @param {string} length - Summary length
     * @returns {string} - Extractive summary
     */
    async extractiveSummarization(text, length) {
        // Split into sentences
        const sentences = this.splitIntoSentences(text);
        
        if (sentences.length === 0) {
            return text.substring(0, 200) + (text.length > 200 ? '...' : '');
        }

        // Score sentences based on importance
        const scoredSentences = this.scoreSentences(sentences);
        
        // Select top sentences based on length preference
        const selectedCount = this.getSentenceCount(length);
        const selectedSentences = scoredSentences
            .sort((a, b) => b.score - a.score)
            .slice(0, selectedCount)
            .sort((a, b) => a.originalIndex - b.originalIndex); // Maintain order
        
        // Combine selected sentences
        let summary = selectedSentences.map(s => s.text).join('. ');
        
        // Ensure proper ending
        if (!summary.endsWith('.') && !summary.endsWith('!') && !summary.endsWith('?')) {
            summary += '.';
        }
        
        return summary;
    }

    /**
     * Create simple summary (compatibility method)
     * @param {string} text - Text to summarize
     * @param {string} length - Summary length
     * @returns {string} - Simple summary
     */
    createSimpleSummary(text, length) {
        if (!text) return 'No content available to summarize.';
        
        // Split into sentences
        const sentences = this.splitIntoSentences(text);
        
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
     * Abstractive summarization - generate new text using AI
     * @param {string} text - Text to summarize
     * @param {string} length - Summary length
     * @returns {Promise<string>} - Abstractive summary
     */
    async abstractiveSummarization(text, length) {
        try {
            // Check if AI service is available
            if (typeof AIServiceManager !== 'undefined') {
                const aiService = new AIServiceManager();
                
                // Get current API configuration from storage
                const storageManager = new StorageManager();
                const apiConfig = await storageManager.getApiConfig();
                
                if (apiConfig.provider !== 'local') {
                    // Initialize AI service and generate summary
                    await aiService.initialize(apiConfig);
                    return await aiService.generateAISummary(text, length, apiConfig.provider);
                }
            }
            
            // Fallback to extractive summarization if AI is not available
            console.log('AI service not available, using extractive summarization');
            return this.extractiveSummarization(text, length);
            
        } catch (error) {
            console.error('Abstractive summarization failed:', error);
            // Fallback to extractive
            return this.extractiveSummarization(text, length);
        }
    }

    /**
     * Hybrid summarization - combine extractive and abstractive approaches
     * @param {string} text - Text to summarize
     * @param {string} length - Summary length
     * @returns {Promise<string>} - Hybrid summary
     */
    async hybridSummarization(text, length) {
        try {
            // First, get extractive summary for key points
            const extractiveSummary = this.extractiveSummarization(text, length);
            
            // Then, enhance with AI if available
            if (typeof AIServiceManager !== 'undefined') {
                const aiService = new AIServiceManager();
                const storageManager = new StorageManager();
                const apiConfig = await storageManager.getApiConfig();
                
                if (apiConfig.provider !== 'local') {
                    // Use AI to enhance the extractive summary
                    await aiService.initialize(apiConfig);
                    const enhancedSummary = await aiService.generateAISummary(extractiveSummary, length, apiConfig.provider);
                    return enhancedSummary;
                }
            }
            
            // Fallback to extractive if AI is not available
            return extractiveSummary;
            
        } catch (error) {
            console.error('Hybrid summarization failed:', error);
            // Fallback to extractive
            return this.extractiveSummarization(text, length);
        }
    }

    /**
     * Split text into sentences
     * @param {string} text - Text to split
     * @returns {string[]} - Array of sentences
     */
    splitIntoSentences(text) {
        // Split by sentence endings, but be smart about abbreviations
        const sentences = text.split(/(?<=[.!?])\s+/);
        
        return sentences
            .map(s => s.trim())
            .filter(s => s.length > 10);
    }

    /**
     * Score sentences based on importance
     * @param {string[]} sentences - Array of sentences
     * @returns {Array} - Array of scored sentences with metadata
     */
    scoreSentences(sentences) {
        return sentences.map((sentence, index) => {
            const score = this.calculateSentenceScore(sentence);
            return {
                text: sentence,
                score: score,
                originalIndex: index
            };
        });
    }

    /**
     * Calculate importance score for a sentence
     * @param {string} sentence - Sentence to score
     * @returns {number} - Importance score
     */
    calculateSentenceScore(sentence) {
        let score = 0;
        const lowerSentence = sentence.toLowerCase();
        
        // Length factor (prefer medium-length sentences)
        const wordCount = sentence.split(/\s+/).length;
        if (wordCount >= 8 && wordCount <= 25) {
            score += 2;
        } else if (wordCount >= 5 && wordCount <= 30) {
            score += 1;
        }
        
        // Position factor (first and last sentences are often important)
        // This will be handled in the calling function
        
        // Keyword density (simple approach)
        const importantWords = ['important', 'key', 'main', 'primary', 'essential', 'critical', 'significant'];
        importantWords.forEach(word => {
            if (lowerSentence.includes(word)) {
                score += 1;
            }
        });
        
        // Question sentences (often important)
        if (sentence.includes('?')) {
            score += 1;
        }
        
        // Exclamation sentences (often important)
        if (sentence.includes('!')) {
            score += 0.5;
        }
        
        // Contains numbers (often factual)
        if (/\d/.test(sentence)) {
            score += 0.5;
        }
        
        // Contains proper nouns (names, places, etc.)
        if (/[A-Z][a-z]+/.test(sentence)) {
            score += 0.3;
        }
        
        return score;
    }

    /**
     * Get number of sentences based on length preference
     * @param {string} length - Length preference
     * @returns {number} - Number of sentences
     */
    getSentenceCount(length) {
        switch (length) {
            case 'short':
                return 1;
            case 'long':
                return 5;
            case 'medium':
            default:
                return 3;
        }
    }

    /**
     * Post-process summary for better quality
     * @param {string} summary - Raw summary
     * @param {string} length - Summary length
     * @returns {string} - Processed summary
     */
    postProcessSummary(summary, length) {
        if (!summary) return summary;
        
        // Clean up extra whitespace
        summary = summary.replace(/\s+/g, ' ');
        
        // Fix punctuation spacing
        summary = summary.replace(/\s*([.!?,;:])\s*/g, '$1 ');
        summary = summary.replace(/\s+([.!?,;:])/g, '$1');
        
        // Ensure proper ending
        if (!summary.endsWith('.') && !summary.endsWith('!') && !summary.endsWith('?')) {
            summary += '.';
        }
        
        // Add ellipsis for longer summaries if truncated
        if (length === 'long' && summary.length > 500) {
            summary += '...';
        }
        
        return summary.trim();
    }

    /**
     * Generate summary with specific focus areas
     * @param {string} text - Text to summarize
     * @param {string} focus - Focus area ('main', 'conclusion', 'key_points')
     * @param {string} length - Summary length
     * @returns {string} - Focused summary
     */
    async generateFocusedSummary(text, focus = 'main', length = 'medium') {
        switch (focus) {
            case 'conclusion':
                return this.extractConclusion(text, length);
            case 'key_points':
                return this.extractKeyPoints(text, length);
            case 'main':
            default:
                return this.generateSummary(text, length);
        }
    }

    /**
     * Extract conclusion from text
     * @param {string} text - Text to analyze
     * @param {string} length - Summary length
     * @returns {string} - Conclusion summary
     */
    async extractConclusion(text, length) {
        const sentences = this.splitIntoSentences(text);
        
        if (sentences.length === 0) {
            return 'No conclusion found.';
        }
        
        // Take last few sentences as conclusion
        const conclusionCount = this.getSentenceCount(length);
        const conclusionSentences = sentences.slice(-conclusionCount);
        
        let conclusion = conclusionSentences.join('. ');
        
        if (!conclusion.endsWith('.') && !conclusion.endsWith('!') && !conclusion.endsWith('?')) {
            conclusion += '.';
        }
        
        return conclusion;
    }

    /**
     * Extract key points from text
     * @param {string} text - Text to analyze
     * @param {string} length - Summary length
     * @returns {string} - Key points summary
     */
    async extractKeyPoints(text, length) {
        // This is a simplified version - in Phase 3, this will use more sophisticated NLP
        return this.extractiveSummarization(text, length);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Summarizer;
} else if (typeof window !== 'undefined') {
    window.Summarizer = Summarizer;
}
