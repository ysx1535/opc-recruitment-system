import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInterviewDto, UpdateInterviewDto, CreateEvaluationDto } from './dto/interview.dto';
import { Prisma, InterviewStatus } from '@prisma/client';

@Injectable()
export class InterviewsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInterviewDto) {
    const application = await this.prisma.application.findUnique({
      where: { id: dto.applicationId },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const interviewer = await this.prisma.user.findUnique({
      where: { id: dto.interviewerId },
    });
    if (!interviewer) {
      throw new NotFoundException('Interviewer not found');
    }

    const interview = await this.prisma.interview.create({
      data: {
        applicationId: dto.applicationId,
        interviewerId: dto.interviewerId,
        scheduledAt: new Date(dto.scheduledAt),
        durationMinutes: dto.durationMinutes || 60,
        type: dto.type,
        meetingLink: dto.meetingLink,
        status: InterviewStatus.SCHEDULED,
      },
      include: {
        application: true,
        interviewer: true,
        evaluation: true,
      },
    });

    await this.prisma.application.update({
      where: { id: dto.applicationId },
      data: { status: 'INTERVIEW' },
    });

    return interview;
  }

  async findAll(query: {
    applicationId?: string;
    status?: InterviewStatus;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.InterviewWhereInput = {};
    if (query.applicationId) where.applicationId = query.applicationId;
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type as any;

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [interviews, total] = await Promise.all([
      this.prisma.interview.findMany({
        where,
        include: {
          application: { include: { job: true, candidate: true } },
          interviewer: { select: { id: true, name: true, email: true } },
          evaluation: true,
        },
        orderBy: { scheduledAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.interview.count({ where }),
    ]);

    return {
      data: interviews,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
      include: {
        application: { include: { job: true, candidate: true } },
        interviewer: { select: { id: true, name: true, email: true } },
        evaluation: true,
      },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    return interview;
  }

  async update(id: string, dto: UpdateInterviewDto) {
    await this.findOne(id);

    const data: Prisma.InterviewUpdateInput = {};
    if (dto.status) data.status = dto.status;
    if (dto.meetingLink) data.meetingLink = dto.meetingLink;
    if (dto.recordingUrl) data.recordingUrl = dto.recordingUrl;
    if (dto.transcript) data.transcript = dto.transcript;

    return this.prisma.interview.update({
      where: { id },
      data,
      include: {
        application: { include: { job: true, candidate: true } },
        interviewer: { select: { id: true, name: true, email: true } },
        evaluation: true,
      },
    });
  }

  async cancel(id: string) {
    const interview = await this.findOne(id);

    if (interview.status === InterviewStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed interview');
    }

    const updated = await this.prisma.interview.update({
      where: { id },
      data: { status: InterviewStatus.CANCELLED },
    });

    await this.prisma.application.update({
      where: { id: interview.applicationId },
      data: { status: 'SCREENING' },
    });

    return updated;
  }

  async createEvaluation(dto: CreateEvaluationDto) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: dto.interviewId },
      include: { evaluation: true },
    });
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if ((interview as any).evaluation) {
      throw new BadRequestException('Evaluation already exists');
    }

    const evaluation = await this.prisma.interviewEvaluation.create({
      data: {
        interviewId: dto.interviewId,
        evaluatorId: dto.evaluatorId,
        scores: dto.scores as any,
        overallScore: dto.overallScore,
        recommendation: dto.recommendation as any,
        notes: dto.notes,
      },
      include: {
        interview: true,
        evaluator: { select: { id: true, name: true, email: true } },
      },
    });

    await this.prisma.interview.update({
      where: { id: dto.interviewId },
      data: { status: InterviewStatus.COMPLETED },
    });

    let appStatus: 'OFFER' | 'REJECTED' | 'SCREENING' = 'SCREENING';
    if (dto.recommendation === 'STRONG_YES' || dto.recommendation === 'YES') {
      appStatus = 'OFFER';
    } else if (dto.recommendation === 'NO' || dto.recommendation === 'STRONG_NO') {
      appStatus = 'REJECTED';
    }

    await this.prisma.application.update({
      where: { id: interview.applicationId },
      data: { status: appStatus },
    });

    return evaluation;
  }

  async getEvaluation(interviewId: string) {
    const evaluation = await this.prisma.interviewEvaluation.findUnique({
      where: { interviewId },
      include: {
        evaluator: { select: { id: true, name: true, email: true } },
      },
    });

    if (!evaluation) {
      throw new NotFoundException('Evaluation not found');
    }

    return evaluation;
  }

  async getStats() {
    const [total, scheduled, completed, cancelled] = await Promise.all([
      this.prisma.interview.count(),
      this.prisma.interview.count({ where: { status: InterviewStatus.SCHEDULED } }),
      this.prisma.interview.count({ where: { status: InterviewStatus.COMPLETED } }),
      this.prisma.interview.count({ where: { status: InterviewStatus.CANCELLED } }),
    ]);

    const avgResult = await this.prisma.interviewEvaluation.aggregate({
      _avg: { overallScore: true },
    });
    const avgScoreNum = avgResult._avg.overallScore;

    const byType = await this.prisma.interview.groupBy({
      by: ['type'],
      _count: { id: true },
    });

    return {
      total,
      scheduled,
      completed,
      cancelled,
      avgScore: avgScoreNum ? avgScoreNum.toFixed(1) : '0',
      byType: byType.map((g) => ({ type: g.type, count: g._count.id })),
    };
  }
}