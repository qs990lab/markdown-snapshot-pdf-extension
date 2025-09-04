const hljs = require('highlight.js');
const katex = require('katex');

/**
 * Get a marked renderer with an attached highlighter.
 *
 * @param {Object} options Marked configuration object
 *
 * @returns a marked renderer with highlight.js parser attached
 */
module.exports = async options => {
    console.log('Setting up marked with highlight.js');
    
    // Dynamic import for ES Module
    const { marked } = await import('marked');
    
    // Create a custom extension for highlight text (==text==)
    const highlightTextExtension = {
        name: 'highlightText',
        level: 'inline',
        start(src) {
            return src.match(/==/)?.index;
        },
        tokenizer(src, tokens) {
            const rule = /^==((?:[^=]|=[^=])+)==/;
            const match = rule.exec(src);
            if (match) {
                return {
                    type: 'highlightText',
                    raw: match[0],
                    text: match[1]
                };
            }
        },
        renderer(token) {
            return `<mark>${token.text}</mark>`;
        }
    };

    // Create a custom extension for subscript (~text~)
    const subscriptExtension = {
        name: 'subscript',
        level: 'inline',
        start(src) {
            return src.match(/~/)?.index;
        },
        tokenizer(src, tokens) {
            const rule = /^~((?:[^~]|~~)+)~/;
            const match = rule.exec(src);
            if (match) {
                return {
                    type: 'subscript',
                    raw: match[0],
                    text: match[1]
                };
            }
        },
        renderer(token) {
            return `<sub>${token.text}</sub>`;
        }
    };

    // Create a custom extension for superscript (^text^)
    const superscriptExtension = {
        name: 'superscript',
        level: 'inline',
        start(src) {
            return src.match(/\^/)?.index;
        },
        tokenizer(src, tokens) {
            const rule = /^\^((?:[^\^]|\^\^)+)\^/;
            const match = rule.exec(src);
            if (match) {
                return {
                    type: 'superscript',
                    raw: match[0],
                    text: match[1]
                };
            }
        },
        renderer(token) {
            return `<sup>${token.text}</sup>`;
        }
    };

    // Footnote processing - simpler approach using preprocessing
    function preprocessFootnotes(src) {
        const footnotes = new Map();
        const footnoteRefs = new Map(); // Track multiple references
        let footnoteCounter = 0;
        
        // First pass: collect footnote definitions
        const footnoteDefRegex = /^\[\^([^\]]+)\]:\s*(.+)$/gm;
        let match;
        while ((match = footnoteDefRegex.exec(src)) !== null) {
            const id = match[1];
            const content = match[2].trim();
            if (!footnotes.has(id)) {
                footnotes.set(id, { counter: ++footnoteCounter, content: content });
            }
        }
        
        // Remove footnote definitions from source
        src = src.replace(footnoteDefRegex, '');
        
        // Second pass: collect all footnote references and assign numbers
        const refRegex = /\[\^([^\]]+)\]/g;
        let refMatch;
        while ((refMatch = refRegex.exec(src)) !== null) {
            const id = refMatch[1];
            if (footnotes.has(id)) {
                if (!footnoteRefs.has(id)) {
                    footnoteRefs.set(id, []);
                }
                footnoteRefs.get(id).push(footnoteRefs.get(id).length);
            }
        }
        
        // Third pass: replace footnote references with proper numbering
        const refCounts = new Map();
        src = src.replace(/\[\^([^\]]+)\]/g, (match, id) => {
            if (footnotes.has(id)) {
                const footnote = footnotes.get(id);
                const currentCount = refCounts.get(id) || 0;
                refCounts.set(id, currentCount + 1);
                
                const refId = currentCount > 0 ? `${id}-${currentCount}` : id;
                return `<sup><a href="#fn-${id}" id="fnref-${refId}" class="footnote-ref">${footnote.counter}</a></sup>`;
            }
            return match;
        });
        
        // Add footnotes section at the end
        if (footnotes.size > 0) {
            src += '\n\n<div class="footnotes">\n<ol>\n';
            const sortedFootnotes = Array.from(footnotes.entries()).sort((a, b) => a[1].counter - b[1].counter);
            
            for (const [id, footnote] of sortedFootnotes) {
                src += `<li id="fn-${id}">${footnote.content}`;
                
                // Add back references
                const refCount = refCounts.get(id) || 0;
                if (refCount === 1) {
                    src += ` <a href="#fnref-${id}" class="footnote-backref">↩︎</a>`;
                } else if (refCount > 1) {
                    for (let i = 0; i < refCount; i++) {
                        const refId = i > 0 ? `${id}-${i}` : id;
                        src += ` <a href="#fnref-${refId}" class="footnote-backref">↩︎<sup>${i + 1}</sup></a>`;
                    }
                }
                
                src += '</li>\n';
            }
            
            src += '</ol>\n</div>';
        }
        
        return src;
    }

    // Create a custom extension for code highlighting
    const highlightExtension = {
        name: 'highlight',
        level: 'block',
        start(src) {
            return src.match(/^```/)?.index;
        },
        tokenizer(src, tokens) {
            const rule = /^```([^\n]*)\n([\s\S]*?)\n```/;
            const match = rule.exec(src);
            if (match) {
                const lang = match[1].trim();
                const code = match[2];
                
                return {
                    type: 'highlight',
                    raw: match[0],
                    lang: lang,
                    code: code
                };
            }
        },
        renderer(token) {
            console.log(`Rendering code block with language: "${token.lang}", code length: ${token.code ? token.code.length : 'undefined'}`);
            
            if (!token.code) {
                return '<pre><code></code></pre>';
            }
            
            // Handle mermaid diagrams
            if (token.lang === 'mermaid') {
                return `<div class="mermaid">${token.code}</div>`;
            }
            
            // Handle math blocks
            if (token.lang === 'math') {
                try {
                    return `<div class="katex-display">${katex.renderToString(token.code.trim(), {
                        displayMode: true,
                        throwOnError: false,
                        strict: false,
                        trust: true,
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
                    })}</div>`;
                } catch (error) {
                    console.warn('KaTeX math block error:', error.message);
                    return `<pre><code class="language-${token.lang}">${token.code}</code></pre>`;
                }
            }
            
            // Handle syntax highlighting
            let highlightedCode = token.code;
            let languageClass = '';
            
            if (token.lang) {
                try {
                    if (hljs.getLanguage(token.lang)) {
                        const result = hljs.highlight(token.code, { language: token.lang });
                        highlightedCode = result.value;
                        languageClass = ` class="hljs language-${token.lang}"`;
                        console.log(`Successfully highlighted ${token.lang} code`);
                    } else {
                        console.warn(`Language '${token.lang}' not supported, trying auto-detection`);
                        const result = hljs.highlightAuto(token.code);
                        highlightedCode = result.value;
                        languageClass = ` class="hljs"`;
                    }
                } catch (err) {
                    console.warn(`Highlighting failed for language '${token.lang}':`, err.message);
                    languageClass = ` class="language-${token.lang}"`;
                }
            } else {
                // Try auto-detection for code without language
                try {
                    const result = hljs.highlightAuto(token.code);
                    if (result.relevance > 5) {
                        highlightedCode = result.value;
                        languageClass = ` class="hljs"`;
                        console.log(`Auto-detected language for code block`);
                    }
                } catch (err) {
                    console.warn('Auto-highlighting failed:', err.message);
                }
            }
            
            return `<pre><code${languageClass}>${highlightedCode}</code></pre>`;
        }
    };
    
    // Configure marked with the extensions
    marked.use({ extensions: [highlightTextExtension, subscriptExtension, superscriptExtension, highlightExtension] });
    
    // Configure marked options
    marked.setOptions({
        gfm: true,
        breaks: false,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        ...options
    });

    // Return a wrapper function that post-processes the HTML
    return function(src, opts, callback) {
        console.log('Processing markdown with marked');
        
        // Preprocess footnotes
        src = preprocessFootnotes(src);
        
        let html = marked(src, opts, callback);
        
        console.log('HTML contains hljs classes:', html.includes('class="hljs'));
        console.log('HTML contains mermaid divs:', html.includes('<div class="mermaid">'));
        console.log('HTML contains footnotes:', html.includes('class="footnotes"'));
        
        return html;
    };
};