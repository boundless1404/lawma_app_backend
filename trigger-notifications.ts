import axios from 'axios';

async function triggerNotificationProcessor() {
  try {
    console.log('Triggering notification processor via HTTP...');
    
    // Call an endpoint that will trigger the notification processor manually
    const response = await axios.get('http://localhost:5200/utils-billing/operator/metrics');
    console.log('Backend is reachable');
    
    console.log('\nThe cron job should be running every 5 minutes.');
    console.log('Check backend logs for: "[NotificationService] Processing pending notifications..."');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('Backend server is not running on port 5200');
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

triggerNotificationProcessor();
