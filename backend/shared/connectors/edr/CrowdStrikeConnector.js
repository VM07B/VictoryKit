/**
 * CrowdStrike Falcon Connector
 *
 * EDR/XDR integration with:
 * - Real-time threat detection and response
 * - Host isolation and containment
 * - Process killing and quarantine
 * - IOC hunting and indicators
 * - Device management and visibility
 */

const { BaseConnector, ConnectorState } = require('../base/BaseConnector');
const { CircuitBreaker, RetryStrategy } = require('../base/Resilience');
const axios = require('axios');

/**
 * Falcon Severity Levels
 */
const SeverityLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Falcon Detection Status
 */
const DetectionStatus = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  TRUE_POSITIVE: 'true_positive',
  FALSE_POSITIVE: 'false_positive',
  IGNORED: 'ignored'
};

/**
 * Falcon Host Status
 */
const HostStatus = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  UNKNOWN: 'unknown'
};

/**
 * Falcon Containment Status
 */
const ContainmentStatus = {
  CONTAINED: 'contained',
  LIFTED: 'lifted',
  PENDING: 'pending'
};

class CrowdStrikeConnector extends BaseConnector {
  constructor(config) {
    super('CrowdStrike Falcon', config);

    this.baseUrl = config.baseUrl || 'https://api.crowdstrike.com';
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;

    this.accessToken = null;
    this.tokenExpiry = null;

    // Circuit breaker for API calls
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      recoveryTimeout: 60000,
      monitoringPeriod: 60000
    });

    // Retry strategy
    this.retryStrategy = new RetryStrategy({
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000
    });
  }

  /**
   * Authenticate with CrowdStrike
   */
  async authenticate() {
    try {
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const response = await axios.post(
        `${this.baseUrl}/oauth2/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 min buffer

      return this.accessToken;
    } catch (error) {
      this.emit('auth:failed', { error: error.message });
      throw new Error(`CrowdStrike authentication failed: ${error.message}`);
    }
  }

  /**
   * Get Device Details
   */
  async getDevice(deviceId) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.get(
          `${this.baseUrl}/devices/entities/devices/v1`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            params: {
              ids: deviceId
            }
          }
        );

        return response.data.resources[0];
      });
    });
  }

  /**
   * Query Devices
   */
  async queryDevices(filter = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const params = {};
        if (filter.hostname) params.hostname = filter.hostname;
        if (filter.platform_name) params.platform_name = filter.platform_name;
        if (filter.status) params.status = filter.status;
        if (filter.last_seen) params.last_seen = filter.last_seen;
        if (filter.limit) params.limit = Math.min(filter.limit, 5000);

        const response = await axios.get(
          `${this.baseUrl}/devices/queries/devices/v1`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            params
          }
        );

        return response.data.resources;
      });
    });
  }

  /**
   * Get Device Details by IDs
   */
  async getDevicesByIds(deviceIds) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.post(
          `${this.baseUrl}/devices/entities/devices/v2`,
          {
            ids: deviceIds
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        return response.data.resources;
      });
    });
  }

  /**
   * Contain Host
   */
  async containHost(deviceId) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.post(
          `${this.baseUrl}/devices/entities/devices-actions/v2`,
          {
            action_name: 'contain',
            ids: [deviceId]
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        this.emit('host:contained', { deviceId });
        return response.data;
      });
    });
  }

  /**
   * Lift Host Containment
   */
  async liftContainment(deviceId) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.post(
          `${this.baseUrl}/devices/entities/devices-actions/v2`,
          {
            action_name: 'lift_containment',
            ids: [deviceId]
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        this.emit('containment:lifted', { deviceId });
        return response.data;
      });
    });
  }

  /**
   * Get Detections
   */
  async getDetections(filter = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const params = {};
        if (filter.status) params.status = filter.status;
        if (filter.severity) params.severity = filter.severity;
        if (filter.device_id) params.device_id = filter.device_id;
        if (filter.limit) params.limit = Math.min(filter.limit, 10000);

        const response = await axios.get(
          `${this.baseUrl}/detects/queries/detects/v1`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            params
          }
        );

        return response.data.resources;
      });
    });
  }

  /**
   * Get Detection Details
   */
  async getDetectionDetails(detectionIds) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.post(
          `${this.baseUrl}/detects/entities/summaries/GET/v1`,
          {
            ids: detectionIds
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        return response.data.resources;
      });
    });
  }

  /**
   * Update Detection Status
   */
  async updateDetectionStatus(detectionId, status, assignedTo = null) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const updateData = {
          ids: [detectionId],
          status
        };

        if (assignedTo) {
          updateData.assigned_to_uuid = assignedTo;
        }

        const response = await axios.patch(
          `${this.baseUrl}/detects/entities/detects/v2`,
          updateData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        this.emit('detection:updated', { detectionId, status, assignedTo });
        return response.data;
      });
    });
  }

  /**
   * Get IOCs (Indicators of Compromise)
   */
  async getIOCs(filter = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const params = {};
        if (filter.type) params.type = filter.type;
        if (filter.value) params.value = filter.value;
        if (filter.limit) params.limit = Math.min(filter.limit, 5000);

        const response = await axios.get(
          `${this.baseUrl}/indicators/queries/iocs/v1`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            params
          }
        );

        return response.data.resources;
      });
    });
  }

  /**
   * Create IOC
   */
  async createIOC(iocData) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.post(
          `${this.baseUrl}/indicators/entities/iocs/v1`,
          {
            type: iocData.type,
            value: iocData.value,
            action: iocData.action || 'detect',
            severity: iocData.severity || SeverityLevel.MEDIUM,
            platforms: iocData.platforms || ['windows', 'mac', 'linux'],
            description: iocData.description,
            tags: iocData.tags || [],
            applied_globally: iocData.appliedGlobally !== false
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        this.emit('ioc:created', { iocId: response.data.resources[0] });
        return response.data;
      });
    });
  }

  /**
   * Delete IOC
   */
  async deleteIOC(iocId) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.delete(
          `${this.baseUrl}/indicators/entities/iocs/v1`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            params: {
              ids: iocId
            }
          }
        );

        this.emit('ioc:deleted', { iocId });
        return response.data;
      });
    });
  }

  /**
   * Execute Command on Host (RTR)
   */
  async executeCommand(deviceId, command) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.post(
          `${this.baseUrl}/real-time-response/entities/command/v1`,
          {
            base_command: command.baseCommand,
            command_string: command.commandString,
            device_id: deviceId,
            persist_all: command.persistAll || false
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        this.emit('command:executed', { deviceId, commandId: response.data.resources[0] });
        return response.data;
      });
    });
  }

  /**
   * Get Command Status
   */
  async getCommandStatus(cloudRequestId) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.get(
          `${this.baseUrl}/real-time-response/entities/command/v1`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            params: {
              cloud_request_id: cloudRequestId
            }
          }
        );

        return response.data.resources[0];
      });
    });
  }

  /**
   * Get Process Details
   */
  async getProcesses(deviceId, filter = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const params = {
          device_id: deviceId
        };

        if (filter.limit) params.limit = Math.min(filter.limit, 100);

        const response = await axios.get(
          `${this.baseUrl}/spotlight/queries/processes/v1`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            params
          }
        );

        return response.data.resources;
      });
    });
  }

  /**
   * Kill Process
   */
  async killProcess(deviceId, processId) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.post(
          `${this.baseUrl}/real-time-response/entities/command/v1`,
          {
            base_command: 'kill',
            command_string: `kill ${processId}`,
            device_id: deviceId
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        this.emit('process:killed', { deviceId, processId });
        return response.data;
      });
    });
  }

  /**
   * Get Alerts
   */
  async getAlerts(filter = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const params = {};
        if (filter.status) params.status = filter.status;
        if (filter.severity) params.severity = filter.severity;
        if (filter.limit) params.limit = Math.min(filter.limit, 10000);

        const response = await axios.get(
          `${this.baseUrl}/alerts/queries/alerts/v1`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            params
          }
        );

        return response.data.resources;
      });
    });
  }

  /**
   * Update Alert
   */
  async updateAlert(alertId, updates) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.patch(
          `${this.baseUrl}/alerts/entities/alerts/v2`,
          {
            composite_ids: [alertId],
            ...updates
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        this.emit('alert:updated', { alertId, updates });
        return response.data;
      });
    });
  }

  /**
   * Health Check
   */
  async healthCheck() {
    try {
      await this.authenticate();
      await this.queryDevices({ limit: 1 });
      return { status: ConnectorState.HEALTHY, latency: 0 };
    } catch (error) {
      return { status: ConnectorState.UNHEALTHY, error: error.message };
    }
  }

  /**
   * Get connector info
   */
  getInfo() {
    return {
      name: this.name,
      type: 'EDR',
      vendor: 'CrowdStrike',
      product: 'Falcon',
      capabilities: [
        'host-containment',
        'process-killing',
        'ioc-management',
        'real-time-response',
        'threat-detection',
        'device-management'
      ],
      config: {
        baseUrl: this.baseUrl
      }
    };
  }
}

module.exports = CrowdStrikeConnector;