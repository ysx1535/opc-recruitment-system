# 极简 Dockerfile - 直接运行预构建的 dist
FROM node:18-alpine

WORKDIR /app

# 复制预构建的文件
COPY dist ./dist
COPY prisma ./prisma
COPY package*.json ./

# 安装生产依赖（轻量）
RUN npm install --omit=dev --ignore-scripts

# 生成 Prisma Client
RUN npx prisma generate

# 修复权限
RUN chmod +x node_modules/.bin/* || true
RUN chmod -R 755 node_modules/.prisma 2>/dev/null || true

EXPOSE 3001

CMD ["node", "dist/main.js"]
