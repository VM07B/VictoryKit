const express = require('express');
const router = express.Router();

const frameworkController = require('../controllers/frameworkController');
const auditController = require('../controllers/auditController');
const controlController = require('../controllers/controlController');

// Framework routes
router.get('/frameworks', frameworkController.list);
router.get('/frameworks/:name', frameworkController.get);
router.get('/frameworks/:name/controls', frameworkController.getControls);
router.post('/frameworks/compare', frameworkController.compare);

// Audit routes
router.post('/audits', auditController.create);
router.get('/audits', auditController.list);
router.get('/audits/:id', auditController.get);
router.put('/audits/:id', auditController.update);
router.delete('/audits/:id', auditController.delete);
router.post('/audits/:id/assess', auditController.assess);
router.get('/audits/:id/report', auditController.report);

// Control routes
router.get('/controls', controlController.list);
router.get('/controls/:id', controlController.get);
router.put('/controls/:id', controlController.update);
router.post('/controls/:id/assess', controlController.assess);
router.post('/controls/:id/evidence', controlController.addEvidence);
router.post('/controls/bulk-update', controlController.bulkUpdate);

module.exports = router;
