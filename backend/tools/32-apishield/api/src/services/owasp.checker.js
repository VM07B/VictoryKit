const axios = require('axios');
const jwt = require('jsonwebtoken');

class OWASPChecker {
  constructor() {
    this.owaspCategories = {
      'owasp-api-1': 'Broken Object Level Authorization',
      'owasp-api-2': 'Broken Authentication',
      'owasp-api-3': 'Broken Object Property Level Authorization',
      'owasp-api-4': 'Unrestricted Resource Consumption',
      'owasp-api-5': 'Broken Function Level Authorization',
      'owasp-api-6': 'Unrestricted Access to Sensitive Business Flows',
      'owasp-api-7': 'Server Side Request Forgery',
      'owasp-api-8': 'Security Misconfiguration',
      'owasp-api-9': 'Improper Inventory Management',
      'owasp-api-10': 'Unsafe Consumption of APIs'
    };
  }

  async checkEndpoint(targetUrl, endpoint, authentication = {}) {
    const findings = [];

    // Run all OWASP API checks
    findings.push(...await this.checkBOLA(targetUrl, endpoint, authentication));
    findings.push(...await this.checkBrokenAuth(targetUrl, endpoint, authentication));
    findings.push(...await this.checkRateLimiting(targetUrl, endpoint, authentication));
    findings.push(...await this.checkSSRF(targetUrl, endpoint, authentication));
    findings.push(...await this.checkSecurityHeaders(targetUrl, endpoint, authentication));
    findings.push(...await this.checkMassAssignment(targetUrl, endpoint, authentication));
    findings.push(...await this.checkVerboseErrors(targetUrl, endpoint, authentication));

    return findings;
  }

  async checkBOLA(targetUrl, endpoint, authentication) {
    const findings = [];

    // Test for ID parameter manipulation
    const idParams = endpoint.parameters?.filter(p => p.name.includes('id') || p.name.includes('Id')) || [];

    for (const param of idParams) {
      if (param.in === 'path') {
        const testIds = ['0', '-1', '999999', 'admin', 'null'];

        for (const testId of testIds) {
          try {
            const testUrl = `${targetUrl}${endpoint.path.replace(`:${param.name}`, testId)}`;
            const result = await this.makeRequest(testUrl, endpoint.method, authentication);

            if (result.status === 200 && this.isDataReturned(result)) {
              findings.push({
                type: 'BOLA',
                category: 'auth',
                severity: 'high',
                description: `Endpoint may be vulnerable to Broken Object Level Authorization via parameter '${param.name}'`,
                endpoint: `${endpoint.method} ${endpoint.path}`,
                evidence: {
                  request: { method: endpoint.method, url: testUrl },
                  response: { statusCode: result.status, body: result.data?.substring(0, 200) }
                },
                cweId: 'CWE-639',
                owaspCategory: 'owasp-api-1'
              });
            }
          } catch (error) {
            // Continue testing
          }
        }
      }
    }

    return findings;
  }

  async checkBrokenAuth(targetUrl, endpoint, authentication) {
    const findings = [];

    // Test without authentication
    if (endpoint.requiresAuth) {
      try {
        const result = await this.makeRequest(`${targetUrl}${endpoint.path}`, endpoint.method, {});

        if (result.status === 200) {
          findings.push({
            type: 'BROKEN_AUTH',
            category: 'auth',
            severity: 'critical',
            description: 'Endpoint accepts requests without proper authentication',
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
    }

    // Test JWT manipulation
    if (authentication.type === 'bearer' && authentication.token) {
      try {
        const tamperedToken = this.tamperJWT(authentication.token);
        const result = await this.makeRequest(`${targetUrl}${endpoint.path}`, endpoint.method, {
          ...authentication,
          token: tamperedToken
        });

        if (result.status === 200) {
          findings.push({
            type: 'JWT_VULNERABILITY',
            category: 'auth',
            severity: 'critical',
            description: 'JWT token manipulation accepted by endpoint',
            endpoint: `${endpoint.method} ${endpoint.path}`,
            evidence: {
              request: { method: endpoint.method, url: `${targetUrl}${endpoint.path}` },
              response: { statusCode: result.status }
            },
            cweId: 'CWE-327',
            owaspCategory: 'owasp-api-2'
          });
        }
      } catch (error) {
        // Continue testing
      }
    }

    return findings;
  }

  async checkRateLimiting(targetUrl, endpoint, authentication) {
    const findings = [];

    // Send multiple requests quickly
    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(this.makeRequest(`${targetUrl}${endpoint.path}`, endpoint.method, authentication));
    }

    try {
      const results = await Promise.all(requests);
      const blockedRequests = results.filter(r => r.status === 429 || r.status === 403).length;

      if (blockedRequests === 0) {
        findings.push({
          type: 'NO_RATE_LIMITING',
          category: 'rate-limiting',
          severity: 'medium',
          description: 'No rate limiting detected on endpoint',
          endpoint: `${endpoint.method} ${endpoint.path}`,
          evidence: {
            request: { method: endpoint.method, url: `${targetUrl}${endpoint.path}` },
            response: { statusCode: results[0].status }
          },
          cweId: 'CWE-770',
          owaspCategory: 'owasp-api-4'
        });
      }
    } catch (error) {
      // Continue testing
    }

    return findings;
  }

  async checkSSRF(targetUrl, endpoint, authentication) {
    const findings = [];

    // Test for SSRF in URL parameters
    const urlParams = endpoint.parameters?.filter(p => p.name.includes('url') || p.name.includes('redirect')) || [];

    for (const param of urlParams) {
      const ssrfUrls = [
        'http://127.0.0.1:22',
        'http://localhost:3306',
        'http://169.254.169.254/latest/meta-data/', // AWS metadata
        'http://metadata.google.internal/computeMetadata/v1/' // GCP metadata
      ];

      for (const ssrfUrl of ssrfUrls) {
        try {
          const testUrl = `${targetUrl}${endpoint.path}?${param.name}=${encodeURIComponent(ssrfUrl)}`;
          const result = await this.makeRequest(testUrl, endpoint.method, authentication);

          if (result.status === 200 && this.containsInternalData(result)) {
            findings.push({
              type: 'SSRF',
              category: 'injection',
              severity: 'high',
              description: `Parameter '${param.name}' may be vulnerable to Server Side Request Forgery`,
              endpoint: `${endpoint.method} ${endpoint.path}`,
              evidence: {
                request: { method: endpoint.method, url: testUrl },
                response: { statusCode: result.status, body: result.data?.substring(0, 200) }
              },
              cweId: 'CWE-918',
              owaspCategory: 'owasp-api-7'
            });
          }
        } catch (error) {
          // Continue testing
        }
      }
    }

    return findings;
  }

  async checkSecurityHeaders(targetUrl, endpoint, authentication) {
    const findings = [];

    try {
      const result = await this.makeRequest(`${targetUrl}${endpoint.path}`, endpoint.method, authentication);

      const headers = result.headers || {};
      const missingHeaders = [];

      if (!headers['x-content-type-options']) missingHeaders.push('X-Content-Type-Options');
      if (!headers['x-frame-options']) missingHeaders.push('X-Frame-Options');
      if (!headers['x-xss-protection']) missingHeaders.push('X-XSS-Protection');
      if (!headers['content-security-policy']) missingHeaders.push('Content-Security-Policy');
      if (!headers['strict-transport-security']) missingHeaders.push('Strict-Transport-Security');

      if (missingHeaders.length > 0) {
        findings.push({
          type: 'SECURITY_MISCONFIG',
          category: 'config',
          severity: 'medium',
          description: `Missing security headers: ${missingHeaders.join(', ')}`,
          endpoint: `${endpoint.method} ${endpoint.path}`,
          evidence: {
            request: { method: endpoint.method, url: `${targetUrl}${endpoint.path}` },
            response: { statusCode: result.status, headers }
          },
          cweId: 'CWE-693',
          owaspCategory: 'owasp-api-8'
        });
      }
    } catch (error) {
      // Continue testing
    }

    return findings;
  }

  async checkMassAssignment(targetUrl, endpoint, authentication) {
    const findings = [];

    // Test for mass assignment in POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
      const testPayloads = [
        { admin: true, role: 'admin', isAdmin: true },
        { _id: 'malicious_id', createdAt: '2020-01-01' },
        { password: 'newpassword', confirmPassword: 'newpassword' }
      ];

      for (const payload of testPayloads) {
        try {
          const result = await this.makeRequest(`${targetUrl}${endpoint.path}`, endpoint.method, authentication, payload);

          if (result.status === 200 || result.status === 201) {
            // Check if the payload was accepted (simplified check)
            findings.push({
              type: 'MASS_ASSIGNMENT',
              category: 'business-logic',
              severity: 'high',
              description: 'Endpoint may be vulnerable to mass assignment attacks',
              endpoint: `${endpoint.method} ${endpoint.path}`,
              evidence: {
                request: { method: endpoint.method, url: `${targetUrl}${endpoint.path}`, body: payload },
                response: { statusCode: result.status }
              },
              cweId: 'CWE-915',
              owaspCategory: 'owasp-api-6'
            });
          }
        } catch (error) {
          // Continue testing
        }
      }
    }

    return findings;
  }

  async checkVerboseErrors(targetUrl, endpoint, authentication) {
    const findings = [];

    // Test with invalid input to trigger errors
    const invalidInputs = [
      { id: 'invalid' },
      { email: 'invalid-email' },
      { number: 'not-a-number' }
    ];

    for (const input of invalidInputs) {
      try {
        const result = await this.makeRequest(`${targetUrl}${endpoint.path}`, endpoint.method, authentication, input);

        if (result.status >= 400 && this.isVerboseError(result)) {
          findings.push({
            type: 'VERBOSE_ERROR',
            category: 'data-exposure',
            severity: 'medium',
            description: 'Endpoint returns verbose error messages that may leak sensitive information',
            endpoint: `${endpoint.method} ${endpoint.path}`,
            evidence: {
              request: { method: endpoint.method, url: `${targetUrl}${endpoint.path}`, body: input },
              response: { statusCode: result.status, body: result.data?.substring(0, 300) }
            },
            cweId: 'CWE-209',
            owaspCategory: 'owasp-api-8'
          });
        }
      } catch (error) {
        // Continue testing
      }
    }

    return findings;
  }

  async makeRequest(url, method, authentication, data = null) {
    const config = {
      method: method.toLowerCase(),
      url,
      timeout: 10000,
      validateStatus: () => true,
      headers: {
        'User-Agent': 'APIShield-Scanner/1.0',
        'Content-Type': 'application/json'
      }
    };

    // Add authentication
    if (authentication.type === 'bearer' && authentication.token) {
      config.headers['Authorization'] = `Bearer ${authentication.token}`;
    }

    if (data) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return {
        status: response.status,
        data: response.data,
        headers: response.headers
      };
    } catch (error) {
      return {
        status: error.response?.status || 0,
        data: error.response?.data || error.message,
        headers: error.response?.headers || {},
        error: true
      };
    }
  }

  tamperJWT(token) {
    try {
      const decoded = jwt.decode(token, { complete: true });
      if (decoded) {
        // Try "none" algorithm
        const tampered = jwt.sign(decoded.payload, '', { algorithm: 'none' });
        return tampered;
      }
    } catch (error) {
      // Return original if tampering fails
    }
    return token;
  }

  isDataReturned(result) {
    return result.status === 200 && result.data && typeof result.data === 'object';
  }

  containsInternalData(result) {
    const data = typeof result.data === 'string' ? result.data.toLowerCase() : JSON.stringify(result.data).toLowerCase();
    return data.includes('root:') || data.includes('metadata') || data.includes('compute');
  }

  isVerboseError(result) {
    const data = typeof result.data === 'string' ? result.data.toLowerCase() : JSON.stringify(result.data).toLowerCase();
    return data.includes('stack trace') ||
           data.includes('sql') ||
           data.includes('exception') ||
           data.includes('error in') ||
           data.length > 200;
  }
}

module.exports = new OWASPChecker();
