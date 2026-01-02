const express = require('express');
const router = express.Router();
const specController = require('../controllers/specs.controller');

// GET /api/specs - Get all API specifications
router.get('/', specController.getSpecs);

// GET /api/specs/:id - Get spec by ID
router.get('/:id', specController.getSpec);

// POST /api/specs - Upload new spec
router.post('/', specController.uploadSpec);

// POST /api/specs/validate - Validate spec
router.post('/validate', specController.validateSpec);

// PUT /api/specs/:id - Update spec
router.put('/:id', specController.updateSpec);

// DELETE /api/specs/:id - Delete spec
router.delete('/:id', specController.deleteSpec);

// GET /api/specs/:id/endpoints - Get endpoints from spec
router.get('/:id/endpoints', specController.getSpecEndpoints);

module.exports = router;
