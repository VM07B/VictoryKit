# 🏙️ MAULA.AI - The City Architecture

## 🎯 The Vision: 50 Buildings, 1 City

```
                    ┌─────────────────────────────────┐
                    │      MAULA.AI (Main City)       │
                    │       Central Dashboard         │
                    └────────────┬────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   POWER GRID STATION    │
                    │  (Centralized Services) │
                    │  ├─ Auth System         │
                    │  ├─ Billing System      │
                    │  └─ User Management     │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┴────────────────────────┐
        │                                                  │
   ┌────▼────┐  ┌────▼────┐  ┌────▼────┐      ┌────▼────┐
   │Building1│  │Building2│  │Building3│ ...  │Building50│
   │FraudGuard│  │IPIntel  │  │BotShield│      │Session  │
   │Own Grid │  │Own Grid │  │Own Grid │      │Own Grid │
   └─────────┘  └─────────┘  └─────────┘      └─────────┘
```

---

## 🏗️ Complete Site Structure

### 1. **Main Landing Site** → `maula.ai`

```
maula.ai/
├─ Home Page
│  └─ 50 Tool Cards (Grid Layout)
│     ├─ Card: FraudGuard
│     ├─ Card: IPIntel
│     └─ ... (48 more)
│
├─ Tool Detail Pages
│  ├─ /tools/fraudguard
│  │  ├─ Introduction
│  │  ├─ Features
│  │  ├─ Usage Guide
│  │  ├─ Pricing
│  │  ├─ API Documentation
│  │  └─ Buttons:
│  │     ├─ [← Back to Home]
│  │     └─ [Access Tool →] (redirects to fguard.maula.ai)
│  │
│  ├─ /tools/ipintel
│  │  └─ [Access Tool →] (redirects to ipintel.maula.ai)
│  │
│  └─ ... (48 more detail pages)
│
├─ User Dashboard
│  ├─ My Tools
│  ├─ API Keys
│  ├─ Billing
│  └─ Analytics
│
└─ Auth Pages
   ├─ /login
   ├─ /register
   └─ /profile
```

---

### 2. **50 Tool Subdomains** (Separate Buildings)

Each tool is a **completely independent site** with its own:
- ✅ Subdomain
- ✅ Frontend (Neural Link Interface)
- ✅ Backend API
- ✅ ML Engine
- ✅ AI Assistant
- ✅ Database
- ✅ Tool-specific features

---

## 🏢 Building 1: FraudGuard Example

### Subdomain: `fguard.maula.ai`

```
fguard.maula.ai/
│
├─ Frontend (Neural Link Interface + Tool-Specific UI)
│  ├─ Multi-Tab Workspace
│  │  ├─ Tab 1: Chat with AI
│  │  ├─ Tab 2: Transaction Analysis
│  │  ├─ Tab 3: Fraud Score Dashboard
│  │  ├─ Tab 4: Risk Graph Visualization
│  │  ├─ Tab 5: Alert Configuration
│  │  └─ Tab N: Dynamic (AI opens)
│  │
│  └─ Tool-Specific Features
│     ├─ Transaction Input Form
│     ├─ Fraud Score Display
│     ├─ Risk Timeline Graph
│     ├─ Historical Analysis
│     └─ Webhook Manager
│
├─ Backend API (Node.js)
│  ├─ /api/analyze-transaction
│  ├─ /api/get-fraud-score
│  ├─ /api/history
│  ├─ /api/webhooks
│  └─ /api/settings
│
├─ ML Engine (Python)
│  ├─ Fraud detection models
│  ├─ Risk scoring algorithms
│  └─ Pattern recognition
│
├─ AI Assistant (Gemini/Multi-LLM)
│  ├─ Autonomous actions for FraudGuard
│  ├─ Function declarations:
│  │  ├─ analyze_transaction()
│  │  ├─ show_fraud_patterns()
│  │  ├─ configure_alerts()
│  │  ├─ generate_report()
│  │  └─ open_risk_visualization()
│  │
│  └─ System Prompt:
│     "You are FraudGuard AI, specialized in fraud detection.
│      You can analyze transactions, detect patterns, configure
│      alerts, and open visualization tabs automatically."
│
└─ Database (MongoDB)
   ├─ fraudguard_transactions
   ├─ fraudguard_scores
   ├─ fraudguard_chat_history
   └─ fraudguard_webhooks
```

---

## 🏢 Building 2: IPIntel Example

### Subdomain: `ipintel.maula.ai`

```
ipintel.maula.ai/
│
├─ Frontend (Neural Link Interface + Tool-Specific UI)
│  ├─ Multi-Tab Workspace
│  │  ├─ Tab 1: Chat with AI
│  │  ├─ Tab 2: IP Analysis Results
│  │  ├─ Tab 3: Geolocation Map
│  │  ├─ Tab 4: WHOIS Information
│  │  ├─ Tab 5: Threat Intelligence
│  │  └─ Tab N: Dynamic (AI opens)
│  │
│  └─ Tool-Specific Features
│     ├─ IP Input Form
│     ├─ Risk Score Display
│     ├─ Interactive World Map
│     ├─ VPN/Proxy Detection
│     └─ Historical Lookups
│
├─ Backend API (Node.js)
│  ├─ /api/analyze-ip
│  ├─ /api/geolocation
│  ├─ /api/whois
│  ├─ /api/threat-intel
│  └─ /api/history
│
├─ ML Engine (Python)
│  ├─ IP risk classification
│  ├─ VPN/proxy detection
│  └─ Geolocation analysis
│
├─ AI Assistant (Gemini/Multi-LLM)
│  ├─ Autonomous actions for IPIntel
│  ├─ Function declarations:
│  │  ├─ analyze_ip()
│  │  ├─ show_map()
│  │  ├─ get_whois()
│  │  ├─ find_related_ips()
│  │  └─ configure_blocking()
│  │
│  └─ System Prompt:
│     "You are IPIntel AI, specialized in IP analysis.
│      You can analyze IPs, show maps, detect threats,
│      and configure blocking rules automatically."
│
└─ Database (MongoDB)
   ├─ ipintel_analyses
   ├─ ipintel_geolocation
   ├─ ipintel_chat_history
   └─ ipintel_whois_cache
```

---

## 🏢 Building 3-50: Same Pattern

Every building follows the same structure:
1. Own subdomain
2. Neural Link Interface
3. Tool-specific features
4. Independent backend/frontend/database
5. Specialized AI assistant

---

## ⚡ The Central Grid Station (Shared Services)

### Subdomain: `auth.maula.ai` & `api.maula.ai`

```
Central Services (Grid Station)
│
├─ Authentication Service
│  ├─ Single Sign-On (SSO)
│  ├─ JWT Token Management
│  ├─ OAuth Integration
│  └─ Session Management
│
├─ Billing Service
│  ├─ Subscription Management
│  ├─ Payment Processing
│  ├─ Usage Tracking
│  └─ Invoice Generation
│
├─ User Management
│  ├─ User Profiles
│  ├─ Permissions
│  ├─ API Key Management
│  └─ Cross-Tool Analytics
│
└─ Central Database (MongoDB)
   ├─ users
   ├─ subscriptions
   ├─ api_keys
   ├─ billing_records
   └─ global_analytics
```

Every building (tool) connects to this grid for:
- ✅ User authentication
- ✅ Billing/subscription checks
- ✅ API key validation
- ✅ Cross-tool analytics

---

## 🔌 How Buildings Connect to Grid

### Authentication Flow
```
1. User visits fguard.maula.ai
2. FraudGuard checks JWT token
3. If no token → redirect to auth.maula.ai/login
4. User logs in → Central Auth issues JWT
5. Redirect back to fguard.maula.ai with token
6. FraudGuard validates token with Central Auth
7. User can now use FraudGuard
```

### API Call Flow
```
User → FraudGuard Frontend
     ↓
FraudGuard Backend API
     ↓
1. Validate API key (check Central Grid)
2. Check rate limits (check Central Grid)
3. Verify subscription (check Central Grid)
     ↓
Process request locally (FraudGuard ML Engine)
     ↓
Save to local database (fraudguard_db)
     ↓
Return result to user
```

---

## 🗂️ Complete Directory Structure

```
VictoryKit/
│
├─ main-site/                        # maula.ai
│  ├─ frontend/
│  │  ├─ pages/
│  │  │  ├─ index.tsx                # Homepage with 50 cards
│  │  │  ├─ tools/
│  │  │  │  ├─ [toolId].tsx          # Tool detail page
│  │  │  │  └─ ...
│  │  │  ├─ login.tsx
│  │  │  ├─ register.tsx
│  │  │  └─ dashboard.tsx
│  │  ├─ components/
│  │  │  ├─ ToolCard.tsx
│  │  │  ├─ Hero.tsx
│  │  │  └─ Navbar.tsx
│  │  └─ package.json
│  │
│  └─ backend/
│     ├─ routes/
│     └─ package.json
│
├─ central-services/                 # Grid Station
│  ├─ auth-service/
│  │  ├─ src/
│  │  │  ├─ controllers/
│  │  │  ├─ models/
│  │  │  └─ routes/
│  │  └─ package.json
│  │
│  ├─ billing-service/
│  └─ user-service/
│
├─ tools/                            # 50 Buildings
│  │
│  ├─ 01-fraudguard/                 # fguard.maula.ai
│  │  ├─ frontend/
│  │  │  ├─ neural-link-interface/  # Copied & customized
│  │  │  ├─ components/
│  │  │  │  ├─ TransactionForm.tsx
│  │  │  │  ├─ FraudScoreCard.tsx
│  │  │  │  └─ RiskGraph.tsx
│  │  │  └─ package.json
│  │  │
│  │  ├─ backend/
│  │  │  ├─ api/
│  │  │  │  ├─ routes/
│  │  │  │  │  ├─ transactions.ts
│  │  │  │  │  ├─ analysis.ts
│  │  │  │  │  └─ webhooks.ts
│  │  │  │  └─ package.json
│  │  │  │
│  │  │  ├─ ml-engine/
│  │  │  │  ├─ models/
│  │  │  │  │  └─ fraud_detector.py
│  │  │  │  └─ requirements.txt
│  │  │  │
│  │  │  └─ ai-assistant/
│  │  │     ├─ prompts/
│  │  │     │  └─ fraudguard-prompt.ts
│  │  │     └─ functions/
│  │  │        └─ fraudguard-tools.ts
│  │  │
│  │  └─ database/
│  │     └─ schemas/
│  │        └─ fraudguard-schema.ts
│  │
│  ├─ 02-smartscore/                # smartscore.maula.ai
│  │  └─ ... (same structure)
│  │
│  ├─ 11-ipintel/                   # ipintel.maula.ai
│  │  ├─ frontend/
│  │  │  ├─ neural-link-interface/
│  │  │  ├─ components/
│  │  │  │  ├─ IPInputForm.tsx
│  │  │  │  ├─ GeoMap.tsx
│  │  │  │  └─ ThreatCard.tsx
│  │  │  └─ package.json
│  │  │
│  │  ├─ backend/
│  │  │  ├─ api/
│  │  │  ├─ ml-engine/
│  │  │  │  └─ models/
│  │  │  │     └─ ip_classifier.py
│  │  │  └─ ai-assistant/
│  │  │     └─ functions/
│  │  │        └─ ipintel-tools.ts
│  │  │
│  │  └─ database/
│  │
│  └─ ... (48 more tools)
│
└─ infrastructure/
   ├─ nginx/
   │  └─ nginx.conf                 # Routes to all subdomains
   ├─ docker/
   │  ├─ docker-compose.yml         # All services
   │  └─ Dockerfile (per service)
   └─ cloudflare/
      └─ dns-config.json            # 50+ subdomains
```

---

## 🌐 DNS & Subdomain Configuration

### Cloudflare DNS Records

```
Type    Name                    Target
──────  ────────────────────    ────────────────
A       maula.ai                → AWS_EC2_IP
CNAME   fguard.maula.ai         → AWS_EC2_IP
CNAME   smartscore.maula.ai     → AWS_EC2_IP
CNAME   checkoutshield.maula.ai → AWS_EC2_IP
CNAME   fraudflow.maula.ai      → AWS_EC2_IP
CNAME   riskengine.maula.ai     → AWS_EC2_IP
CNAME   deviceprint.maula.ai    → AWS_EC2_IP
CNAME   trustdevice.maula.ai    → AWS_EC2_IP
CNAME   bioscan.maula.ai        → AWS_EC2_IP
CNAME   multiauth.maula.ai      → AWS_EC2_IP
CNAME   verifyme.maula.ai       → AWS_EC2_IP
CNAME   ipintel.maula.ai        → AWS_EC2_IP
CNAME   proxydetect.maula.ai    → AWS_EC2_IP
... (43 more subdomains)
CNAME   auth.maula.ai           → AWS_EC2_IP
CNAME   api.maula.ai            → AWS_EC2_IP
```

---

## 🔧 Nginx Reverse Proxy Configuration

```nginx
# Main site
server {
    server_name maula.ai;
    location / {
        proxy_pass http://localhost:3000;
    }
}

# Tool 1: FraudGuard
server {
    server_name fguard.maula.ai;
    location / {
        proxy_pass http://localhost:3001;
    }
    location /api {
        proxy_pass http://localhost:4001;
    }
}

# Tool 11: IPIntel
server {
    server_name ipintel.maula.ai;
    location / {
        proxy_pass http://localhost:3011;
    }
    location /api {
        proxy_pass http://localhost:4011;
    }
}

# ... (48 more tool configs)

# Central Auth
server {
    server_name auth.maula.ai;
    location / {
        proxy_pass http://localhost:5000;
    }
}

# Central API Gateway
server {
    server_name api.maula.ai;
    location / {
        proxy_pass http://localhost:5001;
    }
}
```

---

## 🚀 User Journey Example

### Scenario: User wants to check for fraud

1. **Visit Main Site**
   ```
   User → maula.ai
   Sees 50 tool cards in grid
   ```

2. **Click FraudGuard Card**
   ```
   User → maula.ai/tools/fraudguard
   Sees:
   - FraudGuard introduction
   - Features list
   - Pricing
   - API docs
   - 2 buttons: [← Back] [Access Tool →]
   ```

3. **Click "Access Tool"**
   ```
   Redirect → fguard.maula.ai
   ```

4. **FraudGuard Site Loads**
   ```
   fguard.maula.ai
   ├─ Neural Link Interface appears
   ├─ AI greets: "FraudGuard AI ready. Upload transaction data."
   └─ Tool-specific UI shows
   ```

5. **User Sends Message**
   ```
   User: "Check this transaction for fraud"
   
   AI (autonomous):
   ├─ Opens Tab 1: Transaction analysis
   ├─ Opens Tab 2: Fraud score (ML result)
   ├─ Opens Tab 3: Risk graph
   ├─ Opens Tab 4: Similar patterns found
   ├─ Opens Tab 5: Recommended actions
   └─ Configures webhook automatically
   
   User: *sits back, watches* 🍿
   ```

---

## 🔋 Power Distribution (Auth Flow)

```
┌────────────────────────────────────────────────┐
│          Central Grid Station                  │
│         (auth.maula.ai)                        │
│  ┌──────────────────────────────────────┐     │
│  │  User Database                       │     │
│  │  ├─ user@example.com                 │     │
│  │  │  ├─ JWT Token: abc123...          │     │
│  │  │  ├─ Subscription: Pro              │     │
│  │  │  └─ Allowed Tools: All 50          │     │
│  └──────────────────────────────────────┘     │
└────────────────┬───────────────────────────────┘
                 │ (Distributes power)
        ┌────────┴────────┐
        │                 │
   ┌────▼────┐      ┌────▼────┐
   │FraudGuard│      │IPIntel  │
   │Building  │      │Building │
   │          │      │         │
   │Checks:   │      │Checks:  │
   │✅ Token   │      │✅ Token  │
   │✅ Sub     │      │✅ Sub    │
   │✅ Limits  │      │✅ Limits │
   └──────────┘      └─────────┘
```

---

## 📊 Port Allocation

```
Main Site:           3000
Central Auth:        5000
Central Billing:     5001
Central Analytics:   5002

FraudGuard:          3001 (frontend), 4001 (backend)
SmartScore:          3002 (frontend), 4002 (backend)
...
IPIntel:             3011 (frontend), 4011 (backend)
...
SessionGuard:        3050 (frontend), 4050 (backend)
```

---

## 🎯 Implementation Priority

### Phase 1: Build the Grid
1. Central auth service
2. Central billing service
3. Main landing site (maula.ai)

### Phase 2: First Building
1. FraudGuard (complete)
   - Neural Link Interface
   - Tool-specific features
   - Backend API
   - ML engine
   - AI assistant

### Phase 3: Second Building
1. IPIntel (complete)

### Phase 4: Replicate
1. Use FraudGuard as template
2. Build remaining 48 tools

---

**THIS IS THE PERFECT ARCHITECTURE!** 🏙️

Every tool is a separate building with its own power supply, but all connected to the central grid! 

**Should we start building?** Which one first:
1. **Central Grid** (auth/billing)?
2. **Main Site** (landing page)?
3. **First Building** (FraudGuard)?

Let me know! 🚀
