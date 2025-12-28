// MongoDB initialization script for FraudGuard
// This script runs when the MongoDB container starts for the first time

db = db.getSiblingDB('fraudguard_db');

// Create collections with validation
db.createCollection('transactions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['transaction_id', 'amount', 'timestamp', 'status'],
      properties: {
        transaction_id: {
          bsonType: 'string',
          description: 'Unique transaction identifier'
        },
        amount: {
          bsonType: 'number',
          minimum: 0,
          description: 'Transaction amount'
        },
        currency: {
          bsonType: 'string',
          description: 'Currency code'
        },
        timestamp: {
          bsonType: 'date',
          description: 'Transaction timestamp'
        },
        status: {
          enum: ['pending', 'approved', 'declined', 'flagged', 'reviewed'],
          description: 'Transaction status'
        }
      }
    }
  }
});

db.createCollection('fraud_scores', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['transaction_id', 'score', 'risk_level'],
      properties: {
        transaction_id: {
          bsonType: 'string',
          description: 'Reference to transaction'
        },
        score: {
          bsonType: 'number',
          minimum: 0,
          maximum: 100,
          description: 'Fraud score 0-100'
        },
        risk_level: {
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'Risk level category'
        }
      }
    }
  }
});

db.createCollection('alerts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['alert_type', 'threshold', 'active'],
      properties: {
        alert_type: {
          bsonType: 'string',
          description: 'Type of alert'
        },
        threshold: {
          bsonType: 'number',
          minimum: 0,
          maximum: 100,
          description: 'Score threshold'
        },
        active: {
          bsonType: 'bool',
          description: 'Whether alert is active'
        }
      }
    }
  }
});

// Create indexes for performance
db.transactions.createIndex({ transaction_id: 1 }, { unique: true });
db.transactions.createIndex({ timestamp: -1 });
db.transactions.createIndex({ status: 1 });
db.transactions.createIndex({ 'user.email': 1 });
db.transactions.createIndex({ amount: 1 });

db.fraud_scores.createIndex({ transaction_id: 1 }, { unique: true });
db.fraud_scores.createIndex({ score: -1 });
db.fraud_scores.createIndex({ risk_level: 1 });
db.fraud_scores.createIndex({ created_at: -1 });

db.alerts.createIndex({ alert_type: 1 });
db.alerts.createIndex({ active: 1 });
db.alerts.createIndex({ created_at: -1 });

// Insert sample data for development
db.transactions.insertMany([
  {
    transaction_id: 'TXN_SAMPLE_001',
    amount: 150.00,
    currency: 'USD',
    timestamp: new Date(),
    status: 'approved',
    user: {
      email: 'user1@example.com',
      ip_address: '192.168.1.100'
    },
    device: {
      fingerprint: 'fp_sample_001',
      type: 'desktop',
      browser: 'Chrome'
    },
    payment: {
      method: 'credit_card',
      card_last_four: '4242'
    },
    location: {
      country: 'US',
      city: 'New York',
      latitude: 40.7128,
      longitude: -74.0060
    },
    merchant: {
      id: 'merchant_001',
      name: 'Sample Store',
      category: 'retail'
    }
  },
  {
    transaction_id: 'TXN_SAMPLE_002',
    amount: 5000.00,
    currency: 'USD',
    timestamp: new Date(),
    status: 'flagged',
    user: {
      email: 'user2@example.com',
      ip_address: '10.0.0.50'
    },
    device: {
      fingerprint: 'fp_sample_002',
      type: 'mobile',
      browser: 'Safari'
    },
    payment: {
      method: 'credit_card',
      card_last_four: '1234'
    },
    location: {
      country: 'RU',
      city: 'Moscow',
      latitude: 55.7558,
      longitude: 37.6173
    },
    merchant: {
      id: 'merchant_002',
      name: 'Online Electronics',
      category: 'electronics'
    }
  }
]);

db.fraud_scores.insertMany([
  {
    transaction_id: 'TXN_SAMPLE_001',
    score: 15,
    risk_level: 'low',
    confidence: 0.95,
    indicators: {
      velocity_check: { score: 10, details: 'Normal transaction frequency' },
      amount_analysis: { score: 5, details: 'Amount within normal range' },
      location_risk: { score: 20, details: 'Trusted location' }
    },
    ml_model_version: '1.0.0',
    created_at: new Date()
  },
  {
    transaction_id: 'TXN_SAMPLE_002',
    score: 85,
    risk_level: 'high',
    confidence: 0.88,
    indicators: {
      velocity_check: { score: 70, details: 'Unusual transaction pattern' },
      amount_analysis: { score: 90, details: 'High amount transaction' },
      location_risk: { score: 95, details: 'High-risk country' }
    },
    ml_model_version: '1.0.0',
    created_at: new Date()
  }
]);

db.alerts.insertMany([
  {
    alert_type: 'high_risk_transaction',
    threshold: 70,
    notification_channels: ['email', 'webhook'],
    active: true,
    created_at: new Date(),
    created_by: 'system'
  },
  {
    alert_type: 'velocity_breach',
    threshold: 80,
    notification_channels: ['email'],
    active: true,
    created_at: new Date(),
    created_by: 'system'
  }
]);

print('FraudGuard database initialized successfully!');
print('Collections created: transactions, fraud_scores, alerts');
print('Sample data inserted for development');
