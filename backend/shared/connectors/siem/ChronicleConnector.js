/**
 * Google Chronicle Connector
 * 
 * SIEM integration with:
 * - UDM event ingestion
 * - YARA-L 2.0 detection rules
 * - Entity search
 * - Alert management
 * - IOC feeds
 */

const { BaseConnector, ConnectorState } = require('../base/BaseConnector');
const { CircuitBreaker, RetryStrategy } = require('../base/Resilience');

/**
 * UDM Event Types
 */
const UDMEventType = {
  // Network
  NETWORK_CONNECTION: 'NETWORK_CONNECTION',
  NETWORK_DNS: 'NETWORK_DNS',
  NETWORK_HTTP: 'NETWORK_HTTP',
  NETWORK_FLOW: 'NETWORK_FLOW',
  
  // Auth
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_CREATION: 'USER_CREATION',
  USER_DELETION: 'USER_DELETION',
  USER_RESOURCE_ACCESS: 'USER_RESOURCE_ACCESS',
  
  // File
  FILE_CREATION: 'FILE_CREATION',
  FILE_DELETION: 'FILE_DELETION',
  FILE_MODIFICATION: 'FILE_MODIFICATION',
  FILE_READ: 'FILE_READ',
  FILE_OPEN: 'FILE_OPEN',
  
  // Process
  PROCESS_LAUNCH: 'PROCESS_LAUNCH',
  PROCESS_TERMINATION: 'PROCESS_TERMINATION',
  PROCESS_INJECTION: 'PROCESS_INJECTION',
  
  // Registry (Windows)
  REGISTRY_CREATION: 'REGISTRY_CREATION',
  REGISTRY_MODIFICATION: 'REGISTRY_MODIFICATION',
  REGISTRY_DELETION: 'REGISTRY_DELETION',
  
  // Email
  EMAIL_TRANSACTION: 'EMAIL_TRANSACTION',
  
  // Generic
  GENERIC_EVENT: 'GENERIC_EVENT',
  STATUS_UPDATE: 'STATUS_UPDATE',
  SCAN_FILE: 'SCAN_FILE',
  SCAN_HOST: 'SCAN_HOST',
  SCAN_NETWORK: 'SCAN_NETWORK',
};

/**
 * UDM Entity Types
 */
const UDMEntityType = {
  USER: 'USER',
  ASSET: 'ASSET',
  IP_ADDRESS: 'IP_ADDRESS',
  DOMAIN_NAME: 'DOMAIN',
  FILE: 'FILE',
  PROCESS: 'PROCESS',
  URL: 'URL',
  RESOURCE: 'RESOURCE',
};

/**
 * Google Chronicle Connector
 */
class ChronicleConnector extends BaseConnector {
  constructor(config = {}) {
    super({ name: 'ChronicleConnector', ...config });
    
    this.region = config.region || 'us';
    this.customerId = config.customerId;
    this.serviceAccountKey = config.serviceAccountKey;
    
    // Base URLs per region
    this.baseUrls = {
      us: 'https://backstory.googleapis.com',
      eu: 'https://eu.backstory.googleapis.com',
      asia: 'https://asia-southeast1.backstory.googleapis.com',
    };
    
    this.baseUrl = this.baseUrls[this.region] || this.baseUrls.us;
    this.accessToken = null;
    this.tokenExpiry = null;
    
    // Resilience
    this.circuitBreaker = new CircuitBreaker({
      name: 'chronicle',
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
   * Connect to Chronicle
   */
  async connect() {
    this.setState(ConnectorState.CONNECTING);
    
    try {
      await this.getAccessToken();
      
      this.setState(ConnectorState.CONNECTED);
      this.log('info', 'Connected to Google Chronicle', { region: this.region });
      
      return true;
    } catch (error) {
      this.setState(ConnectorState.ERROR);
      this.log('error', 'Failed to connect to Chronicle', { error: error.message });
      throw error;
    }
  }

  /**
   * Get access token using service account
   */
  async getAccessToken() {
    const { GoogleAuth } = require('google-auth-library');
    
    const auth = new GoogleAuth({
      credentials: this.serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/chronicle-backstory'],
    });
    
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    
    this.accessToken = token.token;
    this.tokenExpiry = Date.now() + 3600000; // 1 hour
    
    return this.accessToken;
  }

  /**
   * Ensure token is valid
   */
  async ensureToken() {
    if (!this.accessToken || Date.now() > this.tokenExpiry - 60000) {
      await this.getAccessToken();
    }
    return this.accessToken;
  }

  /**
   * Make API request
   */
  async request(path, options = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        await this.ensureToken();
        
        const url = `${this.baseUrl}${path}`;
        const response = await fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (!response.ok) {
          const error = new Error(`Chronicle API error: ${response.status}`);
          error.status = response.status;
          error.body = await response.text();
          throw error;
        }

        return response.json();
      });
    });
  }

  // ============================================
  // UDM EVENT INGESTION
  // ============================================

  /**
   * Create UDM event
   */
  createUDMEvent(eventType, data) {
    return {
      metadata: {
        event_timestamp: data.timestamp || new Date().toISOString(),
        event_type: eventType,
        vendor_name: 'VictoryKit',
        product_name: data.productName || 'SecurityPlatform',
        log_type: data.logType || 'VICTORYKIT',
      },
      principal: data.principal ? this.formatEntity(data.principal) : undefined,
      target: data.target ? this.formatEntity(data.target) : undefined,
      src: data.src ? this.formatEntity(data.src) : undefined,
      observer: data.observer ? this.formatEntity(data.observer) : undefined,
      intermediary: data.intermediary?.map(e => this.formatEntity(e)),
      about: data.about?.map(e => this.formatEntity(e)),
      network: data.network,
      security_result: data.securityResult ? [data.securityResult] : undefined,
      additional: data.additional,
    };
  }

  /**
   * Format entity for UDM
   */
  formatEntity(entity) {
    const udmEntity = {};

    if (entity.hostname) udmEntity.hostname = entity.hostname;
    if (entity.ip) udmEntity.ip = Array.isArray(entity.ip) ? entity.ip : [entity.ip];
    if (entity.mac) udmEntity.mac = Array.isArray(entity.mac) ? entity.mac : [entity.mac];
    if (entity.port) udmEntity.port = entity.port;
    if (entity.url) udmEntity.url = entity.url;
    if (entity.domain) udmEntity.domain = { name: entity.domain };
    
    if (entity.user) {
      udmEntity.user = {
        userid: entity.user.id,
        user_display_name: entity.user.name,
        email_addresses: entity.user.email ? [entity.user.email] : undefined,
      };
    }

    if (entity.process) {
      udmEntity.process = {
        pid: entity.process.pid,
        command_line: entity.process.commandLine,
        file: entity.process.file ? {
          full_path: entity.process.file.path,
          md5: entity.process.file.md5,
          sha256: entity.process.file.sha256,
        } : undefined,
      };
    }

    if (entity.file) {
      udmEntity.file = {
        full_path: entity.file.path,
        md5: entity.file.md5,
        sha1: entity.file.sha1,
        sha256: entity.file.sha256,
        size: entity.file.size,
        mime_type: entity.file.mimeType,
      };
    }

    if (entity.asset) {
      udmEntity.asset = {
        asset_id: entity.asset.id,
        hostname: entity.asset.hostname,
        platform_software: entity.asset.platform,
      };
    }

    return udmEntity;
  }

  /**
   * Ingest UDM events
   */
  async ingestEvents(events) {
    const udmEvents = events.map(e => 
      e.metadata ? e : this.createUDMEvent(e.type, e)
    );

    const response = await this.request('/v1/udmevents:batchCreate', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: this.customerId,
        events: udmEvents,
      }),
    });

    this.emit('events:ingested', { count: events.length });
    return response;
  }

  /**
   * Ingest single event
   */
  async ingestEvent(eventType, data) {
    const event = this.createUDMEvent(eventType, data);
    return this.ingestEvents([event]);
  }

  // ============================================
  // ENTITY SEARCH
  // ============================================

  /**
   * Search entities
   */
  async searchEntities(query, options = {}) {
    const params = new URLSearchParams({
      query,
      start_time: options.startTime || new Date(Date.now() - 86400000).toISOString(),
      end_time: options.endTime || new Date().toISOString(),
      page_size: options.pageSize || 100,
    });

    if (options.pageToken) {
      params.set('page_token', options.pageToken);
    }

    return this.request(`/v1/entity:search?${params}`);
  }

  /**
   * Lookup IP address
   */
  async lookupIP(ip, options = {}) {
    return this.searchEntities(`ip="${ip}"`, options);
  }

  /**
   * Lookup domain
   */
  async lookupDomain(domain, options = {}) {
    return this.searchEntities(`domain="${domain}"`, options);
  }

  /**
   * Lookup file hash
   */
  async lookupHash(hash, options = {}) {
    // Determine hash type
    let hashType = 'sha256';
    if (hash.length === 32) hashType = 'md5';
    else if (hash.length === 40) hashType = 'sha1';

    return this.searchEntities(`hash.${hashType}="${hash}"`, options);
  }

  /**
   * Lookup user
   */
  async lookupUser(userId, options = {}) {
    return this.searchEntities(`user.userid="${userId}"`, options);
  }

  /**
   * Lookup asset
   */
  async lookupAsset(hostname, options = {}) {
    return this.searchEntities(`asset.hostname="${hostname}"`, options);
  }

  // ============================================
  // DETECTION RULES (YARA-L 2.0)
  // ============================================

  /**
   * List detection rules
   */
  async listRules(options = {}) {
    const params = new URLSearchParams({
      page_size: options.pageSize || 100,
    });

    if (options.pageToken) {
      params.set('page_token', options.pageToken);
    }

    return this.request(`/v2/detect/rules?${params}`);
  }

  /**
   * Get rule by ID
   */
  async getRule(ruleId) {
    return this.request(`/v2/detect/rules/${ruleId}`);
  }

  /**
   * Create detection rule
   */
  async createRule(rule) {
    return this.request('/v2/detect/rules', {
      method: 'POST',
      body: JSON.stringify({
        rule_text: rule.text,
        metadata: {
          name: rule.name,
          description: rule.description,
          severity: rule.severity || 'MEDIUM',
          priority: rule.priority || 'MEDIUM',
          type: rule.type || 'SINGLE_EVENT',
        },
      }),
    });
  }

  /**
   * Update detection rule
   */
  async updateRule(ruleId, updates) {
    return this.request(`/v2/detect/rules/${ruleId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete detection rule
   */
  async deleteRule(ruleId) {
    return this.request(`/v2/detect/rules/${ruleId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Enable/disable rule
   */
  async setRuleEnabled(ruleId, enabled) {
    return this.updateRule(ruleId, { enabled });
  }

  /**
   * Validate YARA-L rule
   */
  async validateRule(ruleText) {
    return this.request('/v2/detect/rules:validate', {
      method: 'POST',
      body: JSON.stringify({ rule_text: ruleText }),
    });
  }

  /**
   * Generate YARA-L rule template
   */
  generateRuleTemplate(options = {}) {
    const {
      name = 'custom_rule',
      description = 'Custom detection rule',
      eventType = 'network_http',
      condition = 'true',
    } = options;

    return `
rule ${name} {
  meta:
    author = "VictoryKit"
    description = "${description}"
    severity = "MEDIUM"
    priority = "MEDIUM"
  
  events:
    $e.metadata.event_type = "${eventType.toUpperCase()}"
    ${condition}
  
  condition:
    $e
}
    `.trim();
  }

  // ============================================
  // ALERTS
  // ============================================

  /**
   * List alerts
   */
  async listAlerts(options = {}) {
    const params = new URLSearchParams({
      start_time: options.startTime || new Date(Date.now() - 86400000).toISOString(),
      end_time: options.endTime || new Date().toISOString(),
      page_size: options.pageSize || 100,
    });

    if (options.pageToken) params.set('page_token', options.pageToken);
    if (options.alertState) params.set('alert_state', options.alertState);
    if (options.severity) params.set('severity', options.severity);

    return this.request(`/v1/alert:listAlerts?${params}`);
  }

  /**
   * Get alert by ID
   */
  async getAlert(alertId) {
    return this.request(`/v1/alert/${alertId}`);
  }

  /**
   * Update alert state
   */
  async updateAlertState(alertId, state, reason = '') {
    return this.request(`/v1/alert/${alertId}:updateState`, {
      method: 'POST',
      body: JSON.stringify({
        state,
        reason,
      }),
    });
  }

  /**
   * Get alert timeline
   */
  async getAlertTimeline(alertId) {
    return this.request(`/v1/alert/${alertId}/timeline`);
  }

  // ============================================
  // IOC MANAGEMENT
  // ============================================

  /**
   * List IOC feeds
   */
  async listFeeds() {
    return this.request('/v1/feeds');
  }

  /**
   * Create IOC feed
   */
  async createFeed(name, sourceType, options = {}) {
    return this.request('/v1/feeds', {
      method: 'POST',
      body: JSON.stringify({
        display_name: name,
        source_type: sourceType,
        log_type: options.logType || 'VICTORYKIT_IOC',
        namespace: options.namespace || 'victorykit',
      }),
    });
  }

  /**
   * Push IOCs to feed
   */
  async pushIOCs(feedId, iocs) {
    const formattedIOCs = iocs.map(ioc => ({
      indicator: {
        type: this.mapIOCType(ioc.type),
        value: ioc.value,
      },
      metadata: {
        description: ioc.description,
        severity: ioc.severity,
        confidence: ioc.confidence,
        threat_type: ioc.threatType,
        first_seen: ioc.firstSeen,
        last_seen: ioc.lastSeen,
        source: ioc.source || 'VictoryKit',
      },
    }));

    return this.request(`/v1/feeds/${feedId}:pushIndicators`, {
      method: 'POST',
      body: JSON.stringify({ indicators: formattedIOCs }),
    });
  }

  /**
   * Map IOC type to Chronicle format
   */
  mapIOCType(type) {
    const typeMap = {
      ip: 'IP_ADDRESS',
      ipv4: 'IP_ADDRESS',
      ipv6: 'IP_ADDRESS',
      domain: 'DOMAIN_NAME',
      url: 'URL',
      md5: 'HASH_MD5',
      sha1: 'HASH_SHA1',
      sha256: 'HASH_SHA256',
      email: 'EMAIL',
      filename: 'FILE_NAME',
    };

    return typeMap[type.toLowerCase()] || 'UNKNOWN';
  }

  // ============================================
  // REFERENCE LISTS
  // ============================================

  /**
   * List reference lists
   */
  async listReferenceLists() {
    return this.request('/v2/referenceLists');
  }

  /**
   * Create reference list
   */
  async createReferenceList(name, description, entries = []) {
    return this.request('/v2/referenceLists', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        lines: entries,
      }),
    });
  }

  /**
   * Update reference list
   */
  async updateReferenceList(listId, entries) {
    return this.request(`/v2/referenceLists/${listId}`, {
      method: 'PATCH',
      body: JSON.stringify({ lines: entries }),
    });
  }

  /**
   * Add to reference list
   */
  async addToReferenceList(listId, entries) {
    const list = await this.request(`/v2/referenceLists/${listId}`);
    const currentEntries = list.lines || [];
    const newEntries = [...new Set([...currentEntries, ...entries])];
    
    return this.updateReferenceList(listId, newEntries);
  }

  // ============================================
  // RETROHUNT
  // ============================================

  /**
   * Create retrohunt
   */
  async createRetrohunt(ruleId, startTime, endTime) {
    return this.request('/v2/detect/retrohunts', {
      method: 'POST',
      body: JSON.stringify({
        rule_id: ruleId,
        start_time: startTime,
        end_time: endTime,
      }),
    });
  }

  /**
   * Get retrohunt status
   */
  async getRetrohunt(retrohuntId) {
    return this.request(`/v2/detect/retrohunts/${retrohuntId}`);
  }

  /**
   * List retrohunt results
   */
  async listRetrohuntResults(retrohuntId, options = {}) {
    const params = new URLSearchParams({
      page_size: options.pageSize || 100,
    });

    if (options.pageToken) {
      params.set('page_token', options.pageToken);
    }

    return this.request(`/v2/detect/retrohunts/${retrohuntId}/detections?${params}`);
  }

  /**
   * Check health
   */
  async checkHealth() {
    try {
      await this.ensureToken();
      
      return {
        isHealthy: true,
        message: 'Connected',
        region: this.region,
        customerId: this.customerId,
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
    this.accessToken = null;
    this.log('info', 'Disconnected from Google Chronicle');
  }
}

module.exports = {
  ChronicleConnector,
  UDMEventType,
  UDMEntityType,
};
