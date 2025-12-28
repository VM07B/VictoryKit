import mongoose, { Schema, Document } from 'mongoose';

export interface IAlert extends Document {
  alert_type: 'high_risk_transaction' | 'suspicious_pattern' | 'velocity_breach' | 'unusual_location';
  threshold: number;
  notification_channels: ('email' | 'webhook' | 'sms' | 'slack')[];
  active: boolean;
  triggered_count: number;
  last_triggered_at?: Date;
  webhook_url?: string;
  email_recipients?: string[];
  slack_channel?: string;
  created_at: Date;
  updated_at: Date;
}

const AlertSchema = new Schema<IAlert>({
  alert_type: { 
    type: String, 
    enum: ['high_risk_transaction', 'suspicious_pattern', 'velocity_breach', 'unusual_location'],
    required: true,
    index: true
  },
  threshold: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100,
    default: 70 
  },
  notification_channels: [{
    type: String,
    enum: ['email', 'webhook', 'sms', 'slack']
  }],
  active: { 
    type: Boolean, 
    default: true,
    index: true
  },
  triggered_count: { 
    type: Number, 
    default: 0 
  },
  last_triggered_at: { type: Date },
  webhook_url: { type: String },
  email_recipients: [{ type: String }],
  slack_channel: { type: String },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

// Index for finding active alerts by type
AlertSchema.index({ alert_type: 1, active: 1 });

export const Alert = mongoose.model<IAlert>('Alert', AlertSchema);
export default Alert;
