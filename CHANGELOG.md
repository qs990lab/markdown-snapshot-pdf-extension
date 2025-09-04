# Change Log

All notable changes to the "Markdown Mermaid to PDF" extension will be documented in this file.

## 📖 Other Languages

- [変更履歴 (Japanese)](CHANGELOG_JA.md)
- [更新日志 (Simplified Chinese)](CHANGELOG_CN.md)

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2025-09-04

### Added
- Footnote support with GitHub Flavored Markdown syntax ([#4](https://github.com/qs990lab/markdown-snapshot-pdf-extension/issues/4))
- Highlight text support with ==text== syntax ([#3](https://github.com/qs990lab/markdown-snapshot-pdf-extension/issues/3))
- Subscript and superscript text support with ~text~ and ^text^ syntax ([#5](https://github.com/qs990lab/markdown-snapshot-pdf-extension/issues/5))

### Fixed
- WSL conversion errors due to missing system libraries ([#2](https://github.com/qs990lab/markdown-snapshot-pdf-extension/issues/2))

## [1.0.0] - 2025-08-27

### Added
- Initial release of Markdown Mermaid to PDF extension
- Convert Markdown files to high-quality PDF documents
- Support for latest Mermaid diagrams (v11.10.1)
  - mindmap (Mind Maps)
  - architecture-beta (Architecture Diagrams)
  - xychart-beta (XY Charts)
  - Flowcharts with images
- Full support for Japanese, Chinese, and emoji characters
- Two conversion modes:
  - Standard multi-page PDF conversion
  - Single-page PDF conversion
- Right-click context menu integration:
  - Editor context menu
  - File explorer context menu
- Command palette integration
- Enterprise environment support:
  - Proxy configuration support
  - Timeout handling for slow networks
  - Offline environment support with local Mermaid libraries
- No external dependencies required - all libraries bundled
- Multi-language documentation:
  - English (README.md)
  - Japanese (README_JA.md)
  - Simplified Chinese (README_CN.md)
- Comprehensive development guides in three languages

### Technical Specifications
- Mermaid Version: v11.10.1
- PDF Engine: Puppeteer (Headless Chrome)
- Markdown Parser: Marked
- Supported Languages: Japanese, Chinese (Simplified & Traditional), English
- Full emoji support
