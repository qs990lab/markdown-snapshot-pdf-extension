# Markdown Snapshot PDF

VSCodeでMarkdownファイル（Mermaid図を含む）を高品質なPDFドキュメントに変換する拡張機能です。**1ページPDF出力機能**を搭載。

## 📖 他の言語

- [English](README.md)
- [简体中文 (Simplified Chinese)](README_CN.md)

## ✨ 主要機能

- **1ページPDF出力** - レポート、プレゼンテーション、ドキュメントに最適
- **複数ページPDF出力** - 従来のドキュメント変換
- Markdownファイルを高品質なPDFドキュメントに変換
- **最新のMermaid図表に対応**（v11.10.1）
  - mindmap（マインドマップ）
  - architecture-beta（アーキテクチャ図）
  - xychart-beta（XYチャート）
  - 画像付きフローチャート
- **高品質LaTeX数式レンダリング**（KaTeX v0.16.11）
  - インライン数式：`$E = mc^2$`
  - ディスプレイ数式：`$$...$$`
  - 数式ブロック：````math`
  - 複素方程式、行列、積分
- **拡張Markdown記法サポート**
  - 脚注：`[^1]` 適切なリンクと戻り参照付き
  - ハイライトテキスト：`==ハイライトされたテキスト==`
  - 下付き文字：`H~2~O` → H₂O
  - 上付き文字：`E = mc^2^` → E = mc²
- 日本語・中国語・絵文字の完全サポート
- **完全オフライン動作** - すべてのライブラリとフォントが内蔵

## 📋 前提条件

### WSL (Windows Subsystem for Linux)

WSLを使用している場合は、必要なシステムライブラリをインストールしてください：

```bash
sudo apt update
sudo apt install -y libnss3-dev libxss1 libxtst6 libxrandr2 libasound2-dev libpangocairo-1.0-0 libatk1.0-0 libcairo-gobject2 libgtk-3-0 libgdk-pixbuf2.0-0
```

## 🚀 使用方法

1. VSCodeでMarkdownファイルを開く
2. エディターまたはファイルエクスプローラーで右クリックし、**「Convert to PDF」**を選択
3. またはコマンドパレット（`Ctrl+Shift+P` / `Cmd+Shift+P`）から**「Markdown Snapshot PDF: Convert to PDF」**を実行

### 利用可能なコマンド

- **Convert to PDF (1 page)**: 1ページPDF変換
- **Convert to PDF**: 標準的な複数ページPDF変換

### 1ページPDFの利点

**1ページPDF出力**は以下に最適です：
- 📊 **レポートとダッシュボード** - すべてのコンテンツを一度に表示
- 📋 **プレゼンテーション** - ページ区切りでフローが中断されない
- 📄 **ドキュメント** - 1つのビューで完全な概要
- 🖼️ **インフォグラフィック** - シームレスなビジュアルコンテンツ
- 📈 **チャートと図表** - 中断されないデータ可視化

コンテンツは読みやすさを保ちながら自動的に1ページに収まるようにスケールされます。

## 🏢 企業環境での使用

プロキシやファイアウォールがある企業環境では、以下の設定が必要な場合があります：

### プロキシ設定

環境変数でプロキシ設定を行ってください：

```bash
# Windows (コマンドプロンプト)
set HTTP_PROXY=http://proxy.company.com:8080
set HTTPS_PROXY=http://proxy.company.com:8080

# Windows (PowerShell)
$env:HTTP_PROXY="http://proxy.company.com:8080"
$env:HTTPS_PROXY="http://proxy.company.com:8080"

# macOS/Linux
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
```

### タイムアウト処理

ネットワークが遅い環境では、以下の対策が自動的に適用されます：

- ナビゲーションタイムアウト: 60秒
- Mermaid描画タイムアウト: 30秒
- CDN接続失敗時のローカルMermaidファイル使用

### オフライン環境

完全にオフラインの環境では、ローカルのMermaidライブラリが自動的に使用されます。

## 🔧 技術仕様

- **Mermaidバージョン**: v11.10.1（最新）
- **LaTeX数式**: KaTeX v0.16.11（埋め込みフォント付き）
- **PDFエンジン**: Puppeteer（Headless Chrome）
- **Markdownパーサー**: Marked v16.2.1

## 📄 ライセンス

この拡張機能は[The Unlicense](https://unlicense.org/)の下でリリースされています - パブリックドメイン。

Copyright 2025 Shima

### サードパーティライブラリ

この拡張機能には以下のサードパーティライブラリが含まれています：

- **KaTeX v0.16.11** - MIT License
  - Copyright (c) 2013-2020 Khan Academy and other contributors
  - [License](https://github.com/KaTeX/KaTeX/blob/main/LICENSE)

- **Mermaid v11.10.1** - MIT License  
  - Copyright (c) 2014-2022 Knut Sveidqvist
  - [License](https://github.com/mermaid-js/mermaid/blob/develop/LICENSE)

- **Marked v16.2.1** - MIT License
  - Copyright (c) 2011-2022, Christopher Jeffrey
  - [License](https://github.com/markedjs/marked/blob/master/LICENSE.md)

- **md-to-pdf** - MIT License
  - Copyright (c) Simon Hänisch
  - [License](https://github.com/simonhaenisch/md-to-pdf)

- **highlight.js v11.11.1** - BSD 3-Clause License
  - Copyright (c) 2006, Ivan Sagalaev
  - [License](https://github.com/highlightjs/highlight.js/blob/main/LICENSE)

## 🛠️ 開発

開発情報については以下をご覧ください：
- [Development Guide (English)](DEVELOPMENT.md)
- [開発ガイド (Japanese)](DEVELOPMENT_JA.md)
- [开发指南 (Simplified Chinese)](DEVELOPMENT_CN.md)
