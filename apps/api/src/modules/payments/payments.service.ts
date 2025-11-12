import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DineroService } from '../../integrations/dinero/dinero.service';
import { PaymentService } from '../../integrations/payment/payment.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private dinero: DineroService,
    private payment: PaymentService,
  ) {}

  async handleWebhook(signature: string, rawBody: any) {
    // Verify webhook
    const isValid = this.payment.verifyWebhook(
      signature,
      JSON.stringify(rawBody),
    );

    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Log raw webhook
    await this.prisma.auditLog.create({
      data: {
        actor: 'system',
        action: 'PAYMENT_WEBHOOK_RECEIVED',
        entity: 'Payment',
        entityId: rawBody.id || 'unknown',
        payload: rawBody,
      },
    });

    // Process payment based on event type
    if (rawBody.event === 'payment.succeeded' || rawBody.type === 'payment') {
      await this.processPayment(rawBody);
    }

    return { received: true };
  }

  private async processPayment(data: any) {
    // Extract payment info (adapt to your provider's schema)
    const externalRef = data.reference || data.external_reference;
    const amount = data.amount || 0;
    const paidAt = data.paid_at ? new Date(data.paid_at) : new Date();

    if (!externalRef) {
      this.logger.warn('Payment webhook missing reference');
      return;
    }

    // Find payment by external reference
    const payment = await this.prisma.payment.findFirst({
      where: { externalRef },
      include: { member: true },
    });

    if (!payment) {
      this.logger.warn(`Payment not found for reference: ${externalRef}`);
      return;
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        paid: true,
        paidAt,
        method: data.method || 'card',
      },
    });

    // Book in Dinero if invoice exists
    if (payment.invoiceId) {
      await this.dinero.bookPayment(
        payment.invoiceId,
        amount,
        paidAt,
        externalRef,
      );
    }

    // Log
    await this.prisma.auditLog.create({
      data: {
        actor: 'system',
        action: 'PAYMENT_PROCESSED',
        entity: 'Payment',
        entityId: payment.id,
        payload: { memberNo: payment.member.memberNo, amount },
      },
    });

    this.logger.log(`Payment processed: ${payment.id}`);
  }

  async importFromCSV(csvContent: string) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    const processed = [];
    
    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const [externalRef, amount, date] = lines[i].split(',');
      
      try {
        await this.processPayment({
          reference: externalRef?.trim(),
          amount: parseInt(amount?.trim()),
          paid_at: date?.trim(),
          method: 'bank_transfer',
        });
        processed.push(externalRef);
      } catch (error) {
        this.logger.error(`Failed to process CSV line ${i}: ${(error as Error).message}`);
      }
    }

    return { processed: processed.length };
  }
}
