const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Setting up Puppeteer for Markdown Mermaid PDF extension...');

try {
    // Check if Puppeteer is already installed and working
    const puppeteerPath = path.join(__dirname, '..', 'node_modules', 'puppeteer');
    
    if (fs.existsSync(puppeteerPath)) {
        console.log('Puppeteer found, ensuring Chromium is downloaded...');
        
        // Force Puppeteer to download Chromium
        process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'false';
        
        try {
            // Try to install Puppeteer again to ensure Chromium is downloaded
            execSync('npm install puppeteer --no-save', { 
                stdio: 'inherit',
                cwd: path.join(__dirname, '..')
            });
            console.log('Puppeteer setup completed successfully!');
        } catch (error) {
            console.warn('Warning: Could not reinstall Puppeteer, but continuing...');
        }
    } else {
        console.log('Puppeteer not found, this should not happen in a properly installed extension.');
    }
} catch (error) {
    console.error('Error during Puppeteer setup:', error.message);
    console.log('The extension may still work if Chromium is available system-wide.');
}
