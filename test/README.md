# テストファイル

このディレクトリには、Markdown Mermaid PDF拡張機能のテスト用ファイルが含まれています。

## 対応機能テスト

### ✅ Mermaid図表（完全対応）
- **test_mermaid.md** - Mermaid v11.10.1の最新機能テスト
  - mindmap（マインドマップ）
  - architecture-beta（アーキテクチャ図）
  - xychart-beta（XYチャート）
  - flowchart（フローチャート）with images

### ✅ LaTeX数式（完全対応）
- **latex_test.md** - 基本的なLaTeX数式テスト
- **latex_advanced_test.md** - 高品質LaTeX数式テスト
  - インライン数式：`$E = mc^2$`
  - ディスプレイ数式：`$$...$$`
  - 数式ブロック：````math`
  - 行列、積分、マクスウェル方程式など
  - 埋め込みKaTeXフォント（~500KB）


  - 埋め込みフォント（~304KB）

### ❌ PlantUML（未対応）
- **plantuml_test.md** - PlantUML図表テスト（生テキストとして表示）

## 技術仕様

### 完全オフライン対応
- 外部CDN不要
- すべてのライブラリとフォントを埋め込み
- 企業環境・プロキシ環境でも動作
- 総フォントサイズ：~800KB

### 高品質レンダリング
- **KaTeX v0.16.11** + 埋め込みフォント
- **Mermaid v11.10.1** + ローカルライブラリ
- アンチエイリアシング・高DPI対応

### ライセンス
- すべてフリー・商用利用可能
- MIT License / SIL OFL 1.1

## 使用方法

```bash
# 単一ファイル変換
node cli.js test/test_mermaid.md
node cli.js test/latex_advanced_test.md

# 複数ファイル変換

# VSCode拡張として使用
# 右クリック → "Convert to PDF"
```

## 生成されるPDFファイル

各テストファイルから対応するPDFが生成されます：
- `test_mermaid.pdf` - Mermaid図表付きPDF
- `latex_test.pdf` - LaTeX数式付きPDF
- `latex_advanced_test.pdf` - 高品質数式PDF（行列、積分等）

## 機能比較

| 機能 | 対応状況 | ライブラリ | バージョン | サイズ |
|------|----------|------------|------------|--------|
| Mermaid図表 | ✅ 完全対応 | Mermaid | v11.10.1 | ローカル |
| LaTeX数式 | ✅ 完全対応 | KaTeX | v0.16.11 | ~500KB |
| PlantUML | ❌ 未対応 | - | - | - |

## デバッグ

### HTMLファイル生成
```bash
# デバッグ用HTMLファイルを生成
```

### ログ出力
```bash
# 詳細ログ付きで実行
DEBUG=* node cli.js test/test_mermaid.md
```
