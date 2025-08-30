# VSCode拡張機能のインストール手順

## 方法1: 開発モードでテスト

1. VSCodeでこのフォルダを開く
2. F5キーを押して新しいVSCodeウィンドウを開く（Extension Development Host）
3. 新しいウィンドウでMarkdownファイルを開いてテスト

## 方法2: VSIXファイルとしてパッケージ化してインストール

### 1. VSCEをインストール
```bash
npm install -g vsce
```

### 2. パッケージ化
```bash
cd markdown-mermaid-pdf-extension
vsce package
```

### 3. VSCodeにインストール
```bash
code --install-extension markdown-mermaid-pdf-1.0.0.vsix
```

または、VSCode内で：
1. Ctrl+Shift+P でコマンドパレットを開く
2. "Extensions: Install from VSIX..." を選択
3. 生成された .vsix ファイルを選択

## 使用方法

1. Markdownファイルを開く
2. 右クリックメニューまたはコマンドパレット（Ctrl+Shift+P）から：
   - "Markdown Mermaid PDF: Convert to PDF"

## トラブルシューティング

- `md-mermaid-to-pdf`がグローバルにインストールされていることを確認してください
- Markdownファイルが保存されていることを確認してください
- 出力先ディレクトリに書き込み権限があることを確認してください
