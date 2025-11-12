import { Injectable, Logger } from '@nestjs/common';
import { render } from '@react-email/components';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import {
  WelcomeEmail,
  MunicipalityEmail,
  BoardApprovalEmail,
  RejectionEmail,
  TerminationEmail,
} from '@fbk/email';
import { env } from '@fbk/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor() {
    if (env.RESEND_API_KEY) {
      // Use Resend
      this.transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
          user: 'resend',
          pass: env.RESEND_API_KEY,
        },
      });
    } else if (env.SMTP_HOST) {
      // Use custom SMTP
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT || 587,
        secure: env.SMTP_PORT === 465,
        auth: env.SMTP_USER && env.SMTP_PASS ? {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        } : undefined,
      });
    } else {
      this.logger.warn('No email service configured');
    }
  }

  async sendWelcome(
    member: { name: string; email: string; memberNo: number },
    doorCode: string,
  ): Promise<void> {
    const html = await render(
      WelcomeEmail({
        name: member.name,
        memberNo: member.memberNo,
        doorCode,
      }),
    );

    await this.sendMail({
      to: member.email,
      subject: `Velkommen til Billardklubben – Medlemsnr. ${member.memberNo}`,
      html,
    });

    this.logger.log(`Welcome email sent to ${member.email}`);
  }

  async sendMunicipality(
    member: { name: string; memberNo: number },
    doorCode: string,
  ): Promise<void> {
    const html = await render(
      MunicipalityEmail({
        name: member.name,
        memberNo: member.memberNo,
        doorCode,
        joinedDate: new Date().toLocaleDateString('da-DK'),
      }),
    );

    // Send to board approvers (could be different in production)
    const boardEmails = env.BOARD_APPROVER_EMAILS.split(',');

    await this.sendMail({
      to: boardEmails[0], // Primary recipient
      subject: `Adgang – ${member.name} (medlemsnr. ${member.memberNo})`,
      html,
    });

    this.logger.log(`Municipality email sent for member ${member.memberNo}`);
  }

  async sendBoardApprovalLinks(
    application: { id: string; dataJson: any },
    approveUrl: string,
    rejectUrl: string,
  ): Promise<void> {
    const data = application.dataJson;
    const html = await render(
      BoardApprovalEmail({
        applicantName: data.name,
        applicantEmail: data.email,
        applicantPhone: data.phone,
        notes: data.notes,
        approveUrl,
        rejectUrl,
      }),
    );

    const boardEmails = env.BOARD_APPROVER_EMAILS.split(',');

    await this.sendMail({
      to: boardEmails,
      subject: `Ny indmeldingsanmodning fra ${data.name}`,
      html,
    });

    this.logger.log(`Board approval email sent for application ${application.id}`);
  }

  async sendRejection(application: { dataJson: any }): Promise<void> {
    const data = application.dataJson;
    const html = await render(
      RejectionEmail({
        name: data.name,
      }),
    );

    await this.sendMail({
      to: data.email,
      subject: 'Vedr. indmeldelse i Billardklubben',
      html,
    });

    this.logger.log(`Rejection email sent to ${data.email}`);
  }

  async sendTermination(
    member: { name: string; email: string; memberNo: number },
  ): Promise<void> {
    const html = await render(
      TerminationEmail({
        name: member.name,
        memberNo: member.memberNo,
        terminationDate: new Date().toLocaleDateString('da-DK'),
      }),
    );

    await this.sendMail({
      to: member.email,
      subject: 'Bekræftelse på udmeldelse fra Billardklubben',
      html,
    });

    this.logger.log(`Termination email sent to ${member.email}`);
  }

  private async sendMail(options: {
    to: string | string[];
    subject: string;
    html: string;
  }): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Email not configured, skipping send');
      this.logger.debug(`Would send: ${options.subject} to ${options.to}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: env.MAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
    } catch (error) {
      this.logger.error('Failed to send email', error);
      throw error;
    }
  }
}
