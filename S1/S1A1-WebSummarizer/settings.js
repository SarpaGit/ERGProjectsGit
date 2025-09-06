// settings.js
document.addEventListener('DOMContentLoaded', () => {
    loadSavedSettings();
    setupEventListeners();
});

async function loadSavedSettings() {
    try {
        const result = await chrome.storage.sync.get('geminiApiKey');
        const apiKeyInput = document.getElementById('apiKey');
        if (result.geminiApiKey) {
            apiKeyInput.value = result.geminiApiKey;
        }
    } catch (error) {
        showError('Error loading settings: ' + error.message);
    }
}

function setupEventListeners() {
    const saveButton = document.getElementById('saveButton');
    const apiKeyInput = document.getElementById('apiKey');

    saveButton.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        
        // Clear previous status/error
        hideStatus();
        hideError();

        if (!apiKey) {
            showError('Please enter a valid API key');
            return;
        }

        try {
            await saveSettings(apiKey);
            showStatus('Settings saved successfully!');
        } catch (error) {
            showError('Error saving settings: ' + error.message);
        }
    });
}

async function saveSettings(apiKey) {
    await chrome.storage.sync.set({ 
        geminiApiKey: apiKey 
    });
}

function showStatus(message) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.style.display = 'block';
    setTimeout(() => {
        status.style.display = 'none';
    }, 3000);
}

function hideStatus() {
    const status = document.getElementById('status');
    status.style.display = 'none';
}

function showError(message) {
    const error = document.getElementById('error');
    error.textContent = message;
    error.style.display = 'block';
}

function hideError() {
    const error = document.getElementById('error');
    error.style.display = 'none';
}

// Add console logging for debugging
window.addEventListener('error', (event) => {
    console.error('Error:', event.error);
});