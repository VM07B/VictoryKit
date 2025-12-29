const { logger } = require('../../../../../shared');
const mlService = require('./mlService');

class DataProtectionService {
  constructor() {
    this.classificationLevels = ['public', 'internal', 'confidential', 'restricted', 'top-secret'];
    this.sensitiveDataTypes = ['PII', 'PHI', 'PCI', 'financial', 'credentials', 'intellectual-property'];
  }

  async classifyAsset(asset) {
    const classification = await mlService.classifyData(asset);
    return {
      classification: classification.classification,
      dataTypes: classification.dataTypes,
      confidence: classification.confidence,
      recommendedActions: this.getRecommendedActions(classification.classification)
    };
  }

  async scanForPII(content) {
    const detection = await mlService.detectPII(content);
    return {
      findings: detection.findings,
      totalPII: detection.totalPII,
      riskLevel: detection.totalPII > 100 ? 'critical' : detection.totalPII > 10 ? 'high' : detection.totalPII > 0 ? 'medium' : 'low',
      recommendations: this.getPIIRecommendations(detection.findings)
    };
  }

  async assessAssetRisk(asset) {
    const assessment = await mlService.assessRisk(asset);
    return {
      riskScore: assessment.riskScore,
      riskLevel: this.getRiskLevel(assessment.riskScore),
      factors: assessment.factors,
      recommendations: this.getRiskRecommendations(assessment.riskScore, asset)
    };
  }

  async evaluatePolicy(policy, assets) {
    const violations = [];
    
    for (const asset of assets) {
      for (const rule of policy.rules) {
        const isMatch = this.evaluateCondition(asset, rule.condition);
        if (isMatch && rule.action.type === 'deny') {
          violations.push({
            assetId: asset._id,
            assetName: asset.name,
            rule: rule,
            severity: this.getSeverityFromPriority(rule.priority)
          });
        }
      }
    }

    return {
      policyId: policy._id,
      totalAssets: assets.length,
      violations,
      complianceRate: ((assets.length - violations.length) / assets.length * 100).toFixed(1)
    };
  }

  evaluateCondition(asset, condition) {
    const { field, operator, value } = condition;
    const assetValue = this.getNestedValue(asset, field);

    switch (operator) {
      case 'equals': return assetValue === value;
      case 'contains': return String(assetValue).includes(value);
      case 'matches': return new RegExp(value).test(String(assetValue));
      case 'greater': return assetValue > value;
      case 'less': return assetValue < value;
      default: return false;
    }
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }

  getRiskLevel(score) {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'low';
    return 'minimal';
  }

  getSeverityFromPriority(priority) {
    if (priority <= 25) return 'critical';
    if (priority <= 50) return 'high';
    if (priority <= 75) return 'medium';
    return 'low';
  }

  getRecommendedActions(classification) {
    const actions = {
      'public': ['Regular review', 'Basic access logging'],
      'internal': ['Access control', 'Audit logging', 'Regular review'],
      'confidential': ['Encryption at rest', 'Access control', 'DLP monitoring', 'Audit logging'],
      'restricted': ['Strong encryption', 'MFA access', 'DLP enforcement', 'Regular audits', 'Access review'],
      'top-secret': ['End-to-end encryption', 'Zero-trust access', 'Continuous monitoring', 'Quarterly audits']
    };
    return actions[classification] || actions['internal'];
  }

  getPIIRecommendations(findings) {
    const recommendations = [];
    
    if (findings.some(f => f.type === 'ssn' || f.type === 'credit-card')) {
      recommendations.push('Implement data masking for highly sensitive data');
      recommendations.push('Enable encryption for data at rest');
    }
    
    if (findings.some(f => f.risk === 'critical')) {
      recommendations.push('Review and restrict access to this data immediately');
      recommendations.push('Consider data tokenization');
    }
    
    if (findings.length > 0) {
      recommendations.push('Enable DLP policies for this asset');
      recommendations.push('Set up alerts for unusual access patterns');
    }

    return recommendations;
  }

  getRiskRecommendations(riskScore, asset) {
    const recommendations = [];
    
    if (riskScore > 70) {
      recommendations.push('Immediate review required');
      recommendations.push('Implement additional security controls');
    }
    
    if (!asset.encryption?.atRest) {
      recommendations.push('Enable encryption at rest');
    }
    
    if (!asset.encryption?.inTransit) {
      recommendations.push('Enable encryption in transit');
    }
    
    if (!asset.accessControl?.authentication || asset.accessControl.authentication.length === 0) {
      recommendations.push('Implement proper authentication');
    }

    return recommendations;
  }

  maskSensitiveData(data, type) {
    switch (type) {
      case 'ssn':
        return data.replace(/\d{3}-\d{2}-(\d{4})/, '***-**-$1');
      case 'credit-card':
        return data.replace(/\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?(\d{4})/, '****-****-****-$1');
      case 'email':
        return data.replace(/(.{2})(.*)(@.*)/, '$1***$3');
      default:
        return data.replace(/./g, (c, i) => i > 1 && i < data.length - 2 ? '*' : c);
    }
  }
}

module.exports = new DataProtectionService();
