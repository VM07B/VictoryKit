import { Router } from 'express';
import fraudScoreController from '../controllers/fraudScoreController.js';

const router = Router();

// GET /fraud-scores/:id - Get fraud score for a transaction
router.get('/:id', fraudScoreController.getScore);

// GET /fraud-scores/:id/history - Get fraud score history
router.get('/:id/history', fraudScoreController.getHistory);

// GET /fraud-scores/averages - Get average scores by time period
router.get('/stats/averages', fraudScoreController.getAverages);

// GET /fraud-scores/distribution - Get score distribution
router.get('/stats/distribution', fraudScoreController.getDistribution);

export default router;
