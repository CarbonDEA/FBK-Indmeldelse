import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { env } from '@fbk/config';

@Injectable()
export class UnifiService {
  private readonly logger = new Logger(UnifiService.name);
  private client: AxiosInstance;
  private sessionToken?: string;

  constructor() {
    this.client = axios.create({
      baseURL: env.UNIFI_BASE_URL,
      timeout: 10000,
    });
  }

  async login(): Promise<void> {
    if (!env.UNIFI_BASE_URL || !env.UNIFI_USERNAME || !env.UNIFI_PASSWORD) {
      this.logger.warn('Unifi credentials not configured');
      return;
    }

    try {
      const response = await this.client.post('/auth/login', {
        username: env.UNIFI_USERNAME,
        password: env.UNIFI_PASSWORD,
      });
      
      this.sessionToken = response.data.token;
      this.logger.log('Unifi session established');
    } catch (error) {
      this.logger.error('Unifi login failed', error);
      throw error;
    }
  }

  async createAccessKey(label: string): Promise<{ code: string; keyId: string }> {
    if (!env.UNIFI_BASE_URL) {
      this.logger.warn('Unifi not configured, returning mock access key');
      return {
        code: this.generateMockCode(),
        keyId: `mock-${Date.now()}`,
      };
    }

    if (!this.sessionToken) {
      await this.login();
    }

    try {
      const response = await this.client.post(
        `/s/${env.UNIFI_SITE}/access-keys`,
        {
          name: label,
          type: 'pin',
        },
        {
          headers: {
            Authorization: `Bearer ${this.sessionToken}`,
          },
        },
      );

      return {
        code: response.data.code,
        keyId: response.data.id,
      };
    } catch (error) {
      this.logger.error('Failed to create access key', error);
      throw error;
    }
  }

  async revokeAccessKey(keyId: string): Promise<void> {
    if (!env.UNIFI_BASE_URL) {
      this.logger.warn('Unifi not configured, skipping revoke');
      return;
    }

    if (!this.sessionToken) {
      await this.login();
    }

    try {
      await this.client.delete(`/s/${env.UNIFI_SITE}/access-keys/${keyId}`, {
        headers: {
          Authorization: `Bearer ${this.sessionToken}`,
        },
      });
      
      this.logger.log(`Access key ${keyId} revoked`);
    } catch (error) {
      this.logger.error('Failed to revoke access key', error);
      throw error;
    }
  }

  private generateMockCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
