import { Request, Response, NextFunction } from 'express';
import Transaction from '../models/Transaction.js';
import FraudScore from '../models/FraudScore.js';
import Alert from '../models/Alert.js';

export const analyticsController = {
  // Get dashboard analytics
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Get counts
      const [
        totalTransactions,
        todayTransactions,
        totalFraudScores,
        activeAlerts,
        riskDistribution,
        recentHighRisk
      ] = await Promise.all([
        Transaction.countDocuments(),
        Transaction.countDocuments({ timestamp: { $gte: today } }),
        FraudScore.countDocuments(),
        Alert.countDocuments({ active: true }),
        FraudScore.aggregate([
          { $match: { created_at: { $gte: weekAgo } } },
          { $group: { _id: '$risk_level', count: { $sum: 1 } } }
        ]),
        FraudScore.find({ risk_level: { $in: ['high', 'critical'] } })
          .sort({ created_at: -1 })
          .limit(5)
          .lean()
      ]);
      
      // Calculate averages
      const avgScore = await FraudScore.aggregate([
        { $match: { created_at: { $gte: weekAgo } } },
        { $group: { _id: null, avg: { $avg: '$score' } } }
      ]);
      
      // Format risk distribution
      const riskBreakdown = riskDistribution.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {});
      
      res.json({
        total_transactions: totalTransactions,
        today_transactions: todayTransactions,
        total_analyses: totalFraudScores,
        active_alerts: activeAlerts,
        average_score: avgScore[0]?.avg?.toFixed(2) || 0,
        risk_breakdown: {
          low: riskBreakdown.low || 0,
          medium: riskBreakdown.medium || 0,
          high: riskBreakdown.high || 0,
          critical: riskBreakdown.critical || 0,
        },
        recent_high_risk: recentHighRisk,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get risk breakdown
  async getRiskBreakdown(req: Request, res: Response, next: NextFunction) {
    try {
      const { period = 'week' } = req.query;
      
      const periods: any = {
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
      };
      
      const startDate = new Date(Date.now() - (periods[period as string] || periods.week));
      
      const breakdown = await FraudScore.aggregate([
        { $match: { created_at: { $gte: startDate } } },
        { $group: { _id: '$risk_level', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      const total = breakdown.reduce((sum: number, item: any) => sum + item.count, 0);
      
      const result = breakdown.map((item: any) => ({
        risk_level: item._id,
        count: item.count,
        percentage: total > 0 ? ((item.count / total) * 100).toFixed(2) : 0,
      }));
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  // Get transaction timeline
  async getTimeline(req: Request, res: Response, next: NextFunction) {
    try {
      const { period = 'day' } = req.query;
      
      const groupFormats: any = {
        hour: {
          format: '%Y-%m-%d %H:00',
          range: 24 * 60 * 60 * 1000,
        },
        day: {
          format: '%Y-%m-%d',
          range: 30 * 24 * 60 * 60 * 1000,
        },
        week: {
          format: '%Y-W%V',
          range: 12 * 7 * 24 * 60 * 60 * 1000,
        },
        month: {
          format: '%Y-%m',
          range: 365 * 24 * 60 * 60 * 1000,
        },
      };
      
      const config = groupFormats[period as string] || groupFormats.day;
      const startDate = new Date(Date.now() - config.range);
      
      const timeline = await FraudScore.aggregate([
        { $match: { created_at: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: config.format, date: '$created_at' } },
            total_transactions: { $sum: 1 },
            high_risk_count: {
              $sum: { $cond: [{ $gte: ['$score', 70] }, 1, 0] }
            },
            average_score: { $avg: '$score' }
          }
        },
        { $sort: { '_id': 1 } },
        {
          $project: {
            _id: 0,
            timestamp: '$_id',
            total_transactions: 1,
            high_risk_count: 1,
            average_score: { $round: ['$average_score', 2] }
          }
        }
      ]);
      
      res.json(timeline);
    } catch (error) {
      next(error);
    }
  },

  // Get geographic distribution
  async getGeoDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const geoData = await Transaction.aggregate([
        {
          $lookup: {
            from: 'fraudscores',
            localField: 'transaction_id',
            foreignField: 'transaction_id',
            as: 'fraud_score'
          }
        },
        { $unwind: { path: '$fraud_score', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$location.country',
            count: { $sum: 1 },
            average_risk_score: { $avg: '$fraud_score.score' },
            total_amount: { $sum: '$amount' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 20 },
        {
          $project: {
            _id: 0,
            country: '$_id',
            count: 1,
            average_risk_score: { $round: ['$average_risk_score', 2] },
            total_amount: { $round: ['$total_amount', 2] }
          }
        }
      ]);
      
      res.json(geoData);
    } catch (error) {
      next(error);
    }
  },

  // Get fraud patterns
  async getFraudPatterns(req: Request, res: Response, next: NextFunction) {
    try {
      // Get most common indicators
      const patterns = await FraudScore.aggregate([
        { $unwind: '$indicators' },
        {
          $group: {
            _id: '$indicators.type',
            occurrence_count: { $sum: 1 },
            average_severity_weight: { $avg: '$indicators.weight' },
            descriptions: { $addToSet: '$indicators.description' }
          }
        },
        { $sort: { occurrence_count: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 0,
            pattern_type: '$_id',
            occurrence_count: 1,
            average_score: { $round: ['$average_severity_weight', 2] },
            description: { $first: '$descriptions' }
          }
        }
      ]);
      
      res.json(patterns);
    } catch (error) {
      next(error);
    }
  },
};

export default analyticsController;
