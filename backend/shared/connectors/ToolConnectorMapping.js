/**
 * VictoryKit Tool-to-Connector Mapping
 *
 * Maps each of the 50 security tools to their appropriate connectors
 * and defines the actions each tool should take with external systems.
 */

const ToolConnectorMapping = {
  // ============================================================================
  // NETWORK / EDGE / DDoS / DNS / WAF / API / Bot
  // ============================================================================

  // 01-fraudguard (already exists, but adding integrations)
  fraudguard: {
    connectors: ['sentinel', 'cortexXSOAR', 'cloudflare', 'kong', 'okta'],
    actions: {
      // SIEM: Log fraud attempts and risk scores
      sentinel: {
        ingestEvents: true,
        createIncidents: true,
        queryThreats: true
      },
      // SOAR: Automated response playbooks for high-risk transactions
      cortexXSOAR: {
        createIncidents: true,
        executePlaybooks: ['fraud-response', 'risk-escalation'],
        addEvidence: true
      },
      // WAF: Block IPs with high fraud scores
      cloudflare: {
        blockIPs: true,
        createWAFRules: true,
        rateLimit: true
      },
      // API Gateway: Rate limit suspicious API calls
      kong: {
        rateLimit: true,
        blockRequests: true
      },
      // IdP: Step-up authentication for high-risk users
      okta: {
        riskAssessment: true,
        stepUpAuth: true,
        suspendUsers: true
      }
    }
  },

  // 02-intelliscout
  intelliscout: {
    connectors: ['sentinel', 'cortexXSOAR', 'opencti', 'crowdstrike'],
    actions: {
      sentinel: { ingestEvents: true, createIncidents: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['recon-response'] },
      opencti: { createIndicators: true, enrichIntelligence: true },
      crowdstrike: { createIOCs: true, huntThreats: true }
    }
  },

  // 03-threatradar
  threatradar: {
    connectors: ['sentinel', 'cortexXSOAR', 'cloudflare', 'crowdstrike', 'opencti'],
    actions: {
      sentinel: { ingestEvents: true, createIncidents: true, queryThreats: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['threat-response'] },
      cloudflare: { blockIPs: true, createWAFRules: true },
      crowdstrike: { containHosts: true, createIOCs: true },
      opencti: { createIndicators: true, correlateThreats: true }
    }
  },

  // 04-malwarehunter
  malwarehunter: {
    connectors: ['sentinel', 'cortexXSOAR', 'crowdstrike', 'opencti', 'capeSandbox'],
    actions: {
      sentinel: { ingestEvents: true, createIncidents: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['malware-response'] },
      crowdstrike: { containHosts: true, killProcesses: true, createIOCs: true },
      opencti: { createIndicators: true, malwareAnalysis: true },
      capeSandbox: { submitSamples: true, getReports: true }
    }
  },

  // 05-phishguard
  phishguard: {
    connectors: ['sentinel', 'cortexXSOAR', 'cloudflare', 'okta', 'opencti'],
    actions: {
      sentinel: { ingestEvents: true, createIncidents: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['phishing-response'] },
      cloudflare: { blockIPs: true, createWAFRules: true },
      okta: { suspendUsers: true, resetFactors: true },
      opencti: { createIndicators: true, phishingAnalysis: true }
    }
  },

  // 06-vulnscan
  vulnscan: {
    connectors: ['sentinel', 'cortexXSOAR', 'wiz', 'crowdstrike'],
    actions: {
      sentinel: { ingestEvents: true, createIncidents: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['vulnerability-response'] },
      wiz: { scanAssets: true, getFindings: true },
      crowdstrike: { vulnerabilityAssessment: true }
    }
  },

  // 07-pentestai
  pentestai: {
    connectors: ['sentinel', 'cortexXSOAR', 'crowdstrike', 'kong'],
    actions: {
      sentinel: { ingestEvents: true, createIncidents: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['pentest-response'] },
      crowdstrike: { executeCommands: true, containHosts: true },
      kong: { blockRequests: true, rateLimit: true }
    }
  },

  // 08-securecode
  securecode: {
    connectors: ['sentinel', 'cortexXSOAR', 'opencti'],
    actions: {
      sentinel: { ingestEvents: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['code-security'] },
      opencti: { createIndicators: true }
    }
  },

  // 09-compliancecheck
  compliancecheck: {
    connectors: ['sentinel', 'vanta', 'wiz'],
    actions: {
      sentinel: { ingestEvents: true },
      vanta: { submitEvidence: true, getFindings: true },
      wiz: { complianceChecks: true }
    }
  },

  // 10-dataguardian
  dataguardian: {
    connectors: ['sentinel', 'cortexXSOAR', 'cloudflare'],
    actions: {
      sentinel: { ingestEvents: true, createIncidents: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['data-protection'] },
      cloudflare: { blockIPs: true, createWAFRules: true }
    }
  },

  // 11-incidentresponse
  incidentresponse: {
    connectors: ['sentinel', 'cortexXSOAR', 'crowdstrike', 'slack'],
    actions: {
      sentinel: { createIncidents: true, updateIncidents: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['incident-response'] },
      crowdstrike: { containHosts: true, executeCommands: true },
      slack: { sendNotifications: true, createChannels: true }
    }
  },

  // 12-loganalyzer
  loganalyzer: {
    connectors: ['sentinel', 'redpanda', 'cortexXSOAR'],
    actions: {
      sentinel: { ingestEvents: true, queryLogs: true },
      redpanda: { publishEvents: true, consumeEvents: true },
      cortexXSOAR: { createIncidents: true }
    }
  },

  // 13-accesscontrol
  accesscontrol: {
    connectors: ['okta', 'sentinel', 'cortexXSOAR'],
    actions: {
      okta: { manageUsers: true, riskAssessment: true },
      sentinel: { ingestEvents: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['access-violation'] }
    }
  },

  // 14-encryptionmanager
  encryptionmanager: {
    connectors: ['sentinel', 'cortexXSOAR'],
    actions: {
      sentinel: { ingestEvents: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['encryption-events'] }
    }
  },

  // 15-backuprecovery
  backuprecovery: {
    connectors: ['sentinel', 'cortexXSOAR'],
    actions: {
      sentinel: { ingestEvents: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['backup-failure'] }
    }
  },

  // 16-networkmonitor
  networkmonitor: {
    connectors: ['sentinel', 'cloudflare', 'zeek', 'suricata'],
    actions: {
      sentinel: { ingestEvents: true, createIncidents: true },
      cloudflare: { getAnalytics: true, blockIPs: true },
      zeek: { getLogs: true },
      suricata: { getAlerts: true }
    }
  },

  // 17-endpointprotection
  endpointprotection: {
    connectors: ['crowdstrike', 'sentinel', 'cortexXSOAR'],
    actions: {
      crowdstrike: { containHosts: true, killProcesses: true, createIOCs: true },
      sentinel: { ingestEvents: true, createIncidents: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['endpoint-response'] }
    }
  },

  // 18-identitymanagement
  identitymanagement: {
    connectors: ['okta', 'sentinel', 'cortexXSOAR'],
    actions: {
      okta: { manageUsers: true, riskAssessment: true, stepUpAuth: true },
      sentinel: { ingestEvents: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['identity-events'] }
    }
  },

  // 19-auditcompliance
  auditcompliance: {
    connectors: ['sentinel', 'vanta', 'wiz'],
    actions: {
      sentinel: { ingestEvents: true },
      vanta: { submitEvidence: true },
      wiz: { auditChecks: true }
    }
  },

  // 20-threatintelligence
  threatintelligence: {
    connectors: ['opencti', 'sentinel', 'cortexXSOAR', 'crowdstrike'],
    actions: {
      opencti: { createIndicators: true, enrichIntelligence: true },
      sentinel: { createIndicators: true },
      cortexXSOAR: { createIncidents: true },
      crowdstrike: { createIOCs: true }
    }
  },

  // 21-wafmanager
  wafmanager: {
    connectors: ['cloudflare', 'sentinel', 'cortexXSOAR'],
    actions: {
      cloudflare: { createWAFRules: true, blockIPs: true, rateLimit: true },
      sentinel: { ingestEvents: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['waf-events'] }
    }
  },

  // 22-apiguard
  apiguard: {
    connectors: ['kong', 'sentinel', 'cortexXSOAR', 'cloudflare'],
    actions: {
      kong: { rateLimit: true, blockRequests: true },
      sentinel: { ingestEvents: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['api-protection'] },
      cloudflare: { createWAFRules: true }
    }
  },

  // 23-botdefender
  botdefender: {
    connectors: ['cloudflare', 'sentinel', 'cortexXSOAR'],
    actions: {
      cloudflare: { createBotRules: true, blockIPs: true, challenge: true },
      sentinel: { ingestEvents: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['bot-detection'] }
    }
  },

  // 24-ddosshield
  ddosshield: {
    connectors: ['cloudflare', 'sentinel', 'cortexXSOAR'],
    actions: {
      cloudflare: { ddosProtection: true, blockIPs: true, rateLimit: true },
      sentinel: { ingestEvents: true, createIncidents: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['ddos-response'] }
    }
  },

  // 25-sslmonitor
  sslmonitor: {
    connectors: ['sentinel', 'cortexXSOAR'],
    actions: {
      sentinel: { ingestEvents: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['ssl-events'] }
    }
  },

  // 26-blueteamai
  blueteamai: {
    connectors: ['sentinel', 'cortexXSOAR', 'crowdstrike', 'opencti'],
    actions: {
      sentinel: { ingestEvents: true, createIncidents: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['blue-team'] },
      crowdstrike: { threatHunting: true },
      opencti: { intelligenceAnalysis: true }
    }
  },

  // 27-siemcommander
  siemcommander: {
    connectors: ['sentinel', 'cortexXSOAR', 'redpanda'],
    actions: {
      sentinel: { queryLogs: true, createIncidents: true, manageAlerts: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: true },
      redpanda: { publishEvents: true }
    }
  },

  // 28-soarengine
  soarengine: {
    connectors: ['cortexXSOAR', 'sentinel', 'slack', 'linear'],
    actions: {
      cortexXSOAR: { createIncidents: true, executePlaybooks: true, manageTasks: true },
      sentinel: { createIncidents: true },
      slack: { sendNotifications: true },
      linear: { createTickets: true }
    }
  },

  // 29-riskscoreai
  riskscoreai: {
    connectors: ['sentinel', 'cortexXSOAR', 'okta', 'cloudflare'],
    actions: {
      sentinel: { ingestEvents: true },
      cortexXSOAR: { createIncidents: true },
      okta: { riskAssessment: true },
      cloudflare: { riskBasedActions: true }
    }
  },

  // 30-policyengine
  policyengine: {
    connectors: ['opa', 'sentinel', 'cortexXSOAR'],
    actions: {
      opa: { evaluatePolicies: true },
      sentinel: { ingestEvents: true },
      cortexXSOAR: { createIncidents: true }
    }
  },

  // 41-iotsecure
  iotsecure: {
    connectors: ['sentinel', 'cortexXSOAR', 'crowdstrike'],
    actions: {
      sentinel: { ingestEvents: true, createIncidents: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['iot-security'] },
      crowdstrike: { containDevices: true }
    }
  },

  // 42-mobiledefend
  mobiledefend: {
    connectors: ['crowdstrike', 'sentinel', 'cortexXSOAR', 'okta'],
    actions: {
      crowdstrike: { mobileProtection: true },
      sentinel: { ingestEvents: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['mobile-security'] },
      okta: { deviceManagement: true }
    }
  },

  // 43-backupguard
  backupguard: {
    connectors: ['sentinel', 'cortexXSOAR'],
    actions: {
      sentinel: { ingestEvents: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['backup-monitoring'] }
    }
  },

  // 44-drplan
  drplan: {
    connectors: ['sentinel', 'cortexXSOAR', 'slack'],
    actions: {
      sentinel: { ingestEvents: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['disaster-recovery'] },
      slack: { sendNotifications: true }
    }
  },

  // 45-privacyshield
  privacyshield: {
    connectors: ['sentinel', 'vanta', 'cortexXSOAR'],
    actions: {
      sentinel: { ingestEvents: true },
      vanta: { privacyCompliance: true },
      cortexXSOAR: { createIncidents: true, executePlaybooks: ['privacy-events'] }
    }
  }
};

/**
 * Get connectors for a specific tool
 */
function getToolConnectors(toolName) {
  return ToolConnectorMapping[toolName]?.connectors || [];
}

/**
 * Get actions for a specific tool and connector
 */
function getToolActions(toolName, connectorName) {
  return ToolConnectorMapping[toolName]?.actions?.[connectorName] || {};
}

/**
 * Get all tools that use a specific connector
 */
function getConnectorTools(connectorName) {
  return Object.entries(ToolConnectorMapping)
    .filter(([_, config]) => config.connectors.includes(connectorName))
    .map(([toolName, _]) => toolName);
}

module.exports = {
  ToolConnectorMapping,
  getToolConnectors,
  getToolActions,
  getConnectorTools
};