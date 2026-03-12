import { DataSource } from 'typeorm';
import dataSourceInstance from './src/config/database/connections/default';
import { NotificationService } from './src/shared/notification.service';
import { PropertySubscription } from './src/utils-billing/entitties/propertySubscription.entity';
import { NotificationQueue, NotificationStatus, NotificationChannel, NotificationType } from './src/shared/notificationQueue.entity';

async function testSMS() {
  try {
    // Initialize database
    if (!dataSourceInstance.isInitialized) {
      dataSourceInstance.setOptions({ entities: ['dist/**/*.entity.js'] });
      await dataSourceInstance.initialize();
    }

    // Find Hob and Hog property subscription
    const subscription = await dataSourceInstance.manager
      .createQueryBuilder(PropertySubscription, 'ps')
      .leftJoinAndSelect('ps.entitySubscriberProfile', 'subscriber')
      .leftJoinAndSelect('subscriber.phoneCode', 'phoneCode')
      .leftJoinAndSelect('ps.entityProfile', 'entityProfile')
      .leftJoinAndSelect('ps.street', 'street')
      .where('ps.deletedAt IS NULL')
      .andWhere('(subscriber.firstName ILIKE :name1 OR subscriber.lastName ILIKE :name2)', {
        name1: '%Hob%',
        name2: '%Hog%',
      })
      .getOne();

    if (!subscription) {
      console.log('No subscription found for Hob and Hog');
      return;
    }

    console.log('Found subscription:');
    console.log('ID:', subscription.id);
    console.log('Subscriber:', subscription.entitySubscriberProfile?.firstName, subscription.entitySubscriberProfile?.lastName);
    console.log('Phone:', subscription.entitySubscriberProfile?.phone);
    console.log('Street:', subscription.street?.name);
    console.log('Street Number:', subscription.streetNumber);

    // Test phone number
    const testPhone = '07011630342';
    
    console.log('\nSending test SMS to:', testPhone);

    // Create notification queue entry
    const notificationQueue = dataSourceInstance.manager.create(NotificationQueue, {
      type: NotificationType.BILLING_GENERATED,
      channel: NotificationChannel.SMS,
      entityProfileId: subscription.entityProfileId,
      recipientPhone: testPhone,
      recipientName: 'Test User',
      message: `Dear Test, your LAWMA bill for March 2026 is ₦5000. Property: ${subscription.streetNumber} ${subscription.street?.name}. Thank you.`,
      metadata: {
        amount: 5000,
        month: 'March',
        year: '2026',
        propertyAddress: `${subscription.streetNumber} ${subscription.street?.name}`,
      },
      status: NotificationStatus.PENDING,
      smsUnitDeducted: false,
      retryCount: 0,
    });
    
    const savedNotification = await dataSourceInstance.manager.save(NotificationQueue, notificationQueue);

    console.log('Notification queued with ID:', savedNotification.id);
    console.log('\nThe notification processor cron (every 5 minutes) will pick this up and send it.');
    console.log('Check logs for: "[SMS BYPASS MODE] Sending SMS to 07011630342"');

    await dataSourceInstance.destroy();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testSMS();
