/**
 * Code Sandbox Service for VictoryKit
 * Safe code execution using isolated-vm for security tool outputs
 */

const ivm = require("isolated-vm");
const pino = require("pino");
const { z } = require("zod");

const logger = pino({ name: "code-sandbox" });

// Configuration
const DEFAULT_MEMORY_LIMIT = 128; // MB
const DEFAULT_TIMEOUT = 5000; // ms
const MAX_MEMORY_LIMIT = 512; // MB
const MAX_TIMEOUT = 30000; // ms

// Isolate pool for reuse
const isolatePool = [];
const MAX_POOL_SIZE = 5;

/**
 * Validation schemas
 */
const executionOptionsSchema = z.object({
  code: z.string().min(1).max(100000),
  language: z.enum(["javascript", "json"]).default("javascript"),
  memoryLimit: z
    .number()
    .min(8)
    .max(MAX_MEMORY_LIMIT)
    .default(DEFAULT_MEMORY_LIMIT),
  timeout: z.number().min(100).max(MAX_TIMEOUT).default(DEFAULT_TIMEOUT),
  globals: z.record(z.any()).optional(),
});

/**
 * Get or create an isolate from the pool
 * @param {number} memoryLimit - Memory limit in MB
 * @returns {Isolate}
 */
function getIsolate(memoryLimit) {
  // Try to get from pool
  const pooled = isolatePool.pop();
  if (pooled) {
    logger.debug("Reusing pooled isolate");
    return pooled;
  }

  // Create new isolate
  const isolate = new ivm.Isolate({ memoryLimit });
  logger.debug({ memoryLimit }, "Created new isolate");
  return isolate;
}

/**
 * Return isolate to pool
 * @param {Isolate} isolate - Isolate to return
 */
function returnIsolate(isolate) {
  if (isolatePool.length < MAX_POOL_SIZE && !isolate.isDisposed) {
    isolatePool.push(isolate);
    logger.debug("Returned isolate to pool");
  } else if (!isolate.isDisposed) {
    isolate.dispose();
    logger.debug("Disposed isolate (pool full)");
  }
}

/**
 * Create safe console implementation for sandbox
 * @returns {object}
 */
function createSafeConsole() {
  const logs = [];

  return {
    logs,
    console: {
      log: (...args) =>
        logs.push({ level: "log", message: args.join(" "), time: Date.now() }),
      info: (...args) =>
        logs.push({ level: "info", message: args.join(" "), time: Date.now() }),
      warn: (...args) =>
        logs.push({ level: "warn", message: args.join(" "), time: Date.now() }),
      error: (...args) =>
        logs.push({
          level: "error",
          message: args.join(" "),
          time: Date.now(),
        }),
      debug: (...args) =>
        logs.push({
          level: "debug",
          message: args.join(" "),
          time: Date.now(),
        }),
    },
  };
}

/**
 * Execute JavaScript code in sandbox
 * @param {object} options - Execution options
 * @returns {Promise<object>}
 */
async function executeCode(options) {
  const startTime = Date.now();
  const validated = executionOptionsSchema.parse(options);
  const { code, memoryLimit, timeout, globals } = validated;

  let isolate = null;
  let context = null;
  let result = null;

  try {
    // Get isolate
    isolate = getIsolate(memoryLimit);

    // Create context
    context = await isolate.createContext();
    const jail = context.global;
    await jail.set("global", jail.derefInto());

    // Setup safe console
    const { logs, console: safeConsole } = createSafeConsole();

    // Create console reference in sandbox
    const consoleRef = new ivm.Reference(function (level, message) {
      safeConsole[level](message);
    });

    await context.evalClosure(
      `global.console = {
        log: (...args) => $0.apply(undefined, ['log', args.join(' ')], { arguments: { copy: true } }),
        info: (...args) => $0.apply(undefined, ['info', args.join(' ')], { arguments: { copy: true } }),
        warn: (...args) => $0.apply(undefined, ['warn', args.join(' ')], { arguments: { copy: true } }),
        error: (...args) => $0.apply(undefined, ['error', args.join(' ')], { arguments: { copy: true } }),
        debug: (...args) => $0.apply(undefined, ['debug', args.join(' ')], { arguments: { copy: true } }),
      };`,
      [consoleRef],
      { arguments: { reference: true } }
    );

    // Inject custom globals
    if (globals) {
      for (const [key, value] of Object.entries(globals)) {
        await jail.set(key, new ivm.ExternalCopy(value).copyInto());
      }
    }

    // Add safe utilities
    await context.eval(`
      global.JSON = {
        parse: (str) => JSON.parse(str),
        stringify: (obj, replacer, space) => JSON.stringify(obj, replacer, space),
      };
      global.Math = Math;
      global.Date = Date;
      global.Array = Array;
      global.Object = Object;
      global.String = String;
      global.Number = Number;
      global.Boolean = Boolean;
      global.RegExp = RegExp;
      global.Map = Map;
      global.Set = Set;
      global.parseInt = parseInt;
      global.parseFloat = parseFloat;
      global.isNaN = isNaN;
      global.isFinite = isFinite;
      global.encodeURIComponent = encodeURIComponent;
      global.decodeURIComponent = decodeURIComponent;
    `);

    // Wrap code to capture return value
    const wrappedCode = `
      (function() {
        try {
          ${code}
        } catch (e) {
          return { __error: true, message: e.message, stack: e.stack };
        }
      })();
    `;

    // Execute
    const script = await isolate.compileScript(wrappedCode);
    const rawResult = await script.run(context, { timeout });

    // Get memory usage
    const heapStats = isolate.getHeapStatistics();

    // Process result
    result = {
      success: true,
      result: rawResult?.__error ? null : rawResult,
      error: rawResult?.__error ? rawResult.message : null,
      logs,
      executionTime: Date.now() - startTime,
      memoryUsed: heapStats.used_heap_size,
      memoryLimit: heapStats.heap_size_limit,
    };

    logger.info(
      {
        executionTime: result.executionTime,
        memoryUsed: result.memoryUsed,
        success: result.success,
      },
      "Code execution completed"
    );
  } catch (error) {
    result = {
      success: false,
      result: null,
      error: error.message,
      logs: [],
      executionTime: Date.now() - startTime,
      memoryUsed: 0,
      memoryLimit: 0,
    };

    logger.error({ error: error.message }, "Code execution failed");

    // Don't return problematic isolate to pool
    if (isolate && !isolate.isDisposed) {
      isolate.dispose();
      isolate = null;
    }
  } finally {
    // Return isolate to pool if still valid
    if (isolate) {
      returnIsolate(isolate);
    }
  }

  return result;
}

/**
 * Execute JSON parsing/validation in sandbox
 * @param {string} jsonString - JSON to parse
 * @param {object} schema - Optional Zod-like schema for validation
 * @returns {Promise<object>}
 */
async function executeJSON(jsonString, schema = null) {
  const code = `
    const data = JSON.parse(${JSON.stringify(jsonString)});
    data;
  `;

  const result = await executeCode({ code, language: "json", timeout: 1000 });

  if (result.success && schema) {
    try {
      const validated = schema.parse(result.result);
      return { ...result, result: validated };
    } catch (validationError) {
      return {
        ...result,
        success: false,
        error: `Validation failed: ${validationError.message}`,
      };
    }
  }

  return result;
}

/**
 * Analyze code for security issues (static analysis)
 * @param {string} code - Code to analyze
 * @param {string} language - Programming language
 * @returns {object}
 */
function analyzeCodeSecurity(code, language = "javascript") {
  const findings = [];
  const lines = code.split("\n");

  // JavaScript/Node.js patterns
  const dangerousPatterns = [
    {
      pattern: /eval\s*\(/gi,
      severity: "critical",
      message: "Use of eval() detected - potential code injection",
    },
    {
      pattern: /new\s+Function\s*\(/gi,
      severity: "high",
      message: "Dynamic function creation detected",
    },
    {
      pattern: /child_process/gi,
      severity: "critical",
      message: "Child process usage detected - potential command injection",
    },
    {
      pattern: /process\.exit/gi,
      severity: "medium",
      message: "Process exit call detected",
    },
    {
      pattern: /require\s*\(\s*[^'"]/gi,
      severity: "high",
      message: "Dynamic require detected",
    },
    {
      pattern: /\.innerHTML\s*=/gi,
      severity: "high",
      message: "Direct innerHTML assignment - potential XSS",
    },
    {
      pattern: /document\.write/gi,
      severity: "high",
      message: "document.write usage - potential XSS",
    },
    {
      pattern: /dangerouslySetInnerHTML/gi,
      severity: "medium",
      message: "React dangerouslySetInnerHTML usage",
    },
    {
      pattern: /exec\s*\(/gi,
      severity: "critical",
      message: "Shell exec detected - potential command injection",
    },
    {
      pattern: /spawn\s*\(/gi,
      severity: "high",
      message: "Process spawn detected",
    },
    {
      pattern: /__proto__/gi,
      severity: "critical",
      message: "Prototype pollution risk",
    },
    {
      pattern: /constructor\s*\[/gi,
      severity: "critical",
      message: "Constructor access - prototype pollution risk",
    },
    {
      pattern: /Buffer\s*\(\s*[^)]+\)/gi,
      severity: "medium",
      message: "Deprecated Buffer() constructor",
    },
    {
      pattern: /crypto\.createHash\s*\(\s*['"]md5/gi,
      severity: "medium",
      message: "MD5 hash usage - weak algorithm",
    },
    {
      pattern: /crypto\.createHash\s*\(\s*['"]sha1/gi,
      severity: "medium",
      message: "SHA1 hash usage - weak algorithm",
    },
    {
      pattern: /password\s*[=:]\s*['"][^'"]+['"]/gi,
      severity: "critical",
      message: "Hardcoded password detected",
    },
    {
      pattern: /api[_-]?key\s*[=:]\s*['"][^'"]+['"]/gi,
      severity: "critical",
      message: "Hardcoded API key detected",
    },
    {
      pattern: /secret\s*[=:]\s*['"][^'"]+['"]/gi,
      severity: "critical",
      message: "Hardcoded secret detected",
    },
    {
      pattern: /TODO|FIXME|HACK|XXX/gi,
      severity: "info",
      message: "Code comment marker found",
    },
  ];

  // SQL patterns
  if (
    language === "sql" ||
    code.toLowerCase().includes("select") ||
    code.toLowerCase().includes("insert")
  ) {
    dangerousPatterns.push(
      {
        pattern: /--\s*$/gm,
        severity: "medium",
        message: "SQL comment detected at end of line",
      },
      {
        pattern: /;\s*drop\s+table/gi,
        severity: "critical",
        message: "Potential SQL injection - DROP TABLE",
      },
      {
        pattern: /'\s*or\s+'?1'?\s*=\s*'?1/gi,
        severity: "critical",
        message: "Classic SQL injection pattern",
      },
      {
        pattern: /union\s+select/gi,
        severity: "high",
        message: "UNION SELECT - potential SQL injection",
      }
    );
  }

  // Analyze each line
  lines.forEach((line, index) => {
    dangerousPatterns.forEach(({ pattern, severity, message }) => {
      if (pattern.test(line)) {
        findings.push({
          line: index + 1,
          severity,
          message,
          code: line.trim().substring(0, 100),
        });
      }
      // Reset lastIndex for global patterns
      pattern.lastIndex = 0;
    });
  });

  // Calculate risk score
  const severityScores = { critical: 10, high: 7, medium: 4, low: 2, info: 1 };
  const riskScore = Math.min(
    100,
    findings.reduce((acc, f) => acc + severityScores[f.severity], 0)
  );

  return {
    language,
    linesAnalyzed: lines.length,
    findings,
    findingCount: findings.length,
    riskScore,
    riskLevel:
      riskScore >= 50
        ? "critical"
        : riskScore >= 30
        ? "high"
        : riskScore >= 15
        ? "medium"
        : riskScore > 0
        ? "low"
        : "safe",
  };
}

/**
 * Create a reusable sandbox context
 * @param {object} options - Sandbox options
 * @returns {object}
 */
async function createSandbox(options = {}) {
  const { memoryLimit = DEFAULT_MEMORY_LIMIT, preloadCode = "" } = options;

  const isolate = new ivm.Isolate({ memoryLimit });
  const context = await isolate.createContext();

  // Setup context
  const jail = context.global;
  await jail.set("global", jail.derefInto());

  // Preload code if provided
  if (preloadCode) {
    await context.eval(preloadCode);
  }

  return {
    isolate,
    context,

    async run(code, timeout = DEFAULT_TIMEOUT) {
      const script = await isolate.compileScript(code);
      return await script.run(context, { timeout });
    },

    async set(key, value) {
      await jail.set(key, new ivm.ExternalCopy(value).copyInto());
    },

    getStats() {
      return isolate.getHeapStatistics();
    },

    dispose() {
      if (!isolate.isDisposed) {
        isolate.dispose();
      }
    },
  };
}

/**
 * Cleanup all pooled isolates
 */
function cleanup() {
  while (isolatePool.length > 0) {
    const isolate = isolatePool.pop();
    if (!isolate.isDisposed) {
      isolate.dispose();
    }
  }
  logger.info("Isolate pool cleaned up");
}

// Cleanup on process exit
process.on("exit", cleanup);
process.on("SIGINT", () => {
  cleanup();
  process.exit(0);
});
process.on("SIGTERM", () => {
  cleanup();
  process.exit(0);
});

module.exports = {
  executeCode,
  executeJSON,
  analyzeCodeSecurity,
  createSandbox,
  cleanup,

  // Constants
  DEFAULT_MEMORY_LIMIT,
  DEFAULT_TIMEOUT,
  MAX_MEMORY_LIMIT,
  MAX_TIMEOUT,
};
