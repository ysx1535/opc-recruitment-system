# OPC Recruitment System
## 面向一人公司的智能化招聘系统

基于 Harness 工程体系的现代化招聘管理系统

---

## 📋 项目简介

这是一个专为**一人公司（OPC, One-Person Company）**设计的智能化招聘系统。通过自动化、AI 驱动的方式，帮助创始人高效完成招聘流程，无需专职 HR。

### 核心特性

- 🤖 **AI 智能筛选**：自动解析简历，智能匹配候选人
- ⚡ **流程自动化**：从发布职位到发放 Offer 的全流程自动化
- 📊 **数据驱动决策**：全流程数据追踪，优化招聘策略
- 🔗 **多渠道集成**：支持 Boss直聘、拉勾、LinkedIn 等平台
- 📱 **多端访问**：Web、移动端、微信小程序全覆盖
- 💰 **成本可控**：月成本 < $10，适合 OPC 预算

---

## 🏗️ 技术架构

### 技术栈

#### 前端
- **框架**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + Shadcn/ui
- **状态管理**: Zustand
- **类型检查**: TypeScript

#### 后端
- **运行时**: Node.js 18+ (TypeScript)
- **框架**: NestJS
- **ORM**: Prisma
- **API**: RESTful + GraphQL

#### 数据库
- **关系型**: PostgreSQL 16
- **文档型**: MongoDB 7
- **缓存**: Redis 7
- **搜索**: Elasticsearch

#### AI/ML
- **LLM**: QClaw Model Route
- **向量数据库**: Pinecone
- **OCR**: PaddleOCR

#### 基础设施
- **容器**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **监控**: Prometheus + Grafana
- **部署**: Vercel (前端) + Railway (后端)

---

## 📁 项目结构

```
opc-recruitment-system/
├── docs/                   # 项目文档
│   ├── api.md             # API 文档
│   ├── architecture.md    # 架构设计
│   ├── database.md        # 数据库设计
│   └── deployment.md     # 部署文档
├── src/                   # 源代码
│   ├── backend/          # 后端代码 (NestJS)
│   │   ├── src/
│   │   │   ├── controllers/  # 控制器
│   │   │   ├── services/     # 业务逻辑
│   │   │   ├── models/       # 数据模型
│   │   │   ├── routes/       # 路由定义
│   │   │   ├── middleware/   # 中间件
│   │   │   └── utils/        # 工具函数
│   │   ├── prisma/          # Prisma Schema
│   │   └── test/            # 测试代码
│   ├── frontend/         # 前端代码 (Next.js)
│   │   ├── src/
│   │   │   ├── app/         # App Router 页面
│   │   │   ├── components/  # React 组件
│   │   │   └── lib/         # 工具库
│   │   └── public/          # 静态资源
│   └── shared/           # 前后端共享代码
├── tests/                 # 集成测试
├── config/                # 配置文件
├── scripts/               # 脚本文件
├── .github/               # GitHub 配置
│   └── workflows/        # CI/CD 工作流
├── .env.example           # 环境变量示例
├── docker-compose.yml     # Docker 编排
├── package.json           # 项目配置
└── README.md             # 项目说明
```

---

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm/yarn/pnpm
- Docker Desktop (可选，用于本地数据库)
- Git

### 安装步骤

#### 1. 克隆项目

```bash
cd C:\myspace\myprojects\myclawproject
git clone <repository-url> opc-recruitment-system
cd opc-recruitment-system
```

#### 2. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装后端依赖
cd src/backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

#### 3. 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，填入真实的配置值
```

#### 4. 启动数据库 (Docker)

```bash
# 启动 PostgreSQL、Redis、MongoDB
docker-compose up -d postgres redis mongodb

# 等待数据库启动完成
docker-compose ps
```

#### 5. 初始化数据库

```bash
# 进入后端目录
cd src/backend

# 运行 Prisma 迁移
npx prisma migrate dev

# 填充种子数据
npx prisma db seed
```

#### 6. 启动开发服务器

```bash
# 启动后端 (在 src/backend 目录)
npm run start:dev

# 启动前端 (在 src/frontend 目录)
npm run dev
```

访问 `http://localhost:3000` 查看前端应用  
访问 `http://localhost:3001/api` 查看后端 API

---

## 📚 文档

- [系统设计方案](./docs/system-design.md)
- [API 文档](./docs/api.md)
- [数据库设计](./docs/database.md)
- [部署指南](./docs/deployment.md)
- [开发规范](./docs/development.md)

---

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 运行 E2E 测试
npm run test:e2e

# 检查测试覆盖率
npm run test:cov
```

---

## 🚢 部署

### 前端部署 (Vercel)

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### 后端部署 (Railway)

```bash
# 安装 Railway CLI
npm i -g @railway/cli

# 登录
railway login

# 部署
railway up
```

详细部署步骤请参考 [部署文档](./docs/deployment.md)

---

## 🤝 贡献指南

我们欢迎任何形式的贡献！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 📞 联系方式

- **项目负责人**: [Your Name]
- **邮箱**: [your-email@example.com]
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)

---

## 🙏 致谢

感谢所有为本项目做出贡献的开发者！

---

**构建时间**: 2026-05-27  
**当前版本**: v0.1.0 (MVP)  
**状态**: 🚧 开发中
