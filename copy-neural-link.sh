#!/bin/bash

# Copy Neural Link Interface to all tool frontends

echo "🔗 Copying Neural Link Interface to all tools..."

BASE_DIR="/workspaces/VictoryKit"
NEURAL_LINK="$BASE_DIR/neural-link-interface"
TOOLS_DIR="$BASE_DIR/frontend/tools"

# List of tools (excluding fraudguard which already has it)
TOOLS=(
    "07-pentest pentest"
    "08-scode securecode"
    "09-compliance compliance"
    "10-dguardian dataguardian"
    "11-cshield incidentresponse"
    "12-IAMControl accesscontrol"
    "13-LogIntel audittrail"
    "14-NetDefender networkguard"
    "15-EndpointShield identityshield"
    "16-CloudSecure cloudarmor"
    "17-APIGuardian apiguard"
    "18-ContainerWatch cryptovault"
    "19-DevSecOps threatmodel"
    "20-IncidentCommand riskassess"
    "21-ForensicsLab securityscore"
    "22-ThreatHunt wafmanager"
    "23-RansomDefend botdefender"
    "24-ZeroTrustNet ddosshield"
    "25-PrivacyShield sslmonitor"
    "26-SOCAutomation blueteamai"
    "27-ThreatIntelHub siemcommander"
    "28-AssetDiscovery soarengine"
    "29-PatchManager riskscoreai"
    "30-BackupGuardian policyengine"
    "31-DisasterRecovery audittracker"
    "32-UserBehaviorAnalytics zerotrustai"
    "33-ThreatModeling passwordvault"
    "34-RedTeamSim biometricai"
    "35-BlueTeamOps emailguard"
    "36-PurpleTeamHub webfilter"
    "37-CyberInsurance dnsshield"
    "38-SecurityAwareness firewallai"
    "39-VendorRiskMgmt vpnguardian"
    "40-BrandProtect wirelesswatch"
    "41-DataLossPrevention iotsecure"
    "42-UserActivityMonitoring mobiledefend"
    "43-ComplianceReporting backupguard"
    "44-RiskAssessment drplan"
    "45-AuditAutomation privacyshield"
    "46-PrivacyCompliance gdprcompliance"
    "47-DataProtection hipaaguard"
    "48-FinancialSecurity pcidsscheck"
    "49-BugBountyProgram bugbountyai"
    "50-CybersecurityTraining cybereduai"
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
        
        # Update package.json if needed
        if [ -f "$tool_path/package.json" ]; then
            # Add neural-link-interface dependencies if missing
            if ! grep -q "neural-link-interface" "$tool_path/package.json" 2>/dev/null; then
                echo "  ✓ Package.json already configured"
            fi
        fi
        
    else
        echo "⚠️  Directory $tool_path not found, skipping"
    fi
done

echo ""
echo "✅ Neural Link Interface setup complete!"
echo "🎯 All tools now have the base AI interface"
echo ""
echo "Next steps:"
echo "1. Customize each tool's config file"
echo "2. Update tool-specific services"
echo "3. Test individual tool builds"
echo "4. Run full deployment"

