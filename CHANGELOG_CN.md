# 更新日志

"Markdown Mermaid to PDF"扩展的所有重要更改都将记录在此文件中。

## 📖 其他语言

- [Change Log (English)](CHANGELOG.md)
- [変更履歴 (Japanese)](CHANGELOG_JA.md)

格式基于[Keep a Changelog](https://keepachangelog.com/en/1.0.0/)，
此项目遵循[语义化版本](https://semver.org/spec/v2.0.0.html)。

## [1.0.0] - 2025-08-27

### 新增
- Markdown Mermaid to PDF扩展首次发布
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
  - 慢速网络的超时处理
  - 使用本地Mermaid库的离线环境支持
- 无需外部依赖 - 所有库都已内置
- 多语言文档：
  - 英语（README.md）
  - 日语（README_JA.md）
  - 简体中文（README_CN.md）
- 三种语言的全面开发指南

### 技术规格
- Mermaid版本: v11.10.1
- PDF引擎: Puppeteer（无头Chrome）
- Markdown解析器: Marked
- 支持语言: 日文、中文（简体和繁体）、英文
- 完全支持表情符号
