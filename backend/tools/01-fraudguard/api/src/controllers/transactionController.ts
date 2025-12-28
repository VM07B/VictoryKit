import { Request, Response, NextFunction } from 'express';
import Transaction, { ITransaction } from '../models/Transaction.js';
import FraudScore from '../models/FraudScore.js';
import { analyzeFraud } from '../services/fraudAnalyzer.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';

// Validation schema
const TransactionSchema = z.object({
  transaction_id: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  user: z.object({
    email: z.string().email(),
    ip_address: z.string(),
    user_id: z.string().optional(),
  }),
  device: z.object({
    fingerprint: z.string(),
    browser: z.string().optional(),
    os: z.string().optional(),
  }),
  payment: z.object({
    card_last_four: z.string().length(4),
    card_type: z.string().optional(),
    bank_name: z.string().optional(),
  }),
  location: z.object({
    country: z.string(),
    city: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  merchant: z.object({
    name: z.string().optional(),
    category: z.string().optional(),
    mcc: z.string().optional(),
  }).optional(),
});

export const transactionController = {
  // Analyze a transaction for fraud
  async analyze(req: Request, res: Response, next: NextFunction) {
    try {
      const startTime = Date.now();
      
      // Validate input
      const validatedData = TransactionSchema.parse(req.body);
      
      // Generate transaction ID if not provided
      const transaction_id = validatedData.transaction_id || `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create transaction record
      const transaction = new Transaction({
        ...validatedData,
        transaction_id,
        timestamp: new Date(),
      });
      await transaction.save();
      
      // Analyze for fraud
      const fraudResult = await analyzeFraud(transaction);
      
      // Save fraud score
      const fraudScore = new FraudScore({
        transaction_id,
        score: fraudResult.score,
        risk_level: fraudResult.risk_level,
        confidence: fraudResult.confidence,
        indicators: fraudResult.indicators,
        ml_model_version: fraudResult.model_version,
        analysis_time_ms: Date.now() - startTime,
      });
      await fraudScore.save();
      
      logger.info(`Transaction ${transaction_id} analyzed - Score: ${fraudResult.score} (${fraudResult.risk_level})`);
      
      res.status(200).json({
        transaction_id,
        score: fraudResult.score,
        risk_level: fraudResult.risk_level,
        confidence: fraudResult.confidence,
        indicators: fraudResult.indicators,
        recommendation: fraudScore.recommendation,
        analysis_time_ms: fraudScore.analysis_time_ms,
      });
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

  // Get all transactions
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        limit = 50, 
        offset = 0, 
        risk_level,
        start_date,
        end_date,
        status
      } = req.query;
      
      const query: any = {};
      
      if (start_date || end_date) {
        query.timestamp = {};
        if (start_date) query.timestamp.$gte = new Date(start_date as string);
        if (end_date) query.timestamp.$lte = new Date(end_date as string);
      }
      
      if (status) {
        query.status = status;
      }
      
      // Get transactions
      const transactions = await Transaction.find(query)
        .sort({ timestamp: -1 })
        .skip(Number(offset))
        .limit(Number(limit))
        .lean();
      
      // If risk_level filter, get fraud scores and filter
      let filteredTransactions = transactions;
      if (risk_level) {
        const transactionIds = transactions.map(t => t.transaction_id);
        const scores = await FraudScore.find({
          transaction_id: { $in: transactionIds },
          risk_level: risk_level as string,
        }).lean();
        const riskTransactionIds = new Set(scores.map(s => s.transaction_id));
        filteredTransactions = transactions.filter(t => riskTransactionIds.has(t.transaction_id));
      }
      
      const total = await Transaction.countDocuments(query);
      
      res.json({
        transactions: filteredTransactions,
        total,
        limit: Number(limit),
        offset: Number(offset),
      });
    } catch (error) {
      next(error);
    }
  },

  // Get a single transaction by ID
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const transaction = await Transaction.findOne({ transaction_id: id }).lean();
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      const fraudScore = await FraudScore.findOne({ transaction_id: id }).lean();
      
      res.json({
        ...transaction,
        fraud_score: fraudScore,
      });
    } catch (error) {
      next(error);
    }
  },

  // Batch analyze multiple transactions
  async batchAnalyze(req: Request, res: Response, next: NextFunction) {
    try {
      const { transactions } = req.body;
      
      if (!Array.isArray(transactions) || transactions.length === 0) {
        return res.status(400).json({ error: 'transactions must be a non-empty array' });
      }
      
      if (transactions.length > 100) {
        return res.status(400).json({ error: 'Maximum 100 transactions per batch' });
      }
      
      const results = await Promise.all(
        transactions.map(async (txData) => {
          try {
            const validatedData = TransactionSchema.parse(txData);
            const transaction_id = validatedData.transaction_id || `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const transaction = new Transaction({
              ...validatedData,
              transaction_id,
              timestamp: new Date(),
            });
            await transaction.save();
            
            const fraudResult = await analyzeFraud(transaction);
            
            const fraudScore = new FraudScore({
              transaction_id,
              score: fraudResult.score,
              risk_level: fraudResult.risk_level,
              confidence: fraudResult.confidence,
              indicators: fraudResult.indicators,
              ml_model_version: fraudResult.model_version,
            });
            await fraudScore.save();
            
            return {
              transaction_id,
              score: fraudResult.score,
              risk_level: fraudResult.risk_level,
              confidence: fraudResult.confidence,
            };
          } catch (error) {
            return {
              transaction_id: txData.transaction_id || 'unknown',
              error: error instanceof Error ? error.message : 'Analysis failed',
            };
          }
        })
      );
      
      res.json({ results });
    } catch (error) {
      next(error);
    }
  },

  // Update transaction status
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['approved', 'declined', 'review'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      
      const transaction = await Transaction.findOneAndUpdate(
        { transaction_id: id },
        { status },
        { new: true }
      );
      
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      logger.info(`Transaction ${id} status updated to ${status}`);
      
      res.json(transaction);
    } catch (error) {
      next(error);
    }
  },
};

export default transactionController;
