# MAULA.AI Production Deployment Configuration - EXAMPLE
# Copy this to deploy-config.sh and edit with your actual values

# AWS EC2 Configuration
EC2_HOST="ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com"  # Your actual EC2 public IP
EC2_KEY="/workspaces/VictoryKit/victorykit.pem"  # Your SSH private key path

# Git Configuration
REPO_URL="https://github.com/VM07B/VictoryKit.git"
BRANCH="main"

# Tools Configuration
# Format: tool_name subdomain port api_port ml_port ai_port
TOOLS_CONFIG=(
    "01-fraudguard fguard 3001 4001 8001 6001"
    # Add more tools here as they are developed
    # "02-intelliscout iscout 3002 4002 8002 6002"
    # "03-threatradar tradar 3003 4003 8003 6003"
)

# SSL Certificate Path (Let's Encrypt)
SSL_CERT_PATH="/etc/letsencrypt/live/fyzo.xyz"

# MongoDB Configuration
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/maula_ai"

# Environment Variables for Production
NODE_ENV="production"
PORT="3000"  # Main dashboard port