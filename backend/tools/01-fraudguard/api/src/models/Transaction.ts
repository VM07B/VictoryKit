import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  transaction_id: string;
  amount: number;
  currency: string;
  timestamp: Date;
  user: {
    email: string;
    ip_address: string;
    user_id?: string;
  };
  device: {
    fingerprint: string;
    browser: string;
    os: string;
  };
  payment: {
    card_last_four: string;
    card_type: string;
    bank_name: string;
  };
  location: {
    country: string;
    city: string;
    lat: number;
    lng: number;
  };
  merchant: {
    name: string;
    category: string;
    mcc: string;
  };
  status: 'pending' | 'approved' | 'declined' | 'review';
  created_at: Date;
  updated_at: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  transaction_id: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0 
  },
  currency: { 
    type: String, 
    required: true,
    default: 'USD' 
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  user: {
    email: { type: String, required: true },
    ip_address: { type: String, required: true },
    user_id: { type: String },
  },
  device: {
    fingerprint: { type: String, required: true },
    browser: { type: String },
    os: { type: String },
  },
  payment: {
    card_last_four: { type: String, required: true },
    card_type: { type: String },
    bank_name: { type: String },
  },
  location: {
    country: { type: String, required: true },
    city: { type: String },
    lat: { type: Number },
    lng: { type: Number },
  },
  merchant: {
    name: { type: String },
    category: { type: String },
    mcc: { type: String },
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'declined', 'review'],
    default: 'pending',
    index: true
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

// Indexes
TransactionSchema.index({ 'user.email': 1 });
TransactionSchema.index({ 'location.country': 1 });
TransactionSchema.index({ amount: 1 });
TransactionSchema.index({ timestamp: -1, status: 1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
export default Transaction;
