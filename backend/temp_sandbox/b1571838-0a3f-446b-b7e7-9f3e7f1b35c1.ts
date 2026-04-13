// Welcome to Virtual Sandbox!
// Write your TypeScript code here

function greet(name: string): string {
    return `Hello, ${name}!`;
}

// Test the function
const result: string = greet("Campus Grid");
console.log(result);

// Try some typed operations
const numbers: number[] = [1, 2, 3, 4, 5];
const sum: number = numbers.reduce((a, b) => a + b, 0);
console.log(`Sum: ${sum}`);
