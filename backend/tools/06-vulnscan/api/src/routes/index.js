const express = require('express');
const { body, query, param } = require('express-validator');
const { validate, authenticate } = require('../../../../shared');
const scanController = require('../controllers/scan.controller');
const vulnerabilityController = require('../controllers/vulnerability.controller');
const reportController = require('../controllers/report.controller');

const router = express.Router();
router.use(authenticate);

// Scan routes
router.post('/scans', validate([
  body('targetType').isIn(['network', 'web_application', 'host', 'container', 'cloud', 'api']),
  body('targetIdentifier').isString().notEmpty(),
  body('scanType').optional().isIn(['full', 'quick', 'compliance', 'authenticated', 'unauthenticated'])
]), scanController.createScan);

router.get('/scans', validate([query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 })]), scanController.getAllScans);
router.get('/scans/:id', validate([param('id').isMongoId()]), scanController.getScanById);
router.delete('/scans/:id', validate([param('id').isMongoId()]), scanController.deleteScan);
router.get('/scans/statistics', validate([query('startDate').optional().isISO8601(), query('endDate').optional().isISO8601()]), scanController.getStatistics);

// Vulnerability routes
router.get('/vulnerabilities', validate([query('page').optional().isInt({ min: 1 }), query('severity').optional().isIn(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'])]), vulnerabilityController.getAllVulnerabilities);
router.get('/vulnerabilities/:id', validate([param('id').isMongoId()]), vulnerabilityController.getVulnerabilityById);
router.patch('/vulnerabilities/:id', validate([param('id').isMongoId()]), vulnerabilityController.updateVulnerability);
router.delete('/vulnerabilities/:id', validate([param('id').isMongoId()]), vulnerabilityController.deleteVulnerability);

// Report routes
router.post('/reports/generate', validate([
  body('reportType').isIn(['scan_summary', 'compliance', 'trending', 'executive', 'technical']),
  body('format').optional().isIn(['pdf', 'html', 'json'])
]), reportController.generateReport);

router.get('/reports/:id', validate([param('id').isMongoId()]), reportController.getReportById);
router.get('/reports', validate([query('page').optional().isInt({ min: 1 })]), reportController.getAllReports);
router.get('/reports/:id/export', validate([param('id').isMongoId()]), reportController.exportReport);
router.delete('/reports/:id', validate([param('id').isMongoId()]), reportController.deleteReport);

module.exports = router;
