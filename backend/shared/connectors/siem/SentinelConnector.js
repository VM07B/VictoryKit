/**
 * Microsoft Sentinel Connector
 *
 * SIEM integration with:
 * - KQL queries and analytics
 * - Alert management and response
 * - Incident creation and updates
 * - Threat hunting
 * - Data ingestion via Log Analytics
 */

const { BaseConnector, ConnectorState } = require('../base/BaseConnector');
const { CircuitBreaker, RetryStrategy } = require('../base/Resilience');
const axios = require('axios');

/**
 * Sentinel Alert Severity Levels
 */
const AlertSeverity = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
  INFORMATIONAL: 'Informational'
};

/**
 * Sentinel Incident Status
 */
const IncidentStatus = {
  NEW: 'New',
  ACTIVE: 'Active',
  RESOLVED: 'Resolved',
  DISMISSED: 'Dismissed'
};

/**
 * Sentinel Incident Severity
 */
const IncidentSeverity = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
  INFORMATIONAL: 'Informational'
};

class SentinelConnector extends BaseConnector {
  constructor(config) {
    super('Microsoft Sentinel', config);

    this.baseUrl = config.baseUrl || 'https://management.azure.com';
    this.subscriptionId = config.subscriptionId;
    this.resourceGroup = config.resourceGroup;
    this.workspaceName = config.workspaceName;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.tenantId = config.tenantId;

    this.accessToken = null;
    this.tokenExpiry = null;

    // Circuit breaker for API calls
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      recoveryTimeout: 60000,
      monitoringPeriod: 60000
    });

    // Retry strategy
    this.retryStrategy = new RetryStrategy({
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000
    });
  }

  /**
   * Authenticate with Azure AD
   */
  async authenticate() {
    try {
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const response = await axios.post(
        `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: 'https://management.azure.com/.default'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 min buffer

      return this.accessToken;
    } catch (error) {
      this.emit('auth:failed', { error: error.message });
      throw new Error(`Sentinel authentication failed: ${error.message}`);
    }
  }

  /**
   * Execute KQL Query
   */
  async executeQuery(query, timespan = 'P1D') {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const workspaceId = await this.getWorkspaceId();

        const response = await axios.post(
          `${this.baseUrl}/subscriptions/${this.subscriptionId}/resourceGroups/${this.resourceGroup}/providers/Microsoft.OperationalInsights/workspaces/${workspaceId}/query?api-version=2022-10-01`,
          {
            query,
            timespan
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        return response.data;
      });
    });
  }

  /**
   * Get Workspace ID
   */
  async getWorkspaceId() {
    const token = await this.authenticate();

    const response = await axios.get(
      `${this.baseUrl}/subscriptions/${this.subscriptionId}/resourceGroups/${this.resourceGroup}/providers/Microsoft.OperationalInsights/workspaces/${this.workspaceName}?api-version=2020-08-01`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data.properties.customerId;
  }

  /**
   * Create Incident
   */
  async createIncident(incidentData) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const workspaceId = await this.getWorkspaceId();

        const response = await axios.put(
          `${this.baseUrl}/subscriptions/${this.subscriptionId}/resourceGroups/${this.resourceGroup}/providers/Microsoft.SecurityInsights/workspaces/${workspaceId}/incidents/${incidentData.id}?api-version=2022-07-01-preview`,
          {
            properties: {
              title: incidentData.title,
              description: incidentData.description,
              severity: incidentData.severity || IncidentSeverity.MEDIUM,
              status: incidentData.status || IncidentStatus.NEW,
              labels: incidentData.labels || [],
              firstActivityTimeUtc: incidentData.firstActivityTime,
              lastActivityTimeUtc: incidentData.lastActivityTime,
              owner: incidentData.owner ? {
                objectId: incidentData.owner.objectId,
                email: incidentData.owner.email,
                assignedTo: incidentData.owner.assignedTo,
                userPrincipalName: incidentData.owner.userPrincipalName
              } : undefined
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        this.emit('incident:created', { incidentId: incidentData.id });
        return response.data;
      });
    });
  }

  /**
   * Update Incident
   */
  async updateIncident(incidentId, updates) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const workspaceId = await this.getWorkspaceId();

        const response = await axios.patch(
          `${this.baseUrl}/subscriptions/${this.subscriptionId}/resourceGroups/${this.resourceGroup}/providers/Microsoft.SecurityInsights/workspaces/${workspaceId}/incidents/${incidentId}?api-version=2022-07-01-preview`,
          {
            properties: updates
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        this.emit('incident:updated', { incidentId, updates });
        return response.data;
      });
    });
  }

  /**
   * Get Incident Details
   */
  async getIncident(incidentId) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const workspaceId = await this.getWorkspaceId();

        const response = await axios.get(
          `${this.baseUrl}/subscriptions/${this.subscriptionId}/resourceGroups/${this.resourceGroup}/providers/Microsoft.SecurityInsights/workspaces/${workspaceId}/incidents/${incidentId}?api-version=2022-07-01-preview`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        return response.data;
      });
    });
  }

  /**
   * List Incidents
   */
  async listIncidents(filter = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const workspaceId = await this.getWorkspaceId();

        let url = `${this.baseUrl}/subscriptions/${this.subscriptionId}/resourceGroups/${this.resourceGroup}/providers/Microsoft.SecurityInsights/workspaces/${workspaceId}/incidents?api-version=2022-07-01-preview`;

        // Add filter parameters
        const params = [];
        if (filter.status) params.push(`$filter=properties/status eq '${filter.status}'`);
        if (filter.severity) params.push(`$filter=properties/severity eq '${filter.severity}'`);
        if (filter.assignedTo) params.push(`$filter=properties/owner/userPrincipalName eq '${filter.assignedTo}'`);

        if (params.length > 0) {
          url += '&' + params.join('&');
        }

        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        return response.data.value;
      });
    });
  }

  /**
   * Create Alert Rule
   */
  async createAlertRule(ruleData) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const workspaceId = await this.getWorkspaceId();

        const response = await axios.put(
          `${this.baseUrl}/subscriptions/${this.subscriptionId}/resourceGroups/${this.resourceGroup}/providers/Microsoft.SecurityInsights/workspaces/${workspaceId}/alertRules/${ruleData.id}?api-version=2022-07-01-preview`,
          {
            properties: {
              displayName: ruleData.displayName,
              description: ruleData.description,
              severity: ruleData.severity || AlertSeverity.MEDIUM,
              enabled: ruleData.enabled !== false,
              query: ruleData.query,
              queryFrequency: ruleData.queryFrequency || 'PT5M',
              queryPeriod: ruleData.queryPeriod || 'PT5M',
              triggerOperator: ruleData.triggerOperator || 'GreaterThan',
              triggerThreshold: ruleData.triggerThreshold || 0,
              suppressionDuration: ruleData.suppressionDuration || 'PT5M',
              suppressionEnabled: ruleData.suppressionEnabled || false,
              tactics: ruleData.tactics || [],
              techniques: ruleData.techniques || []
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        this.emit('alert-rule:created', { ruleId: ruleData.id });
        return response.data;
      });
    });
  }

  /**
   * Ingest Custom Data
   */
  async ingestData(tableName, data) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const workspaceId = await this.getWorkspaceId();

        const response = await axios.post(
          `${this.baseUrl}/subscriptions/${this.subscriptionId}/resourceGroups/${this.resourceGroup}/providers/Microsoft.OperationalInsights/workspaces/${workspaceId}/tables/${tableName}/ingest?api-version=2022-10-01`,
          data,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        this.emit('data:ingested', { tableName, recordCount: data.length });
        return response.data;
      });
    });
  }

  /**
   * Get Threat Intelligence Indicators
   */
  async getThreatIndicators(filter = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const workspaceId = await this.getWorkspaceId();

        let url = `${this.baseUrl}/subscriptions/${this.subscriptionId}/resourceGroups/${this.resourceGroup}/providers/Microsoft.SecurityInsights/workspaces/${workspaceId}/threatIntelligence/main/indicators?api-version=2022-07-01-preview`;

        if (filter.patternType) {
          url += `&$filter=properties/patternType eq '${filter.patternType}'`;
        }

        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        return response.data.value;
      });
    });
  }

  /**
   * Create Threat Intelligence Indicator
   */
  async createThreatIndicator(indicatorData) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const workspaceId = await this.getWorkspaceId();

        const response = await axios.put(
          `${this.baseUrl}/subscriptions/${this.subscriptionId}/resourceGroups/${this.resourceGroup}/providers/Microsoft.SecurityInsights/workspaces/${workspaceId}/threatIntelligence/main/indicators/${indicatorData.id}?api-version=2022-07-01-preview`,
          {
            properties: {
              pattern: indicatorData.pattern,
              patternType: indicatorData.patternType,
              patternVersion: indicatorData.patternVersion || 1,
              killChainPhases: indicatorData.killChainPhases || [],
              labels: indicatorData.labels || [],
              revoked: indicatorData.revoked || false,
              confidence: indicatorData.confidence || 50,
              createdByRef: indicatorData.createdByRef,
              description: indicatorData.description,
              displayName: indicatorData.displayName,
              externalReferences: indicatorData.externalReferences || [],
              granularMarkings: indicatorData.granularMarkings || [],
              isActive: indicatorData.isActive !== false,
              objectMarkingsRefs: indicatorData.objectMarkingsRefs || [],
              threatTypes: indicatorData.threatTypes || [],
              validFrom: indicatorData.validFrom,
              validUntil: indicatorData.validUntil
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        this.emit('threat-indicator:created', { indicatorId: indicatorData.id });
        return response.data;
      });
    });
  }

  /**
   * Health Check
   */
  async healthCheck() {
    try {
      await this.authenticate();
      await this.executeQuery('StormEvents | limit 1');
      return { status: ConnectorState.HEALTHY, latency: 0 };
    } catch (error) {
      return { status: ConnectorState.UNHEALTHY, error: error.message };
    }
  }

  /**
   * Get connector info
   */
  getInfo() {
    return {
      name: this.name,
      type: 'SIEM',
      vendor: 'Microsoft',
      product: 'Sentinel',
      capabilities: [
        'query',
        'incident-management',
        'alert-rules',
        'threat-intelligence',
        'data-ingestion'
      ],
      config: {
        subscriptionId: this.subscriptionId,
        resourceGroup: this.resourceGroup,
        workspaceName: this.workspaceName
      }
    };
  }
}

module.exports = SentinelConnector;