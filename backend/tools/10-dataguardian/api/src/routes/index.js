const express = require('express');
const router = express.Router();

const assetController = require('../controllers/assetController');
const policyController = require('../controllers/policyController');
const incidentController = require('../controllers/incidentController');

// Asset routes
router.post('/assets', assetController.create);
router.get('/assets', assetController.list);
router.get('/assets/:id', assetController.get);
router.put('/assets/:id', assetController.update);
router.delete('/assets/:id', assetController.delete);
router.post('/assets/:id/classify', assetController.classify);
router.get('/assets/:id/risk', assetController.assessRisk);
router.post('/scan/pii', assetController.scanPII);

// Policy routes
router.post('/policies', policyController.create);
router.get('/policies', policyController.list);
router.get('/policies/:id', policyController.get);
router.put('/policies/:id', policyController.update);
router.delete('/policies/:id', policyController.delete);
router.post('/policies/:id/activate', policyController.activate);
router.post('/policies/:id/evaluate', policyController.evaluate);
router.get('/policies/:id/violations', policyController.getViolations);

// Incident routes
router.post('/incidents', incidentController.create);
router.get('/incidents', incidentController.list);
router.get('/incidents/dashboard', incidentController.dashboard);
router.get('/incidents/:id', incidentController.get);
router.put('/incidents/:id', incidentController.update);
router.post('/incidents/:id/actions', incidentController.addAction);
router.post('/incidents/:id/analyze', incidentController.analyze);

module.exports = router;
