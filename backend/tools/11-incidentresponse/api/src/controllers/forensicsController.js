/**
 * Forensics Controller
 * Coordinates advanced incident forensics using the ML engine
 */

const Incident = require("../models/Incident");
const Evidence = require("../models/Evidence");
const forensicsService = require("../services/forensicsService");

// Analyze an incident end-to-end via ML engine
exports.analyzeIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res
        .status(404)
        .json({ success: false, error: "Incident not found" });
    }

    const analysis = await forensicsService.analyzeIncident(incident);

    // Persist classification if returned
    if (analysis?.classification) {
      incident.classification = analysis.classification;
    }

    // Add timeline entry
    incident.timeline.push({
      event: "Forensics analysis completed",
      actor: req.user?.id || "ml-engine",
      details: {
        threat_level: analysis?.threat_level,
        suggested_playbooks: analysis?.suggested_playbooks,
      },
    });

    await incident.save();

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Analyze a list of indicators
exports.analyzeIndicators = async (req, res) => {
  try {
    const { indicators = [], incidentId } = req.body;
    if (!Array.isArray(indicators) || indicators.length === 0) {
      return res.status(400).json({
        success: false,
        error: "indicators array is required",
      });
    }

    const analysis = await forensicsService.analyzeIndicators(indicators);

    if (incidentId) {
      await Incident.findByIdAndUpdate(incidentId, {
        $push: {
          timeline: {
            event: "Indicators analyzed",
            actor: req.user?.id || "ml-engine",
            details: { count: indicators.length },
          },
        },
      });
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Analyze a specific evidence item (wrapper around ML engine)
exports.analyzeEvidence = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id);

    if (!evidence) {
      return res
        .status(404)
        .json({ success: false, error: "Evidence not found" });
    }

    const analysis = await forensicsService.analyzeEvidence(evidence);

    evidence.analysis = {
      status: "completed",
      findings: analysis.findings || [],
      artifacts: analysis.artifacts || [],
      analyzedBy: req.user?.id,
      analyzedAt: new Date(),
    };

    evidence.chainOfCustody.push({
      action: "Evidence analyzed (forensics)",
      actor: req.user?.id || "ml-engine",
      notes: analysis.summary || "",
    });

    await evidence.save();

    if (evidence.incidentId) {
      await Incident.findByIdAndUpdate(evidence.incidentId, {
        $push: {
          timeline: {
            event: `Evidence ${evidence.evidenceId} forensics analysis`,
            actor: req.user?.id || "ml-engine",
            details: { findings: analysis.findings?.length || 0 },
          },
        },
      });
    }

    res.json({ success: true, data: { evidence, analysis } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Fetch MITRE technique details
exports.getMitreTechnique = async (req, res) => {
  try {
    const technique = await forensicsService.getMitreTechnique(
      req.params.techniqueId
    );
    res.json({ success: true, data: technique });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Fetch playbook templates from ML engine (for UI suggestions)
exports.getPlaybookTemplates = async (_req, res) => {
  try {
    const templates = await forensicsService.getPlaybookTemplates();
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
