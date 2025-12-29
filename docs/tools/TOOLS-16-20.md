# VictoryKit Security Tools Documentation
## Tools 16-20: Access Control & Audit

---

## 📊 Overview Dashboard

| Tool | Name | Port | DB | Status | Priority |
|------|------|------|-----|--------|----------|
| 16 | AccessControl | 4016 | victorykit_accesscontrol | 📝 Planned | P1 |
| 17 | AuditTrail | 4017 | victorykit_audittrail | 📝 Planned | P1 |
| 18 | ThreatModel | 4018 | victorykit_threatmodel | 📝 Planned | P1 |
| 19 | RiskAssess | 4019 | victorykit_riskassess | 📝 Planned | P1 |
| 20 | SecurityScore | 4020 | victorykit_securityscore | 📝 Planned | P1 |

---

## 🔒 Tool 16: AccessControl
### Role-Based Access Control Management

#### Purpose
Comprehensive RBAC/ABAC management platform for defining, enforcing, and auditing access control policies across applications and resources.

#### Technology Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **ML Engine**: Python + Policy analysis
- **Integration**: LDAP, OAuth, OIDC

#### Directory Structure
```
backend/tools/16-accesscontrol/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── policyController.js          # Policy management
│   │   │   ├── roleController.js            # Role management
│   │   │   ├── permissionController.js      # Permission management
│   │   │   └── evaluationController.js      # Policy evaluation
│   │   ├── models/
│   │   │   ├── Policy.js                    # Access policy
│   │   │   ├── Role.js                      # User role
│   │   │   ├── Permission.js                # Permission
│   │   │   └── Assignment.js                # Role assignment
│   │   ├── services/
│   │   │   ├── policyService.js             # Policy logic
│   │   │   ├── evaluationService.js         # Policy evaluation
│   │   │   └── mlService.js                 # AI policy analysis
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── policy_optimizer.py              # Policy optimization
│   │   ├── conflict_detector.py             # Conflict detection
│   │   └── recommendation_engine.py         # Access recommendations
│   └── requirements.txt
└── README.md
```

#### Database Schema
```javascript
// Policy Model
{
  userId: ObjectId,
  policyId: String,
  name: String,
  description: String,
  type: String,                              // 'rbac', 'abac', 'pbac', 'hybrid'
  effect: String,                            // 'allow', 'deny'
  priority: Number,
  subjects: {
    users: [String],
    roles: [String],
    groups: [String],
    attributes: Object
  },
  resources: {
    types: [String],
    identifiers: [String],
    patterns: [String],
    attributes: Object
  },
  actions: [String],                         // 'read', 'write', 'delete', 'execute', 'admin'
  conditions: [{
    attribute: String,
    operator: String,
    value: Object
  }],
  context: {
    timeRestrictions: [{
      days: [String],
      startTime: String,
      endTime: String,
      timezone: String
    }],
    locationRestrictions: [String],
    ipRestrictions: [String],
    mfaRequired: Boolean
  },
  scope: {
    applications: [String],
    environments: [String]
  },
  isActive: Boolean,
  version: Number,
  effectiveFrom: Date,
  effectiveTo: Date,
  createdAt: Date,
  updatedAt: Date
}

// Role Model
{
  userId: ObjectId,
  roleId: String,
  name: String,
  displayName: String,
  description: String,
  type: String,                              // 'system', 'application', 'custom'
  scope: String,                             // 'global', 'organization', 'project', 'resource'
  permissions: [{
    permissionId: ObjectId,
    resource: String,
    actions: [String]
  }],
  inheritsFrom: [ObjectId],                  // Parent roles
  constraints: {
    maxAssignments: Number,
    requireApproval: Boolean,
    approvers: [ObjectId],
    expiryDays: Number
  },
  metadata: {
    riskLevel: String,
    privileged: Boolean,
    sensitive: Boolean,
    owner: ObjectId
  },
  memberCount: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Permission Model
{
  userId: ObjectId,
  permissionId: String,
  name: String,
  description: String,
  resource: {
    type: String,
    identifier: String,
    pattern: String
  },
  actions: [String],
  constraints: Object,
  scope: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Assignment Model
{
  userId: ObjectId,
  assignmentId: String,
  principalType: String,                     // 'user', 'group', 'service_account'
  principalId: String,
  roleId: ObjectId,
  scope: {
    type: String,                            // 'global', 'organization', 'project', 'resource'
    resourceId: String
  },
  grantedBy: ObjectId,
  grantedAt: Date,
  expiresAt: Date,
  reason: String,
  status: String,                            // 'active', 'pending_approval', 'expired', 'revoked'
  approvals: [{
    approver: ObjectId,
    decision: String,
    timestamp: Date,
    comments: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### API Endpoints
```
POST   /api/v1/accesscontrol/policies               # Create policy
GET    /api/v1/accesscontrol/policies               # List policies
GET    /api/v1/accesscontrol/policies/:id           # Get policy
PUT    /api/v1/accesscontrol/policies/:id           # Update policy
DELETE /api/v1/accesscontrol/policies/:id           # Delete policy
POST   /api/v1/accesscontrol/policies/evaluate      # Evaluate access
POST   /api/v1/accesscontrol/policies/analyze       # AI analysis

POST   /api/v1/accesscontrol/roles                  # Create role
GET    /api/v1/accesscontrol/roles                  # List roles
GET    /api/v1/accesscontrol/roles/:id              # Get role
PUT    /api/v1/accesscontrol/roles/:id              # Update role
DELETE /api/v1/accesscontrol/roles/:id              # Delete role
GET    /api/v1/accesscontrol/roles/:id/members      # Role members

POST   /api/v1/accesscontrol/permissions            # Create permission
GET    /api/v1/accesscontrol/permissions            # List permissions
PUT    /api/v1/accesscontrol/permissions/:id        # Update permission
DELETE /api/v1/accesscontrol/permissions/:id        # Delete permission

POST   /api/v1/accesscontrol/assignments            # Assign role
GET    /api/v1/accesscontrol/assignments            # List assignments
DELETE /api/v1/accesscontrol/assignments/:id        # Revoke assignment
POST   /api/v1/accesscontrol/assignments/:id/approve # Approve assignment

GET    /api/v1/accesscontrol/dashboard              # Dashboard
GET    /health                                       # Health check
```

#### Frontend Components
```
frontend/src/
├── pages/
│   └── tools/
│       └── accesscontrol/
│           ├── ACDashboard.tsx              # Main dashboard
│           ├── PolicyEditor.tsx             # Policy management
│           ├── PolicyBuilder.tsx            # Visual policy builder
│           ├── RoleManager.tsx              # Role management
│           ├── PermissionCatalog.tsx        # Permission list
│           ├── AssignmentManager.tsx        # Role assignments
│           └── AccessSimulator.tsx          # Test access
├── components/
│   └── accesscontrol/
│       ├── PolicyCard.tsx                   # Policy display
│       ├── RoleHierarchy.tsx                # Role tree
│       ├── PermissionMatrix.tsx             # Permission matrix
│       ├── ConditionBuilder.tsx             # Condition UI
│       ├── AccessDecision.tsx               # Allow/Deny display
│       └── AssignmentTimeline.tsx           # Assignment history
└── hooks/
    └── useAccessControl.ts                  # API hooks
```

---

## 📜 Tool 17: AuditTrail
### Comprehensive Activity Audit Logging

#### Purpose
Centralized audit logging platform for tracking user activities, system events, and compliance-required audit trails with tamper-proof storage.

#### Technology Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB + Append-only log
- **ML Engine**: Python + Anomaly detection
- **Storage**: Immutable log storage

#### Directory Structure
```
backend/tools/17-audittrail/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── logController.js             # Log management
│   │   │   ├── searchController.js          # Log search
│   │   │   ├── reportController.js          # Audit reports
│   │   │   └── alertController.js           # Audit alerts
│   │   ├── models/
│   │   │   ├── AuditLog.js                  # Audit entry
│   │   │   ├── LogSource.js                 # Log source
│   │   │   ├── AlertRule.js                 # Alert rule
│   │   │   └── Report.js                    # Audit report
│   │   ├── services/
│   │   │   ├── logService.js                # Logging logic
│   │   │   ├── integrityService.js          # Tamper detection
│   │   │   └── mlService.js                 # Anomaly detection
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── anomaly_detector.py              # Unusual activity
│   │   ├── pattern_analyzer.py              # Activity patterns
│   │   └── behavior_baseline.py             # Baseline behavior
│   └── requirements.txt
└── README.md
```

#### Database Schema
```javascript
// AuditLog Model
{
  logId: String,                             // Unique, immutable
  timestamp: Date,
  source: {
    application: String,
    service: String,
    host: String,
    ip: String
  },
  actor: {
    type: String,                            // 'user', 'service', 'system', 'anonymous'
    id: String,
    username: String,
    email: String,
    roles: [String],
    session: String
  },
  action: {
    type: String,                            // 'create', 'read', 'update', 'delete', 'execute', 'login', 'logout', 'export'
    category: String,
    name: String,
    description: String
  },
  resource: {
    type: String,
    id: String,
    name: String,
    path: String
  },
  request: {
    method: String,
    url: String,
    headers: Object,
    query: Object,
    body: Object                             // Sanitized
  },
  response: {
    status: Number,
    duration: Number
  },
  context: {
    correlationId: String,
    parentId: String,
    geo: Object,
    userAgent: String,
    device: Object
  },
  outcome: {
    status: String,                          // 'success', 'failure', 'partial', 'denied'
    reason: String,
    error: Object
  },
  changes: {
    before: Object,
    after: Object,
    diff: [Object]
  },
  risk: {
    score: Number,
    factors: [String],
    anomaly: Boolean
  },
  tags: [String],
  hash: String,                              // Integrity hash
  previousHash: String,                      // Chain link
  createdAt: Date
}

// LogSource Model
{
  userId: ObjectId,
  sourceId: String,
  name: String,
  type: String,                              // 'application', 'api', 'database', 'cloud', 'siem'
  connection: {
    type: String,                            // 'push', 'pull', 'agent'
    endpoint: String,
    credentials: Object
  },
  parsing: {
    format: String,                          // 'json', 'syslog', 'cef', 'custom'
    rules: [Object]
  },
  filters: {
    include: [String],
    exclude: [String],
    sampling: Number
  },
  status: String,                            // 'active', 'inactive', 'error'
  statistics: {
    lastReceived: Date,
    eventsToday: Number,
    eventsTotal: Number
  },
  createdAt: Date,
  updatedAt: Date
}

// AlertRule Model
{
  userId: ObjectId,
  ruleId: String,
  name: String,
  description: String,
  enabled: Boolean,
  condition: {
    query: Object,
    threshold: {
      type: String,                          // 'count', 'unique', 'frequency'
      operator: String,
      value: Number,
      window: Number                         // seconds
    }
  },
  severity: String,
  actions: [{
    type: String,                            // 'email', 'slack', 'webhook', 'incident'
    target: String,
    template: String
  }],
  cooldown: Number,
  lastTriggered: Date,
  triggerCount: Number,
  createdAt: Date,
  updatedAt: Date
}

// Report Model
{
  userId: ObjectId,
  reportId: String,
  name: String,
  type: String,                              // 'activity', 'compliance', 'access', 'security'
  parameters: {
    dateRange: Object,
    users: [String],
    actions: [String],
    resources: [String]
  },
  schedule: {
    enabled: Boolean,
    frequency: String,
    recipients: [String]
  },
  format: String,                            // 'pdf', 'csv', 'json'
  status: String,
  lastGenerated: Date,
  fileUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### API Endpoints
```
POST   /api/v1/audittrail/logs                      # Create log entry
GET    /api/v1/audittrail/logs                      # Search logs
GET    /api/v1/audittrail/logs/:id                  # Get log details
GET    /api/v1/audittrail/logs/stream               # Stream logs (SSE)
GET    /api/v1/audittrail/logs/export               # Export logs
POST   /api/v1/audittrail/logs/verify               # Verify integrity

POST   /api/v1/audittrail/sources                   # Add log source
GET    /api/v1/audittrail/sources                   # List sources
PUT    /api/v1/audittrail/sources/:id               # Update source
DELETE /api/v1/audittrail/sources/:id               # Remove source

POST   /api/v1/audittrail/alerts                    # Create alert rule
GET    /api/v1/audittrail/alerts                    # List alert rules
PUT    /api/v1/audittrail/alerts/:id                # Update alert rule
DELETE /api/v1/audittrail/alerts/:id                # Delete alert rule
GET    /api/v1/audittrail/alerts/history            # Alert history

POST   /api/v1/audittrail/reports                   # Create report
GET    /api/v1/audittrail/reports                   # List reports
GET    /api/v1/audittrail/reports/:id               # Get report
POST   /api/v1/audittrail/reports/:id/generate      # Generate report

GET    /api/v1/audittrail/dashboard                 # Dashboard
GET    /api/v1/audittrail/analytics                 # Analytics
GET    /health                                       # Health check
```

#### Frontend Components
```
frontend/src/
├── pages/
│   └── tools/
│       └── audittrail/
│           ├── AuditDashboard.tsx           # Main dashboard
│           ├── LogExplorer.tsx              # Log search/browse
│           ├── LogDetail.tsx                # Log entry details
│           ├── LiveStream.tsx               # Real-time logs
│           ├── SourceManager.tsx            # Log sources
│           ├── AlertRules.tsx               # Alert configuration
│           ├── ReportBuilder.tsx            # Report generator
│           └── Analytics.tsx                # Activity analytics
├── components/
│   └── audittrail/
│       ├── LogTable.tsx                     # Log table
│       ├── LogTimeline.tsx                  # Timeline view
│       ├── QueryBuilder.tsx                 # Search query builder
│       ├── ActivityChart.tsx                # Activity charts
│       ├── DiffViewer.tsx                   # Change diff
│       ├── IntegrityBadge.tsx               # Hash verification
│       └── AlertCard.tsx                    # Alert display
└── hooks/
    └── useAuditTrail.ts                     # API hooks
```

---

## 🎯 Tool 18: ThreatModel
### AI-Assisted Threat Modeling Platform

#### Purpose
Automated threat modeling with STRIDE/PASTA methodologies, attack tree generation, and AI-driven threat identification for applications and systems.

#### Technology Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **ML Engine**: Python + LLM for threat analysis
- **Diagrams**: Mermaid, Draw.io integration

#### Directory Structure
```
backend/tools/18-threatmodel/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── modelController.js           # Threat model management
│   │   │   ├── threatController.js          # Threat management
│   │   │   ├── mitigationController.js      # Mitigation tracking
│   │   │   └── diagramController.js         # Diagram management
│   │   ├── models/
│   │   │   ├── ThreatModel.js               # Threat model
│   │   │   ├── Threat.js                    # Identified threat
│   │   │   ├── Mitigation.js                # Mitigation
│   │   │   └── Component.js                 # System component
│   │   ├── services/
│   │   │   ├── threatService.js             # Threat logic
│   │   │   ├── analysisService.js           # Analysis service
│   │   │   └── mlService.js                 # AI threat identification
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── threat_identifier.py             # AI threat finding
│   │   ├── attack_tree_generator.py         # Attack tree generation
│   │   └── mitigation_recommender.py        # Mitigation suggestions
│   └── requirements.txt
└── README.md
```

#### Database Schema
```javascript
// ThreatModel Model
{
  userId: ObjectId,
  modelId: String,
  name: String,
  description: String,
  project: {
    name: String,
    type: String,                            // 'web_application', 'mobile_app', 'api', 'microservices', 'infrastructure'
    version: String,
    team: [ObjectId]
  },
  methodology: String,                       // 'stride', 'pasta', 'attack_trees', 'custom'
  scope: {
    inScope: [String],
    outOfScope: [String],
    assumptions: [String],
    constraints: [String]
  },
  diagram: {
    type: String,                            // 'dfd', 'sequence', 'architecture'
    data: Object,                            // Diagram JSON
    imageUrl: String
  },
  components: [ObjectId],
  threats: [ObjectId],
  statistics: {
    totalThreats: Number,
    critical: Number,
    high: Number,
    medium: Number,
    low: Number,
    mitigated: Number,
    accepted: Number
  },
  status: String,                            // 'draft', 'in_progress', 'review', 'approved', 'archived'
  reviewers: [{
    user: ObjectId,
    status: String,
    comments: String,
    date: Date
  }],
  createdAt: Date,
  updatedAt: Date
}

// Threat Model
{
  userId: ObjectId,
  modelId: ObjectId,
  threatId: String,
  title: String,
  description: String,
  category: String,                          // STRIDE: 'spoofing', 'tampering', 'repudiation', 'information_disclosure', 'dos', 'elevation'
  attackVector: String,
  target: {
    componentId: ObjectId,
    type: String,
    name: String
  },
  prerequisites: [String],
  attackSteps: [String],
  impact: {
    confidentiality: String,                 // 'none', 'low', 'medium', 'high'
    integrity: String,
    availability: String,
    description: String
  },
  likelihood: {
    value: String,                           // 'low', 'medium', 'high', 'very_high'
    factors: [String]
  },
  riskRating: {
    score: Number,
    level: String
  },
  cweId: String,
  capecId: String,
  mitreTechnique: String,
  mitigations: [ObjectId],
  status: String,                            // 'identified', 'analyzing', 'mitigated', 'accepted', 'transferred'
  evidence: [String],
  createdAt: Date,
  updatedAt: Date
}

// Mitigation Model
{
  userId: ObjectId,
  threatId: ObjectId,
  mitigationId: String,
  title: String,
  description: String,
  type: String,                              // 'preventive', 'detective', 'corrective', 'compensating'
  implementation: {
    status: String,                          // 'planned', 'in_progress', 'implemented', 'verified'
    owner: ObjectId,
    effort: String,
    cost: String,
    dueDate: Date
  },
  controls: [{
    type: String,
    description: String,
    reference: String
  }],
  effectiveness: {
    rating: String,                          // 'low', 'medium', 'high'
    residualRisk: String,
    notes: String
  },
  verification: {
    method: String,
    evidence: String,
    verifiedBy: ObjectId,
    verifiedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}

// Component Model
{
  userId: ObjectId,
  modelId: ObjectId,
  componentId: String,
  name: String,
  description: String,
  type: String,                              // 'process', 'data_store', 'external_entity', 'data_flow', 'trust_boundary'
  technology: {
    stack: [String],
    platform: String,
    hosting: String
  },
  dataHandled: [{
    type: String,
    classification: String,
    examples: [String]
  }],
  trustLevel: String,                        // 'trusted', 'semi_trusted', 'untrusted'
  connections: [{
    targetId: ObjectId,
    direction: String,
    dataFlow: String,
    protocol: String,
    encrypted: Boolean
  }],
  securityControls: [String],
  threats: [ObjectId],
  position: {                                // For diagram
    x: Number,
    y: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### API Endpoints
```
POST   /api/v1/threatmodel/models                   # Create threat model
GET    /api/v1/threatmodel/models                   # List models
GET    /api/v1/threatmodel/models/:id               # Get model details
PUT    /api/v1/threatmodel/models/:id               # Update model
DELETE /api/v1/threatmodel/models/:id               # Delete model
POST   /api/v1/threatmodel/models/:id/analyze       # AI analysis
POST   /api/v1/threatmodel/models/:id/export        # Export model
GET    /api/v1/threatmodel/models/:id/report        # Generate report

POST   /api/v1/threatmodel/threats                  # Create threat
GET    /api/v1/threatmodel/threats                  # List threats
GET    /api/v1/threatmodel/threats/:id              # Get threat details
PUT    /api/v1/threatmodel/threats/:id              # Update threat
DELETE /api/v1/threatmodel/threats/:id              # Delete threat
POST   /api/v1/threatmodel/threats/suggest          # AI threat suggestions

POST   /api/v1/threatmodel/mitigations              # Create mitigation
GET    /api/v1/threatmodel/mitigations              # List mitigations
PUT    /api/v1/threatmodel/mitigations/:id          # Update mitigation
DELETE /api/v1/threatmodel/mitigations/:id          # Delete mitigation
POST   /api/v1/threatmodel/mitigations/recommend    # AI recommendations

POST   /api/v1/threatmodel/components               # Add component
GET    /api/v1/threatmodel/components               # List components
PUT    /api/v1/threatmodel/components/:id           # Update component
DELETE /api/v1/threatmodel/components/:id           # Delete component

GET    /api/v1/threatmodel/dashboard                # Dashboard
GET    /health                                       # Health check
```

#### Frontend Components
```
frontend/src/
├── pages/
│   └── tools/
│       └── threatmodel/
│           ├── TMDashboard.tsx              # Main dashboard
│           ├── ModelList.tsx                # Model list
│           ├── ModelEditor.tsx              # Model editor
│           ├── DiagramEditor.tsx            # DFD editor
│           ├── ThreatLibrary.tsx            # Threat catalog
│           ├── ThreatDetail.tsx             # Threat details
│           ├── MitigationTracker.tsx        # Mitigation tracking
│           └── ReportView.tsx               # Model report
├── components/
│   └── threatmodel/
│       ├── DFDCanvas.tsx                    # Diagram canvas
│       ├── ComponentNode.tsx                # Component node
│       ├── DataFlowLine.tsx                 # Data flow line
│       ├── ThreatCard.tsx                   # Threat card
│       ├── STRIDEMatrix.tsx                 # STRIDE matrix
│       ├── RiskMatrix.tsx                   # Risk heatmap
│       ├── AttackTree.tsx                   # Attack tree viz
│       └── MitigationProgress.tsx           # Progress tracker
└── hooks/
    └── useThreatModel.ts                    # API hooks
```

---

## ⚠️ Tool 19: RiskAssess
### Enterprise Risk Assessment Platform

#### Purpose
Comprehensive risk assessment and management platform with quantitative and qualitative methodologies, risk registers, and automated risk scoring.

#### Technology Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **ML Engine**: Python + Risk models
- **Integration**: GRC platforms

#### Directory Structure
```
backend/tools/19-riskassess/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── assessmentController.js      # Assessment management
│   │   │   ├── riskController.js            # Risk management
│   │   │   ├── controlController.js         # Control management
│   │   │   └── reportController.js          # Risk reports
│   │   ├── models/
│   │   │   ├── Assessment.js                # Risk assessment
│   │   │   ├── Risk.js                      # Risk item
│   │   │   ├── Control.js                   # Control measure
│   │   │   └── RiskRegister.js              # Risk register
│   │   ├── services/
│   │   │   ├── riskService.js               # Risk logic
│   │   │   ├── scoringService.js            # Risk scoring
│   │   │   └── mlService.js                 # AI risk analysis
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── risk_predictor.py                # Risk prediction
│   │   ├── impact_analyzer.py               # Impact analysis
│   │   └── trend_forecaster.py              # Risk trend forecasting
│   └── requirements.txt
└── README.md
```

#### Database Schema
```javascript
// Assessment Model
{
  userId: ObjectId,
  assessmentId: String,
  name: String,
  description: String,
  type: String,                              // 'security', 'operational', 'compliance', 'vendor', 'project'
  methodology: String,                       // 'qualitative', 'quantitative', 'hybrid', 'fair'
  scope: {
    departments: [String],
    systems: [String],
    processes: [String],
    vendors: [String]
  },
  framework: String,                         // 'nist', 'iso31000', 'cobit', 'custom'
  team: {
    owner: ObjectId,
    assessors: [ObjectId],
    reviewers: [ObjectId]
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    frequency: String                        // 'one_time', 'quarterly', 'annual'
  },
  progress: {
    total: Number,
    completed: Number,
    percentage: Number
  },
  summary: {
    totalRisks: Number,
    critical: Number,
    high: Number,
    medium: Number,
    low: Number,
    averageRiskScore: Number,
    trendDirection: String
  },
  status: String,                            // 'draft', 'in_progress', 'review', 'completed', 'archived'
  createdAt: Date,
  updatedAt: Date
}

// Risk Model
{
  userId: ObjectId,
  assessmentId: ObjectId,
  riskId: String,
  title: String,
  description: String,
  category: String,                          // 'cyber', 'operational', 'compliance', 'financial', 'reputational', 'strategic'
  subcategory: String,
  source: {
    type: String,                            // 'internal', 'external', 'third_party'
    details: String
  },
  owner: ObjectId,
  inherentRisk: {
    likelihood: Number,                      // 1-5
    impact: Number,                          // 1-5
    score: Number,                           // Calculated
    level: String                            // 'critical', 'high', 'medium', 'low'
  },
  residualRisk: {
    likelihood: Number,
    impact: Number,
    score: Number,
    level: String
  },
  impactAreas: {
    financial: {
      min: Number,
      max: Number,
      expected: Number
    },
    operational: String,
    reputational: String,
    regulatory: String
  },
  controls: [{
    controlId: ObjectId,
    effectiveness: String,
    status: String
  }],
  treatment: {
    strategy: String,                        // 'mitigate', 'accept', 'transfer', 'avoid'
    plan: String,
    dueDate: Date,
    status: String
  },
  kris: [{                                   // Key Risk Indicators
    name: String,
    threshold: Object,
    currentValue: Number,
    status: String
  }],
  history: [{
    date: Date,
    inherentScore: Number,
    residualScore: Number,
    notes: String
  }],
  status: String,                            // 'identified', 'assessed', 'treating', 'monitored', 'closed'
  createdAt: Date,
  updatedAt: Date
}

// Control Model
{
  userId: ObjectId,
  controlId: String,
  name: String,
  description: String,
  type: String,                              // 'preventive', 'detective', 'corrective'
  category: String,                          // 'technical', 'administrative', 'physical'
  owner: ObjectId,
  implementation: {
    status: String,                          // 'planned', 'in_progress', 'implemented', 'ineffective'
    date: Date,
    evidence: String
  },
  testing: {
    frequency: String,
    lastTested: Date,
    result: String,
    notes: String
  },
  effectiveness: {
    rating: String,                          // 'not_effective', 'partially_effective', 'effective', 'highly_effective'
    score: Number,                           // 0-100
    factors: [String]
  },
  relatedRisks: [ObjectId],
  frameworks: [{
    name: String,
    controlId: String
  }],
  cost: {
    implementation: Number,
    annual: Number
  },
  createdAt: Date,
  updatedAt: Date
}

// RiskRegister Model
{
  userId: ObjectId,
  registerId: String,
  name: String,
  description: String,
  scope: String,                             // 'enterprise', 'department', 'project', 'system'
  owner: ObjectId,
  risks: [ObjectId],
  summary: {
    totalRisks: Number,
    byCategory: Object,
    byLevel: Object,
    averageScore: Number,
    trend: [Object]
  },
  reporting: {
    frequency: String,
    stakeholders: [ObjectId],
    lastReported: Date
  },
  thresholds: {
    riskAppetite: Number,
    tolerance: Number,
    escalation: [Object]
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### API Endpoints
```
POST   /api/v1/riskassess/assessments               # Create assessment
GET    /api/v1/riskassess/assessments               # List assessments
GET    /api/v1/riskassess/assessments/:id           # Get assessment
PUT    /api/v1/riskassess/assessments/:id           # Update assessment
DELETE /api/v1/riskassess/assessments/:id           # Delete assessment
POST   /api/v1/riskassess/assessments/:id/complete  # Complete assessment
GET    /api/v1/riskassess/assessments/:id/report    # Generate report

POST   /api/v1/riskassess/risks                     # Create risk
GET    /api/v1/riskassess/risks                     # List risks
GET    /api/v1/riskassess/risks/:id                 # Get risk details
PUT    /api/v1/riskassess/risks/:id                 # Update risk
DELETE /api/v1/riskassess/risks/:id                 # Delete risk
POST   /api/v1/riskassess/risks/:id/score           # Calculate score
POST   /api/v1/riskassess/risks/analyze             # AI analysis

POST   /api/v1/riskassess/controls                  # Create control
GET    /api/v1/riskassess/controls                  # List controls
PUT    /api/v1/riskassess/controls/:id              # Update control
DELETE /api/v1/riskassess/controls/:id              # Delete control
POST   /api/v1/riskassess/controls/:id/test         # Record test

GET    /api/v1/riskassess/registers                 # List registers
POST   /api/v1/riskassess/registers                 # Create register
GET    /api/v1/riskassess/registers/:id             # Get register
PUT    /api/v1/riskassess/registers/:id             # Update register

GET    /api/v1/riskassess/dashboard                 # Dashboard
GET    /api/v1/riskassess/trends                    # Risk trends
GET    /health                                       # Health check
```

#### Frontend Components
```
frontend/src/
├── pages/
│   └── tools/
│       └── riskassess/
│           ├── RiskDashboard.tsx            # Main dashboard
│           ├── AssessmentList.tsx           # Assessment list
│           ├── AssessmentDetail.tsx         # Assessment details
│           ├── RiskRegister.tsx             # Risk register
│           ├── RiskDetail.tsx               # Risk details
│           ├── ControlLibrary.tsx           # Control catalog
│           ├── RiskHeatmap.tsx              # Risk heatmap
│           └── TrendAnalysis.tsx            # Trend analysis
├── components/
│   └── riskassess/
│       ├── RiskMatrix.tsx                   # 5x5 risk matrix
│       ├── RiskCard.tsx                     # Risk display
│       ├── ControlCard.tsx                  # Control display
│       ├── ScoreGauge.tsx                   # Risk score gauge
│       ├── TreatmentPlan.tsx                # Treatment tracker
│       ├── KRIIndicator.tsx                 # KRI display
│       ├── TrendChart.tsx                   # Trend charts
│       └── ImpactSlider.tsx                 # Impact/likelihood sliders
└── hooks/
    └── useRiskAssess.ts                     # API hooks
```

---

## 📊 Tool 20: SecurityScore
### Unified Security Posture Scoring

#### Purpose
Aggregate security scoring platform that combines data from all security tools to provide a unified, actionable security posture score with improvement recommendations.

#### Technology Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **ML Engine**: Python + Scoring algorithms
- **Integration**: All VictoryKit tools

#### Directory Structure
```
backend/tools/20-securityscore/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── scoreController.js           # Score management
│   │   │   ├── metricController.js          # Metric management
│   │   │   ├── benchmarkController.js       # Benchmarking
│   │   │   └── recommendationController.js  # Recommendations
│   │   ├── models/
│   │   │   ├── SecurityScore.js             # Overall score
│   │   │   ├── Metric.js                    # Score metric
│   │   │   ├── Benchmark.js                 # Industry benchmark
│   │   │   └── Improvement.js               # Improvement action
│   │   ├── services/
│   │   │   ├── scoringService.js            # Score calculation
│   │   │   ├── aggregationService.js        # Data aggregation
│   │   │   └── mlService.js                 # AI recommendations
│   │   ├── routes/
│   │   │   └── index.js
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── ml-engine/
│   ├── models/
│   │   ├── score_calculator.py              # Score algorithm
│   │   ├── trend_predictor.py               # Trend prediction
│   │   └── prioritizer.py                   # Action prioritization
│   └── requirements.txt
└── README.md
```

#### Database Schema
```javascript
// SecurityScore Model
{
  userId: ObjectId,
  scoreId: String,
  organization: {
    name: String,
    industry: String,
    size: String
  },
  overallScore: {
    current: Number,                         // 0-100
    previous: Number,
    trend: String,                           // 'improving', 'stable', 'declining'
    grade: String,                           // 'A', 'B', 'C', 'D', 'F'
    percentile: Number                       // Industry percentile
  },
  categoryScores: {
    vulnerability: { score: Number, weight: Number, issues: Number },
    compliance: { score: Number, weight: Number, issues: Number },
    identity: { score: Number, weight: Number, issues: Number },
    data: { score: Number, weight: Number, issues: Number },
    network: { score: Number, weight: Number, issues: Number },
    endpoint: { score: Number, weight: Number, issues: Number },
    cloud: { score: Number, weight: Number, issues: Number },
    application: { score: Number, weight: Number, issues: Number },
    incident: { score: Number, weight: Number, issues: Number },
    awareness: { score: Number, weight: Number, issues: Number }
  },
  toolScores: [{
    toolId: String,
    toolName: String,
    score: Number,
    weight: Number,
    issues: Number,
    lastUpdated: Date
  }],
  history: [{
    date: Date,
    overallScore: Number,
    categoryScores: Object
  }],
  insights: [{
    type: String,                            // 'strength', 'weakness', 'opportunity', 'threat'
    category: String,
    message: String,
    impact: Number
  }],
  calculatedAt: Date,
  nextCalculation: Date,
  createdAt: Date,
  updatedAt: Date
}

// Metric Model
{
  userId: ObjectId,
  metricId: String,
  name: String,
  description: String,
  category: String,
  source: {
    toolId: String,
    dataPoint: String,
    aggregation: String                      // 'count', 'average', 'percentage', 'ratio'
  },
  calculation: {
    formula: String,
    thresholds: [{
      min: Number,
      max: Number,
      score: Number
    }]
  },
  weight: Number,
  currentValue: Object,
  targetValue: Object,
  trend: {
    direction: String,
    percentage: Number,
    period: String
  },
  benchmark: {
    industry: Number,
    percentile: Number
  },
  isActive: Boolean,
  lastUpdated: Date,
  createdAt: Date
}

// Benchmark Model
{
  benchmarkId: String,
  name: String,
  industry: String,                          // 'technology', 'finance', 'healthcare', 'retail', 'government'
  size: String,                              // 'small', 'medium', 'large', 'enterprise'
  metrics: [{
    category: String,
    average: Number,
    median: Number,
    p25: Number,
    p75: Number,
    p90: Number
  }],
  participants: Number,
  period: {
    start: Date,
    end: Date
  },
  updatedAt: Date
}

// Improvement Model
{
  userId: ObjectId,
  improvementId: String,
  title: String,
  description: String,
  category: String,
  priority: String,                          // 'critical', 'high', 'medium', 'low'
  impact: {
    scoreImprovement: Number,                // Expected score increase
    riskReduction: String,
    affectedCategories: [String]
  },
  effort: {
    level: String,                           // 'low', 'medium', 'high'
    estimatedHours: Number,
    resources: [String]
  },
  steps: [{
    order: Number,
    description: String,
    toolLink: String
  }],
  status: String,                            // 'recommended', 'planned', 'in_progress', 'completed', 'dismissed'
  assignee: ObjectId,
  dueDate: Date,
  completedAt: Date,
  actualImprovement: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### API Endpoints
```
GET    /api/v1/securityscore/score                  # Get current score
POST   /api/v1/securityscore/score/calculate        # Recalculate score
GET    /api/v1/securityscore/score/history          # Score history
GET    /api/v1/securityscore/score/breakdown        # Category breakdown
GET    /api/v1/securityscore/score/comparison       # Industry comparison

GET    /api/v1/securityscore/metrics                # List metrics
POST   /api/v1/securityscore/metrics                # Create custom metric
PUT    /api/v1/securityscore/metrics/:id            # Update metric
GET    /api/v1/securityscore/metrics/:id/trend      # Metric trend

GET    /api/v1/securityscore/benchmarks             # List benchmarks
GET    /api/v1/securityscore/benchmarks/:industry   # Industry benchmark

GET    /api/v1/securityscore/improvements           # List recommendations
PATCH  /api/v1/securityscore/improvements/:id       # Update status
POST   /api/v1/securityscore/improvements/:id/plan  # Create improvement plan
POST   /api/v1/securityscore/improvements/prioritize # AI prioritization

GET    /api/v1/securityscore/dashboard              # Executive dashboard
GET    /api/v1/securityscore/report                 # Generate report
GET    /health                                       # Health check
```

#### Frontend Components
```
frontend/src/
├── pages/
│   └── tools/
│       └── securityscore/
│           ├── ScoreDashboard.tsx           # Main dashboard
│           ├── ScoreBreakdown.tsx           # Category breakdown
│           ├── TrendAnalysis.tsx            # Score trends
│           ├── IndustryBenchmark.tsx        # Industry comparison
│           ├── MetricExplorer.tsx           # Metric details
│           ├── ImprovementPlan.tsx          # Improvement tracking
│           └── ExecutiveReport.tsx          # Executive summary
├── components/
│   └── securityscore/
│       ├── ScoreGauge.tsx                   # Main score display
│       ├── GradeBadge.tsx                   # A/B/C/D/F grade
│       ├── CategoryRadar.tsx               # Radar chart
│       ├── TrendSparkline.tsx               # Trend mini-chart
│       ├── BenchmarkBar.tsx                 # Benchmark comparison
│       ├── ImprovementCard.tsx              # Improvement action
│       ├── InsightCard.tsx                  # SWOT insight
│       └── ToolContribution.tsx             # Tool score breakdown
└── hooks/
    └── useSecurityScore.ts                  # API hooks
```

---

## 🔗 Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │Access   │ │Audit    │ │Threat   │ │Risk     │ │Security │   │
│  │Control  │ │Trail    │ │Model    │ │Assess   │ │Score    │   │
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
   │ :4016  │  │ :4017  │  │ :4018  │  │ :4019  │  │ :4020  │
   │Access  │  │Audit   │  │Threat  │  │Risk    │  │SecScore│
   └────┬───┘  └────┬───┘  └────┬───┘  └────┬───┘  └────┬───┘
        │           │           │           │           │
        └───────────┴───────────┴───────────┴───────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MONGODB ATLAS CLUSTER                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Implementation Checklist

### Tool 16 - AccessControl
- [ ] Create directory structure
- [ ] Implement Policy model
- [ ] Implement Role model
- [ ] Implement Permission model
- [ ] Implement Assignment model
- [ ] Create policy controller
- [ ] Create evaluation service
- [ ] Setup routes
- [ ] Test health endpoint
- [ ] Deploy to EC2

### Tool 17 - AuditTrail
- [ ] Create directory structure
- [ ] Implement AuditLog model (immutable)
- [ ] Implement LogSource model
- [ ] Implement AlertRule model
- [ ] Create log ingestion service
- [ ] Create integrity service
- [ ] Setup routes
- [ ] Test health endpoint
- [ ] Deploy to EC2

### Tool 18 - ThreatModel
- [ ] Create directory structure
- [ ] Implement ThreatModel model
- [ ] Implement Threat model
- [ ] Implement Mitigation model
- [ ] Implement Component model
- [ ] Create STRIDE/PASTA logic
- [ ] Create AI threat suggestion
- [ ] Setup routes
- [ ] Test health endpoint
- [ ] Deploy to EC2

### Tool 19 - RiskAssess
- [ ] Create directory structure
- [ ] Implement Assessment model
- [ ] Implement Risk model
- [ ] Implement Control model
- [ ] Implement RiskRegister model
- [ ] Create scoring service
- [ ] Setup routes
- [ ] Test health endpoint
- [ ] Deploy to EC2

### Tool 20 - SecurityScore
- [ ] Create directory structure
- [ ] Implement SecurityScore model
- [ ] Implement Metric model
- [ ] Implement Benchmark model
- [ ] Implement Improvement model
- [ ] Create aggregation service
- [ ] Create scoring algorithm
- [ ] Setup routes
- [ ] Test health endpoint
- [ ] Deploy to EC2

---

*Documentation generated: December 29, 2025*
*VictoryKit Phase 4 - Backend API Implementation*
