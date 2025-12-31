/**
 * SentinelOne EDR Connector
 * 
 * Endpoint Detection & Response integration:
 * - Threat management
 * - Host isolation/unisolation
 * - Process operations
 * - Forensic collection
 * - Agent management
 * - Deep Visibility queries
 */

const { BaseConnector, ConnectorState } = require('../base/BaseConnector');
const { CircuitBreaker, RetryStrategy } = require('../base/Resilience');

/**
 * Threat status values
 */
const ThreatStatus = {
  MITIGATED: 'mitigated',
  ACTIVE: 'active',
  BLOCKED: 'blocked',
  SUSPICIOUS: 'suspicious',
  PENDING: 'pending',
  SUSPICIOUS_CANCELED: 'suspicious_canceled',
};

/**
 * Agent actions
 */
const AgentAction = {
  ISOLATE: 'disconnect-from-network',
  UNISOLATE: 'reconnect-to-network',
  DECOMMISSION: 'decommission',
  SHUTDOWN: 'shutdown',
  REBOOT: 'reboot',
  UNINSTALL: 'uninstall',
  INITIATE_SCAN: 'initiate-scan',
  ABORT_SCAN: 'abort-scan',
  FETCH_LOGS: 'fetch-logs',
};

/**
 * Threat actions
 */
const ThreatAction = {
  MITIGATE: 'mitigate',
  ROLLBACK: 'rollback',
  QUARANTINE: 'quarantine',
  KILL: 'kill',
  REMEDIATE: 'remediate',
  UN_QUARANTINE: 'un-quarantine',
  MARK_AS_BENIGN: 'mark-as-benign',
  MARK_AS_THREAT: 'mark-as-threat',
  ADD_TO_BLACKLIST: 'add-to-blacklist',
  ADD_TO_EXCLUSIONS: 'add-to-exclusions',
};

/**
 * Deep Visibility event types
 */
const DVEventType = {
  PROCESS: 'process',
  FILE: 'file',
  REGISTRY: 'registry',
  NETWORK: 'network',
  DNS: 'dns',
  SCHEDULED_TASK: 'scheduled_task',
  LOGINS: 'logins',
  INDICATORS: 'indicators',
  COMMAND_SCRIPTS: 'command_scripts',
};

/**
 * SentinelOne Connector
 */
class SentinelOneConnector extends BaseConnector {
  constructor(config = {}) {
    super({ name: 'SentinelOneConnector', ...config });
    
    this.baseUrl = config.baseUrl; // e.g., 'https://usea1-partners.sentinelone.net'
    this.apiToken = config.apiToken;
    this.accountId = config.accountId;
    this.siteId = config.siteId;
    
    // Resilience
    this.circuitBreaker = new CircuitBreaker({
      name: 'sentinelone',
      failureThreshold: 5,
      timeout: 60000,
    });
    
    this.retryStrategy = new RetryStrategy({
      maxRetries: 3,
      type: 'exponential-jitter',
      baseDelay: 500,
    });
  }

  /**
   * Connect to SentinelOne
   */
  async connect() {
    this.setState(ConnectorState.CONNECTING);
    
    try {
      // Verify token with system info
      await this.request('/web/api/v2.1/system/info');
      
      this.setState(ConnectorState.CONNECTED);
      this.log('info', 'Connected to SentinelOne', { baseUrl: this.baseUrl });
      
      return true;
    } catch (error) {
      this.setState(ConnectorState.ERROR);
      this.log('error', 'Failed to connect to SentinelOne', { error: error.message });
      throw error;
    }
  }

  /**
   * Make API request
   */
  async request(path, options = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const url = `${this.baseUrl}${path}`;
        const response = await fetch(url, {
          ...options,
          headers: {
            'Authorization': `APIToken ${this.apiToken}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (!response.ok) {
          const errorBody = await response.text();
          const error = new Error(`SentinelOne API error: ${response.status}`);
          error.status = response.status;
          error.body = errorBody;
          throw error;
        }

        return response.json();
      });
    });
  }

  // ============================================
  // AGENTS (ENDPOINTS)
  // ============================================

  /**
   * List agents
   */
  async listAgents(filters = {}) {
    const params = new URLSearchParams();
    
    if (this.siteId) params.set('siteIds', this.siteId);
    if (this.accountId) params.set('accountIds', this.accountId);
    if (filters.computerName) params.set('computerName__contains', filters.computerName);
    if (filters.uuid) params.set('uuid', filters.uuid);
    if (filters.infected) params.set('infected', filters.infected);
    if (filters.isActive) params.set('isActive', filters.isActive);
    if (filters.networkStatus) params.set('networkStatuses', filters.networkStatus);
    if (filters.osType) params.set('osTypes', filters.osType);
    params.set('limit', filters.limit || 100);
    if (filters.cursor) params.set('cursor', filters.cursor);

    const result = await this.request(`/web/api/v2.1/agents?${params}`);
    return result;
  }

  /**
   * Get agent by ID
   */
  async getAgent(agentId) {
    const result = await this.request(`/web/api/v2.1/agents?ids=${agentId}`);
    return result.data?.[0] || null;
  }

  /**
   * Find agent by hostname
   */
  async findAgentByHostname(hostname) {
    const result = await this.listAgents({ computerName: hostname, limit: 1 });
    return result.data?.[0] || null;
  }

  /**
   * Execute agent action
   */
  async executeAgentAction(agentIds, action, options = {}) {
    const ids = Array.isArray(agentIds) ? agentIds : [agentIds];
    
    const result = await this.request(`/web/api/v2.1/agents/actions/${action}`, {
      method: 'POST',
      body: JSON.stringify({
        filter: { ids },
        data: options,
      }),
    });

    this.emit('agent:action', { agentIds: ids, action });
    return result;
  }

  /**
   * Isolate agent (disconnect from network)
   */
  async isolateAgent(agentId) {
    return this.executeAgentAction(agentId, AgentAction.ISOLATE);
  }

  /**
   * Unisolate agent (reconnect to network)
   */
  async unisolateAgent(agentId) {
    return this.executeAgentAction(agentId, AgentAction.UNISOLATE);
  }

  /**
   * Initiate full disk scan
   */
  async initiateFullScan(agentId) {
    return this.executeAgentAction(agentId, AgentAction.INITIATE_SCAN);
  }

  /**
   * Shutdown endpoint
   */
  async shutdownAgent(agentId) {
    return this.executeAgentAction(agentId, AgentAction.SHUTDOWN);
  }

  /**
   * Reboot endpoint
   */
  async rebootAgent(agentId) {
    return this.executeAgentAction(agentId, AgentAction.REBOOT);
  }

  /**
   * Fetch agent logs
   */
  async fetchAgentLogs(agentId) {
    return this.executeAgentAction(agentId, AgentAction.FETCH_LOGS);
  }

  /**
   * Get agent applications
   */
  async getAgentApplications(agentId) {
    return this.request(`/web/api/v2.1/agents/${agentId}/applications`);
  }

  /**
   * Get agent processes
   */
  async getAgentProcesses(agentId) {
    return this.request(`/web/api/v2.1/agents/${agentId}/processes`);
  }

  // ============================================
  // THREATS
  // ============================================

  /**
   * List threats
   */
  async listThreats(filters = {}) {
    const params = new URLSearchParams();
    
    if (this.siteId) params.set('siteIds', this.siteId);
    if (this.accountId) params.set('accountIds', this.accountId);
    if (filters.resolved !== undefined) params.set('resolved', filters.resolved);
    if (filters.analystVerdict) params.set('analystVerdicts', filters.analystVerdict);
    if (filters.incidentStatus) params.set('incidentStatuses', filters.incidentStatus);
    if (filters.mitigationStatus) params.set('mitigationStatuses', filters.mitigationStatus);
    if (filters.contentHash) params.set('contentHashes', filters.contentHash);
    if (filters.agentId) params.set('agentIds', filters.agentId);
    if (filters.createdAfter) params.set('createdAt__gt', filters.createdAfter);
    if (filters.createdBefore) params.set('createdAt__lt', filters.createdBefore);
    params.set('limit', filters.limit || 100);
    if (filters.cursor) params.set('cursor', filters.cursor);

    return this.request(`/web/api/v2.1/threats?${params}`);
  }

  /**
   * Get threat by ID
   */
  async getThreat(threatId) {
    const result = await this.request(`/web/api/v2.1/threats?ids=${threatId}`);
    return result.data?.[0] || null;
  }

  /**
   * Execute threat action
   */
  async executeThreatAction(threatIds, action) {
    const ids = Array.isArray(threatIds) ? threatIds : [threatIds];
    
    const result = await this.request(`/web/api/v2.1/threats/${action}`, {
      method: 'POST',
      body: JSON.stringify({
        filter: { ids },
      }),
    });

    this.emit('threat:action', { threatIds: ids, action });
    return result;
  }

  /**
   * Mitigate threat
   */
  async mitigateThreat(threatId) {
    return this.executeThreatAction(threatId, ThreatAction.MITIGATE);
  }

  /**
   * Rollback threat (undo changes)
   */
  async rollbackThreat(threatId) {
    return this.executeThreatAction(threatId, ThreatAction.ROLLBACK);
  }

  /**
   * Kill threat process
   */
  async killThreat(threatId) {
    return this.executeThreatAction(threatId, ThreatAction.KILL);
  }

  /**
   * Quarantine threat
   */
  async quarantineThreat(threatId) {
    return this.executeThreatAction(threatId, ThreatAction.QUARANTINE);
  }

  /**
   * Mark threat as benign
   */
  async markAsBenign(threatId, reason = '') {
    return this.request('/web/api/v2.1/threats/analyst-verdict', {
      method: 'POST',
      body: JSON.stringify({
        filter: { ids: [threatId] },
        data: { analystVerdict: 'false_positive' },
      }),
    });
  }

  /**
   * Add hash to blacklist
   */
  async addToBlacklist(hash, osType = 'windows', description = '') {
    return this.request('/web/api/v2.1/restrictions', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          value: hash,
          type: 'black_hash',
          osType,
          description,
          source: 'VictoryKit',
        },
        filter: {
          siteIds: this.siteId ? [this.siteId] : undefined,
          accountIds: this.accountId ? [this.accountId] : undefined,
        },
      }),
    });
  }

  /**
   * Get threat timeline
   */
  async getThreatTimeline(threatId) {
    return this.request(`/web/api/v2.1/threats/${threatId}/timeline`);
  }

  // ============================================
  // DEEP VISIBILITY (THREAT HUNTING)
  // ============================================

  /**
   * Create Deep Visibility query
   */
  async createDVQuery(query, fromDate, toDate, options = {}) {
    const result = await this.request('/web/api/v2.1/dv/query-init', {
      method: 'POST',
      body: JSON.stringify({
        query,
        fromDate,
        toDate,
        isVerbose: options.isVerbose ?? true,
        siteIds: options.siteIds || (this.siteId ? [this.siteId] : undefined),
        accountIds: options.accountIds || (this.accountId ? [this.accountId] : undefined),
        queryType: options.queryType || 'events',
      }),
    });

    return result.data;
  }

  /**
   * Get Deep Visibility query status
   */
  async getDVQueryStatus(queryId) {
    return this.request(`/web/api/v2.1/dv/query-status?queryId=${queryId}`);
  }

  /**
   * Get Deep Visibility query results
   */
  async getDVQueryResults(queryId, options = {}) {
    const params = new URLSearchParams({
      queryId,
      limit: options.limit || 1000,
    });
    if (options.cursor) params.set('cursor', options.cursor);

    return this.request(`/web/api/v2.1/dv/events?${params}`);
  }

  /**
   * Execute Deep Visibility query and wait for results
   */
  async executeDVQuery(query, fromDate, toDate, options = {}) {
    // Initialize query
    const initResult = await this.createDVQuery(query, fromDate, toDate, options);
    const queryId = initResult.queryId;

    // Poll for completion
    const maxWait = options.maxWaitMs || 120000; // 2 minutes
    const pollInterval = options.pollInterval || 2000;
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      const status = await this.getDVQueryStatus(queryId);
      
      if (status.data.responseState === 'FINISHED') {
        return this.getDVQueryResults(queryId, options);
      }
      
      if (status.data.responseState === 'FAILED') {
        throw new Error(`Deep Visibility query failed: ${status.data.responseError}`);
      }

      await this.sleep(pollInterval);
    }

    throw new Error('Deep Visibility query timed out');
  }

  /**
   * Build Deep Visibility query
   */
  buildDVQuery(options) {
    const conditions = [];

    if (options.eventType) {
      conditions.push(`EventType = "${options.eventType}"`);
    }
    if (options.processName) {
      conditions.push(`SrcProcName Contains "${options.processName}"`);
    }
    if (options.fileName) {
      conditions.push(`TgtFilePath Contains "${options.fileName}"`);
    }
    if (options.ip) {
      conditions.push(`(DstIP = "${options.ip}" OR SrcIP = "${options.ip}")`);
    }
    if (options.domain) {
      conditions.push(`DNS Contains "${options.domain}"`);
    }
    if (options.hash) {
      conditions.push(`(TgtFileSha256 = "${options.hash}" OR SrcProcImageSha256 = "${options.hash}")`);
    }
    if (options.commandLine) {
      conditions.push(`SrcProcCmdLine Contains "${options.commandLine}"`);
    }
    if (options.agentId) {
      conditions.push(`AgentUUID = "${options.agentId}"`);
    }

    return conditions.length > 0 ? conditions.join(' AND ') : '*';
  }

  // ============================================
  // REMOTE SCRIPTS
  // ============================================

  /**
   * List available remote scripts
   */
  async listRemoteScripts(options = {}) {
    const params = new URLSearchParams();
    if (options.osType) params.set('osTypes', options.osType);
    if (options.scriptType) params.set('scriptType', options.scriptType);
    params.set('limit', options.limit || 100);

    return this.request(`/web/api/v2.1/remote-scripts?${params}`);
  }

  /**
   * Execute remote script
   */
  async executeRemoteScript(scriptId, agentIds, options = {}) {
    const ids = Array.isArray(agentIds) ? agentIds : [agentIds];

    return this.request('/web/api/v2.1/remote-scripts/execute', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          scriptId,
          outputDestination: options.outputDestination || 'SentinelCloud',
          taskDescription: options.description || 'VictoryKit remote script execution',
          inputParams: options.inputParams,
          password: options.password,
          scriptRuntimeTimeoutSeconds: options.timeout || 3600,
        },
        filter: { ids },
      }),
    });
  }

  /**
   * Get remote script execution status
   */
  async getRemoteScriptStatus(parentTaskId) {
    return this.request(`/web/api/v2.1/remote-scripts/status?parent_task_id=${parentTaskId}`);
  }

  // ============================================
  // FORENSICS
  // ============================================

  /**
   * Request forensics collection
   */
  async requestForensics(agentId, options = {}) {
    return this.request('/web/api/v2.1/agents/actions/fetch-forensics', {
      method: 'POST',
      body: JSON.stringify({
        filter: { ids: [agentId] },
        data: {
          collectDump: options.collectDump ?? true,
          collectEvents: options.collectEvents ?? true,
          collectProcesses: options.collectProcesses ?? true,
          collectNetwork: options.collectNetwork ?? true,
          collectRegistry: options.collectRegistry ?? true,
        },
      }),
    });
  }

  /**
   * Download forensic data
   */
  async downloadForensics(agentId, activityId) {
    const result = await this.request(
      `/web/api/v2.1/agents/${agentId}/uploads/${activityId}/download-url`
    );
    return result.data?.downloadUrl;
  }

  // ============================================
  // EXCLUSIONS
  // ============================================

  /**
   * Create exclusion
   */
  async createExclusion(type, value, options = {}) {
    return this.request('/web/api/v2.1/exclusions', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type, // 'path', 'white_hash', 'certificate', 'browser'
          value,
          osType: options.osType || 'windows',
          description: options.description,
          mode: options.mode || 'suppress', // 'suppress', 'suppress_dynamic_only'
        },
        filter: {
          siteIds: options.siteId ? [options.siteId] : (this.siteId ? [this.siteId] : undefined),
        },
      }),
    });
  }

  /**
   * List exclusions
   */
  async listExclusions(options = {}) {
    const params = new URLSearchParams();
    if (options.type) params.set('type', options.type);
    if (options.osType) params.set('osTypes', options.osType);
    params.set('limit', options.limit || 100);

    return this.request(`/web/api/v2.1/exclusions?${params}`);
  }

  /**
   * Delete exclusion
   */
  async deleteExclusion(exclusionId) {
    return this.request(`/web/api/v2.1/exclusions/${exclusionId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Check health
   */
  async checkHealth() {
    try {
      const result = await this.request('/web/api/v2.1/system/info');
      
      return {
        isHealthy: true,
        message: 'Connected',
        version: result.data?.version,
        lastCheck: new Date().toISOString(),
      };
    } catch (error) {
      return {
        isHealthy: false,
        message: error.message,
        lastCheck: new Date().toISOString(),
      };
    }
  }

  /**
   * Disconnect
   */
  async disconnect() {
    this.setState(ConnectorState.DISCONNECTED);
    this.log('info', 'Disconnected from SentinelOne');
  }
}

module.exports = {
  SentinelOneConnector,
  ThreatStatus,
  ThreatAction,
  AgentAction,
  DVEventType,
};
