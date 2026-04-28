import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, LessThan } from 'typeorm';
import {
  NotificationQueue,
  NotificationType,
  NotificationChannel,
  NotificationStatus,
} from './notificationQueue.entity';
import { TermiiService } from './termii/termii.service';
import { ResendService } from './resend/resend.service';
import { EntityProfile } from '../utils-billing/entitties/entityProfile.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private dataSource: DataSource,
    private termiiService: TermiiService,
    private resendService: ResendService,
  ) {}

  /**
   * Truncate string to fit within character limit
   */
  private truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  }

  /**
   * Format phone number to international format for Termii
   */
  private formatPhoneNumber(phone: string): string {
    if (!phone) return phone;
    
    // Remove any spaces, dashes, or parentheses
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // If it starts with 0, replace with +234 (Nigeria)
    if (cleaned.startsWith('0')) {
      return '+234' + cleaned.substring(1);
    }
    
    // If it starts with 234, add +
    if (cleaned.startsWith('234')) {
      return '+' + cleaned;
    }
    
    // If it already starts with +, return as is
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    
    // Default: assume it's a Nigerian number without country code
    return '+234' + cleaned;
  }

  /**
   * Queue a billing notification (SMS only for customers)
   */
  async queueBillingNotification(params: {
    entityProfileId: string;
    recipientPhone?: string;
    recipientEmail?: string;
    recipientName: string;
    amount: number;
    arrears: number;
    totalBilling: number;
    month: string;
    year: string;
    propertyAddress: string;
    companyName: string;
    channel?: NotificationChannel;
  }): Promise<NotificationQueue> {
    // Format amounts
    const formatAmt = (amt: number) => amt.toLocaleString('en-US', { maximumFractionDigits: 0 });
    
    // Truncate company name to fit message
    const company = this.truncateString(params.companyName, 15);
    
    // SMS message format: Keep under 160 characters
    // Format: "Bill ₦X, Arrears ₦Y, Total ₦Z for [Month] via wastepro for [Company]"
    const message = `Bill ₦${formatAmt(params.amount)}, Arrears ₦${formatAmt(params.arrears)}, Total ₦${formatAmt(params.totalBilling)} for ${params.month} via wastepro for ${company}`;

    const notification = this.dataSource.manager.create(NotificationQueue, {
      type: NotificationType.BILLING_GENERATED,
      channel: NotificationChannel.SMS, // Always SMS for customer billing
      entityProfileId: params.entityProfileId,
      recipientPhone: params.recipientPhone,
      recipientEmail: null, // No email for billing notifications
      recipientName: params.recipientName,
      message,
      metadata: {
        amount: params.amount,
        arrears: params.arrears,
        totalBilling: params.totalBilling,
        month: params.month,
        year: params.year,
        propertyAddress: params.propertyAddress,
        companyName: params.companyName,
      },
      status: NotificationStatus.PENDING,
      smsUnitDeducted: false,
    });

    return await this.dataSource.manager.save(notification);
  }

  /**
   * Queue a payment confirmation notification
   * - SMS only for customers
   * - Email only for waste operators
   */
  async queuePaymentNotification(params: {
    entityProfileId: string;
    recipientPhone?: string;
    recipientEmail?: string;
    recipientName: string;
    amount: number;
    reference: string;
    propertyAddress: string;
    channel?: NotificationChannel;
    // For waste operator notification
    isForOperator?: boolean;
    operatorName?: string;
  }): Promise<NotificationQueue> {
    let message: string;
    let channel: NotificationChannel;
    let recipientPhone: string | null = null;
    let recipientEmail: string | null = null;

    if (params.isForOperator) {
      // Operator gets EMAIL only
      channel = NotificationChannel.EMAIL;
      recipientEmail = params.recipientEmail;
      // Full message for email (no character limit)
      message = `Payment received: ₦${params.amount.toLocaleString()} from ${
        params.recipientName
      }. Reference: ${params.reference}. Property: ${params.propertyAddress}.`;
    } else {
      // Customer gets SMS only
      channel = NotificationChannel.SMS;
      recipientPhone = params.recipientPhone;
      // Truncate for SMS (keep under 160 characters)
      const truncatedRef = this.truncateString(params.reference, 20);
      // SMS message format: ~120-140 characters
      message = `Dear ${
        params.recipientName
      }, your payment of ₦${params.amount.toLocaleString()} received. Ref: ${truncatedRef}. Thank you!`;
    }

    const notification = this.dataSource.manager.create(NotificationQueue, {
      type: params.isForOperator
        ? NotificationType.PAYMENT_CONFIRMED
        : NotificationType.PAYMENT_RECEIVED,
      channel,
      entityProfileId: params.entityProfileId,
      recipientPhone,
      recipientEmail,
      recipientName: params.recipientName,
      message,
      metadata: {
        amount: params.amount,
        reference: params.reference,
        propertyAddress: params.propertyAddress,
        isForOperator: params.isForOperator,
      },
      status: NotificationStatus.PENDING,
      smsUnitDeducted: false,
    });

    return await this.dataSource.manager.save(notification);
  }

  /**
   * Process pending notifications (runs every 5 minutes)
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async processPendingNotifications() {
    this.logger.log('Processing pending notifications...');

    try {
      const notifications = await this.dataSource.manager.find(
        NotificationQueue,
        {
          where: {
            status: NotificationStatus.PENDING,
            retryCount: LessThan(3), // Max 3 retries
          },
          take: 50, // Process 50 at a time
        },
      );

      this.logger.log(`Found ${notifications.length} pending notifications`);

      for (const notification of notifications) {
        await this.processNotification(notification);
      }
    } catch (error) {
      this.logger.error(
        `Error processing notifications: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Process a single notification
   */
  private async processNotification(
    notification: NotificationQueue,
  ): Promise<void> {
    try {
      this.logger.log(`[DEBUG] Processing notification ${notification.id} for entity ${notification.entityProfileId}`);
      
      // Get entity profile with preferences using raw query to avoid TypeORM issues
      const entityProfiles = await this.dataSource.query(
        `SELECT 
          ep.id, ep.name, 
          epp."enableSmsNotifications", 
          epp."enableEmailNotifications" 
         FROM entity_profile ep
         LEFT JOIN entity_profile_preference epp ON ep.id = epp."entityProfileId"
         WHERE ep.id = $1`,
        [notification.entityProfileId],
      );

      if (entityProfiles.length === 0) {
        throw new Error(
          `Entity profile ${notification.entityProfileId} not found`,
        );
      }

      const entityProfile = entityProfiles[0];
      this.logger.log(`[DEBUG] Found entity profile: ${entityProfile.name}`);

      const preferences = {
        enableSmsNotifications: entityProfile.enableSmsNotifications,
        enableEmailNotifications: entityProfile.enableEmailNotifications,
      };
      const promises: Promise<any>[] = [];
      let smsSent = false;

      // Send SMS if phone is available (bypassing enableSmsNotifications and smsUnits checks for testing)
      if (
        (notification.channel === NotificationChannel.SMS ||
          notification.channel === NotificationChannel.BOTH) &&
        notification.recipientPhone
      ) {
        // Format phone number to international format
        const formattedPhone = this.formatPhoneNumber(notification.recipientPhone);
        
        // Always send SMS regardless of units or preferences (for testing)
        promises.push(
          this.termiiService.sendSms({
            to: formattedPhone,
            sms: notification.message,
            channel: 'generic',
          }),
        );
        smsSent = true;
        this.logger.log(
          `[SMS BYPASS MODE] Sending SMS to ${formattedPhone} (original: ${notification.recipientPhone}) without checking units or preferences`,
        );
      }

      // Send Email if enabled and email is available
      if (
        (notification.channel === NotificationChannel.EMAIL ||
          notification.channel === NotificationChannel.BOTH) &&
        notification.recipientEmail &&
        preferences?.enableEmailNotifications
      ) {
        if (notification.type === NotificationType.BILLING_GENERATED) {
          promises.push(
            this.resendService.sendBillingNotification(
              notification.recipientEmail,
              notification.recipientName,
              notification.metadata.amount,
              notification.metadata.month,
              notification.metadata.year,
              notification.metadata.propertyAddress,
            ),
          );
        } else if (
          notification.type === NotificationType.PAYMENT_RECEIVED ||
          notification.type === NotificationType.PAYMENT_CONFIRMED
        ) {
          promises.push(
            this.resendService.sendPaymentConfirmation(
              notification.recipientEmail,
              notification.recipientName,
              notification.metadata.amount,
              notification.metadata.reference,
              notification.metadata.propertyAddress,
            ),
          );
        }
      }

      if (promises.length === 0) {
        this.logger.warn(
          `No notifications sent for ${notification.id}. SMS disabled, no units, or email disabled.`,
        );
        // Mark as failed if nothing was sent
        await this.dataSource.query(
          `UPDATE notification_queue 
           SET status = $1, "errorMessage" = $2 
           WHERE id = $3`,
          [NotificationStatus.FAILED, 'Notifications disabled or no SMS units available', notification.id],
        );
        return;
      }

      await Promise.all(promises);

      // Mark as sent
      await this.dataSource.query(
        `UPDATE notification_queue 
         SET status = $1, "sentAt" = $2, "smsUnitDeducted" = $3 
         WHERE id = $4`,
        [NotificationStatus.SENT, new Date(), smsSent, notification.id],
      );

      this.logger.log(
        `Successfully sent notification ${notification.id} to ${notification.recipientName}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send notification ${notification.id}: ${error.message}`,
      );

      // Update retry count and error message
      const newRetryCount = notification.retryCount + 1;
      const newStatus = newRetryCount >= 3 ? NotificationStatus.FAILED : NotificationStatus.PENDING;
      
      await this.dataSource.query(
        `UPDATE notification_queue 
         SET "retryCount" = $1, "errorMessage" = $2, status = $3 
         WHERE id = $4`,
        [newRetryCount, error.message, newStatus, notification.id],
      );
    }
  }

  /**
   * Determine channel based on available contact info
   */
  private determineChannel(params: {
    recipientPhone?: string;
    recipientEmail?: string;
  }): NotificationChannel {
    const hasPhone = !!params.recipientPhone;
    const hasEmail = !!params.recipientEmail;

    if (hasPhone && hasEmail) return NotificationChannel.BOTH;
    if (hasPhone) return NotificationChannel.SMS;
    if (hasEmail) return NotificationChannel.EMAIL;

    return NotificationChannel.SMS; // Default
  }
}
