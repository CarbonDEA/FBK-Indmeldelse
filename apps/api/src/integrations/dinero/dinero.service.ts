import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { env } from '@fbk/config';

interface ContactInput {
  name: string;
  email: string;
  externalRef: string;
}

interface InvoiceInput {
  contactGuid: string;
  amount: number;
  description: string;
  period: { start: Date; end: Date };
}

@Injectable()
export class DineroService {
  private readonly logger = new Logger(DineroService.name);
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.DINERO_API_BASE,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.DINERO_API_KEY}`,
      },
    });
  }

  async ensureContact(input: ContactInput): Promise<string> {
    if (!env.DINERO_API_BASE || !env.DINERO_API_KEY) {
      this.logger.warn('Dinero not configured, returning mock contact ID');
      return `mock-contact-${Date.now()}`;
    }

    try {
      // Try to find existing contact
      const searchResponse = await this.client.get(
        `/${env.DINERO_ORG_ID}/contacts`,
        {
          params: {
            email: input.email,
          },
        },
      );

      if (searchResponse.data.Collection.length > 0) {
        const contactGuid = searchResponse.data.Collection[0].ContactGuid;
        this.logger.log(`Found existing contact: ${contactGuid}`);
        return contactGuid;
      }

      // Create new contact
      const createResponse = await this.client.post(
        `/${env.DINERO_ORG_ID}/contacts`,
        {
          Name: input.name,
          Email: input.email,
          ExternalReference: input.externalRef,
        },
      );

      const contactGuid = createResponse.data.ContactGuid;
      this.logger.log(`Created new contact: ${contactGuid}`);
      return contactGuid;
    } catch (error) {
      this.logger.error('Failed to ensure contact in Dinero', error);
      throw error;
    }
  }

  async createInvoice(input: InvoiceInput): Promise<string> {
    if (!env.DINERO_API_BASE || !env.DINERO_API_KEY) {
      this.logger.warn('Dinero not configured, returning mock invoice ID');
      return `mock-invoice-${Date.now()}`;
    }

    try {
      const response = await this.client.post(
        `/${env.DINERO_ORG_ID}/invoices`,
        {
          ContactGuid: input.contactGuid,
          Date: new Date().toISOString().split('T')[0],
          Description: input.description,
          ProductLines: [
            {
              Description: input.description,
              Quantity: 1,
              Unit: 'stk',
              BaseAmountValue: input.amount / 100, // Convert from øre to kr
            },
          ],
        },
      );

      const invoiceGuid = response.data.Guid;
      this.logger.log(`Created invoice: ${invoiceGuid}`);
      return invoiceGuid;
    } catch (error) {
      this.logger.error('Failed to create invoice in Dinero', error);
      throw error;
    }
  }

  async bookPayment(
    invoiceGuid: string,
    amount: number,
    date: Date,
    ref: string,
  ): Promise<void> {
    if (!env.DINERO_API_BASE || !env.DINERO_API_KEY) {
      this.logger.warn('Dinero not configured, skipping payment booking');
      return;
    }

    try {
      await this.client.post(
        `/${env.DINERO_ORG_ID}/invoices/${invoiceGuid}/book`,
        {
          Date: date.toISOString().split('T')[0],
          PaymentAccount: 1920, // Default payment account
          Amount: amount / 100, // Convert from øre to kr
          ExternalReference: ref,
        },
      );

      this.logger.log(`Booked payment for invoice ${invoiceGuid}`);
    } catch (error) {
      this.logger.error('Failed to book payment in Dinero', error);
      throw error;
    }
  }
}
