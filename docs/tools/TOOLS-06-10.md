# VictoryKit Security Tools Documentation
## Tools 06-10: Security Assessment & Compliance

---

## 📊 Overview Dashboard

| Tool | Name | Port | DB | Status | Priority |
|------|------|------|-----|--------|----------|
| 06 | VulnScan | 4006 | victorykit_vulnscan | 🔄 Deployed | P0 |
| 07 | PenTestAI | 4007 | victorykit_pentestai | 🔄 Deployed | P0 |
| 08 | SecureCode | 4008 | victorykit_securecode | ✅ Working | P0 |
| 09 | ComplianceCheck | 4009 | victorykit_compliancecheck | ✅ Working | P0 |
| 10 | DataGuardian | 4010 | victorykit_dataguardian | ✅ Working | P0 |

---

## 🔍 Tool 06: VulnScan
### Comprehensive Vulnerability Scanning Platform

#### Purpose
Automated vulnerability scanning and assessment for networks, web applications, APIs, and cloud infrastructure with prioritized remediation guidance.

#### Technology Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **ML Engine**: Python + Risk Scoring
- **Scanners**: Nmap, Nuclei, Custom plugins

#### Directory Structure
```
backend/tools/06-vulnscan/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── scan.controller.js           # Scan management
│   │   │   ├── vulnerability.controller.js  # Vulnerability CRUD
│   │   │   └── report.controller.js         # Reports
│   │   ├── models/
│   │   │   ├── Scan.model.js                # Scan job
│   │   │   ├── Vulnerability.model.js       # Vulnerability
│   │   │   └── Report.model.js              # Reports
│   │   ├── services/
│   │   │   ├── vuln.service.js              # Vulnerability logic
│   │   │   ├── scanner.service.js           # Scanner integration
│   │   │   └── ml.service.js                # Risk scoring
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── risk_scorer.py                   # Risk prioritization
│   │   └── exploit_predictor.py             # Exploit likelihood
│   └── requirements.txt
└── README.md
```

#### Database Schema
```javascript
// Scan Model
{
  scanId: String,
  userId: ObjectId,
  targetType: String,              // 'network', 'web_application', 'host', 'container', 'cloud', 'api'
  targetIdentifier: String,        // IP, URL, hostname
  scanType: String,                // 'full', 'quick', 'compliance', 'authenticated', 'unauthenticated'
  scanConfig: {
    portRange: String,
    excludeHosts: [String],
    credentials: Object,           // Encrypted
    plugins: [String],
    maxConcurrency: Number
  },
  status: String,                  // 'queued', 'scanning', 'completed', 'failed', 'cancelled'
  progress: Number,                // 0-100
  startedAt: Date,
  completedAt: Date,
  summary: {
    totalVulnerabilities: Number,
    critical: Number,
    high: Number,
    medium: Number,
    low: Number,
    info: Number
  },
  createdAt: Date,
  updatedAt: Date
}

// Vulnerability Model
{
  vulnId: String,
  scanId: ObjectId,
  userId: ObjectId,
  title: String,
  description: String,
  severity: String,                // 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'
  cvssScore: Number,               // 0.0-10.0
  cvssVector: String,
  cveId: String,
  cweId: String,
  affectedAsset: {
    type: String,
    identifier: String,
    port: Number,
    service: String,
    version: String
  },
  evidence: {
    request: String,
    response: String,
    proof: String
  },
  remediation: {
    description: String,
    steps: [String],
    references: [String],
    estimatedEffort: String
  },
  exploitInfo: {
    available: Boolean,
    exploitDbId: String,
    metasploitModule: String
  },
  status: String,                  // 'open', 'confirmed', 'in_progress', 'resolved', 'accepted_risk', 'false_positive'
  assignedTo: ObjectId,
  resolvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### API Endpoints
```
POST   /api/v1/vulnscan/scans                    # Create new scan
GET    /api/v1/vulnscan/scans                    # List scans
GET    /api/v1/vulnscan/scans/:id                # Get scan details
DELETE /api/v1/vulnscan/scans/:id                # Delete scan
POST   /api/v1/vulnscan/scans/:id/cancel         # Cancel running scan
GET    /api/v1/vulnscan/scans/statistics         # Scan statistics

GET    /api/v1/vulnscan/vulnerabilities          # List vulnerabilities
GET    /api/v1/vulnscan/vulnerabilities/:id      # Get vulnerability details
PATCH  /api/v1/vulnscan/vulnerabilities/:id      # Update vulnerability status
DELETE /api/v1/vulnscan/vulnerabilities/:id      # Delete vulnerability

POST   /api/v1/vulnscan/reports/generate         # Generate report
GET    /api/v1/vulnscan/reports                  # List reports
GET    /api/v1/vulnscan/reports/:id              # Get report
GET    /api/v1/vulnscan/reports/:id/export       # Export report (PDF/HTML/JSON)

GET    /health                                    # Health check
```

#### Frontend Components
```
frontend/src/
├── pages/
│   └── tools/
│       └── vulnscan/
│           ├── VulnDashboard.tsx            # Main dashboard
│           ├── NewScan.tsx                  # Scan configuration
│           ├── ScanList.tsx                 # Scan history
│           ├── ScanProgress.tsx             # Real-time progress
│           ├── VulnerabilityList.tsx        # Vulnerability list
│           ├── VulnerabilityDetail.tsx      # Vuln details
│           └── Remediation.tsx              # Remediation tracking
├── components/
│   └── vulnscan/
│       ├── ScanConfigForm.tsx               # Scan setup form
│       ├── SeverityChart.tsx                # Severity distribution
│       ├── VulnTable.tsx                    # Vulnerability table
│       ├── CVSSCalculator.tsx               # CVSS score display
│       ├── RemediationCard.tsx              # Fix guidance
│       └── AssetTree.tsx                    # Asset visualization
└── hooks/
    └── useVulnScan.ts                       # API hooks
```

---

## ⚔️ Tool 07: PenTestAI
### AI-Assisted Penetration Testing Platform

#### Purpose
Automated penetration testing with AI-driven attack path generation, vulnerability exploitation, and comprehensive security assessment capabilities.

#### Technology Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **ML Engine**: Python + LLM integration
- **Tools**: Metasploit API, Custom exploits

#### Directory Structure
```
backend/tools/07-pentestai/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── targetController.js          # Target management
│   │   │   ├── testController.js            # Test execution
│   │   │   └── findingController.js         # Findings management
│   │   ├── models/
│   │   │   ├── Target.js                    # Pentest target
│   │   │   ├── Test.js                      # Pentest session
│   │   │   └── Finding.js                   # Test finding
│   │   ├── services/
│   │   │   ├── pentestService.js            # Core pentest logic
│   │   │   └── mlService.js                 # AI attack planning
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── attack_planner.py                # AI attack path generation
│   │   ├── exploit_selector.py              # Smart exploit selection
│   │   └── report_generator.py              # AI report writing
│   └── requirements.txt
└── README.md
```

#### Database Schema
```javascript
// Target Model
{
  userId: ObjectId,
  name: String,
  type: String,                    // 'web_app', 'network', 'api', 'mobile', 'cloud', 'iot'
  host: String,
  port: Number,
  protocol: String,                // 'http', 'https', 'tcp', 'udp'
  scope: {
    inScope: [String],             // Allowed targets
    outOfScope: [String],          // Excluded targets
    rules: String
  },
  authentication: {
    type: String,                  // 'none', 'basic', 'bearer', 'oauth', 'custom'
    credentials: Object            // Encrypted
  },
  technology: {
    stack: [String],               // Detected technologies
    frameworks: [String],
    servers: [String]
  },
  status: String,                  // 'active', 'testing', 'completed', 'archived'
  lastTestedAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// Test Model
{
  userId: ObjectId,
  targetId: ObjectId,
  testType: String,                // 'reconnaissance', 'vulnerability_scan', 'exploitation', 'full_pentest'
  status: String,                  // 'pending', 'running', 'paused', 'completed', 'failed'
  configuration: {
    aggressive: Boolean,
    techniques: [String],          // MITRE ATT&CK techniques
    excludeExploits: [String],
    maxDepth: Number
  },
  phases: [{
    name: String,
    status: String,
    startedAt: Date,
    completedAt: Date,
    findings: Number
  }],
  attackPlan: {
    generatedBy: String,           // 'ai' or 'manual'
    paths: [Object],
    estimatedDuration: Number
  },
  progress: Number,
  startedAt: Date,
  completedAt: Date,
  summary: {
    totalFindings: Number,
    critical: Number,
    high: Number,
    medium: Number,
    low: Number,
    exploitsSuccessful: Number
  },
  createdAt: Date
}

// Finding Model
{
  userId: ObjectId,
  testId: ObjectId,
  targetId: ObjectId,
  title: String,
  category: String,                // 'vulnerability', 'misconfiguration', 'info_disclosure', 'access_control'
  severity: String,
  cvssScore: Number,
  description: String,
  technicalDetails: {
    endpoint: String,
    method: String,
    parameter: String,
    payload: String,
    evidence: String
  },
  exploitation: {
    attempted: Boolean,
    successful: Boolean,
    accessGained: String,          // 'none', 'read', 'write', 'admin', 'root'
    proofOfConcept: String
  },
  remediation: {
    description: String,
    priority: String,
    effort: String
  },
  status: String,                  // 'new', 'confirmed', 'remediated', 'accepted', 'false_positive'
  createdAt: Date,
  updatedAt: Date
}
```

#### API Endpoints
```
POST   /api/v1/pentestai/targets                 # Create target
GET    /api/v1/pentestai/targets                 # List targets
GET    /api/v1/pentestai/targets/:id             # Get target details
PUT    /api/v1/pentestai/targets/:id             # Update target
DELETE /api/v1/pentestai/targets/:id             # Delete target
POST   /api/v1/pentestai/targets/:id/analyze     # AI target analysis

POST   /api/v1/pentestai/tests                   # Create pentest
GET    /api/v1/pentestai/tests                   # List tests
GET    /api/v1/pentestai/tests/:id               # Get test details
POST   /api/v1/pentestai/tests/:id/start         # Start test
POST   /api/v1/pentestai/tests/:id/stop          # Stop test
DELETE /api/v1/pentestai/tests/:id               # Delete test

GET    /api/v1/pentestai/findings                # List findings
GET    /api/v1/pentestai/findings/:id            # Get finding details
PATCH  /api/v1/pentestai/findings/:id            # Update finding
POST   /api/v1/pentestai/findings/:id/analyze    # AI analysis
POST   /api/v1/pentestai/findings/:id/exploit    # Generate exploit
GET    /api/v1/pentestai/findings/stats          # Finding statistics

GET    /health                                    # Health check
```

#### Frontend Components
```
frontend/src/
├── pages/
│   └── tools/
│       └── pentestai/
│           ├── PentestDashboard.tsx         # Main dashboard
│           ├── TargetManager.tsx            # Target management
│           ├── NewTest.tsx                  # Test configuration
│           ├── TestExecution.tsx            # Live test view
│           ├── FindingsList.tsx             # Findings list
│           ├── FindingDetail.tsx            # Finding details
│           └── AttackPath.tsx               # Attack path viz
├── components/
│   └── pentestai/
│       ├── AttackPlanViewer.tsx             # AI attack plan
│       ├── ExploitRunner.tsx                # Exploit execution
│       ├── TerminalOutput.tsx               # Command output
│       ├── PhaseProgress.tsx                # Test phases
│       ├── TechStackBadges.tsx              # Technology display
│       └── MitreMatrix.tsx                  # MITRE ATT&CK mapping
└── hooks/
    └── usePenTestAI.ts                      # API hooks
```

---

## 🔐 Tool 08: SecureCode
### AI-Powered Code Security Analysis

#### Purpose
Static and dynamic code analysis to identify security vulnerabilities, code quality issues, and compliance violations in source code repositories.

#### Technology Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **ML Engine**: Python + CodeBERT
- **Analysis**: Semgrep, custom rules

#### Directory Structure
```
backend/tools/08-securecode/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── codebaseController.js        # Codebase management
│   │   │   ├── scanController.js            # Scan operations
│   │   │   └── issueController.js           # Issue management
│   │   ├── models/
│   │   │   ├── Codebase.js                  # Code repository
│   │   │   ├── Scan.js                      # Code scan
│   │   │   └── Issue.js                     # Security issue
│   │   ├── services/
│   │   │   ├── codeAnalysisService.js       # Code analysis
│   │   │   └── mlService.js                 # AI analysis
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── vuln_detector.py                 # Vulnerability detection
│   │   ├── code_quality.py                  # Quality analysis
│   │   └── fix_suggester.py                 # AI fix suggestions
│   └── requirements.txt
└── README.md
```

#### Database Schema
```javascript
// Codebase Model
{
  userId: ObjectId,
  name: String,
  description: String,
  repositoryUrl: String,
  repositoryType: String,          // 'github', 'gitlab', 'bitbucket', 'azure_devops', 'local'
  branch: String,
  languages: [{
    name: String,
    percentage: Number,
    linesOfCode: Number
  }],
  frameworks: [String],
  lastCommit: {
    hash: String,
    message: String,
    author: String,
    date: Date
  },
  scanConfig: {
    autoScan: Boolean,
    scanOnPush: Boolean,
    excludePaths: [String],
    customRules: [String]
  },
  status: String,                  // 'active', 'scanning', 'archived'
  lastScannedAt: Date,
  issueCount: {
    critical: Number,
    high: Number,
    medium: Number,
    low: Number
  },
  createdAt: Date,
  updatedAt: Date
}

// Scan Model
{
  userId: ObjectId,
  codebaseId: ObjectId,
  scanType: String,                // 'full', 'incremental', 'pr_review', 'specific_files'
  commitHash: String,
  status: String,                  // 'queued', 'running', 'completed', 'failed'
  progress: Number,
  configuration: {
    analyzers: [String],           // 'sast', 'secrets', 'dependencies', 'iac'
    severityThreshold: String,
    failOnIssues: Boolean
  },
  results: {
    filesScanned: Number,
    linesAnalyzed: Number,
    issuesFound: Number,
    byCategory: Object,
    bySeverity: Object
  },
  duration: Number,                // seconds
  startedAt: Date,
  completedAt: Date,
  createdAt: Date
}

// Issue Model
{
  userId: ObjectId,
  codebaseId: ObjectId,
  scanId: ObjectId,
  issueId: String,
  title: String,
  description: String,
  category: String,                // 'injection', 'xss', 'auth', 'crypto', 'secrets', 'dependency'
  severity: String,
  cweId: String,
  owaspCategory: String,
  location: {
    file: String,
    startLine: Number,
    endLine: Number,
    startColumn: Number,
    endColumn: Number,
    codeSnippet: String
  },
  dataFlow: [{
    file: String,
    line: Number,
    description: String
  }],
  remediation: {
    description: String,
    fixCode: String,               // AI-suggested fix
    references: [String],
    effort: String
  },
  status: String,                  // 'open', 'confirmed', 'in_progress', 'fixed', 'false_positive', 'wont_fix'
  assignedTo: ObjectId,
  fixedInCommit: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### API Endpoints
```
POST   /api/v1/securecode/codebases              # Add codebase
GET    /api/v1/securecode/codebases              # List codebases
GET    /api/v1/securecode/codebases/:id          # Get codebase details
PUT    /api/v1/securecode/codebases/:id          # Update codebase
DELETE /api/v1/securecode/codebases/:id          # Delete codebase
POST   /api/v1/securecode/codebases/:id/sync     # Sync with repository

POST   /api/v1/securecode/scans                  # Start scan
GET    /api/v1/securecode/scans                  # List scans
GET    /api/v1/securecode/scans/:id              # Get scan details
POST   /api/v1/securecode/scans/:id/cancel       # Cancel scan

GET    /api/v1/securecode/issues                 # List issues
GET    /api/v1/securecode/issues/:id             # Get issue details
PATCH  /api/v1/securecode/issues/:id             # Update issue
POST   /api/v1/securecode/issues/:id/suggest-fix # AI fix suggestion
GET    /api/v1/securecode/issues/stats           # Issue statistics

GET    /health                                    # Health check
```

#### Frontend Components
```
frontend/src/
├── pages/
│   └── tools/
│       └── securecode/
│           ├── SecureCodeDashboard.tsx      # Main dashboard
│           ├── CodebaseList.tsx             # Codebase list
│           ├── AddCodebase.tsx              # Add repository
│           ├── ScanResults.tsx              # Scan results
│           ├── IssueList.tsx                # Issue list
│           ├── IssueDetail.tsx              # Issue details
│           └── CodeViewer.tsx               # Code with issues
├── components/
│   └── securecode/
│       ├── LanguageChart.tsx                # Language distribution
│       ├── IssueTimeline.tsx                # Issue trend
│       ├── CodeHighlighter.tsx              # Syntax highlighting
│       ├── DataFlowDiagram.tsx              # Data flow viz
│       ├── FixSuggestion.tsx                # AI fix display
│       └── SeverityBadge.tsx                # Severity indicator
└── hooks/
    └── useSecureCode.ts                     # API hooks
```

---

## ✅ Tool 09: ComplianceCheck
### Automated Compliance Auditing Platform

#### Purpose
Automated compliance assessment against security frameworks (SOC2, PCI-DSS, HIPAA, GDPR, ISO 27001) with gap analysis and remediation tracking.

#### Technology Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **ML Engine**: Python + NLP for policy analysis
- **Frameworks**: Built-in compliance mappings

#### Directory Structure
```
backend/tools/09-compliancecheck/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── frameworkController.js       # Framework management
│   │   │   ├── auditController.js           # Audit operations
│   │   │   └── controlController.js         # Control management
│   │   ├── models/
│   │   │   ├── Framework.js                 # Compliance framework
│   │   │   ├── Audit.js                     # Compliance audit
│   │   │   └── Control.js                   # Control status
│   │   ├── services/
│   │   │   ├── complianceService.js         # Compliance logic
│   │   │   └── mlService.js                 # AI policy analysis
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── policy_analyzer.py               # Policy NLP
│   │   └── gap_detector.py                  # Gap identification
│   └── requirements.txt
└── README.md
```

#### Database Schema
```javascript
// Framework Model
{
  frameworkId: String,
  name: String,                    // 'SOC2', 'PCI-DSS', 'HIPAA', 'GDPR', 'ISO27001', 'NIST'
  version: String,
  description: String,
  domains: [{
    id: String,
    name: String,
    description: String,
    controls: [String]
  }],
  totalControls: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Audit Model
{
  userId: ObjectId,
  auditId: String,
  name: String,
  description: String,
  frameworks: [String],            // Frameworks being audited
  scope: {
    systems: [String],
    departments: [String],
    dataTypes: [String]
  },
  status: String,                  // 'draft', 'in_progress', 'review', 'completed', 'archived'
  assessors: [ObjectId],
  startDate: Date,
  endDate: Date,
  progress: {
    total: Number,
    completed: Number,
    percentage: Number
  },
  summary: {
    compliant: Number,
    partiallyCompliant: Number,
    nonCompliant: Number,
    notApplicable: Number,
    complianceScore: Number        // 0-100
  },
  findings: [{
    controlId: String,
    finding: String,
    severity: String,
    recommendation: String
  }],
  createdAt: Date,
  updatedAt: Date
}

// Control Model
{
  userId: ObjectId,
  auditId: ObjectId,
  controlId: String,
  framework: String,
  domain: String,
  title: String,
  description: String,
  requirements: [String],
  status: String,                  // 'not_assessed', 'compliant', 'partially_compliant', 'non_compliant', 'not_applicable'
  evidence: [{
    type: String,                  // 'document', 'screenshot', 'log', 'interview', 'observation'
    description: String,
    fileUrl: String,
    uploadedAt: Date
  }],
  assessment: {
    notes: String,
    gaps: [String],
    recommendations: [String],
    assessedBy: ObjectId,
    assessedAt: Date
  },
  remediation: {
    required: Boolean,
    plan: String,
    owner: ObjectId,
    dueDate: Date,
    status: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### API Endpoints
```
GET    /api/v1/compliancecheck/frameworks        # List frameworks
GET    /api/v1/compliancecheck/frameworks/:id    # Get framework details
POST   /api/v1/compliancecheck/frameworks        # Create custom framework

POST   /api/v1/compliancecheck/audits            # Create audit
GET    /api/v1/compliancecheck/audits            # List audits
GET    /api/v1/compliancecheck/audits/:id        # Get audit details
PUT    /api/v1/compliancecheck/audits/:id        # Update audit
DELETE /api/v1/compliancecheck/audits/:id        # Delete audit
POST   /api/v1/compliancecheck/audits/:id/complete # Complete audit
GET    /api/v1/compliancecheck/audits/:id/report # Generate report

GET    /api/v1/compliancecheck/controls          # List controls
GET    /api/v1/compliancecheck/controls/:id      # Get control details
PATCH  /api/v1/compliancecheck/controls/:id      # Update control status
POST   /api/v1/compliancecheck/controls/:id/evidence # Upload evidence
POST   /api/v1/compliancecheck/controls/:id/assess   # Assess control
GET    /api/v1/compliancecheck/controls/stats    # Control statistics

GET    /health                                    # Health check
```

#### Frontend Components
```
frontend/src/
├── pages/
│   └── tools/
│       └── compliancecheck/
│           ├── ComplianceDashboard.tsx      # Main dashboard
│           ├── FrameworkSelector.tsx        # Framework selection
│           ├── AuditList.tsx                # Audit list
│           ├── AuditDetail.tsx              # Audit details
│           ├── ControlAssessment.tsx        # Control assessment
│           ├── EvidenceManager.tsx          # Evidence upload
│           └── GapAnalysis.tsx              # Gap analysis
├── components/
│   └── compliancecheck/
│       ├── ComplianceScore.tsx              # Score gauge
│       ├── ControlMatrix.tsx                # Control status matrix
│       ├── ProgressTracker.tsx              # Audit progress
│       ├── EvidenceCard.tsx                 # Evidence display
│       ├── GapChart.tsx                     # Gap visualization
│       └── RemediationPlan.tsx              # Remediation tracking
└── hooks/
    └── useComplianceCheck.ts                # API hooks
```

---

## 🛡️ Tool 10: DataGuardian
### Data Protection & Privacy Platform

#### Purpose
Comprehensive data discovery, classification, and protection platform to identify sensitive data, enforce privacy policies, and ensure regulatory compliance.

#### Technology Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **ML Engine**: Python + NER models
- **Scanner**: Custom data scanners

#### Directory Structure
```
backend/tools/10-dataguardian/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── assetController.js           # Asset management
│   │   │   ├── policyController.js          # Policy management
│   │   │   └── incidentController.js        # Incident handling
│   │   ├── models/
│   │   │   ├── Asset.js                     # Data asset
│   │   │   ├── Policy.js                    # Protection policy
│   │   │   └── Incident.js                  # Data incident
│   │   ├── services/
│   │   │   ├── dataProtectionService.js     # Protection logic
│   │   │   └── mlService.js                 # Data classification
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── data_classifier.py               # Data classification
│   │   ├── pii_detector.py                  # PII detection
│   │   └── pattern_matcher.py               # Pattern matching
│   └── requirements.txt
└── README.md
```

#### Database Schema
```javascript
// Asset Model
{
  userId: ObjectId,
  assetId: String,
  name: String,
  type: String,                    // 'database', 'file_share', 'cloud_storage', 'api', 'application'
  location: {
    type: String,                  // 'on_premise', 'aws', 'azure', 'gcp', 'hybrid'
    region: String,
    identifier: String
  },
  connection: {
    type: String,
    host: String,
    credentials: Object            // Encrypted
  },
  classification: {
    level: String,                 // 'public', 'internal', 'confidential', 'restricted', 'top_secret'
    categories: [String],          // 'pii', 'phi', 'pci', 'financial', 'intellectual_property'
    regulatoryScope: [String]      // 'gdpr', 'hipaa', 'ccpa', 'pci_dss'
  },
  dataProfile: {
    lastScanned: Date,
    recordCount: Number,
    sensitiveFields: [{
      name: String,
      type: String,
      sampleCount: Number,
      masked: Boolean
    }],
    dataTypes: Object
  },
  policies: [ObjectId],
  status: String,                  // 'active', 'inactive', 'scanning', 'quarantined'
  riskScore: Number,               // 0-100
  createdAt: Date,
  updatedAt: Date
}

// Policy Model
{
  userId: ObjectId,
  policyId: String,
  name: String,
  description: String,
  type: String,                    // 'access_control', 'encryption', 'masking', 'retention', 'dlp'
  scope: {
    assetTypes: [String],
    classifications: [String],
    regulations: [String]
  },
  rules: [{
    condition: Object,
    action: String,                // 'allow', 'deny', 'alert', 'encrypt', 'mask', 'log'
    parameters: Object
  }],
  enforcement: {
    mode: String,                  // 'monitor', 'enforce', 'disabled'
    notifications: Boolean,
    blockOnViolation: Boolean
  },
  exceptions: [{
    type: String,
    value: String,
    reason: String,
    expiresAt: Date
  }],
  status: String,                  // 'active', 'draft', 'disabled'
  createdAt: Date,
  updatedAt: Date
}

// Incident Model
{
  userId: ObjectId,
  incidentId: String,
  type: String,                    // 'data_breach', 'policy_violation', 'unauthorized_access', 'data_loss', 'exfiltration'
  severity: String,
  status: String,                  // 'open', 'investigating', 'contained', 'resolved', 'closed'
  source: {
    assetId: ObjectId,
    policyId: ObjectId,
    detectionMethod: String
  },
  details: {
    description: String,
    affectedData: [String],
    recordsAffected: Number,
    users: [String],
    timeline: [{
      action: String,
      timestamp: Date,
      actor: String
    }]
  },
  response: {
    containmentActions: [String],
    investigation: String,
    rootCause: String,
    remediation: [String],
    lessonsLearned: String
  },
  notification: {
    required: Boolean,
    regulators: [String],
    affected: Boolean,
    notifiedAt: Date
  },
  assignedTo: ObjectId,
  createdAt: Date,
  resolvedAt: Date,
  updatedAt: Date
}
```

#### API Endpoints
```
POST   /api/v1/dataguardian/assets               # Register asset
GET    /api/v1/dataguardian/assets               # List assets
GET    /api/v1/dataguardian/assets/:id           # Get asset details
PUT    /api/v1/dataguardian/assets/:id           # Update asset
DELETE /api/v1/dataguardian/assets/:id           # Delete asset
POST   /api/v1/dataguardian/assets/:id/scan      # Scan asset for sensitive data
GET    /api/v1/dataguardian/assets/:id/profile   # Get data profile

POST   /api/v1/dataguardian/policies             # Create policy
GET    /api/v1/dataguardian/policies             # List policies
GET    /api/v1/dataguardian/policies/:id         # Get policy details
PUT    /api/v1/dataguardian/policies/:id         # Update policy
DELETE /api/v1/dataguardian/policies/:id         # Delete policy
POST   /api/v1/dataguardian/policies/:id/test    # Test policy

GET    /api/v1/dataguardian/incidents            # List incidents
GET    /api/v1/dataguardian/incidents/:id        # Get incident details
PATCH  /api/v1/dataguardian/incidents/:id        # Update incident
POST   /api/v1/dataguardian/incidents/:id/respond # Add response action
GET    /api/v1/dataguardian/incidents/stats      # Incident statistics

GET    /api/v1/dataguardian/dashboard            # Dashboard data
GET    /health                                    # Health check
```

#### Frontend Components
```
frontend/src/
├── pages/
│   └── tools/
│       └── dataguardian/
│           ├── DataDashboard.tsx            # Main dashboard
│           ├── AssetInventory.tsx           # Asset list
│           ├── AssetDetail.tsx              # Asset details
│           ├── DataDiscovery.tsx            # Data discovery
│           ├── PolicyManager.tsx            # Policy management
│           ├── IncidentList.tsx             # Incident list
│           ├── IncidentDetail.tsx           # Incident details
│           └── ComplianceMap.tsx            # Regulatory mapping
├── components/
│   └── dataguardian/
│       ├── ClassificationBadge.tsx          # Classification display
│       ├── SensitiveDataChart.tsx           # Data distribution
│       ├── PolicyRuleBuilder.tsx            # Policy builder
│       ├── DataFlowMap.tsx                  # Data flow viz
│       ├── IncidentTimeline.tsx             # Incident timeline
│       └── RiskHeatmap.tsx                  # Risk visualization
└── hooks/
    └── useDataGuardian.ts                   # API hooks
```

---

## 🔗 Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │VulnScan │ │PenTestAI│ │SecureCd │ │ComplChk │ │DataGrd  │   │
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
   │ :4006  │  │ :4007  │  │ :4008  │  │ :4009  │  │ :4010  │
   │VulnScan│  │PenTest │  │SecureCd│  │ComplChk│  │DataGrd │
   └────┬───┘  └────┬───┘  └────┬───┘  └────┬───┘  └────┬───┘
        │           │           │           │           │
        ▼           ▼           ▼           ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MONGODB ATLAS CLUSTER                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ vulnscan     │ │ pentestai    │ │ securecode   │ ...        │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
        │           │           │           │           │
        ▼           ▼           ▼           ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ML ENGINES (Python)                        │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │
│  │ :8006  │  │ :8007  │  │ :8008  │  │ :8009  │  │ :8010  │   │
│  │ Vuln   │  │ Pentest│  │ Code   │  │Complnce│  │ Data   │   │
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Deployment Status

### Tools 06-10 Production Status

- [x] **Tool 06 - VulnScan** (Port 4006)
  - [x] Backend API complete
  - [x] Database models
  - [x] Controllers & routes
  - [x] ML service integration
  - [x] EC2 deployment
  - [ ] Frontend components
  - ⚠️ Status: Debugging path issues

- [x] **Tool 07 - PenTestAI** (Port 4007)
  - [x] Backend API complete
  - [x] Database models (Target, Test, Finding)
  - [x] Controllers & routes
  - [x] AI attack planning service
  - [x] EC2 deployment
  - [ ] Frontend components
  - ⚠️ Status: Debugging path issues

- [x] **Tool 08 - SecureCode** (Port 4008)
  - [x] Backend API complete
  - [x] Database models
  - [x] Controllers & routes
  - [x] ML service integration
  - [x] EC2 deployment
  - [ ] Frontend components
  - ✅ Status: **WORKING**

- [x] **Tool 09 - ComplianceCheck** (Port 4009)
  - [x] Backend API complete
  - [x] Database models
  - [x] Controllers & routes
  - [x] ML service integration
  - [x] EC2 deployment
  - [ ] Frontend components
  - ✅ Status: **WORKING**

- [x] **Tool 10 - DataGuardian** (Port 4010)
  - [x] Backend API complete
  - [x] Database models
  - [x] Controllers & routes
  - [x] ML service integration
  - [x] EC2 deployment
  - [ ] Frontend components
  - ✅ Status: **WORKING**

---

## 🧪 Testing Commands

```bash
# Health checks - EC2 Direct
curl http://localhost:4006/health  # VulnScan
curl http://localhost:4007/health  # PenTestAI
curl http://localhost:4008/health  # SecureCode ✅
curl http://localhost:4009/health  # ComplianceCheck ✅
curl http://localhost:4010/health  # DataGuardian ✅

# Via Nginx (if configured)
curl http://api.fyzo.xyz/vulnscan/health
curl http://api.fyzo.xyz/pentestai/health
curl http://api.fyzo.xyz/securecode/health
curl http://api.fyzo.xyz/compliancecheck/health
curl http://api.fyzo.xyz/dataguardian/health

# PM2 Status
pm2 status
pm2 logs securecode-api --lines 20 --nostream
```

---

*Documentation generated: December 29, 2025*
*VictoryKit Phase 4 - Backend API Implementation*
