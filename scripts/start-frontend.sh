#!/bin/bash
pkill -f 'node.*3000' 2>/dev/null || true
cd /opt/opc-recruitment-system/src/frontend/standalone
PORT=3000 NODE_ENV=production node server.js > /tmp/frontend.log 2>&1 &
echo $! > /tmp/frontend.pid
echo "✅ 前端启动中，PID: $(cat /tmp/frontend.pid)"
sleep 3
curl -s http://localhost:3000 | head -c 200
