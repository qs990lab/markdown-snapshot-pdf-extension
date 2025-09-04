# 変更履歴

「Markdown Mermaid to PDF」拡張機能の重要な変更はすべてこのファイルに記録されます。

## 📖 他の言語

- [Change Log (English)](CHANGELOG.md)
- [更新日志 (Simplified Chinese)](CHANGELOG_CN.md)

このフォーマットは [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) に基づいており、
このプロジェクトは [Semantic Versioning](https://semver.org/spec/v2.0.0.html) に準拠しています。

## [1.0.4] - 2025-09-04

### 追加
- GitHub Flavored Markdown記法による脚注サポート ([#4](https://github.com/qs990lab/markdown-snapshot-pdf-extension/issues/4))
- ==テキスト== 記法によるハイライトテキストサポート ([#3](https://github.com/qs990lab/markdown-snapshot-pdf-extension/issues/3))
- ~テキスト~ と ^テキスト^ 記法による下付き・上付き文字サポート ([#5](https://github.com/qs990lab/markdown-snapshot-pdf-extension/issues/5))

### 修正
- システムライブラリ不足によるWSL変換エラー ([#2](https://github.com/qs990lab/markdown-snapshot-pdf-extension/issues/2))

## [1.0.0] - 2025-08-27

### 追加
- Markdown Mermaid to PDF拡張機能の初回リリース
- Markdownファイルを高品質なPDFドキュメントに変換
- 最新のMermaid図表サポート（v11.10.1）
  - mindmap（マインドマップ）
  - architecture-beta（アーキテクチャ図）
  - xychart-beta（XYチャート）
  - 画像付きフローチャート
- 日本語・中国語・絵文字の完全サポート
- 2つの変換モード：
  - 標準複数ページPDF変換
  - 単一ページPDF変換
- 右クリックコンテキストメニュー統合：
  - エディターコンテキストメニュー
  - ファイルエクスプローラーコンテキストメニュー
- コマンドパレット統合
- エンタープライズ環境サポート：
  - プロキシ設定サポート
  - 低速ネットワーク用タイムアウト処理
  - ローカルMermaidライブラリによるオフライン環境サポート
- 外部依存関係不要 - すべてのライブラリが内蔵
- 多言語ドキュメント：
  - 英語（README.md）
  - 日本語（README_JA.md）
  - 簡体字中国語（README_CN.md）
- 3言語での包括的な開発ガイド

### 技術仕様
- Mermaidバージョン：v11.10.1
- PDFエンジン：Puppeteer（ヘッドレスChrome）
- Markdownパーサー：Marked
- サポート言語：日本語、中国語（簡体字・繁体字）、英語
- 完全な絵文字サポート
