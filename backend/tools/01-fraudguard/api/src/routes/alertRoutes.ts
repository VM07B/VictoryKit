import { Router } from 'express';
import alertController from '../controllers/alertController.js';

const router = Router();

// GET /alerts - Get all alerts
router.get('/', alertController.getAll);

// POST /alerts - Create a new alert
router.post('/', alertController.create);

// GET /alerts/triggered - Get triggered alerts
router.get('/triggered', alertController.getTriggered);

// GET /alerts/:id - Get alert by ID
router.get('/:id', alertController.getById);

// PATCH /alerts/:id - Update an alert
router.patch('/:id', alertController.update);

// DELETE /alerts/:id - Delete an alert
router.delete('/:id', alertController.delete);

// POST /alerts/:id/toggle - Toggle alert active status
router.post('/:id/toggle', alertController.toggle);

export default router;
