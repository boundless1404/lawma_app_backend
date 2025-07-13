import { DataSource } from 'typeorm';
import { Notification } from '../../../utils-billing/entitties/notification.entity';
import { NotificationType } from '../../../lib/types';

export default class NotificationSeeds {
  public async run(dataSource: DataSource): Promise<any> {
    const notificationRepository = dataSource.getRepository(Notification);

    // Check if notifications already exist for this property subscription
    const existingNotifications = await notificationRepository.findOne({
      where: {
        propertySubscriptionId: '1654',
        entityProfileId: '1',
      },
    });

    if (existingNotifications) {
      console.log(
        'Notifications for property subscription 1654 already exist, skipping seed',
      );
      return;
    }

    const notifications = [
      {
        title: 'Welcome to LAWMA Waste Management',
        description:
          'Welcome to the Lagos State Waste Management Authority digital platform. You can now view your bills, make payments, and track your waste collection schedule online.',
        type: 'system' as NotificationType,
        isRead: false,
        actionText: 'View Dashboard',
        actionUrl: '/sc/dashboard',
        entityProfileId: '1',
        propertySubscriptionId: '1654',
        relatedEntityType: 'system',
      },
      {
        title: 'New Invoice Generated',
        description:
          'Your waste management invoice for January 2025 has been generated. Please review and make payment by the due date to avoid penalties.',
        type: 'invoice' as NotificationType,
        isRead: false,
        actionText: 'View Invoice',
        actionUrl: '/sc/billing',
        entityProfileId: '1',
        propertySubscriptionId: '1654',
        relatedEntityType: 'billing',
      },
      {
        title: 'Payment Reminder',
        description:
          'This is a friendly reminder that your payment for December 2024 is due. Please make payment to avoid service interruption.',
        type: 'alert' as NotificationType,
        isRead: false,
        actionText: 'Make Payment',
        actionUrl: '/sc/billing',
        entityProfileId: '1',
        propertySubscriptionId: '1654',
        relatedEntityType: 'billing',
      },
      {
        title: 'Payment Received',
        description:
          'Thank you! We have successfully received your payment of ₦15,000 for November 2024. Your account has been updated.',
        type: 'payment' as NotificationType,
        isRead: true,
        actionText: 'View Payment History',
        actionUrl: '/sc/payments',
        entityProfileId: '1',
        propertySubscriptionId: '1654',
        relatedEntityType: 'payment',
      },
      {
        title: 'Service Update: Collection Schedule Change',
        description:
          'Due to the holiday season, waste collection in your area has been rescheduled. Collection will now occur on Wednesdays and Saturdays.',
        type: 'update' as NotificationType,
        isRead: false,
        actionText: 'View Schedule',
        actionUrl: '/sc/dashboard',
        entityProfileId: '1',
        propertySubscriptionId: '1654',
        relatedEntityType: 'system',
      },
      {
        title: 'Account Verification Complete',
        description:
          'Your account verification has been completed successfully. You now have full access to all platform features.',
        type: 'system' as NotificationType,
        isRead: true,
        actionText: 'View Profile',
        actionUrl: '/sc/profile',
        entityProfileId: '1',
        propertySubscriptionId: '1654',
        relatedEntityType: 'system',
      },
      {
        title: 'Outstanding Balance Alert',
        description:
          'You have an outstanding balance of ₦45,000 across multiple months. Please make payment to avoid service suspension.',
        type: 'alert' as NotificationType,
        isRead: false,
        actionText: 'View Bills',
        actionUrl: '/sc/billing',
        entityProfileId: '1',
        propertySubscriptionId: '1654',
        relatedEntityType: 'billing',
      },
      {
        title: 'New Feature: Virtual Account',
        description:
          'You can now use your dedicated virtual account number for automatic payment processing. Check your billing page for details.',
        type: 'update' as NotificationType,
        isRead: false,
        actionText: 'View Virtual Account',
        actionUrl: '/sc/billing',
        entityProfileId: '1',
        propertySubscriptionId: '1654',
        relatedEntityType: 'system',
      },
    ];

    // Insert notifications
    const savedNotifications = await notificationRepository.save(notifications);

    console.log(
      `✅ Seeded ${savedNotifications.length} notifications for property subscription 1654`,
    );

    return savedNotifications;
  }
}
