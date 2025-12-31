/**
 * Okta Identity Provider Connector
 *
 * IdP integration with:
 * - User authentication and authorization
 * - MFA management
 * - Risk-based authentication
 * - User lifecycle management
 * - Device trust assessment
 */

const { BaseConnector, ConnectorState } = require('../base/BaseConnector');
const { CircuitBreaker, RetryStrategy } = require('../base/Resilience');
const axios = require('axios');

/**
 * Okta Risk Levels
 */
const RiskLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
};

/**
 * Okta User Status
 */
const UserStatus = {
  ACTIVE: 'ACTIVE',
  DEPROVISIONED: 'DEPROVISIONED',
  LOCKED_OUT: 'LOCKED_OUT',
  PASSWORD_EXPIRED: 'PASSWORD_EXPIRED',
  PROVISIONED: 'PROVISIONED',
  RECOVERY: 'RECOVERY',
  STAGED: 'STAGED',
  SUSPENDED: 'SUSPENDED'
};

/**
 * Okta MFA Factors
 */
const MFAType = {
  SMS: 'sms',
  CALL: 'call',
  PUSH: 'push',
  TOTP: 'token:software:totp',
  HOTP: 'token:hardware',
  WEBAUTHN: 'webauthn',
  SECURITY_QUESTION: 'question'
};

class OktaConnector extends BaseConnector {
  constructor(config) {
    super('Okta IdP', config);

    this.baseUrl = config.baseUrl;
    this.apiToken = config.apiToken;
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
   * Authenticate with Okta API
   */
  async authenticate() {
    try {
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      // For API token authentication, we don't need OAuth flow
      if (this.apiToken) {
        this.accessToken = this.apiToken;
        this.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
        return this.accessToken;
      }

      // OAuth client credentials flow
      const response = await axios.post(
        `${this.baseUrl}/oauth2/v1/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: 'okta.users.read okta.users.manage okta.authenticators.read okta.authenticators.manage okta.riskEvents.read'
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
      throw new Error(`Okta authentication failed: ${error.message}`);
    }
  }

  /**
   * Get User by ID
   */
  async getUser(userId) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.get(
          `${this.baseUrl}/api/v1/users/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        return response.data;
      });
    });
  }

  /**
   * Get User by Login
   */
  async getUserByLogin(login) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.get(
          `${this.baseUrl}/api/v1/users/${encodeURIComponent(login)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        return response.data;
      });
    });
  }

  /**
   * List Users
   */
  async listUsers(filter = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const params = {};
        if (filter.q) params.q = filter.q;
        if (filter.filter) params.filter = filter.filter;
        if (filter.limit) params.limit = Math.min(filter.limit, 200);
        if (filter.after) params.after = filter.after;

        const response = await axios.get(
          `${this.baseUrl}/api/v1/users`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            params
          }
        );

        return response.data;
      });
    });
  }

  /**
   * Update User
   */
  async updateUser(userId, updates) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.post(
          `${this.baseUrl}/api/v1/users/${userId}`,
          updates,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        this.emit('user:updated', { userId, updates });
        return response.data;
      });
    });
  }

  /**
   * Suspend User
   */
  async suspendUser(userId) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.post(
          `${this.baseUrl}/api/v1/users/${userId}/lifecycle/suspend`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        this.emit('user:suspended', { userId });
        return response.data;
      });
    });
  }

  /**
   * Unsuspend User
   */
  async unsuspendUser(userId) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.post(
          `${this.baseUrl}/api/v1/users/${userId}/lifecycle/unsuspend`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        this.emit('user:unsuspended', { userId });
        return response.data;
      });
    });
  }

  /**
   * Get User Risk Events
   */
  async getUserRiskEvents(userId, since = null) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const params = {};
        if (since) params.since = since;

        const response = await axios.get(
          `${this.baseUrl}/api/v1/users/${userId}/riskEvents`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            params
          }
        );

        return response.data;
      });
    });
  }

  /**
   * Get Authentication Events
   */
  async getAuthEvents(filter = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const params = {};
        if (filter.since) params.since = filter.since;
        if (filter.until) params.until = filter.until;
        if (filter.limit) params.limit = Math.min(filter.limit, 1000);

        const response = await axios.get(
          `${this.baseUrl}/api/v1/logs`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            params
          }
        );

        return response.data;
      });
    });
  }

  /**
   * Get MFA Factors for User
   */
  async getUserFactors(userId) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.get(
          `${this.baseUrl}/api/v1/users/${userId}/factors`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        return response.data;
      });
    });
  }

  /**
   * Enroll MFA Factor
   */
  async enrollFactor(userId, factorData) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.post(
          `${this.baseUrl}/api/v1/users/${userId}/factors`,
          factorData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        this.emit('factor:enrolled', { userId, factorId: response.data.id });
        return response.data;
      });
    });
  }

  /**
   * Verify MFA Factor
   */
  async verifyFactor(userId, factorId, verificationData = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.post(
          `${this.baseUrl}/api/v1/users/${userId}/factors/${factorId}/verify`,
          verificationData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        return response.data;
      });
    });
  }

  /**
   * Reset MFA Factors
   */
  async resetFactors(userId) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.post(
          `${this.baseUrl}/api/v1/users/${userId}/lifecycle/reset_factors`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        this.emit('factors:reset', { userId });
        return response.data;
      });
    });
  }

  /**
   * Get Device Information
   */
  async getDevices(userId = null) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        let url = `${this.baseUrl}/api/v1/devices`;
        if (userId) {
          url += `?userId=${userId}`;
        }

        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        return response.data;
      });
    });
  }

  /**
   * Deactivate Device
   */
  async deactivateDevice(deviceId) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.post(
          `${this.baseUrl}/api/v1/devices/${deviceId}/lifecycle/deactivate`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        this.emit('device:deactivated', { deviceId });
        return response.data;
      });
    });
  }

  /**
   * Create Policy
   */
  async createPolicy(policyData) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const response = await axios.post(
          `${this.baseUrl}/api/v1/policies`,
          policyData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        this.emit('policy:created', { policyId: response.data.id });
        return response.data;
      });
    });
  }

  /**
   * Get Risk Events
   */
  async getRiskEvents(filter = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        const token = await this.authenticate();

        const params = {};
        if (filter.since) params.since = filter.since;
        if (filter.until) params.until = filter.until;
        if (filter.status) params.status = filter.status;
        if (filter.riskLevel) params.riskLevel = filter.riskLevel;

        const response = await axios.get(
          `${this.baseUrl}/api/v1/risk/events`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            params
          }
        );

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
      await this.listUsers({ limit: 1 });
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
      type: 'IdP',
      vendor: 'Okta',
      product: 'Identity Cloud',
      capabilities: [
        'user-management',
        'mfa-management',
        'risk-assessment',
        'device-management',
        'authentication-events',
        'policy-management'
      ],
      config: {
        baseUrl: this.baseUrl
      }
    };
  }
}

module.exports = OktaConnector;