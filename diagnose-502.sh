#!/bin/bash

echo "🔍 Diagnosing 502 Bad Gateway error on maula.ai..."

EC2_HOST="ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com"
EC2_KEY="/workspaces/VictoryKit/victorykit.pem"

echo ""
echo "1️⃣ Checking Nginx status..."
ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo systemctl status nginx --no-pager | head -20"

echo ""
echo "2️⃣ Checking dashboard service status..."
ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo systemctl status dashboard --no-pager | head -20"

echo ""
echo "3️⃣ Checking if port 3000 is listening..."
ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "ss -tlnp | grep :3000 || echo 'Port 3000 not listening'"

echo ""
echo "4️⃣ Checking Nginx error logs..."
ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "sudo tail -20 /var/log/nginx/error.log"

echo ""
echo "5️⃣ Checking if dashboard files exist..."
ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "ls -la /var/www/maula.ai/live/ 2>/dev/null | head -10 || echo 'Directory does not exist'"

echo ""
echo "6️⃣ Testing local connection to dashboard..."
ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "curl -s http://localhost:3000 | head -10 || echo 'Dashboard not responding'"

echo ""
echo "✅ Diagnostics complete!"
