import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface ResendEmailPayload {
  from: string; // Sender email (must be verified domain)
  to: string | string[]; // Recipient email(s)
  subject: string;
  html?: string; // HTML content
  text?: string; // Plain text content
  cc?: string | string[];
  bcc?: string | string[];
  reply_to?: string;
  attachments?: Array<{
    filename: string;
    content: string; // Base64 encoded
  }>;
  tags?: Array<{
    name: string;
    value: string;
  }>;
}

export interface ResendEmailResponse {
  id: string;
}

@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly fromEmail: string;

  constructor(private configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('RESEND_BASE_URL') ||
      'https://api.resend.com';
    this.apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail =
      this.configService.get<string>('RESEND_FROM_EMAIL') ||
      'WastePro Notifications <noreply@exchange.boundlesedge.com>';

    if (!this.apiKey) {
      this.logger.warn('RESEND_API_KEY is not configured');
    }
  }

  async sendEmail(
    payload: Partial<ResendEmailPayload>,
  ): Promise<ResendEmailResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Resend API key is not configured');
      }

      const data = {
        from: payload.from || this.fromEmail,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        ...(payload.cc && { cc: payload.cc }),
        ...(payload.bcc && { bcc: payload.bcc }),
        ...(payload.reply_to && { reply_to: payload.reply_to }),
        ...(payload.attachments && { attachments: payload.attachments }),
        ...(payload.tags && { tags: payload.tags }),
      };

      this.logger.log(
        `Sending email to ${
          Array.isArray(payload.to) ? payload.to.join(', ') : payload.to
        }`,
      );

      const response = await axios.post(`${this.baseUrl}/emails`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      this.logger.log(`Email sent successfully: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      if (error.response) {
        this.logger.error(
          `Response data: ${JSON.stringify(error.response.data)}`,
        );
      }
      throw error;
    }
  }

  async sendBulkEmails(
    emails: Partial<ResendEmailPayload>[],
  ): Promise<ResendEmailResponse[]> {
    const results: ResendEmailResponse[] = [];

    for (const email of emails) {
      try {
        const result = await this.sendEmail(email);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to send email: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Send billing notification email
   */
  async sendBillingNotification(
    to: string,
    customerName: string,
    amount: number,
    month: string,
    year: string,
    propertyAddress: string,
  ): Promise<ResendEmailResponse> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2c5f2d; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .amount { font-size: 24px; color: #2c5f2d; font-weight: bold; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>LAWMA Billing Notification</h1>
            </div>
            <div class="content">
              <h2>Dear ${customerName},</h2>
              <p>Your waste management bill for <strong>${month} ${year}</strong> has been generated.</p>
              <p><strong>Property:</strong> ${propertyAddress}</p>
              <p><strong>Amount Due:</strong> <span class="amount">₦${amount.toLocaleString()}</span></p>
              <p>Please ensure payment is made before the due date to avoid service interruption.</p>
              <p>Thank you for your cooperation.</p>
            </div>
            <div class="footer">
              <p>Lagos State Waste Management Authority (LAWMA)</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: `LAWMA Bill - ${month} ${year}`,
      html,
      tags: [
        { name: 'type', value: 'billing' },
        { name: 'month', value: month },
        { name: 'year', value: year },
      ],
    });
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(
    to: string,
    customerName: string,
    amount: number,
    reference: string,
    propertyAddress: string,
  ): Promise<ResendEmailResponse> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2c5f2d; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .amount { font-size: 24px; color: #2c5f2d; font-weight: bold; }
            .success { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Received</h1>
            </div>
            <div class="content">
              <div class="success">
                <h2>✓ Payment Successful</h2>
              </div>
              <h2>Dear ${customerName},</h2>
              <p>We have received your payment. Thank you!</p>
              <p><strong>Amount Paid:</strong> <span class="amount">₦${amount.toLocaleString()}</span></p>
              <p><strong>Reference:</strong> ${reference}</p>
              <p><strong>Property:</strong> ${propertyAddress}</p>
              <p>Your payment has been applied to your account.</p>
            </div>
            <div class="footer">
              <p>Lagos State Waste Management Authority (LAWMA)</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject: `Payment Confirmation - ${reference}`,
      html,
      tags: [
        { name: 'type', value: 'payment' },
        { name: 'reference', value: reference },
      ],
    });
  }
}
