/**
 * Cortex XSOAR Connector
 *
 * SOAR integration with:
 * - Incident management and orchestration
 * - Playbook execution
 * - Automation workflows
 * - Case management
 * - Integration with security tools
 */

const { BaseConnector, ConnectorState } = require('../base/BaseConnector');
const { CircuitBreaker, RetryStrategy } = require('../base/Resilience');
const axios = require('axios');

/**
 * XSOAR Incident Severity
 */
const IncidentSeverity = {
  UNKNOWN: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4
};

/**
 * XSOAR Incident Status
 */
const IncidentStatus = {
  PENDING: 0,
  ACTIVE: 1,
  DONE: 2,
  ARCHIVED: 3,
  CLOSED: 4
};

/**
 * XSOAR Incident Type
 */
const IncidentType = {
  PHISHING: 'Phishing',
  MALWARE: 'Malware',
  UNAUTHORIZED_ACCESS: 'Unauthorized Access',
  DATA_LEAKAGE: 'Data Leakage',
  DENIAL_OF_SERVICE: 'Denial of Service',
  FRAUD: 'Fraud',
  BRUTE_FORCE: 'Brute Force',
  EXPLOIT: 'Exploit',
  VULNERABILITY: 'Vulnerability',
  COMPLIANCE: 'Compliance'
};

class CortexXSOARConnector extends BaseConnector {
  constructor(config) {
    super('Cortex XSOAR', config);

    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.username = config.username;
    this.password = config.password;

    this.authToken = null;
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
   * Authenticate with XSOAR
   */
  async authenticate() {
    try {
      if (this.authToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.authToken;
      }

      const response = await axios.post(
        `${this.baseUrl}/auth/login`,
        {
          username: this.username,
          password: this.password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      this.authToken = response.data.token;
      this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000) - 60000; // 24 hours - 1 min buffer

      return this.authToken;
    } catch (error) {
      this.emit('auth:failed', { error: error.message });
      throw new Error(`XSOAR authentication failed: ${error.message}`);
    }
  }

  /**
   * Create Incident
   */
  async createIncident(incidentData) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.post(
          `${this.baseUrl}/incident`,
          {
            name: incidentData.name,
            type: incidentData.type || IncidentType.UNAUTHORIZED_ACCESS,
            severity: incidentData.severity || IncidentSeverity.MEDIUM,
            status: incidentData.status || IncidentStatus.ACTIVE,
            details: incidentData.details || '',
            labels: incidentData.labels || [],
            occurred: incidentData.occurred || new Date().toISOString(),
            owner: incidentData.owner,
            playbookId: incidentData.playbookId,
            customFields: incidentData.customFields || {}
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        this.emit('incident:created', { incidentId: response.data.id });
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

        const response = await axios.patch(
          `${this.baseUrl}/incident/${incidentId}`,
          updates,
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

        const response = await axios.get(
          `${this.baseUrl}/incident/${incidentId}`,
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

        const params = {};
        if (filter.status !== undefined) params.status = filter.status;
        if (filter.severity !== undefined) params.severity = filter.severity;
        if (filter.type) params.type = filter.type;
        if (filter.owner) params.owner = filter.owner;
        if (filter.fromDate) params.fromDate = filter.fromDate;
        if (filter.toDate) params.toDate = filter.toDate;
        if (filter.size) params.size = filter.size || 50;

        const response = await axios.get(
          `${this.baseUrl}/incidents`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            params
          }
        );

        return response.data.data;
      });
    });
  }

  /**
   * Execute Playbook
   */
  async executePlaybook(playbookId, inputs = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.post(
          `${this.baseUrl}/playbook/${playbookId}/execute`,
          {
            inputs
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        this.emit('playbook:executed', { playbookId, executionId: response.data.id });
        return response.data;
      });
    });
  }

  /**
   * Get Playbook Execution Status
   */
  async getPlaybookExecution(executionId) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.get(
          `${this.baseUrl}/playbook/execution/${executionId}`,
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
   * Create Work Plan Task
   */
  async createTask(incidentId, taskData) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.post(
          `${this.baseUrl}/incident/${incidentId}/tasks`,
          {
            name: taskData.name,
            type: taskData.type || 'regular',
            assignee: taskData.assignee,
            dueDate: taskData.dueDate,
            description: taskData.description,
            tags: taskData.tags || []
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        this.emit('task:created', { incidentId, taskId: response.data.id });
        return response.data;
      });
    });
  }

  /**
   * Update Task
   */
  async updateTask(incidentId, taskId, updates) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.patch(
          `${this.baseUrl}/incident/${incidentId}/tasks/${taskId}`,
          updates,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        this.emit('task:updated', { incidentId, taskId, updates });
        return response.data;
      });
    });
  }

  /**
   * Add Evidence to Incident
   */
  async addEvidence(incidentId, evidenceData) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.post(
          `${this.baseUrl}/incident/${incidentId}/evidence`,
          {
            description: evidenceData.description,
            type: evidenceData.type,
            tags: evidenceData.tags || [],
            occurred: evidenceData.occurred || new Date().toISOString(),
            rawJSON: evidenceData.rawJSON
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        this.emit('evidence:added', { incidentId, evidenceId: response.data.id });
        return response.data;
      });
    });
  }

  /**
   * Execute Command on Integration
   */
  async executeCommand(integrationName, commandName, args = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.post(
          `${this.baseUrl}/execute/${integrationName}/${commandName}`,
          args,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        this.emit('command:executed', { integrationName, commandName });
        return response.data;
      });
    });
  }

  /**
   * Get Integration Instances
   */
  async getIntegrationInstances() {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.get(
          `${this.baseUrl}/settings/integration`,
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
   * Create Integration Instance
   */
  async createIntegrationInstance(integrationData) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.post(
          `${this.baseUrl}/settings/integration`,
          {
            name: integrationData.name,
            integration: integrationData.integration,
            config: integrationData.config,
            enabled: integrationData.enabled !== false
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        this.emit('integration:created', { instanceId: response.data.id });
        return response.data;
      });
    });
  }

  /**
   * Get Playbooks
   */
  async getPlaybooks() {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.get(
          `${this.baseUrl}/playbook`,
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
   * Import Playbook
   */
  async importPlaybook(playbookData) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.post(
          `${this.baseUrl}/playbook/import`,
          playbookData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        this.emit('playbook:imported', { playbookId: response.data.id });
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
      await this.listIncidents({ size: 1 });
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
      type: 'SOAR',
      vendor: 'Palo Alto Networks',
      product: 'Cortex XSOAR',
      capabilities: [
        'incident-management',
        'playbook-execution',
        'automation',
        'case-management',
        'integration-orchestration'
      ],
      config: {
        baseUrl: this.baseUrl
      }
    };
  }
}

module.exports = CortexXSOARConnector;