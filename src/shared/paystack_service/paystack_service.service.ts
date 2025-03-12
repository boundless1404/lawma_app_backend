import { Injectable } from '@nestjs/common';
import { RequestService } from '../request/request.service';
import { ConfigService } from '@nestjs/config';
import {
  DedicatedVirtualAccountUserData,
  PaystackCustomer,
  PaystackWebhookData,
  SingleStepDVAUserData,
} from '@/src/lib/types';
import { PAYSTACK_SECRET_ENV } from '@/src/lib/projectConstants';
import { createHmac } from 'crypto';

// Extend the types to include transfer-related interfaces
interface PaystackTransferRecipient {
  type?: 'nuban'; // Bank account type
  name: string;
  account_number: string;
  bank_code: string;
  currency?: string;
}

interface PaystackTransferRequest {
  source?: string; // Transfer source (balance, typically)
  amount: number; // Amount in kobo (smallest currency unit)
  recipient?: string; // Optional Recipient code from create recipient API
  reason?: string; // Optional transfer reason
  reference: string;
}

@Injectable()
export class PaystackServiceService {
  constructor(
    private readonly requestService: RequestService,
    private configService: ConfigService,
  ) {
    this.baseURL = 'https://api.paystack.co';
    this.paystack_secret = this.configService.getOrThrow(PAYSTACK_SECRET_ENV);
  }

  baseURL: string;
  paystack_secret: string;

  /**
   * Gets basic request headers. Whether or not additonal headers are passed in,
   * an header object that includes authorization and content-type are returned
   * @param additionalHeaders Additional headers to pass in.
   * You may also override the authorization and content-type headers.
   * @returns Header object with at least the authorization and content-type.
   */
  private getHeaders(additionalHeaders?: Record<string, unknown>) {
    return {
      Authorization: `Bearer ${this.paystack_secret}`,
      'Content-Type': 'application/json',
      ...(additionalHeaders ? additionalHeaders : {}),
    };
  }

  async validatePaystackWebhookEvent(
    webhookSignature: string,
    eventData: Record<string, unknown>,
  ) {
    const paystack_secret = this.configService.get(PAYSTACK_SECRET_ENV);
    const hash = createHmac('sha512', paystack_secret)
      .update(JSON.stringify(eventData))
      .digest('hex');
    const isValid = hash === webhookSignature;
    return isValid;
  }

  async checkIsVirtualBankAccoountPayment(data: PaystackWebhookData) {
    const receivingBank = data.authorization.receiver_bank;
    const receivingBankAccount =
      data.authorization.receiver_bank_account_number;
    const isVirtualBankAccountPayment =
      !!receivingBank && !!receivingBankAccount;
    return isVirtualBankAccountPayment;
  }

  async createDedicatedVirtualAccount(
    dvaUserData: DedicatedVirtualAccountUserData,
  ) {
    const api_path = '/dedicated_account/assign';
    return (await this.requestService
      .setup(api_path, this.getHeaders())
      .send('POST', dvaUserData, this.baseURL)) as {
      status: boolean;
      message: string;
    };
  }

  async createDedicatedVirtualAccountSingleStep(data: SingleStepDVAUserData) {
    const api_path = '/dedicated_account/assign';
    return (
      (await this.requestService
        // .setOrUseDefaultBaseUrl(this.baseURL)
        .setup(api_path, this.getHeaders())
        .send('POST', data, this.baseURL)) as {
        status: boolean;
        message: string;
      }
    );
  }

  async createCustomer(userData: PaystackCustomer) {
    const api_path = '/customers';
    return (await this.requestService
      .setup(api_path, this.getHeaders())
      .send('POST', userData, this.baseURL)) as {
      data: { customer_code: string } & Record<string, unknown>;
    } & Record<string, unknown>;
  }

  /**
   * Create a transfer recipient
   * @param recipientData Details of the bank account to receive the transfer
   * @returns Recipient code and other details
   */
  async createTransferRecipient(recipientData: PaystackTransferRecipient) {
    const api_path = '/transferrecipient';
    return (await this.requestService
      .setup(api_path, this.getHeaders())
      .send(
        'POST',
        { ...recipientData, type: 'nuban' } as unknown as Record<
          string,
          unknown
        >,
        this.baseURL,
      )) as {
      status: boolean;
      message: string;
      data: {
        recipient_code: string;
        details: {
          account_number: string;
          account_name: string;
          bank_code: string;
          bank_name: string;
        };
      };
    };
  }

  /**
   * Initiate a transfer to a previously created recipient
   * @param transferData Transfer details including amount and recipient
   * @returns Transfer initiation response
   */
  async initiateTransfer(transferData: PaystackTransferRequest) {
    const api_path = '/transfer';
    return (await this.requestService
      .setup(api_path, this.getHeaders())
      .send(
        'POST',
        { ...transferData, source: 'balance' } as unknown as Record<
          string,
          unknown
        >,
        this.baseURL,
      )) as {
      status: boolean;
      message: string;
      data: {
        transfer_code: string;
        id: number;
        amount: number;
        currency: string;
        status: 'pending' | 'success' | 'failed';
      };
    };
  }

  // create transfer recipient
  // initiate transfer
  async makeTransfer(
    transferData: PaystackTransferRequest & PaystackTransferRecipient,
  ) {
    const recipient = await this.createTransferRecipient(transferData);
    const transfer = await this.initiateTransfer({
      ...transferData,
      recipient: recipient.data.recipient_code,
    });
    return transfer;
  }
}
