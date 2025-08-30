# 开发指南

本文档为希望为Markdown Mermaid to PDF扩展做出贡献或进行修改的开发者提供信息。

## 📖 其他语言

- [Development Guide (English)](DEVELOPMENT.md)
- [開発ガイド (Japanese)](DEVELOPMENT_JA.md)

## ✨ 功能特性

此VSCode扩展将Markdown文件转换为高质量PDF文档，支持：
- **Mermaid图表**（v11.10.1） - 包括思维导图、架构图和XY图表的最新功能
- **LaTeX数学公式**（KaTeX v0.16.11） - 带内置字体的高质量数学渲染
- **完全离线运行** - 所有库和字体都已内置

## 🏗️ 项目结构

```
├── src/extension.ts        # VSCode扩展主代码
├── lib/                    # 本地md-to-pdf库
│   ├── md-to-pdf.js       # 主要PDF生成逻辑
│   ├── get-marked-with-highlighter.js  # Markdown处理
│   ├── config.js          # 默认配置
│   └── mermaid.min.js     # 捆绑的Mermaid库
├── test/                   # 测试文件
│   ├── latex_test.md      # LaTeX数学测试文件
│   ├── latex_advanced_test.md  # 高级LaTeX测试文件
│   └── test_mermaid.md    # Mermaid图表测试文件
├── index.js               # 库入口点
├── cli.js                 # CLI执行
├── markdown.css           # PDF样式
├── icon.png              # 扩展图标
└── package.json          # 扩展清单
```

## 🛠️ 开发环境设置

### 前提条件

- Node.js（v16或更高版本）
- npm
- VSCode

### 安装

1. 克隆仓库
2. 安装依赖：

```bash
npm install
```

3. 安装Puppeteer（由postinstall脚本自动处理）：

```bash
npm run postinstall
```

### 构建

将TypeScript编译为JavaScript：

```bash
npm run compile
```

用于开发的自动编译：

```bash
npm run watch
```

## 📦 打包

### 安装VSCE

```bash
npm install -g @vscode/vsce
```

### 创建VSIX包

```bash
vsce package
```

这将创建一个可以在VSCode中安装的`.vsix`文件。

## 🧪 测试

测试文件位于`test/`目录中：

- `test_mermaid.md`: 测试最新的Mermaid功能
- `test_chinese_emoji.md`: 测试中文和表情符号支持
- `test_onepage.md`: 测试单页转换

测试扩展：

1. 在VSCode中打开项目
2. 按`F5`启动扩展开发主机
3. 打开测试Markdown文件
4. 右键单击并选择"Convert to PDF"

## 🔧 配置

### 扩展清单

`package.json`文件包含：

- 扩展元数据
- 命令定义
- 菜单贡献
- 激活事件

### 关键配置部分

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

## 📚 依赖项

### 运行时依赖

- `puppeteer`: PDF生成引擎
- `marked`: Markdown解析器
- `highlight.js`: 语法高亮
- `gray-matter`: 前置内容解析

### 开发依赖

- `typescript`: TypeScript编译器
- `@types/vscode`: VSCode API类型
- `@types/node`: Node.js类型

## 🌐 国际化

扩展通过以下方式支持多种语言：

1. **README文件**: `README.md`、`README_JA.md`、`README_CN.md`
2. **开发指南**: `DEVELOPMENT.md`、`DEVELOPMENT_JA.md`、`DEVELOPMENT_CN.md`
3. **字体支持**: CJK字符的自动字体检测

## 🔍 调试

### VSCode调试

1. 在`src/extension.ts`中设置断点
2. 按`F5`开始调试
3. 使用扩展开发主机进行测试

### 控制台日志

向扩展添加日志：

```typescript
import * as vscode from 'vscode';

console.log('调试消息');
vscode.window.showInformationMessage('信息消息');
```

## 🚀 发布

### 准备发布

1. 更新`package.json`中的版本
2. 更新CHANGELOG.md
3. 彻底测试
4. 构建和打包

### 发布到市场

```bash
vsce publish
```

或发布特定版本：

```bash
vsce publish 1.0.1
```

## 🤝 贡献

1. Fork仓库
2. 创建功能分支
3. 进行更改
4. 如适用，添加测试
5. 提交拉取请求

### 代码风格

- 对所有新代码使用TypeScript
- 遵循现有代码格式
- 为公共函数添加JSDoc注释
- 使用有意义的变量和函数名

## 📋 已知问题

- 大型Mermaid图表可能需要更长时间渲染
- 某些企业防火墙可能阻止Mermaid CDN访问（通过回退处理）
- PDF生成需要足够的内存来处理大型文档

## 🔗 有用链接

- [VSCode Extension API](https://code.visualstudio.com/api)
- [Mermaid文档](https://mermaid.js.org/)
- [Puppeteer文档](https://pptr.dev/)
- [Marked文档](https://marked.js.org/)
