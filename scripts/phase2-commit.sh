#!/bin/bash
# Phase 2 - FraudGuard Tool - Git Commit Script
# Run this script to commit all Phase 2 changes

set -e

echo "================================================"
echo "  Phase 2 - FraudGuard Tool - Git Commit"
echo "================================================"
echo ""

# Ensure we're on the phase-2-fraudguard branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "phase-2-fraudguard" ]; then
    echo "⚠️  Warning: Not on phase-2-fraudguard branch (currently on $CURRENT_BRANCH)"
    echo "Switch to the correct branch first:"
    echo "  git checkout phase-2-fraudguard"
    exit 1
fi

echo "✓ On branch: phase-2-fraudguard"
echo ""

# Add all Phase 2 files
echo "Adding Phase 2 files..."

# Frontend
git add frontend/tools/01-fraudguard/

# Backend services
git add backend/tools/01-fraudguard/api/
git add backend/tools/01-fraudguard/ml-engine/
git add backend/tools/01-fraudguard/ai-assistant/

# Infrastructure
git add docker-compose.phase2.yml
git add infrastructure/nginx/sites-available/fguard.maula.ai.conf
git add infrastructure/mongo/init/init-fraudguard.js

# Documentation
git add docs/FRAUDGUARD.md
git add .env.phase2.example

echo "✓ Files staged"
echo ""

# Show status
echo "Git status:"
git status --short
echo ""

# Commit
echo "Creating commit..."
git commit -m "feat: Phase 2 - Complete FraudGuard AI-Powered Fraud Detection Tool

🛡️ FraudGuard - AI-Powered Fraud Detection System

## 🎯 Overview
Complete microservices architecture for real-time fraud detection with AI assistance.

## 📦 Components (58+ files)

### Frontend (19 files) - Port 3001
- React 19 + Vite + TypeScript + Tailwind CSS 3.4
- 6 components: TransactionForm, FraudScoreCard, RiskVisualization, 
  TransactionHistory, AlertsPanel, ExportReport
- Real-time fraud scoring with Recharts visualization
- AI chat panel integration
- PDF/CSV export functionality

### API Service (16 files) - Port 4001
- Express.js + TypeScript + MongoDB + Zod validation
- 3 Mongoose models: Transaction, FraudScore, Alert
- 4 controllers + 7 route files
- Features:
  - Transaction analysis and management
  - Fraud score calculation and storage
  - Alert rule engine
  - Analytics dashboard data
  - ML Engine proxy
  - Report generation

### ML Engine (7 files) - Port 8001
- Python 3.11 + FastAPI + TensorFlow + scikit-learn
- 3 detection models:
  - Neural network fraud detection
  - Rule-based risk scoring (10+ factors)
  - Statistical anomaly detection
- Batch processing support
- Model explanation (feature importance)
- On-demand retraining

### AI Assistant (13 files) - Port 6001
- WebSocket + Express + Multi-LLM integration
- 6 LLM providers with fallback chain:
  - Google Gemini
  - Anthropic Claude
  - OpenAI GPT
  - xAI Grok
  - Mistral AI
  - Meta Llama (via Together AI)
- 6 AI functions for fraud investigation:
  - analyze_transaction
  - get_fraud_score
  - open_risk_visualization
  - get_transaction_history
  - create_alert
  - export_report

## 🏗️ Infrastructure (3 files)

- docker-compose.phase2.yml: Full orchestration
- Nginx config: fguard.maula.ai reverse proxy
- MongoDB init: Collections, indexes, sample data

## 📊 Features

### Risk Scoring Algorithm
- ML Model Score (40% weight)
- Rule-Based Score (30% weight)
- Anomaly Score (30% weight)
- Risk levels: Low (0-30), Medium (31-50), High (51-70), Critical (71-100)

### Security
- JWT authentication
- Rate limiting
- Input validation (Zod schemas)
- CORS configuration
- SSL/TLS ready

### Monitoring
- Health checks on all services
- Structured logging (Winston/Python logging)
- Docker healthchecks

## 🚀 Deployment

### Subdomain
fguard.maula.ai

### Services
- Frontend: React dashboard (3001)
- API: Express REST API (4001)
- ML: FastAPI engine (8001)
- AI: WebSocket chat (6001)
- MongoDB (27017)
- Redis (6379)

## 📖 Documentation
- docs/FRAUDGUARD.md: Complete guide
- .env.phase2.example: Environment template
- API documentation with all endpoints
- Architecture diagrams
- Testing guidelines

## 🔗 Integration Points
- Central Grid Station integration ready
- API Gateway routing prepared
- Authentication service compatible
- Monitoring hooks available

---
Closes Phase 2 requirements from PHASE-2-FIRST-TOOL.md
Next: Phase 3 - Tool Replication System"

echo "✓ Commit created"
echo ""

# Show the commit
echo "Commit details:"
git log -1 --stat
echo ""

echo "================================================"
echo "  Phase 2 commit complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "  1. Review the commit: git log -1"
echo "  2. Push to remote: git push -u origin phase-2-fraudguard"
echo "  3. Create PR to main branch"
echo ""
echo "Or merge to main locally:"
echo "  git checkout main"
echo "  git merge phase-2-fraudguard"
echo "  git push origin main"
echo ""
