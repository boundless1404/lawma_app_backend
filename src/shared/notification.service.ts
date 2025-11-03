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
   * Queue a billing notification (SMS only for customers)
   */
  async queueBillingNotification(params: {
    entityProfileId: string;
    recipientPhone?: string;
    recipientEmail?: string;
    recipientName: string;
    amount: number;
    month: string;
    year: string;
    propertyAddress: string;
    channel?: NotificationChannel;
  }): Promise<NotificationQueue> {
    // Truncate name and address to keep SMS under 160 characters
    const name = this.truncateString(params.recipientName, 20);
    const address = this.truncateString(params.propertyAddress, 30);

    // SMS message format: ~130-150 characters
    const message = `Dear ${name}, your LAWMA bill for ${params.month} ${
      params.year
    } is ₦${params.amount.toLocaleString()}. Property: ${address}. Thank you.`;

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
        month: params.month,
        year: params.year,
        propertyAddress: params.propertyAddress,
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
      // Get entity profile with preferences
      const entityProfile = await this.dataSource.manager.findOne(
        EntityProfile,
        {
          where: { id: notification.entityProfileId },
          relations: ['entityProfilePreference'],
        },
      );

      if (!entityProfile) {
        throw new Error(
          `Entity profile ${notification.entityProfileId} not found`,
        );
      }

      const preferences = entityProfile.entityProfilePreference;
      const promises: Promise<any>[] = [];
      let smsSent = false;

      // Send SMS if enabled and phone is available
      if (
        (notification.channel === NotificationChannel.SMS ||
          notification.channel === NotificationChannel.BOTH) &&
        notification.recipientPhone &&
        preferences?.enableSmsNotifications
      ) {
        // Check SMS units before sending
        if (entityProfile.smsUnits <= 0) {
          this.logger.warn(
            `Entity ${entityProfile.name} has insufficient SMS units (${entityProfile.smsUnits}). Skipping SMS.`,
          );
        } else {
          // Deduct SMS unit first (atomically)
          const updateResult = await this.dataSource.manager
            .createQueryBuilder()
            .update('entity_profile')
            .set({ smsUnits: () => 'sms_units - 1' })
            .where('id = :id AND sms_units > 0', { id: entityProfile.id })
            .execute();

          if (updateResult.affected > 0) {
            promises.push(
              this.termiiService.sendSms({
                to: notification.recipientPhone,
                sms: notification.message,
                channel: 'generic',
              }),
            );
            smsSent = true;
          } else {
            this.logger.warn(
              `Could not deduct SMS unit for entity ${entityProfile.name}. Concurrent update or no units.`,
            );
          }
        }
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
        await this.dataSource.manager.update(
          NotificationQueue,
          { id: notification.id },
          {
            status: NotificationStatus.FAILED,
            errorMessage: 'Notifications disabled or no SMS units available',
          },
        );
        return;
      }

      await Promise.all(promises);

      // Mark as sent
      await this.dataSource.manager.update(
        NotificationQueue,
        { id: notification.id },
        {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
          smsUnitDeducted: smsSent,
        },
      );

      this.logger.log(
        `Successfully sent notification ${notification.id} to ${notification.recipientName}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send notification ${notification.id}: ${error.message}`,
      );

      // Update retry count and error message
      await this.dataSource.manager.update(
        NotificationQueue,
        { id: notification.id },
        {
          retryCount: notification.retryCount + 1,
          errorMessage: error.message,
          status:
            notification.retryCount + 1 >= 3
              ? NotificationStatus.FAILED
              : NotificationStatus.PENDING,
        },
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
