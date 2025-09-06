// Popup JavaScript for Web Content Summarizer
class PopupManager {
    constructor() {
        this.currentTab = null;
        this.currentSummary = null;
        this.init();
    }

    async init() {
        try {
            // Get current active tab
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            this.currentTab = tabs[0];
            
            // Initialize UI
            this.initializeUI();
            
            // Load page information
            await this.loadPageInfo();
            
            // Generate initial summary
            await this.generateSummary();
            
        } catch (error) {
            console.error('Error initializing popup:', error);
            this.showError('Failed to initialize popup');
        }
    }

    initializeUI() {
        // Get DOM elements
        this.elements = {
            summaryContent: document.getElementById('summaryContent'),
            summaryLength: document.getElementById('summaryLength'),
            refreshBtn: document.getElementById('refreshBtn'),
            copyBtn: document.getElementById('copyBtn'),
            shareBtn: document.getElementById('shareBtn'),
            pageTitle: document.getElementById('pageTitle'),
            contentType: document.getElementById('contentType'),
            wordCount: document.getElementById('wordCount'),
            statusText: document.getElementById('statusText'),
            settingsBtn: document.getElementById('settingsBtn')
        };

        // Add event listeners
        this.elements.refreshBtn.addEventListener('click', () => this.generateSummary());
        this.elements.copyBtn.addEventListener('click', () => this.copySummary());
        this.elements.shareBtn.addEventListener('click', () => this.shareSummary());
        this.elements.summaryLength.addEventListener('change', () => this.onSummaryLengthChange());
        this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
    }

    async loadPageInfo() {
        try {
            // Update page title
            this.elements.pageTitle.textContent = this.currentTab.title || 'Unknown Page';
            
            // Get content type and word count from content script
            const response = await chrome.tabs.sendMessage(this.currentTab.id, {
                action: 'getPageInfo'
            });
            
            if (response && response.success) {
                this.elements.contentType.textContent = response.contentType || 'Article';
                this.elements.wordCount.textContent = response.wordCount || '0';
            } else {
                this.elements.contentType.textContent = 'Unknown';
                this.elements.wordCount.textContent = '0';
            }
        } catch (error) {
            console.error('Error loading page info:', error);
            this.elements.contentType.textContent = 'Error';
            this.elements.wordCount.textContent = '0';
        }
    }

    async generateSummary() {
        try {
            this.showLoading();
            this.updateStatus('Generating summary...');
            
            // Send message to content script to extract content
            const response = await chrome.tabs.sendMessage(this.currentTab.id, {
                action: 'extractContent',
                summaryLength: this.elements.summaryLength.value
            });
            
            if (response && response.success) {
                this.currentSummary = response.summary;
                this.displaySummary(response.summary);
                this.enableActions();
                this.updateStatus('Summary generated successfully');
            } else {
                throw new Error(response?.error || 'Failed to extract content');
            }
            
        } catch (error) {
            console.error('Error generating summary:', error);
            this.showError('Failed to generate summary. Please try again.');
            this.updateStatus('Error generating summary');
        }
    }

    showLoading() {
        this.elements.summaryContent.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Analyzing page content...</p>
            </div>
        `;
        this.disableActions();
    }

    displaySummary(summary) {
        this.elements.summaryContent.innerHTML = `
            <div class="summary-text">
                <h3>Summary</h3>
                <p>${summary}</p>
            </div>
        `;
    }

    showError(message) {
        this.elements.summaryContent.innerHTML = `
            <div class="error-state">
                <span class="icon">❌</span>
                <p>${message}</p>
            </div>
        `;
        this.disableActions();
    }

    enableActions() {
        this.elements.copyBtn.disabled = false;
        this.elements.shareBtn.disabled = false;
    }

    disableActions() {
        this.elements.copyBtn.disabled = true;
        this.elements.shareBtn.disabled = true;
    }

    async copySummary() {
        if (!this.currentSummary) return;
        
        try {
            await navigator.clipboard.writeText(this.currentSummary);
            this.updateStatus('Summary copied to clipboard');
            
            // Visual feedback
            const originalText = this.elements.copyBtn.innerHTML;
            this.elements.copyBtn.innerHTML = '<span>✅</span> Copied!';
            setTimeout(() => {
                this.elements.copyBtn.innerHTML = originalText;
            }, 2000);
            
        } catch (error) {
            console.error('Error copying summary:', error);
            this.updateStatus('Failed to copy summary');
        }
    }

    async shareSummary() {
        if (!this.currentSummary) return;
        
        try {
            if (navigator.share) {
                await navigator.share({
                    title: this.currentTab.title,
                    text: this.currentSummary,
                    url: this.currentTab.url
                });
                this.updateStatus('Summary shared successfully');
            } else {
                // Fallback: copy to clipboard
                await this.copySummary();
                this.updateStatus('Summary copied (sharing not supported)');
            }
        } catch (error) {
            console.error('Error sharing summary:', error);
            this.updateStatus('Failed to share summary');
        }
    }

    onSummaryLengthChange() {
        // Regenerate summary with new length
        this.generateSummary();
    }

    openSettings() {
        // Open settings in a new popup window
        const settingsUrl = chrome.runtime.getURL('popup/settings.html');
        chrome.windows.create({
            url: settingsUrl,
            type: 'popup',
            width: 450,
            height: 600
        });
    }

    updateStatus(message) {
        this.elements.statusText.textContent = message;
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});
