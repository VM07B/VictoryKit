# ⚡ Quick Reference - MAULA.AI

## 🎯 Project at a Glance

**Name**: MAULA.AI (VictoryKit)  
**Domain**: maula.ai  
**Tagline**: The world's first AI-powered security services platform  

---

## 📊 Numbers That Matter

| Metric | Count |
|--------|-------|
| Security Tools | 50 |
| Total Microservices | 203 |
| Frontend Apps | 51 |
| Backend Services | 152 |
| AI Assistants | 50 |
| Databases | 51 |
| LLM Providers | 6 |
| Estimated LOC | 500,000+ |

---

## 🛡️ The 50 Tools (Quick List)

### Payment & Fraud (5)
1. FraudGuard
2. SmartScore
3. CheckoutShield
4. FraudFlow
5. RiskEngine

### Device & Biometrics (5)
6. DevicePrint
7. TrustDevice
8. BioScan
9. MultiAuth
10. VerifyMe

### IP & Network (5)
11. IPIntel
12. ProxyDetect
13. GeoRisk
14. IPScore
15. FraudCheck

### Payment Gateways (4)
16. PaymentShield
17. TransactGuard
18. RevenueDefense
19. SmartPayment

### Identity & KYC (4)
20. IDVerify
21. GlobalKYC
22. IdentityAI
23. AgeCheck

### Bot Detection (4)
24. BotShield
25. ChallengeDefense
26. AntiBot
27. HumanCheck

### Platform Security (3)
28. iOSAttest
29. AndroidVerify
30. CaptchaPlus

### Auth & Access (2)
31. AdaptiveMFA
32. AccessManager

### Contact Verification (3)
33. EmailGuard
34. PhoneVerify
35. ContactScore

### Geolocation (3)
36. GeoFence
37. TravelRisk
38. VPNDetect

### Social & Digital (3)
39. SocialVerify
40. DigitalFootprint
41. AccountAge

### Blockchain (3)
42. CryptoRisk
43. WalletCheck
44. ChainAnalytics

### Documents (3)
45. DocScan
46. FaceMatch
47. LivenessCheck

### Gaming & Accounts (3)
48. MultiAccountDetect
49. VelocityCheck
50. SessionGuard

---

## 🎨 Tech Stack Summary

### Frontend
- React.js 18+
- Next.js 14+
- TailwindCSS 3+
- TypeScript 5+
- D3.js / Chart.js

### Backend
- Node.js 20+
- Express.js / Fastify
- Python 3.11+
- FastAPI
- TypeScript 5+

### Database
- MongoDB Atlas
- Redis (caching)
- PostgreSQL (analytics - optional)

### AI/ML
- Anthropic Claude
- OpenAI GPT-4
- xAI Grok
- Mistral AI
- Google Gemini
- Meta Llama

### Infrastructure
- Cloudflare (DNS/CDN)
- AWS EC2 (Ubuntu)
- Nginx
- Docker
- Docker Compose / Kubernetes

---

## 🌐 Domain Structure

```
maula.ai                  → Main dashboard
api.maula.ai              → Unified API gateway
docs.maula.ai             → Documentation
admin.maula.ai            → Admin panel

fraudguard.maula.ai       → Tool 1
smartscore.maula.ai       → Tool 2
ipintel.maula.ai          → Tool 11
... (50 tool subdomains)

api.maula.ai/fraudguard   → Tool 1 API
api.maula.ai/ipintel      → Tool 11 API
... (50 API endpoints)
```

---

## 📂 Quick Directory Map

```
VictoryKit/
├─ docs/                    # 📚 All documentation
├─ frontend/
│  ├─ main-dashboard/       # Main UI
│  └─ tools/                # 50 tool UIs
├─ backend/
│  ├─ shared-services/      # Auth + Gateway
│  └─ tools/                # 50 tools × 3 services
├─ infrastructure/          # Docker, K8s, scripts
├─ shared/                  # Types only
└─ scripts/                 # Utilities
```

---

## 🚀 Essential Commands

### Development
```bash
# Start everything
docker-compose up

# Start specific tool
cd frontend/tools/11-ipintel && npm run dev
cd backend/tools/11-ipintel/api && npm run dev
cd backend/tools/11-ipintel/ml-engine && python src/api/main.py
cd backend/tools/11-ipintel/ai-assistant && npm run dev

# Generate new tool
./scripts/generate-tool.sh <tool-name>
```

### Deployment
```bash
# Deploy all services
./scripts/deploy.sh

# Deploy specific tool
./scripts/deploy.sh ipintel
```

---

## 🔐 Environment Variables

### Required for All Services
```bash
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...
JWT_SECRET=...
```

### Required for AI Services
```bash
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
XAI_API_KEY=...
MISTRAL_API_KEY=...
GOOGLE_API_KEY=...
```

### Required for Infrastructure
```bash
CLOUDFLARE_API_KEY=...
AWS_ACCESS_KEY=...
AWS_SECRET_KEY=...
```

---

## 💰 Pricing Quick Reference

| Plan | Price | AI Msgs/Day | API Calls/Month | LLM Access |
|------|-------|-------------|-----------------|------------|
| Free | $0 | 50 | 1,000/tool | Gemini |
| Pro | $99 | 1,000 | 100,000/tool | Claude, GPT, Gemini, Mistral |
| Enterprise | Custom | Unlimited | Unlimited | All (+ Grok) |

---

## 🎯 Development Phases

### ✅ Phase 0: Planning (Complete)
- Architecture design
- Documentation
- Tech stack selection

### 🔜 Phase 1: Foundation (3 months)
- Infrastructure setup
- Auth + API Gateway
- Main dashboard
- First tool: IPIntel

### 🔜 Phase 2: Core Tools (6 months)
- 10 high-priority tools
- Payment fraud
- Device fingerprinting
- Bot detection

### 🔜 Phase 3: Expansion (6 months)
- Complete all 50 tools
- Analytics system
- Webhook integrations
- SDKs

### 🔜 Phase 4: Scale (9 months)
- Enterprise features
- White-label
- Global expansion

---

## 📋 Tool Template Structure

Every tool follows this pattern:

```
tool-name/
├─ Frontend (Next.js)
│  └─ UI + AI chat interface
├─ API (Node.js)
│  └─ Business logic
├─ ML Engine (Python)
│  └─ Models + predictions
├─ AI Assistant (Node.js)
│  └─ Multi-LLM chat
└─ Database (MongoDB)
   └─ Tool-specific data
```

---

## 🤖 LLM Integration Pattern

```typescript
User Message
    ↓
Frontend (WebSocket)
    ↓
AI Assistant Service
    ↓
LLM Router
    ↓
Selected Provider (Claude/GPT/etc.)
    ↓
Streaming Response
    ↓
Frontend Display
    ↓
Save to MongoDB
```

---

## 📚 Documentation Files

1. **EXECUTIVE-SUMMARY.md** - High-level overview
2. **00-PROJECT-OVERVIEW.md** - Vision & scope
3. **01-BASE-ARCHITECTURE.md** - Infrastructure
4. **02-FRONTEND-ARCHITECTURE.md** - UI/UX
5. **03-BACKEND-ARCHITECTURE.md** - APIs
6. **04-DATABASE-ARCHITECTURE.md** - Data models
7. **05-LLM-INTEGRATION.md** - AI system
8. **06-FOLDER-STRUCTURE.md** - File tree
9. **07-VISUAL-DIAGRAMS.md** - Visual guides
10. **08-QUICK-REFERENCE.md** - This file

---

## 🔥 Key Differentiators

| Feature | MAULA.AI | Competitors |
|---------|----------|-------------|
| AI Assistant | ✅ Every tool | ❌ None |
| Multi-LLM | ✅ 6 providers | ❌ N/A |
| All-in-One | ✅ 50 tools | ❌ Specialized |
| Conversational | ✅ Real-time | ❌ Static docs |
| Modern UI | ✅ Cyberpunk | ❌ Traditional |

---

## 📞 Quick Links

- **Repo**: https://github.com/VM07B/VictoryKit
- **Docs**: /docs/
- **Domain** (Future): https://maula.ai

---

**Status**: Planning Complete ✅  
**Next**: Infrastructure Setup 🔜
