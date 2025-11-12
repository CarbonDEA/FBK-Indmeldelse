import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UnifiService } from '../../integrations/unifi/unifi.service';
import { DineroService } from '../../integrations/dinero/dinero.service';
import { PaymentService } from '../../integrations/payment/payment.service';
import { MailService } from '../../integrations/mail/mail.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { generateToken } from '../../common/utils/jwt.util';
import { encrypt } from '../../common/utils/crypto.util';
import { env } from '@fbk/config';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private prisma: PrismaService,
    private unifi: UnifiService,
    private dinero: DineroService,
    private payment: PaymentService,
    private mail: MailService,
  ) {}

  async create(dto: CreateApplicationDto) {
    // Create application
    const application = await this.prisma.application.create({
      data: {
        dataJson: dto as any,
        status: 'PENDING',
      },
    });

    // Generate magic links for approval/rejection
    const approveToken = generateToken(application.id, 'application:approve');
    const rejectToken = generateToken(application.id, 'application:reject');

    const approveUrl = `${env.API_BASE_URL}/applications/${application.id}/approve?token=${approveToken}`;
    const rejectUrl = `${env.API_BASE_URL}/applications/${application.id}/reject?token=${rejectToken}`;

    // Send approval email to board
    await this.mail.sendBoardApprovalLinks(application, approveUrl, rejectUrl);

    // Log
    await this.prisma.auditLog.create({
      data: {
        actor: dto.email,
        action: 'APPLICATION_CREATED',
        entity: 'Application',
        entityId: application.id,
        payload: dto as any,
      },
    });

    return { applicationId: application.id };
  }

  async approve(applicationId: string, approvedBy: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status !== 'PENDING') {
      throw new BadRequestException('Application already processed');
    }

    const data = application.dataJson as any;

    // Start transaction
    return await this.prisma.$transaction(async (tx) => {
      // Get next member number
      const result = await tx.$queryRaw<Array<{ next_no: bigint }>>`
        SELECT nextval('member_no_seq') as next_no;
      `;
      const memberNo = Number(result[0].next_no);

      // Create Unifi access key
      const { code, keyId } = await this.unifi.createAccessKey(
        `Member ${memberNo} - ${data.name}`,
      );

      // Create member
      const member = await tx.member.create({
        data: {
          memberNo,
          name: data.name,
          email: data.email,
          phone: data.phone,
          status: 'ACTIVE',
        },
      });

      // Store encrypted access key
      await tx.accessKey.create({
        data: {
          memberId: member.id,
          unifiKey: encrypt(code),
          unifiKeyId: keyId,
          status: 'ACTIVE',
        },
      });

      // Create contact in Dinero
      const dineroContactId = await this.dinero.ensureContact({
        name: member.name,
        email: member.email,
        externalRef: `member-${memberNo}`,
      });

      // Create subscription
      const { customerId, subscriptionId } = await this.payment.createSubscription(
        memberNo,
        50000, // 500 DKK in øre
        'monthly',
      );

      // Update member with IDs
      await tx.member.update({
        where: { id: member.id },
        data: {
          dineroContactId,
          paymentCustomerId: customerId,
        },
      });

      // Update application status
      await tx.application.update({
        where: { id: applicationId },
        data: {
          status: 'APPROVED',
          approvedBy,
          approvedAt: new Date(),
        },
      });

      // Log
      await tx.auditLog.create({
        data: {
          actor: approvedBy,
          action: 'APPLICATION_APPROVED',
          entity: 'Application',
          entityId: applicationId,
          payload: { memberId: member.id, memberNo } as any,
        },
      });

      // Send emails
      await this.mail.sendWelcome(member, code);
      await this.mail.sendMunicipality(member, code);

      return { memberId: member.id, memberNo };
    });
  }

  async reject(applicationId: string, rejectedBy: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status !== 'PENDING') {
      throw new BadRequestException('Application already processed');
    }

    // Update application
    await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'REJECTED',
        rejectedBy,
        rejectedAt: new Date(),
      },
    });

    // Send rejection email
    await this.mail.sendRejection(application);

    // Log
    await this.prisma.auditLog.create({
      data: {
        actor: rejectedBy,
        action: 'APPLICATION_REJECTED',
        entity: 'Application',
        entityId: applicationId,
      },
    });

    return { status: 'REJECTED' };
  }
}
