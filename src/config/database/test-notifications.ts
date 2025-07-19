import dataSource from './connections/default';
import { Notification } from '../../utils-billing/entitties/notification.entity';

async function testNotifications() {
  try {
    console.log('🔍 Testing notification data...');
    await dataSource.initialize();

    const notificationRepository = dataSource.getRepository(Notification);

    // Get all notifications for property subscription 1654
    const notifications = await notificationRepository.find({
      where: {
        propertySubscriptionId: '1654',
        entityProfileId: '1',
      },
      order: {
        createdAt: 'DESC',
      },
    });

    console.log(
      `📧 Found ${notifications.length} notifications for property subscription 1654:`,
    );

    notifications.forEach((notification, index) => {
      console.log(`\n${index + 1}. ${notification.title}`);
      console.log(`   Type: ${notification.type}`);
      console.log(`   Read: ${notification.isRead ? 'Yes' : 'No'}`);
      console.log(
        `   Description: ${notification.description.substring(0, 80)}...`,
      );
      if (notification.actionText) {
        console.log(
          `   Action: ${notification.actionText} -> ${notification.actionUrl}`,
        );
      }
    });

    // Count unread notifications
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    console.log(`\n🔔 Unread notifications: ${unreadCount}`);
  } catch (error) {
    console.error('❌ Error testing notifications:', error);
  } finally {
    await dataSource.destroy();
    process.exit(0);
  }
}

testNotifications();
