const express = require('express');
const router = express.Router();
const controller = require('../controllers');

router.get('/status', controller.getStatus);
router.post('/analyze', controller.analyze);
router.get('/reports', controller.getReports);
router.get('/reports/:id', controller.getReportById);
router.post('/scan', controller.scan);
router.get('/config', controller.getConfig);
router.put('/config', controller.updateConfig);

module.exports = router;
