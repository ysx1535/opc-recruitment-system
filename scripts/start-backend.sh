#!/bin/bash
# 后端启动脚本
cd /opt/opc-recruitment-system/src/backend

export DATABASE_URL='postgresql://postgres:password123@127.0.0.1:5432/opc_recruitment'
export REDIS_URL='redis://:password123@127.0.0.1:6379'
export JWT_SECRET='opc-super-secret-jwt-key-2024'
export PORT=3001
export NODE_ENV=production

nohup node dist/main.js > /tmp/backend.log 2>&1 &
echo "Backend started with PID $!"
sleep 3
curl -s http://localhost:3001/api/health || (echo "Health check failed:" && tail -5 /tmp/backend.log)
