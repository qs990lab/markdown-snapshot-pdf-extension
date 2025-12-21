# KaTeX vs コードブロック コンフリクトテスト

## 問題のあるパターン

### 1. シェルスクリプトの変数
```bash
#!/bin/bash
echo "Price: $100"
export PATH=$PATH:/usr/local/bin
total=$((price * quantity))
echo "Total: $total"
```

### 2. JavaScript/TypeScript
```javascript
const price = "$50.99";
const template = `Total cost: ${price}`;
console.log(`Final amount: $${calculateTotal()}`);
```

### 3. Python f-string
```python
price = 100
print(f"Price: ${price}")
discount = "$10 off"
total = f"Total: ${price - 10}"
```

### 4. PowerShell変数
```powershell
$proxyUrl = "http://10.0.1.100:3128"
$agentUrl = "https://aka.ms/AzureConnectedMachineAgent"
$installerPath = "$env:TEMP\AzureConnectedMachineAgent.msi"
Write-Host "URL: $agentUrl"
```

### 5. 正常な数式（これらは数式として処理されるべき）

インライン数式: $E = mc^2$ と $F = ma$

ディスプレイ数式:
$$\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$

$$\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}$$

### 6. 混在パターン（最も問題になりやすい）

数式 $x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$ の後にコード：

```bash
price=$1
echo "Processing $price"
```

そしてまた数式 $\lim_{x \to 0} \frac{\sin x}{x} = 1$

### 7. インラインコードとの混在

変数 `$HOME` や `$PATH` は環境変数で、数式 $\pi r^2$ とは違います。

### 8. 複雑なケース

```sql
SELECT * FROM products WHERE price > $1 AND discount < $2;
UPDATE accounts SET balance = balance - $amount WHERE id = $user_id;
```

数式: $A = \pi r^2$ と $V = \frac{4}{3}\pi r^3$

```dockerfile
ENV API_KEY=$API_KEY
RUN echo "Cost: $COST" > /tmp/cost.txt
```

## 期待される結果

- ✅ コードブロック内の `$` → そのまま表示（数式処理されない）
- ✅ インラインコード内の `$` → そのまま表示（数式処理されない）  
- ✅ 数式の `$...$` → KaTeX で美しくレンダリング
- ✅ ディスプレイ数式の `$$...$$` → KaTeX で美しくレンダリング
