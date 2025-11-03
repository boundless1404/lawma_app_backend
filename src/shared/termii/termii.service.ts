import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface TermiiSmsPayload {
  to: string | string[]; // Single number or array of numbers (max 100)
  from: string; // Sender ID (3-11 characters)
  sms: string; // Message content
  type: 'plain' | 'unicode' | 'encrypted' | 'Voice';
  channel: 'dnd' | 'generic' | 'whatsapp' | 'voice';
  // Optional for encrypted messages
  algorithm?: string;
  secretKey?: string;
}

export interface TermiiSmsResponse {
  message_id: string;
  message: string;
  balance: number;
  user: string;
}

@Injectable()
export class TermiiService {
  private readonly logger = new Logger(TermiiService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly senderId: string;

  constructor(private configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('TERMII_BASE_URL') ||
      'https://api.ng.termii.com';
    this.apiKey = this.configService.get<string>('TERMII_API_KEY');
    this.senderId =
      this.configService.get<string>('TERMII_SENDER_ID') || 'LAWMA';

    if (!this.apiKey) {
      this.logger.warn('TERMII_API_KEY is not configured');
    }
  }

  async sendSms(
    payload: Partial<TermiiSmsPayload>,
  ): Promise<TermiiSmsResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Termii API key is not configured');
      }

      const data = {
        to: payload.to,
        from: payload.from || this.senderId,
        sms: payload.sms,
        type: payload.type || 'plain',
        api_key: this.apiKey,
        channel: payload.channel || 'generic',
        ...(payload.algorithm && { algorithm: payload.algorithm }),
        ...(payload.secretKey && { secret_key: payload.secretKey }),
      };

      this.logger.log(
        `Sending SMS to ${
          Array.isArray(payload.to) ? payload.to.join(', ') : payload.to
        }`,
      );

      const response = await axios.post(`${this.baseUrl}/api/sms/send`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(`SMS sent successfully: ${response.data.message_id}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`, error.stack);
      if (error.response) {
        this.logger.error(
          `Response data: ${JSON.stringify(error.response.data)}`,
        );
      }
      throw error;
    }
  }

  async sendBulkSms(
    recipients: string[],
    message: string,
    options?: Partial<TermiiSmsPayload>,
  ): Promise<TermiiSmsResponse[]> {
    // Termii accepts max 100 numbers at a time
    const chunks = this.chunkArray(recipients, 100);
    const results: TermiiSmsResponse[] = [];

    for (const chunk of chunks) {
      try {
        const result = await this.sendSms({
          to: chunk,
          sms: message,
          ...options,
        });
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to send to chunk: ${error.message}`);
      }
    }

    return results;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
