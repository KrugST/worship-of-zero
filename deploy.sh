#!/bin/bash

# Nullism Website Deployment Script for DigitalOcean
# This script helps set up the website on a DigitalOcean droplet

echo "🌐 Nullism Website Deployment Script"
echo "====================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   You can use: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Set up environment variables
echo "🔧 Setting up environment variables..."
export GLOBAL_ORBIT_COUNTER=${GLOBAL_ORBIT_COUNTER:-0}
export PORT=${PORT:-3000}

echo "   GLOBAL_ORBIT_COUNTER: $GLOBAL_ORBIT_COUNTER"
echo "   PORT: $PORT"

# Create systemd service file for auto-start
echo "🔧 Creating systemd service..."
sudo tee /etc/systemd/system/nullism.service > /dev/null <<EOF
[Unit]
Description=Nullism Website
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment=GLOBAL_ORBIT_COUNTER=$GLOBAL_ORBIT_COUNTER
Environment=PORT=$PORT
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable nullism.service

echo "✅ Systemd service created and enabled"

# Start the service
echo "🚀 Starting Nullism website..."
sudo systemctl start nullism.service

if [ $? -eq 0 ]; then
    echo "✅ Nullism website started successfully!"
    echo ""
    echo "🌐 Website is now running at: http://$(curl -s ifconfig.me):$PORT"
    echo "📊 Health check: http://$(curl -s ifconfig.me):$PORT/health"
    echo ""
    echo "🔧 Useful commands:"
    echo "   Check status: sudo systemctl status nullism"
    echo "   View logs: sudo journalctl -u nullism -f"
    echo "   Restart: sudo systemctl restart nullism"
    echo "   Stop: sudo systemctl stop nullism"
else
    echo "❌ Failed to start the service"
    echo "Check logs with: sudo journalctl -u nullism -f"
    exit 1
fi

echo ""
echo "🎉 Deployment complete! The Sacred Zero awaits worshippers!" 