# C言語系ハイライトテスト

## C言語
```c
#include <stdio.h>

int main() {
    printf("Hello, World!\n");
    return 0;
}
```

## C++
```cpp
#include <iostream>
#include <vector>

class HelloWorld {
public:
    void sayHello() {
        std::cout << "Hello, World!" << std::endl;
    }
};

int main() {
    HelloWorld hw;
    hw.sayHello();
    
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    for (const auto& num : numbers) {
        std::cout << num << " ";
    }
    
    return 0;
}
```

## C#
```csharp
using System;
using System.Collections.Generic;
using System.Linq;

namespace HelloWorld
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello, World!");
            
            var numbers = new List<int> { 1, 2, 3, 4, 5 };
            var evenNumbers = numbers.Where(n => n % 2 == 0).ToList();
            
            foreach (var num in evenNumbers)
            {
                Console.WriteLine($"Even number: {num}");
            }
        }
    }
}
```
