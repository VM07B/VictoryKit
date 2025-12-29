# VictoryKit - Codespaces Quick Start

## ✅ MongoDB Running
MongoDB is now running in a Docker container on port 27017.

## 🚀 Start the APIs

### Option 1: VS Code Tasks (Recommended)
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Tasks: Run Task"
3. Select "Start All Tool APIs"

This will open 3 terminals running:
- MalwareHunter API (port 4004)
- PhishGuard API (port 4005)
- VulnScan API (port 4006)

### Option 2: Manual Terminal Commands

```bash
# Terminal 1 - MalwareHunter
cd backend/tools/04-malwarehunter/api
cp .env.example .env
npm start

# Terminal 2 - PhishGuard (in a new terminal)
cd backend/tools/05-phishguard/api
cp .env.example .env
npm install && npm start

# Terminal 3 - VulnScan (in a new terminal)
cd backend/tools/06-vulnscan/api
cp .env.example .env
npm install && npm start
```

## 🌐 Access the APIs

Codespaces will **automatically forward the ports**. Look for the "Ports" tab in VS Code (bottom panel) or click the notification that appears.

You'll see URLs like:
- **MalwareHunter**: `https://[your-codespace]-4004.app.github.dev`
- **PhishGuard**: `https://[your-codespace]-4005.app.github.dev`
- **VulnScan**: `https://[your-codespace]-4006.app.github.dev`

## 🧪 Test the APIs

```bash
# Health check (replace with your forwarded URL)
curl https://[your-codespace]-4004.app.github.dev/health

# Or use localhost in the Codespace terminal
curl http://localhost:4004/health
curl http://localhost:4005/health
curl http://localhost:4006/health
```

## 📊 View in Browser

Click on the globe icon 🌐 next to the port in the Ports tab to open it in your browser!

Test endpoints:
- `/health` - Health check
- `/api/v1/malwarehunter/*` - MalwareHunter endpoints
- `/api/v1/phishguard/*` - PhishGuard endpoints
- `/api/v1/vulnscan/*` - VulnScan endpoints

## 🔐 Authentication

Since Auth Service isn't running yet, you can:
1. Start it manually:
```bash
cd backend/services/auth
npm install
cp .env.example .env
npm start
```

2. Or test without auth by temporarily commenting out the `authenticate` middleware in the routes.

## 📝 API Documentation

Full API examples in [DEV-SERVER-GUIDE.md](DEV-SERVER-GUIDE.md)

## 🛑 Stop Services

Just close the terminal tabs or press `Ctrl+C` in each terminal.

---

**Current Status:**
- ✅ MongoDB container running
- ✅ VS Code tasks configured
- ✅ MalwareHunter API ready (port 4004)
- ✅ PhishGuard API ready (port 4005)
- ✅ VulnScan API ready (port 4006)

**Next:** Run the task or start manually! 🫦🦾
