#!/bin/bash

# Setup basic backend structure for all tools

echo "🔧 Setting up backend structure for all tools..."

BASE_DIR="/workspaces/VictoryKit"
TOOLS_DIR="$BASE_DIR/backend/tools"

# Tool configurations
declare -A TOOLS=(
    ["01-fraudguard"]="fraudguard 4001 8001 6001"
    ["02-intelliscout"]="intelliscout 4002 8002 6002"
    ["03-threatradar"]="threatradar 4003 8003 6003"
    ["04-malwarehunter"]="malwarehunter 4004 8004 6004"
    ["05-phishguard"]="phishguard 4005 8005 6005"
    ["06-vulnscan"]="vulnscan 4006 8006 6006"
    ["07-pentestai"]="pentestai 4007 8007 6007"
    ["08-securecode"]="securecode 4008 8008 6008"
    ["09-compliancecheck"]="compliancecheck 4009 8009 6009"
    ["10-dataguardian"]="dataguardian 4010 8010 6010"
    ["11-incidentresponse"]="incidentresponse 4011 8011 6011"
    ["12-networkguard"]="networkguard 4012 8012 6012"
    ["13-cloudarmor"]="cloudarmor 4013 8013 6013"
    ["14-identityshield"]="identityshield 4014 8014 6014"
    ["15-cryptovault"]="cryptovault 4015 8015 6015"
    ["16-accesscontrol"]="accesscontrol 4016 8016 6016"
    ["17-audittrail"]="audittrail 4017 8017 6017"
    ["18-threatmodel"]="threatmodel 4018 8018 6018"
    ["19-riskassess"]="riskassess 4019 8019 6019"
    ["20-securityscore"]="securityscore 4020 8020 6020"
    ["21-wafmanager"]="wafmanager 4021 8021 6021"
    ["22-apiguard"]="apiguard 4022 8022 6022"
    ["23-botdefender"]="botdefender 4023 8023 6023"
    ["24-ddosshield"]="ddosshield 4024 8024 6024"
    ["25-sslmonitor"]="sslmonitor 4025 8025 6025"
    ["26-blueteamai"]="blueteamai 4026 8026 6026"
    ["27-siemcommander"]="siemcommander 4027 8027 6027"
    ["28-soarengine"]="soarengine 4028 8028 6028"
    ["29-riskscoreai"]="riskscoreai 4029 8029 6029"
    ["30-policyengine"]="policyengine 4030 8030 6030"
    ["31-audittracker"]="audittracker 4031 8031 6031"
    ["32-zerotrustai"]="zerotrustai 4032 8032 6032"
    ["33-passwordvault"]="passwordvault 4033 8033 6033"
    ["34-biometricai"]="biometricai 4034 8034 6034"
    ["35-emailguard"]="emailguard 4035 8035 6035"
    ["36-webfilter"]="webfilter 4036 8036 6036"
    ["37-dnsshield"]="dnsshield 4037 8037 6037"
    ["38-firewallai"]="firewallai 4038 8038 6038"
    ["39-vpnguardian"]="vpnguardian 4039 8039 6039"
    ["40-wirelesswatch"]="wirelesswatch 4040 8040 6040"
    ["41-iotsecure"]="iotsecure 4041 8041 6041"
    ["42-mobiledefend"]="mobiledefend 4042 8042 6042"
    ["43-backupguard"]="backupguard 4043 8043 6043"
    ["44-drplan"]="drplan 4044 8044 6044"
    ["45-privacyshield"]="privacyshield 4045 8045 6045"
    ["46-gdprcompliance"]="gdprcompliance 4046 8046 6046"
    ["47-hipaaguard"]="hipaaguard 4047 8047 6047"
    ["48-pcidsscheck"]="pcidsscheck 4048 8048 6048"
    ["49-bugbountyai"]="bugbountyai 4049 8049 6049"
    ["50-cybereduai"]="cybereduai 4050 8050 6050"
)

for tool_id in "${!TOOLS[@]}"; do
    read -r tool_name api_port ml_port ai_port <<< "${TOOLS[$tool_id]}"
    tool_dir="$TOOLS_DIR/$tool_id-$tool_name"
    
    echo "📦 Setting up $tool_name ($tool_id)..."
    
    # Create API directory and files
    if [ ! -d "$tool_dir/api" ]; then
        mkdir -p "$tool_dir/api/src/controllers" "$tool_dir/api/src/routes" "$tool_dir/api/src/services" "$tool_dir/api/src/models"
        
        # Create package.json
        cat > "$tool_dir/api/package.json" << API_PKG
{
  "name": "$tool_name-api",
  "version": "1.0.0",
  "description": "$tool_name API service",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build step required'"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "ws": "^8.14.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
API_PKG
        
        # Create server.js
        cat > "$tool_dir/api/server.js" << API_SERVER
const express = require('express');
const cors = require('cors');
const mongoose = require('dotenv').config();

const app = express();
const PORT = process.env.PORT || $api_port;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', tool: '$tool_name', service: 'api' });
});

// API routes
app.get('/api/status', (req, res) => {
  res.json({ 
    tool: '$tool_name',
    service: 'API',
    port: PORT,
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log('$tool_name API running on port ' + PORT);
});
API_SERVER
        
        # Create .env
        cat > "$tool_dir/api/.env" << API_ENV
NODE_ENV=production
PORT=$api_port
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/${tool_name}_db
API_PORT=$api_port
ML_PORT=$ml_port
AI_PORT=$ai_port
