#!/bin/bash
# Complete Git Workflow for Phase 2 to Phase 3 Transition

set -e

echo "================================================"
echo "  Phase 2 → Phase 3 Git Workflow"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
echo ""

# Step 1: Commit Phase 2 changes
echo "Step 1/6: Committing Phase 2 changes..."
git add frontend/tools/01-fraudguard/ \
    backend/tools/01-fraudguard/ \
    docker-compose.phase2.yml \
    infrastructure/nginx/sites-available/fguard.maula.ai.conf \
    infrastructure/mongo/init/init-fraudguard.js \
    docs/FRAUDGUARD.md \
    .env.phase2.example \
    scripts/

git commit -m "feat: Phase 2 - Complete FraudGuard AI-Powered Fraud Detection Tool

🛡️ FraudGuard - Complete microservices architecture (58+ files)

Components:
- Frontend (React 19 + Vite) - Port 3001
- API Service (Express + MongoDB) - Port 4001  
- ML Engine (Python + FastAPI) - Port 8001
- AI Assistant (6 LLM providers) - Port 6001

Features:
- Real-time fraud detection with ML
- Multi-LLM AI chat assistant
- Risk visualization & analytics
- Alert management system
- PDF/CSV report export

Infrastructure:
- Docker Compose orchestration
- Nginx reverse proxy (fguard.maula.ai)
- MongoDB with indexes & sample data

See docs/FRAUDGUARD.md for full documentation."

echo "✓ Phase 2 committed"
echo ""

# Step 2: Push branch
echo "Step 2/6: Pushing phase-2-fraudguard branch..."
git push -u origin phase-2-fraudguard
echo "✓ Branch pushed"
echo ""

# Step 3: Create Pull Request
echo "Step 3/6: Creating Pull Request..."
if command -v gh &> /dev/null; then
    gh pr create \
        --base main \
        --head phase-2-fraudguard \
        --title "🛡️ Phase 2: FraudGuard AI-Powered Fraud Detection Tool" \
        --body "## 🎯 Phase 2 Complete - FraudGuard Tool

### 📦 What's Included (58+ files)
- ✅ Frontend: React dashboard with 6 components (Port 3001)
- ✅ API Service: Express backend with 7 routes (Port 4001)
- ✅ ML Engine: Python FastAPI with 3 models (Port 8001)
- ✅ AI Assistant: Multi-LLM WebSocket chat (Port 6001)
- ✅ Infrastructure: Docker Compose + Nginx + MongoDB init

### 🚀 Features
- Real-time transaction fraud detection
- ML-powered risk scoring (Neural Net + Rules + Anomaly)
- AI chat with 6 LLM providers (Gemini, Claude, OpenAI, xAI, Mistral, Llama)
- Interactive risk visualizations
- Alert management system
- PDF/CSV report export

### 📊 Architecture
\`\`\`
Frontend (3001) → API (4001) → ML Engine (8001)
                       ↓
                AI Assistant (6001)
                       ↓
                MongoDB + Redis
\`\`\`

### 🌐 Deployment
- Subdomain: **fguard.maula.ai**
- All services containerized
- Nginx reverse proxy configured
- Health checks on all endpoints

### 📖 Documentation
See \`docs/FRAUDGUARD.md\` for complete setup and API docs.

---
Ready to merge and proceed to **Phase 3: Tool Replication**"
    echo "✓ Pull Request created"
else
    echo "⚠️  gh CLI not found. Please create PR manually at:"
    echo "   https://github.com/VM07B/VictoryKit/compare/phase-2-fraudguard"
fi
echo ""

# Step 4: Merge to main
echo "Step 4/6: Merging to main branch..."
git checkout main
git merge phase-2-fraudguard --no-ff -m "Merge phase-2-fraudguard into main

Phase 2 FraudGuard tool complete with all microservices."
echo "✓ Merged to main"
echo ""

# Step 5: Push main
echo "Step 5/6: Pushing main branch..."
git push origin main
echo "✓ Main branch updated"
echo ""

# Step 6: Create Phase 3 branch
echo "Step 6/6: Creating phase-3-replicate-tools branch..."
git checkout -b phase-3-replicate-tools
git push -u origin phase-3-replicate-tools
echo "✓ Phase 3 branch created"
echo ""

echo "================================================"
echo "  ✅ Git Workflow Complete!"
echo "================================================"
echo ""
echo "Summary:"
echo "  • Phase 2 committed and pushed"
echo "  • PR created (if gh CLI available)"
echo "  • Merged to main"
echo "  • Main branch updated remotely"
echo "  • Phase 3 branch created: phase-3-replicate-tools"
echo ""
echo "Current branch: $(git branch --show-current)"
echo ""
echo "Next: Start Phase 3 implementation!"
echo ""
