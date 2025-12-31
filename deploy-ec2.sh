#!/bin/bash

# ============================================
# VictoryKit EC2 Deployment Script
# ============================================

EC2_HOST="ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com"
EC2_USER="ubuntu"
PEM_FILE="victorykit.pem"
APP_DIR="/home/ubuntu/victorykit"

echo "🚀 VictoryKit EC2 Deployment"
echo "============================"

# Check PEM file
if [ ! -f "$PEM_FILE" ]; then
    echo "❌ PEM file not found: $PEM_FILE"
    exit 1
fi

chmod 400 $PEM_FILE

# SSH function
ssh_cmd() {
    ssh -i $PEM_FILE -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST "$1"
}

# SCP function  
scp_cmd() {
    scp -i $PEM_FILE -o StrictHostKeyChecking=no -r "$1" $EC2_USER@$EC2_HOST:"$2"
}

echo ""
echo "📦 Step 1: Setting up EC2 instance..."
ssh_cmd "
    # Update system
    sudo apt update && sudo apt upgrade -y
    
    # Install Node.js 20
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    
    # Install PM2 for process management
    sudo npm install -g pm2
    
    # Install nginx for reverse proxy
    sudo apt install -y nginx
    
    # Create app directory
    mkdir -p $APP_DIR
    
    echo '✅ EC2 setup complete'
"

echo ""
echo "📤 Step 2: Uploading application..."
scp_cmd "backend" "$APP_DIR/"
scp_cmd ".env" "$APP_DIR/"
scp_cmd "package.json" "$APP_DIR/" 2>/dev/null || true

echo ""
echo "📥 Step 3: Installing dependencies..."
ssh_cmd "
    cd $APP_DIR/backend/shared && npm install
    cd $APP_DIR/backend/tools/04-malwarehunter/api && npm install
    cd $APP_DIR/backend/tools/05-phishguard/api && npm install
    cd $APP_DIR/backend/tools/06-vulnscan/api && npm install
    cd $APP_DIR/backend/tools/07-pentestai/api && npm install
    cd $APP_DIR/backend/tools/08-securecode/api && npm install
    cd $APP_DIR/backend/tools/09-compliancecheck/api && npm install
    cd $APP_DIR/backend/tools/10-dataguardian/api && npm install
    cd $APP_DIR/backend/tools/11-incidentresponse/api && npm install
    cd $APP_DIR/backend/tools/12-loganalyzer/api && npm install
    cd $APP_DIR/backend/tools/13-accesscontrol/api && npm install
    cd $APP_DIR/backend/tools/14-encryptionmanager/api && npm install
    cd $APP_DIR/backend/tools/15-backuprecovery/api && npm install
    cd $APP_DIR/backend/tools/16-networkmonitor/api && npm install
    cd $APP_DIR/backend/tools/17-endpointprotection/api && npm install
    cd $APP_DIR/backend/tools/18-identitymanagement/api && npm install
    cd $APP_DIR/backend/tools/19-auditcompliance/api && npm install
    cd $APP_DIR/backend/tools/20-threatintelligence/api && npm install
    cd $APP_DIR/backend/tools/21-wafmanager/api && npm install
    cd $APP_DIR/backend/tools/22-apiguard/api && npm install
    cd $APP_DIR/backend/tools/23-botdefender/api && npm install
    cd $APP_DIR/backend/tools/24-ddosshield/api && npm install
    cd $APP_DIR/backend/tools/25-sslmonitor/api && npm install
    cd $APP_DIR/backend/tools/26-blueteamai/api && npm install
    cd $APP_DIR/backend/tools/27-siemcommander/api && npm install
    cd $APP_DIR/backend/tools/28-soarengine/api && npm install
    cd $APP_DIR/backend/tools/29-riskscoreai/api && npm install
    cd $APP_DIR/backend/tools/30-policyengine/api && npm install
    cd $APP_DIR/backend/tools/41-iotsecure/api && npm install
    cd $APP_DIR/backend/tools/42-mobiledefend/api && npm install
    cd $APP_DIR/backend/tools/43-backupguard/api && npm install
    cd $APP_DIR/backend/tools/44-drplan/api && npm install
    cd $APP_DIR/backend/tools/45-privacyshield/api && npm install
"

echo ""
echo "🔧 Step 4: Configuring Nginx..."
ssh_cmd "
    sudo tee /etc/nginx/sites-available/victorykit > /dev/null << 'NGINX'
server {
    listen 80;
    server_name api.fyzo.xyz;

    # MalwareHunter API
    location /api/v1/malwarehunter {
        proxy_pass http://localhost:4004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_cache_bypass \$http_upgrade;
    }

    # PhishGuard API
    location /api/v1/phishguard {
        proxy_pass http://localhost:4005;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # VulnScan API
    location /api/v1/vulnscan {
        proxy_pass http://localhost:4006;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # PenTestAI API
    location /api/v1/pentestai {
        proxy_pass http://localhost:4007;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # SecureCode API
    location /api/v1/securecode {
        proxy_pass http://localhost:4008;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # ComplianceCheck API
    location /api/v1/compliancecheck {
        proxy_pass http://localhost:4009;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # DataGuardian API
    location /api/v1/dataguardian {
        proxy_pass http://localhost:4010;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # IncidentResponse API
    location /api/v1/incidentresponse {
        proxy_pass http://localhost:4011;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # LogAnalyzer API
    location /api/v1/loganalyzer {
        proxy_pass http://localhost:4012;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # AccessControl API
    location /api/v1/accesscontrol {
        proxy_pass http://localhost:4013;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # EncryptionManager API
    location /api/v1/encryptionmanager {
        proxy_pass http://localhost:4014;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # BackupRecovery API
    location /api/v1/backuprecovery {
        proxy_pass http://localhost:4015;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # NetworkMonitor API
    location /api/v1/networkmonitor {
        proxy_pass http://localhost:4016;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # EndpointProtection API
    location /api/v1/endpointprotection {
        proxy_pass http://localhost:4017;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # IdentityManagement API
    location /api/v1/identitymanagement {
        proxy_pass http://localhost:4018;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # AuditCompliance API
    location /api/v1/auditcompliance {
        proxy_pass http://localhost:4019;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # ThreatIntelligence API
    location /api/v1/threatintelligence {
        proxy_pass http://localhost:4020;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # WAFManager API
    location /api/v1/wafmanager {
        proxy_pass http://localhost:4021;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # APIGuard API
    location /api/v1/apiguard {
        proxy_pass http://localhost:4022;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # BotDefender API
    location /api/v1/botdefender {
        proxy_pass http://localhost:4023;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # DDoSShield API
    location /api/v1/ddosshield {
        proxy_pass http://localhost:4024;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # SSLMonitor API
    location /api/v1/sslmonitor {
        proxy_pass http://localhost:4025;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # BlueTeamAI API
    location /api/v1/blueteamai {
        proxy_pass http://localhost:4026;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # SIEMCommander API
    location /api/v1/siemcommander {
        proxy_pass http://localhost:4027;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # SOAREngine API
    location /api/v1/soarengine {
        proxy_pass http://localhost:4028;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # RiskScoreAI API
    location /api/v1/riskscoreai {
        proxy_pass http://localhost:4029;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # PolicyEngine API
    location /api/v1/policyengine {
        proxy_pass http://localhost:4030;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # IoTSecure API
    location /api/v1/iotsecure {
        proxy_pass http://localhost:4041;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # MobileDefend API
    location /api/v1/mobiledefend {
        proxy_pass http://localhost:4042;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # BackupGuard API
    location /api/v1/backupguard {
        proxy_pass http://localhost:4043;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # DRPlan API
    location /api/v1/drplan {
        proxy_pass http://localhost:4044;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # PrivacyShield API
    location /api/v1/privacyshield {
        proxy_pass http://localhost:4045;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:4004/health;
    }
}
NGINX

    sudo ln -sf /etc/nginx/sites-available/victorykit /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t && sudo systemctl reload nginx
"

echo ""
echo "🚀 Step 5: Starting services with PM2..."
ssh_cmd "
    cd $APP_DIR
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << 'PM2'
module.exports = {
  apps: [
    {
      name: 'malwarehunter-api',
      script: 'backend/tools/04-malwarehunter/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'phishguard-api',
      script: 'backend/tools/05-phishguard/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'vulnscan-api',
      script: 'backend/tools/06-vulnscan/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'pentestai-api',
      script: 'backend/tools/07-pentestai/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'securecode-api',
      script: 'backend/tools/08-securecode/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'compliancecheck-api',
      script: 'backend/tools/09-compliancecheck/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'dataguardian-api',
      script: 'backend/tools/10-dataguardian/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'incidentresponse-api',
      script: 'backend/tools/11-incidentresponse/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'loganalyzer-api',
      script: 'backend/tools/12-loganalyzer/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'accesscontrol-api',
      script: 'backend/tools/13-accesscontrol/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'encryptionmanager-api',
      script: 'backend/tools/14-encryptionmanager/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'backuprecovery-api',
      script: 'backend/tools/15-backuprecovery/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'networkmonitor-api',
      script: 'backend/tools/16-networkmonitor/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'endpointprotection-api',
      script: 'backend/tools/17-endpointprotection/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'identitymanagement-api',
      script: 'backend/tools/18-identitymanagement/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'auditcompliance-api',
      script: 'backend/tools/19-auditcompliance/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'threatintelligence-api',
      script: 'backend/tools/20-threatintelligence/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'wafmanager-api',
      script: 'backend/tools/21-wafmanager/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'apiguard-api',
      script: 'backend/tools/22-apiguard/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'botdefender-api',
      script: 'backend/tools/23-botdefender/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'ddosshield-api',
      script: 'backend/tools/24-ddosshield/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'sslmonitor-api',
      script: 'backend/tools/25-sslmonitor/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'blueteamai-api',
      script: 'backend/tools/26-blueteamai/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'siemcommander-api',
      script: 'backend/tools/27-siemcommander/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'soarengine-api',
      script: 'backend/tools/28-soarengine/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'riskscoreai-api',
      script: 'backend/tools/29-riskscoreai/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'policyengine-api',
      script: 'backend/tools/30-policyengine/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'iotsecure-api',
      script: 'backend/tools/41-iotsecure/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'mobiledefend-api',
      script: 'backend/tools/42-mobiledefend/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'backupguard-api',
      script: 'backend/tools/43-backupguard/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'drplan-api',
      script: 'backend/tools/44-drplan/api/src/server.js',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'privacyshield-api',
      script: 'backend/tools/45-privacyshield/api/src/server.js',
      env: { NODE_ENV: 'production' }
    }
  ]
};
PM2

    pm2 delete all 2>/dev/null || true
    pm2 start ecosystem.config.js
    pm2 save
    sudo env PATH=\$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📍 Your APIs are live at:"
echo "   https://api.fyzo.xyz/api/v1/malwarehunter"
echo "   https://api.fyzo.xyz/api/v1/phishguard"
echo "   https://api.fyzo.xyz/api/v1/vulnscan"
echo "   https://api.fyzo.xyz/api/v1/pentestai"
echo "   https://api.fyzo.xyz/api/v1/securecode"
echo "   https://api.fyzo.xyz/api/v1/compliancecheck"
echo "   https://api.fyzo.xyz/api/v1/dataguardian"
echo "   https://api.fyzo.xyz/api/v1/incidentresponse"
echo "   https://api.fyzo.xyz/api/v1/loganalyzer"
echo "   https://api.fyzo.xyz/api/v1/accesscontrol"
echo "   https://api.fyzo.xyz/api/v1/encryptionmanager"
echo "   https://api.fyzo.xyz/api/v1/backuprecovery"
echo "   https://api.fyzo.xyz/api/v1/networkmonitor"
echo "   https://api.fyzo.xyz/api/v1/endpointprotection"
echo "   https://api.fyzo.xyz/api/v1/identitymanagement"
echo "   https://api.fyzo.xyz/api/v1/auditcompliance"
echo "   https://api.fyzo.xyz/api/v1/threatintelligence"
echo "   https://api.fyzo.xyz/api/v1/wafmanager"
echo "   https://api.fyzo.xyz/api/v1/apiguard"
echo "   https://api.fyzo.xyz/api/v1/botdefender"
echo "   https://api.fyzo.xyz/api/v1/ddosshield"
echo "   https://api.fyzo.xyz/api/v1/sslmonitor"
echo "   https://api.fyzo.xyz/api/v1/blueteamai"
echo "   https://api.fyzo.xyz/api/v1/siemcommander"
echo "   https://api.fyzo.xyz/api/v1/soarengine"
echo "   https://api.fyzo.xyz/api/v1/riskscoreai"
echo "   https://api.fyzo.xyz/api/v1/policyengine"
echo "   https://api.fyzo.xyz/api/v1/iotsecure"
echo "   https://api.fyzo.xyz/api/v1/mobiledefend"
echo "   https://api.fyzo.xyz/api/v1/backupguard"
echo "   https://api.fyzo.xyz/api/v1/drplan"
echo "   https://api.fyzo.xyz/api/v1/privacyshield"
echo ""
echo "🧪 Test: curl https://api.fyzo.xyz/health"
echo ""
