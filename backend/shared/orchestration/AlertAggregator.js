/**
 * Alert Aggregator
 * 
 * Intelligent alert management:
 * - Deduplication
 * - Correlation and grouping
 * - Priority scoring
 * - Alert fatigue reduction
 * - Smart routing
 */

const { EventEmitter } = require('events');

/**
 * Alert severity levels
 */
const AlertSeverity = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
  INFO: 4,
};

/**
 * Alert status
 */
const AlertStatus = {
  NEW: 'new',
  ACKNOWLEDGED: 'acknowledged',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  SUPPRESSED: 'suppressed',
  FALSE_POSITIVE: 'false_positive',
  ESCALATED: 'escalated',
};

/**
 * Deduplication strategies
 */
const DedupeStrategy = {
  EXACT: 'exact',           // Exact match
  SIMILARITY: 'similarity', // Fuzzy match
  CONTENT: 'content',       // Content-based
  TIME_WINDOW: 'time_window', // Within time window
};

/**
 * Alert fingerprinting
 */
class AlertFingerprinter {
  constructor(config = {}) {
    this.fields = config.fields || ['source', 'type', 'severity'];
    this.hashFields = config.hashFields || ['indicator', 'hash', 'signature'];
  }

  /**
   * Generate fingerprint for alert
   */
  fingerprint(alert) {
    const parts = [];
    
    // Add standard fields
    for (const field of this.fields) {
      const value = this.getNestedValue(alert, field);
      if (value !== undefined) {
        parts.push(`${field}:${value}`);
      }
    }

    // Add hash fields
    for (const field of this.hashFields) {
      const value = this.getNestedValue(alert, field) || this.getNestedValue(alert.data, field);
      if (value !== undefined) {
        parts.push(`${field}:${value}`);
      }
    }

    // Generate hash
    return this.hash(parts.join('|'));
  }

  /**
   * Get nested value from object
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((o, k) => o?.[k], obj);
  }

  /**
   * Simple hash function
   */
  hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Calculate similarity between two alerts
   */
  similarity(alert1, alert2) {
    const fp1 = this.fingerprint(alert1);
    const fp2 = this.fingerprint(alert2);
    
    if (fp1 === fp2) return 1.0;

    // Compare individual fields
    let matches = 0;
    let total = 0;

    for (const field of [...this.fields, ...this.hashFields]) {
      const val1 = this.getNestedValue(alert1, field) || this.getNestedValue(alert1.data, field);
      const val2 = this.getNestedValue(alert2, field) || this.getNestedValue(alert2.data, field);
      
      if (val1 !== undefined || val2 !== undefined) {
        total++;
        if (val1 === val2) matches++;
      }
    }

    return total > 0 ? matches / total : 0;
  }
}

/**
 * Alert priority scorer
 */
class AlertPriorityScorer {
  constructor(config = {}) {
    this.weights = {
      severity: config.severityWeight || 40,
      freshness: config.freshnessWeight || 15,
      assetValue: config.assetValueWeight || 20,
      threatIntel: config.threatIntelWeight || 15,
      frequency: config.frequencyWeight || 10,
    };
    
    this.assetValues = config.assetValues || new Map();
    this.threatIntelScores = config.threatIntelScores || new Map();
  }

  /**
   * Calculate priority score (0-100)
   */
  score(alert, context = {}) {
    let score = 0;

    // Severity component (0-40)
    const severityScore = this.scoreSeverity(alert.severity);
    score += severityScore * (this.weights.severity / 100);

    // Freshness component (0-15)
    const freshnessScore = this.scoreFreshness(alert.timestamp);
    score += freshnessScore * (this.weights.freshness / 100);

    // Asset value component (0-20)
    const assetScore = this.scoreAssetValue(alert);
    score += assetScore * (this.weights.assetValue / 100);

    // Threat intel component (0-15)
    const threatScore = this.scoreThreatIntel(alert);
    score += threatScore * (this.weights.threatIntel / 100);

    // Frequency component (0-10)
    const frequencyScore = this.scoreFrequency(alert, context.frequency || 1);
    score += frequencyScore * (this.weights.frequency / 100);

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Score severity
   */
  scoreSeverity(severity) {
    const severityNum = typeof severity === 'number' 
      ? severity 
      : AlertSeverity[severity?.toUpperCase()] ?? 2;
    
    // Invert: lower severity number = higher score
    return (4 - severityNum) * 25;
  }

  /**
   * Score freshness
   */
  scoreFreshness(timestamp) {
    if (!timestamp) return 50;
    
    const age = Date.now() - new Date(timestamp).getTime();
    const hourAge = age / (1000 * 60 * 60);
    
    // Newer = higher score
    if (hourAge < 1) return 100;
    if (hourAge < 4) return 80;
    if (hourAge < 12) return 60;
    if (hourAge < 24) return 40;
    if (hourAge < 72) return 20;
    return 10;
  }

  /**
   * Score asset value
   */
  scoreAssetValue(alert) {
    const assets = [
      alert.data?.hostname,
      alert.data?.host,
      alert.data?.ip,
      alert.data?.sourceIp,
      alert.data?.userId,
    ].filter(Boolean);

    let maxValue = 0;
    for (const asset of assets) {
      const value = this.assetValues.get(asset) || 50;
      maxValue = Math.max(maxValue, value);
    }

    return maxValue;
  }

  /**
   * Score threat intelligence
   */
  scoreThreatIntel(alert) {
    const indicators = [
      alert.data?.indicator,
      alert.data?.ioc,
      alert.data?.hash,
      alert.data?.domain,
      alert.data?.ip,
    ].filter(Boolean);

    let maxScore = 0;
    for (const indicator of indicators) {
      const score = this.threatIntelScores.get(indicator) || 0;
      maxScore = Math.max(maxScore, score);
    }

    return maxScore;
  }

  /**
   * Score frequency (alert fatigue consideration)
   */
  scoreFrequency(alert, frequency) {
    // Higher frequency = lower priority (alert fatigue)
    if (frequency > 100) return 10;
    if (frequency > 50) return 30;
    if (frequency > 20) return 50;
    if (frequency > 10) return 70;
    if (frequency > 5) return 80;
    return 100;
  }

  /**
   * Set asset value
   */
  setAssetValue(asset, value) {
    this.assetValues.set(asset, value);
  }

  /**
   * Set threat intel score
   */
  setThreatIntelScore(indicator, score) {
    this.threatIntelScores.set(indicator, score);
  }
}

/**
 * Alert group
 */
class AlertGroup {
  constructor(id, baseAlert) {
    this.id = id;
    this.fingerprint = baseAlert._fingerprint;
    this.alerts = [baseAlert];
    this.count = 1;
    this.firstSeen = baseAlert.timestamp || new Date().toISOString();
    this.lastSeen = this.firstSeen;
    this.severity = baseAlert.severity;
    this.status = AlertStatus.NEW;
    this.priority = baseAlert._priority || 50;
    this.assignee = null;
    this.notes = [];
    this.metadata = {};
  }

  /**
   * Add alert to group
   */
  addAlert(alert) {
    this.alerts.push(alert);
    this.count++;
    this.lastSeen = alert.timestamp || new Date().toISOString();
    
    // Update severity to most severe
    const currentSev = typeof this.severity === 'number' 
      ? this.severity 
      : AlertSeverity[this.severity?.toUpperCase()] ?? 2;
    const newSev = typeof alert.severity === 'number' 
      ? alert.severity 
      : AlertSeverity[alert.severity?.toUpperCase()] ?? 2;
    
    if (newSev < currentSev) {
      this.severity = alert.severity;
    }

    // Update priority
    if (alert._priority > this.priority) {
      this.priority = alert._priority;
    }
  }

  /**
   * Get representative alert
   */
  getRepresentative() {
    return this.alerts[0];
  }

  /**
   * Get summary
   */
  getSummary() {
    return {
      id: this.id,
      fingerprint: this.fingerprint,
      count: this.count,
      severity: this.severity,
      status: this.status,
      priority: this.priority,
      firstSeen: this.firstSeen,
      lastSeen: this.lastSeen,
      assignee: this.assignee,
      representative: this.getRepresentative(),
    };
  }
}

/**
 * Suppression rule
 */
class SuppressionRule {
  constructor(config) {
    this.id = config.id || `rule_${Date.now()}`;
    this.name = config.name;
    this.description = config.description;
    this.conditions = config.conditions || [];
    this.action = config.action || 'suppress';
    this.duration = config.duration; // ms, null = permanent
    this.createdAt = new Date().toISOString();
    this.expiresAt = config.duration 
      ? new Date(Date.now() + config.duration).toISOString()
      : null;
    this.enabled = config.enabled ?? true;
    this.matchCount = 0;
  }

  /**
   * Check if rule matches alert
   */
  matches(alert) {
    if (!this.enabled) return false;
    if (this.expiresAt && new Date(this.expiresAt) < new Date()) return false;

    for (const condition of this.conditions) {
      const value = this.getNestedValue(alert, condition.field) 
        || this.getNestedValue(alert.data, condition.field);

      switch (condition.operator) {
        case 'equals':
          if (value !== condition.value) return false;
          break;
        case 'contains':
          if (!String(value).includes(condition.value)) return false;
          break;
        case 'regex':
          if (!new RegExp(condition.value).test(value)) return false;
          break;
        case 'in':
          if (!condition.value.includes(value)) return false;
          break;
        case 'gt':
          if (value <= condition.value) return false;
          break;
        case 'lt':
          if (value >= condition.value) return false;
          break;
        default:
          return false;
      }
    }

    this.matchCount++;
    return true;
  }

  /**
   * Get nested value
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((o, k) => o?.[k], obj);
  }
}

/**
 * Alert Aggregator
 */
class AlertAggregator extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = config;
    this.fingerprinter = new AlertFingerprinter(config.fingerprinting);
    this.priorityScorer = new AlertPriorityScorer(config.priority);
    
    // Storage
    this.alerts = new Map();
    this.groups = new Map();
    this.suppressionRules = new Map();
    
    // Deduplication settings
    this.dedupeStrategy = config.dedupeStrategy || DedupeStrategy.EXACT;
    this.dedupeWindow = config.dedupeWindow || 3600000; // 1 hour
    this.similarityThreshold = config.similarityThreshold || 0.8;
    
    // Grouping settings
    this.groupingEnabled = config.groupingEnabled ?? true;
    this.maxGroupSize = config.maxGroupSize || 100;
    
    // Metrics
    this.metrics = {
      received: 0,
      deduplicated: 0,
      suppressed: 0,
      grouped: 0,
      escalated: 0,
    };

    // Frequency tracking
    this.frequencyTracker = new Map();
    this.frequencyWindow = config.frequencyWindow || 3600000; // 1 hour

    // Cleanup timer
    this.cleanupInterval = setInterval(() => this.cleanup(), 300000); // 5 minutes
  }

  /**
   * Process incoming alert
   */
  async process(alert) {
    this.metrics.received++;

    // Add metadata
    alert._id = alert._id || `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    alert._receivedAt = new Date().toISOString();

    // Generate fingerprint
    alert._fingerprint = this.fingerprinter.fingerprint(alert);

    // Track frequency
    this.trackFrequency(alert._fingerprint);

    // Check suppression rules
    if (this.checkSuppression(alert)) {
      alert._status = AlertStatus.SUPPRESSED;
      this.metrics.suppressed++;
      this.emit('alert:suppressed', alert);
      return { action: 'suppressed', alert };
    }

    // Check deduplication
    const duplicate = this.checkDuplicate(alert);
    if (duplicate) {
      this.metrics.deduplicated++;
      
      // Add to existing group
      const group = this.groups.get(duplicate._groupId);
      if (group) {
        group.addAlert(alert);
        alert._groupId = group.id;
        alert._isDuplicate = true;
      }

      this.emit('alert:deduplicated', { original: duplicate, duplicate: alert });
      return { action: 'deduplicated', alert, originalId: duplicate._id };
    }

    // Calculate priority
    const frequency = this.getFrequency(alert._fingerprint);
    alert._priority = this.priorityScorer.score(alert, { frequency });
    alert._status = AlertStatus.NEW;

    // Store alert
    this.alerts.set(alert._id, alert);

    // Create or find group
    if (this.groupingEnabled) {
      const group = this.findOrCreateGroup(alert);
      alert._groupId = group.id;
      this.metrics.grouped++;
    }

    // Emit processed event
    this.emit('alert:processed', alert);

    // Check for auto-escalation
    if (alert._priority >= 90) {
      this.escalate(alert._id, 'Auto-escalated due to high priority');
    }

    return { action: 'processed', alert };
  }

  /**
   * Check suppression rules
   */
  checkSuppression(alert) {
    for (const rule of this.suppressionRules.values()) {
      if (rule.matches(alert)) {
        alert._suppressionRule = rule.id;
        return true;
      }
    }
    return false;
  }

  /**
   * Check for duplicate
   */
  checkDuplicate(alert) {
    const windowStart = Date.now() - this.dedupeWindow;

    for (const existing of this.alerts.values()) {
      // Check time window
      const existingTime = new Date(existing.timestamp || existing._receivedAt).getTime();
      if (existingTime < windowStart) continue;

      switch (this.dedupeStrategy) {
        case DedupeStrategy.EXACT:
          if (existing._fingerprint === alert._fingerprint) {
            return existing;
          }
          break;

        case DedupeStrategy.SIMILARITY:
          const similarity = this.fingerprinter.similarity(existing, alert);
          if (similarity >= this.similarityThreshold) {
            return existing;
          }
          break;

        case DedupeStrategy.CONTENT:
          if (this.contentMatch(existing, alert)) {
            return existing;
          }
          break;

        case DedupeStrategy.TIME_WINDOW:
          if (existing._fingerprint === alert._fingerprint) {
            return existing;
          }
          break;
      }
    }

    return null;
  }

  /**
   * Content-based matching
   */
  contentMatch(alert1, alert2) {
    // Check key identifying fields
    const matchFields = ['type', 'source', 'data.indicator', 'data.hash', 'data.signature'];
    
    for (const field of matchFields) {
      const val1 = this.getNestedValue(alert1, field);
      const val2 = this.getNestedValue(alert2, field);
      
      if (val1 && val2 && val1 === val2) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get nested value
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((o, k) => o?.[k], obj);
  }

  /**
   * Find or create group
   */
  findOrCreateGroup(alert) {
    // Check for existing group with same fingerprint
    for (const group of this.groups.values()) {
      if (group.fingerprint === alert._fingerprint && group.count < this.maxGroupSize) {
        group.addAlert(alert);
        return group;
      }
    }

    // Create new group
    const groupId = `grp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const group = new AlertGroup(groupId, alert);
    this.groups.set(groupId, group);
    
    this.emit('group:created', group);
    return group;
  }

  /**
   * Track frequency
   */
  trackFrequency(fingerprint) {
    const now = Date.now();
    
    if (!this.frequencyTracker.has(fingerprint)) {
      this.frequencyTracker.set(fingerprint, []);
    }

    const timestamps = this.frequencyTracker.get(fingerprint);
    timestamps.push(now);

    // Cleanup old entries
    const windowStart = now - this.frequencyWindow;
    const filtered = timestamps.filter(t => t >= windowStart);
    this.frequencyTracker.set(fingerprint, filtered);
  }

  /**
   * Get frequency
   */
  getFrequency(fingerprint) {
    return this.frequencyTracker.get(fingerprint)?.length || 0;
  }

  /**
   * Add suppression rule
   */
  addSuppressionRule(config) {
    const rule = new SuppressionRule(config);
    this.suppressionRules.set(rule.id, rule);
    this.emit('rule:added', rule);
    return rule;
  }

  /**
   * Remove suppression rule
   */
  removeSuppressionRule(ruleId) {
    const rule = this.suppressionRules.get(ruleId);
    if (rule) {
      this.suppressionRules.delete(ruleId);
      this.emit('rule:removed', rule);
      return true;
    }
    return false;
  }

  /**
   * List suppression rules
   */
  listSuppressionRules() {
    return Array.from(this.suppressionRules.values());
  }

  /**
   * Acknowledge alert
   */
  acknowledge(alertId, acknowledger) {
    const alert = this.alerts.get(alertId);
    if (!alert) throw new Error('Alert not found');

    alert._status = AlertStatus.ACKNOWLEDGED;
    alert._acknowledgedBy = acknowledger;
    alert._acknowledgedAt = new Date().toISOString();

    // Update group status
    if (alert._groupId) {
      const group = this.groups.get(alert._groupId);
      if (group) group.status = AlertStatus.ACKNOWLEDGED;
    }

    this.emit('alert:acknowledged', alert);
    return alert;
  }

  /**
   * Resolve alert
   */
  resolve(alertId, resolution, resolver) {
    const alert = this.alerts.get(alertId);
    if (!alert) throw new Error('Alert not found');

    alert._status = AlertStatus.RESOLVED;
    alert._resolution = resolution;
    alert._resolvedBy = resolver;
    alert._resolvedAt = new Date().toISOString();

    // Update group status
    if (alert._groupId) {
      const group = this.groups.get(alert._groupId);
      if (group) group.status = AlertStatus.RESOLVED;
    }

    this.emit('alert:resolved', alert);
    return alert;
  }

  /**
   * Escalate alert
   */
  escalate(alertId, reason) {
    const alert = this.alerts.get(alertId);
    if (!alert) throw new Error('Alert not found');

    alert._status = AlertStatus.ESCALATED;
    alert._escalationReason = reason;
    alert._escalatedAt = new Date().toISOString();
    this.metrics.escalated++;

    // Update group status
    if (alert._groupId) {
      const group = this.groups.get(alert._groupId);
      if (group) group.status = AlertStatus.ESCALATED;
    }

    this.emit('alert:escalated', alert);
    return alert;
  }

  /**
   * Mark as false positive
   */
  markFalsePositive(alertId, reason) {
    const alert = this.alerts.get(alertId);
    if (!alert) throw new Error('Alert not found');

    alert._status = AlertStatus.FALSE_POSITIVE;
    alert._falsePositiveReason = reason;
    alert._markedAt = new Date().toISOString();

    this.emit('alert:false_positive', alert);
    return alert;
  }

  /**
   * Assign alert
   */
  assign(alertId, assignee) {
    const alert = this.alerts.get(alertId);
    if (!alert) throw new Error('Alert not found');

    alert._assignee = assignee;
    alert._assignedAt = new Date().toISOString();
    alert._status = AlertStatus.IN_PROGRESS;

    // Update group
    if (alert._groupId) {
      const group = this.groups.get(alert._groupId);
      if (group) {
        group.assignee = assignee;
        group.status = AlertStatus.IN_PROGRESS;
      }
    }

    this.emit('alert:assigned', { alert, assignee });
    return alert;
  }

  /**
   * Get alert
   */
  getAlert(alertId) {
    return this.alerts.get(alertId);
  }

  /**
   * Get group
   */
  getGroup(groupId) {
    return this.groups.get(groupId);
  }

  /**
   * List alerts
   */
  listAlerts(options = {}) {
    let alerts = Array.from(this.alerts.values());

    // Filter by status
    if (options.status) {
      alerts = alerts.filter(a => a._status === options.status);
    }

    // Filter by severity
    if (options.severity !== undefined) {
      alerts = alerts.filter(a => {
        const sev = typeof a.severity === 'number' 
          ? a.severity 
          : AlertSeverity[a.severity?.toUpperCase()] ?? 2;
        return sev <= options.severity;
      });
    }

    // Filter by priority
    if (options.minPriority !== undefined) {
      alerts = alerts.filter(a => a._priority >= options.minPriority);
    }

    // Filter by time range
    if (options.since) {
      alerts = alerts.filter(a => 
        new Date(a.timestamp || a._receivedAt) >= new Date(options.since)
      );
    }

    // Sort
    const sortField = options.sortBy || '_priority';
    const sortOrder = options.sortOrder || 'desc';
    alerts.sort((a, b) => {
      const valA = a[sortField] || 0;
      const valB = b[sortField] || 0;
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    // Paginate
    if (options.limit) {
      const offset = options.offset || 0;
      alerts = alerts.slice(offset, offset + options.limit);
    }

    return alerts;
  }

  /**
   * List groups
   */
  listGroups(options = {}) {
    let groups = Array.from(this.groups.values()).map(g => g.getSummary());

    // Filter by status
    if (options.status) {
      groups = groups.filter(g => g.status === options.status);
    }

    // Sort by priority
    groups.sort((a, b) => b.priority - a.priority);

    // Limit
    if (options.limit) {
      groups = groups.slice(0, options.limit);
    }

    return groups;
  }

  /**
   * Get top alerts
   */
  getTopAlerts(limit = 10) {
    return this.listAlerts({
      status: AlertStatus.NEW,
      sortBy: '_priority',
      sortOrder: 'desc',
      limit,
    });
  }

  /**
   * Cleanup old data
   */
  cleanup() {
    const now = Date.now();
    const retentionPeriod = this.config.retentionPeriod || 7 * 24 * 60 * 60 * 1000; // 7 days
    const cutoff = now - retentionPeriod;

    // Cleanup alerts
    for (const [id, alert] of this.alerts) {
      const alertTime = new Date(alert.timestamp || alert._receivedAt).getTime();
      if (alertTime < cutoff && alert._status === AlertStatus.RESOLVED) {
        this.alerts.delete(id);
      }
    }

    // Cleanup empty groups
    for (const [id, group] of this.groups) {
      if (group.count === 0 || group.status === AlertStatus.RESOLVED) {
        const groupTime = new Date(group.lastSeen).getTime();
        if (groupTime < cutoff) {
          this.groups.delete(id);
        }
      }
    }

    // Cleanup frequency tracker
    const freqCutoff = now - this.frequencyWindow;
    for (const [fp, timestamps] of this.frequencyTracker) {
      const filtered = timestamps.filter(t => t >= freqCutoff);
      if (filtered.length === 0) {
        this.frequencyTracker.delete(fp);
      } else {
        this.frequencyTracker.set(fp, filtered);
      }
    }

    this.emit('cleanup:completed');
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const alerts = Array.from(this.alerts.values());
    const groups = Array.from(this.groups.values());

    const byStatus = {};
    const bySeverity = {};
    
    for (const alert of alerts) {
      byStatus[alert._status] = (byStatus[alert._status] || 0) + 1;
      bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
    }

    return {
      ...this.metrics,
      totalAlerts: alerts.length,
      totalGroups: groups.length,
      openAlerts: alerts.filter(a => a._status === AlertStatus.NEW).length,
      byStatus,
      bySeverity,
      suppressionRules: this.suppressionRules.size,
      avgPriority: alerts.length > 0 
        ? alerts.reduce((sum, a) => sum + (a._priority || 0), 0) / alerts.length
        : 0,
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      received: 0,
      deduplicated: 0,
      suppressed: 0,
      grouped: 0,
      escalated: 0,
    };
  }

  /**
   * Stop aggregator
   */
  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

module.exports = {
  AlertAggregator,
  AlertFingerprinter,
  AlertPriorityScorer,
  AlertGroup,
  SuppressionRule,
  AlertSeverity,
  AlertStatus,
  DedupeStrategy,
};
