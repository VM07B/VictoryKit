import { ITransaction } from '../models/Transaction.js';
import axios from 'axios';
import { logger } from '../utils/logger.js';

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8001';

interface FraudIndicator {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  weight: number;
}

interface FraudAnalysisResult {
  score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  indicators: FraudIndicator[];
  model_version: string;
}

// Rule-based fraud detection (fallback when ML engine is unavailable)
function ruleBasedAnalysis(transaction: ITransaction): FraudIndicator[] {
  const indicators: FraudIndicator[] = [];
  
  // High amount check
  if (transaction.amount > 10000) {
    indicators.push({
      type: 'high_amount',
      description: `Transaction amount ($${transaction.amount}) exceeds $10,000 threshold`,
      severity: transaction.amount > 50000 ? 'critical' : 'high',
      weight: Math.min(30, transaction.amount / 1000),
    });
  }
  
  // New device check
  if (transaction.device.fingerprint === 'unknown' || transaction.device.fingerprint.length < 10) {
    indicators.push({
      type: 'unknown_device',
      description: 'Transaction from unrecognized device',
      severity: 'medium',
      weight: 15,
    });
  }
  
  // High-risk country check
  const highRiskCountries = ['XX', 'YY', 'ZZ']; // Placeholder
  if (highRiskCountries.includes(transaction.location.country)) {
    indicators.push({
      type: 'high_risk_location',
      description: `Transaction from high-risk country: ${transaction.location.country}`,
      severity: 'high',
      weight: 25,
    });
  }
  
  // Velocity check - multiple transactions (simplified)
  // In production, this would check against recent transactions
  
  // Email domain check
  const emailDomain = transaction.user.email.split('@')[1]?.toLowerCase();
  const disposableDomains = ['tempmail.com', 'throwaway.com', 'fakeemail.com'];
  if (emailDomain && disposableDomains.includes(emailDomain)) {
    indicators.push({
      type: 'disposable_email',
      description: 'Transaction using disposable email address',
      severity: 'medium',
      weight: 20,
    });
  }
  
  // Time-based check (late night transactions)
  const hour = new Date(transaction.timestamp).getHours();
  if (hour >= 1 && hour <= 5) {
    indicators.push({
      type: 'unusual_time',
      description: 'Transaction occurred during unusual hours (1AM-5AM)',
      severity: 'low',
      weight: 10,
    });
  }
  
  // Card type check
  if (transaction.payment.card_type === 'prepaid') {
    indicators.push({
      type: 'prepaid_card',
      description: 'Transaction using prepaid card',
      severity: 'low',
      weight: 10,
    });
  }
  
  return indicators;
}

// Calculate risk level from score
function calculateRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score < 30) return 'low';
  if (score < 60) return 'medium';
  if (score < 80) return 'high';
  return 'critical';
}

// Main fraud analysis function
export async function analyzeFraud(transaction: ITransaction): Promise<FraudAnalysisResult> {
  try {
    // Try ML engine first
    const mlResponse = await axios.post(`${ML_ENGINE_URL}/analyze`, {
      transaction_id: transaction.transaction_id,
      amount: transaction.amount,
      currency: transaction.currency,
      user_email: transaction.user.email,
      user_ip: transaction.user.ip_address,
      device_fingerprint: transaction.device.fingerprint,
      card_last_four: transaction.payment.card_last_four,
      country: transaction.location.country,
      city: transaction.location.city,
      merchant_category: transaction.merchant?.category,
      timestamp: transaction.timestamp,
    }, { timeout: 5000 });
    
    logger.info(`ML Engine analysis for ${transaction.transaction_id}: Score ${mlResponse.data.score}`);
    
    return {
      score: mlResponse.data.score,
      risk_level: mlResponse.data.risk_level,
      confidence: mlResponse.data.confidence,
      indicators: mlResponse.data.indicators,
      model_version: mlResponse.data.model_version || '2.0.0',
    };
  } catch (error) {
    // Fallback to rule-based analysis
    logger.warn(`ML Engine unavailable, using rule-based analysis for ${transaction.transaction_id}`);
    
    const indicators = ruleBasedAnalysis(transaction);
    const totalWeight = indicators.reduce((sum, ind) => sum + ind.weight, 0);
    const score = Math.min(100, totalWeight);
    
    return {
      score,
      risk_level: calculateRiskLevel(score),
      confidence: indicators.length > 0 ? 75 : 95, // Less confident without ML
      indicators,
      model_version: '1.0.0-rules',
    };
  }
}

export default { analyzeFraud };
