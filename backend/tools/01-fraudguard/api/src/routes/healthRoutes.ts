import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import axios from 'axios';

const router = Router();

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8001';
const AI_ASSISTANT_URL = process.env.AI_ASSISTANT_URL || 'http://localhost:6001';

// GET /health - Health check
router.get('/', async (req: Request, res: Response) => {
  const checks = {
    api: 'healthy',
    database: 'unknown',
    ml_engine: 'unknown',
    ai_assistant: 'unknown',
  };
  
  // Check MongoDB
  try {
    const mongoState = mongoose.connection.readyState;
    checks.database = mongoState === 1 ? 'healthy' : 'unhealthy';
  } catch {
    checks.database = 'unhealthy';
  }
  
  // Check ML Engine
  try {
    await axios.get(`${ML_ENGINE_URL}/health`, { timeout: 2000 });
    checks.ml_engine = 'healthy';
  } catch {
    checks.ml_engine = 'unavailable';
  }
  
  // Check AI Assistant
  try {
    await axios.get(`${AI_ASSISTANT_URL}/health`, { timeout: 2000 });
    checks.ai_assistant = 'healthy';
  } catch {
    checks.ai_assistant = 'unavailable';
  }
  
  const allHealthy = Object.values(checks).every(v => v === 'healthy' || v === 'unavailable');
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'operational' : 'degraded',
    timestamp: new Date().toISOString(),
    services: checks,
  });
});

// GET /health/live - Liveness probe
router.get('/live', (req: Request, res: Response) => {
  res.json({ status: 'alive' });
});

// GET /health/ready - Readiness probe
router.get('/ready', async (req: Request, res: Response) => {
  const mongoState = mongoose.connection.readyState;
  
  if (mongoState === 1) {
    res.json({ status: 'ready' });
  } else {
    res.status(503).json({ status: 'not ready', reason: 'Database not connected' });
  }
});

export default router;
