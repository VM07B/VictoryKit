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
router.post('/:id/start', scanController.startScan);

// POST /api/scans/:id/stop - Stop scan
router.post('/:id/stop', scanController.stopScan);

// POST /api/scans/:id/report - Generate report
router.post('/:id/report', scanController.generateReport);

// GET /api/scans/:id/report/download - Download report
router.get('/:id/report/download', scanController.downloadReport);

module.exports = router;
