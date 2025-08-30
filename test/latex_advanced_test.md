# 高品質LaTeX数式テスト

## インライン数式
質量エネルギー等価性: $E = mc^2$

複素数: $z = a + b\ii$ where $a, b \in \RR$

微分: $\frac{\dd f}{\dd x} = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$

## ディスプレイ数式

### マクスウェル方程式
$$
\begin{align}
\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} &= \frac{4\pi}{c}\vec{\mathbf{j}} \\
\nabla \cdot \vec{\mathbf{E}} &= 4 \pi \rho \\
\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t} &= \vec{\mathbf{0}} \\
\nabla \cdot \vec{\mathbf{B}} &= 0
\end{align}
$$

### 積分
$$
\int_{-\infty}^{\infty} \ee^{-x^2} \dd x = \sqrt{\pi}
$$

### 行列
$$
\begin{pmatrix}
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
\end{pmatrix}
$$

## 数式ブロック記法

```math
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
```

```math
\oint_C \vec{F} \cdot \dd\vec{r} = \iint_S (\nabla \times \vec{F}) \cdot \dd\vec{S}
```
