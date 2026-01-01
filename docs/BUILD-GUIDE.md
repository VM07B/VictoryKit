# 🚀 BUILD-GUIDE.md - MAULA.AI Complete Implementation Guide

## 🎯 Purpose
This is your step-by-step implementation checklist. Follow these steps in order to build the entire MAULA.AI platform from scratch.

---

## 📖 Quick Navigation

- **Planning Complete?** ✅ Yes - All 11 documentation files ready
- **Code Examples Ready?** ✅ Yes - See [10-BACKEND-DETAILED-IMPLEMENTATION.md](./10-BACKEND-DETAILED-IMPLEMENTATION.md)
- **Neural Link Interface?** ✅ Yes - Located in `/neural-link-interface/`
- **Ready to Build?** 🚀 Yes - Follow Phase 1 below

---

## 🏗️ Build Sequence

### PHASE 1: Central Grid Station (Foundation)
**Goal:** Build core infrastructure that all 50 tools depend on  
**Time:** 1-2 weeks

#### 1.1 Auth Service
- **Port:** 5000
- **Database:** `maula_auth_db`
- **Reference:** [10-BACKEND-DETAILED-IMPLEMENTATION.md](./10-BACKEND-DETAILED-IMPLEMENTATION.md) - Auth Service section

**Steps:**
```bash
# 1. Create folder structure
mkdir -p backend/shared-services/auth-service/src/{controllers,models,routes,services,middleware,utils,config,tests}

# 2. Initialize project
cd backend/shared-services/auth-service
npm init -y

# 3. Install dependencies
npm install express mongoose bcryptjs jsonwebtoken passport passport-google-oauth20 passport-github2 cors redis express-rate-limit winston dotenv

# 4. Install dev dependencies
npm install -D typescript @types/express @types/node @types/bcryptjs @types/jsonwebtoken ts-node nodemon jest @types/jest
```

**Files to Create:**
- [ ] `src/models/User.ts` - User schema (150 lines, example in docs)
- [ ] `src/controllers/authController.ts` - Auth endpoints (250 lines)
- [ ] `src/services/jwtService.ts` - JWT utilities (150 lines)
- [ ] `src/middleware/authMiddleware.ts` - JWT verification (120 lines)
- [ ] `src/routes/auth.ts` - Auth routes (100 lines)
- [ ] `src/config/database.ts` - MongoDB connection (80 lines)
- [ ] `src/server.ts` - Express app (120 lines)
- [ ] `package.json`, `tsconfig.json`, `.env.example`
- [ ] `Dockerfile`

**Testing:**
```bash
# Start service
npm run dev

# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"John","lastName":"Doe"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

**Deployment:**
- [ ] Create Dockerfile
- [ ] Build image: `docker build -t maula/auth-service .`
- [ ] Run container: `docker run -p 5000:5000 maula/auth-service`
- [ ] Configure Nginx reverse proxy
- [ ] Set up SSL certificate (Let's Encrypt)

---

#### 1.2 API Gateway
- **Port:** 4000
- **Reference:** [10-BACKEND-DETAILED-IMPLEMENTATION.md](./10-BACKEND-DETAILED-IMPLEMENTATION.md)

**Steps:**
```bash
mkdir -p backend/shared-services/api-gateway/src/{routes,middleware,services,utils,config}
cd backend/shared-services/api-gateway
npm init -y
npm install express http-proxy-middleware redis express-rate-limit cors winston
npm install -D typescript @types/express ts-node nodemon
```

**Files to Create:**
- [ ] `src/routes/index.ts` - Route to 50 tool backends
- [ ] `src/middleware/rateLimit.ts` - Rate limiting
- [ ] `src/middleware/apiKeyAuth.ts` - API key validation
- [ ] `src/server.ts`
- [ ] `Dockerfile`

**Testing:**
```bash
npm run dev
curl http://localhost:4000/health
```

---

#### 1.3 Main Landing Site (maula.ai)
- **Port:** 3000
- **Framework:** Next.js 14
- **Reference:** [02-FRONTEND-ARCHITECTURE.md](./02-FRONTEND-ARCHITECTURE.md)

**Steps:**
```bash
# Create Next.js app
npx create-next-app@latest frontend/main-dashboard --typescript --tailwind --app

cd frontend/main-dashboard
npm install lucide-react axios swr
```

**Pages to Create:**
- [ ] `app/page.tsx` - Homepage with 50 tool cards in grid
- [ ] `app/tools/[toolId]/page.tsx` - Tool detail page
- [ ] `app/(auth)/login/page.tsx` - Login
- [ ] `app/(auth)/register/page.tsx` - Registration
- [ ] `app/dashboard/page.tsx` - User dashboard
- [ ] `app/profile/page.tsx` - User profile
- [ ] `app/api-keys/page.tsx` - API key management
- [ ] `app/billing/page.tsx` - Subscription & billing

**Components to Create:**
- [ ] `components/Navbar.tsx`
- [ ] `components/ToolCard.tsx` - Display tool info
- [ ] `components/Sidebar.tsx`
- [ ] `components/Footer.tsx`

**Testing:**
```bash
npm run dev
# Visit http://localhost:3000
```

**Deployment:**
- [ ] Build: `npm run build`
- [ ] Create Dockerfile
- [ ] Configure Nginx for maula.ai → port 3000

---

#### 1.4 Infrastructure Setup

**MongoDB Atlas:**
- [ ] Create MongoDB Atlas account
- [ ] Create cluster (M10 recommended)
- [ ] Create database: `maula_auth_db`
- [ ] Create database user
- [ ] Whitelist AWS EC2 IP
- [ ] Get connection string
- [ ] Test connection: `mongosh "mongodb+srv://..."`

**Nginx Configuration:**
```nginx
# /etc/nginx/sites-available/maula.ai

# Main site
server {
    listen 443 ssl;
    server_name maula.ai;
    
    ssl_certificate /etc/letsencrypt/live/maula.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/maula.ai/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Auth service
server {
    listen 443 ssl;
    server_name auth.maula.ai;
    
    location / {
        proxy_pass http://localhost:5000;
    }
}

# API Gateway
server {
    listen 443 ssl;
    server_name api.maula.ai;
    
    location / {
        proxy_pass http://localhost:4000;
    }
}
```

**Cloudflare DNS:**
- [ ] Add domain maula.ai
- [ ] Create A record: maula.ai → AWS EC2 IP
- [ ] Create CNAME: `*.maula.ai` → maula.ai (wildcard)
- [ ] Enable proxy (orange cloud)
- [ ] Set SSL/TLS: Full (strict)
- [ ] Test: `dig maula.ai`, `dig auth.maula.ai`

---

### PHASE 2: First Complete Tool (FraudGuard)
**Goal:** Build one complete tool to validate the pattern  
**Time:** 2-3 weeks

#### 2.1 Frontend (fguard.maula.ai)
- **Port:** 3001
- **Base:** Neural Link Interface

**Steps:**
```bash
# Copy Neural Link Interface
cp -r neural-link-interface/ frontend/tools/01-fraudguard/

cd frontend/tools/01-fraudguard
npm install
```

**Customization:**
1. **Create `fraudguard-config.json`:**
```json
{
  "toolName": "FraudGuard",
  "tagline": "AI-Powered Fraud Detection",
  "subdomain": "fguard.maula.ai",
  "systemPrompt": "You are FraudGuard AI, an expert in transaction fraud detection. You help users analyze transactions, detect suspicious patterns, calculate risk scores, and generate fraud reports. You have access to real-time fraud detection APIs and machine learning models.",
  "functions": [
    {
      "name": "analyze_transaction",
      "description": "Analyze a transaction for fraud indicators",
      "parameters": {...}
    },
    {
      "name": "get_fraud_score",
      "description": "Get fraud risk score 0-100",
      "parameters": {...}
    },
    {
      "name": "open_risk_visualization",
      "description": "Open risk graphs in new tab",
      "parameters": {...}
    },
    {
      "name": "get_transaction_history",
      "description": "Fetch transaction history",
      "parameters": {...}
    },
    {
      "name": "create_alert",
      "description": "Create fraud monitoring alert",
      "parameters": {...}
    },
    {
      "name": "export_report",
      "description": "Export fraud report as PDF/CSV",
      "parameters": {...}
    }
  ],
  "colorTheme": {
    "primary": "#ff0055",
    "secondary": "#00d4ff",
    "accent": "#ffdd00"
  },
  "navigationItems": [
    {"label": "Fraud Analysis", "path": "/analyze"},
    {"label": "Transaction History", "path": "/history"},
    {"label": "Risk Dashboard", "path": "/dashboard"},
    {"label": "Alerts", "path": "/alerts"},
    {"label": "Settings", "path": "/settings"}
  ]
}
```

2. **Create Tool-Specific Components:**
- [ ] `src/components/TransactionForm.tsx` - Input transaction data
- [ ] `src/components/FraudScoreCard.tsx` - Display fraud risk 0-100
- [ ] `src/components/RiskVisualization.tsx` - Charts, heat maps
- [ ] `src/components/TransactionHistory.tsx` - Past analyses
- [ ] `src/components/AlertsPanel.tsx` - High-risk alerts
- [ ] `src/components/ExportReport.tsx` - PDF/CSV export

3. **Implement AI Function Handlers:**
- [ ] `src/services/fraudguard-tools.ts` - Implement all 6 functions

4. **Update Branding:**
- [ ] Update `App.tsx` - Change tool name to "FraudGuard"
- [ ] Update logo, favicon
- [ ] Update color scheme (neon red for fraud alerts)

**Testing:**
```bash
npm run dev
# Visit http://localhost:3001
```

**Deployment:**
- [ ] Build: `npm run build`
- [ ] Create Dockerfile
- [ ] Configure Nginx for fguard.maula.ai → port 3001
- [ ] Test subdomain

---

#### 2.2 Backend API Service
- **Port:** 4001
- **Database:** `fraudguard_db`

**Steps:**
```bash
mkdir -p backend/tools/01-fraudguard/api/src/{controllers,models,routes,services,middleware,utils,config}
cd backend/tools/01-fraudguard/api
npm init -y
npm install express mongoose axios cors winston
npm install -D typescript @types/express ts-node nodemon
```

**Files to Create:**
- [ ] `src/models/Transaction.ts` - Transaction schema
```typescript
export interface ITransaction {
  transactionId: string;
  amount: number;
  userIp?: string;
  deviceFingerprint?: string;
  email?: string;
  cardLast4?: string;
  merchantId?: string;
  timestamp: Date;
  userId: string;
  status: 'analyzing' | 'approved' | 'blocked';
  fraudScore?: mongoose.Types.ObjectId;
}
```

- [ ] `src/models/FraudScore.ts` - Fraud score schema
- [ ] `src/controllers/fraudController.ts` - API endpoints
  - POST `/api/fraudguard/analyze` - Analyze transaction
  - GET `/api/fraudguard/score/:id` - Get fraud score
  - GET `/api/fraudguard/history` - Transaction history
- [ ] `src/services/fraudService.ts` - Business logic
- [ ] `src/services/mlEngineClient.ts` - Call Python ML engine
- [ ] `src/server.ts`

**Testing:**
```bash
npm run dev

curl -X POST http://localhost:4001/api/fraudguard/analyze \
  -H "Content-Type: application/json" \
  -d '{"transaction_id":"TX001","amount":1500,"user_ip":"192.168.1.1"}'
```

---

#### 2.3 ML Engine (Python/FastAPI)
- **Port:** 8001

**Steps:**
```bash
mkdir -p backend/tools/01-fraudguard/ml-engine/src/{models,services,api,utils,config}
cd backend/tools/01-fraudguard/ml-engine

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn tensorflow scikit-learn pandas numpy

# Create requirements.txt
pip freeze > requirements.txt
```

**Files to Create:**
- [ ] `src/api/main.py` - FastAPI endpoints
```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class TransactionData(BaseModel):
    transaction_id: str
    amount: float
    user_ip: str = None
    device_fingerprint: str = None

@app.post("/predict")
async def predict_fraud(data: TransactionData):
    # ML prediction logic
    return {
        "transaction_id": data.transaction_id,
        "prediction": "fraud" or "legitimate",
        "probability": 0.85,
        "confidence": 0.92
    }

@app.post("/score")
async def calculate_risk_score(data: TransactionData):
    # Risk score calculation
    return {
        "risk_score": 75,
        "risk_level": "high",
        "risk_factors": [...]
    }
```

- [ ] `src/models/fraud_model.py` - TensorFlow model
- [ ] `src/services/prediction.py` - Prediction service
- [ ] `src/services/feature_engineering.py` - Feature extraction

**Testing:**
```bash
# Start server
uvicorn src.api.main:app --reload --port 8001

# Test endpoint
curl -X POST http://localhost:8001/predict \
  -H "Content-Type: application/json" \
  -d '{"transaction_id":"TX001","amount":1500}'
```

---

#### 2.4 AI Assistant Service (WebSocket + LLMs)
- **Port:** 6001
- **Database:** `fraudguard_db` (shared with API)

**Steps:**
```bash
mkdir -p backend/tools/01-fraudguard/ai-assistant/src/{services,functions,websocket,models,controllers,routes,config}
cd backend/tools/01-fraudguard/ai-assistant
npm init -y
npm install ws @google/generative-ai @anthropic-ai/sdk openai mongoose axios
npm install -D typescript @types/ws ts-node nodemon
```

**Files to Create:**
- [ ] `src/services/geminiService.ts` - Google Gemini integration
- [ ] `src/services/claudeService.ts` - Anthropic Claude integration
- [ ] `src/services/openaiService.ts` - OpenAI GPT integration
- [ ] `src/services/xaiService.ts` - xAI Grok integration
- [ ] `src/services/mistralService.ts` - Mistral AI integration
- [ ] `src/services/llamaService.ts` - Meta Llama integration
- [ ] `src/services/llmRouter.ts` - Route to selected provider

- [ ] `src/functions/fraudguardFunctions.ts` - All 6 AI functions:
```typescript
export const fraudguardFunctions = {
  analyze_transaction: {
    declaration: {...},
    handler: async (args) => {
      const response = await axios.post('http://localhost:4001/api/fraudguard/analyze', args);
      return response.data;
    }
  },
  get_fraud_score: {...},
  open_risk_visualization: {...},
  get_transaction_history: {...},
  create_alert: {...},
  export_report: {...}
};
```

- [ ] `src/websocket/chatHandler.ts` - WebSocket server
- [ ] `src/models/ChatSession.ts` - Chat session schema
- [ ] `src/config/systemPrompt.ts` - FraudGuard AI system prompt
- [ ] `src/server.ts`

**Testing:**
```bash
npm run dev

# Test WebSocket connection (use wscat or browser)
wscat -c ws://localhost:6001
```

**Environment Variables:**
```env
# .env
GEMINI_API_KEY=your_key
CLAUDE_API_KEY=your_key
OPENAI_API_KEY=your_key
GROK_API_KEY=your_key
MISTRAL_API_KEY=your_key
LLAMA_API_KEY=your_key
MONGODB_URI=mongodb+srv://...
PORT=6001
```

---

#### 2.5 End-to-End Testing

**Test Flow:**
1. **Auth:** Register/login on maula.ai
2. **Tool Access:** Click FraudGuard card → See detail page → Click "Access Tool"
3. **Tool Opens:** fguard.maula.ai loads with Neural Link Interface
4. **Fraud Analysis:**
   - Enter transaction data in TransactionForm
   - Submit for analysis
   - Verify API call to port 4001
   - Verify ML engine call to port 8001
   - Verify fraud score calculation
   - See results displayed in UI
5. **AI Assistant:**
   - Open AI chat panel
   - Send message: "Analyze transaction TX001"
   - Verify WebSocket connection (port 6001)
   - Verify function calling (analyze_transaction executed)
   - Verify LLM response
   - Test multi-tab: AI opens risk visualization
6. **Test All LLMs:** Switch between Gemini, Claude, GPT, Grok, Mistral, Llama
7. **Test Voice:** Use STT and Live Audio modes
8. **Test Workspace Modes:** CHAT, PORTAL, CANVAS

**Performance Testing:**
```bash
# Load test with Apache Bench
ab -n 1000 -c 100 http://fguard.maula.ai/

# Monitor with htop, docker stats
```

---

### PHASE 3: Replicate to 49 Tools
**Goal:** Build remaining tools using FraudGuard as template  
**Time:** 4-6 months (2-3 tools per week)

#### 3.1 Create Tool Creation Script

**File:** `scripts/create-tool.sh`
```bash
#!/bin/bash

TOOL_NAME=$1
TOOL_ID=$2
TOOL_SUBDOMAIN=$3

echo "Creating tool: $TOOL_NAME (ID: $TOOL_ID, Subdomain: $TOOL_SUBDOMAIN)"

# Copy frontend
cp -r neural-link-interface/ frontend/tools/${TOOL_ID}-${TOOL_NAME}/

# Copy backend
cp -r backend/tools/01-fraudguard/ backend/tools/${TOOL_ID}-${TOOL_NAME}/

# Update ports
sed -i "s/3001/30${TOOL_ID}/g" frontend/tools/${TOOL_ID}-${TOOL_NAME}/package.json
sed -i "s/4001/40${TOOL_ID}/g" backend/tools/${TOOL_ID}-${TOOL_NAME}/api/src/server.ts
sed -i "s/8001/80${TOOL_ID}/g" backend/tools/${TOOL_ID}-${TOOL_NAME}/ml-engine/src/api/main.py
sed-i "s/6001/60${TOOL_ID}/g" backend/tools/${TOOL_ID}-${TOOL_NAME}/ai-assistant/src/server.ts

# Update database names
sed -i "s/fraudguard_db/${TOOL_NAME}_db/g" backend/tools/${TOOL_ID}-${TOOL_NAME}/*/src/config/database.ts

echo "Tool created! Now customize tool-config.json and AI functions."
```

**Usage:**
```bash
chmod +x scripts/create-tool.sh
./scripts/create-tool.sh smartscore 02 sscore.maula.ai
./scripts/create-tool.sh ipintel 11 ipintel.maula.ai
```

#### 3.2 Build Each Tool

**For Each Tool (02-50):**
1. [ ] Run creation script
2. [ ] Customize `{tool}-config.json`:
   - Update system prompt for tool's domain
   - Define tool-specific AI functions
   - Set color theme
   - Add navigation items
3. [ ] Create tool-specific UI components
4. [ ] Implement tool-specific AI functions
5. [ ] Build/train ML models for tool's use case
6. [ ] Create MongoDB database: `{toolname}_db`
7. [ ] Update Nginx config (add subdomain block)
8. [ ] Test locally
9. [ ] Deploy all 4 services (frontend, API, ML, AI)
10. [ ] Test end-to-end
11. [ ] Update main dashboard (add tool card)

**Tools to Build:**
- [ ] 02 - SmartScore (ports 3002, 4002, 8002, 6002)
- [ ] 03 - CheckoutShield (ports 3003, 4003, 8003, 6003)
- [ ] 04 - FraudFlow
- [ ] 05 - RiskEngine
- [ ] 06 - DevicePrint
- [ ] 07 - TrustDevice
- [ ] 08 - BioScan
- [ ] 09 - MultiAuth
- [ ] 10 - VerifyMe
- [ ] 11 - IPIntel (ports 3011, 4011, 8011, 6011)
- [ ] 12-50 - Remaining 39 tools

---

### PHASE 4: DevOps & Production
**Goal:** Production-ready deployment  
**Time:** 1 week

#### 4.1 Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  auth-service:
    build: ./backend/shared-services/auth-service
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
    restart: always
    
  api-gateway:
    build: ./backend/shared-services/api-gateway
    ports:
      - "4000:4000"
    restart: always
    
  main-dashboard:
    build: ./frontend/main-dashboard
    ports:
      - "3000:3000"
    restart: always
    
  fraudguard-frontend:
    build: ./frontend/tools/01-fraudguard
    ports:
      - "3001:3001"
    restart: always
    
  fraudguard-api:
    build: ./backend/tools/01-fraudguard/api
    ports:
      - "4001:4001"
    restart: always
    
  fraudguard-ml:
    build: ./backend/tools/01-fraudguard/ml-engine
    ports:
      - "8001:8001"
    restart: always
    
  fraudguard-ai:
    build: ./backend/tools/01-fraudguard/ai-assistant
    ports:
      - "6001:6001"
    restart: always
    
  # ... (add all 50 tools × 4 services)
```

#### 4.2 Monitoring & Logging
- [ ] Install Prometheus (metrics)
- [ ] Install Grafana (dashboards)
- [ ] Configure Winston logging in all services
- [ ] Set up ELK stack or AWS CloudWatch
- [ ] Create alerting rules (Slack/email)

#### 4.3 CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
        
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker images
        run: docker-compose build
        
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to AWS EC2
        run: |
          ssh ec2-user@${{ secrets.EC2_HOST }} \
            "cd /var/www/maula && git pull && docker-compose up -d"
```

---

## 📊 Progress Tracker

### Completed: ✅
- [x] All documentation (11 files)
- [x] Neural Link Interface analysis
- [x] Code examples and templates
- [x] Architecture planning

### Phase 1: Central Grid (0%)
- [ ] Auth Service
- [ ] API Gateway
- [ ] Main Landing Site
- [ ] MongoDB Atlas
- [ ] Nginx Configuration
- [ ] Cloudflare DNS

### Phase 2: First Tool (0%)
- [ ] FraudGuard Frontend
- [ ] FraudGuard API
- [ ] FraudGuard ML Engine
- [ ] FraudGuard AI Assistant
- [ ] End-to-end testing

### Phase 3: Remaining Tools (0%)
- [ ] SmartScore (Tool 02)
- [ ] CheckoutShield (Tool 03)
- [ ] ... (Tools 04-50)

### Phase 4: Production (0%)
- [ ] Docker Compose
- [ ] Monitoring
- [ ] CI/CD
- [ ] Load testing

---

## 🎯 Current Status: READY TO BUILD

**Next Action:** Start Phase 1, Step 1.1 - Auth Service

**Command to Begin:**
```bash
mkdir -p backend/shared-services/auth-service/src/{controllers,models,routes,services,middleware,utils,config,tests}
cd backend/shared-services/auth-service
npm init -y
```

**Reference Documentation:**
- [10-BACKEND-DETAILED-IMPLEMENTATION.md](./10-BACKEND-DETAILED-IMPLEMENTATION.md) - Complete code examples
- [02-FRONTEND-ARCHITECTURE.md](./02-FRONTEND-ARCHITECTURE.md) - Frontend guide
- [04-DATABASE-ARCHITECTURE.md](./04-DATABASE-ARCHITECTURE.md) - Database schemas

---

**Let's build! 🚀**