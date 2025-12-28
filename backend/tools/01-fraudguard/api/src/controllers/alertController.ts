import { Request, Response, NextFunction } from 'express';
import Alert, { IAlert } from '../models/Alert.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';

const AlertSchema = z.object({
  alert_type: z.enum(['high_risk_transaction', 'suspicious_pattern', 'velocity_breach', 'unusual_location']),
  threshold: z.number().min(0).max(100).default(70),
  notification_channels: z.array(z.enum(['email', 'webhook', 'sms', 'slack'])).default(['email']),
  active: z.boolean().default(true),
  webhook_url: z.string().url().optional(),
  email_recipients: z.array(z.string().email()).optional(),
  slack_channel: z.string().optional(),
});

export const alertController = {
  // Get all alerts
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const alerts = await Alert.find().sort({ created_at: -1 }).lean();
      res.json(alerts);
    } catch (error) {
      next(error);
    }
  },

  // Create a new alert
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = AlertSchema.parse(req.body);
      
      const alert = new Alert(validatedData);
      await alert.save();
      
      logger.info(`Alert created: ${alert.alert_type} with threshold ${alert.threshold}`);
      
      res.status(201).json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.errors,
        });
      }
      next(error);
    }
  },

  // Get alert by ID
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const alert = await Alert.findById(req.params.id).lean();
      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }
      res.json(alert);
    } catch (error) {
      next(error);
    }
  },

  // Update an alert
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updateData = AlertSchema.partial().parse(req.body);
      
      const alert = await Alert.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );
      
      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }
      
      logger.info(`Alert ${req.params.id} updated`);
      
      res.json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.errors,
        });
      }
      next(error);
    }
  },

  // Delete an alert
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const alert = await Alert.findByIdAndDelete(req.params.id);
      
      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }
      
      logger.info(`Alert ${req.params.id} deleted`);
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  // Toggle alert active status
  async toggle(req: Request, res: Response, next: NextFunction) {
    try {
      const { active } = req.body;
      
      if (typeof active !== 'boolean') {
        return res.status(400).json({ error: 'active must be a boolean' });
      }
      
      const alert = await Alert.findByIdAndUpdate(
        req.params.id,
        { active },
        { new: true }
      );
      
      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }
      
      logger.info(`Alert ${req.params.id} ${active ? 'activated' : 'deactivated'}`);
      
      res.json(alert);
    } catch (error) {
      next(error);
    }
  },

  // Get triggered alerts
  async getTriggered(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = 50, start_date, end_date } = req.query;
      
      const query: any = { triggered_count: { $gt: 0 } };
      
      if (start_date || end_date) {
        query.last_triggered_at = {};
        if (start_date) query.last_triggered_at.$gte = new Date(start_date as string);
        if (end_date) query.last_triggered_at.$lte = new Date(end_date as string);
      }
      
      const alerts = await Alert.find(query)
        .sort({ last_triggered_at: -1 })
        .limit(Number(limit))
        .lean();
      
      res.json(alerts);
    } catch (error) {
      next(error);
    }
  },
};

export default alertController;
