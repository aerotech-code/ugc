import { Router, Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { asyncHandler } from '../middleware/error.middleware.js';
import { validateRequired } from '../middleware/validation.middleware.js';
import { ApiResponse } from '../types/index.js';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

const router = Router();
const execPromise = promisify(exec);
const TIMEOUT_MS = 5000; // 5 seconds
const TEMP_DIR = path.join(process.cwd(), 'temp_sandbox');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

interface ExecutionResult {
  output: string;
  error: string;
  exitCode: number;
  executionTime: number;
  language: string;
}

interface ExecError {
  stdout?: string;
  stderr?: string;
  message?: string;
  code?: number;
}

const LANGUAGE_COMMANDS: Record<string, { ext: string; cmd: (file: string) => string }> = {
  python: { ext: 'py', cmd: (file) => `python3 "${file}"` },
  javascript: { ext: 'js', cmd: (file) => `node "${file}"` },
  typescript: { ext: 'ts', cmd: (file) => {
    // Compile with tsc then execute resulting JS
    const jsFile = file.replace('.ts', '.js');
    return 'npx tsc "' + file + '" --outFile "' + jsFile + '" --target ES2020 --module commonjs && node "' + jsFile + '"';
  }},

  java: { ext: 'java', cmd: (file) => {
    // Extract class name from filename (e.g., Main.java -> Main)
    const className = path.basename(file, '.java');
    const dir = path.dirname(file);
    // Compile and run
    return `cd "${dir}" && javac "${className}.java" && java ${className}`;
  }},
  cpp: { ext: 'cpp', cmd: (file) => {
    const exePath = file.replace('.cpp', '');
    return `g++ -o "${exePath}" "${file}" && "${exePath}"`;
  }},
  c: { ext: 'c', cmd: (file) => {
    const exePath = file.replace('.c', '');
    return `gcc -o "${exePath}" "${file}" && "${exePath}"`;
  }},
  rust: { ext: 'rs', cmd: (file) => {
    const exePath = file.replace('.rs', '');
    return `rustc -o "${exePath}" "${file}" && "${exePath}"`;
  }},
  go: { ext: 'go', cmd: (file) => {
    return `go run "${file}"`;
  }},
};

router.post('/execute', asyncHandler(async (req: Request, res: Response) => {
  const { code, language } = req.body;

  validateRequired(code, 'Code');
  validateRequired(language, 'Language');

  if (!LANGUAGE_COMMANDS[language]) {
    return res.status(400).json(new ApiResponse(400, null, `Unsupported language: ${language}`));
  }

  const fileId = randomUUID();
  const { ext } = LANGUAGE_COMMANDS[language];
  let filePath = path.join(TEMP_DIR, `${fileId}.${ext}`);
  let cmd = LANGUAGE_COMMANDS[language].cmd;

  // Special handling for Java: find the public class name and use it
  if (language === 'java') {
    // More robust regex to extract public class name
    const classNameMatch = code.match(/public\s+class\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
    let className = 'Main';
    
    if (classNameMatch && classNameMatch[1]) {
      className = classNameMatch[1];
    }
    
    filePath = path.join(TEMP_DIR, `${className}.${ext}`);
    
    // Create a custom cmd function for this specific Java file with the correct class name
    cmd = (file: string) => {
      const dir = path.dirname(file);
      return `cd "${dir}" && javac "${className}.java" && java ${className}`;
    };
  }

  // Store original paths for cleanup
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const originalFilePath = filePath;

  try {
    // Write code to temporary file
    fs.writeFileSync(filePath, code, 'utf-8');

    const startTime = performance.now();
    
    try {
      const { stdout, stderr } = await execPromise(cmd(filePath), {
        timeout: TIMEOUT_MS,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });

      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);

      const result: ExecutionResult = {
        output: stdout || '',
        error: stderr || '',
        exitCode: 0,
        executionTime,
        language,
      };

      res.status(200).json(new ApiResponse(200, result, 'Code executed successfully'));
    } catch (execError: unknown) {
      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);

      const execErr = execError as ExecError;
      
      // If Python command fails with python3, try python as fallback
      if (language === 'python' && execErr.message?.includes('python3')) {
        try {
          const { stdout, stderr } = await execPromise(cmd(filePath).replace('python3', 'python'), {
            timeout: TIMEOUT_MS,
            maxBuffer: 10 * 1024 * 1024,
          });
          
          const result: ExecutionResult = {
            output: stdout || '',
            error: stderr || '',
            exitCode: 0,
            executionTime: Math.round(performance.now() - startTime),
            language,
          };
          
          return res.status(200).json(new ApiResponse(200, result, 'Code executed successfully'));
        } catch (fallbackErr: unknown) {
          const err = fallbackErr as ExecError;
          const result: ExecutionResult = {
            output: err.stdout || '',
            error: err.stderr || err.message || 'Python execution failed',
            exitCode: err.code || 1,
            executionTime: Math.round(performance.now() - startTime),
            language,
          };
          
          return res.status(200).json(new ApiResponse(200, result, 'Code execution completed with errors'));
        }
      }
      
      const result: ExecutionResult = {
        output: execErr.stdout || '',
        error: execErr.stderr || execErr.message || 'Execution failed',
        exitCode: execErr.code || 1,
        executionTime,
        language,
      };

      res.status(200).json(new ApiResponse(200, result, 'Code execution completed with errors'));
    }
  } catch (error: unknown) {
    const err = error as ExecError;
    res.status(500).json(new ApiResponse(500, null, `Execution error: ${err.message || 'Unknown error'}`));
  } finally {
    // Cleanup temporary files
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Remove compiled/generated files based on language
      const baseName = filePath.replace(/\.\w+$/, ''); // Remove extension
      
      // TypeScript -> JavaScript
      const jsFile = filePath.replace('.ts', '.js');
      if (fs.existsSync(jsFile)) {
        fs.unlinkSync(jsFile);
      }
      
      // Compiled executables (C++, C, Rust - no extension or .exe on Windows)
      if (fs.existsSync(baseName)) {
        try {
          fs.unlinkSync(baseName);
        } catch {
          // File might be in use or already deleted
        }
      }
      
      // Windows executables
      const winExe = baseName + '.exe';
      if (fs.existsSync(winExe)) {
        try {
          fs.unlinkSync(winExe);
        } catch {
          // File might be in use or already deleted
        }
      }
      
      // Java compiled class files - may have multiple classes, use pattern
      const parentDir = path.dirname(filePath);
      const fileBaseName = path.basename(baseName);
      
      // Get all matching .class files in the directory
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const classPattern = fileBaseName + '*.class';
      try {
        const files = fs.readdirSync(parentDir);
        files.forEach((file) => {
          if (file.startsWith(fileBaseName) && file.endsWith('.class')) {
            const classPath = path.join(parentDir, file);
            try {
              fs.unlinkSync(classPath);
            } catch {
              // File might be in use
            }
          }
        });
      } catch {
        // Directory read error, skip
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
  }
}));

router.post('/validate', asyncHandler(async (req: Request, res: Response) => {
  const { code, language } = req.body;

  validateRequired(code, 'Code');
  validateRequired(language, 'Language');

  const syntaxChecks: Record<string, (code: string) => { valid: boolean; error?: string }> = {
    javascript: (code) => {
      try {
        new Function(code);
        return { valid: true };
      } catch (e: unknown) {
        const err = e as ExecError;
        return { valid: false, error: err.message };
      }
    },
    python: () => {
      return { valid: true }; // Python validation requires runtime
    },
    typescript: () => {
      return { valid: true }; // Typescript validation is best-effort
    },
    java: (code) => {
      if (!code.includes('class') && !code.includes('interface')) {
        return { valid: false, error: 'Java code must contain a class or interface' };
      }
      return { valid: true };
    },
    cpp: (code) => {
      if (!code.includes('#include')) {
        return { valid: false, error: 'C++ code should include headers' };
      }
      return { valid: true };
    },
    c: (code) => {
      if (!code.includes('#include')) {
        return { valid: false, error: 'C code should include headers' };
      }
      return { valid: true };
    },
    rust: (code) => {
      if (!code.includes('fn main')) {
        return { valid: false, error: 'Rust code must have a main function' };
      }
      return { valid: true };
    },
    go: (code) => {
      if (!code.includes('package main')) {
        return { valid: false, error: 'Go code must have package main' };
      }
      if (!code.includes('func main')) {
        return { valid: false, error: 'Go code must have a main function' };
      }
      return { valid: true };
    },
  };

  const validator = syntaxChecks[language] || (() => ({ valid: true }));
  const { valid, error } = validator(code);

  res.status(200).json(new ApiResponse(200, { valid, error }, 'Syntax validation completed'));
}));

// Get execution history (limited to 10 most recent)
router.get('/history', asyncHandler(async (req: Request, res: Response) => {
  // This would typically fetch from a database
  // For now, returning empty as this is a stateless API
  res.status(200).json(new ApiResponse(200, [], 'Execution history retrieved'));
}));

// LLM-based execution using Gemini (or any LLM endpoint)
router.post('/llm-execute', asyncHandler(async (req: Request, res: Response) => {
  const { code, language, prompt } = req.body;

  validateRequired(code, 'Code');
  validateRequired(language, 'Language');

  const GEMINI_API_URL = process.env.GEMINI_API_URL;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_URL || !GEMINI_API_KEY) {
    return res.status(400).json(new ApiResponse(400, null, 'LLM not configured. Set GEMINI_API_URL and GEMINI_API_KEY in environment.'));
  }

  // Build a clear instruction for the LLM to execute / simulate execution
  const execPrompt = (prompt && String(prompt).trim().length > 0)
    ? `${prompt}\n\nLanguage: ${language}\nCode:\n${code}`
    : `You are an execution agent. Execute the following ${language} code and return a JSON object with keys: \n- output: the program stdout (or best-effort simulated output)\n- error: any runtime/compile errors (empty string if none)\nReturn ONLY the JSON object and no additional commentary.\n\nCode:\n${code}`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: execPrompt,
        max_tokens: 1500,
        temperature: 0,
      }),
    });

    const contentType = response.headers.get('content-type') || '';
    let text: string;

    if (contentType.includes('application/json')) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const json = await response.json() as any;
      // Try common shapes: { output: '...', error: '' } or { data: '...' }
      if (json.output || json.error || json.data) {
        return res.status(200).json(new ApiResponse(200, json, 'LLM execution completed'));
      }
      // If unknown shape, stringify the response
      text = JSON.stringify(json);
    } else {
      text = await response.text();
    }

    // Attempt to parse JSON text returned by LLM
    try {
      const parsed = JSON.parse(text);
      return res.status(200).json(new ApiResponse(200, parsed, 'LLM execution completed'));
    } catch {
      // Not JSON — return as plain output
      return res.status(200).json(new ApiResponse(200, { output: text, error: '' }, 'LLM execution completed'));
    }
  } catch (err: unknown) {
    const e = err as Error;
    return res.status(500).json(new ApiResponse(500, null, `LLM request failed: ${e.message}`));
  }
}));

export default router;
