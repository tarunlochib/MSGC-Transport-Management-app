const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function testAuth() {
  try {
    console.log('Testing authentication endpoints...\n');

    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Server is running:', healthResponse.data);
    } catch (error) {
      console.log('❌ Server health check failed:', error.message);
      return;
    }

    // Test 2: Check if auth endpoints exist
    console.log('\n2. Testing auth endpoints...');
    try {
      const authResponse = await axios.post(`${BASE_URL}/auth/signin`, {
        email: 'admin@msgc.com',
        password: 'admin123'
      });
      console.log('✅ Login successful:', authResponse.data);
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data || error.message);
    }

    // Test 3: Try signup
    console.log('\n3. Testing signup...');
    try {
      const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, {
        name: 'Test User',
        email: 'test@msgc.com',
        password: 'test123'
      });
      console.log('✅ Signup successful:', signupResponse.data);
    } catch (error) {
      console.log('❌ Signup failed:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAuth(); 