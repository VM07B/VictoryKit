/**
 * Fastly Edge Connector
 * 
 * Edge computing, WAF, and CDN management:
 * - VCL service management
 * - Compute@Edge deployment
 * - WAF rules and ACLs
 * - Real-time logging
 * - Edge dictionaries
 * - Image optimization
 */

const { BaseConnector, ConnectorState } = require('../base/BaseConnector');
const { CircuitBreaker, RetryStrategy } = require('../base/Resilience');

/**
 * Service types
 */
const ServiceType = {
  VCL: 'vcl',
  COMPUTE: 'wasm', // Compute@Edge
};

/**
 * Backend types
 */
const BackendType = {
  HTTP: 'http',
  HTTPS: 'https',
};

/**
 * WAF rule status
 */
const WAFRuleStatus = {
  LOG: 'log',
  BLOCK: 'block',
  DISABLED: 'disabled',
};

/**
 * WAF rule types
 */
const WAFRuleType = {
  OWASP: 'owasp',
  FASTLY: 'fastly',
  TRUSTWAVE: 'trustwave',
  CUSTOM: 'custom',
};

/**
 * Edge action types
 */
const EdgeAction = {
  BLOCK: 'block',
  ALLOW: 'allow',
  CHALLENGE: 'challenge',
  LOG: 'log',
  REDIRECT: 'redirect',
};

/**
 * Logging providers
 */
const LoggingProvider = {
  S3: 's3',
  GCS: 'gcs',
  BIGQUERY: 'bigquery',
  CLOUDWATCH: 'cloudwatchlogs',
  DATADOG: 'datadog',
  SPLUNK: 'splunk',
  SUMO_LOGIC: 'sumologic',
  HTTPS: 'https',
  SYSLOG: 'syslog',
  KAFKA: 'kafka',
  KINESIS: 'kinesis',
  ELASTICSEARCH: 'elasticsearch',
  AZURE_BLOB: 'azureblob',
};

/**
 * Fastly Connector
 */
class FastlyConnector extends BaseConnector {
  constructor(config = {}) {
    super({ name: 'FastlyConnector', ...config });
    
    this.apiUrl = config.apiUrl || 'https://api.fastly.com';
    this.apiToken = config.apiToken;
    
    // Resilience
    this.circuitBreaker = new CircuitBreaker({
      name: 'fastly',
      failureThreshold: 5,
      timeout: 30000,
    });
    
    this.retryStrategy = new RetryStrategy({
      maxRetries: 3,
      type: 'exponential-jitter',
      baseDelay: 500,
    });
  }

  /**
   * Connect to Fastly API
   */
  async connect() {
    this.setState(ConnectorState.CONNECTING);
    
    try {
      // Verify token
      const user = await this.request('/current_user');
      
      this.setState(ConnectorState.CONNECTED);
      this.log('info', 'Connected to Fastly', { user: user.login });
      
      return user;
    } catch (error) {
      this.setState(ConnectorState.ERROR);
      this.log('error', 'Failed to connect to Fastly', { error: error.message });
      throw error;
    }
  }

  /**
   * Make API request
   */
  async request(path, options = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const url = `${this.apiUrl}${path}`;
        const headers = {
          'Fastly-Key': this.apiToken,
          'Accept': 'application/json',
          ...options.headers,
        };

        if (options.body && typeof options.body !== 'string') {
          headers['Content-Type'] = 'application/json';
          options.body = JSON.stringify(options.body);
        }

        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (!response.ok) {
          const errorBody = await response.text();
          const error = new Error(`Fastly API error: ${response.status}`);
          error.status = response.status;
          error.body = errorBody;
          throw error;
        }

        // Handle empty responses
        const text = await response.text();
        return text ? JSON.parse(text) : null;
      });
    });
  }

  // ============================================
  // SERVICES
  // ============================================

  /**
   * List services
   */
  async listServices(options = {}) {
    const params = new URLSearchParams();
    if (options.page) params.set('page', options.page);
    if (options.perPage) params.set('per_page', options.perPage || 20);
    
    const query = params.toString();
    return this.request(`/service${query ? `?${query}` : ''}`);
  }

  /**
   * Create service
   */
  async createService(name, type = ServiceType.VCL, comment = '') {
    const result = await this.request('/service', {
      method: 'POST',
      body: { name, type, comment },
    });

    this.emit('service:created', result);
    return result;
  }

  /**
   * Get service
   */
  async getService(serviceId) {
    return this.request(`/service/${serviceId}`);
  }

  /**
   * Get service details with active version
   */
  async getServiceDetails(serviceId) {
    return this.request(`/service/${serviceId}/details`);
  }

  /**
   * Delete service
   */
  async deleteService(serviceId) {
    await this.request(`/service/${serviceId}`, { method: 'DELETE' });
    return true;
  }

  // ============================================
  // VERSIONS
  // ============================================

  /**
   * List versions
   */
  async listVersions(serviceId) {
    return this.request(`/service/${serviceId}/version`);
  }

  /**
   * Create new version
   */
  async createVersion(serviceId) {
    return this.request(`/service/${serviceId}/version`, { method: 'POST' });
  }

  /**
   * Clone version
   */
  async cloneVersion(serviceId, versionNumber) {
    return this.request(`/service/${serviceId}/version/${versionNumber}/clone`, {
      method: 'PUT',
    });
  }

  /**
   * Validate version
   */
  async validateVersion(serviceId, versionNumber) {
    return this.request(`/service/${serviceId}/version/${versionNumber}/validate`);
  }

  /**
   * Activate version
   */
  async activateVersion(serviceId, versionNumber) {
    const result = await this.request(
      `/service/${serviceId}/version/${versionNumber}/activate`,
      { method: 'PUT' }
    );

    this.emit('version:activated', { serviceId, version: versionNumber });
    return result;
  }

  /**
   * Deactivate version
   */
  async deactivateVersion(serviceId, versionNumber) {
    return this.request(
      `/service/${serviceId}/version/${versionNumber}/deactivate`,
      { method: 'PUT' }
    );
  }

  // ============================================
  // BACKENDS
  // ============================================

  /**
   * List backends
   */
  async listBackends(serviceId, versionNumber) {
    return this.request(`/service/${serviceId}/version/${versionNumber}/backend`);
  }

  /**
   * Create backend
   */
  async createBackend(serviceId, versionNumber, backend) {
    return this.request(`/service/${serviceId}/version/${versionNumber}/backend`, {
      method: 'POST',
      body: {
        name: backend.name,
        address: backend.address,
        port: backend.port || 443,
        use_ssl: backend.useSsl ?? true,
        ssl_cert_hostname: backend.sslCertHostname,
        ssl_sni_hostname: backend.sslSniHostname,
        override_host: backend.overrideHost,
        connect_timeout: backend.connectTimeout || 1000,
        first_byte_timeout: backend.firstByteTimeout || 15000,
        between_bytes_timeout: backend.betweenBytesTimeout || 10000,
        max_conn: backend.maxConn || 200,
        weight: backend.weight || 100,
        healthcheck: backend.healthcheck,
        shield: backend.shield, // POP to use as shield
        auto_loadbalance: backend.autoLoadbalance ?? true,
      },
    });
  }

  /**
   * Update backend
   */
  async updateBackend(serviceId, versionNumber, backendName, updates) {
    return this.request(
      `/service/${serviceId}/version/${versionNumber}/backend/${backendName}`,
      {
        method: 'PUT',
        body: updates,
      }
    );
  }

  /**
   * Delete backend
   */
  async deleteBackend(serviceId, versionNumber, backendName) {
    await this.request(
      `/service/${serviceId}/version/${versionNumber}/backend/${backendName}`,
      { method: 'DELETE' }
    );
    return true;
  }

  // ============================================
  // DOMAINS
  // ============================================

  /**
   * List domains
   */
  async listDomains(serviceId, versionNumber) {
    return this.request(`/service/${serviceId}/version/${versionNumber}/domain`);
  }

  /**
   * Create domain
   */
  async createDomain(serviceId, versionNumber, name, comment = '') {
    return this.request(`/service/${serviceId}/version/${versionNumber}/domain`, {
      method: 'POST',
      body: { name, comment },
    });
  }

  /**
   * Check domain
   */
  async checkDomain(serviceId, versionNumber, domainName) {
    return this.request(
      `/service/${serviceId}/version/${versionNumber}/domain/${domainName}/check`
    );
  }

  /**
   * Delete domain
   */
  async deleteDomain(serviceId, versionNumber, domainName) {
    await this.request(
      `/service/${serviceId}/version/${versionNumber}/domain/${domainName}`,
      { method: 'DELETE' }
    );
    return true;
  }

  // ============================================
  // VCL
  // ============================================

  /**
   * List VCL files
   */
  async listVcl(serviceId, versionNumber) {
    return this.request(`/service/${serviceId}/version/${versionNumber}/vcl`);
  }

  /**
   * Create VCL
   */
  async createVcl(serviceId, versionNumber, vcl) {
    return this.request(`/service/${serviceId}/version/${versionNumber}/vcl`, {
      method: 'POST',
      body: {
        name: vcl.name,
        content: vcl.content,
        main: vcl.main ?? false,
      },
    });
  }

  /**
   * Update VCL
   */
  async updateVcl(serviceId, versionNumber, vclName, content) {
    return this.request(
      `/service/${serviceId}/version/${versionNumber}/vcl/${vclName}`,
      {
        method: 'PUT',
        body: { content },
      }
    );
  }

  /**
   * Set main VCL
   */
  async setMainVcl(serviceId, versionNumber, vclName) {
    return this.request(
      `/service/${serviceId}/version/${versionNumber}/vcl/${vclName}/main`,
      { method: 'PUT' }
    );
  }

  /**
   * Generate VCL boilerplate
   */
  generateVclBoilerplate(options = {}) {
    return `
# VictoryKit Security VCL
# Generated: ${new Date().toISOString()}

sub vcl_recv {
  # Rate limiting by IP
  ${options.rateLimit ? `
  if (req.http.Fastly-Client-IP) {
    set req.http.X-Rate-Limit-Key = req.http.Fastly-Client-IP;
  }
  ` : ''}
  
  # Block known bad actors
  ${options.blockList ? `
  if (table.lookup(blocklist, req.http.Fastly-Client-IP)) {
    error 403 "Forbidden";
  }
  ` : ''}
  
  # Security headers check
  ${options.securityHeaders ? `
  if (!req.http.X-Request-ID) {
    set req.http.X-Request-ID = uuid.version4();
  }
  ` : ''}
  
  # Geographic restrictions
  ${options.geoRestrict ? `
  if (client.geo.country_code !~ "^(US|CA|GB|DE|FR|AU|JP|SG)$") {
    error 403 "Geographic restriction";
  }
  ` : ''}
  
  #FASTLY recv
}

sub vcl_fetch {
  # Add security headers
  set beresp.http.X-Content-Type-Options = "nosniff";
  set beresp.http.X-Frame-Options = "DENY";
  set beresp.http.X-XSS-Protection = "1; mode=block";
  set beresp.http.Referrer-Policy = "strict-origin-when-cross-origin";
  set beresp.http.Content-Security-Policy = "default-src 'self'";
  
  # Cache control
  if (beresp.http.Cache-Control ~ "private") {
    set beresp.ttl = 0s;
  }
  
  #FASTLY fetch
}

sub vcl_deliver {
  # Remove internal headers
  unset resp.http.X-Served-By;
  unset resp.http.X-Cache;
  unset resp.http.X-Cache-Hits;
  unset resp.http.X-Timer;
  
  # Add VictoryKit header
  set resp.http.X-Protected-By = "VictoryKit";
  
  #FASTLY deliver
}

sub vcl_error {
  if (obj.status == 403) {
    synthetic {"{"error": "Access Denied", "code": 403}"};
    set obj.http.Content-Type = "application/json";
    return (deliver);
  }
  
  #FASTLY error
}
    `.trim();
  }

  // ============================================
  // EDGE DICTIONARIES
  // ============================================

  /**
   * List dictionaries
   */
  async listDictionaries(serviceId, versionNumber) {
    return this.request(`/service/${serviceId}/version/${versionNumber}/dictionary`);
  }

  /**
   * Create dictionary
   */
  async createDictionary(serviceId, versionNumber, name, writeOnly = false) {
    return this.request(
      `/service/${serviceId}/version/${versionNumber}/dictionary`,
      {
        method: 'POST',
        body: { name, write_only: writeOnly },
      }
    );
  }

  /**
   * Get dictionary info
   */
  async getDictionary(serviceId, versionNumber, dictionaryName) {
    return this.request(
      `/service/${serviceId}/version/${versionNumber}/dictionary/${dictionaryName}`
    );
  }

  /**
   * List dictionary items
   */
  async listDictionaryItems(serviceId, dictionaryId) {
    return this.request(`/service/${serviceId}/dictionary/${dictionaryId}/items`);
  }

  /**
   * Upsert dictionary item
   */
  async upsertDictionaryItem(serviceId, dictionaryId, key, value) {
    return this.request(
      `/service/${serviceId}/dictionary/${dictionaryId}/item/${key}`,
      {
        method: 'PUT',
        body: { item_value: value },
      }
    );
  }

  /**
   * Delete dictionary item
   */
  async deleteDictionaryItem(serviceId, dictionaryId, key) {
    await this.request(
      `/service/${serviceId}/dictionary/${dictionaryId}/item/${key}`,
      { method: 'DELETE' }
    );
    return true;
  }

  /**
   * Batch update dictionary items
   */
  async batchUpdateDictionary(serviceId, dictionaryId, items) {
    return this.request(
      `/service/${serviceId}/dictionary/${dictionaryId}/items`,
      {
        method: 'PATCH',
        body: {
          items: items.map(item => ({
            op: item.op || 'upsert', // 'create', 'update', 'upsert', 'delete'
            item_key: item.key,
            item_value: item.value,
          })),
        },
      }
    );
  }

  // ============================================
  // ACCESS CONTROL LISTS (ACL)
  // ============================================

  /**
   * List ACLs
   */
  async listAcls(serviceId, versionNumber) {
    return this.request(`/service/${serviceId}/version/${versionNumber}/acl`);
  }

  /**
   * Create ACL
   */
  async createAcl(serviceId, versionNumber, name) {
    return this.request(`/service/${serviceId}/version/${versionNumber}/acl`, {
      method: 'POST',
      body: { name },
    });
  }

  /**
   * List ACL entries
   */
  async listAclEntries(serviceId, aclId) {
    return this.request(`/service/${serviceId}/acl/${aclId}/entries`);
  }

  /**
   * Add ACL entry (IP or CIDR)
   */
  async addAclEntry(serviceId, aclId, entry) {
    return this.request(`/service/${serviceId}/acl/${aclId}/entry`, {
      method: 'POST',
      body: {
        ip: entry.ip,
        subnet: entry.subnet,
        negated: entry.negated ?? false, // true = whitelist, false = blacklist
        comment: entry.comment,
      },
    });
  }

  /**
   * Delete ACL entry
   */
  async deleteAclEntry(serviceId, aclId, entryId) {
    await this.request(`/service/${serviceId}/acl/${aclId}/entry/${entryId}`, {
      method: 'DELETE',
    });
    return true;
  }

  /**
   * Batch update ACL entries
   */
  async batchUpdateAcl(serviceId, aclId, entries) {
    return this.request(`/service/${serviceId}/acl/${aclId}/entries`, {
      method: 'PATCH',
      body: {
        entries: entries.map(entry => ({
          op: entry.op || 'create',
          ip: entry.ip,
          subnet: entry.subnet,
          negated: entry.negated ?? false,
          comment: entry.comment,
        })),
      },
    });
  }

  // ============================================
  // WAF
  // ============================================

  /**
   * List WAF firewalls
   */
  async listWafFirewalls(options = {}) {
    const params = new URLSearchParams();
    if (options.serviceId) params.set('filter[service_id]', options.serviceId);
    
    const query = params.toString();
    return this.request(`/waf/firewalls${query ? `?${query}` : ''}`);
  }

  /**
   * Create WAF firewall
   */
  async createWafFirewall(serviceId, versionNumber) {
    return this.request('/waf/firewalls', {
      method: 'POST',
      body: {
        data: {
          type: 'waf_firewall',
          attributes: {
            service_id: serviceId,
            service_version_number: versionNumber,
          },
        },
      },
    });
  }

  /**
   * Get WAF firewall
   */
  async getWafFirewall(firewallId) {
    return this.request(`/waf/firewalls/${firewallId}`);
  }

  /**
   * Enable WAF firewall
   */
  async enableWafFirewall(firewallId) {
    return this.request(`/waf/firewalls/${firewallId}`, {
      method: 'PATCH',
      body: {
        data: {
          type: 'waf_firewall',
          attributes: { disabled: false },
        },
      },
    });
  }

  /**
   * Disable WAF firewall
   */
  async disableWafFirewall(firewallId) {
    return this.request(`/waf/firewalls/${firewallId}`, {
      method: 'PATCH',
      body: {
        data: {
          type: 'waf_firewall',
          attributes: { disabled: true },
        },
      },
    });
  }

  /**
   * List WAF rules
   */
  async listWafRules(options = {}) {
    const params = new URLSearchParams();
    if (options.ruleType) params.set('filter[rule_type]', options.ruleType);
    if (options.modsecRuleId) params.set('filter[modsec_rule_id]', options.modsecRuleId);
    
    const query = params.toString();
    return this.request(`/waf/rules${query ? `?${query}` : ''}`);
  }

  /**
   * Update WAF rule status
   */
  async updateWafRuleStatus(firewallId, firewallVersionNumber, ruleId, status) {
    return this.request(
      `/waf/firewalls/${firewallId}/versions/${firewallVersionNumber}/active-rules/${ruleId}`,
      {
        method: 'PATCH',
        body: {
          data: {
            type: 'waf_active_rule',
            attributes: { status },
          },
        },
      }
    );
  }

  // ============================================
  // LOGGING
  // ============================================

  /**
   * Create HTTPS logging endpoint
   */
  async createHttpsLogging(serviceId, versionNumber, config) {
    return this.request(
      `/service/${serviceId}/version/${versionNumber}/logging/https`,
      {
        method: 'POST',
        body: {
          name: config.name,
          url: config.url,
          method: config.method || 'POST',
          content_type: config.contentType || 'application/json',
          json_format: config.jsonFormat || '2',
          format: config.format,
          header_name: config.headerName,
          header_value: config.headerValue,
          tls_hostname: config.tlsHostname,
          tls_ca_cert: config.tlsCaCert,
          message_type: config.messageType || 'blank',
        },
      }
    );
  }

  /**
   * Create Splunk logging
   */
  async createSplunkLogging(serviceId, versionNumber, config) {
    return this.request(
      `/service/${serviceId}/version/${versionNumber}/logging/splunk`,
      {
        method: 'POST',
        body: {
          name: config.name,
          url: config.url,
          token: config.token,
          format: config.format,
          tls_hostname: config.tlsHostname,
          tls_ca_cert: config.tlsCaCert,
        },
      }
    );
  }

  /**
   * Create S3 logging
   */
  async createS3Logging(serviceId, versionNumber, config) {
    return this.request(
      `/service/${serviceId}/version/${versionNumber}/logging/s3`,
      {
        method: 'POST',
        body: {
          name: config.name,
          bucket_name: config.bucketName,
          access_key: config.accessKey,
          secret_key: config.secretKey,
          path: config.path || '/',
          period: config.period || 3600,
          gzip_level: config.gzipLevel || 0,
          format: config.format,
          redundancy: config.redundancy || 'standard',
          domain: config.domain || 's3.amazonaws.com',
        },
      }
    );
  }

  /**
   * Create Datadog logging
   */
  async createDatadogLogging(serviceId, versionNumber, config) {
    return this.request(
      `/service/${serviceId}/version/${versionNumber}/logging/datadog`,
      {
        method: 'POST',
        body: {
          name: config.name,
          token: config.apiKey,
          region: config.region || 'US',
          format: config.format,
        },
      }
    );
  }

  // ============================================
  // REAL-TIME STATS
  // ============================================

  /**
   * Get real-time stats
   */
  async getRealtimeStats(serviceId) {
    return this.request(`/v1/channel/${serviceId}/ts/h`);
  }

  /**
   * Get historical stats
   */
  async getHistoricalStats(serviceId, options = {}) {
    const params = new URLSearchParams();
    params.set('from', options.from || Math.floor(Date.now() / 1000) - 3600);
    params.set('to', options.to || Math.floor(Date.now() / 1000));
    params.set('by', options.by || 'minute');
    
    return this.request(`/stats/service/${serviceId}?${params}`);
  }

  /**
   * Get usage stats
   */
  async getUsageStats(options = {}) {
    const params = new URLSearchParams();
    params.set('from', options.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    params.set('to', options.to || new Date().toISOString().split('T')[0]);
    
    return this.request(`/stats/usage?${params}`);
  }

  // ============================================
  // PURGING
  // ============================================

  /**
   * Purge by URL
   */
  async purgeUrl(url) {
    return this.request(url, {
      method: 'PURGE',
      headers: { 'Fastly-Soft-Purge': '1' },
    });
  }

  /**
   * Purge by surrogate key
   */
  async purgeBySurrogateKey(serviceId, key, soft = true) {
    return this.request(`/service/${serviceId}/purge/${key}`, {
      method: 'POST',
      headers: soft ? { 'Fastly-Soft-Purge': '1' } : {},
    });
  }

  /**
   * Purge all
   */
  async purgeAll(serviceId) {
    return this.request(`/service/${serviceId}/purge_all`, {
      method: 'POST',
    });
  }

  // ============================================
  // COMPUTE@EDGE
  // ============================================

  /**
   * Deploy Compute@Edge package
   */
  async deployComputePackage(serviceId, versionNumber, packageBuffer) {
    const formData = new FormData();
    formData.append('package', new Blob([packageBuffer]), 'package.tar.gz');

    return this.request(
      `/service/${serviceId}/version/${versionNumber}/package`,
      {
        method: 'PUT',
        body: formData,
        headers: {
          'Content-Type': undefined, // Let fetch set boundary
        },
      }
    );
  }

  /**
   * Get package info
   */
  async getComputePackage(serviceId, versionNumber) {
    return this.request(`/service/${serviceId}/version/${versionNumber}/package`);
  }

  // ============================================
  // HEALTH & MONITORING
  // ============================================

  /**
   * Check health
   */
  async checkHealth() {
    try {
      const user = await this.request('/current_user');
      
      return {
        isHealthy: true,
        message: 'Connected',
        user: user.login,
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
    this.log('info', 'Disconnected from Fastly');
  }
}

module.exports = {
  FastlyConnector,
  ServiceType,
  BackendType,
  WAFRuleStatus,
  WAFRuleType,
  EdgeAction,
  LoggingProvider,
};
