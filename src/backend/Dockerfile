# 多阶段构建 Dockerfile for NestJS Backend

# ==================== 依赖安装阶段 ====================
FROM node:18-alpine AS deps

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装全部依赖（build 需要 devDependencies）
RUN npm install --ignore-scripts

# ==================== 构建阶段 ====================
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules

# 复制源码和 Prisma schema（build 前需要生成 Prisma Client）
COPY . .

# 先生成 Prisma Client（NestJS build 时需要）
RUN npx prisma generate

# 构建 NestJS 项目
RUN npm run build 2>&1 || (echo "❌ BUILD FAILED" && cat dist/main.js 2>/dev/null || true && exit 1)

# ==================== 生产阶段 ====================
FROM node:18 AS runner

WORKDIR /app

# 安装 OpenSSL（Debian 基础镜像更稳定）
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# 重新生成 Prisma Client（确保适配当前系统）
RUN npx prisma generate

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

CMD ["node", "dist/main.js"]
