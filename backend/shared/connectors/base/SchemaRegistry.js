/**
 * Schema Registry for VictoryKit Events
 * 
 * JSON Schema validation for all events flowing through Redpanda/Kafka
 * with versioning and evolution support
 */

const Ajv = require('ajv');
const addFormats = require('ajv-formats');

/**
 * Schema versioning
 */
const SchemaVersion = {
  V1: '1.0.0',
  V2: '2.0.0',
  LATEST: '1.0.0',
};

/**
 * Event types enum
 */
const EventType = {
  // Security Events
  SECURITY_ALERT: 'security.alert',
  SECURITY_INCIDENT: 'security.incident',
  SECURITY_FINDING: 'security.finding',
  
  // Threat Intel
  THREAT_IOC: 'threat.ioc',
  THREAT_INDICATOR: 'threat.indicator',
  THREAT_ENRICHMENT: 'threat.enrichment',
  
  // Network Events
  NETWORK_FLOW: 'network.flow',
  NETWORK_DNS: 'network.dns',
  NETWORK_HTTP: 'network.http',
  NETWORK_ALERT: 'network.alert',
  
  // Endpoint Events
  ENDPOINT_PROCESS: 'endpoint.process',
  ENDPOINT_FILE: 'endpoint.file',
  ENDPOINT_NETWORK: 'endpoint.network',
  ENDPOINT_THREAT: 'endpoint.threat',
  
  // Identity Events
  IDENTITY_AUTH: 'identity.auth',
  IDENTITY_ACCESS: 'identity.access',
  IDENTITY_RISK: 'identity.risk',
  
  // API Events
  API_REQUEST: 'api.request',
  API_ANOMALY: 'api.anomaly',
  API_RATELIMIT: 'api.ratelimit',
  
  // WAF Events
  WAF_BLOCK: 'waf.block',
  WAF_CHALLENGE: 'waf.challenge',
  WAF_ANOMALY: 'waf.anomaly',
  
  // Scan Results
  SCAN_VULNERABILITY: 'scan.vulnerability',
  SCAN_MALWARE: 'scan.malware',
  SCAN_PHISHING: 'scan.phishing',
  SCAN_COMPLIANCE: 'scan.compliance',
  
  // Compliance Events
  COMPLIANCE_CONTROL: 'compliance.control',
  COMPLIANCE_EVIDENCE: 'compliance.evidence',
  COMPLIANCE_DRIFT: 'compliance.drift',
  
  // Automation
  SOAR_PLAYBOOK: 'soar.playbook',
  SOAR_ACTION: 'soar.action',
  SOAR_RESULT: 'soar.result',
};

/**
 * Severity levels
 */
const Severity = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info',
};

/**
 * Base event schema (all events inherit from this)
 */
const BaseEventSchema = {
  $id: 'victorykit://schemas/base-event.json',
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['id', 'type', 'timestamp', 'source', 'version'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    type: { type: 'string' },
    timestamp: { type: 'string', format: 'date-time' },
    source: { type: 'string' },
    version: { type: 'string' },
    correlationId: { type: 'string', format: 'uuid' },
    tenantId: { type: 'string' },
    traceId: { type: 'string' },
    metadata: { type: 'object' },
  },
};

/**
 * Security Alert Schema
 */
const SecurityAlertSchema = {
  $id: 'victorykit://schemas/security-alert.json',
  $schema: 'http://json-schema.org/draft-07/schema#',
  allOf: [{ $ref: 'victorykit://schemas/base-event.json' }],
  properties: {
    severity: { type: 'string', enum: Object.values(Severity) },
    title: { type: 'string', maxLength: 256 },
    description: { type: 'string', maxLength: 4096 },
    category: { type: 'string' },
    subcategory: { type: 'string' },
    confidence: { type: 'number', minimum: 0, maximum: 100 },
    mitreTactics: { type: 'array', items: { type: 'string' } },
    mitreTechniques: { type: 'array', items: { type: 'string' } },
    indicators: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['ip', 'domain', 'url', 'hash', 'email', 'file', 'process'] },
          value: { type: 'string' },
          context: { type: 'string' },
        },
        required: ['type', 'value'],
      },
    },
    affectedAssets: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          id: { type: 'string' },
          name: { type: 'string' },
          ip: { type: 'string' },
        },
      },
    },
    recommendedActions: { type: 'array', items: { type: 'string' } },
    rawEvent: { type: 'object' },
  },
  required: ['severity', 'title', 'category'],
};

/**
 * Threat IOC Schema (STIX-compatible)
 */
const ThreatIOCSchema = {
  $id: 'victorykit://schemas/threat-ioc.json',
  $schema: 'http://json-schema.org/draft-07/schema#',
  allOf: [{ $ref: 'victorykit://schemas/base-event.json' }],
  properties: {
    stixId: { type: 'string' },
    stixType: { type: 'string' },
    indicatorType: {
      type: 'string',
      enum: ['ipv4', 'ipv6', 'domain', 'url', 'md5', 'sha1', 'sha256', 'email', 'filename', 'yara', 'sigma'],
    },
    pattern: { type: 'string' },
    patternType: { type: 'string', enum: ['stix', 'yara', 'sigma', 'snort'] },
    validFrom: { type: 'string', format: 'date-time' },
    validUntil: { type: 'string', format: 'date-time' },
    confidence: { type: 'integer', minimum: 0, maximum: 100 },
    labels: { type: 'array', items: { type: 'string' } },
    threatActors: { type: 'array', items: { type: 'string' } },
    malwareFamilies: { type: 'array', items: { type: 'string' } },
    campaigns: { type: 'array', items: { type: 'string' } },
    killChainPhases: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          killChainName: { type: 'string' },
          phaseName: { type: 'string' },
        },
      },
    },
    externalReferences: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sourceName: { type: 'string' },
          url: { type: 'string', format: 'uri' },
          externalId: { type: 'string' },
        },
      },
    },
  },
  required: ['indicatorType', 'pattern'],
};

/**
 * Network Flow Schema
 */
const NetworkFlowSchema = {
  $id: 'victorykit://schemas/network-flow.json',
  $schema: 'http://json-schema.org/draft-07/schema#',
  allOf: [{ $ref: 'victorykit://schemas/base-event.json' }],
  properties: {
    srcIp: { type: 'string' },
    srcPort: { type: 'integer', minimum: 0, maximum: 65535 },
    dstIp: { type: 'string' },
    dstPort: { type: 'integer', minimum: 0, maximum: 65535 },
    protocol: { type: 'string', enum: ['tcp', 'udp', 'icmp', 'other'] },
    bytesIn: { type: 'integer' },
    bytesOut: { type: 'integer' },
    packetsIn: { type: 'integer' },
    packetsOut: { type: 'integer' },
    duration: { type: 'number' },
    tcpFlags: { type: 'array', items: { type: 'string' } },
    geoSrc: {
      type: 'object',
      properties: {
        country: { type: 'string' },
        city: { type: 'string' },
        lat: { type: 'number' },
        lon: { type: 'number' },
        asn: { type: 'integer' },
        org: { type: 'string' },
      },
    },
    geoDst: {
      type: 'object',
      properties: {
        country: { type: 'string' },
        city: { type: 'string' },
        lat: { type: 'number' },
        lon: { type: 'number' },
        asn: { type: 'integer' },
        org: { type: 'string' },
      },
    },
    application: { type: 'string' },
    action: { type: 'string', enum: ['allowed', 'blocked', 'dropped'] },
  },
  required: ['srcIp', 'dstIp', 'protocol'],
};

/**
 * Endpoint Threat Schema
 */
const EndpointThreatSchema = {
  $id: 'victorykit://schemas/endpoint-threat.json',
  $schema: 'http://json-schema.org/draft-07/schema#',
  allOf: [{ $ref: 'victorykit://schemas/base-event.json' }],
  properties: {
    agentId: { type: 'string' },
    hostname: { type: 'string' },
    osType: { type: 'string', enum: ['windows', 'macos', 'linux'] },
    threatType: { type: 'string', enum: ['malware', 'ransomware', 'pup', 'exploit', 'fileless', 'behavioral'] },
    threatName: { type: 'string' },
    threatClassification: { type: 'string' },
    filePath: { type: 'string' },
    fileHash: {
      type: 'object',
      properties: {
        md5: { type: 'string' },
        sha1: { type: 'string' },
        sha256: { type: 'string' },
      },
    },
    processName: { type: 'string' },
    processId: { type: 'integer' },
    parentProcessName: { type: 'string' },
    parentProcessId: { type: 'integer' },
    commandLine: { type: 'string' },
    user: { type: 'string' },
    action: { type: 'string', enum: ['detected', 'blocked', 'quarantined', 'remediated', 'allowed'] },
    confidenceLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
    analystVerdict: { type: 'string', enum: ['true_positive', 'false_positive', 'suspicious', 'undefined'] },
  },
  required: ['agentId', 'hostname', 'threatType'],
};

/**
 * Identity Auth Schema
 */
const IdentityAuthSchema = {
  $id: 'victorykit://schemas/identity-auth.json',
  $schema: 'http://json-schema.org/draft-07/schema#',
  allOf: [{ $ref: 'victorykit://schemas/base-event.json' }],
  properties: {
    userId: { type: 'string' },
    username: { type: 'string' },
    email: { type: 'string', format: 'email' },
    authMethod: { type: 'string', enum: ['password', 'mfa', 'sso', 'passkey', 'certificate', 'token'] },
    mfaType: { type: 'string', enum: ['totp', 'push', 'sms', 'email', 'fido2', 'biometric'] },
    outcome: { type: 'string', enum: ['success', 'failure', 'challenge', 'locked'] },
    failureReason: { type: 'string' },
    clientIp: { type: 'string' },
    userAgent: { type: 'string' },
    deviceId: { type: 'string' },
    deviceTrust: { type: 'string', enum: ['trusted', 'managed', 'unknown', 'compromised'] },
    location: {
      type: 'object',
      properties: {
        country: { type: 'string' },
        city: { type: 'string' },
        lat: { type: 'number' },
        lon: { type: 'number' },
      },
    },
    riskScore: { type: 'number', minimum: 0, maximum: 100 },
    riskFactors: { type: 'array', items: { type: 'string' } },
    sessionId: { type: 'string' },
    application: { type: 'string' },
  },
  required: ['userId', 'authMethod', 'outcome'],
};

/**
 * Scan Result Schema
 */
const ScanResultSchema = {
  $id: 'victorykit://schemas/scan-result.json',
  $schema: 'http://json-schema.org/draft-07/schema#',
  allOf: [{ $ref: 'victorykit://schemas/base-event.json' }],
  properties: {
    scanId: { type: 'string', format: 'uuid' },
    scanType: { type: 'string', enum: ['vulnerability', 'malware', 'phishing', 'compliance', 'code', 'network'] },
    target: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['host', 'url', 'file', 'code', 'network', 'container', 'cloud'] },
        identifier: { type: 'string' },
        name: { type: 'string' },
      },
      required: ['type', 'identifier'],
    },
    status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed', 'cancelled'] },
    startedAt: { type: 'string', format: 'date-time' },
    completedAt: { type: 'string', format: 'date-time' },
    duration: { type: 'integer' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          severity: { type: 'string', enum: Object.values(Severity) },
          title: { type: 'string' },
          description: { type: 'string' },
          cveId: { type: 'string' },
          cweId: { type: 'string' },
          cvssScore: { type: 'number', minimum: 0, maximum: 10 },
          location: { type: 'string' },
          remediation: { type: 'string' },
        },
        required: ['severity', 'title'],
      },
    },
    summary: {
      type: 'object',
      properties: {
        total: { type: 'integer' },
        critical: { type: 'integer' },
        high: { type: 'integer' },
        medium: { type: 'integer' },
        low: { type: 'integer' },
        info: { type: 'integer' },
      },
    },
    toolVersion: { type: 'string' },
  },
  required: ['scanId', 'scanType', 'target', 'status'],
};

/**
 * SOAR Action Schema
 */
const SOARActionSchema = {
  $id: 'victorykit://schemas/soar-action.json',
  $schema: 'http://json-schema.org/draft-07/schema#',
  allOf: [{ $ref: 'victorykit://schemas/base-event.json' }],
  properties: {
    playbookId: { type: 'string' },
    playbookName: { type: 'string' },
    actionId: { type: 'string' },
    actionType: { type: 'string', enum: ['isolate', 'block', 'quarantine', 'notify', 'ticket', 'enrich', 'remediate', 'custom'] },
    targetType: { type: 'string', enum: ['host', 'user', 'ip', 'domain', 'file', 'process', 'email'] },
    targetId: { type: 'string' },
    status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed', 'skipped', 'approved', 'rejected'] },
    triggeredBy: { type: 'string', enum: ['automation', 'analyst', 'schedule'] },
    analystId: { type: 'string' },
    approvalRequired: { type: 'boolean' },
    approvedBy: { type: 'string' },
    input: { type: 'object' },
    output: { type: 'object' },
    error: { type: 'string' },
    duration: { type: 'integer' },
  },
  required: ['playbookId', 'actionType', 'status'],
};

/**
 * Schema Registry class
 */
class SchemaRegistry {
  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);
    
    this.schemas = new Map();
    this.validators = new Map();
    
    // Register all built-in schemas
    this.registerBuiltinSchemas();
  }

  /**
   * Register all built-in schemas
   */
  registerBuiltinSchemas() {
    const builtinSchemas = [
      BaseEventSchema,
      SecurityAlertSchema,
      ThreatIOCSchema,
      NetworkFlowSchema,
      EndpointThreatSchema,
      IdentityAuthSchema,
      ScanResultSchema,
      SOARActionSchema,
    ];

    for (const schema of builtinSchemas) {
      this.register(schema);
    }
  }

  /**
   * Register a schema
   */
  register(schema) {
    const id = schema.$id;
    this.schemas.set(id, schema);
    this.ajv.addSchema(schema, id);
    this.validators.set(id, this.ajv.getSchema(id));
  }

  /**
   * Validate an event against its schema
   */
  validate(schemaId, data) {
    const validator = this.validators.get(schemaId);
    if (!validator) {
      throw new Error(`Schema not found: ${schemaId}`);
    }

    const valid = validator(data);
    return {
      valid,
      errors: validator.errors || [],
    };
  }

  /**
   * Get a schema by ID
   */
  getSchema(schemaId) {
    return this.schemas.get(schemaId);
  }

  /**
   * List all registered schemas
   */
  listSchemas() {
    return Array.from(this.schemas.keys());
  }
}

/**
 * Event factory for creating valid events
 */
class EventFactory {
  constructor(schemaRegistry) {
    this.registry = schemaRegistry || new SchemaRegistry();
  }

  /**
   * Create a base event with required fields
   */
  createBaseEvent(type, source, data = {}) {
    return {
      id: crypto.randomUUID(),
      type,
      timestamp: new Date().toISOString(),
      source,
      version: SchemaVersion.LATEST,
      ...data,
    };
  }

  /**
   * Create a security alert
   */
  createSecurityAlert(source, data) {
    return this.createBaseEvent(EventType.SECURITY_ALERT, source, data);
  }

  /**
   * Create a threat IOC
   */
  createThreatIOC(source, data) {
    return this.createBaseEvent(EventType.THREAT_IOC, source, data);
  }

  /**
   * Create a scan result
   */
  createScanResult(source, data) {
    return this.createBaseEvent(EventType.SCAN_VULNERABILITY, source, data);
  }

  /**
   * Create a SOAR action
   */
  createSOARAction(source, data) {
    return this.createBaseEvent(EventType.SOAR_ACTION, source, data);
  }
}

// Singleton registry instance
const globalSchemaRegistry = new SchemaRegistry();
const globalEventFactory = new EventFactory(globalSchemaRegistry);

module.exports = {
  SchemaRegistry,
  EventFactory,
  EventType,
  Severity,
  SchemaVersion,
  
  // Schemas
  BaseEventSchema,
  SecurityAlertSchema,
  ThreatIOCSchema,
  NetworkFlowSchema,
  EndpointThreatSchema,
  IdentityAuthSchema,
  ScanResultSchema,
  SOARActionSchema,
  
  // Singletons
  schemaRegistry: globalSchemaRegistry,
  eventFactory: globalEventFactory,
};
