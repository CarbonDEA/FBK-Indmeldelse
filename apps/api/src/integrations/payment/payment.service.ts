import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';
import { env } from '@fbk/config';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.PAYMENT_API_BASE,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.PAYMENT_API_KEY}`,
      },
    });
  }

  async createSubscription(
    memberNo: number,
    amount: number,
    interval: string,
  ): Promise<{ customerId: string; subscriptionId: string }> {
    if (!env.PAYMENT_API_BASE || !env.PAYMENT_API_KEY) {
      this.logger.warn('Payment provider not configured, returning mock subscription');
      return {
        customerId: `mock-customer-${memberNo}`,
        subscriptionId: `mock-sub-${Date.now()}`,
      };
    }

    try {
      const response = await this.client.post('/subscriptions', {
        customer_reference: memberNo.toString(),
        amount: amount,
        interval: interval,
        currency: 'DKK',
      });

      return {
        customerId: response.data.customer_id,
        subscriptionId: response.data.subscription_id,
      };
    } catch (error) {
      this.logger.error('Failed to create subscription', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    if (!env.PAYMENT_API_BASE || !env.PAYMENT_API_KEY) {
      this.logger.warn('Payment provider not configured, skipping cancellation');
      return;
    }

    try {
      await this.client.post(`/subscriptions/${subscriptionId}/cancel`);
      this.logger.log(`Subscription ${subscriptionId} cancelled`);
    } catch (error) {
      this.logger.error('Failed to cancel subscription', error);
      throw error;
    }
  }

  verifyWebhook(signature: string, rawBody: string): boolean {
    if (!env.PAYMENT_WEBHOOK_SECRET) {
      this.logger.warn('Webhook secret not configured, skipping verification');
      return true; // Allow in dev/test
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', env.PAYMENT_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      );
    } catch (error) {
      this.logger.error('Webhook verification failed', error);
      return false;
    }
  }
}
