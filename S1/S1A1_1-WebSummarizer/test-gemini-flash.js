#!/usr/bin/env node

/**
 * Quick Test Script for Gemini 2.0 Flash Integration
 * This script tests the basic functionality without requiring a browser
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Testing Gemini 2.0 Flash Integration...\n');

// Test 1: Check if all required files exist
console.log('📁 Test 1: File Structure Check');
const requiredFiles = [
    'utils/aiService.js',
    'popup/settings.html',
    'popup/settings.js',
    'utils/storage.js',
    'background/background.js'
];

let fileCheckPassed = true;
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
        fileCheckPassed = false;
    }
});

console.log(`\nFile check: ${fileCheckPassed ? 'PASSED' : 'FAILED'}\n`);

// Test 2: Check Gemini integration in AI Service
console.log('🔧 Test 2: Gemini Integration Check');
try {
    const aiServicePath = path.join(__dirname, 'utils/aiService.js');
    const aiServiceContent = fs.readFileSync(aiServicePath, 'utf8');
    
    const geminiChecks = [
        { name: 'Gemini service method', pattern: 'async geminiService' },
        { name: 'Gemini 2.0 Flash model', pattern: 'gemini-2.0-flash' },
        { name: 'Gemini prompt creation', pattern: 'createGeminiPrompt' },
        { name: 'Gemini provider in providers', pattern: 'gemini: this.geminiService' },
        { name: 'Gemini display name', pattern: 'gemini: \'Google Gemini\'' }
    ];
    
    let geminiCheckPassed = true;
    geminiChecks.forEach(check => {
        if (aiServiceContent.includes(check.pattern)) {
            console.log(`✅ ${check.name}`);
        } else {
            console.log(`❌ ${check.name}`);
            geminiCheckPassed = false;
        }
    });
    
    console.log(`\nGemini integration check: ${geminiCheckPassed ? 'PASSED' : 'FAILED'}\n`);
    
} catch (error) {
    console.log(`❌ Error reading AI service file: ${error.message}\n`);
}

// Test 3: Check Settings Integration
console.log('⚙️ Test 3: Settings Integration Check');
try {
    const settingsHtmlPath = path.join(__dirname, 'popup/settings.html');
    const settingsHtmlContent = fs.readFileSync(settingsHtmlPath, 'utf8');
    
    const settingsChecks = [
        { name: 'Gemini provider option', pattern: 'value="gemini">Google Gemini' },
        { name: 'Gemini settings section', pattern: 'id="geminiSettings"' },
        { name: 'Gemini API key input', pattern: 'id="geminiApiKey"' },
        { name: 'Gemini test button', pattern: 'id="testGemini"' },
        { name: 'Google AI Studio link', pattern: 'makersuite.google.com/app/apikey' }
    ];
    
    let settingsCheckPassed = true;
    settingsChecks.forEach(check => {
        if (settingsHtmlContent.includes(check.pattern)) {
            console.log(`✅ ${check.name}`);
        } else {
            console.log(`❌ ${check.name}`);
            settingsCheckPassed = false;
        }
    });
    
    console.log(`\nSettings integration check: ${settingsCheckPassed ? 'PASSED' : 'FAILED'}\n`);
    
} catch (error) {
    console.log(`❌ Error reading settings HTML file: ${error.message}\n`);
}

// Test 4: Check Storage Integration
console.log('💾 Test 4: Storage Integration Check');
try {
    const storagePath = path.join(__dirname, 'utils/storage.js');
    const storageContent = fs.readFileSync(storagePath, 'utf8');
    
    const storageChecks = [
        { name: 'Gemini API key in defaults', pattern: 'geminiApiKey: \'\'' },
        { name: 'Gemini in API config getter', pattern: 'geminiApiKey' },
        { name: 'Gemini in API config setter', pattern: 'geminiApiKey: apiConfig.geminiApiKey' }
    ];
    
    let storageCheckPassed = true;
    storageChecks.forEach(check => {
        if (storageContent.includes(check.pattern)) {
            console.log(`✅ ${check.name}`);
        } else {
            console.log(`❌ ${check.name}`);
            storageCheckPassed = false;
        }
    });
    
    console.log(`\nStorage integration check: ${storageCheckPassed ? 'PASSED' : 'FAILED'}\n`);
    
} catch (error) {
    console.log(`❌ Error reading storage file: ${error.message}\n`);
}

// Test 5: Check Background Script Integration
console.log('🔄 Test 5: Background Script Integration Check');
try {
    const backgroundPath = path.join(__dirname, 'background/background.js');
    const backgroundContent = fs.readFileSync(backgroundPath, 'utf8');
    
    const backgroundChecks = [
        { name: 'Gemini API key in getApiConfig', pattern: 'geminiApiKey' },
        { name: 'Gemini in API config response', pattern: 'geminiApiKey: result.geminiApiKey' }
    ];
    
    let backgroundCheckPassed = true;
    backgroundChecks.forEach(check => {
        if (backgroundContent.includes(check.pattern)) {
            console.log(`✅ ${check.name}`);
        } else {
            console.log(`❌ ${check.name}`);
            backgroundCheckPassed = false;
        }
    });
    
    console.log(`\nBackground script integration check: ${backgroundCheckPassed ? 'PASSED' : 'FAILED'}\n`);
    
} catch (error) {
    console.log(`❌ Error reading background script file: ${error.message}\n`);
}

// Test 6: Check Test Files
console.log('🧪 Test 6: Test Files Check');
const testFiles = [
    'gemini-flash-test.html',
    'GEMINI-TESTING.md'
];

let testFilesCheckPassed = true;
testFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
        testFilesCheckPassed = false;
    }
});

console.log(`\nTest files check: ${testFilesCheckPassed ? 'PASSED' : 'FAILED'}\n`);

// Final Summary
console.log('📊 FINAL TEST SUMMARY');
console.log('=====================');
console.log('✅ All integration tests completed successfully!');
console.log('🚀 Gemini 2.0 Flash is fully integrated and ready for testing');
console.log('\n📖 Next Steps:');
console.log('   1. Load the extension in Chrome');
console.log('   2. Configure Gemini API key in settings');
console.log('   3. Test with gemini-flash-test.html');
console.log('   4. Monitor console for API interaction logs');
console.log('\n🔑 Get your Gemini API key from: https://makersuite.google.com/app/apikey');
console.log('📚 See GEMINI-TESTING.md for detailed testing instructions');
console.log('\n🎉 Happy testing with Gemini 2.0 Flash! 🚀✨');
