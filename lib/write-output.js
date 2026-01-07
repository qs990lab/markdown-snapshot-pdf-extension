const { promisify } = require('util');
const writeFile = promisify(require('fs').writeFile);
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const os = require('os');

const getOutputFilePath = require('./get-output-file-path');
const isHttpUrl = require('./is-http-url');

function findSystemChrome() {
    const possiblePaths = [];
    
    if (process.platform === 'win32') {
        possiblePaths.push(
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
        );
    } else if (process.platform === 'darwin') {
        possiblePaths.push(
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            '/Applications/Chromium.app/Contents/MacOS/Chromium'
        );
    } else {
        possiblePaths.push(
            '/usr/bin/google-chrome',
            '/usr/bin/google-chrome-stable',
            '/usr/bin/chromium',
            '/usr/bin/chromium-browser',
            '/snap/bin/chromium'
        );
        
        if (process.env.WSL_DISTRO_NAME || process.env.WSLENV) {
            possiblePaths.push(
                '/mnt/c/Program Files/Google/Chrome/Application/chrome.exe',
                '/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe'
            );
        }
    }
    
    for (const chromePath of possiblePaths) {
        if (fs.existsSync(chromePath)) {
            return chromePath;
        }
    }
    
    return null;
}

module.exports = async(mdFilePath, html, config) => {
    const launchOptions = {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-web-security',
            '--ignore-certificate-errors',
            '--ignore-ssl-errors'
        ],
        headless: true,
        devtools: config.devtools,
        timeout: 60000,
        ...config.launch_options
    };

    // Proxy support
    if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY) {
        const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
        launchOptions.args.push(`--proxy-server=${proxyUrl}`);
        launchOptions.args.push('--proxy-bypass-list=localhost,127.0.0.1');
        
        // Auto-set TLS for proxy environments
        if (!process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }
    }

    let browser;
    try {
        browser = await puppeteer.launch(launchOptions);
    } catch (error) {
        const executablePath = findSystemChrome();
        if (executablePath) {
            launchOptions.executablePath = executablePath;
            browser = await puppeteer.launch(launchOptions);
        } else {
            throw new Error(`Could not find browser. Original error: ${error.message}`);
        }
    }

    const page = await browser.newPage();
    page.setDefaultTimeout(60000);
    
    page.on('console', msg => console.log(`Browser ${msg.type()}:`, msg.text()));
    page.on('pageerror', error => console.error('Page error:', error.message));

    await page.goto(`http://localhost:${config.port}`);
    await page.setContent(html);

    // Load stylesheets with error handling
    const stylePromises = [];
    
    for (const stylesheet of config.stylesheet) {
        try {
            if (isHttpUrl(stylesheet)) {
                stylePromises.push(
                    page.addStyleTag({ url: stylesheet }).catch(error => {
                        console.warn(`Failed to load external stylesheet: ${error.message}`);
                        return null;
                    })
                );
            } else if (fs.existsSync(stylesheet)) {
                let cssContent = fs.readFileSync(stylesheet, 'utf8');
                
                // Keep @import for proxy environments, remove otherwise
                const isProxyConfigured = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
                const isFontFile = stylesheet.includes('high-quality-fonts');
                
                if (isProxyConfigured && isFontFile) {
                    stylePromises.push(
                        page.addStyleTag({ content: cssContent }).catch(error => {
                            console.warn(`External fonts failed, using system fonts: ${error.message}`);
                            // Fallback to offline fonts
                            const offlinePath = stylesheet.replace('high-quality-fonts.css', 'high-quality-fonts-offline.css');
                            if (fs.existsSync(offlinePath)) {
                                const offlineContent = fs.readFileSync(offlinePath, 'utf8');
                                return page.addStyleTag({ content: offlineContent }).catch(() => null);
                            }
                            return null;
                        })
                    );
                } else {
                    cssContent = cssContent.replace(/@import\s+url\([^)]+\);?/g, '/* External import removed */');
                    stylePromises.push(
                        page.addStyleTag({ content: cssContent }).catch(() => null)
                    );
                }
            }
        } catch (error) {
            console.warn(`Error processing stylesheet: ${error.message}`);
        }
    }
    
    if (config.css && config.css.trim()) {
        stylePromises.push(
            page.addStyleTag({ content: config.css }).catch(() => null)
        );
    }
    
    await Promise.allSettled(stylePromises);

    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 }),
        page.evaluate(() => history.pushState(null, null, '#'))
    ]);

    // Wait for Mermaid
    try {
        await page.waitForFunction(() => window.mermaidReady === true, { timeout: 30000 });
    } catch (timeoutError) {
        console.warn('Mermaid timeout, proceeding anyway');
    }

    const outputFilePath = config.dest || getOutputFilePath(mdFilePath, config);

    if (config.devtools) {
        await new Promise(resolve => page.on('close', resolve));
    } else if (config.as_html) {
        const content = await page.content();
        await writeFile(outputFilePath, content);
    } else {
        await page.emulateMediaType('screen');
        
        if (config.onePage) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const contentDimensions = await page.evaluate(() => {
                const body = document.body;
                const html = document.documentElement;
                const allElements = document.querySelectorAll('*');
                let maxBottom = 0;
                
                for (let element of allElements) {
                    const rect = element.getBoundingClientRect();
                    const elementBottom = rect.bottom + window.pageYOffset;
                    if (elementBottom > maxBottom) {
                        maxBottom = elementBottom;
                    }
                }
                
                return {
                    height: Math.max(body.scrollHeight, html.scrollHeight, maxBottom),
                    width: html.clientWidth
                };
            });
            
            const pixelToMm = 25.4 / 96;
            const baseContentHeightMm = Math.ceil(contentDimensions.height * pixelToMm);
            let multiplier = 1.1;
            let attempts = 0;
            const maxAttempts = 5;
            
            while (attempts < maxAttempts) {
                attempts++;
                const contentHeightMm = Math.ceil(baseContentHeightMm * multiplier);
                const finalHeightMm = Math.max(contentHeightMm + 50, 297);
                
                const onePagePdfOptions = {
                    ...config.pdf_options,
                    format: undefined,
                    width: '210mm',
                    height: `${finalHeightMm}mm`,
                    margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
                    printBackground: true,
                    preferCSSPageSize: false
                };
                
                await page.addStyleTag({
                    content: `
                        * { page-break-inside: avoid !important; }
                        @page { size: 210mm ${finalHeightMm}mm; }
                    `
                });
                
                // Generate temporary PDF to check page count with unique filename
                const tempDir = os.tmpdir();
                const processId = config.processIndex || 0;
                const tempFileName = `markdown_pdf_temp_${Date.now()}_${processId}_${Math.random().toString(36).substring(2, 11)}_${attempts}.pdf`;
                const tempPath = path.join(tempDir, tempFileName);
                
                await page.pdf({ path: tempPath, ...onePagePdfOptions });
                
                // Check page count
                try {
                    const { PDFDocument } = require('pdf-lib');
                    const pdfBytes = fs.readFileSync(tempPath);
                    const pdfDoc = await PDFDocument.load(pdfBytes);
                    const pageCount = pdfDoc.getPageCount();
                    
                    if (pageCount === 1) {
                        // Success! Move temp file to final location
                        fs.renameSync(tempPath, outputFilePath);
                        console.log(`One-page PDF success with multiplier ${multiplier}`);
                        break;
                    } else {
                        // Delete temp file and adjust multiplier
                        fs.unlinkSync(tempPath);
                        
                        // Adjust increment based on page count
                        let increment = pageCount === 2 ? 0.1 : pageCount === 3 ? 0.3 : 0.5;
                        multiplier += increment;
                        console.log(`${pageCount} pages detected, trying multiplier ${multiplier}`);
                    }
                } catch (error) {
                    console.warn('Could not check page count, assuming success');
                    fs.renameSync(tempPath, outputFilePath);
                    break;
                }
                
                if (attempts === maxAttempts) {
                    console.warn(`Max attempts reached, using final result`);
                    if (fs.existsSync(tempPath)) {
                        fs.renameSync(tempPath, outputFilePath);
                    }
                }
            }
        } else {
            await page.pdf({ path: outputFilePath, ...config.pdf_options });
        }
    }

    browser.close();
    return config.devtools ? {} : { filename: outputFilePath };
};
