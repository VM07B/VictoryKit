/**
 * Incident Manager
 * 
 * Full incident lifecycle management:
 * - Incident creation and classification
 * - Timeline tracking
 * - Stakeholder management
 * - Runbook integration
 * - Post-incident review
 * - Metrics and SLAs
 */

const { EventEmitter } = require('events');

/**
 * Incident severity levels
 */
const IncidentSeverity = {
  SEV1: 'sev1', // Critical - Business impacting
  SEV2: 'sev2', // High - Major feature impaired
  SEV3: 'sev3', // Medium - Minor feature impaired
  SEV4: 'sev4', // Low - Minimal impact
  SEV5: 'sev5', // Informational
};

/**
 * Incident status
 */
const IncidentStatus = {
  DETECTED: 'detected',
  TRIAGING: 'triaging',
  INVESTIGATING: 'investigating',
  IDENTIFIED: 'identified',
  MITIGATING: 'mitigating',
  MONITORING: 'monitoring',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

/**
 * Incident types
 */
const IncidentType = {
  SECURITY: 'security',
  AVAILABILITY: 'availability',
  PERFORMANCE: 'performance',
  DATA_BREACH: 'data_breach',
  MALWARE: 'malware',
  PHISHING: 'phishing',
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  DOS_DDOS: 'dos_ddos',
  INSIDER_THREAT: 'insider_threat',
  COMPLIANCE: 'compliance',
  OTHER: 'other',
};

/**
 * Timeline event types
 */
const TimelineEventType = {
  CREATED: 'created',
  STATUS_CHANGE: 'status_change',
  SEVERITY_CHANGE: 'severity_change',
  ASSIGNEE_CHANGE: 'assignee_change',
  COMMENT: 'comment',
  EVIDENCE_ADDED: 'evidence_added',
  ACTION_TAKEN: 'action_taken',
  STAKEHOLDER_NOTIFIED: 'stakeholder_notified',
  RUNBOOK_EXECUTED: 'runbook_executed',
  ESCALATION: 'escalation',
  RESOLUTION: 'resolution',
  POSTMORTEM_STARTED: 'postmortem_started',
  POSTMORTEM_COMPLETED: 'postmortem_completed',
};

/**
 * SLA definitions
 */
const DefaultSLAs = {
  [IncidentSeverity.SEV1]: {
    acknowledgeWithin: 5 * 60 * 1000,     // 5 minutes
    respondWithin: 15 * 60 * 1000,        // 15 minutes
    updateInterval: 30 * 60 * 1000,       // 30 minutes
    resolveWithin: 4 * 60 * 60 * 1000,    // 4 hours
  },
  [IncidentSeverity.SEV2]: {
    acknowledgeWithin: 15 * 60 * 1000,    // 15 minutes
    respondWithin: 30 * 60 * 1000,        // 30 minutes
    updateInterval: 60 * 60 * 1000,       // 1 hour
    resolveWithin: 8 * 60 * 60 * 1000,    // 8 hours
  },
  [IncidentSeverity.SEV3]: {
    acknowledgeWithin: 60 * 60 * 1000,    // 1 hour
    respondWithin: 4 * 60 * 60 * 1000,    // 4 hours
    updateInterval: 4 * 60 * 60 * 1000,   // 4 hours
    resolveWithin: 24 * 60 * 60 * 1000,   // 24 hours
  },
  [IncidentSeverity.SEV4]: {
    acknowledgeWithin: 4 * 60 * 60 * 1000,   // 4 hours
    respondWithin: 8 * 60 * 60 * 1000,       // 8 hours
    updateInterval: 24 * 60 * 60 * 1000,     // 24 hours
    resolveWithin: 72 * 60 * 60 * 1000,      // 72 hours
  },
  [IncidentSeverity.SEV5]: {
    acknowledgeWithin: 24 * 60 * 60 * 1000,  // 24 hours
    respondWithin: 48 * 60 * 60 * 1000,      // 48 hours
    updateInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
    resolveWithin: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
};

/**
 * Incident
 */
class Incident {
  constructor(config) {
    this.id = config.id || `INC-${Date.now().toString(36).toUpperCase()}`;
    this.title = config.title;
    this.description = config.description;
    this.severity = config.severity || IncidentSeverity.SEV3;
    this.type = config.type || IncidentType.SECURITY;
    this.status = IncidentStatus.DETECTED;
    this.priority = config.priority || this.calculatePriority();
    
    // People
    this.commander = config.commander || null;
    this.assignees = config.assignees || [];
    this.stakeholders = config.stakeholders || [];
    this.createdBy = config.createdBy;
    
    // Related items
    this.alerts = config.alerts || [];
    this.affectedSystems = config.affectedSystems || [];
    this.affectedServices = config.affectedServices || [];
    this.relatedIncidents = config.relatedIncidents || [];
    
    // Evidence and artifacts
    this.evidence = [];
    this.artifacts = [];
    this.iocs = [];
    
    // Timeline
    this.timeline = [];
    
    // Runbooks
    this.runbooks = [];
    this.runbookProgress = {};
    
    // Timestamps
    this.createdAt = new Date().toISOString();
    this.detectedAt = config.detectedAt || this.createdAt;
    this.acknowledgedAt = null;
    this.respondedAt = null;
    this.mitigatedAt = null;
    this.resolvedAt = null;
    this.closedAt = null;
    this.lastUpdated = this.createdAt;
    
    // SLA tracking
    this.sla = config.sla || DefaultSLAs[this.severity];
    this.slaBreaches = [];
    
    // Impact
    this.impact = config.impact || {
      financial: null,
      users: null,
      data: null,
      reputation: null,
    };
    
    // Resolution
    this.rootCause = null;
    this.resolution = null;
    this.lessonsLearned = [];
    
    // Postmortem
    this.postmortem = null;
    
    // Metadata
    this.tags = config.tags || [];
    this.customFields = config.customFields || {};
    
    // Add creation event
    this.addTimelineEvent(TimelineEventType.CREATED, 'Incident created', {
      createdBy: config.createdBy,
    });
  }

  /**
   * Calculate priority
   */
  calculatePriority() {
    const severityScore = {
      [IncidentSeverity.SEV1]: 100,
      [IncidentSeverity.SEV2]: 80,
      [IncidentSeverity.SEV3]: 60,
      [IncidentSeverity.SEV4]: 40,
      [IncidentSeverity.SEV5]: 20,
    };
    return severityScore[this.severity] || 50;
  }

  /**
   * Add timeline event
   */
  addTimelineEvent(type, message, data = {}, author = null) {
    const event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      message,
      data,
      author,
      timestamp: new Date().toISOString(),
    };
    
    this.timeline.push(event);
    this.lastUpdated = event.timestamp;
    
    return event;
  }

  /**
   * Update status
   */
  updateStatus(newStatus, author, comment = '') {
    const oldStatus = this.status;
    this.status = newStatus;
    
    // Update timestamps
    switch (newStatus) {
      case IncidentStatus.TRIAGING:
        if (!this.acknowledgedAt) {
          this.acknowledgedAt = new Date().toISOString();
        }
        break;
      case IncidentStatus.INVESTIGATING:
        if (!this.respondedAt) {
          this.respondedAt = new Date().toISOString();
        }
        break;
      case IncidentStatus.MONITORING:
        if (!this.mitigatedAt) {
          this.mitigatedAt = new Date().toISOString();
        }
        break;
      case IncidentStatus.RESOLVED:
        this.resolvedAt = new Date().toISOString();
        break;
      case IncidentStatus.CLOSED:
        this.closedAt = new Date().toISOString();
        break;
    }
    
    this.addTimelineEvent(TimelineEventType.STATUS_CHANGE, 
      `Status changed from ${oldStatus} to ${newStatus}`, 
      { oldStatus, newStatus, comment },
      author
    );
    
    return this;
  }

  /**
   * Update severity
   */
  updateSeverity(newSeverity, author, reason = '') {
    const oldSeverity = this.severity;
    this.severity = newSeverity;
    this.sla = DefaultSLAs[newSeverity];
    this.priority = this.calculatePriority();
    
    this.addTimelineEvent(TimelineEventType.SEVERITY_CHANGE,
      `Severity changed from ${oldSeverity} to ${newSeverity}`,
      { oldSeverity, newSeverity, reason },
      author
    );
    
    return this;
  }

  /**
   * Assign incident
   */
  assign(assignee, author) {
    if (!this.assignees.includes(assignee)) {
      this.assignees.push(assignee);
    }
    
    this.addTimelineEvent(TimelineEventType.ASSIGNEE_CHANGE,
      `${assignee} assigned to incident`,
      { assignee },
      author
    );
    
    return this;
  }

  /**
   * Set incident commander
   */
  setCommander(commander, author) {
    this.commander = commander;
    
    this.addTimelineEvent(TimelineEventType.ASSIGNEE_CHANGE,
      `${commander} designated as incident commander`,
      { commander },
      author
    );
    
    return this;
  }

  /**
   * Add comment
   */
  addComment(message, author, isInternal = false) {
    this.addTimelineEvent(TimelineEventType.COMMENT,
      message,
      { isInternal },
      author
    );
    
    return this;
  }

  /**
   * Add evidence
   */
  addEvidence(evidence, author) {
    const item = {
      id: `evi_${Date.now()}`,
      ...evidence,
      addedBy: author,
      addedAt: new Date().toISOString(),
    };
    
    this.evidence.push(item);
    
    this.addTimelineEvent(TimelineEventType.EVIDENCE_ADDED,
      `Evidence added: ${evidence.name || evidence.type}`,
      { evidenceId: item.id },
      author
    );
    
    return item;
  }

  /**
   * Add IOC
   */
  addIOC(ioc) {
    this.iocs.push({
      ...ioc,
      addedAt: new Date().toISOString(),
    });
    return this;
  }

  /**
   * Record action
   */
  recordAction(action, author, result = null) {
    this.addTimelineEvent(TimelineEventType.ACTION_TAKEN,
      action,
      { result },
      author
    );
    
    return this;
  }

  /**
   * Escalate
   */
  escalate(reason, author, escalateTo = []) {
    this.addTimelineEvent(TimelineEventType.ESCALATION,
      `Incident escalated: ${reason}`,
      { reason, escalateTo },
      author
    );
    
    // Add escalation targets as stakeholders
    for (const target of escalateTo) {
      if (!this.stakeholders.includes(target)) {
        this.stakeholders.push(target);
      }
    }
    
    return this;
  }

  /**
   * Resolve incident
   */
  resolve(resolution, rootCause, author) {
    this.resolution = resolution;
    this.rootCause = rootCause;
    this.resolvedAt = new Date().toISOString();
    this.status = IncidentStatus.RESOLVED;
    
    this.addTimelineEvent(TimelineEventType.RESOLUTION,
      'Incident resolved',
      { resolution, rootCause },
      author
    );
    
    return this;
  }

  /**
   * Start postmortem
   */
  startPostmortem(author) {
    this.postmortem = {
      id: `pm_${this.id}`,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      startedBy: author,
      completedAt: null,
      content: null,
      actionItems: [],
    };
    
    this.addTimelineEvent(TimelineEventType.POSTMORTEM_STARTED,
      'Postmortem started',
      {},
      author
    );
    
    return this.postmortem;
  }

  /**
   * Complete postmortem
   */
  completePostmortem(content, actionItems, author) {
    if (!this.postmortem) {
      this.startPostmortem(author);
    }
    
    this.postmortem.status = 'completed';
    this.postmortem.completedAt = new Date().toISOString();
    this.postmortem.content = content;
    this.postmortem.actionItems = actionItems;
    this.lessonsLearned = content.lessonsLearned || [];
    
    this.addTimelineEvent(TimelineEventType.POSTMORTEM_COMPLETED,
      'Postmortem completed',
      { actionItemCount: actionItems.length },
      author
    );
    
    return this.postmortem;
  }

  /**
   * Check SLA status
   */
  checkSLA() {
    const now = Date.now();
    const created = new Date(this.createdAt).getTime();
    const breaches = [];
    
    // Check acknowledge SLA
    if (!this.acknowledgedAt && (now - created) > this.sla.acknowledgeWithin) {
      breaches.push({
        type: 'acknowledge',
        breachedAt: new Date(created + this.sla.acknowledgeWithin).toISOString(),
        duration: now - created - this.sla.acknowledgeWithin,
      });
    }
    
    // Check respond SLA
    if (!this.respondedAt && (now - created) > this.sla.respondWithin) {
      breaches.push({
        type: 'respond',
        breachedAt: new Date(created + this.sla.respondWithin).toISOString(),
        duration: now - created - this.sla.respondWithin,
      });
    }
    
    // Check resolve SLA
    if (!this.resolvedAt && (now - created) > this.sla.resolveWithin) {
      breaches.push({
        type: 'resolve',
        breachedAt: new Date(created + this.sla.resolveWithin).toISOString(),
        duration: now - created - this.sla.resolveWithin,
      });
    }
    
    this.slaBreaches = breaches;
    return breaches;
  }

  /**
   * Get metrics
   */
  getMetrics() {
    const now = Date.now();
    const created = new Date(this.createdAt).getTime();
    const resolved = this.resolvedAt ? new Date(this.resolvedAt).getTime() : null;
    
    return {
      timeToAcknowledge: this.acknowledgedAt 
        ? new Date(this.acknowledgedAt).getTime() - created
        : null,
      timeToRespond: this.respondedAt
        ? new Date(this.respondedAt).getTime() - created
        : null,
      timeToMitigate: this.mitigatedAt
        ? new Date(this.mitigatedAt).getTime() - created
        : null,
      timeToResolve: resolved
        ? resolved - created
        : null,
      totalDuration: resolved
        ? resolved - created
        : now - created,
      timelineEvents: this.timeline.length,
      evidenceCount: this.evidence.length,
      iocCount: this.iocs.length,
      slaBreaches: this.slaBreaches.length,
    };
  }

  /**
   * Get summary
   */
  getSummary() {
    return {
      id: this.id,
      title: this.title,
      severity: this.severity,
      type: this.type,
      status: this.status,
      priority: this.priority,
      commander: this.commander,
      assignees: this.assignees,
      createdAt: this.createdAt,
      resolvedAt: this.resolvedAt,
      affectedSystems: this.affectedSystems,
      metrics: this.getMetrics(),
      slaBreaches: this.slaBreaches,
    };
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      ...this,
      metrics: this.getMetrics(),
    };
  }
}

/**
 * Incident Manager
 */
class IncidentManager extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = config;
    this.incidents = new Map();
    this.templates = new Map();
    this.runbooks = new Map();
    
    // Notification handlers
    this.notificationHandlers = [];
    
    // SLA check interval
    this.slaCheckInterval = setInterval(
      () => this.checkAllSLAs(),
      config.slaCheckInterval || 60000 // 1 minute
    );
    
    // Load default runbooks
    this.loadDefaultRunbooks();
  }

  /**
   * Load default security runbooks
   */
  loadDefaultRunbooks() {
    this.runbooks.set('malware-response', {
      id: 'malware-response',
      name: 'Malware Response',
      steps: [
        { id: 'isolate', name: 'Isolate affected systems', required: true },
        { id: 'contain', name: 'Contain the threat', required: true },
        { id: 'collect', name: 'Collect forensic evidence', required: true },
        { id: 'analyze', name: 'Analyze malware sample', required: false },
        { id: 'eradicate', name: 'Eradicate malware', required: true },
        { id: 'recover', name: 'Recover systems', required: true },
        { id: 'lessons', name: 'Document lessons learned', required: false },
      ],
    });

    this.runbooks.set('phishing-response', {
      id: 'phishing-response',
      name: 'Phishing Response',
      steps: [
        { id: 'identify', name: 'Identify affected users', required: true },
        { id: 'quarantine', name: 'Quarantine phishing emails', required: true },
        { id: 'reset', name: 'Reset compromised credentials', required: true },
        { id: 'block', name: 'Block sender/domain', required: true },
        { id: 'notify', name: 'Notify affected users', required: true },
        { id: 'awareness', name: 'Send awareness reminder', required: false },
      ],
    });

    this.runbooks.set('data-breach-response', {
      id: 'data-breach-response',
      name: 'Data Breach Response',
      steps: [
        { id: 'confirm', name: 'Confirm breach scope', required: true },
        { id: 'contain', name: 'Contain data exposure', required: true },
        { id: 'assess', name: 'Assess data affected', required: true },
        { id: 'legal', name: 'Engage legal/compliance', required: true },
        { id: 'notify', name: 'Prepare notification', required: true },
        { id: 'remediate', name: 'Remediate vulnerability', required: true },
        { id: 'report', name: 'File regulatory reports', required: false },
      ],
    });

    this.runbooks.set('ddos-response', {
      id: 'ddos-response',
      name: 'DDoS Response',
      steps: [
        { id: 'identify', name: 'Identify attack vector', required: true },
        { id: 'mitigate', name: 'Enable DDoS mitigation', required: true },
        { id: 'block', name: 'Block malicious IPs', required: true },
        { id: 'scale', name: 'Scale infrastructure if needed', required: false },
        { id: 'monitor', name: 'Monitor attack progression', required: true },
        { id: 'communicate', name: 'Communicate with stakeholders', required: true },
      ],
    });
  }

  /**
   * Create incident
   */
  create(config) {
    const incident = new Incident(config);
    this.incidents.set(incident.id, incident);
    
    this.emit('incident:created', incident);
    this.notifyStakeholders(incident, 'created');
    
    // Auto-assign runbook based on type
    const runbookMap = {
      [IncidentType.MALWARE]: 'malware-response',
      [IncidentType.PHISHING]: 'phishing-response',
      [IncidentType.DATA_BREACH]: 'data-breach-response',
      [IncidentType.DOS_DDOS]: 'ddos-response',
    };
    
    if (runbookMap[config.type]) {
      this.attachRunbook(incident.id, runbookMap[config.type]);
    }
    
    return incident;
  }

  /**
   * Create from alert
   */
  createFromAlert(alert, config = {}) {
    return this.create({
      title: config.title || `Incident from alert: ${alert.type}`,
      description: config.description || alert.description || '',
      severity: this.mapAlertSeverity(alert.severity),
      type: this.mapAlertType(alert.type),
      alerts: [alert._id || alert.id],
      affectedSystems: alert.data?.hostname ? [alert.data.hostname] : [],
      createdBy: 'system',
      ...config,
    });
  }

  /**
   * Map alert severity to incident severity
   */
  mapAlertSeverity(alertSeverity) {
    const mapping = {
      critical: IncidentSeverity.SEV1,
      high: IncidentSeverity.SEV2,
      medium: IncidentSeverity.SEV3,
      low: IncidentSeverity.SEV4,
      info: IncidentSeverity.SEV5,
    };
    return mapping[alertSeverity?.toLowerCase()] || IncidentSeverity.SEV3;
  }

  /**
   * Map alert type to incident type
   */
  mapAlertType(alertType) {
    if (!alertType) return IncidentType.SECURITY;
    
    const type = alertType.toLowerCase();
    if (type.includes('malware')) return IncidentType.MALWARE;
    if (type.includes('phish')) return IncidentType.PHISHING;
    if (type.includes('breach')) return IncidentType.DATA_BREACH;
    if (type.includes('ddos') || type.includes('dos')) return IncidentType.DOS_DDOS;
    if (type.includes('unauthorized')) return IncidentType.UNAUTHORIZED_ACCESS;
    if (type.includes('insider')) return IncidentType.INSIDER_THREAT;
    
    return IncidentType.SECURITY;
  }

  /**
   * Get incident
   */
  get(incidentId) {
    return this.incidents.get(incidentId);
  }

  /**
   * Update incident status
   */
  updateStatus(incidentId, status, author, comment = '') {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new Error('Incident not found');
    
    incident.updateStatus(status, author, comment);
    this.emit('incident:status_changed', { incident, status });
    this.notifyStakeholders(incident, 'status_changed');
    
    return incident;
  }

  /**
   * Update incident severity
   */
  updateSeverity(incidentId, severity, author, reason = '') {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new Error('Incident not found');
    
    incident.updateSeverity(severity, author, reason);
    this.emit('incident:severity_changed', { incident, severity });
    this.notifyStakeholders(incident, 'severity_changed');
    
    return incident;
  }

  /**
   * Assign incident
   */
  assign(incidentId, assignee, author) {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new Error('Incident not found');
    
    incident.assign(assignee, author);
    this.emit('incident:assigned', { incident, assignee });
    
    return incident;
  }

  /**
   * Set incident commander
   */
  setCommander(incidentId, commander, author) {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new Error('Incident not found');
    
    incident.setCommander(commander, author);
    this.emit('incident:commander_set', { incident, commander });
    
    return incident;
  }

  /**
   * Add comment
   */
  addComment(incidentId, message, author, isInternal = false) {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new Error('Incident not found');
    
    incident.addComment(message, author, isInternal);
    this.emit('incident:comment_added', { incident, message });
    
    return incident;
  }

  /**
   * Add evidence
   */
  addEvidence(incidentId, evidence, author) {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new Error('Incident not found');
    
    const item = incident.addEvidence(evidence, author);
    this.emit('incident:evidence_added', { incident, evidence: item });
    
    return item;
  }

  /**
   * Escalate incident
   */
  escalate(incidentId, reason, author, escalateTo = []) {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new Error('Incident not found');
    
    incident.escalate(reason, author, escalateTo);
    this.emit('incident:escalated', { incident, reason, escalateTo });
    this.notifyStakeholders(incident, 'escalated');
    
    return incident;
  }

  /**
   * Resolve incident
   */
  resolve(incidentId, resolution, rootCause, author) {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new Error('Incident not found');
    
    incident.resolve(resolution, rootCause, author);
    this.emit('incident:resolved', { incident });
    this.notifyStakeholders(incident, 'resolved');
    
    return incident;
  }

  /**
   * Close incident
   */
  close(incidentId, author) {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new Error('Incident not found');
    
    incident.updateStatus(IncidentStatus.CLOSED, author);
    this.emit('incident:closed', { incident });
    
    return incident;
  }

  /**
   * Attach runbook
   */
  attachRunbook(incidentId, runbookId) {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new Error('Incident not found');
    
    const runbook = this.runbooks.get(runbookId);
    if (!runbook) throw new Error('Runbook not found');
    
    incident.runbooks.push(runbookId);
    incident.runbookProgress[runbookId] = {
      startedAt: new Date().toISOString(),
      completedSteps: [],
      status: 'in_progress',
    };
    
    incident.addTimelineEvent(TimelineEventType.RUNBOOK_EXECUTED,
      `Runbook attached: ${runbook.name}`,
      { runbookId }
    );
    
    return incident;
  }

  /**
   * Update runbook progress
   */
  updateRunbookProgress(incidentId, runbookId, stepId, completed, author) {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new Error('Incident not found');
    
    const progress = incident.runbookProgress[runbookId];
    if (!progress) throw new Error('Runbook not attached');
    
    if (completed && !progress.completedSteps.includes(stepId)) {
      progress.completedSteps.push(stepId);
    }
    
    // Check if runbook is complete
    const runbook = this.runbooks.get(runbookId);
    const requiredSteps = runbook.steps.filter(s => s.required).map(s => s.id);
    const allRequired = requiredSteps.every(s => progress.completedSteps.includes(s));
    
    if (allRequired) {
      progress.status = 'completed';
      progress.completedAt = new Date().toISOString();
    }
    
    incident.recordAction(`Runbook step completed: ${stepId}`, author);
    
    return incident;
  }

  /**
   * List incidents
   */
  list(options = {}) {
    let incidents = Array.from(this.incidents.values());
    
    // Filter by status
    if (options.status) {
      const statuses = Array.isArray(options.status) ? options.status : [options.status];
      incidents = incidents.filter(i => statuses.includes(i.status));
    }
    
    // Filter by severity
    if (options.severity) {
      const severities = Array.isArray(options.severity) ? options.severity : [options.severity];
      incidents = incidents.filter(i => severities.includes(i.severity));
    }
    
    // Filter by type
    if (options.type) {
      incidents = incidents.filter(i => i.type === options.type);
    }
    
    // Filter by assignee
    if (options.assignee) {
      incidents = incidents.filter(i => i.assignees.includes(options.assignee));
    }
    
    // Filter open only
    if (options.openOnly) {
      incidents = incidents.filter(i => 
        ![IncidentStatus.RESOLVED, IncidentStatus.CLOSED].includes(i.status)
      );
    }
    
    // Sort
    const sortField = options.sortBy || 'priority';
    const sortOrder = options.sortOrder || 'desc';
    incidents.sort((a, b) => {
      const valA = a[sortField] || 0;
      const valB = b[sortField] || 0;
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
    
    // Paginate
    if (options.limit) {
      const offset = options.offset || 0;
      incidents = incidents.slice(offset, offset + options.limit);
    }
    
    return options.summary 
      ? incidents.map(i => i.getSummary())
      : incidents;
  }

  /**
   * Get active incidents
   */
  getActive() {
    return this.list({ openOnly: true, summary: true });
  }

  /**
   * Check all SLAs
   */
  checkAllSLAs() {
    const breaches = [];
    
    for (const incident of this.incidents.values()) {
      if ([IncidentStatus.RESOLVED, IncidentStatus.CLOSED].includes(incident.status)) {
        continue;
      }
      
      const slaBreaches = incident.checkSLA();
      if (slaBreaches.length > 0) {
        breaches.push({ incident, breaches: slaBreaches });
        this.emit('sla:breach', { incident, breaches: slaBreaches });
      }
    }
    
    return breaches;
  }

  /**
   * Register notification handler
   */
  registerNotificationHandler(handler) {
    this.notificationHandlers.push(handler);
  }

  /**
   * Notify stakeholders
   */
  async notifyStakeholders(incident, eventType) {
    for (const handler of this.notificationHandlers) {
      try {
        await handler(incident, eventType);
      } catch (error) {
        this.emit('notification:error', { incident, error });
      }
    }
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const incidents = Array.from(this.incidents.values());
    
    const byStatus = {};
    const bySeverity = {};
    const byType = {};
    
    let totalTTR = 0;
    let resolvedCount = 0;
    
    for (const incident of incidents) {
      byStatus[incident.status] = (byStatus[incident.status] || 0) + 1;
      bySeverity[incident.severity] = (bySeverity[incident.severity] || 0) + 1;
      byType[incident.type] = (byType[incident.type] || 0) + 1;
      
      if (incident.resolvedAt) {
        const metrics = incident.getMetrics();
        totalTTR += metrics.timeToResolve;
        resolvedCount++;
      }
    }
    
    return {
      total: incidents.length,
      open: incidents.filter(i => 
        ![IncidentStatus.RESOLVED, IncidentStatus.CLOSED].includes(i.status)
      ).length,
      byStatus,
      bySeverity,
      byType,
      mttr: resolvedCount > 0 ? totalTTR / resolvedCount : null,
      slaBreachCount: incidents.reduce((sum, i) => sum + i.slaBreaches.length, 0),
    };
  }

  /**
   * Stop incident manager
   */
  stop() {
    if (this.slaCheckInterval) {
      clearInterval(this.slaCheckInterval);
      this.slaCheckInterval = null;
    }
  }
}

module.exports = {
  IncidentManager,
  Incident,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
  TimelineEventType,
  DefaultSLAs,
};
