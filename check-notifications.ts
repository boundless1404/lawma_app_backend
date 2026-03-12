import dataSourceInstance from './src/config/database/connections/default';

async function checkNotifications() {
  try {
    if (!dataSourceInstance.isInitialized) {
      await dataSourceInstance.initialize();
    }

    const notifications = await dataSourceInstance.query(`
      SELECT 
        id, 
        status, 
        recipient_phone, 
        retry_count, 
        error_message,
        created_at
      FROM notification_queue 
      WHERE recipient_phone = '07011630342'
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    console.log('Notifications for 07011630342:');
    console.table(notifications);

    await dataSourceInstance.destroy();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkNotifications();
