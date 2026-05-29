import 'dotenv/config';
import { PrismaClient, JobStatus, ApplicationStatus, CandidateStatus, InterviewType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始填充数据库种子数据...');

  // 1. 创建用户
  console.log('📝 创建用户...');
  const password = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'founder@opc.com' },
    update: {},
    create: {
      email: 'founder@opc.com',
      password,
      name: 'OPC 创始人',
      role: 'FOUNDER',
    },
  });

  const recruiter = await prisma.user.upsert({
    where: { email: 'hr@opc.com' },
    update: {},
    create: {
      email: 'hr@opc.com',
      password,
      name: 'OPC 招聘官',
      role: 'RECRUITER',
    },
  });

  console.log(`✅ 用户创建完成: ${user.name}, ${recruiter.name}`);

  // 2. 创建职位
  console.log('💼 创建职位...');
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        title: '高级前端工程师',
        description: '我们正在寻找一位经验丰富的高级前端工程师，负责构建和维护我们的核心产品界面。\n\n要求：\n- 5年以上前端开发经验\n- 精通 React、TypeScript\n- 熟悉 Next.js 框架\n- 有良好的代码风格和团队协作能力',
        salaryMin: 25000,
        salaryMax: 40000,
        location: '深圳',
        remoteAllowed: true,
        status: JobStatus.PUBLISHED,
        posterId: user.id,
      },
    }),
    prisma.job.create({
      data: {
        title: '后端工程师（Node.js）',
        description: '负责服务器端逻辑开发，API 设计和数据库优化。\n\n要求：\n- 3年以上后端开发经验\n- 精通 Node.js / TypeScript\n- 熟悉 PostgreSQL 和 Redis\n- 了解微服务架构',
        salaryMin: 20000,
        salaryMax: 35000,
        location: '深圳',
        remoteAllowed: true,
        status: JobStatus.PUBLISHED,
        posterId: user.id,
      },
    }),
    prisma.job.create({
      data: {
        title: '产品经理',
        description: '负责产品规划和需求分析，协调研发资源推动产品落地。\n\n要求：\n- 3年以上产品经理经验\n- 有 B 端产品经验优先\n- 优秀的沟通协调能力\n- 熟悉敏捷开发流程',
        salaryMin: 22000,
        salaryMax: 38000,
        location: '深圳',
        remoteAllowed: false,
        status: JobStatus.PUBLISHED,
        posterId: user.id,
      },
    }),
    prisma.job.create({
      data: {
        title: 'UI/UX 设计师',
        description: '负责产品界面设计和用户体验优化。\n\n要求：\n- 3年以上 UI/UX 设计经验\n- 精通 Figma、Sketch 等设计工具\n- 有设计系统搭建经验优先\n- 良好的审美和沟通能力',
        salaryMin: 18000,
        salaryMax: 30000,
        location: '深圳',
        remoteAllowed: true,
        status: JobStatus.DRAFT,
        posterId: recruiter.id,
      },
    }),
  ]);

  console.log(`✅ 职位创建完成: ${jobs.length} 个`);

  // 3. 创建候选人
  console.log('👥 创建候选人...');
  const candidates = await Promise.all([
    prisma.candidate.create({
      data: {
        name: '张三',
        email: 'zhangsan@example.com',
        phone: '13800138001',
        location: '深圳',
        experienceYears: 5,
        educationLevel: '本科',
        skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
        source: 'linkedin',
        status: CandidateStatus.INTERVIEWING,
      },
    }),
    prisma.candidate.create({
      data: {
        name: '李四',
        email: 'lisi@example.com',
        phone: '13800138002',
        location: '北京',
        experienceYears: 3,
        educationLevel: '硕士',
        skills: ['Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
        source: 'boss',
        status: CandidateStatus.SCREENING,
      },
    }),
    prisma.candidate.create({
      data: {
        name: '王五',
        email: 'wangwu@example.com',
        phone: '13800138003',
        location: '深圳',
        experienceYears: 4,
        educationLevel: '本科',
        skills: ['Product Management', 'Axure', 'Data Analysis', 'Agile'],
        source: 'zhilian',
        status: CandidateStatus.NEW,
      },
    }),
    prisma.candidate.create({
      data: {
        name: '赵六',
        email: 'zhaoliu@example.com',
        phone: '13800138004',
        location: '广州',
        experienceYears: 2,
        educationLevel: '本科',
        skills: ['Figma', 'Sketch', 'UI Design', 'Prototyping'],
        source: 'linkedin',
        status: CandidateStatus.SCREENING,
      },
    }),
    prisma.candidate.create({
      data: {
        name: '孙七',
        email: 'sunqi@example.com',
        phone: '13800138005',
        location: '深圳',
        experienceYears: 6,
        educationLevel: '硕士',
        skills: ['React', 'Vue', 'Node.js', 'Python', 'AWS'],
        source: 'referral',
        status: CandidateStatus.HIRED,
      },
    }),
  ]);

  console.log(`✅ 候选人创建完成: ${candidates.length} 个`);

  // 4. 创建申请
  console.log('📋 创建申请...');
  const applications = await Promise.all([
    prisma.application.create({
      data: {
        jobId: jobs[0].id,
        candidateId: candidates[0].id,
        status: ApplicationStatus.INTERVIEW,
        reviewerId: recruiter.id,
      },
    }),
    prisma.application.create({
      data: {
        jobId: jobs[1].id,
        candidateId: candidates[1].id,
        status: ApplicationStatus.SCREENING,
        reviewerId: recruiter.id,
      },
    }),
    prisma.application.create({
      data: {
        jobId: jobs[2].id,
        candidateId: candidates[2].id,
        status: ApplicationStatus.PENDING,
      },
    }),
    prisma.application.create({
      data: {
        jobId: jobs[0].id,
        candidateId: candidates[3].id,
        status: ApplicationStatus.REJECTED,
      },
    }),
    prisma.application.create({
      data: {
        jobId: jobs[0].id,
        candidateId: candidates[4].id,
        status: ApplicationStatus.HIRED,
        reviewerId: user.id,
      },
    }),
  ]);

  console.log(`✅ 申请创建完成: ${applications.length} 个`);

  // 5. 创建面试记录和评价
  console.log('📝 创建面试记录...');
  const interview = await prisma.interview.create({
    data: {
      applicationId: applications[0].id,
      interviewerId: recruiter.id,
      scheduledAt: new Date('2026-05-25T14:00:00Z'),
      durationMinutes: 60,
      type: InterviewType.TECHNICAL,
      status: 'COMPLETED',
    },
  });

  await prisma.interviewEvaluation.create({
    data: {
      interviewId: interview.id,
      evaluatorId: recruiter.id,
      scores: { technical: 4, communication: 4, culture_fit: 5 },
      overallScore: 85,
      recommendation: 'YES',
      notes: '技术基础扎实，React 经验丰富，建议进入下一轮面试',
    },
  });
  console.log('✅ 面试记录和评价创建完成');

  console.log('✅ 面试评价创建完成');

  console.log('');
  console.log('🎉 数据库种子数据填充完成！');
  console.log('');
  console.log('📊 数据汇总:');
  console.log(`   用户: 2 个`);
  console.log(`   职位: ${jobs.length} 个 (3个在招, 1个草稿)`);
  console.log(`   候选人: ${candidates.length} 个`);
  console.log(`   申请: ${applications.length} 个`);
  console.log('');
  console.log('🔐 登录账号:');
  console.log('   邮箱: founder@opc.com');
  console.log('   密码: password123');
  console.log('');
}

main()
  .catch(async (e) => {
    console.error('❌ 种子数据填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
