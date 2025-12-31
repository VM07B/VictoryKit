/**
 * Tines SOAR Connector
 * 
 * No-code automation platform integration:
 * - Story (playbook) management
 * - Action execution
 * - Webhook triggers
 * - Agent management
 * - Credential handling
 */

const { BaseConnector, ConnectorState } = require('../base/BaseConnector');
const { CircuitBreaker, RetryStrategy } = require('../base/Resilience');

/**
 * Action types in Tines
 */
const ActionType = {
  HTTP_REQUEST: 'HTTPRequestAgent',
  EVENT_TRANSFORM: 'EventTransformationAgent',
  TRIGGER: 'TriggerAgent',
  SEND_EMAIL: 'EmailAgent',
  DELAY: 'DelayAgent',
  JAVASCRIPT: 'JavaScriptActionAgent',
  GROUP: 'Group',
  WEBHOOK: 'WebhookAgent',
  RECEIVE: 'ReceiveAgent',
  SEND_TO_STORY: 'SendToStoryAgent',
  RECORD: 'RecordAgent',
};

/**
 * Story run states
 */
const RunState = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

/**
 * Tines SOAR Connector
 */
class TinesConnector extends BaseConnector {
  constructor(config = {}) {
    super({ name: 'TinesConnector', ...config });
    
    this.baseUrl = config.baseUrl || 'https://victorykit.tines.com';
    this.apiKey = config.apiKey;
    this.teamId = config.teamId;
    
    // Cache for stories and agents
    this.storiesCache = new Map();
    this.cacheMaxAge = 300000; // 5 minutes
    
    // Resilience
    this.circuitBreaker = new CircuitBreaker({
      name: 'tines',
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
   * Connect to Tines
   */
  async connect() {
    this.setState(ConnectorState.CONNECTING);
    
    try {
      // Verify API key with a simple request
      await this.request('/api/v1/teams');
      
      this.setState(ConnectorState.CONNECTED);
      this.log('info', 'Connected to Tines', { baseUrl: this.baseUrl });
      
      return true;
    } catch (error) {
      this.setState(ConnectorState.ERROR);
      this.log('error', 'Failed to connect to Tines', { error: error.message });
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
            'x-user-token': this.apiKey,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (!response.ok) {
          const error = new Error(`Tines API error: ${response.status}`);
          error.status = response.status;
          throw error;
        }

        return response.json();
      });
    });
  }

  // ============================================
  // STORIES (PLAYBOOKS)
  // ============================================

  /**
   * List all stories
   */
  async listStories(options = {}) {
    const params = new URLSearchParams();
    if (options.teamId) params.set('team_id', options.teamId);
    if (options.folderId) params.set('folder_id', options.folderId);
    if (options.page) params.set('page', options.page);
    if (options.perPage) params.set('per_page', options.perPage || 50);

    const result = await this.request(`/api/v1/stories?${params}`);
    return result.stories;
  }

  /**
   * Get story by ID
   */
  async getStory(storyId) {
    const cacheKey = `story:${storyId}`;
    const cached = this.storiesCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheMaxAge) {
      return cached.data;
    }

    const result = await this.request(`/api/v1/stories/${storyId}`);
    this.storiesCache.set(cacheKey, { data: result, timestamp: Date.now() });
    
    return result;
  }

  /**
   * Get story by name
   */
  async findStoryByName(name) {
    const stories = await this.listStories();
    return stories.find(s => s.name === name);
  }

  /**
   * Create story
   */
  async createStory(name, options = {}) {
    return this.request('/api/v1/stories', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description: options.description,
        team_id: options.teamId || this.teamId,
        folder_id: options.folderId,
        keep_events_for: options.keepEventsFor || 604800, // 7 days
        disabled: options.disabled || false,
      }),
    });
  }

  /**
   * Update story
   */
  async updateStory(storyId, updates) {
    return this.request(`/api/v1/stories/${storyId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete story
   */
  async deleteStory(storyId) {
    return this.request(`/api/v1/stories/${storyId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Enable/disable story
   */
  async setStoryEnabled(storyId, enabled) {
    return this.updateStory(storyId, { disabled: !enabled });
  }

  /**
   * Export story as JSON
   */
  async exportStory(storyId) {
    return this.request(`/api/v1/stories/${storyId}/export`);
  }

  /**
   * Import story from JSON
   */
  async importStory(storyJson, options = {}) {
    return this.request('/api/v1/stories/import', {
      method: 'POST',
      body: JSON.stringify({
        data: storyJson,
        team_id: options.teamId || this.teamId,
        folder_id: options.folderId,
        new_name: options.newName,
      }),
    });
  }

  // ============================================
  // ACTIONS (AGENTS)
  // ============================================

  /**
   * List agents in story
   */
  async listAgents(storyId) {
    const result = await this.request(`/api/v1/stories/${storyId}/agents`);
    return result.agents;
  }

  /**
   * Get agent by ID
   */
  async getAgent(agentId) {
    return this.request(`/api/v1/agents/${agentId}`);
  }

  /**
   * Create agent
   */
  async createAgent(storyId, agentConfig) {
    return this.request('/api/v1/agents', {
      method: 'POST',
      body: JSON.stringify({
        story_id: storyId,
        name: agentConfig.name,
        type: agentConfig.type,
        options: agentConfig.options || {},
        position: agentConfig.position,
        keep_events_for: agentConfig.keepEventsFor || 604800,
      }),
    });
  }

  /**
   * Update agent
   */
  async updateAgent(agentId, updates) {
    return this.request(`/api/v1/agents/${agentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete agent
   */
  async deleteAgent(agentId) {
    return this.request(`/api/v1/agents/${agentId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Connect agents (create link)
   */
  async connectAgents(sourceAgentId, receiverAgentId) {
    return this.request('/api/v1/links', {
      method: 'POST',
      body: JSON.stringify({
        source_id: sourceAgentId,
        receiver_id: receiverAgentId,
      }),
    });
  }

  // ============================================
  // TRIGGERING & EXECUTION
  // ============================================

  /**
   * Trigger story via webhook
   */
  async triggerWebhook(webhookUrl, payload) {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = new Error(`Webhook trigger failed: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    this.emit('webhook:triggered', { url: webhookUrl });
    return response.json();
  }

  /**
   * Send event to story
   */
  async sendToStory(storyId, event, options = {}) {
    const story = await this.getStory(storyId);
    
    // Find the receive agent or webhook
    const agents = await this.listAgents(storyId);
    const entryPoint = agents.find(a => 
      a.type === ActionType.RECEIVE || a.type === ActionType.WEBHOOK
    );

    if (!entryPoint) {
      throw new Error('Story has no entry point (Receive or Webhook agent)');
    }

    if (entryPoint.type === ActionType.WEBHOOK && entryPoint.options?.path) {
      const webhookUrl = `${this.baseUrl}/webhook/${entryPoint.options.path}`;
      return this.triggerWebhook(webhookUrl, event);
    }

    // Use send to story endpoint
    return this.request(`/api/v1/stories/${storyId}/send`, {
      method: 'POST',
      body: JSON.stringify({
        event,
        entry_agent_id: options.entryAgentId || entryPoint.id,
      }),
    });
  }

  /**
   * Manually run an agent
   */
  async runAgent(agentId, event = {}) {
    return this.request(`/api/v1/agents/${agentId}/run`, {
      method: 'POST',
      body: JSON.stringify({ event }),
    });
  }

  /**
   * Get agent runs (events)
   */
  async getAgentEvents(agentId, options = {}) {
    const params = new URLSearchParams();
    if (options.page) params.set('page', options.page);
    if (options.perPage) params.set('per_page', options.perPage || 50);
    if (options.status) params.set('status', options.status);

    return this.request(`/api/v1/agents/${agentId}/events?${params}`);
  }

  /**
   * Get single event
   */
  async getEvent(eventId) {
    return this.request(`/api/v1/events/${eventId}`);
  }

  /**
   * Retry failed event
   */
  async retryEvent(eventId) {
    return this.request(`/api/v1/events/${eventId}/retry`, {
      method: 'POST',
    });
  }

  // ============================================
  // SECURITY PLAYBOOK TEMPLATES
  // ============================================

  /**
   * Create host isolation playbook
   */
  async createIsolationPlaybook(name, edrConnector) {
    const story = await this.createStory(name, {
      description: 'Isolate compromised host from network',
    });

    // Create receive agent
    const receive = await this.createAgent(story.id, {
      name: 'Receive Alert',
      type: ActionType.RECEIVE,
      options: { secret: this.generateSecret() },
    });

    // Create isolation action
    const isolate = await this.createAgent(story.id, {
      name: 'Isolate Host',
      type: ActionType.HTTP_REQUEST,
      options: {
        url: `{{.EDR_API_URL}}/threats/{{.receive_alert.host_id}}/isolate`,
        method: 'POST',
        headers: { Authorization: 'Bearer {{.CREDENTIAL.edr_token}}' },
        content_type: 'json',
      },
    });

    // Create notification
    const notify = await this.createAgent(story.id, {
      name: 'Notify Security Team',
      type: ActionType.SEND_EMAIL,
      options: {
        recipients: '{{.RESOURCE.security_email}}',
        subject: 'Host Isolated: {{.receive_alert.hostname}}',
        body: 'Host {{.receive_alert.hostname}} has been isolated due to: {{.receive_alert.reason}}',
      },
    });

    // Connect agents
    await this.connectAgents(receive.id, isolate.id);
    await this.connectAgents(isolate.id, notify.id);

    return story;
  }

  /**
   * Create IOC blocking playbook
   */
  async createBlockIOCPlaybook(name) {
    const story = await this.createStory(name, {
      description: 'Block malicious IOC across security stack',
    });

    const receive = await this.createAgent(story.id, {
      name: 'Receive IOC',
      type: ActionType.RECEIVE,
    });

    // Parallel blocking actions
    const blockWaf = await this.createAgent(story.id, {
      name: 'Block in WAF',
      type: ActionType.HTTP_REQUEST,
      options: {
        url: '{{.WAF_API_URL}}/firewall/rules',
        method: 'POST',
        content_type: 'json',
        payload: {
          action: 'block',
          mode: 'on',
          filter: { expression: '(ip.src eq {{.receive_ioc.value}})' },
        },
      },
    });

    const blockEdr = await this.createAgent(story.id, {
      name: 'Block in EDR',
      type: ActionType.HTTP_REQUEST,
      options: {
        url: '{{.EDR_API_URL}}/threat-intelligence/iocs',
        method: 'POST',
        content_type: 'json',
        payload: {
          type: '{{.receive_ioc.type}}',
          value: '{{.receive_ioc.value}}',
          action: 'block',
        },
      },
    });

    const recordAction = await this.createAgent(story.id, {
      name: 'Record Action',
      type: ActionType.RECORD,
      options: {
        table_name: 'blocked_iocs',
        record: {
          type: '{{.receive_ioc.type}}',
          value: '{{.receive_ioc.value}}',
          blocked_at: '{{.now}}',
          source: '{{.receive_ioc.source}}',
        },
      },
    });

    await this.connectAgents(receive.id, blockWaf.id);
    await this.connectAgents(receive.id, blockEdr.id);
    await this.connectAgents(blockWaf.id, recordAction.id);
    await this.connectAgents(blockEdr.id, recordAction.id);

    return story;
  }

  /**
   * Create incident response playbook
   */
  async createIncidentResponsePlaybook(name) {
    const story = await this.createStory(name, {
      description: 'Automated incident response workflow',
    });

    // Entry point
    const receive = await this.createAgent(story.id, {
      name: 'Receive Incident',
      type: ActionType.RECEIVE,
    });

    // Enrich with threat intel
    const enrich = await this.createAgent(story.id, {
      name: 'Enrich IOCs',
      type: ActionType.HTTP_REQUEST,
      options: {
        url: '{{.THREATINTEL_API_URL}}/enrich',
        method: 'POST',
        content_type: 'json',
        payload: { indicators: '{{.receive_incident.iocs}}' },
      },
    });

    // Determine severity
    const classify = await this.createAgent(story.id, {
      name: 'Classify Severity',
      type: ActionType.EVENT_TRANSFORM,
      options: {
        mode: 'message_only',
        payload: `{
          "severity": "{% if enrich_iocs.body.high_confidence %}critical{% elsif enrich_iocs.body.medium_confidence %}high{% else %}medium{% endif %}",
          "auto_remediate": {% if enrich_iocs.body.high_confidence %}true{% else %}false{% endif %}
        }`,
      },
    });

    // Create ticket
    const ticket = await this.createAgent(story.id, {
      name: 'Create Ticket',
      type: ActionType.HTTP_REQUEST,
      options: {
        url: '{{.TICKETING_API_URL}}/issues',
        method: 'POST',
        content_type: 'json',
        payload: {
          title: 'Security Incident: {{.receive_incident.title}}',
          description: '{{.receive_incident.description}}',
          priority: '{{.classify_severity.severity}}',
          labels: ['security', 'incident'],
        },
      },
    });

    // Alert on-call
    const page = await this.createAgent(story.id, {
      name: 'Page On-Call',
      type: ActionType.HTTP_REQUEST,
      options: {
        url: '{{.ALERTING_API_URL}}/incidents',
        method: 'POST',
        content_type: 'json',
        payload: {
          title: 'Security Incident: {{.receive_incident.title}}',
          severity: '{{.classify_severity.severity}}',
          message: 'Auto-remediation: {{.classify_severity.auto_remediate}}',
        },
      },
    });

    await this.connectAgents(receive.id, enrich.id);
    await this.connectAgents(enrich.id, classify.id);
    await this.connectAgents(classify.id, ticket.id);
    await this.connectAgents(classify.id, page.id);

    return story;
  }

  /**
   * Generate webhook secret
   */
  generateSecret() {
    return require('crypto').randomBytes(32).toString('hex');
  }

  // ============================================
  // CREDENTIALS & RESOURCES
  // ============================================

  /**
   * List credentials
   */
  async listCredentials(options = {}) {
    const params = new URLSearchParams();
    if (options.teamId) params.set('team_id', options.teamId || this.teamId);

    return this.request(`/api/v1/credentials?${params}`);
  }

  /**
   * Create credential
   */
  async createCredential(name, type, value, options = {}) {
    return this.request('/api/v1/credentials', {
      method: 'POST',
      body: JSON.stringify({
        name,
        mode: type, // 'TEXT', 'API_KEY', etc.
        value,
        team_id: options.teamId || this.teamId,
      }),
    });
  }

  /**
   * List resources
   */
  async listResources(options = {}) {
    const params = new URLSearchParams();
    if (options.teamId) params.set('team_id', options.teamId || this.teamId);

    return this.request(`/api/v1/resources?${params}`);
  }

  /**
   * Create resource
   */
  async createResource(name, value, options = {}) {
    return this.request('/api/v1/resources', {
      method: 'POST',
      body: JSON.stringify({
        name,
        value,
        team_id: options.teamId || this.teamId,
      }),
    });
  }

  /**
   * Check health
   */
  async checkHealth() {
    try {
      const result = await this.request('/api/v1/teams');
      
      return {
        isHealthy: true,
        message: 'Connected',
        teamsCount: result.teams?.length || 0,
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
    this.storiesCache.clear();
    this.log('info', 'Disconnected from Tines');
  }
}

module.exports = {
  TinesConnector,
  ActionType,
  RunState,
};
