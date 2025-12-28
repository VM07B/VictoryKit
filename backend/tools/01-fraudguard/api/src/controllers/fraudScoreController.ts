import { Request, Response, NextFunction } from 'express';
import FraudScore from '../models/FraudScore.js';

export const fraudScoreController = {
  // Get fraud score for a transaction
  async getScore(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const score = await FraudScore.findOne({ transaction_id: id }).lean();
      if (!score) {
        return res.status(404).json({ error: 'Fraud score not found' });
      }
      
      res.json(score);
    } catch (error) {
      next(error);
    }
  },

  // Get fraud score history (for re-analyzed transactions)
  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const scores = await FraudScore.find({ transaction_id: id })
        .sort({ created_at: -1 })
        .lean();
      
      res.json(scores);
    } catch (error) {
      next(error);
    }
  },

  // Get average scores by time period
  async getAverages(req: Request, res: Response, next: NextFunction) {
    try {
      const { period = 'day' } = req.query;
      
      const groupBy: any = {
        hour: { $hour: '$created_at' },
        day: { $dayOfMonth: '$created_at' },
        week: { $week: '$created_at' },
        month: { $month: '$created_at' },
      };
      
      const dateFormat: any = {
        hour: { year: { $year: '$created_at' }, month: { $month: '$created_at' }, day: { $dayOfMonth: '$created_at' }, hour: { $hour: '$created_at' } },
        day: { year: { $year: '$created_at' }, month: { $month: '$created_at' }, day: { $dayOfMonth: '$created_at' } },
        week: { year: { $year: '$created_at' }, week: { $week: '$created_at' } },
        month: { year: { $year: '$created_at' }, month: { $month: '$created_at' } },
      };
      
      const averages = await FraudScore.aggregate([
        {
          $match: {
            created_at: { 
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        },
        {
          $group: {
            _id: dateFormat[period as string] || dateFormat.day,
            average_score: { $avg: '$score' },
            total_transactions: { $sum: 1 },
            high_risk_count: {
              $sum: {
                $cond: [{ $gte: ['$score', 70] }, 1, 0]
              }
            }
          }
        },
        {
          $sort: { '_id': 1 }
        },
        {
          $project: {
            _id: 0,
            period: '$_id',
            average_score: { $round: ['$average_score', 2] },
            total_transactions: 1,
            high_risk_count: 1
          }
        }
      ]);
      
      res.json(averages);
    } catch (error) {
      next(error);
    }
  },

  // Get score distribution
  async getDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const distribution = await FraudScore.aggregate([
        {
          $bucket: {
            groupBy: '$score',
            boundaries: [0, 20, 40, 60, 80, 100],
            default: 'Other',
            output: {
              count: { $sum: 1 },
              transactions: { $push: '$transaction_id' }
            }
          }
        }
      ]);
      
      const labeled = distribution.map((bucket: any) => {
        const labels: any = {
          0: 'Very Low (0-20)',
          20: 'Low (20-40)',
          40: 'Medium (40-60)',
          60: 'High (60-80)',
          80: 'Critical (80-100)',
        };
        return {
          range: labels[bucket._id] || `${bucket._id}`,
          count: bucket.count,
        };
      });
      
      res.json(labeled);
    } catch (error) {
      next(error);
    }
  },
};

export default fraudScoreController;
