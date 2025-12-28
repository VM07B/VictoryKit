const express = require('express');
const { body, param } = require('express-validator');
const paymentController = require('../controllers/payment.controller');
const { validate } = require('../../../../shared/middleware/validation.middleware');
const { authMiddleware } = require('../../../../shared/middleware/auth.middleware');
const { apiLimiter } = require('../../../../shared/middleware/rateLimiter.middleware');

const router = express.Router();

// All payment routes require authentication
router.use(authMiddleware);

// Purchase tool access (create payment intent)
router.post(
  '/purchase',
  apiLimiter,
  [
    body('toolId').notEmpty().isString().withMessage('Tool ID is required'),
    validate
  ],
  paymentController.purchaseToolAccess
);

// Confirm payment and grant access
router.post(
  '/confirm',
  apiLimiter,
  [
    body('paymentIntentId').notEmpty().isString().withMessage('Payment Intent ID is required'),
    validate
  ],
  paymentController.confirmPayment
);

// Get my tool access
router.get(
  '/my-access',
  apiLimiter,
  paymentController.getMyAccess
);

// Check access to specific tool
router.get(
  '/check-access/:toolId',
  apiLimiter,
  [
    param('toolId').notEmpty().isString(),
    validate
  ],
  paymentController.checkAccess
);

// Get all available tools
router.get(
  '/tools',
  apiLimiter,
  paymentController.getAvailableTools
);

// Get payment history
router.get(
  '/history',
  apiLimiter,
  paymentController.getPaymentHistory
);

module.exports = router;
