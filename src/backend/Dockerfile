# 多阶段构建 Dockerfile for NestJS Backend

# ==================== 开发阶段 ====================
FROM node:18-alpine AS development

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci

# 复制源代码
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "start:dev"]


# ==================== 构建阶段 ====================
FROM node:18-alpine AS build

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 构建应用
RUN npm run build

# 删除 devDependencies
RUN npm ci --only=production


# ==================== 生产阶段 ====================
FROM node:18-alpine AS production

WORKDIR /app

# 复制 package.json
COPY package*.json ./

# 从构建阶段复制文件
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma

# 生成 Prisma Client (生产环境)
RUN npx prisma generate

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# 切换用户
USER nestjs

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "dist/main.js"]


# ==================== 测试阶段 ====================
FROM development AS test

WORKDIR /app

# 安装所有依赖 (包括 devDependencies)
COPY package*.json ./
RUN npm ci

# 运行测试
CMD ["npm", "run", "test:cov"]
