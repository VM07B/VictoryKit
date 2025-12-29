# 🔧 PHASE 4: Backend API Implementation

**Goal:** Implement functional backend APIs for all 50 AI security tools  
**Duration:** 2-3 weeks  
**Deliverables:** 200+ REST API endpoints, MongoDB integration, ML service communication

---

## 📋 What You'll Build in Phase 4

1. **200+ API Endpoints** - REST APIs for all 50 tools (4-7 endpoints per tool)
2. **50 Database Schemas** - MongoDB models for each tool
3. **Authentication & Authorization** - JWT-based auth with role-based access
4. **ML Engine Integration** - Connect APIs to ML services
5. **AI Assistant Integration** - WebSocket connections to AI services
6. **Shared Utilities** - Error handling, logging, validation
7. **API Documentation** - Swagger/OpenAPI specs for all endpoints

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Port 4000)                 │
│  - Route requests to appropriate tool APIs                   │
│  - JWT validation                                            │
│  - Rate limiting                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┬─────────────┐
         ▼               ▼               ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────┐ ... ┌──────────┐
│ FraudGuard   │ │ IntelliScout │ │ VulnScan │     │ ThreatMap│
│ API (4001)   │ │ API (4002)   │ │ API (4006)│     │ API (4050)│
└──────┬───────┘ └──────┬───────┘ └────┬─────┘     └────┬─────┘
       │                │               │                 │
       ▼                ▼               ▼                 ▼
┌──────────────┐ ┌──────────────┐ ┌──────────┐     ┌──────────┐
│  MongoDB     │ │  MongoDB     │ │  MongoDB │     │  MongoDB │
│ fraudguard_db│ │  iscout_db   │ │ vscan_db │     │threatmap_db│
└──────────────┘ └──────────────┘ └──────────┘     └──────────┘
       │                │               │                 │
       ▼                ▼               ▼                 ▼
┌──────────────┐ ┌──────────────┐ ┌──────────┐     ┌──────────┐
│  ML Engine   │ │  ML Engine   │ │ ML Engine│     │ ML Engine│
│   (8001)     │ │   (8002)     │ │  (8006)  │     │  (8050)  │
└──────────────┘ └──────────────┘ └──────────┘     └──────────┘
```

---

## 📁 Project Structure (Phase 4)

```
backend/
│
├── shared/
│   ├── middleware/
│   │   ├── auth.middleware.js          # JWT authentication
│   │   ├── errorHandler.middleware.js   # Global error handling
│   │   ├── rateLimiter.middleware.js    # API rate limiting
│   │   └── validation.middleware.js     # Request validation
│   │
│   ├── utils/
│   │   ├── logger.js                    # Winston logger
│   │   ├── apiResponse.js               # Standardized API responses
│   │   ├── apiError.js                  # Custom error classes
│   │   └── validators.js                # Common validators
│   │
│   ├── config/
│   │   ├── database.js                  # MongoDB connection
│   │   └── constants.js                 # App constants
│   │
│   └── models/
│       ├── User.model.js                # User schema
│       └── Session.model.js             # Session schema
│
├── central-grid/
│   ├── auth-service/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   ├── auth.controller.js   # Auth logic
│   │   │   │   └── user.controller.js   # User management
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.js
│   │   │   │   └── user.routes.js
│   │   │   ├── models/
│   │   │   │   └── User.model.js
│   │   │   └── server.js
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── api-gateway/
│       ├── src/
│       │   ├── routes/
│       │   │   └── gateway.routes.js    # Route all tool APIs
│       │   ├── middleware/
│       │   │   └── proxy.middleware.js  # Proxy requests
│       │   └── server.js
│       ├── package.json
│       └── Dockerfile
│
└── tools/
    ├── 01-fraudguard/
    │   └── api/
    │       ├── src/
    │       │   ├── controllers/
    │       │   │   ├── transaction.controller.js
    │       │   │   ├── analysis.controller.js
    │       │   │   └── report.controller.js
    │       │   ├── routes/
    │       │   │   └── index.js
    │       │   ├── models/
    │       │   │   ├── Transaction.model.js
    │       │   │   ├── Analysis.model.js
    │       │   │   └── Report.model.js
    │       │   ├── services/
    │       │   │   ├── fraud.service.js       # Business logic
    │       │   │   └── ml.service.js          # ML engine communication
    │       │   └── server.js
    │       ├── package.json
    │       ├── Dockerfile
    │       └── .env.example
    │
    ├── 02-intelliscout/
    │   └── api/ (same structure)
    │
    └── ... (48 more tools)
```

---

## 🔑 Core Implementations

### 1. Shared Middleware

**File:** `backend/shared/middleware/auth.middleware.js`

```javascript
const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/apiError');

const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new ApiError(401, 'Authentication token required');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError(401, 'Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Token expired'));
    } else {
      next(error);
    }
  }
};

module.exports = { authMiddleware };
```

**File:** `backend/shared/utils/apiResponse.js`

```javascript
class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static success(data, message = 'Success', statusCode = 200) {
    return new ApiResponse(statusCode, data, message);
  }

  static created(data, message = 'Created successfully') {
    return new ApiResponse(201, data, message);
  }

  static noContent(message = 'No content') {
    return new ApiResponse(204, null, message);
  }
}

module.exports = { ApiResponse };
```

### 2. Database Schema Template

**File:** `backend/tools/01-fraudguard/api/src/models/Transaction.model.js`

```javascript
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  transactionId: {
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
  merchantInfo: {
    name: String,
    category: String,
    location: String
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'crypto', 'other'],
    required: true
  },
  ipAddress: String,
  deviceFingerprint: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  fraudScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  isFraudulent: {
    type: Boolean,
    default: false
  },
  mlPrediction: {
    score: Number,
    confidence: Number,
    model: String,
    timestamp: Date
  },
  flags: [{
    type: String,
    reason: String,
    severity: String,
    timestamp: Date
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'reviewing'],
    default: 'pending'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
transactionSchema.index({ userId: 1, timestamp: -1 });
transactionSchema.index({ fraudScore: -1 });
transactionSchema.index({ riskLevel: 1 });
transactionSchema.index({ status: 1 });

// Virtual for risk assessment
transactionSchema.virtual('isHighRisk').get(function() {
  return this.fraudScore >= 70 || this.riskLevel === 'high' || this.riskLevel === 'critical';
});

module.exports = mongoose.model('Transaction', transactionSchema);
```

### 3. Controller Template

**File:** `backend/tools/01-fraudguard/api/src/controllers/transaction.controller.js`

```javascript
const Transaction = require('../models/Transaction.model');
const { ApiResponse } = require('../../../../shared/utils/apiResponse');
const { ApiError } = require('../../../../shared/utils/apiError');
const fraudService = require('../services/fraud.service');
const mlService = require('../services/ml.service');

class TransactionController {
  // Analyze transaction for fraud
  async analyzeTransaction(req, res, next) {
    try {
      const { amount, merchantInfo, paymentMethod, ipAddress, deviceFingerprint } = req.body;
      
      // Create transaction record
      const transaction = new Transaction({
        userId: req.user.id,
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        amount,
        merchantInfo,
        paymentMethod,
        ipAddress,
        deviceFingerprint,
        timestamp: new Date()
      });

      // Call ML service for prediction
      const mlPrediction = await mlService.predictFraud({
        amount,
        merchantInfo,
        paymentMethod,
        ipAddress,
        deviceFingerprint
      });

      // Update transaction with ML results
      transaction.fraudScore = mlPrediction.score;
      transaction.mlPrediction = {
        score: mlPrediction.score,
        confidence: mlPrediction.confidence,
        model: mlPrediction.model,
        timestamp: new Date()
      };

      // Determine risk level
      transaction.riskLevel = fraudService.calculateRiskLevel(mlPrediction.score);
      transaction.isFraudulent = mlPrediction.score >= 70;
      transaction.status = mlPrediction.score >= 70 ? 'rejected' : 'approved';

      // Add flags if suspicious
      if (mlPrediction.flags && mlPrediction.flags.length > 0) {
        transaction.flags = mlPrediction.flags;
      }

      await transaction.save();

      res.json(ApiResponse.success(transaction, 'Transaction analyzed successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Get transaction by ID
  async getTransaction(req, res, next) {
    try {
      const { id } = req.params;
      
      const transaction = await Transaction.findById(id);
      
      if (!transaction) {
        throw new ApiError(404, 'Transaction not found');
      }

      // Ensure user can only access their own transactions
      if (transaction.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new ApiError(403, 'Access denied');
      }

      res.json(ApiResponse.success(transaction));
    } catch (error) {
      next(error);
    }
  }

  // Get user transactions with pagination
  async getUserTransactions(req, res, next) {
    try {
      const { page = 1, limit = 20, riskLevel, status } = req.query;
      
      const query = { userId: req.user.id };
      
      if (riskLevel) query.riskLevel = riskLevel;
      if (status) query.status = status;

      const transactions = await Transaction.find(query)
        .sort({ timestamp: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const total = await Transaction.countDocuments(query);

      res.json(ApiResponse.success({
        transactions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }));
    } catch (error) {
      next(error);
    }
  }

  // Get fraud statistics
  async getFraudStats(req, res, next) {
    try {
      const userId = req.user.id;
      
      const stats = await Transaction.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            fraudulentCount: {
              $sum: { $cond: ['$isFraudulent', 1, 0] }
            },
            totalAmount: { $sum: '$amount' },
            avgFraudScore: { $avg: '$fraudScore' },
            highRiskCount: {
              $sum: { $cond: [{ $gte: ['$fraudScore', 70] }, 1, 0] }
            },
            mediumRiskCount: {
              $sum: { $cond: [{ $and: [{ $gte: ['$fraudScore', 40] }, { $lt: ['$fraudScore', 70] }] }, 1, 0] }
            },
            lowRiskCount: {
              $sum: { $cond: [{ $lt: ['$fraudScore', 40] }, 1, 0] }
            }
          }
        }
      ]);

      res.json(ApiResponse.success(stats[0] || {}));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TransactionController();
```

### 4. ML Service Integration

**File:** `backend/tools/01-fraudguard/api/src/services/ml.service.js`

```javascript
const axios = require('axios');
const { ApiError } = require('../../../../shared/utils/apiError');

class MLService {
  constructor() {
    this.mlEngineUrl = process.env.ML_ENGINE_URL || 'http://localhost:8001';
  }

  async predictFraud(transactionData) {
    try {
      const response = await axios.post(
        `${this.mlEngineUrl}/predict`,
        transactionData,
        {
          timeout: 5000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      return response.data;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new ApiError(503, 'ML service unavailable');
      }
      throw new ApiError(500, 'ML prediction failed: ' + error.message);
    }
  }

  async trainModel(trainingData) {
    try {
      const response = await axios.post(
        `${this.mlEngineUrl}/train`,
        trainingData,
        {
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      return response.data;
    } catch (error) {
      throw new ApiError(500, 'Model training failed: ' + error.message);
    }
  }

  async getModelMetrics() {
    try {
      const response = await axios.get(`${this.mlEngineUrl}/metrics`);
      return response.data;
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch model metrics');
    }
  }
}

module.exports = new MLService();
```

---

## 🚀 Implementation Strategy

### Batch 1: Core Services (Week 1, Days 1-2)

1. **Shared Utilities**
   - Auth middleware
   - Error handling
   - API response formatting
   - Validators
   - Logger

2. **Auth Service**
   - User registration
   - Login/logout
   - JWT token management
   - Password reset

3. **API Gateway**
   - Request routing
   - Rate limiting
   - JWT validation

### Batch 2: Tools 01-10 APIs (Week 1, Days 3-5)

Implement full backend APIs for:
- 01-FraudGuard
- 02-IntelliScout
- 03-ThreatRadar
- 04-MalwareHunter
- 05-PhishGuard
- 06-VulnScan
- 07-PenTestAI
- 08-SecureCode
- 09-ComplianceCheck
- 10-DataGuardian

### Batch 3: Tools 11-20 (Week 1-2)
### Batch 4: Tools 21-30 (Week 2)
### Batch 5: Tools 31-40 (Week 2-3)
### Batch 6: Tools 41-50 (Week 3)

---

## 📋 API Endpoint Standards

Each tool should have these standard endpoints:

```
GET    /api/v1/{tool}/health              - Health check
POST   /api/v1/{tool}/analyze             - Main analysis function
GET    /api/v1/{tool}/results             - Get all results (paginated)
GET    /api/v1/{tool}/results/:id         - Get specific result
DELETE /api/v1/{tool}/results/:id         - Delete result
GET    /api/v1/{tool}/stats               - Get statistics
POST   /api/v1/{tool}/export              - Export data
GET    /api/v1/{tool}/history             - Get analysis history
```

---

## ✅ PHASE 4 CHECKLIST

- [ ] Shared utilities implemented
- [ ] Auth service complete
- [ ] API Gateway functional
- [ ] All 50 tool APIs implemented
- [ ] All MongoDB schemas created
- [ ] ML service integration working
- [ ] API documentation generated
- [ ] Unit tests written (80%+ coverage)
- [ ] Integration tests passing
- [ ] Error handling standardized
- [ ] Logging implemented
- [ ] Rate limiting configured
- [ ] API versioning setup

---

**Ready to start implementing!** 🚀
