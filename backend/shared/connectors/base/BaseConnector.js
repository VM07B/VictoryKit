/**
 * Base Connector & Registry
 * 
 * Abstract base class for all VictoryKit connectors with:
 * - Health checking
 * - Metrics collection
 * - Event emission
 * - Lifecycle management
 */

const EventEmitter = require('events');
const crypto = require('crypto');

/**
 * Connector states
 */
const ConnectorState = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
};

/**
 * Abstract base class for all connectors
 */
class BaseConnector extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.id = crypto.randomUUID();
    this.name = config.name || this.constructor.name;
    this.config = config;
    this.state = ConnectorState.DISCONNECTED;
    this.metrics = {
      requestsTotal: 0,
      requestsSuccess: 0,
      requestsFailed: 0,
      lastRequestTime: null,
      avgLatencyMs: 0,
      totalLatencyMs: 0,
    };
    this.healthCheck = {
      lastCheck: null,
      isHealthy: false,
      message: 'Not checked',
    };
    this.retryCount = 0;
    this.maxRetries = config.maxRetries || 5;
    this.retryDelayMs = config.retryDelayMs || 1000;
  }

  /**
   * Connect to the external service
   * Must be implemented by subclasses
   */
  async connect() {
    throw new Error('connect() must be implemented by subclass');
  }

  /**
   * Disconnect from the external service
   * Must be implemented by subclasses
   */
  async disconnect() {
    throw new Error('disconnect() must be implemented by subclass');
  }

  /**
   * Check health of the connection
   * Should be implemented by subclasses
   */
  async checkHealth() {
    return {
      isHealthy: this.state === ConnectorState.CONNECTED,
      message: this.state,
      lastCheck: new Date().toISOString(),
    };
  }

  /**
   * Execute a request with metrics tracking
   */
  async executeWithMetrics(operation, fn) {
    const startTime = Date.now();
    this.metrics.requestsTotal++;
    
    try {
      const result = await fn();
      this.metrics.requestsSuccess++;
      
      const latency = Date.now() - startTime;
      this.metrics.totalLatencyMs += latency;
      this.metrics.avgLatencyMs = this.metrics.totalLatencyMs / this.metrics.requestsSuccess;
      this.metrics.lastRequestTime = new Date().toISOString();
      
      this.emit('request:success', { operation, latency, result });
      return result;
    } catch (error) {
      this.metrics.requestsFailed++;
      this.emit('request:error', { operation, error, latency: Date.now() - startTime });
      throw error;
    }
  }

  /**
   * Execute with automatic retry
   */
  async executeWithRetry(operation, fn, options = {}) {
    const maxRetries = options.maxRetries || this.maxRetries;
    const retryDelay = options.retryDelayMs || this.retryDelayMs;
    const exponentialBackoff = options.exponentialBackoff ?? true;
    
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeWithMetrics(operation, fn);
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          const delay = exponentialBackoff 
            ? retryDelay * Math.pow(2, attempt) 
            : retryDelay;
          
          this.emit('retry', { operation, attempt: attempt + 1, delay, error });
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Change connector state
   */
  setState(newState) {
    const oldState = this.state;
    this.state = newState;
    this.emit('stateChange', { from: oldState, to: newState });
  }

  /**
   * Get connector status
   */
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      state: this.state,
      metrics: { ...this.metrics },
      healthCheck: { ...this.healthCheck },
    };
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log helper (uses console, override for custom logger)
   */
  log(level, message, meta = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      connector: this.name,
      level,
      message,
      ...meta,
    };
    
    if (this.config.logger) {
      this.config.logger[level](logEntry);
    } else {
      console[level === 'error' ? 'error' : 'log'](JSON.stringify(logEntry));
    }
  }
}

/**
 * Connector Registry for managing all connectors
 */
class ConnectorRegistry extends EventEmitter {
  constructor() {
    super();
    this.connectors = new Map();
    this.healthCheckInterval = null;
  }

  /**
   * Register a connector
   */
  register(name, connector) {
    if (this.connectors.has(name)) {
      throw new Error(`Connector '${name}' is already registered`);
    }
    
    this.connectors.set(name, connector);
    this.emit('registered', { name, connector });
    
    // Forward connector events
    connector.on('stateChange', (data) => {
      this.emit('connector:stateChange', { name, ...data });
    });
    
    connector.on('request:error', (data) => {
      this.emit('connector:error', { name, ...data });
    });
  }

  /**
   * Get a connector by name
   */
  get(name) {
    const connector = this.connectors.get(name);
    if (!connector) {
      throw new Error(`Connector '${name}' not found`);
    }
    return connector;
  }

  /**
   * Check if a connector exists
   */
  has(name) {
    return this.connectors.has(name);
  }

  /**
   * Unregister a connector
   */
  unregister(name) {
    const connector = this.connectors.get(name);
    if (connector) {
      this.connectors.delete(name);
      this.emit('unregistered', { name });
    }
  }

  /**
   * Get all connectors
   */
  getAll() {
    return Array.from(this.connectors.entries()).map(([name, connector]) => ({
      name,
      ...connector.getStatus(),
    }));
  }

  /**
   * Get status of all connectors
   */
  getStatus() {
    const statuses = {};
    for (const [name, connector] of this.connectors) {
      statuses[name] = connector.getStatus();
    }
    return statuses;
  }

  /**
   * Check health of all connectors
   */
  async checkAllHealth() {
    const results = {};
    
    for (const [name, connector] of this.connectors) {
      try {
        results[name] = await connector.checkHealth();
      } catch (error) {
        results[name] = {
          isHealthy: false,
          message: error.message,
          lastCheck: new Date().toISOString(),
        };
      }
    }
    
    return results;
  }

  /**
   * Start periodic health checks
   */
  startHealthChecks(intervalMs = 30000) {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.healthCheckInterval = setInterval(async () => {
      const health = await this.checkAllHealth();
      this.emit('healthCheck', health);
    }, intervalMs);
  }

  /**
   * Stop health checks
   */
  stopHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Disconnect all connectors
   */
  async disconnectAll() {
    this.stopHealthChecks();
    
    const disconnectPromises = [];
    
    for (const [name, connector] of this.connectors) {
      disconnectPromises.push(
        connector.disconnect().catch(err => {
          this.emit('error', { name, error: err });
        })
      );
    }
    
    await Promise.allSettled(disconnectPromises);
    this.connectors.clear();
  }
}

module.exports = {
  BaseConnector,
  ConnectorRegistry,
  ConnectorState,
};
