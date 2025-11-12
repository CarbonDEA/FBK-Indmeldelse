import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UnifiService } from '../../integrations/unifi/unifi.service';
import { PaymentService } from '../../integrations/payment/payment.service';
import { MailService } from '../../integrations/mail/mail.service';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(
    private prisma: PrismaService,
    private unifi: UnifiService,
    private payment: PaymentService,
    private mail: MailService,
  ) {}

  async findAll(query?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { memberNo: { equals: parseInt(query.search) || undefined } },
      ];
    }

    const [members, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { memberNo: 'desc' },
        include: {
          accessKeys: {
            where: { status: 'ACTIVE' },
            take: 1,
          },
        },
      }),
      this.prisma.member.count({ where }),
    ]);

    return {
      data: members,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        accessKeys: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return member;
  }

  async terminate(id: string, actor: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        accessKeys: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.status === 'TERMINATED') {
      throw new Error('Member already terminated');
    }

    // Transaction
    await this.prisma.$transaction(async (tx) => {
      // Cancel payment subscription
      if (member.paymentCustomerId) {
        await this.payment.cancelSubscription(member.paymentCustomerId);
      }

      // Revoke all active access keys
      for (const key of member.accessKeys) {
        if (key.unifiKeyId) {
          await this.unifi.revokeAccessKey(key.unifiKeyId);
        }

        await tx.accessKey.update({
          where: { id: key.id },
          data: {
            status: 'REVOKED',
            revokedAt: new Date(),
          },
        });
      }

      // Update member status
      await tx.member.update({
        where: { id },
        data: {
          status: 'TERMINATED',
          terminatedAt: new Date(),
        },
      });

      // Log
      await tx.auditLog.create({
        data: {
          actor,
          action: 'MEMBER_TERMINATED',
          entity: 'Member',
          entityId: id,
          payload: { memberNo: member.memberNo },
        },
      });
    });

    // Send termination email
    await this.mail.sendTermination(member);

    return { status: 'TERMINATED' };
  }
}
