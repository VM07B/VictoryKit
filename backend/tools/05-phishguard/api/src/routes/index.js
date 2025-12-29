const express = require('express');
const { body, query, param } = require('express-validator');
const { validate, authenticate } = require('../../../../shared');
const urlController = require('../controllers/url.controller');
const analysisController = require('../controllers/analysis.controller');
const reportController = require('../controllers/report.controller');

const router = express.Router();

router.use(authenticate);

// URL routes
router.post('/urls/check',
  validate([body('url').isURL()]),
  urlController.checkUrl
);

router.post('/urls/batch',
  validate([body('urls').isArray(), body('urls.*').isURL()]),
  urlController.checkBatch
);

router.get('/urls',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('isPhishing').optional().isBoolean(),
    query('severity').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  ]),
  urlController.getAllUrls
);

router.get('/urls/:id',
  validate([param('id').isMongoId()]),
  urlController.getUrlById
);

router.delete('/urls/:id',
  validate([param('id').isMongoId()]),
  urlController.deleteUrl
);

router.get('/urls/statistics',
  validate([
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ]),
  urlController.getStatistics
);

// Analysis routes
router.post('/analyses',
  validate([
    body('analysisType').isIn(['domain_analysis', 'url_batch', 'threat_intelligence', 'pattern_detection', 'campaign_analysis']),
    body('timeRange').optional().isObject()
  ]),
  analysisController.createAnalysis
);

router.get('/analyses/:id',
  validate([param('id').isMongoId()]),
  analysisController.getAnalysisById
);

router.get('/analyses',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ]),
  analysisController.getAllAnalyses
);

router.delete('/analyses/:id',
  validate([param('id').isMongoId()]),
  analysisController.deleteAnalysis
);

// Report routes
router.post('/reports/generate',
  validate([
    body('reportType').isIn(['daily', 'weekly', 'monthly', 'campaign', 'incident', 'executive']),
    body('title').optional().isString(),
    body('timeRange').optional().isObject(),
    body('format').optional().isIn(['pdf', 'html', 'json'])
  ]),
  reportController.generateReport
);

router.get('/reports/:id',
  validate([param('id').isMongoId()]),
  reportController.getReportById
);

router.get('/reports',
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ]),
  reportController.getAllReports
);

router.get('/reports/:id/export',
  validate([param('id').isMongoId()]),
  reportController.exportReport
);

router.delete('/reports/:id',
  validate([param('id').isMongoId()]),
  reportController.deleteReport
);

module.exports = router;
