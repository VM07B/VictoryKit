const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scan.controller');

// GET /api/scans - Get all scans
router.get('/', scanController.listScans);

// GET /api/scans/:id/status - Get scan status
router.get('/:id/status', scanController.getScanStatus);

// GET /api/scans/:id/results - Get scan results
router.get('/:id/results', scanController.getScanResults);

// POST /api/scans - Start new scan
router.post('/', scanController.startScan);

// POST /api/scans/:id/cancel - Cancel scan
router.post('/:id/cancel', scanController.cancelScan);

module.exports = router;
