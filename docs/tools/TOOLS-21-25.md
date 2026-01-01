# VictoryKit Security Tools Documentation
## Tools 21-25: Web & API Security

---

## 📊 Overview Dashboard

| Tool | Name | Port | DB | Status | Priority |
|------|------|------|-----|--------|----------|
| 21 | WAFManager | 4021 | victorykit_wafmanager | 📝 Planned | P2 |
| 22 | APIGuard | 4022 | victorykit_apiguard | 📝 Planned | P2 |
| 23 | BotDefender | 4023 | victorykit_botdefender | 📝 Planned | P2 |
| 24 | DDoSShield | 4024 | victorykit_ddosshield | 📝 Planned | P2 |
| 25 | SSLMonitor | 4025 | victorykit_sslmonitor | 📝 Planned | P2 |

---

## 🛡️ Tool 21: WAFManager
### Web Application Firewall Management

#### Purpose
Centralized WAF management platform for configuring, monitoring, and optimizing web application firewall rules across multiple providers (AWS WAF, Cloudflare, Akamai).

#### Technology Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **ML Engine**: Python + Rule optimization
- **Integration**: AWS WAF, Cloudflare, Akamai

#### Directory Structure
```
backend/tools/21-wafmanager/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── wafController.js             # WAF instance management
│   │   │   ├── ruleController.js            # Rule management
│   │   │   ├── policyController.js          # Policy management
│   │   │   └── analyticsController.js       # Traffic analytics
│   │   ├── models/
│   │   │   ├── WAFInstance.js               # WAF instance
│   │   │   ├── Rule.js                      # WAF rule
│   │   │   ├── Policy.js                    # Security policy
│   │   │   └── Event.js                     # Security event
│   │   ├── services/
│   │   │   ├── awsWafService.js             # AWS WAF integration
│   │   │   ├── cloudflareService.js         # Cloudflare integration
│   │   │   ├── akamaiService.js             # Akamai integration
│   │   │   └── mlService.js                 # Rule optimization
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── rule_optimizer.py                # Rule optimization
│   │   ├── false_positive_detector.py       # FP detection
│   │   └── attack_pattern_learner.py        # Pattern learning
│   └── requirements.txt
└── README.md
```

#### Database Schema
```javascript
// WAFInstance Model
{
  userId: ObjectId,
  instanceId: String,
  name: String,
  provider: String,                          // 'aws', 'cloudflare', 'akamai', 'f5', 'imperva'
  configuration: {
    apiKey: String,                          // Encrypted
    region: String,
    resourceArn: String,                     // For AWS
    zoneId: String                           // For Cloudflare
  },
  protectedResources: [{
    type: String,                            // 'api_gateway', 'alb', 'cloudfront', 'domain'
    identifier: String,
    name: String
  }],
  mode: String,                              // 'detection', 'prevention', 'learning'
  status: String,                            // 'active', 'inactive', 'error'
  statistics: {
    totalRequests: Number,
    blockedRequests: Number,
    allowedRequests: Number,
    lastUpdated: Date
  },
  createdAt: Date,
  updatedAt: Date
}

// Rule Model
{
  userId: ObjectId,
  instanceId: ObjectId,
  ruleId: String,
  name: String,
  description: String,
  type: String,                              // 'managed', 'custom', 'rate_limit', 'geo_block', 'ip_set'
  category: String,                          // 'owasp', 'bot', 'sqli', 'xss', 'rce', 'lfi', 'custom'
  priority: Number,
  action: String,                            // 'block', 'allow', 'count', 'captcha', 'challenge'
  conditions: [{
    field: String,                           // 'uri', 'query_string', 'headers', 'body', 'method', 'ip'
    operator: String,                        // 'contains', 'exactly', 'starts_with', 'regex', 'ip_set'
    value: String,
    negated: Boolean,
    transforms: [String]                     // 'lowercase', 'url_decode', 'html_entity_decode'
  }],
  rateLimit: {
    enabled: Boolean,
    limit: Number,
    period: Number,                          // seconds
    aggregateKey: String                     // 'ip', 'header', 'cookie'
  },
  ipSet: [String],
  geoBlock: [String],                        // Country codes
  exceptions: [{
    type: String,
    value: String,
    reason: String
  }],
  enabled: Boolean,
  statistics: {
    hits: Number,
    blocks: Number,
    lastTriggered: Date
  },
  createdAt: Date,
  updatedAt: Date
}

// Policy Model
{
  userId: ObjectId,
  policyId: String,
  name: String,
  description: String,
  template: String,                          // 'owasp_top_10', 'api_protection', 'bot_mitigation', 'custom'
  rules: [ObjectId],
  defaultAction: String,
  logging: {
    enabled: Boolean,
    fullRequest: Boolean,
    sensitiveFields: [String]
  },
  customResponses: {
    block: {
      statusCode: Number,
      body: String,
      headers: Object
    }
  },
  scheduling: {
    enabled: Boolean,
    activeHours: Object
  },
  isActive: Boolean,
  instances: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}

// Event Model
{
  userId: ObjectId,
  instanceId: ObjectId,
  ruleId: ObjectId,
  eventId: String,
  timestamp: Date,
  request: {
    ip: String,
    country: String,
    method: String,
    uri: String,
    headers: Object,
    queryString: String,
    body: String                             // Truncated
  },
  matchedRules: [{
    ruleId: String,
    ruleName: String,
    action: String
  }],
  action: String,
  responseCode: Number,
  labels: [String],
  riskScore: Number,
  falsePositive: Boolean,
  reviewed: Boolean,
  createdAt: Date
}
```

#### API Endpoints
```
POST   /api/v1/wafmanager/instances                 # Add WAF instance
GET    /api/v1/wafmanager/instances                 # List instances
GET    /api/v1/wafmanager/instances/:id             # Get instance details
PUT    /api/v1/wafmanager/instances/:id             # Update instance
DELETE /api/v1/wafmanager/instances/:id             # Remove instance
POST   /api/v1/wafmanager/instances/:id/sync        # Sync with provider

POST   /api/v1/wafmanager/rules                     # Create rule
GET    /api/v1/wafmanager/rules                     # List rules
GET    /api/v1/wafmanager/rules/:id                 # Get rule details
PUT    /api/v1/wafmanager/rules/:id                 # Update rule
DELETE /api/v1/wafmanager/rules/:id                 # Delete rule
POST   /api/v1/wafmanager/rules/:id/deploy          # Deploy rule
POST   /api/v1/wafmanager/rules/optimize            # AI optimization

POST   /api/v1/wafmanager/policies                  # Create policy
GET    /api/v1/wafmanager/policies                  # List policies
PUT    /api/v1/wafmanager/policies/:id              # Update policy
DELETE /api/v1/wafmanager/policies/:id              # Delete policy
POST   /api/v1/wafmanager/policies/:id/apply        # Apply to instances

GET    /api/v1/wafmanager/events                    # List events
GET    /api/v1/wafmanager/events/:id                # Get event details
PATCH  /api/v1/wafmanager/events/:id                # Mark FP/reviewed
GET    /api/v1/wafmanager/events/analytics          # Event analytics

GET    /api/v1/wafmanager/dashboard                 # Dashboard
GET    /health                                       # Health check
```

#### Frontend Components
```
frontend/src/
├── pages/
│   └── tools/
│       └── wafmanager/
│           ├── WAFDashboard.tsx             # Main dashboard
│           ├── InstanceManager.tsx          # Instance management
│           ├── RuleEditor.tsx               # Rule builder
│           ├── PolicyManager.tsx            # Policy management
│           ├── EventViewer.tsx              # Security events
│           ├── Analytics.tsx                # Traffic analytics
│           └── Optimization.tsx             # Rule optimization
├── components/
│   └── wafmanager/
│       ├── ProviderBadge.tsx                # Provider indicator
│       ├── RuleBuilder.tsx                  # Visual rule builder
│       ├── ConditionRow.tsx                 # Condition editor
│       ├── TrafficChart.tsx                 # Request charts
│       ├── AttackMap.tsx                    # Attack geo map
│       ├── EventTable.tsx                   # Event list
│       └── RuleStatistics.tsx               # Rule metrics
└── hooks/
    └── useWAFManager.ts                     # API hooks
```

---

## 🔌 Tool 22: APIGuard
### API Security & Governance Platform

#### Purpose
Comprehensive API security platform for discovering, testing, and protecting APIs with schema validation, rate limiting, and attack detection.

#### Technology Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **ML Engine**: Python + API analysis
- **Integration**: OpenAPI, GraphQL

#### Directory Structure
```
backend/tools/22-apiguard/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── apiController.js             # API inventory
│   │   │   ├── securityController.js        # Security testing
│   │   │   ├── gatewayController.js         # Gateway policies
│   │   │   └── monitorController.js         # API monitoring
│   │   ├── models/
│   │   │   ├── APIEndpoint.js               # API endpoint
│   │   │   ├── SecurityTest.js              # Security test
│   │   │   ├── Policy.js                    # API policy
│   │   │   └── Anomaly.js                   # API anomaly
│   │   ├── services/
│   │   │   ├── discoveryService.js          # API discovery
│   │   │   ├── testingService.js            # Security testing
│   │   │   └── mlService.js                 # Anomaly detection
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── api_analyzer.py                  # API behavior analysis
│   │   ├── anomaly_detector.py              # Anomaly detection
│   │   └── schema_validator.py              # Schema validation
│   └── requirements.txt
└── README.md
```

#### Database Schema
```javascript
// APIEndpoint Model
{
  userId: ObjectId,
  apiId: String,
  name: String,
  description: String,
  environment: String,                       // 'development', 'staging', 'production'
  type: String,                              // 'rest', 'graphql', 'grpc', 'soap', 'websocket'
  baseUrl: String,
  version: String,
  authentication: {
    type: String,                            // 'none', 'api_key', 'oauth2', 'jwt', 'basic'
    location: String,                        // 'header', 'query', 'cookie'
    config: Object
  },
  endpoints: [{
    path: String,
    method: String,
    summary: String,
    parameters: [{
      name: String,
      in: String,                            // 'path', 'query', 'header', 'body'
      type: String,
      required: Boolean,
      sensitive: Boolean
    }],
    requestBody: Object,
    responses: Object,
    security: [String],
    rateLimit: Object
  }],
  specification: {
    format: String,                          // 'openapi_3', 'swagger_2', 'graphql'
    content: Object
  },
  dataClassification: {
    pii: Boolean,
    phi: Boolean,
    pci: Boolean,
    sensitiveFields: [String]
  },
  riskProfile: {
    score: Number,
    exposedSensitiveData: Boolean,
    authenticationIssues: [String],
    vulnerabilities: Number
  },
  owner: ObjectId,
  status: String,                            // 'active', 'deprecated', 'inactive'
  discoverySource: String,                   // 'manual', 'traffic', 'specification', 'agent'
  lastSeenAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// SecurityTest Model
{
  userId: ObjectId,
  apiId: ObjectId,
  testId: String,
  name: String,
  type: String,                              // 'owasp_api', 'custom', 'fuzzing', 'schema_validation'
  configuration: {
    endpoints: [String],
    testCases: [String],
    authentication: Object,
    maxRequests: Number
  },
  status: String,                            // 'pending', 'running', 'completed', 'failed'
  progress: Number,
  results: {
    totalTests: Number,
    passed: Number,
    failed: Number,
    warnings: Number,
    findings: [{
      severity: String,
      category: String,                      // 'bola', 'bfla', 'injection', 'mass_assignment', etc.
      endpoint: String,
      description: String,
      evidence: Object,
      remediation: String
    }]
  },
  startedAt: Date,
  completedAt: Date,
  createdAt: Date
}

// Policy Model
{
  userId: ObjectId,
  policyId: String,
  name: String,
  description: String,
  type: String,                              // 'rate_limit', 'schema_validation', 'authentication', 'authorization'
  scope: {
    apis: [ObjectId],
    endpoints: [String],
    environments: [String]
  },
  rules: [{
    name: String,
    condition: Object,
    action: String,
    parameters: Object
  }],
  rateLimiting: {
    enabled: Boolean,
    defaultLimit: Number,
    period: Number,
    quotas: [{
      tier: String,
      limit: Number
    }]
  },
  schemaValidation: {
    enabled: Boolean,
    mode: String,                            // 'warn', 'block'
    strictTypes: Boolean
  },
  enabled: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Anomaly Model
{
  userId: ObjectId,
  apiId: ObjectId,
  anomalyId: String,
  type: String,                              // 'traffic_spike', 'new_endpoint', 'schema_drift', 'auth_failure', 'unusual_pattern'
  severity: String,
  description: String,
  details: {
    endpoint: String,
    baseline: Object,
    current: Object,
    deviation: Number
  },
  source: {
    ip: String,
    clientId: String,
    userAgent: String
  },
  status: String,                            // 'new', 'investigating', 'resolved', 'false_positive'
  detectedAt: Date,
  resolvedAt: Date,
  createdAt: Date
}
```

#### API Endpoints
```
POST   /api/v1/apiguard/apis                        # Register API
GET    /api/v1/apiguard/apis                        # List APIs
GET    /api/v1/apiguard/apis/:id                    # Get API details
PUT    /api/v1/apiguard/apis/:id                    # Update API
DELETE /api/v1/apiguard/apis/:id                    # Delete API
POST   /api/v1/apiguard/apis/discover               # Discover APIs
POST   /api/v1/apiguard/apis/:id/import-spec        # Import OpenAPI spec

POST   /api/v1/apiguard/tests                       # Start security test
GET    /api/v1/apiguard/tests                       # List tests
GET    /api/v1/apiguard/tests/:id                   # Get test results
DELETE /api/v1/apiguard/tests/:id                   # Delete test

POST   /api/v1/apiguard/policies                    # Create policy
GET    /api/v1/apiguard/policies                    # List policies
PUT    /api/v1/apiguard/policies/:id                # Update policy
DELETE /api/v1/apiguard/policies/:id                # Delete policy
POST   /api/v1/apiguard/policies/:id/apply          # Apply policy

GET    /api/v1/apiguard/anomalies                   # List anomalies
GET    /api/v1/apiguard/anomalies/:id               # Get anomaly details
PATCH  /api/v1/apiguard/anomalies/:id               # Update anomaly status

GET    /api/v1/apiguard/dashboard                   # Dashboard
GET    /api/v1/apiguard/analytics                   # API analytics
GET    /health                                       # Health check
```

#### Frontend Components
```
frontend/src/
├── pages/
│   └── tools/
│       └── apiguard/
│           ├── APIDashboard.tsx             # Main dashboard
│           ├── APIInventory.tsx             # API list
│           ├── APIDetail.tsx                # API details
│           ├── SecurityTests.tsx            # Test management
│           ├── TestResults.tsx              # Test results
│           ├── PolicyManager.tsx            # Policy management
│           ├── AnomalyViewer.tsx            # Anomaly list
│           └── SchemaEditor.tsx             # OpenAPI editor
├── components/
│   └── apiguard/
│       ├── EndpointTree.tsx                 # Endpoint hierarchy
│       ├── SchemaViewer.tsx                 # Schema display
│       ├── TestRunner.tsx                   # Test execution
│       ├── FindingCard.tsx                  # Security finding
│       ├── TrafficGraph.tsx                 # API traffic
│       ├── AnomalyAlert.tsx                 # Anomaly alert
│       └── RateLimitConfig.tsx              # Rate limit setup
└── hooks/
    └── useAPIGuard.ts                       # API hooks
```

---

## 🤖 Tool 23: BotDefender
### Bot Detection & Mitigation Platform

#### Purpose
Advanced bot detection and mitigation using machine learning, behavioral analysis, and device fingerprinting to protect against credential stuffing, scraping, and fraud.

#### Technology Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **ML Engine**: Python + Behavioral ML
- **Integration**: CDN, WAF

#### Directory Structure
```
backend/tools/23-botdefender/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── detectionController.js       # Bot detection
│   │   │   ├── policyController.js          # Bot policies
│   │   │   ├── challengeController.js       # Challenge management
│   │   │   └── analyticsController.js       # Bot analytics
│   │   ├── models/
│   │   │   ├── BotSignature.js              # Bot signature
│   │   │   ├── Session.js                   # User session
│   │   │   ├── Challenge.js                 # Bot challenge
│   │   │   └── Policy.js                    # Bot policy
│   │   ├── services/
│   │   │   ├── detectionService.js          # Detection logic
│   │   │   ├── fingerprintService.js        # Device fingerprint
│   │   │   └── mlService.js                 # ML detection
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── bot_classifier.py                # Bot classification
│   │   ├── behavior_analyzer.py             # Behavioral analysis
│   │   └── fingerprint_matcher.py           # Fingerprint matching
│   └── requirements.txt
└── README.md
```

#### Database Schema
```javascript
// BotSignature Model
{
  signatureId: String,
  name: String,
  category: String,                          // 'good_bot', 'bad_bot', 'scraper', 'credential_stuffing', 'spam', 'click_fraud'
  indicators: {
    userAgents: [String],
    ipPatterns: [String],
    behaviorPatterns: [Object],
    fingerprints: [Object]
  },
  action: String,                            // 'allow', 'block', 'challenge', 'rate_limit', 'monitor'
  confidence: Number,
  source: String,                            // 'system', 'user', 'ml'
  hits: Number,
  lastSeen: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Session Model
{
  sessionId: String,
  fingerprint: {
    hash: String,
    browser: Object,
    device: Object,
    screen: Object,
    plugins: [String],
    fonts: [String],
    webgl: String,
    audio: String
  },
  identity: {
    ip: String,
    geo: Object,
    asn: Object,
    proxy: Boolean,
    vpn: Boolean,
    tor: Boolean
  },
  behavior: {
    mouseMovements: Number,
    keystrokes: Number,
    scrollEvents: Number,
    clickPatterns: [Object],
    pageViews: Number,
    sessionDuration: Number,
    requestRate: Number
  },
  classification: {
    isBot: Boolean,
    confidence: Number,
    category: String,
    signals: [String]
  },
  reputation: {
    score: Number,
    history: [Object]
  },
  challenges: [{
    type: String,
    result: String,
    timestamp: Date
  }],
  status: String,                            // 'trusted', 'suspicious', 'blocked', 'challenged'
  firstSeen: Date,
  lastSeen: Date,
  requestCount: Number
}

// Challenge Model
{
  challengeId: String,
  type: String,                              // 'captcha', 'javascript', 'proof_of_work', 'device_verification'
  configuration: {
    difficulty: String,
    timeout: Number,
    maxAttempts: Number
  },
  templates: {
    html: String,
    script: String
  },
  statistics: {
    issued: Number,
    passed: Number,
    failed: Number,
    abandoned: Number
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Policy Model
{
  userId: ObjectId,
  policyId: String,
  name: String,
  description: String,
  scope: {
    paths: [String],
    domains: [String],
    environments: [String]
  },
  rules: [{
    name: String,
    condition: {
      type: String,                          // 'bot_score', 'behavior', 'reputation', 'geo', 'rate'
      operator: String,
      value: Object
    },
    action: String,
    challengeType: String
  }],
  goodBots: {
    allowList: [String],                     // 'googlebot', 'bingbot', etc.
    verifyOwnership: Boolean
  },
  rateLimit: {
    enabled: Boolean,
    thresholds: [{
      score: Number,
      limit: Number,
      period: Number
    }]
  },
  enabled: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### API Endpoints
```
POST   /api/v1/botdefender/analyze                  # Analyze request
GET    /api/v1/botdefender/analyze/:sessionId       # Get session analysis

GET    /api/v1/botdefender/signatures               # List signatures
POST   /api/v1/botdefender/signatures               # Create signature
PUT    /api/v1/botdefender/signatures/:id           # Update signature
DELETE /api/v1/botdefender/signatures/:id           # Delete signature

GET    /api/v1/botdefender/sessions                 # List sessions
GET    /api/v1/botdefender/sessions/:id             # Get session details
PATCH  /api/v1/botdefender/sessions/:id             # Update session status
GET    /api/v1/botdefender/sessions/bots            # List detected bots

POST   /api/v1/botdefender/challenges               # Create challenge
GET    /api/v1/botdefender/challenges               # List challenges
PUT    /api/v1/botdefender/challenges/:id           # Update challenge
POST   /api/v1/botdefender/challenges/verify        # Verify challenge response

POST   /api/v1/botdefender/policies                 # Create policy
GET    /api/v1/botdefender/policies                 # List policies
PUT    /api/v1/botdefender/policies/:id             # Update policy
DELETE /api/v1/botdefender/policies/:id             # Delete policy

GET    /api/v1/botdefender/dashboard                # Dashboard
GET    /api/v1/botdefender/analytics                # Bot analytics
GET    /health                                       # Health check
```

#### Frontend Components
```
frontend/src/
├── pages/
│   └── tools/
│       └── botdefender/
│           ├── BotDashboard.tsx             # Main dashboard
│           ├── SessionViewer.tsx            # Session analysis
│           ├── SignatureManager.tsx         # Signature management
│           ├── ChallengeConfig.tsx          # Challenge setup
│           ├── PolicyEditor.tsx             # Policy management
│           ├── BotTraffic.tsx               # Traffic analysis
│           └── Reputation.tsx               # Reputation scores
├── components/
│   └── botdefender/
│       ├── BotScoreGauge.tsx                # Bot score display
│       ├── FingerprintViewer.tsx            # Fingerprint details
│       ├── BehaviorChart.tsx                # Behavior patterns
│       ├── SessionTimeline.tsx              # Session events
│       ├── ChallengePreview.tsx             # Challenge preview
│       ├── BotTypeChart.tsx                 # Bot type distribution
│       └── GeoBlockMap.tsx                  # Geo distribution
└── hooks/
    └── useBotDefender.ts                    # API hooks
```

---

## 🌊 Tool 24: DDoSShield
### DDoS Protection & Mitigation Platform

#### Purpose
Real-time DDoS attack detection and mitigation with traffic analysis, automatic filtering, and integration with upstream providers for volumetric attack protection.

#### Technology Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB + TimescaleDB
- **ML Engine**: Python + Anomaly detection
- **Integration**: Cloudflare, AWS Shield, Akamai

#### Directory Structure
```
backend/tools/24-ddosshield/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── protectionController.js      # Protection management
│   │   │   ├── attackController.js          # Attack management
│   │   │   ├── mitigationController.js      # Mitigation actions
│   │   │   └── analyticsController.js       # Traffic analytics
│   │   ├── models/
│   │   │   ├── ProtectedResource.js         # Protected resource
│   │   │   ├── Attack.js                    # DDoS attack
│   │   │   ├── MitigationRule.js            # Mitigation rule
│   │   │   └── TrafficBaseline.js           # Traffic baseline
│   │   ├── services/
│   │   │   ├── detectionService.js          # Attack detection
│   │   │   ├── mitigationService.js         # Mitigation logic
│   │   │   └── mlService.js                 # Anomaly detection
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── traffic_analyzer.py              # Traffic analysis
│   │   ├── attack_classifier.py             # Attack classification
│   │   └── baseline_learner.py              # Baseline learning
│   └── requirements.txt
└── README.md
```

#### Database Schema
```javascript
// ProtectedResource Model
{
  userId: ObjectId,
  resourceId: String,
  name: String,
  type: String,                              // 'domain', 'ip', 'network', 'application'
  identifier: String,                        // Domain, IP, or CIDR
  provider: {
    name: String,                            // 'cloudflare', 'aws_shield', 'akamai', 'self'
    config: Object
  },
  baseline: {
    normalTraffic: Number,                   // requests/second
    peakTraffic: Number,
    patterns: [Object],
    lastCalculated: Date
  },
  thresholds: {
    warning: Number,
    critical: Number,
    autoMitigation: Number
  },
  protectionLevel: String,                   // 'standard', 'enhanced', 'always_on'
  status: String,                            // 'healthy', 'under_attack', 'mitigating', 'offline'
  statistics: {
    requestsBlocked: Number,
    attacksDetected: Number,
    uptime: Number
  },
  createdAt: Date,
  updatedAt: Date
}

// Attack Model
{
  userId: ObjectId,
  resourceId: ObjectId,
  attackId: String,
  type: String,                              // 'volumetric', 'protocol', 'application', 'hybrid'
  subtype: String,                           // 'syn_flood', 'udp_flood', 'http_flood', 'slowloris', 'amplification'
  severity: String,
  status: String,                            // 'detected', 'mitigating', 'mitigated', 'ended'
  metrics: {
    peakBandwidth: Number,                   // Gbps
    peakPps: Number,                         // Packets per second
    peakRps: Number,                         // Requests per second
    duration: Number,                        // seconds
    totalPackets: Number,
    totalBytes: Number
  },
  sources: {
    uniqueIps: Number,
    topIps: [{
      ip: String,
      country: String,
      traffic: Number
    }],
    countries: [Object],
    asns: [Object]
  },
  vectors: [{
    type: String,
    percentage: Number,
    details: Object
  }],
  mitigation: {
    automatic: Boolean,
    rulesApplied: [ObjectId],
    trafficDropped: Number,
    effectiveness: Number
  },
  timeline: [{
    timestamp: Date,
    event: String,
    details: Object
  }],
  startedAt: Date,
  detectedAt: Date,
  mitigatedAt: Date,
  endedAt: Date,
  createdAt: Date
}

// MitigationRule Model
{
  userId: ObjectId,
  ruleId: String,
  name: String,
  type: String,                              // 'rate_limit', 'geo_block', 'ip_block', 'challenge', 'null_route'
  trigger: {
    condition: String,
    threshold: Object
  },
  action: {
    type: String,
    parameters: Object,
    duration: Number
  },
  targets: {
    resources: [ObjectId],
    all: Boolean
  },
  priority: Number,
  automatic: Boolean,
  enabled: Boolean,
  statistics: {
    triggered: Number,
    trafficBlocked: Number,
    lastTriggered: Date
  },
  createdAt: Date,
  updatedAt: Date
}

// TrafficBaseline Model
{
  resourceId: ObjectId,
  period: String,                            // 'hourly', 'daily', 'weekly'
  timestamp: Date,
  metrics: {
    avgBandwidth: Number,
    avgPps: Number,
    avgRps: Number,
    p95Bandwidth: Number,
    p95Pps: Number,
    p95Rps: Number
  },
  distribution: {
    byCountry: Object,
    byProtocol: Object,
    byPort: Object
  },
  patterns: {
    hourOfDay: [Number],
    dayOfWeek: [Number]
  },
  createdAt: Date
}
```

#### API Endpoints
```
POST   /api/v1/ddosshield/resources                 # Add protected resource
GET    /api/v1/ddosshield/resources                 # List resources
GET    /api/v1/ddosshield/resources/:id             # Get resource details
PUT    /api/v1/ddosshield/resources/:id             # Update resource
DELETE /api/v1/ddosshield/resources/:id             # Remove resource
GET    /api/v1/ddosshield/resources/:id/traffic     # Get traffic data
POST   /api/v1/ddosshield/resources/:id/baseline    # Calculate baseline

GET    /api/v1/ddosshield/attacks                   # List attacks
GET    /api/v1/ddosshield/attacks/:id               # Get attack details
GET    /api/v1/ddosshield/attacks/:id/timeline      # Get attack timeline
GET    /api/v1/ddosshield/attacks/active            # Get active attacks

POST   /api/v1/ddosshield/rules                     # Create mitigation rule
GET    /api/v1/ddosshield/rules                     # List rules
PUT    /api/v1/ddosshield/rules/:id                 # Update rule
DELETE /api/v1/ddosshield/rules/:id                 # Delete rule
POST   /api/v1/ddosshield/rules/:id/activate        # Activate rule

GET    /api/v1/ddosshield/dashboard                 # Dashboard
GET    /api/v1/ddosshield/analytics                 # Traffic analytics
POST   /api/v1/ddosshield/simulate                  # Simulate attack (testing)
GET    /health                                       # Health check
```

#### Frontend Components
```
frontend/src/
├── pages/
│   └── tools/
│       └── ddosshield/
│           ├── DDoSDashboard.tsx            # Main dashboard
│           ├── ResourceManager.tsx          # Resource management
│           ├── AttackCenter.tsx             # Attack monitoring
│           ├── AttackDetail.tsx             # Attack details
│           ├── MitigationRules.tsx          # Rule management
│           ├── TrafficAnalytics.tsx         # Traffic analysis
│           └── BaselineConfig.tsx           # Baseline setup
├── components/
│   └── ddosshield/
│       ├── TrafficGauge.tsx                 # Real-time traffic
│       ├── AttackTimeline.tsx               # Attack timeline
│       ├── SourceMap.tsx                    # Attack source map
│       ├── VectorChart.tsx                  # Attack vectors
│       ├── BandwidthChart.tsx               # Bandwidth graph
│       ├── MitigationStatus.tsx             # Mitigation status
│       └── AlertBanner.tsx                  # Attack alert
└── hooks/
    └── useDDoSShield.ts                     # API hooks
```

---

## 🔒 Tool 25: SSLMonitor
### SSL/TLS Certificate Monitoring

#### Purpose
Comprehensive SSL/TLS monitoring platform for tracking certificate expiration, configuration security, and compliance across all domains and services.

#### Technology Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **ML Engine**: Python + Certificate analysis
- **Scanner**: OpenSSL, SSL Labs API

#### Directory Structure
```
backend/tools/25-sslmonitor/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── domainController.js          # Domain management
│   │   │   ├── certificateController.js     # Certificate management
│   │   │   ├── scanController.js            # SSL scanning
│   │   │   └── alertController.js           # Expiry alerts
│   │   ├── models/
│   │   │   ├── Domain.js                    # Monitored domain
│   │   │   ├── Certificate.js               # SSL certificate
│   │   │   ├── ScanResult.js                # Scan result
│   │   │   └── Alert.js                     # Expiry alert
│   │   ├── services/
│   │   │   ├── sslService.js                # SSL operations
│   │   │   ├── scanService.js               # Scanning logic
│   │   │   └── mlService.js                 # Certificate analysis
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── cert_analyzer.py                 # Certificate analysis
│   │   ├── vulnerability_checker.py         # Vulnerability detection
│   │   └── compliance_checker.py            # Compliance checking
│   └── requirements.txt
└── README.md
```

#### Database Schema
```javascript
// Domain Model
{
  userId: ObjectId,
  domainId: String,
  hostname: String,
  port: Number,
  protocol: String,                          // 'https', 'smtps', 'imaps', 'ldaps'
  environment: String,
  tags: [String],
  monitoring: {
    enabled: Boolean,
    frequency: String,                       // 'hourly', 'daily', 'weekly'
    lastScanned: Date,
    nextScan: Date
  },
  alerts: {
    expiryThresholds: [Number],              // Days before expiry
    recipients: [String],
    channels: [String]                       // 'email', 'slack', 'webhook'
  },
  currentCertificate: ObjectId,
  status: String,                            // 'valid', 'expiring_soon', 'expired', 'invalid', 'error'
  grade: String,                             // 'A+', 'A', 'B', 'C', 'D', 'F'
  createdAt: Date,
  updatedAt: Date
}

// Certificate Model
{
  userId: ObjectId,
  domainId: ObjectId,
  certId: String,
  subject: {
    commonName: String,
    organization: String,
    country: String
  },
  issuer: {
    commonName: String,
    organization: String,
    country: String,
    isTrusted: Boolean
  },
  serialNumber: String,
  fingerprints: {
    sha1: String,
    sha256: String
  },
  validity: {
    notBefore: Date,
    notAfter: Date,
    daysRemaining: Number,
    isValid: Boolean
  },
  san: [String],                             // Subject Alternative Names
  keyInfo: {
    algorithm: String,                       // 'RSA', 'ECDSA', 'EdDSA'
    size: Number,
    strength: String
  },
  signatureAlgorithm: String,
  chain: [{
    subject: String,
    issuer: String,
    validTo: Date,
    isTrusted: Boolean
  }],
  transparency: {
    inCTLogs: Boolean,
    logs: [String]
  },
  ocsp: {
    status: String,                          // 'good', 'revoked', 'unknown'
    nextUpdate: Date
  },
  revocation: {
    isRevoked: Boolean,
    reason: String,
    date: Date
  },
  raw: String,                               // PEM format
  discoveredAt: Date,
  createdAt: Date
}

// ScanResult Model
{
  userId: ObjectId,
  domainId: ObjectId,
  scanId: String,
  timestamp: Date,
  connection: {
    ip: String,
    port: Number,
    responseTime: Number,
    protocol: String
  },
  tlsVersion: {
    supported: [String],                     // 'TLSv1.0', 'TLSv1.1', 'TLSv1.2', 'TLSv1.3'
    preferred: String
  },
  cipherSuites: [{
    name: String,
    strength: String,
    pfs: Boolean,
    deprecated: Boolean
  }],
  vulnerabilities: [{
    name: String,                            // 'heartbleed', 'poodle', 'beast', 'logjam', 'freak', 'robot'
    severity: String,
    affected: Boolean,
    details: String
  }],
  configuration: {
    hsts: {
      enabled: Boolean,
      maxAge: Number,
      includeSubdomains: Boolean,
      preload: Boolean
    },
    ocspStapling: Boolean,
    sctEnabled: Boolean,
    clientAuth: Boolean
  },
  compliance: {
    pciDss: Boolean,
    hipaa: Boolean,
    nistGuidelines: Boolean,
    issues: [String]
  },
  grade: String,
  score: Number,
  recommendations: [String],
  createdAt: Date
}

// Alert Model
{
  userId: ObjectId,
  domainId: ObjectId,
  alertId: String,
  type: String,                              // 'expiry', 'vulnerability', 'configuration', 'revocation'
  severity: String,
  message: String,
  details: Object,
  daysToExpiry: Number,
  status: String,                            // 'active', 'acknowledged', 'resolved', 'snoozed'
  notifications: [{
    channel: String,
    sentAt: Date,
    status: String
  }],
  acknowledgedBy: ObjectId,
  acknowledgedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### API Endpoints
```
POST   /api/v1/sslmonitor/domains                   # Add domain
GET    /api/v1/sslmonitor/domains                   # List domains
GET    /api/v1/sslmonitor/domains/:id               # Get domain details
PUT    /api/v1/sslmonitor/domains/:id               # Update domain
DELETE /api/v1/sslmonitor/domains/:id               # Remove domain
POST   /api/v1/sslmonitor/domains/:id/scan          # Trigger scan
GET    /api/v1/sslmonitor/domains/expiring          # Expiring certs

GET    /api/v1/sslmonitor/certificates              # List certificates
GET    /api/v1/sslmonitor/certificates/:id          # Get certificate
POST   /api/v1/sslmonitor/certificates/decode       # Decode certificate
GET    /api/v1/sslmonitor/certificates/:id/chain    # Get certificate chain

GET    /api/v1/sslmonitor/scans                     # List scan results
GET    /api/v1/sslmonitor/scans/:id                 # Get scan details

GET    /api/v1/sslmonitor/alerts                    # List alerts
PATCH  /api/v1/sslmonitor/alerts/:id                # Update alert
POST   /api/v1/sslmonitor/alerts/:id/acknowledge    # Acknowledge alert
POST   /api/v1/sslmonitor/alerts/:id/snooze         # Snooze alert

GET    /api/v1/sslmonitor/dashboard                 # Dashboard
GET    /api/v1/sslmonitor/report                    # Generate report
GET    /health                                       # Health check
```

#### Frontend Components
```
frontend/src/
├── pages/
│   └── tools/
│       └── sslmonitor/
│           ├── SSLDashboard.tsx             # Main dashboard
│           ├── DomainList.tsx               # Domain list
│           ├── DomainDetail.tsx             # Domain details
│           ├── CertificateViewer.tsx        # Certificate details
│           ├── ScanResults.tsx              # Scan results
│           ├── AlertCenter.tsx              # Alert management
│           └── ExpiryCalendar.tsx           # Expiry calendar
├── components/
│   └── sslmonitor/
│       ├── GradeBadge.tsx                   # SSL grade
│       ├── ExpiryCountdown.tsx              # Days to expiry
│       ├── CertChainViewer.tsx              # Certificate chain
│       ├── TLSVersionBadge.tsx              # TLS version
│       ├── VulnerabilityList.tsx            # Vulnerabilities
│       ├── CipherTable.tsx                  # Cipher suites
│       └── ComplianceCheck.tsx              # Compliance status
└── hooks/
    └── useSSLMonitor.ts                     # API hooks
```

---

## 🔗 Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │WAF      │ │API      │ │Bot      │ │DDoS     │ │SSL      │   │
│  │Manager  │ │Guard    │ │Defender │ │Shield   │ │Monitor  │   │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘   │
└───────┼───────────┼───────────┼───────────┼───────────┼─────────┘
        │           │           │           │           │
        ▼           ▼           ▼           ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NGINX REVERSE PROXY                          │
│                    (api.maula.ai:443)                           │
└───────┬───────────┬───────────┬───────────┬───────────┬─────────┘
        │           │           │           │           │
        ▼           ▼           ▼           ▼           ▼
   ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
   │ :4021  │  │ :4022  │  │ :4023  │  │ :4024  │  │ :4025  │
   │WAFMgr  │  │APIGrd  │  │BotDef  │  │DDoS    │  │SSL     │
   └────┬───┘  └────┬───┘  └────┬───┘  └────┬───┘  └────┬───┘
        │           │           │           │           │
        ▼           ▼           ▼           ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MONGODB ATLAS CLUSTER                        │
└─────────────────────────────────────────────────────────────────┘
```

---

*Documentation generated: December 29, 2025*
*VictoryKit Phase 4 - Backend API Implementation*
