#!/bin/bash
echo "=== 🌐 OPC 招聘系统 - 完整测试 ==="
echo ""
echo "1️⃣ 前端访问测试"
curl -s -o /dev/null -w "   HTTP Status: %{http_code}\n" http://182.92.112.224
echo ""
echo "2️⃣ 后端 Health Check (通过 Nginx)"
curl -s http://182.92.112.224/api/health | head -c 150
echo ""
echo ""
echo "3️⃣ 登录测试"
LOGIN_RESPONSE=$(curl -s -X POST http://182.92.112.224/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"founder@opc.com","password":"password123"}')
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
if [ -n "$TOKEN" ]; then
  echo "   ✅ 登录成功"
  echo "   Token: ${TOKEN:0:30}..."
  echo ""
  echo "4️⃣ 职位列表 API"
  curl -s -H "Authorization: Bearer $TOKEN" http://182.92.112.224/api/jobs | jq -r '.jobs[] | "   - \(.title) (\(.location))"' 2>/dev/null || echo "   (需要 jq 解析)"
  echo ""
  echo "5️⃣ 候选人列表 API"
  curl -s -H "Authorization: Bearer $TOKEN" http://182.92.112.224/api/candidates | jq -r '.candidates[] | "   - \(.name) (\(.email))"' 2>/dev/null || echo "   (需要 jq 解析)"
else
  echo "   ❌ 登录失败"
  echo "$LOGIN_RESPONSE"
fi
echo ""
echo "=== 📊 服务状态 ==="
systemctl is-active opc-backend 2>/dev/null && echo "✅ 后端服务运行中" || echo "❌ 后端服务未运行"
systemctl is-active opc-frontend 2>/dev/null && echo "✅ 前端服务运行中" || echo "❌ 前端服务未运行"
docker ps --format 'table {{.Names}}\t{{.Status}}' 2>/dev/null || echo "Docker 容器检查失败"
echo ""
echo "=== 🎉 测试完成 ==="
