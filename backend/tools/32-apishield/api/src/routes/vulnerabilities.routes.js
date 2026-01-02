const express = require('express');
const router = express.Router();
const vulnerabilityController = require('../controllers/vulnerabilities.controller');

// GET /api/vulnerabilities - Get all vulnerabilities
router.get('/', vulnerabilityController.getVulnerabilities);

// GET /api/vulnerabilities/:id - Get vulnerability by ID
router.get('/:id', vulnerabilityController.getVulnerability);

// PUT /api/vulnerabilities/:id - Update vulnerability
router.put('/:id', vulnerabilityController.updateVulnerability);

// PUT /api/vulnerabilities/bulk - Bulk update vulnerabilities
router.put('/bulk', vulnerabilityController.bulkUpdateVulnerabilities);

// DELETE /api/vulnerabilities/:id - Delete vulnerability
router.delete('/:id', vulnerabilityController.deleteVulnerability);

// GET /api/vulnerabilities/stats - Get vulnerability statistics
router.get('/stats', vulnerabilityController.getVulnerabilityStats);

module.exports = router;
