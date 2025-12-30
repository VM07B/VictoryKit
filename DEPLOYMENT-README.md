# MAULA.AI Production Deployment

This script automates the complete deployment process for MAULA.AI, including git operations and production deployment to AWS EC2.

## 🚀 Quick Start

1. **Configure deployment settings:**
   ```bash
   cp deploy-config.sh.example deploy-config.sh
   # Edit deploy-config.sh with your actual values
   ```

2. **Run the deployment:**
   ```bash
   ./deploy-production.sh
   ```

That's it! The script will:
- ✅ Commit and push all changes to Git
- ✅ Build all frontends
- ✅ Deploy to AWS EC2
- ✅ Update Nginx configurations
- ✅ Restart all services
- ✅ Test deployments

## 📋 Configuration

Edit `deploy-config.sh` with your settings:

```bash
# AWS EC2 Configuration
EC2_HOST="ubuntu@54.123.45.67"        # Your EC2 public IP
EC2_KEY="~/.ssh/my-ec2-key.pem"       # Path to your SSH private key

# Git Configuration
REPO_URL="https://github.com/VM07B/VictoryKit.git"
BRANCH="main"

# Tools to deploy
TOOLS_CONFIG=(
    "01-fraudguard fguard 3001 4001 8001 6001"
    # Add more as developed
)
```

## 🏗️ What Gets Deployed

### Main Dashboard
- **URL:** https://fyzo.xyz
- **Port:** 3000
- **Path:** `/var/www/fyzo.xyz`

### Tools
Each tool gets deployed as a subdomain:
- **Frontend:** `https://{subdomain}.fyzo.xyz`
- **API:** `https://{subdomain}.fyzo.xyz/api`
- **WebSocket:** `wss://{subdomain}.fyzo.xyz/ws`

### Current Tools
- **FraudGuard:** https://fguard.fyzo.xyz
  - Frontend: Port 3001
  - API: Port 4001
  - ML Engine: Port 8001
  - AI Assistant: Port 6001

## 🔧 Prerequisites

### Local Machine
- `git`, `scp`, `ssh` installed
- SSH key configured for EC2 access
- Node.js and npm for building frontends

### AWS EC2 Server
- Ubuntu 20.04+ or Amazon Linux 2+
- Node.js, Python3, pip installed
- Nginx installed and configured
- SSL certificates (Let's Encrypt)
- MongoDB Atlas connection
- Systemd for service management

### Required EC2 Setup
```bash
# Install dependencies
sudo apt update
sudo apt install -y nodejs npm python3 python3-pip nginx certbot

# Install serve globally
sudo npm install -g serve

# Configure firewall
sudo ufw allow 22,80,443
```

## 📁 File Structure After Deployment

```
/var/www/
├── fyzo.xyz/           # Main dashboard
├── fguard.fyzo.xyz/    # FraudGuard frontend
├── fraudguard-api/     # FraudGuard API
├── fraudguard-ml/      # FraudGuard ML engine
└── fraudguard-ai/      # FraudGuard AI assistant

/etc/systemd/system/
├── dashboard.service
├── fraudguard-frontend.service
├── fraudguard-api.service
├── fraudguard-ml.service
└── fraudguard-ai.service

/etc/nginx/sites-enabled/
├── fyzo.xyz
└── fguard.fyzo.xyz
```

## 🔍 Troubleshooting

### Check Service Status
```bash
# On EC2 server
sudo systemctl status fraudguard-frontend
sudo systemctl status fraudguard-api
sudo journalctl -u fraudguard-frontend -f
```

### Test Endpoints
```bash
curl https://fyzo.xyz
curl https://fguard.fyzo.xyz
curl https://fguard.fyzo.xyz/api/health
```

### Common Issues
- **SSH Connection Failed:** Check EC2 security group and SSH key
- **Build Failed:** Ensure all dependencies are installed locally
- **Nginx Error:** Check SSL certificates and configuration syntax
- **Service Won't Start:** Check logs with `journalctl`

## 🚀 Adding New Tools

1. **Develop the tool** in `frontend/tools/{tool-name}/`
2. **Add backend services** in `backend/tools/{tool-name}/`
3. **Update `deploy-config.sh`** with new tool config:
   ```bash
   TOOLS_CONFIG=(
       "01-fraudguard fguard 3001 4001 8001 6001"
       "02-newtool newtool 3002 4002 8002 6002"
   )
   ```
4. **Run deployment:** `./deploy-production.sh`

## 📊 Deployment Flow

```
Local Machine → Git Commit/Push → Build Frontends → SCP to EC2 → Update Nginx → Restart Services → Test
```

The entire process takes ~2-3 minutes for a single tool deployment.

## 🔒 Security Notes

- SSH keys are used for secure deployment
- SSL certificates are required for HTTPS
- Services run as `ubuntu` user (non-root)
- Security headers are automatically configured in Nginx

---

**Happy Deploying! 🚀**</content>
<parameter name="filePath">/workspaces/VictoryKit/DEPLOYMENT-README.md
