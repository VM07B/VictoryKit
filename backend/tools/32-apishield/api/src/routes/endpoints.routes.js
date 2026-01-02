const express = require('express');
const router = express.Router();
const endpointController = require('../controllers/endpoints.controller');

// GET /api/endpoints - Get all endpoints
router.get('/', endpointController.getEndpoints);

// GET /api/endpoints/:id - Get endpoint by ID
router.get('/:id', endpointController.getEndpoint);

// PUT /api/endpoints/:id - Update endpoint
router.put('/:id', endpointController.updateEndpoint);

// GET /api/endpoints/stats - Get endpoint statistics
router.get('/stats', endpointController.getEndpointStats);

// GET /api/endpoints/:id/vulnerabilities - Get vulnerabilities for endpoint
router.get('/:id/vulnerabilities', endpointController.getEndpointVulnerabilities);

module.exports = router;
