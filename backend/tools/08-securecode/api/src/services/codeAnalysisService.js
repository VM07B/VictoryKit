const { logger } = require('../../../../../shared');
const mlService = require('./mlService');

class CodeAnalysisService {
  constructor() {
    this.supportedLanguages = [
      'javascript', 'typescript', 'python', 'java', 'go', 
      'ruby', 'php', 'csharp', 'rust', 'kotlin'
    ];
  }

  async analyzeFile(content, filename, options = {}) {
    const language = this.detectLanguage(filename);
    const issues = [];

    // Run ML analysis
    const mlResult = await mlService.analyzeCode(content, language, options);
    if (mlResult.issues) {
      issues.push(...mlResult.issues.map(i => ({
        ...i,
        source: 'ml-analysis'
      })));
    }

    // Secret detection
    if (options.scanSecrets !== false) {
      const secretResult = await mlService.detectSecrets(content, filename);
      if (secretResult.secrets) {
        issues.push(...secretResult.secrets.map(s => ({
          type: 'secret',
          category: s.type,
          severity: 'critical',
          location: { file: filename, startLine: s.line },
          source: 'secret-detection'
        })));
      }
    }

    return {
      filename,
      language,
      issues,
      linesAnalyzed: content.split('\n').length
    };
  }

  async analyzeCodebase(files, options = {}) {
    const results = {
      filesScanned: 0,
      issues: [],
      summary: { critical: 0, high: 0, medium: 0, low: 0 }
    };

    for (const file of files) {
      try {
        const analysis = await this.analyzeFile(file.content, file.path, options);
        results.filesScanned++;
        results.issues.push(...analysis.issues);
      } catch (error) {
        logger.error(`Error analyzing ${file.path}:`, error.message);
      }
    }

    // Calculate summary
    results.issues.forEach(issue => {
      const severity = issue.severity || 'medium';
      results.summary[severity] = (results.summary[severity] || 0) + 1;
    });

    // Calculate security score
    const weights = { critical: 25, high: 10, medium: 3, low: 1 };
    const totalPenalty = Object.entries(results.summary)
      .reduce((acc, [sev, count]) => acc + (weights[sev] || 0) * count, 0);
    results.securityScore = Math.max(0, 100 - totalPenalty);

    return results;
  }

  detectLanguage(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap = {
      'js': 'javascript', 'jsx': 'javascript', 'mjs': 'javascript',
      'ts': 'typescript', 'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'go': 'go',
      'rb': 'ruby',
      'php': 'php',
      'cs': 'csharp',
      'rs': 'rust',
      'kt': 'kotlin'
    };
    return langMap[ext] || 'unknown';
  }

  getSeverity(category) {
    const severityMap = {
      'sql-injection': 'critical',
      'rce': 'critical',
      'hardcoded-secret': 'critical',
      'xss': 'high',
      'csrf': 'high',
      'ssrf': 'high',
      'path-traversal': 'high',
      'weak-crypto': 'medium',
      'insecure-random': 'medium',
      'open-redirect': 'medium'
    };
    return severityMap[category] || 'low';
  }

  generateFix(issue) {
    const fixes = {
      'sql-injection': {
        suggestion: 'Use parameterized queries or prepared statements',
        references: ['https://owasp.org/www-community/attacks/SQL_Injection']
      },
      'xss': {
        suggestion: 'Sanitize user input and use Content Security Policy',
        references: ['https://owasp.org/www-community/attacks/xss/']
      },
      'hardcoded-secret': {
        suggestion: 'Use environment variables or a secrets manager',
        references: ['https://owasp.org/www-project-web-security-testing-guide/']
      }
    };
    return fixes[issue.category] || { suggestion: 'Review and fix the security issue' };
  }
}

module.exports = new CodeAnalysisService();
