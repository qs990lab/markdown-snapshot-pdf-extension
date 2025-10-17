# バージョンテスト

## KaTeX数式テスト

インライン数式: $E = mc^2$

ディスプレイ数式:
$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$

複雑な数式:
$$\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
\begin{pmatrix}
x \\
y
\end{pmatrix}
=
\begin{pmatrix}
ax + by \\
cx + dy
\end{pmatrix}$$

## Mermaidダイアグラムテスト

```mermaid
graph TD
    A[開始] --> B{条件}
    B -->|Yes| C[処理1]
    B -->|No| D[処理2]
    C --> E[終了]
    D --> E
```

## 更新されたバージョン

- **KaTeX**: v0.16.22 (最新)
- **Mermaid**: v11.12.0 (最新)

これらのライブラリが正常に動作していることを確認するためのテストファイルです。
