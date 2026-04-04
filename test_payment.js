// Simple payment system test
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testPayment() {
  console.log('🧪 Testing Payment System...\n');
  
  // Test 1: Create checkout session
  try {
    console.log('1. Testing checkout session creation...');
    const response = await fetch(`${API_BASE}/payment/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock_token'
      },
      body: JSON.stringify({ plan: 'premium' })
    });
    
    const data = await response.json();
    console.log('✅ Checkout session response:', data);
    
    if (data.sessionUrl) {
      console.log('✅ Mock checkout URL generated successfully');
    }
  } catch (error) {
    console.log('❌ Checkout session failed:', error.message);
  }
  
  console.log('\n🎉 Payment system test completed!');
}

testPayment();
