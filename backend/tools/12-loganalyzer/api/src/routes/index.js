/**
 * LogAnalyzer API Routes
 */

const express = require("express");
const router = express.Router();

const logController = require("../controllers/logController");
const analysisController = require("../controllers/analysisController");
const alertController = require("../controllers/alertController");

// Log entry routes
router.post("/logs", logController.createLogEntry);
router.get("/logs", logController.getLogEntries);
router.get("/logs/:id", logController.getLogEntry);
router.patch("/logs/:id", logController.updateLogEntry);
router.delete("/logs/:id", logController.deleteLogEntry);
router.post("/logs/:id/analyze", logController.analyzeLogEntry);

// Analysis routes
router.post("/analysis", analysisController.createAnalysis);
router.get("/analysis", analysisController.getAnalyses);
router.get("/analysis/:id", analysisController.getAnalysis);
router.get("/analysis/summary", analysisController.getAnalysisSummary);

// Alert routes
router.post("/alerts", alertController.createAlert);
router.get("/alerts", alertController.getAlerts);
router.get("/alerts/:id", alertController.getAlert);
router.patch("/alerts/:id", alertController.updateAlert);
router.delete("/alerts/:id", alertController.deleteAlert);
router.post("/alerts/:id/test", alertController.testAlert);

module.exports = router;
