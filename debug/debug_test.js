const fs = require('fs');
const getMarked = require('../lib/get-marked-with-highlighter');

const md = fs.readFileSync('../test/test_mermaid.md', 'utf8');
const marked = getMarked({});
const html = marked(md);

console.log('Generated HTML:');
console.log(html);
