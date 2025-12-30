#!/bin/bash

# Fix Neural Link Interface copy for remaining tools

echo "🔗 Fixing Neural Link Interface for remaining tools..."

BASE_DIR="/workspaces/VictoryKit"
NEURAL_LINK="$BASE_DIR/neural-link-interface"
TOOLS_DIR="$BASE_DIR/frontend/tools"

# Remaining tools that need Neural Link Interface
TOOLS=(
    "32-EmailSecure emailguard"
    "33-WebAppFirewall webfilter"
    "34-BotDefense botdefender"
    "35-DDoSMitigator ddosshield"
    "36-SecureGateway dnsshield"
    "37-MobileSecurity firewallai"
    "38-IoTSecure iotsecure"
    "39-SupplyChainSec vpnguardian"
    "40-BrandProtect wirelesswatch"
    "41-DataLossPrevention mobiledefend"
    "42-UserBehaviorAnalytics backupguard"
    "43-ThreatModeling drplan"
    "44-RedTeamSim privacyshield"
    "45-BlueTeamOps gdprcompliance"
    "46-PurpleTeamHub hipaaguard"
    "47-CyberInsurance pcidsscheck"
    "48-SecurityAwareness bugbountyai"
    "49-VendorRiskMgmt cybereduai"
    "50-CyberThreatMap cyberthreat"
)

for tool_info in "${TOOLS[@]}"; do
    read -r dir name <<< "$tool_info"
    tool_path="$TOOLS_DIR/$dir"
    
    if [ -d "$tool_path" ]; then
        echo "📦 Processing $name ($dir)..."
        
        # Copy neural-link-interface if it doesn't exist
        if [ ! -d "$tool_path/neural-link-interface" ]; then
            cp -r "$NEURAL_LINK" "$tool_path/"
            echo "  ✓ Copied Neural Link Interface"
        else
            echo "  ✓ Neural Link Interface already exists"
        fi
        
        # Create/update tool-specific config
        config_file="$tool_path/${name}-config.json"
        if [ ! -f "$config_file" ]; then
            cat > "$config_file" << TOOL_CONFIG
{
  "toolName": "$name",
  "displayName": "${name^}",
  "description": "AI-powered $name security tool",
  "apiEndpoint": "/api",
  "wsEndpoint": "/ws",
  "features": [
    "AI Assistant",
    "Real-time Analysis",
    "Multi-LLM Support",
    "Autonomous Operations"
  ],
  "llmProviders": [
    "claude",
    "gpt-4",
    "gemini",
    "grok",
    "mistral"
  ]
}
TOOL_CONFIG
            echo "  ✓ Created $name-config.json"
        fi
        
    else
        echo "⚠️  Directory $tool_path not found, skipping"
    fi
done

echo ""
echo "✅ Neural Link Interface fix complete!"

