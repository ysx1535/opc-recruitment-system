import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCandidateDto, UpdateCandidateDto, CandidateQueryDto } from './dto/candidate.dto';

@Injectable()
export class CandidatesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCandidateDto) {
    return this.prisma.candidate.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        location: dto.location,
        experienceYears: dto.experienceYears,
        educationLevel: dto.educationLevel,
        skills: dto.skills || [],
        source: dto.source,
      },
    });
  }

  async findAll(query: CandidateQueryDto) {
    const { page = 1, limit = 10, source, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (source) {
      where.source = source;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [candidates, total] = await Promise.all([
      this.prisma.candidate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),
      this.prisma.candidate.count({ where }),
    ]);

    return {
      candidates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!candidate) {
      throw new NotFoundException('候选人不存在');
    }

    return candidate;
  }

  async update(id: string, dto: UpdateCandidateDto) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
    });

    if (!candidate) {
      throw new NotFoundException('候选人不存在');
    }

    return this.prisma.candidate.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        location: dto.location,
        experienceYears: dto.experienceYears,
        educationLevel: dto.educationLevel,
        skills: dto.skills,
        source: dto.source,
      },
    });
  }

  async remove(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
    });

    if (!candidate) {
      throw new NotFoundException('候选人不存在');
    }

    return this.prisma.candidate.delete({
      where: { id },
    });
  }

  async getStats() {
    const [total, newCandidates, hired] = await Promise.all([
      this.prisma.candidate.count(),
      this.prisma.candidate.count({ where: { status: 'NEW' } }),
      this.prisma.candidate.count({ where: { status: 'HIRED' } }),
    ]);

    return { total, newCandidates, hired };
  }
}
