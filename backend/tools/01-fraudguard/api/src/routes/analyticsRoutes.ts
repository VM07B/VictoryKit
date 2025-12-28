import { Router } from 'express';
import analyticsController from '../controllers/analyticsController.js';

const router = Router();

// GET /analytics/dashboard - Get dashboard analytics
router.get('/dashboard', analyticsController.getDashboard);

// GET /analytics/risk-breakdown - Get risk breakdown
router.get('/risk-breakdown', analyticsController.getRiskBreakdown);

// GET /analytics/timeline - Get transaction timeline
router.get('/timeline', analyticsController.getTimeline);

// GET /analytics/geo-distribution - Get geographic distribution
router.get('/geo-distribution', analyticsController.getGeoDistribution);

// GET /analytics/fraud-patterns - Get fraud patterns
router.get('/fraud-patterns', analyticsController.getFraudPatterns);

export default router;
