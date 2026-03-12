import axios from 'axios';

async function testSMSFlow() {
  try {
    const baseUrl = 'http://localhost:5200';
    
    console.log('Step 1: Queueing SMS notification...');
    // Insert directly via SQL since test-sms.ts has DB connection issues
    const queueResponse = await axios.post(`${baseUrl}/utils-billing/debug/queue-sms`, {
      phone: '07011630342',
      entityProfileId: '1'
    });
    console.log('✓ SMS queued');
    
    console.log('\nStep 2: Checking notification status...');
    const statusResponse = await axios.get(`${baseUrl}/utils-billing/debug/notifications/07011630342`);
    console.log('Notifications:', JSON.stringify(statusResponse.data, null, 2));
    
    console.log('\nStep 3: Triggering notification processor...');
    const processResponse = await axios.post(`${baseUrl}/utils-billing/debug/process-notifications`);
    console.log('✓ Processor response:', processResponse.data);
    
    console.log('\nStep 4: Checking final status...');
    const finalStatus = await axios.get(`${baseUrl}/utils-billing/debug/notifications/07011630342`);
    console.log('Final status:', JSON.stringify(finalStatus.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testSMSFlow();
