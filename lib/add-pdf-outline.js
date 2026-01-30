const { PDFDocument, PDFName, PDFArray, PDFDict, PDFString } = require('pdf-lib');
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
    
    for (const line of lines) {
        const match = line.match(/^(#{1,3})\s+(.+)$/);
        if (match) {
            const level = match[1].length;
            const text = match[2].trim();
            
            // Generate ID (same as marked.js)
            let id = text
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');
            
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
 * @param {number} actualPageHeight - Actual PDF page height in points
 */
async function addPdfOutline(pdfPath, headings, positions = {}, actualPageHeight = null) {
    if (!headings || headings.length === 0) {
        console.log('No headings found, skipping outline generation');
        return;
    }
    
    try {
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const context = pdfDoc.context;
        const pages = pdfDoc.getPages();
        
        if (pages.length === 0) return;
        
        const firstPage = pages[0];
        const firstPageRef = firstPage.ref;
        const pageHeight = actualPageHeight || firstPage.getHeight();
        
        // Create outline dictionary
        const outlines = context.obj({
            Type: 'Outlines'
        });
        const outlinesRef = context.register(outlines);
        
        // Create outline items
        const items = [];
        const stack = [{ level: 0, children: [] }];
        
        for (const heading of headings) {
            while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
                stack.pop();
            }
            
            const parent = stack[stack.length - 1];
            
            // Calculate Y position (PDF coordinates are from bottom)
            let dest;
            if (positions[heading.id]) {
                const htmlY = positions[heading.id].y;
                const pixelToPoint = 0.75; // 1px = 0.75pt
                
                // For one-page PDFs, convert HTML pixel position to PDF points
                // PDF Y coordinate is from bottom, so: PDF Y = page height - HTML Y
                const yPos = pageHeight - (htmlY * pixelToPoint);
                
                // Use /XYZ with explicit coordinates
                dest = context.obj([
                    firstPageRef,
                    'XYZ',
                    0,      // X position (left edge)
                    yPos,   // Y position (from bottom)
                    0       // zoom (0 = keep current zoom)
                ]);
            } else {
                // Fallback to top of page
                dest = context.obj([
                    firstPageRef,
                    'XYZ',
                    null,
                    null,
                    null
                ]);
            }
            
            const item = context.obj({
                Title: PDFString.of(heading.text),
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
