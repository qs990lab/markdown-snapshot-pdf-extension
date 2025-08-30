# Markdown Snapshot PDF

一个VSCode扩展，可将Markdown文件（包括Mermaid图表）转换为高质量的PDF文档，具有**单页输出功能**。

## 📖 其他语言

- [English](README.md)
- [日本語 (Japanese)](README_JA.md)

## ✨ 主要功能

- **单页PDF输出** - 非常适合报告、演示和文档
- **多页PDF输出** - 传统文档转换
- 将Markdown文件转换为高质量PDF文档
- **支持最新的Mermaid图表**（v11.10.1）
  - mindmap（思维导图）
  - architecture-beta（架构图）
  - xychart-beta（XY图表）
  - 带图片的流程图
- **高质量LaTeX数学公式渲染**（KaTeX v0.16.11）
  - 行内公式：`$E = mc^2$`
  - 显示公式：`$$...$$`
  - 数学代码块：````math`
  - 复杂方程、矩阵、积分



- 完全支持日文、中文和表情符号
- **完全离线运行** - 所有库和字体都已内置

## 🚀 使用方法

1. 在VSCode中打开Markdown文件
2. 在编辑器或文件资源管理器中右键单击，选择**"Convert to PDF"**
3. 或使用命令面板（`Ctrl+Shift+P` / `Cmd+Shift+P`）运行**"Markdown Snapshot PDF: Convert to PDF"**

### 可用命令

- **Convert to PDF (1 page)**: 单页PDF转换
- **Convert to PDF**: 标准多页PDF转换

### 单页PDF的优势

**单页PDF输出**非常适合：
- 📊 **报告和仪表板** - 一次显示所有内容
- 📋 **演示文稿** - 没有分页中断流程
- 📄 **文档** - 在一个视图中完整概览
- 🖼️ **信息图表** - 无缝视觉内容
- 📈 **图表和图形** - 不间断的数据可视化

内容会自动缩放以适应单页，同时保持可读性。

## 🏢 企业环境

对于有代理或防火墙的企业环境，您可能需要配置以下设置：

### 代理配置

设置代理的环境变量：

```bash
# Windows (命令提示符)
set HTTP_PROXY=http://proxy.company.com:8080
set HTTPS_PROXY=http://proxy.company.com:8080

# Windows (PowerShell)
$env:HTTP_PROXY="http://proxy.company.com:8080"
$env:HTTPS_PROXY="http://proxy.company.com:8080"

# macOS/Linux
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
```

### 超时处理

对于网络较慢的环境，会自动应用以下措施：

- 导航超时：60秒
- Mermaid渲染超时：30秒
- CDN连接失败时使用本地Mermaid文件

### 离线环境

在完全离线的环境中，会自动使用本地Mermaid库。

## 🔧 技术规格

- **Mermaid版本**: v11.10.1（最新）
- **LaTeX数学**: KaTeX v0.16.11（内置字体）
- **PDF引擎**: Puppeteer（无头Chrome）
- **Markdown解析器**: Marked v16.2.1

## 📄 许可证

[The Unlicense](https://github.com/lezkizofrenik/md-to-pdf-ng/blob/00510206b75f915007e8e2860e8ef4593cc99182/license)

## 🛠️ 开发

有关开发信息，请参阅：
- [Development Guide (English)](DEVELOPMENT.md)
- [開発ガイド (Japanese)](DEVELOPMENT_JA.md)
- [开发指南 (Simplified Chinese)](DEVELOPMENT_CN.md)
