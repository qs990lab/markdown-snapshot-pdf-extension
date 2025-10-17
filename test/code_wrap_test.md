# コードブロック折り返しテスト

このファイルは、コードブロック内の長いテキストが適切に折り返されるかをテストするためのものです。

## 長いコード行のテスト

### JavaScript の例

```javascript
// 非常に長い行のテスト - この行は通常のPDF幅を超える長さになっており、適切に折り返されるべきです
const veryLongVariableName = "これは非常に長い文字列で、PDFの幅を超えてしまう可能性があります。適切に折り返されることを確認します。";

function veryLongFunctionNameThatExceedsNormalLineWidth(parameterOne, parameterTwo, parameterThree, parameterFour, parameterFive) {
    return parameterOne + parameterTwo + parameterThree + parameterFour + parameterFive;
}

// 長いURL
const apiEndpoint = "https://api.example.com/v1/users/12345/profile/settings/notifications/email/preferences/advanced/configuration";
```

### Python の例

```python
# 長いコメント行 - この行は通常のPDF幅を超える長さになっており、適切に折り返されるべきです。テキストが見切れないことを確認します。
very_long_variable_name_that_exceeds_normal_line_width = "これは非常に長い文字列で、PDFの幅を超えてしまう可能性があります。"

def very_long_function_name_that_exceeds_normal_line_width(parameter_one, parameter_two, parameter_three, parameter_four):
    return f"{parameter_one} {parameter_two} {parameter_three} {parameter_four} - この文字列も非常に長くなっています"
```

### SQL の例

```sql
-- 長いSQL文
SELECT users.id, users.name, users.email, profiles.bio, profiles.avatar_url, settings.theme, settings.language, notifications.email_enabled
FROM users 
LEFT JOIN profiles ON users.id = profiles.user_id 
LEFT JOIN settings ON users.id = settings.user_id 
LEFT JOIN notifications ON users.id = notifications.user_id 
WHERE users.created_at > '2024-01-01' AND profiles.bio IS NOT NULL AND settings.theme = 'dark';
```

### JSON の例

```json
{
  "veryLongPropertyNameThatExceedsNormalLineWidth": "これは非常に長い値で、PDFの幅を超えてしまう可能性があります。適切に折り返されることを確認します。",
  "apiConfiguration": {
    "endpoint": "https://api.example.com/v1/users/12345/profile/settings/notifications/email/preferences/advanced/configuration",
    "timeout": 30000,
    "retryAttempts": 3
  }
}
```

### Bash の例

```bash
# 長いコマンド行
curl -X POST "https://api.example.com/v1/users/12345/profile/settings/notifications/email/preferences/advanced/configuration" \
     -H "Authorization: Bearer very-long-token-that-exceeds-normal-line-width-and-should-wrap-properly" \
     -H "Content-Type: application/json" \
     -d '{"setting": "value", "anotherVeryLongPropertyName": "anotherVeryLongValueThatShouldWrapProperly"}'
```

## 期待される結果

- すべてのコードブロック内のテキストが適切に折り返される
- 長い行がPDFの右端で見切れない
- コードの可読性が保たれる
- インデントが適切に保持される

## テスト手順

1. このファイルをPDFに変換
2. 各コードブロックで長い行が適切に折り返されていることを確認
3. テキストが見切れていないことを確認
