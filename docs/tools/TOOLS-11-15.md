# VictoryKit Security Tools Documentation
## Tools 11-15: Incident & Network Security

---

## 📊 Overview Dashboard

| Tool | Name | Port | DB | Status | Priority |
|------|------|------|-----|--------|----------|
| 11 | IncidentResponse | 4011 | victorykit_incidentresponse | 📝 Planned | P1 |
| 12 | NetworkGuard | 4012 | victorykit_networkguard | 📝 Planned | P1 |
| 13 | CloudArmor | 4013 | victorykit_cloudarmor | 📝 Planned | P1 |
| 14 | IdentityShield | 4014 | victorykit_identityshield | 📝 Planned | P1 |
| 15 | CryptoVault | 4015 | victorykit_cryptovault | 📝 Planned | P1 |

---

## 🚨 Tool 11: IncidentResponse
### AI-Powered Security Incident Management

#### Purpose
Comprehensive incident response platform with AI-driven playbook automation, threat containment, forensic analysis, and coordinated response workflows.

#### Technology Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **ML Engine**: Python + LLM for analysis
- **Integration**: SIEM, EDR, Ticketing

#### Directory Structure
```
backend/tools/11-incidentresponse/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── incidentController.js        # Incident management
│   │   │   ├── playbookController.js        # Playbook execution
│   │   │   ├── taskController.js            # Task management
│   │   │   └── forensicsController.js       # Forensic analysis
│   │   ├── models/
│   │   │   ├── Incident.js                  # Security incident
│   │   │   ├── Playbook.js                  # Response playbook
│   │   │   ├── Task.js                      # Response task
│   │   │   └── Evidence.js                  # Forensic evidence
│   │   ├── services/
│   │   │   ├── incidentService.js           # Incident logic
│   │   │   ├── playbookService.js           # Playbook automation
│   │   │   ├── forensicsService.js          # Forensic analysis
│   │   │   └── mlService.js                 # AI analysis
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── incident_classifier.py           # Incident classification
│   │   ├── threat_analyzer.py               # Threat analysis
│   │   ├── timeline_generator.py            # Attack timeline
│   │   └── recommendation_engine.py         # Response recommendations
│   └── requirements.txt
└── README.md
```

#### Database Schema
```javascript
// Incident Model
{
  userId: ObjectId,
  incidentId: String,                        // INC-2024-001234
  title: String,
  description: String,
  classification: {
    type: String,                            // 'malware', 'ransomware', 'phishing', 'data_breach', 'ddos', 'insider_threat', 'apt'
    category: String,                        // MITRE ATT&CK category
    techniques: [String],                    // T1234 IDs
    confidence: Number                       // 0-100
  },
  severity: String,                          // 'critical', 'high', 'medium', 'low'
  priority: String,                          // 'p1', 'p2', 'p3', 'p4'
  status: String,                            // 'new', 'triaged', 'investigating', 'containing', 'eradicating', 'recovering', 'closed'
  phase: String,                             // NIST IR phases
  timeline: [{
    timestamp: Date,
    event: String,
    actor: String,
    details: Object
  }],
  affectedAssets: [{
    assetId: String,
    type: String,
    hostname: String,
    ipAddress: String,
    impact: String
  }],
  indicators: [{
    type: String,                            // 'ip', 'domain', 'hash', 'url', 'email'
    value: String,
    malicious: Boolean,
    source: String
  }],
  assignedTeam: [ObjectId],
  leadInvestigator: ObjectId,
  playbook: ObjectId,
  metrics: {
    timeToDetect: Number,                    // minutes
    timeToRespond: Number,
    timeToContain: Number,
    timeToResolve: Number
  },
  createdAt: Date,
  detectedAt: Date,
  containedAt: Date,
  resolvedAt: Date,
  updatedAt: Date
}

// Playbook Model
{
  userId: ObjectId,
  playbookId: String,
  name: String,
  description: String,
  incidentTypes: [String],
  triggers: [{
    condition: String,
    value: Object
  }],
  phases: [{
    name: String,
    order: Number,
    tasks: [{
      taskId: String,
      name: String,
      description: String,
      type: String,                          // 'manual', 'automated', 'approval'
      assignee: String,                      // Role or user
      sla: Number,                           // minutes
      automation: {
        script: String,
        integration: String,
        parameters: Object
      },
      dependencies: [String]
    }]
  }],
  automations: [{
    trigger: String,
    action: String,
    target: String,
    parameters: Object
  }],
  isActive: Boolean,
  version: Number,
  createdAt: Date,
  updatedAt: Date
}

// Task Model
{
  userId: ObjectId,
  incidentId: ObjectId,
  taskId: String,
  playbookTaskId: String,
  name: String,
  description: String,
  phase: String,
  type: String,
  status: String,                            // 'pending', 'in_progress', 'blocked', 'completed', 'skipped'
  assignee: ObjectId,
  priority: String,
  dueAt: Date,
  slaBreached: Boolean,
  result: {
    outcome: String,
    notes: String,
    artifacts: [String],
    completedBy: ObjectId
  },
  startedAt: Date,
  completedAt: Date,
  createdAt: Date
}

// Evidence Model
{
  userId: ObjectId,
  incidentId: ObjectId,
  evidenceId: String,
  type: String,                              // 'disk_image', 'memory_dump', 'network_capture', 'log_file', 'malware_sample', 'screenshot'
  name: String,
  description: String,
  source: {
    assetId: String,
    hostname: String,
    collectionMethod: String
  },
  storage: {
    location: String,
    hash: {
      md5: String,
      sha1: String,
      sha256: String
    },
    size: Number,
    encrypted: Boolean
  },
  chainOfCustody: [{
    action: String,
    actor: ObjectId,
    timestamp: Date,
    notes: String
  }],
  analysis: {
    status: String,
    findings: [String],
    artifacts: [Object],
    analyzedBy: ObjectId,
    analyzedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### API Endpoints
```
POST   /api/v1/incidentresponse/incidents           # Create incident
GET    /api/v1/incidentresponse/incidents           # List incidents
GET    /api/v1/incidentresponse/incidents/:id       # Get incident details
PATCH  /api/v1/incidentresponse/incidents/:id       # Update incident
POST   /api/v1/incidentresponse/incidents/:id/escalate  # Escalate
POST   /api/v1/incidentresponse/incidents/:id/close # Close incident
GET    /api/v1/incidentresponse/incidents/:id/timeline  # Get timeline
POST   /api/v1/incidentresponse/incidents/:id/analyze   # AI analysis

POST   /api/v1/incidentresponse/playbooks           # Create playbook
GET    /api/v1/incidentresponse/playbooks           # List playbooks
GET    /api/v1/incidentresponse/playbooks/:id       # Get playbook
PUT    /api/v1/incidentresponse/playbooks/:id       # Update playbook
POST   /api/v1/incidentresponse/playbooks/:id/execute   # Execute playbook

GET    /api/v1/incidentresponse/tasks               # List tasks
GET    /api/v1/incidentresponse/tasks/:id           # Get task
PATCH  /api/v1/incidentresponse/tasks/:id           # Update task
POST   /api/v1/incidentresponse/tasks/:id/complete  # Complete task

POST   /api/v1/incidentresponse/evidence            # Upload evidence
GET    /api/v1/incidentresponse/evidence            # List evidence
GET    /api/v1/incidentresponse/evidence/:id        # Get evidence
POST   /api/v1/incidentresponse/evidence/:id/analyze    # Analyze evidence

GET    /api/v1/incidentresponse/dashboard           # Dashboard metrics
GET    /health                                       # Health check
```

#### Frontend Components
```
frontend/src/
├── pages/
│   └── tools/
│       └── incidentresponse/
│           ├── IRDashboard.tsx              # Main dashboard
│           ├── IncidentList.tsx             # Incident list
│           ├── IncidentDetail.tsx           # Incident details
│           ├── IncidentTimeline.tsx         # Attack timeline
│           ├── PlaybookEditor.tsx           # Playbook builder
│           ├── TaskBoard.tsx                # Kanban task board
│           ├── ForensicsLab.tsx             # Evidence analysis
│           └── Reporting.tsx                # IR reports
├── components/
│   └── incidentresponse/
│       ├── SeverityIndicator.tsx            # Severity display
│       ├── PhaseTracker.tsx                 # IR phase progress
│       ├── TimelineViewer.tsx               # Timeline viz
│       ├── IOCTable.tsx                     # IOC list
│       ├── PlaybookFlow.tsx                 # Playbook visualization
│       ├── TaskCard.tsx                     # Task card
│       ├── EvidenceChain.tsx                # Chain of custody
│       └── MetricsCard.tsx                  # MTTD/MTTR metrics
└── hooks/
    └── useIncidentResponse.ts               # API hooks
```

---

## 🌐 Tool 12: NetworkGuard
### AI-Powered Network Security Monitoring

#### Purpose
Real-time network traffic analysis, intrusion detection, anomaly detection, and automated threat response for enterprise network infrastructure.

#### Technology Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB + TimescaleDB
- **ML Engine**: Python + Deep Learning
- **Capture**: NetFlow, PCAP, Zeek

#### Directory Structure
```
backend/tools/12-networkguard/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── sensorController.js          # Sensor management
│   │   │   ├── alertController.js           # Alert handling
│   │   │   ├── trafficController.js         # Traffic analysis
│   │   │   └── ruleController.js            # Detection rules
│   │   ├── models/
│   │   │   ├── Sensor.js                    # Network sensor
│   │   │   ├── Alert.js                     # Security alert
│   │   │   ├── TrafficFlow.js               # Traffic data
│   │   │   └── Rule.js                      # Detection rule
│   │   ├── services/
│   │   │   ├── networkService.js            # Network analysis
│   │   │   ├── detectionService.js          # Threat detection
│   │   │   └── mlService.js                 # Anomaly detection
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── anomaly_detector.py              # Network anomaly detection
│   │   ├── traffic_classifier.py            # Traffic classification
│   │   ├── threat_predictor.py              # Threat prediction
│   │   └── behavior_analyzer.py             # Behavioral analysis
│   └── requirements.txt
└── README.md
```

#### Database Schema
```javascript
// Sensor Model
{
  userId: ObjectId,
  sensorId: String,
  name: String,
  type: String,                              // 'span_port', 'tap', 'agent', 'cloud'
  location: {
    network: String,
    zone: String,
    description: String
  },
  configuration: {
    captureMode: String,                     // 'full_packet', 'netflow', 'metadata'
    interfaces: [String],
    filters: [String],
    protocols: [String]
  },
  status: String,                            // 'online', 'offline', 'degraded', 'maintenance'
  health: {
    lastSeen: Date,
    cpuUsage: Number,
    memoryUsage: Number,
    packetsPerSecond: Number,
    bytesPerSecond: Number
  },
  statistics: {
    totalPackets: Number,
    totalBytes: Number,
    alertsGenerated: Number,
    uptime: Number
  },
  createdAt: Date,
  updatedAt: Date
}

// Alert Model
{
  userId: ObjectId,
  alertId: String,
  sensorId: ObjectId,
  ruleId: ObjectId,
  title: String,
  description: String,
  category: String,                          // 'intrusion', 'malware', 'reconnaissance', 'exfiltration', 'c2', 'anomaly'
  severity: String,
  confidence: Number,                        // 0-100
  source: {
    ip: String,
    port: Number,
    mac: String,
    hostname: String,
    geo: Object
  },
  destination: {
    ip: String,
    port: Number,
    mac: String,
    hostname: String,
    geo: Object
  },
  protocol: String,
  signature: {
    id: String,
    name: String,
    reference: [String]
  },
  payload: {
    raw: String,                             // Base64
    decoded: String,
    size: Number
  },
  context: {
    previousEvents: [ObjectId],
    relatedAlerts: [ObjectId],
    mitreTechnique: String
  },
  status: String,                            // 'new', 'investigating', 'escalated', 'resolved', 'false_positive'
  assignedTo: ObjectId,
  response: {
    action: String,
    automated: Boolean,
    notes: String
  },
  createdAt: Date,
  updatedAt: Date
}

// TrafficFlow Model
{
  sensorId: ObjectId,
  flowId: String,
  timestamp: Date,
  source: {
    ip: String,
    port: Number,
    asn: Number,
    country: String
  },
  destination: {
    ip: String,
    port: Number,
    asn: Number,
    country: String
  },
  protocol: String,
  application: String,                       // DPI detected app
  metrics: {
    packets: Number,
    bytes: Number,
    duration: Number
  },
  flags: {
    syn: Boolean,
    fin: Boolean,
    rst: Boolean,
    encrypted: Boolean
  },
  classification: {
    category: String,
    risk: String,
    confidence: Number
  },
  createdAt: Date
}

// Rule Model
{
  userId: ObjectId,
  ruleId: String,
  name: String,
  description: String,
  type: String,                              // 'signature', 'behavioral', 'statistical', 'ml'
  category: String,
  severity: String,
  logic: {
    conditions: [Object],
    threshold: Object,
    window: Number
  },
  snortRule: String,                         // Optional Snort/Suricata rule
  action: String,                            // 'alert', 'block', 'log', 'drop'
  automatedResponse: {
    enabled: Boolean,
    actions: [String]
  },
  isActive: Boolean,
  hitCount: Number,
  lastTriggered: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### API Endpoints
```
POST   /api/v1/networkguard/sensors                 # Register sensor
GET    /api/v1/networkguard/sensors                 # List sensors
GET    /api/v1/networkguard/sensors/:id             # Get sensor details
PUT    /api/v1/networkguard/sensors/:id             # Update sensor
DELETE /api/v1/networkguard/sensors/:id             # Remove sensor
GET    /api/v1/networkguard/sensors/:id/health      # Sensor health

GET    /api/v1/networkguard/alerts                  # List alerts
GET    /api/v1/networkguard/alerts/:id              # Get alert details
PATCH  /api/v1/networkguard/alerts/:id              # Update alert
POST   /api/v1/networkguard/alerts/:id/respond      # Take action
GET    /api/v1/networkguard/alerts/stats            # Alert statistics

GET    /api/v1/networkguard/traffic                 # Query traffic
GET    /api/v1/networkguard/traffic/top             # Top talkers
GET    /api/v1/networkguard/traffic/geo             # Geo distribution
POST   /api/v1/networkguard/traffic/analyze         # Deep analysis

POST   /api/v1/networkguard/rules                   # Create rule
GET    /api/v1/networkguard/rules                   # List rules
PUT    /api/v1/networkguard/rules/:id               # Update rule
DELETE /api/v1/networkguard/rules/:id               # Delete rule
POST   /api/v1/networkguard/rules/:id/test          # Test rule

GET    /api/v1/networkguard/dashboard               # Dashboard data
GET    /health                                       # Health check
```

#### Frontend Components
```
frontend/src/
├── pages/
│   └── tools/
│       └── networkguard/
│           ├── NetworkDashboard.tsx         # Main dashboard
│           ├── SensorManager.tsx            # Sensor management
│           ├── AlertCenter.tsx              # Alert management
│           ├── TrafficAnalysis.tsx          # Traffic analysis
│           ├── ThreatMap.tsx                # Geographic threats
│           ├── RuleEditor.tsx               # Rule management
│           └── LiveCapture.tsx              # Real-time view
├── components/
│   └── networkguard/
│       ├── NetworkTopology.tsx              # Network map
│       ├── TrafficChart.tsx                 # Bandwidth charts
│       ├── AlertTimeline.tsx                # Alert timeline
│       ├── GeoMap.tsx                       # World map
│       ├── ProtocolBreakdown.tsx            # Protocol stats
│       ├── TopTalkers.tsx                   # Top IPs
│       ├── RuleBuilder.tsx                  # Rule builder UI
│       └── PacketViewer.tsx                 # Packet details
└── hooks/
    └── useNetworkGuard.ts                   # API hooks
```

---

## ☁️ Tool 13: CloudArmor
### Cloud Security Posture Management

#### Purpose
Comprehensive cloud security platform for AWS, Azure, and GCP with misconfiguration detection, compliance monitoring, and automated remediation.

#### Technology Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **ML Engine**: Python + Policy analysis
- **Cloud APIs**: AWS SDK, Azure SDK, GCP SDK

#### Directory Structure
```
backend/tools/13-cloudarmor/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── accountController.js         # Cloud account management
│   │   │   ├── findingController.js         # Security findings
│   │   │   ├── complianceController.js      # Compliance status
│   │   │   └── remediationController.js     # Auto-remediation
│   │   ├── models/
│   │   │   ├── CloudAccount.js              # Cloud account
│   │   │   ├── Resource.js                  # Cloud resource
│   │   │   ├── Finding.js                   # Security finding
│   │   │   └── Policy.js                    # Security policy
│   │   ├── services/
│   │   │   ├── awsService.js                # AWS integration
│   │   │   ├── azureService.js              # Azure integration
│   │   │   ├── gcpService.js                # GCP integration
│   │   │   └── mlService.js                 # AI analysis
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── misconfiguration_detector.py    # Misconfig detection
│   │   ├── risk_scorer.py                   # Risk prioritization
│   │   └── remediation_generator.py         # Fix generation
│   └── requirements.txt
└── README.md
```

#### Database Schema
```javascript
// CloudAccount Model
{
  userId: ObjectId,
  accountId: String,
  name: String,
  provider: String,                          // 'aws', 'azure', 'gcp'
  credentials: {
    type: String,                            // 'role', 'service_account', 'access_key'
    data: Object                             // Encrypted
  },
  regions: [String],
  configuration: {
    scanFrequency: String,                   // 'realtime', 'hourly', 'daily'
    enabledServices: [String],
    excludedResources: [String]
  },
  status: String,                            // 'connected', 'disconnected', 'error', 'scanning'
  lastScanAt: Date,
  statistics: {
    totalResources: Number,
    criticalFindings: Number,
    highFindings: Number,
    complianceScore: Number
  },
  createdAt: Date,
  updatedAt: Date
}

// Resource Model
{
  userId: ObjectId,
  accountId: ObjectId,
  resourceId: String,                        // Cloud provider resource ID
  arn: String,                               // AWS ARN or equivalent
  name: String,
  type: String,                              // 'ec2', 's3', 'rds', 'lambda', etc.
  service: String,
  region: String,
  configuration: Object,                     // Full resource config
  metadata: {
    tags: Object,
    createdAt: Date,
    owner: String
  },
  security: {
    publiclyAccessible: Boolean,
    encrypted: Boolean,
    mfaEnabled: Boolean,
    findings: [ObjectId]
  },
  compliance: {
    frameworks: Object,                      // { 'cis': true, 'pci': false }
    lastAssessed: Date
  },
  riskScore: Number,
  createdAt: Date,
  updatedAt: Date
}

// Finding Model
{
  userId: ObjectId,
  accountId: ObjectId,
  resourceId: ObjectId,
  findingId: String,
  title: String,
  description: String,
  category: String,                          // 'misconfiguration', 'iam', 'network', 'encryption', 'logging', 'public_exposure'
  severity: String,
  riskLevel: String,
  benchmark: String,                         // 'cis', 'aws_best_practices', etc.
  control: String,                           // Control ID
  details: {
    current: Object,
    expected: Object,
    evidence: String
  },
  remediation: {
    description: String,
    steps: [String],
    script: String,                          // Terraform/CloudFormation
    automated: Boolean
  },
  status: String,                            // 'open', 'in_progress', 'resolved', 'suppressed', 'false_positive'
  resolvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// Policy Model
{
  userId: ObjectId,
  policyId: String,
  name: String,
  description: String,
  provider: String,                          // 'aws', 'azure', 'gcp', 'all'
  services: [String],
  rules: [{
    ruleId: String,
    name: String,
    description: String,
    condition: Object,
    severity: String,
    remediation: Object
  }],
  frameworks: [String],
  isActive: Boolean,
  isCustom: Boolean,
  version: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### API Endpoints
```
POST   /api/v1/cloudarmor/accounts                  # Connect cloud account
GET    /api/v1/cloudarmor/accounts                  # List accounts
GET    /api/v1/cloudarmor/accounts/:id              # Get account details
PUT    /api/v1/cloudarmor/accounts/:id              # Update account
DELETE /api/v1/cloudarmor/accounts/:id              # Disconnect account
POST   /api/v1/cloudarmor/accounts/:id/scan         # Trigger scan

GET    /api/v1/cloudarmor/resources                 # List resources
GET    /api/v1/cloudarmor/resources/:id             # Get resource details
GET    /api/v1/cloudarmor/resources/:id/history     # Resource history

GET    /api/v1/cloudarmor/findings                  # List findings
GET    /api/v1/cloudarmor/findings/:id              # Get finding details
PATCH  /api/v1/cloudarmor/findings/:id              # Update finding
POST   /api/v1/cloudarmor/findings/:id/remediate    # Auto-remediate
GET    /api/v1/cloudarmor/findings/stats            # Finding statistics

POST   /api/v1/cloudarmor/policies                  # Create policy
GET    /api/v1/cloudarmor/policies                  # List policies
PUT    /api/v1/cloudarmor/policies/:id              # Update policy
DELETE /api/v1/cloudarmor/policies/:id              # Delete policy

GET    /api/v1/cloudarmor/compliance                # Compliance summary
GET    /api/v1/cloudarmor/compliance/:framework     # Framework details
GET    /api/v1/cloudarmor/dashboard                 # Dashboard data
GET    /health                                       # Health check
```

#### Frontend Components
```
frontend/src/
├── pages/
│   └── tools/
│       └── cloudarmor/
│           ├── CloudDashboard.tsx           # Main dashboard
│           ├── AccountManager.tsx           # Account connection
│           ├── ResourceInventory.tsx        # Resource list
│           ├── FindingsCenter.tsx           # Findings management
│           ├── ComplianceView.tsx           # Compliance status
│           ├── PolicyEditor.tsx             # Policy management
│           └── Remediation.tsx              # Remediation tracking
├── components/
│   └── cloudarmor/
│       ├── ProviderCard.tsx                 # Cloud provider card
│       ├── ResourceTree.tsx                 # Resource hierarchy
│       ├── FindingCard.tsx                  # Finding display
│       ├── ComplianceGauge.tsx              # Compliance score
│       ├── FrameworkMatrix.tsx              # Control matrix
│       ├── RemediationScript.tsx            # Fix script viewer
│       └── CloudMap.tsx                     # Cloud visualization
└── hooks/
    └── useCloudArmor.ts                     # API hooks
```

---

## 🪪 Tool 14: IdentityShield
### Identity & Access Management Security

#### Purpose
Comprehensive IAM security platform for identity governance, privileged access management, and access certification with AI-driven risk analysis.

#### Technology Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **ML Engine**: Python + Risk scoring
- **Integration**: Active Directory, Okta, Azure AD

#### Directory Structure
```
backend/tools/14-identityshield/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── identityController.js        # Identity management
│   │   │   ├── accessController.js          # Access management
│   │   │   ├── certificationController.js   # Access reviews
│   │   │   └── riskController.js            # Risk analysis
│   │   ├── models/
│   │   │   ├── Identity.js                  # User identity
│   │   │   ├── Access.js                    # Access grant
│   │   │   ├── Certification.js             # Access review
│   │   │   └── Role.js                      # Role definition
│   │   ├── services/
│   │   │   ├── identityService.js           # Identity logic
│   │   │   ├── accessService.js             # Access management
│   │   │   └── mlService.js                 # Risk scoring
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── access_risk.py                   # Access risk scoring
│   │   ├── anomaly_detector.py              # Behavior anomaly
│   │   ├── role_miner.py                    # Role discovery
│   │   └── peer_analysis.py                 # Peer group analysis
│   └── requirements.txt
└── README.md
```

#### Database Schema
```javascript
// Identity Model
{
  userId: ObjectId,
  identityId: String,
  username: String,
  email: String,
  displayName: String,
  type: String,                              // 'human', 'service', 'application'
  source: String,                            // 'ad', 'okta', 'azure_ad', 'local'
  department: String,
  title: String,
  manager: ObjectId,
  status: String,                            // 'active', 'inactive', 'suspended', 'terminated'
  attributes: Object,
  riskProfile: {
    score: Number,                           // 0-100
    level: String,                           // 'low', 'medium', 'high', 'critical'
    factors: [String],
    lastAssessed: Date
  },
  accessSummary: {
    totalAccess: Number,
    privilegedAccess: Number,
    sensitiveAccess: Number,
    lastCertified: Date
  },
  behaviorBaseline: {
    typicalHours: Object,
    typicalLocations: [String],
    typicalActions: [String]
  },
  createdAt: Date,
  updatedAt: Date
}

// Access Model
{
  userId: ObjectId,
  accessId: String,
  identity: ObjectId,
  resource: {
    type: String,                            // 'application', 'system', 'database', 'file_share', 'cloud_resource'
    identifier: String,
    name: String
  },
  entitlements: [{
    name: String,
    type: String,                            // 'role', 'group', 'permission'
    level: String,                           // 'read', 'write', 'admin', 'owner'
    sensitive: Boolean
  }],
  provisioningDetails: {
    method: String,                          // 'manual', 'automated', 'sod_exception'
    requestedBy: ObjectId,
    approvedBy: ObjectId,
    reason: String
  },
  riskScore: Number,
  status: String,                            // 'active', 'pending', 'revoked', 'expired'
  grantedAt: Date,
  expiresAt: Date,
  lastUsed: Date,
  lastCertified: Date,
  certificationHistory: [{
    campaign: ObjectId,
    decision: String,
    reviewer: ObjectId,
    date: Date
  }],
  createdAt: Date,
  updatedAt: Date
}

// Certification Model
{
  userId: ObjectId,
  certificationId: String,
  name: String,
  type: String,                              // 'user_access', 'role_membership', 'privileged_access', 'manager'
  scope: {
    identities: [ObjectId],
    resources: [String],
    departments: [String]
  },
  reviewers: [{
    identity: ObjectId,
    type: String,                            // 'manager', 'resource_owner', 'delegate'
    items: [ObjectId]
  }],
  schedule: {
    frequency: String,                       // 'quarterly', 'semi_annual', 'annual'
    startDate: Date,
    endDate: Date,
    reminder: Number                         // days before due
  },
  progress: {
    total: Number,
    completed: Number,
    approved: Number,
    revoked: Number,
    pending: Number
  },
  status: String,                            // 'draft', 'active', 'completed', 'cancelled'
  settings: {
    autoRevoke: Boolean,
    escalation: [Object]
  },
  createdAt: Date,
  completedAt: Date
}

// Role Model
{
  userId: ObjectId,
  roleId: String,
  name: String,
  description: String,
  type: String,                              // 'business', 'technical', 'privileged'
  permissions: [{
    resource: String,
    entitlements: [String]
  }],
  members: [ObjectId],
  owners: [ObjectId],
  riskLevel: String,
  sodRules: [{
    conflictsWith: ObjectId,
    reason: String
  }],
  metadata: {
    source: String,
    lastMined: Date,
    usage: Number
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### API Endpoints
```
GET    /api/v1/identityshield/identities            # List identities
GET    /api/v1/identityshield/identities/:id        # Get identity details
GET    /api/v1/identityshield/identities/:id/access # Get identity access
GET    /api/v1/identityshield/identities/:id/risk   # Get risk profile
POST   /api/v1/identityshield/identities/:id/analyze # AI analysis
POST   /api/v1/identityshield/identities/sync       # Sync from source

GET    /api/v1/identityshield/access                # List access grants
POST   /api/v1/identityshield/access                # Request access
PATCH  /api/v1/identityshield/access/:id            # Modify access
DELETE /api/v1/identityshield/access/:id            # Revoke access
GET    /api/v1/identityshield/access/orphaned       # Orphaned access

POST   /api/v1/identityshield/certifications        # Create campaign
GET    /api/v1/identityshield/certifications        # List campaigns
GET    /api/v1/identityshield/certifications/:id    # Campaign details
POST   /api/v1/identityshield/certifications/:id/decide  # Make decision
GET    /api/v1/identityshield/certifications/pending     # Pending reviews

GET    /api/v1/identityshield/roles                 # List roles
POST   /api/v1/identityshield/roles                 # Create role
PUT    /api/v1/identityshield/roles/:id             # Update role
POST   /api/v1/identityshield/roles/mine            # Role mining

GET    /api/v1/identityshield/dashboard             # Dashboard data
GET    /api/v1/identityshield/reports               # Reports
GET    /health                                       # Health check
```

#### Frontend Components
```
frontend/src/
├── pages/
│   └── tools/
│       └── identityshield/
│           ├── IAMDashboard.tsx             # Main dashboard
│           ├── IdentityDirectory.tsx        # Identity list
│           ├── IdentityDetail.tsx           # Identity details
│           ├── AccessCatalog.tsx            # Access inventory
│           ├── CertificationCampaigns.tsx   # Access reviews
│           ├── ReviewWorkspace.tsx          # Reviewer interface
│           ├── RoleManagement.tsx           # Role management
│           └── RiskAnalytics.tsx            # Risk dashboard
├── components/
│   └── identityshield/
│       ├── RiskScoreBadge.tsx               # Risk indicator
│       ├── AccessTree.tsx                   # Access hierarchy
│       ├── CertificationCard.tsx            # Review card
│       ├── DecisionButtons.tsx              # Approve/Revoke
│       ├── SoDViolation.tsx                 # SOD alert
│       ├── RoleMembership.tsx               # Role members
│       └── IdentityTimeline.tsx             # Identity events
└── hooks/
    └── useIdentityShield.ts                 # API hooks
```

---

## 🔐 Tool 15: CryptoVault
### Cryptographic Key & Secrets Management

#### Purpose
Enterprise secrets management platform for cryptographic keys, certificates, API keys, and sensitive credentials with HSM integration.

#### Technology Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB (encrypted)
- **ML Engine**: Python + Certificate analysis
- **Integration**: HSM, HashiCorp Vault, AWS KMS

#### Directory Structure
```
backend/tools/15-cryptovault/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── secretController.js          # Secret management
│   │   │   ├── keyController.js             # Key management
│   │   │   ├── certificateController.js     # Certificate management
│   │   │   └── auditController.js           # Audit logging
│   │   ├── models/
│   │   │   ├── Secret.js                    # Secret entry
│   │   │   ├── Key.js                       # Cryptographic key
│   │   │   ├── Certificate.js               # Certificate
│   │   │   └── AuditLog.js                  # Audit entry
│   │   ├── services/
│   │   │   ├── cryptoService.js             # Crypto operations
│   │   │   ├── vaultService.js              # Vault integration
│   │   │   └── mlService.js                 # Risk analysis
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── cert_analyzer.py                 # Certificate analysis
│   │   ├── key_strength.py                  # Key strength assessment
│   │   └── rotation_recommender.py          # Rotation recommendations
│   └── requirements.txt
└── README.md
```

#### Database Schema
```javascript
// Secret Model
{
  userId: ObjectId,
  secretId: String,
  name: String,
  description: String,
  type: String,                              // 'password', 'api_key', 'ssh_key', 'token', 'connection_string', 'generic'
  path: String,                              // Logical path
  value: String,                             // Encrypted
  metadata: {
    environment: String,                     // 'development', 'staging', 'production'
    application: String,
    owner: ObjectId,
    tags: [String]
  },
  rotation: {
    enabled: Boolean,
    frequency: Number,                       // days
    lastRotated: Date,
    nextRotation: Date,
    policy: ObjectId
  },
  access: {
    allowedUsers: [ObjectId],
    allowedRoles: [String],
    allowedIPs: [String]
  },
  versioning: {
    current: Number,
    history: [{
      version: Number,
      createdAt: Date,
      createdBy: ObjectId
    }]
  },
  status: String,                            // 'active', 'rotating', 'compromised', 'archived'
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// Key Model
{
  userId: ObjectId,
  keyId: String,
  name: String,
  description: String,
  type: String,                              // 'symmetric', 'asymmetric', 'hmac'
  algorithm: String,                         // 'AES-256', 'RSA-4096', 'EC-P384'
  keySize: Number,
  usage: [String],                           // 'encrypt', 'decrypt', 'sign', 'verify', 'wrap', 'unwrap'
  material: {
    publicKey: String,
    privateKey: String,                      // Encrypted or HSM reference
    keyHandle: String                        // HSM key handle
  },
  metadata: {
    environment: String,
    application: String,
    owner: ObjectId,
    hsm: String
  },
  rotation: {
    enabled: Boolean,
    frequency: Number,
    lastRotated: Date,
    policy: ObjectId
  },
  lifecycle: {
    created: Date,
    activated: Date,
    expires: Date,
    destroyed: Date
  },
  status: String,                            // 'pre_active', 'active', 'suspended', 'deactivated', 'compromised', 'destroyed'
  createdAt: Date,
  updatedAt: Date
}

// Certificate Model
{
  userId: ObjectId,
  certificateId: String,
  name: String,
  type: String,                              // 'tls', 'code_signing', 'client', 'ca', 'intermediate'
  subject: {
    commonName: String,
    organization: String,
    organizationalUnit: String,
    country: String
  },
  issuer: {
    commonName: String,
    organization: String,
    isSelfSigned: Boolean
  },
  san: [String],                             // Subject Alternative Names
  serialNumber: String,
  fingerprints: {
    sha1: String,
    sha256: String
  },
  validity: {
    notBefore: Date,
    notAfter: Date,
    daysRemaining: Number
  },
  keyInfo: {
    algorithm: String,
    keySize: Number,
    keyId: ObjectId                          // Reference to Key
  },
  chain: [String],                           // Certificate chain
  usage: {
    applications: [String],
    domains: [String],
    hosts: [String]
  },
  renewal: {
    autoRenew: Boolean,
    renewalDays: Number,
    lastRenewed: Date,
    acmeEnabled: Boolean
  },
  status: String,                            // 'valid', 'expiring_soon', 'expired', 'revoked'
  createdAt: Date,
  updatedAt: Date
}

// AuditLog Model
{
  userId: ObjectId,
  logId: String,
  timestamp: Date,
  actor: {
    userId: ObjectId,
    username: String,
    ip: String,
    userAgent: String
  },
  action: String,                            // 'create', 'read', 'update', 'delete', 'rotate', 'revoke'
  resource: {
    type: String,                            // 'secret', 'key', 'certificate'
    id: ObjectId,
    name: String,
    path: String
  },
  details: {
    before: Object,
    after: Object,
    reason: String
  },
  result: String,                            // 'success', 'failure', 'denied'
  metadata: Object
}
```

#### API Endpoints
```
POST   /api/v1/cryptovault/secrets                  # Create secret
GET    /api/v1/cryptovault/secrets                  # List secrets
GET    /api/v1/cryptovault/secrets/:id              # Get secret (value)
PUT    /api/v1/cryptovault/secrets/:id              # Update secret
DELETE /api/v1/cryptovault/secrets/:id              # Delete secret
POST   /api/v1/cryptovault/secrets/:id/rotate       # Rotate secret
GET    /api/v1/cryptovault/secrets/:id/versions     # Version history

POST   /api/v1/cryptovault/keys                     # Generate key
GET    /api/v1/cryptovault/keys                     # List keys
GET    /api/v1/cryptovault/keys/:id                 # Get key metadata
POST   /api/v1/cryptovault/keys/:id/rotate          # Rotate key
POST   /api/v1/cryptovault/keys/:id/encrypt         # Encrypt data
POST   /api/v1/cryptovault/keys/:id/decrypt         # Decrypt data
POST   /api/v1/cryptovault/keys/:id/sign            # Sign data
POST   /api/v1/cryptovault/keys/:id/verify          # Verify signature

POST   /api/v1/cryptovault/certificates             # Import certificate
GET    /api/v1/cryptovault/certificates             # List certificates
GET    /api/v1/cryptovault/certificates/:id         # Get certificate
POST   /api/v1/cryptovault/certificates/generate    # Generate CSR
POST   /api/v1/cryptovault/certificates/:id/renew   # Renew certificate
GET    /api/v1/cryptovault/certificates/expiring    # Expiring certs

GET    /api/v1/cryptovault/audit                    # Audit logs
GET    /api/v1/cryptovault/dashboard                # Dashboard
GET    /health                                       # Health check
```

#### Frontend Components
```
frontend/src/
├── pages/
│   └── tools/
│       └── cryptovault/
│           ├── VaultDashboard.tsx           # Main dashboard
│           ├── SecretManager.tsx            # Secret management
│           ├── SecretDetail.tsx             # Secret details
│           ├── KeyManagement.tsx            # Key management
│           ├── CertificateManager.tsx       # Certificate management
│           ├── CertificateDetail.tsx        # Cert details
│           ├── RotationPolicy.tsx           # Rotation policies
│           └── AuditViewer.tsx              # Audit logs
├── components/
│   └── cryptovault/
│       ├── SecretCard.tsx                   # Secret display
│       ├── KeyStrengthMeter.tsx             # Key strength
│       ├── CertExpiryBadge.tsx              # Expiry indicator
│       ├── CertChainViewer.tsx              # Certificate chain
│       ├── RotationSchedule.tsx             # Rotation calendar
│       ├── AuditTimeline.tsx                # Audit history
│       └── SecretValueCopy.tsx              # Secure copy
└── hooks/
    └── useCryptoVault.ts                    # API hooks
```

---

## 🔗 Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │Incident │ │Network  │ │Cloud    │ │Identity │ │Crypto   │   │
│  │Response │ │Guard    │ │Armor    │ │Shield   │ │Vault    │   │
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
   │ :4011  │  │ :4012  │  │ :4013  │  │ :4014  │  │ :4015  │
   │ IR     │  │Network │  │Cloud   │  │Identity│  │Crypto  │
   └────┬───┘  └────┬───┘  └────┬───┘  └────┬───┘  └────┬───┘
        │           │           │           │           │
        ▼           ▼           ▼           ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MONGODB ATLAS CLUSTER                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │incidentresp  │ │ networkguard │ │ cloudarmor   │ ...        │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
        │           │           │           │           │
        ▼           ▼           ▼           ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL INTEGRATIONS                      │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │
│  │ SIEM   │  │NetFlow │  │ AWS/   │  │ AD/    │  │  HSM   │   │
│  │ EDR    │  │ PCAP   │  │ Azure  │  │ Okta   │  │  KMS   │   │
│  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Implementation Checklist

### Tool 11 - IncidentResponse
- [ ] Create directory structure
- [ ] Implement Incident model
- [ ] Implement Playbook model
- [ ] Implement Task model
- [ ] Implement Evidence model
- [ ] Create incident controller
- [ ] Create playbook controller
- [ ] Create task controller
- [ ] Create forensics controller
- [ ] Setup routes
- [ ] Create ML service for analysis
- [ ] Test health endpoint
- [ ] Deploy to EC2

### Tool 12 - NetworkGuard
- [ ] Create directory structure
- [ ] Implement Sensor model
- [ ] Implement Alert model
- [ ] Implement TrafficFlow model
- [ ] Implement Rule model
- [ ] Create sensor controller
- [ ] Create alert controller
- [ ] Create traffic controller
- [ ] Create rule controller
- [ ] Setup routes
- [ ] Create ML service for anomaly detection
- [ ] Test health endpoint
- [ ] Deploy to EC2

### Tool 13 - CloudArmor
- [ ] Create directory structure
- [ ] Implement CloudAccount model
- [ ] Implement Resource model
- [ ] Implement Finding model
- [ ] Implement Policy model
- [ ] Create AWS service integration
- [ ] Create Azure service integration
- [ ] Create GCP service integration
- [ ] Create controllers
- [ ] Setup routes
- [ ] Create ML service
- [ ] Test health endpoint
- [ ] Deploy to EC2

### Tool 14 - IdentityShield
- [ ] Create directory structure
- [ ] Implement Identity model
- [ ] Implement Access model
- [ ] Implement Certification model
- [ ] Implement Role model
- [ ] Create identity controller
- [ ] Create access controller
- [ ] Create certification controller
- [ ] Create risk controller
- [ ] Setup routes
- [ ] Create ML service for risk scoring
- [ ] Test health endpoint
- [ ] Deploy to EC2

### Tool 15 - CryptoVault
- [ ] Create directory structure
- [ ] Implement Secret model
- [ ] Implement Key model
- [ ] Implement Certificate model
- [ ] Implement AuditLog model
- [ ] Create secret controller
- [ ] Create key controller
- [ ] Create certificate controller
- [ ] Create audit controller
- [ ] Setup routes
- [ ] Implement crypto operations
- [ ] Create ML service
- [ ] Test health endpoint
- [ ] Deploy to EC2

---

*Documentation generated: December 29, 2025*
*VictoryKit Phase 4 - Backend API Implementation*
