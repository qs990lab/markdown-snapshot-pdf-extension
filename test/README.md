# テストファイル

このフォルダには、Markdown Snapshot PDF拡張機能のテスト用ファイルが含まれています。

## ファイル一覧

### 基本テスト
- `comprehensive_test.md` - 全機能の包括的テスト（ハイライト、コード、数式、図表、多言語）
- `long_document_test.md` - 長文ドキュメントのテスト（複数ページ、複雑なレイアウト）

### 特殊テスト
- `test_mermaid.md` - Mermaidダイアグラムのテスト
- `test_chinese_emoji.md` - 中国語と絵文字のテスト
- `wsl-test.md` - WSL環境でのテスト

### 大容量テスト
- `test_17pages.md` - 17ページの中程度文書
- `test_34pages.md` - 34ページの大容量文書
- `super-long.md` - 超大容量文書
- `very-long-test.md` - 長文テスト文書

### ワンページテスト
- `test_onepage.md` - 1ページPDF出力のテスト

### その他
- `plantuml_test.md` - PlantUMLテスト（参考用）
- `MarkdownPDFプラグイン.md` - 日本語文書サンプル

## 使用方法

```bash
# 基本テスト
node cli.js ./test/comprehensive_test.md

# 長文テスト
node cli.js ./test/long_document_test.md

# ワンページ出力
node cli.js ./test/comprehensive_test.md --one-page

# HTML出力
node cli.js ./test/comprehensive_test.md --as-html
```

## テスト項目

- ✅ ハイライトテキスト（==テキスト==）
- ✅ コードハイライト（JavaScript, Python等）
- ✅ LaTeX数式（インライン・ブロック）
- ✅ Mermaidダイアグラム
- ✅ 日本語・中国語・絵文字
- ✅ 複数ページレイアウト
- ✅ ワンページ出力
