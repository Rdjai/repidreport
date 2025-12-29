// simple-test.js
// const axios = require('axios');
import axios from "axios";

const API_BASE = 'https://repidreport-zynl.onrender.com';

async function simpleTest() {
    try {
        console.log('🧪 Simple backend test...\n');

        // Test if server is running
        console.log('1. Testing server connection...');
        try {
            const response = await axios.get(`${API_BASE}/api/health`, { timeout: 3000 });
            console.log('✅ Server is running:', response.data.message);
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log('❌ Server is not running on port 5000');
                console.log('💡 Run: cd backend && npm run dev');
                return;
            } else if (error.response?.status === 404) {
                console.log('❌ /api/health endpoint not found - checking root...');

                // Try root endpoint
                try {
                    const rootResponse = await axios.get(`${API_BASE}/`, { timeout: 3000 });
                    console.log('✅ Root endpoint response:', rootResponse.status);
                } catch (rootError) {
                    console.log('❌ Root endpoint also failed');
                }
            }
            throw error;
        }

        // List all available endpoints
        console.log('\n2. Available endpoints:');
        const endpoints = [
            '/api/health',
            '/api/sos/trigger',
            '/api/sos/active',
            '/api/volunteers/register'
        ];

        for (const endpoint of endpoints) {
            try {
                await axios.get(`${API_BASE}${endpoint}`, { timeout: 2000 });
                console.log(`✅ ${endpoint} - EXISTS`);
            } catch (error) {
                if (error.response?.status === 404) {
                    console.log(`❌ ${endpoint} - NOT FOUND`);
                } else if (error.response?.status === 400 || error.response?.status === 500) {
                    console.log(`⚠️  ${endpoint} - EXISTS (but returned ${error.response.status})`);
                } else {
                    console.log(`❌ ${endpoint} - ERROR: ${error.message}`);
                }
            }
        }

    } catch (error) {
        console.log('\n❌ Test failed:');
        console.log('   Error:', error.message);
        console.log('\n💡 Solutions:');
        console.log('   1. Make sure backend is running: cd backend && npm run dev');
        console.log('   2. Check if port 5000 is available');
        console.log('   3. Verify your routes are properly defined');
    }
}

simpleTest();