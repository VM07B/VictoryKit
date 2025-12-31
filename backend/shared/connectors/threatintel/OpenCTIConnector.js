/**
 * OpenCTI Connector
 * 
 * STIX/TAXII Threat Intelligence Platform integration:
 * - STIX 2.1 object management
 * - IOC enrichment
 * - Knowledge graph queries
 * - Indicator feeds
 * - Attack pattern correlation
 */

const { BaseConnector, ConnectorState } = require('../base/BaseConnector');
const { CircuitBreaker, RetryStrategy } = require('../base/Resilience');

/**
 * STIX 2.1 Object Types
 */
const STIXTypes = {
  // Domain Objects
  ATTACK_PATTERN: 'attack-pattern',
  CAMPAIGN: 'campaign',
  COURSE_OF_ACTION: 'course-of-action',
  IDENTITY: 'identity',
  INDICATOR: 'indicator',
  INFRASTRUCTURE: 'infrastructure',
  INTRUSION_SET: 'intrusion-set',
  LOCATION: 'location',
  MALWARE: 'malware',
  MALWARE_ANALYSIS: 'malware-analysis',
  NOTE: 'note',
  OBSERVED_DATA: 'observed-data',
  OPINION: 'opinion',
  REPORT: 'report',
  THREAT_ACTOR: 'threat-actor',
  TOOL: 'tool',
  VULNERABILITY: 'vulnerability',
  
  // Relationship Objects
  RELATIONSHIP: 'relationship',
  SIGHTING: 'sighting',
  
  // Cyber Observable Objects
  ARTIFACT: 'artifact',
  AUTONOMOUS_SYSTEM: 'autonomous-system',
  DIRECTORY: 'directory',
  DOMAIN_NAME: 'domain-name',
  EMAIL_ADDR: 'email-addr',
  EMAIL_MESSAGE: 'email-message',
  FILE: 'file',
  IPV4_ADDR: 'ipv4-addr',
  IPV6_ADDR: 'ipv6-addr',
  MAC_ADDR: 'mac-addr',
  MUTEX: 'mutex',
  NETWORK_TRAFFIC: 'network-traffic',
  PROCESS: 'process',
  SOFTWARE: 'software',
  URL: 'url',
  USER_ACCOUNT: 'user-account',
  WINDOWS_REGISTRY_KEY: 'windows-registry-key',
  X509_CERTIFICATE: 'x509-certificate',
};

/**
 * OpenCTI GraphQL Queries
 */
const Queries = {
  // Get indicator by value
  INDICATOR_BY_VALUE: `
    query GetIndicator($value: String!) {
      indicators(filters: { key: "pattern", values: [$value] }) {
        edges {
          node {
            id
            standard_id
            entity_type
            name
            pattern
            pattern_type
            valid_from
            valid_until
            x_opencti_score
            x_opencti_detection
            created_by {
              id
              name
            }
            objectLabel {
              id
              value
            }
            objectMarking {
              id
              definition
            }
            killChainPhases {
              id
              kill_chain_name
              phase_name
            }
          }
        }
      }
    }
  `,

  // Search indicators
  SEARCH_INDICATORS: `
    query SearchIndicators($search: String, $first: Int, $after: ID) {
      indicators(search: $search, first: $first, after: $after) {
        edges {
          node {
            id
            standard_id
            name
            pattern
            pattern_type
            valid_from
            valid_until
            x_opencti_score
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `,

  // Get observable by value
  OBSERVABLE_BY_VALUE: `
    query GetObservable($type: String!, $value: String!) {
      stixCyberObservables(
        filters: { 
          key: "entity_type", values: [$type],
          filterGroups: [{ key: "value", values: [$value] }]
        }
      ) {
        edges {
          node {
            id
            standard_id
            entity_type
            observable_value
            x_opencti_score
            indicators {
              edges {
                node {
                  id
                  name
                  pattern
                }
              }
            }
          }
        }
      }
    }
  `,

  // Get threat actor
  THREAT_ACTOR: `
    query GetThreatActor($id: String!) {
      threatActor(id: $id) {
        id
        standard_id
        name
        description
        aliases
        first_seen
        last_seen
        goals
        resource_level
        primary_motivation
        secondary_motivations
        sophistication
        objectLabel {
          value
        }
        usesAttackPatterns: stixCoreRelationships(
          relationship_type: ["uses"]
          toTypes: ["Attack-Pattern"]
        ) {
          edges {
            node {
              to {
                ... on AttackPattern {
                  id
                  name
                  x_mitre_id
                }
              }
            }
          }
        }
      }
    }
  `,

  // Get malware
  MALWARE: `
    query GetMalware($id: String!) {
      malware(id: $id) {
        id
        standard_id
        name
        description
        aliases
        first_seen
        last_seen
        is_family
        malware_types
        implementation_languages
        architecture_execution_envs
        objectLabel {
          value
        }
        indicators {
          edges {
            node {
              id
              pattern
              pattern_type
            }
          }
        }
      }
    }
  `,

  // Get attack pattern
  ATTACK_PATTERN: `
    query GetAttackPattern($id: String!) {
      attackPattern(id: $id) {
        id
        standard_id
        name
        description
        x_mitre_id
        x_mitre_platforms
        x_mitre_permissions_required
        killChainPhases {
          kill_chain_name
          phase_name
        }
        parentAttackPatterns {
          edges {
            node {
              id
              name
              x_mitre_id
            }
          }
        }
        subAttackPatterns {
          edges {
            node {
              id
              name
              x_mitre_id
            }
          }
        }
      }
    }
  `,

  // Create indicator
  CREATE_INDICATOR: `
    mutation CreateIndicator($input: IndicatorAddInput!) {
      indicatorAdd(input: $input) {
        id
        standard_id
        name
        pattern
        pattern_type
      }
    }
  `,

  // Create observable
  CREATE_OBSERVABLE: `
    mutation CreateObservable($type: String!, $input: StixCyberObservableAddInput!) {
      stixCyberObservableAdd(type: $type, stixCyberObservable: $input) {
        id
        standard_id
        observable_value
      }
    }
  `,

  // Create sighting
  CREATE_SIGHTING: `
    mutation CreateSighting($input: SightingAddInput!) {
      sightingAdd(input: $input) {
        id
        standard_id
        first_seen
        last_seen
        count
      }
    }
  `,
};

/**
 * OpenCTI Connector
 */
class OpenCTIConnector extends BaseConnector {
  constructor(config = {}) {
    super({ name: 'OpenCTIConnector', ...config });
    
    this.url = config.url || 'http://localhost:8080';
    this.token = config.token;
    this.graphqlEndpoint = `${this.url}/graphql`;
    
    // Caching for frequently accessed data
    this.cache = new Map();
    this.cacheMaxAge = config.cacheMaxAge || 300000; // 5 minutes
    
    // Resilience
    this.circuitBreaker = new CircuitBreaker({
      name: 'opencti',
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
   * Connect to OpenCTI
   */
  async connect() {
    this.setState(ConnectorState.CONNECTING);
    
    try {
      // Test connection with a simple query
      await this.query('{ about { version } }');
      
      this.setState(ConnectorState.CONNECTED);
      this.log('info', 'Connected to OpenCTI', { url: this.url });
      
      return true;
    } catch (error) {
      this.setState(ConnectorState.ERROR);
      this.log('error', 'Failed to connect to OpenCTI', { error: error.message });
      throw error;
    }
  }

  /**
   * Execute GraphQL query
   */
  async query(query, variables = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const response = await fetch(this.graphqlEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          },
          body: JSON.stringify({ query, variables }),
        });

        if (!response.ok) {
          const error = new Error(`OpenCTI API error: ${response.status}`);
          error.status = response.status;
          throw error;
        }

        const result = await response.json();
        
        if (result.errors) {
          const error = new Error(result.errors[0].message);
          error.errors = result.errors;
          throw error;
        }

        return result.data;
      });
    });
  }

  /**
   * Get from cache or fetch
   */
  async getWithCache(key, fetchFn) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheMaxAge) {
      return cached.data;
    }

    const data = await fetchFn();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * Enrich an indicator (IP, domain, hash, etc.)
   */
  async enrichIndicator(type, value) {
    const cacheKey = `indicator:${type}:${value}`;
    
    return this.getWithCache(cacheKey, async () => {
      // First, try to find as observable
      const observable = await this.findObservable(type, value);
      
      // Then search for related indicators
      const indicators = await this.searchIndicators(value);
      
      // Get related threat actors, malware, campaigns
      const context = await this.getIndicatorContext(observable, indicators);
      
      return {
        observable,
        indicators: indicators.edges?.map(e => e.node) || [],
        context,
        enrichedAt: new Date().toISOString(),
      };
    });
  }

  /**
   * Find observable by type and value
   */
  async findObservable(type, value) {
    const typeMap = {
      ip: 'IPv4-Addr',
      ipv4: 'IPv4-Addr',
      ipv6: 'IPv6-Addr',
      domain: 'Domain-Name',
      url: 'Url',
      md5: 'StixFile',
      sha1: 'StixFile',
      sha256: 'StixFile',
      email: 'Email-Addr',
    };

    const stixType = typeMap[type.toLowerCase()] || type;

    const data = await this.query(Queries.OBSERVABLE_BY_VALUE, {
      type: stixType,
      value,
    });

    return data.stixCyberObservables?.edges?.[0]?.node || null;
  }

  /**
   * Search indicators
   */
  async searchIndicators(search, options = {}) {
    const data = await this.query(Queries.SEARCH_INDICATORS, {
      search,
      first: options.first || 25,
      after: options.after,
    });

    return data.indicators;
  }

  /**
   * Get indicator context (related entities)
   */
  async getIndicatorContext(observable, indicators) {
    const context = {
      threatActors: [],
      malware: [],
      campaigns: [],
      attackPatterns: [],
    };

    // This would require additional queries to get related entities
    // Simplified for now
    return context;
  }

  /**
   * Get threat actor details
   */
  async getThreatActor(id) {
    const cacheKey = `threatActor:${id}`;
    
    return this.getWithCache(cacheKey, async () => {
      const data = await this.query(Queries.THREAT_ACTOR, { id });
      return data.threatActor;
    });
  }

  /**
   * Get malware details
   */
  async getMalware(id) {
    const cacheKey = `malware:${id}`;
    
    return this.getWithCache(cacheKey, async () => {
      const data = await this.query(Queries.MALWARE, { id });
      return data.malware;
    });
  }

  /**
   * Get attack pattern (MITRE ATT&CK technique)
   */
  async getAttackPattern(id) {
    const cacheKey = `attackPattern:${id}`;
    
    return this.getWithCache(cacheKey, async () => {
      const data = await this.query(Queries.ATTACK_PATTERN, { id });
      return data.attackPattern;
    });
  }

  /**
   * Search MITRE ATT&CK techniques
   */
  async searchMITRETechniques(search) {
    const query = `
      query SearchATTACK($search: String!) {
        attackPatterns(search: $search, filters: { key: "x_mitre_id", operator: "not_nil" }) {
          edges {
            node {
              id
              name
              x_mitre_id
              description
            }
          }
        }
      }
    `;

    const data = await this.query(query, { search });
    return data.attackPatterns?.edges?.map(e => e.node) || [];
  }

  /**
   * Create an indicator
   */
  async createIndicator(input) {
    const data = await this.query(Queries.CREATE_INDICATOR, { input });
    return data.indicatorAdd;
  }

  /**
   * Create an observable
   */
  async createObservable(type, input) {
    const data = await this.query(Queries.CREATE_OBSERVABLE, { type, input });
    return data.stixCyberObservableAdd;
  }

  /**
   * Report a sighting
   */
  async createSighting(input) {
    const data = await this.query(Queries.CREATE_SIGHTING, { input });
    return data.sightingAdd;
  }

  /**
   * Import STIX bundle
   */
  async importSTIXBundle(bundle) {
    const mutation = `
      mutation ImportBundle($bundle: String!) {
        stixBundlePush(bundle: $bundle) {
          id
        }
      }
    `;

    const data = await this.query(mutation, { 
      bundle: JSON.stringify(bundle) 
    });
    return data.stixBundlePush;
  }

  /**
   * Export STIX bundle for entity
   */
  async exportSTIXBundle(entityId, options = {}) {
    const query = `
      query ExportBundle($id: String!, $mode: String) {
        stixObjectOrStixRelationshipById(id: $id) {
          ... on StixDomainObject {
            toStix(mode: $mode)
          }
        }
      }
    `;

    const data = await this.query(query, {
      id: entityId,
      mode: options.mode || 'simple',
    });

    return JSON.parse(data.stixObjectOrStixRelationshipById.toStix);
  }

  /**
   * Get recent indicators feed
   */
  async getIndicatorFeed(options = {}) {
    const query = `
      query IndicatorFeed($first: Int, $after: ID, $orderBy: IndicatorsOrdering, $orderMode: OrderingMode) {
        indicators(first: $first, after: $after, orderBy: $orderBy, orderMode: $orderMode) {
          edges {
            node {
              id
              standard_id
              name
              pattern
              pattern_type
              valid_from
              valid_until
              x_opencti_score
              created_at
              updated_at
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const data = await this.query(query, {
      first: options.first || 100,
      after: options.after,
      orderBy: options.orderBy || 'created_at',
      orderMode: options.orderMode || 'desc',
    });

    return data.indicators;
  }

  /**
   * Subscribe to live stream (SSE)
   */
  async subscribeToStream(callback, options = {}) {
    const streamUrl = `${this.url}/stream?recover=${options.recover || ''}`;
    
    // This would use EventSource in browser or a package like eventsource in Node.js
    this.log('info', 'Stream subscription would be initialized', { streamUrl });
    
    // For now, return a placeholder
    return {
      close: () => {},
    };
  }

  /**
   * Check health
   */
  async checkHealth() {
    try {
      const data = await this.query('{ about { version platform_version } }');
      
      return {
        isHealthy: true,
        message: 'Connected',
        version: data.about.version,
        platformVersion: data.about.platform_version,
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
    this.cache.clear();
    this.log('info', 'Disconnected from OpenCTI');
  }
}

module.exports = {
  OpenCTIConnector,
  STIXTypes,
  Queries,
};
