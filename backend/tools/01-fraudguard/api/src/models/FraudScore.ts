import mongoose, { Schema, Document } from 'mongoose';

export interface IFraudIndicator {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  weight: number;
}

export interface IFraudScore extends Document {
  transaction_id: string;
  score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  indicators: IFraudIndicator[];
  ml_model_version: string;
  recommendation: string;
  analysis_time_ms: number;
  created_at: Date;
}

const FraudIndicatorSchema = new Schema<IFraudIndicator>({
  type: { type: String, required: true },
  description: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    required: true 
  },
  weight: { type: Number, required: true, min: 0, max: 100 },
}, { _id: false });

const FraudScoreSchema = new Schema<IFraudScore>({
  transaction_id: { 
    type: String, 
    required: true, 
    unique: true,
    index: true,
    ref: 'Transaction'
  },
  score: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100 
  },
  risk_level: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true
  },
  confidence: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100 
  },
  indicators: [FraudIndicatorSchema],
  ml_model_version: { 
    type: String, 
    required: true,
    default: '1.0.0' 
  },
  recommendation: { type: String },
  analysis_time_ms: { type: Number },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false },
});

// Indexes
FraudScoreSchema.index({ score: -1 });
FraudScoreSchema.index({ created_at: -1 });
FraudScoreSchema.index({ risk_level: 1, created_at: -1 });

// Virtual to determine risk level from score
FraudScoreSchema.pre('save', function(next) {
  if (this.score < 30) {
    this.risk_level = 'low';
  } else if (this.score < 60) {
    this.risk_level = 'medium';
  } else if (this.score < 80) {
    this.risk_level = 'high';
  } else {
    this.risk_level = 'critical';
  }
  
  // Generate recommendation based on risk level
  const recommendations: Record<string, string> = {
    low: 'Transaction appears safe. Proceed with standard processing.',
    medium: 'Transaction flagged for additional verification. Consider step-up authentication.',
    high: 'High risk detected. Manual review recommended before approval.',
    critical: 'Critical risk indicators present. Block transaction and investigate.',
  };
  this.recommendation = recommendations[this.risk_level];
  
  next();
});

export const FraudScore = mongoose.model<IFraudScore>('FraudScore', FraudScoreSchema);
export default FraudScore;
