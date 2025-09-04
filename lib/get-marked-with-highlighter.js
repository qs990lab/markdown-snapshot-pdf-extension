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
        let html = marked(src, opts, callback);
        
        console.log('HTML contains hljs classes:', html.includes('class="hljs'));
        console.log('HTML contains mermaid divs:', html.includes('<div class="mermaid">'));
        
        return html;
    };
};