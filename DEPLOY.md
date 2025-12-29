# 🚀 VictoryKit EC2 Deployment

## Quick Deploy Commands

Run these commands in your **local terminal** (not Codespaces):

### 1. Test SSH Connection
```bash
chmod 400 victorykit.pem
ssh -i victorykit.pem ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com "echo 'Connected!'"
```

### 2. One-Command Deploy
```bash
bash deploy-ec2.sh
```

Or manually:

### 3. Manual Setup (if script fails)

**Step A: Prepare EC2**
```bash
ssh -i victorykit.pem ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com
```

On EC2:
```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx

# Install PM2
sudo npm install -g pm2

# Create app directory
mkdir -p ~/victorykit
exit
```

**Step B: Upload Files**
```bash
scp -i victorykit.pem -r backend ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com:~/victorykit/
scp -i victorykit.pem .env ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com:~/victorykit/
```

**Step C: Install & Start**
```bash
ssh -i victorykit.pem ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com
cd ~/victorykit/backend/shared && npm install
cd ~/victorykit/backend/tools/04-malwarehunter/api && npm install
cd ~/victorykit/backend/tools/05-phishguard/api && npm install
cd ~/victorykit/backend/tools/06-vulnscan/api && npm install

# Start with PM2
pm2 start backend/tools/04-malwarehunter/api/src/server.js --name malwarehunter
pm2 start backend/tools/05-phishguard/api/src/server.js --name phishguard
pm2 start backend/tools/06-vulnscan/api/src/server.js --name vulnscan
pm2 save
```

---

## 🌐 Endpoints After Deploy

| Tool | URL |
|------|-----|
| MalwareHunter | `https://api.fyzo.xyz/api/v1/malwarehunter` |
| PhishGuard | `https://api.fyzo.xyz/api/v1/phishguard` |
| VulnScan | `https://api.fyzo.xyz/api/v1/vulnscan` |
| Health Check | `https://api.fyzo.xyz/health` |

## 🧪 Test

```bash
curl https://api.fyzo.xyz/health
curl https://api.fyzo.xyz/api/v1/malwarehunter/health
```

---

## 📋 DNS Configuration ✅

| Type | Host | Value |
|------|------|-------|
| A | @ | 18.140.156.40 |
| A | * | 18.140.156.40 |
| CNAME | api | fyzo.xyz |

---

## 🔒 SSL (After Deploy)

```bash
# On EC2
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d fyzo.xyz -d api.fyzo.xyz -d www.fyzo.xyz
```
