// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'summarize') {
        try {
            const content = extractPageContent();
            sendResponse({ content });
        } catch (error) {
            sendResponse({ error: error.message });
        }
    }
    return true; // Required for async response
});

function extractPageContent() {
    // Remove unwanted elements
    const elementsToRemove = document.querySelectorAll('header, footer, nav, aside, .ads, .comments');
    elementsToRemove.forEach(element => element?.remove());

    // Get main content
    const article = document.querySelector('article') || 
                   document.querySelector('main') || 
                   document.querySelector('.content') ||
                   document.body;

    // Extract text from paragraphs
    const paragraphs = article.querySelectorAll('p');
    let content = '';
    
    paragraphs.forEach(p => {
        if (p && p.textContent) {
            content += p.textContent.trim() + ' ';
        }
    });

    if (!content.trim()) {
        throw new Error('No content found on page');
    }

    return content.trim();
}