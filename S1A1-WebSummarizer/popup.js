// popup.js
import { config } from './config.js';



document.addEventListener('DOMContentLoaded', () => {
    const summarizeButton = document.getElementById('summarize');
    const loader = document.getElementById('loader');
    const summaryDiv = document.getElementById('summary');

    summarizeButton.addEventListener('click', async () => {
        try {
            // Show loader
            loader.classList.remove('hidden');
            summaryDiv.textContent = '';

            // Check for API key
            const result = await chrome.storage.sync.get('geminiApiKey');
            if (!result.geminiApiKey) {
                summaryDiv.innerHTML = `
                    <div class="error">
                        Please set your Gemini API key in the 
                        <a href="#" id="openSettings">extension settings</a>
                    </div>
                `;
                document.getElementById('openSettings').addEventListener('click', () => {
                    chrome.runtime.openOptionsPage();
                });
                return;
            }

            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Inject content script
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });

            // Get page content
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'summarize' });
            
            if (!response || !response.content) {
                throw new Error('Failed to extract page content');
            }

            // Generate summary using Gemini
            const summary = await generateSummary(response.content, result.geminiApiKey);
            
            // Display summary
            summaryDiv.innerHTML = formatSummary(summary);

        } catch (error) {
            console.error('Summarization error:', error);
            summaryDiv.innerHTML = `
                <div class="error">
                    Error: ${error.message}
                </div>
            `;
        } finally {
            loader.classList.add('hidden');
        }
    });
});


async function generateSummary(text) {
    try {
      const response = await fetch(`${config.GEMINI_API_URL}?key=${config.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: text
            }]
          }]
        })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Summarization error:', error);
      throw new Error('Failed to generate summary');
    }
  }

//Old below
async function generateSummary2(text, apiKey) {
    const GEMINI_API_KEY = apiKey
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=GEMINI_API_KEY", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            //'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: `Summarize the following text in 3-4 bullet points:\n\n${text}`
                }]
            }]
        })
    });

    if (!response.ok) {
        throw new Error('Failed to generate summary: ' + apiKey + ' ' + response.statusText);   
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

function formatSummary(summary) {
    const points = summary.split('\n').filter(point => point.trim());
    return points.map(point => `<li>${point.trim()}</li>`).join('');
}