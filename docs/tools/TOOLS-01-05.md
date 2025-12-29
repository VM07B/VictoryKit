# VictoryKit Security Tools Documentation

## Tools 01-05: Core Security Foundation

---

## 📊 Overview Dashboard

| Tool | Name          | Port | DB                       | Status      | Priority |
| ---- | ------------- | ---- | ------------------------ | ----------- | -------- |
| 01   | FraudGuard    | 4001 | victorykit_fraudguard    | ✅ Complete | P0       |
| 02   | IntelliScout  | 4002 | victorykit_intelliscout  | ✅ Complete | P0       |
| 03   | ThreatRadar   | 4003 | victorykit_threatradar   | ✅ Complete | P0       |
| 04   | MalwareHunter | 4004 | victorykit_malwarehunter | 🔄 Deployed | P0       |
| 05   | PhishGuard    | 4005 | victorykit_phishguard    | 🔄 Deployed | P0       |

---

## 🛡️ Tool 01: FraudGuard

### AI-Powered Fraud Detection System

#### Purpose

Real-time transaction monitoring and fraud detection using machine learning models to identify suspicious patterns, anomalies, and potential financial fraud.

#### Technology Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB
- **ML Engine**: Python + TensorFlow
- **Queue**: Redis (optional)

#### Directory Structure

```
backend/tools/01-fraudguard/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── transaction.controller.js    # Transaction CRUD & analysis
│   │   │   ├── alert.controller.js          # Fraud alerts management
│   │   │   └── report.controller.js         # Reporting & analytics
│   │   ├── models/
│   │   │   ├── Transaction.model.js         # Transaction schema
│   │   │   ├── Alert.model.js               # Fraud alert schema
│   │   │   └── Report.model.js              # Report schema
│   │   ├── services/
│   │   │   ├── fraud.service.js             # Fraud detection logic
│   │   │   └── ml.service.js                # ML model integration
│   │   ├── routes/
│   │   │   └── index.js                     # API routes
│   │   └── server.js                        # Express server
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── fraud_detector.py                # Main fraud detection model
│   │   └── anomaly_detector.py              # Anomaly detection
│   ├── training/
│   │   └── train_model.py                   # Model training scripts
│   └── requirements.txt
└── README.md
```

#### Database Schema

```javascript
// Transaction Model
{
  transactionId: String,           // Unique transaction ID
  userId: ObjectId,                // Reference to user
  amount: Number,                  // Transaction amount
  currency: String,                // Currency code (USD, EUR, etc.)
  type: String,                    // 'credit', 'debit', 'transfer'
  merchant: {
    id: String,
    name: String,
    category: String,
    country: String
  },
  location: {
    ip: String,
    country: String,
    city: String,
    coordinates: [Number]
  },
  device: {
    fingerprint: String,
    type: String,
    os: String
  },
  riskScore: Number,               // 0-100 risk assessment
  isFraudulent: Boolean,           // Fraud flag
  status: String,                  // 'pending', 'approved', 'blocked', 'review'
  mlPrediction: {
    score: Number,
    confidence: Number,
    model: String
  },
  createdAt: Date,
  updatedAt: Date
}

// Alert Model
{
  alertId: String,
  transactionId: ObjectId,
  userId: ObjectId,
  severity: String,                // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  type: String,                    // 'velocity', 'amount', 'location', 'pattern'
  description: String,
  status: String,                  // 'open', 'investigating', 'resolved', 'dismissed'
  assignedTo: ObjectId,
  resolution: String,
  createdAt: Date,
  resolvedAt: Date
}
```

#### API Endpoints

```
POST   /api/v1/fraudguard/transactions           # Submit transaction for analysis
GET    /api/v1/fraudguard/transactions           # List transactions
GET    /api/v1/fraudguard/transactions/:id       # Get transaction details
POST   /api/v1/fraudguard/transactions/batch     # Batch transaction analysis

GET    /api/v1/fraudguard/alerts                 # List fraud alerts
GET    /api/v1/fraudguard/alerts/:id             # Get alert details
PATCH  /api/v1/fraudguard/alerts/:id             # Update alert status
POST   /api/v1/fraudguard/alerts/:id/resolve     # Resolve alert

POST   /api/v1/fraudguard/reports/generate       # Generate fraud report
GET    /api/v1/fraudguard/reports                # List reports
GET    /api/v1/fraudguard/reports/:id            # Get report details
GET    /api/v1/fraudguard/statistics             # Get fraud statistics

GET    /health                                    # Health check
```

#### Frontend Components

```
frontend/src/
├── pages/
│   └── tools/
│       └── fraudguard/
│           ├── FraudGuardDashboard.tsx      # Main dashboard
│           ├── TransactionList.tsx          # Transaction list view
│           ├── TransactionDetail.tsx        # Single transaction
│           ├── AlertsPanel.tsx              # Alerts management
│           ├── FraudAnalytics.tsx           # Analytics & charts
│           └── RulesConfig.tsx              # Detection rules config
├── components/
│   └── fraudguard/
│       ├── RiskScoreGauge.tsx               # Risk score visualization
│       ├── TransactionMap.tsx               # Geographic visualization
│       ├── FraudTrendChart.tsx              # Trend analysis
│       └── AlertCard.tsx                    # Alert display card
└── hooks/
    └── useFraudGuard.ts                     # FraudGuard API hooks
```

---

## 🔍 Tool 02: IntelliScout

### Threat Intelligence Platform

#### Purpose

Aggregate, analyze, and correlate threat intelligence from multiple sources to provide actionable security insights and indicators of compromise (IOCs).

#### Technology Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB + Elasticsearch
- **ML Engine**: Python + scikit-learn
- **Data Sources**: OSINT feeds, commercial feeds

#### Directory Structure

```
backend/tools/02-intelliscout/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── threatIntel.controller.js    # Threat intel CRUD
│   │   │   ├── analysis.controller.js       # Analysis operations
│   │   │   ├── ioc.controller.js            # IOC management
│   │   │   └── report.controller.js         # Reports
│   │   ├── models/
│   │   │   ├── ThreatIntel.model.js         # Threat intel schema
│   │   │   ├── IOC.model.js                 # Indicator of compromise
│   │   │   ├── Feed.model.js                # Feed source schema
│   │   │   └── Report.model.js              # Report schema
│   │   ├── services/
│   │   │   ├── intel.service.js             # Intel processing
│   │   │   ├── feed.service.js              # Feed aggregation
│   │   │   ├── correlation.service.js       # Data correlation
│   │   │   └── ml.service.js                # ML predictions
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── threat_classifier.py             # Threat classification
│   │   └── pattern_detector.py              # Pattern recognition
│   └── requirements.txt
└── README.md
```

#### Database Schema

```javascript
// ThreatIntel Model
{
  intelId: String,
  type: String,                    // 'malware', 'apt', 'campaign', 'vulnerability'
  name: String,
  description: String,
  severity: String,                // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  confidence: Number,              // 0-100
  source: {
    name: String,
    reliability: String,           // 'A' to 'F'
    url: String
  },
  iocs: [{
    type: String,                  // 'ip', 'domain', 'hash', 'url', 'email'
    value: String,
    context: String
  }],
  ttps: [{                         // Tactics, Techniques, Procedures
    tactic: String,
    technique: String,
    mitreId: String
  }],
  tags: [String],
  relatedThreats: [ObjectId],
  firstSeen: Date,
  lastSeen: Date,
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// IOC Model
{
  iocId: String,
  type: String,                    // 'ipv4', 'ipv6', 'domain', 'url', 'md5', 'sha256', 'email'
  value: String,
  threat: ObjectId,                // Reference to ThreatIntel
  confidence: Number,
  status: String,                  // 'active', 'expired', 'false_positive'
  sightings: Number,
  lastSeen: Date,
  enrichment: {
    geoip: Object,
    whois: Object,
    dns: Object,
    virustotal: Object
  },
  createdAt: Date
}
```

#### API Endpoints

```
POST   /api/v1/intelliscout/threats              # Create threat intel
GET    /api/v1/intelliscout/threats              # List threats
GET    /api/v1/intelliscout/threats/:id          # Get threat details
PUT    /api/v1/intelliscout/threats/:id          # Update threat
DELETE /api/v1/intelliscout/threats/:id          # Delete threat

POST   /api/v1/intelliscout/iocs                 # Add IOC
GET    /api/v1/intelliscout/iocs                 # List IOCs
GET    /api/v1/intelliscout/iocs/search          # Search IOCs
POST   /api/v1/intelliscout/iocs/lookup          # Bulk IOC lookup
POST   /api/v1/intelliscout/iocs/enrich          # Enrich IOC data

POST   /api/v1/intelliscout/analyses             # Create analysis
GET    /api/v1/intelliscout/analyses             # List analyses
GET    /api/v1/intelliscout/analyses/:id         # Get analysis details

GET    /api/v1/intelliscout/feeds                # List feed sources
POST   /api/v1/intelliscout/feeds/sync           # Sync feeds

GET    /health                                    # Health check
```

#### Frontend Components

```
frontend/src/
├── pages/
│   └── tools/
│       └── intelliscout/
│           ├── IntelDashboard.tsx           # Main dashboard
│           ├── ThreatFeed.tsx               # Threat feed view
│           ├── IOCSearch.tsx                # IOC search & lookup
│           ├── ThreatDetail.tsx             # Threat details
│           ├── AnalysisView.tsx             # Analysis results
│           └── FeedManager.tsx              # Feed source management
├── components/
│   └── intelliscout/
│       ├── ThreatCard.tsx                   # Threat summary card
│       ├── IOCTable.tsx                     # IOC data table
│       ├── TTPMatrix.tsx                    # MITRE ATT&CK matrix
│       ├── ThreatTimeline.tsx               # Threat timeline
│       └── CorrelationGraph.tsx             # Threat correlation viz
└── hooks/
    └── useIntelliScout.ts                   # API hooks
```

---

## 🎯 Tool 03: ThreatRadar

### Advanced Threat Detection System

#### Purpose

Real-time network and endpoint monitoring with AI-powered threat detection, behavioral analysis, and automated response capabilities.

#### Technology Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB + InfluxDB (time-series)
- **ML Engine**: Python + PyTorch
- **Streaming**: Apache Kafka (optional)

#### Directory Structure

```
backend/tools/03-threatradar/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── threat.controller.js         # Threat management
│   │   │   ├── detection.controller.js      # Detection events
│   │   │   ├── response.controller.js       # Automated responses
│   │   │   └── report.controller.js         # Reports
│   │   ├── models/
│   │   │   ├── Threat.model.js              # Detected threat
│   │   │   ├── Detection.model.js           # Detection event
│   │   │   ├── Rule.model.js                # Detection rules
│   │   │   └── Response.model.js            # Response actions
│   │   ├── services/
│   │   │   ├── detection.service.js         # Detection engine
│   │   │   ├── correlation.service.js       # Event correlation
│   │   │   ├── response.service.js          # Response automation
│   │   │   └── ml.service.js                # ML integration
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── threat_detector.py               # Real-time detection
│   │   ├── behavior_analyzer.py             # Behavioral analysis
│   │   └── anomaly_detector.py              # Anomaly detection
│   └── requirements.txt
└── README.md
```

#### Database Schema

```javascript
// Detection Model
{
  detectionId: String,
  type: String,                    // 'malware', 'intrusion', 'anomaly', 'policy_violation'
  severity: String,                // 'INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  source: {
    type: String,                  // 'network', 'endpoint', 'cloud', 'email'
    ip: String,
    hostname: String,
    asset: ObjectId
  },
  destination: {
    ip: String,
    port: Number,
    hostname: String
  },
  payload: {
    protocol: String,
    bytes: Number,
    packetCount: Number,
    rawData: String                // Base64 encoded sample
  },
  signature: {
    id: String,
    name: String,
    category: String
  },
  mlAnalysis: {
    score: Number,
    confidence: Number,
    model: String,
    features: Object
  },
  status: String,                  // 'new', 'investigating', 'confirmed', 'false_positive', 'resolved'
  assignedTo: ObjectId,
  responseActions: [{
    action: String,
    status: String,
    executedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}

// Rule Model
{
  ruleId: String,
  name: String,
  description: String,
  category: String,
  severity: String,
  enabled: Boolean,
  conditions: [{
    field: String,
    operator: String,
    value: Mixed
  }],
  actions: [{
    type: String,                  // 'alert', 'block', 'isolate', 'notify'
    config: Object
  }],
  threshold: {
    count: Number,
    timeWindow: Number             // seconds
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### API Endpoints

```
GET    /api/v1/threatradar/detections            # List detections
GET    /api/v1/threatradar/detections/:id        # Get detection details
PATCH  /api/v1/threatradar/detections/:id        # Update detection status
POST   /api/v1/threatradar/detections/:id/respond # Trigger response

GET    /api/v1/threatradar/threats               # List confirmed threats
GET    /api/v1/threatradar/threats/:id           # Get threat details
POST   /api/v1/threatradar/threats/:id/mitigate  # Mitigate threat

GET    /api/v1/threatradar/rules                 # List detection rules
POST   /api/v1/threatradar/rules                 # Create rule
PUT    /api/v1/threatradar/rules/:id             # Update rule
DELETE /api/v1/threatradar/rules/:id             # Delete rule

GET    /api/v1/threatradar/dashboard             # Dashboard data
GET    /api/v1/threatradar/statistics            # Detection statistics
POST   /api/v1/threatradar/reports/generate      # Generate report

GET    /health                                    # Health check
```

#### Frontend Components

```
frontend/src/
├── pages/
│   └── tools/
│       └── threatradar/
│           ├── ThreatDashboard.tsx          # Real-time dashboard
│           ├── DetectionList.tsx            # Detection events list
│           ├── DetectionDetail.tsx          # Detection details
│           ├── ThreatHunting.tsx            # Threat hunting interface
│           ├── RulesManager.tsx             # Detection rules
│           └── ResponsePlaybooks.tsx        # Automated responses
├── components/
│   └── threatradar/
│       ├── ThreatMap.tsx                    # Geographic threat map
│       ├── DetectionTimeline.tsx            # Real-time timeline
│       ├── SeverityChart.tsx                # Severity distribution
│       ├── NetworkGraph.tsx                 # Network visualization
│       └── AlertStream.tsx                  # Live alert stream
└── hooks/
    └── useThreatRadar.ts                    # API hooks + WebSocket
```

---

## 🦠 Tool 04: MalwareHunter

### AI-Powered Malware Analysis Platform

#### Purpose

Comprehensive malware analysis including static analysis, dynamic (sandbox) analysis, and ML-based classification for rapid threat identification.

#### Technology Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB
- **ML Engine**: Python + TensorFlow
- **Sandbox**: Cuckoo Sandbox / Custom Docker

#### Directory Structure

```
backend/tools/04-malwarehunter/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── sample.controller.js         # Sample upload & management
│   │   │   ├── analysis.controller.js       # Analysis operations
│   │   │   └── report.controller.js         # Analysis reports
│   │   ├── models/
│   │   │   ├── Sample.model.js              # Malware sample
│   │   │   ├── Analysis.model.js            # Analysis results
│   │   │   └── Report.model.js              # Reports
│   │   ├── services/
│   │   │   ├── malware.service.js           # Core malware analysis
│   │   │   ├── static.service.js            # Static analysis
│   │   │   ├── dynamic.service.js           # Dynamic/sandbox analysis
│   │   │   └── ml.service.js                # ML classification
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── malware_classifier.py            # Family classification
│   │   ├── behavior_analyzer.py             # Behavioral analysis
│   │   └── yara_engine.py                   # YARA rule matching
│   └── requirements.txt
└── README.md
```

#### Database Schema

```javascript
// Sample Model
{
  sampleId: String,
  userId: ObjectId,
  fileName: String,
  fileSize: Number,
  fileType: String,                // 'PE', 'ELF', 'PDF', 'Office', 'Script', etc.
  mimeType: String,
  fileHashes: {
    md5: String,
    sha1: String,
    sha256: String,
    ssdeep: String,
    imphash: String
  },
  status: String,                  // 'pending', 'analyzing', 'completed', 'error'
  isMalicious: Boolean,
  malwareType: String,             // 'trojan', 'ransomware', 'worm', 'spyware', etc.
  familyName: String,
  severity: String,                // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  confidence: Number,
  staticAnalysis: {
    peInfo: Object,                // PE header info
    imports: [String],
    exports: [String],
    sections: [Object],
    strings: [String],
    entropy: Number,
    packer: String,
    signatures: [Object]
  },
  dynamicAnalysis: {
    processes: [Object],
    networkActivity: [Object],
    fileActivity: [Object],
    registryActivity: [Object],
    behaviorTags: [String]
  },
  mlPrediction: {
    malwareType: String,
    confidence: Number,
    familyName: String,
    model: String
  },
  uploadedAt: Date,
  analyzedAt: Date,
  createdAt: Date
}

// Analysis Model
{
  analysisId: String,
  userId: ObjectId,
  analysisType: String,            // 'static', 'dynamic', 'behavioral', 'comprehensive'
  samples: [ObjectId],
  status: String,
  timeRange: {
    start: Date,
    end: Date
  },
  results: {
    totalSamples: Number,
    maliciousSamples: Number,
    byType: Object,
    bySeverity: Object,
    topFamilies: [Object]
  },
  createdAt: Date,
  completedAt: Date
}
```

#### API Endpoints

```
POST   /api/v1/malwarehunter/samples/upload      # Upload sample for analysis
GET    /api/v1/malwarehunter/samples             # List samples
GET    /api/v1/malwarehunter/samples/:id         # Get sample details
DELETE /api/v1/malwarehunter/samples/:id         # Delete sample
GET    /api/v1/malwarehunter/samples/statistics  # Sample statistics
POST   /api/v1/malwarehunter/samples/scan-hash   # Check hash against DB

POST   /api/v1/malwarehunter/analyses            # Create analysis job
GET    /api/v1/malwarehunter/analyses            # List analyses
GET    /api/v1/malwarehunter/analyses/:id        # Get analysis results
DELETE /api/v1/malwarehunter/analyses/:id        # Delete analysis

POST   /api/v1/malwarehunter/reports/generate    # Generate report
GET    /api/v1/malwarehunter/reports             # List reports
GET    /api/v1/malwarehunter/reports/:id         # Get report
GET    /api/v1/malwarehunter/reports/:id/export  # Export report

GET    /health                                    # Health check
```

#### Frontend Components

```
frontend/src/
├── pages/
│   └── tools/
│       └── malwarehunter/
│           ├── MalwareDashboard.tsx         # Main dashboard
│           ├── SampleUpload.tsx             # Upload interface
│           ├── SampleList.tsx               # Sample library
│           ├── SampleDetail.tsx             # Detailed analysis view
│           ├── AnalysisView.tsx             # Analysis results
│           └── HashLookup.tsx               # Hash search
├── components/
│   └── malwarehunter/
│       ├── UploadDropzone.tsx               # Drag-drop upload
│       ├── AnalysisProgress.tsx             # Analysis progress
│       ├── MalwareClassification.tsx        # Classification display
│       ├── BehaviorTimeline.tsx             # Behavior timeline
│       ├── IOCExtractor.tsx                 # IOC extraction view
│       └── YaraMatches.tsx                  # YARA rule matches
└── hooks/
    └── useMalwareHunter.ts                  # API hooks
```

---

## 🎣 Tool 05: PhishGuard

### AI-Powered Phishing Detection

#### Purpose

Real-time detection and analysis of phishing attempts across URLs, emails, and websites using ML-based classification and threat intelligence.

#### Technology Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB
- **ML Engine**: Python + scikit-learn
- **Screenshot**: Puppeteer/Playwright

#### Directory Structure

```
backend/tools/05-phishguard/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── url.controller.js            # URL checking
│   │   │   ├── analysis.controller.js       # Deep analysis
│   │   │   └── report.controller.js         # Reports
│   │   ├── models/
│   │   │   ├── URL.model.js                 # Checked URL
│   │   │   ├── Analysis.model.js            # Analysis results
│   │   │   └── Report.model.js              # Reports
│   │   ├── services/
│   │   │   ├── phishing.service.js          # Core detection
│   │   │   ├── url.service.js               # URL analysis
│   │   │   ├── content.service.js           # Content analysis
│   │   │   └── ml.service.js                # ML classification
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── phishing_detector.py             # URL/content classifier
│   │   ├── visual_similarity.py             # Visual phishing detection
│   │   └── brand_detector.py                # Brand impersonation
│   └── requirements.txt
└── README.md
```

#### Database Schema

```javascript
// URL Model (PhishingUrl)
{
  urlId: String,
  userId: ObjectId,
  originalUrl: String,
  domain: String,
  protocol: String,
  urlHash: String,
  urlFeatures: {
    length: Number,
    numDots: Number,
    numHyphens: Number,
    numDigits: Number,
    hasIpAddress: Boolean,
    isHttps: Boolean,
    isShortenedUrl: Boolean,
    suspiciousKeywords: [String]
  },
  status: String,                  // 'pending', 'analyzing', 'completed'
  isPhishing: Boolean,
  riskScore: Number,               // 0-100
  phishingType: String,            // 'credential_harvesting', 'brand_impersonation', 'typosquatting'
  targetBrand: String,
  confidence: Number,
  contentAnalysis: {
    title: String,
    forms: Number,
    passwordFields: Boolean,
    externalResources: [String],
    suspiciousScripts: Boolean,
    screenshot: String             // S3 URL
  },
  domainInfo: {
    registrar: String,
    createdDate: Date,
    expiryDate: Date,
    ageInDays: Number,
    whoisPrivacy: Boolean
  },
  mlPrediction: {
    isPhishing: Boolean,
    confidence: Number,
    modelName: String,
    features: Object
  },
  checkedAt: Date,
  createdAt: Date
}

// Analysis Model
{
  analysisId: String,
  userId: ObjectId,
  analysisType: String,            // 'domain_analysis', 'url_batch', 'threat_intelligence'
  timeRange: Object,
  status: String,
  results: {
    totalUrls: Number,
    phishingUrls: Number,
    byType: Object,
    topTargetedBrands: [Object],
    geographicDistribution: Object
  },
  createdAt: Date,
  completedAt: Date
}
```

#### API Endpoints

```
POST   /api/v1/phishguard/urls/check             # Check single URL
POST   /api/v1/phishguard/urls/batch             # Batch URL check
GET    /api/v1/phishguard/urls                   # List checked URLs
GET    /api/v1/phishguard/urls/:id               # Get URL analysis
DELETE /api/v1/phishguard/urls/:id               # Delete URL record
GET    /api/v1/phishguard/urls/statistics        # URL statistics

POST   /api/v1/phishguard/analyses               # Create analysis
GET    /api/v1/phishguard/analyses               # List analyses
GET    /api/v1/phishguard/analyses/:id           # Get analysis
DELETE /api/v1/phishguard/analyses/:id           # Delete analysis

POST   /api/v1/phishguard/reports/generate       # Generate report
GET    /api/v1/phishguard/reports                # List reports
GET    /api/v1/phishguard/reports/:id            # Get report
GET    /api/v1/phishguard/reports/:id/export     # Export report

GET    /health                                    # Health check
```

#### Frontend Components

```
frontend/src/
├── pages/
│   └── tools/
│       └── phishguard/
│           ├── PhishingDashboard.tsx        # Main dashboard
│           ├── URLChecker.tsx               # URL check interface
│           ├── URLHistory.tsx               # Check history
│           ├── URLDetail.tsx                # Detailed analysis
│           ├── BatchCheck.tsx               # Batch URL checking
│           └── BrandMonitoring.tsx          # Brand protection
├── components/
│   └── phishguard/
│       ├── URLInput.tsx                     # URL input component
│       ├── RiskIndicator.tsx                # Risk score display
│       ├── ScreenshotViewer.tsx             # Site screenshot
│       ├── DomainInfo.tsx                   # WHOIS info display
│       ├── PhishingIndicators.tsx           # Detection indicators
│       └── BrandAlert.tsx                   # Brand impersonation alert
└── hooks/
    └── usePhishGuard.ts                     # API hooks
```

---

## 🔗 Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │FraudGrd │ │IntelSct │ │ThrtRadr │ │MalwHntr │ │PhshGrd  │   │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘   │
└───────┼───────────┼───────────┼───────────┼───────────┼─────────┘
        │           │           │           │           │
        ▼           ▼           ▼           ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NGINX REVERSE PROXY                          │
│                    (api.fyzo.xyz:443)                           │
└───────┬───────────┬───────────┬───────────┬───────────┬─────────┘
        │           │           │           │           │
        ▼           ▼           ▼           ▼           ▼
   ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
   │ :4001  │  │ :4002  │  │ :4003  │  │ :4004  │  │ :4005  │
   │FraudGrd│  │IntelSct│  │ThrtRadr│  │MalwHntr│  │PhshGrd │
   └────┬───┘  └────┬───┘  └────┬───┘  └────┬───┘  └────┬───┘
        │           │           │           │           │
        ▼           ▼           ▼           ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MONGODB ATLAS CLUSTER                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ fraudguard   │ │ intelliscout │ │ threatradar  │ ...        │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
        │           │           │           │           │
        ▼           ▼           ▼           ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ML ENGINES (Python)                        │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │
│  │ :8001  │  │ :8002  │  │ :8003  │  │ :8004  │  │ :8005  │   │
│  │ Fraud  │  │ Intel  │  │ Threat │  │Malware │  │Phishing│   │
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Deployment Checklist

### Tools 01-05 Deployment

- [x] **Tool 01 - FraudGuard**

  - [x] Backend API structure
  - [x] Database models
  - [x] Controllers & routes
  - [ ] ML engine integration
  - [ ] Frontend components
  - [ ] Production deployment

- [x] **Tool 02 - IntelliScout**

  - [x] Backend API structure
  - [x] Database models
  - [x] Controllers & routes
  - [ ] Feed aggregation
  - [ ] Frontend components
  - [ ] Production deployment

- [x] **Tool 03 - ThreatRadar**

  - [x] Backend API structure
  - [x] Database models
  - [x] Controllers & routes
  - [ ] Real-time detection
  - [ ] Frontend components
  - [ ] Production deployment

- [x] **Tool 04 - MalwareHunter**

  - [x] Backend API structure
  - [x] Database models
  - [x] Controllers & routes
  - [x] ML service integration
  - [ ] Sandbox integration
  - [ ] Frontend components
  - [x] EC2 deployment

- [x] **Tool 05 - PhishGuard**
  - [x] Backend API structure
  - [x] Database models
  - [x] Controllers & routes
  - [x] ML service integration
  - [ ] Screenshot service
  - [ ] Frontend components
  - [x] EC2 deployment

---

## 🧪 Testing Commands

```bash
# Health checks
curl http://api.fyzo.xyz/fraudguard/health
curl http://api.fyzo.xyz/intelliscout/health
curl http://api.fyzo.xyz/threatradar/health
curl http://api.fyzo.xyz/malwarehunter/health
curl http://api.fyzo.xyz/phishguard/health

# Direct port testing (from EC2)
curl http://localhost:4001/health
curl http://localhost:4002/health
curl http://localhost:4003/health
curl http://localhost:4004/health
curl http://localhost:4005/health
```

---

_Documentation generated: December 29, 2025_
_VictoryKit Phase 4 - Backend API Implementation_
