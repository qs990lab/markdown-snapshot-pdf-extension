# 更新日志

"Markdown Mermaid to PDF" 扩展的所有重要更改都将记录在此文件中。

## 📖 其他语言

- [Change Log (English)](CHANGELOG.md)
- [変更履歴 (Japanese)](CHANGELOG_JA.md)

格式基于 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)，
此项目遵循 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)。

## [1.0.7] - 2026-01-06

### 修复
- 多文件选择转换支持 ([#14](https://github.com/qs990lab/markdown-snapshot-pdf-extension/issues/14))
  - 注意：不支持MD文件合并转换
- 使用Noto Sans字体改善字体渲染 ([#15](https://github.com/qs990lab/markdown-snapshot-pdf-extension/issues/15))

### 更新
- Mermaid库更新至v11.12.2（从v11.10.1）
- Puppeteer库更新至v24.34.0（从v24.29.0）

## [1.0.6] - 2025-12-21

### 修复
- 修复文件资源管理器中右键上下文菜单不转换选定文件的问题 ([#12](https://github.com/qs990lab/markdown-snapshot-pdf-extension/issues/12))
- 修复MD文件中包含$的代码破坏输出的问题 ([#13](https://github.com/qs990lab/markdown-snapshot-pdf-extension/issues/13))

### 更新
- ~~KaTeX库更新至v0.16.27（从v0.16.22）~~ （KaTeX保持在v0.16.22）
- Marked库更新至v17.0.1（从v16.2.1）
- Puppeteer库更新至v24.29.0（从v24.17.0）

### 技术改进
- 改进代码块保护机制以防止数学处理干扰
- 优化占位符替换以避免递归内容重复
- 增强KaTeX处理的错误处理

## [1.0.5] - 2025-10-17

### 更新
- Mermaid库更新至v11.12.0（从v11.10.1）
- KaTeX库更新至v0.16.22（从v0.16.11）

### 修复
- 修复代码块中长行在PDF输出中的正确换行显示 ([#11](https://github.com/qs990lab/markdown-snapshot-pdf-extension/issues/11))

## [1.0.4] - 2025-09-04

### 新增
- 支持GitHub Flavored Markdown语法的脚注 ([#4](https://github.com/qs990lab/markdown-snapshot-pdf-extension/issues/4))
- 支持==文本==语法的高亮文本 ([#3](https://github.com/qs990lab/markdown-snapshot-pdf-extension/issues/3))
- 支持~文本~和^文本^语法的下标和上标文本 ([#5](https://github.com/qs990lab/markdown-snapshot-pdf-extension/issues/5))

### 修复
- 由于缺少系统库导致的WSL转换错误 ([#2](https://github.com/qs990lab/markdown-snapshot-pdf-extension/issues/2))

## [1.0.0] - 2025-08-27

### 新增
- Markdown Mermaid to PDF扩展的初始版本
- 将Markdown文件转换为高质量PDF文档
- 支持最新的Mermaid图表（v11.10.1）
  - mindmap（思维导图）
  - architecture-beta（架构图）
  - xychart-beta（XY图表）
  - 带图片的流程图
- 完全支持日文、中文和表情符号
- 两种转换模式：
  - 标准多页PDF转换
  - 单页PDF转换
- 右键上下文菜单集成：
  - 编辑器上下文菜单
  - 文件资源管理器上下文菜单
- 命令面板集成
- 企业环境支持：
  - 代理配置支持
  - 慢速网络超时处理
  - 使用本地Mermaid库的离线环境支持
- 无需外部依赖 - 所有库都已内置
- 多语言文档：
  - 英语（README.md）
  - 日语（README_JA.md）
  - 简体中文（README_CN.md）
- 三种语言的综合开发指南

### 技术规格
- Mermaid版本：v11.10.1
- PDF引擎：Puppeteer（无头Chrome）
- Markdown解析器：Marked
- 支持语言：日语、中文（简体和繁体）、英语
- 完整的表情符号支持
