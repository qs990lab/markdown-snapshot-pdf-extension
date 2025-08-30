const getMarked = require('./get-marked-with-highlighter');
const path = require('path');
const fs = require('fs');
const katex = require('katex');

/**
 * Generates a HTML document from a markdown string and returns it as a string.
 *
 * @param {string} md markdown content
 * @param {Object} config configuration object
 * @param {string[]} config.body_class list of classes to append to the body tag
 * @param {Object} config.marked_options options for Marked
 * @param {string} config.title document title for PDF metadata
 *
 * @returns string containing HTML document with transformed markdown
 */
module.exports = (md, config) => {
    // Use only minified version to reduce package size
    const localMermaidPath = path.join(__dirname, 'mermaid.min.js');
    const hasLocalMermaid = fs.existsSync(localMermaidPath);
    
    let mermaidScript;
    
    if (hasLocalMermaid) {
        // Read local mermaid.min.js file and embed it inline
        try {
            const mermaidContent = fs.readFileSync(localMermaidPath, 'utf8');
            mermaidScript = `<script>${mermaidContent}</script>`;
            console.log('Using local Mermaid library (minified)');
        } catch (error) {
            console.warn('Failed to read local Mermaid file, falling back to CDN');
            mermaidScript = `<script src="https://cdn.jsdelivr.net/npm/mermaid@11.10.1/dist/mermaid.min.js"></script>`;
        }
    } else {
        // Use CDN with fallback
        mermaidScript = `
<script src="https://cdn.jsdelivr.net/npm/mermaid@11.10.1/dist/mermaid.min.js"></script>
<script>
// Fallback if CDN fails
if (typeof mermaid === 'undefined') {
    console.warn('Mermaid CDN failed, diagrams will not be rendered');
    window.mermaid = {
        initialize: function() { console.warn('Mermaid not available'); },
        render: function() { console.warn('Mermaid not available'); }
    };
}
</script>`;
    }

    // Get KaTeX CSS and fonts
    const katexCSS = fs.readFileSync(require.resolve('katex/dist/katex.min.css'), 'utf8');
    
    // Get highlight.js theme CSS (offline)
    const getHighlightTheme = (themeName = 'github') => {
        try {
            const themes = ['github', 'default', 'vs', 'atom-one-light'];
            
            for (const theme of themes) {
                try {
                    const css = fs.readFileSync(require.resolve(`highlight.js/styles/${theme}.css`), 'utf8');
                    console.log(`Using highlight.js theme: ${theme}.css`);
                    return css;
                } catch (e) {
                    continue;
                }
            }
            
            throw new Error('No themes found');
            
        } catch (error) {
            console.warn(`Failed to load highlight.js theme, using built-in fallback`);
            return `
                /* GitHub-style syntax highlighting */
                .hljs {
                    display: block;
                    overflow-x: auto;
                    padding: 0.5em;
                    color: #333;
                }
                
                .hljs-comment, .hljs-quote {
                    color: #998;
                    font-style: italic;
                }
                
                .hljs-keyword, .hljs-selector-tag, .hljs-subst {
                    color: #333;
                    font-weight: bold;
                }
                
                .hljs-number, .hljs-literal, .hljs-variable, .hljs-template-variable, .hljs-tag .hljs-attr {
                    color: #008080;
                }
                
                .hljs-string, .hljs-doctag {
                    color: #d14;
                }
                
                .hljs-title, .hljs-section, .hljs-selector-id {
                    color: #900;
                    font-weight: bold;
                }
                
                .hljs-subst {
                    font-weight: normal;
                }
                
                .hljs-type, .hljs-class .hljs-title {
                    color: #458;
                    font-weight: bold;
                }
                
                .hljs-tag, .hljs-name, .hljs-attribute {
                    color: #000080;
                    font-weight: normal;
                }
                
                .hljs-regexp, .hljs-link {
                    color: #009926;
                }
                
                .hljs-symbol, .hljs-bullet {
                    color: #990073;
                }
                
                .hljs-built_in, .hljs-builtin-name {
                    color: #0086b3;
                }
                
                .hljs-meta {
                    color: #999;
                    font-weight: bold;
                }
                
                .hljs-deletion {
                    background: #fdd;
                }
                
                .hljs-addition {
                    background: #dfd;
                }
                
                .hljs-emphasis {
                    font-style: italic;
                }
                
                .hljs-strong {
                    font-weight: bold;
                }
            `;
        }
    };
    
    const highlightCSS = getHighlightTheme(config.highlight_style || config.highlight_theme || 'github');
    
    // Embed KaTeX fonts
    const katexFontsPath = path.dirname(require.resolve('katex/dist/katex.min.css')) + '/fonts';
    let katexFonts = '';
    try {
        const fontFiles = [
            'KaTeX_Main-Regular.woff2',
            'KaTeX_Math-Italic.woff2', 
            'KaTeX_Size1-Regular.woff2',
            'KaTeX_Size2-Regular.woff2',
            'KaTeX_AMS-Regular.woff2'
        ];
        
        fontFiles.forEach(fontFile => {
            const fontPath = path.join(katexFontsPath, fontFile);
            if (fs.existsSync(fontPath)) {
                const fontData = fs.readFileSync(fontPath);
                const base64Font = fontData.toString('base64');
                const fontName = fontFile.replace('.woff2', '').replace('KaTeX_', 'KaTeX ');
                
                katexFonts += `
@font-face {
    font-family: "${fontName}";
    src: url(data:font/woff2;base64,${base64Font}) format("woff2");
    font-weight: normal;
    font-style: normal;
    font-display: block;
}`;
            }
        });
    } catch (error) {
        console.warn('Failed to load KaTeX fonts:', error.message);
    }
    


    // Process LaTeX math expressions with high-quality settings
    let processedMd = md;
    
    // Process display math ($$...$$)
    processedMd = processedMd.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
        try {
            return katex.renderToString(math.trim(), {
                displayMode: true,
                throwOnError: false,
                errorColor: '#cc0000',
                strict: false,
                trust: true,
                fleqn: false,
                leqno: false,
                output: 'html',
                minRuleThickness: 0.04,
                maxSize: Infinity,
                maxExpand: 1000,
                macros: {
                    "\\RR": "\\mathbb{R}",
                    "\\NN": "\\mathbb{N}",
                    "\\ZZ": "\\mathbb{Z}",
                    "\\QQ": "\\mathbb{Q}",
                    "\\CC": "\\mathbb{C}",
                    "\\dd": "\\mathrm{d}",
                    "\\ee": "\\mathrm{e}",
                    "\\ii": "\\mathrm{i}",
                    "\\pmatrix": "\\begin{pmatrix}#1\\end{pmatrix}",
                    "\\bmatrix": "\\begin{bmatrix}#1\\end{bmatrix}",
                    "\\vmatrix": "\\begin{vmatrix}#1\\end{vmatrix}"
                }
            });
        } catch (error) {
            console.warn('KaTeX display math error:', error.message);
            return match;
        }
    });
    
    // Process inline math ($...$)
    processedMd = processedMd.replace(/\$([^$\n]+)\$/g, (match, math) => {
        try {
            return katex.renderToString(math.trim(), {
                displayMode: false,
                throwOnError: false,
                errorColor: '#cc0000',
                strict: false,
                trust: true,
                output: 'html',
                macros: {
                    "\\RR": "\\mathbb{R}",
                    "\\NN": "\\mathbb{N}",
                    "\\ZZ": "\\mathbb{Z}",
                    "\\QQ": "\\mathbb{Q}",
                    "\\CC": "\\mathbb{C}",
                    "\\dd": "\\mathrm{d}",
                    "\\ee": "\\mathrm{e}",
                    "\\ii": "\\mathrm{i}"
                }
            });
        } catch (error) {
            console.warn('KaTeX inline math error:', error.message);
            return match;
        }
    });


    
    
    return `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>${config.title || 'Document'}</title>
	<style>
		${katexCSS}
		${katexFonts}
		${highlightCSS}
		
		/* Enhanced code block styling */
		pre {
			margin: 1em 0;
			border-radius: 6px;
			overflow-x: auto;
		}
		
		pre code {
			display: block;
			padding: 1em;
			border-radius: 6px;
			font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
			font-size: 0.9em;
			line-height: 1.45;
			overflow-x: auto;
			white-space: pre;
			word-wrap: normal;
		}
		
		/* High-quality math rendering with Computer Modern fonts */
		.katex {
			font-size: 1.15em;
			line-height: 1.3;
			font-family: "KaTeX Main", "Latin Modern Math", "Computer Modern", "Times New Roman", serif;
			font-weight: 400;
			-webkit-font-smoothing: antialiased;
			-moz-osx-font-smoothing: grayscale;
			text-rendering: optimizeLegibility;
		}
		
		.katex-display {
			margin: 1.8em 0;
			text-align: center;
			overflow-x: auto;
			overflow-y: hidden;
		}
		
		/* Enhanced font rendering for math symbols */
		.katex .mord {
			font-family: "KaTeX Main", "Latin Modern Math", "Computer Modern", serif;
		}
		
		.katex .mop {
			font-family: "KaTeX Main", "Latin Modern Math", "Computer Modern", serif;
			font-weight: 400;
		}
		
		.katex .mrel, .katex .mbin {
			font-family: "KaTeX Main", "Latin Modern Math", "Computer Modern", serif;
		}
		
		/* Improved matrix and array styling */
		.katex .arraycolsep {
			width: 0.6em;
		}
		
		.katex .pmatrix, .katex .bmatrix, .katex .vmatrix {
			display: inline-block;
			font-weight: 400;
		}
		
		/* Enhanced delimiters */
		.katex .mopen, .katex .mclose {
			font-size: 1.1em;
			font-weight: 400;
		}
		
		/* Better fraction rendering */
		.katex .frac-line {
			border-bottom-width: 0.06em;
		}
		
		.katex .frac .frac-line {
			border-bottom-width: 0.04em;
		}
		
		/* Improved subscript and superscript */
		.katex .msupsub {
			font-size: 0.75em;
		}
		
		/* High-DPI support */
		@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
			.katex {
				font-size: 1.2em;
				line-height: 1.35;
			}
			
			.katex .frac-line {
				border-bottom-width: 0.05em;
			}
		}
		
		/* Print optimization */
		@media print {
			.katex {
				font-size: 11pt;
				line-height: 1.25;
			}
			
			.katex-display {
				margin: 12pt 0;
			}
		}
		
		/* Better spacing for equations */
		.katex-display > .katex {
			white-space: nowrap;
		}
		
		/* Improve color and contrast */
		.katex .mord, .katex .mop, .katex .mrel, .katex .mbin {
			color: #000000;
		}
		
		/* Enhanced root symbols */
		.katex .sqrt > .root {
			font-size: 0.8em;
		}
		

	</style>
</head>
<body class="${config.body_class.join(' ')}">
${mermaidScript}
<script>
// Mermaid configuration with error handling
try {
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'Arial, sans-serif',
            fontSize: 16,
            // Enable new diagram types
            mindmap: {
                useMaxWidth: true
            },
            architecture: {
                useMaxWidth: true
            },
            xyChart: {
                useMaxWidth: true
            }
        });
        console.log('Mermaid initialized successfully');
    } else {
        console.error('Mermaid library not loaded');
    }
} catch (error) {
    console.warn('Mermaid initialization failed:', error);
    // Fallback: try basic initialization
    try {
        if (typeof mermaid !== 'undefined') {
            mermaid.initialize({
                startOnLoad: true,
                theme: 'default'
            });
            console.log('Mermaid fallback initialization successful');
        }
    } catch (fallbackError) {
        console.error('Mermaid fallback initialization also failed:', fallbackError);
    }
}

// Wait for page load and mermaid rendering
window.addEventListener('load', function() {
    console.log('Page loaded, waiting for mermaid...');
    
    if (typeof mermaid === 'undefined') {
        console.error('Mermaid not available, skipping diagram rendering');
        window.mermaidReady = true;
        return;
    }
    
    // Check if mermaid diagrams exist
    const mermaidElements = document.querySelectorAll('.mermaid, pre code.language-mermaid');
    console.log('Found mermaid elements:', mermaidElements.length);
    
    if (mermaidElements.length === 0) {
        // No mermaid diagrams, ready immediately
        window.mermaidReady = true;
        console.log('No mermaid diagrams found, ready immediately');
        return;
    }
    
    // Give time for mermaid to render
    let checkCount = 0;
    const maxChecks = 50; // 10 seconds max (50 * 200ms)
    
    const checkMermaidRendering = () => {
        checkCount++;
        
        // Check if all mermaid elements have been processed
        const unprocessedElements = document.querySelectorAll('pre code.language-mermaid');
        const processedElements = document.querySelectorAll('.mermaid svg');
        
        console.log('Check', checkCount, '- Unprocessed:', unprocessedElements.length, 'Processed:', processedElements.length);
        
        if (unprocessedElements.length === 0 && processedElements.length > 0) {
            window.mermaidReady = true;
            console.log('Mermaid rendering completed successfully');
        } else if (checkCount >= maxChecks) {
            window.mermaidReady = true;
            console.warn('Mermaid rendering timeout after', checkCount * 200, 'ms');
        } else {
            setTimeout(checkMermaidRendering, 200);
        }
    };
    
    // Start checking after a short delay
    setTimeout(checkMermaidRendering, 500);
});

// Absolute fallback timeout
setTimeout(function() {
    if (!window.mermaidReady) {
        window.mermaidReady = true;
        console.warn('Absolute timeout reached, proceeding anyway');
    }
}, 15000); // 15 second absolute timeout
</script>
${getMarked(config.marked_options)(processedMd)}

</body></html>
`;
};