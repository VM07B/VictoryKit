#!/bin/bash

# VictoryKit Backend Tools Dev Server Startup Script

echo "🚀 VictoryKit Backend Tools - Dev Server"
echo "=========================================="

# Check if MongoDB is running
echo "📦 Checking MongoDB..."
if ! docker ps | grep -q victorykit-mongodb; then
    echo "Starting MongoDB container..."
    docker run -d -p 27017:27017 --name victorykit-mongodb mongo:7
    sleep 3
else
    echo "✅ MongoDB already running"
fi

# Function to start an API
start_api() {
    local tool_name=$1
    local tool_number=$2
    local port=$3
    
    echo ""
    echo "🔧 Starting $tool_name API (Port $port)..."
    cd "/workspaces/VictoryKit/backend/tools/${tool_number}-${tool_name}/api"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📥 Installing dependencies..."
        npm install --silent
    fi
    
    # Create .env if it doesn't exist
    if [ ! -f ".env" ]; then
        cp .env.example .env
    fi
    
    # Start the server in background
    echo "▶️  Launching $tool_name API..."
    npm start &
    
    echo "✅ $tool_name API started on http://localhost:$port"
}

# Start the Auth Service first
echo ""
echo "🔐 Starting Auth Service (Port 5000)..."
cd /workspaces/VictoryKit/backend/services/auth
if [ ! -d "node_modules" ]; then
    npm install --silent
fi
if [ ! -f ".env" ]; then
    cp .env.example .env 2>/dev/null || true
fi
npm start &
echo "✅ Auth Service started"

# Start API Gateway
echo ""
echo "🌐 Starting API Gateway (Port 4000)..."
cd /workspaces/VictoryKit/backend/api-gateway
if [ ! -d "node_modules" ]; then
    npm install --silent
fi
if [ ! -f ".env" ]; then
    cp .env.example .env 2>/dev/null || true
fi
npm start &
echo "✅ API Gateway started"

# Start the Tool APIs
start_api "malwarehunter" "04" "4004"
start_api "phishguard" "05" "4005"
start_api "vulnscan" "06" "4006"

echo ""
echo "=========================================="
echo "✨ All services started!"
echo ""
echo "📍 Service URLs:"
echo "   Auth Service:    http://localhost:5000"
echo "   API Gateway:     http://localhost:4000"
echo "   MalwareHunter:   http://localhost:4004"
echo "   PhishGuard:      http://localhost:4005"
echo "   VulnScan:        http://localhost:4006"
echo ""
echo "🧪 Test endpoints:"
echo "   Health Check:    curl http://localhost:4004/health"
echo "   Gateway Health:  curl http://localhost:4000/health"
echo ""
echo "💡 To view logs: tail -f backend/tools/04-malwarehunter/api/*.log"
echo "🛑 To stop all:  pkill -f 'node.*server.js'"
echo "=========================================="
