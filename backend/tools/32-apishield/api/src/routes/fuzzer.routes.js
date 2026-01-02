const express = require('express');
const router = express.Router();
const fuzzerController = require('../controllers/fuzzer.controller');

// POST /api/fuzzer/start - Start fuzzing session
router.post('/start', fuzzerController.startFuzzing);

// POST /api/fuzzer/stop - Stop fuzzing session
router.post('/stop', fuzzerController.stopFuzzing);

// GET /api/fuzzer/status/:sessionId - Get fuzzing status
router.get('/status/:sessionId', fuzzerController.getFuzzingStatus);

// GET /api/fuzzer/results/:sessionId - Get fuzzing results
router.get('/results/:sessionId', fuzzerController.getFuzzingResults);

// POST /api/fuzzer/payloads - Generate custom payloads
router.post('/payloads', fuzzerController.generatePayloads);

// GET /api/fuzzer/payloads/categories - Get payload categories
router.get('/payloads/categories', fuzzerController.getPayloadCategories);

// POST /api/fuzzer/test - Test single payload
router.post('/test', fuzzerController.testPayload);

module.exports = router;
