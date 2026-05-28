import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobDto, UpdateJobDto, JobQueryDto, JobStatus } from './dto/job.dto';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateJobDto, posterId: string) {
    return this.prisma.job.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        remoteAllowed: dto.employmentType === 'REMOTE',
        status: JobStatus.DRAFT,
        posterId,
      },
      include: {
        poster: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(query: JobQueryDto) {
    const { page = 1, limit = 10, status, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          poster: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        poster: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        applications: {
          select: {
            id: true,
            status: true,
            appliedAt: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('职位不存在');
    }

    return job;
  }

  async findPublic(id: string) {
    const job = await this.prisma.job.findFirst({
      where: {
        id,
        status: 'PUBLISHED',
      },
      include: {
        poster: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('职位不存在或已下架');
    }

    return job;
  }

  async update(id: string, dto: UpdateJobDto, posterId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException('职位不存在');
    }

    if (job.posterId !== posterId) {
      throw new NotFoundException('无权修改此职位');
    }

    return this.prisma.job.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        status: dto.status,
      },
      include: {
        poster: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string, posterId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException('职位不存在');
    }

    if (job.posterId !== posterId) {
      throw new NotFoundException('无权删除此职位');
    }

    return this.prisma.job.delete({
      where: { id },
    });
  }

  async getStats(posterId: string) {
    const [total, published, paused, closed] = await Promise.all([
      this.prisma.job.count({ where: { posterId } }),
      this.prisma.job.count({ where: { posterId, status: 'PUBLISHED' } }),
      this.prisma.job.count({ where: { posterId, status: 'PAUSED' } }),
      this.prisma.job.count({ where: { posterId, status: 'CLOSED' } }),
    ]);

    return { total, published, paused, closed };
  }
}
