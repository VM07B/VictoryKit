const express = require('express');
const { body, param, query } = require('express-validator');
const threatController = require('../controllers/threat.controller');
const detectionController = require('../controllers/detection.controller');
const reportController = require('../controllers/report.controller');
const { validate } = require('../../../../shared/middleware/validation.middleware');

const router = express.Router();

// ============================================================================
// Threat Routes
// ============================================================================

router.post(
  '/threats',
  [
    body('detectionSource')
      .isIn(['network', 'endpoint', 'email', 'web', 'cloud', 'iot', 'other'])
      .withMessage('Invalid detection source'),
    body('threatType')
      .isIn(['malware', 'intrusion', 'ddos', 'data_exfiltration', 'unauthorized_access', 'anomaly', 'other'])
      .withMessage('Invalid threat type'),
    validate
  ],
  threatController.createThreat
);

router.get(
  '/threats',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate
  ],
  threatController.getAllThreats
);

router.get(
  '/threats/:id',
  [param('id').isMongoId().withMessage('Invalid threat ID'), validate],
  threatController.getThreatById
);

router.patch(
  '/threats/:id',
  [param('id').isMongoId().withMessage('Invalid threat ID'), validate],
  threatController.updateThreat
);

router.delete(
  '/threats/:id',
  [param('id').isMongoId().withMessage('Invalid threat ID'), validate],
  threatController.deleteThreat
);

router.get('/statistics', threatController.getStatistics);

// ============================================================================
// Detection Routes
// ============================================================================

router.post(
  '/detections',
  [
    body('detectionType')
      .isIn(['signature', 'behavioral', 'anomaly', 'heuristic', 'ml_based'])
      .withMessage('Invalid detection type'),
    validate
  ],
  detectionController.createDetection
);

router.get(
  '/detections',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate
  ],
  detectionController.getAllDetections
);

router.get(
  '/detections/:id',
  [param('id').isMongoId().withMessage('Invalid detection ID'), validate],
  detectionController.getDetectionById
);

router.delete(
  '/detections/:id',
  [param('id').isMongoId().withMessage('Invalid detection ID'), validate],
  detectionController.deleteDetection
);

// ============================================================================
// Report Routes
// ============================================================================

router.post(
  '/reports',
  [
    body('reportType')
      .isIn(['realtime', 'hourly', 'daily', 'weekly', 'incident', 'summary'])
      .withMessage('Invalid report type'),
    body('format')
      .optional()
      .isIn(['pdf', 'html', 'json'])
      .withMessage('Invalid format'),
    validate
  ],
  reportController.generateReport
);

router.get(
  '/reports',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    validate
  ],
  reportController.getAllReports
);

router.get(
  '/reports/:id',
  [param('id').isMongoId().withMessage('Invalid report ID'), validate],
  reportController.getReportById
);

router.get(
  '/reports/:id/export',
  [param('id').isMongoId().withMessage('Invalid report ID'), validate],
  reportController.exportReport
);

router.delete(
  '/reports/:id',
  [param('id').isMongoId().withMessage('Invalid report ID'), validate],
  reportController.deleteReport
);

module.exports = router;
