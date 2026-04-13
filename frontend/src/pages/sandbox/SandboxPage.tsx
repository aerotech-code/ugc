import { useState } from 'react';
import {
  Code,
  Play,
  RotateCcw,
  Download,
  Copy,
  Terminal,
  Cpu,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiCall } from '@/lib/api';

const LANGUAGES = [
  { value: 'python', label: 'Python', version: '3.11' },
  { value: 'javascript', label: 'JavaScript', version: 'ES2023' },
  // { value: 'typescript', label: 'TypeScript', version: '5.0' },
  { value: 'java', label: 'Java', version: '17' },
  { value: 'cpp', label: 'C++', version: '17' },
  { value: 'c', label: 'C', version: '11' },
  { value: 'rust', label: 'Rust', version: '1.70' },
  { value: 'go', label: 'Go', version: '1.21' },
];

const DEFAULT_CODE: Record<string, string> = {
  python: `# Welcome to Virtual Sandbox!
# Write your Python code here

def greet(name):
    return f"Hello, {name}!"

# Test the function
result = greet("Campus Grid")
print(result)

# Try some calculations
numbers = [1, 2, 3, 4, 5]
sum_result = sum(numbers)
print(f"Sum: {sum_result}")
`,
  javascript: `// Welcome to Virtual Sandbox!
// Write your JavaScript code here

function greet(name) {
    return \`Hello, \${name}!\`;
}

// Test the function
const result = greet("Campus Grid");
console.log(result);

// Try some array operations
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((a, b) => a + b, 0);
console.log(\`Sum: \${sum}\`);
`,
  typescript: `// Welcome to Virtual Sandbox!
// Write your TypeScript code here

function greet(name: string): string {
    return \`Hello, \${name}!\`;
}

// Test the function
const result: string = greet("Campus Grid");
console.log(result);

// Try some typed operations
const numbers: number[] = [1, 2, 3, 4, 5];
const sum: number = numbers.reduce((a, b) => a + b, 0);
console.log(\`Sum: \${sum}\`);
`,
  java: `// Welcome to Virtual Sandbox!
// Write your Java code here

public class Main {
    public static void main(String[] args) {
        String result = greet("Campus Grid");
        System.out.println(result);
        
        int[] numbers = {1, 2, 3, 4, 5};
        int sum = 0;
        for (int num : numbers) {
            sum += num;
        }
        System.out.println("Sum: " + sum);
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
}
`,
  cpp: `// Welcome to Virtual Sandbox!
// Write your C++ code here

#include <iostream>
#include <vector>
#include <numeric>

std::string greet(const std::string& name) {
    return "Hello, " + name + "!";
}

int main() {
    std::string result = greet("Campus Grid");
    std::cout << result << std::endl;
    
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    int sum = std::accumulate(numbers.begin(), numbers.end(), 0);
    std::cout << "Sum: " << sum << std::endl;
    
    return 0;
}
`,
  c: `/* Welcome to Virtual Sandbox!
   Write your C code here */

#include <stdio.h>
#include <string.h>

void greet(const char* name, char* result) {
    sprintf(result, "Hello, %s!", name);
}

int main() {
    char result[100];
    greet("Campus Grid", result);
    printf("%s\\n", result);
    
    int numbers[] = {1, 2, 3, 4, 5};
    int sum = 0;
    for (int i = 0; i < 5; i++) {
        sum += numbers[i];
    }
    printf("Sum: %d\\n", sum);
    
    return 0;
}
`,
  rust: `// Welcome to Virtual Sandbox!
// Write your Rust code here

fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

fn main() {
    let result = greet("Campus Grid");
    println!("{}", result);
    
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);
}
`,
  go: `// Welcome to Virtual Sandbox!
// Write your Go code here

package main

import "fmt"

func greet(name string) string {
    return fmt.Sprintf("Hello, %s!", name)
}

func main() {
    result := greet("Campus Grid")
    fmt.Println(result)
    
    numbers := []int{1, 2, 3, 4, 5}
    sum := 0
    for _, num := range numbers {
        sum += num
    }
    fmt.Printf("Sum: %d\\n", sum)
}
`,
};

export function SandboxPage() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(DEFAULT_CODE.python);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [executionPhase, setExecutionPhase] = useState<string | null>(null);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCode(DEFAULT_CODE[newLang] || '');
    setOutput('');
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('');
    setExecutionPhase(null);

    // Set appropriate phase message based on language
    const phaseMessages: Record<string, string> = {
      typescript: 'Transpiling TypeScript...',
      cpp: 'Compiling C++...',
      rust: 'Compiling Rust...',
      go: 'Compiling Go...',
      c: 'Compiling C...',
      java: 'Compiling Java...',
    };

    const languagePhase = phaseMessages[language];
    if (languagePhase) {
      setExecutionPhase(languagePhase);
    }

    try {
      const result = await apiCall('POST', '/sandbox/execute', {
        code,
        language,
      });

      if (result.success) {
        const data = result.data as any;
        const { output, error, executionTime } = data;
        setExecutionTime(executionTime);
        setOutput(output || error || 'No output');
        toast.success('Code executed successfully!');
      } else {
        setOutput(`Error: ${result.message}`);
        toast.error(result.message || 'Execution failed');
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to execute code';
      setOutput(`Error: ${errorMsg}`);
      toast.error(errorMsg);
    } finally {
      setIsRunning(false);
      setExecutionPhase(null);
    }
  };

  const handleReset = () => {
    setCode(DEFAULT_CODE[language]);
    setOutput('');
    toast.info('Code reset to default');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const handleDownload = () => {
    const extensions: Record<string, string> = {
      python: 'py',
      javascript: 'js',
      typescript: 'ts',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      rust: 'rs',
      go: 'go',
    };

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `main.${extensions[language]}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Code downloaded');
  };

  const currentLang = LANGUAGES.find(l => l.value === language);

  return (
    <div className="space-y-4 h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-edu-blue-600 to-edu-purple-600 bg-clip-text text-transparent">
            Virtual Sandbox
          </h1>
          <p className="text-edu-blue-600 mt-1">
            Write, run, and test code in multiple languages
          </p>

        </div>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-56 border-2 border-edu-blue-300 focus:border-edu-blue-600 bg-gradient-to-r from-edu-blue-50 to-transparent">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="w-56">
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-medium">{lang.label}</span>
                    <span className="text-xs text-gray-500 ml-1">{lang.version}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Editor & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        {/* Code Editor */}
        <Card className="flex flex-col border-edu-blue-200">
          <div className="flex items-center justify-between p-3 border-b border-edu-blue-100 bg-edu-blue-50">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-edu-blue-600" />
              <span className="text-sm font-medium text-edu-blue-900">main.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleCopy} className="hover:bg-edu-blue-100">
                <Copy className="w-4 h-4 text-edu-blue-600" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDownload} className="hover:bg-edu-blue-100">
                <Download className="w-4 h-4 text-edu-blue-600" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleReset} className="hover:bg-edu-blue-100">
                <RotateCcw className="w-4 h-4 text-edu-blue-600" />
              </Button>
            </div>
          </div>
          <CardContent className="flex-1 p-0">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none border-l-4 border-edu-blue-400"
              spellCheck={false}
            />
          </CardContent>
          <div className="p-3 border-t border-edu-blue-100 bg-edu-blue-50 flex items-center justify-between">
            <Badge variant="secondary" className="bg-edu-blue-100 text-edu-blue-900">
              <Cpu className="w-3 h-3 mr-1" />
              {currentLang?.label} {currentLang?.version}

            </Badge>
            <Button onClick={handleRun} disabled={isRunning} className="bg-gradient-to-r from-edu-blue-600 to-edu-purple-600 hover:from-edu-blue-700 hover:to-edu-purple-700 text-white">
              {isRunning ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Run Code
            </Button>
          </div>
        </Card>

        {/* Output */}
        <Card className="flex flex-col border-edu-purple-200">
          <div className="flex items-center justify-between p-3 border-b border-edu-purple-100 bg-edu-purple-50">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-edu-purple-600" />
              <span className="text-sm font-medium text-edu-purple-900">Output</span>
            </div>
            {executionTime > 0 && (
              <div className="flex items-center gap-1 text-xs text-edu-purple-600 font-semibold">
                <Clock className="w-3 h-3" />
                {executionTime}ms
              </div>
            )}
          </div>
          <CardContent className="flex-1 p-0">
            <div className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-edu-green-100 overflow-auto border-l-4 border-edu-purple-400">
              {output ? (
                <pre className="whitespace-pre-wrap text-edu-green-100">{output}</pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <Terminal className="w-12 h-12 mb-3 opacity-50" />
                  <p>Run your code to see output</p>
                </div>
              )}
            </div>
          </CardContent>
          <div className="p-3 border-t border-edu-purple-100 bg-edu-purple-50">
            <div className="flex items-center gap-2 text-xs text-edu-purple-700 font-medium">
              <AlertCircle className="w-3 h-3" />
              <span>Execution limited to 5 seconds | Outputs displayed live</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
