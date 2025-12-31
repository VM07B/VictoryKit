#!/bin/bash

# Deploy FraudGuard Frontend to Server

echo "🚀 Deploying FraudGuard Frontend to Server"
echo "=========================================="

# Build the application
echo "📦 Building FraudGuard application..."
cd /workspaces/VictoryKit/frontend/tools/01-fraudguard
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Deploy to server
echo "📤 Deploying to server..."
scp -r dist/* ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com:/var/www/fguard.fyzo.xyz/

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo "✅ Deployment successful!"
echo ""
echo "🔗 Test the application:"
echo "   Main interface: https://fguard.fyzo.xyz"
echo "   AI Assistant: https://fguard.fyzo.xyz/maula-ai"