# コードハイライトテスト

## JavaScript

```javascript
function hello(name) {
    console.log(`Hello, ${name}!`);
    return name.toUpperCase();
}

const user = "World";
hello(user);
```

## Python

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# リスト内包表記
numbers = [fibonacci(i) for i in range(10)]
print(numbers)
```

## Java

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // ループの例
        for (int i = 0; i < 5; i++) {
            System.out.println("Count: " + i);
        }
    }
}
```

## SQL

```sql
SELECT 
    u.name,
    u.email,
    COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2023-01-01'
GROUP BY u.id, u.name, u.email
ORDER BY order_count DESC;
```

## 言語指定なし

```
function test() {
    return "This should be auto-detected";
}
```
