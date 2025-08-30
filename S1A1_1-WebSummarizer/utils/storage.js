// Storage Utility for Web Content Summarizer
class StorageManager {
    constructor() {
        this.init();
    }

    init() {
        // Initialize default settings
        this.defaultSettings = {
            summaryLength: 'medium',
            enableNotifications: true,
            autoSummarize: false,
            apiProvider: 'local', // 'local', 'openai', 'claude', 'gemini'
            openaiApiKey: '',
            claudeApiKey: '',
            geminiApiKey: '',
            theme: 'light',
            language: 'en',
            contentTypes: ['article', 'blog', 'news', 'documentation'],
            maxSummaryLength: 500,
            enableContextMenu: true,
            enableKeyboardShortcuts: false,
            keyboardShortcuts: {
                generateSummary: 'Ctrl+Shift+S',
                copySummary: 'Ctrl+Shift+C'
            }
        };
    }

    /**
     * Get all settings from storage
     * @returns {Promise<Object>} - All stored settings
     */
    async getAllSettings() {
        try {
            const result = await chrome.storage.sync.get(null);
            return { ...this.defaultSettings, ...result };
        } catch (error) {
            console.error('Error getting all settings:', error);
            return this.defaultSettings;
        }
    }

    /**
     * Get specific setting from storage
     * @param {string} key - Setting key
     * @returns {Promise<any>} - Setting value
     */
    async getSetting(key) {
        try {
            const result = await chrome.storage.sync.get([key]);
            return result[key] !== undefined ? result[key] : this.defaultSettings[key];
        } catch (error) {
            console.error(`Error getting setting ${key}:`, error);
            return this.defaultSettings[key];
        }
    }

    /**
     * Set specific setting in storage
     * @param {string} key - Setting key
     * @param {any} value - Setting value
     * @returns {Promise<void>}
     */
    async setSetting(key, value) {
        try {
            await chrome.storage.sync.set({ [key]: value });
            console.log(`Setting ${key} updated successfully`);
        } catch (error) {
            console.error(`Error setting ${key}:`, error);
            throw error;
        }
    }

    /**
     * Set multiple settings at once
     * @param {Object} settings - Object containing multiple settings
     * @returns {Promise<void>}
     */
    async setMultipleSettings(settings) {
        try {
            await chrome.storage.sync.set(settings);
            console.log('Multiple settings updated successfully');
        } catch (error) {
            console.error('Error setting multiple settings:', error);
            throw error;
        }
    }

    /**
     * Reset settings to defaults
     * @returns {Promise<void>}
     */
    async resetToDefaults() {
        try {
            await chrome.storage.sync.clear();
            await chrome.storage.sync.set(this.defaultSettings);
            console.log('Settings reset to defaults successfully');
        } catch (error) {
            console.error('Error resetting settings:', error);
            throw error;
        }
    }

    /**
     * Get summary history from storage
     * @returns {Promise<Array>} - Array of summary history items
     */
    async getSummaryHistory() {
        try {
            const result = await chrome.storage.local.get(['summaryHistory']);
            return result.summaryHistory || [];
        } catch (error) {
            console.error('Error getting summary history:', error);
            return [];
        }
    }

    /**
     * Add summary to history
     * @param {Object} summaryData - Summary data to store
     * @returns {Promise<void>}
     */
    async addToSummaryHistory(summaryData) {
        try {
            const history = await this.getSummaryHistory();
            
            const historyItem = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                url: summaryData.url,
                title: summaryData.title,
                summary: summaryData.summary,
                length: summaryData.length,
                contentType: summaryData.contentType,
                wordCount: summaryData.wordCount
            };
            
            // Add to beginning of history
            history.unshift(historyItem);
            
            // Keep only last 100 items
            if (history.length > 100) {
                history.splice(100);
            }
            
            await chrome.storage.local.set({ summaryHistory: history });
            console.log('Summary added to history successfully');
        } catch (error) {
            console.error('Error adding to summary history:', error);
            throw error;
        }
    }

    /**
     * Clear summary history
     * @returns {Promise<void>}
     */
    async clearSummaryHistory() {
        try {
            await chrome.storage.local.remove(['summaryHistory']);
            console.log('Summary history cleared successfully');
        } catch (error) {
            console.error('Error clearing summary history:', error);
            throw error;
        }
    }

    /**
     * Get favorite summaries
     * @returns {Promise<Array>} - Array of favorite summaries
     */
    async getFavoriteSummaries() {
        try {
            const result = await chrome.storage.sync.get(['favoriteSummaries']);
            return result.favoriteSummaries || [];
        } catch (error) {
            console.error('Error getting favorite summaries:', error);
            return [];
        }
    }

    /**
     * Add summary to favorites
     * @param {Object} summaryData - Summary data to favorite
     * @returns {Promise<void>}
     */
    async addToFavorites(summaryData) {
        try {
            const favorites = await this.getFavoriteSummaries();
            
            // Check if already exists
            const exists = favorites.find(fav => fav.url === summaryData.url);
            if (exists) {
                throw new Error('Summary already in favorites');
            }
            
            const favoriteItem = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                url: summaryData.url,
                title: summaryData.title,
                summary: summaryData.summary,
                length: summaryData.length,
                contentType: summaryData.contentType,
                wordCount: summaryData.wordCount
            };
            
            favorites.push(favoriteItem);
            await chrome.storage.sync.set({ favoriteSummaries: favorites });
            console.log('Summary added to favorites successfully');
        } catch (error) {
            console.error('Error adding to favorites:', error);
            throw error;
        }
    }

    /**
     * Remove summary from favorites
     * @param {string} url - URL of summary to remove
     * @returns {Promise<void>}
     */
    async removeFromFavorites(url) {
        try {
            const favorites = await this.getFavoriteSummaries();
            const filteredFavorites = favorites.filter(fav => fav.url !== url);
            
            await chrome.storage.sync.set({ favoriteSummaries: filteredFavorites });
            console.log('Summary removed from favorites successfully');
        } catch (error) {
            console.error('Error removing from favorites:', error);
            throw error;
        }
    }

    /**
     * Get API configuration
     * @returns {Promise<Object>} - API configuration
     */
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

    /**
     * Save API configuration
     * @param {Object} apiConfig - API configuration to save
     * @returns {Promise<void>}
     */
    async saveApiConfig(apiConfig) {
        try {
            await chrome.storage.sync.set({
                apiProvider: apiConfig.provider,
                openaiApiKey: apiConfig.openaiApiKey,
                claudeApiKey: apiConfig.claudeApiKey,
                geminiApiKey: apiConfig.geminiApiKey
            });
            console.log('API configuration saved successfully');
        } catch (error) {
            console.error('Error saving API configuration:', error);
            throw error;
        }
    }

    /**
     * Get usage statistics
     * @returns {Promise<Object>} - Usage statistics
     */
    async getUsageStats() {
        try {
            const result = await chrome.storage.local.get(['usageStats']);
            return result.usageStats || {
                totalSummaries: 0,
                totalWordsProcessed: 0,
                firstUsed: new Date().toISOString(),
                lastUsed: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting usage stats:', error);
            return {
                totalSummaries: 0,
                totalWordsProcessed: 0,
                firstUsed: new Date().toISOString(),
                lastUsed: new Date().toISOString()
            };
        }
    }

    /**
     * Update usage statistics
     * @param {number} wordCount - Number of words processed
     * @returns {Promise<void>}
     */
    async updateUsageStats(wordCount) {
        try {
            const stats = await this.getUsageStats();
            
            stats.totalSummaries += 1;
            stats.totalWordsProcessed += wordCount;
            stats.lastUsed = new Date().toISOString();
            
            await chrome.storage.local.set({ usageStats: stats });
        } catch (error) {
            console.error('Error updating usage stats:', error);
        }
    }

    /**
     * Export all data for backup
     * @returns {Promise<Object>} - Exported data
     */
    async exportData() {
        try {
            const syncData = await chrome.storage.sync.get(null);
            const localData = await chrome.storage.local.get(null);
            
            return {
                sync: syncData,
                local: localData,
                exportDate: new Date().toISOString(),
                version: '1.0.0'
            };
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    }

    /**
     * Import data from backup
     * @param {Object} data - Data to import
     * @returns {Promise<void>}
     */
    async importData(data) {
        try {
            if (data.sync) {
                await chrome.storage.sync.clear();
                await chrome.storage.sync.set(data.sync);
            }
            
            if (data.local) {
                await chrome.storage.local.clear();
                await chrome.storage.local.set(data.local);
            }
            
            console.log('Data imported successfully');
        } catch (error) {
            console.error('Error importing data:', error);
            throw error;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
} else if (typeof window !== 'undefined') {
    window.StorageManager = StorageManager;
}
