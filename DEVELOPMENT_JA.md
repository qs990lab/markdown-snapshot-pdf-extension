# 開発ガイド

このドキュメントは、Markdown Mermaid to PDF拡張機能に貢献または変更を加えたい開発者向けの情報を提供します。

## 📖 他の言語

- [Development Guide (English)](DEVELOPMENT.md)
- [开发指南 (Simplified Chinese)](DEVELOPMENT_CN.md)

## ✨ 機能

このVSCode拡張機能は、以下をサポートしてMarkdownファイルを高品質なPDFドキュメントに変換します：
- **Mermaid図表**（v11.10.1） - マインドマップ、アーキテクチャ図、XYチャートを含む最新機能
- **LaTeX数式**（KaTeX v0.16.11） - 埋め込みフォント付き高品質数式レンダリング
- **完全オフライン動作** - すべてのライブラリとフォントを内蔵

## 🏗️ プロジェクト構成

```
├── src/extension.ts        # VSCode拡張機能のメインコード
├── lib/                    # ローカルmd-to-pdfライブラリ
│   ├── md-to-pdf.js       # メインPDF生成ロジック
│   ├── get-marked-with-highlighter.js  # Markdown処理
│   ├── config.js          # デフォルト設定
│   └── mermaid.min.js     # バンドルされたMermaidライブラリ
├── test/                   # テストファイル
│   ├── latex_test.md      # LaTeX数式テストファイル
│   ├── latex_advanced_test.md  # 高度なLaTeXテストファイル
│   └── test_mermaid.md    # Mermaid図表テストファイル
├── index.js               # ライブラリエントリーポイント
├── cli.js                 # CLI実行用
├── markdown.css           # PDFスタイリング
├── icon.png              # 拡張機能アイコン
└── package.json          # 拡張機能マニフェスト
```

## 🛠️ 開発環境のセットアップ

### 前提条件

- Node.js（v16以上）
- npm
- VSCode

### インストール

1. リポジトリをクローン
2. 依存関係をインストール：

```bash
npm install
```

3. Puppeteerをインストール（postinstallスクリプトで自動処理）：

```bash
npm run postinstall
```

### ビルド

TypeScriptをJavaScriptにコンパイル：

```bash
npm run compile
```

自動コンパイル付きの開発用：

```bash
npm run watch
```

## 📦 パッケージ化

### VSCEのインストール

```bash
npm install -g @vscode/vsce
```

### VSIXパッケージの作成

```bash
vsce package
```

これにより、VSCodeにインストール可能な`.vsix`ファイルが作成されます。

## 🧪 テスト

テストファイルは`test/`ディレクトリにあります：

- `test_mermaid.md`: 最新のMermaid機能をテスト
- `test_chinese_emoji.md`: 中国語と絵文字のサポートをテスト
- `test_onepage.md`: 単一ページ変換をテスト

拡張機能をテストするには：

1. VSCodeでプロジェクトを開く
2. `F5`を押して拡張機能開発ホストを起動
3. テスト用Markdownファイルを開く
4. 右クリックして「Convert to PDF」を選択

## 🔧 設定

### 拡張機能マニフェスト

`package.json`ファイルには以下が含まれます：

- 拡張機能メタデータ
- コマンド定義
- メニュー貢献
- アクティベーションイベント

### 主要な設定セクション

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

## 📚 依存関係

### ランタイム依存関係

- `puppeteer`: PDF生成エンジン
- `marked`: Markdownパーサー
- `highlight.js`: シンタックスハイライト
- `gray-matter`: フロントマター解析

### 開発依存関係

- `typescript`: TypeScriptコンパイラ
- `@types/vscode`: VSCode API型定義
- `@types/node`: Node.js型定義

## 🌐 国際化

拡張機能は以下を通じて複数言語をサポートします：

1. **READMEファイル**: `README.md`、`README_JA.md`、`README_CN.md`
2. **開発ガイド**: `DEVELOPMENT.md`、`DEVELOPMENT_JA.md`、`DEVELOPMENT_CN.md`
3. **フォントサポート**: CJK文字の自動フォント検出

## 🔍 デバッグ

### VSCodeデバッグ

1. `src/extension.ts`にブレークポイントを設定
2. `F5`を押してデバッグを開始
3. テスト用に拡張機能開発ホストを使用

### コンソールログ

拡張機能にログを追加：

```typescript
import * as vscode from 'vscode';

console.log('デバッグメッセージ');
vscode.window.showInformationMessage('情報メッセージ');
```

## 🚀 公開

### 公開の準備

1. `package.json`のバージョンを更新
2. CHANGELOG.mdを更新
3. 徹底的にテスト
4. ビルドとパッケージ化

### マーケットプレースに公開

```bash
vsce publish
```

または特定のバージョンを公開：

```bash
vsce publish 1.0.1
```

## 🤝 貢献

1. リポジトリをフォーク
2. 機能ブランチを作成
3. 変更を加える
4. 該当する場合はテストを追加
5. プルリクエストを提出

### コードスタイル

- 新しいコードにはTypeScriptを使用
- 既存のコードフォーマットに従う
- パブリック関数にはJSDocコメントを追加
- 意味のある変数名と関数名を使用

## 📋 既知の問題

- 大きなMermaid図表は描画に時間がかかる場合があります
- 一部の企業ファイアウォールがMermaid CDNアクセスをブロックする可能性があります（フォールバックで対処）
- PDF生成には大きなドキュメント用の十分なメモリが必要です

## 🔗 有用なリンク

- [VSCode Extension API](https://code.visualstudio.com/api)
- [Mermaidドキュメント](https://mermaid.js.org/)
- [Puppeteerドキュメント](https://pptr.dev/)
- [Markedドキュメント](https://marked.js.org/)
