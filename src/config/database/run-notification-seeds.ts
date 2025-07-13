import dataSource from './connections/default';
import NotificationSeeds from './seeds/1752418600000-NotificationSeeds';

async function runNotificationSeeds() {
  try {
    console.log('🌱 Initializing database connection...');
    await dataSource.initialize();

    console.log('🌱 Running notification seeds...');
    const seeder = new NotificationSeeds();
    await seeder.run(dataSource);

    console.log('✅ Notification seeds completed successfully!');
  } catch (error) {
    console.error('❌ Error running notification seeds:', error);
  } finally {
    await dataSource.destroy();
    process.exit(0);
  }
}

runNotificationSeeds();
