import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8001';

// GET /ml/model-info - Get ML model information
router.get('/model-info', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${ML_ENGINE_URL}/model-info`);
    res.json(response.data);
  } catch (error) {
    res.status(503).json({
      error: 'ML Engine unavailable',
      model_version: '1.0.0-rules',
      status: 'fallback',
      message: 'Using rule-based analysis',
    });
  }
});

// GET /ml/explain/:id - Explain prediction for a transaction
router.get('/explain/:id', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${ML_ENGINE_URL}/explain/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(503).json({
      error: 'ML Engine unavailable',
      message: 'Explanation not available in fallback mode',
    });
  }
});

// POST /ml/detect-anomalies - Detect anomalies in transactions
router.post('/detect-anomalies', async (req: Request, res: Response) => {
  try {
    const response = await axios.post(`${ML_ENGINE_URL}/detect-anomalies`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(503).json({
      error: 'ML Engine unavailable',
      message: 'Anomaly detection not available in fallback mode',
    });
  }
});

// POST /ml/retrain - Trigger model retraining (admin only)
router.post('/retrain', async (req: Request, res: Response) => {
  try {
    const response = await axios.post(`${ML_ENGINE_URL}/retrain`);
    res.json(response.data);
  } catch (error) {
    res.status(503).json({
      error: 'ML Engine unavailable',
      message: 'Model retraining not available',
    });
  }
});

export default router;
