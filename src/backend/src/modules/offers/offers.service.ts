import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOfferDto, OfferQueryDto } from './dto/offer.dto';
import { Prisma, OfferStatus } from '@prisma/client';

@Injectable()
export class OffersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOfferDto) {
    const application = await this.prisma.application.findUnique({
      where: { id: dto.applicationId },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status !== 'OFFER') {
      throw new BadRequestException('Application must be in OFFER status to create offer');
    }

    const existing = await this.prisma.offer.findUnique({
      where: { applicationId: dto.applicationId },
    });
    if (existing) {
      throw new BadRequestException('Offer already exists for this application');
    }

    const offer = await this.prisma.offer.create({
      data: {
        applicationId: dto.applicationId,
        salary: dto.salary,
        equity: dto.equity,
        bonus: dto.bonus,
        startDate: new Date(dto.startDate),
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        status: OfferStatus.DRAFT,
      },
      include: {
        application: { include: { job: true, candidate: true } },
      },
    });

    return offer;
  }

  async findAll(query: OfferQueryDto) {
    const where: Prisma.OfferWhereInput = {};
    if (query.status) where.status = query.status;

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [offers, total] = await Promise.all([
      this.prisma.offer.findMany({
        where,
        include: {
          application: { include: { job: true, candidate: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.offer.count({ where }),
    ]);

    return {
      data: offers,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: {
        application: { include: { job: true, candidate: true } },
      },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return offer;
  }

  async send(id: string) {
    const offer = await this.findOne(id);

    if (offer.status !== OfferStatus.DRAFT) {
      throw new BadRequestException('Only draft offers can be sent');
    }

    const updated = await this.prisma.offer.update({
      where: { id },
      data: {
        status: OfferStatus.SENT,
        sentAt: new Date(),
      },
      include: {
        application: { include: { job: true, candidate: true } },
      },
    });

    return updated;
  }

  async sign(id: string) {
    const offer = await this.findOne(id);

    if (offer.status !== OfferStatus.SENT) {
      throw new BadRequestException('Only sent offers can be signed');
    }

    const updated = await this.prisma.offer.update({
      where: { id },
      data: {
        status: OfferStatus.SIGNED,
        signedAt: new Date(),
      },
      include: {
        application: { include: { job: true, candidate: true } },
      },
    });

    await this.prisma.application.update({
      where: { id: offer.applicationId },
      data: { status: 'HIRED' },
    });

    return updated;
  }

  async decline(id: string) {
    const offer = await this.findOne(id);

    if (offer.status !== OfferStatus.SENT) {
      throw new BadRequestException('Only sent offers can be declined');
    }

    const updated = await this.prisma.offer.update({
      where: { id },
      data: { status: OfferStatus.DECLINED },
    });

    await this.prisma.application.update({
      where: { id: offer.applicationId },
      data: { status: 'REJECTED' },
    });

    return updated;
  }

  async withdraw(id: string) {
    const offer = await this.findOne(id);

    const updated = await this.prisma.offer.update({
      where: { id },
      data: { status: OfferStatus.WITHDRAWN },
    });

    return updated;
  }

  async getStats() {
    const [total, sent, signed, declined, expired] = await Promise.all([
      this.prisma.offer.count(),
      this.prisma.offer.count({ where: { status: OfferStatus.SENT } }),
      this.prisma.offer.count({ where: { status: OfferStatus.SIGNED } }),
      this.prisma.offer.count({ where: { status: OfferStatus.DECLINED } }),
      this.prisma.offer.count({ where: { status: OfferStatus.EXPIRED } }),
    ]);

    const avgSalary = await this.prisma.offer.aggregate({
      _avg: { salary: true },
      where: { status: { in: [OfferStatus.SENT, OfferStatus.SIGNED] } },
    });

    return {
      total,
      sent,
      signed,
      declined,
      expired,
      avgSalary: avgSalary._avg.salary?.toFixed(0) || '0',
    };
  }
}