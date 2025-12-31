const axios = require('axios');
const logger = require('../../../../../shared/utils/logger');
const { getConnectors } = require('../../../../../shared/connectors');

class MLService {
  constructor() {
    this.mlEngineUrl = process.env.ML_ENGINE_URL || 'http://localhost:8006';
  }

  async analyzeScan(scanData) {
    try {
      const response = await axios.post(`${this.mlEngineUrl}/analyze`, scanData, { timeout: 10000 });
      return response.data;
    } catch (error) {
      logger.warn('ML engine unavailable, using rule-based');
      return this.ruleBasedAnalysis(scanData);
    }
  }

  async predictExploit(vulnData) {
    try {
      const response = await axios.post(`${this.mlEngineUrl}/exploit-prediction`, vulnData, { timeout: 5000 });
      return response.data;
    } catch (error) {
      return { available: false, confidence: 0 };
    }
  }

  ruleBasedAnalysis(data) {
    const { vulnerabilities } = data;
    const critical = vulnerabilities.filter(v => v.cvssScore >= 9).length;
    const high = vulnerabilities.filter(v => v.cvssScore >= 7 && v.cvssScore < 9).length;

    let riskLevel = 'LOW';
    if (critical > 0) riskLevel = 'CRITICAL';
    else if (high > 3) riskLevel = 'HIGH';
    else if (high > 0) riskLevel = 'MEDIUM';

    return {
      riskLevel,
      confidence: 80,
      recommendations: ['Patch critical vulnerabilities', 'Review high-severity findings', 'Implement defense controls'],
      timestamp: new Date()
    };
  }

  // Integration with external security stack
  async integrateWithSecurityStack(scanId, scanData) {
    try {
      const connectors = getConnectors();
      const integrationPromises = [];

      // Microsoft Sentinel - Log vulnerability scan results
      if (connectors.sentinel) {
        integrationPromises.push(
          connectors.sentinel.ingestData({
            table: 'VulnerabilityScan_CL',
            data: {
              ScanId: scanId,
              Target: scanData.target,
              ScanType: scanData.scanType,
              CriticalVulns: scanData.criticalCount,
              HighVulns: scanData.highCount,
              RiskLevel: scanData.riskLevel,
              Timestamp: new Date().toISOString(),
              Source: 'VulnScan'
            }
          }).catch(err => logger.warn('Sentinel integration failed:', err.message))
        );
      }

      // Cortex XSOAR - Create incident for critical vulnerabilities
      if (connectors.cortexXSOAR && scanData.criticalCount > 0) {
        integrationPromises.push(
          connectors.cortexXSOAR.createIncident({
            name: `Critical Vulnerabilities Found - ${scanId}`,
            type: 'Vulnerability',
            severity: 'Critical',
            details: {
              scanId,
              target: scanData.target,
              criticalCount: scanData.criticalCount,
              highCount: scanData.highCount,
              riskLevel: scanData.riskLevel
            }
          }).catch(err => logger.warn('XSOAR integration failed:', err.message))
        );
      }

      // CrowdStrike - Check for exploit protection
      if (connectors.crowdstrike && scanData.criticalCount > 0) {
        integrationPromises.push(
          connectors.crowdstrike.getDeviceVulnerabilities({
            target: scanData.target
          }).then(vulns => {
            if (vulns.length > 0) {
              logger.info(`Found ${vulns.length} device vulnerabilities for ${scanData.target}`);
            }
          }).catch(err => logger.warn('CrowdStrike vulnerability check failed:', err.message))
        );
      }

      // OpenCTI - Check for known exploits
      if (connectors.opencti) {
        const vulnPromises = scanData.vulnerabilities?.map(vuln =>
          connectors.opencti.searchIndicators({
            pattern: vuln.cve || vuln.name,
            pattern_type: 'cve'
          }).catch(err => logger.warn('OpenCTI CVE lookup failed:', err.message))
        ) || [];

        integrationPromises.push(...vulnPromises);
      }

      await Promise.allSettled(integrationPromises);
      logger.info('VulnScan security stack integration completed');

    } catch (error) {
      logger.error('VulnScan integration error:', error);
    }
  }
}

module.exports = new MLService();
