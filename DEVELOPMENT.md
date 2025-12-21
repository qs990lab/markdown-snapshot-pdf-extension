# Development Guide

This document provides information for developers who want to contribute to or modify the Markdown Mermaid to PDF extension.

## 📖 Other Languages

- [開発ガイド (Japanese)](DEVELOPMENT_JA.md)
- [开发指南 (Simplified Chinese)](DEVELOPMENT_CN.md)

## ✨ Features

This VSCode extension converts Markdown files to high-quality PDF documents with support for:
- **Mermaid diagrams** (v11.12.0) - Latest features including mindmaps, architecture diagrams, and XY charts
- **LaTeX mathematics** (KaTeX v0.16.27) - High-quality math rendering with embedded fonts
- **Complete offline operation** - All libraries and fonts are bundled

## 🏗️ Project Structure

```
├── src/extension.ts        # Main VSCode extension code
├── lib/                    # Local md-to-pdf library
│   ├── md-to-pdf.js       # Main PDF generation logic
│   ├── get-marked-with-highlighter.js  # Markdown processing
│   ├── config.js          # Default configuration
│   └── mermaid.min.js     # Bundled Mermaid library
├── test/                   # Test files
├── index.js               # Library entry point
├── cli.js                 # CLI execution
├── markdown.css           # PDF styling
├── icon.png              # Extension icon
└── package.json          # Extension manifest
```

## 🛠️ Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm
- VSCode

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Install Puppeteer (automatically handled by postinstall script):

```bash
npm run postinstall
```

### Building

Compile TypeScript to JavaScript:

```bash
npm run compile
```

For development with auto-compilation:

```bash
npm run watch
```

## 🧪 Testing

### Running Tests

#### VSCode Extension Testing
1. Press `F5` to launch Extension Development Host
2. Open test Markdown files in the new VSCode window
3. Right-click → "Convert to PDF"
4. Verify PDF output in the same directory

#### CLI Testing
```bash
# Test individual files
node cli.js your_test_file.md

# Test all markdown files
node cli.js *.md
```

### Debug Mode
```bash
# Enable detailed logging
DEBUG=* node cli.js your_test_file.md
```

## 🔧 Technical Implementation

### LaTeX Mathematics (KaTeX v0.16.27)
- **Syntax Support**: 
  - Inline: `$E = mc^2$`
  - Display: `$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$`
  - Math blocks: ````math`
- **Font Embedding**: All KaTeX fonts embedded as Base64 (~500KB)
- **Features**: Matrices, integrals, complex equations, custom macros

- **Syntax Support**:

- **Classes**: `.fas` (solid), `.far` (regular), `.fab` (brands)
- **Icons**: 6,000+ free icons available

### Mermaid Diagrams (v11.12.0)
- **Supported Types**: mindmap, architecture-beta, xychart-beta, flowcharts
- **Rendering**: Browser-based with timeout handling
- **Offline**: Local Mermaid library bundled

### Font Embedding Strategy
All fonts are embedded as Base64 data URLs for complete offline operation:
- **KaTeX fonts**: Math symbols, operators, special characters
- **Total overhead**: ~800KB for complete offline functionality

## 📦 Packaging

### Install VSCE

```bash
npm install -g @vscode/vsce
```

### Create VSIX Package

```bash
vsce package
```

This creates a `.vsix` file that can be installed in VSCode.

## 🧪 Testing

To test the extension:

1. Open the project in VSCode
2. Press `F5` to launch Extension Development Host
3. Open a test Markdown file
4. Right-click and select "Convert to PDF"

## 🔧 Configuration

### Extension Manifest

The `package.json` file contains:

- Extension metadata
- Command definitions
- Menu contributions
- Activation events

### Key Configuration Sections

```json
{
  "contributes": {
    "commands": [...],
    "menus": {
      "editor/context": [...],
      "explorer/context": [...],
      "commandPalette": [...]
    }
  }
}
```

## 📚 Dependencies

### Runtime Dependencies

- `puppeteer`: PDF generation engine (v24.29.0)
- `marked`: Markdown parser (v17.0.1)
- `highlight.js`: Syntax highlighting (v11.11.1)
- `gray-matter`: Front matter parsing

### Development Dependencies

- `typescript`: TypeScript compiler
- `@types/vscode`: VSCode API types
- `@types/node`: Node.js types

## 🌐 Internationalization

The extension supports multiple languages through:

1. **README files**: `README.md`, `README_JA.md`, `README_CN.md`
2. **Development guides**: `DEVELOPMENT.md`, `DEVELOPMENT_JA.md`, `DEVELOPMENT_CN.md`
3. **Font support**: Automatic font detection for CJK characters

## 🔍 Debugging

### VSCode Debugging

1. Set breakpoints in `src/extension.ts`
2. Press `F5` to start debugging
3. Use the Extension Development Host for testing

### Console Logging

Add logging to the extension:

```typescript
import * as vscode from 'vscode';

console.log('Debug message');
vscode.window.showInformationMessage('Info message');
```

## 🚀 Publishing

### Prepare for Publishing

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Test thoroughly
4. Build and package

### Publish to Marketplace

```bash
vsce publish
```

Or publish a specific version:

```bash
vsce publish 1.0.1
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style

- Use TypeScript for all new code
- Follow existing code formatting
- Add JSDoc comments for public functions
- Use meaningful variable and function names

## 📋 Known Issues

- Large Mermaid diagrams may take longer to render
- Some corporate firewalls may block Mermaid CDN access (handled by fallback)
- PDF generation requires sufficient memory for large documents

## 🔗 Useful Links

- [VSCode Extension API](https://code.visualstudio.com/api)
- [Mermaid Documentation](https://mermaid.js.org/)
- [Puppeteer Documentation](https://pptr.dev/)
- [Marked Documentation](https://marked.js.org/)
