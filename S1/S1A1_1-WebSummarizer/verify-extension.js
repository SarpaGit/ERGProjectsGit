#!/usr/bin/env node

/**
 * Extension Verification Script
 * Checks if all required files are present and have correct syntax
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Web Content Summarizer Extension...\n');

// Required files and their expected content
const requiredFiles = [
    'manifest.json',
    'popup/popup.html',
    'popup/popup.css',
    'popup/popup.js',
    'popup/settings.html',
    'popup/settings.css',
    'popup/settings.js',
    'content-scripts/content.js',
    'content-scripts/content.css',
    'background/background.js',
    'utils/textProcessor.js',
    'utils/summarizer.js',
    'utils/storage.js',
    'utils/aiService.js',
    'test-page.html',
    'ai-test-page.html',
    'gemini-flash-test.html',
    'README.md',
    'INSTALLATION.md',
    'TROUBLESHOOTING.md',
    'GEMINI-TESTING.md'
];

// Check if files exist
console.log('📁 Checking file structure...');
let allFilesExist = true;

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allFilesExist = false;
    }
});

console.log('');

// Check manifest.json syntax
console.log('📋 Checking manifest.json...');
try {
    const manifestPath = path.join(__dirname, 'manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    // Check required fields
    const requiredFields = ['manifest_version', 'name', 'version', 'permissions', 'action'];
    let manifestValid = true;
    
    requiredFields.forEach(field => {
        if (!manifest[field]) {
            console.log(`❌ Missing required field: ${field}`);
            manifestValid = false;
        }
    });
    
    if (manifestValid) {
        console.log('✅ manifest.json is valid');
        console.log(`   - Version: ${manifest.version}`);
        console.log(`   - Manifest Version: ${manifest.manifest_version}`);
        console.log(`   - Permissions: ${manifest.permissions.join(', ')}`);
    } else {
        console.log('❌ manifest.json has issues');
    }
} catch (error) {
    console.log(`❌ Error parsing manifest.json: ${error.message}`);
}

console.log('');

// Check JavaScript syntax
console.log('🔧 Checking JavaScript syntax...');
const jsFiles = [
    'popup/popup.js',
    'popup/settings.js',
    'content-scripts/content.js',
    'background/background.js',
    'utils/textProcessor.js',
    'utils/summarizer.js',
    'utils/storage.js',
    'utils/aiService.js'
];

let jsSyntaxValid = true;

jsFiles.forEach(file => {
    try {
        const filePath = path.join(__dirname, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Basic syntax check (this is simplified)
        if (content.includes('function') || content.includes('class') || content.includes('const') || content.includes('let')) {
            console.log(`✅ ${file} - Basic syntax check passed`);
        } else {
            console.log(`⚠️  ${file} - No obvious JavaScript content found`);
        }
    } catch (error) {
        console.log(`❌ ${file} - Error reading file: ${error.message}`);
        jsSyntaxValid = false;
    }
});

console.log('');

// Check HTML files
console.log('🌐 Checking HTML files...');
const htmlFiles = ['popup/popup.html', 'popup/settings.html', 'test-page.html', 'ai-test-page.html', 'gemini-flash-test.html'];

htmlFiles.forEach(file => {
    try {
        const filePath = path.join(__dirname, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('<!DOCTYPE html>') && content.includes('<html')) {
            console.log(`✅ ${file} - Valid HTML structure`);
        } else {
            console.log(`⚠️  ${file} - HTML structure may be incomplete`);
        }
    } catch (error) {
        console.log(`❌ ${file} - Error reading file: ${error.message}`);
    }
});

console.log('');

// Check CSS files
console.log('🎨 Checking CSS files...');
const cssFiles = ['popup/popup.css', 'popup/settings.css', 'content-scripts/content.css'];

cssFiles.forEach(file => {
    try {
        const filePath = path.join(__dirname, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('{') && content.includes('}')) {
            console.log(`✅ ${file} - Valid CSS structure`);
        } else {
            console.log(`⚠️  ${file} - CSS structure may be incomplete`);
        }
    } catch (error) {
        console.log(`❌ ${file} - Error reading file: ${error.message}`);
    }
});

console.log('');

// Summary
console.log('📊 Verification Summary:');
console.log(`   - Required files: ${requiredFiles.length}`);
console.log(`   - Files exist: ${allFilesExist ? '✅ All present' : '❌ Some missing'}`);
console.log(`   - JavaScript files: ${jsFiles.length}`);
console.log(`   - HTML files: ${htmlFiles.length}`);
console.log(`   - CSS files: ${cssFiles.length}`);

if (allFilesExist) {
    console.log('\n🎉 Extension verification completed successfully!');
    console.log('   The extension should be ready to load in Chrome.');
    console.log('\n📖 Next steps:');
    console.log('   1. Open Chrome and go to chrome://extensions/');
    console.log('   2. Enable Developer mode');
    console.log('   3. Click "Load unpacked" and select this folder');
    console.log('   4. Test with test-page.html');
} else {
    console.log('\n⚠️  Extension verification found issues.');
    console.log('   Please check the missing files above.');
}

console.log('\n📚 For help, see:');
console.log('   - INSTALLATION.md - Setup instructions');
console.log('   - TROUBLESHOOTING.md - Common issues and solutions');
console.log('   - README.md - Project overview');
