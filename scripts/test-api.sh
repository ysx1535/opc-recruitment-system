#!/bin/bash
echo "=== Health Check ==="
curl -s http://localhost:3001/api/health

echo ""
echo "=== Login ==="
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d @/tmp/login.json | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo "Token: ${TOKEN:0:30}..."

echo ""
echo "=== Jobs ==="
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/jobs

echo ""
echo "=== Candidates ==="
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/candidates

echo ""
echo "=== All containers ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
