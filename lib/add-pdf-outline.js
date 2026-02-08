const { PDFDocument, PDFName, PDFArray, PDFDict, PDFString, PDFHexString } = require('pdf-lib');
const fs = require('fs');

/**
 * Extract headings from markdown content
 * @param {string} markdown - Markdown content
 * @returns {Array} Array of heading objects with level, text, and id
 */
function extractHeadings(markdown) {
    const headings = [];
    const lines = markdown.split('\n');
    const headingCounts = {};
    let inCodeBlock = false;
    
    for (const line of lines) {
        // Track code block boundaries
        if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            continue;
        }
        
        // Skip lines inside code blocks
        if (inCodeBlock) continue;
        
        const match = line.match(/^(#{1,3})\s+(.+)$/);
        if (match) {
            const level = match[1].length;
            const text = match[2].trim();
            
            // Generate ID (same as marked.js) - preserve Unicode characters
            let id = text
                .toLowerCase()
                .replace(/[^\p{L}\p{N}\s-]/gu, '') // Keep Unicode letters and numbers
                .replace(/\s+/g, '-')
                .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
            
            // Handle duplicate IDs
            if (headingCounts[id]) {
                headingCounts[id]++;
                id = `${id}-${headingCounts[id]}`;
            } else {
                headingCounts[id] = 0;
            }
            
            headings.push({ level, text, id });
        }
    }
    
    return headings;
}

/**
 * Add PDF outline (bookmarks/TOC) to existing PDF
 * @param {string} pdfPath - Path to PDF file
 * @param {Array} headings - Array of heading objects
 * @param {Object} positions - Heading positions from HTML
 * @param {number} actualPageHeight - Actual PDF page height in points (for one-page PDFs)
 * @param {Array} pdfPageHeights - Array of page heights for multi-page PDFs
 * @param {number} pdfMarginTop - Top margin in points
 * @param {Object} headingPageNumbers - Estimated page numbers for each heading
 */
async function addPdfOutline(pdfPath, headings, positions = {}, actualPageHeight = null, pdfPageHeights = null, pdfMarginTop = 0, headingPageNumbers = {}) {
    if (!headings || headings.length === 0) {
        console.log('No headings found, skipping outline generation');
        return;
    }
    
    console.log(`Processing ${headings.length} headings for PDF outline:`);
    headings.forEach((h, i) => {
        console.log(`  ${i + 1}. [H${h.level}] "${h.text}" (id: ${h.id}) - position: ${positions[h.id] ? 'found' : 'NOT FOUND'}`);
    });
    
    try {
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const context = pdfDoc.context;
        const pages = pdfDoc.getPages();
        
        if (pages.length === 0) return;
        
        const isOnePage = actualPageHeight !== null;
        const pageHeight = isOnePage ? actualPageHeight : pages[0].getHeight();
        const pixelToPoint = 0.75; // 1px = 0.75pt
        
        console.log(`PDF has ${pages.length} pages, one-page mode: ${isOnePage}`);
        
        // Create outline dictionary
        const outlines = context.obj({
            Type: 'Outlines'
        });
        const outlinesRef = context.register(outlines);
        
        // Create outline items
        const items = [];
        const stack = [{ level: 0, children: [] }];
        
        for (const heading of headings) {
            // For h1 and h2, always add to root level
            // For h3, add as child of the previous h2 (or h1 if no h2 exists)
            if (heading.level <= 2) {
                // Pop stack back to root for h1 and h2
                while (stack.length > 1) {
                    stack.pop();
                }
            } else {
                // For h3, find appropriate parent (h2 or h1)
                while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
                    stack.pop();
                }
            }
            
            const parent = stack[stack.length - 1];
            
            // Calculate Y position and page number
            let dest;
            if (positions[heading.id]) {
                const htmlY = positions[heading.id].y;
                
                let pageIndex, yPos;
                if (isOnePage) {
                    // One-page PDF: use actual page height
                    pageIndex = 0;
                    yPos = pageHeight - (htmlY * pixelToPoint);
                } else if (headingPageNumbers && headingPageNumbers[heading.id] !== undefined) {
                    // Multi-page PDF: use estimated page number from browser
                    pageIndex = headingPageNumbers[heading.id];
                    
                    // Ensure page index is within bounds
                    if (pageIndex >= pages.length) {
                        pageIndex = pages.length - 1;
                    }
                    
                    // Position at top of page (accounting for margin)
                    yPos = pdfPageHeights[pageIndex] - pdfMarginTop - 20; // 20 points below margin
                } else if (pdfPageHeights && pdfPageHeights.length > 0) {
                    // Multi-page PDF: use actual page heights to find correct page
                    const yInPoints = htmlY * pixelToPoint;
                    let cumulativeHeight = 0;
                    pageIndex = 0;
                    
                    for (let i = 0; i < pdfPageHeights.length; i++) {
                        // Account for content height (page height - top margin - bottom margin)
                        const contentHeight = pdfPageHeights[i] - pdfMarginTop - (pdfMarginTop || 0); // Assume symmetric margins
                        if (yInPoints < cumulativeHeight + contentHeight) {
                            pageIndex = i;
                            break;
                        }
                        cumulativeHeight += contentHeight;
                    }
                    
                    // Ensure page index is within bounds
                    if (pageIndex >= pages.length) {
                        pageIndex = pages.length - 1;
                    }
                    
                    // Calculate Y position within the page
                    let pageStartY = 0;
                    for (let i = 0; i < pageIndex; i++) {
                        const contentHeight = pdfPageHeights[i] - pdfMarginTop - (pdfMarginTop || 0);
                        pageStartY += contentHeight;
                    }
                    
                    const yInPage = yInPoints - pageStartY;
                    // Add top margin to position
                    yPos = pdfPageHeights[pageIndex] - pdfMarginTop - yInPage;
                } else {
                    // Fallback: estimate based on standard page height
                    const yInPoints = htmlY * pixelToPoint;
                    pageIndex = Math.floor(yInPoints / pageHeight);
                    
                    // Ensure page index is within bounds
                    if (pageIndex >= pages.length) {
                        pageIndex = pages.length - 1;
                    }
                    
                    // Y position within the page (from bottom)
                    const yInPage = yInPoints - (pageIndex * pageHeight);
                    yPos = pageHeight - yInPage;
                }
                
                const pageRef = pages[pageIndex].ref;
                
                dest = context.obj([
                    pageRef,
                    'XYZ',
                    0,      // X position (left edge)
                    yPos,   // Y position (from bottom)
                    0       // zoom (0 = keep current zoom)
                ]);
            } else {
                // Fallback to top of first page
                dest = context.obj([
                    pages[0].ref,
                    'XYZ',
                    null,
                    null,
                    null
                ]);
            }
            
            // Encode title as UTF-16BE for proper Unicode support
            const titleBytes = Buffer.from('\uFEFF' + heading.text, 'utf16le').swap16();
            const titleHex = titleBytes.toString('hex').toUpperCase();
            
            const item = context.obj({
                Title: PDFHexString.of(titleHex),
                Parent: parent.ref || outlinesRef,
                Dest: dest
            });
            
            const itemRef = context.register(item);
            
            const itemData = {
                level: heading.level,
                ref: itemRef,
                obj: item,
                children: []
            };
            
            if (parent.children) {
                parent.children.push(itemData);
            }
            
            items.push(itemData);
            stack.push(itemData);
        }
        
        // Build tree structure
        function linkItems(itemList, parentRef) {
            if (itemList.length === 0) return;
            
            for (let i = 0; i < itemList.length; i++) {
                const item = itemList[i];
                
                item.obj.set(PDFName.of('Parent'), parentRef);
                
                if (i > 0) {
                    item.obj.set(PDFName.of('Prev'), itemList[i - 1].ref);
                }
                if (i < itemList.length - 1) {
                    item.obj.set(PDFName.of('Next'), itemList[i + 1].ref);
                }
                
                if (item.children.length > 0) {
                    item.obj.set(PDFName.of('First'), item.children[0].ref);
                    item.obj.set(PDFName.of('Last'), item.children[item.children.length - 1].ref);
                    item.obj.set(PDFName.of('Count'), context.obj(item.children.length));
                    linkItems(item.children, item.ref);
                }
            }
        }
        
        const rootItems = stack[0].children;
        console.log(`Root level items: ${rootItems.length}`);
        rootItems.forEach((item, i) => {
            console.log(`  Root ${i + 1}: [H${item.level}] with ${item.children.length} children`);
        });
        
        if (rootItems.length > 0) {
            outlines.set(PDFName.of('First'), rootItems[0].ref);
            outlines.set(PDFName.of('Last'), rootItems[rootItems.length - 1].ref);
            outlines.set(PDFName.of('Count'), context.obj(rootItems.length));
            linkItems(rootItems, outlinesRef);
        }
        
        pdfDoc.catalog.set(PDFName.of('Outlines'), outlinesRef);
        
        const modifiedPdfBytes = await pdfDoc.save();
        fs.writeFileSync(pdfPath, modifiedPdfBytes);
        
        console.log(`Added ${headings.length} outline entries to PDF`);
    } catch (error) {
        console.warn('Failed to add PDF outline:', error.message);
        console.error(error);
    }
}

module.exports = { extractHeadings, addPdfOutline };
