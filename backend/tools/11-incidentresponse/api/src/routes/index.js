/**
 * IncidentResponse API Routes
 */

const express = require("express");
const router = express.Router();

const incidentController = require("../controllers/incidentController");
const playbookController = require("../controllers/playbookController");
const taskController = require("../controllers/taskController");
const evidenceController = require("../controllers/evidenceController");
const forensicsController = require("../controllers/forensicsController");

// Incident routes
router.post("/incidents", incidentController.createIncident);
router.get("/incidents", incidentController.getIncidents);
router.get("/incidents/:id", incidentController.getIncident);
router.patch("/incidents/:id", incidentController.updateIncident);
router.post("/incidents/:id/escalate", incidentController.escalateIncident);
router.post("/incidents/:id/close", incidentController.closeIncident);
router.get("/incidents/:id/timeline", incidentController.getTimeline);
router.post("/incidents/:id/analyze", incidentController.analyzeIncident);

// Playbook routes
router.post("/playbooks", playbookController.createPlaybook);
router.get("/playbooks", playbookController.getPlaybooks);
router.get("/playbooks/:id", playbookController.getPlaybook);
router.put("/playbooks/:id", playbookController.updatePlaybook);
router.post("/playbooks/:id/execute", playbookController.executePlaybook);

// Task routes
router.get("/tasks", taskController.getTasks);
router.get("/tasks/:id", taskController.getTask);
router.patch("/tasks/:id", taskController.updateTask);
router.post("/tasks/:id/complete", taskController.completeTask);

// Evidence routes
router.post("/evidence", evidenceController.createEvidence);
router.get("/evidence", evidenceController.getEvidence);
router.get("/evidence/:id", evidenceController.getEvidenceById);
router.post("/evidence/:id/analyze", evidenceController.analyzeEvidence);

// Forensics routes
router.post(
  "/forensics/incidents/:id/analyze",
  forensicsController.analyzeIncident
);
router.post("/forensics/indicators", forensicsController.analyzeIndicators);
router.post(
  "/forensics/evidence/:id/analyze",
  forensicsController.analyzeEvidence
);
router.get(
  "/forensics/mitre/:techniqueId",
  forensicsController.getMitreTechnique
);
router.get(
  "/forensics/playbooks/templates",
  forensicsController.getPlaybookTemplates
);

// Dashboard
router.get("/dashboard", incidentController.getDashboard);

module.exports = router;
