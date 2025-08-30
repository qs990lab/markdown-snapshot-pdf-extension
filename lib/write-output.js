const { promisify } = require('util');
const writeFile = promisify(require('fs').writeFile);
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const getOutputFilePath = require('./get-output-file-path');
const isHttpUrl = require('./is-http-url');

/**
 * Try to find system Chrome/Chromium executable
 */
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
    }
    
    for (const chromePath of possiblePaths) {
        if (fs.existsSync(chromePath)) {
            return chromePath;
        }
    }
    
    return null;
}

/**
 * Create a PDF and write it to disk.
 *
 * @param {string} mdFilePath path to the source markdown file
 * @param {string} html HTML document as a string
 * @param {Object} config configuration object
 * @param {string} [config.dest] path to write the output to
 * @param {number} config.port port that the server runs on
 * @param {string[]} config.stylesheet list of stylesheets (urls or paths)
 * @param {string} config.css string with CSS rules
 * @param {Object} config.pdf_options PDF options for Puppeteer
 * @param {boolean} config.as_html whether to save the output as HTML instead
 * @param {boolean} config.devtools show the Devtools instead of saving the PDF
 * @param {puppeteer.LaunchOptions} config.launch_options browser launch options
 *
 * @returns a promise that resolves once the file is written
 */
/**
 * Try to find system Chrome/Chromium executable
 */
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
    }
    
    for (const chromePath of possiblePaths) {
        if (fs.existsSync(chromePath)) {
            return chromePath;
        }
    }
    
    return null;
}

/**
 * Create a PDF and write it to disk.
 *
 * @param {string} mdFilePath path to the source markdown file
 * @param {string} html HTML document as a string
 * @param {Object} config configuration object
 * @param {string} [config.dest] path to write the output to
 * @param {number} config.port port that the server runs on
 * @param {string[]} config.stylesheet list of stylesheets (urls or paths)
 * @param {string} config.css string with CSS rules
 * @param {Object} config.pdf_options PDF options for Puppeteer
 * @param {boolean} config.as_html whether to save the output as HTML instead
 * @param {boolean} config.devtools show the Devtools instead of saving the PDF
 * @param {puppeteer.LaunchOptions} config.launch_options browser launch options
 *
 * @returns a promise that resolves once the file is written
 */
module.exports = async(mdFilePath, html, config) => {
    // Log Puppeteer version for debugging
    try {
        const puppeteerVersion = require('puppeteer/package.json').version;
        console.log('Using Puppeteer version:', puppeteerVersion);
    } catch (e) {
        console.log('Could not determine Puppeteer version');
    }
    
    // Enhanced Puppeteer launch options for better compatibility
    const launchOptions = {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--ignore-certificate-errors',
            '--ignore-ssl-errors',
            '--ignore-certificate-errors-spki-list'
        ],
        headless: true,
        devtools: config.devtools,
        timeout: 60000, // 60 second timeout for browser launch
        ...config.launch_options
    };

    // Add proxy support if environment variables are set
    if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY) {
        const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
        launchOptions.args.push(`--proxy-server=${proxyUrl}`);
        console.log('Using proxy:', proxyUrl);
    }

    let browser;
    try {
        browser = await puppeteer.launch(launchOptions);
    } catch (error) {
        // If launch fails, try with system Chrome/Chromium
        console.warn('Failed to launch bundled Chromium, trying system browser...');
        try {
            const executablePath = findSystemChrome();
            if (executablePath) {
                launchOptions.executablePath = executablePath;
                browser = await puppeteer.launch(launchOptions);
            } else {
                throw error;
            }
        } catch (systemError) {
            throw new Error(`Could not find expected browser (chrome) locally. Run npm install to download the correct Chromium revision. Original error: ${error.message}`);
        }
    }

    const page = await browser.newPage();
    
    // Set longer timeouts for corporate environments
    page.setDefaultTimeout(60000); // 60 seconds
    page.setDefaultNavigationTimeout(60000); // 60 seconds
    
    // Monitor console messages for debugging
    page.on('console', msg => {
        const type = msg.type();
        if (type === 'log' || type === 'warn' || type === 'error') {
            console.log(`Browser ${type}:`, msg.text());
        }
    });
    
    // Monitor page errors
    page.on('pageerror', error => {
        console.error('Page error:', error.message);
    });

    // this makes sure that relative paths are resolved properly
    await page.goto(`http://localhost:${config.port}`);

    // overwrite the content with what was generated from the markdown
    await page.setContent(html);

    // add all the stylesheets and custom css
    const stylePromises = [
        ...config.stylesheet.map(async stylesheet =>
            page.addStyleTag(isHttpUrl(stylesheet) ? { url: stylesheet } : { path: stylesheet }),
        )
    ];
    
    // Only add CSS content if it's not empty
    if (config.css && config.css.trim()) {
        stylePromises.push(page.addStyleTag({ content: config.css }));
    }
    
    await Promise.all(stylePromises);

    /**
     * Wait for network to be idle.
     *
     * @todo replace with page.waitForNetworkIdle once exposed
     * @see https://github.com/GoogleChrome/puppeteer/issues/3083
     */
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 }),
        page.evaluate(() => history.pushState(null, null, '#')), // eslint-disable-line no-undef
    ]);

    // Wait for Mermaid to finish rendering with extended timeout for corporate environments
    try {
        await page.waitForFunction(
            () => window.mermaidReady === true,
            { timeout: 30000 } // 30 seconds timeout for Mermaid rendering
        );
        console.log('Mermaid rendering completed successfully');
    } catch (timeoutError) {
        console.warn('Mermaid rendering timeout, proceeding with PDF generation anyway');
        // Continue with PDF generation even if Mermaid times out
    }

    /**
     * @todo should it be `getOutputFilePath(config.dest || mdFilePath, config)`?
     */
    const outputFilePath = config.dest || getOutputFilePath(mdFilePath, config);

    if (config.devtools) {
        await new Promise(resolve => page.on('close', resolve));
    } else if (config.as_html) {
        const content = await page.content();
        await writeFile(outputFilePath, content);
    } else {
        await page.emulateMediaType('screen');
        
        // Handle one-page PDF generation
        if (config.onePage) {
            console.log('Starting one-page PDF generation...');
            
            // Wait for content to fully render using a more compatible method
            try {
                // Try modern method first
                if (typeof page.waitForTimeout === 'function') {
                    await page.waitForTimeout(2000);
                } else {
                    // Fallback to older method
                    await page.waitFor(2000);
                }
            } catch (waitError) {
                console.warn('Wait method failed, using setTimeout fallback:', waitError.message);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            // Measure content height more accurately
            const contentDimensions = await page.evaluate(() => {
                // Force layout recalculation
                document.body.offsetHeight;
                
                // Get various height measurements
                const body = document.body;
                const html = document.documentElement;
                
                // Wait for any dynamic content (like Mermaid) to finish rendering
                const allElements = document.querySelectorAll('*');
                let maxBottom = 0;
                
                for (let element of allElements) {
                    const rect = element.getBoundingClientRect();
                    const elementBottom = rect.bottom + window.pageYOffset;
                    if (elementBottom > maxBottom) {
                        maxBottom = elementBottom;
                    }
                }
                
                const measurements = {
                    scrollHeight: Math.max(body.scrollHeight, html.scrollHeight),
                    offsetHeight: Math.max(body.offsetHeight, html.offsetHeight),
                    clientHeight: Math.max(body.clientHeight, html.clientHeight),
                    maxElementBottom: maxBottom,
                    bodyRect: body.getBoundingClientRect(),
                    windowHeight: window.innerHeight,
                    documentHeight: document.documentElement.getBoundingClientRect().height
                };
                
                // Use the maximum of all measurements
                const height = Math.max(
                    measurements.scrollHeight,
                    measurements.offsetHeight,
                    measurements.maxElementBottom,
                    measurements.documentHeight
                );
                
                console.log('Height measurements:', measurements);
                console.log('Selected height:', height);
                
                return {
                    height: height,
                    width: html.clientWidth,
                    measurements: measurements
                };
            });
            
            console.log('Content dimensions:', contentDimensions);
            
            // Calculate appropriate PDF dimensions with more precision
            // Use 96 DPI as standard (1 inch = 96px = 25.4mm)
            const pixelToMm = 25.4 / 96;
            const baseContentHeightMm = Math.ceil(contentDimensions.height * pixelToMm);
            
            // Apply buffer only for long content (over 3000mm ~ 10 A4 pages)
            const isLongContent = baseContentHeightMm > 3000;
            const contentHeightMm = isLongContent ? Math.ceil(baseContentHeightMm * 1.5) : baseContentHeightMm;
            
            // Margins for one-page (narrow)
            const marginTop = 10;
            const marginBottom = 10;
            const marginLeft = 10;
            const marginRight = 10;
            
            // Add some extra padding to ensure content fits
            const extraPadding = 20; // Extra 20mm padding
            const totalHeightMm = contentHeightMm + marginTop + marginBottom + extraPadding;
            
            // Set limits
            const minHeightMm = 297; // A4 height
            const maxHeightMm = 10000; // Increased maximum to 10000mm
            
            const finalHeightMm = Math.min(Math.max(totalHeightMm, minHeightMm), maxHeightMm);
            
            console.log(`Height calculation:\\n                Base content: ${baseContentHeightMm}mm\\n                Long content buffer: ${isLongContent ? '1.5x' : 'none'}\\n                Final content: ${contentHeightMm}mm\\n                Margins: ${marginTop + marginBottom}mm\\n                Extra padding: ${extraPadding}mm\\n                Total calculated: ${totalHeightMm}mm\\n                Final height: ${finalHeightMm}mm`);
            
            // Create custom PDF options for one-page with no page breaks
            const onePagePdfOptions = {
                ...config.pdf_options,
                format: undefined, // Remove format to use custom dimensions
                width: '210mm', // A4 width
                height: `${finalHeightMm}mm`,
                margin: {
                    top: `${marginTop}mm`,
                    right: `${marginRight}mm`,
                    bottom: `${marginBottom}mm`,
                    left: `${marginLeft}mm`,
                },
                printBackground: true,
                preferCSSPageSize: false, // Ignore CSS page size
                displayHeaderFooter: false, // No headers/footers
                pageRanges: '', // Print all content
            };
            
            // Add CSS to prevent page breaks
            await page.addStyleTag({
                content: `
                    * {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    body {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    @page {
                        size: 210mm ${finalHeightMm}mm;
                        margin: ${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm;
                    }
                `
            });
            
            console.log('One-page PDF options:', onePagePdfOptions);
            await page.pdf({ path: outputFilePath, ...onePagePdfOptions });
            
            if (finalHeightMm >= maxHeightMm) {
                console.warn(`Content was truncated. Original height would be ${totalHeightMm}mm, but was limited to ${maxHeightMm}mm`);
            }
        } else {
            // Standard PDF generation
            await page.pdf({ path: outputFilePath, ...config.pdf_options });
        }
    }

    browser.close();

    return config.devtools ? {} : { filename: outputFilePath };
};;;