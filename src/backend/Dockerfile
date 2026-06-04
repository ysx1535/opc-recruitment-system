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

# 复制源码
COPY . .

# 构建 NestJS 项目
RUN npm run build

# 生成 Prisma Client
RUN npx prisma generate

# ==================== 生产阶段 ====================
FROM node:18-alpine AS runner

WORKDIR /app

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001

CMD ["node", "dist/main.js"]
