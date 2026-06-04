#!/usr/bin/env node
/**
 * GitHub Webhook Server for Auto-Deploy
 * Listens on port 9000, verifies signature, runs deploy script
 */

const http = require('http');
const crypto = require('crypto');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Config
const PORT = process.env.PORT || 9000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret-here';
const PROJECT_DIR = '/opt/opc-recruitment-system';
const LOG_FILE = '/var/log/opc-webhook.log';

// Simple logger
function log(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  console.log(line.trim());
  fs.appendFileSync(LOG_FILE, line);
}

// Verify GitHub signature
function verifySignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Run deploy commands
function deploy() {
  log('Starting deployment...');
  try {
    const commands = [
      `cd ${PROJECT_DIR} && git pull origin master`,
      `cd ${PROJECT_DIR}/src/backend && npm install`,
      `cd ${PROJECT_DIR}/src/backend && npm run build`,
      `systemctl restart opc-backend`,
      `cd ${PROJECT_DIR}/src/frontend && npm install`,
      `cd ${PROJECT_DIR}/src/frontend && npm run build`,
      `systemctl restart opc-frontend`
    ];

    for (const cmd of commands) {
      log(`Running: ${cmd}`);
      const output = execSync(cmd, { encoding: 'utf8', timeout: 300000 });
      log(output);
    }

    log('Deployment completed successfully!');
    return true;
  } catch (error) {
    log(`Deployment failed: ${error.message}`);
    log(error.stdout || '');
    log(error.stderr || '');
    return false;
  }
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Only accept POST to /webhook
  if (req.method !== 'POST' || req.url !== '/webhook') {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const signature = req.headers['x-hub-signature-256'] || '';

    // Verify signature
    if (!verifySignature(body, signature, WEBHOOK_SECRET)) {
      log('Invalid signature');
      res.writeHead(401);
      res.end('Unauthorized');
      return;
    }

    // Parse payload
    let payload;
    try {
      payload = JSON.parse(body);
    } catch (e) {
      log('Invalid JSON payload');
      res.writeHead(400);
      res.end('Bad Request');
      return;
    }

    // Only deploy on push to master
    if (payload.ref === 'refs/heads/master') {
      log(`Received push to master by ${payload.pusher?.name || 'unknown'}`);
      
      // Respond immediately, deploy in background
      res.writeHead(202);
      res.end('Deployment triggered');
      
      // Run deploy
      deploy();
    } else {
      log(`Ignoring push to ${payload.ref}`);
      res.writeHead(200);
      res.end('Ignored');
    }
  });
});

// Ensure log directory exists
const logDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

server.listen(PORT, () => {
  log(`Webhook server listening on port ${PORT}`);
  log(`Project directory: ${PROJECT_DIR}`);
});
