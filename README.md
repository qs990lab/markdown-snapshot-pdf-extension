# Markdown Snapshot PDF

A VSCode extension that converts Markdown files (including Mermaid diagrams) to high-quality PDF documents with **single-page output capability**.

## 📖 Other Languages

- [日本語 (Japanese)](README_JA.md)
- [简体中文 (Simplified Chinese)](README_CN.md)

## ✨ Key Features

- **Single-page PDF output** - Perfect for reports, presentations, and documentation
- **Multi-page PDF output** - Traditional document conversion
- Convert Markdown files to high-quality PDF documents
- **Latest Mermaid diagram support** (v11.10.1)
  - mindmap (Mind Maps)
  - architecture-beta (Architecture Diagrams)
  - xychart-beta (XY Charts)
  - Flowcharts with images
- **High-quality LaTeX math rendering** (KaTeX v0.16.11)
  - Inline math: `$E = mc^2$`
  - Display math: `$$...$$`
  - Math blocks: ````math`
  - Complex equations, matrices, integrals

- Full support for Japanese, Chinese, and emoji characters
- **Complete offline operation** - all libraries and fonts are bundled

## 🚀 Usage

1. Open a Markdown file in VSCode
2. Right-click in the editor or file explorer and select **"Convert to PDF"**
3. Or use Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run **"Markdown Snapshot PDF: Convert to PDF"**

### Available Commands

- **Convert to PDF (1 page)**: Single-page PDF conversion
- **Convert to PDF**: Standard multi-page PDF conversion

### Single-Page PDF Benefits

The **single-page PDF output** is perfect for:
- 📊 **Reports and dashboards** - All content visible at once
- 📋 **Presentations** - No page breaks interrupting flow
- 📄 **Documentation** - Complete overview in one view
- 🖼️ **Infographics** - Seamless visual content
- 📈 **Charts and diagrams** - Uninterrupted data visualization

Content automatically scales to fit on a single page while maintaining readability.

## 🏢 Enterprise Environment

For corporate environments with proxies or firewalls, you may need to configure the following:

### Proxy Configuration

Set environment variables for proxy settings:

```bash
# Windows (Command Prompt)
set HTTP_PROXY=http://proxy.company.com:8080
set HTTPS_PROXY=http://proxy.company.com:8080

# Windows (PowerShell)
$env:HTTP_PROXY="http://proxy.company.com:8080"
$env:HTTPS_PROXY="http://proxy.company.com:8080"

# macOS/Linux
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
```

### Timeout Handling

For slow network environments, the following measures are automatically applied:

- Navigation timeout: 60 seconds
- Mermaid rendering timeout: 30 seconds
- Local Mermaid files used when CDN connection fails

### Offline Environment

In completely offline environments, local Mermaid libraries are automatically used.

## 🔧 Technical Specifications

- **Mermaid Version**: v11.10.1 (Latest)
- **LaTeX Math**: KaTeX v0.16.11 with embedded fonts

- **PDF Engine**: Puppeteer (Headless Chrome)
- **Markdown Parser**: Marked v16.2.1

## 📄 License

[The Unlicense](https://github.com/lezkizofrenik/md-to-pdf-ng/blob/00510206b75f915007e8e2860e8ef4593cc99182/license)

## 🛠️ Development

For development information, please see:
- [Development Guide (English)](DEVELOPMENT.md)
- [開発ガイド (Japanese)](DEVELOPMENT_JA.md)
- [开发指南 (Simplified Chinese)](DEVELOPMENT_CN.md)
