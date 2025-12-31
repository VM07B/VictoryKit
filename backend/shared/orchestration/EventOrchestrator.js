/**
 * Event Orchestrator
 * 
 * Central nervous system for VictoryKit event processing:
 * - Event routing and fan-out
 * - Event correlation and enrichment
 * - Dead letter queue handling
 * - Event replay and audit
 * - Real-time streaming
 */

const { EventEmitter } = require('events');
const { SchemaRegistry, EventFactory, EventType } = require('../connectors/base/SchemaRegistry');

/**
 * Event priority levels
 */
const EventPriority = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
  INFO: 4,
};

/**
 * Routing strategies
 */
const RoutingStrategy = {
  BROADCAST: 'broadcast',     // Send to all subscribers
  ROUND_ROBIN: 'round-robin', // Load balance across subscribers
  PRIORITY: 'priority',       // Route by event priority
  CONTENT: 'content',         // Route by event content
  STICKY: 'sticky',           // Same source always goes to same subscriber
};

/**
 * Event states
 */
const EventState = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  DEAD_LETTERED: 'dead_lettered',
  REPLAYED: 'replayed',
};

/**
 * Event Router
 */
class EventRouter {
  constructor() {
    this.routes = new Map();
    this.defaultRoute = null;
  }

  /**
   * Add route
   */
  addRoute(pattern, handler, options = {}) {
    const route = {
      pattern: typeof pattern === 'string' ? new RegExp(pattern) : pattern,
      handler,
      priority: options.priority || 0,
      filter: options.filter,
      transform: options.transform,
      enabled: true,
    };

    const key = pattern.toString();
    this.routes.set(key, route);
    return key;
  }

  /**
   * Remove route
   */
  removeRoute(key) {
    return this.routes.delete(key);
  }

  /**
   * Set default route
   */
  setDefaultRoute(handler) {
    this.defaultRoute = handler;
  }

  /**
   * Find matching routes
   */
  findRoutes(eventType) {
    const matches = [];
    
    for (const [key, route] of this.routes) {
      if (route.enabled && route.pattern.test(eventType)) {
        matches.push(route);
      }
    }

    // Sort by priority (lower is higher priority)
    matches.sort((a, b) => a.priority - b.priority);
    
    return matches;
  }

  /**
   * Route event
   */
  async route(event) {
    const routes = this.findRoutes(event.type);
    
    if (routes.length === 0 && this.defaultRoute) {
      return [await this.defaultRoute(event)];
    }

    const results = [];
    for (const route of routes) {
      // Apply filter
      if (route.filter && !route.filter(event)) {
        continue;
      }

      // Apply transform
      let processedEvent = event;
      if (route.transform) {
        processedEvent = route.transform(event);
      }

      results.push(await route.handler(processedEvent));
    }

    return results;
  }
}

/**
 * Correlation Engine
 */
class CorrelationEngine {
  constructor(options = {}) {
    this.correlations = new Map();
    this.timeWindow = options.timeWindow || 300000; // 5 minutes
    this.maxEvents = options.maxEvents || 1000;
  }

  /**
   * Add event to correlation
   */
  addEvent(event) {
    const keys = this.extractCorrelationKeys(event);
    
    for (const key of keys) {
      if (!this.correlations.has(key)) {
        this.correlations.set(key, {
          events: [],
          firstSeen: Date.now(),
          lastSeen: Date.now(),
        });
      }

      const correlation = this.correlations.get(key);
      correlation.events.push(event);
      correlation.lastSeen = Date.now();

      // Trim old events
      if (correlation.events.length > this.maxEvents) {
        correlation.events = correlation.events.slice(-this.maxEvents);
      }
    }

    this.cleanup();
    return keys;
  }

  /**
   * Extract correlation keys from event
   */
  extractCorrelationKeys(event) {
    const keys = [];
    const data = event.data || {};

    // Correlation by source IP
    if (data.sourceIp) {
      keys.push(`ip:${data.sourceIp}`);
    }

    // Correlation by destination IP
    if (data.destinationIp) {
      keys.push(`ip:${data.destinationIp}`);
    }

    // Correlation by user
    if (data.userId || data.user) {
      keys.push(`user:${data.userId || data.user}`);
    }

    // Correlation by host
    if (data.hostname || data.host) {
      keys.push(`host:${data.hostname || data.host}`);
    }

    // Correlation by indicator
    if (data.indicator || data.ioc) {
      keys.push(`ioc:${data.indicator || data.ioc}`);
    }

    // Correlation by threat ID
    if (data.threatId) {
      keys.push(`threat:${data.threatId}`);
    }

    // Correlation by alert ID
    if (data.alertId) {
      keys.push(`alert:${data.alertId}`);
    }

    // Correlation by incident ID
    if (data.incidentId) {
      keys.push(`incident:${data.incidentId}`);
    }

    // Correlation by MITRE technique
    if (data.mitreId || data.technique) {
      keys.push(`mitre:${data.mitreId || data.technique}`);
    }

    return keys;
  }

  /**
   * Get correlated events
   */
  getCorrelated(key) {
    return this.correlations.get(key)?.events || [];
  }

  /**
   * Find correlations for event
   */
  findCorrelations(event) {
    const keys = this.extractCorrelationKeys(event);
    const correlations = {};

    for (const key of keys) {
      const events = this.getCorrelated(key);
      if (events.length > 1) {
        correlations[key] = events;
      }
    }

    return correlations;
  }

  /**
   * Cleanup old correlations
   */
  cleanup() {
    const now = Date.now();
    
    for (const [key, correlation] of this.correlations) {
      if (now - correlation.lastSeen > this.timeWindow) {
        this.correlations.delete(key);
      }
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      activeCorrelations: this.correlations.size,
      timeWindow: this.timeWindow,
      maxEvents: this.maxEvents,
    };
  }
}

/**
 * Enrichment Pipeline
 */
class EnrichmentPipeline {
  constructor() {
    this.enrichers = [];
  }

  /**
   * Add enricher
   */
  addEnricher(name, enricher, options = {}) {
    this.enrichers.push({
      name,
      enricher,
      priority: options.priority || 100,
      timeout: options.timeout || 5000,
      optional: options.optional ?? true,
    });

    // Sort by priority
    this.enrichers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Remove enricher
   */
  removeEnricher(name) {
    const index = this.enrichers.findIndex(e => e.name === name);
    if (index !== -1) {
      this.enrichers.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Enrich event
   */
  async enrich(event) {
    const enrichedEvent = { ...event };
    enrichedEvent.enrichments = enrichedEvent.enrichments || {};

    for (const { name, enricher, timeout, optional } of this.enrichers) {
      try {
        const result = await Promise.race([
          enricher(enrichedEvent),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Enrichment timeout')), timeout)
          ),
        ]);

        if (result) {
          enrichedEvent.enrichments[name] = result;
        }
      } catch (error) {
        if (!optional) {
          throw error;
        }
        enrichedEvent.enrichments[name] = { error: error.message };
      }
    }

    enrichedEvent.enrichedAt = new Date().toISOString();
    return enrichedEvent;
  }
}

/**
 * Dead Letter Queue
 */
class DeadLetterQueue {
  constructor(options = {}) {
    this.queue = [];
    this.maxSize = options.maxSize || 10000;
    this.retryLimit = options.retryLimit || 3;
  }

  /**
   * Add to DLQ
   */
  add(event, error, metadata = {}) {
    const entry = {
      id: `dlq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event,
      error: error.message || error,
      stack: error.stack,
      metadata,
      attempts: (event._attempts || 0) + 1,
      addedAt: new Date().toISOString(),
      lastAttempt: new Date().toISOString(),
    };

    this.queue.push(entry);

    // Trim if over size
    if (this.queue.length > this.maxSize) {
      this.queue = this.queue.slice(-this.maxSize);
    }

    return entry;
  }

  /**
   * Get DLQ entries
   */
  getEntries(options = {}) {
    let entries = [...this.queue];

    if (options.limit) {
      entries = entries.slice(0, options.limit);
    }

    if (options.filter) {
      entries = entries.filter(options.filter);
    }

    return entries;
  }

  /**
   * Get retryable entries
   */
  getRetryable() {
    return this.queue.filter(entry => entry.attempts < this.retryLimit);
  }

  /**
   * Remove entry
   */
  remove(id) {
    const index = this.queue.findIndex(e => e.id === id);
    if (index !== -1) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Clear DLQ
   */
  clear() {
    const count = this.queue.length;
    this.queue = [];
    return count;
  }

  /**
   * Get stats
   */
  getStats() {
    const byError = {};
    for (const entry of this.queue) {
      byError[entry.error] = (byError[entry.error] || 0) + 1;
    }

    return {
      total: this.queue.length,
      retryable: this.getRetryable().length,
      byError,
    };
  }
}

/**
 * Event Orchestrator
 */
class EventOrchestrator extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = config;
    this.router = new EventRouter();
    this.correlation = new CorrelationEngine(config.correlation);
    this.enrichment = new EnrichmentPipeline();
    this.dlq = new DeadLetterQueue(config.dlq);
    this.schemaRegistry = new SchemaRegistry();
    
    // Metrics
    this.metrics = {
      eventsReceived: 0,
      eventsProcessed: 0,
      eventsFailed: 0,
      eventsEnriched: 0,
      eventsCorrelated: 0,
      eventsRouted: 0,
    };

    // Event buffer for batching
    this.buffer = [];
    this.bufferSize = config.bufferSize || 100;
    this.flushInterval = config.flushInterval || 1000;
    this.flushTimer = null;

    // Subscribers by topic
    this.subscribers = new Map();

    // Event history for replay
    this.history = [];
    this.historySize = config.historySize || 10000;

    // Processing state
    this.processing = false;
  }

  /**
   * Start the orchestrator
   */
  start() {
    this.processing = true;
    this.flushTimer = setInterval(() => this.flush(), this.flushInterval);
    this.emit('started');
  }

  /**
   * Stop the orchestrator
   */
  stop() {
    this.processing = false;
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.emit('stopped');
  }

  /**
   * Ingest event
   */
  async ingest(event) {
    this.metrics.eventsReceived++;

    // Validate event
    if (!this.validateEvent(event)) {
      this.emit('validation:failed', event);
      return null;
    }

    // Add metadata
    const enrichedEvent = {
      ...event,
      _id: event._id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      _receivedAt: new Date().toISOString(),
      _state: EventState.PENDING,
    };

    // Add to buffer
    this.buffer.push(enrichedEvent);

    // Auto-flush if buffer is full
    if (this.buffer.length >= this.bufferSize) {
      await this.flush();
    }

    return enrichedEvent._id;
  }

  /**
   * Ingest batch of events
   */
  async ingestBatch(events) {
    const ids = [];
    for (const event of events) {
      const id = await this.ingest(event);
      if (id) ids.push(id);
    }
    return ids;
  }

  /**
   * Validate event
   */
  validateEvent(event) {
    if (!event || typeof event !== 'object') {
      return false;
    }

    if (!event.type) {
      return false;
    }

    // Validate against schema if available
    try {
      this.schemaRegistry.validate(event.type, event);
      return true;
    } catch (error) {
      // Log validation error but allow event if no schema exists
      return !this.schemaRegistry.hasSchema(event.type);
    }
  }

  /**
   * Flush buffer
   */
  async flush() {
    if (this.buffer.length === 0) return;

    const batch = this.buffer.splice(0, this.buffer.length);
    
    for (const event of batch) {
      await this.process(event);
    }

    this.emit('flushed', { count: batch.length });
  }

  /**
   * Process single event
   */
  async process(event) {
    event._state = EventState.PROCESSING;
    event._processedAt = new Date().toISOString();

    try {
      // Enrich
      const enriched = await this.enrichment.enrich(event);
      this.metrics.eventsEnriched++;

      // Correlate
      const correlationKeys = this.correlation.addEvent(enriched);
      if (correlationKeys.length > 0) {
        enriched._correlationKeys = correlationKeys;
        this.metrics.eventsCorrelated++;
      }

      // Find correlations
      const correlations = this.correlation.findCorrelations(enriched);
      if (Object.keys(correlations).length > 0) {
        enriched._correlations = correlations;
        this.emit('correlation:found', { event: enriched, correlations });
      }

      // Route
      await this.router.route(enriched);
      this.metrics.eventsRouted++;

      // Notify subscribers
      await this.notifySubscribers(enriched);

      // Add to history
      this.addToHistory(enriched);

      enriched._state = EventState.COMPLETED;
      this.metrics.eventsProcessed++;

      this.emit('processed', enriched);
      return enriched;

    } catch (error) {
      event._state = EventState.FAILED;
      event._error = error.message;
      this.metrics.eventsFailed++;

      // Add to DLQ
      this.dlq.add(event, error);
      event._state = EventState.DEAD_LETTERED;

      this.emit('failed', { event, error });
      return null;
    }
  }

  /**
   * Add route
   */
  addRoute(pattern, handler, options = {}) {
    return this.router.addRoute(pattern, handler, options);
  }

  /**
   * Remove route
   */
  removeRoute(key) {
    return this.router.removeRoute(key);
  }

  /**
   * Add enricher
   */
  addEnricher(name, enricher, options = {}) {
    this.enrichment.addEnricher(name, enricher, options);
  }

  /**
   * Subscribe to topic
   */
  subscribe(topic, handler, options = {}) {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }

    const subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      handler,
      filter: options.filter,
      priority: options.priority || 0,
    };

    this.subscribers.get(topic).push(subscription);
    
    // Sort by priority
    this.subscribers.get(topic).sort((a, b) => a.priority - b.priority);

    return subscription.id;
  }

  /**
   * Unsubscribe
   */
  unsubscribe(topic, subscriptionId) {
    if (!this.subscribers.has(topic)) return false;

    const subs = this.subscribers.get(topic);
    const index = subs.findIndex(s => s.id === subscriptionId);
    
    if (index !== -1) {
      subs.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Notify subscribers
   */
  async notifySubscribers(event) {
    const topic = event.type;
    const wildcardTopic = topic.split('.')[0] + '.*';

    const subscribers = [
      ...(this.subscribers.get(topic) || []),
      ...(this.subscribers.get(wildcardTopic) || []),
      ...(this.subscribers.get('*') || []),
    ];

    for (const sub of subscribers) {
      if (sub.filter && !sub.filter(event)) continue;

      try {
        await sub.handler(event);
      } catch (error) {
        this.emit('subscriber:error', { subscription: sub.id, error });
      }
    }
  }

  /**
   * Add to history
   */
  addToHistory(event) {
    this.history.push({
      id: event._id,
      type: event.type,
      timestamp: event.timestamp || event._receivedAt,
      summary: this.summarizeEvent(event),
    });

    // Trim history
    if (this.history.length > this.historySize) {
      this.history = this.history.slice(-this.historySize);
    }
  }

  /**
   * Summarize event for history
   */
  summarizeEvent(event) {
    const data = event.data || {};
    return {
      source: event.source,
      severity: data.severity || event.severity,
      ip: data.sourceIp || data.ip,
      user: data.userId || data.user,
      host: data.hostname || data.host,
    };
  }

  /**
   * Get history
   */
  getHistory(options = {}) {
    let history = [...this.history];

    if (options.type) {
      history = history.filter(e => e.type === options.type);
    }

    if (options.since) {
      history = history.filter(e => new Date(e.timestamp) >= new Date(options.since));
    }

    if (options.limit) {
      history = history.slice(-options.limit);
    }

    return history;
  }

  /**
   * Replay events from history
   */
  async replay(options = {}) {
    const events = this.getHistory(options);
    const replayed = [];

    for (const entry of events) {
      // Fetch full event (would need event store in production)
      const event = {
        ...entry,
        _replayed: true,
        _replayedAt: new Date().toISOString(),
        _state: EventState.REPLAYED,
      };

      await this.process(event);
      replayed.push(entry.id);
    }

    this.emit('replayed', { count: replayed.length });
    return replayed;
  }

  /**
   * Retry DLQ entries
   */
  async retryDlq(options = {}) {
    const entries = options.all 
      ? this.dlq.getRetryable()
      : this.dlq.getEntries({ limit: options.limit || 10 });

    const retried = [];
    
    for (const entry of entries) {
      entry.event._attempts = entry.attempts;
      const result = await this.process(entry.event);
      
      if (result) {
        this.dlq.remove(entry.id);
        retried.push(entry.id);
      }
    }

    this.emit('dlq:retried', { count: retried.length });
    return retried;
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      bufferSize: this.buffer.length,
      subscribers: this.subscribers.size,
      correlations: this.correlation.getStats(),
      dlq: this.dlq.getStats(),
      historySize: this.history.length,
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      eventsReceived: 0,
      eventsProcessed: 0,
      eventsFailed: 0,
      eventsEnriched: 0,
      eventsCorrelated: 0,
      eventsRouted: 0,
    };
  }

  /**
   * Create standard VictoryKit event
   */
  createEvent(type, data, options = {}) {
    return EventFactory.create(type, {
      ...data,
      source: options.source || 'victorykit',
      version: options.version || '1.0.0',
    });
  }
}

/**
 * Pre-configured enrichers for VictoryKit
 */
const StandardEnrichers = {
  /**
   * GeoIP enrichment
   */
  geoip: (geoipService) => async (event) => {
    const ip = event.data?.sourceIp || event.data?.ip;
    if (!ip) return null;
    
    return geoipService.lookup(ip);
  },

  /**
   * Threat intelligence enrichment
   */
  threatIntel: (openCtiConnector) => async (event) => {
    const indicators = [];
    const data = event.data || {};

    if (data.sourceIp) indicators.push({ type: 'ipv4-addr', value: data.sourceIp });
    if (data.destinationIp) indicators.push({ type: 'ipv4-addr', value: data.destinationIp });
    if (data.domain) indicators.push({ type: 'domain-name', value: data.domain });
    if (data.hash) indicators.push({ type: 'file', hashes: { SHA256: data.hash } });
    if (data.url) indicators.push({ type: 'url', value: data.url });

    if (indicators.length === 0) return null;

    const results = {};
    for (const indicator of indicators) {
      const enriched = await openCtiConnector.enrichIndicator(indicator);
      if (enriched) {
        results[indicator.value] = enriched;
      }
    }

    return Object.keys(results).length > 0 ? results : null;
  },

  /**
   * User context enrichment
   */
  userContext: (keycloakConnector) => async (event) => {
    const userId = event.data?.userId || event.data?.user;
    if (!userId) return null;

    const user = await keycloakConnector.getUser(userId);
    if (!user) return null;

    return {
      username: user.username,
      email: user.email,
      groups: user.groups,
      roles: user.roles,
      riskScore: user.riskScore,
    };
  },

  /**
   * Asset context enrichment
   */
  assetContext: (assetService) => async (event) => {
    const hostname = event.data?.hostname || event.data?.host;
    const ip = event.data?.sourceIp || event.data?.ip;
    
    if (!hostname && !ip) return null;

    return assetService.getAsset(hostname || ip);
  },

  /**
   * MITRE ATT&CK mapping
   */
  mitreMapping: (mitreService) => async (event) => {
    const technique = event.data?.technique || event.data?.mitreId;
    if (!technique) return null;

    return mitreService.getTechnique(technique);
  },
};

module.exports = {
  EventOrchestrator,
  EventRouter,
  CorrelationEngine,
  EnrichmentPipeline,
  DeadLetterQueue,
  EventPriority,
  RoutingStrategy,
  EventState,
  StandardEnrichers,
};
