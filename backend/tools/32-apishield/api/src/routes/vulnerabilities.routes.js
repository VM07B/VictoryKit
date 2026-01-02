const express = require('express');
const router = express.Router();
const vulnerabilityController = require('../controllers/vulnerabilities.controller');

// GET /api/vulnerabilities - Get all vulnerabilities
router.get('/', vulnerabilityController.getVulnerabilities);

// GET /api/vulnerabilities/:id - Get vulnerability by ID
router.get('/:id', vulnerabilityController.getVulnerability);

// PUT /api/vulnerabilities/:id/status - Update vulnerability status
router.put('/:id/status', vulnerabilityController.updateVulnerabilityStatus);

// GET /api/vulnerabilities/stats - Get vulnerability statistics
router.get('/stats', vulnerabilityController.getVulnerabilityStats);

// GET /api/vulnerabilities/:id/remediation - Get remediation code
router.get('/:id/remediation', vulnerabilityController.getRemediationCode);

module.exports = router;
router.get('/stats', vulnerabilityController.getVulnerabilityStats);

module.exports = router;
