# 🛡️ FraudGuard - AI-Powered Fraud Detection Tool

FraudGuard is a comprehensive fraud detection and prevention system built as part of the VictoryKit platform. It provides real-time transaction analysis, risk scoring, and AI-powered assistance for fraud investigation.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    fguard.maula.ai                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Frontend   │  │  API Service │  │    AI Assistant      │   │
│  │   (React)    │  │  (Express)   │  │  (WebSocket + LLM)   │   │
│  │   Port 3001  │──│   Port 4001  │──│     Port 6001        │   │
│  └──────────────┘  └──────┬───────┘  └──────────────────────┘   │
│                           │                                      │
│                    ┌──────┴───────┐                              │
│                    │  ML Engine   │                              │
│                    │  (FastAPI)   │                              │
│                    │  Port 8001   │                              │
│                    └──────────────┘                              │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                              │
│  │   MongoDB    │  │    Redis     │                              │
│  │  Port 27017  │  │  Port 6379   │                              │
│  └──────────────┘  └──────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

## 📦 Components

### Frontend (`frontend/tools/01-fraudguard/`)
- **Technology**: React 19 + Vite + TypeScript + Tailwind CSS
- **Port**: 3001
- **Features**:
  - Transaction analysis form with real-time validation
  - Fraud score visualization with risk indicators
  - Interactive risk charts (breakdown, timeline, distribution)
  - Transaction history with filtering
  - Alert management panel
  - PDF/CSV report export
  - AI chat assistant integration

### API Service (`backend/tools/01-fraudguard/api/`)
- **Technology**: Express.js + TypeScript + MongoDB + Zod
- **Port**: 4001
- **Features**:
  - RESTful API for transaction management
  - Fraud score calculation and storage
  - Alert rule management
  - Analytics dashboard data
  - ML Engine proxy
  - Report generation

### ML Engine (`backend/tools/01-fraudguard/ml-engine/`)
- **Technology**: Python + FastAPI + TensorFlow + scikit-learn
- **Port**: 8001
- **Features**:
  - Neural network-based fraud detection model
  - Rule-based risk scoring (10+ risk factors)
  - Statistical anomaly detection
  - Batch transaction processing
  - Model explanation (feature importance)
  - On-demand model retraining

### AI Assistant (`backend/tools/01-fraudguard/ai-assistant/`)
- **Technology**: Node.js + WebSocket + Multi-LLM
- **Port**: 6001
- **LLM Providers**:
  - Google Gemini
  - Anthropic Claude
  - OpenAI GPT
  - xAI Grok
  - Mistral AI
  - Meta Llama (via Together AI)
- **Features**:
  - Real-time chat with streaming responses
  - Function calling for fraud analysis
  - Provider fallback chain
  - Context-aware fraud investigation

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.11+
- MongoDB (or use Docker)

### Development Setup

1. **Clone and navigate to the tool**:
   ```bash
   cd /workspaces/VictoryKit
   ```

2. **Start all services with Docker Compose**:
   ```bash
   docker-compose -f docker-compose.phase2.yml up -d
   ```

3. **Or run services individually**:

   **Frontend**:
   ```bash
   cd frontend/tools/01-fraudguard
   npm install
   npm run dev
   ```

   **API Service**:
   ```bash
   cd backend/tools/01-fraudguard/api
   npm install
   npm run dev
   ```

   **ML Engine**:
   ```bash
   cd backend/tools/01-fraudguard/ml-engine
   pip install -r requirements.txt
   uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

   **AI Assistant**:
   ```bash
   cd backend/tools/01-fraudguard/ai-assistant
   npm install
   npm run dev
   ```

4. **Access the application**:
   - Frontend: http://localhost:3001
   - API: http://localhost:4001
   - ML Engine: http://localhost:8001
   - AI Assistant: ws://localhost:6001

## 🔧 Environment Variables

### API Service
```env
PORT=4001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fraudguard_db
ML_ENGINE_URL=http://localhost:8001
JWT_SECRET=your_jwt_secret
```

### AI Assistant
```env
PORT=6001
FRAUDGUARD_API_URL=http://localhost:4001
GEMINI_API_KEY=your_gemini_key
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
XAI_API_KEY=your_xai_key
MISTRAL_API_KEY=your_mistral_key
TOGETHER_API_KEY=your_together_key
```

## 📡 API Endpoints

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/transactions` | Create new transaction |
| GET | `/transactions` | List transactions (with filters) |
| GET | `/transactions/:id` | Get transaction by ID |
| POST | `/transactions/analyze` | Analyze transaction for fraud |
| POST | `/transactions/batch` | Batch analyze transactions |

### Fraud Scores
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/fraud-scores/:transactionId` | Get fraud score |
| GET | `/fraud-scores` | List fraud scores |
| POST | `/fraud-scores/explain/:transactionId` | Get score explanation |

### Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/alerts` | Create alert rule |
| GET | `/alerts` | List alerts |
| PUT | `/alerts/:id` | Update alert |
| DELETE | `/alerts/:id` | Delete alert |
| POST | `/alerts/:id/trigger` | Manually trigger alert |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/summary` | Dashboard summary stats |
| GET | `/analytics/risk-distribution` | Risk level distribution |
| GET | `/analytics/timeline` | Transaction timeline |
| GET | `/analytics/trends` | Fraud trends analysis |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reports/generate` | Generate PDF/CSV report |
| GET | `/reports/:id` | Download generated report |

### ML Engine
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Analyze single transaction |
| POST | `/batch-analyze` | Batch analyze transactions |
| POST | `/detect-anomalies` | Detect anomalies |
| GET | `/model-info` | Get model information |
| POST | `/explain/:transactionId` | Explain prediction |
| POST | `/retrain` | Trigger model retraining |

## 🤖 AI Assistant Commands

The AI assistant understands natural language and can perform these actions:

- **"Analyze this transaction"** - Analyzes transaction data for fraud
- **"What's the fraud score for TXN_123?"** - Retrieves fraud score
- **"Show me the risk breakdown"** - Opens risk visualization
- **"Get recent high-risk transactions"** - Lists flagged transactions
- **"Create an alert for high-risk transactions"** - Sets up alert rule
- **"Export a fraud report for this week"** - Generates downloadable report

## 🧪 Testing

```bash
# Run frontend tests
cd frontend/tools/01-fraudguard && npm test

# Run API tests
cd backend/tools/01-fraudguard/api && npm test

# Run ML Engine tests
cd backend/tools/01-fraudguard/ml-engine && pytest

# Run AI Assistant tests
cd backend/tools/01-fraudguard/ai-assistant && npm test
```

## 📊 Risk Scoring Algorithm

The fraud score is calculated using a combination of:

1. **ML Model Score** (40% weight)
   - Neural network trained on transaction patterns
   - Features: amount, velocity, location, device, time

2. **Rule-Based Score** (30% weight)
   - High-risk country detection
   - Velocity checks (transactions per hour)
   - Amount threshold analysis
   - Device fingerprint matching
   - IP geolocation mismatch

3. **Anomaly Score** (30% weight)
   - Statistical outlier detection
   - Behavioral pattern analysis
   - Time-based anomalies

### Risk Levels
| Score Range | Risk Level | Action |
|-------------|------------|--------|
| 0-30 | Low | Auto-approve |
| 31-50 | Medium | Review recommended |
| 51-70 | High | Manual review required |
| 71-100 | Critical | Auto-decline + Alert |

## 🔐 Security

- All API endpoints require authentication (JWT)
- Rate limiting on API and WebSocket connections
- Input validation with Zod schemas
- SQL injection prevention (MongoDB)
- XSS protection headers
- CORS configuration
- SSL/TLS encryption in production

## 📈 Monitoring

Health check endpoints:
- API: `GET /health`
- ML Engine: `GET /health`
- AI Assistant: `GET /health`

## 🗂️ Project Structure

```
VictoryKit/
├── frontend/tools/01-fraudguard/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TransactionForm.tsx
│   │   │   ├── FraudScoreCard.tsx
│   │   │   ├── RiskVisualization.tsx
│   │   │   ├── TransactionHistory.tsx
│   │   │   ├── AlertsPanel.tsx
│   │   │   └── ExportReport.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── Dockerfile
│
├── backend/tools/01-fraudguard/
│   ├── api/
│   │   ├── src/
│   │   │   ├── models/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   └── services/
│   │   └── Dockerfile
│   │
│   ├── ml-engine/
│   │   ├── models/
│   │   ├── main.py
│   │   └── Dockerfile
│   │
│   └── ai-assistant/
│       ├── src/
│       │   ├── services/
│       │   └── functions/
│       └── Dockerfile
│
├── infrastructure/
│   ├── nginx/sites-available/
│   │   └── fguard.maula.ai.conf
│   └── mongo/init/
│       └── init-fraudguard.js
│
└── docker-compose.phase2.yml
```

## 📝 License

Part of VictoryKit - All rights reserved.

## 🤝 Contributing

1. Create a feature branch from `phase-2-fraudguard`
2. Make your changes
3. Submit a pull request

---

**FraudGuard** - Protecting transactions with AI-powered fraud detection 🛡️
