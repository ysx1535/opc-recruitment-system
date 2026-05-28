import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateApplicationDto,
  UpdateApplicationStatusDto,
  ApplicationQueryDto,
  ApplicationStatus,
} from './dto/application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApplicationDto, reviewerId?: string) {
    // 检查职位是否存在
    const job = await this.prisma.job.findUnique({
      where: { id: dto.jobId },
    });

    if (!job) {
      throw new NotFoundException('职位不存在');
    }

    // 检查候选人是否存在
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: dto.candidateId },
    });

    if (!candidate) {
      throw new NotFoundException('候选人不存在');
    }

    // 检查是否已经申请过该职位
    const existingApplication = await this.prisma.application.findFirst({
      where: {
        jobId: dto.jobId,
        candidateId: dto.candidateId,
      },
    });

    if (existingApplication) {
      throw new BadRequestException('该候选人已申请过此职位');
    }

    return this.prisma.application.create({
      data: {
        jobId: dto.jobId,
        candidateId: dto.candidateId,
        reviewerId,
        status: ApplicationStatus.PENDING,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            skills: true,
          },
        },
      },
    });
  }

  async findAll(query: ApplicationQueryDto) {
    const { page = 1, limit = 10, status, jobId, candidateId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (jobId) {
      where.jobId = jobId;
    }

    if (candidateId) {
      where.candidateId = candidateId;
    }

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { appliedAt: 'desc' },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              location: true,
              status: true,
            },
          },
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              skills: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            salaryMin: true,
            salaryMax: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            skills: true,
            experienceYears: true,
            location: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
        interviews: {
          orderBy: { scheduledAt: 'desc' },
        },
        offer: true,
      },
    });

    if (!application) {
      throw new NotFoundException('申请记录不存在');
    }

    return application;
  }

  async updateStatus(id: string, dto: UpdateApplicationStatusDto, reviewerId?: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('申请记录不存在');
    }

    return this.prisma.application.update({
      where: { id },
      data: {
        status: dto.status,
        reviewerId,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getStats() {
    const [total, pending, interview, offer, hired, rejected] = await Promise.all([
      this.prisma.application.count(),
      this.prisma.application.count({ where: { status: 'PENDING' } }),
      this.prisma.application.count({ where: { status: 'INTERVIEW' } }),
      this.prisma.application.count({ where: { status: 'OFFER' } }),
      this.prisma.application.count({ where: { status: 'HIRED' } }),
      this.prisma.application.count({ where: { status: 'REJECTED' } }),
    ]);

    return {
      total,
      pending,
      interview,
      offer,
      hired,
      rejected,
      hireRate: total > 0 ? ((hired / total) * 100).toFixed(1) + '%' : '0%',
    };
  }
}
