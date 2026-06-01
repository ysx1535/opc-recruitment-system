#!/bin/bash
set -e

# ==========================================
# OPC Recruitment System - 安全部署脚本
# ==========================================

SERVER_IP="182.92.112.224"
SERVER_USER="root"
DEPLOY_PATH="/opt/opc-recruitment-system"
SSH_KEY="~/.ssh/id_rsa"  # 修改为你的SSH密钥路径

echo "🚀 开始安全部署到阿里云ECS..."
echo "   服务器: $SERVER_IP"
echo "   部署路径: $DEPLOY_PATH"
echo ""

# 1. 检查SSH连接（使用密钥认证，不用密码）
echo "1️⃣ 检查SSH连接..."
if ! ssh -i $SSH_KEY -o ConnectTimeout=5 -o BatchMode=yes $SERVER_USER@$SERVER_IP exit 2>/dev/null; then
    echo "❌ SSH密钥认证失败"
    echo "   请确认："
    echo "   1. SSH密钥路径正确: $SSH_KEY"
    echo "   2. 已将公钥添加到服务器: ssh-copy-id -i $SSH_KEY.pub $SERVER_USER@$SERVER_IP"
    echo "   3. 或者修改脚本使用密码认证（不推荐）"
    exit 1
fi
echo "✅ SSH连接正常"
echo ""

# 2. 在服务器上创建部署目录
echo "2️⃣ 在服务器上准备目录..."
ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "mkdir -p $DEPLOY_PATH && chown -R $SERVER_USER:$SERVER_USER $DEPLOY_PATH"
echo "✅ 目录准备完成"
echo ""

# 3. 上传文件（排除敏感文件）
echo "3️⃣ 上传项目文件..."
echo "   （排除 node_modules, .git, .env 等）"

rsync -avz --progress \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=dist \
    --exclude=*.log \
    --exclude=.env* \
    --exclude=coverage \
    --exclude=*.md \
    -e "ssh -i $SSH_KEY" \
    ./ $SERVER_USER@$SERVER_IP:$DEPLOY_PATH/

echo "✅ 文件上传完成"
echo ""

# 4. 在服务器上设置环境变量（不通过文件传输）
echo "4️⃣ 在服务器上配置环境变量..."

# 生成随机JWT密钥
JWT_SECRET=$(openssl rand -base64 32)

ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP << ENDSSH
cd $DEPLOY_PATH

# 从模板创建生产环境配置
cat > .env.production << 'ENVFILE'
# ==========
# 数据库配置
# ==========
DATABASE_URL="postgresql://postgres:password123@postgres:5432/opc_recruitment?schema=public"

# ==========
# Redis配置
# ==========
REDIS_URL="redis://:password123@redis:6379"

# ==========
# MongoDB配置
# ==========
MONGODB_URL="mongodb://root:password123@mongodb:27017/opc_logs?authSource=admin"

# ==========
# JWT配置（自动生成）
# ==========
JWT_SECRET="REPLACE_WITH_GENERATED_SECRET"

# ==========
# API配置
# ==========
PORT=3001
NODE_ENV=production

# ==========
# 前端配置
# ==========
NEXT_PUBLIC_API_URL=http://182.92.112.224/api
NEXT_PUBLIC_WS_URL=ws://182.92.112.224:3001

# ==========
# CORS配置
# ==========
ALLOWED_ORIGINS=http://182.92.112.224,http://localhost:3000
ENVFILE

# 替换JWT密钥
sed -i "s/REPLACE_WITH_GENERATED_SECRET/$JWT_SECRET/" .env.production

echo "✅ .env.production 已创建"

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker未安装，正在安装..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "⚠️  Docker Compose未安装，正在安装..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

echo "✅ 环境准备完成"
ENDSSH

echo "✅ 环境变量配置完成"
echo ""

# 5. 部署Docker容器
echo "5️⃣ 部署Docker容器..."
ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP << 'ENDSSH'
cd /opt/opc-recruitment-system

echo "   停止旧容器..."
docker-compose -f docker-compose.prod.yml down || true

echo "   构建新镜像..."
docker-compose -f docker-compose.prod.yml build

echo "   启动新容器..."
docker-compose -f docker-compose.prod.yml up -d

echo "   等待服务启动..."
sleep 10

echo "   运行数据库迁移..."
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy || true

echo "✅ 容器部署完成"
ENDSSH

echo "✅ 部署完成"
echo ""

# 6. 验证部署
echo "6️⃣ 验证部署..."
sleep 5

# 检查前端
if curl -s -f http://$SERVER_IP:3000 > /dev/null; then
    echo "✅ 前端运行正常: http://$SERVER_IP:3000"
else
    echo "⚠️  前端可能未启动，检查日志: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'cd $DEPLOY_PATH && docker-compose -f docker-compose.prod.yml logs frontend'"
fi

# 检查后端
if curl -s -f http://$SERVER_IP:3001/api > /dev/null; then
    echo "✅ 后端运行正常: http://$SERVER_IP:3001"
else
    echo "⚠️  后端可能未启动，检查日志: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'cd $DEPLOY_PATH && docker-compose -f docker-compose.prod.yml logs backend'"
fi

echo ""
echo "🎉 部署完成！"
echo ""
echo "📋 后续步骤:"
echo "   1. 访问前端: http://$SERVER_IP:3000"
echo "   2. 登录账号: founder@opc.com / password123"
echo "   3. 查看日志: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'cd $DEPLOY_PATH && docker-compose -f docker-compose.prod.yml logs -f'"
echo "   4. 修改默认密码！"
echo ""
echo "🔐 安全提醒:"
echo "   1. 立即登录阿里云控制台禁用已泄露的AccessKey"
echo "   2. 修改数据库默认密码"
echo "   3. 配置防火墙，只开放必要端口"
echo "   4. 考虑配置SSL证书启用HTTPS"
