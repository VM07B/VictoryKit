const express = require('express');
const { body, param, query } = require('express-validator');
const threatIntelController = require('../controllers/threatIntel.controller');
const analysisController = require('../controllers/analysis.controller');
const reportController = require('../controllers/report.controller');
const { validate } = require('../../../../shared/middleware/validation.middleware');

const router = express.Router();

// ============================================================================
// Threat Intelligence Routes
// ============================================================================

/**
 * @route   POST /api/v1/threat-intel
 * @desc    Create new threat intelligence
 * @access  Private
 */
router.post(
  '/threat-intel',
  [
    body('sourceType')
      .isIn(['osint', 'darkweb', 'social_media', 'threat_feed', 'honeypot', 'ioc', 'other'])
      .withMessage('Invalid source type'),
    body('threatType')
      .isIn(['malware', 'phishing', 'ransomware', 'apt', 'botnet', 'exploit', 'vulnerability', 'data_leak', 'other'])
      .withMessage('Invalid threat type'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    validate
  ],
  threatIntelController.createThreatIntel
);

/**
 * @route   GET /api/v1/threat-intel
 * @desc    Get all threat intelligence (paginated, filtered)
 * @access  Private
 */
router.get(
  '/threat-intel',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate
  ],
  threatIntelController.getThreatIntel
);

/**
 * @route   GET /api/v1/threat-intel/:id
 * @desc    Get threat intelligence by ID
 * @access  Private
 */
router.get(
  '/threat-intel/:id',
  [param('id').isMongoId().withMessage('Invalid threat intel ID'), validate],
  threatIntelController.getThreatIntelById
);

/**
 * @route   PATCH /api/v1/threat-intel/:id
 * @desc    Update threat intelligence
 * @access  Private
 */
router.patch(
  '/threat-intel/:id',
  [param('id').isMongoId().withMessage('Invalid threat intel ID'), validate],
  threatIntelController.updateThreatIntel
);

/**
 * @route   DELETE /api/v1/threat-intel/:id
 * @desc    Delete threat intelligence
 * @access  Private
 */
router.delete(
  '/threat-intel/:id',
  [param('id').isMongoId().withMessage('Invalid threat intel ID'), validate],
  threatIntelController.deleteThreatIntel
);

/**
 * @route   POST /api/v1/threat-intel/correlate
 * @desc    Correlate indicators across threats
 * @access  Private
 */
router.post(
  '/threat-intel/correlate',
  [body('indicators').isObject().withMessage('Indicators object required'), validate],
  threatIntelController.correlateIndicators
);

/**
 * @route   GET /api/v1/threat-intel/statistics
 * @desc    Get threat intelligence statistics
 * @access  Private
 */
router.get('/statistics', threatIntelController.getStatistics);

// ============================================================================
// Analysis Routes
// ============================================================================

/**
 * @route   POST /api/v1/analyses
 * @desc    Create new analysis
 * @access  Private
 */
router.post(
  '/analyses',
  [
    body('analysisType')
      .isIn(['threat_landscape', 'actor_profile', 'campaign_analysis', 'ioc_correlation', 'trend_analysis'])
      .withMessage('Invalid analysis type'),
    validate
  ],
  analysisController.createAnalysis
);

/**
 * @route   GET /api/v1/analyses
 * @desc    Get all analyses
 * @access  Private
 */
router.get(
  '/analyses',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate
  ],
  analysisController.getAllAnalyses
);

/**
 * @route   GET /api/v1/analyses/:id
 * @desc    Get analysis by ID
 * @access  Private
 */
router.get(
  '/analyses/:id',
  [param('id').isMongoId().withMessage('Invalid analysis ID'), validate],
  analysisController.getAnalysisById
);

/**
 * @route   DELETE /api/v1/analyses/:id
 * @desc    Delete analysis
 * @access  Private
 */
router.delete(
  '/analyses/:id',
  [param('id').isMongoId().withMessage('Invalid analysis ID'), validate],
  analysisController.deleteAnalysis
);

// ============================================================================
// Report Routes
// ============================================================================

/**
 * @route   POST /api/v1/reports
 * @desc    Generate new report
 * @access  Private
 */
router.post(
  '/reports',
  [
    body('reportType')
      .isIn(['daily', 'weekly', 'monthly', 'custom', 'incident', 'executive'])
      .withMessage('Invalid report type'),
    body('format')
      .optional()
      .isIn(['pdf', 'html', 'json', 'csv'])
      .withMessage('Invalid format'),
    validate
  ],
  reportController.generateReport
);

/**
 * @route   GET /api/v1/reports
 * @desc    Get all reports
 * @access  Private
 */
router.get(
  '/reports',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate
  ],
  reportController.getAllReports
);

/**
 * @route   GET /api/v1/reports/:id
 * @desc    Get report by ID
 * @access  Private
 */
router.get(
  '/reports/:id',
  [param('id').isMongoId().withMessage('Invalid report ID'), validate],
  reportController.getReportById
);

/**
 * @route   GET /api/v1/reports/:id/export
 * @desc    Export report
 * @access  Private
 */
router.get(
  '/reports/:id/export',
  [param('id').isMongoId().withMessage('Invalid report ID'), validate],
  reportController.exportReport
);

/**
 * @route   DELETE /api/v1/reports/:id
 * @desc    Delete report
 * @access  Private
 */
router.delete(
  '/reports/:id',
  [param('id').isMongoId().withMessage('Invalid report ID'), validate],
  reportController.deleteReport
);

module.exports = router;
