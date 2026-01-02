const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', dashboardController.getStats);

// GET /api/dashboard/recent-scans - Get recent scans
router.get('/recent-scans', dashboardController.getRecentScans);

// GET /api/dashboard/vulnerabilities/summary - Get vulnerabilities summary
router.get('/vulnerabilities/summary', dashboardController.getVulnerabilitiesSummary);

// GET /api/dashboard/compliance/status - Get compliance status
router.get('/compliance/status', dashboardController.getComplianceStatus);

// GET /api/dashboard/activity - Get activity feed
router.get('/activity', dashboardController.getActivityFeed);

// GET /api/dashboard/alerts - Get active alerts
router.get('/alerts', dashboardController.getAlerts);

// POST /api/dashboard/alerts/:id/acknowledge - Acknowledge alert
router.post('/alerts/:id/acknowledge', dashboardController.acknowledgeAlert);

// GET /api/dashboard/reports/summary - Get reports summary
router.get('/reports/summary', dashboardController.getReportsSummary);

module.exports = router;
