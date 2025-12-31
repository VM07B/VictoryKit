/**
 * Kong API Gateway Connector
 * 
 * Zero-trust API gateway management:
 * - Service and route management
 * - Plugin configuration (rate limiting, auth, security)
 * - Consumer/credential management
 * - Upstream/target management
 * - Health checks and monitoring
 */

const { BaseConnector, ConnectorState } = require('../base/BaseConnector');
const { CircuitBreaker, RetryStrategy } = require('../base/Resilience');

/**
 * Kong plugin types
 */
const PluginType = {
  // Authentication
  JWT: 'jwt',
  OAUTH2: 'oauth2',
  KEY_AUTH: 'key-auth',
  BASIC_AUTH: 'basic-auth',
  HMAC_AUTH: 'hmac-auth',
  LDAP_AUTH: 'ldap-auth',
  MTLS_AUTH: 'mtls-auth',
  
  // Security
  IP_RESTRICTION: 'ip-restriction',
  BOT_DETECTION: 'bot-detection',
  CORS: 'cors',
  ACL: 'acl',
  
  // Traffic Control
  RATE_LIMITING: 'rate-limiting',
  RATE_LIMITING_ADVANCED: 'rate-limiting-advanced',
  REQUEST_SIZE_LIMITING: 'request-size-limiting',
  REQUEST_TERMINATION: 'request-termination',
  PROXY_CACHE: 'proxy-cache',
  
  // Transformations
  REQUEST_TRANSFORMER: 'request-transformer',
  RESPONSE_TRANSFORMER: 'response-transformer',
  CORRELATION_ID: 'correlation-id',
  
  // Logging
  HTTP_LOG: 'http-log',
  FILE_LOG: 'file-log',
  SYSLOG: 'syslog',
  TCP_LOG: 'tcp-log',
  UDP_LOG: 'udp-log',
  DATADOG: 'datadog',
  PROMETHEUS: 'prometheus',
  
  // Serverless
  AWS_LAMBDA: 'aws-lambda',
  AZURE_FUNCTIONS: 'azure-functions',
  
  // AI/ML
  AI_RATE_LIMITING: 'ai-rate-limiting-advanced',
  AI_PROXY: 'ai-proxy',
};

/**
 * Protocol types
 */
const Protocol = {
  HTTP: 'http',
  HTTPS: 'https',
  GRPC: 'grpc',
  GRPCS: 'grpcs',
  TCP: 'tcp',
  TLS: 'tls',
  UDP: 'udp',
};

/**
 * Health check types
 */
const HealthCheckType = {
  ACTIVE: 'active',
  PASSIVE: 'passive',
};

/**
 * Kong Admin API Connector
 */
class KongConnector extends BaseConnector {
  constructor(config = {}) {
    super({ name: 'KongConnector', ...config });
    
    this.adminUrl = config.adminUrl || 'http://localhost:8001';
    this.apiKey = config.apiKey;
    this.workspace = config.workspace || 'default';
    
    // Resilience
    this.circuitBreaker = new CircuitBreaker({
      name: 'kong',
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
   * Connect to Kong Admin API
   */
  async connect() {
    this.setState(ConnectorState.CONNECTING);
    
    try {
      const info = await this.request('/');
      
      this.setState(ConnectorState.CONNECTED);
      this.log('info', 'Connected to Kong', { 
        version: info.version,
        node_id: info.node_id,
      });
      
      return info;
    } catch (error) {
      this.setState(ConnectorState.ERROR);
      this.log('error', 'Failed to connect to Kong', { error: error.message });
      throw error;
    }
  }

  /**
   * Make API request
   */
  async request(path, options = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const url = `${this.adminUrl}${path}`;
        const headers = {
          'Content-Type': 'application/json',
          ...options.headers,
        };
        
        if (this.apiKey) {
          headers['Kong-Admin-Token'] = this.apiKey;
        }

        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (!response.ok) {
          const errorBody = await response.text();
          const error = new Error(`Kong API error: ${response.status}`);
          error.status = response.status;
          error.body = errorBody;
          throw error;
        }

        // Handle 204 No Content
        if (response.status === 204) {
          return null;
        }

        return response.json();
      });
    });
  }

  // ============================================
  // SERVICES
  // ============================================

  /**
   * List all services
   */
  async listServices(options = {}) {
    const params = new URLSearchParams();
    if (options.size) params.set('size', options.size);
    if (options.offset) params.set('offset', options.offset);
    
    const query = params.toString();
    return this.request(`/services${query ? `?${query}` : ''}`);
  }

  /**
   * Create a service
   */
  async createService(service) {
    const result = await this.request('/services', {
      method: 'POST',
      body: JSON.stringify({
        name: service.name,
        url: service.url,
        host: service.host,
        port: service.port || 80,
        path: service.path,
        protocol: service.protocol || Protocol.HTTP,
        connect_timeout: service.connectTimeout || 60000,
        write_timeout: service.writeTimeout || 60000,
        read_timeout: service.readTimeout || 60000,
        retries: service.retries || 5,
        tags: service.tags,
        enabled: service.enabled ?? true,
      }),
    });

    this.emit('service:created', result);
    return result;
  }

  /**
   * Get service by name or ID
   */
  async getService(nameOrId) {
    return this.request(`/services/${nameOrId}`);
  }

  /**
   * Update service
   */
  async updateService(nameOrId, updates) {
    return this.request(`/services/${nameOrId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete service
   */
  async deleteService(nameOrId) {
    await this.request(`/services/${nameOrId}`, { method: 'DELETE' });
    this.emit('service:deleted', { id: nameOrId });
    return true;
  }

  // ============================================
  // ROUTES
  // ============================================

  /**
   * List routes for a service
   */
  async listRoutes(serviceNameOrId = null) {
    const path = serviceNameOrId 
      ? `/services/${serviceNameOrId}/routes`
      : '/routes';
    return this.request(path);
  }

  /**
   * Create a route
   */
  async createRoute(route) {
    const result = await this.request('/routes', {
      method: 'POST',
      body: JSON.stringify({
        name: route.name,
        service: route.service ? { id: route.service } : undefined,
        protocols: route.protocols || [Protocol.HTTP, Protocol.HTTPS],
        methods: route.methods,
        hosts: route.hosts,
        paths: route.paths,
        headers: route.headers,
        snis: route.snis,
        strip_path: route.stripPath ?? true,
        preserve_host: route.preserveHost ?? false,
        regex_priority: route.regexPriority || 0,
        tags: route.tags,
      }),
    });

    this.emit('route:created', result);
    return result;
  }

  /**
   * Get route
   */
  async getRoute(nameOrId) {
    return this.request(`/routes/${nameOrId}`);
  }

  /**
   * Update route
   */
  async updateRoute(nameOrId, updates) {
    return this.request(`/routes/${nameOrId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete route
   */
  async deleteRoute(nameOrId) {
    await this.request(`/routes/${nameOrId}`, { method: 'DELETE' });
    return true;
  }

  // ============================================
  // PLUGINS
  // ============================================

  /**
   * List plugins
   */
  async listPlugins(options = {}) {
    let path = '/plugins';
    if (options.serviceId) {
      path = `/services/${options.serviceId}/plugins`;
    } else if (options.routeId) {
      path = `/routes/${options.routeId}/plugins`;
    } else if (options.consumerId) {
      path = `/consumers/${options.consumerId}/plugins`;
    }
    
    return this.request(path);
  }

  /**
   * Add plugin
   */
  async addPlugin(plugin) {
    const result = await this.request('/plugins', {
      method: 'POST',
      body: JSON.stringify({
        name: plugin.name,
        config: plugin.config,
        service: plugin.service ? { id: plugin.service } : undefined,
        route: plugin.route ? { id: plugin.route } : undefined,
        consumer: plugin.consumer ? { id: plugin.consumer } : undefined,
        enabled: plugin.enabled ?? true,
        tags: plugin.tags,
      }),
    });

    this.emit('plugin:created', result);
    return result;
  }

  /**
   * Update plugin
   */
  async updatePlugin(pluginId, updates) {
    return this.request(`/plugins/${pluginId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete plugin
   */
  async deletePlugin(pluginId) {
    await this.request(`/plugins/${pluginId}`, { method: 'DELETE' });
    return true;
  }

  /**
   * Enable/disable plugin
   */
  async setPluginEnabled(pluginId, enabled) {
    return this.updatePlugin(pluginId, { enabled });
  }

  // ============================================
  // SECURITY PLUGINS (Presets)
  // ============================================

  /**
   * Add rate limiting
   */
  async addRateLimiting(target, config = {}) {
    return this.addPlugin({
      name: PluginType.RATE_LIMITING,
      service: target.serviceId,
      route: target.routeId,
      config: {
        second: config.second,
        minute: config.minute || 60,
        hour: config.hour,
        day: config.day,
        policy: config.policy || 'local', // 'local', 'cluster', 'redis'
        fault_tolerant: config.faultTolerant ?? true,
        hide_client_headers: config.hideHeaders ?? false,
        redis_host: config.redisHost,
        redis_port: config.redisPort || 6379,
        redis_password: config.redisPassword,
      },
    });
  }

  /**
   * Add JWT authentication
   */
  async addJwtAuth(target, config = {}) {
    return this.addPlugin({
      name: PluginType.JWT,
      service: target.serviceId,
      route: target.routeId,
      config: {
        uri_param_names: config.uriParamNames || ['jwt'],
        cookie_names: config.cookieNames || [],
        claims_to_verify: config.claimsToVerify || ['exp'],
        key_claim_name: config.keyClaimName || 'iss',
        secret_is_base64: config.secretIsBase64 ?? false,
        maximum_expiration: config.maxExpiration || 0,
        header_names: config.headerNames || ['authorization'],
      },
    });
  }

  /**
   * Add OAuth2 authentication
   */
  async addOAuth2(target, config = {}) {
    return this.addPlugin({
      name: PluginType.OAUTH2,
      service: target.serviceId,
      route: target.routeId,
      config: {
        enable_authorization_code: config.authCode ?? true,
        enable_client_credentials: config.clientCredentials ?? true,
        enable_implicit_grant: config.implicitGrant ?? false,
        enable_password_grant: config.passwordGrant ?? false,
        token_expiration: config.tokenExpiration || 7200,
        refresh_token_ttl: config.refreshTokenTtl || 1209600,
        scopes: config.scopes,
        mandatory_scope: config.mandatoryScope ?? false,
        accept_http_if_already_terminated: config.acceptHttp ?? false,
      },
    });
  }

  /**
   * Add IP restriction
   */
  async addIpRestriction(target, config = {}) {
    return this.addPlugin({
      name: PluginType.IP_RESTRICTION,
      service: target.serviceId,
      route: target.routeId,
      config: {
        allow: config.allow || [],
        deny: config.deny || [],
        status: config.status || 403,
        message: config.message || 'IP address not allowed',
      },
    });
  }

  /**
   * Add CORS
   */
  async addCors(target, config = {}) {
    return this.addPlugin({
      name: PluginType.CORS,
      service: target.serviceId,
      route: target.routeId,
      config: {
        origins: config.origins || ['*'],
        methods: config.methods || ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        headers: config.headers,
        exposed_headers: config.exposedHeaders,
        credentials: config.credentials ?? false,
        max_age: config.maxAge || 3600,
        preflight_continue: config.preflightContinue ?? false,
      },
    });
  }

  /**
   * Add request size limiting
   */
  async addRequestSizeLimiting(target, config = {}) {
    return this.addPlugin({
      name: PluginType.REQUEST_SIZE_LIMITING,
      service: target.serviceId,
      route: target.routeId,
      config: {
        allowed_payload_size: config.maxSize || 128, // MB
        size_unit: config.unit || 'megabytes',
        require_content_length: config.requireContentLength ?? false,
      },
    });
  }

  /**
   * Add bot detection
   */
  async addBotDetection(target, config = {}) {
    return this.addPlugin({
      name: PluginType.BOT_DETECTION,
      service: target.serviceId,
      route: target.routeId,
      config: {
        allow: config.allow || [],
        deny: config.deny || [],
      },
    });
  }

  /**
   * Add ACL (Access Control List)
   */
  async addAcl(target, config = {}) {
    return this.addPlugin({
      name: PluginType.ACL,
      service: target.serviceId,
      route: target.routeId,
      config: {
        allow: config.allow,
        deny: config.deny,
        hide_groups_header: config.hideGroupsHeader ?? true,
      },
    });
  }

  /**
   * Add HTTP logging
   */
  async addHttpLogging(target, config) {
    return this.addPlugin({
      name: PluginType.HTTP_LOG,
      service: target.serviceId,
      route: target.routeId,
      config: {
        http_endpoint: config.endpoint,
        method: config.method || 'POST',
        content_type: config.contentType || 'application/json',
        timeout: config.timeout || 10000,
        keepalive: config.keepalive || 60000,
        flush_timeout: config.flushTimeout || 2,
        retry_count: config.retryCount || 10,
        queue_size: config.queueSize || 1,
        headers: config.headers,
      },
    });
  }

  /**
   * Add Prometheus metrics
   */
  async addPrometheus(target = {}, config = {}) {
    return this.addPlugin({
      name: PluginType.PROMETHEUS,
      service: target.serviceId,
      route: target.routeId,
      config: {
        per_consumer: config.perConsumer ?? false,
        status_code_metrics: config.statusCodeMetrics ?? true,
        latency_metrics: config.latencyMetrics ?? true,
        bandwidth_metrics: config.bandwidthMetrics ?? true,
        upstream_health_metrics: config.upstreamHealthMetrics ?? true,
      },
    });
  }

  // ============================================
  // CONSUMERS
  // ============================================

  /**
   * List consumers
   */
  async listConsumers() {
    return this.request('/consumers');
  }

  /**
   * Create consumer
   */
  async createConsumer(consumer) {
    const result = await this.request('/consumers', {
      method: 'POST',
      body: JSON.stringify({
        username: consumer.username,
        custom_id: consumer.customId,
        tags: consumer.tags,
      }),
    });

    this.emit('consumer:created', result);
    return result;
  }

  /**
   * Get consumer
   */
  async getConsumer(usernameOrId) {
    return this.request(`/consumers/${usernameOrId}`);
  }

  /**
   * Delete consumer
   */
  async deleteConsumer(usernameOrId) {
    await this.request(`/consumers/${usernameOrId}`, { method: 'DELETE' });
    return true;
  }

  /**
   * Create API key for consumer
   */
  async createApiKey(consumerId, key = null) {
    return this.request(`/consumers/${consumerId}/key-auth`, {
      method: 'POST',
      body: JSON.stringify({ key }),
    });
  }

  /**
   * Create JWT credential for consumer
   */
  async createJwtCredential(consumerId, config = {}) {
    return this.request(`/consumers/${consumerId}/jwt`, {
      method: 'POST',
      body: JSON.stringify({
        key: config.key,
        secret: config.secret,
        algorithm: config.algorithm || 'HS256',
        rsa_public_key: config.rsaPublicKey,
      }),
    });
  }

  /**
   * Add consumer to ACL group
   */
  async addConsumerToGroup(consumerId, group) {
    return this.request(`/consumers/${consumerId}/acls`, {
      method: 'POST',
      body: JSON.stringify({ group }),
    });
  }

  // ============================================
  // UPSTREAMS & TARGETS
  // ============================================

  /**
   * List upstreams
   */
  async listUpstreams() {
    return this.request('/upstreams');
  }

  /**
   * Create upstream
   */
  async createUpstream(upstream) {
    const result = await this.request('/upstreams', {
      method: 'POST',
      body: JSON.stringify({
        name: upstream.name,
        algorithm: upstream.algorithm || 'round-robin', // 'consistent-hashing', 'least-connections', 'latency'
        hash_on: upstream.hashOn || 'none',
        hash_fallback: upstream.hashFallback || 'none',
        hash_on_header: upstream.hashOnHeader,
        slots: upstream.slots || 10000,
        healthchecks: upstream.healthchecks || {
          active: {
            type: 'http',
            http_path: '/health',
            timeout: 1,
            concurrency: 10,
            healthy: { interval: 5, successes: 2 },
            unhealthy: { interval: 5, http_failures: 2, tcp_failures: 2, timeouts: 3 },
          },
          passive: {
            healthy: { successes: 5 },
            unhealthy: { http_failures: 5, tcp_failures: 5, timeouts: 5 },
          },
        },
        tags: upstream.tags,
      }),
    });

    this.emit('upstream:created', result);
    return result;
  }

  /**
   * Get upstream
   */
  async getUpstream(nameOrId) {
    return this.request(`/upstreams/${nameOrId}`);
  }

  /**
   * Get upstream health
   */
  async getUpstreamHealth(nameOrId) {
    return this.request(`/upstreams/${nameOrId}/health`);
  }

  /**
   * List targets for upstream
   */
  async listTargets(upstreamNameOrId) {
    return this.request(`/upstreams/${upstreamNameOrId}/targets`);
  }

  /**
   * Add target to upstream
   */
  async addTarget(upstreamNameOrId, target) {
    return this.request(`/upstreams/${upstreamNameOrId}/targets`, {
      method: 'POST',
      body: JSON.stringify({
        target: target.target, // host:port
        weight: target.weight || 100,
        tags: target.tags,
      }),
    });
  }

  /**
   * Set target health
   */
  async setTargetHealth(upstreamNameOrId, targetHost, healthy) {
    const endpoint = healthy ? 'healthy' : 'unhealthy';
    return this.request(
      `/upstreams/${upstreamNameOrId}/targets/${targetHost}/${endpoint}`,
      { method: 'PUT' }
    );
  }

  /**
   * Delete target
   */
  async deleteTarget(upstreamNameOrId, targetId) {
    await this.request(`/upstreams/${upstreamNameOrId}/targets/${targetId}`, {
      method: 'DELETE',
    });
    return true;
  }

  // ============================================
  // CERTIFICATES
  // ============================================

  /**
   * List certificates
   */
  async listCertificates() {
    return this.request('/certificates');
  }

  /**
   * Add certificate
   */
  async addCertificate(cert, key, snis = []) {
    return this.request('/certificates', {
      method: 'POST',
      body: JSON.stringify({
        cert,
        key,
        snis,
      }),
    });
  }

  // ============================================
  // STATUS & MONITORING
  // ============================================

  /**
   * Get Kong status
   */
  async getStatus() {
    return this.request('/status');
  }

  /**
   * Get cluster status
   */
  async getClusterStatus() {
    return this.request('/clustering/status');
  }

  /**
   * Get all enabled plugins
   */
  async getEnabledPlugins() {
    const info = await this.request('/');
    return info.plugins?.enabled_in_cluster || [];
  }

  /**
   * Check health
   */
  async checkHealth() {
    try {
      const status = await this.getStatus();
      
      return {
        isHealthy: true,
        message: 'Connected',
        database: status.database?.reachable,
        server: status.server,
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
    this.log('info', 'Disconnected from Kong');
  }
}

module.exports = {
  KongConnector,
  PluginType,
  Protocol,
  HealthCheckType,
};
