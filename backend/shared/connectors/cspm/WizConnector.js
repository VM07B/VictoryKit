/**
 * Wiz CSPM Connector
 * 
 * Cloud Security Posture Management:
 * - Security graph queries
 * - Issue management
 * - Cloud inventory
 * - Vulnerability assessment
 * - Compliance frameworks
 * - Attack path analysis
 */

const { BaseConnector, ConnectorState } = require('../base/BaseConnector');
const { CircuitBreaker, RetryStrategy } = require('../base/Resilience');

/**
 * Issue severity levels
 */
const IssueSeverity = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFORMATIONAL: 'INFORMATIONAL',
};

/**
 * Issue status
 */
const IssueStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
};

/**
 * Cloud providers
 */
const CloudProvider = {
  AWS: 'AWS',
  GCP: 'GCP',
  AZURE: 'AZURE',
  OCI: 'OCI',
  ALIBABA: 'ALIBABA',
  VMWARE: 'VMWARE',
  KUBERNETES: 'KUBERNETES',
};

/**
 * Resource types
 */
const ResourceType = {
  VIRTUAL_MACHINE: 'VIRTUAL_MACHINE',
  CONTAINER: 'CONTAINER',
  KUBERNETES_POD: 'KUBERNETES_POD',
  SERVERLESS_FUNCTION: 'SERVERLESS_FUNCTION',
  DATABASE: 'DATABASE',
  STORAGE_BUCKET: 'STORAGE_BUCKET',
  NETWORK: 'NETWORK',
  IAM_ROLE: 'IAM_ROLE',
  IAM_USER: 'IAM_USER',
  SECRET: 'SECRET',
  KUBERNETES_CLUSTER: 'KUBERNETES_CLUSTER',
  LOAD_BALANCER: 'LOAD_BALANCER',
  API_GATEWAY: 'API_GATEWAY',
};

/**
 * Compliance frameworks
 */
const ComplianceFramework = {
  SOC2: 'SOC 2',
  ISO27001: 'ISO 27001',
  PCI_DSS: 'PCI DSS',
  HIPAA: 'HIPAA',
  GDPR: 'GDPR',
  NIST_CSF: 'NIST CSF',
  CIS_AWS: 'CIS AWS Foundations',
  CIS_GCP: 'CIS GCP Foundations',
  CIS_AZURE: 'CIS Azure Foundations',
  CIS_KUBERNETES: 'CIS Kubernetes',
};

/**
 * Wiz GraphQL queries
 */
const WizQueries = {
  // Issues
  ISSUES: `
    query IssuesTable($filterBy: IssueFilters, $first: Int, $after: String) {
      issues(filterBy: $filterBy, first: $first, after: $after) {
        nodes {
          id
          control { id name severity }
          status
          severity
          createdAt
          updatedAt
          dueAt
          resolvedAt
          resource { id name type cloudPlatform region }
          project { id name }
          notes { id text createdAt }
        }
        pageInfo { hasNextPage endCursor }
        totalCount
      }
    }
  `,

  // Issue details
  ISSUE: `
    query Issue($id: ID!) {
      issue(id: $id) {
        id
        control { 
          id name description severity 
          securitySubCategories { name category { name } }
        }
        status
        severity
        createdAt
        updatedAt
        dueAt
        resolvedAt
        resource { 
          id name type cloudPlatform region 
          properties
          tags { key value }
        }
        project { id name }
        evidence { data }
        remediation { data }
        notes { id text createdAt author { name email } }
      }
    }
  `,

  // Graph query
  GRAPH_SEARCH: `
    query GraphSearch($query: GraphEntityQueryInput!, $first: Int, $after: String) {
      graphSearch(query: $query, first: $first, after: $after) {
        nodes {
          entities {
            id
            name
            type
            properties
          }
        }
        pageInfo { hasNextPage endCursor }
        totalCount
      }
    }
  `,

  // Cloud resources
  CLOUD_RESOURCES: `
    query CloudResources($filterBy: CloudResourceFilters, $first: Int, $after: String) {
      cloudResources(filterBy: $filterBy, first: $first, after: $after) {
        nodes {
          id
          name
          type
          cloudPlatform
          region
          subscriptionId
          subscriptionExternalId
          status
          properties
          tags { key value }
          issues { id severity status }
          vulnerabilities { id severity }
        }
        pageInfo { hasNextPage endCursor }
        totalCount
      }
    }
  `,

  // Vulnerabilities
  VULNERABILITIES: `
    query Vulnerabilities($filterBy: VulnerabilityFilters, $first: Int, $after: String) {
      vulnerabilities(filterBy: $filterBy, first: $first, after: $after) {
        nodes {
          id
          name
          cveId
          severity
          score
          exploitAvailable
          fixAvailable
          publishedAt
          affectedResources { id name type }
        }
        pageInfo { hasNextPage endCursor }
        totalCount
      }
    }
  `,

  // Attack paths
  ATTACK_PATHS: `
    query AttackPaths($filterBy: AttackPathFilters, $first: Int) {
      attackPaths(filterBy: $filterBy, first: $first) {
        nodes {
          id
          name
          severity
          type
          steps {
            resource { id name type }
            action
          }
          entryPoint { id name type }
          target { id name type }
        }
        totalCount
      }
    }
  `,

  // Compliance
  COMPLIANCE_FRAMEWORKS: `
    query ComplianceFrameworks {
      complianceFrameworks {
        nodes {
          id
          name
          enabled
          passedControlsCount
          failedControlsCount
          passPercentage
        }
      }
    }
  `,

  // Projects/subscriptions
  PROJECTS: `
    query Projects($first: Int) {
      projects(first: $first) {
        nodes {
          id
          name
          cloudOrganization { name }
          businessUnit
          riskProfile { businessImpact }
        }
      }
    }
  `,
};

/**
 * Wiz Connector
 */
class WizConnector extends BaseConnector {
  constructor(config = {}) {
    super({ name: 'WizConnector', ...config });
    
    this.apiUrl = config.apiUrl || 'https://api.wiz.io/graphql';
    this.authUrl = config.authUrl || 'https://auth.wiz.io/oauth/token';
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.audience = config.audience || 'wiz-api';
    
    this.accessToken = null;
    this.tokenExpiry = null;
    
    // Resilience
    this.circuitBreaker = new CircuitBreaker({
      name: 'wiz',
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
   * Connect and authenticate
   */
  async connect() {
    this.setState(ConnectorState.CONNECTING);
    
    try {
      await this.authenticate();
      
      // Verify with a simple query
      await this.query(WizQueries.PROJECTS, { first: 1 });
      
      this.setState(ConnectorState.CONNECTED);
      this.log('info', 'Connected to Wiz');
      
      return true;
    } catch (error) {
      this.setState(ConnectorState.ERROR);
      this.log('error', 'Failed to connect to Wiz', { error: error.message });
      throw error;
    }
  }

  /**
   * Authenticate with OAuth2
   */
  async authenticate() {
    const response = await fetch(this.authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        audience: this.audience,
      }),
    });

    if (!response.ok) {
      throw new Error(`Wiz authentication failed: ${response.status}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 minute buffer
    
    return data;
  }

  /**
   * Ensure valid token
   */
  async ensureToken() {
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      await this.authenticate();
    }
  }

  /**
   * Execute GraphQL query
   */
  async query(query, variables = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        await this.ensureToken();

        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, variables }),
        });

        if (!response.ok) {
          throw new Error(`Wiz API error: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.errors?.length > 0) {
          throw new Error(`Wiz GraphQL error: ${result.errors[0].message}`);
        }

        return result.data;
      });
    });
  }

  /**
   * Execute mutation
   */
  async mutate(mutation, variables = {}) {
    return this.query(mutation, variables);
  }

  // ============================================
  // ISSUES
  // ============================================

  /**
   * List issues
   */
  async listIssues(filters = {}, pagination = {}) {
    const variables = {
      filterBy: {},
      first: pagination.first || 100,
      after: pagination.after,
    };

    if (filters.severity) variables.filterBy.severity = filters.severity;
    if (filters.status) variables.filterBy.status = filters.status;
    if (filters.cloudPlatform) variables.filterBy.cloudPlatform = filters.cloudPlatform;
    if (filters.resourceType) variables.filterBy.resourceType = filters.resourceType;
    if (filters.projectId) variables.filterBy.project = filters.projectId;
    if (filters.controlId) variables.filterBy.controlId = filters.controlId;
    if (filters.createdAfter) variables.filterBy.createdAt = { after: filters.createdAfter };

    const result = await this.query(WizQueries.ISSUES, variables);
    return result.issues;
  }

  /**
   * Get issue by ID
   */
  async getIssue(issueId) {
    const result = await this.query(WizQueries.ISSUE, { id: issueId });
    return result.issue;
  }

  /**
   * Update issue status
   */
  async updateIssueStatus(issueId, status, note = '') {
    const mutation = `
      mutation UpdateIssueStatus($id: ID!, $patch: UpdateIssuePatch!) {
        updateIssue(id: $id, patch: $patch) {
          issue { id status }
        }
      }
    `;

    const result = await this.mutate(mutation, {
      id: issueId,
      patch: { status, statusNote: note },
    });

    this.emit('issue:updated', { issueId, status });
    return result.updateIssue?.issue;
  }

  /**
   * Add note to issue
   */
  async addIssueNote(issueId, text) {
    const mutation = `
      mutation AddIssueNote($id: ID!, $text: String!) {
        addIssueNote(id: $id, note: { text: $text }) {
          note { id text createdAt }
        }
      }
    `;

    return this.mutate(mutation, { id: issueId, text });
  }

  /**
   * Resolve issue
   */
  async resolveIssue(issueId, resolution) {
    return this.updateIssueStatus(issueId, IssueStatus.RESOLVED, resolution);
  }

  /**
   * Get critical issues
   */
  async getCriticalIssues(limit = 50) {
    return this.listIssues(
      { severity: [IssueSeverity.CRITICAL], status: [IssueStatus.OPEN] },
      { first: limit }
    );
  }

  // ============================================
  // CLOUD RESOURCES
  // ============================================

  /**
   * List cloud resources
   */
  async listCloudResources(filters = {}, pagination = {}) {
    const variables = {
      filterBy: {},
      first: pagination.first || 100,
      after: pagination.after,
    };

    if (filters.type) variables.filterBy.type = filters.type;
    if (filters.cloudPlatform) variables.filterBy.cloudPlatform = filters.cloudPlatform;
    if (filters.region) variables.filterBy.region = filters.region;
    if (filters.projectId) variables.filterBy.project = filters.projectId;
    if (filters.hasIssues !== undefined) variables.filterBy.hasIssues = filters.hasIssues;
    if (filters.hasVulnerabilities !== undefined) {
      variables.filterBy.hasVulnerabilities = filters.hasVulnerabilities;
    }

    const result = await this.query(WizQueries.CLOUD_RESOURCES, variables);
    return result.cloudResources;
  }

  /**
   * Get resource by ID
   */
  async getResource(resourceId) {
    const query = `
      query GetResource($id: ID!) {
        cloudResource(id: $id) {
          id name type cloudPlatform region
          subscriptionId subscriptionExternalId
          status properties
          tags { key value }
          issues { id severity status control { name } }
          vulnerabilities { id cveId severity score }
          networkExposure { isExposedToInternet exposureType }
        }
      }
    `;

    const result = await this.query(query, { id: resourceId });
    return result.cloudResource;
  }

  /**
   * Search resources
   */
  async searchResources(searchQuery, limit = 100) {
    const query = `
      query SearchResources($search: String!, $first: Int) {
        cloudResources(first: $first, search: $search) {
          nodes { id name type cloudPlatform region status }
          totalCount
        }
      }
    `;

    const result = await this.query(query, { search: searchQuery, first: limit });
    return result.cloudResources;
  }

  // ============================================
  // GRAPH QUERIES
  // ============================================

  /**
   * Execute Wiz Graph query
   */
  async graphSearch(queryText, options = {}) {
    const variables = {
      query: { type: 'query', where: queryText },
      first: options.first || 100,
      after: options.after,
    };

    return this.query(WizQueries.GRAPH_SEARCH, variables);
  }

  /**
   * Find exposed resources
   */
  async findExposedResources(cloudProvider = null) {
    let whereClause = '{ isExposedToInternet: true }';
    if (cloudProvider) {
      whereClause = `{ isExposedToInternet: true, cloudPlatform: ${cloudProvider} }`;
    }
    
    return this.graphSearch(whereClause);
  }

  /**
   * Find resources with critical vulnerabilities
   */
  async findVulnerableResources(minSeverity = 'HIGH') {
    return this.graphSearch(`{ 
      vulnerabilities: { some: { severity: { in: [CRITICAL, HIGH] } } }
    }`);
  }

  /**
   * Find public S3 buckets
   */
  async findPublicS3Buckets() {
    return this.graphSearch(`{
      type: { equals: S3_BUCKET }
      properties: { path: "publicAccess", equals: "true" }
    }`);
  }

  /**
   * Find unencrypted databases
   */
  async findUnencryptedDatabases() {
    return this.graphSearch(`{
      type: { in: [RDS_INSTANCE, DYNAMO_DB_TABLE, AZURE_SQL_DATABASE] }
      properties: { path: "encrypted", equals: "false" }
    }`);
  }

  // ============================================
  // VULNERABILITIES
  // ============================================

  /**
   * List vulnerabilities
   */
  async listVulnerabilities(filters = {}, pagination = {}) {
    const variables = {
      filterBy: {},
      first: pagination.first || 100,
      after: pagination.after,
    };

    if (filters.severity) variables.filterBy.severity = filters.severity;
    if (filters.exploitAvailable) variables.filterBy.exploitAvailable = filters.exploitAvailable;
    if (filters.fixAvailable) variables.filterBy.fixAvailable = filters.fixAvailable;
    if (filters.cveId) variables.filterBy.cveId = filters.cveId;

    const result = await this.query(WizQueries.VULNERABILITIES, variables);
    return result.vulnerabilities;
  }

  /**
   * Get exploitable vulnerabilities
   */
  async getExploitableVulnerabilities(limit = 100) {
    return this.listVulnerabilities(
      { exploitAvailable: true, severity: [IssueSeverity.CRITICAL, IssueSeverity.HIGH] },
      { first: limit }
    );
  }

  /**
   * Get vulnerability by CVE
   */
  async getVulnerabilityByCVE(cveId) {
    const result = await this.listVulnerabilities({ cveId }, { first: 1 });
    return result.nodes?.[0] || null;
  }

  // ============================================
  // ATTACK PATHS
  // ============================================

  /**
   * List attack paths
   */
  async listAttackPaths(filters = {}, limit = 50) {
    const variables = {
      filterBy: {},
      first: limit,
    };

    if (filters.severity) variables.filterBy.severity = filters.severity;
    if (filters.targetType) variables.filterBy.targetType = filters.targetType;

    const result = await this.query(WizQueries.ATTACK_PATHS, variables);
    return result.attackPaths;
  }

  /**
   * Get critical attack paths
   */
  async getCriticalAttackPaths(limit = 20) {
    return this.listAttackPaths({ severity: [IssueSeverity.CRITICAL] }, limit);
  }

  // ============================================
  // COMPLIANCE
  // ============================================

  /**
   * Get compliance frameworks status
   */
  async getComplianceStatus() {
    const result = await this.query(WizQueries.COMPLIANCE_FRAMEWORKS);
    return result.complianceFrameworks;
  }

  /**
   * Get framework details
   */
  async getFrameworkDetails(frameworkId) {
    const query = `
      query FrameworkDetails($id: ID!) {
        complianceFramework(id: $id) {
          id name enabled
          controls {
            nodes {
              id name severity
              passedResourcesCount failedResourcesCount
              issues { totalCount }
            }
          }
        }
      }
    `;

    const result = await this.query(query, { id: frameworkId });
    return result.complianceFramework;
  }

  /**
   * Get failing controls
   */
  async getFailingControls(frameworkId) {
    const details = await this.getFrameworkDetails(frameworkId);
    return details?.controls?.nodes?.filter(c => c.failedResourcesCount > 0) || [];
  }

  // ============================================
  // PROJECTS
  // ============================================

  /**
   * List projects
   */
  async listProjects(limit = 100) {
    const result = await this.query(WizQueries.PROJECTS, { first: limit });
    return result.projects;
  }

  // ============================================
  // SECURITY POSTURE SUMMARY
  // ============================================

  /**
   * Get security posture summary
   */
  async getSecurityPosture() {
    const [
      criticalIssues,
      compliance,
      attackPaths,
      vulnerabilities,
    ] = await Promise.all([
      this.getCriticalIssues(10),
      this.getComplianceStatus(),
      this.getCriticalAttackPaths(5),
      this.getExploitableVulnerabilities(10),
    ]);

    return {
      criticalIssues: {
        count: criticalIssues.totalCount,
        sample: criticalIssues.nodes?.slice(0, 5),
      },
      compliance: compliance.nodes?.map(f => ({
        name: f.name,
        passPercentage: f.passPercentage,
        failedControls: f.failedControlsCount,
      })),
      attackPaths: {
        count: attackPaths.totalCount,
        sample: attackPaths.nodes?.slice(0, 3),
      },
      vulnerabilities: {
        exploitableCount: vulnerabilities.totalCount,
        sample: vulnerabilities.nodes?.slice(0, 5),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Check health
   */
  async checkHealth() {
    try {
      await this.query(WizQueries.PROJECTS, { first: 1 });
      
      return {
        isHealthy: true,
        message: 'Connected',
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
    this.accessToken = null;
    this.tokenExpiry = null;
    this.setState(ConnectorState.DISCONNECTED);
    this.log('info', 'Disconnected from Wiz');
  }
}

module.exports = {
  WizConnector,
  IssueSeverity,
  IssueStatus,
  CloudProvider,
  ResourceType,
  ComplianceFramework,
  WizQueries,
};
