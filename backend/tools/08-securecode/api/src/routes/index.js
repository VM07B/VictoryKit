const express = require('express');
const router = express.Router();

const codebaseController = require('../controllers/codebaseController');
const scanController = require('../controllers/scanController');
const issueController = require('../controllers/issueController');

// Codebase routes
router.post('/codebases', codebaseController.create);
router.get('/codebases', codebaseController.list);
router.get('/codebases/:id', codebaseController.get);
router.put('/codebases/:id', codebaseController.update);
router.delete('/codebases/:id', codebaseController.delete);
router.post('/codebases/:id/sync', codebaseController.sync);

// Scan routes
router.post('/scans', scanController.create);
router.get('/scans', scanController.list);
router.get('/scans/:id', scanController.get);
router.post('/scans/:id/execute', scanController.execute);
router.get('/scans/:id/status', scanController.status);

// Issue routes
router.get('/issues', issueController.list);
router.get('/issues/:id', issueController.get);
router.put('/issues/:id', issueController.update);
router.get('/issues/:id/fix', issueController.getFix);
router.get('/reports/:scanId', issueController.report);

module.exports = router;
