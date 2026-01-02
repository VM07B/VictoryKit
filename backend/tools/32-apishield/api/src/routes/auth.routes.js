const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// POST /api/auth/test - Test authentication
router.post('/test', authController.testAuth);

// POST /api/auth/jwt/analyze - Analyze JWT token
router.post('/jwt/analyze', authController.analyzeJWT);

// POST /api/auth/api-key/test - Test API key
router.post('/api-key/test', authController.testApiKey);

// POST /api/auth/oauth/test - Test OAuth flow
router.post('/oauth/test', authController.testOAuth);

// GET /api/auth/methods - Get supported auth methods
router.get('/methods', authController.getAuthMethods);

// POST /api/auth/session - Create auth session
router.post('/session', authController.createAuthSession);

// GET /api/auth/session/:id - Get auth session
router.get('/session/:id', authController.getAuthSession);

// DELETE /api/auth/session/:id - Delete auth session
router.delete('/session/:id', authController.deleteAuthSession);

module.exports = router;
