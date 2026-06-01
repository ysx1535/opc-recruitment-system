#!/bin/bash
set -e

# ==========================================
# OPC Recruitment System - Deploy Script
# ==========================================

SERVER_IP="182.92.112.224"
SERVER_USER="root"
DEPLOY_PATH="/opt/opc-recruitment-system"

echo "🚀 Starting deployment to Aliyun ECS..."
echo "   Server: $SERVER_IP"
echo "   Path: $DEPLOY_PATH"
echo ""

# 1. Check SSH connection
echo "1️⃣ Checking SSH connection..."
if ! ssh -q -o ConnectTimeout=5 -o BatchMode=yes $SERVER_USER@$SERVER_IP exit 2>/dev/null; then
    echo "❌ SSH connection failed. Please:"
    echo "   1. Make sure your SSH key is added: ssh-add ~/.ssh/id_rsa"
    echo "   2. Or update SERVER_USER in this script"
    echo "   3. Or manually copy files to server"
    exit 1
fi
echo "✅ SSH connection OK"
echo ""

# 2. Create deploy directory on server
echo "2️⃣ Creating deploy directory on server..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $DEPLOY_PATH"
echo "✅ Directory ready"
echo ""

# 3. Upload files via SCP
echo "3️⃣ Uploading files to server..."
echo "   (This may take a few minutes...)"

# Build exclude pattern
EXCLUDE=(
    "--exclude=node_modules"
    "--exclude=.git"
    "--exclude=dist"
    "--exclude=*.log"
    "--exclude=.env*"
    "--exclude=coverage"
)

rsync -avz "${EXCLUDE[@]}" ./ $SERVER_USER@$SERVER_IP:$DEPLOY_PATH/
echo "✅ Files uploaded"
echo ""

# 4. Setup environment on server
echo "4️⃣ Setting up environment on server..."
ssh $SERVER_USER@$SERVER_USER@$SERVER_IP << 'ENDSSH'
cd /opt/opc-recruitment-system

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "⚠️  .env.production not found, creating from example..."
    cp .env.production.example .env.production
    echo "🔐 Please edit .env.production and set:"
    echo "   - JWT_SECRET (minimum 32 characters)"
    echo "   - DB_PASSWORD"
    echo "   - REDIS_PASSWORD"
    echo "   - MONGODB_PASSWORD"
    echo ""
    echo "Then run: docker-compose -f docker-compose.prod.yml up -d"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not installed. Installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not installed. Installing..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

echo "✅ Environment setup complete"
ENDSSH
echo ""

# 5. Deploy with Docker Compose
echo "5️⃣ Deploying with Docker Compose..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
cd /opt/opc-recruitment-system

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Rebuild and restart containers
docker-compose -f docker-compose.prod.yml up -d --build

# Run database migrations
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

# Seed database (optional)
# docker-compose -f docker-compose.prod.yml exec -T backend npm run prisma:seed

echo "✅ Deployment complete"
ENDSSH
echo ""

# 6. Verify deployment
echo "6️⃣ Verifying deployment..."
sleep 5

# Check frontend
if curl -s -f http://$SERVER_IP:3000 > /dev/null; then
    echo "✅ Frontend is running: http://$SERVER_IP:3000"
else
    echo "⚠️  Frontend may not be ready yet"
fi

# Check backend
if curl -s -f http://$SERVER_IP:3001/api > /dev/null; then
    echo "✅ Backend is running: http://$SERVER_IP:3001"
else
    echo "⚠️  Backend may not be ready yet"
fi

echo ""
echo "🎉 Deployment finished!"
echo ""
echo "📋 Next steps:"
echo "   1. Visit: http://$SERVER_IP:3000"
echo "   2. Login: founder@opc.com / password123"
echo "   3. Check logs: ssh $SERVER_USER@$SERVER_IP 'cd $DEPLOY_PATH && docker-compose -f docker-compose.prod.yml logs -f'"
echo "   4. (Optional) Setup SSL: https://certbot.eff.org/lets-encrypt/centosrhel-nginx"
echo ""
echo "🔐 Security reminders:"
echo "   - Change default passwords"
echo "   - Setup firewall (only open needed ports)"
echo "   - Enable SSL/HTTPS"
echo "   - Setup regular database backups"
