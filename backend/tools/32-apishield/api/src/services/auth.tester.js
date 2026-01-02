const axios = require('axios');
const jwt = require('jsonwebtoken');

class AuthTester {
  constructor() {
    this.commonUsernames = ['admin', 'administrator', 'root', 'user', 'test', 'guest'];
    this.commonPasswords = ['password', '123456', 'admin', 'root', 'password123', 'admin123'];
  }

  async testEndpoint(targetUrl, endpoint, authentication = {}) {
    const findings = [];

    // Test missing authentication
    findings.push(...await this.testMissingAuth(targetUrl, endpoint));

    // Test JWT vulnerabilities
    if (authentication.token) {
      findings.push(...await this.testJWT(authentication.token));
    }

    // Test API key security
    if (authentication.apiKey) {
      findings.push(...await this.testAPIKeySecurity(authentication));
    }

    // Test privilege escalation
    findings.push(...await this.testPrivilegeEscalation(targetUrl, endpoint, authentication));

    return findings;
  }

  async testMissingAuth(targetUrl, endpoint) {
    const findings = [];

    if (!endpoint.requiresAuth) return findings;

    try {
      const result = await this.makeRequest(`${targetUrl}${endpoint.path}`, endpoint.method, {});

      if (result.status === 200 || result.status === 201) {
        findings.push({
          type: 'BROKEN_AUTH',
          category: 'auth',
          severity: 'critical',
          description: 'Endpoint accepts requests without authentication',
          endpoint: `${endpoint.method} ${endpoint.path}`,
          evidence: {
            request: { method: endpoint.method, url: `${targetUrl}${endpoint.path}` },
            response: { statusCode: result.status }
          },
          cweId: 'CWE-306',
          owaspCategory: 'owasp-api-2'
        });
      }
    } catch (error) {
      // Continue testing
    }

    return findings;
  }

  async testJWT(token) {
    const findings = [];

    try {
      const decoded = jwt.decode(token, { complete: true });

      if (!decoded) {
        findings.push({
          type: 'JWT_VULNERABILITY',
          category: 'auth',
          severity: 'high',
          description: 'Invalid JWT token format',
          cweId: 'CWE-347',
          owaspCategory: 'owasp-api-2'
        });
        return findings;
      }

      // Check for "none" algorithm vulnerability
      const tamperedToken = jwt.sign(decoded.payload, '', { algorithm: 'none' });
      // Note: This would need to be tested against an actual endpoint

      // Check for weak secret (common passwords)
      for (const password of this.commonPasswords.slice(0, 10)) {
        try {
          jwt.verify(token, password);
          findings.push({
            type: 'JWT_VULNERABILITY',
            category: 'auth',
            severity: 'critical',
            description: `JWT token can be verified with weak secret: ${password}`,
            evidence: { secret: password },
            cweId: 'CWE-798',
            owaspCategory: 'owasp-api-2'
          });
          break;
        } catch (error) {
          // Continue testing
        }
      }

      // Check token expiration
      if (decoded.payload.exp && decoded.payload.exp < Date.now() / 1000) {
        findings.push({
          type: 'JWT_VULNERABILITY',
          category: 'auth',
          severity: 'medium',
          description: 'JWT token is expired',
          cweId: 'CWE-613',
          owaspCategory: 'owasp-api-2'
        });
      }

      // Check for sensitive data in payload
      const sensitiveFields = ['password', 'secret', 'key', 'token', 'ssn', 'credit_card'];
      for (const field of sensitiveFields) {
        if (decoded.payload[field]) {
          findings.push({
            type: 'JWT_VULNERABILITY',
            category: 'data-exposure',
            severity: 'high',
            description: `Sensitive data found in JWT payload: ${field}`,
            evidence: { field, value: decoded.payload[field] },
            cweId: 'CWE-200',
            owaspCategory: 'owasp-api-2'
          });
        }
      }

    } catch (error) {
      findings.push({
        type: 'JWT_VULNERABILITY',
        category: 'auth',
        severity: 'medium',
        description: `JWT parsing error: ${error.message}`,
        cweId: 'CWE-347',
        owaspCategory: 'owasp-api-2'
      });
    }

    return findings;
  }

  async analyzeJWT(token, secret = null) {
    const result = {
      valid: false,
      algorithm: null,
      payload: null,
      header: null,
      vulnerabilities: []
    };

    try {
      const decoded = jwt.decode(token, { complete: true });

      if (decoded) {
        result.algorithm = decoded.header.alg;
        result.payload = decoded.payload;
        result.header = decoded.header;

        // Test verification if secret provided
        if (secret) {
          try {
            jwt.verify(token, secret);
            result.valid = true;
          } catch (error) {
            result.valid = false;
          }
        }

        // Check for vulnerabilities
        if (decoded.header.alg === 'none') {
          result.vulnerabilities.push({
            type: 'JWT_NONE_ALGORITHM',
            severity: 'critical',
            description: 'JWT uses "none" algorithm - signature not verified',
            cweId: 'CWE-327'
          });
        }

        if (decoded.payload.exp && decoded.payload.exp < Date.now() / 1000) {
          result.vulnerabilities.push({
            type: 'JWT_EXPIRED',
            severity: 'medium',
            description: 'JWT token has expired',
            cweId: 'CWE-613'
          });
        }

        // Check for algorithm confusion
        if (decoded.header.alg && ['HS256', 'HS384', 'HS512'].includes(decoded.header.alg)) {
          // Test if it can be verified with different algorithms
          const testSecrets = ['secret', 'password', 'key'];
          for (const testSecret of testSecrets) {
            try {
              jwt.verify(token, testSecret, { algorithms: [decoded.header.alg] });
              result.vulnerabilities.push({
                type: 'JWT_WEAK_SECRET',
                severity: 'high',
                description: `JWT can be verified with weak secret: ${testSecret}`,
                cweId: 'CWE-798'
              });
              break;
            } catch (error) {
              // Continue testing
            }
          }
        }
      }
    } catch (error) {
      result.vulnerabilities.push({
        type: 'JWT_INVALID',
        severity: 'medium',
        description: `Invalid JWT format: ${error.message}`,
        cweId: 'CWE-347'
      });
    }

    return result;
  }

  async testAPIKeySecurity(authentication) {
    const findings = [];

    if (!authentication.apiKey) return findings;

    // Check if API key is sent in URL parameters (insecure)
    if (authentication.apiKeyLocation === 'query') {
      findings.push({
        type: 'API_KEY_INSECURE',
        category: 'auth',
        severity: 'medium',
        description: 'API key sent as query parameter - may be logged or cached',
        evidence: { location: 'query' },
        cweId: 'CWE-200',
        owaspCategory: 'owasp-api-2'
      });
    }

    // Check for weak API keys
    if (authentication.apiKey.length < 16) {
      findings.push({
        type: 'API_KEY_WEAK',
        category: 'auth',
        severity: 'medium',
        description: 'API key is too short - should be at least 16 characters',
        evidence: { length: authentication.apiKey.length },
        cweId: 'CWE-326',
        owaspCategory: 'owasp-api-2'
      });
    }

    // Check for common patterns
    const commonPatterns = ['api', 'key', 'token', 'secret', 'password'];
    if (commonPatterns.some(pattern => authentication.apiKey.toLowerCase().includes(pattern))) {
      findings.push({
        type: 'API_KEY_PREDICTABLE',
        category: 'auth',
        severity: 'high',
        description: 'API key contains predictable patterns',
        cweId: 'CWE-798',
        owaspCategory: 'owasp-api-2'
      });
    }

    return findings;
  }

  async testPrivilegeEscalation(targetUrl, endpoint, authentication) {
    const findings = [];

    // Test role-based access control bypass
    const testPayloads = [
      { role: 'admin', isAdmin: true, permissions: ['read', 'write', 'delete'] },
      { userId: 'admin', level: 999, access: 'full' },
      { _role: 'administrator', admin: true }
    ];

    for (const payload of testPayloads) {
      try {
        const result = await this.makeRequest(`${targetUrl}${endpoint.path}`, endpoint.method, authentication, payload);

        if (result.status === 200 && this.indicatesPrivilegeEscalation(result)) {
          findings.push({
            type: 'PRIVILEGE_ESCALATION',
            category: 'auth',
            severity: 'high',
            description: 'Potential privilege escalation vulnerability detected',
            endpoint: `${endpoint.method} ${endpoint.path}`,
            evidence: {
              request: { method: endpoint.method, url: `${targetUrl}${endpoint.path}`, body: payload },
              response: { statusCode: result.status }
            },
            cweId: 'CWE-285',
            owaspCategory: 'owasp-api-5'
          });
        }
      } catch (error) {
        // Continue testing
      }
    }

    return findings;
  }

  async testRateLimiting(options) {
    const { url, method = 'GET', requestCount = 20, payload = {} } = options;
    const results = [];

    // Send multiple requests
    for (let i = 0; i < requestCount; i++) {
      try {
        const result = await this.makeRequest(url, method, {}, payload);
        results.push(result);

        // Small delay to avoid overwhelming
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.push({ status: 0, error: true });
      }
    }

    const blockedCount = results.filter(r => r.status === 429 || r.status === 403).length;
    const errorCount = results.filter(r => r.error).length;
    const successCount = results.filter(r => r.status >= 200 && r.status < 300).length;

    return {
      totalRequests: requestCount,
      successfulRequests: successCount,
      blockedRequests: blockedCount,
      errorRequests: errorCount,
      rateLimitDetected: blockedCount > 0,
      averageResponseTime: results.filter(r => r.responseTime).reduce((sum, r) => sum + r.responseTime, 0) / results.length
    };
  }

  async testCORS(targetUrl, testOrigins = ['https://evil.com', 'null', 'https://attacker.example.com']) {
    const findings = [];

    for (const origin of testOrigins) {
      try {
        const result = await this.makeRequest(targetUrl, 'OPTIONS', {}, null, {
          'Origin': origin,
          'Access-Control-Request-Method': 'GET'
        });

        const corsHeaders = {
          'access-control-allow-origin': result.headers['access-control-allow-origin'],
          'access-control-allow-credentials': result.headers['access-control-allow-credentials'],
          'access-control-allow-methods': result.headers['access-control-allow-methods']
        };

        // Check for overly permissive CORS
        if (corsHeaders['access-control-allow-origin'] === '*' &&
            corsHeaders['access-control-allow-credentials'] === 'true') {
          findings.push({
            type: 'CORS_MISCONFIGURATION',
            category: 'config',
            severity: 'high',
            description: 'CORS allows all origins with credentials - potential security risk',
            evidence: { origin, corsHeaders },
            cweId: 'CWE-942',
            owaspCategory: 'owasp-api-8'
          });
        }

        if (corsHeaders['access-control-allow-origin'] === origin &&
            origin !== 'null' &&
            !origin.includes('localhost') &&
            !origin.includes('127.0.0.1')) {
          findings.push({
            type: 'CORS_MISCONFIGURATION',
            category: 'config',
            severity: 'medium',
            description: `CORS allows arbitrary origin: ${origin}`,
            evidence: { origin, corsHeaders },
            cweId: 'CWE-942',
            owaspCategory: 'owasp-api-8'
          });
        }

      } catch (error) {
        // Continue testing
      }
    }

    return {
      findings,
      testedOrigins: testOrigins,
      summary: {
        totalTests: testOrigins.length,
        vulnerabilities: findings.length
      }
    };
  }

  async makeRequest(url, method, authentication, data = null, extraHeaders = {}) {
    const config = {
      method: method.toLowerCase(),
      url,
      timeout: 10000,
      validateStatus: () => true,
      headers: {
        'User-Agent': 'APIShield-AuthTester/1.0',
        'Content-Type': 'application/json',
        ...extraHeaders
      }
    };

    // Add authentication
    if (authentication.type === 'bearer' && authentication.token) {
      config.headers['Authorization'] = `Bearer ${authentication.token}`;
    } else if (authentication.type === 'basic' && authentication.username) {
      const credentials = Buffer.from(`${authentication.username}:${authentication.password || ''}`).toString('base64');
      config.headers['Authorization'] = `Basic ${credentials}`;
    } else if (authentication.type === 'apiKey' && authentication.apiKey) {
      const location = authentication.apiKeyLocation || 'header';
      const name = authentication.apiKeyName || 'X-API-Key';
      if (location === 'header') {
        config.headers[name] = authentication.apiKey;
      } else if (location === 'query') {
        config.params = { [name]: authentication.apiKey };
      }
    }

    if (data) {
      config.data = data;
    }

    const startTime = Date.now();
    try {
      const response = await axios(config);
      const responseTime = Date.now() - startTime;

      return {
        status: response.status,
        data: response.data,
        headers: response.headers,
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: error.response?.status || 0,
        data: error.response?.data || error.message,
        headers: error.response?.headers || {},
        responseTime,
        error: true
      };
    }
  }

  indicatesPrivilegeEscalation(result) {
    // Simplified check - in real implementation, would compare with baseline response
    return result.status === 200 && result.data;
  }
}

module.exports = new AuthTester();
