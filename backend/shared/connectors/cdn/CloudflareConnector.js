/**
 * Cloudflare Connector
 *
 * WAF/CDN/Bot/DDoS integration with:
 * - WAF rule management and blocking
 * - DDoS protection and mitigation
 * - Bot management and challenges
 * - Rate limiting and API protection
 * - Firewall rules and policies
 * - Analytics and logging
 */

const { BaseConnector, ConnectorState } = require('../base/BaseConnector');
const { CircuitBreaker, RetryStrategy } = require('../base/Resilience');
const axios = require('axios');

/**
 * Cloudflare Rule Action Types
 */
const RuleAction = {
  BLOCK: 'block',
  CHALLENGE: 'challenge',
  JS_CHALLENGE: 'js_challenge',
  ALLOW: 'allow',
  LOG: 'log',
  BYPASS: 'bypass'
};

/**
 * Cloudflare Rule Categories
 */
const RuleCategory = {
  DDoS: 'DDoS',
  WAF: 'WAF',
  BOT: 'Bot',
  RATE_LIMIT: 'Rate Limit',
  FIREWALL: 'Firewall'
};

/**
 * Cloudflare Zone Status
 */
const ZoneStatus = {
  ACTIVE: 'active',
  PENDING: 'pending',
  INITIALIZING: 'initializing',
  MOVED: 'moved',
  DELETED: 'deleted',
  DEACTIVATED: 'deactivated'
};

class CloudflareConnector extends BaseConnector {
  constructor(config) {
    super('Cloudflare', config);

    this.apiToken = config.apiToken;
    this.accountId = config.accountId;
    this.baseUrl = 'https://api.cloudflare.com/client/v4';

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
   * Get authorization headers
   */
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * List Zones
   */
  async listZones(filter = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const params = {};
        if (filter.name) params.name = filter.name;
        if (filter.status) params.status = filter.status;
        if (filter.page) params.page = filter.page;
        if (filter.per_page) params.per_page = Math.min(filter.per_page, 50);

        const response = await axios.get(
          `${this.baseUrl}/zones`,
          {
            headers: this.getHeaders(),
            params
          }
        );

        return response.data.result;
      });
    });
  }

  /**
   * Get Zone Details
   */
  async getZone(zoneId) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const response = await axios.get(
          `${this.baseUrl}/zones/${zoneId}`,
          {
            headers: this.getHeaders()
          }
        );

        return response.data.result;
      });
    });
  }

  /**
   * Create WAF Rule
   */
  async createWAFRule(zoneId, ruleData) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const response = await axios.post(
          `${this.baseUrl}/zones/${zoneId}/firewall/rules`,
          {
            description: ruleData.description,
            action: ruleData.action || RuleAction.BLOCK,
            priority: ruleData.priority || 1,
            paused: ruleData.paused || false,
            filter: {
              expression: ruleData.expression,
              paused: false
            }
          },
          {
            headers: this.getHeaders()
          }
        );

        this.emit('waf-rule:created', { zoneId, ruleId: response.data.result.id });
        return response.data.result;
      });
    });
  }

  /**
   * Update WAF Rule
   */
  async updateWAFRule(zoneId, ruleId, updates) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const response = await axios.put(
          `${this.baseUrl}/zones/${zoneId}/firewall/rules/${ruleId}`,
          updates,
          {
            headers: this.getHeaders()
          }
        );

        this.emit('waf-rule:updated', { zoneId, ruleId, updates });
        return response.data.result;
      });
    });
  }

  /**
   * Delete WAF Rule
   */
  async deleteWAFRule(zoneId, ruleId) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const response = await axios.delete(
          `${this.baseUrl}/zones/${zoneId}/firewall/rules/${ruleId}`,
          {
            headers: this.getHeaders()
          }
        );

        this.emit('waf-rule:deleted', { zoneId, ruleId });
        return response.data;
      });
    });
  }

  /**
   * List WAF Rules
   */
  async listWAFRules(zoneId, filter = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const params = {};
        if (filter.description) params.description = filter.description;
        if (filter.action) params.action = filter.action;
        if (filter.page) params.page = filter.page;
        if (filter.per_page) params.per_page = Math.min(filter.per_page, 100);

        const response = await axios.get(
          `${this.baseUrl}/zones/${zoneId}/firewall/rules`,
          {
            headers: this.getHeaders(),
            params
          }
        );

        return response.data.result;
      });
    });
  }

  /**
   * Create Rate Limiting Rule
   */
  async createRateLimit(zoneId, ruleData) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const response = await axios.post(
          `${this.baseUrl}/zones/${zoneId}/rate_limits`,
          {
            description: ruleData.description,
            match: {
              request: {
                url: ruleData.url || '*',
                schemes: ruleData.schemes || ['HTTP', 'HTTPS'],
                methods: ruleData.methods || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
              }
            },
            threshold: ruleData.threshold || 100,
            period: ruleData.period || 60,
            action: {
              mode: ruleData.action || 'simulate',
              timeout: ruleData.timeout || 60,
              response: ruleData.response || {
                content_type: 'text/plain',
                body: 'Rate limit exceeded'
              }
            },
            disabled: ruleData.disabled || false
          },
          {
            headers: this.getHeaders()
          }
        );

        this.emit('rate-limit:created', { zoneId, ruleId: response.data.result.id });
        return response.data.result;
      });
    });
  }

  /**
   * Update Rate Limiting Rule
   */
  async updateRateLimit(zoneId, ruleId, updates) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const response = await axios.put(
          `${this.baseUrl}/zones/${zoneId}/rate_limits/${ruleId}`,
          updates,
          {
            headers: this.getHeaders()
          }
        );

        this.emit('rate-limit:updated', { zoneId, ruleId, updates });
        return response.data.result;
      });
    });
  }

  /**
   * Delete Rate Limiting Rule
   */
  async deleteRateLimit(zoneId, ruleId) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const response = await axios.delete(
          `${this.baseUrl}/zones/${zoneId}/rate_limits/${ruleId}`,
          {
            headers: this.getHeaders()
          }
        );

        this.emit('rate-limit:deleted', { zoneId, ruleId });
        return response.data;
      });
    });
  }

  /**
   * Create Bot Management Rule
   */
  async createBotRule(zoneId, ruleData) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const response = await axios.post(
          `${this.baseUrl}/zones/${zoneId}/bot_management/rules`,
          {
            description: ruleData.description,
            mode: ruleData.mode || 'managed_challenge',
            enabled: ruleData.enabled !== false,
            config: {
              expression: ruleData.expression,
              action: ruleData.action || 'managed_challenge'
            }
          },
          {
            headers: this.getHeaders()
          }
        );

        this.emit('bot-rule:created', { zoneId, ruleId: response.data.result.id });
        return response.data.result;
      });
    });
  }

  /**
   * Get Firewall Events
   */
  async getFirewallEvents(zoneId, filter = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const params = {};
        if (filter.since) params.since = filter.since;
        if (filter.until) params.until = filter.until;
        if (filter.ip) params.ip = filter.ip;
        if (filter.action) params.action = filter.action;
        if (filter.page) params.page = filter.page;
        if (filter.per_page) params.per_page = Math.min(filter.per_page, 1000);

        const response = await axios.get(
          `${this.baseUrl}/zones/${zoneId}/firewall/events`,
          {
            headers: this.getHeaders(),
            params
          }
        );

        return response.data.result;
      });
    });
  }

  /**
   * Get DDoS Attack Analytics
   */
  async getDDoSAnalytics(zoneId, filter = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const params = {};
        if (filter.since) params.since = filter.since;
        if (filter.until) params.until = filter.until;
        if (filter.mitigation_product) params.mitigation_product = filter.mitigation_product;

        const response = await axios.get(
          `${this.baseUrl}/zones/${zoneId}/analytics/lts`,
          {
            headers: this.getHeaders(),
            params
          }
        );

        return response.data.result;
      });
    });
  }

  /**
   * Block IP Address
   */
  async blockIP(zoneId, ipAddress, notes = '') {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const response = await axios.post(
          `${this.baseUrl}/zones/${zoneId}/firewall/access_rules/rules`,
          {
            mode: 'block',
            configuration: {
              target: 'ip',
              value: ipAddress
            },
            notes: notes
          },
          {
            headers: this.getHeaders()
          }
        );

        this.emit('ip:blocked', { zoneId, ipAddress });
        return response.data.result;
      });
    });
  }

  /**
   * Unblock IP Address
   */
  async unblockIP(zoneId, ruleId) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const response = await axios.delete(
          `${this.baseUrl}/zones/${zoneId}/firewall/access_rules/rules/${ruleId}`,
          {
            headers: this.getHeaders()
          }
        );

        this.emit('ip:unblocked', { zoneId, ruleId });
        return response.data;
      });
    });
  }

  /**
   * List Access Rules
   */
  async listAccessRules(zoneId, filter = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const params = {};
        if (filter.mode) params.mode = filter.mode;
        if (filter.configuration_target) params.configuration_target = filter.configuration_target;
        if (filter.page) params.page = filter.page;
        if (filter.per_page) params.per_page = Math.min(filter.per_page, 100);

        const response = await axios.get(
          `${this.baseUrl}/zones/${zoneId}/firewall/access_rules/rules`,
          {
            headers: this.getHeaders(),
            params
          }
        );

        return response.data.result;
      });
    });
  }

  /**
   * Create Page Rule
   */
  async createPageRule(zoneId, ruleData) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const response = await axios.post(
          `${this.baseUrl}/zones/${zoneId}/pagerules`,
          {
            targets: ruleData.targets,
            actions: ruleData.actions,
            priority: ruleData.priority || 1,
            status: ruleData.status || 'active'
          },
          {
            headers: this.getHeaders()
          }
        );

        this.emit('page-rule:created', { zoneId, ruleId: response.data.result.id });
        return response.data.result;
      });
    });
  }

  /**
   * Get Zone Analytics
   */
  async getZoneAnalytics(zoneId, filter = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const params = {};
        if (filter.since) params.since = filter.since;
        if (filter.until) params.until = filter.until;
        if (filter.continents) params.continents = filter.continents;
        if (filter.countries) params.countries = filter.countries;

        const response = await axios.get(
          `${this.baseUrl}/zones/${zoneId}/analytics/dashboard`,
          {
            headers: this.getHeaders(),
            params
          }
        );

        return response.data.result;
      });
    });
  }

  /**
   * Purge Cache
   */
  async purgeCache(zoneId, purgeData) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const response = await axios.post(
          `${this.baseUrl}/zones/${zoneId}/purge_cache`,
          purgeData,
          {
            headers: this.getHeaders()
          }
        );

        this.emit('cache:purged', { zoneId });
        return response.data;
      });
    });
  }

  /**
   * Health Check
   */
  async healthCheck() {
    try {
      await this.listZones({ per_page: 1 });
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
      type: 'WAF/CDN',
      vendor: 'Cloudflare',
      product: 'Cloudflare Enterprise',
      capabilities: [
        'waf-management',
        'ddos-protection',
        'bot-management',
        'rate-limiting',
        'firewall-rules',
        'analytics'
      ],
      config: {
        accountId: this.accountId
      }
    };
  }
}

module.exports = CloudflareConnector;