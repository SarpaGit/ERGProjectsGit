// Settings Manager for Web Content Summarizer
class SettingsManager {
    constructor() {
        this.storageManager = new StorageManager();
        this.aiService = new AIServiceManager();
        this.currentSettings = {};
        this.init();
    }

    async init() {
        try {
            // Load current settings
            await this.loadSettings();
            
            // Initialize UI
            this.initializeUI();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Update UI with current settings
            this.updateUI();
            
        } catch (error) {
            console.error('Error initializing settings:', error);
            this.showStatus('Failed to initialize settings', 'error');
        }
    }

    async loadSettings() {
        try {
            this.currentSettings = await this.storageManager.getAllSettings();
            console.log('Settings loaded successfully');
        } catch (error) {
            console.error('Error loading settings:', error);
            this.currentSettings = {};
        }
    }

    initializeUI() {
        // Get DOM elements
        this.elements = {
            aiProvider: document.getElementById('aiProvider'),
            openaiSettings: document.getElementById('openaiSettings'),
            claudeSettings: document.getElementById('claudeSettings'),
            geminiSettings: document.getElementById('geminiSettings'),
            openaiApiKey: document.getElementById('openaiApiKey'),
            claudeApiKey: document.getElementById('claudeApiKey'),
            geminiApiKey: document.getElementById('geminiApiKey'),
            testOpenAI: document.getElementById('testOpenAI'),
            testClaude: document.getElementById('testClaude'),
            testGemini: document.getElementById('testGemini'),
            defaultLength: document.getElementById('defaultLength'),
            maxSummaryLength: document.getElementById('maxSummaryLength'),
            autoSummarize: document.getElementById('autoSummarize'),
            typeArticles: document.getElementById('typeArticles'),
            typeBlogs: document.getElementById('typeBlogs'),
            typeNews: document.getElementById('typeNews'),
            typeDocs: document.getElementById('typeDocs'),
            enableContextMenu: document.getElementById('enableContextMenu'),
            theme: document.getElementById('theme'),
            language: document.getElementById('language'),
            enableNotifications: document.getElementById('enableNotifications'),
            backBtn: document.getElementById('backBtn'),
            saveSettings: document.getElementById('saveSettings'),
            cancelSettings: document.getElementById('cancelSettings'),
            exportData: document.getElementById('exportData'),
            importData: document.getElementById('importData'),
            importFile: document.getElementById('importFile'),
            clearHistory: document.getElementById('clearHistory'),
            clearFavorites: document.getElementById('clearFavorites'),
            resetSettings: document.getElementById('resetSettings')
        };
    }

    setupEventListeners() {
        // AI Provider change
        this.elements.aiProvider.addEventListener('change', () => this.onAIProviderChange());
        
        // Test API connections
        this.elements.testOpenAI.addEventListener('click', () => this.testAPIConnection('openai'));
        this.elements.testClaude.addEventListener('click', () => this.testAPIConnection('claude'));
        this.elements.testGemini.addEventListener('click', () => this.testAPIConnection('gemini'));
        
        // Navigation
        this.elements.backBtn.addEventListener('click', () => this.goBack());
        
        // Save/Cancel
        this.elements.saveSettings.addEventListener('click', () => this.saveSettings());
        this.elements.cancelSettings.addEventListener('click', () => this.goBack());
        
        // Data management
        this.elements.exportData.addEventListener('click', () => this.exportData());
        this.elements.importData.addEventListener('click', () => this.importData());
        this.elements.importFile.addEventListener('change', (e) => this.handleImportFile(e));
        this.elements.clearHistory.addEventListener('click', () => this.clearHistory());
        this.elements.clearFavorites.addEventListener('click', () => this.clearFavorites());
        this.elements.resetSettings.addEventListener('click', () => this.resetSettings());
    }

    updateUI() {
        // Update AI provider selection
        this.elements.aiProvider.value = this.currentSettings.apiProvider || 'local';
        this.onAIProviderChange();
        
        // Update API keys
        this.elements.openaiApiKey.value = this.currentSettings.openaiApiKey || '';
        this.elements.claudeApiKey.value = this.currentSettings.claudeApiKey || '';
        this.elements.geminiApiKey.value = this.currentSettings.geminiApiKey || '';
        
        // Update summary preferences
        this.elements.defaultLength.value = this.currentSettings.summaryLength || 'medium';
        this.elements.maxSummaryLength.value = this.currentSettings.maxSummaryLength || 500;
        this.elements.autoSummarize.checked = this.currentSettings.autoSummarize || false;
        
        // Update content types
        const contentTypes = this.currentSettings.contentTypes || ['article', 'blog', 'news', 'documentation'];
        this.elements.typeArticles.checked = contentTypes.includes('article');
        this.elements.typeBlogs.checked = contentTypes.includes('blog');
        this.elements.typeNews.checked = contentTypes.includes('news');
        this.elements.typeDocs.checked = contentTypes.includes('documentation');
        
        // Update other settings
        this.elements.enableContextMenu.checked = this.currentSettings.enableContextMenu !== false;
        this.elements.theme.value = this.currentSettings.theme || 'light';
        this.elements.language.value = this.currentSettings.language || 'en';
        this.elements.enableNotifications.checked = this.currentSettings.enableNotifications !== false;
    }

    onAIProviderChange() {
        const provider = this.elements.aiProvider.value;
        
        // Hide all provider settings
        this.elements.openaiSettings.style.display = 'none';
        this.elements.claudeSettings.style.display = 'none';
        this.elements.geminiSettings.style.display = 'none';
        
        // Show relevant provider settings
        if (provider === 'openai') {
            this.elements.openaiSettings.style.display = 'block';
        } else if (provider === 'claude') {
            this.elements.claudeSettings.style.display = 'block';
        } else if (provider === 'gemini') {
            this.elements.geminiSettings.style.display = 'block';
        }
    }

    async testAPIConnection(provider) {
        const apiKeyField = `${provider}ApiKey`;
        const apiKey = this.elements[apiKeyField].value.trim();
        
        if (!apiKey) {
            this.showStatus(`Please enter your ${provider} API key first`, 'error');
            return;
        }

        try {
            this.showStatus(`Testing ${provider} connection...`, 'info');
            
            const result = await this.aiService.testAPIConnection(provider, apiKey);
            
            if (result.success) {
                this.showStatus(`${provider} connection successful!`, 'success');
                console.log('Test summary:', result.summary);
            } else {
                this.showStatus(`${provider} connection failed: ${result.message}`, 'error');
            }
            
        } catch (error) {
            console.error(`Error testing ${provider} connection:`, error);
            this.showStatus(`Error testing ${provider} connection`, 'error');
        }
    }

    async saveSettings() {
        try {
            // Collect all settings
            const newSettings = {
                apiProvider: this.elements.aiProvider.value,
                openaiApiKey: this.elements.openaiApiKey.value.trim(),
                claudeApiKey: this.elements.claudeApiKey.value.trim(),
                geminiApiKey: this.elements.geminiApiKey.value.trim(),
                summaryLength: this.elements.defaultLength.value,
                maxSummaryLength: parseInt(this.elements.maxSummaryLength.value),
                autoSummarize: this.elements.autoSummarize.checked,
                contentTypes: this.getSelectedContentTypes(),
                enableContextMenu: this.elements.enableContextMenu.checked,
                theme: this.elements.theme.value,
                language: this.elements.language.value,
                enableNotifications: this.elements.enableNotifications.checked
            };
            
            // Save settings
            await this.storageManager.setMultipleSettings(newSettings);
            
            // Update current settings
            this.currentSettings = { ...this.currentSettings, ...newSettings };
            
            this.showStatus('Settings saved successfully!', 'success');
            
            // Close settings after a short delay
            setTimeout(() => this.goBack(), 1500);
            
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showStatus('Failed to save settings', 'error');
        }
    }

    getSelectedContentTypes() {
        const types = [];
        if (this.elements.typeArticles.checked) types.push('article');
        if (this.elements.typeBlogs.checked) types.push('blog');
        if (this.elements.typeNews.checked) types.push('news');
        if (this.elements.typeDocs.checked) types.push('documentation');
        return types;
    }

    async exportData() {
        try {
            const data = await this.storageManager.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `web-summarizer-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            this.showStatus('Data exported successfully!', 'success');
            
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showStatus('Failed to export data', 'error');
        }
    }

    importData() {
        this.elements.importFile.click();
    }

    async handleImportFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            await this.storageManager.importData(data);
            
            // Reload settings
            await this.loadSettings();
            this.updateUI();
            
            this.showStatus('Data imported successfully!', 'success');
            
        } catch (error) {
            console.error('Error importing data:', error);
            this.showStatus('Failed to import data. Please check file format.', 'error');
        }
        
        // Clear file input
        event.target.value = '';
    }

    async clearHistory() {
        if (confirm('Are you sure you want to clear all summary history? This action cannot be undone.')) {
            try {
                await this.storageManager.clearSummaryHistory();
                this.showStatus('History cleared successfully!', 'success');
            } catch (error) {
                console.error('Error clearing history:', error);
                this.showStatus('Failed to clear history', 'error');
            }
        }
    }

    async clearFavorites() {
        if (confirm('Are you sure you want to clear all favorites? This action cannot be undone.')) {
            try {
                // Get current favorites and remove them one by one
                const favorites = await this.storageManager.getFavoriteSummaries();
                for (const favorite of favorites) {
                    await this.storageManager.removeFromFavorites(favorite.url);
                }
                this.showStatus('Favorites cleared successfully!', 'success');
            } catch (error) {
                console.error('Error clearing favorites:', error);
                this.showStatus('Failed to clear favorites', 'error');
            }
        }
    }

    async resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
            try {
                await this.storageManager.resetToDefaults();
                await this.loadSettings();
                this.updateUI();
                this.showStatus('Settings reset to defaults!', 'success');
            } catch (error) {
                console.error('Error resetting settings:', error);
                this.showStatus('Failed to reset settings', 'error');
            }
        }
    }

    goBack() {
        // Close settings and return to main popup
        window.close();
    }

    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('statusMessage');
        statusElement.textContent = message;
        statusElement.className = `status-message ${type}`;
        statusElement.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 3000);
    }
}

// Initialize settings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager();
});
