/**
 * Keycloak + FIDO2 Connector
 * 
 * Identity Provider integration with:
 * - WebAuthn/Passkeys (FIDO2)
 * - Risk-based authentication
 * - Session management
 * - User/Group management
 * - Token introspection
 * - SCIM provisioning
 */

const { BaseConnector, ConnectorState } = require('../base/BaseConnector');
const { CircuitBreaker, RetryStrategy } = require('../base/Resilience');
const crypto = require('crypto');

/**
 * Authentication methods supported
 */
const AuthMethod = {
  PASSWORD: 'password',
  OTP: 'otp',
  WEBAUTHN: 'webauthn',
  PASSKEY: 'passkey',
  MFA: 'mfa',
  SSO: 'sso',
  CLIENT_CREDENTIALS: 'client_credentials',
};

/**
 * Risk levels for authentication
 */
const RiskLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * Keycloak Connector
 */
class KeycloakConnector extends BaseConnector {
  constructor(config = {}) {
    super({ name: 'KeycloakConnector', ...config });
    
    this.baseUrl = config.baseUrl || 'http://localhost:8080';
    this.realm = config.realm || 'victorykit';
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.adminClientId = config.adminClientId || 'admin-cli';
    this.adminClientSecret = config.adminClientSecret;
    
    this.accessToken = null;
    this.adminToken = null;
    this.tokenExpiry = null;
    this.adminTokenExpiry = null;
    
    // Resilience
    this.circuitBreaker = new CircuitBreaker({
      name: 'keycloak',
      failureThreshold: 5,
      timeout: 30000,
    });
    
    this.retryStrategy = new RetryStrategy({
      maxRetries: 3,
      type: 'exponential-jitter',
      baseDelay: 200,
    });
  }

  /**
   * Build realm URL
   */
  get realmUrl() {
    return `${this.baseUrl}/realms/${this.realm}`;
  }

  /**
   * Build admin URL
   */
  get adminUrl() {
    return `${this.baseUrl}/admin/realms/${this.realm}`;
  }

  /**
   * Connect and get access tokens
   */
  async connect() {
    this.setState(ConnectorState.CONNECTING);
    
    try {
      // Get admin token for management operations
      await this.getAdminToken();
      
      this.setState(ConnectorState.CONNECTED);
      this.log('info', 'Connected to Keycloak', { realm: this.realm });
      
      return true;
    } catch (error) {
      this.setState(ConnectorState.ERROR);
      this.log('error', 'Failed to connect to Keycloak', { error: error.message });
      throw error;
    }
  }

  /**
   * Get admin access token
   */
  async getAdminToken() {
    const tokenUrl = `${this.baseUrl}/realms/master/protocol/openid-connect/token`;
    
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.adminClientId,
      client_secret: this.adminClientSecret,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`Failed to get admin token: ${response.status}`);
    }

    const data = await response.json();
    this.adminToken = data.access_token;
    this.adminTokenExpiry = Date.now() + (data.expires_in * 1000);
    
    return this.adminToken;
  }

  /**
   * Ensure admin token is valid
   */
  async ensureAdminToken() {
    if (!this.adminToken || Date.now() > this.adminTokenExpiry - 30000) {
      await this.getAdminToken();
    }
    return this.adminToken;
  }

  /**
   * Make authenticated request to admin API
   */
  async adminRequest(path, options = {}) {
    return this.circuitBreaker.execute(async () => {
      return this.retryStrategy.execute(async () => {
        await this.ensureAdminToken();
        
        const url = `${this.adminUrl}${path}`;
        const response = await fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${this.adminToken}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (!response.ok) {
          const error = new Error(`Keycloak API error: ${response.status}`);
          error.status = response.status;
          throw error;
        }

        if (response.status === 204) {
          return null;
        }

        return response.json();
      });
    });
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  /**
   * Get user by ID
   */
  async getUser(userId) {
    return this.adminRequest(`/users/${userId}`);
  }

  /**
   * Get user by username or email
   */
  async findUser(query) {
    const params = new URLSearchParams();
    if (query.username) params.set('username', query.username);
    if (query.email) params.set('email', query.email);
    params.set('exact', 'true');
    
    const users = await this.adminRequest(`/users?${params}`);
    return users?.[0] || null;
  }

  /**
   * Search users
   */
  async searchUsers(search, options = {}) {
    const params = new URLSearchParams({
      search,
      first: options.first || 0,
      max: options.max || 25,
    });
    
    return this.adminRequest(`/users?${params}`);
  }

  /**
   * Create user
   */
  async createUser(userData) {
    await this.adminRequest('/users', {
      method: 'POST',
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        enabled: userData.enabled ?? true,
        emailVerified: userData.emailVerified ?? false,
        attributes: userData.attributes || {},
        requiredActions: userData.requiredActions || [],
      }),
    });

    // Get created user
    return this.findUser({ username: userData.username });
  }

  /**
   * Update user
   */
  async updateUser(userId, updates) {
    await this.adminRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    return this.getUser(userId);
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    await this.adminRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Set user password
   */
  async setPassword(userId, password, temporary = false) {
    await this.adminRequest(`/users/${userId}/reset-password`, {
      method: 'PUT',
      body: JSON.stringify({
        type: 'password',
        value: password,
        temporary,
      }),
    });
  }

  /**
   * Get user sessions
   */
  async getUserSessions(userId) {
    return this.adminRequest(`/users/${userId}/sessions`);
  }

  /**
   * Logout user (all sessions)
   */
  async logoutUser(userId) {
    await this.adminRequest(`/users/${userId}/logout`, {
      method: 'POST',
    });
  }

  /**
   * Logout specific session
   */
  async logoutSession(sessionId) {
    await this.adminRequest(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // GROUP MANAGEMENT
  // ============================================

  /**
   * Get all groups
   */
  async getGroups() {
    return this.adminRequest('/groups');
  }

  /**
   * Get group by ID
   */
  async getGroup(groupId) {
    return this.adminRequest(`/groups/${groupId}`);
  }

  /**
   * Create group
   */
  async createGroup(name, parentId = null) {
    const path = parentId 
      ? `/groups/${parentId}/children` 
      : '/groups';
    
    await this.adminRequest(path, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    
    const groups = await this.getGroups();
    return groups.find(g => g.name === name);
  }

  /**
   * Add user to group
   */
  async addUserToGroup(userId, groupId) {
    await this.adminRequest(`/users/${userId}/groups/${groupId}`, {
      method: 'PUT',
    });
  }

  /**
   * Remove user from group
   */
  async removeUserFromGroup(userId, groupId) {
    await this.adminRequest(`/users/${userId}/groups/${groupId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get user groups
   */
  async getUserGroups(userId) {
    return this.adminRequest(`/users/${userId}/groups`);
  }

  // ============================================
  // ROLE MANAGEMENT
  // ============================================

  /**
   * Get realm roles
   */
  async getRealmRoles() {
    return this.adminRequest('/roles');
  }

  /**
   * Assign role to user
   */
  async assignRole(userId, roleName) {
    const roles = await this.getRealmRoles();
    const role = roles.find(r => r.name === roleName);
    
    if (!role) {
      throw new Error(`Role '${roleName}' not found`);
    }
    
    await this.adminRequest(`/users/${userId}/role-mappings/realm`, {
      method: 'POST',
      body: JSON.stringify([role]),
    });
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId) {
    return this.adminRequest(`/users/${userId}/role-mappings/realm`);
  }

  // ============================================
  // TOKEN OPERATIONS
  // ============================================

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCode(code, redirectUri) {
    const tokenUrl = `${this.realmUrl}/protocol/openid-connect/token`;
    
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      redirect_uri: redirectUri,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    if (!response.ok) {
      const error = new Error('Token exchange failed');
      error.status = response.status;
      throw error;
    }

    return response.json();
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    const tokenUrl = `${this.realmUrl}/protocol/openid-connect/token`;
    
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    if (!response.ok) {
      const error = new Error('Token refresh failed');
      error.status = response.status;
      throw error;
    }

    return response.json();
  }

  /**
   * Introspect token
   */
  async introspectToken(token) {
    const introspectUrl = `${this.realmUrl}/protocol/openid-connect/token/introspect`;
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      token,
    });

    const response = await fetch(introspectUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    return response.json();
  }

  /**
   * Get user info from token
   */
  async getUserInfo(accessToken) {
    const userInfoUrl = `${this.realmUrl}/protocol/openid-connect/userinfo`;
    
    const response = await fetch(userInfoUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const error = new Error('UserInfo request failed');
      error.status = response.status;
      throw error;
    }

    return response.json();
  }

  // ============================================
  // FIDO2 / WEBAUTHN
  // ============================================

  /**
   * Get user's WebAuthn credentials
   */
  async getWebAuthnCredentials(userId) {
    return this.adminRequest(`/users/${userId}/credentials?type=webauthn`);
  }

  /**
   * Delete WebAuthn credential
   */
  async deleteWebAuthnCredential(userId, credentialId) {
    await this.adminRequest(`/users/${userId}/credentials/${credentialId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Require WebAuthn for user
   */
  async requireWebAuthn(userId) {
    const user = await this.getUser(userId);
    const actions = user.requiredActions || [];
    
    if (!actions.includes('webauthn-register')) {
      await this.updateUser(userId, {
        ...user,
        requiredActions: [...actions, 'webauthn-register'],
      });
    }
  }

  // ============================================
  // RISK-BASED AUTHENTICATION
  // ============================================

  /**
   * Calculate authentication risk score
   */
  calculateRiskScore(context) {
    let score = 0;
    const factors = [];

    // New device
    if (context.isNewDevice) {
      score += 25;
      factors.push('new_device');
    }

    // New location
    if (context.isNewLocation) {
      score += 20;
      factors.push('new_location');
    }

    // Impossible travel
    if (context.impossibleTravel) {
      score += 40;
      factors.push('impossible_travel');
    }

    // Anonymous IP (VPN/Tor)
    if (context.isAnonymousIP) {
      score += 30;
      factors.push('anonymous_ip');
    }

    // High-risk country
    if (context.highRiskCountry) {
      score += 25;
      factors.push('high_risk_country');
    }

    // Failed attempts recently
    if (context.recentFailedAttempts > 3) {
      score += Math.min(context.recentFailedAttempts * 5, 30);
      factors.push('failed_attempts');
    }

    // Unusual time
    if (context.unusualTime) {
      score += 10;
      factors.push('unusual_time');
    }

    // Determine risk level
    let level = RiskLevel.LOW;
    if (score >= 70) level = RiskLevel.CRITICAL;
    else if (score >= 50) level = RiskLevel.HIGH;
    else if (score >= 25) level = RiskLevel.MEDIUM;

    return {
      score: Math.min(score, 100),
      level,
      factors,
      requireMFA: level !== RiskLevel.LOW,
      requireStepUp: level === RiskLevel.HIGH || level === RiskLevel.CRITICAL,
      blockAccess: level === RiskLevel.CRITICAL && context.recentFailedAttempts > 10,
    };
  }

  /**
   * Evaluate access policy based on risk
   */
  evaluateAccessPolicy(user, context) {
    const risk = this.calculateRiskScore(context);
    
    const policy = {
      allowed: !risk.blockAccess,
      risk,
      requiredFactors: [],
      sessionDuration: 3600, // 1 hour default
    };

    if (risk.requireMFA) {
      policy.requiredFactors.push('mfa');
    }

    if (risk.requireStepUp) {
      policy.requiredFactors.push('webauthn');
      policy.sessionDuration = 1800; // 30 minutes
    }

    // Reduce session duration for high risk
    if (risk.level === RiskLevel.HIGH) {
      policy.sessionDuration = 900; // 15 minutes
    }

    return policy;
  }

  // ============================================
  // EVENTS & AUDIT
  // ============================================

  /**
   * Get authentication events
   */
  async getAuthEvents(options = {}) {
    const params = new URLSearchParams();
    if (options.type) params.set('type', options.type);
    if (options.client) params.set('client', options.client);
    if (options.user) params.set('user', options.user);
    if (options.dateFrom) params.set('dateFrom', options.dateFrom);
    if (options.dateTo) params.set('dateTo', options.dateTo);
    params.set('first', options.first || 0);
    params.set('max', options.max || 100);
    
    return this.adminRequest(`/events?${params}`);
  }

  /**
   * Get admin events
   */
  async getAdminEvents(options = {}) {
    const params = new URLSearchParams();
    if (options.operationTypes) params.set('operationTypes', options.operationTypes);
    if (options.resourceTypes) params.set('resourceTypes', options.resourceTypes);
    params.set('first', options.first || 0);
    params.set('max', options.max || 100);
    
    return this.adminRequest(`/admin-events?${params}`);
  }

  /**
   * Check health
   */
  async checkHealth() {
    try {
      const wellKnownUrl = `${this.realmUrl}/.well-known/openid-configuration`;
      const response = await fetch(wellKnownUrl);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      const config = await response.json();
      
      return {
        isHealthy: true,
        message: 'Connected',
        issuer: config.issuer,
        realm: this.realm,
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
    this.adminToken = null;
    this.accessToken = null;
    this.log('info', 'Disconnected from Keycloak');
  }
}

/**
 * FIDO2 Manager for WebAuthn operations
 */
class FIDO2Manager {
  constructor(keycloakConnector) {
    this.keycloak = keycloakConnector;
    this.rpName = 'VictoryKit';
    this.rpId = 'victorykit.io';
  }

  /**
   * Generate registration options
   */
  generateRegistrationOptions(user) {
    return {
      challenge: crypto.randomBytes(32).toString('base64url'),
      rp: {
        name: this.rpName,
        id: this.rpId,
      },
      user: {
        id: Buffer.from(user.id).toString('base64url'),
        name: user.username,
        displayName: user.displayName || user.username,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },  // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      timeout: 60000,
      attestation: 'direct',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        requireResidentKey: true,
        residentKey: 'required',
        userVerification: 'required',
      },
    };
  }

  /**
   * Generate authentication options
   */
  generateAuthenticationOptions(allowCredentials = []) {
    return {
      challenge: crypto.randomBytes(32).toString('base64url'),
      timeout: 60000,
      rpId: this.rpId,
      allowCredentials: allowCredentials.map(cred => ({
        id: cred.id,
        type: 'public-key',
        transports: ['internal', 'hybrid'],
      })),
      userVerification: 'required',
    };
  }
}

module.exports = {
  KeycloakConnector,
  FIDO2Manager,
  AuthMethod,
  RiskLevel,
};
