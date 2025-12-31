# VictoryKit Tech Stack Implementation

## Overview

This document outlines the complete technology stack implemented across the VictoryKit cybersecurity platform, covering all 50 security tools, shared services, and infrastructure.

---

## 📦 Package Summary by Category

### Phase 1: Core Infrastructure

| Package | Version | Purpose | Location |
|---------|---------|---------|----------|
| `express` | ^4.18.2 | Web framework | Backend |
| `mongoose` | ^8.0.0 | MongoDB ODM | Backend |
| `zod` | ^3.22.4 | Runtime validation (replaced joi) | Backend |
| `helmet` | ^7.1.0 | Security headers | Backend |
| `helmet-csp` | ^3.4.0 | Content Security Policy | Backend |
| `hpp` | ^0.2.3 | HTTP Parameter Pollution protection | Backend |
| `compression` | ^1.7.4 | Response compression | Backend |
| `bullmq` | ^5.1.0 | Job queue system | Backend |
| `ioredis` | ^5.3.2 | Redis client | Backend |
| `socket.io` | ^4.7.2 | Real-time communication | Backend |
| `multer` | ^1.4.5 | File upload handling | Backend |
| `fs-extra` | ^11.2.0 | Enhanced file operations | Backend |
| `pino` | ^8.17.0 | High-performance logging | Backend |
| `nodemailer` | ^6.9.7 | Email sending | Backend |
| `uuid` | ^9.0.1 | Unique ID generation | Backend |
| `cookie-parser` | ^1.4.6 | Cookie parsing | Backend |
| `express-session` | ^1.17.3 | Session management | Backend |

### Phase 2: AI/LLM Enhancement

| Package | Version | Purpose | Location |
|---------|---------|---------|----------|
| `openai` | ^4.24.0 | OpenAI API client | Backend |
| `@anthropic-ai/sdk` | ^0.10.0 | Anthropic Claude API | Backend |
| `@google/generative-ai` | ^0.2.0 | Google Gemini API | Backend |
| `langchain` | ^0.1.0 | LLM orchestration framework | Backend |
| `@langchain/core` | ^0.1.0 | Langchain core utilities | Backend |
| `@langchain/openai` | ^0.0.12 | OpenAI Langchain integration | Backend |
| `@langchain/anthropic` | ^0.0.9 | Anthropic Langchain integration | Backend |
| `@langchain/google-genai` | ^0.0.7 | Google Langchain integration | Backend |
| `ai` | ^2.2.30 | Vercel AI SDK | Backend + Frontend |
| `isolated-vm` | ^4.6.0 | Safe code execution sandbox | Backend |
| `@ai-sdk/openai` | ^0.0.12 | Vercel AI OpenAI | Frontend |
| `@ai-sdk/anthropic` | ^0.0.12 | Vercel AI Anthropic | Frontend |
| `@ai-sdk/google` | ^0.0.12 | Vercel AI Google | Frontend |

### Phase 3: Observability & Security

| Package | Version | Purpose | Location |
|---------|---------|---------|----------|
| `@opentelemetry/sdk-node` | ^0.48.0 | OpenTelemetry SDK | Backend |
| `@opentelemetry/auto-instrumentations-node` | ^0.41.0 | Auto-instrumentation | Backend |
| `@opentelemetry/exporter-trace-otlp-http` | ^0.48.0 | Trace exporter | Backend |
| `@opentelemetry/exporter-metrics-otlp-http` | ^0.48.0 | Metrics exporter | Backend |
| `@opentelemetry/semantic-conventions` | ^1.21.0 | Standard attributes | Backend |
| `prom-client` | ^15.1.0 | Prometheus metrics | Backend |
| `@sentry/node` | ^7.91.0 | Error tracking | Backend |
| `express-mongo-sanitize` | ^2.2.0 | NoSQL injection prevention | Backend |
| `xss-clean` | ^0.1.4 | XSS sanitization | Backend |

### Phase 4: Dev/Build Tooling

| Package | Version | Purpose | Location |
|---------|---------|---------|----------|
| `eslint` | ^8.55.0 | Code linting | Root |
| `@typescript-eslint/*` | ^6.13.0 | TypeScript ESLint | Root |
| `prettier` | ^3.1.0 | Code formatting | Root |
| `husky` | ^8.0.3 | Git hooks | Root |
| `lint-staged` | ^15.2.0 | Staged file linting | Root |
| `@commitlint/cli` | ^18.4.3 | Commit message linting | Root |
| `commitizen` | ^4.3.0 | Interactive commits | Root |
| `concurrently` | ^8.2.2 | Parallel script execution | Root |
| `eslint-plugin-security` | ^2.1.0 | Security linting rules | Root |

### Frontend Stack

| Package | Version | Purpose | Location |
|---------|---------|---------|----------|
| `react` | ^18.2.0 | UI framework | Frontend |
| `react-dom` | ^18.2.0 | React DOM | Frontend |
| `react-router-dom` | ^6.20.0 | Client-side routing | Frontend |
| `vite` | ^5.0.0 | Build tool | Frontend |
| `typescript` | ^5.3.0 | Type safety | Frontend |
| `tailwindcss` | ^3.3.6 | Utility CSS | Frontend |
| `lucide-react` | ^0.263.1 | Icon library | Frontend |

---

## 🏗️ Service Architecture

### Shared Services (`/backend/shared/`)

```
shared/
├── index.js              # Central export (60+ utilities)
├── config/
│   └── database.js       # MongoDB connection
├── middleware/
│   ├── auth.middleware.js
│   ├── errorHandler.middleware.js
│   ├── rateLimiter.middleware.js
│   ├── validation.middleware.js
│   └── security.middleware.js    # Phase 3
├── utils/
│   ├── apiError.js
│   ├── apiResponse.js
│   ├── logger.js         # Winston
│   ├── pinoLogger.js     # Pino (high-perf)
│   ├── validation.js     # Zod schemas
│   ├── queue.js          # BullMQ
│   ├── realtime.js       # Socket.IO
│   ├── fileHandler.js    # Multer + fs-extra
│   └── email.js          # Nodemailer
└── services/
    ├── aiProvider.js     # Multi-provider AI
    ├── langchainService.js # Agent orchestration
    ├── codeSandbox.js    # Safe code execution
    ├── tracing.js        # OpenTelemetry
    ├── metrics.js        # Prometheus
    └── errorTracking.js  # Sentry
```

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Root workspace config with scripts |
| `.eslintrc.js` | ESLint rules with security plugin |
| `.prettierrc` | Code formatting rules |
| `commitlint.config.js` | Commit message conventions |
| `ecosystem.config.js` | PM2 production deployment |
| `docker-compose.prod.yml` | Docker production stack |
| `.husky/pre-commit` | Pre-commit hook |
| `.husky/commit-msg` | Commit message validation |

---

## 📊 Observability Stack

### Distributed Tracing (OpenTelemetry → Jaeger)

```javascript
const { initializeTracing, withSecurityScanSpan } = require('@victorykit/shared');

initializeTracing({ serviceName: 'malwarehunter' });

// Trace security scans
const result = await withSecurityScanSpan('malware', { target: file.name }, async (span) => {
  return await scanFile(file);
});
```

### Metrics (Prometheus)

```javascript
const { initializeMetrics, recordSecurityScan, metricsHandler } = require('@victorykit/shared');

initializeMetrics({ serviceName: 'phishguard' });
app.get('/metrics', metricsHandler);

// Record scan metrics
recordSecurityScan({
  type: 'url',
  tool: 'phishguard',
  status: 'completed',
  duration: 1234,
  findings: [{ severity: 'high' }]
});
```

### Error Tracking (Sentry)

```javascript
const { initializeSentry, captureSecurityEvent, sentryErrorHandler } = require('@victorykit/shared');

initializeSentry({ dsn: process.env.SENTRY_DSN });

// Security event capture
captureSecurityEvent('brute_force_attempt', {
  ip: req.ip,
  attempts: 5,
  severity: 'medium'
});

// Express error handler (last middleware)
app.use(sentryErrorHandler());
```

---

## 🤖 AI Integration

### Multi-Provider Chat

```javascript
const { initializeAI, chat, streamChat } = require('@victorykit/shared');

initializeAI({
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
});

// Use any provider
const response = await chat({
  provider: 'anthropic',
  model: 'claude-3-opus-20240229',
  messages: [{ role: 'user', content: 'Analyze this malware sample...' }],
  temperature: 0.3,
});
```

### Langchain Security Agent

```javascript
const { createSecurityAgent, securityTools } = require('@victorykit/shared');

const agent = await createSecurityAgent({
  provider: 'openai',
  tools: [securityTools.urlScanner, securityTools.hashAnalyzer],
  systemPrompt: 'You are a threat analyst...',
  sessionId: 'user-123',
});

const result = await agent.invoke({
  input: 'Scan this URL for phishing: https://suspicious.example.com'
});
```

### Safe Code Execution

```javascript
const { executeCode, analyzeCodeSecurity } = require('@victorykit/shared');

// Static analysis
const analysis = analyzeCodeSecurity(userCode, 'javascript');
console.log(analysis.riskScore, analysis.findings);

// Safe execution
const result = await executeCode({
  code: userCode,
  memoryLimit: 128,
  timeout: 5000,
  globals: { input: userInput },
});
```

---

## 🔒 Security Middleware

```javascript
const {
  configureSecurityMiddleware,
  securityBundle,
  suspiciousActivityDetector,
  validateApiKey,
  ipFilter,
} = require('@victorykit/shared');

// All-in-one setup
configureSecurityMiddleware(app, {
  enableMongoSanitize: true,
  enableXSS: true,
  enableHPP: true,
  enableHelmet: true,
});

// Or use individual middleware
app.use(securityBundle());
app.use(suspiciousActivityDetector({
  onSuspicious: (req, findings) => alertSecurityTeam(findings)
}));
app.use('/api', validateApiKey({ validateFn: checkApiKey }));
```

---

## 🚀 Production Deployment

### PM2 (Node.js)

```bash
# Start all services
npm run start:prod

# Monitor
npm run monit

# Logs
npm run logs:prod
```

### Docker Compose

```bash
# Build and start
npm run docker:build
npm run docker:up

# View logs
npm run docker:logs

# Stop
npm run docker:down
```

---

## 📝 Git Workflow

### Commit Convention

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, security, api, tool
```

Examples:
```bash
git commit -m "feat(malwarehunter): add yara rule scanning"
git commit -m "security(shared): add request fingerprinting middleware"
git commit -m "fix(phishguard): handle unicode URLs correctly"
```

### Pre-commit Checks

Automatically runs on every commit:
1. ESLint with security plugin
2. Prettier formatting
3. TypeScript type checking

---

## 📈 Port Assignments

| Range | Service Type |
|-------|--------------|
| 3000-3099 | Frontend tools |
| 4000-4001 | Core services (Gateway, Auth) |
| 4002-4050 | Backend tool APIs |
| 9090 | Prometheus |
| 16686 | Jaeger UI |
| 3000 | Grafana |

---

## 🔗 Related Documentation

- [README.md](./README.md) - Project overview
- [docs/03-BACKEND-ARCHITECTURE.md](./docs/03-BACKEND-ARCHITECTURE.md) - Backend design
- [docs/10-BACKEND-DETAILED-IMPLEMENTATION.md](./docs/10-BACKEND-DETAILED-IMPLEMENTATION.md) - API specs
- [DEPLOY.md](./DEPLOY.md) - Deployment guide
