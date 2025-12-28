import { Router } from 'express';
import transactionController from '../controllers/transactionController.js';

const router = Router();

// POST /transactions/analyze - Analyze a transaction for fraud
router.post('/analyze', transactionController.analyze);

// POST /transactions/batch-analyze - Batch analyze multiple transactions
router.post('/batch-analyze', transactionController.batchAnalyze);

// GET /transactions - Get all transactions
router.get('/', transactionController.getAll);

// GET /transactions/:id - Get a single transaction by ID
router.get('/:id', transactionController.getById);

// PATCH /transactions/:id/status - Update transaction status
router.patch('/:id/status', transactionController.updateStatus);

export default router;
