/**
 * Redpanda/Kafka Connector
 * 
 * High-performance message bus for VictoryKit with:
 * - Schema Registry integration
 * - Multi-topic support for all 50 tools
 * - Producer/Consumer patterns
 * - Dead Letter Queue handling
 * - Exactly-once semantics
 */

const { Kafka, logLevel, CompressionTypes, Partitioners } = require('kafkajs');
const { BaseConnector, ConnectorState } = require('../base/BaseConnector');
const { schemaRegistry, EventType } = require('../base/SchemaRegistry');
const { CircuitBreaker, RetryStrategy } = require('../base/Resilience');

/**
 * Topic definitions for VictoryKit
 */
const Topics = {
  // Core event topics
  SECURITY_ALERTS: 'victorykit.security.alerts',
  SECURITY_INCIDENTS: 'victorykit.security.incidents',
  SECURITY_FINDINGS: 'victorykit.security.findings',
  
  // Threat Intelligence
  THREAT_IOC: 'victorykit.threat.ioc',
  THREAT_ENRICHMENT: 'victorykit.threat.enrichment',
  
  // Network events
  NETWORK_FLOWS: 'victorykit.network.flows',
  NETWORK_DNS: 'victorykit.network.dns',
  NETWORK_ALERTS: 'victorykit.network.alerts',
  
  // Endpoint events
  ENDPOINT_THREATS: 'victorykit.endpoint.threats',
  ENDPOINT_TELEMETRY: 'victorykit.endpoint.telemetry',
  
  // Identity events
  IDENTITY_AUTH: 'victorykit.identity.auth',
  IDENTITY_RISK: 'victorykit.identity.risk',
  
  // API events
  API_REQUESTS: 'victorykit.api.requests',
  API_ANOMALIES: 'victorykit.api.anomalies',
  
  // WAF events
  WAF_EVENTS: 'victorykit.waf.events',
  
  // Scan results by tool
  SCAN_FRAUDGUARD: 'victorykit.scan.fraudguard',
  SCAN_INTELLISCOUT: 'victorykit.scan.intelliscout',
  SCAN_THREATRADAR: 'victorykit.scan.threatradar',
  SCAN_MALWAREHUNTER: 'victorykit.scan.malwarehunter',
  SCAN_PHISHGUARD: 'victorykit.scan.phishguard',
  SCAN_VULNSCAN: 'victorykit.scan.vulnscan',
  SCAN_PENTESTAI: 'victorykit.scan.pentestai',
  SCAN_SECURECODE: 'victorykit.scan.securecode',
  SCAN_COMPLIANCECHECK: 'victorykit.scan.compliancecheck',
  SCAN_DATAGUARDIAN: 'victorykit.scan.dataguardian',
  
  // Compliance
  COMPLIANCE_EVENTS: 'victorykit.compliance.events',
  COMPLIANCE_EVIDENCE: 'victorykit.compliance.evidence',
  
  // SOAR
  SOAR_PLAYBOOKS: 'victorykit.soar.playbooks',
  SOAR_ACTIONS: 'victorykit.soar.actions',
  SOAR_RESULTS: 'victorykit.soar.results',
  
  // Dead Letter Queues
  DLQ_SECURITY: 'victorykit.dlq.security',
  DLQ_NETWORK: 'victorykit.dlq.network',
  DLQ_SCANS: 'victorykit.dlq.scans',
};

/**
 * Consumer Group IDs
 */
const ConsumerGroups = {
  SIEM_INGESTION: 'victorykit-siem-ingestion',
  SOAR_ORCHESTRATION: 'victorykit-soar-orchestration',
  THREAT_ENRICHMENT: 'victorykit-threat-enrichment',
  ALERTING: 'victorykit-alerting',
  COMPLIANCE: 'victorykit-compliance',
  ANALYTICS: 'victorykit-analytics',
};

/**
 * Redpanda/Kafka Connector
 */
class RedpandaConnector extends BaseConnector {
  constructor(config = {}) {
    super({ name: 'RedpandaConnector', ...config });
    
    this.brokers = config.brokers || ['localhost:9092'];
    this.clientId = config.clientId || 'victorykit';
    this.ssl = config.ssl || false;
    this.sasl = config.sasl || null;
    
    this.kafka = null;
    this.admin = null;
    this.producers = new Map();
    this.consumers = new Map();
    
    // Circuit breaker for publish operations
    this.circuitBreaker = new CircuitBreaker({
      name: 'redpanda-publish',
      failureThreshold: 5,
      timeout: 30000,
    });
    
    // Retry strategy for transient failures
    this.retryStrategy = new RetryStrategy({
      maxRetries: 3,
      type: 'exponential-jitter',
      baseDelay: 100,
    });
  }

  /**
   * Connect to Redpanda cluster
   */
  async connect() {
    this.setState(ConnectorState.CONNECTING);
    
    try {
      // Initialize Kafka client
      this.kafka = new Kafka({
        clientId: this.clientId,
        brokers: this.brokers,
        ssl: this.ssl,
        sasl: this.sasl,
        logLevel: logLevel.WARN,
        retry: {
          initialRetryTime: 100,
          retries: 8,
          maxRetryTime: 30000,
          factor: 2,
        },
      });

      // Create admin client
      this.admin = this.kafka.admin();
      await this.admin.connect();

      // Ensure all topics exist
      await this.ensureTopics();

      // Create default producer
      await this.createProducer('default');

      this.setState(ConnectorState.CONNECTED);
      this.log('info', 'Connected to Redpanda cluster', { brokers: this.brokers });
      
      return true;
    } catch (error) {
      this.setState(ConnectorState.ERROR);
      this.log('error', 'Failed to connect to Redpanda', { error: error.message });
      throw error;
    }
  }

  /**
   * Ensure all topics exist
   */
  async ensureTopics() {
    const existingTopics = await this.admin.listTopics();
    const topicsToCreate = [];

    for (const topic of Object.values(Topics)) {
      if (!existingTopics.includes(topic)) {
        topicsToCreate.push({
          topic,
          numPartitions: this.getPartitionCount(topic),
          replicationFactor: this.config.replicationFactor || 1,
          configEntries: [
            { name: 'retention.ms', value: this.getRetentionMs(topic) },
            { name: 'cleanup.policy', value: 'delete' },
          ],
        });
      }
    }

    if (topicsToCreate.length > 0) {
      await this.admin.createTopics({ topics: topicsToCreate });
      this.log('info', `Created ${topicsToCreate.length} topics`);
    }
  }

  /**
   * Get partition count based on topic type
   */
  getPartitionCount(topic) {
    if (topic.includes('.dlq.')) return 3;
    if (topic.includes('.scan.')) return 6;
    if (topic.includes('.network.')) return 12;
    if (topic.includes('.security.')) return 6;
    return 6;
  }

  /**
   * Get retention based on topic type
   */
  getRetentionMs(topic) {
    const DAY = 86400000;
    if (topic.includes('.dlq.')) return String(7 * DAY);
    if (topic.includes('.compliance.')) return String(365 * DAY);
    if (topic.includes('.audit.')) return String(365 * DAY);
    return String(30 * DAY);
  }

  /**
   * Create a producer
   */
  async createProducer(name, options = {}) {
    const producer = this.kafka.producer({
      createPartitioner: Partitioners.DefaultPartitioner,
      idempotent: options.idempotent ?? true,
      maxInFlightRequests: options.maxInFlightRequests || 5,
      transactionalId: options.transactionalId,
    });

    await producer.connect();
    this.producers.set(name, producer);
    
    // Handle producer events
    producer.on('producer.disconnect', () => {
      this.log('warn', `Producer ${name} disconnected`);
      this.emit('producer:disconnect', { name });
    });

    return producer;
  }

  /**
   * Get or create a producer
   */
  async getProducer(name = 'default') {
    if (!this.producers.has(name)) {
      await this.createProducer(name);
    }
    return this.producers.get(name);
  }

  /**
   * Publish a message
   */
  async publish(topic, message, options = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const producer = await this.getProducer(options.producer || 'default');
        
        // Validate against schema if provided
        if (options.schemaId) {
          const validation = schemaRegistry.validate(options.schemaId, message);
          if (!validation.valid) {
            const error = new Error(`Schema validation failed: ${JSON.stringify(validation.errors)}`);
            error.code = 'SCHEMA_VALIDATION_ERROR';
            throw error;
          }
        }

        const record = {
          topic,
          messages: [{
            key: options.key || message.id || null,
            value: JSON.stringify(message),
            headers: {
              'content-type': 'application/json',
              'victorykit-version': '1.0.0',
              'victorykit-source': message.source || 'unknown',
              'victorykit-type': message.type || 'unknown',
              ...options.headers,
            },
            timestamp: options.timestamp || Date.now().toString(),
          }],
          compression: options.compression || CompressionTypes.GZIP,
        };

        await producer.send(record);
        
        this.emit('message:published', { topic, messageId: message.id });
        return { success: true, topic, messageId: message.id };
      });
    });
  }

  /**
   * Publish batch of messages
   */
  async publishBatch(topic, messages, options = {}) {
    const producer = await this.getProducer(options.producer || 'default');

    const records = messages.map(message => ({
      key: message.id || null,
      value: JSON.stringify(message),
      headers: {
        'content-type': 'application/json',
        'victorykit-version': '1.0.0',
      },
    }));

    await producer.send({
      topic,
      messages: records,
      compression: options.compression || CompressionTypes.GZIP,
    });

    this.emit('batch:published', { topic, count: messages.length });
    return { success: true, topic, count: messages.length };
  }

  /**
   * Create a consumer
   */
  async createConsumer(groupId, options = {}) {
    const consumer = this.kafka.consumer({
      groupId,
      sessionTimeout: options.sessionTimeout || 30000,
      heartbeatInterval: options.heartbeatInterval || 3000,
      maxBytesPerPartition: options.maxBytesPerPartition || 1048576,
      minBytes: options.minBytes || 1,
      maxBytes: options.maxBytes || 10485760,
      maxWaitTimeInMs: options.maxWaitTimeInMs || 5000,
    });

    await consumer.connect();
    this.consumers.set(groupId, consumer);

    // Handle consumer events
    consumer.on('consumer.crash', (event) => {
      this.log('error', `Consumer ${groupId} crashed`, { error: event.payload });
      this.emit('consumer:crash', { groupId, error: event.payload });
    });

    consumer.on('consumer.disconnect', () => {
      this.log('warn', `Consumer ${groupId} disconnected`);
      this.emit('consumer:disconnect', { groupId });
    });

    return consumer;
  }

  /**
   * Subscribe to topics
   */
  async subscribe(groupId, topics, handler, options = {}) {
    let consumer = this.consumers.get(groupId);
    
    if (!consumer) {
      consumer = await this.createConsumer(groupId, options);
    }

    // Subscribe to topics
    const topicArray = Array.isArray(topics) ? topics : [topics];
    for (const topic of topicArray) {
      await consumer.subscribe({ topic, fromBeginning: options.fromBeginning || false });
    }

    // Run consumer
    await consumer.run({
      eachBatchAutoResolve: options.eachBatchAutoResolve ?? true,
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const value = JSON.parse(message.value.toString());
          const headers = Object.fromEntries(
            Object.entries(message.headers || {}).map(([k, v]) => [k, v?.toString()])
          );

          await handler({
            topic,
            partition,
            offset: message.offset,
            key: message.key?.toString(),
            value,
            headers,
            timestamp: message.timestamp,
          });

          this.emit('message:consumed', { topic, offset: message.offset });
        } catch (error) {
          this.log('error', 'Error processing message', { topic, error: error.message });
          
          // Send to DLQ if configured
          if (options.dlqTopic) {
            await this.publish(options.dlqTopic, {
              originalTopic: topic,
              originalMessage: message.value.toString(),
              error: error.message,
              timestamp: new Date().toISOString(),
            });
          }
          
          this.emit('message:error', { topic, error });
          
          if (!options.continueOnError) {
            throw error;
          }
        }
      },
    });

    this.log('info', `Subscribed to topics: ${topicArray.join(', ')}`, { groupId });
    return consumer;
  }

  /**
   * Seek to specific offset
   */
  async seek(groupId, topic, partition, offset) {
    const consumer = this.consumers.get(groupId);
    if (!consumer) {
      throw new Error(`Consumer ${groupId} not found`);
    }

    await consumer.seek({ topic, partition, offset });
  }

  /**
   * Pause consumption
   */
  async pause(groupId, topics) {
    const consumer = this.consumers.get(groupId);
    if (!consumer) {
      throw new Error(`Consumer ${groupId} not found`);
    }

    const topicPartitions = topics.map(topic => ({ topic }));
    consumer.pause(topicPartitions);
  }

  /**
   * Resume consumption
   */
  async resume(groupId, topics) {
    const consumer = this.consumers.get(groupId);
    if (!consumer) {
      throw new Error(`Consumer ${groupId} not found`);
    }

    const topicPartitions = topics.map(topic => ({ topic }));
    consumer.resume(topicPartitions);
  }

  /**
   * Get consumer group offsets
   */
  async getOffsets(groupId, topic) {
    return this.admin.fetchOffsets({ groupId, topic });
  }

  /**
   * Check health
   */
  async checkHealth() {
    try {
      const metadata = await this.admin.fetchTopicMetadata();
      return {
        isHealthy: true,
        message: 'Connected',
        brokerCount: metadata.brokers.length,
        topicCount: metadata.topics.length,
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

    // Disconnect all consumers
    for (const [groupId, consumer] of this.consumers) {
      try {
        await consumer.disconnect();
        this.log('info', `Consumer ${groupId} disconnected`);
      } catch (error) {
        this.log('error', `Error disconnecting consumer ${groupId}`, { error: error.message });
      }
    }
    this.consumers.clear();

    // Disconnect all producers
    for (const [name, producer] of this.producers) {
      try {
        await producer.disconnect();
        this.log('info', `Producer ${name} disconnected`);
      } catch (error) {
        this.log('error', `Error disconnecting producer ${name}`, { error: error.message });
      }
    }
    this.producers.clear();

    // Disconnect admin
    if (this.admin) {
      await this.admin.disconnect();
    }

    this.log('info', 'Disconnected from Redpanda cluster');
  }
}

/**
 * Convenience producer class for specific use cases
 */
class RedpandaProducer {
  constructor(connector, options = {}) {
    this.connector = connector;
    this.producerName = options.name || 'default';
    this.defaultTopic = options.topic;
    this.schemaId = options.schemaId;
  }

  async publish(message, options = {}) {
    return this.connector.publish(
      options.topic || this.defaultTopic,
      message,
      {
        producer: this.producerName,
        schemaId: options.schemaId || this.schemaId,
        ...options,
      }
    );
  }

  async publishBatch(messages, options = {}) {
    return this.connector.publishBatch(
      options.topic || this.defaultTopic,
      messages,
      { producer: this.producerName, ...options }
    );
  }
}

/**
 * Convenience consumer class
 */
class RedpandaConsumer {
  constructor(connector, groupId, options = {}) {
    this.connector = connector;
    this.groupId = groupId;
    this.options = options;
  }

  async subscribe(topics, handler) {
    return this.connector.subscribe(this.groupId, topics, handler, this.options);
  }

  async pause(topics) {
    return this.connector.pause(this.groupId, topics);
  }

  async resume(topics) {
    return this.connector.resume(this.groupId, topics);
  }
}

module.exports = {
  RedpandaConnector,
  RedpandaProducer,
  RedpandaConsumer,
  Topics,
  ConsumerGroups,
};
