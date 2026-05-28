# 多阶段构建 Dockerfile for Next.js Frontend

# ==================== 依赖安装阶段 ====================
FROM node:18-alpine AS deps

WORKDIR /app

# 启用 Corepack (用于 pnpm/yarn)
RUN corepack enable

# 复制依赖文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装依赖
RUN npm ci

# ==================== 构建阶段 ====================
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=http://localhost:3001

# 构建应用
RUN npm run build

# ==================== 生产阶段 ====================
FROM node:18-alpine AS runner

WORKDIR /app

# 不将 Telemetry 数据发送到 Vercel
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 切换用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "server.js"]


# ==================== 开发阶段 ====================
FROM node:18-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]


# ==================== 测试阶段 ====================
FROM deps AS test

WORKDIR /app

COPY . .

# 运行测试
CMD ["npm", "run", "test:cov"]
