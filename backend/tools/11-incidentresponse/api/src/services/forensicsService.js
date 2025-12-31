/**
 * Forensics Service
 * Wraps ML engine calls for incident forensics, indicator analysis, and MITRE lookup
 */

const axios = require("axios");

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://localhost:8011";

class ForensicsService {
  async analyzeIncident(incident) {
    try {
      const { data } = await axios.post(`${ML_ENGINE_URL}/classify/incident`, {
        title: incident.title,
        description: incident.description,
        indicators: incident.indicators,
        affectedAssets: incident.affectedAssets,
        timeline: incident.timeline,
      });

      return data;
    } catch (error) {
      return this._handleError("analyze incident", error, {
        classification: {
          type: "other",
          category: "Unknown",
          techniques: [],
          confidence: 50,
        },
        threat_level: "MEDIUM",
        recommendations: [
          "Gather additional indicators and rerun analysis",
          "Validate containment of affected assets",
          "Document investigative steps in the timeline",
        ],
        suggested_playbooks: ["General Incident Response"],
      });
    }
  }

  async analyzeIndicators(indicators = []) {
    try {
      const { data } = await axios.post(
        `${ML_ENGINE_URL}/analyze/indicators`,
        indicators
      );
      return data;
    } catch (error) {
      return this._handleError("analyze indicators", error, {
        indicators: indicators.map((indicator) => ({
          ...indicator,
          risk_score: 40,
          malicious: false,
          findings: ["Offline analysis fallback"],
        })),
      });
    }
  }

  async analyzeEvidence(evidence) {
    try {
      const { data } = await axios.post(`${ML_ENGINE_URL}/analyze/evidence`, {
        type: evidence.type,
        name: evidence.name,
        description: evidence.description,
        source: evidence.source,
        storage: evidence.storage,
      });
      return data;
    } catch (error) {
      return this._handleError("analyze evidence", error, {
        findings: ["Evidence collected; deferred to manual analysis"],
        artifacts: [],
        recommendations: [
          "Preserve chain of custody",
          "Store evidence securely",
          "Perform manual review with forensic toolkit",
        ],
        summary: `Fallback analysis for ${evidence.type}: ${evidence.name}`,
      });
    }
  }

  async getMitreTechnique(techniqueId) {
    try {
      const { data } = await axios.get(
        `${ML_ENGINE_URL}/mitre/techniques/${techniqueId}`
      );
      return data;
    } catch (error) {
      return this._handleError("fetch MITRE technique", error, {
        id: techniqueId,
        name: "Unknown technique",
        description: "Offline fallback description not available",
      });
    }
  }

  async getPlaybookTemplates() {
    try {
      const { data } = await axios.get(`${ML_ENGINE_URL}/playbooks/templates`);
      return data;
    } catch (error) {
      return this._handleError("fetch playbook templates", error, []);
    }
  }

  _handleError(action, error, fallback) {
    console.error(`ForensicsService failed to ${action}:`, error.message);
    return fallback;
  }
}

module.exports = new ForensicsService();
