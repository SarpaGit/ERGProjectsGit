// Background Service Worker for Web Content Summarizer
class BackgroundService {
    constructor() {
        this.init();
    }

    init() {
        // Listen for extension installation
        chrome.runtime.onInstalled.addListener((details) => {
            this.handleInstallation(details);
        });

        // Listen for messages from content scripts and popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async response
        });

        // Handle context menu creation
        this.createContextMenu();
    }

    handleInstallation(details) {
        if (details.reason === 'install') {
            console.log('Web Content Summarizer extension installed');
            
            // Set default settings
            this.setDefaultSettings();
            
            // Open welcome page
            chrome.tabs.create({
                url: 'https://github.com/SarpaGit/ERAv4-SchoolofAI'
            });
        } else if (details.reason === 'update') {
            console.log('Web Content Summarizer extension updated');
        }
    }

    async setDefaultSettings() {
        const defaultSettings = {
            summaryLength: 'medium',
            enableNotifications: true,
            autoSummarize: false,
            apiProvider: 'local', // 'local', 'openai', 'claude'
            openaiApiKey: '',
            claudeApiKey: '',
            geminiApiKey: '',
            theme: 'light'
        };

        await chrome.storage.sync.set(defaultSettings);
    }

    createContextMenu() {
        // Create context menu for text selection using Manifest V3 approach
        try {
            chrome.contextMenus.create({
                id: 'summarizeSelection',
                title: 'Summarize selected text',
                contexts: ['selection']
            }, () => {
                if (chrome.runtime.lastError) {
                    console.log('Context menu creation error:', chrome.runtime.lastError);
                } else {
                    console.log('Context menu created successfully');
                }
            });

            // Handle context menu clicks
            chrome.contextMenus.onClicked.addListener((info, tab) => {
                if (info.menuItemId === 'summarizeSelection') {
                    this.handleContextMenuClick(info, tab);
                }
            });
        } catch (error) {
            console.log('Context menu creation failed:', error);
        }
    }

    async handleContextMenuClick(info, tab) {
        if (info.selectionText) {
            // Send message to content script to summarize selected text
            try {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'summarizeSelection',
                    text: info.selectionText
                });
            } catch (error) {
                console.error('Error sending message to content script:', error);
            }
        }
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'getSettings':
                    const settings = await this.getSettings();
                    sendResponse({ success: true, settings });
                    break;
                    
                case 'updateSettings':
                    await this.updateSettings(request.settings);
                    sendResponse({ success: true });
                    break;
                    
                case 'summarizeText':
                    const summary = await this.summarizeText(request.text, request.length);
                    sendResponse({ success: true, summary });
                    break;
                    
                case 'testApiConnection':
                    const testResult = await this.testApiConnection(request.provider, request.apiKey);
                    sendResponse({ success: true, result: testResult });
                    break;
                    
                case 'getApiConfig':
                    const apiConfig = await this.getApiConfig();
                    sendResponse({ success: true, settings: apiConfig });
                    break;
                    
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Background service error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async getSettings() {
        try {
            const result = await chrome.storage.sync.get(null);
            return result;
        } catch (error) {
            console.error('Error getting settings:', error);
            return {};
        }
    }

    async updateSettings(newSettings) {
        try {
            await chrome.storage.sync.set(newSettings);
            console.log('Settings updated successfully');
        } catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    }

    async summarizeText(text, length = 'medium') {
        try {
            // For now, use local summarization
            // In Phase 3, this will integrate with AI APIs
            const summary = this.createLocalSummary(text, length);
            return summary;
        } catch (error) {
            console.error('Error summarizing text:', error);
            throw error;
        }
    }

    createLocalSummary(text, length) {
        if (!text || text.trim().length === 0) {
            return 'No text provided for summarization.';
        }

        // Clean the text
        const cleanText = text.replace(/\s+/g, ' ').trim();
        
        // Split into sentences
        const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 5);
        
        if (sentences.length === 0) {
            return cleanText.substring(0, 150) + (cleanText.length > 150 ? '...' : '');
        }

        // Determine number of sentences based on length preference
        let sentenceCount;
        switch (length) {
            case 'short':
                sentenceCount = 1;
                break;
            case 'long':
                sentenceCount = 5;
                break;
            case 'medium':
            default:
                sentenceCount = 3;
                break;
        }

        // Select sentences (simple approach: take first few)
        const selectedSentences = sentences.slice(0, sentenceCount);
        let summary = selectedSentences.join('. ').trim();
        
        // Ensure proper ending
        if (!summary.endsWith('.') && !summary.endsWith('!') && !summary.endsWith('?')) {
            summary += '.';
        }
        
        // Add ellipsis if we truncated content
        if (sentences.length > sentenceCount) {
            summary += '...';
        }
        
        return summary;
    }

    async getApiConfig() {
        try {
            const result = await chrome.storage.sync.get([
                'apiProvider',
                'openaiApiKey',
                'claudeApiKey',
                'geminiApiKey'
            ]);
            
            return {
                provider: result.apiProvider || 'local',
                openaiApiKey: result.openaiApiKey || '',
                claudeApiKey: result.claudeApiKey || '',
                geminiApiKey: result.geminiApiKey || ''
            };
        } catch (error) {
            console.error('Error getting API config:', error);
            return {
                provider: 'local',
                openaiApiKey: '',
                claudeApiKey: '',
                geminiApiKey: ''
            };
        }
    }

    async testApiConnection(provider, apiKey) {
        // This will be implemented in Phase 3
        // For now, return a mock result
        return {
            success: true,
            message: 'API connection test not implemented yet'
        };
    }
}

// Initialize background service
new BackgroundService();
