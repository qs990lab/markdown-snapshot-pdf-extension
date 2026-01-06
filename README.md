# Markdown Snapshot PDF

A VSCode extension that converts Markdown files (including Mermaid diagrams) to high-quality PDF documents with **single-page output capability**.

## 📖 Other Languages

- [日本語 (Japanese)](README_JA.md)
- [简体中文 (Simplified Chinese)](README_CN.md)

## ✨ Key Features

- **Single-page PDF output** - Perfect for reports, presentations, and documentation
- **Multi-page PDF output** - Traditional document conversion
- Convert Markdown files to high-quality PDF documents
- **Latest Mermaid diagram support** (v11.12.2)
  - mindmap (Mind Maps)
  - architecture-beta (Architecture Diagrams)
  - xychart-beta (XY Charts)
  - Flowcharts with images
- **High-quality LaTeX math rendering** (KaTeX v0.16.22)
  - Inline math: `$E = mc^2$`
  - Display math: `$$...$$`
  - Math blocks: ````math`
  - Complex equations, matrices, integrals
- **Extended Markdown syntax support**
  - Footnotes: `[^1]` with proper linking and back-references
  - Highlight text: `==highlighted text==`
  - Subscript: `H~2~O` → H₂O
  - Superscript: `E = mc^2^` → E = mc²
- Full support for Japanese, Chinese, and emoji characters
- **Complete offline operation** - all libraries and fonts are bundled

## 📋 Prerequisites

### WSL (Windows Subsystem for Linux)

If you're using WSL, install the required system libraries:

```bash
sudo apt update
sudo apt install -y libnss3-dev libxss1 libxtst6 libxrandr2 libasound2-dev libpangocairo-1.0-0 libatk1.0-0 libcairo-gobject2 libgtk-3-0 libgdk-pixbuf2.0-0
```

### Ubuntu 24.04

For Ubuntu 24.04, additional libraries and npm are required:

```bash
# Install npm first (required for Puppeteer)
sudo apt update
sudo apt install -y npm

# Required libraries
sudo apt install -y libatk-bridge2.0-0 libdrm2 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libasound2t64 libcups2t64 libxfixes3 libcairo2 libpango-1.0-0 libpangocairo-1.0-0
```

After installation, reload the VSCode window (`Ctrl+Shift+P` → "Developer: Reload Window").

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

- **Mermaid Version**: v11.12.2 (Latest)
- **KaTeX Version**: v0.16.22 (Latest)

- **PDF Engine**: Puppeteer (Headless Chrome) v24.34.0
- **Markdown Parser**: Marked v17.0.1

## 📄 License

This extension is released under [The Unlicense](https://unlicense.org/) - public domain.

Copyright 2025 Shima

### Third-Party Libraries

This extension bundles the following third-party libraries:

- **KaTeX v0.16.22** - MIT License
  - Copyright (c) 2013-2020 Khan Academy and other contributors
  - [License](https://github.com/KaTeX/KaTeX/blob/main/LICENSE)

- **Mermaid v11.12.2** - MIT License  
  - Copyright (c) 2014-2022 Knut Sveidqvist
  - [License](https://github.com/mermaid-js/mermaid/blob/develop/LICENSE)

- **Marked v17.0.1** - MIT License
  - Copyright (c) 2011-2022, Christopher Jeffrey
  - [License](https://github.com/markedjs/marked/blob/master/LICENSE.md)

- **md-to-pdf** - MIT License
  - Copyright (c) Simon Hänisch
  - [License](https://github.com/simonhaenisch/md-to-pdf)

- **highlight.js v11.11.1** - BSD 3-Clause License
  - Copyright (c) 2006, Ivan Sagalaev
  - [License](https://github.com/highlightjs/highlight.js/blob/main/LICENSE)

## 🛠️ Development

For development information, please see:
- [Development Guide (English)](DEVELOPMENT.md)
- [開発ガイド (Japanese)](DEVELOPMENT_JA.md)
- [开发指南 (Simplified Chinese)](DEVELOPMENT_CN.md)
